import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {CollisionManager} from '../../../../src/utils/Collision.js';
import {registerWumenJointAscentOwners} from '../../../../src/controls/WumenJointAscentContact.js';
import {tryWumenJointGroundStep} from '../../../../src/controls/WumenJointAscentMotion.js';
import {buildWumenAscentContactRig} from '../../../../scripts/photo-fidelity/batches/wumen-joint-layout/ascent-contact.mjs';
const names=['entry','innerTurn','outward','outerFold','return','neck','receiver'];
const h=(p,x,z)=>p.y0+(p.y1-p.y0)*((p.axis==='x'?x:z)-p.a0)/(p.a1-p.a0);
for(const side of ['east','west'])for(let i=1;i<names.length;i++)for(const reverse of [false,true])test(`actual connected seam ${side}/${names[i-1]} to ${names[i]} ${reverse?'reverse':'forward'}`,t=>{
 const material=new T.MeshStandardMaterial(),rig=buildWumenAscentContactRig(material),cm=new CollisionManager();for(const p of rig.pieces){cm.addColliders(p.colliders);cm.addWalkable(p.walkable);}const binding=registerWumenJointAscentOwners(cm,rig.pieces);t.after(()=>{binding.dispose();rig.dispose();material.dispose();});
 const seam=rig.seams.find(s=>s.from===`${side}/${names[i-1]}`&&s.to===`${side}/${names[i]}`),a=rig.pieces.find(p=>p.mesh.name===(reverse?seam.to:seam.from)).walkable,b=rig.pieces.find(p=>p.mesh.name===(reverse?seam.from:seam.to)).walkable,x=(seam.points[0][0]+seam.points[1][0])/2,z=(seam.points[0][1]+seam.points[1][1])/2,axis=seam.points[0][0]===seam.points[1][0]?'x':'z',c=axis==='x'?(a.minX+a.maxX)/2:(a.minZ+a.maxZ)/2,sgn=Math.sign(c-(axis==='x'?x:z));
 assert.notEqual(sgn,0);const from=new T.Vector3(x,0,z),to=new T.Vector3(x,0,z);from[axis]+=.1*sgn;to[axis]-=.1*sgn;from.y=h(a,from.x,from.z);to.y=from.y;
 const cols=[...cm.colliders],walks=[...cm.walkables],r=tryWumenJointGroundStep(cm,from,to,{kind:'player',airborne:false},.5);
 assert.equal(r.status,'SUPPORTED');assert.ok(Math.abs(r.feetY-h(b,to.x,to.z))<1e-12);assert.equal(r.routeAcceptance,false);assert.equal(cm.checkCollision(new T.Vector3(to.x,r.feetY+1.7,to.z),.5),false);assert.deepEqual(cm.colliders,cols);assert.deepEqual(cm.walkables,walks);
});
