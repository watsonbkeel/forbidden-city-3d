// Existing-W diagnostics only. No world builder, collider registration, renderer,
// altered physics callback, or browser acceptance. DOM/clock/heading are controlled.
import * as THREE from 'three';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {DIMENSIONS,LAYOUT,PLAYER} from '../../src/config/constants.js';
const dm=DIMENSIONS.WUMEN,modes=['walk','stationary','diagonal','diagonalOut','outside'];
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
function requireWorld(W){if(!W?.scene?.isScene||!Array.isArray(W.cm?.colliders)||!Array.isArray(W.cm?.walkables))throw new TypeError('An existing scene and CollisionManager are required');}
/** Collect once, reuse for the same frozen W. Works with unmerged or batched
 * masonry. Actual triangles, not reconstructed proxy/profile geometry.
 */
export function captureWumenNorthHeadTriangles(W){
 requireWorld(W);
 const regions=[[-17.5,5],[0,9],[17.5,5]].map(([x,w])=>new THREE.Box3(new THREE.Vector3(x-w/2,3,LAYOUT.WUMEN_Z+dm.platformNorth-1.2),new THREE.Vector3(x+w/2,12,LAYOUT.WUMEN_Z+dm.platformNorth)));
 const triangles=[];
 W.scene.traverse(m=>{
  if(!m.isMesh||!visible(m))return;const g=m.geometry,p=g?.attributes.position;if(!p)return;
  const bounds=new THREE.Box3().setFromBufferAttribute(p).applyMatrix4(m.matrixWorld);if(!regions.some(r=>r.intersectsBox(bounds)))return;
  const idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){
   const material=Array.isArray(m.material)?m.material[g.groups.find(q=>i>=q.start&&i<q.start+q.count)?.materialIndex??0]:m.material;
   if(!['wall_red','wall_brick'].includes(material?.name)||material.visible===false||material.colorWrite===false||(material.transparent&&material.opacity<=0))continue;
   const t=new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld)));
   const box=new THREE.Box3().setFromPoints([t.a,t.b,t.c]);if(regions.some(r=>r.intersectsBox(box)))triangles.push(t);
  }
 });
 return Object.freeze(triangles);
}

