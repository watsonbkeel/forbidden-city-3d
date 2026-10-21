import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {buildAutoRoutes} from './lib/auto-routes.mjs';
const W=await buildWorld();
const routes=buildAutoRoutes(W,W.zones.map(z=>z.json)).filter(r=>r.gateProfile!=='zhaode');
const old=JSON.parse(readFileSync(new URL('./fixtures/r45-r44-auto-routes.json',import.meta.url)));
test('R45 all61 pre-existing automatic route definitions remain exact and only two named entries are added',()=>{
 assert.equal(old.length,61);assert.equal(routes.length,63);
 const added=routes.filter(r=>!old.some(x=>x.name===r.name));assert.deepEqual(added.map(r=>r.hall).sort(),['临溪亭','箭亭'].sort());
 for(const r of old){const now=routes.find(x=>x.name===r.name);assert.ok(now,r.name);assert.deepEqual(JSON.parse(JSON.stringify(now)),r,r.name);}
});
test('R45 Arrow approach exits the actual courtyard gate before following its southern exterior lane',()=>{
 const r=routes.find(r=>r.enclosureApproach==='arrow-exit-court-south-v1');assert.ok(r);assert.equal(r.hall,'箭亭');
 assert.ok(r.pts[0][1]>20);assert.ok(r.pts[1][1]<20-1);assert.equal(r.pts[0][0],-285);assert.equal(r.pts[1][0],-285);
 assert.equal(r.pts[2][1],r.pts[1][1]);assert.ok(r.pts[4][1]>78.8-17.6/2+2);
 for(let i=1;i<r.pts.length;i++){const x=walkStraight(W,r.pts[i-1],r.pts[i]);assert.ok(x.reached>=x.total-.5,JSON.stringify({i,x}));}
 const blocked=walkStraight(W,[-285,25.5],[-154.7,25.5]);assert.ok(blocked.reached<blocked.total-50,'the old east wall remains physically blocked');
});
