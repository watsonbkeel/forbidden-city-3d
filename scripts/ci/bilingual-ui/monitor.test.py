import importlib.util
import argparse
import re
import io
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import types
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parent / 'run-browser.py'
spec = importlib.util.spec_from_file_location('formal_monitor', SCRIPT)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def row(pid, start, ppid=1, group=100, session=100, state='S'):
    return {'pid': pid, 'starttime': start, 'ppid': ppid, 'pgrp': group,
            'session': session, 'state': state, 'rssBytes': 4096}


class IdentityTests(unittest.TestCase):
    def sample(self, rows, identities):
        fake_proc = types.SimpleNamespace(iterdir=lambda: [types.SimpleNamespace(name=str(p)) for p in rows])
        with patch.object(m, 'Path', return_value=fake_proc), patch.object(m, 'proc_stat', side_effect=lambda pid: rows.get(int(pid))):
            return m.members(100, identities)

    def test_reused_root_pid_is_never_reenrolled_by_its_old_group(self):
        identities = {100: 10}
        rows = {100: row(100, 99), 101: row(101, 100, 100)}
        actual = self.sample(rows, identities)
        self.assertEqual(actual, [], 'a reused root and its descendants are not ours')
        self.assertEqual(identities, {100: 10}, 'root identity must never be overwritten')

    def test_reused_child_pid_is_never_reenrolled_by_group_or_parent(self):
        identities = {100: 10, 101: 11}
        rows = {100: row(100, 10), 101: row(101, 99, 100), 102: row(102, 100, 101)}
        actual = self.sample(rows, identities)
        self.assertEqual([q['pid'] for q in actual], [100])
        self.assertEqual(identities, {100: 10, 101: 11}, 'known child identity must never be overwritten')

    def test_group_only_impostor_is_not_owned_when_root_is_absent(self):
        identities = {100: 10}
        self.assertEqual(self.sample({202: row(202, 30)}, identities), [])
        self.assertEqual(identities, {100: 10})

    def test_true_descendant_is_discovered_but_signal_rechecks_starttime(self):
        identities = {100: 10}
        rows = {100: row(100, 10), 101: row(101, 11, 100, 101, 101)}
        actual = self.sample(rows, identities)
        self.assertEqual([q['pid'] for q in actual], [100, 101])
        events = []
        with patch.object(m, 'proc_stat', return_value=row(101, 999)), patch.object(m.os, 'kill') as kill:
            m.checked_signal(actual[1], signal.SIGKILL, events)
        kill.assert_not_called()

    def test_pidfd_is_not_signalled_if_identity_changes_during_acquisition(self):
        expected = row(101, 11)
        events = []
        with patch.object(m, 'proc_stat', side_effect=[expected, row(101, 999)]), \
             patch.object(m.os, 'pidfd_open', return_value=55), patch.object(m.os, 'close') as close, \
             patch.object(m.signal, 'pidfd_send_signal') as send:
            self.assertFalse(m.checked_signal(expected, signal.SIGKILL, events))
        send.assert_not_called()
        close.assert_called_once_with(55)
        self.assertIn('identity-changed', events[0]['outcome'])

    def test_log_writer_keeps_only_the_prefix_that_fits_observed_budget(self):
        result = {'discardedLogBytes': 0, 'logComplete': True}
        log = io.BytesIO()
        with patch.object(m, 'EVIDENCE_THRESHOLD', 20), patch.object(m, 'METADATA_RESERVE', 4), \
             patch.object(m, 'evidence_size', return_value=10):
            self.assertFalse(m.append_log(log, b'0123456789', result))
        self.assertEqual(log.getvalue(), b'012345')
        self.assertEqual(result['discardedLogBytes'], 4)
        self.assertFalse(result['logComplete'])


