import unittest
from types import SimpleNamespace
import r364_delivery_gate as w
class Contract(unittest.TestCase):
 def test_fixed_commands(self):
  self.assertEqual(w.selected('review-build'),['node','tests/r275-buddha-triad-review/build-review.mjs'])
  for arm in ('stream','buffer'):self.assertEqual(w.selected('visual-'+arm),['node','tests/r364-asset-delivery/capture-arm.mjs',arm])
 def test_unknown_phase(self):
  for phase in ('visual','visual-skip','','visual-buffer --skip'):
   with self.assertRaises(ValueError):w.selected(phase)
 def test_original_per_arm_budget(self):
  for phase,cap in [('review-build',4294967296),('visual-stream',6442450944),('visual-buffer',6442450944)]:
   g=SimpleNamespace(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');w.configure(g,phase);self.assertEqual((g.RSS_CAP,g.WALL_SECONDS,g.HEAP_FLAGS),(cap,720,'--max-old-space-size=2048 --max-semi-space-size=16'))
 def test_altered_original_guard_rejected(self):
  for rss,wall in ((6442450944,720),(4294967296,721)):
   with self.assertRaises(ValueError):w.configure(SimpleNamespace(RSS_CAP=rss,WALL_SECONDS=wall,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16'),'visual-stream')
 def terminal(self):return {'identity':{'head':'a'*40},'status':'FAIL','reason':'CHILD_EXIT_NONZERO','exit_code':1,'child_pid':777,'child_exit_code':1,'cleanup_complete':True,'owned_processes_observed':7,'sample_count':20,'command':['node','tests/r364-asset-delivery/capture-arm.mjs','stream'],'limits':{'rss_bytes':6442450944,'wall_seconds':720,'old_space_mib':2048,'semi_space_mib':16}}
 def test_cleanup_gate_preserves_failed_status(self):
  r=self.terminal();out=w.cleanup_gate(r,r['identity'],'stream');self.assertEqual(out['originalStatus'],'FAIL');self.assertEqual(out['safeForIndependentRunner'],True);self.assertEqual(r['status'],'FAIL')
 def test_missing_exit_or_cleanup_rejected(self):
  for k,v in [('cleanup_complete',False),('child_pid',None),('child_exit_code',None),('owned_processes_observed',0),('sample_count',0),('status','RUNNING')]:
   r=self.terminal();r[k]=v
   with self.assertRaises(ValueError):w.cleanup_gate(r,{'head':'a'*40},'stream')
 def test_wrong_identity_or_command_rejected(self):
  r=self.terminal()
  with self.assertRaises(ValueError):w.cleanup_gate(r,{'head':'b'*40},'stream')
  with self.assertRaises(ValueError):w.cleanup_gate(r,r['identity'],'buffer')
 def test_limit_or_cleanup_error_rejected(self):
  r=self.terminal();r['limits']['wall_seconds']=721
  with self.assertRaises(ValueError):w.cleanup_gate(r,r['identity'],'stream')
  r=self.terminal();r['cleanup_error']='unknown'
  with self.assertRaises(ValueError):w.cleanup_gate(r,r['identity'],'stream')
class OutputContract(unittest.TestCase):
 def test_actual_github_output_uses_newline(self):
  import tempfile
  from pathlib import Path
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'output';p.write_bytes(b'');w.write_next_runner_output(p)
   self.assertEqual(p.read_bytes(),b'safe_for_independent_runner=true\n')
 def test_existing_output_is_preserved(self):
  import tempfile
  from pathlib import Path
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'output';p.write_bytes(b'old=yes\n');w.write_next_runner_output(p)
   self.assertEqual(p.read_text().splitlines(),['old=yes','safe_for_independent_runner=true'])
if __name__=='__main__':unittest.main(verbosity=2)
