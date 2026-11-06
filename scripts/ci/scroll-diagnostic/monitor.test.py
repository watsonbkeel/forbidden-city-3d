import ast, pathlib, unittest, stat
P=pathlib.Path(__file__).with_name('run-diagnostic.py')
class Contract(unittest.TestCase):
 def test_narrow_limits_exist_and_original_core_retained(self):
  new=P.read_text();old=P.parent.parent.joinpath('bilingual-ui/run-browser.py').read_text()
  def funcs(s):
   a=ast.parse(s);return {n.name:ast.dump(n,include_attributes=False) for n in a.body if isinstance(n,ast.FunctionDef)}
  n,o=funcs(new),funcs(old)
  for k in ['proc_stat','members','checked_signal','signal_owned','capture_process_roles']:self.assertEqual(n[k],o[k],k)
  self.assertIn('diagnostic_evidence_limits',n);self.assertIn('64 * 1024 - log.tell()',new)
  self.assertIn('TIMEOUT = 240',new);self.assertIn('RSS_THRESHOLD = POLICY',new)
 def test_bounded_diagnostic_files(self):
  ns={"stat":stat};tree=ast.parse(P.read_text());node=next((n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='diagnostic_evidence_limits'),None)
  self.assertIsNotNone(node)
  exec(compile(ast.Module(body=[node],type_ignores=[]),str(P),'exec'),ns)
  import tempfile,os
  with tempfile.TemporaryDirectory() as d:
   root=pathlib.Path(d);(root/'evidence').mkdir();p=root/'evidence/RESULT.json';p.write_text('{}')
   self.assertEqual(ns['diagnostic_evidence_limits'](root),None)
   p.write_bytes(b'x'*(512*1024+1));self.assertIn('record',ns['diagnostic_evidence_limits'](root));p.unlink()
   p.symlink_to('/does/not/exist');self.assertIn('non-regular',ns['diagnostic_evidence_limits'](root));p.unlink()
   (root/'evidence/unexpected').write_text('x');self.assertIn('unknown',ns['diagnostic_evidence_limits'](root))
if __name__=='__main__':unittest.main()
