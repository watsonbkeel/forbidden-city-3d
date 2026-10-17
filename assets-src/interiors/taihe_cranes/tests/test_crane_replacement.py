"""Geometry-only regression tests for the bounded S crane shape replacement."""
from collections import Counter, defaultdict
from copy import deepcopy
import hashlib
import importlib.util
import json
from math import dist, isfinite
from pathlib import Path
import sys
import unittest

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parents[2]
APPROVED = ROOT / 'assets-src/interiors/taihe_display/approved'
sys.path.insert(0, str(APPROVED))
from mesh_kernel import cross, dot, sub, unit
from taihe_display_pairs import build_display_pairs

spec = importlib.util.spec_from_file_location('contact_guards', ROOT / 'tests/lib/taihe-display-geometry-guards.py')
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)

MODULE = HERE / 'crane_replacement.py'
if MODULE.is_file():
    spec = importlib.util.spec_from_file_location('crane_replacement', MODULE)
    candidate = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(candidate)
else:
    candidate = None

SELECTED = {'white_enamel_body', 'white_rising_neck', 'white_small_head', 'green_folded_wing', 'red_crown'}
MATERIALS = {'white_enamel_body': 'pearl', 'white_rising_neck': 'pearl', 'white_small_head': 'pearl', 'green_folded_wing': 'teal', 'red_crown': 'red'}
BASE = next(item for item in build_display_pairs('S') if item['id'] == 'crane:left')


def faces(mesh, name):
    return guard.tris(mesh, {name})


def combined(replacement):
    result = deepcopy(BASE)
    old = result['local_mesh']
    keep = [i for i, name in enumerate(old['components']) if name not in SELECTED]
    for key in ('triangles', 'components', 'materials'):
        old[key] = [old[key][i] for i in keep]
    offset = len(old['vertices'])
    old['vertices'].extend(deepcopy(replacement['vertices']))
    old['triangles'].extend([[offset + j for j in face] for face in replacement['triangles']])
    for key in ('components', 'materials'):
        old[key].extend(replacement[key])
    return result


