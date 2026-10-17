"""Original, bounded S-only enamel-crane surface replacement.

Y-up metres, front -Z, local coordinates only. This module owns exactly the
five named replacement components, not the retained stand, rock, toes, legs,
lower beak, placement, materials, fallback, or integration pipeline.

Museum Fig. 1 was inspected as silhouette evidence; no museum image, traced
outline, texture, ornament, or photogrammetric asset is used by this code.
"""
from collections import defaultdict
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


# Load the unchanged approved kernel without altering global import search paths.
_kernel_path = Path(__file__).resolve().parents[1] / 'taihe_display/approved/mesh_kernel.py'
_spec = spec_from_file_location('_taihe_crane_approved_kernel', _kernel_path)
_kernel = module_from_spec(_spec)
_spec.loader.exec_module(_kernel)
Mesh = _kernel.Mesh
add, sub, mul = _kernel.add, _kernel.sub, _kernel.mul
cross, dot, unit = _kernel.cross, _kernel.dot, _kernel.unit

REPLACED_COMPONENTS = (
    'white_enamel_body', 'white_rising_neck', 'white_small_head',
    'green_folded_wing', 'red_crown',
)

NECK_CENTRES = (
    (0., 1.12, -.180), (0., 1.26, -.196), (0., 1.44, -.195),
    (0., 1.60, -.186), (0., 1.70, -.190),
)


class CraneMesh(Mesh):
    """Approved Mesh-compatible data plus explicit triangle-corner normals.

    ``corner_normals[i][j]`` belongs to corner ``j`` of triangle ``i``.
    ``normal_domains[i]`` is an audit-only smoothing-domain identifier. The
    domains keep end caps, the hidden belly landing, and different components
    independent. Integrators must use these corner normals without welding or
    recalculating normals across the existing scene's material batches.
    """

    def __init__(self):
        super().__init__()
        self.corner_normals = []
        self.normal_domains = []

    def _mark_component(self, start, name, *, sides=None, rings=None, instance='side'):
        side_end = start + 2 * sides * (rings - 1) if sides is not None else len(self.triangles)
        cap_split = side_end + sides - 2 if sides is not None else side_end
        for i in range(start, len(self.triangles)):
            domain = instance
            if i >= side_end:
                domain = 'cap_front' if i < cap_split else 'cap_back'
            elif name == 'white_enamel_body' and all(abs(self.vertices[j][1] - .79) < 1e-12 for j in self.triangles[i]):
                domain = 'belly'
            self.normal_domains.append(name + ':' + domain)

    def _finish_normals(self):
        # Area-weighting uses actual triangles in this single component/domain.
        # Vertex IDs are never shared between different authored components.
        sums = defaultdict(lambda: (0., 0., 0.))
        for face, domain in zip(self.triangles, self.normal_domains):
            a, b, c = (self.vertices[j] for j in face)
            normal = cross(sub(b, a), sub(c, a))
            for vertex in face:
                sums[(vertex, domain)] = add(sums[(vertex, domain)], normal)
        normals = {key: unit(value) for key, value in sums.items()}
        self.corner_normals = [
            [normals[(vertex, domain)] for vertex in face]
            for face, domain in zip(self.triangles, self.normal_domains)
        ]

    def data(self):
        result = super().data()
        result['corner_normals'] = [[list(normal) for normal in triangle] for triangle in self.corner_normals]
        result['normal_domains'] = self.normal_domains[:]
        return result


def _body(mesh):
    start = len(mesh.triangles)
    first_vertex = len(mesh.vertices)
    mesh.body('white_enamel_body', [
        (-.265, 1.06, .008, .012),
        (-.16, 1.02, .120, .195),
        (.02, 1.01, .142, .230),
        (.20, .99, .105, .175),
        (.32, .92, .018, .030),
    ], 'pearl', sides=12)
    # A deliberately hidden, narrow ventral landing keeps the unchanged
    # five-vertex leg-root rings on the actual body surface at exactly y=.79.
    # Upper/flank sections remain rounded; this is not a rectangular prism.
    for ring, halfwidth in ((1, .095), (2, .100), (3, .085)):
        for sector, x in ((8, -halfwidth), (9, 0.), (10, halfwidth)):
            index = first_vertex + 12 * ring + sector
            _, _, z = mesh.vertices[index]
            mesh.vertices[index] = (x, .79, z)
    mesh._mark_component(start, 'white_enamel_body', sides=12, rings=5)


