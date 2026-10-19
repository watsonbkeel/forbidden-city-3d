"""Exact retained components plus conservative new table/censer envelopes."""
import sys,json,hashlib,math,collections
from pathlib import Path
R=Path(__file__).resolve().parents[2];sys.path.insert(0,str(R/'assets-src/interiors/taihe_dais'))
from geometry import build,D
baseline=json.loads((R/'tests/fixtures/r8-incense-component-baseline.json').read_text());report={}
for lod in ['S','B']:
 m=build(lod);groups={}
 for tri,mat,name in zip(m.triangles,m.materials,m.components):groups.setdefault(name,[]).append({'material':mat,'vertices':[m.vertices[v]for v in tri]})
 before={k:v for k,v in baseline[lod].items()if not k.startswith('incense_table_')}
 after={k:v for k,v in groups.items()if not k.startswith('incense_table_')}
 assert set(before)==set(after)
 for name,rows in after.items():
  assert len(rows)==before[name]['triangles']
  assert hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':')).encode()).hexdigest()==before[name]['sha256'],name
 for i,x in enumerate(D['incenseTables']['x']):
  prefix=f'incense_table_{i}';g={k:v for k,v in groups.items()if k.startswith(prefix)};points=[p for rows in g.values()for row in rows for p in row['vertices']]
  assert sum(map(len,g.values()))=={'S':112,'B':36}[lod]
  t=D['incenseTables'];assert min(p[1]for p in points)>=0
  assert max(p[1]for p in points)<=t['totalHeight']+1e-8
  assert max(abs(p[0]-x)for p in points)<=t['width']*.53+1e-8
  assert max(abs(p[2]-t['z'])for p in points)<=t['depth']*.53+1e-8
  apron=g[prefix+'_top'];edges=collections.Counter();volume=0
  for row in apron:
   a,b,c=[tuple(v)for v in row['vertices']]
   for u,v in [(a,b),(b,c),(c,a)]:edges[(u,v)]+=1
   cross=[(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])]
   centre=[x,t['tableTopY']-.09,t['z']]
   assert sum(cross[j]*((a[j]+b[j]+c[j])/3-centre[j])for j in range(3))>0,'inward apron'
  assert all(n==1 and edges[(b,a)]==1 for(a,b),n in edges.items()),'apron not closed'
  if lod=='S':
   for sign in [-1,1]:
    for k in range(2):
     rows=g[f'{prefix}_handle{sign}_{k}'];assert len(rows)==4
     # Each quad side has equal total area and opposite oriented cross-sum.
     def normals(rows):
      result=[0,0,0]
      for row in rows:
       a,b,c=row['vertices'];u=[b[j]-a[j]for j in range(3)];v=[c[j]-a[j]for j in range(3)]
       q=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
       result=[result[j]+q[j]for j in range(3)]
      return result
     assert all(abs(v)<1e-12 for v in normals(rows))
     assert sum(v*v for v in normals(rows[:2]))>1e-8
   assert max(p[1]for row in g[prefix+'_lid']for p in row['vertices'])==t['totalHeight']
 report[lod]={'retainedComponents':len(after),'tables':4,'tableTriangles':{'S':112,'B':36}[lod],'apronsClosedAndOutward':True,'withinUnchangedCollisionEnvelope':True}
print(json.dumps(report))
