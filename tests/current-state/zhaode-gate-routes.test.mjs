import { withLegacyWesternCourtsForVersionComparison } from '../lib/r6-western-route-compat.mjs';
import { withLegacyNingshouForVersionComparison } from '../lib/r6-ningshou-route-compat.mjs';
import { withLegacyQinanForVersionComparison } from '../lib/qinan-route-version-compat.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildWorld, gateGeom, loadZoneJsons, walkStraight } from '../lib/world.mjs';
import { buildAutoRoutes } from '../lib/auto-routes.mjs';

const zones = loadZoneJsons();
const item = zones.find(z => z.json.id === 'axis-courts').json.items.find(i => i.name === '昭德门');
const explicit = { ...item, gateProfile: 'zhaode', gateKind: 'three-bay', open: true };
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fixedHash = '7e8748721da0d2d3d5932098ef19888ab86e28f1200393252dbe5bf5e5698c68';
const autoHash = 'd3fdb4bc1e6c969172d1e44c68adda8e35a2e0233fbe51d1f3e461ea6870af75';

// This catches dispatching the new three-core-bay assembly into SideGate's
// five-bay implementation, before any controller test can accidentally spawn high.
test('昭德 route geometry dispatches its explicit three-bay profile and independent approaches', () => {
  let geometry;
  assert.doesNotThrow(() => { geometry = gateGeom(explicit); });
  assert.equal(geometry.profile.profile, 'zhaode');
  assert.deepEqual(geometry.profile.portalCenters, [0]);
  assert.notEqual(geometry.front, geometry.rear);
  const p = geometry.profile;
  assert.equal(geometry.front, -p.ramps.find(r => r.side === 'front').zToe);
  assert.equal(geometry.rear, p.ramps.find(r => r.side === 'rear').zToe);
  assert.equal(geometry.platformY, p.platform.topY);
  assert.equal(p.supports.platform.rescue, false);
});

test('V7 historical routes retain exact descriptors with only the later Qin’an and R6 Ningshou replacements isolated', async () => {
  const fixed = execFileSync(process.execPath, ['tests/stepwalk.cjs', '60', '0', 'all'], {
    cwd: new URL('../..', import.meta.url), env: { ...process.env, DUMP: '1' }, encoding: 'utf8',
  }).trim().split('\n').map(line => {
    const split = line.indexOf(' [[');
    assert.ok(split > 0, `unexpected fixed-route record: ${line}`);
    return { name: line.slice(0, split), pts: JSON.parse(line.slice(split + 1)) };
  });
  assert.equal(fixed.length, 33); assert.equal(hash(withLegacyQinanForVersionComparison(fixed, 'fixed')), fixedHash);
  const W = await buildWorld();
  const routes = buildAutoRoutes(W, W.zones.map(z => z.json));
  const added = routes.filter(r => r.gateProfile === 'zhaode');
  assert.equal(added.length, 1, 'one new central round trip, no side-bay routes');
  assert.equal(added[0].name, '[axis-courts] 昭德门南地面→单门道→北地面→返回');
  assert.equal(routes.at(-1), added[0], 'new route is appended after all 58 inherited entries');
  assert.equal(routes.length, 59);
  assert.equal(hash(withLegacyQinanForVersionComparison(withLegacyNingshouForVersionComparison(withLegacyWesternCourtsForVersionComparison(routes))).filter(r=>r.gateProfile!=='zhaode').map(r=>({name:r.name,pts:r.pts,waypointDriver:r.waypointDriver??null}))),
    '11c58babe6e0d24645ac36d8619f8f5003a955d7da10d681fe235c528d6e9009','all historical V6 driver identities and points remain exact apart from the separately tested Qin’an replacement');
  assert.equal(hash(withLegacyQinanForVersionComparison(withLegacyNingshouForVersionComparison(withLegacyWesternCourtsForVersionComparison(routes))).filter(r => r.gateProfile !== 'zhaode').map(({ name, pts }) => ({ name, pts }))), autoHash);
  assert.equal(added[0].waypointDriver, 'zhaode-physical-crossing-v1');
  const p = gateGeom(explicit).profile;
  const contacts = ['frontGround','frontToe','frontTop','portalFront','portalRear','rearTop','rearToe','rearGround'];
  const go = contacts.map(name => p.toWorld(...p.routeContacts[name]));
  assert.deepEqual(added[0].pts, [...go, ...go.slice(0, -1).reverse()]);
  assert.equal(p.routeContacts.frontGround[1], p.ramps[0].zToe - 2);
  assert.equal(p.routeContacts.rearGround[1], p.ramps[1].zToe + 2);
});

