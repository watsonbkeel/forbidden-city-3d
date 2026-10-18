"""Exact semantic retirement of old steps/rails and concealed shaft end caps.
No spatial deletion: original source names own all faces; end caps additionally
require a horizontal triangle at the exact original shaft end. The changed
furnishing material may map a source face to glyph, but never changes positions.
"""
import sys,json,collections,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'assets-src/interiors'))
from taihe_furniture.derive_retirement import source_triangles,oriented_position_bytes
from append_taihe_caisson import unpack_glb,sha
BASE=ROOT/'public/models/interiors/taihe-furnishing-surfaces-a4a0b82f9f76.glb'
BASE_SHA='a4a0b82f9f767422db824b9c0f9039fc3da2234f18b3d584d295ad52020ec529'
def main():
 base=BASE.read_bytes();assert sha(base)==BASE_SHA;records,inventory,proof=source_triangles()
 selected=[];owners=collections.defaultdict(list)
 for r in records:
  owners[r['oriented']].append((r['part'],r['sourceTriangleOrdinal']))
  name=r['part'].split('.')[0]
  if name in ('dais_step','dais_step_edge','dais_rail','dais_rail_post'):selected.append(r)
  elif name=='gold_column':
   ys=struct.unpack('<9f',r['oriented'])[1::3]
   if len(set(ys))==1 and min(abs(ys[0]-.2),abs(ys[0]-9.47375))<1e-6:selected.append(r)
 g,b=unpack_glb(base);actual=collections.defaultdict(list);mats={}
 for mi,m in enumerate(g['meshes']):
  p=m['primitives'][0];name=g['materials'][p['material']]['name'];node=next(n for n in g['nodes'] if n.get('mesh')==mi)
  if any(k in node for k in ('matrix','rotation','scale','translation')):continue
  ia=g['accessors'][p['indices']];iv=g['bufferViews'][ia['bufferView']];pa=g['accessors'][p['attributes']['POSITION']];pv=g['bufferViews'][pa['bufferView']]
  assert not any(a.get('byteOffset',0) or 'sparse' in a for a in (ia,pa)) and not any('byteStride' in v for v in (iv,pv))
  ids=struct.unpack_from('<'+{5123:'H',5125:'I'}[ia['componentType']]*ia['count'],b,iv['byteOffset']);mats[name]={'mesh':mi,'primitive':0,'indexAccessor':p['indices'],'originalTriangles':len(ids)//3}
  for j in range(0,len(ids),3):
   ix=ids[j:j+3];raw=b''.join(b[pv['byteOffset']+i*12:pv['byteOffset']+i*12+12] for i in ix)
   actual[oriented_position_bytes(raw)].append({'material':name,'triangleOrdinal':j//3,'indices':list(ix),'positionSHA256':sha(raw)})
 rows=[]
 for r in selected:
  key=r['oriented']
  if owners[key]!=[(r['part'],r['sourceTriangleOrdinal'])] or len(actual[key])!=1:raise ValueError('Nonunique semantic face '+r['part'])
  match=actual[key][0]
  if match['material'] not in (r['material'],'taihe_glyph_atlas'):raise ValueError('Unexpected material migration')
  rows.append({**match,'part':r['part'],'sourceMaterial':r['material'],'sourceTriangleOrdinal':r['sourceTriangleOrdinal']})
 parts=sorted({r['part'] for r in rows});counts=dict(collections.Counter(r['material'] for r in rows))
 assert len(rows)==744,(len(rows),counts)
 result={'schema':'taihe-dais-exact-retirement-1','baseSHA256':sha(base),'parts':parts,'materials':{k:v for k,v in mats.items() if k in counts},'counts':counts,'sourceProof':proof,'triangles':sorted(rows,key=lambda r:(r['material'],r['triangleOrdinal'])),'limits':'Only named original step/rail faces and both original shaft end caps are retired. Column cap top is covered by the ceiling; bottom by the larger stone base. No visible shaft or relief face is removed.'}
 target=Path(__file__).with_name('retirement-mask.json');target.write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({'faces':len(rows),'counts':counts,'maskSHA256':sha(target.read_bytes())}))
if __name__=='__main__':main()
