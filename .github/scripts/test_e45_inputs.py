"""Tiny byte identity/parser fixtures only. No font, npm, native or git run."""
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import json
import sys
import r181_e45_inputs as i

class InputFixtures(unittest.TestCase):
 def setUp(self):self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
 def tearDown(self):self.temp.cleanup()
 def test_file_bytes_and_mutation(self):
  p=self.root/'x';p.write_bytes(b'abc');pin=i.file_pin(p)
  self.assertEqual(pin['bytes'],3);self.assertEqual(pin['sha256'],'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  p.write_bytes(b'xyz');self.assertNotEqual(i.file_pin(p),pin)
 def test_readonly_input_can_have_legitimate_hardlink(self):
  p=self.root/'x';p.write_bytes(b'abc');os.link(p,self.root/'y')
  self.assertEqual(i.file_pin(p)['sha256'],i.file_pin(self.root/'y')['sha256'])
 def test_expected_pin_not_self_approval(self):
  (self.root/'x').write_bytes(b'abc')
  with self.assertRaises(i.engine.BindingError):i.verify_pinset(self.root,{'x':'a'*64},lambda _:True)
 def test_reject_escape_symlink_and_unapproved_path(self):
  (self.root/'x').write_bytes(b'abc');(self.root/'y').symlink_to('x')
  for name in ['../x','/tmp/x','y']:
   with self.subTest(name=name),self.assertRaises(i.engine.BindingError):i.verify_pinset(self.root,{name:'a'*64},lambda _:True)
  with self.assertRaises(i.engine.BindingError):i.verify_pinset(self.root,{'x':'a'*64},lambda _:False)
 def test_complete_file_set_detects_unknown_file(self):
  folder=self.root/'src';folder.mkdir();(folder/'x').write_bytes(b'x')
  self.assertEqual(i.file_set(self.root,['src']),{'src/x'})
  (folder/'y').write_bytes(b'y');self.assertEqual(i.file_set(self.root,['src']),{'src/x','src/y'})
 def test_complete_file_set_rejects_symlink(self):
  folder=self.root/'src';folder.mkdir();(folder/'x').symlink_to('/tmp')
  with self.assertRaises(i.engine.BindingError):i.file_set(self.root,['src'])
 def test_ldd_exact_resolved_paths_and_missing_fail(self):
  raw=b'\tlinux-vdso.so.1 (0x00001234)\n\tlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00001234)\n\t/lib64/ld-linux-x86-64.so.2 (0x00001234)\n'
  self.assertEqual(i.parse_libraries(raw),['/lib/x86_64-linux-gnu/libc.so.6','/lib64/ld-linux-x86-64.so.2'])
  for raw in [b'libmissing.so => not found\n',b'mystery entry\n',b'']:
   with self.subTest(raw=raw),self.assertRaises(i.engine.BindingError):i.parse_libraries(raw)
 def test_input_precheck_failure_keeps_one_charged_terminal(self):
  evidence=self.root/'evidence';evidence.mkdir()
  with patch.object(i,'build_input',side_effect=i.engine.BindingError('synthetic missing pinned font')):
   with self.assertRaises(i.engine.BindingError):i.candidate_context(self.root,Path(sys.executable).resolve(),evidence)
  result=json.loads((evidence/'terminal.json').read_text())
  self.assertEqual(result['status'],'PRECHECK_REJECTED');self.assertIsNone(result['child_pid'])
  self.assertLess((evidence/'terminal.json').stat().st_size,65536)
 def runtime_receipt(self,mode):
  (self.root/'src').mkdir(exist_ok=True)
  p=self.root/'src/x.js';p.write_bytes(b'// tiny fixture\n');p.chmod(mode)
  for name in i.PACKAGES:(self.root/name).mkdir(parents=True,exist_ok=True)
  pin=self.root/i.PIN_FILE;pin.parent.mkdir(parents=True,exist_ok=True);pin.write_bytes(b'{}\n')
  receipt={'runtimeScope':['src'],'runtime':[{**i.file_pin(p),'path':'src/x.js','mode':'100755' if mode&0o111 else '100644'}],
           'sources':[],'dependencies':[],'tools':[],'fonts':[],'approvedPinsSha256':i.file_pin(pin)['sha256']}
  return p,receipt
 def test_runtime_unchanged_git_modes_are_accepted(self):
  for mode in (0o644,0o755):
   with self.subTest(mode=mode):
    _,receipt=self.runtime_receipt(mode);i.verify_input_bytes(self.root,receipt)
 def test_runtime_mode_only_100644_to_100755_is_rejected(self):
  p,receipt=self.runtime_receipt(0o644);i.verify_input_bytes(self.root,receipt);p.chmod(0o755)
  self.assertEqual(i.file_pin(p)['sha256'],receipt['runtime'][0]['sha256'])
  with self.assertRaises(i.engine.BindingError):i.verify_input_bytes(self.root,receipt)
 def test_runtime_mode_only_100755_to_100644_is_rejected(self):
  p,receipt=self.runtime_receipt(0o755);i.verify_input_bytes(self.root,receipt);p.chmod(0o644)
  self.assertEqual(i.file_pin(p)['sha256'],receipt['runtime'][0]['sha256'])
  with self.assertRaises(i.engine.BindingError):i.verify_input_bytes(self.root,receipt)
 def test_fonts_are_full_fixed_official_files(self):
  self.assertEqual(len(i.FONTS),4);self.assertTrue(all(row[0].endswith('.ttc') for row in i.FONTS))
  self.assertEqual(len({row[1] for row in i.FONTS}),4)
  self.assertNotIn('HOME',i.CONTROL_ENV);self.assertNotIn('LD_PRELOAD',i.CONTROL_ENV)
if __name__=='__main__':unittest.main(verbosity=2)
