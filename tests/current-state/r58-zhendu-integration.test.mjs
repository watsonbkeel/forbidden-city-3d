import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {gateGeom} from '../lib/world.mjs';
import {zhenduGateGeometry} from '../../src/scene/palace/special/ZhenduGateProfile.js';

const axis=JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
function library(){const m=new Map();return{material:n=>m.get(n)??(m.set(n,new THREE.MeshStandardMaterial({name:n})),m.get(n)),tileSize:()=>1,aspect:()=>1};}
const item=axis.items.find(x=>x.name==='贞度门');

test('only the three explicit declarations change from the frozen R57 axis data',()=>{
 assert.equal(item.gateProfile,'zhendu');assert.equal(item.gateKind,'three-bay');
 assert.deepEqual([item.x,item.z],[64.4,-214.2]);
 const original=structuredClone(axis);
 for(const k of ['gateKind','gateProfile','open','dimensionStatus'])delete original.items[10][k];
 for(const i of [40,41])delete original.items[i].gateJoin;
 // SHA of JSON.stringify(parsed exact 755dd9a axis-courts.json), not regenerated.
 assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'),'9af96c831fcfcea19cec6dd55a64bd6526c4ae19e9a7d036fbd23a857f752ee6');
});

test('production ZoneBase dispatch registers the independent Zhendu and trims both declared wing ends',()=>{
 const zone=new ZoneBase(library(),{id:'r58-zhendu-dispatch',items:[]});
 zone.buildGate({...item,plaque:false});
 const profile=zone.gateGeometries.get('贞度门');assert.equal(profile?.profile,'zhendu');
 assert.equal(zone.kit.root.children[0].userData.structure.objectId,'FC-9252CFFDAB');
 for(const i of [40,41]){
  const declaration=axis.items[i];zone.buildCorridor(declaration);
  const join=zone.kit.root.children.at(-1).userData.gateJoin;
  assert.deepEqual(join.boundary,profile.joins[declaration.gateJoin.side].world);
  assert.equal(join.provisional,true);
 }
 assert.equal(zone.kit.root.children.length,3,'one gate and two retained wings, no duplicate gate');
 const invalid=structuredClone(axis.items[40]);invalid.gateJoin.gate='unregistered';
 assert.throws(()=>zone.buildCorridor(invalid),/Invalid or unbuilt explicit gate join/);
});

test('navigation fixture consumes the same actual Zhendu deck and independent ramp endpoints',()=>{
 const g=gateGeom(item),p=zhenduGateGeometry(item);
 assert.equal(g.profile?.profile,'zhendu');assert.equal(g.platformY,p.platform.topY);
 assert.equal(g.front,-p.ramps.find(r=>r.side==='front').zToe);
 assert.equal(g.rear,p.ramps.find(r=>r.side==='rear').zToe);
 assert.notEqual(g.front,g.rear,'do not silently substitute symmetric generic gate depth');
});
