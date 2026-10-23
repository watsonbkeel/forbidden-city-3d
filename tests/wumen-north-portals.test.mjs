import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { captureGate, meshFingerprint } from './lib/gate-tower-fixture.mjs';
import { withWumenNorthPortals, restorePreWumenNorthPortals, wumenNorthOverheadStages, NORTH_OPENINGS, NORTH_HEAD_SLOTS, northHeadTriangles } from './lib/wumen-north-portal-fixture.mjs';
import { CollisionManager } from '../src/utils/Collision.js';
import { replayKunning } from './lib/kunning-walk.mjs';
import { PLAYER } from '../src/config/constants.js';
const before=restorePreWumenNorthPortals(captureGate());
const retainedPhysics=JSON.stringify([before.builder.colliders,before.builder.walkables]);
const retainedOwnedMaterials=[...before.builder.ownedMaterials];
const after=withWumenNorthPortals(before), dm=before.data.dimensions;
function hits(c,x,y,z0=dm.platformNorth+1,z1=dm.platformNorth-1.3){return new THREE.Raycaster(new THREE.Vector3(x,y,z0),new THREE.Vector3(0,0,-1),0,z0-z1).intersectObject(c.group,true);}
for(const o of NORTH_OPENINGS){
  test(`north ${o.x}: actual formerly rectangular shoulder is solid, center remains void`,()=>{
    const x=o.x+o.w*.45,y=o.h-.8;
    assert.equal(hits(before,x,y).length,0,'historical north shoulder is truly void');
    const h=hits(after,x,y);assert.ok(h.length>0,'missing real north arch-head masonry, not a dark decal');
    assert.ok(h.some(v=>Math.abs(v.point.z-dm.platformNorth)<1e-5),'head joins actual north facade');
    assert.equal(hits(after,o.x,o.h-.4).length,0,'retained maximum opening remains void');
    assert.equal(hits(after,x,y,dm.platformNorth-1.3,dm.platformNorth-3).length,0,'unknown deeper vault remains flat, not invented');
  });
  test(`north ${o.x}: standing capsule aperture and head thickness are real geometry`,()=>{
    const triangles=northHeadTriangles(after), body=new THREE.Box3(new THREE.Vector3(o.x-.5,0,dm.platformNorth-1.3),new THREE.Vector3(o.x+.5,PLAYER.HEIGHT,dm.platformNorth+1));
    assert.equal(triangles.some(t=>body.intersectsTriangle(t)),false);
    for(const dx of [-o.w/2+.51,0,o.w/2-.51])assert.equal(hits(after,o.x+dx,PLAYER.HEIGHT).length,0);
    const ray=new THREE.Ray(new THREE.Vector3(o.x+o.w*.45,o.h-.8,dm.platformNorth+1),new THREE.Vector3(0,0,-1));
    const zs=triangles.map(t=>ray.intersectTriangle(t.a,t.b,t.c,false,new THREE.Vector3())?.z).filter(Number.isFinite);
    assert.ok(zs.some(z=>Math.abs(z-dm.platformNorth)<1e-5),'solid front surface');
    assert.ok(zs.some(z=>Math.abs(z-(dm.platformNorth-1.2))<1e-5),'solid rear shoulder surface proves positive thickness');
    const touching=new THREE.Box3(new THREE.Vector3(o.x+o.w*.45-.05,o.h-.85,dm.platformNorth-.05),new THREE.Vector3(o.x+o.w*.45+.05,o.h-.75,dm.platformNorth+.05));
    assert.ok(triangles.some(t=>touching.intersectsTriangle(t)),'body-volume contact hits actual masonry');
  });
}
test('only six north cap/soffit meshes change; ascent, doors, platforms, wings and all four pavilions stay exact; exactly three explicit overhead proxies are added',()=>{
  assert.equal(after.group.children.length,before.group.children.length);
  for(let i=0;i<before.group.children.length;i++)if(!NORTH_HEAD_SLOTS.includes(i))assert.equal(meshFingerprint(after.group.children[i]),meshFingerprint(before.group.children[i]),`unscoped child ${i}`);
  const physics=wumenNorthOverheadStages(after);
  assert.equal(after.builder.colliders.length,before.builder.colliders.length+3);
  assert.equal(JSON.stringify([physics.legacy,after.builder.walkables]),retainedPhysics);
  assert.equal(JSON.stringify([before.builder.colliders,before.builder.walkables]),retainedPhysics);
  assert.deepEqual(after.builder.ownedMaterials,retainedOwnedMaterials);
});
for(const fps of [10,60])for(const reverse of [false,true])for(const backward of [false,true])for(const o of NORTH_OPENINGS)test(`real controller ${o.x}, ${fps}Hz, northward=${!reverse}, backward=${backward}`,t=>{
  const cm=new CollisionManager();cm.addColliders(after.builder.colliders);cm.addWalkables(after.builder.walkables);
  const zs=[dm.platformSouth-2,dm.platformNorth+2];if(reverse)zs.reverse();
  const points=zs.map(z=>[o.x,z+after.data.position.z]);
  const r=replayKunning(t,{THREE,cm},points,{startFeet:0,fps,backward,recordFrames:true});
  assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(r.maxFeet,0);assert.equal(r.minFeet,0);
  assert.ok(r.frames.every(f=>!cm.checkCollision(new THREE.Vector3(f.x,f.feet+PLAYER.HEIGHT,f.z),.5)));
});

