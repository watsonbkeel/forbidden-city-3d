"""Small adapter tests only, never execute admission or a browser."""
import importlib.util,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path.cwd()/'.github/scripts'))
p=Path(__file__).with_name('r274_cangzhen_finite_review.py');s=importlib.util.spec_from_file_location('candidate_e54',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Adapter(unittest.TestCase):
 def test_fixed_commands(self):
  self.assertEqual(m.select('visual'),['node','tests/r274-cangzhen-finite-review/capture.mjs'])
  with self.assertRaises(ValueError):m.select('deploy')
 def test_original_resource_guard_preserved(self):
  p=Path.cwd()/'.github/scripts/r177_build_bound.py';s=importlib.util.spec_from_file_location('independent_guard',p);g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
  m.configure_guard(g,'visual');self.assertEqual((g.RSS_CAP,g.WALL_SECONDS,g.SAMPLE_SECONDS,g.MARGIN),(6*1024**3,720,.1,256*1024**2))
 def test_exact_product_delta(self):
  self.assertEqual(len(m.PRODUCT_PATHS),14);self.assertEqual(len(m.PATHS),24);self.assertEqual(len(set(m.PATHS)),24)
  self.assertEqual(m.PARENT,'2bad49c562372ead431c022cc74ac1c4d6720ebe');self.assertEqual(m.PARENT_TREE,'d8cdbdadce5c8a559d13d7ed9cc8b36f41b9f2d1')
if __name__=='__main__':unittest.main()
