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
test('R44 one implementation and four exact metadata corrections leave84 records unchanged',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r44-building-ledger-baseline.json',import.meta.url))),names=['寿康宫','含清斋','太和殿','中和殿','宝蕴楼'];let count=0;assert.equal(BUILDING_FIDELITY.buildings.length,89);for(const b of BUILDING_FIDELITY.buildings){assert.ok(old[b.id]);if(names.includes(b.name))continue;assert.equal(createHash('sha256').update(JSON.stringify(sort(b))).digest('hex'),old[b.id],b.name);count++;}assert.equal(count,84);validateBuildingFidelity(BUILDING_FIDELITY);
 for(const name of names.slice(1)){const b=structuredClone(buildingFidelityFor(name));if(name==='含清斋'){assert.deepEqual(b.identitySources,['https://www.dpm.org.cn/explore/building/236580.html']);b.identitySources=['https://www.dpm.org.cn/explore/building/236536.html'];}if(name==='太和殿'){assert.ok(!b.identitySources.includes('https://www.dpm.org.cn/explore/building/236472.html'));b.identitySources.unshift('https://www.dpm.org.cn/explore/building/236472.html');}if(name==='中和殿'){assert.equal(b.identitySources.pop(),'https://www.dpm.org.cn/explore/building/236464.html');assert.ok(b.identitySources.includes('https://www.dpm.org.cn/show/225723.html'));}if(name==='宝蕴楼'){assert.equal(b.interior.implementation,'withheld');assert.match(b.interior.unresolved[0],/并非场馆当前封闭/);b.interior.unresolved[0]='封闭库房内部未建模，不以通用宫殿家具填充。';}assert.equal(createHash('sha256').update(JSON.stringify(sort(b))).digest('hex'),old[b.id],name+' exact metadata-only inverse');}
});
test('R44 Shoukang public status separates restored display, object dimensions and fitted access',()=>{
 const b=buildingFidelityFor('寿康宫'),text=buildingFidelityText(b).detail;for(const re of[/2015/,/2018/,/不是2026/,/单件外包尺寸/,/拟合/,/未造佛像/])assert.match(text,re);assert.ok(modelFidelityFor('寿康宫').detail.includes(b.publicNote));assert.equal(b.interior.accepted,false);assert.equal(b.exterior.accepted,false);assert.equal(b.validation.visual,'not-verified');assert.match(b.claims.at(-1).targetState,/整体厚度/);
});
test('R44 Shoukang teleport still resolves to real clear ground approach for the retained central entry',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))),item=data.items.find(i=>i.name==='寿康宫'&&i.kind==='hall'),b=new ZoneBase(library(),data);b.build();b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);const t=Object.create(Teleport.prototype);t.targets=new Map([[item.name,item]]);t.zoneManager={getMapItems:()=>b.kit.mapItems,getLoadedIds:()=>['outer-west']};t.collisionManager=cm;const g=t.geometryFor(item.name),p=t.resolveLanding(item.name);assert.equal(g.frontX,item.x);assert.equal(g.frontZ,item.z-item.d/2);assert.ok(p);assert.equal(p.fallback,false);assert.equal(p.y,0);b.dispose();
});

test('R44 metadata correction does not alter catalog identities or valid group citations',()=>{assert.equal(createHash('sha256').update(readFileSync(new URL('../data/places/zh-CN.json',import.meta.url))).digest('hex'),'cad86a86645dba41ac8ae6b569597356496d645d92526bebdc9dac27699d6711');});
