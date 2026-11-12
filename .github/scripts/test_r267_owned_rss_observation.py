"""Tiny synthetic reads only. Never launch a child, supervisor, build or host scan."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import patch
import os

HERE = Path(__file__).parent
# Private review overlay needs only the two unchanged originals, copied beside it.
def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def stat(state='R', start=100, pid=741):
    return f'{pid} (DO_NOT_RECORD (private name)) ' + ' '.join([state, '1', '741'] + ['0'] * 16 + [str(start)] + ['0'] * 10)

class Observation(unittest.TestCase):
    def module(self):
        self.assertTrue((HERE/'r267_owned_rss_observation.py').exists(), 'narrow observer not implemented')
        return load('r267_owned_rss_observation')

    def run_case(self, stats, status='Pid:\t741\nState:\tR (running)\n', pgid=741, fail_write=False):
        m=self.module();g=load('r177_build_bound');r=load('r262_exit_recheck')
        reads=[];remaining=list(stats)
        class FakePath(type(Path())):
            def iterdir(self):
                self.assert_fake()
                return iter([type(self)('/proc/741')])
            def assert_fake(self):
                if str(self)!='/proc':raise AssertionError('unmocked directory')
            def read_text(self,*args,**kwargs):
                reads.append(str(self))
                if str(self)=='/proc/741/status':return status
                if str(self)!='/proc/741/stat':raise AssertionError('unmocked read')
                result=remaining.pop(0)
                if isinstance(result,BaseException):raise result
                return result
        g.Path=r.Path=FakePath
        original_gate=g.owned_processes
        original_table=g.process_table
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp);path=folder/'first.json'
            if fail_write:path=folder/'absent'/'first.json'
            observer,journal=m.install(g,r,folder/'journal.json',path)
            # The original owned function is still called, not recreated.
            self.assertIs(observer.original_owned,original_gate)
            self.assertIs(observer.original_table,original_table)
            self.assertIs(g.Path,FakePath);self.assertIs(r.Path,FakePath)
            known={}
            try:result=g.owned_processes(pgid,known,100);error=None
            except g.ResourceError as exc:result=None;error=exc
            self.assertEqual(remaining,[])
            report=observer.summary()
            document=json.loads(path.read_text()) if path.exists() else None
            return m,g,observer,journal,reads,result,error,report,document

    def test_first_original_failure_preserves_reads_and_private_data_absence(self):
        *_,reads,result,error,summary,event=self.run_case([stat(),stat('Z'),stat('S',101)])
        self.assertEqual(reads,['/proc/741/stat','/proc/741/status','/proc/741/stat','/proc/741/stat'])
        self.assertIsNone(result);self.assertEqual(str(error),'live owned PID 741 lacks RSS')
        self.assertEqual(summary['status'],'RECORDED');self.assertTrue(event['original_gate_failed'])
        self.assertEqual(event['record']['s2']['state'],'Z');self.assertEqual(event['record']['s3']['start'],101)
        self.assertEqual(event['decision']['reason'],'START_MISMATCH')
        self.assertFalse(event['decision']['identity_match']);self.assertNotIn('DO_NOT_RECORD',json.dumps(event))
        self.assertLessEqual(len(json.dumps(event).encode()),16384)
        for third,reason in [(stat(pid=742),'PID_MISMATCH'),('bad framing','PARSE_ERROR'),(stat('R'),'NONTERMINAL')]:
            with self.subTest(reason=reason):
                *_,error,summary,event=self.run_case([stat(),stat(),third])
                self.assertEqual(str(error),'live owned PID 741 lacks RSS')
                self.assertEqual(event['decision']['reason'],reason)

    def test_original_success_is_not_triggered_and_terminal_rules_unchanged(self):
        for stats,status,pgid in [([stat(),stat(),stat('Z')],'State:\tZ\n',741),([stat(),stat()],'VmRSS:\t0 kB\n',741),([stat(),stat(),stat()],'State:\tR\n',999)]:
            with self.subTest(pgid=pgid,status=status):
                *_,result,error,summary,event=self.run_case(stats,status,pgid)
                self.assertIsNone(error);self.assertIsNotNone(result)
                self.assertEqual(summary['status'],'NOT_TRIGGERED');self.assertIsNone(event)

    def test_original_failure_and_incomplete_write_remain(self):
        *_,error,summary,event=self.run_case([stat(),stat(),FileNotFoundError('private text')],fail_write=True)
        self.assertEqual(str(error),'live owned PID 741 lacks RSS')
        self.assertEqual(summary['status'],'INCOMPLETE');self.assertEqual(summary['write'],'FAILED');self.assertIsNone(event)

    def test_private_clone_identity_and_exact_exception_and_one_shot(self):
        m=self.module();error=RuntimeError('same object')
        shared=object()
        def func(a=shared,*,b=shared):raise error
        cloned=m.private_function(func,{'Path':Path})
        self.assertIs(cloned.__code__,func.__code__);self.assertIs(cloned.__closure__,func.__closure__)
        self.assertIs(cloned.__defaults__,func.__defaults__);self.assertIs(cloned.__kwdefaults__,func.__kwdefaults__)
        for key,value in func.__globals__.items():
            if key!='Path':self.assertIs(cloned.__globals__[key],value)
        with self.assertRaises(RuntimeError) as caught:cloned()
        self.assertIs(caught.exception,error)
        with tempfile.TemporaryDirectory() as temp:
            g=types.SimpleNamespace(ResourceError=RuntimeError,process_table=lambda:{},Path=Path)
            def gate(*args):raise error
            g.owned_processes=gate
            r=load('r262_exit_recheck')
            observer,_=m.install(g,r,Path(temp)/'journal',Path(temp)/'first')
            with self.assertRaises(RuntimeError) as caught:g.owned_processes(1,{},0)
            self.assertIs(caught.exception,error);self.assertEqual(observer.summary()['status'],'NOT_TRIGGERED')

    def test_path_delegates_exact_return_error_and_no_unrelated_record(self):
        m=self.module();returned='a private non-proc string';error=PermissionError('do not save')
        calls=[]
        class Fake(type(Path())):
            def read_text(self,*args,**kwargs):
                calls.append((str(self),args,kwargs))
                if self.name=='stat':raise error
                return returned
        with tempfile.TemporaryDirectory() as temp:
            observer=m.Observer(Path(temp)/'first');observer.begin();observer.active=True
            local=observer.observed_path(Fake)
            self.assertIs(local('/not-proc').read_text(encoding='ascii'),returned)
            self.assertEqual(observer.records,{})
            self.assertIs(local('/proc/741/status').read_text(encoding='ascii'),returned)
            with self.assertRaises(PermissionError) as caught:local('/proc/741/stat').read_text(errors='strict')
            self.assertIs(caught.exception,error)
            self.assertEqual(calls,[('/not-proc',(),{'encoding':'ascii'}),('/proc/741/status',(),{'encoding':'ascii'}),('/proc/741/stat',(),{'errors':'strict'})])
            self.assertNotIn('private',str(observer.records));self.assertNotIn('do not save',str(observer.records))
            # Matched original exception still propagates if recorder itself breaks.
            g=types.SimpleNamespace(Path=Fake,ResourceError=RuntimeError,process_table=lambda:{})
            gate_error=RuntimeError('live owned PID 741 lacks RSS')
            def gate(*args):raise gate_error
            g.owned_processes=gate
            observer,_=m.install(g,load('r262_exit_recheck'),Path(temp)/'journal',Path(temp)/'first')
            def broken(*args):raise OSError('diagnostic writer failed')
            observer.fail=broken
            with self.assertRaises(RuntimeError) as caught:g.owned_processes(741,{},100)
            self.assertIs(caught.exception,gate_error);self.assertEqual(observer.summary()['status'],'INCOMPLETE')

    def test_record_limits_missing_and_first_failure_only(self):
        m=self.module()
        with tempfile.TemporaryDirectory() as temp:
            observer=m.Observer(Path(temp)/'first')
            observer.begin()
            for pid in range(300):observer.capture(pid,'s1',stat(pid=pid),None,1,2)
            self.assertLessEqual(len(observer.records),256)
            self.assertLessEqual(sum(len(row) for row in observer.records.values()),262144)
            self.assertTrue(all(len(row)<=1024 for row in observer.records.values()))
            observer.fail(999,3)
            first=(Path(temp)/'first').read_bytes()
            event=json.loads(first);self.assertEqual(event['status'],'INCOMPLETE')
            self.assertIn('BUFFER_OVERFLOW',event['incomplete']);self.assertIn('TARGET_MISSING',event['incomplete'])
            observer.begin();observer.fail(1,4)
            self.assertEqual((Path(temp)/'first').read_bytes(),first)

class Entry(unittest.TestCase):
    def test_successor_uses_unchanged_admission_code_and_fixed_chain(self):
        m=load('r267_owned_rss_build');review=m.review
        self.assertIs(m.validate_checkout.__code__,review.validate_checkout.__code__)
        self.assertIs(m.validate_event.__code__,review.validate_event.__code__)
        self.assertEqual(review.PARENT,'f20bf5b3e893371b9a23d21136f82c41e75cee42')
        self.assertEqual(m.PARENT,'dc55552585b0d2b29904c8e1610076d9b20d024d')
        self.assertEqual([action for action,_ in m.CHANGES].count('A'),6)
        self.assertEqual([action for action,_ in m.CHANGES].count('M'),2)
        env=dict(CI='true',GITHUB_ACTIONS='true',GITHUB_REPOSITORY=review.REPO,GITHUB_REF=m.REF,GITHUB_EVENT_NAME='push',GITHUB_SHA='c'*40,GITHUB_RUN_NUMBER='1',GITHUB_RUN_ATTEMPT='1',REVIEW_RUNNER_ENVIRONMENT='github-hosted',RUNNER_OS='Linux',RUNNER_ARCH='X64')
        event=dict(created=True,deleted=False,forced=False,before='0'*40,after='c'*40,ref=m.REF,repository={'full_name':review.REPO})
        m.validate_event(env,event)
        for key,value in [('GITHUB_REF',review.REF),('GITHUB_RUN_ATTEMPT','2'),('NODE_OPTIONS','--require=x'),('R267_CAP','1')]:
            with self.assertRaises(ValueError):m.validate_event({**env,key:value},event)
        self.assertEqual(review.select('review-build'),['node','tests/r267-dafotang-hall-review/build-review.mjs'])
        self.assertEqual(review.select('visual'),['node','tests/r267-dafotang-hall-review/capture.mjs'])
        for phase,expected in [('review-build',4294967296),('visual',6442450944)]:
            g=load('r177_build_bound');review.configure_guard(g,phase)
            self.assertEqual((g.RSS_CAP,g.WALL_SECONDS,g.SAMPLE_SECONDS,g.LOG_CAP,g.HEAP_FLAGS),(expected,720,.1,33554432,'--max-old-space-size=2048 --max-semi-space-size=16'))

    def test_entry_calls_original_main_once_and_never_calls_diagnostic_pass(self):
        m=load('r267_owned_rss_build')
        for code in (0,1):
            with tempfile.TemporaryDirectory() as temp:
                folder=Path(temp);identity={'head':'a'*40,'tree':'b'*40};calls=[]
                (folder/'checkout-identity.json').write_text(json.dumps(identity))
                def write(path,value):path.write_text(json.dumps(value))
                def original_main():
                    calls.append('original-main');self.assertEqual(sys.argv,['entry.py'])
                    write(folder/'build-terminal.json',dict(exit_code=code,status='PASS' if code==0 else 'FAIL',child_exit_code=code,cleanup_complete=True,identity=identity))
                    return code
                g=types.SimpleNamespace(Path=Path,ResourceError=RuntimeError,process_table=lambda:{},owned_processes=lambda *args:{},atomic_json=write,main=original_main)
                r=load('r262_exit_recheck')
                def sha(path):return m.review.GUARD_HASH if str(path).endswith('r177_build_bound.py') else m.review.RECHECK_HASH
                with patch.object(m,'validate_checkout',return_value=identity),patch.object(m,'load',side_effect=lambda name:g if name=='r177_build_bound' else r),patch.object(m.review,'sha',side_effect=sha),patch.dict(os.environ,{'EVIDENCE_DIR':temp}),patch.object(sys,'argv',['entry.py']):
                    self.assertEqual(m.ordinary(),code)
                    with self.assertRaises(FileExistsError):m.ordinary()
                self.assertEqual(calls,['original-main'])
                receipt=json.loads((folder/'ordinary-build-observation.json').read_text())
                self.assertEqual(receipt['guardExitCode'],code)
                self.assertEqual(receipt['observation']['status'],'NOT_TRIGGERED')
                self.assertFalse(receipt['releaseAccepted'])

if __name__=='__main__':unittest.main()
