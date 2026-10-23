// Pure consumer: takes the owner's already-built W, never builds or changes a
// world, geometry, proxy, collision or walkable. Diagnostic, not browser QA.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
import {assertCourtRouteHeadClearance} from './r58-court-facade-world-check.mjs';
export const JINGREN_SOUTH_WINDOW_VIEWS=[
 {name:'south-whole',eye:[0,6.4,-39],target:[0,5.3,0],fov:48},
 {name:'south-window-close',eye:[-5.6,3.4,-15],target:[-5.6,3.2,-6.85],fov:44},
 {name:'south-oblique',eye:[-23,7,-30],target:[0,4.7,-1],fov:53},
];
const local=(x,y,z)=>new THREE.Vector3(-93.4+x,y,331+z);
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
function requireWorld(W){assert.ok(W?.scene&&W.cm?.checkCollision&&W.cm?.getGroundHeight,'existing W scene and actual CollisionManager required');W.scene.updateMatrixWorld(true);}
export function assertJingrenSouthWindowsInWorld(W){
 requireWorld(W);const records=[];W.scene.traverse(o=>{for(const r of[o.userData.structure,...(o.userData.architecture??[])])if(r?.id==='east-six/jingren-rear-entry')records.push(r);});
 assert.equal(records.length,1,'exactly one actual Jingren assembly');const meta=records[0].jingrenSouthWindows;assert.equal(meta?.windowCount,4);assert.equal(meta.accepted,false);assert.equal(meta.photographyDate,null);
 const ray=(x,y,z,dir=1,far=2)=>new THREE.Raycaster(local(x,y,z),new THREE.Vector3(0,0,dir),0,far).intersectObject(W.scene,true).filter(h=>visible(h.object));
 const triangleContacts=[],width=4.92,centerW=(width-.48)*.58,sideW=(width-.48-centerW)/2;
 for(const cx of[-11.2,-5.6,5.6,11.2]){
  const sideX=cx+centerW/2+.12+sideW/2,diamondY=sideX+Math.round((3.5-sideX)/.32)*.32;
  for(const [x,y,material,plane]of[[cx,1.2,'jingren_south_grey_sill',-6.97],[cx,3.1,'jingren_south_red_frame',-6.96],[cx+.12,3.1,'jingren_south_closed_recess',-6.835],[sideX,diamondY,'jingren_south_pale_diamond',-6.9355]]){
   const h=ray(x,y,-7.7)[0];assert.ok(h,'actual Jingren window triangle required');assert.equal(solidMaterialNameAt(h.object,h.faceIndex),material,'window solid material');assert.ok(Math.abs(h.point.z-(331+plane))<1e-4,'window solid depth');triangleContacts.push({local:[x,y,-7.7],material,hit:h.point.toArray()});
  }
  assert.equal(W.cm.checkCollision(local(cx,2.3,-6.85),.45),true,'original closed-window collider retained');
 }
 let openPortalRays=0;for(const side of[-1,1])for(const x of[-.65,0,.65]){assert.equal(ray(x,2.3,side*7.6,-side,1.5).length,0,'original open door head');assert.equal(W.cm.checkCollision(local(x,2.3,side*6.85),.45),false);openPortalRays++;}
 return{scope:'ALREADY_BUILT_W_REAL_TRIANGLES_AND_COLLISIONS_NOT_BROWSER_ACCEPTANCE',windowCount:4,triangleContacts,openPortalRays};
}
export function replayJingrenDoorsInWorld(t,W,{fps=60,side='south'}={}){
 requireWorld(W);assert.ok(['south','north'].includes(side));const north=side==='north',outside=north?10:-10,inside=north?5.5:-2;
 const points=[[0,outside],[0,inside],[5,inside],[-5,inside],[0,inside],[0,outside],[0,inside],[0,outside]].map(([x,z])=>[-93.4+x,331+z]);
 const trace=traceTerraceGround(W.cm,{flights:[]});try{const r=replayTerrace(t,{THREE,cm:W.cm},points,{fps,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.maxFeet>=.59,'actual terrace reached');assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)),'actual support only; no rescue or unverified ground');return{...r,fps,side,headClearance:assertCourtRouteHeadClearance(W,r),scope:'ACTUAL_CONTROLLER_EXISTING_W_NOT_BROWSER_ACCEPTANCE'};}finally{trace.restore();}
}
