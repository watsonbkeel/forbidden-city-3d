"""Bounded crane-only sibling of the immutable screen append primitive.

Accept hall-local Y-up geometry; convert positions to each pinned node frame.
The original teal batch has a fixed translation, so its normal transform is
identity. No other transform is accepted. Existing attribute/index bytes remain
exact prefixes; no materials, UV channels, colors, or scene nodes are created.
"""
import copy
import hashlib
import json
import math
import struct


def sha(data):
    return hashlib.sha256(data).hexdigest()


def unpack_glb(data):
    if data[:4] != b'glTF' or struct.unpack_from('<II', data, 4) != (2, len(data)):
        raise ValueError('Expected exact GLB v2 container')
    length, kind = struct.unpack_from('<II', data, 12)
    if kind != 0x4e4f534a:
        raise ValueError('Expected JSON chunk')
    gltf = json.loads(data[20:20 + length])
    offset = 20 + length
    size, kind = struct.unpack_from('<II', data, offset)
    if kind != 0x004e4942 or offset + 8 + size != len(data):
        raise ValueError('Expected single BIN chunk')
    return gltf, data[offset + 8:]


def pack_glb(gltf, binary):
    document = json.dumps(gltf, separators=(',', ':'), ensure_ascii=False).encode()
    document += b' ' * (-len(document) % 4)
    binary += b'\0' * (-len(binary) % 4)
    return (struct.pack('<4sII', b'glTF', 2, 28 + len(document) + len(binary))
            + struct.pack('<II', len(document), 0x4e4f534a) + document
            + struct.pack('<II', len(binary), 0x004e4942) + binary)


MATERIALS = {'pearl': 'taihe_pearl', 'teal': 'taihe_teal', 'red': 'taihe_lacquer'}
TEAL_TRANSLATION = [0, 2.609999895095825, 11.260000228881836]


def target_translation(gltf, mesh_index, material):
    """Validate the exact original flat-scene frame; never generalize silently."""
    matches = [(i,n) for i,n in enumerate(gltf['nodes']) if n.get('mesh') == mesh_index]
    if len(matches) != 1:
        raise ValueError('Expected one target mesh node')
    ni,node = matches[0]
    actual = {k:node[k] for k in ('matrix','translation','rotation','scale') if k in node}
    expected = {'translation':TEAL_TRANSLATION} if material == 'taihe_teal' else {}
    scene = gltf['scenes'][gltf.get('scene',0)]
    if (actual != expected or ni not in scene['nodes']
            or any(ni in n.get('children',[]) for n in gltf['nodes'])):
        raise ValueError('Unexpected target node frame')
    return TEAL_TRANSLATION[:] if material == 'taihe_teal' else [0,0,0]


