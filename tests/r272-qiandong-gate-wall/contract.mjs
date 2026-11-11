export const LABEL='R272 乾东二所前院 · 真实东六宫有限控制器路线 · 人工比例审看待完成';
export const SETTINGS=Object.freeze({width:1280,height:800,dpr:1,date:'2026-11-11T04:00:00.000Z',exposure:.7,postProcessing:'DISABLED_DECLARED'});
export const ROUTES=Object.freeze(['street-west','street-east','new-entry','new-westWing','new-eastWing','new-northRoom',...Array.from({length:5},(_,i)=>'old-'+(44+i))]);
export const VIEWS=Object.freeze([
 {id:'ensemble-overview',label:'三房与门全景',position:[-116,34,447],target:[-116,1,478],fov:66},
 {id:'street-west-oblique',label:'街面西侧',position:[-108,1.7,463.85],target:[-116,4.6,466],fov:74},
 {id:'street-east-oblique',label:'街面东侧',position:[-124,1.7,463.85],target:[-116,4.6,466],fov:74},
 {id:'courtyard-north',label:'院内朝北',position:[-116.12,1.7,469],target:[-116.12,3,482],fov:78},
 {id:'courtyard-gate',label:'回看门额',position:[-116.12,1.7,476.5],target:[-116.12,5,466],fov:78},
 {id:'old45-separation',label:'旧45与北房',position:[-98,15,491],target:[-115,3,491],fov:75},
]);
const need=(v,m)=>{if(!v)throw Error(m);};
const finite=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
export function validateSourceOrder(s){
 const call='buildQiandongSecondFrontCourt(this.kit,items[59],this.zoneJson)',body=s.indexOf(call),finish=s.indexOf('this.group = this.kit.finish()');
 need(body>=0&&body===s.lastIndexOf(call)&&s.indexOf('buildJideRearHall(this.kit')<body&&s.indexOf('buildJideRearHall(this.kit')>=0&&s.indexOf('finalizeNingshouCoveredPlatforms(this.kit)')<body&&body<finish,'body must follow all retained late producers before normal finish');return true;
}
export function requireReady(r){
 need(/^[a-f0-9]{40}$/.test(r.identity?.head??'')&&/^[a-f0-9]{40}$/.test(r.identity?.tree??'')&&r.identity.parent==='dbc141dde11a65d16e537be33b27a8f1b1aef127'&&r.identity.parentTree==='486cc6861079eb0cb7e573d46496b1eb97a1365b'&&r.identity.productTree==='5b63332d7287a87bf3bbf18febdf030e0b0dbdbd','wrong frozen source identity');
 need(r.scope==='ACTUAL_EAST_SIX_FINITE_SCRIPTED_CONTROLLER'&&r.physicsConsumer==='PRODUCTION_FIRST_PERSON_SCRIPTED','not production controller finite-zone evidence');
 need(Array.isArray(r.errors)&&!r.errors.length,'scene errors');need(r.zone?.id==='east-six'&&r.zone.items===60&&r.zone.normalFinish===true&&r.zone.defaultRivers===true,'complete actual zone/finish/default waters required');
 need(r.rooms?.prefixPreserved===true&&r.rooms.newFinalThree===true&&r.rooms.old?.length>0&&JSON.stringify(r.rooms.new)==='["westWing","eastWing","northRoom"]','old room prefix/final three missing');
 for(const [i,row] of r.rooms.old.entries())need(row.index===i&&typeof row.source==='string'&&row.source.length&&Number.isFinite(row.record?.floorY)&&row.record.doors?.length>0&&row.record.doors.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)),'old room declaration/floor/doors missing');
 const probe=r.oldGateCenterProbe;need(probe?.kind==='INDEPENDENT_PRODUCTION_CONTROLLER_INITIALIZATION_NOT_ROUTE'&&probe.sourceItemIndex===42&&same(probe.sourceItemPoint,[-142,466]),'actual old gate centre observation required');requireSample(probe.sample,0);need(probe.sample.actualTriangleContact===true&&Math.abs(probe.sample.position[0]+142)<1e-6&&Math.abs(probe.sample.position[2]-466)<1e-6,'old gate centre physical/logical disagreement');
 need(r.routes?.length===ROUTES.length,'complete finite route set required');
 for(const id of ROUTES){const found=r.routes.filter(a=>a.id===id);need(found.length===1,'route missing/duplicate '+id);requireRoute(found[0]);}
 need(['beforeAfter','sourceLinks','groundBodySeparateFromRoof','measured'].every(k=>r.structure?.[k]===true),'actual structure measurements incomplete');
 requireWallEvidence(r.structure.wallEvidence,r.structure.before);
 need(r.textures?.manifest===true&&r.textures.fallbacks.length===0&&r.textures.missingNormals.length===0&&r.textures.errors.length===0,'actual texture load incomplete');need(r.fonts?.status==='loaded'&&r.fonts.cjk===true,'CJK fonts not ready');need(r.gl?.lost===false&&r.gl.error===0&&r.draw?.calls>0&&r.draw.triangles>1000,'actual renderer missing');return true;
}
export function requireCaptureSet(rows){need(rows.length===VIEWS.length,'six captures required');for(const v of VIEWS){const a=rows.filter(r=>r.id===v.id);need(a.length===1,'capture missing/duplicate');const r=a[0];need(r.file===v.id+'.png'&&r.bytes>0&&r.width===1280&&r.height===800&&/^[a-f0-9]{64}$/.test(r.sha256),'invalid PNG receipt');}return true;}
export function requireCleanup(r){need(r?.status==='COMPLETE'&&r.physicsReferencesCleared===true&&r.controlsDetached===true&&r.zoneDisposed===true&&r.errors?.length===0&&r.resources?.length>0&&r.resources.every(x=>x.disposals===1),'actual scoped cleanup incomplete');return true;}

