import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {Environment} from '../../src/scene/Environment.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {PLAYER} from '../../src/config/constants.js';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';
import {FlightState,FLIGHT_RULES,LANDING_CHOICES} from '../../src/scene/flight/FlightState.js';
import {HistoricalSkyLamps,SKY_LAMP_SITES,SKY_LAMP_HEIGHT} from '../../src/scene/sky/HistoricalSkyLamps.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';

// Supplemental current CPU checks for actual Qianqing forecourt geometry.
// Not the full-city flight envelope/tour or a replacement for old #45/#46.
const root=new URL('../../',import.meta.url);
const scope='QIANQING_FORECOURT_REAL_FINISHED_OWNERS_NOT_FULL_CITY_HOME_TOUR_OR_GPU';
const choice=LANDING_CHOICES.find(p=>p.id==='qianqing-square');
const radius=FLIGHT_RULES.radius,padHome={x:choice.x,y:0,z:choice.z};
const vec=(x,y,z)=>new T.Vector3(x,y,z);
const rss=()=>Math.round(process.resourceUsage().maxRSS/1024);
const read=rel=>JSON.parse(fs.readFileSync(new URL(rel,root)));
const isNear=(a,b)=>Math.abs(a-b)<1e-7;
const allNamed=['乾清门','乾清宫','交泰殿','坤宁宫'];
let lib,cpu,scene,palace,gardenStatic,zone,zoneData,env,cm,grid,palaceRoots;

before(()=>{
  // The app's landAt choice, not a sample selected post hoc by shrinking clearance.
  assert.deepEqual([choice.x,choice.z],[25,245]);
  assert.deepEqual(SKY_LAMP_SITES.map(p=>[p.x,p.z]),[[-37,284.5],[37,284.5]]);
  const definition=read('data/zones/garden.json');
  const zoneList=fs.readdirSync(new URL('data/zones/',root)).filter(n=>n.endsWith('.json')).sort().map(n=>read('data/zones/'+n));
  for(const p of [choice,...SKY_LAMP_SITES]) {
    // These local registered physical samples are interior to the actual
    // Garden zone, not disputed adjacent-zone or just-loaded footprints.
    const margin=radius+2;
    const intersects=j=>p.x+margin>=j.bounds.x0&&p.x-margin<=j.bounds.x1&&
      p.z+margin>=j.bounds.z0&&p.z-margin<=j.bounds.z1;
    assert.deepEqual(zoneList.filter(intersects).map(j=>j.id),['garden']);
  }
  cpu=installCpuDocument(createCanvas);
  scene=new T.Scene();lib=realTextureLibrary();cm=new CollisionManager();
  env=new Environment(scene,null,lib);env.setupGround();
  palace=new PalaceBuilder(scene,lib);
  const layout=PALACE_LAYOUT.filter(i=>allNamed.includes(i.name));
  assert.deepEqual(layout.map(i=>i.name).sort(),[...allNamed].sort());
  // Do not build only one rear hall; buildPalaces needs all three to produce
  // the real shared terrace and its connected stairs as in the application.
  palace.buildAll(layout);
  gardenStatic=new GardenBuilder(scene,lib).build(PALACE_LAYOUT.find(p=>p.type==='garden'));
  zone=new ZoneBase(lib,definition);zoneData=zone.build();scene.add(zoneData.group);
  scene.updateMatrixWorld(true);
  palaceRoots=[...palace.ownedObjects];
  assert.ok(palaceRoots.some(g=>g.name==='乾清门')&&palaceRoots.some(g=>g.name==='后三宫'));
  assert.ok(palaceRoots.every(g=>g.parent===scene)&&zoneData.group.parent===scene&&gardenStatic.group.parent===scene);
  // Same production CollisionManager registration APIs, no replacement
  // shapes or overrides, tag the actual owners for the evidence transcript.
  const groups=[
    ['garden',zoneData.colliders,zoneData.walkables],
    ['PalaceBuilder',palace.getColliders(),palace.getWalkables()],
    ['GardenBuilder',gardenStatic.getColliders(),gardenStatic.getWalkables()],
  ];
  for(const [tag,boxes,walks] of groups) {
    cm.addColliders(boxes,tag);cm.addWalkables(walks,tag);
    const records=cm.colliders.filter(c=>c.tag===tag);
    assert.ok(records.length>0&&records.every(r=>boxes.includes(r.mesh)),tag+' actual registered box references');
  }
  cm.setRegions(zoneData.regions);
  grid=new FlightEnvelope();
  // Apply the exact production mesh collector to actual normally finished
  // roots, not reconstructed outlines or pedestrian boxes. This is a local
  // envelope; intentionally do not pass a fake all-city ZoneManager.
  for(const group of [...palaceRoots,zoneData.group,gardenStatic.group])grid.addRoot(group);
  assert.ok(grid.meshes>0&&grid.triangles>0&&grid.maxHeight>10);
  assert.equal(grid.extraObstacles.size,0);
  console.log(JSON.stringify({scope,pad:choice,lamps:SKY_LAMP_SITES,
    loadedRoots:[...palaceRoots.map(g=>g.name),zoneData.group.name,gardenStatic.group.name],
    envelope:grid.summary(),colliders:cm.colliders.length,walkables:cm.walkables.length,rss:rss()}));
});
after(()=>{
  try{cm?.clear();zoneData?.group.removeFromParent();zone?.dispose();palace?.dispose();gardenStatic?.dispose();env?.dispose();lib?.dispose();}
  finally{cpu?.restore();}
});

