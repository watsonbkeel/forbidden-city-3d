import {restorePreR22BaoheTraversalRoute} from './lib/r22-baohe-route-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {baoheDepthGrid} from '../src/scene/palace/BaoheDepthGrid.js';
import {baoheColumnGrid} from '../src/scene/palace/BaoheColumnGrid.js';
import {buildWorld,walkStraight} from './lib/world.mjs';
import delta from './fixtures/r19-baohe-routes-delta.json' with {type:'json'};
const {runRoutes}=createRequire(import.meta.url)('./lib/stepwalk-runner.cjs');
const root=new URL('../',import.meta.url),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const routes=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{cwd:root,env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const at=line.indexOf(' ');return{name:line.slice(0,at),pts:JSON.parse(line.slice(at+1))};});
const d=delta.fixed,current=routes[d.index],hall=PALACE_LAYOUT.find(h=>h.name==='保和殿'),depth=baoheDepthGrid(hall.dimensions.depth),grid=baoheColumnGrid(hall.dimensions.width);
const radius=Math.min(.6,Math.max(.3,hall.dimensions.width/(grid.x.length-1)*.08)),rear=hall.position.z+depth.rearDoorZ,safe=Math.round((rear+radius+.5+.25)*10)/10;
const W=await buildWorld(),post=W.cm.colliders.filter(c=>Math.abs((c.box.min.x+c.box.max.x)/2-grid.x[5])<1e-7&&Math.abs((c.box.min.z+c.box.max.z)/2-rear)<1e-7);
// Execute the unchanged runRoutes evaluate callback directly in Node with the
// production controller and world. Only DOM/clock/RAF are stubbed. This is CPU
// evidence using the original legacy driver, never a native-browser claim.
async function replayOriginalDriver(t,points,fps,sprint){
  const old={document:globalThis.document,window:globalThis.window,cancelAnimationFrame:globalThis.cancelAnimationFrame},noop=()=>{};
  const doc={...old.document,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
  globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};globalThis.cancelAnimationFrame=noop;
  const clock=t.mock.method(performance,'now',()=>1000),camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
  globalThis.window.__forbiddenCityApp={camera,controls,collisionManager:W.cm};
  try{return (await runRoutes({evaluate:(fn,args)=>fn(args)},[['Baohe tail',points]],[fps],[sprint]))[0];}
  finally{controls.dispose();clock.mock.restore();Object.assign(globalThis,old);}
}

test('historical R19 tuple gains only two north-porch points; current route retains the actual north tail',()=>{
  const historicalR19=restorePreR22BaoheTraversalRoute(current);
  assert.equal(routes.length,33);assert.equal(current.name,'太和殿→中和殿→保和殿');assert.deepEqual(historicalR19,d.after);
  near(safe,135.2);assert.deepEqual(current.pts.slice(-4),[[6.1,133.7],[6.1,safe],[0,safe],[0,133.7]]);
  assert.deepEqual(historicalR19.pts.slice(0,-3),d.before.pts.slice(0,-1));assert.deepEqual(current.pts[0],d.before.pts[0]);assert.deepEqual(current.pts.at(-1),d.before.pts.at(-1));
});
test('the exact restored rear-eave post alone blocks the old horizontal leg and remains physical',()=>{
  assert.equal(post.length,1);const box=post[0].box;near((box.min.x+box.max.x)/2,3.65);near((box.min.z+box.max.z)/2,134);near(box.max.z-box.min.z,2*radius);near(box.min.y,9);near(box.max.y,12);
  const isolated=new CollisionManager();isolated.addCollider(box);isolated.addWalkables(W.cm.walkables);
  const r=walkStraight({THREE,cm:isolated},...d.before.pts.slice(-2),{feet0:9,step:.025});assert.ok(r.reached<r.total-1,JSON.stringify(r));assert.ok(r.end[0]>box.max.x+.49,JSON.stringify(r));
  assert.equal(W.cm.checkCollision(new THREE.Vector3(3.65,10.7,133.7),.5),true);assert.equal(W.cm.checkCollision(new THREE.Vector3(3.65,10.7,safe),.5),false);
});
for(const fps of[60,10])for(const sprint of[false,true]){
  test(`unchanged legacy driver + production controller reproduces old post blockage ${fps}/${sprint}`,async t=>{
    const r=await replayOriginalDriver(t,d.before.pts.slice(-2),fps,sprint);assert.equal(r.arrived,false,JSON.stringify(r));assert.deepEqual(r.stuckAt,d.before.pts.at(-1));near(r.end[2],9);assert.ok(r.end[0]>4.5&&r.end[0]<4.9,JSON.stringify(r));
  });
  test(`unchanged legacy driver + production controller clears corrected north tail ${fps}/${sprint}`,async t=>{
    const r=await replayOriginalDriver(t,current.pts.slice(-5),fps,sprint);assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(r.fellUnder,null);near(r.end[2],9);near(r.maxFeet,9);
    assert.equal(W.cm.colliders.includes(post[0]),true);assert.equal(W.cm.checkCollision(new THREE.Vector3(3.65,10.7,133.7),.5),true);
  });
}
