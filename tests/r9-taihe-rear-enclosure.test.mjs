// Exact pre-R25 nameboard poses for historical whole-hall fingerprints only.
import {HistoricalR24PalaceBuilder} from './lib/historical-r24-baohe-fixture.mjs';
import {taiheColumnGrid} from '../src/scene/palace/special/TaiheColumnGrid.js';
import r10 from './fixtures/r10-column-grid-baseline.json' with {type:'json'};
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {captureHistoricalBaoheControl,captureTaiheControl,hash,serialMesh} from './lib/taihe-core-fixture.mjs';
import {mergeByMaterial} from '../src/utils/MergeUtils.js';
import {buildTaiheRearEnclosure,TAIHE_REAR_FINISH as Q} from '../src/scene/palace/special/TaiheRearEnclosure.js';
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r9-enclosure-baseline.json',import.meta.url)));
const tris=o=>(o.geometry.index?.count??o.geometry.attributes.position.count)/3;

test('north flank topology persists after the separately verified finite R10 column navigation correction',()=>{
 const {builder,group}=captureTaiheControl('太和殿');
 assert.equal(hash({colliders:r10['太和殿'].colliders,walkables:r10['太和殿'].walkables}),baseline['太和殿'].navigation);
 assert.equal(hash(builder.walkables),hash(r10['太和殿'].walkables));
 assert.equal(builder.colliders.length,r10['太和殿'].colliders.length);
 const walls=group.children.filter(o=>o.userData.taiheRearEnclosure);assert.equal(walls.length,3);
 assert.equal(walls.reduce((n,o)=>n+tris(o),0),28);
 assert.equal(group.children.filter(o=>o.isMesh).reduce((n,o)=>n+tris(o),0),baseline['太和殿'].triangles-68);
 const doors=group.children.filter(o=>o.material?.name==='lattice_doors');
 assert.equal(doors.filter(o=>Math.abs(o.position.z-18.5)<.01).length,0);
 assert.equal(doors.filter(o=>Math.abs(o.position.z+18.5)<.01).length,8);
 assert.equal(doors.filter(o=>o.rotation.y===Math.PI/2).length,12);builder.dispose();
});
test('solid enclosure stays in existing rear wall footprint and retains all three central door bays',()=>{
 const {builder,group}=captureTaiheControl('太和殿'),opening=taiheColumnGrid(63,37);
 for(const o of group.children.filter(o=>o.userData.taiheRearEnclosure)){
  const b=new THREE.Box3().setFromObject(o);assert.ok(b.min.z>=18.25-1e-5&&b.max.z<=18.75+1e-5);
  if(o.userData.taiheRearEnclosure==='solid-red-exterior')assert.ok(b.max.x<=opening.openLeft+1e-5||b.min.x>=opening.openRight-1e-5);
  else for(let i=0;i<o.geometry.attributes.position.count;i++)assert.ok(o.geometry.attributes.position.getX(i)<=opening.openLeft+1e-5||o.geometry.attributes.position.getX(i)>=opening.openRight-1e-5);
  assert.ok(b.min.x>=-31.5-1e-5&&b.max.x<=31.5+1e-5);
 }builder.dispose();
});
test('physical wall shell has no coplanar duplicate interior faces or inverted triangles',()=>{
 const {builder,group}=captureTaiheControl('太和殿');
 for(const o of group.children.filter(o=>o.userData.taiheRearEnclosure)){
  const g=o.geometry,p=g.attributes.position,n=g.attributes.normal;
  for(const a of Object.values(g.attributes))assert.ok([...a.array].every(Number.isFinite));
  for(let i=0;i<(g.index?.count??p.count);i+=3){
   const ids=[0,1,2].map(j=>g.index?g.index.getX(i+j):i+j);
   const [a,b,c]=ids.map(k=>new THREE.Vector3().fromBufferAttribute(p,k));
   const v=new THREE.Vector3().fromBufferAttribute(n,ids[0]);
   assert.ok(b.sub(a).cross(c.sub(a)).dot(v)>1e-6);
   if(o.userData.taiheRearEnclosure==='solid-red-exterior')assert.ok(v.z>-.99);
   else assert.equal(v.z,-1);
  }
 }builder.dispose();
});
test('pale lining uses exactly one reusable neutral lit material without extra textures',()=>{
 const {builder,group}=captureTaiheControl('太和殿');
 const linings=group.children.filter(o=>o.userData.taiheRearEnclosure==='pale-interior');
 assert.equal(linings.length,1);const m=linings[0].material;
 assert.equal(m.emissive.getHex(),0);assert.equal(m.metalness,0);assert.equal(m.roughness,.96);
 assert.equal(m.map,null);assert.equal(m.vertexColors,true);assert.equal(m.transparent,false);
 const colours=new Set([...linings[0].geometry.attributes.color.array].map(v=>v.toFixed(6)));assert.ok(colours.size<=6);
 const colourHash=hash([...linings[0].geometry.attributes.color.array]);
 const merged=builder.finish(group);const retained=merged.children.filter(o=>o.material===m);assert.equal(retained.length,1);
 assert.equal(hash([...retained[0].geometry.attributes.color.array]),colourHash);
 assert.equal(retained[0],linings[0]);assert.equal(tris(retained[0]),8);
 builder.dispose();
});
test('enclosure helper itself cannot register navigation or change lights and accepts translated placements',()=>{
 const {builder}=captureTaiheControl('太和殿'),before=hash({colliders:builder.colliders,walkables:builder.walkables});
 const g=new THREE.Group();buildTaiheRearEnclosure(builder,g,{x0:17,zf:40,y:5,w:63,openHalf:3*63/11/2,height:8});
 assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),before);
 assert.ok(g.children.every(o=>!o.isLight));
 g.updateMatrixWorld(true);for(const o of g.children){const b=new THREE.Box3().setFromObject(o);assert.ok(b.min.z>=39.75-1e-5&&b.max.z<=40.25+1e-5);}
 assert.equal(Q.thickness,.5);
 builder.dispose();g.children.forEach(o=>o.geometry.dispose());
});
for(const name of ['保和殿','乾清宫'])test(`${name} geometry, materials and navigation remain byte equivalent in the explicitly restored historical frame`,async()=>{
 const {builder,group}=name==='保和殿'?await captureHistoricalBaoheControl():captureTaiheControl(name,HistoricalR24PalaceBuilder);
 assert.equal(hash(group.children.filter(x=>x.isMesh).map(x=>serialMesh(x))),baseline[name].geometry);
 assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),baseline[name].navigation);
 builder.dispose();
});
