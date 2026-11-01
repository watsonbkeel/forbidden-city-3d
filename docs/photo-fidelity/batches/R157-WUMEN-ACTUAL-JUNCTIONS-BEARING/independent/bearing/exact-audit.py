from fractions import Fraction as F
import json, pathlib, hashlib, math, collections
base=pathlib.Path('/workspace/scratch/02a8023d1a85'); inp=base/'wumen-joint-recovery-1607/upper-reassembly-2034/assembly-bearing-0030/actual-0033.json'; d=json.loads(inp.read_text()); out=base/'independent-wumen-bearing-0034'
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def area(p):return abs(sum(cross(p[0],p[i],p[i+1]) for i in range(1,len(p)-1)))/2 if len(p)>2 else F(0)
def clip(p,axis,e,lower):
 q=[]
 for a,b in zip(p,p[1:]+p[:1]):
  ia=a[axis]>=e if lower else a[axis]<=e; ib=b[axis]>=e if lower else b[axis]<=e
  if ia:q.append(a)
  if ia!=ib:
   t=(e-a[axis])/(b[axis]-a[axis]);q.append(tuple(x+t*(y-x) for x,y in zip(a,b)))
 return q
def unbacked(p,rs):
 x0,x1=min(v[0] for v in p),max(v[0] for v in p);z0,z1=min(v[1] for v in p),max(v[1] for v in p)
 rs=[r for r in rs if r[1]>x0 and r[0]<x1 and r[3]>z0 and r[2]<z1]
 xs=sorted(set([x0,x1]+[v for r in rs for v in r[:2] if x0<v<x1])); zs=sorted(set([z0,z1]+[v for r in rs for v in r[2:] if z0<v<z1])); gaps=[]
 for a,b in zip(xs,xs[1:]):
  for c,e in zip(zs,zs[1:]):
   # exact rational midpoint is safe; independent of author whole-cell comparisons
   mx,mz=(a+b)/2,(c+e)/2
   if any(r[0]<=mx<=r[1] and r[2]<=mz<=r[3] for r in rs):continue
   q=p
   for ax,edge,low in [(0,a,True),(0,b,False),(1,c,True),(1,e,False)]:q=clip(q,ax,edge,low)
   ar=area(q)
   if ar:gaps.append({'exactArea':str(ar),'area':float(ar),'cell':[float(v) for v in [a,b,c,e]],'polygon':[[float(v) for v in t] for t in q]})
 return sum(F(g['exactArea']) for g in gaps),gaps
# exact raw slab triangles partition actual rectangle
rs=[]; slabids=set()
for r in d['slabs']:
 assert r['id'] not in slabids;slabids.add(r['id'])
 points={tuple(v) for t in r['triangles'] for v in t['v']};assert len(points)==4 and len({p[1] for p in points})==1
 xs={p[0] for p in points};zs={p[2] for p in points};assert len(xs)==len(zs)==2
 assert points=={(x,r['y'],z) for x in xs for z in zs}
 rt=tuple(F(r[k]) for k in ['x0','x1','z0','z1']);rs.append(rt)
 exactsum=0
 for t in r['triangles']:
  p=[tuple(F(v) for v in (p[0],p[2])) for p in t['v']];exactsum+=area(p)
  assert cross(*p)<0
 assert exactsum==(rt[1]-rt[0])*(rt[3]-rt[2])
rows=[]; yres=[]; misses=0;allrays=0
for row in d['rows']:
 p=[tuple(F(v) for v in p) for p in row['polygon']];assert all(cross(p[i-1],p[i],p[(i+1)%len(p)])>0 for i in range(len(p)))
 assert {tuple(x) for x in row['polygon']} <= {(x,z) for x,y,z in row['bottomVertices'] if y==row['y']}
 ar,gaps=unbacked(p,rs)
 rows.append({'id':row['id'],'kind':row['kind'],'owner':row['owner'],'authorArea':row['unbacked']['area'],'exactArea':str(ar),'exactAreaFloat':float(ar),'absFloatingError':abs(float(ar)-row['unbacked']['area']),'gaps':gaps})
 for sample in row['raySamples']:
  allrays+=1; eligible=[s for s in d['slabs'] if s['x0']<=sample['x']<=s['x1'] and s['z0']<=sample['z']<=s['z1'] and 0<=row['y']+.05-s['y']<=.1]
  assert bool(eligible)==bool(sample['hits'])
  if not eligible:misses+=1
  for h in sample['hits']:
   s=next(s for s in d['slabs'] if s['id']==h['slabId']);assert abs(h['point'][1]-s['y'])<=2e-14
  if sample['hits']:yres.append(row['y']-eligible[0]['y']);assert abs(sample['verticalResidual']-yres[-1])<=2e-14
res={'inputSHA256':hashlib.sha256(inp.read_bytes()).hexdigest(),'inventory':dict(collections.Counter(r['kind'] for r in rows)),'rowCount':len(rows),'slabCount':len(rs),'exactPositiveCount':sum(F(r['exactArea'])>0 for r in rows),'authorPositiveCount':sum(r['authorArea']>0 for r in rows),'positiveClassificationDifferences':[r['id'] for r in rows if (F(r['exactArea'])>0)!=(r['authorArea']>0)],'exactAbove1e8Count':sum(F(r['exactArea'])>F(1e-8) for r in rows),'maxExactArea':max(r['exactAreaFloat'] for r in rows),'maxAbsoluteAreaRoundingError':max(r['absFloatingError'] for r in rows),'positiveByKind':dict(collections.Counter(r['kind'] for r in rows if F(r['exactArea'])>0)),'rayCount':allrays,'misses':misses,'verticalResidualMin':min(yres),'verticalResidualMax':max(yres),'rows':rows}
(out/'exact-audit.json').write_text(json.dumps(res,indent=2)+'\n');print(json.dumps({k:v for k,v in res.items() if k!='rows'},indent=2))
