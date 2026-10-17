"""Derive exact source-owned crown retirement from the frozen 17,266-triangle GLB.

CPU Blender: blender -b -t 1 -P assets-src/interiors/taihe_screen_crowns/derive_retirement.py -- --output assets-src/interiors/taihe_screen_crowns/retired_screen_header_faces.json
Whole source objects are explicitly named. The appended cap is the unique
8-point closed relief component in each screen register-frames part, validated
against its exact component ordinal and 32 source triangles. Bounds describe
replacement surfaces only; never select or authorize retirement triangles.
"""
import collections
import json
import struct
import sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
sys.path.insert(0,str(HERE.parent))
from append_taihe_caisson import unpack_glb,sha
from taihe_furniture.derive_retirement import source_triangles,oriented_position_bytes,SOURCES as ORIGINAL_SOURCES
from taihe_furniture.geometry import build_candidate as furniture_candidate

BASE_PATH=ROOT/'public/models/interiors/taihe-furniture-0bfa52b758cb.glb'
BASE_SHA256='0bfa52b758cba052b0b8258ebc338cb9b0f80129e00d0bb5970ef343758432ea'
SOURCES={**ORIGINAL_SOURCES,'assets-src/interiors/taihe_furniture/geometry.py':'8b0b89fb4e6154d27b04dfee40c7b7da5978247eb43cef30fba7949ccc8b3723'}
EXPECTED={'taihe_gold':1344,'taihe_dark_gold':168,'taihe_lacquer':224}
EXPECTED_PARTS={}
for i in range(7):
    stem=f'screen_{i}'
    EXPECTED_PARTS[stem]=('taihe_lacquer',32)
    for suffix in ('_panel','_panel.001'): EXPECTED_PARTS[stem+suffix]=('taihe_dark_gold',12)
    for suffix in ('_stile','_stile.001','_stile.002','_stile.003','_rail.001','_rail.003'): EXPECTED_PARTS[stem+suffix]=('taihe_gold',12)
    EXPECTED_PARTS['furniture_'+stem+'_crest_curls']=('taihe_gold',88)
    EXPECTED_PARTS['furniture_'+stem+'_register_frames/cap']=('taihe_gold',32)

def appended_records():
    mesh=furniture_candidate(json.loads((ROOT/'data/architecture/taihe-core.json').read_bytes()))
    owners={j:name for name,faces in mesh['parts'].items() for j in faces}
    cap_ids={}
    for i in range(7):
        name=f'screen_{i}_register_frames'
        components=[c for c in mesh['metadata']['components'] if c['name']==name]
        if [len(c['triangles']) for c in components]!=[16,16,16,32]: raise ValueError('Changed source frame components')
        for ordinal,index in enumerate(components[3]['triangles']): cap_ids[index]=(f'furniture_{name}/cap',ordinal)
    records=[]
    local=collections.Counter()
    for i,face in enumerate(mesh['triangles']):
        name='furniture_'+owners[i]; ordinal=local[name]; local[name]+=1
        if i in cap_ids: name,ordinal=cap_ids[i]
        raw=struct.pack('<9f',*(v for j in face for v in mesh['vertices'][j]))
        material={'gold':'taihe_gold','darkGold':'taihe_dark_gold'}[mesh['materials'][i]]
        records.append({'part':name,'material':material,'sourceTriangleOrdinal':ordinal,'oriented':oriented_position_bytes(raw)})
    return records