test('Qianqing offered virtual pad and both dismount points stay clear in the production-local forecourt',()=>{
  const sample=grid.sample(choice.x,choice.z,radius);
  assert.deepEqual(sample,{height:0,water:false});
  assert.equal(grid.safeGround(choice.x,choice.z,radius),true);
  for(const sign of [-1,1]) {
    const x=choice.x+sign*2.1,z=choice.z+.4;
    assert.equal(cm.getGroundHeight(x,z,0,PLAYER.STEP_UP,.5),0);
    assert.equal(cm.checkCollision(vec(x,PLAYER.HEIGHT,z),.5),false);
  }
  console.log(JSON.stringify({scope,kind:'offered-pad',pad:choice,sample,radius,rss:rss()}));
});

test('Qianqing current virtual helicopter really rises and lands back on the offered pad at 10Hz',()=>{
  const flight=new FlightState(grid,{home:padHome});
  assert.equal(flight.board(),true);
  flight.update(.1,100,{vertical:1});
  assert.ok(flight.position.y>0);
  assert.equal(flight.exit(100),false,'cannot exit while airborne');
  assert.equal(flight.landAt(choice),true);
  let frames=0,peak=flight.position.y;
  while(flight.mode==='auto'&&frames<500) {
    flight.update(.1,200+frames*100);
    assert.equal(flight.blocked,false,JSON.stringify(flight.position));
    assert.equal(grid.isSafe(flight.position,radius,FLIGHT_RULES.maximumAltitude),true);
    peak=Math.max(peak,flight.position.y);frames++;
  }
  assert.ok(frames>100&&frames<500);
  assert.ok(peak>=FLIGHT_RULES.cruiseAltitude);
  assert.ok(flight.grounded);
  assert.deepEqual(flight.position,padHome);
  flight.update(.1,200+frames*100);
  assert.equal(flight.exit(200+frames*100),true);
  console.log(JSON.stringify({scope,kind:'bounded-auto-vertical-recovery',fps:10,frames,peak,end:flight.position,rss:rss()}));
});

test('Qianqing Gate and main hall real roofs are not landable and the low swept approach stops before solid geometry',()=>{
  const candidates=PALACE_LAYOUT.filter(i=>['乾清门','乾清宫'].includes(i.name));
  const flight=new FlightState(grid,{home:padHome});assert.equal(flight.board(),true);
  const blocked=candidates.map(item=>{
    const {x,z}=item.position;
    const ray=new T.Raycaster(vec(x,65,z),vec(0,-1,0));
    const drawn=ray.intersectObjects(palaceRoots,true)[0];
    assert.ok(drawn&&drawn.point.y>3,item.name+' live finished architecture is required');
    const sample=grid.sample(x,z,radius);
    assert.ok(sample.height>=drawn.point.y-1e-5,item.name+' current overhead clearance must include actual visible height');
    assert.equal(flight.landAt({x,z}),false,item.name);
    return {name:item.name,x,z,renderedHeight:drawn.point.y,height:sample.height,water:sample.water};
  });
  const {x,z}=candidates.find(p=>p.name==='乾清门').position;
  const from={...padHome,y:1},into={x,y:1,z};
  const motion=grid.move(from,into,radius,FLIGHT_RULES.maximumAltitude);
  assert.equal(motion.blocked,true);
  assert.equal(motion.reason,'clearance');
  assert.ok(Math.hypot(motion.position.x-from.x,motion.position.z-from.z)>1,'avoid a vacuous invalid starting point');
  assert.equal(grid.isSafe(motion.position,radius),true,'keep the last accepted physical pose');
  assert.ok(Math.hypot(motion.position.x-x,motion.position.z-z)>1);
  console.log(JSON.stringify({scope,kind:'roof-and-low-approach-negatives',blocked,motion,
    historicalDraftOnly:grid.sample(25,220,radius),rss:rss()}));
});

