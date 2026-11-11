import importlib.util
import pathlib
import types
import unittest

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

if __name__=='__main__':unittest.main()