def derive(screen_output=None):
    for path,digest in SOURCES.items():
        if sha((ROOT/path).read_bytes())!=digest: raise ValueError('Changed frozen source: '+path)
    base=BASE_PATH.read_bytes()
    if sha(base)!=BASE_SHA256: raise ValueError('Unknown baseline')
    records,inventory,proof=source_triangles(); records+=appended_records()
    targets=[r for r in records if r['part'] in EXPECTED_PARTS]
    if collections.Counter((r['part'],r['material']) for r in targets)!={(n,m):c for n,(m,c) in EXPECTED_PARTS.items()}: raise ValueError('Changed semantic ownership')
    owners=collections.defaultdict(list)
    for row in records: owners[(row['material'],row['oriented'])].append((row['part'],row['sourceTriangleOrdinal']))
    gltf,binary=unpack_glb(base); actual=collections.defaultdict(list);materials={}
    for mi,mesh in enumerate(gltf['meshes']):
        for pi,p in enumerate(mesh['primitives']):
            name=gltf['materials'][p['material']]['name']
            if name not in EXPECTED: continue
            if name in materials: raise ValueError('Ambiguous material')
            ia=gltf['accessors'][p['indices']];iv=gltf['bufferViews'][ia['bufferView']]
            pa=gltf['accessors'][p['attributes']['POSITION']];pv=gltf['bufferViews'][pa['bufferView']]
            if any(a.get('byteOffset',0) or 'sparse' in a for a in (ia,pa)) or any('byteStride' in v for v in (iv,pv)): raise ValueError('Unsupported layout')
            ids=struct.unpack_from('<'+{5123:'H',5125:'I'}[ia['componentType']]*ia['count'],binary,iv.get('byteOffset',0))
            materials[name]={'mesh':mi,'primitive':pi,'indexAccessor':p['indices'],'positionAccessor':p['attributes']['POSITION'],'originalTriangles':len(ids)//3,'removedTriangles':EXPECTED[name]}
            for j in range(0,len(ids),3):
                indices=ids[j:j+3];raw=b''.join(binary[pv.get('byteOffset',0)+i*12:pv.get('byteOffset',0)+i*12+12] for i in indices)
                actual[(name,oriented_position_bytes(raw))].append({'material':name,'triangleOrdinal':j//3,'indices':list(indices),'positionSHA256':sha(raw)})
    if screen_output is not None:
        screen_records=[r for r in records if r['part'].startswith(('screen_','furniture_screen_'))]
        screen_rows=[]
        for row in screen_records:
            key=(row['material'],row['oriented'])
            if len(actual[key])!=1: raise ValueError('No unique diagnostic screen match: '+row['part'])
            screen_rows.append({**actual[key][0],'part':row['part']})
        screen_output.write_text(json.dumps({'baselineSHA256':BASE_SHA256,'selection':'Exact screen source object/part ownership; diagnostic only','triangles':screen_rows},indent=2)+'\n')
    rows=[];parts={}
    for row in targets:
        key=(row['material'],row['oriented'])
        if owners[key]!=[(row['part'],row['sourceTriangleOrdinal'])]: raise ValueError('Ambiguous source owner: '+row['part'])
        if len(actual[key])!=1: raise ValueError('No unique exact baseline match: '+row['part'])
        rows.append({**actual[key][0],'part':row['part'],'sourceTriangleOrdinal':row['sourceTriangleOrdinal'],'sourcePositionSHA256':sha(row['oriented'])})
    for name,(material,count) in EXPECTED_PARTS.items():
        rr=sorted((r for r in rows if r['part']==name),key=lambda r:r['sourceTriangleOrdinal'])
        points=[p for r in targets if r['part']==name for p in zip(*[iter(struct.unpack('<9f',r['oriented']))]*3)]
        parts[name]={'material':material,'triangles':count,'min':[min(p[k] for p in points) for k in range(3)],'max':[max(p[k] for p in points) for k in range(3)],'orientedTriangleHashesSHA256':sha(b''.join(bytes.fromhex(r['sourcePositionSHA256']) for r in rr))}
    if len({(r['material'],r['triangleOrdinal']) for r in rows})!=1736: raise ValueError('Not one-to-one')
    contract=next(n['extras'] for n in gltf['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT')
    whole=sorted(n for n in EXPECTED_PARTS if '/' not in n)
    partial=sorted(n.split('/')[0] for n in EXPECTED_PARTS if '/' in n)
    return {'schema':'taihe-screen-crown-retirement-v1','baseSHA256':BASE_SHA256,'sources':SOURCES,'parts':sorted(EXPECTED_PARTS),'partProofs':parts,'materials':materials,'retiredInventoryNames':whole,'partialInventoryNames':partial,'partInventory':[r for r in json.loads(contract['inventory']) if r['name'] in whole+partial],
        'sourceProof':{**proof,'appendedSourceTriangles':len(appended_records()),'targetSemanticGroups':len(EXPECTED_PARTS),'targetTriangles':1736,'allTargetFacesHaveUniqueSourceOwner':True,'allTargetFacesHaveUniqueBaselineMatch':True,'maximumCoordinateError':0,'windingPreserved':True,'selection':'Exact 63 original object names; 7 appended curl parts; 7 source component ordinal 3 cap frames. No spatial filter.'},'triangles':sorted(rows,key=lambda r:(r['material'],r['triangleOrdinal']))}

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);parser.add_argument('--diagnostic-screen',type=Path)
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);mask=derive(args.diagnostic_screen);data=(json.dumps(mask,indent=2)+'\n').encode();args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_bytes(data)
    print(json.dumps({'maskSHA256':sha(data),'retiredTriangles':len(mask['triangles']),'partCount':len(mask['parts']),'sourceProof':mask['sourceProof']},indent=2))
