// Component integration against the REAL production dispatcher by default.
// HALLS_INTEGRATION_BUILDER is only for the labelled pre-integration patch test;
// that run is not evidence that the production entry has already been changed.
import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {library} from '../../lib/inner-palace-fixture.mjs';
import {walkStraight} from '../../lib/world.mjs';
import {TAIHEMEN_BRONZE_LIONS} from '../../../src/scene/palace/TaihemenBronzeLions.js';
const {PalaceBuilder}=await import(process.env.HALLS_INTEGRATION_BUILDER??new URL('../../../src/scene/PalaceBuilder.js',import.meta.url));
const scene=new T.Scene(),b=new PalaceBuilder(scene,library());
b.finish=g=>{const architecture=[];g.traverse(o=>{if(o.userData.structure?.id)architecture.push(structuredClone(o.userData.structure));});g.userData.architecture=architecture;b.addObject(g);return g;};
b.buildAll(PALACE_LAYOUT.filter(h=>['太和门','太和殿','中和殿','保和殿'].includes(h.name)));
scene.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.colliders);cm.addWalkables(b.walkables);
test.after(()=>b.dispose());
test('actual dispatch installs both independently owned lions in addition to the retained six fixtures',()=>{
 const g=scene.getObjectByName('太和门');for(const p of TAIHEMEN_BRONZE_LIONS)assert.ok(g.getObjectByName(p.id),`absent production ${p.side} lion`);
 assert.equal(g.userData.taihemenSouth.fixtures.length,6);assert.ok(g.userData.taihemenSouth.fixtures.every(f=>f.implementedInProduction));
});
test('actual west extension has visible slabs and matching three-level walkable support',()=>{
 const g=scene.getObjectByName('三台');assert.ok(g.userData.baoheWestTerrace,'west extension is not dispatched');
 for(const[x,y]of[[50,8],[56,16/3],[62,8/3],[-50,8],[-56,16/3],[-62,8/3]])for(const z of[110,150]){
  assert.ok(Math.abs(cm.getGroundHeight(x,z,8,.6)-y)<.05,`missing support ${x},${z}`);
  const ray=new T.Raycaster(new T.Vector3(x,y+.25,z),new T.Vector3(0,-1,0),0,.6);assert.ok(ray.intersectObject(g,true).length,`invisible support ${x},${z}`);
 }
});
test('new west courtyard is free of the old narrow terrace rail and has its own outer edge guard',()=>{
 assert.equal(cm.checkCollision(new T.Vector3(29,9.7,110),.5),false,'retained narrow boundary blocks new courtyard');
 assert.equal(cm.checkCollision(new T.Vector3(53.3,9.7,110),.5),true,'outer edge must remain guarded');
});
test('west upper door crosses in both directions at walk/run-sized steps while solid flanks block',()=>{
 assert.ok(scene.getObjectByName('baohe-west-stepped-firewall'),'missing production west wall');
 for(const step of[.4,.8])for(const[a,z]of[[119,127],[127,119]]){const r=walkStraight({THREE:T,cm},[39,a],[39,z],{step,feet0:8});assert.ok(r.reached>r.total-.3,JSON.stringify(r));assert.ok(Math.abs(r.feet-8)<.05);}
 for(const x of[34,44])assert.equal(cm.checkCollision(new T.Vector3(x,9.7,123),.5),true,'wall flank must be solid');
});
test('north central approach metadata and unchanged east wall opening are retained',()=>{
 assert.equal(b.baoheNorthTiers.length,3);const east=scene.getObjectByName('baohe-east-stepped-firewall');assert.equal(east.userData.structure.passage.centerX,-37);assert.equal(east.userData.structure.passage.floorY,8);
 const r=walkStraight({THREE:T,cm},[-37,120],[-37,126],{feet0:8});assert.ok(r.reached>r.total-.3,JSON.stringify(r));
});
