import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readHistoricalSource} from '../lib/historical-sources.mjs';
import baseline from '../fixtures/v7-qinan-route-baseline.json' with {type:'json'};
import {buildWorld, walkStraight} from '../lib/world.mjs';
import {buildAutoRoutes} from '../lib/auto-routes.mjs';
import {qinanGeometry} from '../../src/scene/palace/special/QinanProfile.js';
const legacyFixed='御花园→钦安殿内→穿殿北出',legacyAuto='[garden] 坤宁门→钦安殿→返回';
const newFixed='御花园→钦安殿地面外观→返回',newAuto='[garden] 坤宁门→钦安殿地面外观→返回';
const W=await buildWorld(),auto=buildAutoRoutes(W,W.zones.map(z=>z.json));
const fixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{cwd:new URL('../..',import.meta.url),env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const i=line.indexOf(' [[');return{name:line.slice(0,i),pts:JSON.parse(line.slice(i+1))};});
const g=qinanGeometry(W.zones.find(z=>z.json.id==='garden').json.items.find(i=>i.qinanProfile));

test('exactly the two named Qin’an descriptors change; all 32 fixed and 58 automatic descriptors remain byte-exact',()=>{
 assert.equal(fixed.length,33);assert.equal(auto.length,59);
 assert.equal(fixed.filter(r=>r.name===newFixed).length,1);assert.equal(auto.filter(r=>r.name===newAuto).length,1);
 assert.ok(!fixed.some(r=>r.name===legacyFixed));assert.ok(!auto.some(r=>r.name===legacyAuto));
 const unchangedFixed=fixed.filter(r=>r.name!==newFixed),unchangedAuto=auto.filter(r=>r.name!==newAuto);
 assert.equal(unchangedFixed.length,32);assert.equal(unchangedAuto.length,58);
 assert.equal(JSON.stringify(unchangedFixed),JSON.stringify(baseline.fixed.filter(r=>r.name!==legacyFixed)));
 assert.equal(JSON.stringify(unchangedAuto),JSON.stringify(baseline.auto.filter(r=>r.name!==legacyAuto)));
});
test('replacement routes finish at the profile ground-view point and return without terrace or north-through legs',()=>{
 for(const route of [fixed.find(r=>r.name===newFixed),auto.find(r=>r.name===newAuto)]){
  assert.ok(route);assert.deepEqual(route.pts[(route.pts.length-1)/2],[g.navigation.position.x,g.navigation.position.z]);
  assert.deepEqual(route.pts.at(-1),route.pts[0]);assert.deepEqual(route.pts.slice((route.pts.length+1)/2),route.pts.slice(0,(route.pts.length-1)/2).reverse());
  assert.ok(route.pts.every(p=>p[1]<=477));assert.equal(route.waypointDriver,undefined,'original legacy driver unchanged');
  for(let i=1;i<route.pts.length;i++){const r=walkStraight(W,route.pts[i-1],route.pts[i],{feet0:0});assert.equal(r.reached,r.total,JSON.stringify(r));assert.equal(r.feet,0);}
 }
 const route=auto.find(r=>r.name===newAuto);assert.equal(route.navigationMode,'exterior-view');assert.equal(route.replacesLegacyRoute,legacyAuto);assert.ok(route.plan.some(s=>s.includes('旧穿殿假设已撤回')));
});
// Exact 2D slab clipping: the 1×1m player sweeps a segment against the
// omitted source footprint expanded by its 0.5m half-width. This is a route
// exclusion guard only; the known missing stonework is NOT a fake collider.
const omission=g.omittedFeatures.find(f=>f.id==='qinan-south-axial-composite').footprint;
function crossesOmission(p,q,radius=.5) {
 let lo=0,hi=1;
 for(const [axis,min,max] of [[0,omission.minX-radius,omission.maxX+radius],[1,omission.minZ-radius,omission.maxZ+radius]]){
  const delta=q[axis]-p[axis];
  if(Math.abs(delta)<1e-12){if(p[axis]<min||p[axis]>max)return false;continue;}
  const a=(min-p[axis])/delta,b=(max-p[axis])/delta;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;
 }
 return true;
}
test('all replacement segments keep the full player AABB outside the known omitted axial stonework',()=>{
 assert.deepEqual(Object.values(omission).map(x=>+x.toFixed(3)),[-1.5,1.5,473.5,480.2]);
 for(const route of [fixed.find(r=>r.name===newFixed),auto.find(r=>r.name===newAuto)]){
  for(let i=1;i<route.pts.length;i++)assert.equal(crossesOmission(route.pts[i-1],route.pts[i]),false,`${route.name} segment ${i}`);
  assert.ok(route.pts.some(([x,z])=>x===18&&z===429.7),'use the design §11.4 side approach');
 }
});
test('omission guard rejects the superseded centerline detour and crossings with endpoints outside',()=>{
 assert.equal(crossesOmission([0,433.7],[0,477]),true,'rejected first prototype axial approach');
 assert.equal(crossesOmission([0,477],[18,477]),true,'rejected first prototype lateral escape');
 assert.equal(crossesOmission([-3,477],[3,477]),true,'both endpoints outside is insufficient');
 assert.equal(crossesOmission([1.9,470],[1.9,482]),true,'center clear but 1m footprint clips omitted stonework');
 assert.equal(crossesOmission([18,429.7],[18,477]),false,'source side-chain is outside expanded omission');
});
test('historical through-hall route is retained verbatim as negative legacy evidence and is physically blocked',()=>{
 const old=baseline.fixed.find(r=>r.name===legacyFixed);assert.ok(old);assert.deepEqual(old.pts,[[0,433.7],[0,473.1],[0,492.1],[3.5,492.1],[3.5,499.1],[0,499.1],[0,509.1]]);
 const result=walkStraight(W,old.pts[1],old.pts[2],{feet0:0});assert.ok(result.reached<result.total-1,JSON.stringify(result));assert.equal(result.feet,0);
 const north=walkStraight(W,[0,503],[0,495],{feet0:0});assert.ok(north.reached<north.total-1,JSON.stringify(north));
});
test('driver/collision/V5 fixture retain V7 bytes; FirstPerson and constants allow only composed finite V9 input, map and gate deltas',()=>{
 const files=['tests/lib/stepwalk-runner.cjs','tests/lib/physical-waypoints.mjs','tests/lib/terrace-walk.mjs','tests/lib/zhaode-walk.mjs','src/controls/FirstPerson.js','src/utils/Collision.js','src/config/constants.js','tests/fixtures/v5-fixed-routes.json'];
 for(const path of files){const old=readHistoricalSource(baseline.commit,path),current=fs.readFileSync(new URL(`../../${path}`,import.meta.url));
  if(path==='src/controls/FirstPerson.js') assertV9MapFirstPersonBytes(old,current);
  else if(path==='src/config/constants.js') assertGateConstantsBytes(old,current);
  else assert.equal(crypto.createHash('sha256').update(current).digest('hex'),crypto.createHash('sha256').update(old).digest('hex'),path);
 }
});

