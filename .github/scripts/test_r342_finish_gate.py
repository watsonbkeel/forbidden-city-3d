import unittest
import r342_finish_gate as w
class Contract(unittest.TestCase):
 def test_fixed_cpu_suites_no_browser_or_gate(self):
  self.assertEqual(w.selected('zones'),['npm','run','test:zones']);self.assertEqual(w.selected('anchors'),['npm','run','test:anchors'])
 def test_fixed_world(self):self.assertEqual(w.selected('world'),['node','tests/r339-material-contract/world-entry.mjs'])
 def test_realworld_and_routes_are_fixed_cpu_only(self):
  self.assertEqual(w.selected('realworld'),['node','tests/r341-real-world/world-entry.mjs']);self.assertEqual(w.selected('routes'),['node','tests/stepwalk-auto.cjs','--check'])
 def test_outerwest_fixed_actual_entry(self):self.assertEqual(w.selected('outerwest'),['node','tests/r342-real-finish/outer-west.mjs'])
 def test_unknown_rejected(self):
  for p in ('build','visual','','gate','gate --skip'):
   with self.assertRaises(ValueError):w.selected(p)
 def test_overrides_rejected(self):
  w.validate_environment({})
  for k in ('DUMP','ZONES_DIR','PROFILE','GATE_SKIP','NODE_OPTIONS','NODE_PATH','TEST_GC','BUILD_DIR','PORT','R48_REAL_TEXTURE_LIBRARY','R262_DISABLE_EXIT_RECHECK','PERF_BASELINE','PERF_FPS_STRICT'):
   with self.assertRaises(ValueError):w.validate_environment({k:'x'})
 def test_success_requires_identity_and_cleanup(self):
  i={'head':'a'*40,'tree':'b'*40};r={'identity':i,'status':'PASS','exit_code':0,'child_exit_code':0,'cleanup_complete':True};self.assertEqual(w.validate_terminal(r,i),0)
  for field,value in [('identity',{}),('status','FAIL'),('child_exit_code',1),('cleanup_complete',False)]:
   with self.assertRaises(ValueError):w.validate_terminal({**r,field:value},i)
 def test_failure_not_accepted(self):
  i={'head':'a'*40};self.assertEqual(w.validate_terminal({'identity':i,'status':'FAIL','exit_code':1,'child_exit_code':1,'cleanup_complete':True},i),1)
if __name__=='__main__':unittest.main(verbosity=2)
