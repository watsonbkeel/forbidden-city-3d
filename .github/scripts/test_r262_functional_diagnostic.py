"""Small synthetic diagnostic gates; never starts a real child or browser."""
import contextlib
import copy
import io
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import types
import unittest
from unittest.mock import patch

ROOT = Path(os.environ.get('R262_REPO_ROOT', Path(__file__).resolve().parents[2]))
HERE = Path(__file__).resolve().parent

def load(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

class FunctionalDiagnostic(unittest.TestCase):
    def setUp(self):
        self.d = load('diagnostic_fixture', HERE/'r262_functional_diagnostic.py')
        self.guard = load('original_guard_fixture', ROOT/'.github/scripts/r177_build_bound.py')
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.evidence = Path(self.temp.name)
        self.env = dict(GITHUB_ACTIONS='true', CI='true', GITHUB_REPOSITORY='watsonbkeel/forbidden-city-3d',
                        GITHUB_EVENT_NAME='push', GITHUB_REF='refs/heads/dev/r262-functional-diagnostic',
                        GITHUB_RUN_NUMBER='1', GITHUB_RUN_ATTEMPT='1', GITHUB_SHA='a'*40,
                        DIAGNOSTIC_RUNNER_ENVIRONMENT='github-hosted', RUNNER_OS='Linux', RUNNER_ARCH='X64', ImageOS='ubuntu22')
        self.event = dict(created=True, deleted=False, forced=False, before='0'*40, after='a'*40,
                          ref=self.env['GITHUB_REF'], repository={'full_name':self.env['GITHUB_REPOSITORY']})

    def test_exact_first_creation_admitted(self):
        self.d.validate_event(self.env, self.event)

    def test_retries_later_runs_wrong_destination_and_platform_rejected(self):
        for key,value in [('GITHUB_RUN_ATTEMPT','2'),('GITHUB_RUN_NUMBER','2'),('GITHUB_EVENT_NAME','workflow_dispatch'),
                          ('GITHUB_REF','refs/heads/dev/r262-validation'),('GITHUB_REPOSITORY','other/repo'),
                          ('DIAGNOSTIC_RUNNER_ENVIRONMENT','self-hosted'),('RUNNER_ARCH','ARM64')]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                self.d.validate_event({**self.env,key:value}, self.event)

    def test_duplicate_push_deleted_forced_or_mismatched_event_rejected(self):
        for key,value in [('created',False),('deleted',True),('forced',True),('before','b'*40),('after','b'*40),('ref','refs/heads/main')]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                self.d.validate_event(self.env, {**self.event,key:value})
        with self.assertRaises(ValueError):
            self.d.validate_event(self.env, {**self.event,'repository':{'full_name':'other/repo'}})

    def test_image_label_is_recorded_not_an_invented_capacity_gate(self):
        for value in ('ubuntu22','ubuntu26','unknown-future-label'):
            self.d.validate_event({**self.env,'ImageOS':value},self.event)

    def test_inherited_instrumentation_rejected(self):
        for key in ('NODE_OPTIONS','TEST_GC','NODE_V8_COVERAGE','NODE_PATH'):
            with self.subTest(key=key), self.assertRaises(ValueError):
                self.d.validate_event({**self.env,key:'unexpected'},self.event)

    def test_only_rss_budget_changes(self):
        before=dict(vars(self.guard))
        self.d.configure_guard(self.guard)
        changed={k for k,v in before.items() if self.guard.__dict__[k] is not v and self.guard.__dict__[k]!=v}
        self.assertEqual(changed,{'RSS_CAP'})
        self.assertEqual(self.guard.RSS_CAP,6*1024**3)
        self.assertEqual((self.guard.WALL_SECONDS,self.guard.LOG_CAP,self.guard.SAMPLE_SECONDS,self.guard.MARGIN),
                         (720,32*1024**2,.1,256*1024**2))
        self.assertEqual(self.guard.HEAP_FLAGS,'--max-old-space-size=2048 --max-semi-space-size=16')

    def test_unknown_base_budget_rejected(self):
        self.guard.RSS_CAP=8*1024**3
        with self.assertRaises(ValueError): self.d.configure_guard(self.guard)

    def source_probe(self, overrides=None, wrong_hash=False):
        outputs={('rev-parse','HEAD'):self.env['GITHUB_SHA'],
                 ('status','--porcelain=v1','--untracked-files=all'):'',
                 ('show','-s','--format=%P','HEAD'):self.d.PARENT,
                 ('rev-parse','HEAD^1^{tree}'):self.d.PARENT_TREE,
                 ('diff','--name-status','HEAD^1','HEAD'):'\n'.join('A\t'+p for p in self.d.ADDED_PATHS),
                 ('rev-parse','HEAD^{tree}'):'b'*40}
        outputs.update(overrides or {})
        def git(args, **kwargs): return outputs[tuple(args[1:])]
        def read(file): return (ROOT/file).read_bytes() if not wrong_hash else b'wrong'
        original_read=Path.read_bytes
        with patch.object(self.d.subprocess,'check_output',side_effect=git):
            # Pin validation is real baseline bytes without writing to the repo.
            with patch.object(self.d.Path,'read_bytes',lambda file:original_read(ROOT/file) if not wrong_hash else b'wrong'):
                return self.d.verify_source(self.env)

    def test_exact_parent_tree_paths_and_hashes_admitted(self):
        identity=self.source_probe()
        self.assertEqual(identity['productParent'],self.d.PARENT)
        self.assertEqual(identity['productParentTree'],self.d.PARENT_TREE)
        self.assertEqual(identity['runner']['ImageOS'],'ubuntu22')

    def test_changed_product_parent_tree_paths_or_dirty_checkout_rejected(self):
        cases=[{('rev-parse','HEAD'):'b'*40},
               {('show','-s','--format=%P','HEAD'):'b'*40},
               {('rev-parse','HEAD^1^{tree}'):'b'*40},
               {('status','--porcelain=v1','--untracked-files=all'):'M main.js'},
               {('diff','--name-status','HEAD^1','HEAD'):'M\tmain.js'}]
        for case in cases:
            with self.subTest(case=case),self.assertRaises(ValueError): self.source_probe(case)
        with self.assertRaises(ValueError): self.source_probe(wrong_hash=True)

    def test_runtime_attempt_marker_cannot_be_reused(self):
        self.d.claim_attempt(self.evidence,self.env)
        with self.assertRaises(FileExistsError): self.d.claim_attempt(self.evidence,self.env)
        record=json.loads((self.evidence/'diagnostic-attempt.json').read_text())
        self.assertEqual(record['candidate'],self.env['GITHUB_SHA'])
        self.assertEqual(record['releaseAccepted'],False)

    def sample(self, *, capacity=16*1024**3, available=15*1024**3):
        return dict(capacity=capacity,available=available,quota=[['fixed']],oom=[['fixed',0]])

    def preflight(self,sampler):
        self.d.configure_guard(self.guard)
        with patch.object(self.guard.time,'sleep'), patch.object(self.guard.subprocess,'Popen',side_effect=OSError('fixture blocked spawn')) as spawn:
            result=self.guard.supervise(['never-real-child'],self.evidence,sampler,{},dict(os.environ))
        return result,spawn.call_count

    def test_sufficient_real_style_samples_reach_spawn_once(self):
        result,count=self.preflight(lambda:self.sample())
        self.assertEqual(count,1)
        self.assertEqual(len(result['admission']),3)
        self.assertEqual(result['detail'],'fixture blocked spawn')

    def test_small_capacity_and_insufficient_available_reject_before_spawn(self):
        for sample in [self.sample(capacity=7*1024**3,available=7*1024**3),
                       self.sample(available=8*1024**3)]:
            self.guard=load('guard_again',ROOT/'.github/scripts/r177_build_bound.py')
            result,count=self.preflight(lambda:sample)
            self.assertEqual(count,0)
            self.assertEqual(result['reason'],'PRECHECK_REJECTED')
            self.assertIn('headroom',result['detail'])

    def test_unreadable_measurement_is_fail_closed(self):
        def missing(): raise self.guard.ResourceError('fixture unreadable cgroup')
        result,count=self.preflight(missing)
        self.assertEqual(count,0)
        self.assertEqual(result['reason'],'PRECHECK_REJECTED')

    def test_resource_identity_and_oom_changes_reject_before_spawn(self):
        for key,value in [('capacity',15*1024**3),('quota',[['changed']]),('oom',[['fixed',1]])]:
            self.guard=load('guard_changed',ROOT/'.github/scripts/r177_build_bound.py')
            samples=iter([self.sample(),{**self.sample(),key:value}])
            result,count=self.preflight(lambda:next(samples))
            self.assertEqual(count,0)
            self.assertEqual(result['reason'],'PRECHECK_REJECTED')
            self.assertIn('identity changed',result['detail'])

    def run_main_with_terminal_and_smoke(self, terminal, content, runtime_error=None):
        case=Path(tempfile.mkdtemp(dir=self.evidence))
        event_file=case/'event.json'; event_file.write_text(json.dumps(self.event))
        smoke_file=case/'production-smoke.json'
        if content == 'oversize':
            with smoke_file.open('wb') as out: out.truncate(8*1024**2+1)
        elif content is not None: smoke_file.write_text(content)
        receipt=case/'runtime-guard'/'build-terminal.json'
        receipt.parent.mkdir()
        receipt_bytes=b'{"status":"PASS","cleanup_complete":true,"fixture":"unverified prior receipt"}'
        receipt.write_bytes(receipt_bytes)
        def supervise(*args):
            if runtime_error is not None: raise runtime_error
            return terminal
        guard=types.SimpleNamespace(HEAP_FLAGS=self.guard.HEAP_FLAGS,resource_sample=lambda:None,
                                    supervise=supervise)
        adapter=types.SimpleNamespace(install_exit_state_recheck=lambda *args:{})
        original=copy.deepcopy(terminal)
        with patch.dict(os.environ,{**self.env,'EVIDENCE_DIR':str(case),'GITHUB_EVENT_PATH':str(event_file)},clear=True), \
             patch.object(self.d.sys,'argv',['diagnostic']), \
             patch.object(self.d,'verify_source',return_value={}), \
             patch.object(self.d,'configure_guard'), \
             patch.object(self.d,'load_module',side_effect=[guard,adapter]), \
             contextlib.redirect_stdout(io.StringIO()):
            code=self.d.main()
        self.assertEqual(terminal,original,'evidence failure must not mutate the runtime result')
        self.assertEqual(receipt.read_bytes(),receipt_bytes,'wrapper must not alter or trust an unverified prior terminal receipt')
        self.assertEqual(json.loads((case/'diagnostic-attempt.json').read_text())['candidate'],self.env['GITHUB_SHA'])
        return code,json.loads((case/'diagnostic-summary.json').read_text())

    def check_evidence_failure(self, terminal, content):
        code,summary=self.run_main_with_terminal_and_smoke(terminal,content)
        self.assertEqual(code,1)
        self.assertEqual(summary['status'],'DIAGNOSTIC_FAIL')
        self.assertFalse(summary['releaseAccepted'])
        for key,value in terminal.items(): self.assertEqual(summary['runtime'][key],value,key)
        self.assertIsInstance(summary['evidenceError'],str)
        self.assertTrue(summary['evidenceError'])

    def test_runtime_rss_failure_and_malformed_evidence_keep_primary_reason(self):
        self.check_evidence_failure({'status':'FAIL','reason':'RSS_LIMIT','exit_code':1,
                                     'child_exit_code':-15,'cleanup_complete':True},'{bad json')

    def test_runtime_rss_failure_and_oversize_evidence_keep_primary_reason(self):
        self.check_evidence_failure({'status':'FAIL','reason':'RSS_LIMIT','exit_code':1,
                                     'child_exit_code':-15,'cleanup_complete':False},'oversize')

    def test_runtime_pass_with_bad_or_missing_evidence_never_passes(self):
        for content in ('{bad json',None,'[]','oversize'):
            with self.subTest(content=content):
                self.check_evidence_failure({'status':'PASS','reason':None,'exit_code':0,
                                             'child_exit_code':0,'cleanup_complete':True},content)

    def test_supervisor_exception_never_claims_cleanup_or_prior_receipt_success(self):
        for error in (RuntimeError('synthetic supervisor error'),OSError('synthetic supervisor OS error'),AssertionError('synthetic unexpected assertion')):
            with self.subTest(error=type(error).__name__):
                code,summary=self.run_main_with_terminal_and_smoke({},None,runtime_error=error)
                self.assertEqual(code,1)
                self.assertEqual(summary['status'],'DIAGNOSTIC_FAIL')
                self.assertEqual(summary['runtime']['reason'],'DIAGNOSTIC_SUPERVISOR_EXCEPTION')
                self.assertIs(summary['runtime']['cleanup_complete'],False)
                self.assertEqual(summary['runtime']['detail'],str(error))
                self.assertFalse(summary['releaseAccepted'])

    def test_runtime_and_valid_smoke_pass_remain_only_diagnostic(self):
        smoke={'status':'AUTOMATED_SMOKE_PASS_VISUAL_REVIEW_REQUIRED','coreStatus':'PASS','captureStatus':'PASS','releaseAccepted':False}
        code,summary=self.run_main_with_terminal_and_smoke({'status':'PASS','reason':None,'exit_code':0,
                                                           'child_exit_code':0,'cleanup_complete':True},json.dumps(smoke))
        self.assertEqual(code,0)
        self.assertEqual(summary['status'],'DIAGNOSTIC_AUTOMATED_PASS_VISUAL_REVIEW_REQUIRED')
        self.assertIsNone(summary['evidenceError'])
        self.assertFalse(summary['releaseAccepted'])

    def test_summary_keeps_old_failure_and_no_release_acceptance(self):
        smoke={'status':'AUTOMATED_SMOKE_PASS_VISUAL_REVIEW_REQUIRED','coreStatus':'PASS','captureStatus':'PASS','releaseAccepted':False}
        result={'status':'PASS','exit_code':0,'cleanup_complete':True}
        summary=self.d.diagnostic_summary(result,smoke)
        self.assertEqual(summary['status'],'DIAGNOSTIC_AUTOMATED_PASS_VISUAL_REVIEW_REQUIRED')
        self.assertFalse(summary['releaseAccepted'])
        self.assertEqual(summary['prior4GiBResult'],'FAIL_UNCHANGED')
        self.assertFalse(summary['hardwareGpuTested'])
        self.assertFalse(summary['physicalPhoneTested'])
        for key,value in [('coreStatus','FAIL'),('captureStatus','INCOMPLETE'),('releaseAccepted',True)]:
            with self.subTest(key=key):
                self.assertEqual(self.d.diagnostic_summary(result,{**smoke,key:value})['status'],'DIAGNOSTIC_FAIL')
        self.assertEqual(self.d.diagnostic_summary({**result,'cleanup_complete':False},smoke)['status'],'DIAGNOSTIC_FAIL')
        self.assertEqual(self.d.diagnostic_summary({**result,'status':'FAIL'},smoke)['status'],'DIAGNOSTIC_FAIL')

if __name__=='__main__': unittest.main()
