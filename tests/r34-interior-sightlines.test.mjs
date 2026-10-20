import test from 'node:test';import assert from 'node:assert/strict';
import {captureTaiheSightlines} from './lib/r34-interior-fixture.mjs';
let rows;test('actual native and loaded geometry retain entrance and bilateral display sightlines',async()=>{
 rows=await captureTaiheSightlines();assert.equal(rows.length,32);
 for(const r of rows){if(r.eye[2]===-18.5)assert.equal(r.targets.plaque.clearSamples,9,JSON.stringify(r));
 if(r.eye[2]<=10)assert.ok(r.targets.screen.clearSamples>0,JSON.stringify(r));
 if(r.eye[0]&&[5,10].includes(r.eye[2]))assert.ok(r.targets.throne.clearSamples>0,JSON.stringify(r));
 assert.ok(Number.isFinite(r.throneCaissonBearingGapDegrees));
 if(r.eye[0]&&r.eye[2]<=10)assert.ok(r.throneCaissonBearingGapDegrees<r.priorThroneCaissonBearingGapDegrees,JSON.stringify(r));
 }
});

test('empty target space cannot pass target-hit visibility checks',async()=>{const empty=await captureTaiheSightlines({omitCores:true});for(const r of empty)for(const v of Object.values(r.targets))assert.equal(v.clearSamples,0);});
