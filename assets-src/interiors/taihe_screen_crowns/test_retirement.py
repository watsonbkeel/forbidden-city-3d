"""Semantic retirement, exact surface retention and actual aperture-ray proofs."""
import importlib.util
import json
import math
import struct
import sys
import unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent))
from append_taihe_caisson import unpack_glb,sha
from taihe_screen_crowns.derive_retirement import BASE_PATH,BASE_SHA256,EXPECTED_PARTS,EXPECTED,SOURCES
from taihe_screen_crowns.geometry import build_candidate
PROFILE=json.loads((HERE.parents[2]/'data/architecture/taihe-core.json').read_text())

def load():
    spec=importlib.util.spec_from_file_location('screen_crown_retirement',HERE/'retire.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module

def chunks(data):
    gltf,binary=unpack_glb(data)
    return gltf,[binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']] for v in gltf['bufferViews']]

def triangles(data):
    gltf,views=chunks(data);result={}
    for mesh in gltf['meshes']:
        for p in mesh['primitives']:
            name=gltf['materials'][p['material']]['name'];ia=gltf['accessors'][p['indices']];pa=gltf['accessors'][p['attributes']['POSITION']]
            ids=struct.unpack('<'+{5123:'H',5125:'I'}[ia['componentType']]*ia['count'],views[ia['bufferView']])
            pos=list(zip(*[iter(struct.unpack('<'+'f'*pa['count']*3,views[pa['bufferView']]))]*3))
            result[name]=[tuple(pos[j] for j in ids[k:k+3]) for k in range(0,len(ids),3)]
    return result

class RetirementAvailability(unittest.TestCase):
    def test_semantic_retirement_exists(self): self.assertTrue((HERE/'retire.py').exists(),'Missing finite crown retirement')

@unittest.skipUnless((HERE/'retire.py').exists(),'Retirement not implemented yet')
class SemanticRetirement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module=load();cls.base=BASE_PATH.read_bytes();cls.mask=json.loads((HERE/'retired_screen_header_faces.json').read_bytes());cls.result,cls.receipt=cls.module.retire_screen_headers(cls.base);cls.mesh=build_candidate(PROFILE)
    def test_verified_sources_exact_cardinality(self):
        self.assertEqual(sha(self.base),BASE_SHA256)
        self.assertEqual(len(self.mask['triangles']),1736)
        self.assertEqual(len(self.mask['parts']),77)
        self.assertEqual(self.receipt['removedTriangles'],1736)
        self.assertEqual(self.mask['sourceProof']['maximumCoordinateError'],0)
        for path,digest in SOURCES.items(): self.assertEqual(sha((HERE.parents[2]/path).read_bytes()),digest)
        for part,(material,count) in EXPECTED_PARTS.items():
            rows=[r for r in self.mask['triangles'] if r['part']==part]
            self.assertEqual(sorted(r['sourceTriangleOrdinal'] for r in rows),list(range(count)))
            self.assertTrue(all(r['material']==material for r in rows))
    def test_all_attributes_and_non_target_views_byte_identical(self):
        before,old=chunks(self.base);after,new=chunks(self.result)
        indices={self.mask['materials'][m]['indexAccessor'] for m in EXPECTED}
        changed_views={before['accessors'][i]['bufferView'] for i in indices}
        self.assertEqual(len(old),len(new))
        for i in range(len(old)):
            if i not in changed_views:self.assertEqual(old[i],new[i],str(i))
        for i,(a,b) in enumerate(zip(before['accessors'],after['accessors'])):
            if i not in indices:self.assertEqual(a,b)
        for key in ('nodes','scenes','materials','meshes','textures','images','samplers','extensionsUsed'):
            self.assertEqual(before.get(key),after.get(key),key)
    def test_retained_index_bytes_exact_order(self):
        before,old=chunks(self.base);after,new=chunks(self.result)
        for material,info in self.mask['materials'].items():
            a=before['accessors'][info['indexAccessor']];vi=a['bufferView'];width={5123:2,5125:4}[a['componentType']]*3
            retired={r['triangleOrdinal'] for r in self.mask['triangles'] if r['material']==material}
            expected=b''.join(old[vi][j:j+width] for j in range(0,len(old[vi]),width) if j//width not in retired)
            self.assertEqual(new[vi],expected)
        actual=sum(len(t) for t in triangles(self.result).values());self.assertEqual(actual,17266-1736)
        self.assertEqual(actual+len(self.mesh['triangles']),17770)
        self.assertEqual(len(after['materials']),8)
    def test_immutable_mask_and_baseline_fail_closed(self):
        with self.assertRaises(ValueError):self.module.retire_screen_headers(self.base+b'\0')
        mask=(HERE/'retired_screen_header_faces.json').read_bytes()
        with self.assertRaises(ValueError):self.module.retire_screen_headers(self.base,mask+b' ')
        self.assertEqual(self.result,self.module.retire_screen_headers(self.base)[0])
    def test_exact_below_header_surfaces_bidirectionally(self):
        from taihe_caisson.geometry import _point_triangle
        original=triangles(self.base);new=self.mesh
        def clip(tri,y):
            out=[]
            for a,b in zip(tri,tri[1:]+tri[:1]):
                ina=a[1]<=y;inb=b[1]<=y
                if ina:out.append(a)
                if ina!=inb:
                    t=(y-a[1])/(b[1]-a[1]);out.append(tuple(a[k]+t*(b[k]-a[k]) for k in range(3)))
            return out
        for proof in new['metadata']['replacementSolids']:
            if '_rail' in proof['sourcePart']:continue # Entire old upper rail is intentionally replaced.
            old=[original[r['material']][r['triangleOrdinal']] for r in self.mask['triangles'] if r['part']==proof['sourcePart']]
            fresh=[tuple(new['vertices'][j] for j in new['triangles'][i]) for i in new['parts'][proof['replacementPart']]]
            header=proof['max'][1]
            # Sample each clipped polygon vertex, edge midpoint and centroid,
            # then reverse the comparison. This catches missing/interior faces,
            # not just matching bounds or planes.
            for source,target in ((old,fresh),(fresh,old)):
                for tri in source:
                    poly=clip(tri,header-1e-5)
                    if len(poly)<3:continue
                    ps=poly+[tuple((a[k]+b[k])/2 for k in range(3)) for a,b in zip(poly,poly[1:]+poly[:1])]+[tuple(sum(p[k] for p in poly)/len(poly) for k in range(3))]
                    for p in ps:self.assertLessEqual(min(_point_triangle(p,*t) for t in target),2e-9,(proof['sourcePart'],p))
    def test_aperture_disk_rays_clear_entire_retained_screen_depth(self):
        # Every decoded retained triangle participates, not merely the authored
        # crown mesh. Segment depth covers both old front and rear screen faces.
        kept=[t for ts in triangles(self.result).values() for t in ts]
        m=self.mesh;kept += [tuple(m['vertices'][j] for j in f) for f in m['triangles']]
        z0=PROFILE['screen']['z']-.22;z1=PROFILE['screen']['z']+.14
        def hit(tri,x,y):
            a,b,c=tri;det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(det)<1e-14:return False
            u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det;v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det
            return u>=-1e-10 and v>=-1e-10 and u+v<=1+1e-10 and z0<=u*a[2]+v*b[2]+(1-u-v)*c[2]<=z1
        for leaf in m['metadata']['leaves']:
            for p in leaf['apertures']:
                for radius in (0,p['radius']/2,p['radius']):
                    for a in range(16):
                        x=p['x']+radius*math.cos(a*math.tau/16);y=p['y']+radius*math.sin(a*math.tau/16)
                        self.assertFalse(any(hit(tri,x,y) for tri in kept),(leaf['index'],x,y))
class SculpturalRetirement(SemanticRetirement):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.mesh=build_candidate(PROFILE,crown_style='sculptural')

if __name__=='__main__':unittest.main(verbosity=2)
