import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
const west=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
function library(){const mats=new Map();return{tileSize:()=>1,aspect:()=>1,material(n){if(!mats.has(n))mats.set(n,new THREE.MeshStandardMaterial({name:n}));return mats.get(n);}};}
test('actual WestSix build merges exactly one opted-in courtyard alongside unchanged Chuxiu household',()=>{
 const zone=new ZoneBase(library(),west),built=zone.build(),records=built.group.userData.architecture;
 assert.equal(records.filter(r=>r.id==='west-six/chuxiu-courtyard').length,1);
 assert.equal(records.filter(r=>r.id==='west-six/chuxiu-household').length,1);
 assert.equal(built.rooms.filter(r=>r.name?.startsWith('储秀宫·')).length,5);
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
 for(const[x,z]of[[83.2,409.55],[106.4,409.55],[83.2,428.35],[106.4,428.35]]){
  const y=cm.getGroundHeight(x,z,.6,.6);assert.ok(y>=.45&&y<=.6);
  assert.equal(cm.checkCollision(new THREE.Vector3(x,y+1.7,z),.5),false);
 }
 zone.dispose();assert.equal(zone.group,null);assert.equal(zone.kit.colliders.length,0);
});
test('profile omission preserves legacy builder path for snapshots and other zones',()=>{
 const {courtyardProfile,...baseline}=west,z=new ZoneBase(library(),baseline),b=z.build();
 assert.equal(b.group.userData.architecture.some(r=>r.id==='west-six/chuxiu-courtyard'),false);
 z.dispose();
});
