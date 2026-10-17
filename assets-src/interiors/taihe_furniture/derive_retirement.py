"""Derive the finite throne_back mask from original semantic Blender objects.

Run on CPU only, from the repository root:
  blender -b -t 1 -P assets-src/interiors/taihe_furniture/derive_retirement.py -- \
    --output assets-src/interiors/taihe_furniture/retired_throne_back_faces.json

Execute unchanged taihe.py only up to merge_by_material(). Transform and
triangulate each original object using the original FIXED/EAR_CLIP choices.
Match all 296 target faces one-to-one with actual baseline faces by exact
float32 positions and oriented cyclic order. Bounds never select a triangle.
Every target must also have exactly one owner among ALL original source faces.
"""
import argparse
import collections
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'assets-src/interiors'))
from append_taihe_caisson import unpack_glb, sha

BASE_SHA256 = '9067bcce8b91f719a5e39ca1cfc2a1d1c5c013d5fcd4488dc92ee920ada7015d'
BASE_PATH = ROOT / 'public/models/interiors/taihe-caisson-9067bcce8b91.glb'
SOURCES = {
    'assets-src/interiors/taihe.py': '25f7491e1e088f7bc28425732c1a58182661d1ee8f5d0f5ebae3f5c1005e3caf',
    'assets-src/interiors/_common.py': 'b57efc80a2a9ca78fdfbe44330b78bba40302fdd627acd0a800c56328dc111fa',
    'data/architecture/taihe-core.json': '5febda5436765e258e67300bf4b737566e4e522d60ebb9587222c9e4ed1a181c',
}
EXPECTED = {'taihe_gold': 240, 'taihe_dark_gold': 24, 'taihe_lacquer': 32}
EXPECTED_PARTS = {'throne_back': ('taihe_lacquer', 32)}
for stem, count, material, triangles in [('panel', 2, 'taihe_dark_gold', 12),
                                        ('stile', 4, 'taihe_gold', 12),
                                        ('rail', 4, 'taihe_gold', 12),
                                        ('approx_cloud', 6, 'taihe_gold', 24)]:
    for i in range(count):
        EXPECTED_PARTS['throne_back_' + stem + (f'.{i:03d}' if i else '')] = (material, triangles)


def oriented_position_bytes(raw):
    """Canonical cyclic order, never reversed winding; normalize signed zero only."""
    values = struct.unpack('<9f', raw)
    points = [struct.pack('<3f', *(0.0 if x == 0 else x for x in values[i:i+3]))
              for i in range(0, 9, 3)]
    return min(b''.join(points[i:] + points[:i]) for i in range(3))


def source_triangles():
    """Blender-only original geometry, including unrelated objects for ownership."""
    import bpy
    import bmesh
    for path, expected in SOURCES.items():
        if sha((ROOT / path).read_bytes()) != expected:
            raise ValueError('Changed original source bytes: ' + path)
    path = ROOT / 'assets-src/interiors/taihe.py'
    source = path.read_text()
    delimiter = '\nmerge_by_material()\n'
    if source.count(delimiter) != 1:
        raise ValueError('Original merge boundary changed')
    prefix = source.split(delimiter)[0]
    namespace = {'__file__': str(path), '__name__': 'derive_original_taihe'}
    exec(compile(prefix, str(path), 'exec'), namespace)
    records = []
    objects = [ob for ob in bpy.context.scene.objects if ob.type == 'MESH']
    for ob in objects:
        if len(ob.data.materials) != 1:
            raise ValueError('Unexpected original object material ownership')
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bmesh.ops.transform(bm, matrix=ob.matrix_world, verts=bm.verts[:])
        bmesh.ops.triangulate(bm, faces=bm.faces[:], quad_method='FIXED', ngon_method='EAR_CLIP')
        bm.faces.ensure_lookup_table()
        for ordinal, face in enumerate(bm.faces):
            raw = struct.pack('<9f', *(q for v in face.verts for q in (v.co.x, v.co.z, -v.co.y)))
            records.append({'part': ob.name, 'material': ob.data.materials[0].name,
                            'sourceTriangleOrdinal': ordinal, 'oriented': oriented_position_bytes(raw)})
        bm.free()
    proof = {'blenderVersion': bpy.app.version_string,
             'executedPrefixSHA256': sha(prefix.encode()),
             'stopBefore': 'merge_by_material()',
             'triangulation': {'quad_method': 'FIXED', 'ngon_method': 'EAR_CLIP'},
             'coordinateConversion': 'Blender (x, y, z) -> glTF (x, z, -y)',
             'allOriginalMeshObjects': len(objects), 'allOriginalTriangles': len(records)}
    return records, namespace['inventory'], proof


