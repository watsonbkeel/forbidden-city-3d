// Pure consumer of an EXISTING world or actual merged component fixture.
// No world builder, collider registration, source patch, or replacement geometry.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {PLAYER} from '../../src/config/constants.js';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
const item={gateProfile:'xiehe',x:-106.47,z:-300.3,rot:'east'};
export const xieheGeometry=()=>sideGateGeometry(item);
const world=(g,p)=>{const [x,z]=g.toWorld(p[0],p[2]);return new THREE.Vector3(x,p[1],z);};
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const ray=(W,g,p,d,far)=>new THREE.Raycaster(world(g,p),new THREE.Vector3(...d).applyAxisAngle(new THREE.Vector3(0,1,0),g.rot),0,far).intersectObject(W.scene,true).filter(h=>visible(h.object));
function requireW(W){assert.ok(W?.scene&&W.cm?.getGroundHeight&&W.cm?.checkCollision,'Supply existing merged scene and real CollisionManager');W.scene.updateMatrixWorld(true);}
export function assertXieheCourtyardKneesInWorld(W){
 requireW(W);const g=xieheGeometry(),records=[];
 W.scene.traverse(o=>{for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r?.profile==='xiehe')records.push(r);});
 assert.equal(records.length,1);assert.equal(records[0].portalCount,3);
 const probes=[];
 for(const bay of [1,2,3])for(const direction of [1,-1]){
  const x=g.columnXs[direction===1?bay:bay+1]+direction*.9,z=g.depth/2+3;
  const [wx,wz]=g.toWorld(x,z),feet=W.cm.getGroundHeight(wx,wz,g.platformY),origin=[x,feet+PLAYER.HEIGHT,z],target=[x,g.platformY+g.columnH-.65-.22,g.depth/2+.08];
  assert.equal(W.cm.checkCollision(world(g,origin),.5),false,'legal ground-supported observer');
  const delta=new THREE.Vector3(...target).sub(new THREE.Vector3(...origin)),hit=ray(W,g,origin,delta.clone().normalize().toArray(),delta.length()+.02)[0];
  assert.ok(hit,'own courtyard knee survives production merge');assert.ok(hit.point.distanceTo(world(g,target))<.025);assert.match(solidMaterialNameAt(hit.object,hit.faceIndex),/caihua_beam/);
  probes.push({bay,direction,eye:world(g,origin).toArray(),target:world(g,target).toArray(),hit:hit.point.toArray()});
 }
 for(const p of g.portals)for(const dx of [-.8,0,.8])assert.equal(ray(W,g,[p.centerX+dx,g.platformY+PLAYER.HEIGHT,-g.depth/2-1],[0,0,1],g.depth+2).length,0,'three open head routes');
 return {objectId:'FC-9E59B14A3C',scope:'ACTUAL_MERGED_TRIANGLES_NOT_BROWSER_ACCEPTANCE',probes,routeHeadRays:9,lowestKneeY:g.platformY+g.columnH-.65-.56,theoreticalJumpHead:g.platformY+PLAYER.HEIGHT+PLAYER.JUMP_VELOCITY**2/(2*PLAYER.GRAVITY)};
}

/** Actual controller jumps under each of the six knees, on existing support. */
export function replayXieheCourtyardJumps(t,W,{fps=60}={}){
 requireW(W);const g=xieheGeometry(),oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};
 const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),rows=[];
 try{for(const bay of [1,2,3])for(const direction of [1,-1]){
  const x=g.columnXs[direction===1?bay:bay+1]+direction*.9,z=g.depth/2,[wx,wz]=g.toWorld(x,z),feet=W.cm.getGroundHeight(wx,wz,g.platformY);
  assert.ok(Math.abs(feet-g.platformY)<1e-8);const camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
  try{controls.controls.isLocked=true;controls.setPosition(wx,feet+PLAYER.HEIGHT,wz);controls.jump();let maxHead=-Infinity,minHeadClearance=Infinity,samples=0;
   for(let frame=0;frame<fps*2;frame++){now+=1000/fps;controls.update();const head=controls.feetY+PLAYER.HEIGHT;maxHead=Math.max(maxHead,head);
    assert.equal(W.cm.checkCollision(new THREE.Vector3(wx,head,wz),.5),false);
    const hits=new THREE.Raycaster(new THREE.Vector3(wx,head,wz),new THREE.Vector3(0,1,0),0,10).intersectObject(W.scene,true).filter(h=>visible(h.object));
    assert.ok(hits.length,'actual overhead geometry, not a proxy');minHeadClearance=Math.min(minHeadClearance,hits[0].distance);samples++;
   }
   assert.ok(maxHead>feet+PLAYER.HEIGHT+1.4);assert.ok(Math.abs(controls.feetY-feet)<1e-8);assert.ok(minHeadClearance>1.3,'jump envelope safely below even the low knee');
   rows.push({bay,direction,fps,samples,maxHead,minHeadClearance,landedFeet:controls.feetY});
  }finally{controls.dispose();}
 }}finally{clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
 return{scope:'ACTUAL_CONTROLLER_AND_TRIANGLE_CLEARANCE_NOT_BROWSER_ACCEPTANCE',rows};
}
