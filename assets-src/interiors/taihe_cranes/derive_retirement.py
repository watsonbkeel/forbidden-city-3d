"""Derive a finite crane-component mask from the exact approved display source.

Pure CPU. All 3,798 source display faces must have unique oriented matches in
actual scene space, before selecting the ten named crane components (374 faces).
The existing display integration proof uses a 2 micrometre float32 exporter bound;
that fixed bound is preserved, never widened. No bounds select retirement faces.
"""
import collections
import importlib.util
import itertools
import json
import math
import struct
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0,str(HERE.parent))
from append_taihe_cranes import unpack_glb,sha,target_translation

BASE_PATH = ROOT/'public/models/interiors/taihe-screen-crowns-22c6acdf581d.glb'
BASE_SHA256 = '22c6acdf581dc7779b876963fd935ee482bd22e2a6671b486f9571debc14ac19'
SOURCES = {
 'assets-src/interiors/taihe_display/approved/taihe_display_pairs.py':'2deb0cfb97763cdc2be60af1bbd54021b2345d11984175f7806fc4d3dc671a09',
 'assets-src/interiors/taihe_display/approved/mesh_kernel.py':'c282af36524f4e84aac957cd5560151b0ff2f2c5b7146a6342f36e77d3ad2596',
 'assets-src/interiors/taihe_display/approved/integration_geometry.py':'3f28b2f5d87357b441ea1bf65b991e63926027bf64cb80b347b9b668413ba996',
}
MATERIALS = {'gold':'taihe_gold','darkGold':'taihe_dark_gold','red':'taihe_lacquer','teal':'taihe_teal','dark':'taihe_dark_wood','stone':'taihe_stone','pearl':'taihe_pearl','glyph':'taihe_glyph_atlas'}
COMPONENTS = {'white_enamel_body':('pearl',76),'white_rising_neck':('pearl',56),'white_small_head':('pearl',44),'green_folded_wing':('teal',8),'red_crown':('red',3)}
EXPECTED_PARTS = {f'crane:{side}/{component}':(MATERIALS[key],count) for side in ('left','right') for component,(key,count) in COMPONENTS.items()}
EXPECTED = {'taihe_pearl':352,'taihe_teal':16,'taihe_lacquer':6}
MATCH_EPSILON = 2e-6  # Historical tests/lib/taihe-display-fixture.mjs matchSource.


def oriented_position_bytes(raw):
    """Canonical cyclic float32 order; reversed winding is a different proof."""
    values = struct.unpack('<9f',raw)
    points = [struct.pack('<3f',*(0. if x == 0 else x for x in values[i:i+3])) for i in (0,3,6)]
    return min(b''.join(points[i:]+points[:i]) for i in range(3))


def verify_sources():
    for path,digest in SOURCES.items():
        if sha((ROOT/path).read_bytes()) != digest:
            raise ValueError('Changed approved display source: '+path)