def match_source_triangles(base, records, inventory, proof):
    if sha(base) != BASE_SHA256:
        raise ValueError('Unknown throne-back baseline bytes')
    gltf, binary = unpack_glb(base)
    owner_map = collections.defaultdict(list)
    for row in records:
        owner_map[(row['material'], row['oriented'])].append((row['part'], row['sourceTriangleOrdinal']))
    target = [r for r in records if r['part'].startswith('throne_back')]
    if dict(collections.Counter((r['part'], r['material']) for r in target)) != {
            (name, material): count for name, (material, count) in EXPECTED_PARTS.items()}:
        raise ValueError('Original semantic throne-back ownership changed')
    actual = collections.defaultdict(list)
    materials = {}
    for mi, mesh in enumerate(gltf['meshes']):
        for pi, primitive in enumerate(mesh['primitives']):
            name = gltf['materials'][primitive['material']]['name']
            if name not in EXPECTED:
                continue
            if name in materials:
                raise ValueError('Ambiguous baseline material primitive')
            ia = gltf['accessors'][primitive['indices']]
            iv = gltf['bufferViews'][ia['bufferView']]
            pa = gltf['accessors'][primitive['attributes']['POSITION']]
            pv = gltf['bufferViews'][pa['bufferView']]
            if any(a.get('byteOffset', 0) or 'sparse' in a for a in (ia, pa)) or any('byteStride' in v for v in (iv, pv)):
                raise ValueError('Unsupported source matching layout')
            ids = struct.unpack_from('<' + {5123:'H', 5125:'I'}[ia['componentType']] * ia['count'], binary, iv.get('byteOffset', 0))
            materials[name] = {'mesh': mi, 'primitive': pi, 'indexAccessor': primitive['indices'],
                               'positionAccessor': primitive['attributes']['POSITION'],
                               'originalTriangles': len(ids)//3, 'removedTriangles': EXPECTED[name]}
            for start in range(0, len(ids), 3):
                indices = ids[start:start+3]
                raw = b''.join(binary[pv.get('byteOffset', 0)+i*12:pv.get('byteOffset', 0)+i*12+12] for i in indices)
                actual[(name, oriented_position_bytes(raw))].append({
                    'material': name, 'triangleOrdinal': start//3,
                    'indices': list(indices), 'positionSHA256': sha(raw)})
    rows = []
    for source in target:
        key = (source['material'], source['oriented'])
        if owner_map[key] != [(source['part'], source['sourceTriangleOrdinal'])]:
            raise ValueError('Target face has ambiguous original source ownership')
        if len(actual[key]) != 1:
            raise ValueError('Target source face has no unique exact oriented baseline match')
        rows.append({**actual[key][0], 'part': source['part'],
                     'sourceTriangleOrdinal': source['sourceTriangleOrdinal'],
                     'sourcePositionSHA256': sha(source['oriented'])})
    if len({(r['material'], r['triangleOrdinal']) for r in rows}) != 296:
        raise ValueError('Source matches are not one-to-one')
    parts = sorted(EXPECTED_PARTS)
    source_inventory = [r for r in inventory if r['name'] in parts]
    contract = next(n['extras'] for n in gltf['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT')
    base_inventory = [r for r in json.loads(contract['inventory']) if r['name'].startswith('throne_back')]
    if source_inventory != base_inventory:
        raise ValueError('Original object inventory differs from baseline')
    part_proofs = {}
    for part in parts:
        entries = sorted((r for r in rows if r['part'] == part), key=lambda r:r['sourceTriangleOrdinal'])
        material, count = EXPECTED_PARTS[part]
        part_proofs[part] = {'material': material, 'triangles': count,
                            'orientedTriangleHashesSHA256': sha(b''.join(bytes.fromhex(r['sourcePositionSHA256']) for r in entries))}
    return {'schema': 'taihe-throne-back-retirement-v1', 'baseSHA256': BASE_SHA256,
            'sources': SOURCES, 'parts': parts, 'partInventory': source_inventory,
            'partProofs': part_proofs, 'materials': materials,
            'sourceProof': {**proof, 'targetObjects': len(parts), 'targetTriangles': len(rows),
                            'allTargetFacesHaveUniqueSourceOwner': True,
                            'allTargetFacesHaveUniqueBaselineMatch': True,
                            'maximumCoordinateError': 0, 'windingPreserved': True,
                            'selection': 'exact original object name prefix throne_back; no spatial filter'},
            'triangles': sorted(rows, key=lambda r:(r['material'], r['triangleOrdinal']))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    records, inventory, proof = source_triangles()
    mask = match_source_triangles(BASE_PATH.read_bytes(), records, inventory, proof)
    data = (json.dumps(mask, indent=2, ensure_ascii=False) + '\n').encode()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(data)
    print(json.dumps({'maskSHA256': sha(data), 'parts': len(mask['parts']),
                      'removedTriangles': len(mask['triangles']), 'materials': EXPECTED,
                      'sourceProof': mask['sourceProof']}, indent=2))


if __name__ == '__main__':
    main()
