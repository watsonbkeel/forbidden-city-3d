import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path('.github/scripts').resolve()))
import side_crossleg_gate as gate
from types import SimpleNamespace
class GateTests(unittest.TestCase):
 def test_exact_command(self):self.assertEqual(gate.selected('visual'),['node','tests/side-crossleg/capture.mjs'])
 def test_other_commands_rejected(self):
  for v in ['review-build','build','', 'visual --ignore']:
   with self.assertRaises(ValueError):gate.selected(v)
 def test_original_guard_budget_and_limit(self):
  g=SimpleNamespace(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');gate.configure(g,'visual');self.assertEqual(g.RSS_CAP,6442450944);self.assertEqual(g.WALL_SECONDS,720)
 def test_modified_guard_rejected(self):
  g=SimpleNamespace(RSS_CAP=6442450944,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16')
  with self.assertRaises(ValueError):gate.configure(g,'visual')
unittest.main()
