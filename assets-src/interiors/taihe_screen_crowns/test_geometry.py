"""CPU-only screen crown candidate tests; no scene/browser/GPU execution."""
import copy
import importlib.util
import json
import math
import sys
import unittest
from collections import defaultdict
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
PROFILE = json.loads((HERE.parents[2] / 'data/architecture/taihe-core.json').read_text())

def load():
    spec = importlib.util.spec_from_file_location('screen_crowns_geometry', HERE/'geometry.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module

def sub(a,b): return tuple(x-y for x,y in zip(a,b))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def dot(a,b): return sum(x*y for x,y in zip(a,b))

class BuilderAvailability(unittest.TestCase):
    def test_bounded_builder_exists(self):
        self.assertTrue((HERE/'geometry.py').exists(), 'Missing bounded crown builder')

@unittest.skipUnless((HERE/'geometry.py').exists(), 'Builder not implemented yet')
class CrownGeometry(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.module=load(); cls.mesh=cls.module.build_candidate(PROFILE)
    def points(self,name):
        return [self.mesh['vertices'][j] for i in self.mesh['parts'][name] for j in self.mesh['triangles'][i]]
    def test_budget_materials_and_exact_ownership(self):
        m=self.mesh
        self.assertEqual(m['metadata']['removedTriangles'],1736)
        self.assertLessEqual(17266-1736+len(m['triangles']),17866)
        self.assertEqual(set(m['materials']),{'gold','darkGold','red'})
        self.assertEqual(sorted(i for faces in m['parts'].values() for i in faces),list(range(len(m['triangles']))))
        self.assertEqual(len(m['metadata']['leaves']),7)
    def test_finite_geometry_positive_volume_consistent_winding(self):
        m=self.mesh
        for p in m['vertices']: self.assertTrue(all(math.isfinite(x) for x in p))
        for f,n in zip(m['triangles'],m['normals']):
            self.assertEqual(len(set(f)),3)
            a,b,c=[m['vertices'][i] for i in f]; normal=cross(sub(b,a),sub(c,a))
            self.assertGreater(dot(normal,normal),1e-20); self.assertAlmostEqual(dot(n,n),1,places=10)
            self.assertGreater(dot(normal,n),0)
        for component in m['metadata']['components']:
            if component['kind']=='relief':
                self.assertTrue(all(m['normals'][i][2]<0 for i in component['triangles']))
                continue
            edges=defaultdict(list); faces=[m['triangles'][i] for i in component['triangles']]
            for a,b,c in faces:
                for u,v in ((a,b),(b,c),(c,a)): edges[tuple(sorted((u,v)))].append((u,v))
            self.assertTrue(all(len(e)==2 and e[0]==e[1][::-1] for e in edges.values()),component['name'])
            origin=m['vertices'][faces[0][0]]
            volume=sum(dot(sub(m['vertices'][f[0]],origin),cross(sub(m['vertices'][f[1]],origin),sub(m['vertices'][f[2]],origin))) for f in faces)/6
            self.assertGreater(volume,1e-10,component['name'])
    def test_original_estimated_envelope_steps_and_registration(self):
        s=PROFILE['screen']; sw=s['width']/7
        for leaf in self.mesh['metadata']['leaves']:
            i=leaf['index']; x=(i-3)*sw; top=s['baseY']+s['height']-abs(i-3)*.33
            self.assertEqual(leaf['topY'],top)
            ps=[p for name in self.mesh['parts'] if name.startswith(f'screen_{i}_') and not (i==3 and name.endswith('_open_crown')) for p in self.points(name)]
            all_ps=[p for name in self.mesh['parts'] if name.startswith(f'screen_{i}_') for p in self.points(name)]
            self.assertGreaterEqual(min(p[0] for p in ps),x-sw/2+.0075-2e-7)
            self.assertLessEqual(max(p[0] for p in ps),x+sw/2-.0075+2e-7)
            self.assertGreaterEqual(min(p[1] for p in ps),s['baseY']-1e-7)
            self.assertAlmostEqual(max(p[1] for p in all_ps),top,places=9)
            self.assertGreaterEqual(min(p[2] for p in ps),s['z']-.22)
            self.assertLessEqual(max(p[2] for p in ps),s['z']+.14)
    def test_four_distinct_crown_designs_with_mirrored_flanks(self):
        leaves=self.mesh['metadata']['leaves']
        self.assertEqual([l['variant'] for l in leaves],['outer','middle','inner','central','inner','middle','outer'])
        def normalized(i,mirror=1):
            x=(i-3)*.6; top=leaves[i]['topY']
            return sorted(set((round(mirror*(p[0]-x),9),round(p[1]-top,9),round(p[2],9)) for p in self.points(f'screen_{i}_open_crown')))
        for i in range(3): self.assertEqual(normalized(i,-1),normalized(6-i))
        self.assertEqual(normalized(3,-1),normalized(3))
        self.assertEqual(len({str(normalized(i)) for i in range(4)}),4)
    def test_central_upper_crown_spans_estimated_two_leaf_widths_only(self):
        ps=self.points('screen_3_open_crown');span=max(p[0] for p in ps)-min(p[0] for p in ps)
        self.assertGreaterEqual(span,1.8*(4.2/7-.015))
        self.assertLessEqual(span,2*(4.2/7-.015))
        top=self.mesh['metadata']['leaves'][3]['topY']
        roots=[p for p in ps if p[1]<=top-.35]
        self.assertLessEqual(max(abs(p[0]) for p in roots),.2925)
        from taihe_caisson.geometry import _triangle_distance,_bounds,_bounds_distance
        m=self.mesh;central=[tuple(m['vertices'][j] for j in m['triangles'][i]) for i in m['parts']['screen_3_open_crown']]
        for i in (2,4):
            flank=[tuple(m['vertices'][j] for j in m['triangles'][k]) for k in m['parts'][f'screen_{i}_open_crown']]
            candidates=[(a,b) for a in central for b in flank if _bounds_distance(_bounds(a),_bounds(b))<.020]
            self.assertTrue(all(_triangle_distance(a,b)>.015 for a,b in candidates),'Crowns intersect or crowd adjacent leaves')
    def test_declared_apertures_are_open_in_new_mesh(self):
        for leaf in self.mesh['metadata']['leaves']:
            self.assertGreaterEqual(len(leaf['apertures']),2)
            for aperture in leaf['apertures']:
                self.assertGreaterEqual(aperture['radius'],.015)
                for a in range(16):
                    x=aperture['x']+aperture['radius']*math.cos(a*math.tau/16)
                    y=aperture['y']+aperture['radius']*math.sin(a*math.tau/16)
                    self.assertFalse(self.module.projected_hits(self.mesh,x,y), (leaf['index'],aperture,x,y))
    def test_every_crown_component_has_root_intersection(self):
        from taihe_caisson.geometry import _triangle_distance
        m=self.mesh
        for leaf in m['metadata']['leaves']:
            stem=f"screen_{leaf['index']}_"
            base=[tuple(m['vertices'][j] for j in m['triangles'][i]) for name in m['parts'] if name.startswith(stem) and name!=stem+'open_crown' for i in m['parts'][name]]
            components=[c for c in m['metadata']['components'] if c['name']==stem+'open_crown']
            pending=components[:]
            while pending:
                found=False
                for c in pending[:]:
                    tris=[tuple(m['vertices'][j] for j in m['triangles'][i]) for i in c['triangles']]
                    # Exact triangle intersection; bounding boxes only prune comparisons, never select retirement faces.
                    pairs=((a,b) for a in tris for b in base if all(max(min(p[k] for p in a),min(p[k] for p in b))<=min(max(p[k] for p in a),max(p[k] for p in b))+1e-8 for k in range(3)))
                    if any(_triangle_distance(a,b)<1e-8 for a,b in pairs):
                        base+=tris; pending.remove(c); found=True
                self.assertTrue(found,'Disconnected crown components: '+str(leaf['index']))
    def test_determinism_and_reject_unsupported_profile(self):
        p=copy.deepcopy(PROFILE); self.assertEqual(self.mesh,self.module.build_candidate(p)); self.assertEqual(p,PROFILE)
        for section,key,value in [('screen','panels',6),('screen','width',4.3),('screen','z',float('nan')),('screen','z',13.6),('screen','baseY',2.07),('screen','depth',.24)]:
            p=copy.deepcopy(PROFILE); p[section][key]=value
            with self.assertRaises(ValueError): self.module.build_candidate(p)
        with self.assertRaises(ValueError): self.module.build_candidate(PROFILE,'fallback')
class SculpturalAlternativeContract(unittest.TestCase):
    def test_comparable_section_alternative_exists(self):
        import inspect
        self.assertIn('crown_style',inspect.signature(load().build_candidate).parameters,'Missing bounded section alternative')

import inspect
@unittest.skipUnless('crown_style' in inspect.signature(load().build_candidate).parameters,'Alternative not implemented yet')
class SculpturalAlternative(CrownGeometry):
    @classmethod
    def setUpClass(cls):cls.module=load();cls.mesh=cls.module.build_candidate(PROFILE,crown_style='sculptural')
    def test_determinism_and_reject_unsupported_profile(self):
        p=copy.deepcopy(PROFILE)
        self.assertEqual(self.mesh,self.module.build_candidate(p,crown_style='sculptural'))
        self.assertEqual(p,PROFILE)
        with self.assertRaises(ValueError):self.module.build_candidate(PROFILE,crown_style='unknown')
    def test_same_triangle_count_broader_main_sections(self):
        original=self.module.build_candidate(PROFILE,crown_style='outline')
        self.assertEqual(len(original['triangles']),len(self.mesh['triangles']))
        self.assertEqual(original['materials'],self.mesh['materials'])
        self.assertEqual(self.mesh['metadata']['crownStyle'],'sculptural')
        self.assertEqual(self.mesh['metadata']['mainSectionScale'],1.65)
        self.assertNotEqual(original['vertices'],self.mesh['vertices'])

if __name__=='__main__': unittest.main(verbosity=2)