def _neck(mesh):
    start = len(mesh.triangles)
    mesh.sweep('white_rising_neck', NECK_CENTRES,
               [.044, .030, .025, .022, .020], 'pearl', sides=9)
    # Both open rings are buried in the body/head; there are no exposed caps.
    mesh._mark_component(start, 'white_rising_neck')


def _head(mesh):
    start = len(mesh.triangles)
    mesh.body('white_small_head', [
        (-.245, 1.708, .023, .029),
        (-.214, 1.724, .035, .046),
        (-.170, 1.720, .030, .038),
        (-.150, 1.700, .012, .018),
    ], 'pearl', sides=8)
    mesh._mark_component(start, 'white_small_head', sides=8, rings=4)


def _closed_octahedron(mesh, name, vertices, material, instance='side', rim_seam=False):
    """Six shared vertices, eight outward triangles, one normal domain."""
    centre = mul(tuple(sum(p[k] for p in vertices) for k in range(3)), 1 / 6)
    faces = []
    for face in ((0, 2, 4), (0, 4, 3), (0, 3, 5), (0, 5, 2),
                 (1, 4, 2), (1, 3, 4), (1, 5, 3), (1, 2, 5)):
        a, b, c = (vertices[j] for j in face)
        midpoint = mul(add(add(a, b), c), 1 / 3)
        if dot(cross(sub(b, a), sub(c, a)), sub(midpoint, centre)) < 0:
            face = tuple(reversed(face))
        faces.append(face)
    start = len(mesh.triangles)
    mesh.patch(name, vertices, faces, material)
    mesh._mark_component(start, name, instance=instance)
    if rim_seam:
        # Thin folded wings have a real perimeter crease. Their inner and
        # outer shells must not average against each other around that rim.
        for local in range(8):
            mesh.normal_domains[start + local] += '_inner' if local < 4 else '_outer'


def _body_flank_x(mesh, y, z):
    """Positive-X intersection of the authored body at a wing design point."""
    hits = []
    for face, component in zip(mesh.triangles, mesh.components):
        if component != 'white_enamel_body':
            continue
        a, b, c = (mesh.vertices[j] for j in face)
        denominator = (b[2] - c[2]) * (a[1] - c[1]) + (c[1] - b[1]) * (a[2] - c[2])
        if abs(denominator) < 1e-12:
            continue
        u = ((b[2] - c[2]) * (y - c[1]) + (c[1] - b[1]) * (z - c[2])) / denominator
        v = ((c[2] - a[2]) * (y - c[1]) + (a[1] - c[1]) * (z - c[2])) / denominator
        w = 1 - u - v
        if min(u, v, w) >= -1e-12:
            hits.append(u * a[0] + v * b[0] + w * c[0])
    if not hits:
        raise ValueError('Wing design point lies outside the authored body')
    return max(hits)


def _wings(mesh):
    # Restrained original wing lobes follow the flanks. All-green fields are
    # inherited author approximation, not measured historical color zones.
    for side in (-1, 1):
        # The six section points are fitted to this original body mesh. A
        # shallow outer offset keeps the four visible panels continuous instead
        # of exposing disconnected scraps where a flat wedge cuts the torso.
        sections = (
            (1.055, .070, -.030), (1.055, .070, .030),
            (.980, .085, .030), (1.130, .045, .030),
            (1.105, -.090, .030), (.940, .245, .030),
        )
        vertices = [(side * (_body_flank_x(mesh, y, z) + offset), y, z)
                    for y, z, offset in sections]
        _closed_octahedron(mesh, 'green_folded_wing', vertices, 'teal',
                           instance='left' if side < 0 else 'right', rim_seam=True)


def _crown(mesh):
    # Low oval lobe: 24 mm authored thickness, top fixed at y=1.78.
    # This is intentionally not the predecessor's tall open triangular crest.
    _closed_octahedron(mesh, 'red_crown', [
        (-.018, 1.768, -.205), (.018, 1.768, -.205),
        (0., 1.756, -.205), (0., 1.780, -.205),
        (0., 1.768, -.230), (0., 1.768, -.180),
    ], 'red')


def build_crane_replacement():
    """Return a fresh local CraneMesh containing only 272 selected triangles.

    Two translated copies replace 374 predecessor triangles with 544 new
    triangles: net +170, taking the pinned 17,770-triangle core to 17,940.
    The caller owns exact retirement, placement, GLB expansion and checks.
    No scene, files, materials, source modules, or global normals are mutated.
    """
    mesh = CraneMesh()
    _body(mesh)
    _neck(mesh)
    _head(mesh)
    _wings(mesh)
    _crown(mesh)
    mesh._finish_normals()
    return mesh
