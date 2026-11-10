"""Synthetic /proc transitions through the original parser/ownership gate; no child spawn."""
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(os.environ.get('R262_REPO_ROOT', Path(__file__).resolve().parents[2]))
HERE = Path(__file__).resolve().parent

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def stat(state='R', start=100, pid=741):
    fields = [state, '1', '741'] + ['0'] * 16 + [str(start)] + ['0'] * 10
    return f'{pid} (fixture (name)) ' + ' '.join(fields)

class ExitRecheck(unittest.TestCase):
    def setUp(self):
        self.guard = load('original_r177', ROOT / '.github/scripts/r177_build_bound.py')
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.evidence = Path(self.temp.name) / 'exit-rechecks.json'
        if os.environ.get('R262_DISABLE_EXIT_RECHECK') != '1':
            adapter = load('r262_exit', HERE / 'r262_exit_recheck.py')
            self.adapter = adapter
            self.journal = adapter.install_exit_state_recheck(self.guard, self.evidence)

    def probe(self, last, *, initial='R', status='Name:\tfixture\n', known=None, original_error=None, owned_pgid=741, table_only=False):
        reads = []
        original_read = Path.read_text
        def read(p, *args, **kwargs):
            if str(p) == '/proc/741/stat':
                reads.append(str(p))
                value = original_error if original_error and len(reads)==1 else stat(initial) if len(reads)==1 else stat('Z') if len(reads)==2 else last
                if isinstance(value, Exception): raise value
                return value
            if str(p) == '/proc/741/status': return status
            return original_read(p, *args, **kwargs)
        known = {} if known is None else known
        with patch.object(Path, 'iterdir', return_value=iter([Path('/proc/741')])), patch.object(Path, 'read_text', read):
            result = self.guard.process_table() if table_only else self.guard.owned_processes(owned_pgid, known, 100)
        return result, reads, known

    def test_R_to_Z_keeps_identity_and_original_unknown_evidence(self):
        result, reads, known = self.probe(stat('Z'))
        self.assertEqual(result[741], {'pid':741,'state':'Z','ppid':1,'pgid':741,'start':100,'rss':0,'hwm':0,'rss_unknown':True})
        self.assertEqual(known, {741:100})
        self.assertEqual(len(reads), 3)
        record = json.loads(self.evidence.read_text())
        self.assertEqual(record['counts']['converted'], 1)
        event = record['rechecks'][0]
        self.assertEqual(event['old_state'], 'R')
        self.assertEqual(event['new_state'], 'Z')
        self.assertTrue(event['identity_match'])
        self.assertEqual(event['pid'], event['observed_pid'])
        self.assertEqual(event['start'], event['observed_start'])

    def test_R_to_X_has_same_narrow_exception(self):
        result, reads, _ = self.probe(stat('X'))
        self.assertEqual(result[741]['state'], 'X')
        self.assertTrue(result[741]['rss_unknown'])
        self.assertEqual(len(reads), 3)

    def test_live_changed_identity_unreadable_and_malformed_stay_owned_FAIL(self):
        for value in [stat('R'),stat('S'),stat('?'),stat('Z',101),stat('Z',100,742),FileNotFoundError(),PermissionError(),'malformed','741 (name) Z','741 name) Z 1 741']:
            with self.subTest(value=str(value)):
                known = {}
                with self.assertRaisesRegex(self.guard.ResourceError, 'live owned PID 741 lacks RSS'):
                    self.probe(value, known=known)
                self.assertEqual(known, {741:100})
        self.assertFalse(self.evidence.exists())

    def test_valid_RSS_rows_are_identical_and_not_rechecked(self):
        result, reads, _ = self.probe(AssertionError('must not re-read known RSS'),status='VmRSS:\t2 kB\nVmHWM:\t3 kB\n')
        self.assertEqual(result[741], {'pid':741,'state':'R','ppid':1,'pgid':741,'start':100,'rss':2048,'hwm':3072})
        self.assertEqual(len(reads), 2)
        self.assertFalse(self.evidence.exists())

    def test_original_terminal_rows_are_unchanged_without_extra_read(self):
        for state in ['Z','X']:
            result, reads, _ = self.probe(AssertionError('must not recheck'), initial=state)
            self.assertEqual(result[741]['state'], state)
            self.assertNotIn('rss_unknown', result[741])
            self.assertEqual(len(reads), 2)

    def test_known_ownership_and_original_measurement_error_remain(self):
        known={741:100}
        with self.assertRaisesRegex(self.guard.ResourceError,'live owned PID'):
            self.probe(stat('R'),known=known)
        self.assertEqual(known,{741:100})
        with self.assertRaisesRegex(self.guard.ResourceError,'process measurement unavailable'):
            self.probe(stat('Z'),original_error=PermissionError())

    def test_evidence_failure_cannot_authorize_terminal_conversion(self):
        with patch.object(self.guard,'atomic_json',side_effect=OSError('evidence unavailable')):
            with self.assertRaisesRegex(self.guard.ResourceError,'live owned PID'):
                self.probe(stat('Z'))

    def test_evidence_limit_is_bounded_and_excess_stays_owned_FAIL(self):
        for i in range(128):
            result, _, _ = self.probe(stat('Z'))
            self.assertEqual(result[741]['state'],'Z')
        self.assertEqual(len(json.loads(self.evidence.read_text())['rechecks']),128)
        self.assertLess(self.evidence.stat().st_size,128*1024)
        with self.assertRaisesRegex(self.guard.ResourceError,'live owned PID'):
            self.probe(stat('Z'))
        self.assertEqual(len(json.loads(self.evidence.read_text())['rechecks']),128)

    def test_single_record_and_total_byte_limits_fail_closed(self):
        with self.assertRaisesRegex(self.guard.ResourceError,'live owned PID'):
            self.probe(stat('Z'), initial='R'*1100)
        self.assertFalse(self.evidence.exists())
        with patch.object(self.adapter,'MAX_EVIDENCE_BYTES',80):
            with self.assertRaisesRegex(self.guard.ResourceError,'live owned PID'):
                self.probe(stat('Z'))
        self.assertFalse(self.evidence.exists())

    def test_nonowned_unknown_rows_do_not_create_global_failure(self):
        for value in [PermissionError(), FileNotFoundError(), stat('R')]:
            with self.subTest(value=str(value)):
                table, reads, _ = self.probe(value, table_only=True)
                self.assertEqual(table[741], {'pid':741,'state':'R','ppid':1,'pgid':741,'start':100,'rss':0,'hwm':0,'rss_unknown':True})
                self.assertEqual(len(reads), 3)
                owned, _, known = self.probe(value, owned_pgid=999)
                self.assertEqual(owned, {})
                self.assertEqual(known, {})
                self.assertFalse(self.evidence.exists())

if __name__ == '__main__': unittest.main()
