"""Canonical research queue safeguards; no runtime world construction."""
import importlib.util,json,pathlib,unittest,copy,sys
ROOT=pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'scripts/photo-fidelity'))
spec=importlib.util.spec_from_file_location('fidelity_queue',ROOT/'scripts/photo-fidelity/queue.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class QueueTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.data=module.load_queue(ROOT/'docs/photo-fidelity/QUEUE.json')
 def test_count_semantics_are_computed_not_trusted(self):
  q=copy.deepcopy(self.data);q['summary']={'physicalBuildingCount':10000}
  s=module.summarize(q)
  self.assertEqual(s['originalObjects'],398);self.assertEqual(s['supplementaryAudits'],154)
  self.assertEqual(s['expansionTasks'],7);self.assertIsNone(s['physicalBuildingCount'])
  self.assertEqual(s['sections']['A']['originalObjects'],37)
 def test_duplicate_id_fails_closed(self):
  q=copy.deepcopy(self.data);q['items'].append(copy.deepcopy(q['items'][0]))
  with self.assertRaisesRegex(ValueError,'duplicate'):module.validate_progress(q)
 def test_no_evidence_is_not_accepted(self):
  q=copy.deepcopy(self.data);q['items'][0]['facets']['exterior']['status']='ACCEPTED'
  with self.assertRaisesRegex(ValueError,'browser'):module.validate_progress(q)
 def test_no_parent_can_hide_missing_child(self):
  q=copy.deepcopy(self.data);q['items'][0]['requiredChildIds']=['MISSING-CHILD']
  with self.assertRaisesRegex(ValueError,'child'):module.validate_progress(q)
 def test_dependency_cycles_fail_closed(self):
  q=copy.deepcopy(self.data);a,b=q['items'][:2]
  a['requiredChildIds']=[b['id']];b['requiredChildIds']=[a['id']]
  with self.assertRaisesRegex(ValueError,'cycle'):module.validate_progress(q)
 def test_two_review_instances_cannot_duplicate_the_same_runtime_object(self):
  q=copy.deepcopy(self.data);a,b=q['items'][:2]
  a['runtimeInstanceKey']=b['runtimeInstanceKey']='same-existing-bridge'
  with self.assertRaisesRegex(ValueError,'runtime instance'):module.validate_progress(q)
 def test_na_needs_a_reason(self):
  q=copy.deepcopy(self.data);q['items'][0]['facets']['interior']['status']='NOT_APPLICABLE'
  with self.assertRaisesRegex(ValueError,'reason'):module.validate_progress(q)
 def test_original_data_valid_and_actual_progress_reflected(self):
  q=copy.deepcopy(self.data);module.validate_progress(q)
  before=module.summarize(q)['facetStatuses']['exterior'].get('IMPLEMENTING',0)
  pending=next(x for x in q['items'] if x['facets']['exterior']['status']=='UNREVIEWED')
  pending['facets']['exterior']['status']='IMPLEMENTING'
  self.assertEqual(module.summarize(q)['facetStatuses']['exterior']['IMPLEMENTING'],before+1)

if __name__=='__main__':unittest.main()
