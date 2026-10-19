import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {captureBaoheFrontCrossing} from './lib/baohe-front-route.mjs';
const{runRoutes}=createRequire(import.meta.url)('./lib/stepwalk-runner.cjs');
const W=await buildWorld(),p=captureBaoheFrontCrossing();
async function replay(t,points,fps,sprint){
 const old={document:globalThis.document,window:globalThis.window,cancelAnimationFrame:globalThis.cancelAnimationFrame},noop=()=>{};
 const doc={...old.document,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};globalThis.cancelAnimationFrame=noop;
 const clock=t.mock.method(performance,'now',()=>1000),camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);globalThis.window.__forbiddenCityApp={camera,controls,collisionManager:W.cm};
 try{return(await runRoutes({evaluate:(fn,args)=>fn(args)},[['Baohe front',points]],[fps],[sprint]))[0];}finally{controls.dispose();clock.mock.restore();Object.assign(globalThis,old);}
}
test('inside cross-aisle clears actual folded leaves plus player radius and unchanged arrival tolerance',()=>{
 assert.equal(p.leafCount,12);assert.ok(Math.abs(p.northmost-(114.9+(7.3-2*(49.7/9*.08))/4))<1e-5);assert.equal(p.crossZ,118.1);assert.equal(p.arrivalTolerance,.8);
 assert.ok(p.crossZ-p.arrivalTolerance>p.northmost+p.playerRadius+p.clearance);
 const old=walkStraight(W,[0,116.2],[6.1,116.2],{feet0:9,step:.025});assert.ok(old.reached<1.05);assert.equal(old.feet,9);
 const fresh=walkStraight(W,[0,p.crossZ],[6.1,p.crossZ],{feet0:9,step:.025});assert.ok(fresh.reached>=6.04);assert.equal(fresh.feet,9);
});
for(const fps of[60,10])for(const sprint of[false,true]){
 test(`originaldriver retains old leaf blockage ${fps}/${sprint}`,async t=>{const r=await replay(t,[[0,111.9],[0,116.2],[6.1,116.2],[6.1,122]],fps,sprint);assert.equal(r.arrived,false,JSON.stringify(r));assert.deepEqual(r.stuckAt,[6.1,116.2]);assert.ok(r.end[0]<1.1);});
 test(`originaldriver completes corrected inside turn ${fps}/${sprint}`,async t=>{const r=await replay(t,[[0,111.9],[0,p.crossZ],[6.1,p.crossZ],[6.1,122]],fps,sprint);assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(r.fellUnder,null);assert.equal(r.end[2],9);});
}
