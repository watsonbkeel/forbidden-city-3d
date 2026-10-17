"""Retire exactly the frozen approximate shell faces before appending its replacement.

This is a finite, content-addressed migration, not a spatial filter. Every vertex,
normal, UV, material, node and non-retired index stays byte-identical. The mask
was derived from the original 19 named source objects and matched one-to-one
with the actual exported triangles at zero coordinate error.
"""
import copy,json,struct
from append_taihe_caisson import unpack_glb,pack_glb,sha
BASE_SHA256='28d7a11dbeda023762c8c9eed44eb65c5f4c8270ddfb9d7088e40f6b6991399c'
MASK_SHA256='231113dd6726175be9de932cbf6c0a36fe7466e88e5910df6aa9660f49ba2079'
EXPECTED={'taihe_gold':192,'taihe_dark_gold':128}

def retire_shell(base,mask_bytes):
 if sha(base)!=BASE_SHA256:raise ValueError('Unknown shell baseline bytes')
 if sha(mask_bytes)!=MASK_SHA256:raise ValueError('Changed shell retirement mask')
 mask=json.loads(mask_bytes)
 if mask['baseSHA256']!=BASE_SHA256 or len(mask['parts'])!=19 or len(set(mask['parts']))!=19:raise ValueError('Invalid mask identity')
 gltf,binary=unpack_glb(base);gltf=copy.deepcopy(gltf);views=gltf['bufferViews'];chunks=[binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']] for v in views];changes=[]
 for material,count in EXPECTED.items():
  info=mask['materials'][material];p=gltf['meshes'][info['mesh']]['primitives'][info['primitive']]
  if gltf['materials'][p['material']]['name']!=material or p.get('mode',4)!=4 or p['indices']!=info['indexAccessor']:raise ValueError('Mask primitive mismatch')
  nodes=[n for n in gltf['nodes'] if n.get('mesh')==info['mesh']]
  if len(nodes)!=1 or any(k in nodes[0] for k in ('matrix','translation','rotation','scale')):raise ValueError('Mask target frame changed')
  ai=p['indices'];acc=gltf['accessors'][ai];vi=acc['bufferView'];view=views[vi];pa=gltf['accessors'][p['attributes']['POSITION']];pv=gltf['bufferViews'][pa['bufferView']]
  if acc.get('byteOffset',0) or 'byteStride' in view or 'sparse' in acc or acc['type']!='SCALAR' or acc['count']%3 or pa['componentType']!=5126 or pa['type']!='VEC3' or pa.get('byteOffset',0) or 'byteStride' in pv:raise ValueError('Unsupported mask accessor layout')
  fmt={5123:'H',5125:'I'}.get(acc['componentType'])
  if not fmt:raise ValueError('Unsupported shell index format')
  before=chunks[vi];inds=struct.unpack('<'+fmt*acc['count'],before);positions=chunks[pa['bufferView']]
  rows=[r for r in mask['triangles'] if r['material']==material];removed={r['triangleOrdinal'] for r in rows}
  if len(rows)!=count or len(removed)!=count or len(inds)//3!=info['originalTriangles']:raise ValueError('Mask triangle cardinality mismatch')
  for row in rows:
   start=row['triangleOrdinal']*3;ids=inds[start:start+3]
   if len(ids)!=3 or list(ids)!=row['indices']:raise ValueError('Mask index identity mismatch')
   raw=b''.join(positions[i*12:i*12+12] for i in ids)
   if len(raw)!=36 or sha(raw)!=row['positionSHA256']:raise ValueError('Mask face coordinates changed')
  kept=[v for i in range(0,len(inds),3) if i//3 not in removed for v in inds[i:i+3]]
  chunks[vi]=struct.pack('<'+fmt*len(kept),*kept);acc['count']=len(kept)
  if 'min' in acc:acc['min']=[min(kept)]
  if 'max' in acc:acc['max']=[max(kept)]
  changes.append({'material':material,'accessor':ai,'bufferView':vi,'removedTriangles':count,'beforeBytes':len(before),'beforeSHA256':sha(before),'retainedBytes':len(chunks[vi]),'retainedSHA256':sha(chunks[vi])})
 contracts=[n for n in gltf['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT']
 if len(contracts)!=1:raise ValueError('Missing exact core contract')
 contract=contracts[0]['extras'];inventory=json.loads(contract['inventory']);names=set(mask['parts']);retired=[r for r in inventory if r['name'] in names]
 if len(retired)!=19 or {r['name'] for r in retired}!=names:raise ValueError('Mask inventory identity mismatch')
 contract['inventory']=json.dumps([r for r in inventory if r['name'] not in names],separators=(',',':'))
 packed=bytearray()
 for view,chunk in zip(views,chunks):
  packed+=b'\0'*(-len(packed)%4);view['byteOffset']=len(packed);view['byteLength']=len(chunk);packed+=chunk
 gltf['buffers'][0]['byteLength']=len(packed)
 result=pack_glb(gltf,bytes(packed))
 return result,{'baselineSHA256':BASE_SHA256,'maskSHA256':MASK_SHA256,'retiredParts':mask['parts'],'removedTriangles':320,'indexChanges':changes,'retiredBaseSHA256':sha(result),'attributeBytesUnchanged':True,'allOtherIndicesRetainExactOrder':True}
