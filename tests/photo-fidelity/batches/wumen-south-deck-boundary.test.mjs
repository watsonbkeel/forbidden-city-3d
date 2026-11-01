import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {replayKunning} from '../../lib/kunning-walk.mjs';
import {Enclosure} from '../../../src/scene/Enclosure.js';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {LAYOUT} from '../../../src/config/constants.js';

function fixture(){
 const c=captureGate(),wall=new Enclosure(new c.THREE.Scene(),c.lib);
 wall.buildOuterWalls(new c.THREE.Group());
 const cm=new CollisionManager();cm.addColliders(c.builder.colliders);cm.addColliders(wall.colliders);cm.addWalkables(c.builder.walkables,'wumen');
 return {...c,cm};
}
const point=(W,x,z,feet=12.3)=>new W.THREE.Vector3(x,feet+1.7,z);
// Removing the production south-deck exception must fail this first assertion.
test('actual registered south deck crosses old boundary including an adjacent-cell seam',()=>{
 const W=fixture();assert.equal(LAYOUT.BOUNDARY.minZ,-500,'no global map enlargement');
 for(const x of[-62,62,61.68062913907285])assert.equal(W.cm.checkBoundary(point(W,x,-505),.5),true,`real finite deck ${x}`);
});
test('native player reaches both southern pavilion fronts along the existing visible perimeter',t=>{
 // Use the native driver directly: replayGateTower clones every walkable into
 // unregistered objects, which correctly revokes capability-based permission.
 const W=fixture(),rows=[];
 for(const side of[-1,1])for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){
  const points=[[side*62,-406.1],[side*62,-514.6],[side*42,-514.6]];let r;
  try{r=replayKunning(t,W,reverse?[...points].reverse():points,{fps,sprint,startFeet:12.3,recordFrames:true});}finally{t.mock.restoreAll();}
  const row={side,fps,sprint,reverse,arrived:r.arrived,end:r.end,minFeet:r.minFeet,bodyFrames:r.frames.filter(f=>W.cm.checkCollision(point(W,f.x,f.z,Math.max(f.feet,f.ground)),.5)).length};rows.push(row);
  assert.equal(r.arrived,true,JSON.stringify(row));assert.ok(r.minFeet>=12.22,JSON.stringify(row));assert.equal(row.bodyFrames,0,JSON.stringify(row));
 }
 console.log(JSON.stringify({scope:'PRODUCTION_WUMEN_PLUS_REAL_ENCLOSURE_NOT_FULL_WORLD_OR_GPU',routes:rows}));
});
test('ground, above-jump air, central hollow and footprint beyond visible edges remain outside boundary',()=>{
 const W=fixture();
 for(const [x,z,feet]of[[62,-505,0],[62,-505,11.8],[62,-505,14.3],[0,-505,12.3],[64,-505,12.3],[62,-515.4,12.3],[62,-516,12.3]])
  assert.equal(W.cm.checkBoundary(point(W,x,z,feet),.5),false,JSON.stringify({x,z,feet}));
 for(const [x,z]of[[401,0],[-401,0],[0,561]])assert.equal(W.cm.checkBoundary(point(W,x,z),.5),false);
 assert.equal(W.cm.checkBoundary(point(W,0,0,0),.5),true,'old valid ground unchanged');
});
test('removing registered support revokes permission; plain or copied same-height boxes cannot recreate it',()=>{
 const W=fixture(),p=point(W,62,-505);
 assert.equal(W.cm.checkBoundary(p,.5),true);
 const copies=W.cm.walkables.map(w=>({...w,...(w.box?{box:w.box.clone()}: {})}));
 W.cm.removeByTag('wumen');assert.equal(W.cm.checkBoundary(p,.5),false);
 W.cm.addWalkables(copies,'pretend');assert.equal(W.cm.checkBoundary(p,.5),false);
 const other=new CollisionManager();other.addWalkables(copies);assert.equal(other.checkBoundary(p,.5),false);
});
test('live support geometry mutation cannot stretch the exception and removal is checked on each call',()=>{
 const W=fixture(),p=point(W,62,-505);assert.equal(W.cm.checkBoundary(p,.5),true);
 for(const w of W.cm.walkables)if(w.type==='box')w.box.max.x+=10;
 assert.equal(W.cm.checkBoundary(p,.5),false,'changed registered geometry is no longer certified');
 W.cm.walkables=[];assert.equal(W.cm.checkBoundary(p,.5),false);
});
test('boundary permission never bypasses existing closed pavilion solids or water checks',()=>{
 const W=fixture();assert.equal(W.cm.checkBoundary(point(W,51,-504),.5),true);
 assert.equal(W.cm.checkCollision(point(W,51,-504),.5),true,'closed pavilion body still blocks');
 assert.equal(W.cm.checkCollision(point(W,62,-505),.5),false,'outer existing deck open');
 const check=W.cm.checkRiverCrossing;W.cm.checkRiverCrossing=()=>false;
 try{assert.equal(W.cm.checkCollision(point(W,62,-505),.5),true,'boundary permission cannot bypass independent water gate');}finally{W.cm.checkRiverCrossing=check;}
});
