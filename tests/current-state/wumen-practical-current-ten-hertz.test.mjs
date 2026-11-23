import {after, before, test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {WUMEN_PRACTICAL_FIT as FIT} from '../../src/scene/palace/special/WumenPracticalFit.js';
import {PLAYER} from '../../src/config/constants.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';

// Supplemental current component coverage, not a replacement for the R58
// historical route oracle or a full-city, browser or GPU acceptance claim.
const peakMB = () => Math.round(process.resourceUsage().maxRSS / 1024);
const Z = -419.6;
const wallZ = -420.7, expectedWallZ0 = -425, expectedWallZ1 = -416.4;
const center = (lo, hi) => (lo+hi)/2;
const same = (a, b) => Math.abs(a-b) < 1e-5;
const down = (group, x, z) => new THREE.Raycaster(new THREE.Vector3(x, 27, z), new THREE.Vector3(0,-1,0)).intersectObject(group, true);
const point = (x,y,z) => new THREE.Vector3(x,y,z);
const scope = 'TWO_PRODUCTION_OWNER_STATIC_COMPONENTS_NOT_FULL_CITY_OR_GPU';
let doc, library, scene, builder, enclosure, gate, cm, gateBoxes, wallBoxes, ownedSupports;

before(() => {
  doc=installCpuDocument(createCanvas);
  library=realTextureLibrary(); scene=new THREE.Scene();
  builder=new PalaceBuilder(scene,library); enclosure=new Enclosure(scene,library);
  const layout=PALACE_LAYOUT.find(d=>d.name==='午门');
  assert.ok(layout);
  assert.deepEqual([layout.position.x,layout.position.y,layout.position.z],[0,0,Z]);
  assert.deepEqual(FIT.worldAnchor,[0,0,Z]);
  builder.buildGate(layout); enclosure.build();
  gate=scene.children.find(o=>o.name==='午门');
  assert.ok(gate?.userData.architecture?.some(a=>a.id==='FC-AD4377DF51'&&a.status==='R157_PRACTICAL_ENGINEERING_ASSEMBLY'));
  assert.equal(enclosure.group.parent,scene);
  assert.equal(gate.parent,scene);
  scene.updateMatrixWorld(true);
  gateBoxes=builder.getColliders(); wallBoxes=enclosure.getColliders(); ownedSupports=builder.getWalkables();
  assert.ok(gateBoxes.length>100&&wallBoxes.length>5);
  cm=new CollisionManager();
  // These are references to actual producer arrays; only normal CM registration does its usual copies.
  cm.addColliders(gateBoxes,'palace:Wumen'); cm.addWalkables(ownedSupports,'palace:Wumen');
  cm.addColliders(wallBoxes,'enclosure:city');
  for(const [tag,sources] of [['palace:Wumen',gateBoxes],['enclosure:city',wallBoxes]]) {
    const announced=cm.colliders.filter(c=>c.tag===tag);
    assert.equal(announced.length,sources.length);
    assert.ok(announced.every((entry,i)=>entry.mesh===sources[i]));
  }
  assert.equal(cm.walkables.length,ownedSupports.length);
  const expected=FIT.platform.recesses.map(r=>r.id).sort();
  assert.deepEqual(ownedSupports.filter(w=>w.wumenPracticalDescentId).map(w=>w.wumenPracticalDescentId).sort(),expected);
  assert.deepEqual(cm.walkables.filter(w=>w.wumenPracticalDescentId).map(w=>w.wumenPracticalDescentId).sort(),expected);
  console.log(JSON.stringify({scope, owners: [gate.name,enclosure.group.name], counts:[gateBoxes.length,wallBoxes.length,ownedSupports.length], peakMB:peakMB()}));
});
after(() => { try {builder?.dispose();enclosure?.dispose();library?.dispose();} finally {doc?.restore();} });

// Original R157 route waypoints (not a route newly nudged to get a pass).
function route(side) {
  const parts=FIT.platform.recesses.filter(r=>r.id.startsWith(side+'/'));
  assert.equal(parts.length,6);
  const points=parts.map(r=>[r.axis==='x'?center(r.a0,r.a1):center(r.minX,r.maxX),
    r.axis==='z'?center(r.a0,r.a1):center(r.minZ,r.maxZ)]);
  points.unshift([center(parts[0].minX,parts[0].maxX),parts[0].maxZ+2]);
  points.push([(side==='east'?-1:1)*60.61837748344371,points.at(-1)[1]]);
  return points.map(([x,z])=>[x,z+Z]);
}

test('10 Hz production owners match Wumen recess and adjacent 10 m south-wall masonry, both sides', () => {
  const joins=[];
  for(const r of FIT.platform.recesses) {
    const lo=Math.max(r.minZ+Z,expectedWallZ0),hi=Math.min(r.maxZ+Z,expectedWallZ1);
    if(lo>=hi)continue;
    const x=center(r.minX,r.maxX),z=center(lo,hi);
    assert.equal(down(enclosure.group,x,z).length,0,'city masonry must not bridge route recess '+r.id);
    assert.ok(!wallBoxes.some(b=>b.containsPoint(point(x,1,z))),'stale city proxy '+r.id);
    assert.ok(gateBoxes.some(b=>b.containsPoint(point(x,1,z))),'gate owner lacks underlying masonry '+r.id);
    assert.ok(cm.checkCollision(point(x,1.7,z),.3),'fully registered closed body missing '+r.id);
    const actualGateHit=down(gate,x,z)[0];
    assert.ok(actualGateHit&&actualGateHit.point.y>1,'visible gate masonry missing '+r.id);
    joins.push({id:r.id,x,z,gateFirstY:actualGateHit.point.y});
  }
  assert.ok(joins.some(r=>r.id.startsWith('east/'))&&joins.some(r=>r.id.startsWith('west/')));
  const solids=[];
  for(const sign of [-1,1]) {
    const x=sign*95,far=sign*110;
    const nearOwners=wallBoxes.filter(b=>b.containsPoint(point(x,8,wallZ)));
    assert.equal(nearOwners.length,1);
    assert.ok(same(nearOwners[0].max.y,10));
    assert.ok(!gateBoxes.some(b=>b.containsPoint(point(x,8,wallZ))),'probe must discriminate city owner');
    assert.ok(same(down(enclosure.group,x,wallZ)[0]?.point.y,10),'real merged near-wall cap/body height');
    assert.equal(cm.checkCollision(point(x,8,wallZ),.3),true);
    const farOwners=wallBoxes.filter(b=>b.containsPoint(point(far,1,wallZ)));
    assert.equal(farOwners.length,1);
    assert.ok(same(farOwners[0].max.y,3),'unrelated distant wall policy unchanged');
    solids.push({x,nearOwnerTop:nearOwners[0].max.y,far,farOwnerTop:farOwners[0].max.y});
  }
  console.log(JSON.stringify({scope, joins, solids, peakMB:peakMB()}));
});

for(const side of ['east','west']) for(const reverse of [false,true]) for(const sprint of [false,true]) {
  test(`Wumen ${side} 10 Hz ${sprint?'natural sprint with existing corner brake':'normal walk'} ${reverse?'actual descent':'actual ascent'}`,t=>{
    const points=route(side);if(reverse)points.reverse();
    const [x,z]=points[0], startFeet=reverse?12.3:0, endFeet=reverse?0:12.3;
    assert.ok(same(cm.getGroundHeight(x,z,startFeet,.6),startFeet),'origin lacks actual registered height');
    assert.equal(cm.checkCollision(point(x,startFeet+PLAYER.HEIGHT,z),PLAYER.RADIUS??.5),false,'start is obstructed');
    if(reverse)assert.ok(ownedSupports.some(w=>w.type==='box'&&w.box.containsPoint(point(x,startFeet,z))), 'descending start requires a real top-deck support');
    const r=replayKunning(t,{THREE,cm},points,{fps:10,sprint,startFeet,recordFrames:true});
    assert.ok(r.frames.every(f=>[f.feet,f.ground,f.x,f.z].every(Number.isFinite)));
    const row={scope,side,reverse,sprint,arrived:r.arrived,stuckAt:r.stuckAt??null,
      maxLag:Math.max(0,...r.frames.map(f=>f.ground-f.feet)),maxFlight:Math.max(0,...r.frames.map(f=>f.feet-f.ground)),
      frames:r.frames.length, minFeet:r.minFeet,maxFeet:r.maxFeet,start:r.startFeet,end:r.end, peakMB:peakMB()};
    console.log(JSON.stringify(row));
    assert.equal(r.arrived,true,JSON.stringify(row));
    assert.equal(r.driver.crossings.length,points.length-1);
    assert.ok(Math.abs(r.end[2]-endFeet)<.01,JSON.stringify(row));
    assert.ok(r.minFeet>=-.001,JSON.stringify(row));
    assert.ok(row.maxLag<=.3&&(!reverse||row.maxFlight<=.3),JSON.stringify(row));
    assert.ok(r.frames.some(f=>f.ground>3.3&&f.ground<8),'no real mid-flight support was traversed');
  });
}
