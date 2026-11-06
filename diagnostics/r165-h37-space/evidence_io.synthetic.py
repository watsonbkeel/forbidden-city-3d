import unittest,tempfile,json,os
from pathlib import Path
from unittest.mock import patch
from evidence_io import guard_write,write_json
class Evidence(unittest.TestCase):
 def test_exact_quota_and_projected_reserve(self):
  with tempfile.TemporaryDirectory()as d,patch('evidence_io.disk_available',return_value=120):
   p=Path(d);(p/'old').write_bytes(b'12345');guard_write(p,5,quota=10,reserve=115)
   for extra,quota,reserve in [(6,10,0),(6,100,115)]:
    with self.assertRaises(ValueError):guard_write(p,extra,quota=quota,reserve=reserve)
 def test_write_checks_after_atomic_replace(self):
  with tempfile.TemporaryDirectory()as d,patch('evidence_io.disk_available',return_value=4*1024**3):
   p=Path(d);write_json(p,'x.json',{'ok':True});self.assertEqual(json.loads((p/'x.json').read_text()),{'ok':True});self.assertFalse((p/'x.json.tmp').exists())
 def test_partial_write_preserves_previous(self):
  with tempfile.TemporaryDirectory()as d,patch('evidence_io.disk_available',return_value=4*1024**3):
   p=Path(d);(p/'x.json').write_text('original');(p/'x.json.tmp').write_text('partial')
   with self.assertRaises(FileExistsError):write_json(p,'x.json',{'ok':True})
   self.assertEqual((p/'x.json').read_text(),'original')
if __name__=='__main__':unittest.main()
