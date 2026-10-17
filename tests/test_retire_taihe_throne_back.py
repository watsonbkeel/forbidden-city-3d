"""Exact semantic chair-back retirement; no browser, renderer, or spatial mask."""
import copy
import importlib.util
import json
import os
import shutil
import subprocess
import tempfile
import struct
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'assets-src/interiors'))
from append_taihe_caisson import unpack_glb, pack_glb, sha

MODULE = ROOT / 'assets-src/interiors/retire_taihe_throne_back.py'
BASE = (ROOT / 'public/models/interiors/taihe-caisson-9067bcce8b91.glb').read_bytes()
MASK_PATH = ROOT / 'assets-src/interiors/taihe_furniture/retired_throne_back_faces.json'
EXPECTED = {'taihe_gold': 240, 'taihe_dark_gold': 24, 'taihe_lacquer': 32}


def chunks(g, binary):
    return [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]
            for v in g['bufferViews']]


def contract(g):
    return next(n['extras'] for n in g['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT')


class RetireThroneBack(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.impl = None
        if MODULE.exists():
            spec = importlib.util.spec_from_file_location('retire_throne_under_test', MODULE)
            cls.impl = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(cls.impl)

    def implementation(self):
        self.assertIsNotNone(self.impl, 'The exact chair-back retirement implementation is missing')
        self.assertTrue(MASK_PATH.exists(), 'The source-derived pinned chair-back mask is missing')
        return self.impl, MASK_PATH.read_bytes()

    def test_exact_only_three_index_views_change(self):
        impl, mask = self.implementation()
        result, receipt = impl.retire_throne_back(BASE, mask)
        old, ob = unpack_glb(BASE)
        new, nb = unpack_glb(result)
        a, b = chunks(old, ob), chunks(new, nb)
        touched = {r['bufferView'] for r in receipt['indexChanges']}
        self.assertEqual(len(touched), 3)
        self.assertEqual(len(a), len(b))
        for i, (before, after) in enumerate(zip(a, b)):
            if i not in touched:
                self.assertEqual(before, after, f'Unrelated bufferView {i} changed')
        self.assertEqual({r['material']: r['removedTriangles'] for r in receipt['indexChanges']}, EXPECTED)
        self.assertEqual(receipt['removedTriangles'], 296)
        self.assertEqual(len(ob) - len(nb), 296 * 3 * 2)
        for key in old.keys() - {'accessors', 'bufferViews', 'buffers', 'nodes'}:
            self.assertEqual(old[key], new[key], key)
        self.assertEqual([n for n in old['nodes'] if 'mesh' in n],
                         [n for n in new['nodes'] if 'mesh' in n])
        changed_accessors = {r['accessor'] for r in receipt['indexChanges']}
        for ai, (before, after) in enumerate(zip(old['accessors'], new['accessors'])):
            if ai not in changed_accessors:
                self.assertEqual(before, after)
            else:
                self.assertEqual({k:v for k,v in before.items() if k not in ('count','min','max')},
                                 {k:v for k,v in after.items() if k not in ('count','min','max')})
        for before, after in zip(old['bufferViews'], new['bufferViews']):
            self.assertEqual({k:v for k,v in before.items() if k not in ('byteOffset','byteLength')},
                             {k:v for k,v in after.items() if k not in ('byteOffset','byteLength')})

    def test_all_retained_indices_are_byte_exact_in_original_order(self):
        impl, mask_bytes = self.implementation()
        mask = json.loads(mask_bytes)
        result, receipt = impl.retire_throne_back(BASE, mask_bytes)
        old, ob = unpack_glb(BASE)
        new, nb = unpack_glb(result)
        a, b = chunks(old, ob), chunks(new, nb)
        newly_unused = 0
        for row in receipt['indexChanges']:
            ai, vi = row['accessor'], row['bufferView']
            acc = old['accessors'][ai]
            fmt = {5123:'H', 5125:'I'}[acc['componentType']]
            width = struct.calcsize(fmt)
            ids = struct.unpack('<' + fmt * acc['count'], a[vi])
            removed = {r['triangleOrdinal'] for r in mask['triangles'] if r['material'] == row['material']}
            wanted = b''.join(a[vi][i*3*width:(i+1)*3*width]
                              for i in range(len(ids)//3) if i not in removed)
            self.assertEqual(b[vi], wanted)
            self.assertEqual(sha(wanted), row['retainedSHA256'])
            kept = struct.unpack('<' + fmt * new['accessors'][ai]['count'], b[vi])
            lost = len(set(ids) - set(kept))
            self.assertEqual(row['newlyUnusedVertices'], lost)
            newly_unused += lost
        self.assertEqual(receipt['newlyUnusedVertices'], newly_unused)
        self.assertGreater(newly_unused, 0)

    def test_only_exact_named_inventory_members_retire(self):
        impl, mask = self.implementation()
        result, receipt = impl.retire_throne_back(BASE, mask)
        old, _ = unpack_glb(BASE)
        new, _ = unpack_glb(result)
        a, b = contract(old), contract(new)
        self.assertEqual({k:v for k,v in a.items() if k != 'inventory'},
                         {k:v for k,v in b.items() if k != 'inventory'})
        original = json.loads(a['inventory'])
        names = {r['name'] for r in original if r['name'].startswith('throne_back')}
        self.assertEqual(len(names), 17)
        self.assertEqual(set(receipt['retiredParts']), names)
        self.assertEqual(json.loads(b['inventory']), [r for r in original if r['name'] not in names])
        for prefix in ['throne_arm', 'throne_seat', 'throne_blue_waist', 'throne_lower', 'screen_', 'gold_column']:
            self.assertEqual([r for r in original if r['name'].startswith(prefix)],
                             [r for r in json.loads(b['inventory']) if r['name'].startswith(prefix)])
        for before, after in zip(old['nodes'], new['nodes']):
            if before.get('name') == 'TAIHE_CORE_CONTRACT':
                x, y = copy.deepcopy(before), copy.deepcopy(after)
                x['extras'].pop('inventory'); y['extras'].pop('inventory')
                self.assertEqual(x, y)
            else:
                self.assertEqual(before, after)

    def test_unknown_base_and_any_changed_mask_are_rejected(self):
        impl, mask = self.implementation()
        changed = bytearray(BASE); changed[-40] ^= 1
        with self.assertRaisesRegex(ValueError, 'baseline'):
            impl.retire_throne_back(bytes(changed), mask)
        mutations = [lambda m:m['parts'].append('throne_arm'),
                     lambda m:m['triangles'].append(copy.deepcopy(m['triangles'][0])),
                     lambda m:m['triangles'][0].__setitem__('triangleOrdinal', 0),
                     lambda m:m['triangles'][0]['indices'].__setitem__(0, 0),
                     lambda m:m['triangles'][0].__setitem__('positionSHA256', '0'*64),
                     lambda m:m['triangles'][0].__setitem__('part', 'screen_0'),
                     lambda m:m['sources'].__setitem__('assets-src/interiors/taihe.py', '0'*64)]
        for mutate in mutations:
            m = json.loads(mask); mutate(m)
            with self.assertRaisesRegex(ValueError, 'mask'):
                impl.retire_throne_back(BASE, json.dumps(m).encode())

    def test_index_position_and_ownership_guards_beyond_content_hash(self):
        impl, mask_bytes = self.implementation()
        mutations = [
            (lambda m:m['triangles'][0]['indices'].__setitem__(0, 0), 'index identity'),
            (lambda m:m['triangles'][0].__setitem__('positionSHA256', '0'*64), 'coordinates'),
            (lambda m:m['triangles'][0].__setitem__('sourcePositionSHA256', '0'*64), 'source geometry'),
            (lambda m:m['triangles'][0].__setitem__('part', 'throne_arm'), 'ownership'),
            (lambda m:m['triangles'][0].__setitem__('sourceTriangleOrdinal', 999), 'source ordinal'),
            (lambda m:m['triangles'].append(copy.deepcopy(m['triangles'][0])), 'cardinality'),
            (lambda m:m['sources'].__setitem__('assets-src/interiors/taihe.py', '0'*64), 'source identity'),
        ]
        for mutate, error in mutations:
            m = json.loads(mask_bytes); mutate(m)
            changed = json.dumps(m).encode()
            with self.subTest(error=error), patch.object(impl, 'MASK_SHA256', sha(changed)):
                with self.assertRaisesRegex(ValueError, error):
                    impl.retire_throne_back(BASE, changed)

    def test_source_file_change_is_rejected_without_touching_real_source(self):
        impl, mask = self.implementation()
        original = Path.read_bytes
        source = ROOT / 'assets-src/interiors/taihe.py'
        def changed_read(path):
            raw = original(path)
            return raw + b'\n# mutated source\n' if path == source else raw
        with patch.object(Path, 'read_bytes', changed_read):
            with self.assertRaisesRegex(ValueError, 'source bytes'):
                impl.retire_throne_back(BASE, mask)

    def test_source_contract_ownership_is_checked(self):
        impl, mask = self.implementation()
        g, b = unpack_glb(BASE)
        contract(g)['ownership'] = 'other-geometry-owner'
        changed = pack_glb(g, b)
        m = json.loads(mask); m['baseSHA256'] = sha(changed)
        changed_mask = json.dumps(m).encode()
        with patch.object(impl, 'BASE_SHA256', sha(changed)), patch.object(impl, 'MASK_SHA256', sha(changed_mask)):
            with self.assertRaisesRegex(ValueError, 'source ownership'):
                impl.retire_throne_back(changed, changed_mask)

    def test_actual_index_position_and_target_transform_changes_are_rejected(self):
        impl, mask_bytes = self.implementation()
        for kind, error in [('index', 'index identity'), ('position', 'coordinates'), ('transform', 'frame')]:
            g, binary = unpack_glb(BASE)
            binary = bytearray(binary)
            mask = json.loads(mask_bytes)
            row = mask['triangles'][0]
            info = mask['materials'][row['material']]
            primitive = g['meshes'][info['mesh']]['primitives'][info['primitive']]
            if kind == 'transform':
                next(n for n in g['nodes'] if n.get('mesh') == info['mesh'])['translation'] = [1, 0, 0]
            else:
                ai = primitive['indices'] if kind == 'index' else primitive['attributes']['POSITION']
                acc = g['accessors'][ai]
                view = g['bufferViews'][acc['bufferView']]
                offset = view.get('byteOffset', 0)
                offset += row['triangleOrdinal'] * 6 if kind == 'index' else row['indices'][0] * 12
                binary[offset] ^= 1
            changed_base = pack_glb(g, bytes(binary))
            mask['baseSHA256'] = sha(changed_base)
            changed_mask = json.dumps(mask).encode()
            with self.subTest(kind=kind), patch.object(impl, 'BASE_SHA256', sha(changed_base)), patch.object(impl, 'MASK_SHA256', sha(changed_mask)):
                with self.assertRaisesRegex(ValueError, error):
                    impl.retire_throne_back(changed_base, changed_mask)

    def test_oriented_source_identity_accepts_only_cyclic_rotations(self):
        self.implementation()
        from taihe_furniture.derive_retirement import oriented_position_bytes
        points = [(0., 1., 2.), (3., 4., 5.), (6., 7., 8.)]
        encode = lambda ps:struct.pack('<9f', *(v for p in ps for v in p))
        expected = oriented_position_bytes(encode(points))
        for k in range(3):
            self.assertEqual(expected, oriented_position_bytes(encode(points[k:] + points[:k])))
        self.assertNotEqual(expected, oriented_position_bytes(encode(list(reversed(points)))))

    @unittest.skipUnless(shutil.which('blender'), 'CPU Blender is not installed')
    def test_cpu_blender_rederives_identical_mask_from_all_original_objects(self):
        _, mask = self.implementation()
        script = ROOT / 'assets-src/interiors/taihe_furniture/derive_retirement.py'
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'mask.json'
            process = subprocess.run([shutil.which('blender'), '-b', '-t', '1', '-P', str(script),
                                      '--', '--output', str(target)], cwd=ROOT,
                                     env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'},
                                     capture_output=True, text=True, timeout=60)
            self.assertEqual(process.returncode, 0, process.stdout + process.stderr)
            self.assertTrue(target.exists(), process.stdout + process.stderr)
            self.assertEqual(target.read_bytes(), mask)
        proof = json.loads(mask)['sourceProof']
        self.assertEqual(proof['allOriginalMeshObjects'], 244)
        self.assertEqual(proof['allOriginalTriangles'], 8330)
        self.assertTrue(proof['allTargetFacesHaveUniqueSourceOwner'])
        self.assertTrue(proof['allTargetFacesHaveUniqueBaselineMatch'])
        self.assertEqual(proof['maximumCoordinateError'], 0)
        self.assertTrue(proof['windingPreserved'])

    def test_default_pinned_mask_and_determinism(self):
        impl, mask = self.implementation()
        a = impl.retire_throne_back(BASE, mask)
        self.assertEqual(a, impl.retire_throne_back(BASE))
        self.assertEqual(a, impl.retire_throne_back(BASE, mask))


if __name__ == '__main__':
    unittest.main()