export function contactState(feet,ground,airborne){need(Number.isFinite(feet)&&Number.isFinite(ground)&&airborne===false&&Math.abs(feet-ground)<=.600001,'unproven walking support state');return Math.abs(feet-ground)<.0051?'DIRECT':feet<ground?'SMOOTH_ASCENT_NOT_DIRECT_CONTACT':'SHORT_DROP_NOT_DIRECT_CONTACT';}


// Pure interpretation of real ray receipts. The adapter supplies ALL current
// Environment objects and zone meshes, not a preferred subset. No geometry or
// support is manufactured here. DIRECT means measured physical AND logical
// agreement; contactState(feet,ground,airborne) above describes logic only.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const point2=a=>Array.isArray(a)&&a.length===2&&a.every(Number.isFinite);
function validateHit(h,orientation){
 need(h&&typeof h.meshUuid==='string'&&h.meshUuid.length>0&&typeof h.geometryUuid==='string'&&h.geometryUuid.length>0&&Number.isInteger(h.faceIndex)&&h.faceIndex>=0&&finite(h.point)&&finite(h.normalWorld),'invalid actual surface ray witness');
 need(h.sourceOwner==='Environment.ground'||h.sourceOwner.startsWith('Environment.objects/')||h.sourceOwner==='ZoneBase/east-six','unknown actual surface owner');
 need(orientation*h.normalWorld[1]>.5&&h.normalWorld.every(n=>Math.abs(n)<=1.000001),'surface orientation missing');
}
export function observeFootContact({feet,logicalGroundY,airborne,upwardHits,downwardHits}){
 const logicalState=contactState(feet,logicalGroundY,airborne);
 need(Array.isArray(upwardHits)&&upwardHits.length>0&&Array.isArray(downwardHits),'actual near-foot rays required');
 const origin=upwardHits[0].point,low=Math.min(feet,logicalGroundY)-.72,high=Math.max(feet,logicalGroundY)+.72;
 for(const [list,orientation] of [[upwardHits,1],[downwardHits,-1]])for(const h of list){validateHit(h,orientation);need(Math.abs(h.point[0]-origin[0])<1e-6&&Math.abs(h.point[2]-origin[2])<1e-6&&h.point[1]>=low-1e-6&&h.point[1]<=high+1e-6,'hit outside actual bounded same-foot ray');}
 const dedup=list=>{const seen=new Set();return list.filter(h=>{const k=h.meshUuid+':'+Math.round(h.point[1]*1e7);if(seen.has(k))return false;seen.add(k);return true;});};
 // Highest near-foot up-facing surface wins, even if it disagrees with CM.
 // On coplanar ties prefer the actual zone/road surface over base ground.
 const upward=dedup([...upwardHits].sort((a,b)=>b.point[1]-a.point[1]||Number(a.sourceOwner==='Environment.ground')-Number(b.sourceOwner==='Environment.ground')||a.meshUuid.localeCompare(b.meshUuid)||a.faceIndex-b.faceIndex));
 const downward=dedup([...downwardHits].sort((a,b)=>a.point[1]-b.point[1]||a.meshUuid.localeCompare(b.meshUuid)||a.faceIndex-b.faceIndex));
 const actualSurface=upward[0],footBand=[feet+.02,feet+.35],intervals=[],unclosed=[];
 for(const bottom of downward){
  const top=upward.filter(h=>h.meshUuid===bottom.meshUuid&&h.point[1]>=bottom.point[1]-1e-7).sort((a,b)=>a.point[1]-b.point[1])[0];
  if(!top){if(bottom.point[1]<footBand[1])unclosed.push({meshUuid:bottom.meshUuid,bottom:bottom.point[1],reason:'bottom boundary without top inside observed window'});continue;}
  const penetration=Math.max(0,Math.min(top.point[1],footBand[1])-Math.max(bottom.point[1],footBand[0]));
  intervals.push({meshUuid:bottom.meshUuid,sourceOwner:bottom.sourceOwner,bottom:bottom.point[1],top:top.point[1],penetration,bottomFace:bottom.faceIndex,topFace:top.faceIndex});
 }
 for(const top of upward)if(top.sourceOwner!=='Environment.ground'&&top.point[1]>footBand[0]&&top.point[1]<footBand[1]&&!intervals.some(i=>i.meshUuid===top.meshUuid&&Math.abs(i.top-top.point[1])<1e-7))unclosed.push({meshUuid:top.meshUuid,top:top.point[1],reason:'foreground top without lower boundary inside observed window'});
 const occupancyStatus=intervals.some(i=>i.penetration>1e-7)?'OCCUPIED':unclosed.length?'UNRESOLVED':'CLEAR';
 const feetToRealTriangle=feet-actualSurface.point[1],surfaceToLogicalGround=actualSurface.point[1]-logicalGroundY;
 const actualTriangleContact=logicalState==='DIRECT'&&Math.abs(feetToRealTriangle)<.02&&Math.abs(surfaceToLogicalGround)<.02&&occupancyStatus==='CLEAR';
 const state=actualTriangleContact?'DIRECT':logicalState!=='DIRECT'?logicalState:Math.abs(surfaceToLogicalGround)>=.02?'LOGICAL_PHYSICAL_SURFACE_MISMATCH':occupancyStatus==='OCCUPIED'?'FOOT_OCCUPIED_NOT_DIRECT_CONTACT':'UNRESOLVED_NOT_DIRECT_CONTACT';
 return {logicalState,contactState:state,actualSurface,feetToRealTriangle,surfaceToLogicalGround,actualTriangleContact,footOccupancy:{status:occupancyStatus,band:footBand,intervals,unclosed},upwardSurfaceCount:upward.length,downwardSurfaceCount:downward.length};
}
function requireSample(p,index){
 const s=p.support;
 need(finite(p.position)&&Number.isFinite(p.feet)&&Number.isFinite(p.logicalGroundY)&&Number.isFinite(p.verticalVelocity)&&Number.isFinite(p.speed)&&p.speed>=0&&typeof p.onSupport==='boolean'&&p.airborne===false&&p.bodyClear===true,'invalid actual movement sample');
 need(Math.abs(p.position[1]-p.feet-1.7)<1e-6&&(index===0?p.dt===null:Number.isFinite(p.dt)&&p.dt>0&&p.dt<=.1),'sample position/feet/frame time mismatch');
 need(s?.verified===true&&finite(s.point)&&Math.abs(s.point[0]-p.position[0])<1e-6&&Math.abs(s.point[2]-p.position[2])<1e-6&&Math.abs(s.point[1]-p.logicalGroundY)<.065,'real logical support evidence missing');
 const inputs=p.surfaceInputs;
 need(inputs&&Array.isArray(inputs.upwardHits)&&Array.isArray(inputs.downwardHits),'complete actual near-foot surface inputs missing');
 need(['ENVIRONMENT_TRIANGLE','ACTUAL_WALKABLE_AND_MESH_TRIANGLE'].includes(s.kind)&&typeof s.meshUuid==='string'&&typeof s.geometryUuid==='string'&&Number.isInteger(s.faceIndex)&&s.faceIndex>=0,'actual fixed-scope logical surface witness missing');
 const witness=inputs.upwardHits.find(h=>h.meshUuid===s.meshUuid&&h.geometryUuid===s.geometryUuid&&h.faceIndex===s.faceIndex&&same(h.point,s.point));
 need(witness&&(s.kind!=='ENVIRONMENT_TRIANGLE'||witness.sourceOwner==='Environment.ground'),'logical witness must be an actual recorded up-facing hit');
 if(s.kind==='ACTUAL_WALKABLE_AND_MESH_TRIANGLE')need(s.walkables?.length>0&&s.walkables.every(w=>w.tag==='east-six'&&Number.isInteger(w.index)&&Number.isInteger(w.sourceIndex)&&w.sourceIndex>=0&&same(w.primitive,w.originalPrimitive)&&w.primitive.type==='box'&&finite(w.primitive.min)&&finite(w.primitive.max)&&Math.abs(w.primitive.max[1]-p.logicalGroundY)<1e-6&&p.position[0]>=w.primitive.min[0]&&p.position[0]<=w.primitive.max[0]&&p.position[2]>=w.primitive.min[2]&&p.position[2]<=w.primitive.max[2]),'actual matched original box walkable missing');
 const observation=observeFootContact({feet:p.feet,logicalGroundY:p.logicalGroundY,airborne:p.airborne,...inputs});
 need(same(p.surfaceObservation,observation)&&p.contactState===observation.contactState&&p.actualTriangleContact===observation.actualTriangleContact&&p.feetToRealTriangle===observation.feetToRealTriangle&&p.feetAtLogicalGround===(Math.abs(p.feet-p.logicalGroundY)<.0051),'reported contact contradicts actual surface/feet');
 need(observation.logicalState!=='DIRECT'||observation.actualTriangleContact,'logical convergence beneath foreground surface is not direct contact');
 return observation;
}
function requireRoute(a){
 need(a.status==='PASS'&&a.reached===true&&a.teleports===0&&a.rescues===0&&a.initialization?.verified===true&&a.initialization.kind==='INDEPENDENT_VERIFIED_START','route not successful');
 const points=a.plan?.points;
 need(a.plan?.id===a.id&&Array.isArray(points)&&points.length>=2&&points.length<=32&&points.every(point2)&&points.every((p,i)=>!i||!same(p,points[i-1]))&&same(points[0],points.at(-1)),'finite complete returning plan required');
 need(Array.isArray(a.samples)&&a.samples.length>0&&Array.isArray(a.settlements)&&a.settlements.length===points.length-1,'every planned waypoint settlement required');
 a.samples.forEach(requireSample);
 const first=a.samples[0],init=a.initialization;
 need(same(init.position,first.position)&&init.feet===first.feet&&same(init.support,first.support)&&first.actualTriangleContact===true&&Math.hypot(first.position[0]-points[0][0],first.position[2]-points[0][1])<.18,'independent actual start mismatch');
 const marked=a.samples.map((p,index)=>({p,index})).filter(({p})=>Object.hasOwn(p,'reachedWaypoint'));
 need(marked.length===points.length-1,'all and only planned arrival markers required');
 let previousIndex=0;
 for(let i=0;i<a.settlements.length;i++){
  const s=a.settlements[i],waypoint=i+1,target=points[waypoint];
  need(s.waypoint===waypoint&&point2(s.target)&&same(s.target,target)&&finite(s.position)&&Math.hypot(s.position[0]-target[0],s.position[2]-target[1])<.18,'unique contiguous waypoint/target/actual position required');
  need(Number.isFinite(s.feet)&&Number.isFinite(s.logicalGroundY)&&Number.isFinite(s.speed)&&s.speed>=0&&s.speed<.01&&Math.abs(s.feet-s.logicalGroundY)<.0051&&s.reached===true&&s.feetAtLogicalGround===true&&s.actualTriangleContact===true,'settlement PASS contradicts numeric values');
  need(Number.isInteger(s.stableFrames)&&s.stableFrames>=6&&s.stableFrames<=120&&Array.isArray(s.stableSampleIndices)&&s.stableSampleIndices.length===s.stableFrames,'six or more stable witnessed frames required');
  need(Number.isInteger(s.sampleIndex)&&s.sampleIndex>previousIndex&&s.sampleIndex<a.samples.length&&s.stableSampleIndices.at(-1)===s.sampleIndex,'settlement sample linkage missing');
  for(let k=0;k<s.stableSampleIndices.length;k++){
   const index=s.stableSampleIndices[k];need(Number.isInteger(index)&&index>previousIndex&&index<a.samples.length&&(k===0||index===s.stableSampleIndices[k-1]+1),'unique consecutive stable frame indices required');
   const p=a.samples[index];need(p.settlingWaypoint===waypoint&&p.feetAtLogicalGround===true&&p.actualTriangleContact===true&&p.contactState==='DIRECT'&&p.speed<.01&&Math.hypot(p.position[0]-target[0],p.position[2]-target[1])<.18,'stable witness not actually settled at target');
  }
  const p=a.samples[s.sampleIndex];
  need(marked[i].index===s.sampleIndex&&marked[i].p.reachedWaypoint===waypoint&&same(s.position,p.position)&&s.feet===p.feet&&s.logicalGroundY===p.logicalGroundY&&s.speed===p.speed&&same(s.support,p.support)&&same(s.surfaceObservation,p.surfaceObservation),'arrival marker/numeric physical witness mismatch');
  previousIndex=s.sampleIndex;
 }
 need(previousIndex===a.samples.length-1&&same(a.settlements.at(-1).target,points[0]),'final actual return sample missing');
}

