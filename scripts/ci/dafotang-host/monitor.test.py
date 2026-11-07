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

SCRIPT = Path(__file__).resolve().parent / 'run-host.py'
spec = importlib.util.spec_from_file_location('formal_monitor', SCRIPT)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


# This test-only adapter supplies the new flat receipt root while preserving all
# original process stimuli and stop assertions. It never imports the actual host.
def run_synthetic_adapter(command):
    root = m.OUT / command['name']; root.mkdir()
    out = root / 'receipts'; out.mkdir(); scratch = root / 'scratch'; scratch.mkdir()
    snap = {'synthetic': True, 'identity': {'fixture': True}, 'files': []}
    with patch.object(m, 'WORK_ROOT', root), patch.object(m, 'OUT', out), patch.object(m, 'SCRATCH', scratch), \
         patch.object(m, 'snapshot', return_value=snap):
        return m.run_one(command, snap)


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
             patch.object(m, 'budget_usage', return_value={'metadata': -2, 'total': 14}):
            self.assertFalse(m.append_log(log, b'0123456789', result))
        self.assertEqual(log.getvalue(), b'012345')
        self.assertEqual(result['discardedLogBytes'], 4)
        self.assertFalse(result['logComplete'])


class SyntheticProcessTests(unittest.TestCase):
    def setUp(self):
        stub = types.SimpleNamespace(admission={}, admission_duration=0, started=None, last=None, check=lambda *args, **kwargs: None, report=lambda: {'complete': True})
        def admit():stub.started=time.monotonic();stub.last=stub.started
        def finish():stub.last=time.monotonic()
        stub.admit=admit;stub.finish=finish
        self.memory_patch = patch.object(m, 'MemoryWatch', return_value=stub)
        self.memory_patch.start(); self.addCleanup(self.memory_patch.stop)

    def test_short_success_keeps_complete_log_and_reaps_root(self):
        with tempfile.TemporaryDirectory(prefix='ui-monitor-ok-') as tmp:
            tmp = Path(tmp)
            launch = subprocess.Popen
            def synthetic_launch(_argv, **kwargs):
                return launch([sys.executable, '-c', 'print("synthetic success")'], **kwargs)
            with patch.object(m, 'OUT', tmp), patch.object(m, 'REPO', tmp), patch.object(m, 'FREE_MINIMUM', 0), \
                 patch.object(m, 'snapshot', return_value={'synthetic': True}), \
                 patch.object(m.subprocess, 'Popen', side_effect=synthetic_launch):
                result = run_synthetic_adapter({'name': 'synthetic-success', 'command': 'node', 'args': ['not-a-production-fixture'], 'env': {'SYNTHETIC_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR'}})
            terminal = json.loads((tmp / 'synthetic-success/receipts/monitor.json').read_text())
            self.assertTrue(result['passed'])
            self.assertTrue(terminal['rootReaped'])
            self.assertTrue(terminal['logComplete'])
            self.assertFalse(terminal['limitsAreHardCaps'])
            self.assertEqual((tmp / 'synthetic-success/receipts/full.log').read_text(), 'synthetic success\n')
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
                    result = run_synthetic_adapter({'name': 'synthetic-termination', 'command': 'node', 'args': ['not-a-production-fixture'], 'env': {'SYNTHETIC_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR'}})
                terminal = json.loads((tmp / 'synthetic-termination/receipts/monitor.json').read_text())
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
                    result = run_synthetic_adapter({'name': 'synthetic-open-pipe', 'command': 'node', 'args': ['not-a-production-fixture'], 'env': {'SYNTHETIC_EVIDENCE_DIR': '$COMMAND_EVIDENCE_DIR'}})
                elapsed = time.monotonic() - started
                self.assertLess(elapsed, .9, 'stop/drain must not wait for inherited stdout EOF')
                terminal = json.loads((tmp / 'synthetic-open-pipe/receipts/monitor.json').read_text())
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
        self.assertEqual(m.TIMEOUT, 90)
        self.assertEqual(m.RSS_THRESHOLD, 768 * 1024 ** 2)
        self.assertEqual(m.EVIDENCE_THRESHOLD, 32 * 1024 ** 2)
        self.assertEqual(m.FREE_MINIMUM, 512 * 1024 ** 2)

    def test_aggregate_budget_counts_tool_receipts_scratch_and_rejects_alias(self):
        with tempfile.TemporaryDirectory(prefix='host-accounting-') as tmp:
            root=Path(tmp); out=root/'receipts'; scratch=root/'scratch'; tool=root/'tool'
            out.mkdir(); scratch.mkdir(); tool.mkdir()
            (out/'log').write_bytes(b'x'*11);(scratch/'cache').write_bytes(b'x'*13);(tool/'trace').write_bytes(b'x'*100)
            with patch.object(m,'WORK_ROOT',root):
                self.assertEqual(m.budget_usage(),{'tool':100,'metadata':24,'total':124})
                (scratch/'alias').symlink_to(tool/'trace')
                with self.assertRaises(RuntimeError):m.evidence_size()


