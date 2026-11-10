import * as THREE from 'three';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';

// As in the original R66 contract, masonry penetration excludes the one
// visible step surface. At its edge the player toe may intersect a riser below
// STEP_UP while the center stands on ground; this is not head/wall penetration.
// The exact step mesh and its nonrescue top are independently required above.
// Consumes an already-built scene and real CollisionManager. Never registers
// physics or substitutes reconstructed curve triangles for rendered geometry.
export function captureYinghuaMasonry(root,cm){root.updateMatrixWorld(true);const triangles=[];let excluded=0;root.traverse(m=>{if(!m.isMesh||!m.visible)return;if(m.userData.shanmenStone){const box=new THREE.Box3().setFromObject(m);if(++excluded!==1||box.min.y< -1e-8||box.max.y>.10000001||box.max.y<.09999999||m.name!=='yinghua-shanmen/low-visible-threshold'||!cm.colliders.some(c=>c.mesh?.shanmenMesh===m.uuid&&!c.triangleSupport&&c.box.min.equals(box.min)&&c.box.max.equals(box.max))||!cm.walkables.some(w=>w.type==='box'&&w.box.min.x===box.min.x&&w.box.max.x===box.max.x&&w.box.min.z===box.min.z&&w.box.max.z===box.max.z&&w.box.max.y===box.max.y&&w.rescue===false))throw Error('Only the exact low step with registered visible top is excluded from masonry penetration');return;}const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const t=new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?.getX(i+k)??i+k).applyMatrix4(m.matrixWorld)));if(t.getArea()>1e-12)triangles.push(t);}});if(excluded!==1)throw Error('Exactly one named low threshold required');if(!triangles.length)throw Error('Actual H39 complete visible source geometry required');return triangles;}
export function replayYinghuaJump(t,W,{fps=60,x=277.2,z=454.9,direction=1,diagonal=0,moving=false,drop=false}={}){
  if(![5,10,60].includes(fps)||![-1,1].includes(direction)||![-1,0,1].includes(diagonal))throw Error('Bounded motion options required');
  const triangles=captureYinghuaMasonry(W.h39.frame,W.cm),oldDoc=globalThis.document,oldWin=globalThis.window,noop=()=>{};
  const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
  let now=0,controls;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera();
  try{
    controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);controls.controls.isLocked=true;
    const ground=W.cm.getGroundHeight(x,z),startFeet=ground+(drop?.7:0);controls.setPosition(x,startFeet+PLAYER.HEIGHT,z);
    camera.lookAt(x+diagonal*2, camera.position.y,z+direction*10);camera.updateMatrixWorld(true);controls.moveForward=moving;
    if(!drop)controls.jump();let maxFeet=startFeet,minFeet=startFeet,maxBob=0;const contacts=[],frames=[];
    const activeSteps=Math.ceil(3/Math.min(1/fps,.1)),settleSteps=Math.ceil(2/Math.min(1/fps,.1));
    for(let i=0;i<activeSteps+settleSteps;i++){
      if(i===activeSteps)controls.moveForward=false;
      now+=1000/fps;controls.update();const p=camera.position.clone().sub(controls.bobOffset),head=controls.feetY+PLAYER.HEIGHT;
      const body=new THREE.Box3(new THREE.Vector3(p.x-.5,controls.feetY+.03,p.z-.5),new THREE.Vector3(p.x+.5,head,p.z+.5));
      const actual=triangles.some(q=>body.intersectsTriangle(q));
      const proxy=W.cm.checkCollision(new THREE.Vector3(p.x,head,p.z),.5);
      if(actual||proxy)contacts.push({frame:i,x:p.x,z:p.z,feet:controls.feetY,head,actual,proxy});
      maxFeet=Math.max(maxFeet,controls.feetY);minFeet=Math.min(minFeet,controls.feetY);maxBob=Math.max(maxBob,controls.bobOffset.length());
      frames.push({phase:i<activeSteps?'active':'settle',x:p.x,z:p.z,feet:controls.feetY,head,velocityY:controls.verticalVelocity});
    }
    const p=camera.position.clone().sub(controls.bobOffset);
    return{fps,x,z,direction,diagonal,moving,drop,startFeet,maxFeet,minFeet,maxBob,headBobEnabled:controls.headBobEnabled,contacts,frames,end:[p.x,p.z,controls.feetY],ground:controls.groundY,walkGround:W.cm.getGroundHeight(p.x,p.z),triangleCount:triangles.length};
  }finally{controls?.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWin;}
}