import { CollisionManager } from '../../src/utils/Collision.js';
import { PLAYER } from '../../src/config/constants.js';
import { replayTerrace as replayPhysicalRoute } from '../lib/terrace-walk.mjs';
import { bindProfileSupports, traceProfileSupports, profileSupportReport } from '../lib/profile-support-trace.mjs';

let worldPromise;
const fullWorld = () => worldPromise ??= buildWorld();
function diagnosticWorld(W, noBoxRescue = false) {
  const cm = new CollisionManager();
  for (const c of W.cm.colliders) cm.addCollider(c.mesh, c.tag);
  for (const w of W.cm.walkables) cm.addWalkable(noBoxRescue && w.type === 'box' ? { ...w, rescue: false } : w, w.tag);
  return { ...W, cm };
}
const routeContactNames = ['frontGround','frontToe','frontTop','portalFront','portalRear','rearTop','rearToe','rearGround'];
function profileRoute(p, from = 'front', offset = 0) {
  let go = routeContactNames.map(name => {
    const [x, z] = p.routeContacts[name]; return p.toWorld(x + offset, z);
  });
  if (from === 'rear') go = go.reverse();
  return [...go, ...go.slice(0, -1).reverse()];
}
const near = (a,b,message='') => assert.ok(Math.abs(a-b)<1e-7, `${message}: ${a} != ${b}`);

/** Arrival is deliberately not an input to this support assertion. */
function assertPhysicalSupport(samples, p, from = 'front') {
  const report=profileSupportReport(samples,p,from);
  assert.equal(report.valid,true,report.failures.join('; '));
}

function assertPhysicalFeet(result, p) {
  assert.equal(result.startFeet, 0, 'spawn must be physical ground, never deck or high rescue');
  assert.ok(result.frames.every(f => Number.isFinite(f.feet) && Number.isFinite(f.ground)));
  assert.ok(result.frames.some(f => Math.abs(f.feet-f.ground)>1e-4), 'production smoothing/gravity remain enabled');
  const c=Math.cos(p.rot),s=Math.sin(p.rot);
  for (const frame of result.frames) {
    const lx=(frame.x-p.x)*c-(frame.z-p.z)*s, lz=(frame.x-p.x)*s+(frame.z-p.z)*c;
    if (Math.abs(lx)<p.platform.width/2-.5 && Math.abs(lz)<p.platform.depth/2-.5) {
      assert.ok(frame.feet > p.platform.topY - PLAYER.STEP_UP,
        `physical feet fell under raised solid deck: ${JSON.stringify(frame)}`);
      near(frame.ground,p.platform.topY,'logical support remains on deck');
    }
    assert.ok(frame.feet>=-1e-7, 'no below-ground physical feet');
  }
  near(result.end[2],0,'physical feet settle back at ground after ordinary braking');
}

// This full cross-product runs in both the ordinary all-zone world and a copy
// with box rescue disabled. The production controller itself is never changed.
for (const noBoxRescue of [false,true]) for (const from of ['front','rear'])
for (const fps of [60,10]) for (const sprint of [false,true]) for (const backward of [false,true]) {
  test(`昭德 true support ${from} origin ${fps}Hz ${sprint?'sprint':'walk'} ${backward?'backward':'forward'} rescueDisabled=${noBoxRescue}`, async t => {
    const W=diagnosticWorld(await fullWorld(),noBoxRescue), p=gateGeom(explicit).profile;
    const identities=bindProfileSupports(W.cm,p);
    assert.equal([...identities].find(([,id])=>id===p.supports.platform.supportId)[0].rescue,false);
    const trace=traceProfileSupports(W.cm,identities);
    let result;
    try { result=replayPhysicalRoute(t,W,profileRoute(p,from),{fps,sprint,backward,recordFrames:true}); }
    finally {trace.restore();}
    assertPhysicalSupport(trace.samples,p,from);
    assertPhysicalFeet(result,p);
    assert.equal(result.arrived,true,JSON.stringify({stuckAt:result.stuckAt,end:result.end}));
    if (sprint) assert.ok(result.maxSpeed>PLAYER.MOVE_SPEED+.5,'actual sprint speed is retained');
    t.diagnostic(JSON.stringify({queries:trace.samples.length,maxFeet:result.maxFeet,maxSpeed:result.maxSpeed,
      maxFeetGroundSeparation:Math.max(...result.frames.map(f=>Math.abs(f.feet-f.ground))),
      maxUpwardQuery:Math.max(...trace.samples.map(s=>s.height-s.feetIn)),end:result.end}));
  });
}

