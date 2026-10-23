import unittest,sys,pathlib,importlib.util,json,shutil,tempfile,hashlib,gzip,copy
ROOT=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts/photo-fidelity'))
from queue_storage import load_queue
from queue_invariants import validate_progress
P=ROOT/'docs/photo-fidelity/B-REVIEW/required-feature-audit';spec=importlib.util.spec_from_file_location('audit_restore',P/'restore.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Scope(unittest.TestCase):
 def test_all_original_public_bytes(self):
  files=m.decode();self.assertEqual(len(files),6);j=json.loads(files['R59-B-REQUIRED-FEATURE-MATRIX.json']);self.assertEqual(len(j['objects']),41);self.assertEqual(sum(len(f['features']) for o in j['objects'] for f in o['facets'].values()),577)
 def test_corrupt_missing_unknown_rejected(self):
  for change in ['missing','corrupt','format','original']:
   with self.subTest(change=change),tempfile.TemporaryDirectory() as d:
    p=pathlib.Path(d)/'audit';shutil.copytree(P,p);index=json.loads((p/'STORAGE.json').read_text());e=next(e for e in index['files'] if e['encoding']=='gzip');f=p/e['stored']
    if change=='missing':f.unlink()
    if change=='corrupt':b=bytearray(f.read_bytes());b[20]^=1;f.write_bytes(b)
    if change=='format':index['format']='unknown'
    if change=='original':e['sha256']='0'*64
    (p/'STORAGE.json').write_text(json.dumps(index))
    with self.assertRaises((ValueError,OSError)):m.decode(p)
 def test_candidates_not_spawned_or_counted(self):
  q=load_queue();b=[o for o in q['items'] if o['section']=='B' and o['id'].startswith('FC-')];self.assertEqual(len(b),41);c=[c for o in b for c in o.get('requiredComponentCandidates',[])];self.assertEqual(len(c),4);self.assertTrue(all(c['runtimeBinding'] is None and c['modelCreated'] is False and c['position'] is None for c in c));self.assertTrue(validate_progress(q))
 def test_unresolved_child_blocks_parent_acceptance(self):
  q=load_queue();i=next(i for i in q['items'] if i['id']=='FC-40EB11CF20');f=i['facets']['exterior'];f['status']='ACCEPTED';f['visualEvidence']={k:'test' for k in ['before','after','referenceComparison','browserRun']};i['acceptanceRecords']=[{'test':True}]
  for a in f['features']:a['status']='ACCEPTED'
  with self.assertRaisesRegex(ValueError,'required source component remains unresolved'):validate_progress(q)
 def test_photo_does_not_rebind_runtime(self):
  q=load_queue();i=next(i for i in q['items'] if i['id']=='FC-B875FF665E');self.assertEqual(i['runtimeBindings'],[]);self.assertEqual(i['sourceScopeCorrection']['subject'],'南三所中所中殿');self.assertTrue(i['sourceScopeCorrection']['runtimeBindingUnchanged'])
if __name__=='__main__':unittest.main()