class FakeMemorySource:
    pid = 42
    def __init__(self):
        self.text = {
            '/proc/meminfo': 'MemTotal: 8388608 kB\nMemAvailable: 6291456 kB\n',
            '/proc/vmstat': 'oom_kill 0\n',
            '/proc/42/cgroup': '0::/a/b\n',
            '/proc/42/mountinfo': '29 23 0:28 / /sys/fs/cgroup rw - cgroup2 cgroup rw\n',
            '/sys/fs/cgroup/cgroup.controllers': 'cpu io memory pids\n',
        }
        self.links = {'/proc/42/ns/cgroup': 'cgroup:[4026531835]'}
        self.ids = {}
        for i, p in enumerate(['/sys/fs/cgroup', '/sys/fs/cgroup/a', '/sys/fs/cgroup/a/b']):
            self.ids[p] = {'device': '0:28', 'inode': str(i + 10)}
            if i:
                self.text[p + '/cgroup.type'] = 'domain\n'
                self.text[p + '/memory.max'] = 'max\n'
                self.text[p + '/memory.high'] = 'max\n'
                self.text[p + '/memory.current'] = '104857600\n'
                self.text[p + '/memory.events'] = 'low 0\nhigh 0\nmax 0\noom 0\noom_kill 0\n'
    def read_text(self, p, limit=65536):
        p = str(p)
        if p not in self.text: raise FileNotFoundError(p)
        value = self.text[p]
        if isinstance(value, BaseException): raise value
        if len(value.encode()) > limit: raise RuntimeError('bounded read exceeded')
        return value
    def readlink(self, p): return self.links[str(p)]
    def directory_identity(self, p):
        value = self.ids[str(p)]
        if isinstance(value, BaseException): raise value
        return dict(value)


