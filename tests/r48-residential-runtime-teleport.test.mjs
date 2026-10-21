import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {buildWorld} from './lib/world.mjs';
const hooks=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {Teleport}=await import('../src/ui/Teleport.js');hooks.deregister();
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url))),W=await buildWorld(),t=Object.create(Teleport.prototype);
t.targets=new Map(W.halls.map(h=>[h.item.name,h.item]));t.collisionManager=W.cm;
t.zoneManager={getMapItems:()=>W.mapItems,getLoadedIds:()=>W.zones.map(z=>z.json.id),loaded:new Map(W.zones.map(z=>{const names=new Set(z.json.items.map(i=>i.name));return[z.json.id,{data:{mapItems:W.mapItems.filter(m=>names.has(m.name))}}];}))};
for(const row of scope)test(`R48 ${row.name} real runtime landing resolver remains safe in the complete world`,()=>{
 const p=t.resolveLanding(row.name),g=t.geometryFor(row.name);assert.ok(p,`${row.name}: no safe runtime landing`);assert.equal(t.isSafe(p,g),true);
 assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z)&&Number.isFinite(p.y));
 if(row.name==='延禧宫'){assert.equal(p.mode,'exterior-view');assert.equal(p.viewpointVerified,true);assert.equal(p.y,0);assert.equal(g.navigation.interiorRouteAccepted,false);}
 else assert.notEqual(p.mode,'exterior-view');
});
