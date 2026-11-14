import ast,json,unittest,types
from pathlib import Path
D=Path(__file__).resolve().parent; R=D.parents[1]
class Wrapper(unittest.TestCase):
 def test_fixed_identity(self):
  for p in [D/'admit.py',D/'gate.py',R/'.github/workflows/central-reference-export.yml']:
   self.assertIn('1851caeecc334fe2a811d78e29b7dfbec87138ed',p.read_text())
 def test_original_budget_rejects_changed_inputs(self):
  tree=ast.parse((D/'gate.py').read_text());f=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='configure')
  def require(ok,msg):
   if not ok:raise ValueError(msg)
  ns={'require':require};exec(compile(ast.Module(body=[f],type_ignores=[]),'<configure>','exec'),ns)
  g=types.SimpleNamespace(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');ns['configure'](g);self.assertEqual(g.RSS_CAP,6442450944)
  with self.assertRaises(ValueError):ns['configure'](g)
 def test_single_guard_and_receipt(self):
  s=(D/'gate.py').read_text();self.assertEqual(s.count('guard.supervise('),1);self.assertIn('/tmp/central-reference-export/worker.mjs',s);self.assertIn("get('complete') is True",s)
  for helper in ['r327_bound_exit_guard','r262_exit_recheck','r267_owned_rss_observation']:self.assertIn(helper,s)
 def test_frozen_inputs(self):
  p=json.loads((D/'source-pins.json').read_text());self.assertEqual(len(p),15)
  self.assertIn('public/textures/dafotang-original/shakyamuni-refined-v2.png',p);self.assertIn('src/scene/palace/special/CentralBuddhaVolumeStudy.js',p)
 def test_no_browser_no_deploy_no_override(self):
  s=(R/'.github/workflows/central-reference-export.yml').read_text();self.assertNotIn('playwright',s);self.assertIn('contents: read',s);self.assertIn('github.run_attempt == 1',s);self.assertNotIn('workflow_dispatch',s)
  self.assertIn('dirty checkout',(D/'gate.py').read_text());self.assertIn('non-diagnostic changes',(D/'admit.py').read_text())
 def test_python_syntax(self):
  for p in D.glob('*.py'):ast.parse(p.read_text())
if __name__=='__main__':unittest.main()