def append_batches(base, batches, identity, inventory):
    """Append pearl/teal/red hall-local positions and unit normals, then metadata.

    Returns (GLB bytes, exact retained-prefix receipts). The teal translation is
    subtracted from incoming positions before float32 encoding. Normals remain
    unchanged because every accepted node has identity rotation and scale.
    """
    gltf, binary = unpack_glb(base)
    gltf = copy.deepcopy(gltf)
    if len(gltf['buffers']) != 1 or 'uri' in gltf['buffers'][0]:
        raise ValueError('Expected one local binary buffer')
    views = gltf['bufferViews']
    chunks = [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in views]
    materials = MATERIALS
    rows = []
    used_accessors = set()
    for key, batch in batches.items():
        if key not in materials:
            raise ValueError('Unexpected crane material')
        matches = [(mi, p) for mi, m in enumerate(gltf['meshes']) for p in m['primitives']
                   if gltf['materials'][p['material']]['name'] == materials[key]]
        if len(matches) != 1:
            raise ValueError('Expected one existing material batch')
        mi, primitive = matches[0]
        translation = target_translation(gltf, mi, materials[key])
        if primitive.get('mode', 4) != 4:
            raise ValueError('Expected triangle primitive')
        pos, norm, indices = batch['position'], batch['normal'], batch['indices']
        if not pos or len(pos) % 3 or len(norm) != len(pos) or not indices or len(indices) % 3:
            raise ValueError('Invalid crane attributes')
        if not all(math.isfinite(v) for v in pos + norm):
            raise ValueError('Nonfinite crane attributes')
        count = len(pos) // 3
        if any(type(i) is not int or i < 0 or i >= count for i in indices):
            raise ValueError('Invalid crane index')
        if any(abs(sum(v*v for v in norm[j:j+3])-1) > 1e-5 for j in range(0,len(norm),3)):
            raise ValueError('Expected unit input normals')
        pos = [v-translation[i%3] for i,v in enumerate(pos)]
        old_count = gltf['accessors'][primitive['attributes']['POSITION']]['count']
        expected = {'POSITION', 'NORMAL'}
        if set(primitive['attributes']) != expected:
            raise ValueError('Unexpected target attributes')
        for name, ai in {**primitive['attributes'], 'INDICES': primitive['indices']}.items():
            accessor = gltf['accessors'][ai]
            vi = accessor['bufferView']
            view = views[vi]
            if ai in used_accessors or 'sparse' in accessor or accessor.get('byteOffset', 0) or 'byteStride' in view:
                raise ValueError('Unsupported shared/sparse/interleaved accessor')
            if sum(a.get('bufferView') == vi for a in gltf['accessors']) != 1:
                raise ValueError('Shared target bufferView')
            references = [p for mesh in gltf['meshes'] for p in mesh['primitives']
                          if ai == p.get('indices') or ai in p.get('attributes', {}).values()]
            if len(references) != 1 or references[0] is not primitive:
                raise ValueError('Target accessor shared by another primitive')
            used_accessors.add(ai)
            if view.get('buffer',0) != 0:
                raise ValueError('Unexpected target buffer')
            before = bytes(chunks[vi])
            if name == 'INDICES':
                fmt = {5123: 'H', 5125: 'I'}.get(accessor['componentType'])
                if not fmt or accessor['type'] != 'SCALAR':
                    raise ValueError('Unsupported index type')
                if accessor['count'] % 3 or len(before) != accessor['count'] * struct.calcsize(fmt):
                    raise ValueError('Invalid original index length')
                original_indices = struct.unpack('<'+fmt*accessor['count'],before)
                if any(i >= old_count for i in original_indices):
                    raise ValueError('Invalid original index')
                values = [i + old_count for i in indices]
                if 'min' in accessor: accessor['min'] = [min(*accessor['min'],min(values))]
                if 'max' in accessor: accessor['max'] = [max(*accessor['max'],max(values))]
                if fmt == 'H' and max(values) > 65535:
                    raise ValueError('Index budget would require changing old bytes')
                accessor['count'] += len(values)
            else:
                if accessor['componentType'] != 5126 or accessor['count'] != old_count or accessor['type'] != 'VEC3' or len(before) != old_count*12:
                    raise ValueError('Unsupported attribute count/type')
                values = pos if name == 'POSITION' else norm
                fmt = 'f'
                accessor['count'] += count
                if name == 'POSITION':
                    for bound, fun in [('min', min), ('max', max)]:
                        accessor[bound] = [fun(accessor[bound][axis], fun(values[axis::3])) for axis in range(3)]
            chunks[vi] += struct.pack('<' + fmt * len(values), *values)
            rows.append({'accessor': ai, 'semantic': name, 'material': materials[key],
                         'retainedBytes': len(before), 'retainedSHA256': sha(before),
                         'addedBytes': len(chunks[vi]) - len(before)})
    packed = bytearray()
    for view, chunk in zip(views, chunks):
        packed += b'\0' * (-len(packed) % 4)
        view['byteOffset'] = len(packed)
        view['byteLength'] = len(chunk)
        packed += chunk
    gltf['buffers'][0]['byteLength'] = len(packed)
    contracts = [n for n in gltf['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT']
    if len(contracts) != 1:
        raise ValueError('Expected one core contract')
    contract = contracts[0]['extras']
    if any(k in contract for k in identity):
        raise ValueError('Refuse to replace existing contract field')
    contract.update(identity)
    old_inventory = json.loads(contract['inventory'])
    contract['inventory'] = json.dumps(old_inventory + inventory, separators=(',', ':'))
    return pack_glb(gltf, bytes(packed)), rows
