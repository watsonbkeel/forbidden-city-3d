import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {execFileSync} from 'node:child_process';
import {fixture,roles,meshRows,physical,hash,geometryHealth,rayLocal} from '../../lib/r58-court-facade-fixture.mjs';
const url=new URL('../../../src/scene/palace/special/SideGate.js',import.meta.url);
let source=execFileSync('git',['show','e14c61911844e7aa6ce7c0251e64fd0ad61e67f4:src/scene/palace/special/SideGate.js'],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {buildSideGate:parent}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const done=h=>{h.kit.dispose(h.kit.root);h.lib.dispose();};
test('Xiehe own east end bays are solid red walls over stone bases; west lattice is retained',()=>{const h=fixture('xiehe'),p=fixture('xiehe',{},parent);try{
 const windows=roles(h.frame,'gate-window');assert.equal(windows.length,2);assert.ok(windows.every(w=>w.userData.side==='rear'));
 const walls=roles(h.frame,'xiehe-east-end-wall');assert.equal(walls.length,2);assert.ok(walls.every(m=>m.position.z===-h.g.depth/2&&m.material===h.lib.material('wall_red')));
 assert.equal(roles(h.frame,'xiehe-east-end-stone-base').length,2);
 for(const w of windows){const old=roles(p.frame,'gate-window').find(x=>x.userData.bay===w.userData.bay&&x.userData.side==='rear');assert.equal(hash(meshRows(w)),hash(meshRows(old)));}
 }finally{done(h);done(p);}});
test('Only Xiehe gets actual longitudinal end partitions, not masonry between the three portals',()=>{const h=fixture('xiehe');try{const walls=roles(h.frame,'xiehe-east-vestibule-end-wall');assert.equal(walls.length,2);for(const w of walls){assert.ok(w.position.x===h.g.columnXs[1]||w.position.x===h.g.columnXs[4]);w.geometry.computeBoundingBox();assert.ok(w.geometry.boundingBox.max.z-w.geometry.boundingBox.min.z>=h.g.depth/2-.01);}
 for(const p of h.g.portals){const [x,z]=h.g.toWorld(p.centerX,-h.g.depth*.3);assert.equal(h.cm.checkCollision(new T.Vector3(x,h.g.platformY+1.7,z),.5),false);}
 geometryHealth(h.frame);
 }finally{done(h);}});
test('Xiehe each moving leaf has studs only east and a plain red back with attached split battens',()=>{for(const open of[false,true]){const h=fixture('xiehe',{open});try{for(const leaf of roles(h.frame,'gate-door-leaf')){assert.equal(leaf.material.name,'kit_lacquer');const front=roles(leaf,'xiehe-door-studded-east-face');assert.equal(front.length,1);assert.ok(front[0].position.z<0);assert.equal(front[0].material,h.lib.material('door_studded'));assert.ok(roles(leaf,'xiehe-door-back-batten').length>=1);assert.ok(roles(leaf,'xiehe-door-back-batten').every(m=>m.parent===leaf&&m.position.z>0));}geometryHealth(h.frame);}finally{done(h);}}});
test('Other three gates retain exact parent geometry, materials, physical and map records',()=>{for(const id of['xihe','jingyun','longzong']){const a=fixture(id,{},parent),b=fixture(id);try{assert.equal(hash(meshRows(a.frame)),hash(meshRows(b.frame)),id);assert.deepEqual(physical(a.kit),physical(b.kit));assert.deepEqual(a.frame.userData.structure,b.frame.userData.structure);}finally{done(a);done(b);}}});
test('Final real-material merge keeps east stud skins and plain red backs at all cardinal/open states',()=>{
 for(const rot of[0,Math.PI/2,Math.PI,3*Math.PI/2])for(const open of[false,true]){const h=fixture('xiehe',{rot,open});let merged;try{
  const probes=[];for(const leaf of roles(h.frame,'gate-door-leaf'))for(const side of[-1,1]){
   const origin=leaf.localToWorld(new T.Vector3(0,(h.g.columnH-1)*.6,side*.2));
   const dir=new T.Vector3(0,0,-side).transformDirection(leaf.matrixWorld);
   probes.push({origin,dir,expected:side<0?h.lib.material('door_studded'):h.kit.lacquer});
  }
  merged=h.kit.finish();merged.updateMatrixWorld(true);
  for(const p of probes){const ray=new T.Raycaster(p.origin,p.dir,0,.4),hit=ray.intersectObject(merged,true)[0];assert.ok(hit,'merged leaf vanished');assert.equal(hit.object.material,p.expected,'wrong material on moving east/west face');}
 }finally{if(merged)h.kit.dispose(merged);else h.kit.dispose(h.kit.root);h.lib.dispose();}}
});
test('East stud skin replaces the body front face rather than layering near-coplanar surfaces',()=>{const h=fixture('xiehe');try{for(const leaf of roles(h.frame,'gate-door-leaf')){const g=leaf.geometry,p=g.attributes.position,ix=g.index;let duplicate=0;for(let i=0;i<(ix?.count??p.count);i+=3)if([0,1,2].every(k=>p.getZ(ix?ix.getX(i+k):i+k)===-.125))duplicate++;assert.equal(duplicate,0,'plain front face competes with stud skin');assert.equal(roles(leaf,'xiehe-door-studded-east-face')[0].position.z,-.125);}}finally{done(h);}});
