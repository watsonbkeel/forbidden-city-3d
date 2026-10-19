"""Derive surface ownership from semantic source objects, never spatial search.

Run: blender -b -t 1 -P assets-src/interiors/taihe_furnishing_surface/derive_faces.py
Original dais objects are triangulated by their frozen source builder. Screen
fronts are exact component triangles 0 and 2 of seven replacement panel solids.
Source-face orientation determines vertical/front faces BEFORE exact matching.
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
from taihe_furniture.derive_retirement import source_triangles,oriented_position_bytes,SOURCES
from taihe_screen_crowns.geometry import build_candidate
BASE=ROOT/'public/models/interiors/taihe-enamel-cranes-052bec6dbe4b.glb'
BASE_SHA='052bec6dbe4bf5246ac61d646b490ad52fd17d3572e8ed41dca501e20d42290f'

def values(raw):return list(zip(*[iter(struct.unpack('<9f',raw))]*3))
def direction(points):
 a,b,c=points;u=[b[k]-a[k] for k in range(3)];v=[c[k]-a[k] for k in range(3)]
 n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];length=sum(x*x for x in n)**.5
 return [x/length for x in n]

def derive():
 base=BASE.read_bytes()
 if sha(base)!=BASE_SHA:raise ValueError('Changed frozen baseline')
 records,inventory,proof=source_triangles();source_inventory={r['name']:r for r in inventory}
 candidates=[]
 dais=['dais_lower','dais_upper']+['dais_step'+(f'.{i:03d}' if i else '') for i in range(7)]
 for r in records:
  if r['part'] not in dais:continue
  n=direction(values(r['oriented']));side=r['part'] in ('dais_lower','dais_upper') and abs(n[0])>.999
  if n[2]<-.999 or side:
   axis=2 if side else 0
   candidates.append({**r,'tile':'dais','horizontalAxis':axis,'sourceBounds':source_inventory[r['part']]})
 screen=build_candidate(json.loads((ROOT/'data/architecture/taihe-core.json').read_bytes()),crown_style='sculptural')
 for i in range(7):
  name=f'screen_{i}_replacement_panel';faces=screen['parts'][name]
  if len(faces)!=12:raise ValueError('Changed source solid topology')
  points=[screen['vertices'][j] for fi in faces for j in screen['triangles'][fi]]
  bounds={'min':[min(p[k] for p in points) for k in range(3)],'max':[max(p[k] for p in points) for k in range(3)]}
  for ordinal in (0,2):
   face=screen['triangles'][faces[ordinal]];raw=struct.pack('<9f',*(v for j in face for v in screen['vertices'][j]))
   if direction(values(raw))[2]>-.999:raise ValueError('Changed semantic front face')
   candidates.append({'part':name,'material':'taihe_dark_gold','sourceTriangleOrdinal':ordinal,'oriented':oriented_position_bytes(raw),'tile':'screen','horizontalAxis':0,'sourceBounds':bounds})
 expected={'taihe_lacquer':26,'taihe_dark_gold':14}
 if dict(collections.Counter(r['material'] for r in candidates))!=expected:raise ValueError('Changed selected cardinality')
 owners=collections.defaultdict(list)
 for r in records:owners[(r['material'],r['oriented'])].append((r['part'],r['sourceTriangleOrdinal']))
 # Screen replacements have replaced the original full-height parts. Check all
 # replacement source triangles so the selected lower face has a unique owner.
 for part,faces in screen['parts'].items():
  for ordinal,fi in enumerate(faces):
   face=screen['triangles'][fi];raw=struct.pack('<9f',*(v for j in face for v in screen['vertices'][j]))
   material={'gold':'taihe_gold','darkGold':'taihe_dark_gold','red':'taihe_lacquer'}[screen['materials'][fi]]
   owners[(material,oriented_position_bytes(raw))].append((part,ordinal))
 gltf,binary=unpack_glb(base);actual=collections.defaultdict(list)
 for mi,mesh in enumerate(gltf['meshes']):
  p=mesh['primitives'][0];name=gltf['materials'][p['material']]['name']
  if name not in expected:continue
  a=gltf['accessors'][p['indices']];v=gltf['bufferViews'][a['bufferView']];pa=gltf['accessors'][p['attributes']['POSITION']];pv=gltf['bufferViews'][pa['bufferView']]
  ids=struct.unpack_from('<'+{5123:'H',5125:'I'}[a['componentType']]*a['count'],binary,v.get('byteOffset',0))
  for j in range(0,len(ids),3):
   raw=b''.join(binary[pv.get('byteOffset',0)+i*12:pv.get('byteOffset',0)+i*12+12] for i in ids[j:j+3])
   actual[(name,oriented_position_bytes(raw))].append({'mesh':mi,'triangleOrdinal':j//3,'indices':list(ids[j:j+3]),'positionSHA256':sha(raw)})
 rows=[]
 for r in candidates:
  key=(r['material'],r['oriented'])
  if owners[key]!=[(r['part'],r['sourceTriangleOrdinal'])]:raise ValueError('Ambiguous source ownership: '+r['part'])
  if len(actual[key])!=1:raise ValueError('No exact unique asset triangle: '+r['part'])
  rows.append({**{k:v for k,v in r.items() if k!='oriented'},**actual[key][0],'orientedPositionSHA256':sha(r['oriented'])})
 sources={**SOURCES,'assets-src/interiors/taihe_screen_crowns/geometry.py':sha((HERE.parent/'taihe_screen_crowns/geometry.py').read_bytes()),'assets-src/interiors/taihe_screen_crowns/retired_screen_header_faces.json':sha((HERE.parent/'taihe_screen_crowns/retired_screen_header_faces.json').read_bytes())}
 return {'schema':'taihe-furnishing-surface-ownership-1','baseSHA256':BASE_SHA,'sources':sources,'proof':{**proof,'selection':'Named original dais objects, source-local front/vertical face orientation; exact ordinal 0/2 of seven source replacement panel solids. Exact oriented float32 match, never bounding-box selection.','targetTriangles':40,'maximumCoordinateError':0,'uniqueSourceOwner':True,'uniqueBaselineMatch':True},'triangles':sorted(rows,key=lambda r:(r['material'],r['triangleOrdinal']))}

if __name__=='__main__':
 result=derive();output=HERE/'selected_faces.json';output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'path':str(output),'triangles':len(result['triangles']),'sha256':sha(output.read_bytes())}))
