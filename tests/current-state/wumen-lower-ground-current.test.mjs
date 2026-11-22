import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {PLAYER} from '../../src/config/constants.js';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {Environment} from '../../src/scene/Environment.js';
import {WUMEN_PRACTICAL_FIT as FIT} from '../../src/scene/palace/special/WumenPracticalFit.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {replayCuiyun} from '../r175-cuiyun-hall/replay.mjs';

// These are current model routes, not historical door inventory, visitor
// access policy, jumping, GPU, or full-city gameplay acceptance.
const SCOPE='CURRENT_WUMEN_LOWER_PRODUCTION_GATE_ENCLOSURE_GROUND_FIXED_RADIUS_CPU';
const Z=-419.6,R=.5,FPS=10,EPS=1e-7;
const xyz=(x,y,z)=>new T.Vector3(x,y,z);
const toWorld=([x,z])=>[x,z+Z];
const loc=([x,z])=>[x,z-Z];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const same=(a,b)=>Math.abs(a-b)<EPS;
const portals=[
  {id:'east-wang',kind:'central',x:-14.5,width:4.7,crown:5.8},
  {id:'emperor',kind:'central',x:0,width:5.4,crown:6.3},
  {id:'west-wang',kind:'central',x:14.5,width:4.7,crown:5.8},
  {id:'east-yemen',kind:'lateral',x:-48,sign:-1,width:3.8,crown:5.4},
  {id:'west-yemen',kind:'lateral',x:48,sign:1,width:3.8,crown:5.4},
];
const openRoute=p=>p.kind==='central'?[[p.x,-15.3],[p.x,16.5]]:[[p.sign*38.6,-16.5],[p.x,-16.5],[p.x,20.6]];
const pointBody=([x,z])=>new T.Box3(xyz(x-R,1e-8,z-R),xyz(x+R,PLAYER.HEIGHT,z+R));
const boxClose=(a,b)=>a.min.distanceTo(b.min)<EPS&&a.max.distanceTo(b.max)<EPS;
const report=(kind,details)=>console.log(JSON.stringify({kind,scope:SCOPE,...details}));

let doc,open;
before(()=>{
  doc=installCpuDocument(createCanvas);
  open=makeWorld('default');
});
after(()=>{
  try{open?.dispose();}
  finally{doc?.restore();}
});

