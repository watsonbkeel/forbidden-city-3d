import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,meshes,geometryHealth,rayLocal} from './lib/r58-court-facade-fixture.mjs';

test('Xiehe own east slope rails have exact visible owners and no sphere capitals',()=>{
 const h=fixture('xiehe');try{
 const parts=meshes(h.frame).filter(m=>m.userData.xieheEastRail);

 assert.ok(parts.length>0,'own east rail mesh parts exist');
 assert.equal(parts.filter(m=>m.geometry.type==='SphereGeometry').length,0);
 const owners=h.kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('xiehe-east-rail:'));
 assert.equal(owners.length,38,'20 posts and 18 panels');
 assert.equal(new Set(owners.map(c=>c.triangleSupport.id)).size,38);
 assert.equal(owners.reduce((n,c)=>n+c.triangleSupport.template.triangles.length,0),parts.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0));
 const visible=[];for(const m of parts){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const tri=[];for(let j=0;j<3;j++){const v=new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(m.matrixWorld);tri.push(v.toArray().map(Math.fround).join(','));}visible.push(tri.join(';'));}}
 const physical=owners.flatMap(c=>c.triangleSupport.template.triangles.map(t=>[t.triangle.a,t.triangle.b,t.triangle.c].map(v=>v.toArray().join(',')).join(';')));
 assert.deepEqual(physical.sort(),visible.sort(),'each owned world triangle is exactly its final visible triangle');
 geometryHealth({traverse:fn=>parts.forEach(fn)});
 for(const side of[-1,1]){
  const r=h.g.ramps[0],t=.5,z=r.zTop+(r.zToe-r.zTop)*t,y=r.yTop*(1-t);
  for(const height of[.04,.3])assert.ok(rayLocal(h.frame,h.g,[side*9-side,y+height,z],[side,0,0],2).some(i=>i.object.userData.xieheEastRail),'lower stone panel/plinth truly solid to ramp');
 }
 }finally{h.kit.dispose(h.kit.root);h.lib.dispose();}
});

const {execFileSync}=await import('node:child_process');
const url=new URL('../src/scene/palace/special/SideGate.js',import.meta.url);
let source=execFileSync('git',['show','4d614c22:src/scene/palace/special/SideGate.js'],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {buildSideGate:parent}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const {meshRows,hash,physical}=await import('./lib/r58-court-facade-fixture.mjs');
test('Only old two east slope collision bands are replaced; all walk surfaces retained',()=>{
 const a=fixture('xiehe',{},parent),b=fixture('xiehe');try{
 assert.deepEqual(b.kit.walkables,a.kit.walkables);
 const key=c=>JSON.stringify([c.min.toArray(),c.max.toArray()]),old=a.kit.colliders.map(key),retained=b.kit.colliders.filter(c=>!c.triangleSupport).map(key);
 const missing=[...old];for(const k of retained){const i=missing.indexOf(k);assert.notEqual(i,-1,'no new ordinary collider');missing.splice(i,1);}
 assert.equal(missing.length,104,'exactly two 52-piece sloping bands removed');
 for(const k of missing){const [lo,hi]=JSON.parse(k);assert.ok(hi[0]<=-112.3&&lo[0]>=-130.4);assert.ok(Math.abs((hi[2]-lo[2])-.2)<1e-6||Math.abs((hi[0]-lo[0])-.2)<1e-6,'only east slope or its return rail band');}
 }finally{for(const h of[a,b]){h.kit.dispose(h.kit.root);h.lib.dispose();}}
});
for(const profile of['xihe','longzong','jingyun'])test(`${profile} rendering and physics are exactly retained`,()=>{
 const a=fixture(profile,{},parent),b=fixture(profile);try{assert.equal(hash(meshRows(a.frame)),hash(meshRows(b.frame)));assert.equal(hash(physical(a.kit)),hash(physical(b.kit)));}finally{for(const h of[a,b]){h.kit.dispose(h.kit.root);h.lib.dispose();}}
});
test('Rail source geometries release once at merge while copied physical owners and library marble survive',()=>{
 const h=fixture('xiehe'),parts=meshes(h.frame).filter(m=>m.userData.xieheEastRail),counts=new Map(),marble=h.lib.material('marble');let materialDisposals=0,merged;
 for(const m of parts){counts.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>counts.set(m.geometry,counts.get(m.geometry)+1));}marble.addEventListener('dispose',()=>materialDisposals++);
 const owners=h.kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('xiehe-east-rail:')),before=hash(owners);
 try{merged=h.kit.finish();assert.ok([...counts.values()].every(n=>n===1));assert.equal(hash(owners),before);assert.equal(materialDisposals,0);h.kit.dispose(merged);merged=null;assert.ok([...counts.values()].every(n=>n===1));assert.equal(materialDisposals,0);}finally{if(merged)h.kit.dispose(merged);h.lib.dispose();}assert.equal(materialDisposals,1);
});
