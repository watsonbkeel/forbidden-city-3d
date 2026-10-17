"""Append frozen S display faces into the existing material-batch frames.
Headless export only. Keep the original translated teal batch and its original
float32 attributes intact; moving that batch to the origin would rebake them.
"""
from pathlib import Path
import hashlib
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent / 'approved'))
from taihe_display_pairs import build_display_pairs, MATERIAL_KEYS
from integration_geometry import flat_attributes


def append_display_pairs(inventory, materials):
    import bpy
    import bmesh
    from mathutils import Vector
    batches = {ob.data.materials[0].name: ob for ob in bpy.context.scene.objects if ob.type == 'MESH'}
    assert len(batches) == 8
    count = 0
    for item in build_display_pairs('S'):
        for key in MATERIAL_KEYS:
            values = flat_attributes(item['local_mesh'], key)['position']
            if not values:
                continue
            target = batches[materials[key].name]
            inverse = target.matrix_world.inverted()
            bm = bmesh.new()
            bm.from_mesh(target.data)
            actual = []
            # Independent triangle vertices preserve explicit reverse sheets;
            # no remove_doubles, normal averaging, or new material is involved.
            for start in range(0, len(values), 9):
                vertices = []
                for i in range(start, start + 9, 3):
                    x, y, z = (values[i + k] + item['translation'][k] for k in range(3))
                    vertex = bm.verts.new(inverse @ Vector((x, -z, y)))
                    vertices.append(vertex)
                    p = target.matrix_world @ vertex.co
                    actual.append((p.x, p.z, -p.y))
                face = bm.faces.new(vertices)
                face.smooth = False
                count += 1
            bm.normal_update()
            bm.to_mesh(target.data)
            bm.free()
            inventory.append({'name': 'display_' + item['id'] + '_' + key,
                              'min': [min(v[k] for v in actual) for k in range(3)],
                              'max': [max(v[k] for v in actual) for k in range(3)]})
    assert count == 3798
    here = Path(__file__).resolve().parent
    return {'displaySourceManifestSHA256': hashlib.sha256((here / 'approved/artifacts/SOURCE-MANIFEST.json').read_bytes()).hexdigest(),
            'displayIntegrationSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'displayTriangles': count}
