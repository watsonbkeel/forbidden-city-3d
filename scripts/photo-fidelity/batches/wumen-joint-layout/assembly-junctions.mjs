import * as T from 'three';
import {createWumenAssemblyContract,verifyAssemblyInputs} from './assembly-contract.mjs';
// Offline diagnostic only. No Boolean from this module authorizes support,
// sealing, hidden trimming, installation, or collision replacement.
const sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>Math.hypot(...a);
const EPS=64*Number.EPSILON,BAND=1e-10;
const dense=(a,n)=>Array.isArray(a)&&a.length===n&&Array.from({length:n},(_,i)=>Object.hasOwn(a,i)).every(Boolean);
function validate(t){if(!dense(t,3)||!t.every(p=>dense(p,3)&&p.every(x=>typeof x==='number'&&Number.isFinite(x))))throw Error('triangle requires dense finite 3 by 3 coordinates');}
function bounds(t){return [Array.from({length:3},(_,k)=>Math.min(...t.map(p=>p[k]))),Array.from({length:3},(_,k)=>Math.max(...t.map(p=>p[k])))];}
const disjoint=(a,b)=>[0,1,2].some(k=>a[1][k]<b[0][k]||b[1][k]<a[0][k]);
const unique=points=>[...new Map(points.map(p=>[JSON.stringify(p),p])).values()];
function kernel(a,b){const hits=[];for(const [direction,[x,y]]of [[a,b],[b,a]].entries())for(let edge=0;edge<3;edge++){const from=new T.Vector3(...x[edge]),d=new T.Vector3(...x[(edge+1)%3]).sub(from),length=d.length();if(!length||!Number.isFinite(length))continue;const p=new T.Ray(from,d.multiplyScalar(1/length)).intersectTriangle(...y.map(p=>new T.Vector3(...p)),false,new T.Vector3());if(p&&p.distanceToSquared(from)<=length*length)hits.push({direction,edge,point:p.toArray()});}return{hit:hits.length>0,hits};}
function coplanarPolygon(a,b,normal){const axis=normal.map(Math.abs).indexOf(Math.max(...normal.map(Math.abs))),axes=[0,1,2].filter(k=>k!==axis),p2=p=>axes.map(k=>p[k]),wedge=(a,b)=>a[0]*b[1]-a[1]*b[0],orient=(a,b,p)=>wedge(sub(p2(b),p2(a)),sub(p2(p),p2(a))),sign=Math.sign(orient(b[0],b[1],b[2]));let poly=a.map(p=>[...p]),unresolved=false;const clipping=[];for(let j=0;j<3;j++){const u=b[j],v=b[(j+1)%3],next=[];for(let k=0;k<poly.length;k++){const x=poly[k],y=poly[(k+1)%poly.length],dx=sign*orient(u,v,x),dy=sign*orient(u,v,y),insideX=dx>=0,insideY=dy>=0;if(!Number.isFinite(dx)||!Number.isFinite(dy)){unresolved=true;continue;}if(insideX)next.push(x);if(insideX!==insideY){const den=dx-dy,t=dx/den;clipping.push({clipEdge:j,den,t,dx,dy});if(!Number.isFinite(t)||den===0){unresolved=true;continue;}next.push(x.map((q,i)=>q+t*(y[i]-q)));}}poly=unique(next);}
 let twice=0;for(let i=0;i<poly.length;i++)twice+=wedge(p2(poly[i]),p2(poly[(i+1)%poly.length]));const area=Math.abs(twice)/2;if(!Number.isFinite(area))unresolved=true;return{projectionAxis:axis,points:poly,projectedOverlapArea:area,clipping,unresolved,contactDimension:poly.length===0?-1:area>0?2:poly.length>1?1:0};}