class SyntheticProcessTests(unittest.TestCase):
    def test_short_success_keeps_complete_log_and_reaps_root(self):
        with tempfile.TemporaryDirectory(prefix='ui-monitor-ok-') as tmp:
            tmp = Path(tmp)
            launch = subprocess.Popen
            def synthetic_launch(_argv, **kwargs):
                return launch([sys.executable, '-c', 'print("synthetic success")'], **kwargs)
            with patch.object(m, 'OUT', tmp), patch.object(m, 'REPO', tmp), patch.object(m, 'FREE_MINIMUM', 0), \
                 patch.object(m, 'snapshot', return_value={'synthetic': True}), \
                 patch.object(m.subprocess, 'Popen', side_effect=synthetic_launch):
                result = m.run_one({'name': 'synthetic-success', 'command': 'node', 'args': ['not-a-production-fixture'], 'env': {'SYNTHETIC_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR'}})
            terminal = json.loads((tmp / 'synthetic-success/monitor.json').read_text())
            self.assertTrue(result['passed'])
            self.assertTrue(terminal['rootReaped'])
            self.assertTrue(terminal['logComplete'])
            self.assertFalse(terminal['limitsAreHardCaps'])
            self.assertEqual((tmp / 'synthetic-success/full.log').read_text(), 'synthetic success\n')
            self.assertEqual(terminal['remainingOwnedProcesses'], [])

    def test_real_pidfd_kills_only_own_term_ignoring_synthetic_child(self):
        with tempfile.TemporaryDirectory(prefix='ui-monitor-kill-') as tmp:
            tmp = Path(tmp)
            launch = subprocess.Popen
            child_holder = []
            def synthetic_launch(_argv, **kwargs):
                child = launch([sys.executable, '-c', 'import signal,time;signal.signal(signal.SIGTERM,signal.SIG_IGN);print("ready",flush=True);time.sleep(3)'], **kwargs)
                child_holder.append((child, m.proc_stat(child.pid)))
                return child
            try:
                with patch.object(m, 'OUT', tmp), patch.object(m, 'REPO', tmp), patch.object(m, 'FREE_MINIMUM', 0), \
                     patch.object(m, 'TIMEOUT', .2), patch.object(m, 'STOP_GRACE', .05), \
                     patch.object(m, 'DRAIN_TIMEOUT', .2), patch.object(m, 'FINAL_WAIT', .05), \
                     patch.object(m, 'snapshot', return_value={'synthetic': True}), \
                     patch.object(m.subprocess, 'Popen', side_effect=synthetic_launch):
                    result = m.run_one({'name': 'synthetic-termination', 'command': 'node', 'args': ['not-a-production-fixture'], 'env': {'SYNTHETIC_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR'}})
                terminal = json.loads((tmp / 'synthetic-termination/monitor.json').read_text())
                self.assertFalse(result['passed'])
                self.assertLess(result['durationSeconds'], 1)
                self.assertEqual(result['returncode'], -signal.SIGKILL)
                self.assertTrue(terminal['rootReaped'])
                self.assertEqual(terminal['remainingOwnedProcesses'], [])
                self.assertEqual({e['signal'] for e in terminal['signals'] if e['outcome'] == 'sent'}, {signal.SIGTERM, signal.SIGKILL})
                self.assertEqual({e['pid'] for e in terminal['signals']}, {child_holder[0][0].pid})
            finally:
                for child, identity in child_holder:
                    now = m.proc_stat(child.pid)
                    if identity and now and now['starttime'] == identity['starttime'] and now['state'] != 'Z':
                        m.checked_signal(identity, signal.SIGKILL, [])
                    child.wait(timeout=1)

    def test_open_descendant_pipe_cannot_keep_monitor_alive_after_stop(self):
        # Real lightweight processes only. Simulate signal delivery failing,
        # so the monitor must close its read end and return on a bounded deadline.
        with tempfile.TemporaryDirectory(prefix='ui-monitor-') as tmp:
            tmp = Path(tmp)
            pidfile = tmp / 'leaf.json'
            code = (
                'import subprocess,sys,time,json;from pathlib import Path;'
                'p=subprocess.Popen([sys.executable,"-c","import time;time.sleep(2)"]);'
                's=Path(f"/proc/{p.pid}/stat").read_text();'
                f'Path({str(pidfile)!r}).write_text(json.dumps({{"pid":p.pid,"starttime":int(s[s.rfind(chr(41))+2:].split()[19])}}));'
                'time.sleep(.15)'
            )
            launch = subprocess.Popen
            def synthetic_launch(_argv, **kwargs):
                return launch([sys.executable, '-c', code], **kwargs)
            snapshot = {'synthetic': True}
            started = time.monotonic()
            try:
                with patch.object(m, 'OUT', tmp), patch.object(m, 'REPO', tmp), patch.object(m, 'FREE_MINIMUM', 0), \
                     patch.object(m, 'TIMEOUT', .2), patch.object(m, 'STOP_GRACE', .05, create=True), \
                     patch.object(m, 'DRAIN_TIMEOUT', .2, create=True), patch.object(m, 'FINAL_WAIT', .05, create=True), \
                     patch.object(m, 'snapshot', return_value=snapshot), patch.object(m.subprocess, 'Popen', side_effect=synthetic_launch), \
                     patch.object(m, 'checked_signal', return_value=None):
                    result = m.run_one({'name': 'synthetic-open-pipe', 'command': 'node', 'args': ['not-a-production-fixture'], 'env': {'SYNTHETIC_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR'}})
                elapsed = time.monotonic() - started
                self.assertLess(elapsed, .9, 'stop/drain must not wait for inherited stdout EOF')
                terminal = json.loads((tmp / 'synthetic-open-pipe/monitor.json').read_text())
                self.assertFalse(result['passed'])
                self.assertFalse(terminal['logComplete'])
                self.assertTrue(terminal['remainingOwnedProcesses'])
                self.assertIsNotNone(terminal['stopReason'])
            finally:
                if pidfile.exists():
                    identity = json.loads(pidfile.read_text())
                    now = m.proc_stat(identity['pid'])
                    if now and now['starttime'] == identity['starttime'] and now['state'] != 'Z':
                        m.checked_signal(now, signal.SIGKILL, [])


