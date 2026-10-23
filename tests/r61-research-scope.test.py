import unittest,sys,pathlib,json
R=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(R/'scripts/photo-fidelity'))
from queue_storage import load_queue
from queue_invariants import validate_progress
class Scope(unittest.TestCase):
 def test_scope_is_complete_without_acceptance(self):
  q=load_queue();self.assertEqual(sum(i['id'].startswith('FC-') for i in q['items']),398);self.assertEqual(sum(i['id'].startswith('AUX-') for i in q['items']),154);self.assertEqual(len(q['expansionTasks']),7);d=[i for i in q['items'] if i['section']=='D' and i['id'].startswith('FC-')];self.assertEqual(len(d),32);features=[a for i in d for f in i['facets'].values() for a in f.get('features',[])];self.assertEqual(len(features),440);self.assertTrue(all(a['status'] not in ['UNREVIEWED','ACCEPTED'] for a in features));self.assertTrue(validate_progress(q))
 def test_physical_declaration_migration_retains_ids(self):
  q=load_queue();a=[i for i in q['items'] if i['section']=='D' and i['id'].startswith('AUX-')];self.assertEqual(len(a),17);m=[i for i in a if any(r.get('fromSection')=='G' for r in i.get('migrationHistory',[]))];self.assertEqual(len(m),12);self.assertTrue(all(i['currentCycleDeclarationReview']['physicalIdentityAccepted'] is False for i in m))
 def test_missing_named_buildings_are_not_conflated(self):
  q=load_queue();ix={i['name']:i for i in q['items'] if i['id'].startswith('FC-')}
  for n in ['昭仁殿','弘德殿','东暖殿','西暖殿','军机处','上书房','南书房']:self.assertFalse(ix[n]['runtimeBindings'],n)
  self.assertEqual(ix['坤宁宫东暖阁']['facets']['exterior']['status'],'NOT_APPLICABLE');self.assertNotEqual(ix['坤宁宫东暖阁']['id'],ix['东暖殿']['id'])
 def test_browser_requirement_not_bypassed(self):
  q=load_queue();i=next(i for i in q['items'] if i['name']=='交泰殿');i['facets']['exterior']['status']='ACCEPTED';i['facets']['exterior']['visualEvidence']={k:None for k in ['before','after','referenceComparison','browserRun']}
  with self.assertRaises(ValueError):validate_progress(q)
 def test_sources_are_local_only_and_known_engineering_residuals_preserved(self):
  s=json.loads((R/'docs/photo-fidelity/D-REVIEW/SOURCES-VIEWED.json').read_text());rows=next(v for v in s.values() if isinstance(v,list));self.assertGreaterEqual(len(rows),17);self.assertTrue(any(r.get('key')=='shangshufang-paper-figure6' and r['actuallyViewed'] for r in rows));res=json.loads((R/'docs/photo-fidelity/RESIDUALS/R61-D-STAGE.json').read_text());self.assertEqual(res['publicReferenceImageCopies'],0);self.assertEqual(res['scope']['accepted'],0);self.assertGreaterEqual(len(res['clearKnownEngineeringResiduals']),6)
if __name__=='__main__':unittest.main()