class MemoryBudgetTests(unittest.TestCase):
    def setUp(self):
        file = Path(__file__).with_name('memory_budget.py')
        self.assertTrue(file.is_file(), 'memory policy implementation is absent')
        spec = importlib.util.spec_from_file_location('resource_memory_tested', file)
        self.b = importlib.util.module_from_spec(spec); spec.loader.exec_module(self.b)
        self.source = FakeMemorySource()
    def capture(self): return self.b.capture_memory(self.source)
    def test_v2_complete_root_and_ancestors(self):
        s = self.capture(); self.assertEqual(s['effectiveAvailableBytes'], 6 * 1024**3)
        self.assertEqual(len(s['topology']['ancestors']), 3)
        self.assertTrue(s['topology']['ancestors'][0]['hierarchyRoot'])
        self.assertEqual(s['topology']['namespace'], 'cgroup:[4026531835]')
    def test_host_parser_missing_duplicate_unit_and_overflow(self):
        for text in ['MemTotal: 8388608 kB\n', 'MemTotal: 8388608 kB\nMemAvailable: 1 MB\n', 'MemTotal: 8 kB\nMemAvailable: 9 kB\n', 'MemTotal: 8 kB\nMemAvailable: 1 kB\nMemAvailable: 1 kB\n', 'MemTotal: -1 kB\nMemAvailable: 0 kB\n', 'MemTotal: 999999999999999999999 kB\nMemAvailable: 1 kB\n']:
            self.source.text['/proc/meminfo'] = text
            with self.assertRaises(Exception): self.capture()
    def test_v1_hybrid_unknown_namespace_and_delegated_mount_fail(self):
        for path, value in [('/proc/42/cgroup','1:memory:/a\n'),('/proc/42/cgroup','0::/a/b\n1:cpu:/a\n'),('/proc/42/mountinfo','29 23 0:28 /a /sys/fs/cgroup rw - cgroup2 cgroup rw\n'),('/proc/42/mountinfo','29 23 0:28 / /sys/fs/cgroup rw - cgroup cgroup rw,memory\n')]:
            original=self.source.text[path]; self.source.text[path]=value
            with self.assertRaises(Exception): self.capture()
            self.source.text[path]=original
        self.source.links['/proc/42/ns/cgroup']='cgroup:[4026532219]'
        with self.assertRaises(Exception): self.capture()
    def test_hidden_root_duplicate_mount_and_path_escape_fail(self):
        key='/proc/42/mountinfo'; original=self.source.text[key]; self.source.text[key]=original+original
        with self.assertRaises(Exception): self.capture()
        self.source.text[key]=original
        for group in ['/../a','/a/../b','/a//b','a/b','/a/']:
            self.source.text['/proc/42/cgroup']='0::'+group+'\n'
            with self.assertRaises(Exception): self.capture()
    def test_root_only_missing_controls_is_supported(self):
        self.source.text['/proc/42/cgroup']='0::/\n'; s=self.capture(); self.assertEqual(len(s['topology']['ancestors']),1)
        self.source.text['/sys/fs/cgroup/memory.max']='1024\n'
        with self.assertRaises(Exception): self.capture()
    def test_nonroot_missing_read_denial_and_symlink_fail(self):
        key='/sys/fs/cgroup/a/memory.max'; value=self.source.text.pop(key)
        with self.assertRaises(Exception): self.capture()
        self.source.text[key]=PermissionError('denied')
        with self.assertRaises(Exception): self.capture()
        self.source.text[key]=value; self.source.ids['/sys/fs/cgroup/a']=RuntimeError('symlink directory')
        with self.assertRaises(Exception): self.capture()
    def test_finite_parent_limits_and_high_pressure_are_both_effective(self):
        self.source.text['/sys/fs/cgroup/a/memory.max']=str(4*1024**3)+'\n'; self.source.text['/sys/fs/cgroup/a/memory.current']=str(1024**3)+'\n'
        self.assertEqual(self.capture()['effectiveAvailableBytes'],3*1024**3)
        self.source.text['/sys/fs/cgroup/a/memory.high']=str(3*1024**3)+'\n'
        self.assertEqual(self.capture()['effectiveAvailableBytes'],2*1024**3)
        self.source.text['/sys/fs/cgroup/a/b/memory.max']=str(1024**3)+'\n'
        self.assertEqual(self.capture()['effectiveAvailableBytes'],1024**3-104857600)
    def test_limit_current_numbers_and_oom_records_fail_closed(self):
        for key,value in [('memory.max','unknown\n'),('memory.high','-1\n'),('memory.current','NaN\n'),('memory.current',str(2**64)+'\n'),('memory.events','oom 0\n'),('memory.events','oom 0\noom_kill 0\noom 1\n')]:
            p='/sys/fs/cgroup/a/'+key; old=self.source.text[p]; self.source.text[p]=value
            with self.assertRaises(Exception): self.capture()
            self.source.text[p]=old
        self.source.text['/sys/fs/cgroup/a/memory.max']='1\n'
        with self.assertRaises(Exception): self.capture()
    def test_admission_exact_boundary_and_one_byte_lower(self):
        s=self.capture(); s['memTotalBytes']=8*1024**3; s['effectiveAvailableBytes']=6*1024**3
        self.b.require_admission(s)
        for key in ['memTotalBytes','effectiveAvailableBytes']:
            x=dict(s); x[key]-=1
            with self.assertRaises(Exception): self.b.require_admission(x)
    def test_snapshot_identity_and_limits_cannot_drift(self):
        a=self.capture()
        for mutate in [lambda: self.source.ids['/sys/fs/cgroup/a'].update(inode='99'),lambda: self.source.text.update({'/sys/fs/cgroup/a/memory.high':str(5*1024**3)+'\n'})]:
            self.source=FakeMemorySource(); mutate()
            with self.assertRaises(Exception): self.b.require_continuity(a,self.capture())
    def test_oom_increment_and_pressure_floor_fail(self):
        a=self.capture(); self.source.text['/proc/vmstat']='oom_kill 1\n'
        with self.assertRaises(Exception): self.b.require_continuity(a,self.capture())
        self.source=FakeMemorySource(); self.source.text['/sys/fs/cgroup/a/memory.events']='oom 1\noom_kill 0\n'
        with self.assertRaises(Exception): self.b.require_continuity(a,self.capture())
        x=dict(a); x['effectiveAvailableBytes']=2*1024**3; self.b.require_pressure_safe(x)
        x['effectiveAvailableBytes']-=1
        with self.assertRaises(Exception): self.b.require_pressure_safe(x)
    def test_reader_has_real_size_regular_file_and_alias_guards(self):
        with tempfile.TemporaryDirectory(prefix='memory-read-') as tmp:
            p=Path(tmp)/'small';p.write_text('ok'); reader=self.b.MemorySource()
            self.assertEqual(reader.read_text(p,2),'ok')
            with self.assertRaises(Exception):reader.read_text(p,1)
            q=Path(tmp)/'link';q.symlink_to(p)
            with self.assertRaises(Exception):reader.read_text(q,10)
            fifo=Path(tmp)/'fifo';os.mkfifo(fifo)
            with self.assertRaises(Exception):reader.read_text(fifo,10)
    def test_watch_requires_fresh_bounded_samples_and_finishes(self):
        clock=[0.0]; watch=self.b.MemoryWatch(self.source,clock=lambda:clock[0]); watch.admit()
        clock[0]=.25; watch.check([],lambda pid:None)
        clock[0]=.5; watch.finish(); self.assertTrue(watch.report()['complete']);self.assertEqual(len(watch.report()['samples']),3)
        clock=[0.0]; watch=self.b.MemoryWatch(FakeMemorySource(),clock=lambda:clock[0]);watch.admit();clock[0]=1.1
        with self.assertRaises(Exception):watch.check([],lambda pid:None)
        self.assertFalse(watch.report()['complete'])
    def test_watch_fails_on_pressure_read_failure_or_child_group_change(self):
        for kind in ['pressure','read','child']:
            source=FakeMemorySource();clock=[0.0];watch=self.b.MemoryWatch(source,clock=lambda:clock[0]);watch.admit();clock[0]=.25
            rows=[]
            if kind=='pressure': source.text['/proc/meminfo']='MemTotal: 8388608 kB\nMemAvailable: 1 kB\n'
            if kind=='read': source.text['/proc/vmstat']=PermissionError('denied')
            if kind=='child':source.text['/proc/99/cgroup']='0::/other\n';rows=[{'pid':99,'starttime':10,'state':'S'}]
            with self.assertRaises(Exception):watch.check(rows,lambda pid:{'pid':99,'starttime':10,'state':'S'})
            self.assertFalse(watch.report()['complete'])
    def test_member_disappearance_is_not_permission_failure_or_pid_reuse(self):
        clock=[0.0];watch=self.b.MemoryWatch(self.source,clock=lambda:clock[0]);watch.admit();clock[0]=.25
        watch.check([{'pid':99,'starttime':10,'state':'S'}],lambda pid:None)
        clock[0]=.5
        with self.assertRaises(Exception):watch.check([{'pid':99,'starttime':10,'state':'S'}],lambda pid:{'pid':99,'starttime':11,'state':'S'})
    def test_controller_domain_bounds_and_data_size_are_strict(self):
        self.source.text['/proc/42/cgroup']='0::/'+'/'.join(['a']*32)+'\n'
        with self.assertRaisesRegex(Exception,'bounded depth'):self.capture()
        self.source.text['/proc/42/cgroup']='0::/a/b\n'
        for key,value in [('/sys/fs/cgroup/cgroup.controllers','cpu io pids\n'),('/sys/fs/cgroup/a/cgroup.type','threaded\n'),('/proc/42/mountinfo','x'*65537)]:
            old=self.source.text[key];self.source.text[key]=value
            with self.assertRaises(Exception):self.capture()
            self.source.text[key]=old


