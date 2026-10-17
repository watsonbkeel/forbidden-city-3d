"""No browser/GPU: independently prove the GLB append boundary and rejections."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('append_caisson', ROOT / 'assets-src/interiors/append_taihe_caisson.py')
M = importlib.util.module_from_spec(spec)
spec.loader.exec_module(M)
BASE = (ROOT / 'public/models/interiors/taihe-v17-display-28d7a11dbeda.glb').read_bytes()
BATCH = {'gold': {'position': [0, 10, 9, .1, 10, 9, 0, 10, 9.1],
                  'normal': [0, -1, 0] * 3, 'indices': [0, 1, 2]}}


def chunks(g, binary):
    return [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in g['bufferViews']]


class AppendTests(unittest.TestCase):
    def test_old_accessor_bytes_are_exact_prefixes(self):
        result, receipt = M.append_batches(BASE, BATCH, {'caissonTest': 'test'}, [])
        old, ob = M.unpack_glb(BASE)
        new, nb = M.unpack_glb(result)
        before, after = chunks(old, ob), chunks(new, nb)
        touched = {old['accessors'][r['accessor']]['bufferView'] for r in receipt}
        for i, (a, b) in enumerate(zip(before, after)):
            self.assertEqual(a, b[:len(a)])
            self.assertEqual(len(b) > len(a), i in touched)
        self.assertEqual(len(touched), 4)
        for key in ['materials', 'meshes', 'scenes', 'scene']:
            self.assertEqual(old[key], new[key])
        self.assertEqual([n for n in old['nodes'] if 'mesh' in n], [n for n in new['nodes'] if 'mesh' in n])

    def test_regeneration_is_byte_exact(self):
        self.assertEqual(M.append_batches(BASE, BATCH, {}, [])[0], M.append_batches(BASE, BATCH, {}, [])[0])

    def test_gold_uvs_are_neutral(self):
        result, _ = M.append_batches(BASE, BATCH, {}, [])
        g, b = M.unpack_glb(result)
        ai = g['meshes'][4]['primitives'][0]['attributes']['TEXCOORD_0']
        self.assertEqual(chunks(g, b)[g['accessors'][ai]['bufferView']][-24:], bytes(24))

    def test_bad_geometry_is_rejected(self):
        for mutate in [lambda b: b['gold']['position'].__setitem__(0, float('nan')),
                       lambda b: b['gold']['indices'].__setitem__(0, 3),
                       lambda b: b['gold'].__setitem__('normal', []),
                       lambda b: b.__setitem__('foreign', b['gold'])]:
            bad = copy.deepcopy(BATCH)
            mutate(bad)
            with self.assertRaises(ValueError):
                M.append_batches(BASE, bad, {}, [])

    def test_transformed_or_shared_accessors_are_rejected(self):
        for mutate in [lambda g: g['nodes'][4].__setitem__('translation', [1, 0, 0]),
                       lambda g: g['bufferViews'][12].__setitem__('byteStride', 12),
                       lambda g: g['accessors'].append(copy.deepcopy(g['accessors'][12]))]:
            g, b = M.unpack_glb(BASE)
            mutate(g)
            with self.assertRaises(ValueError):
                M.append_batches(M.pack_glb(g, b), BATCH, {}, [])

    def test_existing_identity_cannot_be_overwritten(self):
        with self.assertRaises(ValueError):
            M.append_batches(BASE, BATCH, {'profileId': 'forged'}, [])

    def test_accessor_referenced_by_another_primitive_is_rejected(self):
        g, b = M.unpack_glb(BASE)
        alias = copy.deepcopy(g['meshes'][4]['primitives'][0])
        alias['material'] = 3
        g['meshes'][3]['primitives'].append(alias)
        with self.assertRaisesRegex(ValueError, 'shared by another primitive'):
            M.append_batches(M.pack_glb(g, b), BATCH, {}, [])


if __name__ == '__main__':
    unittest.main()
