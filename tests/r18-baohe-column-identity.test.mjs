// Exact pre-R25 nameboard poses for historical whole-hall fingerprints only.
import {HistoricalR24PalaceBuilder} from './lib/historical-r24-baohe-fixture.mjs';
import {HistoricalR18PalaceBuilder,buildHistoricalR18World} from './lib/historical-r18-baohe-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {BAOHE_COLUMN_IDENTITY as P,baoheColumnPresent} from '../src/scene/palace/BaoheColumnIdentity.js';
import {captureColumns} from './lib/baohe-column-capture.mjs';
import {walkStraight} from './lib/world.mjs';
import baseline from './fixtures/r18-baohe-columns-baseline.json' with {type:'json'};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
// The 34-column layout and its walks belong to frozen R18, not live R19.
// The live 54-column six-depth layout is asserted in r19-baohe-depth-ceiling.
const A=captureColumns('保和殿',HistoricalR18PalaceBuilder),by=(i,k)=>A.columns.filter(r=>r.mesh.userData.baoheColumn.i===i&&r.mesh.userData.baoheColumn.k===k);
test('Historical R18: identity scope is explicit and rejects unreviewed depth grids',()=>{assert.match(P.depthStatus,/NOT_FIVE_BAY/);for(const args of[[0,0,9,5],[-1,0,9,3],[1,4,9,3],[.5,1,9,3],[9,2,7,3]])assert.throws(()=>baoheColumnPresent(...args));});
test('Historical R18: exact six front omissions and two rear restorations; not a historical total',()=>{assert.equal(A.columns.length,34);for(let i=0;i<=9;i++)for(let k=0;k<=3;k++)assert.equal(by(i,k).length,k===1&&i>=2&&i<=7?0:1);assert.equal(baseline.halls['保和殿'].columnCount,38);});
test('Historical R18: every retained/restored post owns one physical box and the approved red wood material',()=>{const positions=new Set();for(const{mesh,box}of A.columns){assert.equal(mesh.material.name,'wood_column');assert.equal(A.builder.colliders.filter(b=>b===box).length,1);near((box.min.x+box.max.x)/2,mesh.position.x);near((box.min.z+box.max.z)/2,mesh.position.z);near(box.min.y,9.9375);near(box.max.y,12.9375);const key=mesh.position.toArray().join(',');assert.ok(!positions.has(key));positions.add(key);}});
test('Historical R18: no invisible column collider survives at the six omitted front sites',()=>{for(const x of[-14.7,-9.15,-3.65,3.65,9.15,14.7])assert.equal(A.builder.colliders.filter(b=>Math.abs((b.min.x+b.max.x)/2-x)<1e-7&&Math.abs((b.min.z+b.max.z)/2+25/6)<1e-7).length,0);});
test('Historical R18: plinth, doors, throne and all noncolumn hall geometry/navigation stay byte-exact',()=>{const b=baseline.halls['保和殿'];for(const k of['nonColumnGeometrySHA256','nonColumnNavigationSHA256','walkablesSHA256'])assert.equal(A.summary[k],b[k]);});
for(const name of['太和殿','乾清宫','坤宁宫','中和殿'])test(`Frozen R24: ${name} complete hall unaffected by R18 column changes`,()=>assert.deepEqual(captureColumns(name,HistoricalR24PalaceBuilder).summary,baseline.halls[name]));
test('Historical R18: full-world front interior cross-aisle opens in both directions with real collision',async()=>{const W=await buildHistoricalR18World();for(const [a,b]of[[[-17,119.03333333333333],[17,119.03333333333333]],[[17,119.03333333333333],[-17,119.03333333333333]]]){const r=walkStraight(W,a,b,{feet0:9,step:.025});assert.ok(r.reached>r.total-.1,JSON.stringify(r));near(r.feet,9);}});
test('Historical R18: a retained rear column still blocks an approach outside the throne footprint',async()=>{const W=await buildHistoricalR18World();const r=walkStraight(W,[9.15,125],[9.15,129],{feet0:9,step:.025});assert.ok(r.reached<r.total-1,JSON.stringify(r));near(r.feet,9);});