for(const offsetSign of [-1,1]) for(const from of ['front','rear']) test(`both clear-aperture sides are physically usable: ${offsetSign}, ${from}`,async t=>{
  const W=diagnosticWorld(await fullWorld()),p=gateGeom(explicit).profile;
  const offset=offsetSign*(p.portals[0].clearWidth/2-0.5-0.2);
  const trace=traceProfileSupports(W.cm,bindProfileSupports(W.cm,p));
  let result;
  try {result=replayPhysicalRoute(t,W,profileRoute(p,from,offset),{fps:10,sprint:true,recordFrames:true});}
  finally {trace.restore();}
  assertPhysicalSupport(trace.samples,p,from);assertPhysicalFeet(result,p);assert.equal(result.arrived,true);
});

for(const noBoxRescue of [false,true]) for(const side of ['front','rear']) for(const mutation of ['delete','shift']) {
  test(`support mutation ${mutation} ${side} ramp is rejected with rescueDisabled=${noBoxRescue}`,async t=>{
    const W=diagnosticWorld(await fullWorld(),noBoxRescue),p=gateGeom(explicit).profile;
    const identities=bindProfileSupports(W.cm,p),id=p.ramps.find(r=>r.side===side).supportId;
    const original=[...identities].find(([,name])=>name===id)[0];
    if(mutation==='delete')W.cm.walkables.splice(W.cm.walkables.indexOf(original),1);
    else { original.minX+=p.platform.width;original.maxX+=p.platform.width;
      if(original.axis==='x'){original.a0+=p.platform.width;original.a1+=p.platform.width;}
      else for(const k of ['crossMin0','crossMax0','crossMin1','crossMax1'])if(original[k]!==undefined)original[k]+=p.platform.width;
    }
    const trace=traceProfileSupports(W.cm,identities);
    let result;
    try{result=replayPhysicalRoute(t,W,profileRoute(p),{fps:10,sprint:true,recordFrames:true});}
    finally{trace.restore();}
    assert.throws(()=>assertPhysicalSupport(trace.samples,p),/true-support|missing ascent|other-box|other-ramp|increment/);
    t.diagnostic(`XY arrived=${result.arrived}; physical support correctly rejected ${mutation}:${id}`);
  });
}

for(const noBoxRescue of [false,true]) for(const side of ['front','rear']) for(const mutation of ['delete','shift'])
test(`endpoint arrival cannot hide ${mutation}d ${side} support behind an unowned substitute, noRescue=${noBoxRescue}`,async t=>{
  const W=diagnosticWorld(await fullWorld(),noBoxRescue),p=gateGeom(explicit).profile;
  const identities=bindProfileSupports(W.cm,p),id=p.ramps.find(r=>r.side===side).supportId;
  const original=[...identities].find(([,name])=>name===id)[0],substitute={...original};
  if(mutation==='delete')W.cm.walkables.splice(W.cm.walkables.indexOf(original),1);
  else {const delta=p.platform.width;original.minX+=delta;original.maxX+=delta;
    if(original.axis==='x'){original.a0+=delta;original.a1+=delta;}
    else for(const key of ['crossMin0','crossMax0','crossMin1','crossMax1'])if(original[key]!==undefined)original[key]+=delta;
  }
  W.cm.addWalkable(substitute,'injected-unowned-support');
  const trace=traceProfileSupports(W.cm,identities);let result;
  try{result=replayPhysicalRoute(t,W,profileRoute(p),{fps:10,sprint:true});}finally{trace.restore();}
  assert.equal(result.arrived,true,'deliberate defect reproduces the endpoint-only false positive');
  assert.ok(trace.samples.some(s=>s.source==='other-ramp'));
  assert.throws(()=>assertPhysicalSupport(trace.samples,p),/other-ramp/);
});

