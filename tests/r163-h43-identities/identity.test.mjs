import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setupMap} from '../lib/map-fixture.mjs';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {yinghuaGateProfile,buildYinghuaGate} from '../../src/scene/palace/special/YinghuaGate.js';
import {ritualHallGeometry} from '../../src/scene/palace/special/RitualHalls.js';
import {resolveRemainingProfile as residential} from '../../src/scene/palace/special/RemainingResidentialHalls.js';
import {resolveRemainingProfile as outer} from '../../src/scene/palace/special/RemainingOuterHalls.js';
import {buildZhongzhengEastHall} from '../../src/scene/palace/special/ZhongzhengEastHall.js';
import {buildYinghuaWestEarHall} from '../../src/scene/palace/special/YinghuaWestEarHall.js';
const zone=id=>JSON.parse(readFileSync(new URL(`../../data/zones/${id}.json`,import.meta.url)));
const west=zone('outer-west'),six=zone('west-six');
const item=(z,name,kind)=>{const rows=z.items.filter(i=>i.name===name&&i.kind===kind);assert.equal(rows.length,1);return rows[0];};
const gate=item(west,'英华门','gate');
// These regressions exercise production identity guards, not the wording of
// the H43 human ledger. A renamed/misassigned target must not reuse a profile.
test('single-arched Yinghua gate rejects the separate Shanmen identity',()=>{
  assert.equal(yinghuaGateProfile(gate).entityId,'FC-0EACBA1911');
  assert.throws(()=>yinghuaGateProfile({...gate,name:'英华殿山门'}),/exact existing named anchor/);
  assert.throws(()=>yinghuaGateProfile({...gate,gateKind:'three-arched'}),/exact existing named anchor/);
});
test('Yinghua principal hall profile cannot construct either ear hall',()=>{
  const hall=item(west,'英华殿','hall');
  assert.equal(ritualHallGeometry(hall).id,'outer-west/yinghua-ritual-hall');
  for(const name of ['英华殿东耳殿','英华殿西耳殿'])assert.throws(()=>ritualHallGeometry({...hall,name}),/exact identity/);
});
test('Chonghua same-name middle hall does not claim other palace halls or the whole region',()=>{
  const hall=item(six,'重华宫','hall');
  assert.equal(residential('west-six',hall).catalogId,'place-west-six-dc1832baf2');
  for(const name of ['崇敬殿','葆中殿','古香斋','翠云馆','重华宫后殿'])assert.equal(residential('west-six',{...hall,name}),null);
  assert.equal(residential('west-six',item(six,'重华宫','region')),null);
});
test('Yanchun pavilion resolver does not consume the Jianfu garden region',()=>{
  const hall=item(west,'延春阁','hall');
  assert.equal(outer('outer-west',hall).key,'yanchun');
  assert.equal(outer('outer-west',{...hall,name:'建福宫花园'}),null);
  assert.equal(outer('outer-west',item(west,'建福宫花园','region')),null);
});
async function kitFor(t){await setupMap(t);const k=new CourtKit(realTextureLibrary(),'outer-west');t.after(()=>k.dispose(k.root));return k;}
test('real Yinghua gate registers one distinct gate map identity, not Shanmen',async t=>{
  const kit=await kitFor(t);buildYinghuaGate(kit,gate);
  assert.deepEqual(kit.mapItems.map(i=>i.name),['英华门']);
  const body=kit.root.children.find(c=>c.userData.structure?.entityId==='FC-0EACBA1911');
  assert.ok(body);assert.equal(body.userData.structure.portalCount,1);
  assert.equal(body.userData.structure.accepted,false);
});
test('real Zhongzheng east side hall keeps its own source identity and does not claim main or west',async t=>{
  const kit=await kitFor(t),built=buildZhongzhengEastHall(kit,west);
  assert.equal(built.frame.userData.structure,built.meta);
  assert.equal(built.meta.sourceObjectId,'FC-E5EEAB2373');
  assert.notEqual(built.meta.sourceObjectId,'FC-66378DAD81');
  assert.notEqual(built.meta.sourceObjectId,'FC-77D6708679');
  assert.equal(built.meta.wholeObjectAccepted,false);
  assert.deepEqual(kit.mapItems,[],'partial exterior must not create an invented principal-hall destination');
});
test('real Yinghua west ear hall cannot be recorded as the missing east ear hall',async t=>{
  const kit=await kitFor(t),built=buildYinghuaWestEarHall(kit,west);
  assert.equal(built.frame.userData.structure,built.meta);
  assert.equal(built.meta.sourceObjectId,'FC-BA2BB4F70D');
  assert.notEqual(built.meta.sourceObjectId,'FC-634F1BA680');
  assert.equal(built.meta.name,'英华殿西耳殿');
  assert.equal(built.meta.wholeObjectAccepted,false);
  assert.deepEqual(kit.mapItems,[]);
});