test('both original optional sky-lamp sites have architectural clearance and their actual enabled solids correctly gate walking and flight',()=>{
  const camera=new T.PerspectiveCamera();
  const localFlight=new FlightState(grid,{home:padHome});
  const lamps=new HistoricalSkyLamps({scene,collisionManager:cm,envelope:grid,
    playerPosition:()=>camera.position,flightState:()=>localFlight});
  const sourceColliders=cm.colliders.slice(),samples=[];
  const tag='historical-sky-lamps';
  try {
    assert.equal(lamps.enabled,false);
    for(const p of SKY_LAMP_SITES) {
      const ground=cm.getGroundHeight(p.x,p.z,0,999);
      const original=grid.sample(p.x,p.z,2.1);
      const feet=vec(p.x,PLAYER.HEIGHT,p.z);
      assert.equal(ground,0);assert.deepEqual(original,{height:0,water:false});
      assert.equal(cm.checkCollision(feet,.5),false);
      camera.position.copy(feet);
      assert.equal(lamps.setEnabled(true).ok,false,'cannot instantiate the real lamp into the player');
      assert.equal(lamps.enabled,false);
      assert.equal(grid.extraObstacles.has(tag),false);
      assert.ok(cm.colliders.length===sourceColliders.length&&cm.colliders.every((r,i)=>r===sourceColliders[i]));
      samples.push({site:p,ground,original});
    }
    // Move the real camera to a validated dismount pose, with the actual
    // FlightState parked at the proven current local ground pad.
    camera.position.set(choice.x+2.1,PLAYER.HEIGHT,choice.z+.4);
    assert.equal(cm.checkCollision(camera.position,.5),false);
    assert.equal(lamps.setEnabled(true).ok,true);
    assert.equal(lamps.group.visible,true);
    assert.equal(cm.colliders.filter(c=>c.tag===tag).length,2);
    assert.equal(grid.extraObstacles.get(tag).length,2);
    lamps.group.updateMatrixWorld(true);
    const rendered=new T.Box3().setFromObject(lamps.group);
    assert.ok(Math.abs(rendered.max.y-SKY_LAMP_HEIGHT)<1e-5);
    for(const [i,p] of SKY_LAMP_SITES.entries()) {
      assert.equal(cm.checkCollision(vec(p.x,PLAYER.HEIGHT,p.z),.5),true);
      assert.equal(grid.safeGround(p.x,p.z,2.1),false);
      const minimumY=grid.minimumY(p.x,p.z,2.1);
      assert.ok(minimumY>SKY_LAMP_HEIGHT);
      assert.equal(grid.isSafe({x:p.x,y:SKY_LAMP_HEIGHT,z:p.z},2.1),false);
      samples[i].enabledMinimumY=minimumY;
    }
    assert.equal(lamps.setEnabled(false).ok,true);
    assert.equal(lamps.group.visible,false);
    assert.equal(grid.extraObstacles.has(tag),false);
    assert.ok(cm.colliders.length===sourceColliders.length&&cm.colliders.every((r,i)=>r===sourceColliders[i]));
    for(const [i,p] of SKY_LAMP_SITES.entries()) {
      assert.deepEqual(grid.sample(p.x,p.z,2.1),samples[i].original);
      assert.equal(cm.checkCollision(vec(p.x,PLAYER.HEIGHT,p.z),.5),false);
    }
    assert.equal(grid.safeGround(choice.x,choice.z,radius),true);
    console.log(JSON.stringify({scope,kind:'optional-actual-lamp-toggle',samples,rss:rss()}));
  } finally {lamps.dispose();}
});
