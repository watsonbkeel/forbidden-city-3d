import * as THREE from 'three';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';

// Consumes an already-built scene and real CollisionManager. Never registers
// physics or substitutes reconstructed curve triangles for rendered geometry.
export function captureTianyiMasonry(root){
  root.updateMatrixWorld(true);const triangles=[];
  let raw=false;root.traverse(m=>{if(m.name==='tianyi-arched-masonry')raw=true;});
  const region=new THREE.Box3(new THREE.Vector3(-2.201,.449,462.18),new THREE.Vector3(3.201,4.501,466.501));
  root.traverse(m=>{if(!m.isMesh||!m.visible)return;if(raw&&!['tianyi-arched-masonry','tianyi-arched-door-leaf'].includes(m.name))return;if(!raw&&!['wall_brick','kit_lacquer'].includes(m.material?.name))return;
    const p=m.geometry.attributes.position,ix=m.geometry.index;
    for(let i=0;i<(ix?.count??p.count);i+=3){const t=new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld)));if(raw||region.containsBox(new THREE.Box3().setFromPoints([t.a,t.b,t.c])))triangles.push(t);}
  });if(!triangles.length)throw Error('Actual Tianyi masonry required');return triangles;
}
export function replayTianyiJump(t,W,{fps=60,x=.5,z=465,direction=1,diagonal=0,moving=false,drop=false}={}){
  if(![5,10,60].includes(fps)||![-1,1].includes(direction)||![-1,0,1].includes(diagonal))throw Error('Bounded motion options required');
  const triangles=captureTianyiMasonry(W.kit?.root??W.scene),oldDoc=globalThis.document,oldWin=globalThis.window,noop=()=>{};
  const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
  let now=0,controls;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera();
  try{
    controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);controls.controls.isLocked=true;
    const ground=W.cm.getGroundHeight(x,z),startFeet=ground+(drop?.7:0);controls.setPosition(x,startFeet+PLAYER.HEIGHT,z);
    camera.lookAt(x+diagonal*2, camera.position.y,z+direction*10);camera.updateMatrixWorld(true);controls.moveForward=moving;
    if(!drop)controls.jump();let maxFeet=startFeet,minFeet=startFeet,maxBob=0;const contacts=[],frames=[];
    for(let i=0;i<Math.ceil(3/Math.min(1/fps,.1));i++){
      now+=1000/fps;controls.update();const p=camera.position.clone().sub(controls.bobOffset),head=controls.feetY+PLAYER.HEIGHT;
      const body=new THREE.Box3(new THREE.Vector3(p.x-.5,controls.feetY+.03,p.z-.5),new THREE.Vector3(p.x+.5,head,p.z+.5));
      const actual=triangles.some(q=>body.intersectsTriangle(q));
      const proxy=W.cm.checkCollision(new THREE.Vector3(p.x,head,p.z),.5);
      if(actual||proxy)contacts.push({frame:i,x:p.x,z:p.z,feet:controls.feetY,head,actual,proxy});
      maxFeet=Math.max(maxFeet,controls.feetY);minFeet=Math.min(minFeet,controls.feetY);maxBob=Math.max(maxBob,controls.bobOffset.length());
      frames.push({x:p.x,z:p.z,feet:controls.feetY,head,velocityY:controls.verticalVelocity});
    }
    const p=camera.position.clone().sub(controls.bobOffset);
    return{fps,x,z,direction,diagonal,moving,drop,startFeet,maxFeet,minFeet,maxBob,headBobEnabled:controls.headBobEnabled,contacts,frames,end:[p.x,p.z,controls.feetY],ground:controls.groundY,walkGround:W.cm.getGroundHeight(p.x,p.z),triangleCount:triangles.length};
  }finally{controls?.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWin;}
}
