import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {buildInnerJinshui,innerJinshuiProfile,canCrossInnerJinshui} from '../../src/scene/palace/special/InnerJinshui.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayKunning} from '../lib/kunning-walk.mjs';

const river=PALACE_LAYOUT.find(o=>o.type==='river');
const retained=JSON.parse(fs.readFileSync(new URL('./retained-banks-2cb15fde.json',import.meta.url)));
function fixture(){
 const materials=new Map(),library={material(name){if(!materials.has(name))materials.set(name,new THREE.MeshStandardMaterial({name}));return materials.get(name);},tileSize:()=>2};
 const waterMaterial=new THREE.MeshStandardMaterial({name:'water'}),result=buildInnerJinshui(library,river,waterMaterial);
 result.group.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[river];cm.addColliders(result.colliders);cm.addWalkables(result.walkables);
 return {THREE,cm,...result,dispose(){const geometries=new Set();result.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();waterMaterial.dispose();}};
}
const down=(group,x,z)=>new THREE.Raycaster(new THREE.Vector3(x,5,z),new THREE.Vector3(0,-1,0),0,10).intersectObject(group,true).filter(h=>!h.object.userData.isWater);

// Catches reverting the source-observed imperial hierarchy to five equal copies.
test('the imperial bridge is visibly wider, longer and higher than each of its four independent neighbours',()=>{
 const p=innerJinshuiProfile(river),middle=p.bridges[2];assert.equal(middle.x,0);assert.equal(middle.z,-310.8);
 for(const b of p.bridges.filter(o=>o!==middle)){
  assert.ok(middle.width>b.width+1,'central width is materially distinct, not a rounding change');
  assert.ok(middle.length>b.length+1,'central landing span is materially distinct');
  assert.ok(Math.max(...middle.deck.map(v=>v.y))>Math.max(...b.deck.map(v=>v.y))+.05,'rendered profile is higher');
 }
 assert.match(middle.dimensionStatus,/FIT.*NOT_SURVEYED/);
});

// Catches widening the bridge by reshaping the river, moving anchors or editing the other four bridges.
test('all retained bank vertices, water polygon and four side bridge profiles survive exactly',()=>{
 const p=innerJinshuiProfile(river);assert.deepEqual(p.banks,retained.banks);assert.deepEqual(p.waterPolygon,retained.waterPolygon);
 assert.deepEqual(p.bridges.filter(b=>b.x!==0),retained.outerBridges);
});

// Catches metadata-only widening and invisible rescue planes outside the actual stone deck.
test('the widened imperial lanes have visible stone, actual support and real water permissions while outside water stays closed',()=>{
 const w=fixture();try{
  for(const x of[-3.15,0,3.15]){
   const hits=down(w.group,x,-310.8);assert.ok(hits.length);assert.ok(hits[0].point.y>1&&hits[0].point.y<1.2,'actual central stone deck, not old .9m or river bed');
   assert.ok(Math.abs(w.cm.getGroundHeight(x,-310.8,1.2,0,.3)-hits[0].point.y)<.02);
   assert.equal(canCrossInnerJinshui(river,{x,z:-310.8},.5),true);
  }
  assert.equal(canCrossInnerJinshui(river,{x:4.8,z:-310.8},.5),false);
  assert.equal(w.cm.checkCollision(new THREE.Vector3(-3.94,2.75,-310.8),.3),true,'real outer rail remains a body barrier');
  assert.equal(w.cm.checkCollision(new THREE.Vector3(0,2.75,-310.8),.3),false,'no widened-deck air blocker');
 }finally{w.dispose();}
});

for(const fps of[10,60])for(const sprint of[false,true])test(`real imperial bridge wide-lane roundtrips at ${fps}Hz sprint=${sprint}`,t=>{
 const w=fixture();try{for(const x of[-3.15,0,3.15]){
  const r=replayKunning(t,w,[[x,-326],[x,-296],[x,-326]],{startFeet:0,fps,sprint});
  assert.equal(r.arrived,true,JSON.stringify({x,fps,sprint,...r,frames:undefined}));assert.ok(r.maxFeet>1&&r.maxFeet<1.2);assert.ok(r.minFeet>=-.001);
 }}finally{w.dispose();}
});

// Catches accepting nonfinite crest or bank-sampling parameters that would create broken supports.
test('malformed bridge crest or retained bank sampling width fails before geometry is built',()=>{
 for(const patch of[{crest:NaN},{crest:-1},{crest:Infinity},{bankSamplingWidth:NaN},{bankSamplingWidth:0}]){
  const r={...river,bridges:structuredClone(river.bridges)};Object.assign(r.bridges[2],patch);
  assert.throws(()=>innerJinshuiProfile(r),/bridge.*(crest|sampling|registration)|Invalid.*bridge/i);
 }
});
