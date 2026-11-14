import importlib.util,unittest
from types import SimpleNamespace
from pathlib import Path
p=str(Path(__file__).with_name('gate.py'));s=importlib.util.spec_from_file_location('gate',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Limits(unittest.TestCase):
 def test_exact(self):
  g=SimpleNamespace(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');m.configure(g);self.assertEqual((g.RSS_CAP,g.WALL_SECONDS),(6442450944,720))
 def test_mutation_refused(self):
  for k,v in [('RSS_CAP',6442450944),('WALL_SECONDS',721),('HEAP_FLAGS','')]:
   g=SimpleNamespace(RSS_CAP=4294967296,WALL_SECONDS=720,HEAP_FLAGS='--max-old-space-size=2048 --max-semi-space-size=16');setattr(g,k,v)
   with self.assertRaises(ValueError):m.configure(g)
if __name__=='__main__':unittest.main()
