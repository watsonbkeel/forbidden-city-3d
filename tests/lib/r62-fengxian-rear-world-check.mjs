// Consumer only: requires the owner's already-built W; no world construction,
// loader, model substitution, collider edits or runtime acceptance claim.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace} from './terrace-walk.mjs';
const X=-182.5,Z=283.4,W=51.6,D=20,BAY=W/9,R=.34;
const close=(a,b)=>Math.abs(a-b)<1e-5;
const point=(x,y,z)=>new THREE.Vector3(X+x,y,Z+z);
export const FENGXIAN_REAR_VIEWS=[
 {name:'south',eye:[0,4,-64],target:[0,5.3,0],fov:48},
 {name:'north',eye:[0,4,64],target:[0,5.3,0],fov:48},
 {name:'east-oblique',eye:[-55,7,-44],target:[0,5,0],fov:48},
];
export function assertFengxianRearInWorld(world){
 assert.ok(world.scene&&world.cm,'Supply the existing W.scene and W.cm');world.scene.updateMatrixWorld(true);
 const records=[];world.scene.traverse(o=>{for(const r of[o.userData.structure,...(o.userData.architecture??[])])if(r?.id==='east-six/fengxian-rear')records.push(r);});
 assert.equal(records.length,1,'one exact production profile');const g=records[0];
 assert.equal(g.objectId,'AUX-BF1091B523A8');assert.equal(g.bays,9);assert.equal(g.eaveCount,1);assert.equal(g.accepted,false);assert.match(g.interiorStatus,/UNVERIFIED|WITHHELD/,'independent inventory cleanup must not imply a restored interior');
 const ray=(p,d,far=2)=>new THREE.Raycaster(point(...p),new THREE.Vector3(...d),0,far).intersectObject(world.scene,true);
 const collider=(min,max)=>world.cm.colliders.filter(c=>min.every((v,i)=>close(v,c.box.min.getComponent(i)))&&max.every((v,i)=>close(v,c.box.max.getComponent(i))));
 const columns=[];
 for(let i=0;i<=9;i++)for(const side of[-1,1]){
  const x=-W/2+i*BAY,z=side*D/2,h=ray([x,4.6,z+side*.8],[0,0,-side]);
  assert.ok(h.length,`missing actual column at ${x},${z}`);assert.match(solidMaterialNameAt(h[0].object,h[0].faceIndex),/^wood_column/);
  assert.equal(collider([X+x-R,.9,Z+z-R],[X+x+R,3.9,Z+z+R]).length,1,'matching column collision box');columns.push([x,z]);
 }
 for(let i=0;i<9;i++)if(i!==4){const x=-W/2+(i+.5)*BAY,h=ray([x,3.6,-10.8],[0,0,1]);assert.ok(h.length);assert.match(solidMaterialNameAt(h[0].object,h[0].faceIndex),/^lattice_doors/);assert.equal(collider([X+x-BAY/2,.9,Z-10.25],[X+x+BAY/2,3.9,Z-9.75]).length,1);assert.equal(world.cm.checkCollision(point(x,2.6,-10),.5),true);}
 assert.equal(ray([0,2.8,-10.7],[0,0,1],1.4).length,0,'normal center entrance remains open');assert.equal(world.cm.checkCollision(point(0,2.6,-10),.5),false);
 const ramps=world.cm.walkables.filter(w=>w.type==='ramp'&&close(w.minX,X-2.3)&&close(w.maxX,X+2.3)&&close(w.a0,Z-11)&&close(w.a1,Z-12.44));assert.equal(ramps.length,1);assert.equal(ramps[0].y0,.9);assert.equal(ramps[0].y1,0);
 const treadChecks=[];for(let k=0;k<6;k++){const z=-11-(k+.5)*.24,y=.9-(k+1)*.9/7,h=ray([0,y+.02,z],[0,-1,0],.04);assert.ok(h.length);assert.ok(close(h[0].point.y,y));treadChecks.push({z,meshTop:y,rampY:world.cm.getGroundHeight(X,Z+z,1)});}
 return {scope:'EXISTING_WORLD_ACTUAL_TRIANGLES_COLLIDERS_AND_SUPPORT_NOT_BROWSER',objectId:g.objectId,columns:columns.length,closedPanels:8,treadChecks,rampApproximation:'Retained sloped proxy, not exact per-tread support',accepted:false};
}
export function replayFengxianRearInWorld(t,world,{fps=60}={}){
 // The isolated -15m south start lies inside the retained FRONT hall in the
 // actual compound. Follow the existing west-side ground corridor instead;
 // the1.21m gap between front plinth and rear stair is real retained geometry.
 const go=[[X-29,232],[X-29,Z-13],[X,Z-13],[X,Z-12],[X,Z-10.6],[X,Z-7]],r=replayTerrace(t,{...world,THREE:world.THREE??THREE},[...go,...go.slice(0,-1).reverse()],{fps,recordFrames:true});
 assert.equal(r.arrived,true,JSON.stringify({stuckAt:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=.9);assert.ok(Math.abs(r.end[2])<.01);for(const p of r.frames)assert.equal(world.cm.checkCollision(new THREE.Vector3(p.x,p.ground+1.7,p.z),.5),false);
 return r;
}
