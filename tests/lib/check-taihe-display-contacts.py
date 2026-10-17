"""Portable source/decoded-coordinate geometry guards; no browser or renderer.
Input JSON is reconstructed exclusively from actual integrated mesh triangles.
The 2 micrometre decoded tolerance covers float32 material-frame conversion;
source checks retain the approved 1e-8 tolerance and mutation probes are 0.1 m.
"""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'assets-src/interiors/taihe_display/approved'))
from taihe_display_pairs import build_display_pairs
from mesh_kernel import sub,cross,dot
spec=importlib.util.spec_from_file_location('guards',Path(__file__).with_name('taihe-display-geometry-guards.py'))
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)


def validate(items):
    for item in items:
        guard.validate_declared_pairs(item['local_mesh'])
        guard.validate_orientation(item)
        if item['family']=='crane':guard.validate_crane_contacts(item)
        if item['lod']=='fallback':guard.validate_fallback_junctions(item)


def reject(fn):
    try:fn()
    except AssertionError:return
    raise AssertionError('deliberate actual-geometry mutation was not rejected')


payload=json.loads(sys.stdin.read())
validate(build_display_pairs('S')+build_display_pairs('fallback'))
assert guard.runtime_material_sides()==payload['materialSides']
guard.EPS=2e-6
checks=[]
for lod in ('S','fallback'):
    items=payload[lod]
    validate(items)
    bird=next(i for i in items if i['family']=='crane')
    for component,delta in [('gilt_leg',.5),('white_rising_neck',.1),('tapered_lower_beak',.1)]:
        bad=deepcopy(bird);m=bad['local_mesh'];ids={j for t,c in zip(m['triangles'],m['components']) if c==component for j in t}
        for j in ids:m['vertices'][j][0]+=delta
        reject(lambda:guard.validate_crane_contacts(bad))
        checks.append(lod+': shifted actual '+component+' rejected')
    if lod=='fallback':
        bad=deepcopy(bird);m=bad['local_mesh'];i=m['components'].index('tapered_lower_beak');m['triangles'][i].reverse()
        reject(lambda:guard.validate_orientation(bad));checks.append('fallback: inward actual beak rejected')
        bad=deepcopy(items[0]);m=bad['local_mesh'];a,b=m['two_sided_pairs'][0];m['triangles'][b]=m['triangles'][a][:]
        reject(lambda:guard.validate_declared_pairs(m));checks.append('fallback: corrupted actual reverse sheet rejected')
        beast=deepcopy(next(i for i in items if i['family']=='luduan'));m=beast['local_mesh'];ids={j for t,c in zip(m['triangles'],m['components']) if c=='short_leg' for j in t}
        for j in ids:m['vertices'][j][0]+=.5
        reject(lambda:guard.validate_fallback_junctions(beast));checks.append('fallback: detached actual luduan legs rejected')
        pavilion=deepcopy(next(i for i in items if i['family']=='incense_pavilion'));m=pavilion['local_mesh'];i=m['components'].index('lower_eave_underside')
        for k in ['triangles','materials','components']:m[k].pop(i)
        reject(lambda:guard.validate_fallback_junctions(pavilion));checks.append('fallback: missing actual lower roof disk rejected')
print(json.dumps({'sourceTolerance':1e-8,'decodedFloat32Tolerance':guard.EPS,'actualAssemblies':16,'contactChecks':'passed','negativeProbes':checks}))
