import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {FlightEnvelope} from '../src/scene/flight/FlightEnvelope.js';
import {library} from './lib/inner-palace-fixture.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
for(const name of ['长春宫','翊坤宫'])test(`R39 independent: ${name} domestic fits leave merged helicopter obstruction envelope unchanged`,()=>{
 const item=config.items.find(i=>i.kind==='hall'&&i.name===name),now=new ZoneBase(library(),config),old=new ZoneBase(library(),config);now.buildHall(item);const{structure,domesticProfile,...plain}=item;old.buildHall({...plain,throne:true,interior:'A:palace-front'});
 const merged=now.kit.finish(),baseline=old.kit.finish(),a=new FlightEnvelope().addRoot(merged),b=new FlightEnvelope().addRoot(baseline);
 for(let dx=-18;dx<=18;dx+=.75)for(let dz=-11;dz<=11;dz+=.75)assert.deepEqual(a.sample(item.x+dx,item.z+dz),b.sample(item.x+dx,item.z+dz),`${name} flight envelope changed at ${dx},${dz}`);
 const record=merged.userData.architecture.find(r=>r.profile===item.domesticProfile);assert.equal(record.roomInterpretation,'NAVIGATION_ZONES_NOT_COMPLETE_HISTORICAL_ROOM_COUNT');assert.equal(record.photographyDate,null);assert.match(record.furnitureStatus,/FITTED|GENERIC_FALLBACK/);now.kit.dispose(merged);old.kit.dispose(baseline);
});

test('R39 independent: Taiji is not silently opted into unresolved east-west cover assignment',()=>{
 const item=config.items.find(i=>i.kind==='hall'&&i.name==='太极殿');assert.equal(item.domesticProfile,undefined);assert.notEqual(item.structure,'west-domestic-hall');
});
