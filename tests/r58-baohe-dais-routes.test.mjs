import test from 'node:test';import fs from 'node:fs';
import {fixture} from './lib/r58-baohe-dais-fixture.mjs';
import {assertBaoheDaisInWorld,replayBaoheDaisRoute} from './lib/r58-baohe-dais-world-check.mjs';
const W=fixture(),results=[];test.after(()=>{W.dispose();fs.writeFileSync('reports/r58-baohe-dais/routes.json',JSON.stringify(results,null,2)+'\n');});
test('isolated installed model has exact visible supports, solids and rear finite boundary',()=>assertBaoheDaisInWorld(W));
for(const side of[-1,0,1])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const diagonal of[false,true])test(`actual FirstPerson side=${side} fps=${fps} sprint=${sprint} backward=${backward} diagonal=${diagonal}`,t=>{results.push(replayBaoheDaisRoute(t,W,{side,fps,sprint,backward,diagonal}));});
