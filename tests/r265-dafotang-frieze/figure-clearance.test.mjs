import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {T,fixture,candidate,baseline,repo,beam,triangles} from './fixture.mjs';
const subject=process.env.R265_SUBJECT;assert.ok(['shakyamuni','amitabha','bhaisajyaguru'].includes(subject),'one named figure per process required');
const report={subject,scope:'ONE_REAL_PRODUCTION_FIGURE_PLUS_LAYOUT_ONLY',excluded:['full hall','other two figures','towers','walls','native movement','batching','photos','browser','GPU'],targets:[],rays:[],highViewRays:[]};
const matrices=new WeakMap();
const bounds=m=>{const b=new T.Box3(),p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrices.get(m)??m.matrixWorld));return b;};
const boxJSON=b=>({min:b.min.toArray(),max:b.max.toArray()});
function layout(mod){
 const f=fixture();
 try{
  const out=mod.buildDafotangHistoricLayout(f.context);out.frame.updateWorldMatrix(true,true);
  const inv=f.context.f.matrixWorld.clone().invert(),beamGeometry=beam(out).geometry;beamGeometry.computeBoundingBox();
  const owners=out.frame.children.map((m,i)=>{const mat=inv.clone().multiply(m.matrixWorld);return {role:m.userData.dafotangLayoutRole,ownerId:'layout/'+i+'/'+m.userData.dafotangLayoutRole,meshName:m.name,triangles:triangles(m.geometry).map(t=>{for(const v of[t.a,t.b,t.c])v.applyMatrix4(mat);return t;})};});
  const pedestals=out.frame.children.filter(m=>/^new-buddha-pedestal/.test(m.userData.dafotangLayoutRole)).map(m=>{m.geometry.computeBoundingBox();return {role:m.userData.dafotangLayoutRole,bounds:boxJSON(m.geometry.boundingBox)};});
  return {bounds:boxJSON(beamGeometry.boundingBox),owners,pedestals};
 }finally{f.dispose();}
}
function rayHit(ray,ts,max=Infinity){let best=null;const p=new T.Vector3();for(let i=0;i<ts.length;i++){if(ray.intersectTriangle(ts[i].a,ts[i].b,ts[i].c,false,p)){const distance=p.distanceTo(ray.origin);if(distance<=max+1e-6&&(!best||distance<best.distance))best={distance,triangle:i,point:p.toArray()};}}return best;}
function target(mesh,kind,axis,extreme){const ts=triangles(mesh.geometry).map(t=>{for(const v of[t.a,t.b,t.c])v.applyMatrix4(matrices.get(mesh)??mesh.matrixWorld);return t;}),b=bounds(mesh),center=b.getCenter(new T.Vector3());let best=null;
 for(let i=0;i<ts.length;i++){const t=ts[i];let point,score,vertex=null;if(kind==='face-center'){point=t.getMidpoint(new T.Vector3());if(point.z>center.z)continue;score=(point.x-center.x)**2+(point.y-center.y)**2+(point.z-b.min.z)**2*.03;}
  else{const vs=[t.a,t.b,t.c];vertex=vs.reduce((a,b)=>extreme==='min'?(a[axis]<b[axis]?a:b):(a[axis]>b[axis]?a:b));point=vertex.clone().multiplyScalar(.999).addScaledVector(t.getMidpoint(new T.Vector3()),.001);score=extreme==='min'?point[axis]:-point[axis];}
  if(!best||score<best.score)best={mesh,role:mesh.userData.role,kind,point,sourceVertex:vertex?.toArray()??null,triangle:i,score,ts};
 }
 assert.ok(best);assert.ok(ts[best.triangle].containsPoint(best.point));return best;}