export function classifyTrianglePair(a,b){
 validate(a);validate(b);const ba=bounds(a),bb=bounds(b),na=cross(sub(a[1],a[0]),sub(a[2],a[0])),nb=cross(sub(b[1],b[0]),sub(b[2],b[0])),result={accepted:false,supportVerified:false,policy:'EXACT_AABB; 64*EPS_RELATIVE_DENOMINATOR_AND_1e-10_DIMENSIONLESS_PARAMETER_AMBIGUITY_ONLY_NOT_METRE_TOLERANCE',bounds:[ba,bb],rawKernel:{hit:false,hits:[]},independentRaw:false,parameters:[],points:[]};
 if(![...na,...nb].every(Number.isFinite))return{...result,classification:'NUMERIC_UNRESOLVED',reason:'NONFINITE_NORMAL'};
 if(norm(na)===0||norm(nb)===0)return{...result,classification:'DEGENERATE_UNRESOLVED'};
 if(disjoint(ba,bb))return{...result,classification:'SEPARATED_BOUNDS'};
 result.rawKernel=kernel(a,b);
 const da=b.map(p=>dot(na,sub(p,a[0]))),db=a.map(p=>dot(nb,sub(p,b[0])));
 if(da.every(x=>x===0)&&db.every(x=>x===0)){const p=coplanarPolygon(a,b,na);return{...result,...p,classification:p.unresolved?'NUMERIC_UNRESOLVED':p.contactDimension<0?'COPLANAR_SEPARATED':p.contactDimension===2?'COPLANAR_OVERLAP_DIAGNOSTIC':'COPLANAR_BOUNDARY_UNRESOLVED'};}
 let ambiguous=false,stableCross=false;const points=[];
 for(const [direction,[x,y]]of [[a,b],[b,a]].entries())for(let edge=0;edge<3;edge++){
  const from=x[edge],d=sub(x[(edge+1)%3],from),e1=sub(y[1],y[0]),e2=sub(y[2],y[0]),n=cross(e1,e2),den=dot(n,d),distance=dot(n,sub(y[0],from)),scale=norm(n)*norm(d),p={direction,edge,den,distance,denScale:scale};result.parameters.push(p);
  if(den===0&&distance!==0&&Number.isFinite(distance)){p.reason='EXACT_PARALLEL_OFF_PLANE';continue;}
  if(!Number.isFinite(scale)||!scale||Math.abs(den)<=EPS*scale){p.reason='NEAR_PARALLEL_OR_NONFINITE_DENOMINATOR';ambiguous=true;continue;}
  const t=distance/den;p.t=t;if(!Number.isFinite(t)){ambiguous=true;p.reason='NONFINITE_T';continue;}if(t < -BAND||t>1+BAND){p.reason='SEGMENT_RANGE_SEPARATED';continue;}
  const point=from.map((v,k)=>v+t*d[k]),q=sub(point,y[0]),aa=dot(e1,e1),ab=dot(e1,e2),bb=dot(e2,e2),qa=dot(q,e1),qb=dot(q,e2),det=aa*bb-ab*ab;p.det=det;p.detScale=aa*bb;
  if(!Number.isFinite(det)||Math.abs(det)<=EPS*aa*bb){ambiguous=true;p.reason='NEAR_DEGENERATE_BARYCENTRIC';continue;}
  const u=(bb*qa-ab*qb)/det,v=(aa*qb-ab*qa)/det;p.u=u;p.v=v;p.point=point;
  if(!Number.isFinite(u)||!Number.isFinite(v)||!point.every(Number.isFinite)){ambiguous=true;p.reason='NONFINITE_BARYCENTRIC';continue;}
  const raw=t>=0&&t<=1&&u>=0&&v>=0&&u+v<=1;p.independentRaw=raw;if(raw){result.independentRaw=true;points.push(point);}
  if(u < -BAND||v < -BAND||u+v>1+BAND){p.reason='BARYCENTRIC_SEPARATED';continue;}
  if(t>BAND&&t<1-BAND&&u>BAND&&v>BAND&&u+v<1-BAND){stableCross=true;p.reason='STABLE_INTERIOR_CROSSING';}else{ambiguous=true;p.reason='DIMENSIONLESS_PARAMETER_BOUNDARY';}
 }
 result.points=unique(points);if(result.points.length>=2){let max=-1;for(let i=0;i<result.points.length;i++)for(let j=i+1;j<result.points.length;j++){const d=norm(sub(result.points[i],result.points[j]));if(d>max){max=d;result.segment=[result.points[i],result.points[j]];}}}
 const disagree=result.rawKernel.hit!==result.independentRaw;
 return{...result,classification:disagree?'ALGORITHM_DISAGREEMENT_UNRESOLVED':stableCross?'TRANSVERSE_INTERSECTION':ambiguous?'NUMERIC_BOUNDARY_UNRESOLVED':'SEPARATED_STABLE'};
}

