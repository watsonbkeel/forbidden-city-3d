import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {GardenBuilder} from '../src/scene/GardenBuilder.js';import {PALACE_LAYOUT} from '../src/scene/Layout.js';import {gardenLibrary} from './lib/r48-garden-fixture.mjs';
import {signature} from './r47-independent-capture.mjs';import {BuilderBefore,oldGardenConfig} from './fixtures/r64-g-garden/fixture.mjs';
import {tianyiGroundExclusions} from '../src/scene/palace/special/TianyiGate.js';
import {CourtKit} from '../src/scene/palace/kit.js';
const cfg=JSON.parse(fs.readFileSync(new URL('../data/zones/garden.json',import.meta.url))),old=JSON.parse(fs.readFileSync(new URL('./fixtures/r48-garden-r47.json',import.meta.url)));
test('R64 actual ornament triangles no longer penetrate the source-backed Tianyi screens and rails',()=>{
 const b=new GardenBuilder(new THREE.Scene(),gardenLibrary()),k=new CourtKit(gardenLibrary(),'garden'),root=new THREE.Group();b.hallPos=new THREE.Vector3(0,0,493.1);b.hallDim={depth:14.1};b.beds=[];b.bronzeMat=b.own(new THREE.MeshStandardMaterial());
 try{b.buildOrnaments(root,0);k.gate(cfg.items.at(-1));root.updateMatrixWorld(true);k.root.updateMatrixWorld(true);const boxes=[];k.root.traverse(m=>{if(m.isMesh&&['tianyi-screen-plain-field','tianyi-stone-rail','tianyi-stone-post'].includes(m.name))boxes.push(new THREE.Box3().setFromObject(m));});let contacts=0;root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const tri=new THREE.Triangle(...[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(m.matrixWorld)));if(boxes.some(box=>box.intersectsTriangle(tri)))contacts++;}});assert.equal(contacts,0,'ornament triangle/solid screen intersections');}
 finally{root.traverse(m=>m.geometry?.dispose());b.dispose();k.dispose(k.root);}
});
test('R64 appended Tianyi leaves every earlier 40 garden item byte-value exact',()=>assert.deepEqual(cfg,{...oldGardenConfig,items:[...oldGardenConfig.items,cfg.items[40]]}));
test('R64 Tianyi leaves 34 exact tree instances, paths/beds and rock untouched; paired-pavilion successor is separate',()=>{
 const b=new GardenBuilder(new THREE.Scene(),gardenLibrary()),out={};
 for(const [name,key,filter] of[['buildOrnaments','ornaments',()=>true],['buildRockeryAndTop','rock',x=>x.name==='duixiu_rockery'],['buildPavilions','pair',x=>x.name.startsWith('cross_pavilion_')]]){const fn=b[name];b[name]=function(root,...a){const n=root.children.length,c=this.colliders.length,w=this.walkables.length;fn.call(this,root,...a);out[key]={geometry:signature(root.children.slice(n).filter(filter)),colliders:JSON.stringify(this.colliders.slice(c)),walkables:JSON.stringify(this.walkables.slice(w))};};}
 try{b.build(PALACE_LAYOUT.find(x=>x.type==='garden'));assert.deepEqual(signature(b.group.children.filter(x=>x.name!=='garden_static')),old.trees);assert.equal(b.stats.trees,34);assert.deepEqual(b.paths,old.paths);assert.deepEqual(b.beds,old.beds);assert.equal(JSON.parse(out.ornaments.colliders).length,4);assert.deepEqual(out.rock.geometry,old.rock);assert.equal(out.pair.geometry.meshes,old.pair.meshes+3,'only one sphere replaced by four finial solids; exact other meshes guarded by r64-garden-small-silhouettes');}finally{b.dispose();}
});
test('R64 bed edits affect only actual footprint overlap, no terrain physics or untouched curb/grass values',()=>{
 const scene=new THREE.Scene(),a=new BuilderBefore.GardenBuilder(scene,gardenLibrary()),b=new GardenBuilder(scene,gardenLibrary());
 const capture=builder=>{const rows=[],fn=builder.buildGround;builder.buildGround=function(root,...args){fn.call(this,root,...args);root.updateMatrixWorld(true);for(const m of root.children)rows.push({hash:signature([m]).hash,material:m.material.name,bounds:new THREE.Box3().setFromObject(m)});};for(const n of['buildPonds','buildPavilions','buildOrnaments','buildRockeryAndTop','buildTrees'])builder[n]=()=>{};builder.build(PALACE_LAYOUT.find(x=>x.type==='garden'));return rows;};
 try{const before=capture(a),after=capture(b);assert.deepEqual(a.colliders,b.colliders);assert.deepEqual(a.walkables,b.walkables);assert.deepEqual(a.paths,b.paths);assert.deepEqual(a.beds,b.beds);
 const remaining=[...after],changedBefore=[];for(const row of before){const i=remaining.findIndex(x=>x.hash===row.hash);if(i<0)changedBefore.push(row);else remaining.splice(i,1);}
 assert.ok(changedBefore.length>0);for(const row of changedBefore){assert.ok(['grass','marble'].includes(row.material));assert.ok(tianyiGroundExclusions().some(e=>row.bounds.max.x>e[0]&&row.bounds.min.x<e[1]&&row.bounds.max.z>e[2]&&row.bounds.min.z<e[3]));}
 for(const row of remaining)assert.ok(changedBefore.some(old=>old.material===row.material&&old.bounds.clone().expandByScalar(1e-5).containsBox(row.bounds)));
 assert.ok(before.length-changedBefore.length>30,'retain independently compared untouched ground meshes');
 }finally{a.dispose();b.dispose();}
});

test('R64 only two named conflicting lamps and their own two boxes are withheld; other ornament bytes exact',()=>{
 const make=C=>{const b=new C(new THREE.Scene(),gardenLibrary()),root=new THREE.Group();b.hallPos=new THREE.Vector3(0,0,493.1);b.hallDim={depth:14.1};b.beds=[];b.bronzeMat=b.own(new THREE.MeshStandardMaterial());b.buildOrnaments(root,0);root.updateMatrixWorld(true);return{b,root};},a=make(BuilderBefore.GardenBuilder),b=make(GardenBuilder);
 const targeted=o=>Math.abs(Math.abs(o.position.x)-3.3)<1e-8&&Math.abs(o.position.z-463.1)<1e-8;
 try{assert.equal(a.root.children.filter(targeted).length,2);assert.equal(b.root.children.filter(targeted).length,0);assert.deepEqual(signature(a.root.children.filter(x=>!targeted(x))),signature(b.root.children));const kept=a.b.colliders.filter(c=>!targeted({position:c.getCenter(new THREE.Vector3())}));assert.deepEqual(b.b.colliders,kept);assert.equal(a.b.colliders.length-b.b.colliders.length,2);}finally{for(const q of[a,b]){q.root.traverse(m=>m.geometry?.dispose());q.b.dispose();}}
});