test('real production '+subject+' Float32 bounds and confirmed physical target rays',async()=>{
 const old=layout(baseline),newer=layout(await candidate()),f=fixture({supports:false}),owned=[],x=subject==='amitabha'?1.62:subject==='bhaisajyaguru'?-1.62:0;let output,meshes,group;
 try{
  if(subject==='shakyamuni'){const mod=await import(pathToFileURL(path.join(repo,'src/scene/palace/special/DafotangMainBuddha.js')));output=mod.buildDafotangMainBuddha(f.context);meshes=output.meshes;group=output.frame;report.productionContacts=output.contacts.length;report.productionTriangleOwners=output.contacts.filter(c=>c.triangleSupport).length;
   // Apply the unchanged real historic support fitting path to the real main
   // component, not the synthetic three-box support used for Task 1.
   (await candidate()).buildDafotangHistoricLayout(f.context);
  }else{const materials={};for(const k of['gold','red','dark']){materials[k]=new T.MeshStandardMaterial({name:k});owned.push(materials[k]);}const mod=await import(pathToFileURL(path.join(repo,'src/scene/palace/special/DafotangSideFigures.js')));output=mod.createDafotangSideFigure({subjectId:subject,materials});meshes=output.meshes;group=output.group;
   // Exact Triad.js placement mutates production geometry, including Float32
   // rounding. No group translation substitution or metadata-only bounds.
   for(const m of meshes){m.geometry.translate(x,1.7,5.6);m.geometry.computeBoundingBox();}
   f.context.f.add(group);
  }
  f.context.kit.root.updateMatrixWorld(true);const hallInverse=f.context.f.matrixWorld.clone().invert();
  // Read actual model matrices, then express tested points in hall-local axes.
  for(const m of meshes)matrices.set(m,hallInverse.clone().multiply(m.matrixWorld));
  for(const m of meshes)assert.deepEqual(matrices.get(m).toArray(),new T.Matrix4().toArray(),'support templates use the actual baked hall-local mesh transform');
  const visible=meshes.filter(m=>m.visible),parts={},all=new T.Box3();report.meshes=[];
  for(const m of visible){assert.ok(m.geometry.attributes.position.array instanceof Float32Array);const b=bounds(m);all.union(b);const role=m.userData.role,part=m.userData.part;if(!parts[part])parts[part]=new T.Box3();parts[part].union(b);report.meshes.push({name:m.name,role,part,vertices:m.geometry.attributes.position.count,triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3,matrixWorldHallLocal:matrices.get(m).toArray(),bounds:boxJSON(b)});}
  report.allVisibleBounds=boxJSON(all);report.parts=Object.fromEntries(Object.entries(parts).map(([k,v])=>[k,boxJSON(v)]));
  const hair=visible.filter(m=>/^(?:hair-curl-|low-round|small-front-hair-jewel)/.test(m.userData.role)),face=visible.find(m=>/face$/.test(m.userData.role));assert.ok(face);assert.ok(hair.every(m=>!/lotus/.test(m.userData.part)),'crown set must exclude curled lotus parts');const crown=new T.Box3();for(const m of hair)crown.union(bounds(m));const lotus=new T.Box3();for(const m of visible.filter(m=>/lotus/.test(m.userData.part)))lotus.union(bounds(m));report.crown=boxJSON(crown);report.face=boxJSON(bounds(face));report.lotus=boxJSON(lotus);
  const pedestals=subject==='shakyamuni'?report.meshes.filter(m=>m.part==='support'):newer.pedestals.filter(q=>Math.abs((q.bounds.min[0]+q.bounds.max[0])/2-x)<.001);assert.equal(pedestals.length,3);report.squarePedestal=pedestals;report.pedestalOrigin=subject==='shakyamuni'?'real main component fitted through real layout':'real layout side pedestal owners; side component deliberately has no dais';
  const actualFloor=newer.bounds.min[1],gap=actualFloor-crown.max.y;report.actualBeamFloor=actualFloor;report.actualCrownGap=gap;assert.ok(actualFloor>=3.9741786743515846);assert.ok(gap>=3.9741786743515846-3.95-5e-7);assert.ok(gap<.025);
  const topMesh=hair.reduce((a,b)=>bounds(a).max.y>bounds(b).max.y?a:b),sideMesh=hair.reduce((a,b)=>bounds(a).max.x>bounds(b).max.x?a:b);
  const targets=[target(face,'face-center'),target(face,'face-frontmost','z','min'),target(topMesh,'crown-top','y','max'),target(sideMesh,'crown-side','x','max')];
  for(const t of targets)report.targets.push({kind:t.kind,role:t.role,point:t.point.toArray(),extremalVertex:t.sourceVertex,triangle:t.triangle,pointConstruction:'triangle centroid for face-center; extremal vertex moved 0.001 toward own triangle centroid otherwise, to avoid edge-only numerical hits'});
  const {createTriangleTemplate,triangleInstance}=await import(pathToFileURL(path.join(repo,'src/utils/TriangleSupport.js')));
  const figureOwners=visible.map(m=>{const original=subject==='shakyamuni'?output.contacts.find(c=>c.dafotangPrincipalMesh===m.uuid)?.triangleSupport:null;
   const support=original??triangleInstance(createTriangleTemplate(m.geometry),[221.9,0,241.1],m.name+'/'+m.uuid);
   // Same true production triangle template. No discarded collision or second
   // full copy of the figure's triangle objects to meet the process budget.
   return {role:m.userData.role,ownerId:'figure/'+subject+'/'+m.name,meshName:m.name,triangles:support.template.triangles.map(q=>q.triangle),support};});
  report.cpuRayMethod='two-sided actual triangle intersections, not GPU visibility';report.figureTriangleOwners=figureOwners.length;report.figureTriangles=figureOwners.reduce((n,q)=>n+q.triangles.length,0);
  const ownerById=new Map([...newer.owners,...figureOwners].map(q=>[q.ownerId,q]));
  const crownRoles=new Set(hair.map(m=>m.userData.role));
  const views=[['front',[0,2.6,0]],['west-front',[1.62,2.6,2]],['east-front',[-1.62,2.6,2]],['left-oblique',[-2.6,2.6,1]],['right-oblique',[2.6,2.6,1]],['exit-lookback',[0,2.6,-4]]];
  for(const high of[false,true])for(const[name,v]of views)for(const t of targets){const origin=new T.Vector3(...v);if(high)origin.y=4.2;const ray=new T.Ray(origin,t.point.clone().sub(origin).normalize()),max=t.point.distanceTo(origin),hit=rayHit(ray,t.ts,max);assert.ok(hit,`${name} ${t.kind} must hit actual selected role`);
   const first=owners=>{let found=null;for(const q of owners){const h=rayHit(ray,q.triangles,max);if(h&&(!found||h.distance<found.distance-1e-8))found={role:q.role,ownerId:q.ownerId,meshName:q.meshName,...h};}return found;};
   const oldFirst=first([...old.owners,...figureOwners]),newFirst=first([...newer.owners,...figureOwners]),newBeam=first(newer.owners.filter(q=>q.role==='lower-front-entablature')),oldBeam=first(old.owners.filter(q=>q.role==='lower-front-entablature'));
   const endpointTolerance=1e-6;
   const selectedEndpointVisible=!!newFirst&&Math.abs(newFirst.distance-max)<=endpointTolerance&&new T.Vector3(...newFirst.point).distanceTo(t.point)<=endpointTolerance;
   const witness=allowed=>{
    if(!newFirst||!allowed(newFirst.role))return null;
    const owner=ownerById.get(newFirst.ownerId),triangle=owner.triangles[newFirst.triangle],point=new T.Vector3(...newFirst.point),bary=triangle.getBarycoord(point,new T.Vector3()),normal=triangle.getNormal(new T.Vector3());
    const onActualTriangle=bary.toArray().every(v=>v>=-1e-7&&v<=1+1e-7)&&Math.abs(normal.dot(point.clone().sub(triangle.a)))<=endpointTolerance;
    const sameOldNewFirstSurface=!!oldFirst&&oldFirst.ownerId===newFirst.ownerId&&oldFirst.triangle===newFirst.triangle&&Math.abs(oldFirst.distance-newFirst.distance)<=endpointTolerance&&new T.Vector3(...oldFirst.point).distanceTo(point)<=endpointTolerance;
    assert.ok(onActualTriangle,'first-surface witness must belong to actual triangle');assert.ok(sameOldNewFirstSurface,'head witness must preserve old/new first surface');
    return {role:newFirst.role,ownerId:newFirst.ownerId,meshName:newFirst.meshName,triangle:newFirst.triangle,point:newFirst.point,distance:newFirst.distance,onActualTriangle,sameOldNewFirstSurface};
   };
   const visibleNoseSurfaceWitness=t.kind.startsWith('face-')?witness(role=>role==='nose'||role==='integrated-nose'):null;
   const visibleCrownSurfaceWitness=t.kind.startsWith('crown-')?witness(role=>crownRoles.has(role)):null;
   const row={view:name,origin:origin.toArray(),target:t.kind,targetRole:t.role,targetDistance:max,confirmedRoleHit:hit,oldFirst,newFirst,oldBeam,newBeam,selectedEndpointVisible,endpointTolerance,visibleNoseSurfaceWitness,visibleCrownSurfaceWitness};(high?report.highViewRays:report.rays).push(row);
   if(!high){assert.equal(newBeam,null,'new beam cannot precede actual ground-eye target');assert.equal(oldBeam,null);assert.equal(newFirst?.role,oldFirst?.role);if(newFirst&&oldFirst)assert.ok(Math.abs(newFirst.distance-oldFirst.distance)<1e-7);}
  }
  report.visibilitySummary={selectedEndpointsDirectlyVisible:report.rays.filter(q=>q.selectedEndpointVisible).length,firstHitIsOtherRole:report.rays.filter(q=>q.newFirst?.role!==q.targetRole).length,visibleNoseSurfaceWitnesses:report.rays.filter(q=>q.visibleNoseSurfaceWitness).length,visibleCrownSurfaceWitnesses:report.rays.filter(q=>q.visibleCrownSurfaceWitness).length,meaning:'Target mesh intersection, direct endpoint visibility and earlier first-surface witnesses are distinct. The pass is unchanged beam non-regression, not all selected targets visible.'};
  report.status='PASS_COMPONENT_BOUNDS_AND_GROUND_EYE_CPU_RAYS';report.highViewStatus='OBSERVED_ONLY_NO_MOVEMENT_OR_VISIBILITY_GUARANTEE';
 }finally{if(subject!=='shakyamuni')output?.dispose();f.dispose();for(const m of owned)m.dispose();if(process.env.R265_REPORT)fs.writeFileSync(process.env.R265_REPORT,JSON.stringify(report,null,2));}
});
process.on('exit',()=>console.log('RESOURCE_USAGE',JSON.stringify({limits:{oldMiB:128,semiMiB:8,timeoutSeconds:30},usage:process.resourceUsage(),memory:process.memoryUsage()})));
