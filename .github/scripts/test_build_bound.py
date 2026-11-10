"""Synthetic-only checks. No repository build, npm or network operation."""
import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
SCRIPT = HERE / 'r177_build_bound.py'

class ImplementationExists(unittest.TestCase):
    def test_reviewable_build_wrapper_exists(self):
        self.assertTrue(SCRIPT.is_file(), 'The build-only resource wrapper has not been implemented')

if SCRIPT.is_file():
    spec = importlib.util.spec_from_file_location('build_bound', SCRIPT)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)

    def good():
        return {'capacity': 16*m.GIB, 'available': 14*m.GIB,
                'quota': [['v2', '/', 'max', 'max']], 'oom': [['/', 0]],
                'raw': {'synthetic': True}, 'at': time.time()}

    class ControllerChecks(unittest.TestCase):
        def test_reads_host_and_every_v2_ancestor(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p = Path(tmp); proc=p/'proc'; cg=p/'cg'; proc.mkdir(); (cg/'job').mkdir(parents=True)
                (proc/'meminfo').write_text('MemTotal: 16777216 kB\nMemAvailable: 14680064 kB\n')
                (proc/'cgroup').write_text('0::/job\n')
                (proc/'mountinfo').write_text(f'1 0 0:1 / {cg} rw - cgroup2 cgroup rw\n')
                (cg/'cgroup.controllers').write_text('cpu memory\n')
                for d,limit,current in [(cg,'max',str(m.GIB)),(cg/'job',str(10*m.GIB),str(2*m.GIB))]:
                    (d/'memory.max').write_text(limit); (d/'memory.high').write_text('max')
                    (d/'memory.current').write_text(current); (d/'memory.events').write_text('oom 0\noom_kill 0\n')
                s=m.resource_sample(proc)
                self.assertEqual(s['capacity'],10*m.GIB); self.assertEqual(s['available'],8*m.GIB)
                self.assertEqual(len(s['quota']),2)
                (cg/'memory.max').unlink()
                with self.assertRaisesRegex(m.ResourceError,'unreadable'):
                    m.resource_sample(proc)

        def test_native_v2_root_exemption_and_inherited_memory_use_physical_bounds(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp);proc=p/'proc';cg=p/'cg';proc.mkdir();(cg/'job').mkdir(parents=True)
                (proc/'meminfo').write_text('MemTotal: 16777216 kB\nMemAvailable: 14680064 kB\n')
                (proc/'vmstat').write_text('oom_kill 0\n')
                (proc/'cgroup').write_text('0::/job\n')
                (proc/'mountinfo').write_text(f'1 0 0:1 / {cg} rw - cgroup2 cgroup rw\n')
                (cg/'cgroup.controllers').write_text('cpu memory\n')
                (cg/'cgroup.type').write_text('domain')
                (cg/'cgroup.subtree_control').write_text('cpu')
                # The real root is exempt. With memory not enabled for the leaf,
                # it inherits the root's host bound rather than a fabricated max.
                (cg/'job'/'cgroup.type').write_text('domain')
                sample=m.resource_sample(proc)
                self.assertEqual(sample['capacity'],16*m.GIB)
                self.assertEqual(sample['available'],14*m.GIB)
                self.assertIn('root-exempt',str(sample['quota']))
                (cg/'cgroup.subtree_control').write_text('cpu memory')
                with self.assertRaisesRegex(m.ResourceError,'unreadable'):
                    m.resource_sample(proc)

        def hosted_runner_fixture(self,tmp):
            # Exact three-level shape from run 42498696476 snapshot 0. Only the
            # mount location is relocated into the test's temporary directory.
            p=Path(tmp);proc=p/'proc';root=p/'cgroup';parent=root/'system.slice';leaf=parent/'hosted-compute-agent.service'
            proc.mkdir();leaf.mkdir(parents=True)
            (proc/'meminfo').write_text('MemTotal: 16371428 kB\nMemAvailable: 15450440 kB\nSwapTotal: 3145724 kB\nSwapFree: 3145724 kB\n')
            (proc/'vmstat').write_text('oom_kill 0\n')
            (proc/'cgroup').write_text('0::/system.slice/hosted-compute-agent.service\n')
            (proc/'mountinfo').write_text(f'34 28 0:29 / {root} rw,nosuid,nodev,noexec,relatime shared:8 - cgroup2 cgroup2 rw,nsdelegate,memory_recursiveprot\n')
            (root/'cgroup.controllers').write_text('cpuset cpu io memory hugetlb pids rdma misc')
            (root/'cgroup.subtree_control').write_text('cpuset cpu io memory pids')
            for directory,usage in ((parent,1150902272),(leaf,287129600)):
                (directory/'cgroup.type').write_text('domain')
                (directory/'cgroup.subtree_control').write_text('cpuset cpu io memory pids' if directory==parent else '')
                (directory/'memory.current').write_text(str(usage))
                (directory/'memory.max').write_text('max');(directory/'memory.high').write_text('max')
                (directory/'memory.events').write_text('low 0\nhigh 0\nmax 0\noom 0\noom_kill 0\noom_group_kill 0\n')
            return proc,root,parent,leaf

        def test_actual_runner_root_without_type_uses_all_verified_ancestors(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                proc,root,parent,leaf=self.hosted_runner_fixture(tmp)
                self.assertFalse((root/'cgroup.type').exists())
                s=m.resource_sample(proc)
                self.assertEqual(s['capacity'],16371428*1024)
                self.assertEqual(s['available'],15450440*1024)
                self.assertEqual(s['quota'],[['v2',str(leaf),'max','max'],['v2',str(parent),'max','max'],['v2',str(root),'root-exempt']])
                self.assertEqual(s['oom'],[[str(leaf),0,0],[str(parent),0,0],['host',0]])
                self.assertGreaterEqual(s['available'],m.RSS_CAP+m.reserve(s)+m.MARGIN)

        def test_actual_shape_hidden_root_is_still_rejected(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                proc,root,parent,leaf=self.hosted_runner_fixture(tmp)
                f=proc/'mountinfo';f.write_text(f.read_text().replace('0:29 / ','0:29 /hidden '))
                with self.assertRaisesRegex(m.ResourceError,'hidden'):m.resource_sample(proc)

        def test_actual_shape_missing_nonroot_quota_is_still_rejected(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                proc,root,parent,leaf=self.hosted_runner_fixture(tmp)
                (parent/'memory.max').unlink()
                with self.assertRaisesRegex(m.ResourceError,'unreadable'):m.resource_sample(proc)

        def test_actual_shape_unreadable_nonroot_quota_is_still_rejected(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                proc,root,parent,leaf=self.hosted_runner_fixture(tmp);original=m.read
                def denied(path):
                    if Path(path)==parent/'memory.current':raise m.ResourceError('unreadable synthetic ancestor memory.current')
                    return original(path)
                with patch.object(m,'read',denied),self.assertRaisesRegex(m.ResourceError,'unreadable'):
                    m.resource_sample(proc)

        def test_unreadable_and_hidden_controller_fail_closed(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp)
                with self.assertRaises(m.ResourceError): m.resource_sample(p)
                (p/'meminfo').write_text('MemTotal: 16777216 kB\nMemAvailable: 14680064 kB\n')
                (p/'cgroup').write_text('0::/job\n')
                (p/'mountinfo').write_text('1 0 0:1 /hidden /sys/fs/cgroup rw - cgroup2 cgroup rw\n')
                with self.assertRaisesRegex(m.ResourceError,'root'):
                    m.resource_sample(p)

        def test_reads_v1_and_hierarchical_limits(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp);proc=p/'proc';cg=p/'cg';proc.mkdir();(cg/'job').mkdir(parents=True)
                (proc/'meminfo').write_text('MemTotal: 16777216 kB\nMemAvailable: 14680064 kB\n')
                (proc/'cgroup').write_text('3:memory:/job\n')
                (proc/'mountinfo').write_text(f'1 0 0:1 / {cg} rw - cgroup cgroup rw,memory\n')
                for d,limit,current in [(cg,16*m.GIB,m.GIB),(cg/'job',10*m.GIB,2*m.GIB)]:
                    (d/'memory.limit_in_bytes').write_text(str(limit)); (d/'memory.usage_in_bytes').write_text(str(current))
                    (d/'memory.soft_limit_in_bytes').write_text(str(limit)); (d/'memory.stat').write_text(f'hierarchical_memory_limit {limit}\n')
                    (d/'memory.failcnt').write_text('0');(d/'memory.use_hierarchy').write_text('1')
                s=m.resource_sample(proc)
                self.assertEqual(s['capacity'],10*m.GIB); self.assertEqual(s['available'],8*m.GIB)

    class ProcessChecks(unittest.TestCase):
        def run_case(self, code, *, sampler=good, **limits):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp)
                defaults={'RSS_CAP':96*m.MIB,'WALL_SECONDS':3,'LOG_CAP':65536,'ADMISSION_INTERVAL':0.005,'SAMPLE_SECONDS':0.02}
                defaults.update(limits)
                with patch.multiple(m,**defaults):
                    result=m.supervise([sys.executable,'-c',code],p,sampler,{'fixture':True},os.environ.copy())
                receipt=json.loads((p/'build-terminal.json').read_text())
                log=(p/'build.log').read_bytes() if (p/'build.log').exists() else b''
                self.assertEqual(receipt['status'],result['status'])
                self.assertTrue(receipt['cleanup_complete'])
                return result,receipt,log

        def test_success_preserves_output_and_exit(self):
            r,s,log=self.run_case("print('synthetic success')")
            self.assertEqual(r['exit_code'],0);self.assertEqual(s['status'],'PASS')
            self.assertEqual(s['child_exit_code'],0);self.assertIn(b'synthetic success',log)

        def test_nonzero_exit_is_not_tee_success(self):
            r,s,log=self.run_case("print('synthetic failure');raise SystemExit(7)")
            self.assertEqual(r['exit_code'],7);self.assertEqual(s['child_exit_code'],7)
            self.assertEqual(s['reason'],'CHILD_EXIT_NONZERO')

        def test_unreadable_controller_never_spawns(self):
            def missing(): raise m.ResourceError('controller unreadable')
            r,s,_=self.run_case("raise AssertionError('must not spawn')",sampler=missing)
            self.assertEqual(s['reason'],'PRECHECK_REJECTED');self.assertIsNone(s['child_pid'])

        def test_insufficient_headroom_never_spawns(self):
            def low(): return {**good(),'available':m.GIB}
            _,s,_=self.run_case("raise AssertionError('must not spawn')",sampler=low)
            self.assertEqual(s['reason'],'PRECHECK_REJECTED');self.assertIsNone(s['child_pid'])

        def test_rss_limit_stops_only_owned_child(self):
            _,s,_=self.run_case("import time;x=bytearray(64*1024*1024);time.sleep(2)",RSS_CAP=24*m.MIB)
            self.assertEqual(s['reason'],'RSS_LIMIT')

        def test_wall_limit_reaps_children(self):
            _,s,_=self.run_case("import subprocess,sys,time;subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)']);time.sleep(10)",WALL_SECONDS=0.2)
            self.assertEqual(s['reason'],'WALL_LIMIT');self.assertGreaterEqual(s['owned_processes_observed'],2)

        def test_ignoring_term_is_killed_without_touching_unrelated_process(self):
            sentinel=subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)'])
            try:
                _,s,_=self.run_case('import signal,time;signal.signal(signal.SIGTERM,signal.SIG_IGN);time.sleep(10)',WALL_SECONDS=0.4)
                self.assertEqual(s['reason'],'WALL_LIMIT');self.assertIsNone(sentinel.poll())
                self.assertLess(s['build_elapsed_seconds'],0.7)
            finally:
                sentinel.terminate();sentinel.wait(timeout=2)

        def test_detached_owned_descendant_is_cleaned(self):
            _,s,_=self.run_case("import subprocess,sys,time;subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)'],start_new_session=True);time.sleep(10)",WALL_SECONDS=0.3)
            self.assertEqual(s['reason'],'WALL_LIMIT');self.assertGreaterEqual(s['owned_processes_observed'],2)

        def test_persistent_process_table_failure_still_stops_owned_session(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp);original=m.process_table;seen=[]
                sentinel=subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)'])
                def broken_after_first_snapshot():
                    if seen:raise m.ResourceError('persistent synthetic process-table failure')
                    table=original();seen.append(table);return table
                try:
                    with patch.object(m,'process_table',broken_after_first_snapshot),patch.multiple(m,ADMISSION_INTERVAL=.001,SAMPLE_SECONDS=.01,WALL_SECONDS=.3):
                        result=m.supervise([sys.executable,'-c','import time;time.sleep(10)'],p,good,{'fixture':True},os.environ.copy())
                    receipt=json.loads((p/'build-terminal.json').read_text())
                    owned=original().get(result['child_pid'])
                    self.assertTrue(owned is None or owned['state'] in ('Z','X'),'owned child leaked after measurement failure')
                    self.assertIsNotNone(receipt['child_exit_code'])
                    self.assertEqual(receipt['status'],'FAIL')
                    self.assertEqual(receipt['reason'],'RESOURCE_MEASUREMENT_FAILED')
                    self.assertFalse(receipt['cleanup_complete'],'a failed full scan must not claim verified whole-tree cleanup')
                    self.assertIsNone(sentinel.poll())
                finally:
                    # Safely clean the old implementation's RED leak after assertion.
                    if 'result' in locals():
                        row=original().get(result['child_pid'])
                        if row and row['pgid']==result['child_pid']:
                            os.killpg(result['child_pid'],signal.SIGKILL)
                            try:os.waitpid(result['child_pid'],0)
                            except ChildProcessError:pass
                    sentinel.terminate();sentinel.wait(timeout=2)

        def test_scan_failure_cleans_observed_detached_child_by_bound_handle(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp);marker=p/'detached.pid';original=m.process_table;armed=[]
                sentinel=subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)'])
                def broken_after_detached_observed():
                    if armed:raise m.ResourceError('persistent scan failure after detached child observed')
                    table=original()
                    if marker.exists() and marker.read_text().isdigit() and int(marker.read_text()) in table:armed.append(True)
                    return table
                code=f"import subprocess,sys,time,pathlib;c=subprocess.Popen([sys.executable,'-c','import time;time.sleep(10)'],start_new_session=True);pathlib.Path({str(marker)!r}).write_text(str(c.pid));time.sleep(10)"
                result=None
                try:
                    with patch.object(m,'process_table',broken_after_detached_observed),patch.multiple(m,ADMISSION_INTERVAL=.001,SAMPLE_SECONDS=.01,WALL_SECONDS=1):
                        result=m.supervise([sys.executable,'-c',code],p,good,{'fixture':True},os.environ.copy())
                    self.assertTrue(armed,'negative control never observed the detached child')
                    table=original()
                    for pid in (result['child_pid'],int(marker.read_text())):
                        self.assertTrue(pid not in table or table[pid]['state'] in ('Z','X'),'owned process remained live')
                    self.assertEqual(result['reason'],'RESOURCE_MEASUREMENT_FAILED')
                    self.assertFalse(result['cleanup_complete']);self.assertIsNone(sentinel.poll())
                    self.assertIsNotNone(result['child_exit_code'])
                finally:
                    for pid in ([result['child_pid']] if result else [])+([int(marker.read_text())] if marker.exists() else []):
                        row=original().get(pid)
                        if row and row['state'] not in ('Z','X'):os.kill(pid,signal.SIGKILL)
                    sentinel.terminate();sentinel.wait(timeout=2)

        def test_output_overflow_cannot_pass_or_drop_failure(self):
            _,s,log=self.run_case("import os;os.write(1,b'x'*200000)",LOG_CAP=4096)
            self.assertEqual(s['reason'],'LOG_LIMIT');self.assertEqual(len(log),4096)
            self.assertGreater(s['observed_output_bytes'],4096)

        def test_quota_change_fails(self):
            calls=0
            def changing():
                nonlocal calls
                calls+=1;s=good()
                if calls>3:s['quota']=[['v2','/','100','max']]
                return s
            _,s,_=self.run_case('import time;time.sleep(2)',sampler=changing)
            self.assertEqual(s['reason'],'RESOURCE_CHANGED')

        def test_oom_counter_change_fails(self):
            calls=0
            def changing():
                nonlocal calls
                calls+=1;s=good()
                if calls>3:s['oom']=[['/',1]]
                return s
            _,s,_=self.run_case('import time;time.sleep(2)',sampler=changing)
            self.assertEqual(s['reason'],'OOM_COUNTER_CHANGED')

        def test_reserve_loss_fails_and_reaps(self):
            calls=0
            def low():
                nonlocal calls
                calls+=1;s=good()
                if calls>3:s['available']=m.GIB
                return s
            _,s,_=self.run_case('import time;time.sleep(2)',sampler=low)
            self.assertEqual(s['reason'],'RESERVE_LOST')

        def test_controller_disappears_after_spawn(self):
            calls=0
            def missing():
                nonlocal calls
                calls+=1
                if calls>3:raise m.ResourceError('controller became unreadable')
                return good()
            _,s,_=self.run_case('import time;time.sleep(2)',sampler=missing)
            self.assertEqual(s['reason'],'RESOURCE_MEASUREMENT_FAILED')

        def test_cli_rejects_inherited_gc_without_spawning(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                with patch.dict(os.environ,{'EVIDENCE_DIR':tmp,'NODE_OPTIONS':'--expose-gc'},clear=True),patch.object(sys,'argv',[str(SCRIPT)]):
                    self.assertEqual(m.main(),1)
                s=json.loads((Path(tmp)/'build-terminal.json').read_text())
                self.assertEqual(s['reason'],'IDENTITY_PRECHECK_REJECTED');self.assertIsNone(s['child_pid'])

        def test_cancellation_records_terminal_receipt(self):
            with tempfile.TemporaryDirectory(dir=HERE) as tmp:
                p=Path(tmp)
                code=f'''import importlib.util,os,sys,time
from pathlib import Path
spec=importlib.util.spec_from_file_location('b',{str(SCRIPT)!r});b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
b.ADMISSION_INTERVAL=0.005;b.SAMPLE_SECONDS=0.02
sample=lambda:{{'capacity':16*b.GIB,'available':14*b.GIB,'quota':[['v2','/','max','max']],'oom':[['/',0]],'raw':{{'synthetic':True}},'at':time.time()}}
r=b.supervise([sys.executable,'-c','import time;time.sleep(10)'],Path({str(p)!r}),sample,{{'fixture':True}},os.environ.copy())
raise SystemExit(r['exit_code'])
'''
                child=subprocess.Popen([sys.executable,'-c',code],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
                try:
                    deadline=time.monotonic()+3
                    while not (p/'build-started.json').exists() and time.monotonic()<deadline:time.sleep(.01)
                    self.assertTrue((p/'build-started.json').exists())
                    child.send_signal(signal.SIGTERM);child.communicate(timeout=4)
                    s=json.loads((p/'build-terminal.json').read_text())
                    self.assertEqual(s['reason'],'CANCELLED');self.assertEqual(child.returncode,143)
                    self.assertTrue(s['cleanup_complete'])
                finally:
                    if child.poll() is None:child.kill();child.wait()

if __name__=='__main__':unittest.main(verbosity=2)
