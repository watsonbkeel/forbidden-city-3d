"""Indexed source-mesh precheck for the fixed isolated side-study frame.
Not a render-mesh UV-seam weld, artistic review, or self-intersection proof.
"""
import json,math,sys
from collections import defaultdict
from pathlib import Path
CORE_Y=.8037370443344116
MAX_TRIANGLES=10000
MAX_VERTICES=20000

def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def cross(a,b):return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def preflight(mesh):
 r={'passed':False,'scope':'ISOLATED_LOWER_SOURCE_MESH_PRECHECK_ONLY','artAcceptance':'NOT_TESTED','selfIntersection':'NOT_TESTED','renderNormals':'NOT_TESTED','errors':[],'supports':[]}
 def reject(code):r['errors'].append(code);return r
 if not isinstance(mesh,dict):return reject('MESH_OBJECT_REQUIRED')
 p=mesh.get('positions');ix=mesh.get('indices')
 if not isinstance(p,list) or not isinstance(ix,list) or not p or not ix or len(p)%3 or len(ix)%3:return reject('TRIPLE_ARRAYS_REQUIRED')
 if len(p)>MAX_VERTICES*3 or len(ix)>MAX_TRIANGLES*3:return reject('BUDGET_EXCEEDED')
 if any(type(v) not in (int,float) or abs(v)>100 or not math.isfinite(v) for v in p):return reject('FINITE_BOUNDED_POSITIONS_REQUIRED')
 n=len(p)//3
 if any(type(v) is not int or v<0 or v>=n for v in ix):return reject('VALID_INTEGER_INDICES_REQUIRED')
 v=[p[i:i+3] for i in range(0,len(p),3)];faces=[ix[i:i+3] for i in range(0,len(ix),3)];edges=defaultdict(list);adj=defaultdict(set);seen_faces=set();dupes=degenerate=0;volume=0
 for ids in faces:
  key=tuple(sorted(ids));dupes+=key in seen_faces;seen_faces.add(key);a,b,c=[v[i] for i in ids];normal=cross(sub(b,a),sub(c,a));degenerate+=len(set(ids))!=3 or dot(normal,normal)<=1e-24;volume+=dot(a,cross(b,c))/6
  for a,b in zip(ids,ids[1:]+ids[:1]):edges[tuple(sorted((a,b)))].append((a,b));adj[a].add(b);adj[b].add(a)
 unseen=set(adj);components=0
 while unseen:
  components+=1;todo=[unseen.pop()]
  while todo:
   for q in adj[todo.pop()]:
    if q in unseen:unseen.remove(q);todo.append(q)
 links=defaultdict(lambda:defaultdict(list))
 for ids in faces:
  for i in range(3):
   center=ids[i];a=ids[(i+1)%3];b=ids[(i+2)%3];links[center][a].append(b);links[center][b].append(a)
 bad_links=0
 for link in links.values():
  pending=set(link);parts=0
  while pending:
   parts+=1;stack=[pending.pop()]
   while stack:
    for q in link[stack.pop()]:
     if q in pending:pending.remove(q);stack.append(q)
  bad_links+=parts!=1 or any(len(ns)!=2 for ns in link.values())
 r['nonManifoldVertices']=bad_links
 if bad_links:r['errors'].append('NON_MANIFOLD_VERTEX_LINK')
 bad_edges=sum(len(e)!=2 for e in edges.values());winding=sum(len(e)==2 and e[0]==e[1] for e in edges.values())
 r.update(vertices=n,triangles=len(faces),duplicateTriangles=dupes,degenerateTriangles=degenerate,nonTwoIncidenceEdges=bad_edges,windingConflicts=winding,components=components,unreferencedVertices=n-len(adj),signedVolume=volume)
 for code,condition in [('DUPLICATE_TRIANGLES',dupes),('DEGENERATE_TRIANGLES',degenerate),('NON_TWO_INCIDENCE_EDGES',bad_edges),('WINDING_CONFLICT',winding),('NOT_ONE_COMPONENT',components!=1),('UNREFERENCED_VERTICES',n!=len(adj)),('NON_POSITIVE_VOLUME',volume<=1e-12)]:
  if condition:r['errors'].append(code)
 for x in [-.4,-.2,0,.2,.4]:
  z=.08;hits=[]
  for ids in faces:
   a,b,c=[v[i] for i in ids];den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2])
   if abs(den)<1e-14:continue
   u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den;w=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;t=1-u-w
   if min(u,w,t)>=-1e-10:
    y=u*a[1]+w*b[1]+t*c[1]
    hits.append(y)
  y=min(hits) if hits else None;gap=y-CORE_Y if y is not None else None;ok=gap is not None and -.04<gap<=.001
  r['supports'].append({'x':x,'z':z,'bodyY':y,'coreY':CORE_Y,'gap':gap,'passed':ok})
 if not all(q['passed'] for q in r['supports']):r['errors'].append('SUPPORT_FAILED')
 r['passed']=not r['errors'];return r

def main():
 if len(sys.argv)!=2:print('usage: semantic_mesh_preflight.py mesh.json',file=sys.stderr);return 2
 try:
  path=Path(sys.argv[1])
  if path.stat().st_size>8*1024*1024:raise ValueError('input exceeds 8MiB')
  result=preflight(json.loads(path.read_text()))
 except (OSError,ValueError,TypeError,OverflowError,RecursionError) as e:print(json.dumps({'passed':False,'errors':['INPUT_ERROR'],'message':str(e)}));return 2
 print(json.dumps(result,allow_nan=False,indent=2));return 0 if result['passed'] else 1
if __name__=='__main__':sys.exit(main())
