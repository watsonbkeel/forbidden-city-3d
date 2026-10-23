import test from 'node:test';import fs from 'node:fs';import assert from 'node:assert/strict';
import {hallFixture} from './lib/r58-baohe-dais-fixture.mjs';
import {assertBaoheDaisInWorld,replayBaoheDaisRoute} from './lib/r58-baohe-dais-world-check.mjs';
const W=await hallFixture(),results=[];test.after(()=>{W.dispose();fs.writeFileSync('reports/r58-baohe-dais/hall-routes.json',JSON.stringify(results,null,2)+'\n');});
test('actual isolated Baohe hall keeps columns, door assemblies, warm rooms and rear passage around the new dais',()=>assertBaoheDaisInWorld(W));
for(const side of[-1,0,1])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const diagonal of[false,true])test(`hall actual FirstPerson side=${side} fps=${fps} sprint=${sprint} backward=${backward} diagonal=${diagonal}`,t=>{results.push(replayBaoheDaisRoute(t,W,{side,fps,sprint,backward,diagonal}));});