class MemoryIntegrationTests(unittest.TestCase):
    def run_synthetic(self, phase):
        with tempfile.TemporaryDirectory(prefix='ui-memory-') as folder:
            folder=Path(folder); launched=[]; real_launch=subprocess.Popen
            def launch(argv, **kwargs):
                code='import time;time.sleep(3)' if phase=='runtime' else 'print("synthetic")'
                child=real_launch([sys.executable,'-c',code],**kwargs);launched.append(child);return child
            failure=None
            class Watch:
                admission={}; admission_duration=0; started=None; last=None
                complete=False
                def admit(self):
                    if phase=='admission':raise RuntimeError('synthetic unknown memory')
                    self.started=time.monotonic();self.last=self.started
                def check(self,*args,**kwargs):
                    if phase=='runtime':raise RuntimeError('synthetic pressure/read failure')
                def finish(self):
                    if phase=='finish':raise RuntimeError('synthetic final memory failure')
                    self.last=time.monotonic();self.complete=True
                def report(self):return {'complete':self.complete,'failure':failure}
            with patch.object(m,'OUT',folder),patch.object(m,'REPO',folder),patch.object(m,'FREE_MINIMUM',0), \
                 patch.object(m,'snapshot',return_value={'synthetic':True}),patch.object(m,'MemoryWatch',Watch), \
                 patch.object(m,'STOP_GRACE',.05),patch.object(m.subprocess,'Popen',side_effect=launch) as popen:
                result=run_synthetic_adapter({'name':'memory','command':'node','args':['not-a-production-fixture']})
            receipt=json.loads((folder/'memory/receipts/monitor.json').read_text())
            self.assertFalse(result['passed']);self.assertIsNotNone(result['stopReason'])
            if phase=='admission':
                popen.assert_not_called();self.assertFalse(receipt['rootLaunched']);self.assertFalse(receipt['rootReaped'])
                self.assertIsNone(receipt['returncode'])
            else:
                self.assertEqual(len(launched),1);self.assertTrue(receipt['rootLaunched']);self.assertTrue(receipt['rootReaped'])
                self.assertEqual(receipt['remainingOwnedProcesses'],[]);self.assertEqual(receipt['unattributedSessionProcesses'],[])
                self.assertTrue(all(q['pid']==launched[0].pid for q in receipt['signals']))
            return receipt
    def test_failed_memory_admission_never_spawns_ui_root_and_records_failure(self):
        self.assertIn('memory admission blocked',self.run_synthetic('admission')['stopReason'])
    def test_runtime_memory_pressure_uses_existing_owned_process_cleanup(self):
        receipt=self.run_synthetic('runtime');self.assertIn('memory pressure guard',receipt['stopReason']);self.assertTrue(receipt['signals'])
    def test_final_memory_failure_cannot_report_success(self):
        self.assertIn('memory final check failed',self.run_synthetic('finish')['stopReason'])
    def test_memory_sample_time_and_count_limits_fail_closed(self):
        from memory_budget import MemoryWatch, POLICY
        ticks=[0.0];watch=MemoryWatch(FakeMemorySource(),clock=lambda:ticks[0]);watch.admit();ticks[0]=.25
        watch.samples=[{}]*POLICY['maximumSamples']
        with self.assertRaisesRegex(Exception,'sample budget'):watch.check([],lambda pid:None)
        ticks=[0.0]
        class Slow(FakeMemorySource):
            def read_text(self,*args,**kwargs):ticks[0]+=.1;return super().read_text(*args,**kwargs)
        with self.assertRaisesRegex(Exception,'too slow'):MemoryWatch(Slow(),clock=lambda:ticks[0]).admit()
    def test_cli_admission_identity_rejects_missing_or_different_event(self):
        from memory_budget import event_identity
        env={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'123','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/test'}
        self.assertEqual(event_identity(env)['runAttempt'],'1')
        for key in env:
            with self.assertRaises(Exception):event_identity({**env,key:''})
        for changes in [{'GITHUB_RUN_ATTEMPT':'0'},{'GITHUB_REPOSITORY':'other/repo'},{'GITHUB_REF':'refs/tags/test'}]:
            with self.assertRaises(Exception):event_identity({**env,**changes})
    def test_capture_rechecks_live_limit_and_directory_identity(self):
        from memory_budget import capture_memory
        class Drift(FakeMemorySource):
            calls=0
            def read_text(self,p,*args):
                if p=='/sys/fs/cgroup/a/memory.max':
                    self.calls+=1
                    if self.calls==2:return '4294967296\n'
                return super().read_text(p,*args)
        with self.assertRaisesRegex(Exception,'limit changed'):capture_memory(Drift())
        class InodeDrift(FakeMemorySource):
            calls=0
            def directory_identity(self,p):
                value=super().directory_identity(p)
                if p=='/sys/fs/cgroup/a':
                    self.calls+=1
                    if self.calls==2:value['inode']='99'
                return value
        with self.assertRaisesRegex(Exception,'directory identity'):capture_memory(InodeDrift())

