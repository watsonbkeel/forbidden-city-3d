"""Exact source-semantic material rebinding to the existing glyph atlas batch.

No reexport, geometric change, new material or texture. All original attribute
bytes are retained. Only 40 selected triangles move into the existing glyph
batch with their exact position/normal bytes and a UV mapping to unused pixels.
"""
import collections
import copy
import json
import struct
import sys
from pathlib import Path
from append_taihe_caisson import unpack_glb,pack_glb,sha
from taihe_furniture.derive_retirement import oriented_position_bytes
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
BASE=ROOT/'public/models/interiors/taihe-enamel-cranes-052bec6dbe4b.glb'
BASE_SHA='052bec6dbe4bf5246ac61d646b490ad52fd17d3572e8ed41dca501e20d42290f'
MASK=HERE/'taihe_furnishing_surface/selected_faces.json'
MASK_SHA='049a115668a34008bab8f579722dffb6a2fc3fedaa7afb890dd84caa9dd4cbe7'
TILES={'screen':(176,400,256,608),'dais':(448,400,560,160)}


def chunks_for(g,b):return [b[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']] for v in g['bufferViews']]
def data(g,chunks,ai):return chunks[g['accessors'][ai]['bufferView']]
def index_values(g,chunks,ai):
 a=g['accessors'][ai];return struct.unpack('<'+{5123:'H',5125:'I'}[a['componentType']]*a['count'],data(g,chunks,ai))
def triangle_digest(g,chunks):
 rows=[]
 for mi,m in enumerate(g['meshes']):
  p=m['primitives'][0];positions=data(g,chunks,p['attributes']['POSITION']);normals=data(g,chunks,p['attributes']['NORMAL']);ids=index_values(g,chunks,p['indices'])
  node=next(n for n in g['nodes'] if n.get('mesh')==mi);frame=json.dumps({k:node[k] for k in ('translation','rotation','scale','matrix') if k in node},sort_keys=True).encode()
  for j in range(0,len(ids),3):rows.append(sha(frame+b''.join(positions[i*12:i*12+12]+normals[i*12:i*12+12] for i in ids[j:j+3])))
 return sha(''.join(sorted(rows)).encode()),len(rows)
def set_chunk(g,chunks,ai,new,count):
 a=g['accessors'][ai];chunks[a['bufferView']]=bytes(new);a['count']=count
 if a['type']=='SCALAR':
  ids=index_values(g,chunks,ai)
  if 'min' in a:a['min']=[min(ids)]
  if 'max' in a:a['max']=[max(ids)]
 else:
  width={'VEC2':2,'VEC3':3}[a['type']];v=struct.unpack('<'+'f'*(len(new)//4),new)
  for bound,fn in [('min',min),('max',max)]:
   if bound in a:a[bound]=[fn(v[k::width]) for k in range(width)]


def rebind(base):
 if sha(base)!=BASE_SHA:raise ValueError('Unknown frozen furnishing baseline')
 maskbytes=MASK.read_bytes()
 if sha(maskbytes)!=MASK_SHA:raise ValueError('Changed semantic mask')
 mask=json.loads(maskbytes)
 if mask['baseSHA256']!=BASE_SHA or len(mask['triangles'])!=40:raise ValueError('Changed mask identity')
 for path,digest in mask['sources'].items():
  if sha((ROOT/path).read_bytes())!=digest:raise ValueError('Changed semantic source: '+path)
 original,binary=unpack_glb(base);g=copy.deepcopy(original);chunks=chunks_for(g,binary);oldchunks=chunks[:]
 before_digest,total=triangle_digest(g,chunks)
 if total!=17940 or len(g['meshes'])!=8 or len(g['materials'])!=8:raise ValueError('Changed baseline budget')
 target=[(i,m['primitives'][0]) for i,m in enumerate(g['meshes']) if g['materials'][m['primitives'][0]['material']]['name']=='taihe_glyph_atlas']
 if len(target)!=1:raise ValueError('Missing unique existing glyph batch')
 target_id,target=target[0]
 if any(k in next(n for n in g['nodes'] if n.get('mesh')==target_id) for k in ('translation','rotation','scale','matrix')):raise ValueError('Nonidentity glyph frame')
 attrs={k:bytearray(data(g,chunks,ai)) for k,ai in target['attributes'].items()};glyph_ids=list(index_values(g,chunks,target['indices']));vertex_count=g['accessors'][target['attributes']['POSITION']]['count']
 removed=collections.defaultdict(set);moves=[]
 for row in mask['triangles']:
  mi=row['mesh'];p=g['meshes'][mi]['primitives'][0];material=g['materials'][p['material']]['name'];ordinal=row['triangleOrdinal']
  if material!=row['material'] or material not in ('taihe_lacquer','taihe_dark_gold'):raise ValueError('Changed selected material')
  node=next(n for n in g['nodes'] if n.get('mesh')==mi)
  if any(k in node for k in ('translation','rotation','scale','matrix')):raise ValueError('Changed selected frame')
  ids=index_values(g,chunks,p['indices']);selected=ids[ordinal*3:ordinal*3+3]
  if list(selected)!=row['indices'] or ordinal in removed[mi]:raise ValueError('Changed or repeated selected face')
  positions=data(g,chunks,p['attributes']['POSITION']);normals=data(g,chunks,p['attributes']['NORMAL'])
  raw=b''.join(positions[i*12:i*12+12] for i in selected)
  if sha(raw)!=row['positionSHA256'] or sha(oriented_position_bytes(raw))!=row['orientedPositionSHA256']:raise ValueError('Changed selected positions or winding')
  tile=TILES[row['tile']];lo=row['sourceBounds']['min'];hi=row['sourceBounds']['max'];axis=row['horizontalAxis'];uvs=[]
  for index in selected:
   point=struct.unpack_from('<3f',positions,index*12);u=(hi[axis]-point[axis])/(hi[axis]-lo[axis]);v=(point[1]-lo[1])/(hi[1]-lo[1])
   if not -1e-5<=u<=1.00001 or not -1e-5<=v<=1.00001:raise ValueError('Source UV escapes semantic face')
   u=max(0,min(1,u));v=max(0,min(1,v));uv=((tile[0]+u*tile[2])/1024,1-(tile[1]+(1-v)*tile[3])/1024)
   attrs['POSITION']+=positions[index*12:index*12+12];attrs['NORMAL']+=normals[index*12:index*12+12];attrs['TEXCOORD_0']+=struct.pack('<2f',*uv);uvs.append(uv)
   glyph_ids.append(vertex_count);vertex_count+=1
  removed[mi].add(ordinal);moves.append({'part':row['part'],'material':material,'sourceTriangleOrdinal':row['sourceTriangleOrdinal'],'triangleOrdinal':ordinal,'glyphTriangleOrdinal':len(glyph_ids)//3-1,'tile':row['tile'],'uv':uvs})
 for mi,ordinals in removed.items():
  p=g['meshes'][mi]['primitives'][0];a=g['accessors'][p['indices']];width={5123:2,5125:4}[a['componentType']];raw=data(g,chunks,p['indices'])
  retained=b''.join(raw[i*3*width:(i+1)*3*width] for i in range(a['count']//3) if i not in ordinals)
  set_chunk(g,chunks,p['indices'],retained,len(retained)//width)
 for semantic,values in attrs.items():set_chunk(g,chunks,target['attributes'][semantic],values,vertex_count)
 ia=g['accessors'][target['indices']];fmt={5123:'H',5125:'I'}[ia['componentType']]
 set_chunk(g,chunks,target['indices'],struct.pack('<'+fmt*len(glyph_ids),*glyph_ids),len(glyph_ids))
 changed_views={original['accessors'][original['meshes'][mi]['primitives'][0]['indices']]['bufferView'] for mi in removed}
 changed_views|={original['accessors'][ai]['bufferView'] for ai in [target['indices'],*target['attributes'].values()]}
 for i,(before,after) in enumerate(zip(oldchunks,chunks)):
  if i not in changed_views and before!=after:raise ValueError('Unscoped buffer changed')
 for ai in target['attributes'].values():
  vi=g['accessors'][ai]['bufferView']
  if not chunks[vi].startswith(oldchunks[vi]):raise ValueError('Original glyph attributes changed')
 after_digest,after_total=triangle_digest(g,chunks)
 if before_digest!=after_digest or after_total!=total:raise ValueError('Geometry or normals changed')
 before_bytes=sum(map(len,oldchunks));after_bytes=sum(map(len,chunks))
 if not 0<=after_bytes-before_bytes<=16384:raise ValueError('Rebinding buffer allowance exceeded')
 identity={'furnishingSurfaceSourceSHA256':sha(Path(__file__).read_bytes()),'furnishingSurfaceBaseAssetSHA256':BASE_SHA,'furnishingSurfaceMaskSHA256':MASK_SHA,'furnishingSurfaceArtworkSHA256':sha((ROOT/'src/scene/palace/special/TaiheFurnishingSurface.js').read_bytes()),'furnishingSurfaceTriangles':40}
 contract=next(n['extras'] for n in g['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT');contract.update(identity)
 packed=bytearray()
 for view,chunk in zip(g['bufferViews'],chunks):
  packed+=b'\0'*(-len(packed)%4);view['byteOffset']=len(packed);view['byteLength']=len(chunk);packed+=chunk
 g['buffers'][0]['byteLength']=len(packed)
 result=pack_glb(g,bytes(packed))
 receipt={'reboundTriangles':40,'renderableTriangles':total,'visibleBatches':8,'bufferBytesBefore':before_bytes,'bufferBytesAfter':after_bytes,'bufferBytesAdded':after_bytes-before_bytes,'positionNormalTriangleMultisetBefore':before_digest,'positionNormalTriangleMultisetAfter':after_digest,'nonSelectedAttributeBytesExact':True,'nonSelectedIndicesInOriginalOrder':True,'originalGlyphAttributePrefixExact':True,'unchangedEmbeddedTextureBytes':0,'unchangedRuntimeTextureBytes':8388608,'identity':identity,'moves':moves,'buffers':[{'bufferView':i,'beforeBytes':len(a),'afterBytes':len(b),'beforeSHA256':sha(a),'afterSHA256':sha(b)} for i,(a,b) in enumerate(zip(oldchunks,chunks))]}
 return result,receipt


def build(output=None):
 output=Path(output) if output else ROOT
 result,receipt=rebind(BASE.read_bytes());digest=sha(result);relative='public/models/interiors/taihe-furnishing-surfaces-'+digest[:12]+'.glb'
 target=output/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(result)
 sources=[Path(__file__),MASK,HERE/'taihe_furnishing_surface/derive_faces.py',ROOT/'src/scene/palace/special/TaiheFurnishingSurface.js',ROOT/'src/scene/palace/special/TaiheCore.js']
 manifest={'schema':'taihe-furnishing-surfaces-1','status':'source-informed illustrative material candidate; combined ordinary browser review pending','baselineAsset':str(BASE.relative_to(ROOT)),'baselineSHA256':BASE_SHA,'sources':{str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sources},'asset':{'path':relative,'sha256':digest,'encodedBytes':len(result),'renderableTriangles':17940,'visibleBatches':8},'identity':receipt['identity'],'atlas':{'size':[1024,1024],'tiles':TILES,'newTextures':0,'newMaterials':0,'gpuBytesIncludingCeiling':8388608,'sharing':'Existing glyph material / fallback-owned texture disposal path'},'comparison':receipt,'limitations':['Original simplified red/gold scroll fields; not traced or measured historic carving.','Selected faces intentionally use existing nonmetallic roughness-0.8 glyph material. Unselected gold and all other responses remain exact.','No changes to tops, geometry, anchors, collision, columns, caisson, illumination or exposure.','UV selection is exact source semantic ownership, not guessed bounding boxes.','Ordinary front and oblique eye-level acceptance is pending parent combined validation.']}
 path=output/'docs/current-state/taihe-furnishing-surfaces/SOURCE-MANIFEST.json';path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(manifest,indent=2)+'\n')
 return manifest

if __name__=='__main__':
 result=build(sys.argv[1] if len(sys.argv)>1 else None);print(json.dumps({'asset':result['asset'],'identity':result['identity'],'bufferBytesAdded':result['comparison']['bufferBytesAdded']}))
