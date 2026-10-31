import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {hallFragment,meshRows,hash}from'../lib/r54-jiaotai-fragment.mjs';
const golden=JSON.parse(fs.readFileSync(new URL('../fixtures/r159-jiaotai-integration/independent-candidate.json',import.meta.url)));
function verify(h){
 const rows=meshRows(h.group),groups=h.shell.children.filter(g=>g.userData.jiaotaiFrontVessel);
 assert.equal(groups.length,2);for(const g of groups)assert.equal(g.visible,true);
 const leaves=[];for(const g of groups)g.traverse(o=>{if(o.isMesh)leaves.push(o);});assert.equal(leaves.length,6);
 for(const m of leaves){for(let o=m;o;o=o.parent)assert.equal(o.visible,true,'target must be effectively visible through every ancestor');for(const mat of(Array.isArray(m.material)?m.material:[m.material])){assert.equal(mat.visible,true,'target material must be visible');assert.ok(!mat.transparent||mat.opacity>0,'transparent target must have nonzero opacity');}}
 assert.deepEqual(h.shell.userData.structure.frontVessels,golden.record);
 assert.deepEqual(rows.filter(r=>r.name.startsWith('r159-jiaotai-')),golden.target);
 assert.equal(hash(rows.filter(r=>!r.name.startsWith('r159-jiaotai-'))),golden.old);
 assert.equal(hash(h.builder.colliders.filter(c=>!c.r159JiaotaiFrontVessel)),golden.oldPhysical);
 assert.equal(hash(h.builder.walkables),golden.oldSupport);
 assert.deepEqual(h.builder.colliders.filter(c=>c.r159JiaotaiFrontVessel).map(c=>({owner:c.r159JiaotaiFrontVessel,min:c.min.toArray(),max:c.max.toArray()})),golden.rows);
}
test('actual canonical Jiaotai production entry equals independently installed reviewed module and preserves all other local geometry/physics',()=>{const h=hallFragment();try{verify(h);}finally{h.builder.dispose();}});
test('actual production target visibility, pose and registered bound drift cannot pass',()=>{const h=hallFragment();try{
 verify(h);const g=h.shell.children.find(g=>g.userData.jiaotaiFrontVessel);g.visible=false;assert.throws(()=>verify(h));g.visible=true;
 g.position.x+=.01;assert.throws(()=>verify(h));g.position.x-=.01;
 const c=h.builder.colliders.find(c=>c.r159JiaotaiFrontVessel),x=c.min.x;c.min.x+=.01;assert.throws(()=>verify(h));c.min.x=x;verify(h);
 }finally{h.builder.dispose();}});
test('target leaf, ancestor and material hiding must fail actual visibility contract',()=>{const h=hallFragment();try{
 verify(h);const group=h.shell.children.find(g=>g.userData.jiaotaiFrontVessel),mesh=group.children.find(m=>m.isMesh);
 mesh.visible=false;assert.throws(()=>verify(h));mesh.visible=true;
 h.shell.visible=false;assert.throws(()=>verify(h));h.shell.visible=true;
 mesh.material.visible=false;assert.throws(()=>verify(h));mesh.material.visible=true;verify(h);
 const transparent=mesh.material.transparent,opacity=mesh.material.opacity;mesh.material.transparent=true;mesh.material.opacity=0;assert.throws(()=>verify(h));mesh.material.transparent=transparent;mesh.material.opacity=opacity;verify(h);
 }finally{h.builder.dispose();}});
