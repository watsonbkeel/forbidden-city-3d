import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
const hooks=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {Teleport}=await import('../src/ui/Teleport.js');hooks.deregister();
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {rearPalaceFragment,meshRows,hallFragment} from './lib/r54-jiaotai-fragment.mjs';
import {assertJiaotaiDisplayInWorld,replayJiaotaiDisplayRoute} from './lib/r54-jiaotai-world-check.mjs';
const {scene,builder}=rearPalaceFragment(),cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);const W={THREE,scene,cm};
test('Jiaotai merged rear-palace fragment binds the real geometry, support and legal observation positions',()=>{assert.equal(assertJiaotaiDisplayInWorld(W).scope.includes('B_PROCEDURAL'),true);});
for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])test(`Jiaotai four-door continuous circuit ${fps} Hz sprint=${sprint} backward=${backward}`,t=>replayJiaotaiDisplayRoute(t,W,{fps,sprint,backward}));

test('both actual resident clock/clepsydra and caisson LOD meshes retain their frozen R53 signatures',()=>{const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r54-jiaotai-before.json',import.meta.url)));for(const [name,rows]of Object.entries(baseline.retainedLODs))assert.deepEqual(meshRows(scene.getObjectByName(name)),rows,name);});

test('Jiaotai original front map landing is retained by the actual Teleport resolver',()=>{const teleport=Object.create(Teleport.prototype);teleport.targets=new Map(PALACE_LAYOUT.filter(i=>i.type==='palace').map(i=>[i.name,{name:i.name,x:i.position.x,z:i.position.z,w:i.dimensions.width,d:i.dimensions.depth}]));teleport.collisionManager=cm;teleport.zoneManager={getMapItems:()=>[]};const p=assertJiaotaiDisplayInWorld(W,{teleport}).landing;assert.equal(teleport.isSafe(p,teleport.geometryFor('交泰殿')),true);});

test('new furniture bounds do not penetrate either conservative retained R27 landmark envelope',()=>{
 const landmarks=[{min:[5.288793103448276,2.16,353.0293103448276],max:[7.011206896551725,7.56,355.17068965517245]}, {min:[-7.206,2.16,352.84000000000003],max:[-4.566000000000001,7.76,355.36]}];
 const records=[];scene.traverse(o=>records.push(...(o.userData.architecture??[]).filter(r=>r.id==='jiaotaidian')));
 for(const l of landmarks){assert.equal(cm.colliders.some(c=>['min','max'].every(side=>l[side].every((v,i)=>Math.abs((c.box??c)[side].getComponent(i)-v)<1e-6))),true,'retained exact R27 collision present');const furniture=[];hallFragment().group.traverse(m=>{if(m.userData.jiaotaiDisplayId){const b=new THREE.Box3().setFromObject(m);furniture.push({owner:m.name,min:b.min.toArray(),max:b.max.toArray()});}});assert.equal(furniture.length,100);for(const c of furniture){const overlap=l.min.every((v,i)=>Math.min(l.max[i],c.max[i])-Math.max(v,c.min[i])>1e-6);assert.equal(overlap,false,c.owner+' must not intersect retained landmark envelope');}}
});

test('all frozen actor IDs remain and Jiaotai stays unbound when other districts gain actors',()=>{const raw=fs.readFileSync(new URL('../data/characters/actors.json',import.meta.url)),registry=JSON.parse(raw);const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r54-jiaotai-before.json',import.meta.url)));const ids=new Set(registry.actors.map(a=>a.id));for(const id of baseline.actorIds)assert.ok(ids.has(id),id+' cannot silently disappear');assertJiaotaiDisplayInWorld(W,{registry});});
