import unittest,sys,pathlib,json,copy
R=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(R/'scripts/photo-fidelity'))
from queue_storage import load_queue
from queue_invariants import validate_progress
class Scope(unittest.TestCase):
 def test_original_scope_not_shrunk(self):
  q=load_queue();self.assertEqual(sum(i['id'].startswith('FC-') for i in q['items']),398);self.assertEqual(sum(i['id'].startswith('AUX-') for i in q['items']),154);self.assertEqual(len(q['expansionTasks']),7);c=[i for i in q['items'] if i['section']=='C' and i['id'].startswith('FC-')];self.assertEqual(len(c),17);features=[a for i in c for f in i['facets'].values() for a in f.get('features',[])];self.assertEqual(len(features),226);self.assertTrue(all(a['status'] not in ['UNREVIEWED','ACCEPTED'] for a in features));self.assertTrue(validate_progress(q))
 def test_migrations_preserve_identity_and_no_new_runtime(self):
  q=load_queue();ix={i['id']:i for i in q['items']};m=json.loads((R/'docs/photo-fidelity/C-REVIEW/DECLARATION-OWNER-CORRECTIONS.json').read_text());self.assertEqual(len(m['corrections']),12)
  for r in m['corrections']:self.assertEqual(ix[r['id']]['section'],r['to']);self.assertFalse(r['runtimeChanged']);self.assertIn(r['id'],ix[r['parent']]['requiredChildIds'])
  self.assertEqual(len([i for i in q['items'] if i['section']=='C' and i['id'].startswith('AUX-')]),7)
 def test_no_duplicate_buildings_or_historical_room_fabrication(self):
  q=load_queue();ix={i['id']:i for i in q['items']}
  for a,b in [('FC-BFF7B3D78C','AUX-66CAF65E3790'),('FC-E1A3C58BBB','AUX-6928C407343E')]:self.assertEqual(ix[a]['runtimeBindings'],ix[b]['runtimeBindings']);self.assertEqual(ix[b]['boundPhysicalParent'],a)
  self.assertEqual(ix['FC-07BD73D61B']['runtimeInstanceKey'],'duanhong');self.assertFalse(ix['FC-C62B05256F']['runtimeBindings']);self.assertFalse(ix['FC-9DABF33837']['runtimeBindings']);self.assertEqual(ix['FC-0D56E9417C']['facets']['interior']['status'],'NOT_APPLICABLE')
 def test_uncertain_children_and_browser_gate_not_bypassed(self):
  q=load_queue();i=next(i for i in q['items'] if i['id']=='FC-786C150547');i['facets']['interior']['status']='ACCEPTED';i['facets']['interior']['visualEvidence']={k:None for k in ['before','after','referenceComparison','browserRun']}
  with self.assertRaises(ValueError):validate_progress(q)
 def test_source_images_private_and_mislabel_correction_preserved(self):
  s=json.loads((R/'docs/photo-fidelity/C-REVIEW/SOURCES-VIEWED.json').read_text());self.assertGreaterEqual(len(s['sources']),16);self.assertTrue(all(x['redistributed'] is False for x in s['sources']));self.assertTrue(all(x.get('photographyDate') is None for x in s['sources']));res=json.loads((R/'docs/photo-fidelity/RESIDUALS/R60-C-STAGE.json').read_text());self.assertEqual(res['scope']['accepted'],0);self.assertEqual(res['publicReferenceImageCopies'],0);self.assertGreaterEqual(len(res['clearKnownEngineeringResiduals']),6)
if __name__=='__main__':unittest.main()
