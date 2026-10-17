"""Finite source-owned retirement; all attributes and unrelated index bytes exact.

This low-level function deliberately leaves node/contract metadata unchanged.
The integration owner must replace retired inventory entries and add the new
candidate identity after append. No spatial selection, scene reexport or old
vertex compaction is performed.
"""
import copy
import json
import struct
from pathlib import Path
from append_taihe_cranes import unpack_glb,pack_glb,sha,target_translation
from taihe_cranes.derive_retirement import BASE_SHA256,SOURCES,EXPECTED,EXPECTED_PARTS,oriented_position_bytes
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
MASK_PATH=HERE/'retired_crane_faces.json'
MASK_SHA256='314acd8f842661574f79a87ecb66fffb2308b8debab95276dd4fc71392db2466'

def retire_cranes(base_bytes,mask_bytes=None):
    if sha(base_bytes)!=BASE_SHA256:raise ValueError('Unknown crane baseline bytes')
    if mask_bytes is None:mask_bytes=MASK_PATH.read_bytes()
    if sha(mask_bytes)!=MASK_SHA256:raise ValueError('Changed crane retirement mask')
    mask=json.loads(mask_bytes)
    if (mask['schema']!='taihe-crane-retirement-v1' or mask['baseSHA256']!=BASE_SHA256 or mask['sources']!=SOURCES or mask['parts']!=sorted(EXPECTED_PARTS) or set(mask['materials'])!=set(EXPECTED) or set(mask['partProofs'])!=set(EXPECTED_PARTS)):raise ValueError('Invalid crane mask identity')
    for path,digest in SOURCES.items():
        if sha((ROOT/path).read_bytes())!=digest:raise ValueError('Changed retirement source: '+path)
    gltf,binary=unpack_glb(base_bytes);gltf=copy.deepcopy(gltf)
    if len(gltf['buffers'])!=1 or 'uri' in gltf['buffers'][0]:raise ValueError('Expected one local baseline buffer')
    contracts=[n for n in gltf['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT']
    if len(contracts)!=1:raise ValueError('Missing core contract')
    inventory=json.loads(contracts[0]['extras']['inventory'])
    names=mask['retiredInventoryNames']+mask['partialInventoryNames']
    if [r for r in inventory if r['name'] in names]!=mask['partInventory']:raise ValueError('Source inventory changed')
    rows=mask['triangles']
    if len(rows)!=374:raise ValueError('Unexpected retirement cardinality')
    for part,(material,count) in EXPECTED_PARTS.items():
        entries=sorted((r for r in rows if r['part']==part),key=lambda r:r['sourceTriangleOrdinal']);proof=mask['partProofs'][part]
        if len(entries)!=count or [r['sourceTriangleOrdinal'] for r in entries]!=list(range(count)) or any(r['material']!=material for r in entries):raise ValueError('Invalid semantic source cardinality')
        if proof['material']!=material or proof['triangles']!=count or proof['orientedTriangleHashesSHA256']!=sha(b''.join(bytes.fromhex(r['sourcePositionSHA256']) for r in entries)) or proof['actualOrientedTriangleHashesSHA256']!=sha(b''.join(bytes.fromhex(r['orientedPositionSHA256']) for r in entries)):raise ValueError('Invalid source part proof')
    views=gltf['bufferViews'];chunks=[binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']] for v in views];changes=[];used=set()
    for material,count in EXPECTED.items():
        info=mask['materials'][material];p=gltf['meshes'][info['mesh']]['primitives'][info['primitive']]
        if gltf['materials'][p['material']]['name']!=material or p.get('mode',4)!=4 or p['indices']!=info['indexAccessor'] or p['attributes']['POSITION']!=info['positionAccessor'] or info['removedTriangles']!=count:raise ValueError('Changed target primitive')
        translation=target_translation(gltf,info['mesh'],material)
        if translation!=info['nodeTranslation']:raise ValueError('Changed pinned target frame')
        ai=p['indices'];ia=gltf['accessors'][ai];vi=ia['bufferView'];pa=gltf['accessors'][p['attributes']['POSITION']];pv=pa['bufferView']
        if ai in used or any(a.get('byteOffset',0) or 'sparse' in a for a in (ia,pa)) or any('byteStride' in views[v] for v in (vi,pv)) or ia['type']!='SCALAR' or ia['count']%3 or pa['componentType']!=5126 or pa['type']!='VEC3':raise ValueError('Unsupported retirement layout')
        used.add(ai)
        if sum(a.get('bufferView')==vi for a in gltf['accessors'])!=1:raise ValueError('Shared index buffer view')
        refs=[q for mesh in gltf['meshes'] for q in mesh['primitives'] if ai==q.get('indices') or ai in q.get('attributes',{}).values()]
        if len(refs)!=1 or refs[0] is not p:raise ValueError('Shared index accessor')
        fmt={5123:'H',5125:'I'}.get(ia['componentType'])
        if fmt is None:raise ValueError('Unsupported index format')
        width=struct.calcsize(fmt);before=chunks[vi];positions=chunks[pv]
        if len(before)!=ia['count']*width or len(positions)!=pa['count']*12:raise ValueError('Changed attribute lengths')
        ids=struct.unpack('<'+fmt*ia['count'],before);selected=[r for r in rows if r['material']==material];removed={r['triangleOrdinal'] for r in selected}
        if len(selected)!=count or len(removed)!=count or len(ids)//3!=info['originalTriangles']:raise ValueError('Changed face cardinality')
        for row in selected:
            ordinal=row['triangleOrdinal']
            if type(ordinal)is not int or not 0<=ordinal<len(ids)//3:raise ValueError('Invalid face ordinal')
            indices=ids[ordinal*3:ordinal*3+3]
            if list(indices)!=row['indices'] or any(i>=pa['count'] for i in indices):raise ValueError('Changed source indices')
            raw=b''.join(positions[i*12:i*12+12] for i in indices)
            if sha(raw)!=row['positionSHA256'] or sha(oriented_position_bytes(raw))!=row['orientedPositionSHA256']:raise ValueError('Changed source face or winding')
        chunks[vi]=b''.join(before[i*3*width:(i+1)*3*width] for i in range(len(ids)//3) if i not in removed)
        kept=struct.unpack('<'+fmt*(len(chunks[vi])//width),chunks[vi]);ia['count']=len(kept)
        if 'min' in ia:ia['min']=[min(kept)]
        if 'max' in ia:ia['max']=[max(kept)]
        changes.append({'material':material,'accessor':ai,'bufferView':vi,'removedTriangles':count,'beforeSHA256':sha(before),'retainedSHA256':sha(chunks[vi]),'beforeBytes':len(before),'retainedBytes':len(chunks[vi]),'vertexCount':pa['count'],'newlyUnusedVertices':len(set(ids)-set(kept))})
    # Partial teal inventory is the actual surviving referenced wave-base faces,
    # never the stale whole crane/wing envelope and never a source-only bbox.
    updates=[]
    for name in mask['partialInventoryNames']:
        entries=[r for r in mask['retainedPartialTriangles'] if r['inventoryName']==name]
        if len(entries)!=54 or {r['component'] for r in entries}!={'wave_base'}:
            raise ValueError('Changed retained partial ownership')
        if len({r['triangleOrdinal'] for r in entries})!=54:
            raise ValueError('Duplicate retained partial face')
        info=mask['materials']['taihe_teal'];p=gltf['meshes'][info['mesh']]['primitives'][info['primitive']]
        ia=gltf['accessors'][p['indices']];pa=gltf['accessors'][p['attributes']['POSITION']]
        translation=target_translation(gltf,info['mesh'],'taihe_teal')
        # Ordinals refer to the immutable baseline, before retirement compaction.
        original_g,original_binary=unpack_glb(base_bytes)
        original_ia=original_g['accessors'][p['indices']];iv=original_g['bufferViews'][original_ia['bufferView']]
        fmt={5123:'H',5125:'I'}[original_ia['componentType']]
        original_ids=struct.unpack_from('<'+fmt*original_ia['count'],original_binary,iv.get('byteOffset',0))
        positions=chunks[pa['bufferView']];points=[]
        removed={r['triangleOrdinal'] for r in rows if r['material']=='taihe_teal'}
        for row in entries:
            ordinal=row['triangleOrdinal']
            if row['material']!='taihe_teal' or ordinal in removed or type(ordinal)is not int or not 0<=ordinal<len(original_ids)//3:
                raise ValueError('Invalid retained partial triangle')
            indices=original_ids[ordinal*3:ordinal*3+3]
            raw=b''.join(positions[i*12:i*12+12] for i in indices)
            if list(indices)!=row['indices'] or sha(raw)!=row['positionSHA256'] or sha(oriented_position_bytes(raw))!=row['orientedPositionSHA256']:
                raise ValueError('Changed retained partial face')
            values=struct.unpack('<9f',raw)
            points.extend([[values[i+k]+translation[k] for k in range(3)] for i in (0,3,6)])
        original=next(r for r in inventory if r['name']==name)
        updates.append({**original,'min':[min(p[k] for p in points) for k in range(3)],'max':[max(p[k] for p in points) for k in range(3)]})
    if updates!=mask['partialInventoryUpdates']:raise ValueError('Changed partial inventory proof')
    packed=bytearray()
    for view,chunk in zip(views,chunks):
        packed+=b'\0'*(-len(packed)%4);view['byteOffset']=len(packed);view['byteLength']=len(chunk);packed+=chunk
    gltf['buffers'][0]['byteLength']=len(packed);result=pack_glb(gltf,bytes(packed))
    return result,{'baselineSHA256':BASE_SHA256,'maskSHA256':MASK_SHA256,'sourceSHA256':SOURCES,'retiredParts':mask['parts'],'removedTriangles':374,'indexChanges':changes,'retiredBaseSHA256':sha(result),'attributeBytesUnchanged':True,'allOtherIndicesRetainExactOrder':True,'unusedVertexAttributesRetained':True,'newMaterials':0,'contractMetadataUnchanged':True,'retiredInventoryNames':mask['retiredInventoryNames'],'partialInventoryNames':mask['partialInventoryNames'],'partialInventoryUpdates':updates}
