import {HistoricalR21PalaceBuilder} from './lib/historical-r21-baohe-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {BAOHE_DEPTH_GRID as P,baoheDepthGrid,baoheDepthColumnPresent} from '../src/scene/palace/BaoheDepthGrid.js';
import {captureBaoheDepth} from './lib/baohe-depth-capture.mjs';
import {HistoricalR20PalaceBuilder} from './lib/historical-r20-baohe-fixture.mjs';
import {HistoricalR19PalaceBuilder} from './lib/historical-r19-baohe-fixture.mjs';
import baseline from './fixtures/r19-baohe-depth-baseline.json' with {type:'json'};
import {buildWorld,walkStraight} from './lib/world.mjs';
const A=captureBaoheDepth('保和殿'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const by=(i,k)=>A.columns.filter(r=>r.mesh.userData.baoheColumn.i===i&&r.mesh.userData.baoheColumn.k===k);
test('six unequal station axes remain distinct from the retained floor envelope',()=>{assert.deepEqual(P.z,[-10.8,-8.3,-3.7,3.6,8.2,10.8]);assert.equal(P.registrationAllowance,.3);const p=baoheDepthGrid(25);near(p.sideWallDepth,21.6);near(p.frontDoorZ-p.southEaveZ,2.5);near(p.rearDoorZ,p.northEaveZ);assert.match(P.dimensionsStatus,/NOT_CURRENT_SURVEY/);for(const d of[NaN,Infinity,21.6,23,26])assert.throws(()=>baoheDepthGrid(d));});
test('station occupancy follows all60 drawn intersections, omitting only row2 six inner posts',()=>{assert.equal(A.columns.length,54);for(let i=0;i<=9;i++)for(let k=0;k<=5;k++){const present=!(k===2&&i>=2&&i<=7);assert.equal(baoheDepthColumnPresent(i,k,9,5),present);assert.equal(by(i,k).length,present?1:0);}for(const args of[[0,0,9,3],[-1,0,9,5],[1,6,9,5],[.5,1,9,5],[9,2,7,5]])assert.throws(()=>baoheDepthColumnPresent(...args));});
test('all54red posts and physical boxes share exact new station centres',()=>{const boxes=new Set();for(const {mesh,box}of A.columns){const{i,k}=mesh.userData.baoheColumn;assert.equal(mesh.material.name,'wood_column');near(mesh.position.z,P.z[k]);near((box.min.z+box.max.z)/2,P.z[k]);near((box.min.x+box.max.x)/2,mesh.position.x);assert.equal(A.builder.colliders.filter(b=>b===box).length,1);assert.ok(!boxes.has(box));boxes.add(box);}for(const x of[-14.7,-9.15,-3.65,3.65,9.15,14.7])assert.equal(A.builder.colliders.filter(b=>Math.abs((b.min.x+b.max.x)/2-x)<1e-7&&Math.abs((b.min.z+b.max.z)/2-P.z[2])<1e-7).length,0);});
test('historical R21 door geometry, thresholds and obstruction boxes retain the original asymmetric front/rear planes',()=>{const historical=captureBaoheDepth('保和殿',HistoricalR21PalaceBuilder);try{for(const z of[-8.3,10.8]){assert.equal(historical.boxes.filter(b=>b.material==='wood_column'&&b.size[1]===.25&&Math.abs(b.position[2]-z)<1e-7).length,1);assert.equal(historical.builder.colliders.filter(b=>Math.abs((b.min.z+b.max.z)/2-z)<1e-7&&Math.abs(b.max.z-b.min.z-.5)<1e-7).length,2);assert.equal(historical.boxes.filter(b=>b.material==='lattice_doors'&&Math.abs(b.position[2]-z)<1e-7).length,6);}for(const old of[-12.5,12.5])assert.equal(historical.builder.colliders.filter(b=>Math.abs((b.min.z+b.max.z)/2-old)<1e-7&&Math.abs(b.max.z-b.min.z-.5)<1e-7).length,0);}finally{historical.builder.dispose();}});
test('gable enclosures close at outer axes and front outer eave beam remains separate',()=>{for(const b of A.boxes.filter(b=>b.material==='wall_red'&&b.size[0]===.9)){near(b.size[2],21.6);near(b.position[2],0);}assert.equal(A.boxes.filter(b=>b.material==='caihua_beam'&&b.size[2]===.6&&Math.abs(b.position[2]+10.8)<1e-7).length,1);assert.equal(A.builder.colliders.filter(b=>Math.abs(b.min.z+10.8)<1e-7&&Math.abs(b.max.z-10.8)<1e-7&&Math.abs(b.max.x-b.min.x-1)<1e-7).length,2);});
test('live Baohe retains caisson retirement and throne navigation; frozen R20 retains pre-R21 furnishing fingerprints',()=>{
 const old=captureBaoheDepth('保和殿',HistoricalR20PalaceBuilder),expected=baseline.halls['保和殿'];
 try{
  assert.equal(expected.caissonCount,3);assert.equal(A.summary.caissonCount,0);
  for(const k of['furnitureSHA256','throneNavigationSHA256','throneInput','walkablesSHA256'])assert.deepEqual(old.summary[k],expected[k],k);
  for(const k of['throneNavigationSHA256','walkablesSHA256'])assert.deepEqual(A.summary[k],expected[k],k);
  assert.deepEqual(A.summary.throneInput,{...expected.throneInput,baohe:true});
  assert.notEqual(A.summary.furnitureSHA256,old.summary.furnitureSHA256,'R21 furnishing change is tested directly in its own acceptance');
 }finally{old.builder.dispose();}
});
test('historical frozen R19 ceiling planes and roof retain their original fingerprints; live height revision changes both intentionally',()=>{const old=captureBaoheDepth('保和殿',HistoricalR19PalaceBuilder);try{for(const k of['planesSHA256','roofSHA256']){assert.deepEqual(old.summary[k],baseline.halls['保和殿'][k],k);assert.notEqual(A.summary[k],old.summary[k],k);}}finally{old.builder.dispose();}});
for(const name of['太和殿','乾清宫','坤宁宫','中和殿'])test(name+' complete geometry material and collision identity retained with explicit non-Baohe dispatch',()=>{
 const current=captureBaoheDepth(name),old=captureBaoheDepth(name,HistoricalR20PalaceBuilder),expected=baseline.halls[name];
 try{
  assert.deepEqual(old.summary,expected,'frozen R20 historical identity');
  // Qianqing uses buildHall's explicit R21 false dispatch; Zhonghe's separate
  // square-hall builder keeps its original argument object byte-for-byte.
  const liveExpected=name==='乾清宫'?{...expected,throneInput:{...expected.throneInput,baohe:false}}:expected;
  assert.deepEqual(current.summary,liveExpected);
 }finally{current.builder.dispose();old.builder.dispose();}
});
const W=await buildWorld();
for(const reverse of[false,true])test('real collision clears reduced front row across six former sites '+reverse,()=>{let a=[-17,123.2-3.7],b=[17,123.2-3.7];if(reverse)[a,b]=[b,a];const r=walkStraight(W,a,b,{feet0:9,step:.025});assert.ok(r.reached>r.total-.1,JSON.stringify(r));near(r.feet,9);});
for(const x of[-6.4,-2.075,2.075,6.4])for(const reverse of[false,true])test(`north approach to recessed retained door x${x} reverse${reverse}`,()=>{let a=[x,140.2],b=[x,133.2];if(reverse)[a,b]=[b,a];const r=walkStraight(W,a,b,{feet0:reverse?9:8,step:.025});assert.ok(r.reached>r.total-.1,JSON.stringify(r));near(r.feet,reverse?8:9);});
for(const reverse of[false,true])test('front central porch and recessed doorway remain walkable '+reverse,()=>{let a=[0,111],b=[0,120.8];if(reverse)[a,b]=[b,a];const r=walkStraight(W,a,b,{feet0:9,step:.025});assert.ok(r.reached>r.total-.1,JSON.stringify(r));near(r.feet,9);});
test('restored rear posts remain collision obstacles instead of being silently cut out for the throne',()=>{const r=walkStraight(W,[9.15,129.8],[9.15,132.8],{feet0:9,step:.025});assert.ok(r.reached<r.total-1,JSON.stringify(r));near(r.feet,9);});

// CPU execution of the production controller; not a native-browser claim.
const {replayTerrace}=await import('./lib/terrace-walk.mjs');
const controllerWorld={...W,THREE:await import('three')};
const controllerRoutes={
  cross:[[ -17,119.5],[17,119.5],[-17,119.5]],
  south:[[0,111],[0,120.8],[0,111]],
  northInner:[[2.075,140.2],[2.075,133.2],[2.075,140.2]],
  northOuter:[[-6.4,140.2],[-6.4,133.2],[-6.4,140.2]],
};
for(const[name,points]of Object.entries(controllerRoutes))for(const fps of[60,10])for(const sprint of[false,true])test(`production controller ${name} ${fps}fps sprint${sprint}`,t=>{
  const r=replayTerrace(t,controllerWorld,points,{fps,sprint});
  assert.equal(r.arrived,true,JSON.stringify(r));
  near(r.startFeet,name.startsWith('north')?8:9);near(r.maxFeet,9);near(r.end[2],r.startFeet);
});
