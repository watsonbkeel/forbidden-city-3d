import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {zhongheFragment,meshRows,hash,geometrySignature} from './lib/r55-zhonghe-fragment.mjs';
import {hallFragment,meshRows as jiaotaiRows} from './lib/r54-jiaotai-fragment.mjs';
const before=JSON.parse(fs.readFileSync(new URL('./fixtures/r55-zhonghe-before.json',import.meta.url)));

test('R55 Zhonghe replaces only the generic double dais, solid chair and high flat screen',()=>{
 const {group,shell,builder}=zhongheFragment(),p=shell.userData.structure.displaySetting;
 assert.ok(p,'dedicated low Zhonghe display must replace generic high dais');
 assert.equal(p.id,'zhonghe-display-setting-r55');
 assert.equal(p.dimensionStatus,'REVERSIBLE_PHOTO_FIT_NOT_MEASURED');
 assert.equal(p.photographyDate,null);assert.equal(p.reconstructionYear,null);
 assert.deepEqual(meshRows(group).filter(r=>!r.displayId),before.retainedZhonghe,'all shell / plaque / two inherited tripods remain exact');
 assert.deepEqual(builder.colliders.slice(0,before.retainedColliders.length).map(b=>({min:b.min.toArray(),max:b.max.toArray()})),before.retainedColliders);
 for(const old of before.removedColliders)assert.equal(builder.colliders.some(b=>hash({min:b.min.toArray(),max:b.max.toArray()})===hash(old)),false,'legacy high ghost collider is gone');
 for(const old of before.removedMeshes)assert.equal(meshRows(group).some(r=>r.hash===old.hash),false,old.semantic+' is not retained under a new name');
 const base=group.getObjectByName('r55-zhonghe-low-platform'),b=new THREE.Box3().setFromObject(base);
 assert.ok(Math.abs(b.min.y-8.63)<1e-6);assert.ok(b.max.y-8.63>=.12&&b.max.y-8.63<=.22);
 assert.equal(group.children.flatMap(g=>g.children).filter(m=>m.name.startsWith('r55-zhonghe-chair-leg-')).length,4);
 const seat=new THREE.Box3().setFromObject(group.getObjectByName('r55-zhonghe-chair-seat'));
 assert.ok(seat.min.y>b.max.y+.35,'actual negative space beneath seat, not another solid block');
 const legs=group.children.flatMap(g=>g.children).filter(m=>m.name.startsWith('r55-zhonghe-chair-leg-'));
 for(const m of legs)assert.ok(Math.abs(new THREE.Box3().setFromObject(m).min.y-b.max.y)<1e-6,'legs contact the low platform');
 assert.ok(p.replacement.removed.includes('legacy-high-screen-and-three-flat-caps'));
 assert.equal(p.supportRevision.retainedHighScreen,false,'old high screen is not supported on invented blocks');
});

test('R55 preserves complete R54 Jiaotai geometry, colliders and untouched source owners',()=>{
 const j=hallFragment();assert.deepEqual(jiaotaiRows(j.group),before.jiaotai);
 assert.deepEqual(j.builder.colliders.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),before.jiaotaiColliders);
 for(const [file,digest]of Object.entries(before.retainedSources))assert.equal(hash(fs.readFileSync(new URL('../'+file,import.meta.url))),digest,file);
});

test('all actual plinth, four-side stairs and R8 imperial stones retain frozen R54 geometry',()=>{
 const {group}=zhongheFragment({plinth:true});
 assert.deepEqual(meshRows(group).filter(r=>!r.displayId),before.retainedIncludingPlinth);
});

