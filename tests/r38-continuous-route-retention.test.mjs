import test from 'node:test';
import assert from 'node:assert/strict';
import { continuousVisitorRoute } from './lib/continuous-visitor-route.mjs';
import { captureTaihemenSouth,taihemenSouthPoints } from './lib/taihemen-approach-route.mjs';
const contacts=taihemenSouthPoints(captureTaihemenSouth(),1);
const central=continuousVisitorRoute();
for(const lane of[-1.5,0,1.5])test(`all-five-bridge splice preserves exact Taihemen physical contacts and complete downstream route, lane=${lane}`,()=>{
 const route=continuousVisitorRoute({allBridges:true,bridgeLane:lane}),start=route.points.findIndex(p=>p[0]===contacts[0][0]&&p[1]===contacts[0][1]);
 assert.ok(start>=0,'bridge excursion must not discard south approach contacts');
 assert.deepEqual(route.points.slice(start,start+contacts.length),contacts);
 const centerStart=central.points.findIndex(p=>p[0]===contacts[0][0]&&p[1]===contacts[0][1]);
 assert.deepEqual(route.points.slice(start),central.points.slice(centerStart),'every later stage/waypoint must remain unchanged');
 for(const x of[-30,-13,0,13,30])for(const z of[-340,-280])assert.ok(route.points.some(p=>p[0]===x+lane&&p[1]===z),'all five original bridge crossings remain');
 assert.deepEqual(route.points[0],central.points[0]);assert.deepEqual(route.points.at(-1),central.points.at(-1));
});