/** Actual CPU-position drawing topology; not alpha-texture/GPU deformation.
 * Single materials draw the whole range regardless of geometry groups;
 * material arrays execute EACH group, including repeated/overlapping draws. */
export function collectTriangleRoots(roots,entityId){
 if(!Array.isArray(roots)||!roots.length||typeof entityId!=='string')throw Error('triangle roots require explicit entity identity');
 const rows=[],meshes=[],rootSet=new Set(),labels=new Set();for(const {label,root}of roots){if(typeof label!=='string'||!root?.isObject3D||rootSet.has(root)||labels.has(label))throw Error('triangle root identity differs');rootSet.add(root);labels.add(label);}
 for(const root of rootSet)for(let p=root.parent;p;p=p.parent)if(rootSet.has(p))throw Error('triangle roots overlap ancestor ownership');
 for(const {label,root}of roots){root.updateWorldMatrix(true,true);function visit(m,path){
  let visible=true;for(let o=m;o;o=o.parent)if(!o.visible)visible=false;
  if(m.isMesh&&visible){
   if(m.isInstancedMesh||m.isSkinnedMesh||m.isBatchedMesh)throw Error('triangle collector unsupported mesh execution');
   const g=m.geometry,p=g?.attributes?.position,ix=g?.index;if(!p||p.itemSize!==3||!Number.isInteger(p.count)||Object.values(g.morphAttributes??{}).some(a=>a.length))throw Error('triangle collector unsupported position channel');
   const total=ix?.count??p.count,start=g.drawRange.start,count=g.drawRange.count;if(!Number.isInteger(start)||start<0||!(count===Infinity||Number.isInteger(count)&&count>=0))throw Error('triangle collector invalid drawing range');
   const materialArray=Array.isArray(m.material),ranges=materialArray?g.groups.map((r,i)=>({...r,drawGroup:i})): [{start:0,count:total,materialIndex:0,drawGroup:-1}],matrix=m.matrixWorld.toArray(),meshId=entityId+'|'+label+'|'+path.join('.'),cache=new Map();
   const vertex=i=>{if(!Number.isInteger(i)||i<0||i>=p.count)throw Error('triangle collector index outside actual vertex count');if(!cache.has(i)){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld).toArray();if(!v.every(Number.isFinite))throw Error('triangle collector nonfinite actual vertex');cache.set(i,v);}return cache.get(i);};let drawn=0;
   for(const range of ranges){if(!Number.isInteger(range.start)||!Number.isInteger(range.count)||range.start<0||range.count<0)throw Error('triangle collector malformed group');const mat=materialArray?m.material[range.materialIndex]:m.material;if(!mat?.visible||(mat.transparent&&mat.opacity<=0))continue;const first=Math.max(start,range.start),end=Math.min(total,start+count,range.start+range.count);for(let j=first;j+2<end;j+=3){const ids=[0,1,2].map(k=>ix?ix.getX(j+k):j+k),v=ids.map(vertex),n=cross(sub(v[1],v[0]),sub(v[2],v[0]));rows.push({id:meshId+'|group'+range.drawGroup+'|index'+j,entityId,root:label,path:[...path],meshName:m.name,drawGroup:range.drawGroup,indexStart:j,vertexIndices:ids,materialIndex:range.materialIndex,materialSide:mat.side,v,bounds:bounds(v),degenerate:n.every(x=>x===0),numericUnresolved:!n.every(Number.isFinite)});drawn++;}}
   meshes.push({id:meshId,name:m.name,path:[...path],matrixWorld:matrix,positionCount:p.count,indexCount:ix?.count??null,drawRange:{...g.drawRange},groups:g.groups.map(r=>({...r})),drawnTriangles:drawn});
  }
  m.children.forEach((o,i)=>visit(o,[...path,i]));
 }visit(root,[]);}
 return{entityId,roots:roots.map(r=>r.label),meshes,triangles:rows,drawnTriangles:rows.length,degenerateTriangles:rows.filter(r=>r.degenerate).map(r=>r.id),numericUnresolvedTriangles:rows.filter(r=>r.numericUnresolved).map(r=>r.id),accepted:false,supportVerified:false};
}

