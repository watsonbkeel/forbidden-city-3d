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
test('R45 exactly two source profiles change while87 records and all89 identities remain',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r45-building-ledger-baseline.json',import.meta.url)));let count=0;assert.equal(BUILDING_FIDELITY.buildings.length,89);for(const b of BUILDING_FIDELITY.buildings){assert.ok(old[b.id]);if(['箭亭','临溪亭'].includes(b.name))continue;assert.equal(createHash('sha256').update(JSON.stringify(sort(b))).digest('hex'),old[b.id],b.name);count++;}assert.equal(count,87);validateBuildingFidelity(BUILDING_FIDELITY);
});
test('R45 public notes distinguish fitted enclosure from complete inventory and roof acceptance',()=>{
 for(const name of ['箭亭','临溪亭']){const b=buildingFidelityFor(name),text=buildingFidelityText(b).detail;for(const re of[/拟合/,/屋顶/,/不代表现场开放/,/2026/])assert.match(text,re);assert.ok(modelFidelityFor(name).detail.includes(b.publicNote));assert.equal(b.interior.accepted,false);assert.equal(b.exterior.accepted,false);assert.equal(b.validation.visual,'not-verified');}
 assert.match(buildingFidelityFor('箭亭').publicNote,/门组而非单扇/);assert.match(buildingFidelityFor('临溪亭').publicNote,/平顶素面/);
});
test('R45 real teleport targets resolve to clear ground approaches outside both new enclosures',()=>{
 for(const[zone,index]of[['outer-east',19],['outer-west',14]]){const data=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),item=data.items[index],b=new ZoneBase(library(),data);b.build();b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);const t=Object.create(Teleport.prototype);t.targets=new Map([[item.name,item]]);t.zoneManager={getMapItems:()=>b.kit.mapItems,getLoadedIds:()=>[zone]};t.collisionManager=cm;const g=t.geometryFor(item.name),p=t.resolveLanding(item.name);assert.equal(g.frontX,item.x);assert.equal(g.frontZ,item.z-item.d/2);assert.ok(p);assert.equal(p.fallback,false);assert.equal(p.y,0);b.dispose();}
});
test('R45 keeps complete159-place catalog and existing uncertainty records byte-identical',()=>{assert.equal(createHash('sha256').update(readFileSync(new URL('../data/places/zh-CN.json',import.meta.url))).digest('hex'),'cad86a86645dba41ac8ae6b569597356496d645d92526bebdc9dac27699d6711');});