import {assertGateConstantsBytes} from '../lib/v9-gate-constants-delta.mjs';
import {assertV9MapFirstPersonBytes} from '../lib/v9-map-source-delta.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {traceTerraceGround} from '../lib/terrace-walk.mjs';
import {replayQinanExterior} from '../lib/qinan-exterior-walk.mjs';
const diagnostic=disableRescue=>{const cm=new CollisionManager();for(const c of W.cm.colliders)cm.addCollider(c.mesh,c.tag);for(const w of W.cm.walkables)cm.addWalkable(disableRescue&&w.type==='box'?{...w,rescue:false}:w,w.tag);return{...W,cm};};
for(const kind of ['fixed','auto']) for(const disableRescue of [false,true]) for(const fps of [60,10]) for(const sprint of [false,true]) for(const backward of [false,true]) {
 test(`real controller ground-only exterior: ${kind}, ${fps}Hz, sprint=${sprint}, backward=${backward}, disableRescue=${disableRescue}`,t=>{
  const route=(kind==='fixed'?fixed:auto).find(r=>r.name===(kind==='fixed'?newFixed:newAuto));assert.ok(route);
  const world=diagnostic(disableRescue),trace=traceTerraceGround(world.cm,{flights:[]});let result;
  try{result=replayQinanExterior(t,world,route.pts,{fps,sprint,backward,recordFrames:true});}finally{trace.restore();}
  if(process.env.QINAN_NAV_EVIDENCE_DIR){
   const dir=process.env.QINAN_NAV_EVIDENCE_DIR;fs.mkdirSync(dir,{recursive:true});
   const sources=['data/architecture/qinan.json','src/scene/palace/special/QinanProfile.js','src/scene/palace/special/QinanHall.js','src/scene/palace/special/QinanRoof.js','src/ui/Teleport.js','tests/lib/qinan-exterior-walk.mjs','tests/lib/auto-routes.mjs','tests/stepwalk.cjs','src/controls/FirstPerson.js','src/utils/Collision.js'];
   const sourceHashes=Object.fromEntries(sources.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(new URL(`../../${p}`,import.meta.url))).digest('hex')]));
   fs.writeFileSync(`${dir}/${kind}-${fps}-${sprint?'sprint':'walk'}-${backward?'backward':'forward'}-${disableRescue?'no-rescue':'default'}.json`,JSON.stringify({status:'CPU_ONLY_BROWSER_VALIDATION_PENDING',profileHash:g.profileHash,route,sourceHashes,result,supportQueries:trace.samples},null,2)+'\n');
  }
  assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(result.startFeet,0);assert.equal(result.maxFeet,kind==='fixed'?0:.45,'only the inherited Kunning Gate threshold may lift feet');assert.equal(result.minFeet,0);assert.equal(result.end[2],0);assert.equal(result.collisionFrames,0);
  assert.equal(result.waypoints.length,route.pts.length-1);assert.ok(result.maxSpeed>=(sprint?11.9:4.9));
  assert.ok(trace.samples.length>0);const gate=W.zones.find(z=>z.json.id==='garden').json.items.find(i=>i.name==='坤宁门'&&i.kind==='gate');
  const gateSupports=world.cm.walkables.filter(w=>w.tag==='garden'&&w.type==='box'&&w.box.min.x<gate.x&&w.box.max.x>gate.x&&w.box.min.z<gate.z&&w.box.max.z>gate.z);
  assert.equal(gateSupports.length,1);const gateIndex=world.cm.walkables.indexOf(gateSupports[0]);assert.equal(gateSupports[0].box.max.y,.45);
  assert.ok(trace.samples.every(s=>(s.source==='ground'&&s.height===0)||(kind==='auto'&&s.source==='box'&&s.supportIndex===gateIndex&&s.height===.45)),'ground or the one inherited Kunning Gate threshold only; no Qin’an terrace, ramp or rescue');
  assert.ok(trace.samples.filter(s=>s.z>=433.7).every(s=>s.source==='ground'&&s.height===0),'Qin’an exterior approach and viewpoint remain at world ground');

  const physicalPoints=[route.pts[0],...result.frames.map(f=>[f.x,f.z])];
  for(let i=1;i<physicalPoints.length;i++)assert.equal(crossesOmission(physicalPoints[i-1],physicalPoints[i]),false,`actual 1m body swept into known omission on frame ${i}`);
 });
}
