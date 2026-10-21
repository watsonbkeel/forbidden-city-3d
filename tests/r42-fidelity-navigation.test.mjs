import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {BUILDING_FIDELITY,buildingFidelityFor,buildingFidelityText,validateBuildingFidelity} from '../src/ui/BuildingFidelity.js';
import {modelFidelityFor} from '../src/ui/ModelFidelity.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {Teleport}=await import('../src/ui/Teleport.js');hook.deregister();
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
test('R42 exactly one building registry changes;88 retain independently captured R41 source/status hashes',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r42-building-ledger-baseline.json',import.meta.url)));let count=0;assert.equal(BUILDING_FIDELITY.buildings.length,89);for(const b of BUILDING_FIDELITY.buildings){assert.ok(old[b.id]);if(b.name==='古华轩')continue;assert.equal(createHash('sha256').update(JSON.stringify(sort(b))).digest('hex'),old[b.id],b.name);count++;}assert.equal(count,88);validateBuildingFidelity(BUILDING_FIDELITY);
});
test('R42 Guhua live public status says partial restoration reference, fitted gallery, deferred roof and unknown visit access',()=>{
 const b=buildingFidelityFor('古华轩'),text=buildingFidelityText(b).detail;assert.match(text,/2025/);assert.match(text,/屋顶未改/);assert.match(text,/不代表现场/);assert.match(text,/拟合/);assert.ok(modelFidelityFor('古华轩').detail.includes(b.publicNote));assert.equal(b.interior.accepted,false);assert.equal(b.exterior.accepted,false);assert.equal(b.validation.visual,'not-verified');assert.equal(b.claims.find(c=>c.text==='卷棚歇山、黄瓦绿剪边。').implemented,false);
});
test('R42 Guhua teleport still resolves to real clear ground approach for the retained central entry',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))),item=data.items.find(i=>i.name==='古华轩'&&i.kind==='hall'),b=new ZoneBase(library(),data);b.build();b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);const t=Object.create(Teleport.prototype);t.targets=new Map([[item.name,item]]);t.zoneManager={getMapItems:()=>b.kit.mapItems,getLoadedIds:()=>['ningshou']};t.collisionManager=cm;const g=t.geometryFor(item.name),p=t.resolveLanding(item.name);assert.equal(g.frontX,item.x);assert.equal(g.frontZ,item.z-item.d/2);assert.ok(p);assert.equal(p.fallback,false);assert.equal(p.y,0);b.dispose();
});