def _load_source(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module


def source_records():
    verify_sources()
    approved = ROOT/'assets-src/interiors/taihe_display/approved'
    previous = sys.modules.get('mesh_kernel')
    try:
        sys.modules['mesh_kernel'] = _load_source('crane_approved_kernel',approved/'mesh_kernel.py')
        source = _load_source('crane_approved_display',approved/'taihe_display_pairs.py')
    finally:
        if previous is None:sys.modules.pop('mesh_kernel',None)
        else:sys.modules['mesh_kernel']=previous
    rows=[]
    for item in source.build_display_pairs('S'):
        mesh=item['local_mesh'];local=collections.Counter()
        if item['scale'] != [1,1,1] or item['yaw_rad'] != 0:raise ValueError('Changed approved placement')
        for ordinal,(face,key,component) in enumerate(zip(mesh['triangles'],mesh['materials'],mesh['components'])):
            part=f"{item['id']}/{component}"
            points=[[mesh['vertices'][j][k]+item['translation'][k] for k in range(3)] for j in face]
            raw=struct.pack('<9f',*(v for p in points for v in p))
            rows.append({'part':part,'assembly':item['id'],'family':item['family'],'component':component,'inventoryName':f"display_{item['id']}_{key}",'material':MATERIALS[key],'sourceTriangleOrdinal':local[part],'sourceAssemblyTriangleOrdinal':ordinal,'sourcePositionSHA256':sha(oriented_position_bytes(raw)),'points':points})
            local[part]+=1
    if len(rows)!=3798:raise ValueError('Changed approved display face count')
    if collections.Counter((r['part'],r['material']) for r in rows if r['part'] in EXPECTED_PARTS)!={(p,m):n for p,(m,n) in EXPECTED_PARTS.items()}:
        raise ValueError('Changed approved crane semantic cardinality')
    return rows


def actual_records(data):
    gltf,binary=unpack_glb(data);rows=[];materials={}
    if len(gltf['buffers'])!=1 or 'uri' in gltf['buffers'][0]:raise ValueError('Expected one local buffer')
    for mi,mesh in enumerate(gltf['meshes']):
        for pi,p in enumerate(mesh['primitives']):
            material=gltf['materials'][p['material']]['name']
            if material in materials:raise ValueError('Ambiguous baseline material')
            translation=target_translation(gltf,mi,material)
            ia=gltf['accessors'][p['indices']];iv=gltf['bufferViews'][ia['bufferView']]
            pa=gltf['accessors'][p['attributes']['POSITION']];pv=gltf['bufferViews'][pa['bufferView']]
            if (p.get('mode',4)!=4 or ia['type']!='SCALAR' or ia['count']%3 or pa['type']!='VEC3' or pa['componentType']!=5126
                or any(a.get('byteOffset',0) or 'sparse' in a for a in (ia,pa)) or any('byteStride' in v or v.get('buffer',0)!=0 for v in (iv,pv))):
                raise ValueError('Unsupported baseline layout')
            fmt={5123:'H',5125:'I'}.get(ia['componentType'])
            if fmt is None or iv['byteLength']!=ia['count']*struct.calcsize(fmt) or pv['byteLength']!=pa['count']*12:raise ValueError('Unsupported baseline lengths')
            ids=struct.unpack_from('<'+fmt*ia['count'],binary,iv.get('byteOffset',0))
            if any(i>=pa['count'] for i in ids):raise ValueError('Invalid baseline index')
            materials[material]={'mesh':mi,'primitive':pi,'indexAccessor':p['indices'],'positionAccessor':p['attributes']['POSITION'],'originalTriangles':len(ids)//3,'removedTriangles':EXPECTED.get(material,0),'nodeTranslation':translation}
            for j in range(0,len(ids),3):
                indices=ids[j:j+3]
                raw=b''.join(binary[pv.get('byteOffset',0)+i*12:pv.get('byteOffset',0)+i*12+12] for i in indices)
                values=struct.unpack('<9f',raw)
                points=[[values[i+k]+translation[k] for k in range(3)] for i in (0,3,6)]
                rows.append({'material':material,'triangleOrdinal':j//3,'indices':list(indices),'positionSHA256':sha(raw),'orientedPositionSHA256':sha(oriented_position_bytes(raw)),'sceneOrientedPositionSHA256':sha(oriented_position_bytes(struct.pack('<9f',*(v for p in points for v in p)))),'points':points})
    return rows,materials


def match_source(records,actual):
    """Full oriented unique source-to-actual bijection, independent of bounds."""
    grid=collections.defaultdict(set)
    def cell(p):return tuple(math.floor(v/MATCH_EPSILON) for v in p)
    for i,row in enumerate(actual):
        for p in row['points']:grid[(row['material'],cell(p))].add(i)
    used=set();out=[]
    for source in records:
        candidates=set();origin=cell(source['points'][0])
        for delta in itertools.product((-1,0,1),repeat=3):
            candidates.update(grid.get((source['material'],tuple(origin[k]+delta[k] for k in range(3))),()))
        matches=[]
        for i in sorted(candidates):
            points=actual[i]['points']
            for rotation in range(3):
                error=max(abs(source['points'][j][k]-points[(j+rotation)%3][k]) for j in range(3) for k in range(3))
                if error<=MATCH_EPSILON:matches.append((i,rotation,error))
        if len(matches)!=1:raise ValueError('No unique oriented baseline match: '+source['part'])
        i,rotation,error=matches[0]
        if i in used:raise ValueError('Ambiguous source owner: '+source['part'])
        used.add(i)
        out.append({**{k:v for k,v in source.items() if k!='points'},**{k:v for k,v in actual[i].items() if k!='points'},'sourceToActualVertexOffset':rotation,'maximumCoordinateError':error})
    return out


def derive():
    verify_sources();data=BASE_PATH.read_bytes()
    if sha(data)!=BASE_SHA256:raise ValueError('Unknown crane retirement baseline')
    source=source_records();actual,materials=actual_records(data);matched=match_source(source,actual)
    rows=[r for r in matched if r['part'] in EXPECTED_PARTS]
    if len(rows)!=374 or len({(r['material'],r['triangleOrdinal']) for r in rows})!=374:raise ValueError('Changed target cardinality')
    by_identity={(r['material'],r['triangleOrdinal']):r for r in actual}
    part_proofs={}
    for part,(material,count) in EXPECTED_PARTS.items():
        rr=sorted((r for r in rows if r['part']==part),key=lambda r:r['sourceTriangleOrdinal'])
        part_proofs[part]={'material':material,'triangles':count,'orientedTriangleHashesSHA256':sha(b''.join(bytes.fromhex(r['sourcePositionSHA256']) for r in rr)),'actualOrientedTriangleHashesSHA256':sha(b''.join(bytes.fromhex(r['orientedPositionSHA256']) for r in rr))}
    gltf,_=unpack_glb(data);contract=next(n['extras'] for n in gltf['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT')
    inventory=json.loads(contract['inventory'])
    whole=[f'display_crane:{side}_{key}' for side in ('left','right') for key in ('pearl','red')]
    partial=[f'display_crane:{side}_teal' for side in ('left','right')]
    updates=[];retained=[]
    for name in partial:
        rr=[r for r in matched if r['inventoryName']==name and r['part'] not in EXPECTED_PARTS]
        if len(rr)!=54 or {r['component'] for r in rr}!={'wave_base'}:raise ValueError('Changed partial inventory ownership')
        points=[p for r in rr for p in by_identity[(r['material'],r['triangleOrdinal'])]['points']]
        original=next(r for r in inventory if r['name']==name)
        updates.append({**original,'min':[min(p[k] for p in points) for k in range(3)],'max':[max(p[k] for p in points) for k in range(3)]})
        retained.extend(rr)
    return {'schema':'taihe-crane-retirement-v1','baseSHA256':BASE_SHA256,'sources':SOURCES,'parts':sorted(EXPECTED_PARTS),'partProofs':part_proofs,'materials':{m:materials[m] for m in EXPECTED},'retiredInventoryNames':whole,'partialInventoryNames':partial,'partialInventoryUpdates':updates,'retainedPartialTriangles':retained,'partInventory':[r for r in inventory if r['name'] in whole+partial],
      'sourceProof':{'sourceTriangles':len(source),'uniqueMatchedTriangles':len(matched),'targetSemanticGroups':len(EXPECTED_PARTS),'targetTriangles':len(rows),'allTargetFacesHaveUniqueSourceOwner':True,'allTargetFacesHaveUniqueBaselineMatch':True,'matchingToleranceMetres':MATCH_EPSILON,'matchingToleranceSource':'tests/lib/taihe-display-fixture.mjs matchSource epsilon=2e-6','maximumCoordinateError':max(r['maximumCoordinateError'] for r in matched),'targetMaximumCoordinateError':max(r['maximumCoordinateError'] for r in rows),'fullOrientedMappingSHA256':sha(json.dumps(matched,sort_keys=True,separators=(',',':')).encode()),'windingPreserved':True,'selection':'Five exact approved crane component names on each side, after matching every source display triangle. No spatial selection.'},
      'triangles':sorted(rows,key=lambda r:(r['material'],r['triangleOrdinal']))}

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=HERE/'retired_crane_faces.json')
    args=parser.parse_args();mask=derive();raw=(json.dumps(mask,indent=2)+'\n').encode();args.output.write_bytes(raw)
    print(json.dumps({'maskSHA256':sha(raw),'removedTriangles':len(mask['triangles']),'sourceProof':mask['sourceProof']},indent=2))
