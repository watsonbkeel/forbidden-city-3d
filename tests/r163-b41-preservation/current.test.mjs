import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import '../lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {WENYUAN_BRIDGE_X} from '../../src/scene/palace/special/WenyuanBridgeAxis.js';
import {southWaterProfile,canCrossPalaceWater} from '../../src/scene/palace/special/SouthWaterSystem.js';
import {finishWenyuanUpperSeat} from '../../src/scene/palace/special/WenyuanUpperSeat.js';
import {finishWenyuanGroundFans} from '../../src/scene/palace/special/WenyuanGroundFans.js';
import {finishWenyuanSouthVeranda} from '../../src/scene/palace/special/WenyuanSouthVeranda.js';
import {finishWenyuanEntryTread} from '../../src/scene/palace/special/WenyuanEntryTread.js';
import {buildSouthCourtGate} from '../../src/scene/palace/special/SouthCourtGates.js';

const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
// No World, proposed-hook loader, synthetic supports, or changed movement rules.
// The DOM/canvas and clock are controlled fixtures, not browser/GPU evidence.
const evidence={scope:'BOUNDED_PRODUCTION_COMPONENTS_NOT_WHOLE_WORLD_OR_BROWSER',results:{}};
const report=(key,value)=>{
  evidence.results[key]=value;
  if(process.env.B41_EVIDENCE_OUT)fs.writeFileSync(process.env.B41_EVIDENCE_OUT,JSON.stringify(evidence,null,2)+'\n');
};

test('Wenyuan actual doorway, bridge, bank opening and final plaque share one clear axis',()=>{
  const lib=realTextureLibrary(),z=new ZoneBase(lib,zone);
  try {
    const built=z.buildHall(zone.items[8]);
    // Same own-component order as ZoneBase.build, without constructing the zone.
    finishWenyuanUpperSeat(z.kit);
    finishWenyuanGroundFans(z.kit);
    finishWenyuanSouthVeranda(z.kit);
    finishWenyuanEntryTread(z.kit);
    z.kit.root.updateMatrixWorld(true);
    const plaques=z.kit.plaques.filter(p=>p.text==='文渊阁');
    assert.equal(plaques.length,1);
    const p=plaques[0],river=PALACE_LAYOUT.find(p=>p.southWaterProfile);
    const bridge=southWaterProfile(river).bridges.find(b=>b.id==='wenyuan-pond');
    const wall=zone.items.find(i=>i.kind==='courtWalls'&&i.z1===-156);
    const gap=wall.gates.find(g=>g.side==='n'),entry=built.f.userData.structure.entry;
    const checkAxis=()=>{
      const face=p.mesh.getWorldPosition(new THREE.Vector3()),back=p.frame.getWorldPosition(new THREE.Vector3());
      for(const x of [bridge.x,gap.at,entry.x,face.x,back.x])assert.equal(x,WENYUAN_BRIDGE_X);
      assert.ok(Math.abs(face.distanceTo(back)-.06)<1e-9);
      return {bridgeX:bridge.x,wallGapX:gap.at,entry,plaqueFace:face.toArray(),plaqueBack:back.toArray()};
    };
    assert.equal(WENYUAN_BRIDGE_X,-189.875);
    const aligned=checkAxis();
    assert.equal(canCrossPalaceWater(river,{x:WENYUAN_BRIDGE_X,z:-149},.5),true);
    assert.equal(canCrossPalaceWater(river,{x:-186.5,z:-149},.5),false,'retired column axis must not be an invisible bridge');
    const cm=new CollisionManager();cm.addColliders(z.kit.colliders);cm.addWalkables(z.kit.walkables);
    const samples=[-141.4,-140.4,-139.5].map(z=>({z,blocked:cm.checkCollision(new THREE.Vector3(WENYUAN_BRIDGE_X,2.2,z),.5)}));
    for(const p of samples)assert.equal(p.blocked,false,'existing clear bay must remain usable');
    // A genuine pose regression of the rendered registered face must fail.
    const oldX=p.mesh.position.x;
    try {p.mesh.position.x+=3.375;assert.throws(checkAxis,assert.AssertionError);}
    finally {p.mesh.position.x=oldX;z.kit.root.updateMatrixWorld(true);}
    checkAxis();
    report('wenyuan',{...aligned,samples,plaquePoseNegativeDetected:true,fullBridgeWalkNotExecuted:true});
  } finally {z.kit.dispose(z.kit.root);lib.dispose();}
});

