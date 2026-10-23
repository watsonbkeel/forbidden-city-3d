// Existing-world consumer only: no construction, loading, geometry mutation or
// substitution of internal readiness for actual rendered support triangles.
import assert from 'node:assert/strict';import * as THREE from 'three';
import {kunningGateAccess} from '../../src/scene/palace/special/KunningGate.js';import {replayTerrace} from './terrace-walk.mjs';
export function assertKunningGateInWorld(W){
 W.scene.updateMatrixWorld(true);const list=[];W.scene.traverse(o=>{for(const r of o.userData.architecture??[])if(r.objectId==='FC-60FCD2B8CC')list.push(r);});assert.equal(list.length,1);const g=list[0];assert.equal(g.front,'north');assert.equal(g.accepted,false);
 const near=(a,b)=>Math.abs(a-b)<1e-6;assert.equal(g.supports.length,36);const supports=g.supports.map(e=>{const found=W.cm.walkables.filter(w=>w.type===e.type&&(w.type==='box'?e.min.every((n,i)=>near(n,w.box.min.getComponent(i)))&&e.max.every((n,i)=>near(n,w.box.max.getComponent(i))):['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],e[k]))&&w.axis===e.axis));assert.equal(found.length,1,e.supportId);if(e.type==='box')assert.equal(found[0].rescue,false);return found[0];});
 for(const w of supports){const x=w.type==='box'?(w.box.min.x+w.box.max.x)/2:(w.minX+w.maxX)/2,z=w.type==='box'?(w.box.min.z+w.box.max.z)/2:(w.a0+w.a1)/2,y=w.type==='box'?w.box.max.y:(w.y0+w.y1)/2;
  const hit=new THREE.Raycaster(new THREE.Vector3(x,y+.025,z),new THREE.Vector3(0,-1,0),0,.05).intersectObject(W.scene,true)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-y)<1e-5);assert.ok(Math.abs(W.cm.getGroundHeight(x,z,y+.01)-y)<1e-5);
 }
 assert.equal(W.cm.getGroundHeight(g.x+2.8,g.z+2.8,0),0,'no raised-deck rescue');assert.equal(W.cm.checkCollision(new THREE.Vector3(g.x+2.8,1.7,g.z+2.8),.5),true,'ground body cannot tunnel under new deck');
 return {objectId:g.objectId,actualSupports:supports.length,source:g.source,status:g.status,dimensions:g.fitted,unknowns:g.unknowns};
}
export function replayKunningGate(t,W,item,options={}){
 const points=kunningGateAccess(item),r=replayTerrace(t,{...W,THREE:W.THREE??THREE},[...points,...points.slice(0,-1).reverse()],{...options,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({stuckAt:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=1.2);assert.ok(Math.abs(r.end[2])<.01);
 for(const f of r.frames)assert.equal(W.cm.checkCollision(new THREE.Vector3(f.x,f.ground+1.7,f.z),.5),false,'actual body cannot intersect a registered solid');return r;
}