let isolatedPromise, closedPromise;
function isolatedGate(closed=false) {
  const make=()=>buildWorld({zones:[{json:{id:'zhaode-fixture',items:[{...explicit,open:!closed}]}}],statics:false});
  return closed ? closedPromise??=make() : isolatedPromise??=make();
}
function blockedSegment(W,p,label,start,end,feet0) {
  const a=p.toWorld(...start),b=p.toWorld(...end);
  const result=walkStraight(W,a,b,{feet0});
  assert.ok(result.reached>=0,`${label}: must begin outside the obstacle: ${JSON.stringify(result)}`);
  assert.ok(result.reached<result.total-.8,`${label} shortcut crossed: ${JSON.stringify(result)}`);
  return result;
}

test('side retaining walls, platform rails, side panels, columns and closed wing caps block independent shortcuts',async()=>{
  const W=await isolatedGate(),p=gateGeom(explicit).profile,top=p.platform.topY;
  for(const sign of [-1,1]) {
    const edge=sign*p.platform.width/2;
    blockedSegment(W,p,'side retaining wall',[edge+sign*2,0],[edge-sign*2,0],0);
    blockedSegment(W,p,'under-plinth entry',[edge+sign*2,p.platform.depth/2-2],[0,p.platform.depth/2-2],0);
    blockedSegment(W,p,'platform railing',[edge-sign*2,p.platform.depth/2-2],[edge+sign*2,p.platform.depth/2-2],top);
    for(const z of [p.core.frontZ,p.core.rearZ]) {
      const sideX=sign*(p.core.bayWidths[1]/2+p.core.bayWidths[0]/2);
      blockedSegment(W,p,'solid side-bay panel',[sideX,z-1.5],[sideX,z+1.5],top);
    }
    const columnX=p.building.columnXs.find(x=>Math.sign(x)===sign&&Math.abs(Math.abs(x)-p.core.bayWidths[1]/2)<1e-7);
    blockedSegment(W,p,'outer front column',[columnX,p.building.columnZs[0]-1.5],[columnX,p.building.columnZs[0]+1.5],top);
    const join=sign<0?p.joins.left:p.joins.right,z=(join.capZMin+join.capZMax)/2;
    for(const feet of [0,.45,top]) blockedSegment(W,p,`closed wing cap at feet=${feet}`,
      [join.platformEdge+sign*2,z],[join.platformEdge-sign*2,z],feet);
    for(const ramp of p.ramps) {
      const z=(ramp.zToe+ramp.zTop)/2,outer=sign<0?ramp.outerLeft:ramp.outerRight;
      blockedSegment(W,p,'diagonal ramp cheek',[outer+sign*2,z-1],[0,z+1],0);
    }
  }
});

test('a deliberately shut leaf physically blocks the unique central aperture',async()=>{
  const W=await isolatedGate(true),p=gateGeom({...explicit,open:false}).profile;
  blockedSegment(W,p,'shut central leaf',[0,p.core.frontZ-1.5],[0,p.core.frontZ+1.5],p.platform.topY);
});

test('ground support ends at the actual ramp polygon with no invisible raised shelf',async()=>{
  const W=await isolatedGate(),p=gateGeom(explicit).profile;
  for(const ramp of p.ramps) for(const t of [.2,.5,.8]) {
    const z=ramp.zTop+(ramp.zToe-ramp.zTop)*t;
    const low=ramp.leftTop+(ramp.leftToe-ramp.leftTop)*t,high=ramp.rightTop+(ramp.rightToe-ramp.rightTop)*t;
    for(const x of [low-.01,high+.01]) {
      const [wx,wz]=p.toWorld(x,z);
      near(W.cm.getGroundHeight(wx,wz,p.platform.topY),0,'outside polygon is ordinary ground');
    }
    const [wx,wz]=p.toWorld((low+high)/2,z);
    near(W.cm.getGroundHeight(wx,wz,p.platform.topY),ramp.yTop+(ramp.yToe-ramp.yTop)*t,'inside polygon uses real linear support');
  }
  const [x,z]=p.toWorld(0,0);
  near(W.cm.getGroundHeight(x,z,0),0,'deck cannot rescue an under-plinth ground query');
});

