// Read-only consumer of an already-built, matrix-updated W. No world build,
// source edits, geometry insertion, collision registration or browser claims.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {pavilionGeometry} from '../../src/scene/palace/special/PavilionProfiles.js';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
const hongyiItem={pavilionProfile:'hongyi',x:102.1,z:-110.4,rot:'east',enter:true};
export function assertHongyiLeavesInWorld(W,item=hongyiItem){
 assert.ok(W.scene&&W.cm,'existing scene and collision manager required');
 const g=pavilionGeometry(item),lo=g.lower,found=[];W.scene.traverse(o=>{for(const r of [o.userData.structure,o.userData.pavilion,...(o.userData.architecture??[])])if(r?.profile==='hongyi')found.push(r);});
 assert.equal(found.length,1,'one actual Hongyi assembly required');assert.equal(found[0].openings.upperFrontLeaves,28);
 const point=(x,y,z)=>{const [wx,wz]=g.toWorld(x,z);return new THREE.Vector3(wx,y,wz);};
 const forward=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),g.rot);
 const ray=(x,y,z,far)=>new THREE.Raycaster(point(x,y,z),forward,0,far).intersectObject(W.scene,true);
 const probes=[];
 for(const bay of [1,2,3,5,6,7]){
  const cx=(lo.columnXs[bay]+lo.columnXs[bay+1])/2;
  assert.equal(W.cm.checkCollision(point(cx,lo.floorY+1.7,lo.front),.5),true,'original lower window collision remains blocking');
  for(const side of [-1,1]){
   const x=cx+side*.08,z=lo.front-2,[wx,wz]=g.toWorld(x,z),feet=W.cm.getGroundHeight(wx,wz,g.platform.y),eye=[x,feet+1.7,z];
   assert.ok(Math.abs(feet-g.platform.y)<1e-6,'terrace supports the eye at its original height');
   assert.equal(W.cm.checkCollision(point(...eye),.5),false,'supported terrace eye remains collision-free');
   const hit=ray(...eye,2.1)[0];assert.ok(hit,'each real meeting stile must be visible');
   assert.ok(Math.abs(hit.distance-1.9)<.002,'each real meeting stile must replace the former thin center bar');
   assert.match(solidMaterialNameAt(hit.object,hit.faceIndex),/wood_column/);probes.push({bay,side,eye,hit:hit.point.toArray()});
  }
 }
 for(const x of [-1,0,1]){assert.equal(ray(x,lo.floorY+1.7,lo.front-1,3).length,0,'original central doorway rendered head aperture stays open');assert.equal(W.cm.checkCollision(point(x,lo.floorY+1.7,lo.front),.5),false,'original central doorway body aperture stays open');}
 return{scope:'ACTUAL_MERGED_TRIANGLES_NOT_BROWSER_ACCEPTANCE',objectId:'FC-A43B1DAB0B',probes,windowCollisionProbes:6,doorHeadRays:3};
}
