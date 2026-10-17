"""Bounded detail-only throne/screen increment; no registration or light changes.

Retires 17 source-identified chair-back parts, preserving every old attribute.
Original estimated relief reuses the existing gold/dark-gold material batches.
"""
import json
from pathlib import Path
import sys
from append_taihe_caisson import append_batches, sha
from retire_taihe_throne_back import retire_throne_back
from taihe_caisson.geometry import material_batches
from taihe_furniture.geometry import build_candidate

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = ROOT / 'public/models/interiors/taihe-caisson-9067bcce8b91.glb'
BASE_SHA = '9067bcce8b91f719a5e39ca1cfc2a1d1c5c013d5fcd4488dc92ee920ada7015d'


def inventory(mesh):
    rows = []
    for name, faces in mesh['parts'].items():
        points = [mesh['vertices'][j] for i in faces for j in mesh['triangles'][i]]
        rows.append({'name': 'furniture_' + name,
                     'min': [min(p[k] for p in points) for k in range(3)],
                     'max': [max(p[k] for p in points) for k in range(3)]})
    return rows


def build(output=None):
    output = Path(output) if output else ROOT
    profile_path = ROOT / 'data/architecture/taihe-core.json'
    profile = json.loads(profile_path.read_bytes())
    base = BASE.read_bytes()
    if sha(base) != BASE_SHA:
        raise ValueError('Frozen pre-furniture GLB changed')
    mask = HERE / 'taihe_furniture/retired_throne_back_faces.json'
    retired, retirement = retire_throne_back(base, mask.read_bytes())
    mesh = build_candidate(profile, 'detail')
    count = len(mesh['triangles'])
    if count > 3000:
        raise ValueError('Furniture increment exceeds its 3000-triangle allocation')
    total = 14582 - retirement['removedTriangles'] + count
    if total > profile['budgets']['sVisibleTriangles']:
        raise ValueError('Frozen detailed geometry budget exceeded')
    identity = {
        'furnitureSourceSHA256': sha((HERE / 'taihe_furniture/geometry.py').read_bytes()),
        'furnitureBaseAssetSHA256': BASE_SHA,
        'furnitureIntegrationSHA256': sha((HERE / 'append_taihe_caisson.py').read_bytes()),
        'furnitureRetirementSHA256': sha((HERE / 'retire_taihe_throne_back.py').read_bytes()),
        'furnitureMaskSHA256': sha(mask.read_bytes()),
        'furnitureTriangles': count,
        'furnitureRemovedTriangles': retirement['removedTriangles'],
    }
    added_inventory = inventory(mesh)
    glb, prefixes = append_batches(retired, material_batches(mesh), identity, added_inventory)
    digest = sha(glb)
    relative = 'public/models/interiors/taihe-furniture-' + digest[:12] + '.glb'
    target = output / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(glb)
    sources = [HERE / 'taihe_furniture/geometry.py', mask,
               HERE / 'taihe_furniture/derive_retirement.py',
               HERE / 'retire_taihe_throne_back.py', HERE / 'append_taihe_caisson.py',
               HERE / 'taihe_caisson/geometry.py', Path(__file__)]
    manifest = {
        'schema': 'taihe-furniture-detail-1',
        'status': 'source-informed estimated visual candidate; ordinary pixel review pending',
        'baselineAsset': str(BASE.relative_to(ROOT)), 'baselineSHA256': BASE_SHA,
        'sources': {str(p.relative_to(ROOT)): sha(p.read_bytes()) for p in sources},
        'profileSHA256': sha(profile_path.read_bytes()),
        'asset': {'path': relative, 'sha256': digest, 'encodedBytes': len(glb),
                  'renderableTriangles': total, 'visibleBatches': 8},
        'identity': identity, 'accessorPrefixes': prefixes, 'retirement': retirement,
        'appendedInventory': added_inventory, 'geometry': mesh['metadata'],
        'fallback': {'changed': False, 'renderableTriangles': 1596, 'visibleBatches': 8,
                     'note': 'Existing coarse chair/screen remains until a separately budgeted silhouette replacement.'},
        'unchanged': ['published artifact dimensions', 'provisional furniture registration',
                      'screen substrates and seat/arms/base/blue backing/footstool',
                      'caisson, ceiling, columns, display pairs and other halls',
                      'navigation/collision/floor data', 'material factors and lighting',
                      '8 core batches and original scene performance budgets'],
    }
    target = output / 'docs/current-state/taihe-furniture/SOURCE-MANIFEST.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    return manifest


if __name__ == '__main__':
    result = build(sys.argv[1] if len(sys.argv) > 1 else None)
    print(json.dumps({'asset': result['asset'], 'identity': result['identity']}, ensure_ascii=False))
