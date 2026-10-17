"""Focused tests for the one-material screen-appender extension."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'assets-src/interiors'))
from append_taihe_screen import append_batches,unpack_glb,pack_glb,sha

BASE=ROOT/'public/models/interiors/taihe-furniture-0bfa52b758cb.glb'
BASE_SHA='0bfa52b758cba052b0b8258ebc338cb9b0f80129e00d0bb5970ef343758432ea'
LEGACY_SHA='5b1574b9859c1248da3294d9b0d801124e12d80389bc14b8ee0372c4a87be6a0'
BATCH={'position':[0.,3.,13.5,.1,3.,13.5,0.,3.1,13.5],
       'normal':[0.,0.,-1.]*3,'indices':[0,2,1]}

def chunks(g,b):
    return [b[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']] for v in g['bufferViews']]

class ScreenAppendTests(unittest.TestCase):
    def setUp(self):
        self.raw=BASE.read_bytes();self.assertEqual(sha(self.raw),BASE_SHA)

    def test_only_allowlist_and_explanatory_docs_differ_from_pinned_append_function(self):
        legacy=(ROOT/'assets-src/interiors/append_taihe_caisson.py').read_text()
        current=(ROOT/'assets-src/interiors/append_taihe_screen.py').read_text()
        self.assertEqual(sha(legacy.encode()),LEGACY_SHA)
        expected=legacy[legacy.index('import copy'):].replace('batches: {gold|darkGold:', 'batches: {gold|darkGold|red:').replace(
            "materials = {'gold': 'taihe_gold', 'darkGold': 'taihe_dark_gold'}",
            "materials = {'gold': 'taihe_gold', 'darkGold': 'taihe_dark_gold', 'red': 'taihe_lacquer'}")
        self.assertEqual(current[current.index('import copy'):],expected)

    def test_existing_lacquer_attributes_preserved_and_one_triangle_added(self):
        g,b=unpack_glb(self.raw);before=chunks(g,b)
        result,rows=append_batches(self.raw,{'red':copy.deepcopy(BATCH)},{'screenAppendTest':True},[])
        ng,nb=unpack_glb(result);after=chunks(ng,nb)
        self.assertEqual(len(rows),3)
        self.assertEqual({r['material'] for r in rows},{'taihe_lacquer'})
        altered={g['accessors'][r['accessor']]['bufferView'] for r in rows}
        for i,old in enumerate(before):
            self.assertEqual(after[i][:len(old)],old)
            if i not in altered:self.assertEqual(after[i],old)
        self.assertEqual(ng['materials'],g['materials']);self.assertEqual(ng['meshes'],g['meshes'])
        self.assertEqual([n for n in ng['nodes'] if n.get('name')!='TAIHE_CORE_CONTRACT'],[n for n in g['nodes'] if n.get('name')!='TAIHE_CORE_CONTRACT'])

    def test_unrecognized_material_remains_rejected(self):
        with self.assertRaisesRegex(ValueError,'Unexpected caisson material'):
            append_batches(self.raw,{'unverified':BATCH},{},[])

    def test_lacquer_with_unexpected_texture_attributes_is_rejected(self):
        g,b=unpack_glb(self.raw)
        target=next(p for m in g['meshes'] for p in m['primitives'] if g['materials'][p['material']]['name']=='taihe_lacquer')
        target['attributes']['TEXCOORD_0']=target['attributes']['NORMAL']
        with self.assertRaisesRegex(ValueError,'Unexpected target attributes'):
            append_batches(pack_glb(g,b),{'red':BATCH},{},[])

    def test_transformed_lacquer_target_is_rejected(self):
        g,b=unpack_glb(self.raw)
        mi=next(i for i,m in enumerate(g['meshes']) if any(g['materials'][p['material']]['name']=='taihe_lacquer' for p in m['primitives']))
        next(n for n in g['nodes'] if n.get('mesh')==mi)['translation']=[1,0,0]
        with self.assertRaisesRegex(ValueError,'identity frame'):
            append_batches(pack_glb(g,b),{'red':BATCH},{},[])

if __name__=='__main__':unittest.main()
