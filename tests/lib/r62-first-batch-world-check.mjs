// Read-only checks of existing actual merged scene, never a world constructor.
import assert from 'node:assert/strict';import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const near=(a,b,t=1e-4)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function records(W,id){const r=[];W.scene.updateMatrixWorld(true);W.scene.traverse(o=>{for(const p of[o.userData.structure,...(o.userData.architecture??[])])if(p?.id===id)r.push(p);});assert.equal(r.length,1);return r[0];}
function hits(W,p,d,far){return new THREE.Raycaster(new THREE.Vector3(...p),new THREE.Vector3(...d),0,far).intersectObject(W.scene,true).filter(h=>visible(h.object));}
export function assertFengxianFrontInWorld(W){
 const r=records(W,'fengxian-front-hall'),v=r.frontWindowReview;assert.equal(v.frontBays,9);assert.equal(v.accepted,false);assert.deepEqual(v.fields.map(f=>f.bay),[0,1,7,8]);const windowContacts=[],columns=[];
 for(const f of v.fields){const x=-182.3+f.x,z=253.3-30.5/2;for(const y of[1.7,2.7]){const h=hits(W,[x,y,z-1],[0,0,1],1.5)[0];assert.ok(h,'Actual front sill/window is required');const mat=solidMaterialNameAt(h.object,h.faceIndex);assert.ok((y<2?['wall_red','wall_red_material']:['lattice_doors','lattice_doors_material']).includes(mat),mat);near(h.point.z,z-.07);windowContacts.push({bay:f.bay,y,hit:h.point.toArray(),material:mat});}assert.equal(W.cm.checkCollision(new THREE.Vector3(x,2.9,z),.45),true);}
 for(let k=0;k<=9;k++)for(const sign of[-1,1]){const x=-182.3-26.3+k*52.6/9,z=253.3+sign*15.25;assert.equal(W.cm.checkCollision(new THREE.Vector3(x,2.9,z),.15),true);const h=hits(W,[x,3,z+sign*1],[0,0,-sign],1.5)[0];assert.ok(h);assert.match(solidMaterialNameAt(h.object,h.faceIndex),/wood_column/);columns.push(h.point.toArray());}
 assert.equal(W.cm.checkCollision(new THREE.Vector3(-182.3,2.9,238.05),.45),false);const roof=hits(W,[-182.3,40,253.3],[0,-1,0],35).find(h=>/roof_tile/.test(solidMaterialNameAt(h.object,h.faceIndex)));assert.ok(roof&&roof.point.y>10);
 const room=W.rooms.find(x=>x.name==='奉先殿');assert.ok(room);assert.equal(room.kind,'empty');return{scope:'ACTUAL_MERGED_GEOMETRY_NOT_BROWSER',frontBays:9,columnTriangleContacts:columns,windowContacts,roofY:roof.point.y,ritualInventory:'RETAINED_EMPTY_PRESET_NOT_HISTORICAL_INVENTORY_ACCEPTANCE'};
}
export function assertYongheKneesInWorld(W){
 records(W,'east-six/yonghe-open-baoxia');const material='yonghe_canopy_knee_muted_wood_fit',triangles=[];
 W.scene.traverse(m=>{if(!m.isMesh||(!m.userData.solidMaterialBatch?.sources?.some(s=>s.materialName===material)&&m.material?.name!==material))return;assert.ok(visible(m));const p=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??p.count);k+=3){if(solidMaterialNameAt(m,k/3)!==material)continue;triangles.push([0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld)));}});
 assert.equal(triangles.length,240);const parts=[],xs=[-8.34,-2.78,2.78,8.34];
 for(let bay=0;bay<3;bay++)for(const direction of[1,-1]){const root=-149+xs[bay+(direction===1?0:1)]+direction*.314,x0=Math.min(root,root+direction*.95),x1=Math.max(root,root+direction*.95);const tris=triangles.filter(t=>t.every(p=>p.x>=x0-1e-4&&p.x<=x1+1e-4));assert.equal(tris.length,40);let minArea=Infinity;const box=new THREE.Box3();for(const t of tris){for(const p of t)box.expandByPoint(p);minArea=Math.min(minArea,t[1].clone().sub(t[0]).cross(t[2].clone().sub(t[0])).length()/2);}assert.ok(minArea>1e-8);near(box.min.y,5.9488);near(box.max.y,6.4988);near(box.min.z,370.82);near(box.max.z,370.98);parts.push({bay,direction,triangles:tris.length,minArea,min:box.min.toArray(),max:box.max.toArray()});}
 return{scope:'ACTUAL_MERGED_GEOMETRY_NOT_BROWSER',triangles:240,parts,minimumStandingHeadGap:5.9488-(.6+1.7),newNavigation:'NONE'};
}
export const FENGXIAN_FRONT_ROUTE=[[-182.3,232.05],[-182.3,235.95],[-182.3,238.95],[-182.3,253.3],[-182.3,238.95],[-182.3,235.95],[-182.3,232.05]];
export const YONGHE_FRONT_ROUTE=[[-149,366.5],[-149,371.3],[-149,374.6],[-149,379.1],[-149,374.6],[-149,371.3],[-149,366.5]];
export function replayFirstBatchRoute(t,W,{which,fps,sprint=false,backward=false}){const route=which==='fengxian'?FENGXIAN_FRONT_ROUTE:YONGHE_FRONT_ROUTE;assert.ok(['fengxian','yonghe'].includes(which));const trace=traceTerraceGround(W.cm,{flights:[]});try{const r=replayTerrace(t,W,route,{fps,sprint,backward,recordFrames:true});assert.ok(r.arrived,JSON.stringify({...r,frames:undefined}));assert.ok(Math.abs(r.end[2])<1e-6);assert.ok(!trace.samples.some(x=>['rescue','unverified'].includes(x.source)));return r;}finally{trace.restore();}}
