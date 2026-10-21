"""R33 reversible plaque-only depth fit over the accepted R32 Taihe asset.

The museum photograph establishes ordinal depth, not surveyed mount coordinates.
Only 28 verified plaque Z float32 values move. Materials, indices, normals, UVs,
all other geometry, previous asset files and permanent navigation are retained.
Run: python assets-src/interiors/fit_taihe_hanging.py
"""
import copy
import json
import struct
from pathlib import Path
from append_taihe_caisson import pack_glb, unpack_glb, sha

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'public/models/interiors/taihe-dais-front-24481a47ba8d.glb'
BASE_SHA = '24481a47ba8d199679f03c63ca818ef9efec2dff53977e5037e556b128cb9e70'
BASE_PROFILE = ROOT / 'assets-src/interiors/taihe_hanging_fit/r32-profile.json'
BASE_PROFILE_SHA = '5febda5436765e258e67300bf4b737566e4e522d60ebb9587222c9e4ed1a181c'
PROFILE = ROOT / 'data/architecture/taihe-core.json'


def fit(base, profile_bytes):
    if sha(base) != BASE_SHA:
        raise ValueError('Unknown frozen R32 hanging baseline')
    if sha(BASE_PROFILE.read_bytes()) != BASE_PROFILE_SHA:
        raise ValueError('Changed frozen R32 profile')
    profile = json.loads(profile_bytes)
    before = json.loads(BASE_PROFILE.read_bytes())
    restored = copy.deepcopy(profile)
    for key in ('revision', 'status'):
        restored[key] = before[key]
    restored.pop('hangingFit', None)
    restored['plaque']['z'] = before['plaque']['z']
    if restored != before:
        raise ValueError('R33 hanging fit changes an unrelated profile value')
    fit_profile = profile['hangingFit']
    target = profile['columns']['goldZ'][0] - fit_profile['beamHalfDepth'] - fit_profile['plaqueBackDepth']
    if abs(profile['plaque']['z'] - target) > 1e-9 or abs(target + 5.8968) > 1e-9:
        raise ValueError('Plaque must meet the existing nearer beam south face')
    delta = profile['plaque']['z'] - before['plaque']['z']
    gltf, binary = unpack_glb(base)
    gltf = copy.deepcopy(gltf)
    output = bytearray(binary)
    if len(gltf['meshes']) != 8 or len(gltf['materials']) != 8:
        raise ValueError('Changed eight-batch baseline')
    selections = []
    for mi, mesh in enumerate(gltf['meshes']):
        if len(mesh['primitives']) != 1:
            raise ValueError('Unexpected primitive layout')
        primitive = mesh['primitives'][0]
        name = gltf['materials'][primitive['material']]['name']
        if name not in ('taihe_dark_wood', 'taihe_glyph_atlas'):
            continue
        nodes = [n for n in gltf['nodes'] if n.get('mesh') == mi]
        if len(nodes) != 1 or any(k in nodes[0] for k in ('translation', 'rotation', 'scale', 'matrix')):
            raise ValueError('Plaque batch must retain its identity frame')
        ai = primitive['attributes']['POSITION']
        accessor = gltf['accessors'][ai]
        view = gltf['bufferViews'][accessor['bufferView']]
        if (accessor['componentType'] != 5126 or accessor['type'] != 'VEC3'
                or accessor.get('byteOffset', 0) or 'sparse' in accessor
                or 'byteStride' in view or view['byteLength'] != accessor['count'] * 12
                or sum(a.get('bufferView') == accessor['bufferView'] for a in gltf['accessors']) != 1):
            raise ValueError('Unexpected plaque position layout')
        start = view.get('byteOffset', 0)
        points = [struct.unpack_from('<3f', binary, start + i * 12) for i in range(accessor['count'])]
        selected = [i for i, (x, y, z) in enumerate(points) if abs(x) < 3.5 and 6.3 < y < 9.3 and 4.9 < z < 5.2]
        expected = 24 if name == 'taihe_dark_wood' else 4
        if len(selected) != expected:
            raise ValueError('Missing or duplicated source-owned plaque vertices')
        for i in selected:
            x, y, z = points[i]
            if name == 'taihe_dark_wood':
                valid = abs(abs(x)-3.4)<1e-5 and min(abs(y-6.4),abs(y-9.2))<1e-5 and min(abs(z-4.97),abs(z-5.13))<1e-5
            else:
                valid = abs(abs(x)-3.31)<1e-5 and min(abs(y-6.49),abs(y-9.11))<1e-5 and abs(z-4.969)<1e-5
            if not valid:
                raise ValueError('Plaque source corners changed')
        ia = gltf['accessors'][primitive['indices']]
        iv = gltf['bufferViews'][ia['bufferView']]
        ids = struct.unpack_from('<'+{5123:'H',5125:'I'}[ia['componentType']]*ia['count'], binary, iv.get('byteOffset',0)+ia.get('byteOffset',0))
        selected_set = set(selected)
        faces = [ids[j:j+3] for j in range(0,len(ids),3) if any(i in selected_set for i in ids[j:j+3])]
        if len(faces) != (12 if expected == 24 else 2) or any(any(i not in selected_set for i in f) for f in faces):
            raise ValueError('Plaque shares vertices with an unrelated face')
        for i in selected:
            struct.pack_into('<f', output, start+i*12+8, points[i][2]+delta)
        shifted = [struct.unpack_from('<3f', output, start+i*12) for i in range(accessor['count'])]
        accessor['min'] = [min(p[k] for p in shifted) for k in range(3)]
        accessor['max'] = [max(p[k] for p in shifted) for k in range(3)]
        selections.append({'material':name, 'accessor':ai, 'vertices':selected, 'triangles':len(faces)})
    if sum(len(row['vertices']) for row in selections) != 28:
        raise ValueError('Incomplete plaque-only translation')
    allowed = set()
    for row in selections:
        accessor = gltf['accessors'][row['accessor']]
        start = gltf['bufferViews'][accessor['bufferView']].get('byteOffset', 0)
        for i in row['vertices']:
            allowed.update(range(start+i*12+8, start+i*12+12))
    if any(a != b and i not in allowed for i, (a,b) in enumerate(zip(binary, output))):
        raise ValueError('Unrelated binary byte changed')
    contract = next(n['extras'] for n in gltf['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT')
    if contract['profileSHA256'] != BASE_PROFILE_SHA:
        raise ValueError('Unexpected baseline profile contract')
    inventory = json.loads(contract['inventory'])
    parts = [p for p in inventory if p['name'] in ('plaque_frame','plaque_letters')]
    if len(parts) != 2:
        raise ValueError('Missing unique plaque semantic inventory')
    for item in parts:
        for bound in ('min','max'):
            item[bound][2] += delta
    contract['inventory'] = json.dumps(inventory,separators=(',',':'))
    contract['revision'] = profile['revision']
    contract['profileSHA256'] = sha(profile_bytes)
    identity = {'hangingFitId':fit_profile['id'], 'hangingFitSourceSHA256':sha(Path(__file__).read_bytes()),
                'hangingFitBaseAssetSHA256':BASE_SHA, 'hangingFitChangedVertices':28, 'hangingFitDeltaZ':delta}
    contract.update(identity)
    receipt = {'classification':fit_profile['classification'], 'baseAssetSHA256':BASE_SHA,
               'profileBeforeSHA256':BASE_PROFILE_SHA,'profileAfterSHA256':sha(profile_bytes),
               'deltaZ':delta,'selections':selections,'binaryBytesBefore':len(binary),
               'binaryBytesAfter':len(output),'renderableTriangles':17924,'visibleBatches':8,
               'unchanged':'All non-plaque position bytes, all normals, UVs, indices, materials and permanent navigation'}
    return pack_glb(gltf, bytes(output)), identity, receipt


def main():
    result, identity, receipt = fit(BASE.read_bytes(), PROFILE.read_bytes())
    digest = sha(result)
    name = 'taihe-hanging-fit-' + digest[:12] + '.glb'
    target = BASE.parent / name
    target.write_bytes(result)
    cfg_path = ROOT / 'data/interiors/taihe.json'
    cfg = json.loads(cfg_path.read_bytes())
    cfg['model'] = '/models/interiors/' + name
    cfg['asset'].update(identity)
    cfg['asset'].update({'sha256':digest,'encodedBytes':len(result),'profileSHA256':sha(PROFILE.read_bytes()),
                         'hangingFitNote':'R33 photo-informed nearer-beam plaque mounting; dimensions and all other scene elements retained, not a surveyed mount'})
    cfg_path.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
    receipt.update({'assetSHA256':digest,'model':cfg['model'],'encodedBytes':len(result)})
    (ROOT/'docs/current-state/r33-taihe-hanging-fit/ASSET-RECEIPT.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'model':cfg['model'],'sha256':digest,'changedVertices':28,'triangles':17924,'batches':8}))


if __name__ == '__main__':
    main()
