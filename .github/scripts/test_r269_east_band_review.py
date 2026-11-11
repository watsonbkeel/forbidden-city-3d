"""Small synthetic admission/routing controls. Never starts a build or browser."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch


def load():
    path=Path(__file__).with_name('r269_east_band_review.py')
    assert path.is_file(), 'R269 thin entry missing'
    spec=importlib.util.spec_from_file_location('r269_control',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module


def event_pair(m):
    env=dict(CI='true',GITHUB_ACTIONS='true',GITHUB_REPOSITORY=m.review.REPO,GITHUB_REF=m.REF,
             GITHUB_EVENT_NAME='push',GITHUB_SHA='c'*40,GITHUB_RUN_NUMBER='1',GITHUB_RUN_ATTEMPT='1',
             REVIEW_RUNNER_ENVIRONMENT='github-hosted',RUNNER_OS='Linux',RUNNER_ARCH='X64',
             GITHUB_EVENT_PATH='event.json',NPM_CONFIG_GLOBALCONFIG='/fixture/r265-empty-global.npmrc')
    event=dict(created=True,deleted=False,forced=False,before='0'*40,after='c'*40,ref=m.REF,
               repository={'full_name':m.review.REPO})
    return env,event


class Controls(unittest.TestCase):
    def test_exact_first_creation_and_no_overrides(self):
        m=load();env,event=event_pair(m);m.validate_event(env,event)
        for key,value in [('GITHUB_REF','refs/heads/main'),('GITHUB_EVENT_NAME','workflow_dispatch'),('GITHUB_RUN_NUMBER','2'),('GITHUB_RUN_ATTEMPT','2'),('REVIEW_RUNNER_ENVIRONMENT','self-hosted'),('NODE_OPTIONS','x'),('PYTHONPATH','x'),('R269_CAP','1'),('R268_CAP','1'),('R267_CAP','1')]:
            with self.subTest(key=key),self.assertRaises(ValueError):m.validate_event({**env,key:value},event)
        for key,value in [('created',False),('deleted',True),('forced',True),('before','d'*40),('after','d'*40)]:
            with self.subTest(key=key),self.assertRaises(ValueError):m.validate_event(env,{**event,key:value})

    def test_private_clones_keep_original_guard_observer_and_routing(self):
        m=load()
        self.assertIs(m.validate_checkout.__code__,m.review.validate_checkout.__code__)
        self.assertIs(m.ordinary.__code__,m.owned.ordinary.__code__)
        self.assertIs(m.companion.__code__,m.review.main.__code__)
        self.assertIs(m.ordinary.__globals__['install'],m.owned.install)
        self.assertIs(m.ordinary.__globals__['load'],m.owned.load)
        self.assertIs(m.companion.__globals__['configure_guard'],m.review.configure_guard)
        self.assertIs(m.companion.__globals__['select'],m.review.select)
        self.assertEqual(m.review.PARENT,'f20bf5b3e893371b9a23d21136f82c41e75cee42')
        self.assertEqual(m.owned.PARENT,'dc55552585b0d2b29904c8e1610076d9b20d024d')
        self.assertEqual(m.PARENT,'0d1558a3b799e8c3a3c89a6dd5623847e0887c78')
        self.assertEqual(m.PARENT_TREE,'4087deb43aade258b6814d7e580875238ff5c010')
        self.assertEqual(m.PRODUCT_TREE,'8da3084dd86a8345d01dd04ac248e188eca1cc12')
        self.assertEqual(len(m.PATHS),13)
        for args,wanted in [(['entry.py'],'ordinary'),(['entry.py','admit'],'companion'),(['entry.py','review-build'],'companion'),(['entry.py','visual'],'companion')]:
            calls=[]
            with patch.object(sys,'argv',args),patch.object(m,'ordinary',side_effect=lambda:calls.append('ordinary') or 7),patch.object(m,'companion',side_effect=lambda:calls.append('companion') or 7):self.assertEqual(m.main(),7)
            self.assertEqual(calls,[wanted])
        for phase,cap in [('review-build',4*1024**3),('visual',6*1024**3)]:
            g=types.SimpleNamespace(RSS_CAP=4*1024**3,WALL_SECONDS=720,LOG_CAP=32*1024**2,SAMPLE_SECONDS=.1,MARGIN=256*1024**2,ADMISSION_INTERVAL=1.,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16')
            m.review.configure_guard(g,phase)
            self.assertEqual((g.RSS_CAP,g.WALL_SECONDS,g.LOG_CAP,g.SAMPLE_SECONDS,g.MARGIN,g.ADMISSION_INTERVAL,g.HEAP_FLAGS),(cap,720,32*1024**2,.1,256*1024**2,1.,'--max-old-space-size=2048 --max-semi-space-size=16'))
        for bad in ('host','deploy','npm',''):
            with self.assertRaises(ValueError):m.review.select(bad)

    def checkout(self,change=None):
        m=load();env,event=event_pair(m);base=b'old-reviewed-source';digest=hashlib.sha256(base).hexdigest()
        pins={'remoteParent':m.PARENT,'parentTree':m.PARENT_TREE,'productTree':m.PRODUCT_TREE,'candidatePaths':m.PATHS,'changes':[list(row) for row in m.CHANGES],'sourcePins':{'candidate.js':'pinned'},'parentPins':{'prior.js':digest}}
        outputs={('rev-parse','HEAD'):env['GITHUB_SHA'],('show','-s','--format=%P','HEAD'):m.PARENT,('rev-parse','HEAD^1^{tree}'):m.PARENT_TREE,('diff','--name-status','HEAD^1','HEAD'):'\n'.join(a+'\t'+p for a,p in m.CHANGES),('status','--porcelain=v1','--untracked-files=all'):'',('rev-parse','HEAD^{tree}'):'d'*40}
        if change=='parent':outputs[('show','-s','--format=%P','HEAD')]='ad02c9422dc8f2d12db267ecffe844eaeb3e83b1'
        if change=='tree':outputs[('rev-parse','HEAD^1^{tree}')]='e'*40
        if change=='paths':outputs[('diff','--name-status','HEAD^1','HEAD')]+='\nM\tunreviewed.js'
        if change=='dirty':outputs[('status','--porcelain=v1','--untracked-files=all')]='?? other'
        if change=='pins':pins['productTree']='e'*40
        if change=='source':pins['sourcePins']['candidate.js']='wrong'
        if change=='old-source':pins['parentPins']['prior.js']='wrong'
        calls=[]
        helper=types.SimpleNamespace(check_npm_environment=lambda e:calls.append('npm-env'),check_fixed_npm_file=lambda p:calls.append('npm-file'),check_project_config=lambda a,b:calls.append('npm-project'))
        def fake_path(path):
            content=event if str(path)=='event.json' else pins
            return types.SimpleNamespace(read_text=lambda:json.dumps(content),exists=lambda:False,is_symlink=lambda:False)
        def fake_sha(path):
            if str(path).endswith('r177_build_bound.py'):return m.review.GUARD_HASH
            if str(path).endswith('r262_exit_recheck.py'):return m.review.RECHECK_HASH
            return 'pinned'
        validate=m.private_function(m.validate_checkout,{'Path':fake_path,'git':lambda *args:outputs[args],'git_bytes':lambda *args:base,'sha':fake_sha})
        with patch.dict(sys.modules,{'r265_dafotang_runtime_bound':helper}),patch.dict(os.environ,env,clear=True):result=validate()
        self.assertEqual(calls,['npm-env','npm-file','npm-project']);return result,m

    def test_full_original_admission_code_accepts_only_new_pinned_successor(self):
        result,m=self.checkout();self.assertEqual(result['parent'],m.PARENT);self.assertEqual(result['tree'],'d'*40);self.assertNotEqual(result['tree'],m.PRODUCT_TREE);self.assertEqual(sorted(result['candidateFiles']),m.PATHS)
        for change in ('parent','tree','paths','dirty','pins','source','old-source'):
            with self.subTest(change=change),self.assertRaises(ValueError):self.checkout(change)


if __name__=='__main__':unittest.main()
