import unittest,json,hashlib,ast
from pathlib import Path
from types import SimpleNamespace
D=Path(__file__).resolve().parent; ROOT=D.parents[1]
class Preparation(unittest.TestCase):
 def test_manifest_bytes(self):
  m=json.loads((D/'manifest.json').read_text());self.assertEqual(m['productHead'],'8de5c83d25a669a014575a1489429f064a464496');self.assertEqual(m['productTree'],'153738dc0673a1e4876a75a9e74d837eb21a9724')
  for p,h in m['files'].items():self.assertEqual(hashlib.sha256((ROOT/p).read_bytes()).hexdigest(),h,p)
 def test_exact_resource_budget(self):
  tree=ast.parse((D/'gate.py').read_text());node=next(n for n in tree.body if isinstance(n,ast.FunctionDef)and n.name=='configure');ns={'require':lambda b,s: None if b else (_ for _ in ()).throw(ValueError(s))};exec(compile(ast.fix_missing_locations(ast.Module(body=[node],type_ignores=[])),'configure','exec'),ns)
  base=dict(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');g=SimpleNamespace(**base);ns['configure'](g);self.assertEqual((g.RSS_CAP,g.WALL_SECONDS,g.HEAP_FLAGS),(6442450944,720,base['HEAP_FLAGS']))
  for k,v in [('RSS_CAP',6442450944),('WALL_SECONDS',721),('HEAP_FLAGS','')]:
   with self.assertRaises(ValueError):ns['configure'](SimpleNamespace(**(base|{k:v})))
 def test_fixed_guard_chain(self):
  s=(D/'gate.py').read_text();self.assertEqual(s.count('guard.supervise('),1)
  for token in ['r327_bound_exit_guard','r262_exit_recheck','r267_owned_rss_observation','validate_terminal(result,identity)','diagnosticRuntimePins','dirty checkout','export-attempt.json']:self.assertIn(token,s)
 def test_admission_clean_scope(self):
  s=(D/'admit.py').read_text()
  for token in ['non-diagnostic changes','diagnostic parent mismatch','product tree mismatch','dirty product checkout','runtime path already exists','source mismatch']:self.assertIn(token,s)
 def test_one_shot_workflow(self):
  s=(ROOT/'.github/workflows/time-flight-escape-diagnostic.yml').read_text()
  for token in ['dev/time-flight-escape-diagnostic','github.event.created == true','github.run_attempt == 1','github.run_number == 1','contents: read','persist-credentials: false','if: always()']:self.assertIn(token,s)
  self.assertNotIn('workflow_dispatch:',s);self.assertNotIn('pull_request:',s)
 def test_capture_contract(self):
  s=(D/'entry.mjs').read_text();self.assertIn('captureComplete',s);self.assertIn('result.json',s);self.assertIn('cases.length,2',s);self.assertIn('errors.length,0',s)
 def test_external_browser_serving(self):
  s=(D/'browser/capture.mjs').read_text()
  for token in ['find:/^three$/','fs:{allow:[repo,here]}',"('/@fs'+path.join(here,'index.html'))",'chromiumSandbox:true']:self.assertIn(token,s)
  self.assertNotIn('alias:{three:',s)
 def test_python_syntax(self):
  for p in D.rglob('*.py'):ast.parse(p.read_text())
if __name__=='__main__':unittest.main()
