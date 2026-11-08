import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createTriangleTemplate} from '../../src/utils/TriangleSupport.js';
const modulePath = '../../src/scene/palace/special/DafotangMainBuddha.js';
const id = 'dafotang-shakyamuni-historical-fit', placeId = 'place-outer-west-6cae88b6a2';
import {fixture} from './fixture.mjs';

const build=async c=>(await import(modulePath)).buildDafotangMainBuddha(c);
const cleanup=c=>{c.f.traverse(o=>o.geometry?.dispose());for(const m of c.kit.owned)m.dispose();};
const meshBounds=meshes=>meshes.reduce((b,m)=>b.union(new T.Box3().setFromObject(m)),new T.Box3());

test('single historical principal has real 2.25m seated figure+lotus and separate fitted support',async()=>{
 const c=fixture();try{const out=await build(c);assert.equal(out.meta.id,id);assert.equal(out.meta.placeId,placeId);assert.equal(out.meta.inventoryAccepted,false);assert.equal(out.meta.historicalOnly,true);
 assert.ok(out.meshes.length>60,'Not a few primitive placeholder boxes');assert.ok(out.meshes.every(m=>m.isMesh&&m.geometry.attributes.position));
 const figure=out.meshes.filter(m=>m.userData.part!=='support'),support=out.meshes.filter(m=>m.userData.part==='support');const b=meshBounds(figure),s=meshBounds(support);
 assert.ok(Math.abs(b.max.y-b.min.y-2.25)<1e-5);assert.ok(Math.abs(s.max.y-s.min.y-.8)<1e-5);assert.ok(Math.abs(b.min.y-s.max.y)<1e-5);
 assert.ok(b.max.y<4.0&&b.min.y>1.69);assert.deepEqual(c.g.inventory,{status:'UNKNOWN',knownEmpty:false,accepted:false,entityId:placeId,withheldMeshCount:8,withheldColliderCount:8});
 }finally{cleanup(c);}
});
test('source-supported silhouette has eight actual petal tiers, crossed legs and correctly sided different hands',async()=>{
 const c=fixture();try{const {meshes}=await build(c);const petals=meshes.filter(m=>m.userData.part==='lotus-petal');assert.deepEqual([...new Set(petals.map(m=>m.userData.tier))].sort(),[1,2,3,4,5,6,7,8]);assert.ok(petals.length>=96);
 for(const tier of [1,2,3,4,5,6,7,8])assert.ok(petals.filter(m=>m.userData.tier===tier).length>=12);
 const right=meshes.find(m=>m.userData.role==='right-hand-down'),left=meshes.find(m=>m.userData.role==='left-hand-up');assert.ok(right&&left);const rb=meshBounds([right]),lb=meshBounds([left]);assert.ok(rb.getCenter(new T.Vector3()).x>221.9&&lb.getCenter(new T.Vector3()).x<221.9);assert.ok(rb.min.y<lb.min.y-.08);
 assert.ok(meshes.some(m=>m.userData.role==='crossed-knees'));assert.ok(meshes.some(m=>m.userData.role==='covered-shoulders'));assert.ok(meshes.filter(m=>m.userData.part==='ear').length===2);assert.ok(meshes.some(m=>m.userData.part==='hair-curl'));assert.ok(!meshes.some(m=>/high-topknot|halo|flank-buddha/.test(m.name)));
 }finally{cleanup(c);}
});
test('all visible geometry is finite, nondegenerate, bounded and under the documented small-component budget',async()=>{
 const c=fixture();try{const out=await build(c),reserve=new T.Box3(new T.Vector3(220.65,.9-1e-6,245.6),new T.Vector3(223.15,4,247.8));let triangles=0;
 for(const m of out.meshes){assert.ok(reserve.containsBox(new T.Box3().setFromObject(m)),m.name);const t=createTriangleTemplate(m.geometry);triangles+=t.triangles.length;assert.ok(m.material.isMeshStandardMaterial);}
 assert.ok(triangles>3000&&triangles<=20000,triangles);assert.ok(c.kit.owned.length<=4);assert.equal(new Set(c.kit.owned).size,c.kit.owned.length);
 }finally{cleanup(c);}
});
test('contacts retain exact visible raw owners: support solids are boxes, statue surfaces are CPU triangles',async()=>{
 const c=fixture();try{const out=await build(c);assert.equal(out.contacts.length,out.meshes.length);assert.deepEqual(c.kit.colliders,out.contacts);
 for(const m of out.meshes){const contacts=out.contacts.filter(b=>b.dafotangPrincipalMesh===m.uuid);assert.equal(contacts.length,1);const contact=contacts[0];assert.equal(contact.dafotangPrincipalRole,m.userData.role);
 assert.ok(contact.min.distanceTo(new T.Box3().setFromObject(m).min)<1e-5&&contact.max.distanceTo(new T.Box3().setFromObject(m).max)<1e-5);
 if(m.userData.part==='support')assert.equal(contact.triangleSupport,undefined);else{assert.equal(contact.triangleSupport.template.triangles.length,(m.geometry.index?.count??m.geometry.attributes.position.count)/3);assert.ok(contact.triangleSupport.id.startsWith(id+'/'));}}
 for(const k of ['walkables','rooms','mapItems','regions','plaques'])assert.equal(c.kit[k].length,0,k);
 }finally{cleanup(c);}
});
test('legacy refs and their multiplicities remain intact and the feature is separately cloneable metadata',async()=>{
 const c=fixture(),material=new T.MeshBasicMaterial(),mesh=new T.Mesh(new T.BoxGeometry(1,1,1),material),box=new T.Box3();c.f.add(mesh);c.kit.colliders.push(box,box);c.kit.owned.push(material);const inventory=c.g.inventory;
 try{const out=await build(c);assert.equal(c.f.children[0],mesh);assert.equal(c.kit.colliders[0],box);assert.equal(c.kit.colliders[1],box);assert.equal(c.kit.owned[0],material);assert.equal(c.g.inventory,inventory);assert.deepEqual(structuredClone(c.g.historicalPrincipal),out.meta);assert.equal(c.f.userData.structure,undefined,'Host finish remains responsible for full architecture projection');
 }finally{cleanup(c);}
});
test('duplicate, alias/wrong ID and changed fitted frame fail before adding anything',async()=>{
 const bad=[c=>c.p.id='fake',c=>c.p.key='cining',c=>c.item.x+=.1,c=>c.item.name='大佛堂别称',c=>c.g.y=1,c=>c.g.warmRoomPartitions[0].doorZ=-5,c=>c.f.rotation.y=.1,c=>c.kit.root.scale.y=2,c=>c.g.inventory.accepted=true];
 for(const mutate of bad){const c=fixture();mutate(c);await assert.rejects(build(c),/Dafotang/);assert.equal(c.f.children.length,0);assert.equal(c.kit.colliders.length,0);assert.equal(c.kit.owned.length,0);}
 const c=fixture();try{await build(c);const n=c.kit.colliders.length;await assert.rejects(build(c),/duplicate/i);assert.equal(c.kit.colliders.length,n);}finally{cleanup(c);}
});
test('partial publication failure rolls back only new refs and disposes every new resource',async()=>{
 const c=fixture(),old=new T.Box3();c.kit.colliders.push(old,old);const geom=[],mats=[];const gd=T.BufferGeometry.prototype.dispose,md=T.Material.prototype.dispose;T.BufferGeometry.prototype.dispose=function(){geom.push(this);return gd.call(this);};T.Material.prototype.dispose=function(){mats.push(this);return md.call(this);};
 c.kit.owned.push=function(){throw Error('injected owned registration failure');};
 try{await assert.rejects(build(c),/injected/);assert.deepEqual(c.kit.colliders,[old,old]);assert.equal(c.f.children.length,0);assert.equal(c.g.historicalPrincipal,undefined);assert.equal(c.kit.owned.length,0);assert.ok(geom.length>60);assert.equal(new Set(mats).size,4);}
 finally{T.BufferGeometry.prototype.dispose=gd;T.Material.prototype.dispose=md;}
});