test('every new physical registration matches its visible owner and low support is non-rescue',()=>{
 const {group,shell,builder}=zhongheFragment(),p=shell.userData.structure.displaySetting;assert.ok(p);
 const newMeshes=[];group.traverse(m=>{if(m.userData.zhongheDisplayId)newMeshes.push(m);});
 assert.equal(new Set(newMeshes.map(m=>m.name)).size,newMeshes.length);
 assert.equal(p.colliders.length,builder.colliders.length-before.retainedColliders.length);
 for(const row of p.colliders){const m=group.getObjectByName(row.owner);assert.ok(m,row.owner);const bounds=new THREE.Box3().setFromObject(m);
  for(const key of ['min','max'])for(let i=0;i<3;i++)assert.ok(Math.abs(bounds[key].getComponent(i)-row[key][i])<1e-6,row.owner+' exact envelope');
  assert.equal(builder.colliders.filter(c=>['min','max'].every(key=>c[key].toArray().every((v,i)=>Math.abs(v-row[key][i])<1e-6))).length,1);}
 assert.equal(builder.walkables.length,1);assert.equal(builder.walkables[0].rescue,false);
 const base=new THREE.Box3().setFromObject(group.getObjectByName('r55-zhonghe-low-platform'));
 assert.deepEqual(builder.walkables[0].box.min.toArray(),[base.min.x,base.max.y,base.min.z]);
 assert.deepEqual(builder.walkables[0].box.max.toArray(),[base.max.x,base.max.y,base.max.z]);
 assert.ok(newMeshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0)<=6000);
 for(const m of newMeshes){const g=m.geometry,a=g.attributes.position,index=g.index;for(const value of a.array)assert.ok(Number.isFinite(value));
  let volume=0;for(let i=0;i<(index?.count??a.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),pts=ids.map(j=>new THREE.Vector3().fromBufferAttribute(a,j)),face=pts[1].clone().sub(pts[0]).cross(pts[2].clone().sub(pts[0]));assert.ok(face.length()>1e-9,m.name+' nonzero face');
   const normal=ids.reduce((s,j)=>s.add(new THREE.Vector3().fromBufferAttribute(g.attributes.normal,j)),new THREE.Vector3());assert.ok(face.dot(normal)>0,m.name+' normals face outward');volume+=pts[0].dot(pts[1].clone().cross(pts[2]))/6;}
  assert.ok(volume>0,m.name+' positive closed volume');}
});

test('new private materials and merged geometry are released exactly once and deterministic rebuild preserves identities',()=>{
 const a=zhongheFragment({plinth:true,merge:true}),rows=[];a.scene.traverse(m=>{if(m.isMesh&&m.material.name.startsWith('r55-zhonghe-'))rows.push(m);});
 const materials=[...new Set(rows.map(m=>m.material))],geometries=rows.map(m=>m.geometry),events=new Map();
 for(const o of [...materials,...geometries]){events.set(o,0);o.addEventListener('dispose',()=>events.set(o,events.get(o)+1));}
 const original=meshRows(a.scene);a.builder.dispose();
 for(const [o,n]of events)assert.equal(n,1,o.type+' disposed once');
 assert.equal(a.scene.children.length,0);assert.equal(a.builder.colliders.length,0);assert.equal(a.builder.walkables.length,0);
 const b=zhongheFragment({plinth:true,merge:true});assert.deepEqual(meshRows(b.scene),original);b.builder.dispose();
});

test('basic-material pass preserves every neutral vertex, transform, index, UV and physical registration',()=>{
 const neutral=JSON.parse(fs.readFileSync(new URL('../docs/validation/r55-zhonghe-display/neutral/geometry-and-navigation.json',import.meta.url)));
 const {group,shell,builder}=zhongheFragment({plinth:true}),p=shell.userData.structure.displaySetting;
 assert.equal(geometrySignature(group),neutral.geometryHash);
 assert.deepEqual(p.colliders,neutral.display.colliders);assert.deepEqual(p.walkables,neutral.display.walkables);
 assert.equal(p.stage,'SOURCE_BOUNDED_BASE_MATERIALS_PARTIAL_NOT_RESTORATION');
 const palette={};group.traverse(m=>{if(m.userData.zhongheDisplayId){palette[m.material.name]=m.material.color.getHex();assert.equal(m.material.map,null);}});
 assert.deepEqual(palette,{'r55-zhonghe-platform':0x8f9786,'r55-zhonghe-rim':0x5c4e3c,'r55-zhonghe-wood':0x675132,'r55-zhonghe-ochre':0xb8a055});
 for(const [name,digest]of Object.entries(before.retainedSources))assert.equal(hash(fs.readFileSync(new URL('../'+name,import.meta.url))),digest);
 builder.dispose();
});