export function collectAssemblyEntities(candidate){
 const contract=createWumenAssemblyContract();verifyAssemblyInputs(candidate?.contract);if(!candidate?.group?.isGroup||candidate.accepted!==false||candidate.upperInstances?.length!==6||candidate.links?.length!==2||candidate.roofLayers?.length!==10||candidate.roofConstructionRoles?.length!==28)throw Error('assembly diagnostic complete candidate required');
 const definitions=[{id:'axis/wumen-upper-tower',roots:[{label:'main-body',root:candidate.retained.mainBody},{label:'main-roof',root:candidate.retained.mainRoof},{label:'main-plaque',root:candidate.retained.plaque}]}];
 for(const t of contract.targetGroups.filter(t=>t.kind!=='link')){const bodies=candidate.upperInstances.filter(x=>x.id===t.id),layers=candidate.roofLayers.filter(x=>x.instanceId===t.id),roles=candidate.roofConstructionRoles.filter(x=>x.role.instance===t.id);if(bodies.length!==1||layers.length!==(t.kind==='pavilion'?2:1))throw Error('assembly entity component membership differs');definitions.push({id:t.id,roots:[{label:'body',root:bodies[0].group},...layers.flatMap(l=>[{label:'surface/'+l.layer,root:l.surface.group},{label:'trim/'+l.layer,root:l.trim.group}]),...roles.map(r=>({label:'role/'+r.role.layer+'/'+r.role.kind,root:r.mesh}))]});}
 for(const t of contract.targetGroups.filter(t=>t.kind==='link')){const links=candidate.links.filter(l=>l.id===t.id);if(links.length!==1)throw Error('assembly link membership differs');definitions.push({id:t.id,roots:[{label:'link',root:links[0].group}]});}
 const claimed=new Set();for(const d of definitions)for(const {root}of d.roots){if(!root||root.parent!==candidate.group||claimed.has(root))throw Error('assembly entity root ownership differs');claimed.add(root);}candidate.group.updateWorldMatrix(true,true);return definitions.map(d=>collectTriangleRoots(d.roots,d.id));
}
function validatedRows(entity){if(typeof entity?.entityId!=='string'||!Array.isArray(entity.triangles))throw Error('pair requires triangle entity');const ids=new Set();return entity.triangles.map(t=>{validate(t.v);const actual=bounds(t.v);if(typeof t.id!=='string'||ids.has(t.id)||t.entityId!==entity.entityId)throw Error('pair triangle identity differs');ids.add(t.id);if(!dense(t.bounds,2)||!t.bounds.every((a,i)=>dense(a,3)&&a.every((v,k)=>v===actual[i][k])))throw Error('pair actual bounds differ');const n=cross(sub(t.v[1],t.v[0]),sub(t.v[2],t.v[0]));return{...t,bounds:actual,degenerate:n.every(x=>x===0),numericUnresolved:!n.every(Number.isFinite)};});}
export function classifyEntityPair(left,right,region,onPair){
 if(typeof onPair!=='function')throw Error('pair record sink required');if(!region||region.automaticAcceptance!==false||!dense(region.pair,2)||region.pair[0]!==left?.entityId||region.pair[1]!==right?.entityId||!dense(region.bounds,2)||!region.bounds.every(p=>dense(p,3)&&p.every(Number.isFinite))||region.bounds[0].some((v,k)=>v>region.bounds[1][k]))throw Error('pair reporting region differs');
 const a=validatedRows(left),b=validatedRows(right),sorted=[...b].sort((x,y)=>x.bounds[0][0]-y.bounds[0][0]),total=a.length*b.length;if(!Number.isSafeInteger(total))throw Error('pair denominator outside safe integer');const badA=a.filter(t=>t.degenerate||t.numericUnresolved).length,badB=b.filter(t=>t.degenerate||t.numericUnresolved).length;
 const summary={id:region.id,pair:[...region.pair],cartesianPairCount:total,leftTriangleCount:a.length,rightTriangleCount:b.length,candidatePairCount:0,aabbDisjointPairCount:0,degenerateOrNumericPairCount:badA*b.length+badB*a.length-badA*badB,classificationCounts:{},reportingRegionCounts:{},accepted:false,supportVerified:false,automaticAcceptance:false,broadPhase:'EXACT_RECOMPUTED_VERTEX_AABB_STRICT_DISJOINT; ZERO_EPSILON',degenerateCountNote:'cross-cutting pair count; never omitted from Cartesian denominator'};
 const inside=p=>p.every((x,k)=>x>=region.bounds[0][k]&&x<=region.bounds[1][k]);
 for(const x of a)for(const y of sorted){if(y.bounds[0][0]>x.bounds[1][0])break;if(disjoint(x.bounds,y.bounds))continue;const d=classifyTrianglePair(x.v,y.v);summary.candidatePairCount++;let reportingRegion='NO_CONTACT_REPORTED';if(!d.classification.includes('SEPARATED')){const resolved=d.classification==='TRANSVERSE_INTERSECTION'||d.classification==='COPLANAR_OVERLAP_DIAGNOSTIC';reportingRegion=resolved&&d.points.length?(d.points.every(inside)?'INSIDE_REPORTING_BIN':'OUTSIDE_REPORTING_BIN'):'UNRESOLVED_REGION';}summary.classificationCounts[d.classification]=(summary.classificationCounts[d.classification]??0)+1;summary.reportingRegionCounts[reportingRegion]=(summary.reportingRegionCounts[reportingRegion]??0)+1;onPair({pairId:region.id,left:{id:x.id,root:x.root??null,path:x.path??null,indexStart:x.indexStart??null,v:x.v.map(p=>[...p])},right:{id:y.id,root:y.root??null,path:y.path??null,indexStart:y.indexStart??null,v:y.v.map(p=>[...p])},...d,reportingRegion,rawPointRegion:d.points.length?(d.points.every(inside)?'INSIDE':'OUTSIDE'):null});}
 summary.aabbDisjointPairCount=total-summary.candidatePairCount;return summary;
}
/** All eight declared pairs, full entity records and every narrow-phase pair.
 * Sinks are mandatory: unresolved parameters may not silently disappear. */
