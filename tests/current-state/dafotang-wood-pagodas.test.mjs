// Component and synthetic contract tests only. No real hall or GPU is loaded.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createDafotangWoodPagodas,buildDafotangWoodPagodas} from '../../src/scene/palace/special/DafotangWoodPagodas.js';
import {mergeByMaterial} from '../../src/utils/MergeUtils.js';
import {triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';
const ID='dafotang-wood-pagodas-source-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const near=(a,b)=>assert.ok(Math.abs(a-b)<2e-6,`${a} != ${b}`);
function fixture(){
 const root=new T.Group();root.name='outer-west';const f=new T.Group();f.position.set(221.9,0,241.1);root.add(f);
 const g={id:PLACE,w:45.7,d:16.2,y:.9,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit'},historicLayout:{id:'dafotang-historic-spatial-fit-v1',guardianSlots:[{subjectId:'heavenly-king',position:[2.83,1.32,5.6]},{subjectId:'weituo',position:[-2.83,1.32,5.6]}]},triadFit:{id:'dafotang-three-design-figures-v1'},weituoFit:{id:'dafotang-east-weituo-source-fit-v1'}};
 const material=new T.MeshStandardMaterial();
 for(const [id,key]of[[g.historicLayout.id,null],[g.weituoFit.id,'dafotangWeituo']]){const group=new T.Group();group.name=id;if(key)group.userData[key]=g.weituoFit;const mesh=new T.Mesh(new T.BoxGeometry(.1,.1,.1).translate(0,7,7),material);group.add(mesh);f.add(group);}
 const kit={root,colliders:[],owned:[material],walkables:[],rooms:[]};
 return{kit,f,g,p:{id:PLACE,key:'dafotang'},dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of kit.owned)m.dispose();}};
}
test('R256 actual paired geometry has nine narrowing octagonal tiers and square bases',()=>{
 const materials={body:new T.MeshStandardMaterial(),trim:new T.MeshStandardMaterial()};let out;
 try{out=createDafotangWoodPagodas({materials});assert.equal(out.group.children.length,2);assert.ok(out.meshes.length<=260);assert.equal(new Set(out.meshes.map(m=>m.geometry)).size,out.meshes.length);let triangles=0;
 for(const tower of out.group.children){const side=tower.userData.side,x=side*2.83,bounds=new T.Box3().setFromObject(tower);near(bounds.min.y,.9);near(bounds.max.y,6.1);near(bounds.min.x,x-.7);near(bounds.max.x,x+.7);near(bounds.min.z,1.7);near(bounds.max.z,3.1);
 const foot=tower.children.find(m=>m.userData.pagodaRole==='square-foot');const fb=new T.Box3().setFromObject(foot);near(fb.max.x-fb.min.x,1.4);near(fb.max.z-fb.min.z,1.4);
 let previous=Infinity;for(let level=0;level<9;level++){const parts=tower.children.filter(m=>m.userData.pagodaLevel===level);assert.equal(parts.length,12);const posts=parts.filter(m=>m.userData.pagodaRole==='bay-post');assert.equal(posts.length,8);const angles=posts.map(m=>{const c=new T.Box3().setFromObject(m).getCenter(new T.Vector3());return Math.atan2(c.x-x,c.z-2.4);}).sort((a,b)=>a-b);for(let j=1;j<8;j++)near(angles[j]-angles[j-1],Math.PI/4);
 const eave=parts.find(m=>m.userData.pagodaRole==='eave');const eb=new T.Box3().setFromObject(eave),width=eb.max.x-eb.min.x;assert.ok(width<previous);previous=width;near(eb.max.y,.9+1+(level+1)*.43);
 const core=parts.find(m=>m.userData.pagodaRole==='recess-core');const p=core.geometry.attributes.position,anglesCore=new Set();for(let j=0;j<p.count;j++){const vx=p.getX(j)-x,vz=p.getZ(j)-2.4;if(Math.hypot(vx,vz)>.01)anglesCore.add(Math.round(Math.atan2(vx,vz)*1e5));}assert.equal(anglesCore.size,8);
 // A mid-bay point lies outside the inner core, between corner posts, below lintel: physical recess, not an applied dark decal.
 const radius=.52-level*.025,theta=Math.PI/4,point=new T.Vector3(x+Math.sin(theta)*radius*.88,.9+1+level*.43+.19,2.4+Math.cos(theta)*radius*.88);
 const ray=new T.Raycaster(point,new T.Vector3(-Math.sin(theta),0,-Math.cos(theta)),0,.2);assert.ok(ray.intersectObject(core).length>0);assert.equal(ray.intersectObjects(posts).length,0);
 }
 }
 for(const m of out.meshes){assert.ok(m.visible&&m.castShadow&&m.receiveShadow);const p=m.geometry.attributes.position,ix=m.geometry.index;assert.ok([...p.array].every(Number.isFinite));let volume=0;for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+k)));assert.ok(new T.Triangle(...v).getArea()>1e-12);volume+=v[0].dot(v[1].clone().cross(v[2]))/6;triangles++;}assert.ok(volume>1e-9,m.name+' outward closed volume');}assert.ok(triangles<=6000);
 assert.equal(out.metadata.addedAfter,'QIANLONG_23');assert.equal(out.metadata.smallFiguresModeled,0);assert.equal(out.metadata.unmodeledDoesNotMeanHistoricallyEmpty,true);assert.equal(out.metadata.currentMuseumReconstruction,false);assert.equal(out.metadata.yuanDesignApplied,false);
 let disposals=0,matDisposals=0;for(const m of out.meshes)m.geometry.addEventListener('dispose',()=>disposals++);for(const m of Object.values(materials))m.addEventListener('dispose',()=>matDisposals++);out.dispose();out.dispose();assert.equal(disposals,out.meshes.length);assert.equal(matDisposals,0);console.log('R256_GEOMETRY '+JSON.stringify({meshes:out.meshes.length,triangles,bounds:[[-3.53,.9,1.7],[3.53,6.1,3.1]],scope:'component only'}));
 }finally{out?.dispose();for(const m of Object.values(materials))m.dispose();}
});
test('R256 synthetic installer owns real triangles and independent material merge buckets',()=>{
 const c=fixture();try{const before={walks:c.kit.walkables,rooms:c.kit.rooms,old:[...c.f.children],owned:[...c.kit.owned]},out=buildDafotangWoodPagodas(c);assert.equal(c.g.woodPagodasFit,out.metadata);assert.equal(out.group.parent,c.f);assert.equal(c.kit.owned.length,before.owned.length+2);assert.equal(c.kit.walkables,before.walks);assert.equal(c.kit.rooms,before.rooms);assert.deepEqual(c.f.children.slice(0,2),before.old);assert.equal(out.contacts.length,out.meshes.length);
 for(const m of out.meshes){const owners=out.contacts.filter(o=>o.dafotangWoodPagodaMesh===m.uuid);assert.equal(owners.length,1);const o=owners[0],s=o.triangleSupport,p=m.geometry.attributes.position,ix=m.geometry.index;assert.equal(s.id,m.name+'/'+m.uuid);assert.deepEqual(s.offset.toArray(),[221.9,0,241.1]);assert.ok(o.equals(new T.Box3().setFromObject(m)));assert.equal(s.template.triangles.length,ix.count/3);for(let i=0;i<s.template.triangles.length;i++)for(const [k,v]of[[0,s.template.triangles[i].triangle.a],[1,s.template.triangles[i].triangle.b],[2,s.template.triangles[i].triangle.c]])assert.ok(v.equals(new T.Vector3().fromBufferAttribute(p,ix.getX(i*3+k))));}
 const foot=out.contacts.find(o=>o.dafotangWoodPagodaRole==='square-foot');assert.ok(triangleBodyIntersects(foot.triangleSupport,new T.Box3().setFromCenterAndSize(foot.getCenter(new T.Vector3()),new T.Vector3(.05,.05,.05))));
 const oldColliderPositions=out.contacts.map(o=>o.clone());let merged;try{merged=mergeByMaterial(out.group);assert.equal(merged.children.length,2);assert.ok(merged.children.every(m=>c.kit.owned.includes(m.material)&&!before.owned.includes(m.material)));out.contacts.forEach((o,i)=>assert.ok(o.equals(oldColliderPositions[i])));assert.ok(triangleBodyIntersects(foot.triangleSupport,new T.Box3().setFromCenterAndSize(foot.getCenter(new T.Vector3()),new T.Vector3(.05,.05,.05))));}finally{merged?.traverse(m=>m.geometry?.dispose());}
 const snapshot=[c.f.children.length,c.kit.colliders.length,c.kit.owned.length];assert.throws(()=>buildDafotangWoodPagodas(c),/host|duplicate/i);assert.deepEqual([c.f.children.length,c.kit.colliders.length,c.kit.owned.length],snapshot);
 }finally{c.dispose();}
});
test('R256 refuses altered synthetic host without publication',()=>{
 const changes=[c=>c.p.id='wrong',c=>c.f.position.x++,c=>c.kit.root.scale.x=2,c=>c.f.children[0].position.x=1,c=>c.g.inventory.status='KNOWN',c=>c.g.historicLayout.guardianSlots[0].position[0]=0,c=>Object.freeze(c.kit.owned),c=>c.g.weituoFit.id='wrong',c=>c.f.children[1].children[0].visible=false,c=>Object.defineProperty(c.g,'woodPagodasFit',{set(){},configurable:true})];
 for(const change of changes){const c=fixture();try{change(c);const old=[...c.f.children],contacts=[...c.kit.colliders],owned=[...c.kit.owned];assert.throws(()=>buildDafotangWoodPagodas(c));assert.deepEqual(c.f.children,old);assert.deepEqual(c.kit.colliders,contacts);assert.deepEqual(c.kit.owned,owned);}finally{c.dispose();}}
});
test('R256 failed synthetic publication restores host and disposes every new resource',()=>{
 const c=fixture(),oldChildren=[...c.f.children],oldOwned=[...c.kit.owned],oldColliders=[...c.kit.colliders];let materialDisposals=0,geometryDisposals=0,createdMeshes=0;
 const push=c.kit.owned.push;c.kit.owned.push=function(...mats){for(const m of mats)m.addEventListener('dispose',()=>materialDisposals++);Array.prototype.push.apply(this,mats);throw Error('injected publish failure');};
 c.f.addEventListener('childadded',e=>{if(e.child.name===ID)e.child.traverse(m=>{if(m.isMesh){createdMeshes++;m.geometry.addEventListener('dispose',()=>geometryDisposals++);}});});
 try{assert.throws(()=>buildDafotangWoodPagodas(c),/injected publish failure/);assert.deepEqual(c.f.children,oldChildren);assert.deepEqual([...c.kit.owned],oldOwned);assert.deepEqual(c.kit.colliders,oldColliders);assert.equal('woodPagodasFit'in c.g,false);assert.equal(materialDisposals,2);assert.ok(createdMeshes>0);assert.equal(geometryDisposals,createdMeshes);}finally{c.kit.owned.push=push;c.dispose();}
});
test('R256 production call is unique and ordered without importing the real host',()=>{
 const host=fs.readFileSync(new URL('../../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),'utf8');assert.equal((host.match(/buildDafotangWoodPagodas\(c\)/g)||[]).length,1);assert.equal((host.match(/import \{buildDafotangWoodPagodas\} from '\.\/DafotangWoodPagodas.js';/g)||[]).length,1);assert.ok(host.includes('buildDafotangWeituo(c);buildDafotangWoodPagodas(c);registerDafotangPhotoSlots(c);'));
});
test('R256 component construction failure releases partially allocated geometry',()=>{
 const materials={body:new T.MeshStandardMaterial(),trim:new T.MeshStandardMaterial()},translate=T.BufferGeometry.prototype.translate,dispose=T.BufferGeometry.prototype.dispose,touched=new Set(),released=new Set();let calls=0;
 T.BufferGeometry.prototype.translate=function(...a){touched.add(this);if(++calls===5)throw Error('injected geometry failure');return translate.apply(this,a);};
 T.BufferGeometry.prototype.dispose=function(){assert.ok(!released.has(this));released.add(this);return dispose.call(this);};
 try{assert.throws(()=>createDafotangWoodPagodas({materials}),/injected geometry failure/);assert.ok(touched.size>0);assert.deepEqual(released,touched);}finally{T.BufferGeometry.prototype.translate=translate;T.BufferGeometry.prototype.dispose=dispose;for(const m of Object.values(materials))m.dispose();}
 assert.throws(()=>createDafotangWoodPagodas(),/materials required/);
});
