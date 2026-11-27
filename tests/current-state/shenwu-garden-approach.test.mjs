import assert from 'node:assert/strict';
import {after,before,test} from 'node:test';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import gardenConfig from '../../data/zones/garden.json' with {type:'json'};
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {Environment} from '../../src/scene/Environment.js';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {PLAYER} from '../../src/config/constants.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';

let world,dom,resources,env,palace,garden,wall,zone;
before(()=>{
  dom=installCpuDocument(createCanvas);resources=createActualLibrary();
  const {library}=resources,scene=new THREE.Scene(),cm=new CollisionManager();
  env=new Environment(scene,null,library);env.setupGround();
  palace=new PalaceBuilder(scene,library);palace.buildAll(PALACE_LAYOUT.filter(item=>item.name==='神武门'));
  wall=new Enclosure(scene,library).build();
  garden=new GardenBuilder(scene,library).build(PALACE_LAYOUT.find(item=>item.type==='garden'));
  zone=new ZoneBase(library,gardenConfig);const content=zone.build();scene.add(content.group);
  cm.addColliders(content.colliders,'garden');cm.addWalkables(content.walkables,'garden');
  for(const owner of [palace,garden,wall]){
    cm.addColliders(owner.getColliders(),'static');cm.addWalkables(owner.getWalkables?.(),'static');
  }
  cm.setRegions(content.regions);scene.updateMatrixWorld(true);
  world={THREE,cm,scene};
});
after(()=>{
  try{world?.cm.clear();zone?.dispose();wall?.dispose();palace?.dispose();garden?.dispose();env?.dispose();resources?.dispose();}
  finally{dom?.restore();}
});

test('North Street has its own ground label only between the two gate complexes',()=>{
  const label=(x,z,y=PLAYER.HEIGHT)=>world.cm.getCurrentLocation({x,y,z});
  for(const x of [-13,0,13]) assert.equal(label(x,524),'北横街');
  assert.equal(label(0,519),'顺贞门');
  assert.equal(label(-7.8,510.6),'御花园北口');
  assert.equal(label(0,530),'神武门');
  assert.equal(label(0,557.25),'神武门外');
});

test('North Street is visually separate, and both side-gate approach turns are paved',()=>{
  const {THREE,scene}=world;
  const street=scene.getObjectByName('north-street-paving');
  assert.ok(street,'missing distinct open east–west paving');
  const approach=scene.getObjectByName('shunzhen-side-approach-paving');
  assert.ok(approach,'missing visible turning paths to the side gates');
  const visible=(mesh,x,z)=>new THREE.Raycaster(
    new THREE.Vector3(x,.09,z),new THREE.Vector3(0,-1,0),0,.09
  ).intersectObject(mesh).length>0;
  for(const x of [-24,-13,0,13,24]) assert.ok(visible(street,x,524),String(x));
  for(const [x,z] of [[0,519.9],[0,529],[-25.3,524],[25.3,524]]) assert.ok(!visible(street,x,z));
  for(const x of [-15.4,-13.3,13.3,17]) assert.ok(visible(approach,x,514.4),String(x));
  assert.ok(visible(approach,-15.4,511.5),'east path follows the clearance beside the actual rockery');
  assert.ok(!visible(approach,-17,511.5),'do not mark a path into the rockery');
  assert.ok(!visible(approach,.5,514.4),'do not pave across the two walls as a shortcut');
});

for(const [side,points] of [
  ['east',[[-15.4,509.3],[-15.4,514.4],[-10,514.4],[-6.6,515.9],[-6.6,524],[-13,524],[-13,557.25]]],
  ['west',[[17,509.3],[17,514.4],[10,514.4],[7.6,515.9],[7.6,524],[13,524],[13,557.25]]],
  ['center',[[.5,510],[.5,524],[.5,557.25]]],
]) test(`First-person round trip joins the garden and gate exterior via the ${side} passage`,t=>{
  const route=[...points,...points.slice(0,-1).reverse()];
  for(const fps of [10,60]){
    const r=replayKunning(t,world,route,{fps,startFeet:0,recordFrames:true});
    assert.equal(r.arrived,true,JSON.stringify({fps,end:r.end,stuckAt:r.stuckAt}));
    assert.ok(r.frames.some(f=>f.z>556.5));
    assert.ok(r.frames.every(f=>f.feet>=0&&f.feet<=.11));
  }
});
