"""Byte-scoped fit regeneration and fail-closed source checks."""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'assets-src/interiors'))
from fit_taihe_hanging import BASE, PROFILE, fit
from append_taihe_caisson import unpack_glb


class TaiheHangingFit(unittest.TestCase):
    def test_reproduces_selected_asset_exactly(self):
        result, identity, receipt = fit(BASE.read_bytes(), PROFILE.read_bytes())
        cfg = json.loads((ROOT / 'data/interiors/taihe.json').read_bytes())
        self.assertEqual(result, (ROOT / ('public' + cfg['model'])).read_bytes())
        self.assertEqual(receipt['binaryBytesBefore'], receipt['binaryBytesAfter'])
        self.assertEqual(sum(len(v['vertices']) for v in receipt['selections']), 28)
        self.assertEqual(sum(v['triangles'] for v in receipt['selections']), 14)
        for key, value in identity.items():
            self.assertEqual(cfg['asset'][key], value)

    def test_unknown_base_and_repeat_application_rejected(self):
        baseline = BASE.read_bytes()
        with self.assertRaisesRegex(ValueError, 'Unknown frozen'):
            fit(baseline[:-1] + bytes([baseline[-1] ^ 1]), PROFILE.read_bytes())
        result, _, _ = fit(baseline, PROFILE.read_bytes())
        with self.assertRaisesRegex(ValueError, 'Unknown frozen'):
            fit(result, PROFILE.read_bytes())

    def test_unrelated_dimension_or_mount_changes_rejected(self):
        for field in ('width', 'height', 'bottomY'):
            profile = json.loads(PROFILE.read_bytes())
            profile['plaque'][field] += .01
            with self.assertRaisesRegex(ValueError, 'unrelated profile'):
                fit(BASE.read_bytes(), json.dumps(profile).encode())
        profile = json.loads(PROFILE.read_bytes())
        profile['plaque']['z'] += .01
        with self.assertRaisesRegex(ValueError, 'existing nearer beam'):
            fit(BASE.read_bytes(), json.dumps(profile).encode())

    def test_original_asset_metadata_retained_except_explicit_hanging_fields(self):
        old, _ = unpack_glb(BASE.read_bytes())
        result, identity, _ = fit(BASE.read_bytes(), PROFILE.read_bytes())
        new, _ = unpack_glb(result)
        before = next(n['extras'] for n in old['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT')
        after = next(n['extras'] for n in new['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT')
        for key, value in before.items():
            if key not in ('revision', 'profileSHA256', 'inventory'):
                self.assertEqual(after[key], value, key)
        self.assertEqual(set(after)-set(before), set(identity))
        self.assertEqual(old['materials'], new['materials'])
        self.assertEqual(old['meshes'], new['meshes'])
        self.assertEqual(old['bufferViews'], new['bufferViews'])


if __name__ == '__main__':
    unittest.main()
