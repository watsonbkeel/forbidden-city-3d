import {registerHooks} from 'node:module';
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {Teleport}=await import('../src/ui/Teleport.js');hook.deregister();
import test from'node:test';import assert from'node:assert/strict';import{buildWorld}from'./lib/world.mjs';import{REMAINING_NINGSHOU_PROFILES}from'../src/scene/palace/special/RemainingNingshouHalls.js';
const W=await buildWorld();const t=Object.create(Teleport.prototype);t.targets=new Map(W.halls.map(h=>[h.item.name,h.item]));t.collisionManager=W.cm;t.zoneManager={getMapItems:()=>W.mapItems,getLoadedIds:()=>W.zones.map(z=>z.json.id)};
for(const p of REMAINING_NINGSHOU_PROFILES)test(`R48 ${p.name} runtime teleport uses actual whole-world fitted entrance approach`,()=>{const g=t.geometryFor(p.name),landing=t.landingFor(p.name);assert.equal(g.entryProfile,p.id);assert.equal(g.frontX,p.portals[0].worldX);assert.equal(g.frontZ,p.portals[0].worldZ);assert.equal(t.isSafe(landing,g),true,JSON.stringify({g,landing}));assert.equal(landing.approachVerified,true);assert.equal(landing.y,0);});