export function classifyAssemblyJunctions(candidate,{onEntity,onPair}={}){
 if(typeof onEntity!=='function'||typeof onPair!=='function')throw Error('complete entity and pair record sinks required');
 const entities=collectAssemblyEntities(candidate),byId=new Map(entities.map(e=>[e.entityId,e])),regions=candidate.contract.junctionRegions;
 if(regions.length!==8||new Set(regions.map(r=>r.id)).size!==8)throw Error('eight unique declared junctions required');
 for(const e of entities)onEntity(e);
 const pairs=regions.map(r=>{if(!r.pair.every(id=>byId.has(id)))throw Error('junction entity absent');return classifyEntityPair(byId.get(r.pair[0]),byId.get(r.pair[1]),r,onPair);});
 return{scope:'UNINSTALLED_COMPLETE_UPPER_ENTITY_TRIANGLE_DIAGNOSTIC_NOT_CONTACT_AUTHORITY',coordinateSpace:'WUMEN_COMPONENT_LOCAL',entities:entities.map(e=>({id:e.entityId,roots:e.roots,meshCount:e.meshes.length,triangleCount:e.drawnTriangles,degenerateTriangleIds:e.degenerateTriangles,numericUnresolvedTriangleIds:e.numericUnresolvedTriangles})),pairs,cartesianPairCount:pairs.reduce((n,p)=>n+p.cartesianPairCount,0),candidatePairCount:pairs.reduce((n,p)=>n+p.candidatePairCount,0),aabbDisjointPairCount:pairs.reduce((n,p)=>n+p.aabbDisjointPairCount,0),accepted:false,supportVerified:false,runtimeInstalled:false,routeAccepted:false,limitations:['CPU actual position topology; no alpha texture/GPU deformation verdict','Reporting bins do not authorize clipping or penetration','Strict AABB exclusions remain reconstructible from complete entity rows','Retained historical degenerates occupy the full original denominator']};
}
function segmentClosest(p1,q1,p2,q2){
 const d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r),clamp=x=>Math.max(0,Math.min(1,x));let s=0,t=0;
 if(a===0&&e===0)return[p1,p2];if(a===0)t=clamp(f/e);else{const c=dot(d1,r);if(e===0)s=clamp(-c/a);else{const b=dot(d1,d2),den=a*e-b*b;s=den>0?clamp((b*f-c*e)/den):0;t=(b*s+f)/e;if(t<0){t=0;s=clamp(-c/a);}else if(t>1){t=1;s=clamp((b-c)/a);}}}
 return[p1.map((x,k)=>x+s*d1[k]),p2.map((x,k)=>x+t*d2[k])];
}
function triangleDistance(a,b){let best={distanceSquared:Infinity,points:null};const retain=(p,q)=>{const d=dot(sub(p,q),sub(p,q));if(!Number.isFinite(d))throw Error('distance nonfinite arithmetic');if(d<best.distanceSquared)best={distanceSquared:d,points:[p.map(x=>x),q.map(x=>x)]};};
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)retain(...segmentClosest(a[i],a[(i+1)%3],b[j],b[(j+1)%3]));
 for(const [x,y,reverse]of[[a,b,false],[b,a,true]]){const n=cross(sub(y[1],y[0]),sub(y[2],y[0]));if(dot(n,n)>0){const triangle=new T.Triangle(...y.map(p=>new T.Vector3(...p)));for(const p of x){const q=triangle.closestPointToPoint(new T.Vector3(...p),new T.Vector3()).toArray();if(reverse)retain(q,p);else retain(p,q);}}}return best;
}
/** Numerical distance diagnostic ONLY for entity pairs with strictly disjoint
 * triangle AABBs throughout. All actual vertices/edges remain in the search. */
