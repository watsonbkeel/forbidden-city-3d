// Read-only QA adapter. Consume the integrator's existing production W;
// never build another world, alter registration, load a GLB, or move an NPC.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAYER} from '../../src/config/constants.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
const X=0,Z=354.1,FLOOR=2.16;
const localRoute=[[18,0],[16.7,0],[13.5,0],[10.8,0],[8,0],[8,-1.9],[4,-1.9],[0,-2.1],[0,-8],[0,-10.8],[0,-8],[0,-2.1],[-4,-1.9],[-8,-1.9],[-8,0],[-10.8,0],[-8,0],[-8,1.9],[-6,1.9],[-6,7.2],[0,7.2],[0,10.8],[0,7.2],[6,7.2],[6,1.9],[8,1.9],[8,0],[10.8,0],[13.5,0],[16.7,0],[18,0]];
export const JIAOTAI_DISPLAY_ROUTE=localRoute.map(([x,z])=>[X+x,Z+z]);
export const JIAOTAI_DISPLAY_CAMERAS=[
  {id:'south-observation',position:[0,FLOOR+PLAYER.HEIGHT,Z-2.1],target:[0,FLOOR+1.4,Z+4.1]},
  {id:'source-front-fit',position:[0,FLOOR+PLAYER.HEIGHT,Z-8.4],target:[0,FLOOR+3.0,Z+4.0],fov:90,aspect:1365/1720,diagnosticSize:[768,968]},
  {id:'south-wide',position:[0,FLOOR+PLAYER.HEIGHT,Z-5.8],target:[0,FLOOR+2.2,Z+3.5]},
  {id:'west-observation',position:[6,FLOOR+PLAYER.HEIGHT,Z+3],target:[0,FLOOR+1.2,Z+3.5]},
  {id:'east-observation',position:[-6,FLOOR+PLAYER.HEIGHT,Z+3],target:[0,FLOOR+1.2,Z+3.5]},
  {id:'north-circulation',position:[0,FLOOR+PLAYER.HEIGHT,Z+7.2],target:[4,FLOOR+1,Z+3.5]},
];
const close=(a,b,tol=1e-6)=>Math.abs(a-b)<tol;
export function assertJiaotaiDisplayInWorld(W,{teleport=null,registry=null}={}) {
  assert.ok(W.scene&&W.cm,'Pass the existing scene and CollisionManager');
  const records=[];W.scene.updateMatrixWorld(true);W.scene.traverse(o=>records.push(...(o.userData.architecture??[]).filter(r=>r.id==='jiaotaidian')));
  assert.equal(records.length,1);const hall=records[0],p=hall.displaySetting;
  assert.equal(p?.id,'jiaotai-display-setting-r54');assert.equal(hall.floorY,FLOOR);
  const colliders=p.colliders.map(expected=>{
    const matches=W.cm.colliders.filter(c=>['min','max'].every(side=>expected[side].every((v,i)=>close((c.box??c)[side].getComponent(i),v))));
    assert.equal(matches.length,1,expected.owner+' exact current-world collider');return{owner:expected.owner,matches:matches.length};
  });
  for(const expected of p.walkables){const matches=W.cm.walkables.filter(w=>w.type==='box'&&w.rescue===false&&['min','max'].every(side=>expected[side].every((v,i)=>close(w.box[side].getComponent(i),v))));assert.equal(matches.length,1,'visible low base gets one non-rescue support');}
  // No tall phantom remains across the former dais footprint.
  assert.equal(W.cm.colliders.some(c=>{const b=c.box??c;return close(b.min.x,-2.28)&&close(b.max.x,2.28)&&close(b.min.z,354)&&close(b.max.z,360.5)&&close(b.max.y,5.16);}),false);
  const cameras=JIAOTAI_DISPLAY_CAMERAS.map(c=>{const blocked=W.cm.checkCollision(new THREE.Vector3(...c.position),.5);assert.equal(blocked,false,c.id+' must be a legal human-radius camera');return{...c,blocked};});
  // Keep the inherited movement datum (2.16). The retained visible floor is
  // 3 cm higher at 2.19; this is not an exact visible-surface equality claim.
  const supports=cameras.map(c=>{const ground=W.cm.getGroundHeight(c.position[0],c.position[2],FLOOR,.03);assert.ok(close(ground,FLOOR));return{id:c.id,ground};});
  const newMeshes=[];W.scene.traverse(m=>{if(m.isMesh&&m.material?.name?.startsWith('r54-jiaotai-'))newMeshes.push(m);});assert.equal(new Set(newMeshes.map(m=>m.material.name)).size,7);
  const ray=new THREE.Raycaster(new THREE.Vector3(0,10,Z+1.7),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(newMeshes,false)[0];
  assert.ok(hit,'actual new platform triangles under feet');const platformGround=W.cm.getGroundHeight(0,Z+1.7,FLOOR,.6);assert.ok(Math.abs(hit.point.y-platformGround)<.001,'physical support differs from visible surface by less than 1 mm');
  // All four modeled door apertures are still physically open. Continuous
  // route checks below avoid the clock and clepsydra instead of shrinking them.
  for(const portal of hall.portals)assert.equal(W.cm.checkCollision(new THREE.Vector3(portal.center[0],FLOOR+PLAYER.HEIGHT,portal.center[1]),.5),false,portal.side);
  let landing=null;if(teleport){landing=teleport.resolveLanding('交泰殿');assert.equal(landing.fallback,false);assert.ok(close(landing.x,0)&&close(landing.z,336.6));assert.ok(close(landing.y,2));}
  if(registry)assert.equal(registry.actors.filter(a=>a.sceneRef==='jiaotai').length,0,'this display correction does not add or silently delete Jiaotai actors');
  return{scope:'B_PROCEDURAL_AND_MERGED_ONLY; NO_REGISTERED_JIAOTAI_S_GLB; NO_GPU_OR_PHOTO_MATCH_CLAIM',colliders,walkables:p.walkables,cameras,supports,platform:{visibleY:hit.point.y,supportY:platformGround},landing,
    triangles:newMeshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),materials:[...new Set(newMeshes.map(m=>m.material.name))].sort(),observation:p.observation};
}
export function replayJiaotaiDisplayRoute(t,W,options={}) {
  const trace=traceTerraceGround(W.cm,{flights:[]});let r;
  try {r=replayTerrace(t,W,JIAOTAI_DISPLAY_ROUTE,{...options,recordFrames:true});}
  finally {trace.restore();}
  assert.equal(r.arrived,true,JSON.stringify({options,stuckAt:r.stuckAt,end:r.end}));
  assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=FLOOR&&r.maxFeet<FLOOR+.03);
  assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);
  for(const f of r.frames)assert.equal(W.cm.checkCollision(new THREE.Vector3(f.x,f.ground+PLAYER.HEIGHT,f.z),.5),false,'continuous route body clear');
  return{...options,arrived:r.arrived,startFeet:r.startFeet,end:r.end,maxFeet:r.maxFeet,frames:r.frames.length,crossings:r.driver.crossings.length,expectedCrossings:JIAOTAI_DISPLAY_ROUTE.length-1};
}
