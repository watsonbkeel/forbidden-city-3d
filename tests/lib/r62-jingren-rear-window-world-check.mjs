// Read-only consumer of the owner's existing W. No world construction,
// geometry/proxy insertion or collision adjustment. Not browser acceptance.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
import {assertCourtRouteHeadClearance} from './r58-court-facade-world-check.mjs';
export const JINGREN_REAR_WINDOW_VIEWS=[
 {name:'rear-south-whole',eye:[0,5.7,-33],target:[0,4.5,0],fov:49},
 {name:'rear-window-close',eye:[-4.8,3.1,-12.7],target:[-4.8,2.9,-4.8],fov:42},
 {name:'rear-south-oblique',eye:[-22,6.7,-26],target:[0,4.1,-1],fov:54},
];
const local=(x,y,z)=>new THREE.Vector3(-93+x,y,347.4+z);
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const requireWorld=W=>{assert.ok(W?.scene&&W.cm?.checkCollision&&W.cm?.getGroundHeight,'already-built W with actual CollisionManager required');W.scene.updateMatrixWorld(true);};
export function assertJingrenRearWindowsInWorld(W){
 requireWorld(W);const records=[];W.scene.traverse(o=>{for(const r of[o.userData.structure,...(o.userData.architecture??[])])if(r?.id==='east-six/jingren-rear')records.push(r);});
 assert.equal(records.length,1,'one Jingren rear hall, not main-hall glazing');const meta=records[0].jingrenRearWindows;assert.equal(meta?.windowCount,4);assert.equal(meta.lowerFieldsPerBay,3);assert.equal(meta.photographyDate,null);assert.equal(meta.accepted,false);
 const ray=(x,y,z,far=1.5)=>new THREE.Raycaster(local(x,y,z),new THREE.Vector3(0,0,1),0,far).intersectObject(W.scene,true).filter(h=>visible(h.object));
 const triangleContacts=[];
 for(const cx of[-9.6,-4.8,4.8,9.6]){
  const probes=[[cx,.95,'jingren_rear_masonry_fit',-4.98],[cx,2.2,'jingren_rear_pale_lower_fit',-4.825],[cx,3.15,'jingren_rear_red_frame_fit',-4.98],[cx-1.852,3.6,'jingren_rear_red_frame_fit',-4.98],[cx-1.782,3.75,'jingren_rear_red_frame_fit',-4.98],[cx-1.914,3.6,'jingren_rear_upper_recess_fit',-4.825]];
  for(const[x,y,material,plane]of probes){const h=ray(x,y,-5.6)[0];assert.ok(h,'actual window triangle');assert.equal(solidMaterialNameAt(h.object,h.faceIndex),material);assert.ok(Math.abs(h.point.z-(347.4+plane))<1e-4,'actual window front depth');triangleContacts.push({local:[x,y,-5.6],material,hit:h.point.toArray().map(v=>+v.toFixed(5))});}
  assert.equal(W.cm.checkCollision(local(cx,2.15,-4.8),.45),true,'original closed-window proxy');
 }
 let openPortalRays=0;for(const x of[-.65,0,.65]){assert.equal(ray(x,2.15,-5.6).length,0,'retained central south portal');assert.equal(W.cm.checkCollision(local(x,2.15,-4.8),.45),false);openPortalRays++;}
 assert.equal(W.cm.checkCollision(local(0,2.15,4.8),.45),true,'rear wall not an invented north portal');
 return{scope:'ALREADY_BUILT_W_REAL_TRIANGLES_AND_COLLISIONS_NOT_BROWSER_ACCEPTANCE',windowCount:4,triangleContacts,openPortalRays};
}
export function replayJingrenRearDoorInWorld(t,W,{fps=60}={}){
 requireWorld(W);const points=[[0,-7.3],[0,-1],[4,-1],[-4,-1],[0,-1],[0,-7.3],[0,-1],[0,-7.3]].map(([x,z])=>[-93+x,347.4+z]);
 const trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayTerrace(t,{THREE,cm:W.cm},points,{fps,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.ok(result.maxFeet>=.44,'retained low terrace reached');assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)),'actual support only');return{...result,fps,headClearance:assertCourtRouteHeadClearance(W,result),scope:'ACTUAL_CONTROLLER_EXISTING_W_NOT_BROWSER_ACCEPTANCE'};}finally{trace.restore();}
}
