"""Geometry-only acceptance tests. No browser, Blender, GPU or asset writes."""
import copy
import importlib.util
import json
import math
import unittest
from collections import defaultdict
from pathlib import Path
HERE = Path(__file__).resolve().parent
PROFILE = json.loads((HERE.parents[2] / 'data/architecture/taihe-core.json').read_text())
def load_builder():
    path = HERE / 'geometry.py'
    assert path.exists(), 'Missing bounded Taihe furniture geometry builder'
    spec = importlib.util.spec_from_file_location('taihe_furniture_geometry', path)
    module = importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module
def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def cross(a,b):return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def dot(a,b):return sum(x*y for x,y in zip(a,b))
class BuilderContractTest(unittest.TestCase):
    def test_builder_is_available(self):
        self.assertTrue((HERE/'geometry.py').exists(),'Missing bounded Taihe furniture geometry builder')
@unittest.skipUnless((HERE/'geometry.py').exists(),'Builder is not implemented yet')
class FurnitureGeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module=load_builder();cls.mesh=cls.module.build_candidate(PROFILE)
    def points(self,names):
        ids={v for name in names for i in self.mesh['parts'][name] for v in self.mesh['triangles'][i]}
        return [self.mesh['vertices'][i] for i in ids]
    def test_budget_and_existing_material_tags(self):
        mesh=self.mesh
        self.assertGreater(len(mesh['triangles']),1800)
        self.assertLessEqual(len(mesh['triangles']),3000)
        self.assertLessEqual(14582+len(mesh['triangles']),18000)
        self.assertEqual(set(mesh['materials']),{'gold','darkGold'})
        self.assertEqual(len(mesh['triangles']),len(mesh['materials']))
        owned=[i for indices in mesh['parts'].values() for i in indices]
        self.assertEqual(sorted(owned),list(range(len(mesh['triangles']))))
    def test_finite_nondegenerate_normals(self):
        mesh=self.mesh
        for point in mesh['vertices']:
            self.assertEqual(len(point),3);self.assertTrue(all(math.isfinite(v) for v in point))
        for face,normal in zip(mesh['triangles'],mesh['normals']):
            self.assertEqual(len(set(face)),3)
            self.assertTrue(all(type(i)is int and 0<=i<len(mesh['vertices']) for i in face))
            a,b,c=[mesh['vertices'][i] for i in face]
            n=cross(sub(b,a),sub(c,a));area2=math.sqrt(dot(n,n))
            self.assertGreater(area2,1e-10)
            self.assertAlmostEqual(dot(normal,normal),1,places=10)
            self.assertGreater(dot(n,normal),area2*(1-1e-10))
    def test_ribbon_faces_front_and_closed_components_oriented(self):
        for component in self.mesh['metadata']['components']:
            faces=[self.mesh['triangles'][i] for i in component['triangles']]
            if component['kind']=='relief':
                for i in component['triangles']:
                    self.assertLess(self.mesh['normals'][i][2],-.03,component['name'])
            else:
                edges=defaultdict(list)
                for a,b,c in faces:
                    for u,v in ((a,b),(b,c),(c,a)):edges[tuple(sorted((u,v)))].append((u,v))
                self.assertTrue(all(len(e)==2 and e[0]==e[1][::-1] for e in edges.values()),component['name'])
                origin=self.mesh['vertices'][faces[0][0]]
                volume=sum(dot(sub(self.mesh['vertices'][f[0]],origin),cross(sub(self.mesh['vertices'][f[1]],origin),sub(self.mesh['vertices'][f[2]],origin))) for f in faces)/6
                self.assertGreater(volume,1e-10,component['name'])
    def test_throne_back_is_narrow_and_open(self):
        p=PROFILE['throne'];seat=p['baseY']+p['seatHeight'];top=p['baseY']+p['overallHeight']
        names=[n for n in self.mesh['parts'] if n.startswith('throne_') and not n.startswith('throne_waist')]
        points=self.points(names)
        above_seat=self.points([n for n in names if n!='throne_open_uprights'])
        self.assertGreaterEqual(min(v[1] for v in above_seat),seat-1e-9)
        self.assertGreaterEqual(min(v[1] for v in self.points(['throne_open_uprights'])),seat-.12)
        self.assertLessEqual(max(v[1] for v in points),top+1e-9)
        self.assertAlmostEqual(max(v[1] for v in points),top,places=8)
        self.assertLessEqual(max(abs(v[0]) for v in points),.79)
        self.assertGreaterEqual(min(v[2] for v in points),p['z']-.395)
        self.assertLessEqual(max(v[2] for v in points),p['z']+.52)
        solid=self.points(['throne_central_panel'])
        self.assertGreaterEqual(max(v[0] for v in solid)-min(v[0] for v in solid),.50)
        self.assertLessEqual(max(v[0] for v in solid)-min(v[0] for v in solid),.65)
        self.assertGreater(len(self.mesh['parts']['throne_open_surround']),100)
        self.assertEqual(self.mesh['metadata']['centralBackWidthEstimate'],.58)
    def attachment_components(self):
        return [[tuple(self.mesh['vertices'][v] for v in self.mesh['triangles'][i])
                 for i in component['triangles']]
                for component in self.mesh['metadata']['components']
                if component['name']=='throne_open_uprights']
    def triangle_distance(self,a,b):
        if not hasattr(self,'_distance_module'):
            spec=importlib.util.spec_from_file_location('taihe_distance_kernel',HERE.parent/'taihe_caisson/geometry.py')
            self._distance_module=importlib.util.module_from_spec(spec);spec.loader.exec_module(self._distance_module)
        return self._distance_module._triangle_distance(a,b)
    def test_uprights_intersect_unchanged_seat(self):
        p=PROFILE['throne'];top=p['baseY']+p['seatHeight']
        lo=(-p['seatWidth']/2,top-.12,p['z']-p['seatDepth']/2)
        hi=(p['seatWidth']/2,top,p['z']+p['seatDepth']/2)
        vertices=[(x,y,z) for x in (lo[0],hi[0]) for y in (lo[1],hi[1]) for z in (lo[2],hi[2])]
        quads=[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]
        seat=[tuple(vertices[i] for i in tri) for a,b,c,d in quads for tri in ((a,b,c),(a,c,d))]
        components=self.attachment_components();self.assertEqual(len(components),2)
        for triangles in components:
            self.assertLess(min(self.triangle_distance(a,b) for a in triangles for b in seat),1e-9)
            self.assertTrue(any(all(lo[k]+1e-8<v[k]<hi[k]-1e-8 for k in range(3)) for tri in triangles for v in tri))
    def test_uprights_intersect_surround(self):
        surround=[tuple(self.mesh['vertices'][v] for v in self.mesh['triangles'][i]) for i in self.mesh['parts']['throne_open_surround']]
        for triangles in self.attachment_components():
            self.assertLess(min(self.triangle_distance(a,b) for a in triangles for b in surround),1e-9)

    def test_seven_screen_fields_fit_retained_leaf_envelopes(self):
        p=PROFILE['screen'];w=p['width']/p['panels'];base=p['baseY']
        for i in range(7):
            names=[name for name in self.mesh['parts'] if name.startswith(f'screen_{i}_')]
            self.assertTrue(all(any(name.endswith(suffix) for name in names) for suffix in ('register_frames','main_relief','lower_relief','crest_curls')))
            points=self.points(names);cx=(i-3)*w;top=base+p['height']-abs(i-3)*.33
            self.assertGreaterEqual(min(v[0] for v in points),cx-w/2+.0075-1e-9)
            self.assertLessEqual(max(v[0] for v in points),cx+w/2-.0075+1e-9)
            self.assertGreaterEqual(min(v[1] for v in points),base)
            self.assertLessEqual(max(v[1] for v in points),top+1e-9)
            self.assertGreaterEqual(min(v[2] for v in points),p['z']-.22)
            self.assertLessEqual(max(v[2] for v in points),p['z']+.11)
    def test_screen_main_relief_fits_clear_inner_frame(self):
        p=PROFILE['screen'];w=p['width']/7;base=p['baseY']
        inset_half_width=.195-.013/2
        for i in range(7):
            points=self.points([f'screen_{i}_main_relief'])
            cx=(i-3)*w;top=base+p['height']-abs(i-3)*.33
            self.assertGreaterEqual(min(v[0] for v in points),cx-inset_half_width-1e-9)
            self.assertLessEqual(max(v[0] for v in points),cx+inset_half_width+1e-9)
            self.assertGreaterEqual(min(v[1] for v in points),base+.79+.013/2-1e-9)
            self.assertLessEqual(max(v[1] for v in points),top-.83-.013/2+1e-9)

    def test_waist_stays_over_existing_backing(self):
        p=PROFILE['throne'];points=self.points([n for n in self.mesh['parts'] if n.startswith('throne_waist')])
        half=(p['seatWidth']-.12)/2
        self.assertLessEqual(max(abs(v[0]) for v in points),half)
        self.assertGreaterEqual(min(v[1] for v in points),p['baseY']+.26-1e-9)
        self.assertLessEqual(max(v[1] for v in points),p['baseY']+.42+1e-9)
        front=p['z']-(p['seatDepth']-.08)/2
        self.assertLess(max(v[2] for v in points),front)
        self.assertGreaterEqual(min(v[2] for v in points),front-.04)
    def test_corner_softening_keeps_endpoints_inside_path_hull(self):
        self.assertTrue(hasattr(self.module,'_soften'),'Missing bounded curve corner refinement')
        points=[(0,0),(1,0),(1,1),(2,1)]
        rounded=self.module._soften(points,{1,2})
        self.assertEqual(rounded[0],points[0]);self.assertEqual(rounded[-1],points[-1])
        self.assertEqual(len(rounded),6)
        self.assertTrue(all(0<=p[0]<=2 and 0<=p[1]<=1 for p in rounded))
        self.assertEqual(points,[(0,0),(1,0),(1,1),(2,1)])
    def test_reproducible_without_profile_mutation(self):
        profile=copy.deepcopy(PROFILE)
        self.assertEqual(self.mesh,self.module.build_candidate(profile));self.assertEqual(profile,PROFILE)
        bad=copy.deepcopy(PROFILE);bad['screen']['panels']=6
        with self.assertRaises(ValueError):self.module.build_candidate(bad)
        bad=copy.deepcopy(PROFILE);bad['throne']['z']=float('nan')
        with self.assertRaises(ValueError):self.module.build_candidate(bad)
        with self.assertRaises(ValueError):self.module.build_candidate(PROFILE,'fallback')
if __name__=='__main__':unittest.main(verbosity=2)
