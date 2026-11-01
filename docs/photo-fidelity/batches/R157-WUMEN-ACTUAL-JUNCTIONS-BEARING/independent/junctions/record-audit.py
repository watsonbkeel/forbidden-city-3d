import pathlib,json,collections,hashlib,math,time
import numpy as np
W=pathlib.Path('/workspace/scratch/02a8023d1a85');P=W/'wumen-joint-recovery-1607/upper-reassembly-2034/assembly-task3-0005';E=W/'independent-wumen-junctions-0022';started=time.monotonic();summary=json.loads((P/'actual-0019/summary.json').read_text());entities={}
for line in (P/'actual-0019/entities.ndjson').open():
 e=json.loads(line);ids=[t['id'] for t in e['triangles']];assert len(set(ids))==len(ids)==e['drawnTriangles'];v=np.array([t['v'] for t in e['triangles']],dtype=np.float64);lo=v.min(axis=1);hi=v.max(axis=1);recorded=np.array([t['bounds'] for t in e['triangles']]);assert np.array_equal(lo,recorded[:,0,:]) and np.array_equal(hi,recorded[:,1,:]);n=np.cross(v[:,1]-v[:,0],v[:,2]-v[:,0]);deg=np.all(n==0,axis=1);assert [ids[i] for i in np.nonzero(deg)[0]]==e['degenerateTriangles'];assert np.isfinite(v).all();assert sum(m['drawnTriangles'] for m in e['meshes'])==len(ids)
 entities[e['entityId']]={'v':v,'lo':lo,'hi':hi,'ids':ids,'index':{x:i for i,x in enumerate(ids)},'deg':int(deg.sum())}
del e
pairs={q['id']:{'records':set(),'classes':collections.Counter(),'regions':collections.Counter()} for q in summary['pairs']};stable=[];unresolved=[]
for line in (P/'actual-0019/pairs.ndjson').open():
 q=json.loads(line);r=pairs[q['pairId']];key=(q['left']['id'],q['right']['id']);assert key not in r['records'];r['records'].add(key);r['classes'][q['classification']]+=1;r['regions'][q['reportingRegion']]+=1
 sq=next(x for x in summary['pairs'] if x['id']==q['pairId'])
 for side,eid in zip(['left','right'],sq['pair']):
  ent=entities[eid];assert np.array_equal(ent['v'][ent['index'][q[side]['id']]],np.array(q[side]['v']))
 assert q['accepted']==False and q['supportVerified']==False
 if q['classification'] in ['TRANSVERSE_INTERSECTION','SEPARATED_STABLE']:stable.append(q)
 else:unresolved.append(q)
audits=[]
for s in summary['pairs']:
 a,b=[entities[k] for k in s['pair']];expected=set();minbound=math.inf;minpair=None
 for start in range(0,len(a['ids']),64):
  al,ah=a['lo'][start:start+64,None,:],a['hi'][start:start+64,None,:];bl,bh=b['lo'][None,:,:],b['hi'][None,:,:];overlap=np.all((ah>=bl)&(bh>=al),axis=2)
  ii,jj=np.nonzero(overlap)
  expected.update((a['ids'][start+i],b['ids'][j]) for i,j in zip(ii,jj))
  if s['candidatePairCount']==0:
   gaps=np.maximum(0,np.maximum(al-bh,bl-ah));lb=np.sum(gaps*gaps,axis=2);flat=lb.argmin();i,j=np.unravel_index(flat,lb.shape)
   if lb[i,j]<minbound:minbound=float(lb[i,j]);minpair=(a['ids'][start+i],b['ids'][j])
 r=pairs[s['id']];assert expected==r['records'];assert len(expected)==s['candidatePairCount'];assert r['classes']==s['classificationCounts'];assert r['regions']==s['reportingRegionCounts'];assert len(a['ids'])*len(b['ids'])==s['cartesianPairCount'];assert s['aabbDisjointPairCount']+s['candidatePairCount']==s['cartesianPairCount'];assert s['degenerateOrNumericPairCount']==a['deg']*len(b['ids'])+b['deg']*len(a['ids'])-a['deg']*b['deg']
 audits.append({'id':s['id'],'total':s['cartesianPairCount'],'candidates':len(expected),'recordSetEqual':True,'classes':dict(r['classes']),'minimumAllTriangleAABBSquaredDistance':minbound if math.isfinite(minbound) else None,'minimumBoundPair':minpair})
