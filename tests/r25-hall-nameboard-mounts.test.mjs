import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
import {positionHallNameboard,DOUBLE_EAVE_NAMEBOARDS as N,HALL_NAMEBOARD_MOUNT as P} from '../src/scene/palace/HallNameboardMount.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const levels={'太和殿':[9.9375,9.9375],'保和殿':[9,10],'乾清宫':[2.16,7]};
function build(name){const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group(),[y,ref]=levels[name];b.buildHall(g,PALACE_LAYOUT.find(x=>x.name===name),y,{heightReferenceY:ref});g.updateMatrixWorld(true);return{b,g,roof:g.children.find(x=>x.userData.doubleEaveMountingBand),p:g.children.find(x=>x.userData.hallNameboardMount)}}

test('only the three source-supported south nameboards move to the double-eave band',()=>{
 assert.deepEqual(N,['太和殿','保和殿','乾清宫']);
 for(const name of N){const{b,g,roof,p}=build(name);try{
  assert.equal(g.children.filter(x=>x.userData.hallNameboardMount).length,1);
  const m=p.userData.hallNameboardMount,band=roof.userData.doubleEaveMountingBand,box=new THREE.Box3().setFromObject(p);
  const d=PALACE_LAYOUT.find(x=>x.name===name),H=THREE.MathUtils.clamp((d.dimensions.height-levels[name][1])*.38,5,11),ph=THREE.MathUtils.clamp(H*.32,1.8,3.4);
  near(p.geometry.parameters.height,ph);near(p.geometry.parameters.width,ph*.62);near(p.geometry.parameters.depth,.15);
  near(p.position.x,d.position.x);near(p.rotation.y,Math.PI);near(box.max.z,d.position.z-band.halfDepth-P.wallGap);
  assert.ok(box.min.y>=m.lowerY+P.surfaceMargin-1e-6);assert.ok(box.max.y<=m.upperY-P.surfaceMargin+1e-6);
  assert.ok(m.lowerY>=band.lowerY&&m.upperY<=band.upperY);assert.equal(m.surfaceProbes,12);
  assert.match(m.status,/NOT_SURVEY/);assert.equal(p.userData.noMerge,true);
  assert.equal(g.children.at(-2),p,'retain original child/material insertion order');assert.equal(g.children.at(-1),roof);
  const oldY=levels[name][0]+H*.88*.8+(H-H*.12-H*.88*.8)/2+.2;
  assert.ok(p.position.y>oldY+3,'old below-eave door-head location is vacated');
 }finally{b.dispose();}}
});

test('all real roof surface rays clear the complete retained board at actual building heights',()=>{
 for(const name of N){const{b,roof,p}=build(name);try{
  const {width,height,depth}=p.geometry.parameters,local=roof.worldToLocal(p.getWorldPosition(new THREE.Vector3()));
  for(const x of[-width/2,0,width/2])for(const z of[local.z-depth/2,local.z+depth/2]){
   const origin=roof.localToWorld(new THREE.Vector3(x,local.y,z));
   for(const dir of[-1,1]){const hit=new THREE.Raycaster(origin,new THREE.Vector3(0,dir,0),0,20).intersectObject(roof,true)[0];assert.ok(hit);assert.ok(hit.distance>=height/2+P.surfaceMargin-1e-5);}
  }
 }finally{b.dispose();}}
});

test('appearance uncertainty remains explicit, especially missing Manchu and carved frames',()=>{
 for(const name of N){const{b,p}=build(name);try{
  assert.equal(p.material,b._own.get(`plaque:${name}`));
  assert.match(p.userData.hallNameboardMount.appearanceStatus,name==='乾清宫'?/HAN_ONLY_MANCHU_AND_CARVED_FRAME_UNRESOLVED/:/SYSTEM_FONT_AND_RECTANGULAR_FRAME/);
 }finally{b.dispose();}}
});

test('unregistered halls are untouched and invalid or unavailable roof bands fail closed',()=>{
 const{b,p,roof}=build('保和殿');try{
  const before=p.matrix.toArray(),pos=p.position.toArray();assert.equal(positionHallNameboard(p,roof,'中和殿'),false);assert.deepEqual(p.position.toArray(),pos);assert.deepEqual(p.matrix.toArray(),before);
  const band=roof.userData.doubleEaveMountingBand;delete roof.userData.doubleEaveMountingBand;assert.throws(()=>positionHallNameboard(p,roof,'保和殿'),/finite generated/);roof.userData.doubleEaveMountingBand=band;
  const geometry=p.geometry;p.geometry=new THREE.BoxGeometry(1,10,.15);assert.throws(()=>positionHallNameboard(p,roof,'保和殿'),/does not fit/);p.geometry.dispose();p.geometry=geometry;
  const empty=new THREE.Group();empty.userData.doubleEaveMountingBand=band;assert.throws(()=>positionHallNameboard(p,empty,'保和殿'),/could not be established/);
 }finally{b.dispose();}
});

test('complete navigation remains byte-identical and exactly three boards exist in full resident scene',()=>{
 const s=new THREE.Scene(),b=new PalaceBuilder(s,library());try{b.buildAll(PALACE_LAYOUT);const boards=[];s.traverse(m=>{if(m.userData.hallNameboardMount)boards.push(m)});
 assert.deepEqual(boards.map(m=>m.userData.hallNameboardMount.name).sort(),[...N].sort());
 assert.equal(hash({colliders:b.colliders,walkables:b.walkables}),'a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853');assert.equal(b.colliders.length,2487);assert.equal(b.walkables.length,120);
 }finally{b.dispose();}
});

test('production TextureLibrary material names are supported while unknown surfaces remain rejected',()=>{
 const lib=library(),material=lib.material.bind(lib);lib.material=(n,p)=>{const m=material(n,p);m.name=n+'_material';return m;};
 const b=new PalaceBuilder(new THREE.Scene(),lib),g=new THREE.Group();try{b.buildHall(g,PALACE_LAYOUT.find(x=>x.name==='保和殿'),9,{heightReferenceY:10});
 const p=g.children.find(x=>x.userData.hallNameboardMount),roof=g.children.find(x=>x.userData.doubleEaveMountingBand);assert.ok(p);assert.equal(p.userData.hallNameboardMount.surfaceProbes,12);
 const changed=[];roof.traverse(m=>{if(m.isMesh&&m.material.name==='roof_tile_material'){changed.push(m.material);m.material.name='unexpected-material';}});
 assert.ok(changed.length);assert.throws(()=>positionHallNameboard(p,roof,'保和殿'),/could not be established/);
 }finally{b.dispose();}
});
