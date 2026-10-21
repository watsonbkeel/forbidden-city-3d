import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r39-retained-main-halls.json',import.meta.url)));
for(const old of baseline.rows)test(`R39 retains complete R38 ${old.name} geometry and navigation outside the two domestic opt-ins`,()=>{
 const data=JSON.parse(readFileSync(new URL(`../data/zones/${old.zone}.json`,import.meta.url))),item=data.items.find(i=>i.kind==='hall'&&i.name===old.name),b=new ZoneBase(library(),data);b.buildHall(item);b.kit.root.updateMatrixWorld(true);const meshes=[];b.kit.root.traverse(m=>{if(m.isMesh)meshes.push({matrix:m.matrixWorld.toArray(),mat:m.material?.name,a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),idx:m.geometry.index?[...m.geometry.index.array]:null});});assert.equal(hash(meshes),old.geometry);assert.equal(hash({colliders:b.kit.colliders,walkables:b.kit.walkables,rooms:b.kit.rooms,mapItems:b.kit.mapItems,regions:b.kit.regions}),old.navigation);
});