const {evaluateWumenNorthPortals}=await import('./lib/r58-wumen-north-portal-qa.mjs');
function existingWorld(c){const scene=new THREE.Scene(),root=c.group.clone(true);root.position.set(c.data.position.x,0,c.data.position.z);scene.add(root);scene.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);return {scene,cm};}
test('same-W helper detects installed geometry and rejects baseline, hidden/transparent heads and phantom aperture proxy',()=>{
  assert.equal(evaluateWumenNorthPortals(existingWorld(before)).pass,false);
  const W=existingWorld(after),geometryBefore=meshFingerprint(W.scene),physicsBefore=JSON.stringify([W.cm.colliders,W.cm.walkables]);
  assert.equal(evaluateWumenNorthPortals(W).pass,true);
  assert.equal(meshFingerprint(W.scene),geometryBefore);assert.equal(JSON.stringify([W.cm.colliders,W.cm.walkables]),physicsBefore);
  const lining=W.scene.children[0].children[9];lining.visible=false;assert.equal(evaluateWumenNorthPortals(W).pass,false);lining.visible=true;
  const head=W.scene.children[0].children[8];head.visible=false;assert.equal(evaluateWumenNorthPortals(W).pass,false);head.visible=true;
  const original=head.material;head.material=original.clone();head.material.visible=false;assert.equal(evaluateWumenNorthPortals(W).pass,false);
  head.material.visible=true;head.material.transparent=true;head.material.opacity=0;assert.equal(evaluateWumenNorthPortals(W).pass,false);head.material=original;
  W.cm.addCollider(new THREE.Box3(new THREE.Vector3(-.4,.4,after.data.position.z),new THREE.Vector3(.4,1.8,after.data.position.z+1)));
  assert.equal(evaluateWumenNorthPortals(W).pass,false);
});
const {wumenNorthPortalProfile,WUMEN_NORTH_PORTAL_FIT}=await import('../src/scene/palace/special/WumenNorthPortal.js');
test('profile pins inherited bounds, discrete photo fit and unknowns without accepting altered building geometry',()=>{
  for(const o of NORTH_OPENINGS){const opts={x:o.x,width:o.w,tunnelHeight:o.h,platformHeight:12,southZ:-13.3,northZ:18.6},p=wumenNorthPortalProfile(opts);
    assert.equal(p.arc.length,33);assert.equal(p.crownY,o.h-.3);assert.ok(p.springY>PLAYER.HEIGHT+.5);assert.equal(p.headDepth,1.2);
    assert.ok(Object.isFrozen(p)&&Object.isFrozen(p.arc)&&p.arc.every(Object.isFrozen));
    for(const key of Object.keys(opts))for(const value of [NaN,Infinity,undefined,opts[key]+.1])assert.throws(()=>wumenNorthPortalProfile({...opts,[key]:value}),/retained/);
  }assert.ok(Object.isFrozen(WUMEN_NORTH_PORTAL_FIT));
});

