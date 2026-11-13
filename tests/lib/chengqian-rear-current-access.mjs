import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PLAYER} from '../../src/config/constants.js';
import {FACE} from '../../src/scene/palace/kit.js';
import {cloneFurnitureMotionScope} from '../../src/controls/FurnitureMotion.js';
import {withTerrainController} from './r91-controller-clock.mjs';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
import {hallGeom,walkStraight} from './world.mjs';

const expected=JSON.parse(fs.readFileSync(new URL('../r368-chengqian-rear-access/source-contract.json',import.meta.url)));
const bounds=b=>[...b.min.toArray(),...b.max.toArray()];
const key=w=>JSON.stringify([w.type,...bounds(w.box)]);
const registeredSources=new WeakMap(),constructionSources=new WeakMap();
/** Capture two original frame transforms before real finish releases construction
 * branches. Keep no mesh/geometry reference and do not alter production cleanup. */
export function captureChengqianRearSource(kit){
 if(kit.root.name!=='east-six')return;
 kit.root.updateWorldMatrix(true,true);
 const rows=expected.rooms.map(e=>{
  const id=`east-six/chengqian-rear-${e.item.rearWing}`,frames=[];
  kit.root.traverse(o=>{if(o.userData.structure?.id===id)frames.push(o);});
  assert.equal(frames.length,1,'unique original prefinish room frame');
  assert.equal(frames[0].parent,kit.root,'original source frame parent');
  return{id,matrix:frames[0].matrixWorld.clone(),record:structuredClone(frames[0].userData.structure)};
 });
 assert.ok(!constructionSources.has(kit),'original source captured once');constructionSources.set(kit,rows);
}
/** Immediately after original CM registration. Retain actual source identity,
 * not a later match against a copied height/tag. No production data is changed. */
export function recordChengqianRearWalkables(cm,sources,tag,start){
 if(tag!=='east-six')return;
 const wanted=new Set(expected.rooms.flatMap(r=>r.walkables.map(w=>JSON.stringify([w.type,...w.bounds]))));
 const registered=cm.walkables.slice(start);
 for(const source of sources.filter(w=>w.type==='box'&&wanted.has(key(w)))){
  const matches=registered.filter(w=>w.tag===tag&&w.type==='box'&&key(w)===key(source));
  assert.equal(matches.length,1,'unique original rear support registration');
  assert.ok(!registeredSources.has(matches[0]),'rear support registered twice');
  registeredSources.set(matches[0],{source,key:key(source),tag});
 }
}

/** Source-bound QA adapter for the two existing canonical rooms only. This is
 * physical source provenance, not a continuous rendered-mesh tamper oracle.
 * The caller supplies the complete CM; no owner or dynamic body is filtered. */
