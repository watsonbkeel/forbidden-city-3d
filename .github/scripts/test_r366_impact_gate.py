import unittest
from types import SimpleNamespace
import r366_impact_gate as w
class Contract(unittest.TestCase):
 def test_fixed_only(self):
  self.assertEqual(w.selected('review-build'),['node','tests/r275-buddha-triad-review/build-review.mjs'])
  self.assertEqual(w.selected('visual'),['node','tests/r366-functional-impact/capture.mjs'])
 def test_reject_other(self):
  for p in ('','build','world','visual --skip','routes'):
   with self.assertRaises(ValueError):w.selected(p)
 def test_budget_fixed(self):
  for phase,limit in [('review-build',4294967296),('visual',6442450944)]:
   g=SimpleNamespace(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');w.configure(g,phase);self.assertEqual((g.RSS_CAP,g.WALL_SECONDS,g.HEAP_FLAGS),(limit,720,'--max-old-space-size=2048 --max-semi-space-size=16'))
 def test_mutated_guard_rejected(self):
  for rss,wall,heap in [(6442450944,720,'--max-old-space-size=2048 --max-semi-space-size=16'),(4294967296,721,'--max-old-space-size=2048 --max-semi-space-size=16'),(4294967296,720,'--max-old-space-size=4096')]:
   with self.assertRaises(ValueError):w.configure(SimpleNamespace(RSS_CAP=rss,WALL_SECONDS=wall,HEAP_FLAGS=heap),'visual')
 def test_legacy_failure_never_pass(self):
  i={'head':'a'*40};self.assertEqual(w.validate_terminal({'identity':i,'status':'FAIL','exit_code':1,'child_exit_code':0,'cleanup_complete':True},i),1)
 def test_incomplete_success_rejected(self):
  i={'head':'a'*40};r={'identity':i,'status':'PASS','exit_code':0,'child_exit_code':0,'cleanup_complete':True};self.assertEqual(w.validate_terminal(r,i),0)
  for k,v in [('identity',{}),('status','FAIL'),('child_exit_code',1),('cleanup_complete',False)]:
   with self.assertRaises(ValueError):w.validate_terminal({**r,k:v},i)
if __name__=='__main__':unittest.main(verbosity=2)