// R272-only interpretation of actual pre-merge source receipts. No scene imports.
// Positional seam tolerance is 2e-6m, a few local Float32 ULPs, not a design gap.
const WALL_EPS=2e-6;
const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=WALL_EPS;
const box=b=>b&&finite(b.min)&&finite(b.max)&&b.min.every((v,i)=>v<=b.max[i]);
const overlapXZ=(a,b)=>[0,2].every(i=>Math.min(a.max[i],b.max[i])-Math.max(a.min[i],b.min[i])>WALL_EPS);
const overlap3=(a,b)=>[0,1,2].every(i=>Math.min(a.max[i],b.max[i])-Math.max(a.min[i],b.min[i])>WALL_EPS);
export function requireWallEvidence(w,before){
 need(w&&before&&Array.isArray(before.owners)&&Array.isArray(before.intersections),'actual complete neighbor/intersection source receipt missing');
 for(const id of ['item/15','item/17','item/36','item/38','item/42','item/43','item/44','item/45','item/46','item/47','item/48','item/58','new-body'])need(before.owners.some(o=>o.id===id),'missing retained source '+id);
 const newSourceMeshes=before.owners.filter(o=>o.id==='new-body'||o.id==='item/58').flatMap(o=>o.meshes);
 need(Array.isArray(before.newMeshIds)&&same([...before.newMeshIds].sort(),newSourceMeshes.map(m=>m.uuid).sort()),'full new-source intersection inputs missing');
 const expectedIntersections=[];for(const o of before.owners.filter(o=>o.id!=='new-body'&&o.id!=='item/58'))for(const old of o.meshes)for(const n of newSourceMeshes){need(box(old.bounds)&&box(n.bounds),'nonfinite complete intersection inputs');if([0,1,2].every(i=>Math.min(n.bounds.max[i],old.bounds.max[i])-Math.max(n.bounds.min[i],old.bounds.min[i])>1e-5))expectedIntersections.push([n.uuid,old.uuid,o.id]);}
 const intersectionKeys=before.intersections.map(r=>[r.newMesh,r.oldMesh,r.oldOwner]);need(same(intersectionKeys.map(JSON.stringify).sort(),expectedIntersections.map(JSON.stringify).sort()),'original complete new-gate/body intersections missing or fabricated');
 const owner=id=>{const rows=before.owners.filter(o=>o.id===id);return {uuid:rows.length===1?rows[0].uuid:null,meshes:rows.flatMap(o=>o.meshes)};},wall=owner('item/43');
 for(const id of ['item/43','item/58','new-body'])need(before.owners.filter(o=>o.id===id).length===1,'duplicate scoped producer source');
 need(w.sourceUuid===wall.uuid&&w.frames?.length===8&&new Set(w.frames.map(f=>f.uuid)).size===8,'eight actual wall frames required');
 const envelope=(r,o)=>{need(box(r?.bounds)&&r.meshIds?.length>0&&typeof r.uuid==='string','actual envelope missing');const ms=o.meshes.filter(m=>m.envelope?.uuid===r.uuid);need(ms.length>0&&same([...r.meshIds].sort(),ms.map(m=>m.uuid).sort()),'incomplete source envelope mesh set');for(let axis=0;axis<3;axis++)need(close(r.bounds.min[axis],Math.min(...ms.map(m=>m.bounds.min[axis])))&&close(r.bounds.max[axis],Math.max(...ms.map(m=>m.bounds.max[axis]))),'envelope bounds not actual source union');};
 const bound=(row,o)=>{need(typeof row?.uuid==='string'&&box(row.bounds),'invalid actual mesh bounds');const m=o.meshes.find(m=>m.uuid===row.uuid);need(m&&same(m.bounds,row.bounds),'mesh witness not bound to original source');};
 for(const f of w.frames){need(box(f.bounds),'invalid wall frame');bound(f.red,wall);bound(f.brick,wall);need(f.cap?.meshIds?.length>0&&box(f.cap.bounds)&&f.cap.meshIds.every(id=>wall.meshes.some(m=>m.uuid===id)),'actual cap descendants missing');envelope(f.cap,wall);for(let axis=0;axis<3;axis++)need(close(f.bounds.min[axis],Math.min(f.red.bounds.min[axis],f.brick.bounds.min[axis],f.cap.bounds.min[axis]))&&close(f.bounds.max[axis],Math.max(f.red.bounds.max[axis],f.brick.bounds.max[axis],f.cap.bounds.max[axis])),'frame envelope not actual box/cap union');need(close(f.brick.bounds.min[1],0)&&close(f.brick.bounds.max[1],1)&&close(f.red.bounds.min[1],1),'original wall base changed');}
 const south=w.frames.filter(f=>close(f.red.bounds.min[2],465.5)&&close(f.red.bounds.max[2],466.5)).sort((a,b)=>a.red.bounds.min[0]-b.red.bounds.min[0]);
 need(south.length===5,'five actual south segments required');
 const cuts=[[-211,-145.2,6.5],[-138.8,-128.63727729556877,6.5],[-128.63727729556877,-119.1201461854728,4.5],[-113.1201461854728,-102.41388761991777,4.5],[-102.41388761991777,-74,6.5]];
 south.forEach((f,i)=>{const b=f.red.bounds;need(close(b.min[0],cuts[i][0])&&close(b.max[0],cuts[i][1])&&close(b.max[1],cuts[i][2]),'actual south segment/opening/height changed');need(close(f.cap.bounds.max[1]-b.max[1],.889)&&close(f.cap.bounds.min[0],b.min[0])&&close(f.cap.bounds.max[0],b.max[0]),'actual wall cap envelope changed');});
 need(w.frames.filter(f=>!south.includes(f)).every(f=>close(f.red.bounds.max[1],6.5)),'retained north/side wall height changed');
 const outside=w.frames.filter(f=>!south.includes(f));for(const [x0,z0,x1,z1] of [[-211,519.5,-74,520.5],[-211.5,466,-210.5,520],[-74.5,466,-73.5,520]])need(outside.filter(f=>close(f.red.bounds.min[0],x0)&&close(f.red.bounds.min[2],z0)&&close(f.red.bounds.max[0],x1)&&close(f.red.bounds.max[2],z1)).length===1,'retained north/side frame range changed');
 const low=south.filter(f=>close(f.red.bounds.max[1],4.5)),high=south.filter(f=>close(f.red.bounds.max[1],6.5));
 const g=w.gate;need(g?.flanks?.length===2&&g.roof&&box(g.roof.bounds),'actual gate body/roof missing');
 g.flanks.forEach(r=>bound(r,owner('item/58')));bound(g.header,owner('item/58'));
 need(g.roof.meshIds?.length>0&&g.roof.meshIds.every(id=>owner('item/58').meshes.some(m=>m.uuid===id)),'gate roof source links missing');envelope(g.roof,owner('item/58'));
 const flanks=[...g.flanks].sort((a,b)=>a.bounds.min[0]-b.bounds.min[0]),h=g.header.bounds;
 need(close(flanks[1].bounds.min[0]-flanks[0].bounds.max[0],3.4)&&close(h.min[1],4.6)&&close(h.max[1]-h.min[1],1.2)&&close(h.max[0]-h.min[0],3.4),'actual net opening/header changed');
 for(const f of flanks)need(close(f.bounds.min[1],0)&&close(f.bounds.max[1],5.8)&&close(f.bounds.max[2]-f.bounds.min[2],.8),'gate flank/threshold changed');
 need(low.every(f=>overlapXZ(g.roof.bounds,f.cap.bounds)&&g.roof.bounds.min[1]-f.cap.bounds.max[1]>0),'gate roof must clear each actual XZ-related low cap vertically');
 need(high.every(f=>!overlapXZ(g.roof.bounds,f.bounds)&&!overlap3(g.roof.bounds,f.bounds)),'outer high end must remain actually spatially separate');
 need(w.ends?.length===2,'both transition endpoints required');
 const area=t=>{need(t?.vertices?.length===3&&t.vertices.every(finite)&&finite(t.normal)&&typeof t.meshUuid==='string','actual end triangle missing');const [a,b,c]=t.vertices,u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);need(length>1e-12&&n.every((v,i)=>Math.abs(v/length-t.normal[i])<1e-6),'end triangle winding/normal invalid');return length/2;};
 for(const [i,[x,sign]] of [[-128.63727729556877,1],[-102.41388761991777,-1]].entries()){
  const end=w.ends[i];need(close(end.x,x),'wrong transition endpoint');
  for(const [kind,normal,height] of [['high',sign,6.5],['low',-sign,4.5]]){
   const e=end[kind],frame=w.frames.find(f=>f.uuid===e?.frameUuid);need(frame&&south.includes(frame)&&close(frame.red.bounds.max[1],height),'end not bound to actual high/low frame');
   need(e.red?.length===2&&e.cap?.length===20,'complete red face and cap gable triangles required');
   for(const [rows,ids] of [[e.red,[frame.red.uuid]],[e.cap,frame.cap.meshIds]])for(const t of rows){area(t);need(ids.includes(t.meshUuid)&&t.normal[0]*normal>.999999&&t.vertices.every(v=>close(v[0],x)),'wrong source/plane/outward end normal');}
   need(new Set(e.cap.map(t=>JSON.stringify([...t.vertices].map(v=>v.join(',')).sort()))).size===e.cap.length,'duplicate cap triangle witness');
   for(const t of e.red)for(const v of t.vertices)need((close(v[1],1)||close(v[1],height))&&(close(v[2],465.5)||close(v[2],466.5)),'red end corners not actual box face');
   need(close(e.red.reduce((s,t)=>s+area(t),0),height-1),'red end face area missing');
  }
 }
 need(w.neighborRoofs?.length>0&&w.newRoofs?.length===4,'complete real roof sets required');
 for(const id of ['item/15','item/17','item/36','item/38'])need(w.neighborRoofs.some(r=>r.owner===id),'south neighbor roof omitted');
 const expectedCovers=before.owners.filter(o=>['item/15','item/17','item/36','item/38'].includes(o.id)).flatMap(o=>o.meshes.filter(m=>m.envelope).map(m=>o.id+':'+m.envelope.uuid));
 need(same([...new Set(expectedCovers)].sort(),w.neighborRoofs.map(r=>r.owner+':'+r.uuid).sort()),'full southern roof/cap source set omitted/duplicated');
 const expectedNew=before.owners.filter(o=>['item/58','new-body'].includes(o.id)).flatMap(o=>o.meshes.filter(m=>m.envelope?.kind==='roof').map(m=>o.id+':'+m.envelope.uuid));
 need(same([...new Set(expectedNew)].sort(),w.newRoofs.map(r=>r.owner+':'+r.uuid).sort()),'full new four-roof source set omitted/duplicated');
 for(const r of [...w.neighborRoofs,...w.newRoofs]){envelope(r,owner(r.owner));need(box(r.bounds)&&r.meshIds?.length>0&&typeof r.uuid==='string','invalid actual roof envelope');need(r.meshIds.every(id=>owner(r.owner)?.meshes.some(m=>m.uuid===id)),'roof not bound to retained source');}
 for(const a of w.newRoofs)for(const b of w.neighborRoofs)need(!overlap3(a.bounds,b.bounds),'actual southern neighboring roof envelopes overlap');
 // The lowered wall/cap itself is changed geometry, not just a neighbor of the new roof.
 const lowIds=low.flatMap(f=>[f.red.uuid,f.brick.uuid,...f.cap.meshIds]),retained=before.owners.filter(o=>!['item/43','item/58','new-body'].includes(o.id));
 const checked=[];for(const id of lowIds){const a=wall.meshes.find(m=>m.uuid===id);need(a&&box(a.bounds),'lowered source mesh missing');for(const o of retained)for(const m of o.meshes){need(box(m.bounds),'retained neighbor mesh not finite');checked.push([id,m.uuid,o.id]);need(!overlap3(a.bounds,m.bounds),'lowered wall/cap overlaps retained neighbor geometry');}}
 need(w.loweredNeighborCheck&&same(w.loweredNeighborCheck.meshIds,lowIds)&&w.loweredNeighborCheck.pairs===checked.length&&w.loweredNeighborCheck.positiveOverlaps?.length===0,'complete lowered-wall neighbor comparison missing');
 need(w.bottomCapRing==='UNKNOWN_NOT_REPAIRED'&&w.visualReview==='REQUIRED','unknown/visual boundary must remain explicit');
 return true;
}
