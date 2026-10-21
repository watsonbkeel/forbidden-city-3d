import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {realTextureLibrary as realLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
// Compare geometry, semantic material keys, and navigation. Texture pixels, UV
// density, and real material response parameters deliberately remain production
// values, not forced to equal the lightweight test library. Only the known
// material-derived name suffix is normalized.
function physical(kit){kit.root.updateMatrixWorld(true);const rows=[];kit.root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry;rows.push({name:m.name.replace(/_material$/,''),role:m.userData.role??null,material:(Array.isArray(m.material)?m.material:[m.material]).map(v=>v?.name?.replace(/_material$/,'')??null),matrix:m.matrixWorld.toArray(),position:Array.from(g.attributes.position.array),normal:g.attributes.normal?Array.from(g.attributes.normal.array):null,index:g.index?Array.from(g.index.array):null});});return{meshes:rows.length,geometry:hash(rows),navigation:hash({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems})};}
for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(x=>x.endsWith('.json'))){const d=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));for(const[i,item]of d.items.entries()){if(item.kind!=='hall')continue;test(`R48 real TextureLibrary physical parity ${d.id}/${i} ${item.name??'unnamed'}`,()=>{const real=realLibrary(),a=new ZoneBase(library(),d),b=new ZoneBase(real,d);try{a.buildHall(item);b.buildHall(item);assert.deepEqual(physical(b.kit),physical(a.kit));}finally{a.kit.dispose(a.kit.root);b.kit.dispose(b.kit.root);real.dispose();}});}}
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {GardenBuilder} from '../src/scene/GardenBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {gardenLibrary} from './lib/r48-garden-fixture.mjs';
for(const kind of ['axis-palaces','five-garden-pavilions'])test(`R48 real TextureLibrary ${kind} complete physical parity`,()=>{
 const captures=[];
 for(const lib of [gardenLibrary(),realLibrary()]){const scene=new THREE.Scene(),b=kind==='axis-palaces'?new PalaceBuilder(scene,lib):new GardenBuilder(scene,lib);try{
  if(kind==='axis-palaces')b.buildPalaces(PALACE_LAYOUT.filter(i=>i.type==='palace'));else b.build(PALACE_LAYOUT.find(i=>i.type==='garden'));
  captures.push(physical({root:scene,colliders:b.colliders,walkables:b.walkables}));
 }finally{b.dispose();lib.dispose?.();}}
 assert.deepEqual(captures[1],captures[0]);
});