export function replayWumenNorthJump(t,W,{fps=60,direction=-1,x=3.999,mode='stationary',triangles,warmupSeconds=0}={}){
 requireWorld(W);
 if(!Number.isFinite(fps)||fps<1||fps>240||![-1,1].includes(direction)||!Number.isFinite(x)||Math.abs(x)>=4||!modes.includes(mode)||!Number.isFinite(warmupSeconds)||warmupSeconds<0||warmupSeconds>1)throw new TypeError('Invalid bounded Wumen jump options');
 if(W.cm.colliders.filter(c=>c.overhead?.sourceId?.startsWith('axis/wumen-north-head/')).length!==3)throw new TypeError('Exactly three installed north-head shapes are required');
 triangles??=captureWumenNorthHeadTriangles(W);if(!Array.isArray(triangles)||!triangles.length)throw new TypeError('Actual existing-world north-head triangles are required');
 const moving=['walk','diagonal','diagonalOut'].includes(mode),oldDoc=globalThis.document,oldWin=globalThis.window,noop=()=>{};
 const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0,controls;const clock=t.mock.method(performance,'now',()=>now),camera=new THREE.PerspectiveCamera();
 try{
  controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
  const startX=mode==='diagonalOut'?Math.sign(x)*3.6:x;
  const startZ=dm.platformNorth+(moving?(direction===-1?2:-3.2):mode==='outside'?(direction===-1?1.1:-2.3):-.6)+LAYOUT.WUMEN_Z;
  controls.controls.isLocked=true;controls.setPosition(startX,PLAYER.HEIGHT,startZ);
  camera.lookAt(startX+(mode==='diagonal'?-Math.sign(x)*2.5:mode==='diagonalOut'?Math.sign(x)*2.5:0),PLAYER.HEIGHT,startZ+direction*10);camera.updateMatrixWorld(true);
  controls.moveForward=moving;
  // Optional real grounded approach establishes default bob before queuing jump.
  for(let i=0;i<Math.ceil(warmupSeconds*fps);i++){now+=1000/fps;controls.update();}
  controls.jump();let maxFeet=0,maxHead=0,contacts=0,actualBodyContacts=0,proxyContacts=0,cameraContacts=0,minCameraClearance=Infinity,maxAbsBob=0;
  const contactFrames=[],bodyContactFrames=[];
  // At 5 Hz the real controller clamps dt to 0.1 s; run two simulated seconds.
  for(let i=0;i<Math.ceil(2/Math.min(1/fps,.1));i++){
   now+=1000/fps;controls.update();const physical=camera.position.clone().sub(controls.bobOffset),z=physical.z-LAYOUT.WUMEN_Z,head=controls.feetY+PLAYER.HEIGHT;
   maxFeet=Math.max(maxFeet,controls.feetY);maxHead=Math.max(maxHead,head);maxAbsBob=Math.max(maxAbsBob,controls.bobOffset.length());
   const cameraLocalZ=camera.position.z-LAYOUT.WUMEN_Z;
   if(cameraLocalZ>=dm.platformNorth-1.2&&cameraLocalZ<=dm.platformNorth){
    const ray=new THREE.Ray(new THREE.Vector3(camera.position.x,0,camera.position.z),new THREE.Vector3(0,1,0));let underside=Infinity;
    for(const triangle of triangles){const hit=ray.intersectTriangle(triangle.a,triangle.b,triangle.c,false,new THREE.Vector3());if(hit&&hit.y>=3)underside=Math.min(underside,hit.y);}
    if(Number.isFinite(underside)){const gap=underside-camera.position.y;minCameraClearance=Math.min(minCameraClearance,gap);if(gap< -1e-5&&camera.position.y<=12)cameraContacts++;}
   }
   const body=new THREE.Box3(new THREE.Vector3(physical.x-.5,controls.feetY+.03,physical.z-.5),new THREE.Vector3(physical.x+.5,head,physical.z+.5));
   if(triangles.some(t=>body.intersectsTriangle(t))){contacts++;contactFrames.push({time:now/1000,x:physical.x,z,feet:controls.feetY,head});}
   if(W.cm.checkCollision(new THREE.Vector3(physical.x,head,physical.z),.5))proxyContacts++;
   // Legacy engine box is kept separately from the new full-height narrow phase.
   if(triangles.some(t=>W.cm.playerBox.intersectsTriangle(t))){actualBodyContacts++;bodyContactFrames.push({time:now/1000,x:physical.x,z,feet:controls.feetY,head,bodyTop:W.cm.playerBox.max.y});}
  }
  const end=camera.position.clone().sub(controls.bobOffset),progress=direction*(end.z-startZ);
  const routeValid=(!moving||mode==='diagonalOut'||progress>3.3)
   &&(!(mode==='diagonalOut'&&fps<=10&&direction===-1)||end.z-LAYOUT.WUMEN_Z>=dm.platformNorth+.5);
  const jumpValid=maxFeet>1&&controls.feetY===0&&(!(mode==='stationary'&&fps>=60)||maxHead<3.221)
   &&(!(mode==='outside'&&fps>=60)||maxHead>3.49);
  return {pass:contacts===0&&actualBodyContacts===0&&proxyContacts===0&&cameraContacts===0&&routeValid&&jumpValid,fps,direction,x,mode,moving,maxFeet,maxHead,
   warmupSeconds,headBobEnabled:controls.headBobEnabled,maxAbsBob,cameraContacts,minCameraClearance:Number.isFinite(minCameraClearance)?minCameraClearance:null,
   theoreticalHead:PLAYER.HEIGHT+PLAYER.JUMP_VELOCITY**2/(2*PLAYER.GRAVITY),contacts,actualBodyContacts,proxyContacts,contactFrames,bodyContactFrames,
   end:[end.x,end.z-LAYOUT.WUMEN_Z,controls.feetY],routeValid,jumpValid,headTriangleCount:triangles.length,
   boundary:'Actual existing-W controller/geometry CPU diagnostic, NOT browser acceptance'};
 }finally{controls?.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWin;}
}
