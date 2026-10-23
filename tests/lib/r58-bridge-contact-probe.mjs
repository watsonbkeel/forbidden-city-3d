// Local fixture/probe only: real controls, original player dimensions, original river guard.
import * as THREE from 'three';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildInnerJinshui} from '../../src/scene/palace/special/InnerJinshui.js';
import {buildInnerJinshuiSideFinials} from '../../src/scene/palace/special/InnerJinshuiSideFinials.js';
import {JINSHUI_BRIDGES} from '../../src/scene/palace/river.js';
const mat=new THREE.MeshStandardMaterial(),library={material:()=>mat,tileSize:()=>2};
export function finialFixture(){const r=buildInnerJinshui(library,{position:{x:0,z:-310.8},bridges:JINSHUI_BRIDGES},mat),g=buildInnerJinshuiSideFinials(library,r.profile),scene=new THREE.Group(),cm=new CollisionManager();scene.add(r.group,g);scene.updateMatrixWorld(true);cm.addColliders(r.colliders);cm.addWalkables(r.walkables);return{r,g,scene,cm};}
export function replayFinialJump(t,W,p,fps,{walkAlongRail=false}={}){
 const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera(),c=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm),frames=[];
 c.controls.isLocked=true;const startZ=p.z+(walkAlongRail?.5:0);c.setPosition(p.x-p.side*1.5,p.y-1.17+PLAYER.HEIGHT,startZ);camera.lookAt(p.x,camera.position.y,startZ);camera.updateMatrixWorld(true);c.jump();
 try{for(let i=0;i<fps*4;i++){c.moveForward=i<Math.round(fps*.3);now+=1000/fps;c.update();frames.push({time:now/1000,x:camera.position.x-c.bobOffset.x,z:camera.position.z-c.bobOffset.z,feet:c.feetY,ground:c.groundY,airborne:c.airborne,verticalVelocity:c.verticalVelocity,onSupport:c.onSupport});}
  if(walkAlongRail){
   camera.position.sub(c.bobOffset);camera.lookAt(camera.position.x,camera.position.y,p.z);camera.position.add(c.bobOffset);camera.updateMatrixWorld(true);
   for(let i=0;i<fps*3;i++){c.moveForward=i<Math.round(fps*.1);now+=1000/fps;c.update();frames.push({time:now/1000,x:camera.position.x-c.bobOffset.x,z:camera.position.z-c.bobOffset.z,feet:c.feetY,ground:c.groundY,airborne:c.airborne,verticalVelocity:c.verticalVelocity,onSupport:c.onSupport,phase:'walk-from-retained-rail'});}
  }
  const end=frames.at(-1),hits=new THREE.Raycaster(new THREE.Vector3(end.x,4,end.z),new THREE.Vector3(0,-1,0),0,5).intersectObject(W.g,true);
  return{fps,post:p,frames,end,actualCapSurfaceY:hits[0]?.point.y??null,penetration:hits[0]?hits[0].point.y-end.feet:null};
 }finally{c.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
}