class FixedConfigurationTests(unittest.TestCase):
    def test_fixed_resource_configuration(self):
        self.assertEqual(m.TIMEOUT, 240)
        self.assertEqual(m.RSS_THRESHOLD, 768 * 1024 ** 2)
        self.assertEqual(m.EVIDENCE_THRESHOLD, 128 * 1024 ** 2)
        self.assertEqual(m.FREE_MINIMUM, 512 * 1024 ** 2)

    def test_aggregate_budget_counts_only_owned_receipts_and_scratch(self):
        with tempfile.TemporaryDirectory(prefix='ui-accounting-') as tmp:
            root = Path(tmp)
            out, scratch, repo = root / 'receipts', root / 'scratch', root / 'repo'
            out.mkdir(); scratch.mkdir(); (repo / 'dist').mkdir(parents=True)
            (out / 'log').write_bytes(b'x' * 11)
            (scratch / 'cache').write_bytes(b'x' * 13)
            (repo / 'dist' / 'asset').write_bytes(b'x' * 100)
            (scratch / 'foreign-link').symlink_to(repo / 'dist' / 'asset')
            with patch.object(m, 'OUT', out), patch.object(m, 'SCRATCH', scratch), patch.object(m, 'REPO', repo):
                self.assertEqual(m.evidence_size(), 24)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--receipt')
    args, test_args = parser.parse_known_args()
    identity = None
    if args.receipt:
        identity = {key: os.environ.get(env) for key, env in {
            'eventSha': 'GITHUB_SHA', 'runId': 'GITHUB_RUN_ID',
            'runAttempt': 'GITHUB_RUN_ATTEMPT', 'repository': 'GITHUB_REPOSITORY',
            'ref': 'GITHUB_REF'}.items()}
        if not (all(isinstance(v, str) and v for v in identity.values())
                and re.fullmatch('[0-9a-f]{40}', identity['eventSha'])
                and identity['repository'] == 'watsonbkeel/forbidden-city-3d'
                and identity['runId'].isdigit() and identity['runAttempt'].isdigit()):
            raise SystemExit('A complete CI event identity is required for a receipt.')
    program = unittest.main(argv=[sys.argv[0], *test_args], verbosity=2, exit=False)
    result = program.result
    passed = result.wasSuccessful() and not result.skipped
    if args.receipt:
        receipt = {'schema': 1, 'identity': identity, 'passed': passed,
                   'tests': result.testsRun, 'failures': len(result.failures),
                   'errors': len(result.errors), 'skipped': len(result.skipped)}
        with Path(args.receipt).open('x') as output:
            output.write(json.dumps(receipt, indent=2) + '\n')
    sys.exit(0 if passed else 1)
