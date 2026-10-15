import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import fixedV5 from './fixtures/v5-fixed-routes.json' with { type: 'json' };
import { buildWorld, walkStraight } from './lib/world.mjs';
import { buildAutoRoutes } from './lib/auto-routes.mjs';

const W = await buildWorld();
// Version-scoped V5/V6 fixtures exclude only the new V7 昭德 route.
const routes = buildAutoRoutes(W, W.zones.map(z=>z.json)).filter(r=>r.gateProfile!=='zhaode');
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('V5 retains all 56 automatic route identities and exact old point sequences', () => {
  const old=routes.filter(r=>!r.terraceSide).map(({name,pts})=>({name,pts}));
  assert.equal(old.length,56);
  assert.equal(sha(old),'0ea621a5ac5a2fb7529096c458adf20181c12f1990a58be23136e9ca66dd6bf3');
});

test('V6 preserves all 31 unrelated V5 fixed routes; only two evidenced Kunning paths may change', () => {
  const fixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60,10','0,1','all'],{env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const p=line.indexOf('[[');return {name:line.slice(0,p).trim(),pts:JSON.parse(line.slice(p))};});
  assert.equal(fixed.length,33);
  assert.deepEqual(fixed.map(r=>r.name),fixedV5.map(r=>r.name));
  const unchanged = rows => rows.filter(r=>!['乾清宫→交泰殿→坤宁宫','坤宁宫→御花园→神武门'].includes(r.name));
  assert.equal(unchanged(fixed).length,31);
  assert.deepEqual(unchanged(fixed),unchanged(fixedV5));
});

test('two additive round trips consume the actual built profile and retain every toe/head point', () => {
  const sides=routes.filter(r=>r.terraceSide);
  assert.equal(sides.length,2,'add new ground-origin side route IDs, never replace old routes');
  assert.equal(routes.length,58);
  const [profile]=W.terraceProfiles;
  for(const route of sides) {
    const go=profile.approaches[route.terraceSide].points.map(p=>[p.x,p.z]);
    assert.deepEqual(route.pts,[...go,...go.slice(0,-1).reverse()]);
    assert.deepEqual(route.pts[0],[route.terraceSide==='east'?-36:36,58]);
    let feet=0;
    for(let i=1;i<route.pts.length;i++) {
      const r=walkStraight(W,route.pts[i-1],route.pts[i],{feet0:feet});
      assert.equal(r.reached,r.total,`${route.name}, segment ${i}: ${JSON.stringify(r)}`); feet=r.feet;
    }
    assert.equal(feet,0);
  }
});

const { traceTerraceGround, terraceTraceSummary, replayTerrace } = await import('./lib/terrace-walk.mjs');
const staticWorld = await buildWorld({zones:[]});
const pointsFor=(profile,side)=>{const go=profile.approaches[side].points.map(p=>[p.x,p.z]);return [...go,...go.slice(0,-1).reverse()];};

for(const [context,world] of [['static/default',staticWorld],['all-zones',W]])
for(const side of ['east','west']) for(const fps of [60,10]) for(const sprint of [false,true]) for(const backward of [false,true]) {
  test(`ground-origin real controller, no box rescue: ${context}, ${side}, ${fps}fps, sprint=${sprint}, backward=${backward}`,t=>{
    const profile=world.terraceProfiles[0],oldWalkables=world.cm.walkables;
    world.cm.walkables=oldWalkables.map(w=>w.type==='box'?{...w,rescue:false}:w);
    const trace=traceTerraceGround(world.cm,profile);
    try {
      const r=replayTerrace(t,world,pointsFor(profile,side),{fps,sprint,backward,recordFrames:!!process.env.TERRACE_EVIDENCE_DIR});
      assert.equal(r.startFeet,0); assert.equal(r.arrived,true,JSON.stringify(r));
      assert.ok(r.maxFeet>=8.59,JSON.stringify(r));assert.equal(r.end[2],0);
      const summary=terraceTraceSummary(trace.samples,profile,side);
      assert.equal(summary.ascending.length,3,JSON.stringify(summary));
      assert.equal(summary.descending.length,3,JSON.stringify(summary));
      assert.deepEqual(summary.unsafe,[]);
      assert.ok(summary.maxRise<=.156251,JSON.stringify(summary));
      assert.ok(r.maxSpeed>=(sprint?11.9:4.9),`real requested speed achieved: ${r.maxSpeed}`);
      assert.ok(r.driver.crossings.every(p=>p.lateralDistance<.6));
      assert.equal(r.driver.crossings.length,pointsFor(profile,side).length-1);
      assert.equal(r.driver.brakingFrames>0,sprint,'fast mode explicitly records corner braking');
      if(process.env.TERRACE_EVIDENCE_DIR) {
        fs.mkdirSync(process.env.TERRACE_EVIDENCE_DIR,{recursive:true});
        fs.writeFileSync(path.join(process.env.TERRACE_EVIDENCE_DIR,`${context.replace('/','-')}-${side}-${fps}-${sprint?'sprint-braked':'walk'}-${backward?'backward':'forward'}.json`),
          JSON.stringify({context,side,fps,sprint,backward,result:r,summary,supportQueries:trace.samples},null,2));
      }
    } finally {trace.restore();world.cm.walkables=oldWalkables;}
  });
}

for(const mutation of ['missing','shifted']) for(const side of ['east','west']) for(const tier of [1,2,3]) {
  test(`no-rescue acceptance rejects ${mutation} ramp: ${side} tier ${tier}`,t=>{
    const world=staticWorld,profile=world.terraceProfiles[0],flight=profile.flights.find(f=>f.side===side&&f.tier===tier);
    const saved=world.cm.walkables;
    world.cm.walkables=saved.flatMap(w=>{
      if(w.type==='box')return[{...w,rescue:false}];
      if(w.axis==='x'&&Math.abs(w.a0-flight.ramp.a0)<1e-8&&Math.abs(w.minZ-flight.ramp.minZ)<1e-8)
        return mutation==='missing'?[]:[{...w,minZ:w.minZ+10,maxZ:w.maxZ+10}];
      return[w];
    });
    const trace=traceTerraceGround(world.cm,profile);
    try {
      const r=replayTerrace(t,world,pointsFor(profile,side),{fps:10,sprint:true});
      const summary=terraceTraceSummary(trace.samples,profile,side);
      assert.ok(!r.arrived||r.maxFeet<8.59||summary.ascending.length<3||summary.descending.length<3||summary.unsafe.length,
        'arrival alone must never accept a route whose actual ramp metadata is absent');
      assert.ok(!summary.ascending.includes(flight.id),'the removed or shifted ramp cannot supply ascent');
    } finally {trace.restore();world.cm.walkables=saved;}
  });
}

test('arrival-only check is demonstrably insufficient when inherited box rescue hides all missing ramps',t=>{
  const world=staticWorld,profile=world.terraceProfiles[0],saved=world.cm.walkables;
  world.cm.walkables=saved.filter(w=>!(w.type==='ramp'&&w.axis==='x'&&w.minZ===55.95&&w.maxZ===60.05));
  const trace=traceTerraceGround(world.cm,profile);
  try {
    const r=replayTerrace(t,world,pointsFor(profile,'east'),{fps:10,sprint:true});
    const summary=terraceTraceSummary(trace.samples,profile,'east');
    assert.equal(r.arrived,true,'inherited auto-lift can mask absent physical stairs');
    assert.ok(summary.unsafe.some(p=>p.source==='rescue'),'support trace must expose auto-lift');
    assert.equal(summary.ascending.length,0);
  } finally {trace.restore();world.cm.walkables=saved;}
});
