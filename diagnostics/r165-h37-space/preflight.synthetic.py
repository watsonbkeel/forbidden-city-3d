import unittest,tempfile,json,hashlib
from pathlib import Path
from preflight import validate_delta,verify_frozen,verify_admission,file_fingerprint,validate_native_environment,font_file
from approval_gate import canonical_receipt,git_blob_sha
class Preflight(unittest.TestCase):
 def test_exact_additions_only(self):
  names=['diagnostics/r165-h37-space/a.py','.github/workflows/h37.yml'];self.assertTrue(validate_delta([('A',x,'100644')for x in names],names))
  for rows in [[('M',names[0],'100644')],[('A','src/bad.js','100644')],[('A',x,'100755')for x in names],[('A',names[0],'100644')]]:
   with self.assertRaises(ValueError):validate_delta(rows,names)
 def test_frozen_missing_modified_extra(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d);(p/'a').write_bytes(b'x');manifest={'files':[{'path':'a','bytes':1,'sha256':hashlib.sha256(b'x').hexdigest()}]};self.assertTrue(verify_frozen(p,manifest));(p/'b').write_bytes(b'x')
   with self.assertRaises(ValueError):verify_frozen(p,manifest)
   (p/'b').unlink();(p/'a').write_bytes(b'y')
   with self.assertRaises(ValueError):verify_frozen(p,manifest)
 def test_missing_or_forged_admission_fails(self):
  for a in [{},{'accepted':True},{'accepted':False,'run':{}}]:
   with self.assertRaises(ValueError):verify_admission(a,{}, {},0)
 def test_exact_admission_and_strict_numeric_fields(self):
  c={'repository':'o/r','branch':'dev/one','workflow':'.github/workflows/one.yml','base':'b'*40,'base_tree':'c'*40,'release_blob_sha':'d'*40,'node_mib':768,'non_node_mib':256,'aggregate_seconds':180};e={'GITHUB_REPOSITORY':'o/r','GITHUB_REF':'refs/heads/dev/one','GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'17','GITHUB_RUN_NUMBER':'1','GITHUB_RUN_ATTEMPT':'1','GITHUB_EVENT_NAME':'push','DIAGNOSTIC_TREE':'e'*40,'FREEZE_SHA256':'f'*64};run={'id':17,'workflow_id':19,'created_at':'2026-11-05T21:00:00Z'}
  raw=canonical_receipt(run,e,c);a={'accepted':True,'run':json.loads(raw),'acceptedAtEpoch':1793912401,'releaseBlobSHA':c['release_blob_sha'],'receiptBlobSHA':git_blob_sha(raw),'receiptSHA256':hashlib.sha256(raw).hexdigest()};self.assertTrue(verify_admission(a,e,c,1793912402))
  for key in ['schema','run_id','workflow_id','run_number','run_attempt']:
   for v in [True,float(a['run'][key]),str(a['run'][key]),0,-1]:
    r={**a['run'],key:v};changed=(json.dumps(r,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode();fake={**a,'run':r,'receiptBlobSHA':git_blob_sha(changed),'receiptSHA256':hashlib.sha256(changed).hexdigest()}
    with self.subTest(key=key,value=v),self.assertRaises(ValueError):verify_admission(fake,e,c,1793912402)
 def test_streamed_fingerprint_matches_git_and_sha256(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d)/'data';b=b'abc'*500000;p.write_bytes(b);q=file_fingerprint(p);self.assertEqual(q['bytes'],len(b));self.assertEqual(q['sha256'],hashlib.sha256(b).hexdigest());self.assertEqual(q['blob'],git_blob_sha(b))
 def test_native_overrides_are_rejected(self):
  self.assertTrue(validate_native_environment({}))
  for key in ['NODE_OPTIONS','NODE_PATH','NAPI_RS_NATIVE_LIBRARY_PATH','NAPI_RS_FORCE_WASI','DISABLE_SYSTEM_FONTS_LOAD','FONTCONFIG_FILE','FONTCONFIG_PATH']:
   with self.assertRaises(ValueError):validate_native_environment({key:'override'})
 def test_font_symlink_records_both_identity_and_actual_bytes(self):
  with tempfile.TemporaryDirectory()as d:
   p=Path(d);(p/'font').write_bytes(b'font');(p/'config-link').symlink_to(p/'font');row=font_file(p/'config-link');self.assertEqual(row['resolved'],str(p/'font'));self.assertEqual(row['symlinkTarget'],str(p/'font'));self.assertEqual(row['sha256'],hashlib.sha256(b'font').hexdigest());(p/'font').unlink()
   with self.assertRaises((ValueError,FileNotFoundError)):font_file(p/'config-link')
if __name__=='__main__':unittest.main()