test('closed visible solids have outward winding for ray and triangle-support semantics',async()=>{
 const c=fixture();try{const {meshes}=await build(c);for(const m of meshes){const p=m.geometry.attributes.position,ix=m.geometry.index;let volume=0;const edges=new Map();const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
 for(let i=0;i<ix.count;i+=3){const ids=[0,1,2].map(k=>ix.getX(i+k)),v=ids.map(k=>new T.Vector3().fromBufferAttribute(p,k));volume+=v[0].dot(v[1].clone().cross(v[2]))/6;for(const[a,b]of[[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){const ka=key(a),kb=key(b),k=[ka,kb].sort().join('|');const record=edges.get(k)??{n:0,orientation:0};record.n++;record.orientation+=ka<kb?1:-1;edges.set(k,record);}}
 assert.ok(volume>1e-10,m.userData.role+' positive outward volume');assert.ok([...edges.values()].every(e=>e.n===2&&e.orientation===0),m.userData.role+' closed oriented manifold');}
 }finally{cleanup(c);}
});

test('small documented front jewel and auspicious chest relief do not become a tall topknot or jewelry robe',async()=>{
 const c=fixture();try{const {meshes}=await build(c),jewel=meshes.find(m=>m.userData.role==='small-front-hair-jewel'),chest=meshes.filter(m=>m.userData.part==='chest-mark');assert.ok(jewel);assert.equal(chest.length,8);const jb=meshBounds([jewel]);assert.ok(jb.max.y<3.95&&jb.max.y-jb.min.y<.06);for(const m of chest)assert.equal(m.userData.detailStatus,'TEXT_SUPPORTED_SHALLOW_FIT_NOT_EXACT_PATTERN');}finally{cleanup(c);}
});

test('v2 source-photo fit uses denser upper-wide petals and separately rounded knees rather than the former tray silhouette',async()=>{
 const c=fixture();try{const {meshes}=await build(c);const petals=meshes.filter(m=>m.userData.part==='lotus-petal');assert.equal(petals.length,192,'24 fitted petals in each of eight tiers, not a historical count');
 const lower=meshBounds(petals.filter(m=>m.userData.tier===2)),upper=meshBounds(petals.filter(m=>m.userData.tier===7));assert.ok(upper.max.x-upper.min.x>lower.max.x-lower.min.x+.12,'upper-wider fitted outline');
 const knees=meshes.filter(m=>m.userData.role==='crossed-knees'||m.userData.role==='right-rounded-knee');assert.equal(knees.length,2);assert.ok(meshBounds(knees).getSize(new T.Vector3()).x<meshBounds(petals).getSize(new T.Vector3()).x-.12);
 const face=meshes.find(m=>m.userData.role==='rounded-face');for(const role of ['nose','neck','long-ear--1','long-ear-1'])assert.equal(meshes.find(m=>m.userData.role===role).material,face.material,role+' continuous fitted skin color');
 }finally{cleanup(c);}
});

test('each visible petal tier projects beyond the internal lotus core rather than being buried by it',async()=>{
 const c=fixture();try{const {meshes}=await build(c),core=meshes.find(m=>m.userData.role==='upper-wide-lotus-core');
 for(let tier=1;tier<=8;tier++){const petal=meshes.find(m=>m.userData.role==='lotus-tier-'+tier+'-petal-0'),center=new T.Box3().setFromObject(petal).getCenter(new T.Vector3()),axis=new T.Vector3(221.9,center.y,246.7),radial=center.clone().sub(axis).normalize(),ray=new T.Raycaster(axis.clone().addScaledVector(radial,3),radial.clone().negate()),hits=ray.intersectObjects([core,petal],false);assert.ok(hits.length>0,'tier '+tier+' has a visible closed surface');assert.ok(hits[0].object===petal,'tier '+tier+' must not be occluded by its internal core; first role='+hits[0].object.userData.role);}
 }finally{cleanup(c);}
});

test('v3 narrows the shoulder-to-elbow sleeves while keeping the existing hand and knee positions',async()=>{
 const c=fixture();try{const {meshes}=await build(c),sleeves=meshes.filter(m=>/^(right|left)-draped-sleeve$/.test(m.userData.role)),knees=meshes.filter(m=>m.userData.role==='crossed-knees'||m.userData.role==='right-rounded-knee');
 assert.equal(sleeves.length,2);assert.ok(meshBounds(sleeves).getSize(new T.Vector3()).x<meshBounds(knees).getSize(new T.Vector3()).x-.25,'sleeves are distinctly narrower than fitted knees');

 }finally{cleanup(c);}
});

test('v3 lotus has one restrained tone without invented alternating whole-petal colors',async()=>{
 const c=fixture();try{const {meshes}=await build(c),lotus=meshes.filter(m=>m.userData.part==='lotus'||m.userData.part==='lotus-petal');assert.equal(new Set(lotus.map(m=>m.material)).size,1,'one restrained lotus tone, no invented periodic petal colors');}finally{cleanup(c);}
});
