"""Focused CPU shell contracts. Run directly; owner runs the project suite."""
import copy
import importlib.util
import json
import math
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
C = json.loads((ROOT/'data/architecture/taihe-core.json').read_text())['caisson']


def load(name):
    p = HERE/(name+'.py')
    if not p.exists():
        raise AssertionError('Missing shell implementation: '+str(p))
    spec = importlib.util.spec_from_file_location('caisson_'+name, p)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sub(a,b): return tuple(x-y for x,y in zip(a,b))
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])


class ShellTests(unittest.TestCase):
    def setUp(self): self.api = load('shell')

    def test_budget_determinism_contract_and_profile_immutability(self):
        before = copy.deepcopy(C)
        for quality,expected in [('detail',472),('fallback',48)]:
            mesh = self.api.build_shell(C,quality)
            self.assertEqual(mesh,self.api.build_shell(C,quality))
            self.assertEqual(len(mesh['triangles']),expected)
            self.assertEqual(set(mesh),{'vertices','triangles','normals','materials','parts','metadata'})
            self.assertEqual(len(mesh['triangles']),len(mesh['normals']))
            self.assertEqual(len(mesh['triangles']),len(mesh['materials']))
            self.assertEqual(set(mesh['materials']),{'gold','darkGold'})
            self.assertEqual(mesh['metadata']['proportions'],'estimated, not conservation measurements')
            self.assertEqual(sorted(i for ids in mesh['parts'].values() for i in ids),list(range(expected)))
        self.assertEqual(C,before)

    def test_finite_unique_nondegenerate_downward_or_cavity_facing(self):
        for quality in ('detail','fallback'):
            m = self.api.build_shell(C,quality)
            seen = set()
            for i,tri in enumerate(m['triangles']):
                self.assertEqual(len(set(tri)),3)
                canonical = tuple(sorted(tri))
                self.assertNotIn(canonical,seen)
                seen.add(canonical)
                a,b,c = [m['vertices'][k] for k in tri]
                self.assertTrue(all(math.isfinite(v) for p in (a,b,c) for v in p))
                n = cross(sub(b,a),sub(c,a))
                self.assertGreater(dot(n,n),1e-16)
                self.assertAlmostEqual(dot(m['normals'][i],m['normals'][i]),1,places=10)
                self.assertGreater(dot(n,m['normals'][i]),0)
                self.assertLessEqual(n[1],1e-10)
                if abs(n[1]) < 1e-10:
                    p=tuple((a[k]+b[k]+c[k])/3 for k in range(3))
                    self.assertLess(n[0]*p[0]+n[2]*(p[2]-C['z']),0)
            rounded=[tuple(round(v,10) for v in p) for p in m['vertices']]
            self.assertEqual(len(set(rounded)),len(rounded))

    def test_exact_open_boundaries_and_consistent_shared_edges(self):
        for quality,n in [('detail',32),('fallback',8)]:
            m=self.api.build_shell(C,quality)
            edges={}
            for tri in m['triangles']:
                for u,v in zip(tri,tri[1:]+tri[:1]): edges.setdefault(tuple(sorted((u,v))),[]).append((u,v))
            boundary=set()
            for e,uses in edges.items():
                self.assertLessEqual(len(uses),2,(quality,e,uses))
                if len(uses)==2: self.assertEqual(uses[0],uses[1][::-1],(quality,e))
                else: boundary.update(e)
            expected=[]
            for k in range(n):
                a=k*math.tau/n; r=(C['nominalSpan']/2-.16)/max(abs(math.cos(a)),abs(math.sin(a)))
                expected.extend([(r*math.cos(a),C['rimY']+.12,C['z']+r*math.sin(a)),(1.12*math.cos(a),C['topY']-.03,C['z']+1.12*math.sin(a))])
            roundpoint=lambda p:tuple(round(x,8) for x in p)
            self.assertEqual({roundpoint(m['vertices'][i]) for i in boundary},{roundpoint(p) for p in expected})
            self.assertGreaterEqual(min(v[1] for v in m['vertices']),C['rimY']+.12-1e-10)
            self.assertLessEqual(max(v[1] for v in m['vertices']),C['topY']-.03+1e-10)

    def test_authored_panel_faces_are_planar_and_recessed(self):
        m=self.api.build_shell(C)
        panels=m['metadata']['planarPanels']
        self.assertEqual(len(panels),8)
        self.assertEqual(sorted(len(p['boundary']) for p in panels),[3]*4+[4]*4)
        for panel in panels:
            for loop in ('boundary','inset','floor'):
                points=[m['vertices'][i] for i in panel[loop]]
                n=cross(sub(points[1],points[0]),sub(points[2],points[0]))
                for p in points: self.assertLess(abs(dot(n,sub(p,points[0]))),1e-10)
            for a,b in zip(panel['inset'],panel['floor']):
                self.assertGreater(m['vertices'][b][1],m['vertices'][a][1]-.03)
            self.assertGreater(panel['recessDepth'],0)
        # A warped quad must never silently become a smoothed moulding face.
        for quad in m['metadata']['planarQuads']:
            points=[m['vertices'][i] for i in quad]
            n=cross(sub(points[1],points[0]),sub(points[2],points[0]))
            self.assertLess(abs(dot(n,sub(points[3],points[0]))),1e-10)

    def test_no_nonadjacent_surface_intersections(self):
        geo=load('geometry')
        for quality in ('detail','fallback'):
            m=self.api.build_shell(C,quality)
            ts=[tuple(m['vertices'][j] for j in f) for f in m['triangles']]
            boxes=[geo._bounds(t) for t in ts]
            for i,tri in enumerate(ts):
                for j in range(i):
                    if set(m['triangles'][i]).intersection(m['triangles'][j]):continue
                    if geo._bounds_distance(boxes[i],boxes[j])>1e-10:continue
                    self.assertGreater(geo._triangle_distance(tri,ts[j]),1e-9,(quality,i,j))

    def test_no_projected_overlap_even_for_vertex_adjacent_panels(self):
        # The cavity is a height field plus vertical fascias. All nonvertical
        # facets tile its XZ annulus without positive-area projected overlap.
        # Unlike the 3D distance test, shared vertices do not skip this check.
        def cross2(a,b):return a[0]*b[1]-a[1]*b[0]
        def delta(a,b):return (a[0]-b[0],a[1]-b[1])
        def area(poly):
            return abs(sum(cross2(a,b) for a,b in zip(poly,poly[1:]+poly[:1])))/2 if len(poly)>2 else 0
        def intersection(subject,clip):
            if cross2(delta(clip[1],clip[0]),delta(clip[2],clip[0]))<0:clip=clip[::-1]
            for a,b in zip(clip,clip[1:]+clip[:1]):
                result=[]
                for p,q in zip(subject,subject[1:]+subject[:1]):
                    dp=cross2(delta(b,a),delta(p,a));dq=cross2(delta(b,a),delta(q,a))
                    if dp>=-1e-12:result.append(p)
                    if (dp>=-1e-12)!=(dq>=-1e-12):
                        t=dp/(dp-dq);result.append((p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])))
                subject=result
                if not subject:break
            return area(subject)
        for quality in ('detail','fallback'):
            mesh=self.api.build_shell(C,quality)
            projected=[[(mesh['vertices'][i][0],mesh['vertices'][i][2]) for i in f] for f in mesh['triangles']]
            boxes=[(min(p[0] for p in t),min(p[1] for p in t),max(p[0] for p in t),max(p[1] for p in t)) for t in projected]
            for i,a in enumerate(projected):
                if area(a)<1e-10:continue
                for j,b in enumerate(projected[:i]):
                    if area(b)<1e-10:continue
                    aa,bb=boxes[i],boxes[j]
                    if aa[0]>bb[2]+1e-10 or bb[0]>aa[2]+1e-10 or aa[1]>bb[3]+1e-10 or bb[1]>aa[3]+1e-10:continue
                    self.assertLess(intersection(a,b),1e-9,(quality,i,j))
            n=32 if quality=='detail' else 8
            expected=(C['nominalSpan']- .32)**2-n*.5*1.12**2*math.sin(math.tau/n)
            self.assertAlmostEqual(sum(area(t) for t in projected),expected,places=8)

    def test_current_dragon_has_positive_actual_triangle_clearance(self):
        geo=load('geometry')
        for quality in ('detail','fallback'):
            shell=self.api.build_shell(C,quality)
            dragon=geo.build_candidate(C,quality)
            report=self.api.dragon_clearance(shell,dragon)
            self.assertEqual(report['surfaceIntersections'],0,report)
            self.assertGreater(report['clearance'],.025,report)

    def test_invalid_quality_and_profile_are_rejected(self):
        with self.assertRaises(ValueError):self.api.build_shell(C,'unknown')
        for key,value in [('topY',float('nan')),('nominalSpan',4),('nominalSpan',5.5),('rimY',float('inf'))]:
            invalid=dict(C);invalid[key]=value
            with self.assertRaises(ValueError):self.api.build_shell(invalid)


if __name__ == '__main__': unittest.main()
