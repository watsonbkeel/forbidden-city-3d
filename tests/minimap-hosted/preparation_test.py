import unittest,json,hashlib,ast
from pathlib import Path
D=Path(__file__).resolve().parent;ROOT=D.parents[1]
class Preparation(unittest.TestCase):
 def test_manifest_bytes(self):
  m=json.loads((D/'manifest.json').read_text())
  self.assertEqual(m['productTree'],'322d9d8b3e1b5e7123b1ad5c8f34aeb0285b6fd3')
  for p,h in m['files'].items():self.assertEqual(hashlib.sha256((ROOT/p).read_bytes()).hexdigest(),h,p)
 def test_one_guard_two_phases(self):
  entry=(D/'entry.mjs').read_text();self.assertLess(entry.index("import('/tmp/minimap-zone-export/export.mjs')"),entry.index("import('/tmp/minimap-browser-diagnostic/capture.mjs')"))
  gate=(D/'export/gate.py').read_text();self.assertEqual(gate.count('guard.supervise('),1);self.assertIn("'/tmp/minimap-hosted-entry.mjs'",gate);self.assertIn('diagnosticRuntimePins',gate)
 def test_no_font_child_in_capture(self):
  s=(D/'browser/capture.mjs').read_text();self.assertNotIn('execFileSync',s);self.assertIn('missing hosted font inventory',s)
 def test_python_syntax(self):
  for p in D.rglob('*.py'):ast.parse(p.read_text())
if __name__=='__main__':unittest.main()