class CraneReplacementTests(unittest.TestCase):
    def mesh(self):
        self.assertIsNotNone(candidate, 'the bounded replacement API does not exist yet')
        return candidate.build_crane_replacement().data()

    def test_exact_component_material_and_triangle_contract(self):
        mesh = self.mesh()
        self.assertEqual(set(mesh['components']), SELECTED)
        self.assertEqual(Counter(mesh['components']), {
            'white_enamel_body': 116, 'white_rising_neck': 72,
            'white_small_head': 60, 'green_folded_wing': 16, 'red_crown': 8})
        self.assertTrue(all(MATERIALS[name] == key for name, key in zip(mesh['components'], mesh['materials'])))
        self.assertEqual(mesh['two_sided_pairs'], [])
        self.assertLessEqual(2 * len(mesh['triangles']), 574)
        self.assertEqual(17770 - 374 + 2 * len(mesh['triangles']), 17940)

    def test_deterministic_fresh_mesh_and_pinned_source_unchanged(self):
        before = {name: hashlib.sha256((APPROVED / name).read_bytes()).hexdigest()
                  for name in ('mesh_kernel.py', 'taihe_display_pairs.py')}
        first = self.mesh()
        second = self.mesh()
        self.assertEqual(json.dumps(first, sort_keys=True), json.dumps(second, sort_keys=True))
        first['vertices'][0][0] += 9
        first['corner_normals'][0][0][0] += 9
        self.assertEqual(self.mesh(), second)
        self.assertEqual(before, {name: hashlib.sha256((APPROVED / name).read_bytes()).hexdigest() for name in before})
        self.assertEqual(BASE, next(item for item in build_display_pairs('S') if item['id'] == 'crane:left'))

    def test_fixed_anchors_retained_geometry_and_envelope(self):
        mesh = self.mesh()
        joined = combined(mesh)
        self.assertEqual(joined['anchors'], BASE['anchors'])
        self.assertEqual(joined['translation'], [-2.8, 2.06, 10.2])
        self.assertEqual(joined['scale'], [1, 1, 1])
        old = BASE['local_mesh']
        new = joined['local_mesh']
        for name in set(old['components']) - SELECTED:
            self.assertEqual(faces(new, name), faces(old, name))
        used = [new['vertices'][j] for tri in new['triangles'] for j in tri]
        self.assertAlmostEqual(max(p[1] for p in used), 1.78)
        self.assertAlmostEqual(min(p[1] for p in used), 0)
        self.assertTrue(all(-.30 <= x <= .30 and 0 <= y <= 1.78 and -.41 <= z <= .41 for x, y, z in used))
        self.assertEqual(min(p[2] for p in used), -.41)
        self.assertAlmostEqual(max(p[2] for p in used), .32)

    def test_actual_leg_beak_neck_wing_and_crown_contacts(self):
        mesh = self.mesh()
        joined = combined(mesh)
        guard.validate_crane_contacts(joined)
        body, head = faces(mesh, 'white_enamel_body'), faces(mesh, 'white_small_head')
        neck = guard.points(mesh, {'white_rising_neck'})
        self.assertTrue(all(guard.inside(p, body) for p in neck[:9]))
        self.assertTrue(all(guard.inside(p, head) for p in neck[-9:]))
        for wing in guard.groups(mesh, 'green_folded_wing'):
            self.assertTrue(any(guard.inside(p, body) for p in wing))
        crown = guard.points(mesh, {'red_crown'})
        self.assertTrue(any(guard.inside(p, head) for p in crown))
        self.assertLessEqual(max(p[1] for p in crown) - min(p[1] for p in crown), .025)

    def test_closed_components_and_only_buried_neck_open_rings(self):
        mesh = self.mesh()
        for name in SELECTED:
            self.assertEqual(len(guard.groups(mesh, name)), 2 if name == 'green_folded_wing' else 1)
            edges = Counter()
            directions = Counter()
            for tri, component in zip(mesh['triangles'], mesh['components']):
                if component != name:
                    continue
                for a, b in zip(tri, tri[1:] + tri[:1]):
                    edges[tuple(sorted((a, b)))] += 1
                    directions[(a, b)] += 1
            self.assertTrue(all(count <= 2 for count in edges.values()))
            for (a, b), count in edges.items():
                if count == 2:
                    self.assertEqual(directions[(a, b)], directions[(b, a)])
            self.assertEqual(sum(count == 1 for count in edges.values()), 18 if name == 'white_rising_neck' else 0)
        guard.validate_declared_pairs(mesh)

    def test_outward_winding_of_solid_components_and_neck(self):
        mesh = self.mesh()
        for name in SELECTED - {'white_rising_neck'}:
            for group in guard.groups(mesh, name):
                centre = guard.mean(list(group))
                for tri in faces(mesh, name):
                    if not set(guard.unique(tri)) <= group:
                        continue
                    a, b, c = tri
                    self.assertGreater(dot(cross(sub(b, a), sub(c, a)), sub(guard.mean(tri), centre)), 1e-12)
        centres = candidate.NECK_CENTRES
        ids = [i for i, name in enumerate(mesh['components']) if name == 'white_rising_neck']
        for local, i in enumerate(ids):
            ring = local // 18
            centre = guard.mean(centres[ring:ring + 2])
            tri = [mesh['vertices'][j] for j in mesh['triangles'][i]]
            a, b, c = tri
            self.assertGreater(dot(cross(sub(b, a), sub(c, a)), sub(guard.mean(tri), centre)), 1e-12)

    def test_normals_are_finite_unit_outward_and_component_local(self):
        mesh = self.mesh()
        self.assertEqual(len(mesh['corner_normals']), len(mesh['triangles']))
        self.assertEqual(len(mesh['normal_domains']), len(mesh['triangles']))
        observed = defaultdict(list)
        smooth_faces = 0
        for tri, normals, name, domain in zip(mesh['triangles'], mesh['corner_normals'], mesh['components'], mesh['normal_domains']):
            a, b, c = [mesh['vertices'][j] for j in tri]
            face_normal = unit(cross(sub(b, a), sub(c, a)))
            self.assertEqual(len(normals), 3)
            self.assertTrue(domain.startswith(name + ':'))
            for vertex, normal in zip(tri, normals):
                self.assertTrue(all(isfinite(value) for value in normal))
                self.assertAlmostEqual(dot(normal, normal), 1, places=12)
                self.assertGreater(dot(normal, face_normal), .1)
                observed[(vertex, domain)].append(normal)
            smooth_faces += int(any(dist(normal, face_normal) > .01 for normal in normals))
        self.assertGreater(smooth_faces, 200)
        self.assertTrue(all(all(dist(v[0], normal) < 1e-12 for normal in v) for v in observed.values()))

    def test_end_caps_and_belly_seams_keep_hard_normals(self):
        mesh = self.mesh()
        observed = defaultdict(dict)
        for tri, normals, domain in zip(mesh['triangles'], mesh['corner_normals'], mesh['normal_domains']):
            for vertex, normal in zip(tri, normals):
                observed[vertex][domain] = normal
        for name in ('white_enamel_body', 'white_small_head'):
            hard = [values for values in observed.values() if name + ':side' in values and any(':cap_' in domain for domain in values)]
            self.assertGreater(len(hard), 0)
            for values in hard:
                for domain, normal in values.items():
                    if ':cap_' in domain:
                        self.assertLess(dot(values[name + ':side'], normal), .95)
        self.assertIn('white_enamel_body:belly', mesh['normal_domains'])

    def test_body_profile_is_long_oval_and_neck_is_not_deep_s_shape(self):
        mesh = self.mesh()
        body = guard.points(mesh, {'white_enamel_body'})
        self.assertGreater(max(p[2] for p in body) - min(p[2] for p in body), .5)
        self.assertLessEqual(max(p[0] for p in body) - min(p[0] for p in body), .30)
        centres = candidate.NECK_CENTRES
        self.assertTrue(all(b[1] > a[1] for a, b in zip(centres, centres[1:])))
        self.assertLessEqual(max(p[2] for p in centres) - min(p[2] for p in centres), .035)
        self.assertTrue(all(p[0] == 0 for p in centres))

    def test_folded_wing_outer_panels_are_not_hidden_as_disconnected_patches(self):
        mesh = self.mesh()
        body = faces(mesh, 'white_enamel_body')
        for tri, domain in zip(mesh['triangles'], mesh['normal_domains']):
            if not domain.startswith('green_folded_wing:') or not domain.endswith('_outer'):
                continue
            vertices = [mesh['vertices'][j] for j in tri]
            subdivisions = 12
            for a in range(subdivisions + 1):
                for b in range(subdivisions + 1 - a):
                    weights = (a / subdivisions, b / subdivisions, (subdivisions - a - b) / subdivisions)
                    point = tuple(sum(weight * vertex[k] for weight, vertex in zip(weights, vertices)) for k in range(3))
                    self.assertFalse(guard.inside(point, body), ('outer wing hidden by body', domain, point))

    def test_body_front_terminates_in_tiny_cap_instead_of_visible_cut_disc(self):
        mesh = self.mesh()
        cap = [mesh['vertices'][vertex]
               for tri, domain in zip(mesh['triangles'], mesh['normal_domains'])
               if domain == 'white_enamel_body:cap_front' for vertex in tri]
        self.assertLessEqual(max(p[0] for p in cap) - min(p[0] for p in cap), .020)
        self.assertLessEqual(max(p[1] for p in cap) - min(p[1] for p in cap), .030)


if __name__ == '__main__':
    unittest.main()