# Independent plane-cut interval algorithm, not edge-Ray or barycentric implementation.
def cut_interval(x,y):
 n=np.cross(y[1]-y[0],y[2]-y[0]);d=np.dot(x-y[0],n);pts=[]
 for i in range(3):
  j=(i+1)%3
  if d[i]==0:pts.append(x[i])
  if (d[i]<0 and d[j]>0) or (d[i]>0 and d[j]<0):pts.append(x[i]+d[i]/(d[i]-d[j])*(x[j]-x[i]))
 return pts,d
ind=collections.Counter();disagreements=[]
for q in stable:
 a,b=np.array(q['left']['v']),np.array(q['right']['v']);pa,da=cut_interval(a,b);pb,db=cut_interval(b,a);na=np.cross(a[1]-a[0],a[2]-a[0]);nb=np.cross(b[1]-b[0],b[2]-b[0]);axis=np.cross(na,nb);length=np.linalg.norm(axis)
 if not pa or not pb:cl='SEPARATED'
 elif length==0:cl='PARALLEL_UNRESOLVED'
 else:
  axis/=length;aa=np.array(pa)@axis;bb=np.array(pb)@axis;gap=min(max(aa),max(bb))-max(min(aa),min(bb));cl='INTERSECTION' if gap>0 else 'SEPARATED' if gap<0 else 'BOUNDARY_UNRESOLVED'
 expected='INTERSECTION' if q['classification']=='TRANSVERSE_INTERSECTION' else 'SEPARATED';ind[(expected,cl)]+=1
 if cl!=expected:disagreements.append({'pairId':q['pairId'],'left':q['left']['id'],'right':q['right']['id'],'author':expected,'independent':cl})
distance=json.loads((P/'main-link-distance-0021.json').read_text());witnesses=[]
for q in distance['results']:
 bound=next(x['minimumAllTriangleAABBSquaredDistance'] for x in audits if set(next(z['pair'] for z in summary['pairs'] if z['id']==x['id']))==set(q['pair']));points=np.array(q['points']);dist2=float(np.dot(points[0]-points[1],points[0]-points[1]));assert dist2==q['distanceSquared'];barys=[]
 for point,verts,eid,tid in zip(points,[q['leftVertices'],q['rightVertices']],q['pair'],[q['leftId'],q['rightId']]):
  ent=entities[eid];tri=ent['v'][ent['index'][tid]];assert np.array_equal(tri,verts);basis=np.array([tri[1]-tri[0],tri[2]-tri[0]]).T;uv=np.linalg.lstsq(basis,point-tri[0],rcond=None)[0];reconstructed=tri[0]+basis@uv;barys.append({'barycentric':[float(1-uv.sum()),float(uv[0]),float(uv[1])],'planeResidual':float(np.linalg.norm(reconstructed-point))})
 witnesses.append({'pair':q['pair'],'distance':q['distance'],'allTriangleAABBSquaredLowerBound':bound,'witnessSquaredDistance':dist2,'boundEqualsWitness':bound==dist2,'barycentricWitnesses':barys})
out={'scope':'Independent postprocessing of frozen author actual-0019 records; no reconstruction/World','inputSHA256':{x.name:hashlib.sha256(x.read_bytes()).hexdigest() for x in (P/'actual-0019').iterdir() if x.is_file()},'entityCounts':{k:{'triangles':len(v['ids']),'degenerate':v['deg']} for k,v in entities.items()},'pairs':audits,'independentStablePlaneCut': [{'author':k[0],'independent':k[1],'count':v} for k,v in ind.items()],'stableDisagreements':disagreements,'authorUnresolvedRetained':len(unresolved),'distanceWitnesses':witnesses,'seconds':time.monotonic()-started};(E/'record-audit.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ['pairs','inputSHA256','entityCounts']},indent=2))
