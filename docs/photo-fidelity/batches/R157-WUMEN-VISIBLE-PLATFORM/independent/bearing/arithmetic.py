import json,struct,math
from fractions import Fraction as F
from pathlib import Path
D=Path(__file__).parent
x=json.load(open(D/'geometry-inputs.json'));orig=json.load(open(D/'recapture.json'));seam=json.load(open(D/'seam-recapture.json'))
f32=lambda x:struct.unpack('<f',struct.pack('<f',x))[0]
rects=[]; authored=[]; rectangle_errors=[]; prediction_errors=[]
for c in x['cells']:
 vs=[v for t in c['triangles'] for v in t];xs=sorted(set(v[0]for v in vs));zs=sorted(set(v[2]for v in vs));ys=set(v[1]for v in vs)
 assert len(c['triangles'])==2 and len(xs)==len(zs)==2 and len(ys)==1
 area=sum(abs((F(t[1][0])-F(t[0][0]))*(F(t[2][2])-F(t[0][2]))-(F(t[1][2])-F(t[0][2]))*(F(t[2][0])-F(t[0][0])))/2 for t in c['triangles'])
 assert area==(F(xs[1])-F(xs[0]))*(F(zs[1])-F(zs[0]))
 rects.append((xs[0],xs[1],zs[0],zs[1]));authored.append(tuple(c['authored']))
 for j,axis in [(0,0),(2,2)]:
  lo,hi=c['authored'][j:j+2];expected=[c['position'][axis]+f32(-(hi-lo)/2),c['position'][axis]+f32((hi-lo)/2)]
  if expected!=(xs if axis==0 else zs):prediction_errors.append(c['id'])
rows=[]
for i,p in enumerate(x['cells']):
 for j,q in enumerate(x['cells'][i+1:],i+1):
  for axis,off,other in [('X',0,2),('Z',2,0)]:
   P,Q=p['authored'],q['authored']
   if min(P[other+1],Q[other+1])<=max(P[other],Q[other]):continue
   if P[off+1]==Q[off]:left,right=i,j
   elif Q[off+1]==P[off]:left,right=j,i
   else:continue
   rows.append({'left':x['cells'][left]['id'],'right':x['cells'][right]['id'],'axis':axis,'signedGap':rects[right][off]-rects[left][off+1]})
assert len(rows)==330
assert all(all(r[k]==s[k]for k in ['left','right','axis','signedGap'])for r,s in zip(rows,seam['rows']))

def clip(P,k,e,lower):
 out=[]
 for a,b in zip(P,P[1:]+P[:1]):
  ai=a[k]>=e if lower else a[k]<=e;bi=b[k]>=e if lower else b[k]<=e
  if ai:out.append(a)
  if ai!=bi:
   t=(e-a[k])/(b[k]-a[k]);out.append(tuple(v+(w-v)*t for v,w in zip(a,b)))
 return out

def area(P):
 if len(P)<3:return F(0)
 ox,oz=P[0];return abs(sum((a[0]-ox)*(b[1]-oz)-(b[0]-ox)*(a[1]-oz)for a,b in zip(P,P[1:]+P[:1])))/2

def missing(poly,rs):
 poly=[tuple(map(F,p))for p in poly];x0,x1=min(p[0]for p in poly),max(p[0]for p in poly);z0,z1=min(p[1]for p in poly),max(p[1]for p in poly)
 rs=[tuple(map(F,r))for r in rs if r[1]>x0 and r[0]<x1 and r[3]>z0 and r[2]<z1]
 xs=sorted(set([x0,x1]+[t for r in rs for t in r[:2]if x0<t<x1]));zs=sorted(set([z0,z1]+[t for r in rs for t in r[2:]if z0<t<z1]));m=F(0)
 for xa,xb in zip(xs,xs[1:]):
  for za,zb in zip(zs,zs[1:]):
   xx,zz=(xa+xb)/2,(za+zb)/2
   if any(a<=xx<=b and c<=zz<=d for a,b,c,d in rs):continue
   P=poly
   for k,e,lower in [(0,xa,True),(0,xb,False),(1,za,True),(1,zb,False)]:P=clip(P,k,e,lower)
   m+=area(P)
 return m
results=[]
for r in orig['rows']:
 exact=missing(r['footPolygon'],rects);design=missing(r['footPolygon'],authored)
 results.append({'id':r['id'],'path':r['path'],'exactBinaryInputRationalUnbackedArea':float(exact),'authoredUnbackedArea':float(design),'authorDoubleArea':r['bearing']['candidate']['unbackedPolygonArea'],'difference':float(exact)-r['bearing']['candidate']['unbackedPolygonArea']})
summary={'actualSlabTopTwoTrianglesExactlyRectangles':len(rects),'binary32EdgePredictionErrors':prediction_errors,'all330GapsExact':True,'positiveGaps':sum(r['signedGap']>0 for r in rows),'overlaps':sum(r['signedGap']<0 for r in rows),'zero':sum(r['signedGap']==0 for r in rows),'maxPositiveGap':max(r['signedGap']for r in rows),'maxOverlap':-min(r['signedGap']for r in rows),'candidatePositiveAreaExact':sum(r['exactBinaryInputRationalUnbackedArea']>0 for r in results),'candidateAbove1e8AreaExact':sum(r['exactBinaryInputRationalUnbackedArea']>1e-8 for r in results),'maxExactUnbackedArea':max(r['exactBinaryInputRationalUnbackedArea']for r in results),'maxAuthorAreaRoundingDifference':max(abs(r['difference'])for r in results),'authoredPositiveArea':sum(r['authoredUnbackedArea']>0 for r in results),'maxVerticalResidual':max(r['bearing']['candidate']['maxAbsVerticalResidual']for r in orig['rows'])}
(D/'arithmetic.json').write_text(json.dumps({'method':'Exact Fraction arithmetic on binary64 input vertices for rectangle top area, foot polygon clipping and coverage; independent struct binary32 edge reconstruction. No gap epsilon or polygon inflation.', 'summary':summary,'rows':results},indent=2)+'\n');print(json.dumps(summary,indent=2))