import { FirstPersonControls } from '../../src/controls/FirstPerson.js';
import { runZhaodeRoute, zhaodeRoutePoints, ZHAODE_WAYPOINT_DRIVER } from '../lib/zhaode-walk.mjs';
import runner from '../lib/stepwalk-runner.cjs';

test('additive browser dispatch leaves both published old driver bodies byte-exact',async()=>{
  const current=fs.readFileSync(new URL('../lib/stepwalk-runner.cjs',import.meta.url),'utf8');
  const physical=text=>text.slice(text.indexOf('    function runPhysicalRoute('),text.indexOf('    for (const fps of fpsList)'));
  const legacy=text=>text.slice(text.indexOf('      const [x0, z0] = pts[0];'),text.indexOf('\n    }\n    return out;'));
  const rawHash=source=>crypto.createHash('sha256').update(source).digest('hex');
  // Captured from exact delivered V6 R, allowing these tests to run from a source archive without Git.
  assert.equal(rawHash(physical(current)),'e3ae04ca227d5c11644ca0a9a535978308b06d1e5ccc20fe649e0caa4f8a3414');
  assert.equal(rawHash(legacy(current)),'23eda6426e693408f633c2147f8ef274e54df3298aef04f3f9b538545c1e3783');
  const p=gateGeom(explicit).profile,pts=zhaodeRoutePoints(p),route={name:'zhaode-contract',pts,waypointDriver:ZHAODE_WAYPOINT_DRIVER};
  assert.deepEqual(runner.routeForBrowser(route),[route.name,pts,{waypointDriver:ZHAODE_WAYPOINT_DRIVER}]);
  let evaluated=false;
  await runner.runRoutes({evaluate(){evaluated=true;return [];}},[runner.routeForBrowser(route)],[60],[false]);
  assert.equal(evaluated,true);
  await assert.rejects(runner.runRoutes({evaluate(){assert.fail('unknown driver must reject before browser evaluation');}},[['bad',pts,{waypointDriver:'unknown'}]],[60],[false]),/Unsupported waypointDriver/);
});

for(const fps of [60,10])for(const sprint of [false,true])for(const backward of [false,true])for(const from of ['front','rear'])
test(`shared live-app helper uses actual production controller: ${fps}/${sprint}/${backward}/${from}`,async t=>{
  const W=diagnosticWorld(await fullWorld()),p=gateGeom(explicit).profile;
  const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};
  const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
  globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
  const clock=t.mock.method(performance,'now',()=>100000);
  const camera=new W.THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
  controls.controls.isLocked=true;
  try{
    const result=runZhaodeRoute({controls,camera,collisionManager:W.cm},p,zhaodeRoutePoints(p,{from}),{fps,sprint,backward,from,recordFrames:true});
    assert.equal(result.arrived,true,JSON.stringify({support:result.support,stuck:result.stuckAt,feet:result.feetFailures}));
    assert.equal(result.startFeet,0);assert.equal(result.fellUnder,null);near(result.end[2],0);
    assert.ok(result.maxFeetGroundSeparation>0,'live helper retains physical smoothing/gravity');
  }finally{controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
});

import browserDiagnostics from '../zhaode-gate-browser.cjs';
test('compiled-app diagnostic injection bundles only hashed observers and the unchanged waypoint helper',async()=>{
  const previous=globalThis.window;globalThis.window={};
  try{
    const hashes=await browserDiagnostics.installZhaodeDiagnostics({evaluate:(fn,args)=>fn(args)});
    assert.deepEqual(Object.keys(hashes),['physical-waypoints.mjs','profile-support-trace.mjs','zhaode-walk.mjs']);
    assert.ok(Object.values(hashes).every(h=>/^[0-9a-f]{64}$/.test(h)));
    assert.equal(globalThis.window.__zhaodeDiagnostics.ZHAODE_WAYPOINT_DRIVER,ZHAODE_WAYPOINT_DRIVER);
    assert.equal(typeof globalThis.window.__zhaodeDiagnostics.runZhaodeRoute,'function');
  }finally{globalThis.window=previous;}
});
