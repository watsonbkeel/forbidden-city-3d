import sys,json,math,collections
from pathlib import Path
R=Path(__file__).resolve().parents[2];sys.path.insert(0,str(R/'assets-src/interiors/taihe_dais'))
from geometry import build,P,D
report={}
for lod,total in [('S',736),('B',352)]:
 m=build(lod);assert len(m.triangles)==total
 assert set(m.materials)=={'red','darkGold','teal'}
 assert all(math.isfinite(x) for p in m.vertices for x in p)
 for t in m.triangles:
  a,b,c=[m.vertices[i] for i in t];u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)]
  cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
  assert sum(x*x for x in cross)>1e-15,'degenerate face'
 volumes=[]
 for i,f in enumerate(D['frontFlights']):
  faces=[t for t,n in zip(m.triangles,m.components) if n==f'front_flight_{i}'];assert len(faces)==60
  edges=collections.Counter();volume=0
  for t in faces:
   a,b,c=[tuple(round(v,9) for v in m.vertices[j]) for j in t]
   for x,y in [(a,b),(b,c),(c,a)]:edges[(x,y)]+=1
   volume+=sum(a[k]*[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]][k] for k in range(3))/6
  assert all(n==1 and edges[(b,a)]==1 for (a,b),n in edges.items()),'not consistently oriented closed manifold'
  expected=f['width']*P['dais']['stepRun']*P['dais']['height']*(P['dais']['steps']+1)/2
  assert abs(volume-expected)<1e-7,(volume,expected)
  volumes.append(volume)
 for i in range(4):
  prefix=f'incense_table_{i}';parts={c for c in m.components if c.startswith(prefix)}
  assert all(prefix+f'_leg{k}' in parts for k in range(4));assert prefix+'_censer' in parts
  if lod=='S':assert all(prefix+f'_tripod{k}' in parts for k in range(3))
  points=[m.vertices[j] for t,c in zip(m.triangles,m.components) if c.startswith(prefix) for j in t]
  assert min(p[1] for p in points)>=0;assert max(p[1] for p in points)<=D['incenseTables']['totalHeight']+1e-8
  assert max(abs(p[0]-D['incenseTables']['x'][i]) for p in points)<=.3400001
 report[lod]={'triangles':total,'closedFrontFlights':3,'positiveVolumes':volumes,'separateTables':4}
print(json.dumps(report))
