import importlib.util
import pathlib
import types
import unittest
import json
import os
import sys
import tempfile
from unittest.mock import patch

class Controls(unittest.TestCase):
    def test_selector_and_guard(self):
        p=pathlib.Path(__file__).with_name('r267_hall_review.py')
        self.assertTrue(p.exists(), 'fixed review selector is not implemented yet')
        spec=importlib.util.spec_from_file_location('r267',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        self.assertEqual(m.select('review-build'),['node','tests/r267-dafotang-hall-review/build-review.mjs'])
        self.assertEqual(m.select('visual'),['node','tests/r267-dafotang-hall-review/capture.mjs'])
        for bad in ('host','deploy','npm','../capture',''):
            with self.assertRaises(ValueError):m.select(bad)
        def guard():return types.SimpleNamespace(RSS_CAP=4*1024**3,WALL_SECONDS=720,LOG_CAP=32*1024**2,SAMPLE_SECONDS=.1,MARGIN=256*1024**2,ADMISSION_INTERVAL=1.,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16')
        g=guard();m.configure_guard(g,'visual');self.assertEqual(g.RSS_CAP,6442450944);self.assertEqual(g.WALL_SECONDS,720);self.assertEqual(g.LOG_CAP,33554432);self.assertEqual(g.SAMPLE_SECONDS,.1)
        g=guard();m.configure_guard(g,'review-build');self.assertEqual(g.RSS_CAP,4*1024**3)
        for attr in ('RSS_CAP','WALL_SECONDS','LOG_CAP','SAMPLE_SECONDS','MARGIN','ADMISSION_INTERVAL','HEAP_FLAGS'):
            g=guard();setattr(g,attr,None)
            with self.assertRaises(ValueError):m.configure_guard(g,'visual')
        env=dict(CI='true',GITHUB_ACTIONS='true',GITHUB_REPOSITORY=m.REPO,GITHUB_REF=m.REF,GITHUB_EVENT_NAME='push',GITHUB_SHA='c'*40,GITHUB_RUN_NUMBER='1',GITHUB_RUN_ATTEMPT='1',REVIEW_RUNNER_ENVIRONMENT='github-hosted',RUNNER_OS='Linux',RUNNER_ARCH='X64')
        event=dict(created=True,deleted=False,forced=False,before='0'*40,after='c'*40,ref=m.REF,repository={'full_name':m.REPO})
        m.validate_event(env,event)
        for key,value in [('GITHUB_EVENT_NAME','workflow_dispatch'),('GITHUB_RUN_ATTEMPT','2'),('GITHUB_REF','refs/heads/main'),('GITHUB_REPOSITORY','other/repo'),('REVIEW_RUNNER_ENVIRONMENT','self-hosted'),('NODE_OPTIONS','--require=x'),('PYTHONPATH','x'),('R267_CAP','1')]:
            with self.assertRaises(ValueError):m.validate_event({**env,key:value},event)
        for key,value in [('created',False),('forced',True),('before','d'*40),('after','e'*40)]:
            with self.assertRaises(ValueError):m.validate_event(env,{**event,key:value})

class OrdinaryBuildEntry(unittest.TestCase):
    def module(self):
        file=pathlib.Path(__file__).with_name('r267_production_build_recheck.py')
        self.assertTrue(file.exists(), 'ordinary build recheck entry is not implemented yet')
        spec=importlib.util.spec_from_file_location('ordinary_entry',file);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        return module

    def exercise(self, *, code=0, extra=False, wrong_hash=False, duplicate=False, journal_failure=0, terminal_missing=False):
        self.last_calls=[]
        module=self.module()
        with tempfile.TemporaryDirectory(prefix='r267-entry-fixture-') as temp:
            evidence=pathlib.Path(temp);identity={'head':'a'*40,'tree':'b'*40};calls=[];journal_writes=0
            (evidence/'checkout-identity.json').write_text(json.dumps(identity))
            if duplicate:(evidence/'ordinary-build-attempt.json').write_text('{}')
            def require(value,message):
                if not value:raise ValueError(message)
            helper=types.SimpleNamespace(validate_checkout=lambda:identity,require=require,GUARD_HASH='guard-hash',RECHECK_HASH='recheck-hash')
            helper.sha=lambda p: ('wrong' if wrong_hash else 'guard-hash') if str(p).endswith('r177_build_bound.py') else 'recheck-hash' if str(p).endswith('r262_exit_recheck.py') else 'entry-hash'
            guard=types.SimpleNamespace(process_table=lambda:{},RSS_CAP=4294967296,WALL_SECONDS=720,LOG_CAP=33554432,SAMPLE_SECONDS=.1,MARGIN=268435456,ADMISSION_INTERVAL=1.,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16')
            original_table=guard.process_table
            def atomic_json(path,value):
                nonlocal journal_writes
                if path.name=='ordinary-build-exit-rechecks.json':
                    journal_writes+=1
                    if journal_writes==journal_failure:raise OSError('journal unavailable')
                path.write_text(json.dumps(value))
            guard.atomic_json=atomic_json
            def original_main():
                calls.append('original-main')
                self.assertIsNot(guard.process_table,original_table)
                self.assertEqual(sys.argv,['entry.py'])
                self.assertTrue((evidence/'ordinary-build-exit-rechecks.json').is_file())
                self.assertTrue((evidence/'ordinary-build-attempt.json').is_file())
                self.assertEqual(guard.RSS_CAP,4294967296)
                if not terminal_missing:(evidence/'build-terminal.json').write_text(json.dumps({'status':'PASS' if code==0 else 'FAIL','exit_code':code,'child_exit_code':code,'cleanup_complete':True,'identity':identity,'limits':{'rss_bytes':4294967296,'wall_seconds':720,'log_bytes':33554432,'sample_seconds':.1}}))
                return code
            guard.main=original_main
            def install(g,path):
                calls.append('install-original-recheck')
                old=g.process_table
                g.process_table=lambda:old()
                return {'kind':'r262-same-identity-terminal-recheck','rechecks':[],'counts':{'unknown':0,'rejected':0,'read_error':0,'record_rejected':0,'converted':0}}
            recheck=types.SimpleNamespace(install_exit_state_recheck=install)
            try:
                with patch.dict(sys.modules,{'r267_hall_review':helper,'r262_exit_recheck':recheck}),patch.object(module,'load_guard',return_value=guard),patch.dict(os.environ,{'EVIDENCE_DIR':temp}),patch.object(sys,'argv',['entry.py']+(['unexpected'] if extra else [])):
                    result=module.main()
                receipt=json.loads((evidence/'ordinary-build-recheck.json').read_text())
                self.assertEqual(receipt['status'],'PASS' if code==0 else 'FAIL')
                self.assertEqual(receipt['guardExitCode'],code)
                return result,calls
            finally:
                self.last_calls=calls

    def test_installs_recheck_then_delegates_original_main_without_budget_or_argv_changes(self):
        result,calls=self.exercise();self.assertEqual(result,0);self.assertEqual(calls,['install-original-recheck','original-main'])

    def test_original_failure_remains_failure(self):
        result,calls=self.exercise(code=7);self.assertEqual(result,7);self.assertEqual(calls,['install-original-recheck','original-main'])

    def test_extra_argument_changed_source_and_duplicate_attempt_fail_before_main(self):
        for kwargs in ({'extra':True},{'wrong_hash':True},{'duplicate':True}):
            with self.subTest(kwargs=kwargs),self.assertRaises((ValueError,OSError)):self.exercise(**kwargs)
            self.assertNotIn('original-main',self.last_calls)

    def test_initial_journal_failure_prevents_build(self):
        with self.assertRaises(OSError):self.exercise(journal_failure=1)
        self.assertNotIn('original-main',self.last_calls)

    def test_final_journal_failure_cannot_report_success(self):
        with self.assertRaises(OSError):self.exercise(journal_failure=2)
        self.assertEqual(self.last_calls,['install-original-recheck','original-main'])

    def test_missing_original_terminal_receipt_fails_closed(self):
        with self.assertRaises((ValueError,OSError)):self.exercise(terminal_missing=True)
        self.assertEqual(self.last_calls,['install-original-recheck','original-main'])

if __name__=='__main__':unittest.main()
