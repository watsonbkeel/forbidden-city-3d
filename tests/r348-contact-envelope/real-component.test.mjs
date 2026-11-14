import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument,createWorldCleanup} from '../lib/finished-world-lifecycle.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {registerChuxiuMainFinishedAccess} from '../../src/controls/RetainedCourtyardAccess.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {PLAYER} from '../../src/config/constants.js';
function fixture(){
 const platform=installCpuDocument(createCanvas),library=realTextureLibrary(),cm=new CollisionManager(),zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url))),builder=new ZoneBase(library,zone);
 const cleanup=createWorldCleanup({cm,owners:[{label:'actualZoneBase',value:builder}],library,restore:()=>platform.restore()});
 try{builder.buildHall(zone.items.find(i=>i.name==='储秀宫'));builder.kit.root.updateWorldMatrix(true,true);registerChuxiuMainFinishedAccess(builder.kit,zone);cm.addColliders(builder.kit.colliders,'west-six');cm.addWalkables(builder.kit.walkables,'west-six');return{cm,builder,platform,cleanup};}catch(e){cleanup(e)}
}
test('actual unchanged Chuxiu high hanging geometry allows ordinary lower entry and preserves the old central trajectory',()=>{
 const h=fixture();try{
  const b=h.builder.kit.colliders.find(b=>b.triangleSupport?.id==='chuxiu-front-hanging:main:2:-1');assert.ok(b);assert.deepEqual([...b.min.toArray(),...b.max.toArray()],[96.2300033569336,5.943600177764893,422.29998779296875,97.51000213623047,6.513599872589111,422.4200134277344]);
  assert.equal(h.cm.getGroundHeight(95.8,421.90000000000003,.6100000143051147,.6,.5),Math.fround(.82));
  const traces=new Map();for(const x of[94.8,95.8])for(const fps of[10,30,60])withTerrainController(h.cm,(c,cam,tick)=>{
   c.setPosition(x,PLAYER.HEIGHT,418);c.feetY=c.groundY=0;c.airborne=false;c.moveForward=true;cam.lookAt(x,PLAYER.HEIGHT,430);cam.updateMatrixWorld(true);assert.equal(h.cm.checkCollision(new T.Vector3(x,PLAYER.HEIGHT,418),.5),false);
   for(let i=0;i<fps*3;i++)tick(fps);
   const actual=[cam.position.z-c.bobOffset.z,c.feetY,c.airborne];assert.ok(actual[0]>424);assert.ok(actual[1]>=.59);assert.equal(actual[2],false);if(x===94.8)traces.set(fps,actual);else assert.deepEqual(actual,traces.get(fps),'lateral route matches retained central ground progression');
  });assert.equal(h.platform.stats.fetches,0);
 }finally{assert.deepEqual(h.cleanup(),['cm','actualZoneBase','library','globals']);}
});
test('actual Chuxiu high silhouettes still block crossing, head impact and falling after low-contact fix',()=>{
 const h=fixture();try{for(const b of h.builder.kit.colliders.filter(b=>b.triangleSupport?.id.startsWith('chuxiu-front-hanging:'))){const cm=new CollisionManager();try{cm.addCollider(b,'high');const p=b.getCenter(new T.Vector3()),size=b.getSize(new T.Vector3()),axis=size.x<size.z?'x':'z',from=p.clone();from.y=b.min.y+1;from[axis]=b.min[axis]-.8;const to=from.clone();to[axis]=b.max[axis]+.8;assert.equal(cm.checkCollision(from,.5),false);assert.equal(cm.checkCollision(to,.5,from),true);assert.ok(cm.getValidPosition(from,to,.5)[axis]<b.min[axis]);assert.ok(cm.resolveTriangleVertical(p.x,p.z,b.max.y+.3,b.min.y-2,.1));assert.equal(cm.resolveTriangleVertical(p.x,p.z,b.min.y-2,b.max.y+.3,.1)?.kind,'head-impact');}finally{cm.clear();}}
 const b=h.builder.kit.colliders.find(b=>b.triangleSupport?.id==='chuxiu-front-hanging:main:1:1');assert.ok(b);const cm=new CollisionManager();try{cm.addCollider(b,'landing');const p=b.getCenter(new T.Vector3());for(const fps of[10,30,60])withTerrainController(cm,(c,cam,tick)=>{c.setPosition(p.x,b.max.y+2.7,p.z);c.feetY=b.max.y+1;c.groundY=0;c.airborne=true;let prior=c.feetY;for(let i=0;i<fps*3;i++){tick(fps);assert.ok(c.feetY<=prior+1e-6);prior=c.feetY;}assert.ok(Math.abs(c.feetY-b.max.y)<1e-5);assert.equal(c.airborne,false);});}finally{cm.clear();}
 }finally{h.cleanup();}
});
