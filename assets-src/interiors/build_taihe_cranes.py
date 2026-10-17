"""Small source-informed enamel-crane replacement on frozen screen crowns.

No reexport: retain original attributes and unrelated indices exactly. The
replacement uses component-local normals, not a material or lighting change.
"""
import json
import struct
import sys
from pathlib import Path
from append_taihe_cranes import append_batches, unpack_glb, pack_glb, sha
from taihe_cranes.retire import retire_cranes
from taihe_cranes.crane_replacement import build_crane_replacement

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = ROOT / 'public/models/interiors/taihe-screen-crowns-22c6acdf581d.glb'
BASE_SHA = '22c6acdf581dc7779b876963fd935ee482bd22e2a6671b486f9571debc14ac19'
PLACEMENTS = ((-2.80, 2.06, 10.20), (2.80, 2.06, 10.20))


def replacement_batches():
    mesh = build_crane_replacement().data()
    batches, inventory = {}, []
    for side, translation in zip(('left', 'right'), PLACEMENTS):
        points_by_component = {}
        for face, material, name, normals in zip(mesh['triangles'], mesh['materials'], mesh['components'], mesh['corner_normals']):
            batch = batches.setdefault(material, {'position': [], 'normal': [], 'indices': []})
            first = len(batch['position']) // 3
            for vertex, normal in zip(face, normals):
                point = [mesh['vertices'][vertex][k] + translation[k] for k in range(3)]
                batch['position'].extend(point)
                batch['normal'].extend(normal)
                points_by_component.setdefault(name, []).append(point)
            batch['indices'].extend((first, first + 1, first + 2))
        for name, points in points_by_component.items():
            # Final scene-space bounds are verified against decoded positions.
            encoded = [struct.unpack('<3f', struct.pack('<3f', *p)) for p in points]
            inventory.append({'name': 'enamelCrane_' + side + '_' + name,
                              'min': [min(p[k] for p in encoded) for k in range(3)],
                              'max': [max(p[k] for p in encoded) for k in range(3)]})
    return batches, inventory, mesh


def update_inventory(retired, receipt):
    gltf, binary = unpack_glb(retired)
    contract = next(n['extras'] for n in gltf['nodes'] if n.get('name') == 'TAIHE_CORE_CONTRACT')
    old = json.loads(contract['inventory'])
    removed = set(receipt['retiredInventoryNames'])
    changes = {r['name']: r for r in receipt['partialInventoryUpdates']}
    if len(removed) != 4 or len(changes) != 2:
        raise ValueError('Unexpected crane inventory ownership')
    if not removed.issubset({r['name'] for r in old}) or not set(changes).issubset({r['name'] for r in old}):
        raise ValueError('Missing crane inventory')
    contract['inventory'] = json.dumps([changes.get(r['name'], r) for r in old if r['name'] not in removed], separators=(',', ':'))
    return pack_glb(gltf, binary)


def build(output=None):
    output = Path(output) if output else ROOT
    base = BASE.read_bytes()
    if sha(base) != BASE_SHA:
        raise ValueError('Frozen screen-crown baseline changed')
    mask = HERE / 'taihe_cranes/retired_crane_faces.json'
    retired, retirement = retire_cranes(base, mask.read_bytes())
    retired = update_inventory(retired, retirement)
    batches, inventory, mesh = replacement_batches()
    count = 2 * len(mesh['triangles'])
    total = 17770 - retirement['removedTriangles'] + count
    if retirement['removedTriangles'] != 374 or count > 574 or total > 17970:
        raise ValueError('Crane increment exceeds bounded allocation')
    profile = ROOT / 'data/architecture/taihe-core.json'
    if total > json.loads(profile.read_bytes())['budgets']['sVisibleTriangles']:
        raise ValueError('Original core triangle ceiling exceeded')
    identity = {
        'enamelCraneSourceSHA256': sha((HERE / 'taihe_cranes/crane_replacement.py').read_bytes()),
        'enamelCraneBaseAssetSHA256': BASE_SHA,
        'enamelCraneIntegrationSHA256': sha((HERE / 'append_taihe_cranes.py').read_bytes()),
        'enamelCraneRetirementSHA256': sha((HERE / 'taihe_cranes/retire.py').read_bytes()),
        'enamelCraneMaskSHA256': sha(mask.read_bytes()),
        'enamelCraneTriangles': count,
        'enamelCraneRemovedTriangles': retirement['removedTriangles'],
    }
    glb, prefixes = append_batches(retired, batches, identity, inventory)
    digest = sha(glb)
    relative = 'public/models/interiors/taihe-enamel-cranes-' + digest[:12] + '.glb'
    target = output / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(glb)
    sources = [HERE / 'taihe_cranes' / name for name in ('crane_replacement.py', 'derive_retirement.py', 'retire.py', 'retired_crane_faces.json')]
    sources += [HERE / 'append_taihe_cranes.py', Path(__file__)]
    result = {
        'schema': 'taihe-enamel-cranes-1',
        'status': 'source-informed simplified silhouette candidate; ordinary image review pending',
        'baselineAsset': str(BASE.relative_to(ROOT)), 'baselineSHA256': BASE_SHA,
        'profileSHA256': sha(profile.read_bytes()),
        'sources': {str(p.relative_to(ROOT)): sha(p.read_bytes()) for p in sources},
        'asset': {'path': relative, 'sha256': digest, 'encodedBytes': len(glb), 'renderableTriangles': total, 'visibleBatches': 8},
        'identity': identity, 'retirement': retirement, 'accessorPrefixes': prefixes,
        'appendedInventory': inventory,
        'geometry': {'componentsPerCrane': sorted(set(mesh['components'])), 'trianglesPerCrane': len(mesh['triangles']),
                     'placements': PLACEMENTS, 'placementStatus': 'retained authoring estimates',
                     'normals': 'component-local smooth curved surfaces; no global welding'},
        'fallback': {'changed': False, 'renderableTriangles': 1596, 'visibleBatches': 8},
        'unchanged': ['published historical crane height/leg/lower-beak anchors', 'stand/rock/legs/toes/lower beak',
                      'all other furnishings, screen crowns and building geometry', 'materials/textures/lights',
                      'navigation/collision/floors', 'original 18000-triangle and 8-batch ceilings'],
    }
    target = output / 'docs/current-state/taihe-enamel-cranes/SOURCE-MANIFEST.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
    return result


if __name__ == '__main__':
    result = build(sys.argv[1] if len(sys.argv) > 1 else None)
    print(json.dumps({'asset': result['asset'], 'identity': result['identity']}, ensure_ascii=False))