test('candidate fixture never reparents or rewrites original transforms, metadata, or physics',()=>{
 const c=captureGate(),nodes=[];c.group.traverse(o=>nodes.push(o));
 const beforeNodes=nodes.map(o=>({parent:o.parent,children:[...o.children],position:[...o.position],rotation:o.rotation.toArray(),quaternion:o.quaternion.toArray(),matrix:[...o.matrix.elements],matrixWorld:[...o.matrixWorld.elements],userData:JSON.stringify(o.userData),geometry:o.geometry,material:o.material}));
 const physical=JSON.stringify([c.builder.colliders,c.builder.walkables]);
 const next=withWumenNorthPortals(c);
 nodes.forEach((o,i)=>assert.deepEqual({parent:o.parent,children:[...o.children],position:[...o.position],rotation:o.rotation.toArray(),quaternion:o.quaternion.toArray(),matrix:[...o.matrix.elements],matrixWorld:[...o.matrixWorld.elements],userData:JSON.stringify(o.userData),geometry:o.geometry,material:o.material},beforeNodes[i]));
 assert.equal(JSON.stringify([c.builder.colliders,c.builder.walkables]),physical);
 assert.notEqual(next.group.children[27],c.group.children[27]);
 assert.equal(meshFingerprint(next.group.children[27]),meshFingerprint(c.group.children[27]));
});

test('same-W QA rejects missing left-half masonry even with all linings retained',()=>{
 const W=existingWorld(after),root=W.scene.children[0];
 for(const slot of [8,12,16]){
   const mesh=root.children[slot],g=mesh.geometry,p=g.attributes.position,keep=[];
   for(let i=0;i<p.count;i+=3)if([0,1,2].every(k=>p.getX(i+k)>=-1e-6))keep.push(i,i+1,i+2);
   const replacement=new THREE.BufferGeometry();
   for(const [name,a] of Object.entries(g.attributes))replacement.setAttribute(name,new THREE.BufferAttribute(new a.array.constructor(keep.flatMap(i=>Array.from(a.array.slice(i*a.itemSize,(i+1)*a.itemSize)))),a.itemSize));
   mesh.geometry=replacement;
 }
 assert.equal(evaluateWumenNorthPortals(W).pass,false);
});

test('same-W historical view accepts exact installed delta and rejects edited head geometry',()=>{
 const restored=restorePreWumenNorthPortals(after);
 assert.equal(meshFingerprint(restored.group),meshFingerprint(before.group));
 const changed=withWumenNorthPortals(before);changed.group.children[8].position.y+=.2;
 assert.throws(()=>restorePreWumenNorthPortals(changed),/Unrecognized/);
});

test('historical fixture explicitly recognizes exactly three new head proxies and rejects shape drift or missing labels',()=>{
 const restored=restorePreWumenNorthPortals(after);assert.equal(restored.builder.colliders.length,before.builder.colliders.length);
 assert.equal(JSON.stringify([restored.builder.colliders,restored.builder.walkables]),retainedPhysics);
 for(const mutate of [b=>delete b.overhead,b=>b.min.z-=.1,b=>{b.overhead={...b.overhead,topY:11};}]){
  const modified={...after,builder:{...after.builder,colliders:after.builder.colliders.map(b=>{const n=b.clone();if(b.overhead)n.overhead=b.overhead;return n;})}};
  mutate(modified.builder.colliders.find(b=>b.overhead));assert.throws(()=>restorePreWumenNorthPortals(modified),/Unrecognized/);
 }
 const partial={...after,builder:{...after.builder,colliders:after.builder.colliders.slice(0,-1)}};assert.throws(()=>restorePreWumenNorthPortals(partial),/Unrecognized/);
});

test('same-W QA requires three exact curved proxies, rejects missing, drifted or box-solid substitutes',()=>{
 const W=existingWorld(after);assert.equal(evaluateWumenNorthPortals(W).pass,true);
 const index=W.cm.colliders.findIndex(c=>c.overhead?.sourceId==='axis/wumen-north-head/0');assert.ok(index>=0);
 const original=W.cm.colliders[index];W.cm.colliders.splice(index,1);assert.equal(evaluateWumenNorthPortals(W).pass,false);W.cm.colliders.splice(index,0,original);
 const shape=original.overhead;original.overhead={...shape,topY:13};assert.equal(evaluateWumenNorthPortals(W).pass,false);
 original.overhead=shape;delete original.overhead;const naive=evaluateWumenNorthPortals(W);assert.equal(naive.pass,false);assert.equal(naive.rows[1].overhead.highVoid,false,'broadphase-only solid incorrectly blocks high central void');
});