export function minimumSeparatedEntityDistance(left,right){
 const a=validatedRows(left),b=validatedRows(right);if(!a.length||!b.length)throw Error('distance requires nonempty entities');let best={distanceSquared:Infinity},examinedPairs=0,prunedPairs=0;
 for(const x of a)for(const y of b){if(!disjoint(x.bounds,y.bounds))throw Error('distance requires no overlapping triangle AABB; use contact classification');let lower=0;for(let k=0;k<3;k++){const d=Math.max(0,x.bounds[0][k]-y.bounds[1][k],y.bounds[0][k]-x.bounds[1][k]);lower+=d*d;}if(lower>best.distanceSquared){prunedPairs++;continue;}examinedPairs++;const d=triangleDistance(x.v,y.v);if(d.distanceSquared<best.distanceSquared)best={...d,leftId:x.id,rightId:y.id,leftVertices:x.v,rightVertices:y.v};}
 return{...best,distance:Math.sqrt(best.distanceSquared),pair:[left.entityId,right.entityId],cartesianPairCount:a.length*b.length,examinedPairs,prunedPairs,method:'NUMERICAL_VERTEX_TRIANGLE_AND_EDGE_EDGE_MINIMUM_WITH_RECOMPUTED_AABB_DISTANCE_PRUNING',accepted:false,supportVerified:false,certifiedInterval:false};
}
function worldPoints(mesh,select=()=>true){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++)if(select(p,i))points.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).toArray());return unique(points);}
const sortedPointKeys=points=>points.map(p=>JSON.stringify(p)).sort();
const exactPointSet=(a,b)=>JSON.stringify(sortedPointKeys(a))===JSON.stringify(sortedPointKeys(b));
export function diagnoseConstructionBoundaries(candidate){
 verifyAssemblyInputs(candidate?.contract);candidate.group.updateWorldMatrix(true,true);
 const roles=candidate.roofConstructionRoles,layers=[];for(const l of candidate.roofLayers){const find=kind=>roles.find(r=>r.role.instance===l.instanceId&&r.role.layer===l.layer&&r.role.kind===kind)?.mesh,fanMesh=find('fan'),bracket=find('bracket');if(!fanMesh||!bracket)throw Error('actual construction role absent');const fan=worldPoints(fanMesh,(p,i)=>p.getX(i)!==0||p.getZ(i)!==0),p=bracket.geometry.attributes.position,maxY=Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i))),top=worldPoints(bracket,(p,i)=>p.getY(i)===maxY),soffit=unique(l.surface.group.children.filter(m=>m.name.startsWith('soffit/')).flatMap(m=>worldPoints(m,(_,i)=>m.geometry.userData.section.parameters[i].t===l.section.recipe.tw)));layers.push({id:l.instanceId+'/'+l.layer,fan,bracketTop:top,soffit,fanSoffitExact:exactPointSet(fan,soffit),fanBracketExact:exactPointSet(fan,top),accepted:false,supportVerified:false});}
 const bodyBeams=candidate.upperInstances.map(instance=>{const bracket=roles.find(r=>r.role.instance===instance.id&&r.role.kind==='bracket'&&r.role.layer!=='upper')?.mesh;if(!bracket||!instance.beam)throw Error('actual beam bracket absent');const p=bracket.geometry.attributes.position,minY=Math.min(...Array.from({length:p.count},(_,i)=>p.getY(i))),bottomPoints=worldPoints(bracket,(p,i)=>p.getY(i)===minY),beamPoints=worldPoints(instance.beam),beamBounds=bounds(beamPoints),top=beamPoints.filter(p=>p[1]===beamBounds[1][1]);return{id:instance.id,beamBounds,beamTopPoints:top,bottomPoints,signedYResidual:bottomPoints.map(p=>p[1]-beamBounds[1][1]),xzEnvelopeResidual:{min:[0,2].map(k=>Math.min(...bottomPoints.map(p=>p[k]))-beamBounds[0][k]),max:[0,2].map(k=>Math.max(...bottomPoints.map(p=>p[k]))-beamBounds[1][k])},accepted:false,supportVerified:false,method:'ACTUAL_TRANSFORMED_BOX_TOP_PLANE_AND_PRISM_BOTTOM_POINTS_NOT_SOLID_STRUCTURAL_PROOF'};});
 return{layers,bodyBeams,accepted:false,supportVerified:false,scope:'ACTUAL_FLOAT32_BOUNDARY_POINT_SETS_AND_BOX_TOP_RESIDUALS_NO_PADDING_NO_SUPPORT_REGISTRATION'};
}
