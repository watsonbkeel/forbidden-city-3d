import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/east-six.json',import.meta.url))),item=config.items.find(i=>i.name==='奉先殿'&&i.kind==='hall');
const places=JSON.parse(readFileSync(new URL('../data/places/zh-CN.json',import.meta.url)));
function build(patch={}){const b=new ZoneBase(library(),config);const {f}=b.buildHall({...item,...patch});b.kit.root.updateMatrixWorld(true);return{b,f};}
const meshSignature=m=>hash({p:m.position.toArray(),r:m.rotation.toArray(),type:m.geometry.type,mat:m.material?.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});

test('R39 Fengxian does not substitute a living-emperor throne or generic domestic preset for the ancestral ritual interior',()=>{
 assert.equal(item.throne,false);assert.equal(item.interior,'empty');
 const {b,f}=build();assert.equal(b.kit.rooms.length,1);assert.equal(b.kit.rooms[0].kind,'empty');
 const generic=[];f.traverse(o=>{if(o.isMesh&&(o.material===b.kit.gold&&o.position.z>10||o.material?.name==='kit_furn_wood'))generic.push(o);});
 assert.equal(generic.length,0);
 const place=places.places.find(p=>p.name==='奉先殿');
 assert.match(place.modelExperience.disclaimer,/祭祀内饰.*尚未复原/);
 assert.match(place.modelExperience.disclaimer,/不表示.*历史.*空/);
 assert.match(place.summary.text,/皇室家庙/);
 assert.equal(places.places.length,159);
});

test('R39 Fengxian keeps every shell mesh, map record and floor, removing only four unsupported throne blocks and their solid',()=>{
 const now=build(),old=build({throne:true,interior:undefined}),tz=item.d/2-Math.min(2.6,item.d*.3);
 const isFurniture=m=>m.isMesh&&m.geometry.type==='BoxGeometry'&&((m.material===old.b.kit.gold&&m.position.z>=tz)||m.material===old.b.kit.lacquer&&Math.abs(m.position.z-tz)<1e-8);
 const removed=old.f.children.filter(isFurniture);assert.equal(removed.length,4);
 const rows=f=>{const a=[];f.traverse(o=>{if(o.isMesh&&!removed.includes(o))a.push(meshSignature(o));});return a.sort();};
 assert.deepEqual(rows(now.f),rows(old.f));
 assert.deepEqual(now.b.kit.walkables,old.b.kit.walkables);assert.deepEqual(now.b.kit.mapItems,old.b.kit.mapItems);
 assert.equal(old.b.kit.colliders.length-now.b.kit.colliders.length,1);
 assert.deepEqual(now.b.kit.colliders,old.b.kit.colliders.slice(0,-1));
 assert.deepEqual(now.b.kit.rooms[0].doors,old.b.kit.rooms[0].doors);
 for(const p of old.b.kit.rooms[0].spawns)assert.ok(now.b.kit.rooms[0].spawns.some(q=>q.x===p.x&&q.z===p.z),'retained original safe spawn');
 assert.equal(now.b.kit.rooms[0].spawns.length,2,'empty-room registration adds one tested entry-side spawn');
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(now.b.kit.colliders);cm.addWalkables(now.b.kit.walkables);
 for(const p of [...now.b.kit.rooms[0].doors,...now.b.kit.rooms[0].spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.45),false);
});
