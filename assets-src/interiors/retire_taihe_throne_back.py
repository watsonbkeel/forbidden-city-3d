"""Remove only pinned, source-owned throne_back triangles from the frozen GLB.

This build-time migration does not export/reprocess geometry or select by bounds.
All attributes remain byte-identical, including vertices which become unused.
Only three index views, their counts/bounds and the 17 named inventory entries
change. Retained index bytes preserve their exact original order.
"""
import copy
import json
import struct
from pathlib import Path

from append_taihe_caisson import unpack_glb, pack_glb, sha
from taihe_furniture.derive_retirement import (
    BASE_SHA256, SOURCES, EXPECTED, EXPECTED_PARTS, oriented_position_bytes,
)

ROOT = Path(__file__).resolve().parents[2]
MASK_PATH = Path(__file__).with_name('taihe_furniture') / 'retired_throne_back_faces.json'
MASK_SHA256 = 'dc4cf61f8441280347c8bd292d163f5465624f6cbf50513a30fb1b9c9018f287'


def retire_throne_back(base_bytes, mask_bytes=None):
    """Return (retired_glb, receipt), rejecting changes to base, mask or sources."""
    if sha(base_bytes) != BASE_SHA256:
        raise ValueError('Unknown throne-back baseline bytes')
    if mask_bytes is None:
        mask_bytes = MASK_PATH.read_bytes()
    if sha(mask_bytes) != MASK_SHA256:
        raise ValueError('Changed throne-back retirement mask')
    mask = json.loads(mask_bytes)
    if (mask['schema'] != 'taihe-throne-back-retirement-v1'
            or mask['baseSHA256'] != BASE_SHA256
            or mask['parts'] != sorted(EXPECTED_PARTS)
            or set(mask['materials']) != set(EXPECTED)
            or set(mask['partProofs']) != set(EXPECTED_PARTS)):
        raise ValueError('Invalid throne-back mask identity')
    if mask['sources'] != SOURCES:
        raise ValueError('Changed retirement source identity')
    for path, expected in SOURCES.items():
        if sha((ROOT / path).read_bytes()) != expected:
            raise ValueError('Changed retirement source bytes: ' + path)
    gltf, binary = unpack_glb(base_bytes)
    gltf = copy.deepcopy(gltf)
    if len(gltf['buffers']) != 1 or 'uri' in gltf['buffers'][0]:
        raise ValueError('Expected one local baseline buffer')
    contracts = [n for n in gltf['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT']
    if len(contracts) != 1:
        raise ValueError('Missing exact core contract')
    contract = contracts[0]['extras']
    if (contract['ownership'] != 'taihe-core-visual-only'
            or contract['sourceSHA256'] != SOURCES['assets-src/interiors/taihe.py']
            or contract['profileSHA256'] != SOURCES['data/architecture/taihe-core.json']):
        raise ValueError('Changed original source ownership')
    inventory = json.loads(contract['inventory'])
    retired = [r for r in inventory if r['name'].startswith('throne_back')]
    if (retired != mask['partInventory'] or len(retired) != 17
            or {r['name'] for r in retired} != set(EXPECTED_PARTS)):
        raise ValueError('Mask inventory ownership mismatch')
    triangles = mask['triangles']
    if len(triangles) != 296:
        raise ValueError('Mask triangle cardinality mismatch')
    for row in triangles:
        expected = EXPECTED_PARTS.get(row['part'])
        if expected is None or row['material'] != expected[0]:
            raise ValueError('Mask face source ownership mismatch')
    for part, (material, count) in EXPECTED_PARTS.items():
        rows = [r for r in triangles if r['part'] == part]
        proof = mask['partProofs'][part]
        if len(rows) != count or proof['material'] != material or proof['triangles'] != count:
            raise ValueError('Mask source ownership cardinality mismatch')
        if sorted(r['sourceTriangleOrdinal'] for r in rows) != list(range(count)):
            raise ValueError('Mask source ordinal mismatch')
    views = gltf['bufferViews']
    chunks = [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in views]
    changes = []
    target_accessors = set()
    for material, count in EXPECTED.items():
        info = mask['materials'][material]
        primitive = gltf['meshes'][info['mesh']]['primitives'][info['primitive']]
        if (gltf['materials'][primitive['material']]['name'] != material
                or primitive.get('mode', 4) != 4 or primitive['indices'] != info['indexAccessor']
                or primitive['attributes']['POSITION'] != info['positionAccessor']
                or info['removedTriangles'] != count):
            raise ValueError('Mask primitive identity mismatch')
        nodes = [n for n in gltf['nodes'] if n.get('mesh') == info['mesh']]
        if len(nodes) != 1 or any(k in nodes[0] for k in ('matrix', 'translation', 'rotation', 'scale')):
            raise ValueError('Mask target frame changed')
        ai = primitive['indices']
        acc = gltf['accessors'][ai]
        vi = acc['bufferView']
        view = views[vi]
        pa = gltf['accessors'][primitive['attributes']['POSITION']]
        pv = views[pa['bufferView']]
        if (ai in target_accessors or any(a.get('byteOffset', 0) or 'sparse' in a for a in (acc, pa))
                or any('byteStride' in v for v in (view, pv))
                or acc['type'] != 'SCALAR' or acc['count'] % 3
                or pa['componentType'] != 5126 or pa['type'] != 'VEC3'):
            raise ValueError('Unsupported retirement accessor layout')
        target_accessors.add(ai)
        if sum(a.get('bufferView') == vi for a in gltf['accessors']) != 1:
            raise ValueError('Shared retirement index bufferView')
        refs = [p for mesh in gltf['meshes'] for p in mesh['primitives']
                if p.get('indices') == ai or ai in p.get('attributes', {}).values()]
        if len(refs) != 1 or refs[0] is not primitive:
            raise ValueError('Shared retirement index accessor')
        fmt = {5123:'H', 5125:'I'}.get(acc['componentType'])
        if not fmt:
            raise ValueError('Unsupported retirement index format')
        width = struct.calcsize(fmt)
        before = chunks[vi]
        if len(before) != acc['count'] * width or len(chunks[pa['bufferView']]) != pa['count'] * 12:
            raise ValueError('Unexpected retirement accessor byte length')
        ids = struct.unpack('<' + fmt * acc['count'], before)
        positions = chunks[pa['bufferView']]
        rows = [r for r in triangles if r['material'] == material]
        removed = {r['triangleOrdinal'] for r in rows}
        if len(rows) != count or len(removed) != count or len(ids)//3 != info['originalTriangles']:
            raise ValueError('Mask triangle cardinality mismatch')
        for row in rows:
            ordinal = row['triangleOrdinal']
            if not isinstance(ordinal, int) or ordinal < 0 or ordinal >= len(ids)//3:
                raise ValueError('Mask index identity mismatch')
            indices = ids[ordinal*3:ordinal*3+3]
            if list(indices) != row['indices'] or any(i >= pa['count'] for i in indices):
                raise ValueError('Mask index identity mismatch')
            raw = b''.join(positions[i*12:i*12+12] for i in indices)
            if len(raw) != 36 or sha(raw) != row['positionSHA256']:
                raise ValueError('Mask face coordinates changed')
            if sha(oriented_position_bytes(raw)) != row['sourcePositionSHA256']:
                raise ValueError('Mask face source geometry mismatch')
        # Slice original index bytes, rather than decoding/re-encoding kept data.
        chunks[vi] = b''.join(before[i*3*width:(i+1)*3*width]
                              for i in range(len(ids)//3) if i not in removed)
        kept = struct.unpack('<' + fmt * (len(chunks[vi])//width), chunks[vi])
        acc['count'] = len(kept)
        if 'min' in acc:
            acc['min'] = [min(kept)]
        if 'max' in acc:
            acc['max'] = [max(kept)]
        changes.append({'material': material, 'accessor': ai, 'bufferView': vi,
                        'removedTriangles': count, 'beforeBytes': len(before),
                        'beforeSHA256': sha(before), 'retainedBytes': len(chunks[vi]),
                        'retainedSHA256': sha(chunks[vi]), 'vertexCount': pa['count'],
                        'unusedVerticesBefore': pa['count'] - len(set(ids)),
                        'unusedVerticesAfter': pa['count'] - len(set(kept)),
                        'newlyUnusedVertices': len(set(ids) - set(kept))})
    for part in EXPECTED_PARTS:
        rows = sorted((r for r in triangles if r['part'] == part), key=lambda r:r['sourceTriangleOrdinal'])
        if sha(b''.join(bytes.fromhex(r['sourcePositionSHA256']) for r in rows)) != mask['partProofs'][part]['orientedTriangleHashesSHA256']:
            raise ValueError('Mask source geometry ownership proof mismatch')
    contract['inventory'] = json.dumps([r for r in inventory if r['name'] not in EXPECTED_PARTS], separators=(',', ':'))
    packed = bytearray()
    for view, chunk in zip(views, chunks):
        packed += b'\0' * (-len(packed) % 4)
        view['byteOffset'] = len(packed)
        view['byteLength'] = len(chunk)
        packed += chunk
    gltf['buffers'][0]['byteLength'] = len(packed)
    result = pack_glb(gltf, bytes(packed))
    return result, {'baselineSHA256': BASE_SHA256, 'maskSHA256': MASK_SHA256,
                    'sourceSHA256': SOURCES, 'retiredParts': mask['parts'],
                    'removedTriangles': 296, 'removedIndexBytes': sum(r['beforeBytes']-r['retainedBytes'] for r in changes),
                    'newlyUnusedVertices': sum(r['newlyUnusedVertices'] for r in changes),
                    'indexChanges': changes, 'retiredBaseSHA256': sha(result),
                    'attributeBytesUnchanged': True, 'allOtherIndicesRetainExactOrder': True,
                    'unusedVertexAttributesRetained': True, 'newMaterials': 0}