export function bindChengqianRearSource(W){
 const zones=W.zones.map(z=>z.json??z).filter(z=>z.id==='east-six');assert.equal(zones.length,1,'unique canonical east-six');
 const finished=W.finishedZones?.filter(z=>z.id==='east-six');assert.equal(finished?.length,1,'one actual finished zone');
 const f=finished[0],kit=f.builder.kit;assert.equal(f.builder.zoneJson,zones[0],'original canonical builder zone');
 assert.equal(f.group,f.builder.group,'original finished builder group');assert.equal(f.group,f.data.group,'original finished data group');assert.equal(f.group.visible,true,'visible finished group');
 assert.deepEqual(f.group.position.toArray(),[0,0,0]);assert.deepEqual(f.group.quaternion.toArray(),[0,0,0,1]);assert.deepEqual(f.group.scale.toArray(),[1,1,1]);
 assert.ok(W.environmentScene,'actual Environment scene required');
 const ground=(x,z)=>{W.environmentScene.updateMatrixWorld(true);const h=new W.THREE.Raycaster(new W.THREE.Vector3(x,.05,z),new W.THREE.Vector3(0,-1,0),0,.1).intersectObject(W.environmentScene,true)[0];assert.ok(h?.object.userData.environmentGroundSource===true&&Math.abs(h.point.y)<1e-10,'actual zero-ground witness');};
 const rooms=expected.rooms.map(e=>{
  const item=zones[0].items[e.index];assert.deepEqual(item,e.item,'complete original canonical room identity');
  const id=`chengqian-rear-${item.rearWing}`,structureId=`east-six/${id}`;
  const frames=constructionSources.get(kit)?.filter(r=>r.id===structureId);assert.equal(frames?.length,1,'actual prefinish source witness required');
  const frame=frames[0];
  const canonical=new W.THREE.Matrix4().compose(new W.THREE.Vector3(item.x,0,item.z),new W.THREE.Quaternion().setFromAxisAngle(new W.THREE.Vector3(0,1,0),FACE[item.rot]),new W.THREE.Vector3(1,1,1));
  assert.deepEqual(frame.matrix.elements,canonical.elements,'actual source transform equals canonical transform');
  const records=f.group.userData.architecture.filter(r=>r.id===structureId);assert.equal(records.length,1,'unique actual finished room metadata');assert.deepEqual(records[0],frame.record,'finished metadata derives from actual source');
  assert.equal(records[0].finishedPlatformY,Math.fround(.47));assert.equal(records[0].rearWing,item.rearWing);
  const owned=W.cm.colliders.filter(c=>W.ownerOf(c)?.zone==='east-six'&&W.ownerOf(c)?.item===item);assert.equal(owned.length,27,'complete original room sources');assert.equal(new Set(owned.map(c=>c.mesh)).size,27,'unique original room sources');
  for(const [i,c]of owned.entries()){
   assert.equal(c.tag,'east-six');assert.equal(kit.colliders.filter(v=>v===c.mesh).length,1,'original kit collider');assert.equal(f.data.colliders.filter(v=>v===c.mesh).length,1,'original finished collider');assert.equal(W.cm.colliders.filter(v=>v.mesh===c.mesh).length,1,'unique original registered collider');
   assert.deepEqual(bounds(c.mesh),e.colliders[i].bounds,'unchanged actual source bounds');assert.deepEqual(bounds(c.box),e.colliders[i].bounds,'unchanged registered bounds');assert.deepEqual(c.mesh.chengqianRearSource??null,e.colliders[i].source,'actual source identity');assert.deepEqual(c.mesh.furnitureMotionScope??null,e.colliders[i].scope,'actual source scope');
   assert.deepEqual(c.furnitureMotionScope??null,cloneFurnitureMotionScope(c.mesh.furnitureMotionScope,c.mesh),'actual registered scope');assert.ok(!c.triangleSupport&&!c.xiqingRoofSurface&&!c.overhead,'original ordinary solid source');
  }
  const walkables=e.walkables.map(d=>{
   const k=JSON.stringify([d.type,...d.bounds]),source=kit.walkables.filter(w=>w.type==='box'&&key(w)===k);assert.equal(source.length,1,'unique actual source support');assert.equal(f.data.walkables.filter(v=>v===source[0]).length,1,'original finished support');
   const r=W.cm.walkables.filter(w=>registeredSources.get(w)?.source===source[0]);assert.equal(r.length,1,'original registered support identity required');const proof=registeredSources.get(r[0]);assert.equal(proof.key,k);assert.equal(key(r[0]),k,'actual registered support bounds');assert.equal(r[0].tag,proof.tag);assert.equal(r[0].rescue,true);assert.equal(W.cm.walkables.filter(w=>w.type==='box'&&w.tag==='east-six'&&key(w)===k).length,1,'unique registered support');return r[0];
  });
  const transform=frame.matrix.clone(),world=(x,y,z)=>new W.THREE.Vector3(x,y,z).applyMatrix4(transform);
  const start=world(0,0,-4.8);ground(start.x,start.z);
  // These route stations are finite local landmarks tied to the exact actual
  // step/slab/threshold contract above, not nominal ph or an invented ramp.
  return{item,index:e.index,id,owned,walkables,transform,world};
 });
 return{rooms,ground,scope:'ORIGINAL_CALLER_CM_COMPLETE_PAIR_SOURCE_BOUND_NATIVE_NOT_FULL_RENDER_VOLUME_ORACLE'};
}

