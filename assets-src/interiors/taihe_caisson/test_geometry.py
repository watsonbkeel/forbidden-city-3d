"""CPU contracts for the isolated, estimated central caisson candidate."""
import copy
import hashlib
import importlib.util
import json
import math
import struct
from pathlib import Path
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PROFILE = json.loads((ROOT / 'data/architecture/taihe-core.json').read_text())


def load_candidate():
    path = HERE / 'geometry.py'
    if not path.exists():
        raise AssertionError('Missing isolated caisson geometry candidate')
    spec = importlib.util.spec_from_file_location('caisson_geometry', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def subtract(a, b):
    return tuple(x-y for x, y in zip(a, b))


def cross(a, b):
    return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])


def dot(a, b):
    return sum(x*y for x, y in zip(a, b))


def winding_number(point, triangles):
    """Signed solid angle; includes adjacent faces that intersection checks skip."""
    total = 0.0
    for a, b, c in triangles:
        u, v, w = (subtract(p, point) for p in (a, b, c))
        lu, lv, lw = (math.sqrt(dot(p, p)) for p in (u, v, w))
        numerator = dot(u, cross(v, w))
        denominator = lu*lv*lw + dot(u, v)*lw + dot(v, w)*lu + dot(w, u)*lv
        total += 2*math.atan2(numerator, denominator)
    return total/(4*math.pi)


class CaissonCandidateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.api = load_candidate()

    def build(self, quality='detail'):
        before = copy.deepcopy(PROFILE)
        result = self.api.build_candidate(PROFILE['caisson'], quality)
        self.assertEqual(PROFILE, before, 'Candidate must not mutate the retained profile')
        return result

    def test_detail_and_fallback_budget_and_materials(self):
        for quality, maximum in [('detail', 2400), ('fallback', 42)]:
            mesh = self.build(quality)
            self.assertGreater(len(mesh['triangles']), 0)
            self.assertLessEqual(len(mesh['triangles']), maximum)
            self.assertEqual(len(mesh['triangles']), len(mesh['materials']))
            self.assertTrue(set(mesh['materials']) <= {'gold', 'darkGold'})
            self.assertEqual(mesh['metadata']['proportions'], 'estimated, not conservation measurements')
            self.assertEqual(mesh['metadata']['retainedPearlCount'], 7)
            self.assertEqual(mesh['metadata']['quality'], quality)
            self.assertEqual(set(mesh), {'vertices', 'triangles', 'materials', 'normals', 'parts', 'metadata'})

    def test_finite_nondegenerate_consistently_outward_closed_faces(self):
        for quality in ('detail', 'fallback'):
            mesh = self.build(quality)
            vertices, triangles = mesh['vertices'], mesh['triangles']
            edges = {}
            for index, triangle in enumerate(triangles):
                self.assertEqual(len(set(triangle)), 3)
                a, b, c = [vertices[i] for i in triangle]
                self.assertTrue(all(math.isfinite(x) for p in (a,b,c) for x in p))
                normal = cross(subtract(b,a), subtract(c,a))
                area2 = math.sqrt(dot(normal, normal))
                self.assertGreater(area2, 1e-9, (quality, index))
                supplied = mesh['normals'][index]
                self.assertAlmostEqual(dot(supplied,supplied), 1, places=10)
                self.assertGreater(dot(normal, supplied), 0)
                for u, v in zip(triangle, triangle[1:]+triangle[:1]):
                    edges.setdefault(tuple(sorted((u,v))), []).append((u,v))
            # Every connected solid is a consistently wound, closed shell.
            for edge, uses in edges.items():
                self.assertEqual(len(uses), 2, (quality, edge, uses))
                self.assertEqual(uses[0], uses[1][::-1], (quality, edge, uses))
            for component in self.api.connected_components(mesh):
                volume6 = sum(dot(vertices[a],cross(vertices[b],vertices[c]))
                              for a,b,c in (triangles[i] for i in component))
                self.assertGreater(volume6, 1e-8, quality)

    def test_head_and_coiled_body_are_one_vertex_connected_solid(self):
        for quality in ('detail', 'fallback'):
            mesh = self.build(quality)
            parts = mesh['parts']
            for required in ('coiled_body','descending_head','pearl_support','left_horn','right_horn'):
                self.assertIn(required, parts)
                self.assertGreater(len(parts[required]), 0)
            # Explicit indexed connectivity, not merely overlapping AABBs.
            components = self.api.connected_components(mesh)
            body = set(parts['coiled_body'])
            head = set(parts['descending_head'])
            self.assertTrue(any(body.intersection(c) and head.issubset(c) for c in map(set,components)))
            self.assertGreater(max(mesh['vertices'][i][0] for j in parts['coiled_body'] for i in mesh['triangles'][j]), .65)
            self.assertLess(min(mesh['vertices'][i][0] for j in parts['coiled_body'] for i in mesh['triangles'][j]), -.55)
            self.assertGreater(max(mesh['vertices'][i][2]-PROFILE['caisson']['z'] for j in parts['coiled_body'] for i in mesh['triangles'][j]), .6)

    def test_actual_triangle_clearance_to_retained_tiers_cap_and_pearls(self):
        for quality in ('detail','fallback'):
            mesh = self.build(quality)
            report = self.api.clearance_report(mesh, PROFILE['caisson'])
            self.assertEqual(report['method'], 'triangle-to-triangle distance and analytic sphere-to-triangle distance')
            self.assertGreater(report['tierClearance'], .025, report)
            self.assertGreater(report['capClearance'], .025, report)
            self.assertGreaterEqual(report['satelliteClearance'], -.00000001, report)
            self.assertGreaterEqual(report['centralPearlClearance'], -.00000001, report)
            self.assertLess(report['centralPearlClearance'], .001, 'Support must reach the retained central pearl')
            self.assertGreaterEqual(report['minimumY'], PROFILE['caisson']['sphereY']-PROFILE['caisson']['sphereRadius'])
            self.assertLess(report['maximumY'], PROFILE['caisson']['topY']-.03)
            self.assertLess(report['maximumRadius'], PROFILE['caisson']['nominalSpan']/2-.16)
            self.assertEqual(report['surfaceIntersections'], 0)

    def test_detail_has_brow_muzzle_and_cheek_landmarks(self):
        mesh = self.build()
        for name in ('brow_ridges','muzzle_planes','left_cheek_scroll','right_cheek_scroll'):
            self.assertIn(name, mesh['parts'])
            self.assertGreater(len(mesh['parts'][name]), 0)
        head_vertices = [mesh['vertices'][v] for i in mesh['parts']['descending_head'] for v in mesh['triangles'][i]]
        self.assertGreater(max(v[0] for v in head_vertices)-min(v[0] for v in head_vertices), .60)
        self.assertLess(min(v[1] for v in head_vertices), PROFILE['caisson']['rimY']+.1)

    def test_revised_face_looks_downward_and_has_separate_eyes(self):
        mesh = self.build()
        head = [mesh['vertices'][v] for i in mesh['parts']['descending_head'] for v in mesh['triangles'][i]]
        for side, sign in [('left',-1),('right',1)]:
            name = side+'_eye_recess'
            self.assertIn(name, mesh['parts'])
            ids = mesh['parts'][name]
            self.assertGreaterEqual(len(ids), 3)
            self.assertTrue(all(mesh['materials'][i]=='darkGold' for i in ids))
            self.assertLess(sum(mesh['normals'][i][1] for i in ids)/len(ids), -.35)
            x = sum(mesh['vertices'][v][0] for i in ids for v in mesh['triangles'][i])/(3*len(ids))
            self.assertGreater(x*sign, .10)

    def test_revised_horns_branch_beyond_the_face(self):
        mesh = self.build()
        for side, sign in [('left',-1),('right',1)]:
            self.assertIn(side+'_horn_branch', mesh['parts'])
            points = [mesh['vertices'][v] for i in mesh['parts'][side+'_horn'] for v in mesh['triangles'][i]]
            self.assertGreater(max(v[0]*sign for v in points), .72)
            self.assertGreater(max(PROFILE['caisson']['z']-v[2] for v in points), .48)

    def test_forehead_faces_the_south_side_visitor(self):
        mesh = self.build()
        def average_z(part):
            return sum(mesh['vertices'][j][2] for i in mesh['parts'][part] for j in mesh['triangles'][i])/(3*len(mesh['parts'][part]))
        for side in ('left','right'):
            self.assertLess(average_z(side+'_eye_recess'), PROFILE['caisson']['z']-.25)
            self.assertLess(average_z(side+'_eye_recess'), average_z('muzzle_planes'))

    def test_no_repeating_dark_triangles_on_the_coil(self):
        mesh = self.build()
        self.assertTrue(all(mesh['materials'][i]=='gold' for i in mesh['parts']['coiled_body']))

    def test_revised_coil_has_an_inner_return(self):
        mesh = self.build()
        points = [mesh['vertices'][v] for i in mesh['parts']['coiled_body'] for v in mesh['triangles'][i]]
        self.assertLess(min(math.hypot(v[0],v[2]-PROFILE['caisson']['z']) for v in points), .25)
        self.assertGreater(max(math.hypot(v[0],v[2]-PROFILE['caisson']['z']) for v in points), 1.0)

    def test_retained_support_and_fallback_geometry_are_unchanged(self):
        mesh = self.build()
        support = sorted(sorted(mesh['vertices'][v] for v in mesh['triangles'][i])
                         for i in mesh['parts']['pearl_support'])
        # Canonical geometry receipts from the independently checked c164 source.
        digest = hashlib.sha256(json.dumps(support, sort_keys=True).encode()).hexdigest()
        self.assertEqual(digest, 'ce195dd3ec088f34e606d751708f6c83635de47baa09b1f4957ca48349c59b0f')
        digest = hashlib.sha256(json.dumps(self.build('fallback'), sort_keys=True).encode()).hexdigest()
        self.assertEqual(digest, 'd1da76cf022f209e121e224fbfd9c357881d6fe271fe718f66bcbee753c3f144')

    def test_compact_skull_to_body_width_ratio(self):
        # Source photograph visible skull/body is roughly 0.24. The authored
        # 0.30-0.35 interval is a conservative perspective-aware design bound,
        # excluding horns/whiskers and not a surveyed architectural dimension.
        mesh = self.build()
        def width(part):
            points = [mesh['vertices'][v] for i in mesh['parts'][part]
                      for v in mesh['triangles'][i]]
            return max(p[0] for p in points)-min(p[0] for p in points)
        ratio = width('descending_head')/width('coiled_body')
        self.assertGreaterEqual(ratio, .30)
        self.assertLessEqual(ratio, .35)

    def test_inward_coil_fills_previously_empty_upper_centre(self):
        mesh = self.build()
        projected = [tuple((mesh['vertices'][v][0], 0,
                            PROFILE['caisson']['z']-mesh['vertices'][v][2])
                           for v in mesh['triangles'][i])
                     for i in mesh['parts']['coiled_body']]
        # These projected landmarks sat in the old ring's empty aperture.
        # They are authoring coverage probes, not traced museum coordinates.
        for target in ((0, 0, .50), (.15, 0, .65)):
            distance = min(self.api._point_triangle(target, *triangle)
                           for triangle in projected)
            self.assertLess(distance, .04, (target, distance))

    def test_nonadjacent_faces_do_not_cross(self):
        for quality in ('detail','fallback'):
            mesh = self.build(quality)
            triangles = [tuple(mesh['vertices'][j] for j in f) for f in mesh['triangles']]
            bounds = [self.api._bounds(t) for t in triangles]
            crossings = []
            for i, a in enumerate(triangles):
                for j in range(i):
                    if self.api._bounds_distance(bounds[i],bounds[j]) > 1e-9:
                        continue
                    if set(mesh['triangles'][i]) & set(mesh['triangles'][j]):
                        continue
                    if self.api._triangle_distance(a,triangles[j]) < 1e-9:
                        crossings.append((i,j))
            self.assertEqual(crossings, [], (quality,crossings))

    def test_every_face_has_inside_outside_winding_in_source_and_float32(self):
        # NumPy accelerates this exhaustive CPU-only check; geometry.py itself
        # stays dependency-free. No adjacency exclusions or volume shortcut.
        import numpy as np
        for quality in ('detail', 'fallback'):
            mesh = self.build(quality)
            for precision in ('source-double', 'export-float32'):
                vertices = np.asarray(mesh['vertices'], dtype=float)
                if precision == 'export-float32':
                    vertices = vertices.astype(np.float32).astype(float)
                triangles = vertices[np.asarray(mesh['triangles'])]
                normals = np.cross(triangles[:, 1]-triangles[:, 0],
                                   triangles[:, 2]-triangles[:, 0])
                normals /= np.linalg.norm(normals, axis=1)[:, None]
                centres = triangles.mean(axis=1)
                for epsilon in (1e-7, 1e-6):
                    for side, expected in ((1, 0), (-1, 1)):
                        probes = centres+side*epsilon*normals
                        values = []
                        for start in range(0, len(probes), 40):
                            vectors = triangles[None]-probes[start:start+40, None, None]
                            lengths = np.linalg.norm(vectors, axis=3)
                            a, b, c = vectors[:, :, 0], vectors[:, :, 1], vectors[:, :, 2]
                            numerator = np.einsum('ijk,ijk->ij', a, np.cross(b, c))
                            denominator = (np.prod(lengths, axis=2)
                                +np.einsum('ijk,ijk->ij', a, b)*lengths[:, :, 2]
                                +np.einsum('ijk,ijk->ij', b, c)*lengths[:, :, 0]
                                +np.einsum('ijk,ijk->ij', c, a)*lengths[:, :, 1])
                            values.extend(np.sum(2*np.arctan2(numerator, denominator),
                                                 axis=1)/(4*math.pi))
                        bad = np.flatnonzero(np.abs(np.asarray(values)-expected) > .001)
                        self.assertEqual(bad.tolist(), [],
                                         (quality, precision, epsilon, side,
                                          [(int(i), float(values[i])) for i in bad[:12]]))

    def test_cheek_scrolls_have_local_inside_outside_winding(self):
        # The former terminal path crossed its last fixed section plane. A
        # globally positive volume and shared-edge winding both missed the
        # resulting negative-winding cone; adjacency exclusion also missed it.
        mesh = self.build()
        for precision in ('source-double', 'export-float32'):
            vertices = mesh['vertices']
            if precision == 'export-float32':
                vertices = [tuple(struct.unpack('<f', struct.pack('<f', x))[0]
                                  for x in p) for p in vertices]
            triangles = [tuple(vertices[j] for j in f) for f in mesh['triangles']]
            for part in ('left_cheek_scroll', 'right_cheek_scroll'):
                for index in mesh['parts'][part]:
                    a, b, c = triangles[index]
                    centre = tuple((a[k]+b[k]+c[k])/3 for k in range(3))
                    normal = cross(subtract(b, a), subtract(c, a))
                    length = math.sqrt(dot(normal, normal))
                    normal = tuple(x/length for x in normal)
                    for epsilon in (1e-7, 1e-6):
                        outside = tuple(x+epsilon*n for x, n in zip(centre, normal))
                        inside = tuple(x-epsilon*n for x, n in zip(centre, normal))
                        actual = (winding_number(outside, triangles),
                                  winding_number(inside, triangles))
                        with self.subTest(precision=precision, part=part,
                                          face=index, epsilon=epsilon):
                            self.assertAlmostEqual(actual[0], 0.0, places=5,
                                                   msg=('outside/inside', actual))
                            self.assertAlmostEqual(actual[1], 1.0, places=5,
                                                   msg=('outside/inside', actual))

    def test_material_batches_preserve_geometry_and_semantic_parts(self):
        for quality in ('detail','fallback'):
            mesh = self.build(quality)
            batches = self.api.material_batches(mesh)
            self.assertEqual(set(batches), set(mesh['materials']))
            count = 0
            for material, batch in batches.items():
                self.assertEqual(len(batch['position']), len(batch['normal']))
                self.assertEqual(len(batch['position']) % 9, 0)
                self.assertEqual(batch['indices'], list(range(len(batch['position'])//3)))
                self.assertEqual(len(batch['sourceTriangles']), len(batch['indices'])//3)
                count += len(batch['sourceTriangles'])
                for local, original in enumerate(batch['sourceTriangles']):
                    self.assertEqual(mesh['materials'][original], material)
                    expected = [x for j in mesh['triangles'][original] for x in mesh['vertices'][j]]
                    self.assertEqual(batch['position'][9*local:9*local+9], expected)
                    self.assertTrue(any(local in ids for ids in batch['parts'].values()))
            self.assertEqual(count, len(mesh['triangles']))

    def test_invalid_inputs_rejected_and_valid_outputs_deterministic(self):
        self.assertEqual(self.build(), self.build())
        with self.assertRaises(ValueError):
            self.api.build_candidate(PROFILE['caisson'], 'unbounded')
        for key in ('rimY','topY','z','sphereY','sphereRadius'):
            c = copy.deepcopy(PROFILE['caisson']); c[key] = float('nan')
            with self.assertRaises(ValueError):
                self.api.build_candidate(c)
        c = copy.deepcopy(PROFILE['caisson']); c['topY'] = c['rimY']
        with self.assertRaises(ValueError):
            self.api.build_candidate(c)


if __name__ == '__main__':
    unittest.main(verbosity=2)
