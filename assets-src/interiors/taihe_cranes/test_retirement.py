"""CPU proofs for finite crane retirement and existing translated-batch append."""
import copy
import importlib
import json
import struct
import sys
import unittest
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE.parent))
from append_taihe_caisson import unpack_glb, pack_glb, sha


def chunks(data):
    g, b = unpack_glb(data)
    return g, [b[v.get('byteOffset', 0):v.get('byteOffset', 0)+v['byteLength']] for v in g['bufferViews']]


class RetirementAvailability(unittest.TestCase):
    def test_finite_crane_retirement_exists(self):
        self.assertTrue((HERE/'retire.py').exists(), 'Missing finite crane retirement')
    def test_bounded_crane_append_exists(self):
        self.assertTrue((HERE.parent/'append_taihe_cranes.py').exists(), 'Missing translated-batch append')


@unittest.skipUnless((HERE/'retire.py').exists(), 'Implementation pending')
class CraneRetirement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d = importlib.import_module('taihe_cranes.derive_retirement')
        cls.r = importlib.import_module('taihe_cranes.retire')
        cls.a = importlib.import_module('append_taihe_cranes')
        cls.base = cls.d.BASE_PATH.read_bytes()
        cls.mask_bytes = (HERE/'retired_crane_faces.json').read_bytes()
        cls.mask = json.loads(cls.mask_bytes)
        cls.result, cls.receipt = cls.r.retire_cranes(cls.base)

    def test_source_cardinality_full_unique_ownership_and_determinism(self):
        self.assertEqual(sha(self.base), self.d.BASE_SHA256)
        self.assertEqual(self.mask['sourceProof']['sourceTriangles'], 3798)
        self.assertEqual(self.mask['sourceProof']['uniqueMatchedTriangles'], 3798)
        self.assertEqual(len(self.mask['triangles']), 374)
        self.assertEqual(self.receipt['removedTriangles'], 374)
        self.assertEqual(self.mask, self.d.derive())
        self.assertLessEqual(self.mask['sourceProof']['maximumCoordinateError'], 2e-6)
        for path, digest in self.d.SOURCES.items():
            self.assertEqual(sha((ROOT/path).read_bytes()), digest)
        for name, (material, count) in self.d.EXPECTED_PARTS.items():
            rows = [r for r in self.mask['triangles'] if r['part'] == name]
            self.assertEqual(sorted(r['sourceTriangleOrdinal'] for r in rows), list(range(count)))
            self.assertTrue(all(r['material'] == material for r in rows))
        self.assertEqual(self.result, self.r.retire_cranes(self.base)[0])

    def test_retirement_preserves_every_attribute_and_metadata(self):
        before, old = chunks(self.base); after, new = chunks(self.result)
        indices = {v['indexAccessor'] for v in self.mask['materials'].values()}
        changed = {before['accessors'][i]['bufferView'] for i in indices}
        self.assertEqual(len(old), len(new))
        for i, (a, b) in enumerate(zip(old, new)):
            if i not in changed: self.assertEqual(a, b, str(i))
        for i, (a, b) in enumerate(zip(before['accessors'], after['accessors'])):
            if i not in indices: self.assertEqual(a, b)
        for key in ('nodes', 'scenes', 'scene', 'meshes', 'materials', 'images', 'textures', 'samplers', 'extensionsUsed'):
            self.assertEqual(before.get(key), after.get(key), key)
        self.assertEqual(self.receipt['retiredInventoryNames'], [f'display_crane:{side}_{key}' for side in ('left','right') for key in ('pearl','red')])
        self.assertEqual(self.receipt['partialInventoryNames'], ['display_crane:left_teal', 'display_crane:right_teal'])
        self.assertEqual(len(self.receipt['partialInventoryUpdates']), 2)
        for row in self.receipt['partialInventoryUpdates']:
            self.assertLess(row['max'][1], 2.261)
            self.assertGreater(row['min'][1], 2.159)

    def test_partial_inventory_bounds_are_exact_retained_scene_positions(self):
        actual,_=self.d.actual_records(self.result)
        g,views=chunks(self.base)
        lookup={(r['material'],tuple(r['indices'])):r for r in actual}
        original_inventory=json.loads(next(n['extras']['inventory'] for n in g['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT'))
        for update in self.receipt['partialInventoryUpdates']:
            rows=[r for r in self.mask['retainedPartialTriangles'] if r['inventoryName']==update['name']]
            self.assertEqual(len(rows),54)
            points=[p for r in rows for p in lookup[(r['material'],tuple(r['indices']))]['points']]
            self.assertEqual(update['min'],[min(p[k] for p in points) for k in range(3)])
            self.assertEqual(update['max'],[max(p[k] for p in points) for k in range(3)])
            original=next(r for r in original_inventory if r['name']==update['name'])
            self.assertEqual({k:v for k,v in update.items() if k not in ('min','max')},{k:v for k,v in original.items() if k not in ('min','max')})

    def test_source_hash_pin_rejects_changed_identity(self):
        path=next(iter(self.d.SOURCES));original=self.d.SOURCES[path]
        try:
            self.d.SOURCES[path]='0'*64
            with self.assertRaises(ValueError):self.d.source_records()
            with self.assertRaises(ValueError):self.r.retire_cranes(self.base)
        finally:self.d.SOURCES[path]=original

    def test_retained_indices_keep_exact_order(self):
        before, old = chunks(self.base); after, new = chunks(self.result)
        for material, info in self.mask['materials'].items():
            a = before['accessors'][info['indexAccessor']]; vi = a['bufferView']; width = {5123:2,5125:4}[a['componentType']]*3
            removed = {r['triangleOrdinal'] for r in self.mask['triangles'] if r['material'] == material}
            expected = b''.join(old[vi][j:j+width] for j in range(0,len(old[vi]),width) if j//width not in removed)
            self.assertEqual(new[vi], expected)
        self.assertEqual(sum(a['count']//3 for a in after['accessors'] if a['type']=='SCALAR'), 17770-374)

    def test_unknown_baseline_mask_and_semantic_mutations_fail_closed(self):
        with self.assertRaises(ValueError): self.r.retire_cranes(self.base+b'\0')
        with self.assertRaises(ValueError): self.r.retire_cranes(self.base,self.mask_bytes+b' ')
        original = self.r.MASK_SHA256
        try:
            for field, value in [('indices',[0,1,2]), ('positionSHA256','0'*64), ('orientedPositionSHA256','0'*64), ('sourceTriangleOrdinal',-1), ('sourcePositionSHA256','0'*64), ('triangleOrdinal',-1)]:
                mask = copy.deepcopy(self.mask); mask['triangles'][0][field] = value
                raw = (json.dumps(mask,indent=2)+'\n').encode(); self.r.MASK_SHA256 = sha(raw)
                with self.assertRaises(ValueError, msg=field): self.r.retire_cranes(self.base,raw)
        finally: self.r.MASK_SHA256 = original

    def test_duplicate_owner_duplicate_actual_and_reversed_winding_rejected(self):
        records = self.d.source_records(); actual, _ = self.d.actual_records(self.base)
        target = next(r for r in records if r['part'] in self.d.EXPECTED_PARTS)
        with self.assertRaises(ValueError): self.d.match_source(records+[target], actual)
        matches = self.d.match_source(records,actual)
        identity = matches[0]['material'],matches[0]['triangleOrdinal']
        actual_target = next(a for a in actual if (a['material'],a['triangleOrdinal']) == identity)
        with self.assertRaises(ValueError): self.d.match_source(records,actual+[actual_target])
        altered = copy.deepcopy(records); altered[0]['points'][1],altered[0]['points'][2] = altered[0]['points'][2],altered[0]['points'][1]
        with self.assertRaises(ValueError): self.d.match_source(altered,actual)

    def test_translated_append_preserves_old_prefixes_and_scene_positions(self):
        batch = {'position':[2.8,3.1,10.2, 2.9,3.1,10.2, 2.8,3.2,10.2], 'normal':[0.,0.,1.]*3, 'indices':[0,1,2]}
        data, rows = self.a.append_batches(self.result, {'teal':batch,'pearl':batch,'red':batch}, {'testCraneCandidate':'cpu'}, [])
        before, old = chunks(self.result); after, new = chunks(data)
        for row in rows:
            vi = before['accessors'][row['accessor']]['bufferView']; self.assertEqual(new[vi][:len(old[vi])],old[vi])
        changed = {before['accessors'][r['accessor']]['bufferView'] for r in rows}
        for i in range(len(old)):
            if i not in changed: self.assertEqual(old[i],new[i])
        self.assertEqual(before['materials'],after['materials'])
        self.assertEqual(before['meshes'],after['meshes'])
        for a,b in zip(before['nodes'],after['nodes']):
            if a.get('name')!='TAIHE_CORE_CONTRACT':self.assertEqual(a,b)
        for key in ('scenes','scene','images','textures','samplers','extensionsUsed'):
            self.assertEqual(before.get(key),after.get(key))
        for material in ('taihe_teal','taihe_pearl','taihe_lacquer'):
            mi = next(i for i,m in enumerate(after['meshes']) if after['materials'][m['primitives'][0]['material']]['name']==material)
            p = after['meshes'][mi]['primitives'][0]; pa = after['accessors'][p['attributes']['POSITION']];na=after['accessors'][p['attributes']['NORMAL']]
            t = self.a.target_translation(after,mi,material)
            values=struct.unpack('<9f',new[pa['bufferView']][-36:])
            for i,v in enumerate(values):self.assertAlmostEqual(v+t[i%3],batch['position'][i],places=6)
            self.assertEqual(struct.unpack('<9f',new[na['bufferView']][-36:]),tuple(batch['normal']))
        self.assertEqual(data,self.a.append_batches(self.result,{'teal':batch,'pearl':batch,'red':batch},{'testCraneCandidate':'cpu'},[])[0])

    def test_append_rejects_unexpected_frame_attributes_and_shared_accessors(self):
        batch = {'position':[0.,0.,0.,1.,0.,0.,0.,1.,0.], 'normal':[0.,0.,1.]*3, 'indices':[0,1,2]}
        for mutate in (
            lambda g: g['nodes'][0]['translation'].__setitem__(1,2.61),
            lambda g: g['nodes'][0].update(rotation=[0,0,0,1]),
            lambda g: g['scenes'][g.get('scene',0)]['nodes'].remove(0),
            lambda g: g['nodes'][1].update(children=[0]),
            lambda g: g['meshes'][1]['primitives'][0]['attributes'].update(POSITION=0),
            lambda g: g['meshes'][0]['primitives'][0]['attributes'].update(COLOR_0=1),
            lambda g: g['accessors'].append(copy.deepcopy(g['accessors'][0])),
        ):
            g,b=unpack_glb(self.result);mutate(g)
            with self.assertRaises(ValueError):self.a.append_batches(pack_glb(g,b),{'teal':batch},{},[])
        for key in ('gold','darkGold','stone','glyph','dark'):
            with self.assertRaises(ValueError):self.a.append_batches(self.result,{key:batch},{},[])
        for changed in ({'indices':[True,1,2]}, {'normal':[0.,0.,0.]*3}, {'position':[float('nan')]*9}):
            with self.assertRaises(ValueError):self.a.append_batches(self.result,{'teal':{**batch,**changed}},{},[])

if __name__=='__main__':unittest.main(verbosity=2)
