import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture,meshes,meshRow,hash,THREE} from './lib/r66-h/fixture.mjs';
import {gateFixture} from './lib/r66-h/yinghua-gate-fixture.mjs';
import {collisionFixture,captureVisibleSolids,replayBalcony,replayBalconyFlight} from './lib/r66-h/balcony-motion.mjs';
import {CourtKit} from '../src/scene/palace/kit.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
// Exact R65 production-builder snapshots, not current-derived expectations.
const R65={
  "railCount": 110,
  "railHash": "51682852e50be7a7720e2205aaac00e7d0bba1637fb69e0d1e8f46f230d8baaa",
  "colliders": "3e5177750d621f250838a56fbc3a01875d7f750127e5455421566115610e081e",
  "walkables": "fdf06f6972f682f1959b6c150a774fd446b8687acd7ebec51f277d8f9f258fb9",
  "rooms": "153b406d248dcd8e71a9b236a6a88974bb427596dda830acec89677ea6b426ea",
  "gates": [
    {
      "item": {
        "kind": "gate",
        "name": "揽胜门",
        "x": 232,
        "z": 95,
        "rot": "east",
        "style": "wall"
      },
      "width": 6.4,
      "meshes": "f4e160167a2626067fcaaf802408ac972776257dfe96bfdfd588918843a43579",
      "colliders": "e96acb77c50381869774c90766a0d2b0cebb1ed77bf5d4065adcc6ba59b63ba3",
      "walkables": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      "maps": "8b7ace99c80b7579ba1a522fe01239c5e9c3ed59634339c8a66a563046e30613"
    },
    {
      "item": {
        "kind": "gate",
        "name": "建福门",
        "x": 183.7,
        "z": 409.4
      },
      "width": 6.4,
      "meshes": "60a5e997c6a244a1c2724ab7d8dc2142a57c70f4aec477a430a0dcf4d48f772e",
      "colliders": "12083e93157fb6027b1234b0bc7a91708f8c39880251091dded8314086cfabb6",
      "walkables": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      "maps": "339f72546d3caf79344e35d3bc71a205291018cb330e2b3c01cd4d0a06b8be85"
    },
    {
      "item": {
        "kind": "gate",
        "name": "寿安门",
        "x": 277,
        "z": 362
      },
      "width": 6.4,
      "meshes": "ff9b24ab662e3d7a3dd17c0239df6b1db5d25f43eae1693e557061f12c256feb",
      "colliders": "2a0c6f3aa0e775829317eecb50cef61cc783b77eb968a85fe83a0f7a65c7a3f7",
      "walkables": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      "maps": "f602e6a1d6ae91e2348ea6eae7ea42eee2738e21af2f77930e374d98f9e79e2c"
    }
  ]
};
const brief=r=>JSON.stringify({fps:r.fps,sprint:r.sprint,diagonal:r.diagonal,end:r.end,first:r.contacts[0],swept:r.sweptContacts[0]});
function yanchun(){return collisionFixture(fixture('延春阁'));}
test('R66 rollback retains all 110 R65 rail meshes, physics and real y=7 floor; no invented upper access',()=>{
 const w=yanchun();try{
  const rail=meshes(w.f).filter(m=>m.userData.role?.startsWith('yanchun-upper-balcony-rail'));
  assert.equal(rail.length,R65.railCount);assert.equal(hash(rail.map(meshRow)),R65.railHash);
  assert.equal(meshes(w.f).filter(m=>m.userData.role?.startsWith('r66-yanchun-south-')).length,0);
  // R66 independently withholds the eight unverified ground-furniture proxies.
  // All 273 preceding R65 architectural proxies remain byte-identical/in-order.
  assert.equal(w.kit.colliders.length,273);assert.equal(hash(w.kit.colliders),'309d82f61720f6919878fca3f77167a7345b90b0db2c599af98b95cc4c441a55');
  assert.equal(hash(w.kit.walkables),R65.walkables);assert.equal(hash(w.kit.rooms.map(r=>r.navigation)),'0cb8d33d0ac10de248f0852a78d984417c0e0c226edbc75e20af4d9930e4e5f9');
  assert.equal(w.g.upperAccess,'NO_VERIFIED_STAIR_NO_UPPER_ROOM_OR_AUTOMATIC_DESTINATION');assert.equal(w.kit.rooms.length,1);
  const floor=meshes(w.f).find(m=>m.userData.role==='yanchun-third-floor-and-balcony'),bounds=new THREE.Box3().setFromObject(floor);
  assert.ok(Math.abs(bounds.max.y-7)<1e-7);assert.equal(w.cm.getGroundHeight(216,478.03,7),7);
  assert.equal(w.cm.getGroundHeight(216,478.03,0),.75,'ground query does not rescue through an inaccessible upper floor');
  for(const file of ['src/controls/FirstPerson.js','src/utils/Collision.js'])assert.equal(hash(readFileSync(new URL('../'+file,import.meta.url))),{
    'src/controls/FirstPerson.js':'00567838c2c34ff829684c3f9d6d6f2117f6df29a3f9f24e2d00cd28ed1c8267',
    'src/utils/Collision.js':'76423913a37cbd7140d00743b1e6827d39841c52618c0f19c867eff3ac7e0de1'}[file],'R65 shared physics are retained, not silently changed');
 }finally{w.dispose();}
});
for(const fps of [10,60])for(const sprint of [false,true])for(const diagonal of [-1,0,1])test(`R66 real-floor walk containment ${fps}Hz sprint=${sprint} diagonal=${diagonal}`,t=>{
 const w=yanchun();try{const r=replayBalcony(t,w,{fps,sprint,diagonal});assert.equal(r.startFeet,7);assert.equal(r.initialContacts.actualRoles.length,0);assert.equal(r.contacts.length,0,brief(r));assert.equal(r.sweptContacts.length,0,brief(r));assert.equal(r.minFeet,7);assert.equal(r.maxFeet,7);assert.ok(r.frames.every(f=>f.z-.5>=477.43-1e-6));assert.equal(r.headBobEnabled,true);}finally{w.dispose();}
});
for(const fps of [10,60])test(`R66 intentional low-rail jump after 0.2s ascent is legal, not accidental walking drop ${fps}Hz`,t=>{
 const w=yanchun();try{const r=replayBalcony(t,w,{fps,jump:true,sprint:true,moveAfter:.2});assert.equal(r.initialContacts.actualRoles.length,0);assert.equal(r.contacts.length,0,brief(r));assert.equal(r.sweptContacts.length,0,brief(r));assert.ok(r.maxFeet>8.4);assert.ok(r.frames.some(f=>f.z<476.8&&f.feet>7.98));assert.equal(r.end.feet,0);assert.equal(r.positionWritesAfterSpawn,0);}finally{w.dispose();}
});
for(const fps of [10,60])test(`R66 real jump onto retained rail, stop and step-off follows gravity ${fps}Hz; NOT body-clearance acceptance`,t=>{
 const w=yanchun();try{const r=replayBalcony(t,w,{fps,jump:true,moveAfter:.2,stopAfter:.35,resumeAfter:1.4,seconds:3});
  assert.equal(r.startFeet,7);assert.ok(r.frames.some(f=>!f.airborne&&Math.abs(f.feet-7.98)<1e-8&&f.time<1.4));
  assert.ok(r.frames.some(f=>f.time>1.4&&f.airborne&&f.velocityY<0));assert.equal(r.end.feet,0);assert.equal(r.positionWritesAfterSpawn,0);
  t.diagnostic(`KNOWN R65 ENGINEERING RESIDUAL: full-body contacts=${r.contacts.length}; first=${JSON.stringify(r.contacts[0])}. This gravity/state check is not a no-penetration claim. Strict red replay is archived separately.`);
 }finally{w.dispose();}
});
for(const fps of [10,60])test(`R66 actual flight descent and FlightTour dismount reject balcony, accept legal default ground ${fps}Hz`,t=>{
 const w=yanchun();try{const r=replayBalconyFlight(w,{fps,t});assert.equal(r.radius,5.7);assert.equal(r.boarded,true);assert.equal(r.balconySafeGround,false);assert.equal(r.landAtBalcony,false);assert.equal(r.blocked,true);assert.ok(r.minimumY>7);assert.equal(r.exitAtBalcony,false);assert.deepEqual(r.balconyDismount.beforeEye,r.balconyDismount.afterEye);assert.deepEqual(r.balconyDismount.loaded,[]);assert.equal(r.returnAccepted,true);assert.equal(r.exitAtHome,true);assert.equal(r.homeDismount.feet,0);assert.equal(r.homeDismount.parkedColliderCount,2);assert.equal(r.homeDismount.contacts.actualRoles.length,0);assert.equal(r.homeDismount.contacts.productionProxy,false);assert.equal(r.homeDismount.headBobEnabled,true);assert.ok(r.maxStep<=24/fps+1e-7);assert.equal(r.positionWrites,0);assert.equal(r.scope,'ONE_HALL_LOCAL_ENVELOPE_NOT_WHOLE_WORLD_ROUTE');}finally{w.dispose();}
});
for(const fps of [10,60])for(const sprint of [false,true])for(const reverse of [false,true])test(`R66 Yinghua closed door blocks both approaches ${fps}Hz sprint=${sprint} northbound=${reverse}`,t=>{
 const w=gateFixture({open:false});try{
  const doors=meshes(w.f).filter(m=>m.name==='r66-yinghua-arched-door-leaf');assert.equal(doors.length,2);assert.ok(doors.every(m=>m.userData.pose==='CLOSED'));
  const groups=captureVisibleSolids(w.kit.root).filter(g=>/arched-(masonry|door-leaf)/.test(g.role));
  for(const dx of [-.65,0,.65]){const r=replayBalcony(t,w,{fps,x:277.2+dx,z:reverse?451:458,startFeet:0,sprint,seconds:2,groups,reverseAfter:reverse?0:null});assert.equal(r.contacts.length,0,brief(r));assert.equal(r.sweptContacts.length,0,brief(r));assert.ok(reverse?r.end.z+.5<=453.39+1e-7:r.end.z-.5>=453.49-1e-7,brief(r));}
 }finally{w.dispose();}
});
for(const baseline of R65.gates)test(`R66 Yinghua dispatch preserves R65 actual ZoneBase neighbor gate ${baseline.item.name}`,()=>{
 const data=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))),item=data.items.find(i=>i.name===baseline.item.name&&i.kind==='gate');assert.deepEqual(item,baseline.item);
 const kit=new CourtKit(library(),'outer-west'),zone=Object.create(ZoneBase.prototype);Object.assign(zone,{kit,zoneJson:data});try{
  assert.equal(zone.buildGate(item),baseline.width);kit.root.updateMatrixWorld(true);
  for(const [key,value] of Object.entries({meshes:hash(meshes(kit.root).map(meshRow)),colliders:hash(kit.colliders),walkables:hash(kit.walkables),maps:hash(kit.mapItems)}))assert.equal(value,baseline[key],key);
 }finally{kit.dispose(kit.root);}
});
