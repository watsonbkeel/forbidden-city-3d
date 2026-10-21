import copy
import importlib.util
import json
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'assets-src/interiors'))
import fit_taihe_display_grid as fit
class DisplayFitTests(unittest.TestCase):
    def test_reproducible_selected_asset_and_immutable_source(self):
        base=fit.BASE.read_bytes();result,identity,receipt=fit.fit(base,fit.PROFILE.read_bytes())
        cfg=json.loads((ROOT/'data/interiors/taihe.json').read_bytes())
        self.assertEqual(result,(ROOT/('public'+cfg['model'])).read_bytes())
        self.assertEqual(fit.sha(base),fit.BASE_SHA)
        self.assertEqual(identity['spatialFitDeltaZ'],-2)
        self.assertEqual(identity['spatialFitChangedVertices'],38234)
        self.assertEqual(receipt['binaryBytesBefore'],receipt['binaryBytesAfter'])
        self.assertEqual(receipt['renderableTriangles'],17924)
    def test_rejects_repeat_application_and_any_changed_source(self):
        base=fit.BASE.read_bytes();result,_,_=fit.fit(base,fit.PROFILE.read_bytes())
        for invalid in [result,base[:-1],b'',base+b'\x00']:
            with self.assertRaisesRegex(ValueError,'Unknown frozen R33'):fit.fit(invalid,fit.PROFILE.read_bytes())
    def test_rejects_unrelated_profile_or_nonrigid_fit(self):
        profile=json.loads(fit.PROFILE.read_bytes())
        for mutation in [lambda p:p['caisson'].update(z=7.51),lambda p:p['columns'].update(height=12.7),lambda p:p['plaque'].update(width=6),lambda p:p['throne'].update(z=9.36),lambda p:p['spatialFit'].update(deltaZ=-3),lambda p:p['screen'].update(width=5)]:
            changed=copy.deepcopy(profile);mutation(changed)
            with self.assertRaises(ValueError):fit.fit(fit.BASE.read_bytes(),json.dumps(changed).encode())
    def test_semantic_inventory_preserves_fixed_architecture(self):
        from append_taihe_caisson import unpack_glb
        before,_=unpack_glb(fit.BASE.read_bytes());result,_,_=fit.fit(fit.BASE.read_bytes(),fit.PROFILE.read_bytes());after,_=unpack_glb(result)
        inventory=lambda g:json.loads(next(n['extras']['inventory'] for n in g['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT'))
        old,new=inventory(before),inventory(after)
        self.assertEqual(len(old),len(new));moved=0
        for a,b in zip(old,new):
            if a['name'].startswith(fit.DISPLAY_PREFIXES):
                self.assertEqual(a['name'],b['name']);moved+=1
                for key in ('min','max'):
                    self.assertEqual(a[key][:2],b[key][:2]);self.assertAlmostEqual(b[key][2],a[key][2]-2)
            else:self.assertEqual(a,b)
        self.assertGreater(moved,200)
if __name__=='__main__':unittest.main()
