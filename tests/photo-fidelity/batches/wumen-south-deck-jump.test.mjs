import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {FirstPersonControls} from '../../../src/controls/FirstPerson.js';
import {PLAYER,LAYOUT} from '../../../src/config/constants.js';
function fixture(){const W=captureGate(),cm=new CollisionManager();cm.addColliders(W.builder.colliders);cm.addWalkables(W.builder.walkables,'wumen');return{...W,cm};}
const point=(W,x,z,feet)=>new W.THREE.Vector3(x,feet+PLAYER.HEIGHT,z);
const MAX_RISE=PLAYER.JUMP_VELOCITY**2/(2*PLAYER.GRAVITY)+.08;

test('actual player jump continues horizontally above live south deck at both frame rates',t=>{
 const W=fixture(),rows=[];
 for(const side of[-1,1])for(const fps of[10,60])for(const sprint of[false,true])for(const direction of[-1,1]){
  const oldDoc=globalThis.document,oldWindow=globalThis.window;
  const doc={...oldDoc,addEventListener(){},removeEventListener(){},exitPointerLock(){}};
  globalThis.document=doc;globalThis.window={addEventListener(){},removeEventListener(){}};
  let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new W.THREE.PerspectiveCamera();
  const controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener(){},removeEventListener(){}},W.cm);
  // Sprint covers nearly 12m per airborne second; start with full landing room.
  const start=direction<0?-500.1:-514.6;controls.controls.isLocked=true;controls.setPosition(side*62,14,start);controls.moveForward=true;controls.canSprint=sprint;
  let airFrames=0,pausedAirFrames=0,peak=12.3,firstAirZ=null,landedZ=null,lastZ=start,bodyFrames=0;
  try{
   for(let i=0;i<Math.ceil(fps*1.4);i++){
    now+=1000/fps;if(i===Math.round(fps*.2))controls.jump();
    camera.position.sub(controls.bobOffset);camera.lookAt(side*62,camera.position.y,start+direction*30);camera.position.add(controls.bobOffset);camera.updateMatrixWorld(true);controls.update();
    const x=camera.position.x-controls.bobOffset.x,z=camera.position.z-controls.bobOffset.z;
    peak=Math.max(peak,controls.feetY);
    if(controls.airborne){airFrames++;firstAirZ??=z;if(Math.abs(z-lastZ)<1e-5)pausedAirFrames++;}
    else if(firstAirZ!==null)landedZ??=z;
    if(W.cm.checkCollision(point(W,x,z,Math.max(controls.feetY,controls.groundY)),.5))bodyFrames++;
    lastZ=z;
   }
   const row={side,fps,sprint,direction,airFrames,pausedAirFrames,firstAirZ,landedZ,peak,end:[camera.position.x,camera.position.z,controls.feetY],bodyFrames};rows.push(row);
   assert.ok(airFrames>=fps*.5,JSON.stringify(row));assert.equal(pausedAirFrames,0,JSON.stringify(row));assert.notEqual(landedZ,null,JSON.stringify(row));assert.ok(direction*(landedZ-firstAirZ)>1,JSON.stringify(row));assert.ok(peak<=12.3+MAX_RISE,JSON.stringify(row));assert.equal(bodyFrames,0,JSON.stringify(row));assert.equal(controls.feetY,12.3,JSON.stringify(row));
  }finally{controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
 }
 console.log(JSON.stringify({scope:'ACTUAL_FIRSTPERSON_WUMEN_NOT_FULL_WORLD_OR_GPU',rows}));
});

test('bounded jump volume requires real full-footprint support and current jump-height ceiling',()=>{
 const W=fixture();assert.equal(LAYOUT.BOUNDARY.minZ,-500);
 for(const x of[-62,62,61.68062913907285])assert.equal(W.cm.checkBoundary(point(W,x,-505,14.09),.5),true);
 for(const [x,z,feet]of[[62,-505,0],[62,-505,12],[62,-505,12.3+MAX_RISE+.001],[0,-505,14],[64,-505,14],[62,-516,14],[62,-515.4,14],[401,0,14],[-401,0,14],[0,561,14]])assert.equal(W.cm.checkBoundary(point(W,x,z,feet),.5),false,JSON.stringify({x,z,feet}));
 assert.equal(W.cm.checkCollision(point(W,51,-504,14),.5),true,'existing closed pavilion still solid at jump height');
 const p=point(W,62,-505,14.09),live=W.cm.walkables;
 W.cm.walkables=live.filter(w=>!(w.type==='box'&&w.box.min.x<=62&&w.box.max.x>=62&&w.box.min.z<=-505&&w.box.max.z>=-505));
 assert.equal(W.cm.checkBoundary(p,.5),false,'one removed live cell leaves an unsupported gap, even while neighbours survive');
 W.cm.walkables=live;assert.equal(W.cm.checkBoundary(p,.5),true);
 const copies=W.cm.walkables.map(w=>({...w,...(w.box?{box:w.box.clone()}:{})}));W.cm.removeByTag('wumen');assert.equal(W.cm.checkBoundary(p,.5),false,'unloading mid-jump revokes permission');W.cm.addWalkables(copies);assert.equal(W.cm.checkBoundary(p,.5),false,'copied metadata cannot restore air permission');
});