function positions(mesh,anchor) {
  mesh.updateWorldMatrix(true,false);
  const {position}=mesh.geometry.attributes,ix=mesh.geometry.index,points=[];
  for(let i=0;i<(ix?.count??position.count);i++){
    points.push(new T.Vector3().fromBufferAttribute(position,ix?ix.getX(i):i).applyMatrix4(mesh.matrixWorld).add(anchor));
  }
  return points;
}
function observeRaw(g,b,expectedOpen) {
  assert.ok(g.userData.r157WumenPractical?.wholeObjectAccepted===false,'actual practical replacement ran');
  const platforms=g.children.filter(m=>m.name==='wumen-joint-visible-platform');
  assert.equal(platforms.length,1);
  const frames=platforms[0].children.filter(m=>m.name.startsWith('wumen-lower-door/'));
  assert.deepEqual(frames.map(f=>f.name.slice('wumen-lower-door/'.length)),portals.map(p=>p.id));
  const anchor=xyz(b.ox,0,b.oz),out=[];
  for(const [i,p] of portals.entries()){
    const frame=frames[i];
    assert.equal(frame.userData.structure?.id,'axis/wumen-lower/'+p.id);
    assert.equal(frame.userData.structure.kind,p.kind);
    assert.equal(frame.userData.structure.doorOpen,expectedOpen);
    assert.deepEqual(frame.position.toArray(),p.kind==='central'?[p.x,0,-12.3]:[p.sign*40.6,0,-16.5]);
    assert.ok(same(frame.rotation.y,p.kind==='central'?0:p.sign*Math.PI/2));
    assert.equal(frame.children.length,2);
    for(const [j,hinge] of frame.children.entries()){
      const sign=j===0?-1:1;
      assert.deepEqual(hinge.position.toArray(),[sign*(p.width/2-.12),0,0]);
      assert.ok(same(hinge.rotation.y,expectedOpen?sign*Math.PI/2:0));
      const solids=hinge.children.filter(m=>m.isMesh&&m.userData.wumenLowerPart==='door-solid');
      assert.equal(solids.length,1);
      const m=solids[0],geo=m.geometry.parameters;
      assert.ok(same(geo.width,(p.width-.24)/2)&&same(geo.height,p.crown-.2)&&same(geo.depth,.22));
      const verts=positions(m,anchor);
      assert.equal(verts.length,36);
      // Do not use predecessor axis/wumen-lower/.../leaf IDs. Finished
      // R157 re-keys the 10 cloned leaf proxies alongside north arches.
      out.push({id:p.id,sign,material:m.material,verts,bounds:new T.Box3().setFromPoints(verts)});
    }
  }
  assert.equal(out.length,10);
  return out;
}
function matchPhysics(raw,gateBoxes,cm) {
  const claimed=new Set();
  const logged=raw.map(leaf=>{
    const owners=gateBoxes.filter(c=>{
      const q=c.triangleSupport;
      if(!q?.id.startsWith('wumen-joint/platform-triangle/')||q.template.triangles.length!==12||!boxClose(c,leaf.bounds))return false;
      return q.template.triangles.every(({triangle},i)=>['a','b','c'].every((part,k)=>
        triangle[part].clone().add(q.offset).distanceTo(leaf.verts[3*i+k])<EPS));
    });
    assert.equal(owners.length,1,leaf.id+'/'+leaf.sign+' actual transformed triangles need one owner');
    const box=owners[0],q=box.triangleSupport;
    assert.ok(!claimed.has(box));claimed.add(box);
    assert.deepEqual(q.offset.toArray(),[0,0,Z]);
    const entries=cm.colliders.filter(c=>c.tag==='palace:Wumen'&&c.mesh===box);
    assert.equal(entries.length,1);
    assert.ok(entries[0].triangleSupport&&boxClose(entries[0].box,leaf.bounds));
    return {...leaf,cols:entries[0]};
  });
  assert.equal(claimed.size,10);
  return logged;
}
function makeWorld(mode) {
  const scene=new T.Scene(),lib=realTextureLibrary(),cm=new CollisionManager();
  const builder=new PalaceBuilder(scene,lib),wall=new Enclosure(scene,lib),env=new Environment(scene,null,lib);
  const dispose=()=>{
    try{cm.clear();builder.dispose();wall.dispose();env.dispose();}
    finally{lib.dispose();}
  };
  try{
    env.setupGround();
    const ground=scene.children.find(x=>x.isMesh&&x.userData.environmentGroundSource===true);
    assert.ok(ground);
    const layout=PALACE_LAYOUT.find(i=>i.name==='午门');
    assert.ok(layout);
    assert.deepEqual(layout.position,{x:0,y:0,z:Z});
    assert.equal(layout.lowerDoorsOpen,undefined,'default available state must be exercised unchanged');
    assert.deepEqual(FIT.worldAnchor,[0,0,Z]);
    assert.deepEqual([FIT.platform.envelope.mainSouth,FIT.platform.envelope.north],[-13.3,14.5]);
    const nativeFinish=builder.finish;
    let raw,finishCalls=0;
    builder.finish=function(g){
      finishCalls++;
      raw=observeRaw(g,this,mode==='default');
      return nativeFinish.call(this,g);
    };
    try{builder.buildGate(mode==='default'?layout:{...layout,lowerDoorsOpen:false});}
    finally{delete builder.finish;}
    assert.equal(finishCalls,1);
    assert.equal(builder.finish,nativeFinish);
    const gate=[...builder.ownedObjects].find(m=>m.name==='午门');
    assert.ok(gate?.userData.architecture?.some(m=>m.id==='FC-AD4377DF51'&&m.status==='R157_PRACTICAL_ENGINEERING_ASSEMBLY'));
    assert.equal(gate.parent,scene);
    assert.deepEqual(gate.position.toArray(),[0,0,Z]);
    wall.build();
    assert.equal(wall.group.parent,scene);
    scene.updateMatrixWorld(true);
    const gateBoxes=builder.getColliders(),wallBoxes=wall.getColliders();
    const supports=builder.getWalkables();
    cm.addColliders(gateBoxes,'palace:Wumen');cm.addWalkables(supports,'palace:Wumen');
    cm.addColliders(wallBoxes,'enclosure:city');
    const originals=[...gateBoxes,...wallBoxes];
    assert.equal(cm.colliders.length,originals.length);
    assert.ok(cm.colliders.every((c,i)=>c.mesh===originals[i]));
    assert.equal(cm.walkables.length,supports.length);
    assert.equal(cm.dynamicBodies.size,0);
    const leaves=matchPhysics(raw,gateBoxes,cm);
    report('registered-real-owners',{mode,gateContacts:gateBoxes.length,wallContacts:wallBoxes.length,leaves:leaves.map(l=>[l.id,l.sign,l.cols.triangleSupport.id])});
    return {THREE:T,cm,gate,ground,leaves,dispose};
  }catch(error){dispose();throw error;}
}
function groundAt(w,[x,z]) {
  const eye=xyz(x,PLAYER.HEIGHT,z);
  assert.equal(w.cm.getGroundHeight(x,z,0,PLAYER.STEP_UP,R),0);
  assert.equal(w.cm.checkCollision(eye,R),false);
  const ground=new T.Raycaster(xyz(x,.03,z),xyz(0,-1,0),0,.05).intersectObject(w.ground,false)[0];
  assert.ok(ground&&same(ground.point.y,0),'actual environment ground must be visible below the point');
}
function replay(t,w,route) {
  groundAt(w,route[0]);groundAt(w,route.at(-1));
  const r=replayCuiyun(t,w,route,{startFeet:0,recordFrames:true,fps:FPS,sprint:false,backward:false});
  assert.equal(r.startFeet,0);
  assert.ok(r.allFrames.length>0);
  for(const f of r.allFrames){
    assert.ok(f.feet===0&&f.ground===0&&!f.airborne,'this is a real at-grade route, not rescue/ramp/jump');
    assert.equal(w.cm.checkCollision(xyz(f.x,PLAYER.HEIGHT,f.z),R),false,'the accepted native body must not penetrate any real solid');
  }
  return r;
}
function arrived(r,route) {
  assert.equal(r.arrived,true,JSON.stringify({route:route.map(loc),end:r.end,stuckAt:r.stuckAt}));
  assert.equal(r.driver.crossings.length,route.length-1);
  const stop=r.allFrames.at(-1);
  assert.equal(stop.speed,0);
  assert.ok(distance([stop.x,stop.z],route.at(-1))<=1,'real controller must settle at the intended portal exit');
}
test('Current Wumen lower five open portals support fixed-width 10 Hz walking in both directions',t=>{
  const attempts=[];
  for(const p of portals)for(const reverse of [false,true]){
    const route=openRoute(p).map(toWorld);
    if(reverse)route.reverse();
    const r=replay(t,open,route);
    arrived(r,route);
    attempts.push({portal:p.id,reverse,crossings:r.driver.crossings.length,end:loc([r.end[0],r.end[1]])});
  }
  report('current-default-open-traversal',{attempts});
});

