// Read-only consumer of the owner's ALREADY EXISTING W. No builder, proxy
// registration, source patch, scene insertion, or whole-world reconstruction.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
export const JINGYANG_REAR_ROUTE=Object.freeze([[0,-8],[0,-6.2],[0,-2.5],[6,-2.5],[-6,-2.5],[0,-2.5],[0,-8],[0,-2.5],[0,-8]].map(([x,z])=>Object.freeze([-148.5+x,453.5+z])));
const world=(x,y,z)=>new THREE.Vector3(-148.5+x,y,453.5+z);
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
function requireWorld(W){assert.ok(W?.scene&&W.cm?.checkCollision&&W.cm?.getGroundHeight,'Supply an existing merged scene and actual CollisionManager');W.scene.updateMatrixWorld(true);}
export function assertJingyangRearFacadeInWorld(W){
 requireWorld(W);const records=[];W.scene.traverse(o=>{for(const r of[o.userData.structure,...(o.userData.architecture??[])])if(r?.objectId==='FC-8B02DC003C')records.push(r);});
 assert.equal(records.length,1);assert.equal(records[0].bays,5);assert.match(records[0].status,/PARTIAL/);
 const windows=[];
 for(const x of[-9.6,-4.8,4.8,9.6]){
  assert.equal(W.cm.checkCollision(world(x,2.15,-4.8),.45),true,'each actual high-sill window remains closed');
  for(const [y,material,z]of[[.9,'jingyang_rear_photo_sill',-4.99],[2.4,'jingyang_rear_photo_red_frame',-5.01]]){
   const hit=new THREE.Raycaster(world(x,y,-5.8),new THREE.Vector3(0,0,1),0,1.3).intersectObject(W.scene,true).filter(h=>visible(h.object))[0];
   assert.ok(hit,'fitted window actual triangle survived merge');assert.equal(solidMaterialNameAt(hit.object,hit.faceIndex),material);assert.ok(Math.abs(hit.point.z-(453.5+z))<1e-4);
   windows.push({x,y,material,hit:hit.point.toArray()});
  }
 }
 for(const x of[-12,-7.2,-2.4,2.4,7.2,12])for(const z of[-4.8,4.8])assert.equal(W.cm.checkCollision(world(x,2.15,z),.15),true,'five-bay column layout has physical support');
 assert.equal(W.cm.checkCollision(world(0,2.15,-4.8),.45),false,'central actual portal remains clear');
 return{objectId:'FC-8B02DC003C',scope:'EXISTING_MERGED_TRIANGLES_AND_COLLIDERS_NOT_BROWSER_ACCEPTANCE',bays:5,windowTriangleContacts:windows};
}
export function replayJingyangRearFacadeInWorld(t,W,{fps=60}={}){
 requireWorld(W);const trace=traceTerraceGround(W.cm,{flights:[]});
 try{const result=replayTerrace(t,{cm:W.cm,THREE},JINGYANG_REAR_ROUTE,{fps,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(result.startFeet,0);assert.ok(result.maxFeet>=.44);assert.ok(!trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'));return{...result,scope:'ACTUAL_CONTROLLER_ON_EXISTING_W_NOT_BROWSER_ACCEPTANCE',fps};}
 finally{trace.restore();}
}
