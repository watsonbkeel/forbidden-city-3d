import unittest,json
from pathlib import Path
D=Path(__file__).resolve().parent;R=D.parents[1]
HEAD='81506f2c075d2a04948f8497897d1ccb67087010';TREE='322d9d8b3e1b5e7123b1ad5c8f34aeb0285b6fd3'
class CompactReview(unittest.TestCase):
 def test_identity_bound_everywhere(self):
  for p in [D/'admit.py',D/'export/gate.py',D/'export/contract.mjs',R/'.github/workflows/minimap-compact-review-r379.yml']:self.assertIn(HEAD,p.read_text())
  m=json.loads((D/'manifest.json').read_text());self.assertEqual(m['productHead'],HEAD);self.assertEqual(m['productTree'],TREE)
  self.assertEqual(json.loads((D/'export/pins.json').read_text())['head'],HEAD)
 def test_real_notice_state_inspection_and_assertions(self):
  fixture=(D/'browser/fixture.mjs').read_text();entry=(D/'entry.mjs').read_text();self.assertIn("#minimap-moat-status",fixture)
  for key in ['hidden','inert','text']:self.assertIn(key,fixture)
  self.assertIn("states['08-compact'].moatNotice.hidden,true",entry);self.assertIn("states['08-compact'].moatNotice.inert,true",entry)
  self.assertIn("states['09-expanded'].moatNotice.hidden,false",entry);self.assertIn("states['09-expanded'].moatNotice.inert,false",entry)
 def test_hosted_existing_and_regression_tests(self):
  s=(R/'.github/workflows/minimap-compact-review-r379.yml').read_text();self.assertIn('node --test tests/map-compact-notice.test.mjs tests/map-compact.test.mjs',s)
if __name__=='__main__':unittest.main()