function closedTrials(p,shut) {
  const axis=p.kind==='central'?'z':'x',cross=axis==='x'?'z':'x';
  // Select an off-seam center inside one genuine leaf, while keeping the
  // full native body within its portal aperture. A/B holds this path fixed.
  const target=shut.leaves.filter(l=>l.id===p.id&&l.sign===1);
  assert.equal(target.length,1);
  const leaf=target[0],mid=leaf.bounds.getCenter(new T.Vector3());
  const point=progress=>{
    const q=mid.clone();q[axis]=progress;return [q.x,q.z];
  };
  const entries=[];
  for(const approachSign of [-1,1]){
    const direction=-approachSign;
    const rawFace=leaf.bounds[approachSign<0?'min':'max'][axis];
    const bodyFace=rawFace+approachSign*R;
    const begin=point(mid[axis]+approachSign*2),end=point(mid[axis]-approachSign*2);
    entries.push({axis,cross,leaf,direction,rawFace,bodyFace,begin,end,point});
  }
  return entries;
}
function testStopped(t,p,w,req) {
  const {axis,cross,leaf,direction,rawFace,bodyFace,begin,end,point}=req;
  const rayStart=xyz(begin[0],.9,begin[1]),dir=axis==='x'?xyz(direction,0,0):xyz(0,0,direction);
  const hits=new T.Raycaster(rayStart,dir,0,distance(begin,end)).intersectObject(w.gate,true);
  const hit=hits.find(h=>h.object.material===leaf.material);
  assert.ok(hit&&Math.abs(hit.point[axis]-rawFace)<2e-5&&leaf.bounds.clone().expandByScalar(2e-5).containsPoint(hit.point),
    'post-merge visible solid face must agree with the actual narrowphase leaf');
  assert.ok(hits[0].distance>=hit.distance-.06,'do not credit a closer unrelated obstruction');
  const outside=point(bodyFace-direction*.02),inside=point(bodyFace+direction*.02);
  const eye=([x,z])=>xyz(x,PLAYER.HEIGHT,z);
  assert.equal(triangleBodyIntersects(leaf.cols.triangleSupport,pointBody(outside)),false);
  assert.equal(triangleBodyIntersects(leaf.cols.triangleSupport,pointBody(inside)),true);
  assert.equal(w.cm.checkCollision(eye(outside),R),false);
  assert.equal(w.cm.checkCollision(eye(inside),R),true);
  assert.equal(open.cm.checkCollision(eye(inside),R),false,'same physical footprint is clear in the released default-open state');
  assert.ok(!w.leaves.some(other=>other!==leaf&&triangleBodyIntersects(other.cols.triangleSupport,pointBody(inside))),
    'the selected closed leaf, not the two-leaf seam or a second leaf, owns the witness');
  const r=replay(t,w,[begin,end]),last=r.allFrames.at(-1);
  const at=axis==='x'?last.x:last.z;
  const remaining=direction*(bodyFace-at);
  assert.equal(r.arrived,false);
  assert.equal(r.driver.crossings.length,0);
  assert.ok(direction*(at-(axis==='x'?begin[0]:begin[1]))>.5,'must actually approach; no blocked starting pose');
  assert.ok(remaining>=-EPS&&remaining<=PLAYER.MOVE_SPEED/FPS+.02,'stop within one native walking frame of the matched closed leaf');
  assert.ok(same(last[cross],axis==='x'?begin[1]:begin[0]));
  return {portal:p.id,axis,direction,selected:leaf.cols.triangleSupport.id,remaining,stop:loc([last.x,last.z]),rayHit:hit.point.toArray()};
}
test('Current Wumen alternate closed ground leaves stop both 10 Hz approaches that the open model admits',t=>{
  // This is a deliberate alternate GATE MODEL comparison, not a modification
  // to default gameplay and not a claim about a user-actuated door or real access.
  const shut=makeWorld('closed-comparison'),checks=[];
  try{
    for(const p of portals)for(const req of closedTrials(p,shut)){
      arrived(replay(t,open,[req.begin,req.end]),[req.begin,req.end]);
      checks.push(testStopped(t,p,shut,req));
    }
    report('closed-comparison-confirmed',{checks});
  }finally{shut.dispose();}
});