function gateFixture(){
  const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-east');
  const {f,g}=buildSouthCourtGate(kit,zone.items[0]);kit.root.updateMatrixWorld(true);
  const cm=new CollisionManager();cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
  return {kit,f,g,cm,dispose(){kit.dispose(kit.root);lib.dispose();}};
}

test('Wenhua central cross-panels stay absent while actual side rails and posts remain',()=>{
  const f=gateFixture();
  try {
    const parts=[];f.f.traverse(m=>{if(m.userData.wenhuaGateApproach)parts.push(m);});
    const roles=r=>parts.filter(m=>m.userData.wenhuaGateApproach.role===r);
    assert.equal(roles('south-terminal-panel').length,0);
    assert.equal(roles('south-plain-post').length,6);
    assert.equal(roles('south-sloping-panel').length,4);
    assert.equal(roles('south-tread').length,40);
    assert.equal(roles('south-side-stone').length,6);
    for(const [z,y]of[[-11.75,.8],[-9.51,1.5]]){
      const ray=new THREE.Raycaster(new THREE.Vector3(f.g.x,y,f.g.z+z-.21),new THREE.Vector3(0,0,1),0,.42);
      assert.equal(ray.intersectObject(f.kit.root,true).length,0,'central transverse stone must not reappear');
    }
    const sideBlocked=()=>{
      for(const x of[-1.4,1.4])assert.equal(f.cm.checkCollision(new THREE.Vector3(f.g.x+x,1.7,f.g.z-10.63),.5),true);
    };
    sideBlocked();
    assert.equal(f.kit.colliders.length,30);assert.equal(f.kit.walkables.length,1);
    assert.equal(f.g.wenhuaGateApproaches.accepted,false);
    // Remove only the actual south visible-surface owner from this test manager.
    // The negative detects hollow side rails; restore it before disposal.
    const at=f.cm.colliders.findIndex(c=>c.xiqingRoofSurface?.id==='wenhua-gate-approach-south');
    assert.ok(at>=0);const [owner]=f.cm.colliders.splice(at,1);
    try {assert.throws(sideBlocked,assert.AssertionError);}
    finally {f.cm.colliders.splice(at,0,owner);}
    sideBlocked();
    report('wenhuaGeometry',{crossPanels:0,posts:6,longitudinalRails:4,colliders:30,walkables:1,missingSideOwnerNegativeDetected:true,wholeObjectAccepted:false});
  } finally {f.dispose();}
});

test('Wenhua component retains native central walk/run roundtrips and rejects a real blocking wall',t=>{
  const f=gateFixture();
  try {
    const points=[[-186.3,-265],[-186.3,-225],[-186.3,-265]],rows=[];
    for(const fps of[10,60])for(const sprint of[false,true]){
      const r=replayKunning(t,{THREE,cm:f.cm},points,{startFeet:0,fps,sprint,recordFrames:true});
      const peak=Math.max(...r.frames.map(v=>Math.abs(v.feet-v.ground)));
      const above03=r.frames.filter(v=>Math.abs(v.feet-v.ground)>.3).length;
      rows.push({fps,sprint,arrived:r.arrived,frames:r.frames.length,peakFeetGround:peak,framesAbove03:above03});
      assert.equal(r.arrived,true,`${fps}Hz sprint=${sprint}`);
      // Preserve the disclosed short run-off; this is not a product tolerance.
      assert.ok(peak<=.444177,'no larger deviation than the disclosed bounded baseline');
      if(fps===60&&sprint)assert.ok(above03<=9,'no longer transient than the disclosed nine frames');
      else assert.equal(above03,0);
    }
    f.cm.addCollider(new THREE.Box3(new THREE.Vector3(-187.3,0,-250.1),new THREE.Vector3(-185.3,3,-249.9)),'b41-negative-wall');
    const negative=replayKunning(t,{THREE,cm:f.cm},points,{startFeet:0,fps:10,sprint:true});
    assert.equal(negative.arrived,false,'native controller must not ignore a new real obstruction');
    f.cm.removeByTag('b41-negative-wall');
    report('wenhuaRoutes',{rows,blockingWallNegativeDetected:true,fullZoneOrWorldNotExecuted:true});
  } finally {f.dispose();}
});
