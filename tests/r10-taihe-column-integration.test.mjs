import{restorePreR13PlaqueRows}from'./lib/r13-plaque-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {captureTaiheControl,hash,serialMesh} from './lib/taihe-core-fixture.mjs';
import {taiheColumnGrid} from '../src/scene/palace/special/TaiheColumnGrid.js';
import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
const B=JSON.parse(fs.readFileSync(new URL('./fixtures/r10-column-grid-baseline.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const centre=b=>[(b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2];
test('Taihe has exactly72 unique column stations, including unchanged six gold columns',()=>{
 const {builder,group}=captureTaiheControl('太和殿');const grid=taiheColumnGrid(63,37);
 const red=group.children.filter(o=>o.geometry?.type==='CylinderGeometry'&&o.material?.name==='wood_column');
 assert.equal(red.length,66);
 const stations=[...red.map(o=>[o.position.x,o.position.z]),...P.columns.x.flatMap(x=>P.columns.goldZ.map(z=>[x,z]))];
 assert.equal(new Set(stations.map(v=>v.map(x=>x.toFixed(6)).join('/'))).size,72);
 for(const [x,z]of stations){assert.ok(grid.x.some(v=>Math.abs(v-x)<1e-8));assert.ok(grid.z.some(v=>Math.abs(v-z)<1e-8));}
 for(const z of [-18.5,18.5])for(const x of [-4.233,4.233])assert.ok(red.some(o=>Math.abs(o.position.x-x)<1e-8&&o.position.z===z));
 assert.ok(!red.some(o=>Math.abs(Math.abs(o.position.x)-63/22)<1e-8));
 builder.dispose();
});
test('only intended red-column and four opening-wall collisions move; all walkables remain exact',()=>{
 const {builder}=captureTaiheControl('太和殿'),g=taiheColumnGrid(63,37),old=B['太和殿'];
 assert.equal(builder.colliders.length,old.colliders.length);assert.equal(hash(builder.walkables),hash(old.walkables));
 const expected=structuredClone(old.colliders);let j=0;
 for(let i=0;i<12;i++)for(let k=0;k<6;k++){
  const edge=i===0||i===11||k===0||k===5;if(!edge&&(i===5||i===6))continue;
  const b=expected[j],c=centre(b),dx=g.x[i]-c[0],dz=g.z[k]-c[1];
  for(const key of ['min','max']){b[key].x+=dx;b[key].z+=dz;}j++;
 }
 assert.equal(j,64);for(let index=expected.length-6;index<expected.length-2;index+=2){expected[index].max.x=g.openLeft;expected[index+1].min.x=g.openRight;}
 builder.colliders.forEach((b,i)=>{for(const key of ['min','max'])for(const axis of ['x','y','z'])near(b[key][axis],expected[i][key][axis]);});
 // Core columns/dais/steps and the two source-registered red companions are exact.
 assert.equal(hash(builder.colliders.slice(64,-6)),hash(old.colliders.slice(64,-6)));
 builder.dispose();
});
test('front/rear three bay leaves, thresholds and rear flanks use the same opening',()=>{
 const {builder,group}=captureTaiheControl('太和殿'),g=taiheColumnGrid(63,37);
 const leaves=group.children.filter(o=>o.material?.name==='lattice_doors'&&o.rotation.y===Math.PI/2);assert.equal(leaves.length,12);
 const r=63/11*.08;
 for(const s of [-1,1])for(const i of g.openBayIndices){const w=g.x[i+1]-g.x[i],xc=(g.x[i]+g.x[i+1])/2;
  for(const side of [-1,1]){const found=leaves.filter(o=>Math.abs(o.position.x-(xc+side*(w/2-r-.1)))<1e-8&&Math.abs(o.position.z-(s*18.5-s*(w*.13+.2)))<1e-8);assert.equal(found.length,1);found[0].geometry.computeBoundingBox();assert.ok(Math.abs(found[0].geometry.boundingBox.getSize(new THREE.Vector3()).x-w*.25)<1e-5);}
 }
 const walls=group.children.filter(o=>o.userData.taiheRearEnclosure==='solid-red-exterior');assert.equal(walls.length,2);
 const boxes=walls.map(o=>new THREE.Box3().setFromObject(o));assert.ok(boxes.some(b=>Math.abs(b.max.x-g.openLeft)<1e-5));assert.ok(boxes.some(b=>Math.abs(b.min.x-g.openRight)<1e-5));
 const thresholds=group.children.filter(o=>{if(o.material?.name!=='wood_column'||o.geometry?.type==='CylinderGeometry')return false;o.geometry.computeBoundingBox();return Math.abs(o.geometry.boundingBox.getSize(new THREE.Vector3()).y-.25)<1e-7;});assert.equal(thresholds.length,2);
 for(const o of thresholds){assert.ok(Math.abs(o.geometry.boundingBox.getSize(new THREE.Vector3()).x-(g.openRight-g.openLeft))<1e-5);near(o.position.x,(g.openLeft+g.openRight)/2);}
 builder.dispose();
});
test('retained core bytes and geometry count do not grow for the grid correction',()=>{
 const {builder,group}=captureTaiheControl('太和殿');const meshes=group.children.filter(o=>o.isMesh),old=B['太和殿'];
 const restored=restorePreR13PlaqueRows(meshes.map(o=>serialMesh(o)));
 assert.deepEqual(meshes.flatMap((o,i)=>o.userData.taiheCoreOwner?[hash(restored[i])]:[]),old.coreMeshes);
 assert.equal(meshes.length,old.meshCount);assert.equal(meshes.reduce((n,o)=>n+(o.geometry.index?.count??o.geometry.attributes.position.count)/3,0),old.triangles);
 builder.dispose();
});
for(const name of ['保和殿','乾清宫'])test(`${name} stays byte equivalent in geometry and navigation`,()=>{
 const {builder,group}=captureTaiheControl(name);assert.equal(hash(group.children.filter(o=>o.isMesh).map(o=>serialMesh(o))),B[name].geometry);
 assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),B[name].navigation);builder.dispose();
});
