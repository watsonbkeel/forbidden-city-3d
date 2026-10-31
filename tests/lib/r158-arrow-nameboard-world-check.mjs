// Read-only consumer of the current merged production W; no rebuild or allocation
// of graphics resources. Rays inspect actual former-label space, not metadata.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {assertArrowSouthDoorLatticeInWorld} from './r158-arrow-south-lattice-world-check.mjs';
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
export function assertArrowCentralNameboardRemovedInWorld(W){
 assert.ok(W?.scene?.traverse&&W.cm?.getGroundHeight,'Supply already-built W.scene and real W.cm');W.scene.updateWorldMatrix(true,true);
 let rayChecks=0;for(const x of[-.4,0,.4])for(const y of[6.2,7,7.7]){
  const hits=new THREE.Raycaster(new THREE.Vector3(-154.7+x,y,78.8-10),new THREE.Vector3(0,0,1),0,1.4).intersectObject(W.scene,true).filter(h=>visible(h.object));
  assert.equal(hits.length,0,'unsupported centre nameboard region is actually empty after merge');rayChecks++;
 }
 const retained=assertArrowSouthDoorLatticeInWorld(W);
 return{entityId:'FC-AF36D75128',scope:'ACTUAL FORMER CENTRAL LABEL VOLUME; PHOTOGRAPHED STATE ONLY',rayChecks,retainedLatticeTriangles:retained.triangles,retainedInfillTriangles:retained.infillTriangles,retainedKneeTriangles:retained.retainedKneeTriangles,browserAcceptance:false,wholeObjectAccepted:false,visualAcceptance:'VERIFY_PENDING'};
}
