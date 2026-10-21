import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
const roles=new Set(['wenhua-scroll-support','wenhua-scroll-retaining-lip','wenhua-horizontal-screen-muntin','wenhua-screen-panel-post']);
function fixture(part){const config=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url)));const b=new ZoneBase(library(),config);b.buildHall(config.items.find(x=>x.southCourtProfile===`wenhua-${part}`));b.kit.root.updateMatrixWorld(true);return b.kit;}
function vertexStats(root,material){let count=0;const box=new THREE.Box3();root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||o.material!==material)return;const a=o.geometry.attributes.position;const ix=o.geometry.index;count+=ix?.count??a.count;for(let n=0;n<a.count;n++){const p=new THREE.Vector3().fromBufferAttribute(a,n).applyMatrix4(o.matrixWorld);assert.ok(p.toArray().every(Number.isFinite));box.expandByPoint(p);}});return {count,box};}
test('R39 independent: added Wenhua geometry survives material merging with finite bounds and triangle counts',()=>{
 for(const part of ['front','connector']){const kit=fixture(part),selected=[];kit.root.traverse(o=>{if(roles.has(o.userData.role))selected.push(o);});assert.ok(selected.length>0);const mats=[...new Set(selected.map(o=>o.material))],before=mats.map(m=>vertexStats(kit.root,m));const merged=kit.finish();mats.forEach((m,i)=>{const after=vertexStats(merged,m);assert.equal(after.count,before[i].count);assert.ok(after.box.min.distanceTo(before[i].box.min)<1e-4);assert.ok(after.box.max.distanceTo(before[i].box.max)<1e-4);});kit.dispose(merged);}
});
test('R39 independent: new Wenhua meshes use owned shared materials, disposed once after merge and never during merge',()=>{
 for(const part of ['front','connector']){const kit=fixture(part),selected=[];kit.root.traverse(o=>{if(roles.has(o.userData.role))selected.push(o);});const mats=[...new Set(selected.map(o=>o.material))],events=new Map(mats.map(m=>[m,0]));for(const m of mats){assert.equal(kit.owned.filter(x=>x===m).length,1);m.addEventListener('dispose',()=>events.set(m,events.get(m)+1));}const merged=kit.finish();for(const m of mats)assert.equal(events.get(m),0);kit.dispose(merged);for(const m of mats)assert.equal(events.get(m),1);}
});
test('R39 independent: inclined board and lip vertex footprints stay inside chamfered cabinet, not just its bounding box',()=>{
 const kit=fixture('connector'),cases=[],objects=[];kit.root.traverse(o=>{if(o.userData.role==='wenhua-display-case')cases.push(o);if(['wenhua-scroll-support','wenhua-scroll-retaining-lip'].includes(o.userData.role))objects.push(o);});assert.equal(objects.length,4);
 for(const o of objects){const c=cases.find(c=>o.position.x>c.userData.bounds.x0&&o.position.x<c.userData.bounds.x1);assert.ok(c);const {x0,x1,z0,z1}=c.userData.bounds,ch=Math.min(.22,(x1-x0)/3,(z1-z0)/3),a=o.geometry.attributes.position;o.updateMatrix();for(let n=0;n<a.count;n++){const p=new THREE.Vector3().fromBufferAttribute(a,n).applyMatrix4(o.matrix);assert.ok(p.x>=x0&&p.x<=x1&&p.z>=z0&&p.z<=z1);for(const [x,z]of[[x0,z0],[x0,z1],[x1,z0],[x1,z1]])assert.ok(Math.abs(p.x-x)+Math.abs(p.z-z)>=ch-1e-6,'equipment protrudes through clipped corner');}}
 kit.dispose(kit.root);
});
