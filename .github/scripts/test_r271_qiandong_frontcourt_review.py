"""Pure admission controls only: no guard, process, browser or build fixtures."""
import unittest
import r271_qiandong_frontcourt_review as r
class Admission(unittest.TestCase):
 def test_fixed_phase(self):
  self.assertEqual(r.select('visual'),['node',r.ROOT+'capture.mjs'])
  for phase in ('deploy','publish','../capture','World'):self.assertRaises(ValueError,r.select,phase)
 def test_exact_event(self):
  env=dict(CI='true',GITHUB_ACTIONS='true',GITHUB_REPOSITORY='watsonbkeel/forbidden-city-3d',GITHUB_REF=r.REF,GITHUB_EVENT_NAME='push',GITHUB_RUN_NUMBER='1',GITHUB_RUN_ATTEMPT='1',REVIEW_RUNNER_ENVIRONMENT='github-hosted',RUNNER_OS='Linux',RUNNER_ARCH='X64',GITHUB_SHA='a'*40)
  e=dict(created=True,deleted=False,forced=False,before='0'*40,after='a'*40,ref=r.REF,repository={'full_name':env['GITHUB_REPOSITORY']})
  r.validate_event(env,e)
  for key,value in [('GITHUB_RUN_ATTEMPT','2'),('GITHUB_RUN_NUMBER','2'),('NODE_OPTIONS','x'),('R271_OVERRIDE','1'),('R270_OVERRIDE','1')]:self.assertRaises(ValueError,r.validate_event,{**env,key:value},e)
  for key,value in [('created',False),('forced',True),('before','a'*40)]:self.assertRaises(ValueError,r.validate_event,env,{**e,key:value})
 def test_policy(self):
  class G:RSS_CAP=4*1024**3;WALL_SECONDS=720;LOG_CAP=32*1024**2;SAMPLE_SECONDS=.1;MARGIN=256*1024**2;ADMISSION_INTERVAL=1.;HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16'
  r.configure_guard(G,'visual');self.assertEqual(G.RSS_CAP,6*1024**3)
if __name__=='__main__':unittest.main()