class RoleTests(unittest.TestCase):
    def reader(self, identities=None, role=('chrome','renderer'), error=None):
        class Reader:
            read_bytes=0
            def identity(self,pid):return {'starttime':10} if identities is None else next(identities)
            def read(self,pid,root):
                if error:raise error
                self.read_bytes+=20
                return role
        return Reader()
    def test_roles_skip_stopping_sample_without_any_read(self):
        reader=self.reader(error=AssertionError('must not read'))
        out=m.capture_process_roles([row(100,10)],100,'/node',1,skip=True,reader=reader)
        self.assertEqual(out['status'],'skipped-stop');self.assertEqual(out['rows'],[])
        self.assertEqual(out['readBytes'],0);self.assertEqual(out['skippedCount'],1)
    def test_roles_recheck_both_starttimes_without_claiming_none_is_exit(self):
        for identities,status in [([None],'exited-or-unreadable'),([{'starttime':99}],'identity-changed'),([{'starttime':10},None],'exited-or-unreadable'),([{'starttime':10},{'starttime':99}],'identity-changed')]:
            out=m.capture_process_roles([row(100,10)],100,'/node',1,reader=self.reader(iter(identities)),clock=lambda:0)
            self.assertEqual(out['rows'][0]['status'],status);self.assertEqual(out['rows'][0]['role'],'unknown');self.assertFalse(out['complete'])
    def test_roles_only_capture_owned_rows_and_whitelisted_values(self):
        out=m.capture_process_roles([row(100,10)],100,'/node',1,reader=self.reader(),clock=lambda:0)
        self.assertTrue(out['complete']);self.assertEqual(out['rows'],[{'pid':100,'starttime':10,'rssBytes':4096,'executableKind':'chrome','role':'renderer','status':'observed'}])
        self.assertNotIn('args',json.dumps(out));self.assertNotIn('/node',json.dumps(out));self.assertNotIn('environ',json.dumps(out))
    def test_roles_bound_count_elapsed_and_byte_exhaustion(self):
        out=m.capture_process_roles([row(i,10) for i in range(100,170)],100,'/node',1,reader=self.reader(),clock=lambda:0)
        self.assertEqual(len(out['rows']),64);self.assertEqual(out['truncatedCount'],6);self.assertFalse(out['complete'])
        ticks=iter([0]+[.051]*66)
        out=m.capture_process_roles([row(100,10)],100,'/node',1,reader=self.reader(),clock=lambda:next(ticks))
        self.assertEqual(out['rows'][0]['status'],'budget-exhausted')
        reader=m.RoleReader('/node',clock=lambda:0);reader.read_bytes=32768
        with patch.object(m.os,'readlink') as read:
            with self.assertRaises(m.RoleBudgetExhausted):reader.read(1,1)
            read.assert_not_called()
    def test_roles_require_eof_and_reject_oversize_or_partial_cmdline(self):
        regular=types.SimpleNamespace(st_mode=0o100600,st_dev=1,st_ino=2)
        def perform(chunks):
            reader=m.RoleReader('/node',clock=lambda:0)
            with patch.object(m.os,'readlink',return_value='/opt/google/chrome/chrome'),patch.object(m.os,'lstat',return_value=regular),patch.object(m.os,'open',return_value=10),patch.object(m.os,'fstat',return_value=regular),patch.object(m.os,'read',side_effect=chunks) as read,patch.object(m.os,'close'):
                result=reader.read(100,100)
                return result,read.call_count
        self.assertEqual(perform([b'chrome\0',b'--type=renderer\0',b'']), (('chrome','renderer'),3))
        self.assertEqual(perform([b'chrome\0',b'']), (('chrome','browser'),2))
        for chunks in [[b'x'*4097],[b'chrome\0',OSError('read failed')],[b'chrome',b'']]:
            with self.assertRaises((ValueError,OSError)):perform(chunks)
        for args in [b'--type=renderer\0--type=renderer\0',b'--type=renderer\0--type=utility\0',b'--type=alien\0',b'--type\0renderer\0']:
            self.assertEqual(perform([b'chrome\0'+args,b''])[0],('chrome','unknown'))
    def test_roles_classify_exact_executables_not_basenames(self):
        for executable,expected in [('/node',('node','host-controller')),(str(m.REPO/'node_modules/@esbuild/linux-x64/bin/esbuild'),('esbuild','esbuild')),('/tmp/chrome',('unknown','unknown')),('/tmp/node',('unknown','unknown'))]:
            reader=m.RoleReader('/node',clock=lambda:0)
            with patch.object(m.os,'readlink',return_value=executable):self.assertEqual(reader.read(100,100),expected)
        reader=m.RoleReader('/node',clock=lambda:0)
        with patch.object(reader,'read_file',return_value=b'malformed'):self.assertIsNone(reader.identity(100))
    def test_roles_do_not_delay_stop_for_a_second_snapshot_or_change_signal_authority(self):
        source=SCRIPT.read_text();capture="if result['processRoles'] is None and rss >= RSS_THRESHOLD * 3 // 4:"
        self.assertEqual(source.count(capture),1)
        self.assertLess(source.index("if rss >= RSS_THRESHOLD:"),source.index(capture))
        self.assertIn('skip=bool(reasons) or stop_started is not None',source)
        self.assertIn('signal_owned(rows, sig, attempted',source)
        self.assertNotIn("signal_owned(result['processRoles']",source)
    def test_roles_reader_rejects_alias_nonregular_and_elapsed_read(self):
        reader=m.RoleReader('/node',clock=lambda:0)
        regular=types.SimpleNamespace(st_mode=0o100600,st_dev=1,st_ino=2)
        for opened in [types.SimpleNamespace(st_mode=0o100600,st_dev=1,st_ino=3),types.SimpleNamespace(st_mode=0o010600,st_dev=1,st_ino=2)]:
            with patch.object(m.os,'lstat',return_value=regular),patch.object(m.os,'open',return_value=10),patch.object(m.os,'fstat',return_value=opened),patch.object(m.os,'close'),patch.object(m.os,'read') as read:
                with self.assertRaises(ValueError):reader.read_file('/proc/100/cmdline',4096)
                read.assert_not_called()
        ticks=[0];reader=m.RoleReader('/node',clock=lambda:ticks[0])
        def delayed_read(n,size):ticks[0]=.051;return b'chrome\0'
        with patch.object(m.os,'lstat',return_value=regular),patch.object(m.os,'open',return_value=10),patch.object(m.os,'fstat',return_value=regular),patch.object(m.os,'close'),patch.object(m.os,'read',side_effect=delayed_read):
            with self.assertRaises(m.RoleBudgetExhausted):reader.read_file('/proc/100/cmdline',4096)

    def test_roles_caller_short_circuits_path_resolution_on_stop_or_ineligible_sample(self):
        import ast
        source=SCRIPT.read_text();tree=ast.parse(source)
        target=next(n for n in ast.walk(tree) if isinstance(n,ast.If) and ast.get_source_segment(source,n.test)=="result['processRoles'] is None and rss >= RSS_THRESHOLD * 3 // 4")
        block=compile(ast.fix_missing_locations(ast.Module(body=[target],type_ignores=[])),'frozen-role-callsite','exec')
        for rss,reasons,stop_started,existing,expected in [(m.RSS_THRESHOLD, ['RSS stop'],None,None,0),(m.RSS_THRESHOLD*3//4,[],1,None,0),(0,[],None,None,0),(m.RSS_THRESHOLD*3//4,[],None,{'already':'captured'},0),(m.RSS_THRESHOLD*3//4,[],None,None,1)]:
            events=[]
            def resolve(name):events.append(('resolve',name));return '/canonical-node'
            def capture(rows,pid,node,seconds,skip):
                events.append(('capture',node,skip));return {'skip':skip}
            scope={'result':{'processRoles':existing},'rss':rss,'RSS_THRESHOLD':m.RSS_THRESHOLD,'rows':[],'child':types.SimpleNamespace(pid=100),'os':types.SimpleNamespace(path=types.SimpleNamespace(realpath=resolve)),'argv':['/node'],'now':2,'started':1,'reasons':reasons,'stop_started':stop_started,'capture_process_roles':capture}
            exec(block,scope)
            self.assertEqual(sum(e[0]=='resolve'for e in events),expected,(reasons,stop_started,existing))
            if events and events[-1][0]=='capture' and events[-1][2]:self.assertIsNone(events[-1][1])

class PublicationAdapterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='h6-pub-')
        self.root = Path(self.temp.name); self.out = self.root / 'receipts'; self.out.mkdir()
        self.scratch = self.root / 'scratch'; self.scratch.mkdir()
        self.patches = [patch.object(m, 'WORK_ROOT', self.root), patch.object(m, 'OUT', self.out), patch.object(m, 'SCRATCH', self.scratch)]
        for p in self.patches: p.start()
    def tearDown(self):
        for p in reversed(self.patches): p.stop()
        self.temp.cleanup()
    def test_exact_name_cap_and_nonfinite(self):
        for name,value,limit in [('alien.json',{},65536),('summary.json',{},524288),('summary.json',{'x':float('nan')},65536),('summary.json',{'x':'x'*65536},65536)]:
            with self.assertRaises((RuntimeError,ValueError)): m.publish_json(name,value,limit)
        self.assertEqual(list(self.out.iterdir()),[])
    def test_short_write_loops_to_complete(self):
        real=os.write
        with patch.object(os,'write',side_effect=lambda fd,b:real(fd,b[:3])): m.publish_json('summary.json',{'ok':True},65536)
        self.assertEqual(json.loads((self.out/'summary.json').read_text()),{'ok':True})
    def test_rename_failure_retains_prefix(self):
        m.publish_json('summary.json',{'step':1},65536)
        with patch.object(os,'replace',side_effect=OSError('rename injected')):
            with self.assertRaises(OSError):m.publish_json('summary.json',{'step':2},65536)
        self.assertEqual(json.loads((self.out/'summary.json').read_text()),{'step':1})
        self.assertFalse((self.out/'summary.json.pending').exists())
    def test_foreign_pending_is_not_removed(self):
        pending=self.out/'summary.json.pending';pending.write_text('foreign')
        with self.assertRaises(FileExistsError):m.publish_json('summary.json',{'step':1},65536)
        self.assertEqual(pending.read_text(),'foreign')
    def test_replaced_target_is_not_overwritten(self):
        target=self.out/'summary.json';m.publish_json('summary.json',{'step':1},65536);real=os.fsync
        def changed(fd):
            real(fd);target.rename(self.out/'old');target.write_text('replacement')
        with patch.object(os,'fsync',side_effect=changed):
            with self.assertRaises(RuntimeError):m.publish_json('summary.json',{'step':2},65536)
        self.assertEqual(target.read_text(),'replacement')
    def test_all_pending_and_scratch_reserve_is_counted(self):
        f=self.scratch/'reserved';f.touch()
        with f.open('r+b') as out:out.truncate(4*1024**2-10)
        with self.assertRaises(RuntimeError):m.publish_json('summary.json',{'step':1},65536)
        self.assertFalse((self.out/'summary.json').exists())
    def test_symlink_and_hardlink_are_not_budget_escape(self):
        f=self.scratch/'one';f.write_text('a');alias=self.scratch/'two';alias.symlink_to(f)
        with self.assertRaises(RuntimeError):m.publish_json('summary.json',{},65536)
        alias.unlink();os.link(f,alias)
        with self.assertRaises(RuntimeError):m.publish_json('summary.json',{},65536)



class WrapperClockTests(unittest.TestCase):
    # Real main/run_one/MemoryWatch; only OS, subprocess and time inputs are fake.
    def simulate(self, failure=None, host_seconds=.4):
        from contextlib import ExitStack
        from memory_budget import MemoryWatch
        ticks=[1000.0];events=[];receipts=[];snapshots=[];clock=lambda:ticks[0]
        with tempfile.TemporaryDirectory(prefix='h6-clock-')as tmp:
            root=Path(tmp)/'dh-1-1';root.mkdir();(root/'scratch').mkdir();(root/'receipts').mkdir()
            before={'identity':{'synthetic':True},'files':[{'path':'source'}]}
            def snapshot():
                events.append('source-before'if not snapshots else'source-after');snapshots.append(before);ticks[0]+=60
                if failure=='before'or(failure=='after'and len(snapshots)>1):raise RuntimeError('synthetic source failure')
                return before
            class Source(FakeMemorySource):
                def read_text(self,p,limit=65536):
                    ticks[0]+=.00001
                    if failure=='admission':raise RuntimeError('synthetic admission failure')
                    return super().read_text(p,limit)
            watch=MemoryWatch(Source(),clock=clock)
            child_start=[None];first=[True];alive=[True];launched=[False];launch_checked=[False]
            def poll():
                if not launched[0]:return None
                elapsed=clock()-child_start[0]
                if not launch_checked[0] and elapsed>=min(.2,host_seconds/2):events.append('launch-source-and-admission');launch_checked[0]=True
                if elapsed>=host_seconds:alive[0]=False;return 1 if failure=='child'else 0
                return None
            stdout=types.SimpleNamespace(fileno=lambda:987654,close=lambda:None)
            child=types.SimpleNamespace(pid=987654,stdout=stdout,poll=poll,wait=lambda timeout:1 if failure=='child'else 0)
            def popen(*a,**k):launched[0]=True;child_start[0]=clock();events.append('popen');return child
            class Selector:
                opened=True
                iterations=0
                def register(self,*a):pass
                def get_map(self):return {1:1}if self.opened else{}
                def unregister(self,*a):self.opened=False
                def close(self):self.opened=False
                def select(self,timeout):
                    self.iterations+=1
                    assert self.iterations<=2000, 'Bounded virtual loop'
                    ticks[0]+=.05
                    return [(types.SimpleNamespace(fileobj=stdout),0)]if poll()is not None else[]
            def proc(pid):
                if int(pid)==child.pid and first[0]:first[0]=False;return row(child.pid,123,group=child.pid,session=child.pid,state='R')
                return None
            def publish(name,value,limit):
                assert len(json.dumps(value,allow_nan=False).encode())<=limit, 'Bounded test receipt'
                receipts[:]=[(n,v)for n,v in receipts if n!=name];receipts.append((name,json.loads(json.dumps(value,allow_nan=False))));events.append('publish-'+name)
                assert len(receipts)<=4 and len(events)<4096, 'Bounded test recorder'
                return {'path':'receipts/'+name,'bytes':1,'sha256':'a'*64}
            realPath=Path
            def path(value):return types.SimpleNamespace(iterdir=lambda:[])if value=='/proc'else realPath(value)
            started=clock()
            with ExitStack()as stack:
                for obj,key,value in [(m,'REPO',Path(tmp)),(m,'snapshot',snapshot),(m,'Path',path),(m,'publish_json',publish),(m,'evidence_size',lambda:0),(m,'MemoryWatch',lambda:watch),(m,'members',lambda *a:[]),(m,'proc_stat',proc),(m,'signal_owned',lambda *a:None),(m.time,'monotonic',clock),(m.shutil,'disk_usage',lambda p:types.SimpleNamespace(free=2**40)),(m.shutil,'which',lambda p:'/synthetic/node'),(m.subprocess,'Popen',popen),(m.selectors,'DefaultSelector',Selector),(m.os,'set_blocking',lambda *a:None),(m.os,'read',lambda *a:b'')]:stack.enter_context(patch.object(obj,key,value))
                stack.enter_context(patch.object(sys,'argv',['run-host.py','--inputs','INPUTS.json','--work-root',str(root)]));stack.enter_context(patch('builtins.print'))
                try:code=m.main();error=None
                except RuntimeError as e:code=None;error=str(e)
            return dict(code=code,error=error,elapsed=clock()-started,events=events,receipts=receipts,snapshots=snapshots,before=before,launched=launched[0],watch=watch)
    def test_one_shared_before_normal_exact_source_and_virtual_envelope(self):
        r=self.simulate(host_seconds=89);self.assertEqual(r['code'],0);self.assertEqual(len(r['snapshots']),2)
        self.assertIs(r['snapshots'][0],r['snapshots'][1]);self.assertLess(r['elapsed'],235)
        self.assertEqual(r['events'].count('source-before'),1);self.assertEqual(r['events'].count('source-after'),1)
        self.assertLess(r['events'].index('publish-source-before.json'),r['events'].index('popen'))
        self.assertLess(r['events'].index('launch-source-and-admission'),r['events'].index('source-after'))
    def test_postcheck_failure_still_preserves_before_launch_and_after_attempt(self):
        r=self.simulate('after');self.assertEqual(r['code'],1);self.assertEqual(len(r['snapshots']),2)
        self.assertTrue(r['launched']);last=[v for n,v in r['receipts']if n=='monitor.json'][-1]
        self.assertFalse(last['sourceUnchanged']);self.assertIn('sourceAfterError',last)
    def test_nonzero_child_still_gets_original_final_source_check(self):
        r=self.simulate('child');self.assertEqual(r['code'],1);self.assertEqual(len(r['snapshots']),2)
        self.assertTrue(r['launched']);self.assertTrue(r['watch'].complete)
        last=[v for n,v in r['receipts']if n=='monitor.json'][-1];self.assertFalse(last['passed']);self.assertEqual(last['returncode'],1)
    def test_admission_failure_has_no_child_and_retains_original_early_return(self):
        r=self.simulate('admission');self.assertEqual(r['code'],1);self.assertEqual(len(r['snapshots']),1)
        self.assertFalse(r['launched']);self.assertIn('publish-source-before.json',r['events'])
    def test_initial_source_failure_does_not_forge_identity_or_launch(self):
        r=self.simulate('before');self.assertIsNone(r['code']);self.assertEqual(len(r['snapshots']),1)
        self.assertFalse(r['launched']);self.assertEqual(r['receipts'],[])
    def test_producer_clock_records_real_watch_origins_last_and_duration_before_source_after(self):
        r=self.simulate();self.assertEqual(r['code'],0);v=[v for n,v in r['receipts']if n=='monitor.json'][-1]
        c=v['memoryClock'];self.assertEqual(c['memoryStartedMicros'],round(r['watch'].started*1000000));self.assertEqual(c['memoryLastMicros'],round(r['watch'].last*1000000))
        self.assertEqual(c['schema'],1);self.assertLess(c['monitorStartedMicros'],c['memoryStartedMicros']);self.assertLess(c['finishCalledMicros'],c['memoryLastMicros'])
        self.assertLessEqual(abs((c['monitorEndedMicros']-c['monitorStartedMicros'])-round(v['durationSeconds']*1000000)),501)
        self.assertGreater(r['elapsed']-v['durationSeconds'],119);self.assertLess(r['elapsed']-v['durationSeconds'],121)
        self.assertEqual(v['memory']['samples'],r['watch'].samples);self.assertTrue(v['memory']['complete'])
    def test_actual_main_forwards_same_before_object_to_run_one(self):
        import ast
        text=SCRIPT.read_text();main=next(n for n in ast.parse(text).body if isinstance(n,ast.FunctionDef)and n.name=='main')
        calls=[n for n in ast.walk(main)if isinstance(n,ast.Call)and isinstance(n.func,ast.Name)and n.func.id=='run_one'];self.assertEqual(len(calls),1)
        self.assertEqual(len(calls[0].args),2);self.assertEqual(ast.unparse(calls[0].args[1]),'before')
        run=next(n for n in ast.parse(text).body if isinstance(n,ast.FunctionDef)and n.name=='run_one');self.assertEqual([a.arg for a in run.args.args],['command','before'])
        snapshots=[n for n in ast.walk(run)if isinstance(n,ast.Call)and isinstance(n.func,ast.Name)and n.func.id=='snapshot'];self.assertEqual(len(snapshots),1)
    def test_existing_three_budget_constants_and_snapshot_deadline_are_not_expanded(self):
        self.assertEqual((m.TIMEOUT,m.STOP_GRACE,m.DRAIN_TIMEOUT,m.FINAL_WAIT),(90,.5,2,.25))
        self.assertIn('timeout=60',__import__('inspect').getsource(m.snapshot))
        entry=SCRIPT.with_name('entry.mjs').read_text();self.assertIn('235000',entry)

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