function nativeRun(W,bound,room,fps){
 const points=[-4.8,-3.6,-2.89,-2.61,-2.2,-1,0,-1,-2.2,-2.61,-2.89,-3.6,-4.8].map(z=>{const p=room.world(0,0,z);return[p.x,p.z];});
 const r={fps,points,arrived:false,crossings:0,maxFeet:0,strictOverlapFrames:0,overlapScope:'ALL_REGISTERED_ORDINARY_AABBS_EXCLUDES_TRIANGLE_AND_XIQING_SURFACES'};
 try{withTerrainController(W.cm,(c,cam,tick)=>{
  bound.ground(...points[0]);c.setPosition(points[0][0],PLAYER.HEIGHT,points[0][1]);assert.equal(c.feetY,0);assert.equal(c.airborne,false);assert.equal(W.cm.checkCollision(cam.position,.5),false,'legal native ground start');
  const driver=createPhysicalWaypointDriver(points),pos=()=>[cam.position.x-c.bobOffset.x,cam.position.z-c.bobOffset.z];c.moveForward=true;let stagnant=0;
  for(let frame=0;frame<fps*25&&!driver.complete;frame++){
   const a=pos(),cmd=driver.command(a,false);cam.position.sub(c.bobOffset);cam.lookAt(cmd.target[0],cam.position.y,cmd.target[1]);cam.position.add(c.bobOffset);cam.updateMatrixWorld(true);tick(fps);const b=pos();driver.observe(a,b);assert.ok([...b,c.feetY,c.groundY].every(Number.isFinite),'finite native state');r.maxFeet=Math.max(r.maxFeet,c.feetY);
   const body=new W.THREE.Box3(new W.THREE.Vector3(b[0]-.5,c.feetY,b[1]-.5),new W.THREE.Vector3(b[0]+.5,c.feetY+PLAYER.HEIGHT,b[1]+.5));
   const hits=W.cm.colliders.filter(v=>!v.xiqingRoofSurface&&!v.triangleSupport&&['x','y','z'].every(k=>Math.min(body.max[k],v.box.max[k])>Math.max(body.min[k],v.box.min[k])));
   if(hits.length){r.strictOverlapFrames++;r.firstOverlap??={frame,position:b,feet:c.feetY,sources:hits.map(v=>({owner:W.ownerOf(v)?.item?.name??null,source:v.mesh.chengqianRearSource??null,bounds:bounds(v.box)}))};}
   stagnant=Math.hypot(b[0]-a[0],b[1]-a[1])<1e-8?stagnant+1:0;if(stagnant>fps)break;
  }
  r.arrived=driver.complete;r.crossings=driver.diagnostics.crossings.length;r.end=pos();c.moveForward=false;for(let n=0;n<fps*2;n++)tick(fps);r.endFeet=c.feetY;r.endAirborne=c.airborne;
  assert.equal(r.arrived,true,'continuous native entry/return blocked');assert.equal(r.crossings,12);assert.equal(r.strictOverlapFrames,0,'strict positive-volume ordinary source overlap');assert.equal(r.maxFeet,room.owned.find(v=>v.mesh.chengqianRearSource?.id===room.id+'-threshold').box.max.y);assert.equal(r.endFeet,0);assert.equal(r.endAirborne,false);bound.ground(...r.end);
 });}catch(e){r.error=e.message;}return r;
}
export function checkChengqianRearAccess(W){
 const bound=bindChengqianRearSource(W),result={scope:bound.scope,rooms:[],faults:[]};
 for(const room of bound.rooms){
  const g=hallGeom(room.item),legacy=walkStraight(W,g.toW(g.doorX,-(g.PD/2+g.run+2)),g.toW(g.doorX,-(g.d/2-1)));
  const row={id:room.id,index:room.index,legacy,legacyContract:'ORIGINAL_FIVE_ARGUMENT_QA_OBSERVATION_NOT_NATIVE_ACCEPTANCE',runs:[10,30,60].map(fps=>nativeRun(W,bound,room,fps)),faults:[]};
  for(const r of row.runs)if(r.error)row.faults.push(`${r.fps}Hz ${r.error}`);
  for(const x of[-room.item.w/3,room.item.w/3]){const p=room.world(x,Math.fround(.47)+PLAYER.HEIGHT,-2.2);if(!W.cm.checkCollision(p,.5))row.faults.push('original closed side-window missing');}
  result.rooms.push(row);result.faults.push(...row.faults.map(e=>room.id+' '+e));
 }return result;
}
