import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';

// Production geometry, colliders and walkables are used without removal,
// rescue:false projection, elevated spawn or a changed controller.
const gate=PALACE_LAYOUT.find(g=>g.name==='太和门');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
let cached;
function world(){
 if(cached)return cached;
 const scene=new THREE.Scene(),lib=library(),builder=new PalaceBuilder(scene,lib);builder.buildAll(PALACE_LAYOUT);
 const config=JSON.parse(readFileSync(new URL('../data/zones/axis-courts.json',import.meta.url))),zone=new ZoneBase(lib,config),data=zone.build();scene.add(data.group);
 const cm=new CollisionManager();cm.addColliders(builder.getColliders(),'palace');cm.addWalkables(builder.getWalkables(),'palace');cm.addColliders(data.colliders,'axis');cm.addWalkables(data.walkables,'axis');
 scene.updateMatrixWorld(true);const root=scene.children.find(g=>g.name==='太和门'),p=root.userData.taihemenSouth;
 assert.ok(p);return cached={THREE,scene,builder,zone,cm,root,p};
}
function ray(root,from,dir,length=30){return new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...dir),0,length).intersectObject(root,true);}

test('R38 independent local dispatch retains all seven other complete PalaceBuilder roots exactly',()=>{
 const W=world(),expected=JSON.parse(readFileSync(new URL('./r38-independent-palace-baseline.json',import.meta.url))).roots,actual={};
 for(const root of W.scene.children){if(!(root.name in expected))continue;const h=createHash('sha256');root.updateMatrixWorld(true);
  root.traverse(o=>{if(!o.isMesh)return;h.update(JSON.stringify({name:o.name,material:o.material.name,matrix:o.matrixWorld.toArray(),count:o.count??null}));for(const [name,a]of Object.entries(o.geometry.attributes)){h.update(name+':'+a.itemSize);h.update(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(o.geometry.index){const a=o.geometry.index.array;h.update(new Uint8Array(a.buffer,a.byteOffset,a.byteLength));}});actual[root.name]=h.digest('hex');
 }
 assert.deepEqual(actual,expected,'Wumen, Shenwumen, Qianqingmen, three halls, inner palace and all river/bridge geometry are untouched');
});

test('R38 independent Taihemen north actual triangles and navigation retain exact R37 identity',()=>{
 const scene=new THREE.Scene(),builder=new PalaceBuilder(scene,library());builder.buildAll([gate]);scene.updateMatrixWorld(true);
 try{
  const rows=[];scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,idx=o.geometry.index,v=new THREE.Vector3();for(let i=0;i<(idx?.count??p.count);i+=3){const vertices=[0,1,2].map(j=>v.fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld).toArray());if(vertices.every(v=>v[2]>=gate.position.z))rows.push(JSON.stringify({material:o.material.name,vertices}));}});rows.sort();
  assert.equal(rows.length,7656);assert.equal(hash(rows),'5de25d01f814760cb29ca17e8860dfe65cf253e06232b95223bf98e5ee7851f4');
  const nav={colliders:builder.getColliders().filter(c=>c.min.z>=gate.position.z),walkables:builder.getWalkables().filter(w=>w.type==='box'?w.box.min.z>=gate.position.z:w.minZ>=gate.position.z)};
  assert.equal(hash(nav),'bc4aa9ee7c3a2b4f4e71bc8ac7fdbc579357c0c8423ecb2bde1ab8e38a467914');
 }finally{builder.dispose();}
});

for(const side of [-1,1])for(const fps of [10,60])for(const sprint of [false,true])test(`R38 independent actual full-world Taihemen south flank and north return ${side}/${fps}/${sprint}`,t=>{
 const W=world(),p=W.p,f=p.flights.find(f=>Math.sign(f.centerX)===side);
 const go=[[f.centerX,p.zToe-3],[f.centerX,p.zToe],[f.centerX,p.zEdge],[f.centerX,p.zEdge+2.5],[0,p.zEdge+2.5],[0,gate.position.z+22]],points=[...go,...go.slice(0,-1).reverse()];
 const placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(W.cm,p);let r;
 try{r=replayTerrace(t,W,points,{fps,sprint,recordFrames:true});}finally{trace.restore();}
 assert.equal(placed.mock.callCount(),1);placed.mock.restore();
 assert.equal(r.arrived,true,JSON.stringify({end:r.end,stuckAt:r.stuckAt}));assert.equal(r.startFeet,0);assert.equal(r.end[2],0);
 assert.ok(trace.samples.some(s=>s.source===f.id&&s.height>s.feetIn),'ascend actual flank');assert.ok(trace.samples.some(s=>s.source===f.id&&s.height<s.feetIn),'descend actual flank');
 assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)),'no hidden broad support rescues');
 assert.ok(r.frames.every(s=>[s.x,s.z,s.feet,s.ground].every(Number.isFinite)&&s.feet>=0));
 const occupied=r.frames.filter(s=>s.z>p.zToe+.2&&s.z<p.zEdge-.2&&Math.abs(s.x-f.centerX)<.4);
 assert.ok(occupied.length>0);
 for(const s of occupied){
  const h=ray(W.root,[s.x,6,s.z],[0,-1,0],6).find(h=>h.object.material.name==='marble');
  assert.ok(h,'real rendered stair under every sampled ramp contact');
  assert.ok(Math.abs(h.point.y-s.ground)<.2,'visible tread and ramp differ only by a tread rise');
 }
});

for(const fps of [10,60])test(`R38 independent imperial stone blocks true center approach without rescue ${fps}Hz`,t=>{
 const W=world(),p=W.p,placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(W.cm,p);let r;
 try{r=replayTerrace(t,W,[[0,p.zToe-3],[0,p.zEdge+1]],{fps,sprint:true,recordFrames:true});}finally{trace.restore();}
 assert.equal(placed.mock.callCount(),1);placed.mock.restore();assert.equal(r.arrived,false);assert.ok(r.maxFeet<.1);assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)));
 for(let k=1;k<=7;k++){
  const z=p.zToe+p.run*k/8,top=ray(W.root,[0,8,z],[0,-1,0],8).filter(h=>['yulu','marble'].includes(h.object.material.name));
  assert.ok(top.length);assert.ok(top[0].point.y>p.y1*k/8,'actual raised stone covers center, not invisible blocker alone');
  assert.equal(W.cm.getGroundHeight(0,z,0),0,'no imperial walking ramp remains');
  assert.equal(W.cm.checkCollision(new THREE.Vector3(0,p.y1*k/8+.05,z),.45),true,'body belongs to rendered stone');
 }
});

test('R38 independent south outer access is retained and the two flanks are separated by visible rail surfaces',()=>{
 const W=world(),p=W.p;
 for(const f of p.flights)for(const side of [-1,1]){
  const x=f.centerX+side*(f.width/2-p.cheekWidth/2),z=(p.zEdge+p.zToe)/2,y=p.y1/2+.65;
  assert.equal(W.cm.checkCollision(new THREE.Vector3(x,y,z),.45),true);
  assert.ok(ray(W.root,[x-1,y,z],[1,0,0],2).some(h=>h.object.material.name==='balustrade'),'rail is visible where sideways movement is blocked');
 }
 for(const x of [-8,8]){
  assert.equal(W.cm.checkCollision(new THREE.Vector3(x,1.7,p.zToe-1),.45),false,'existing courtyard access outside south stair envelope remains clear');
  assert.equal(W.cm.checkCollision(new THREE.Vector3(x,p.y1+1.7,p.zEdge+2.5),.45),false,'retained platform side apron remains clear');
 }
});

test('R38 independent approach stair and imperial solids have real closed undersides and ordered collision bounds',()=>{
 const W=world(),p=W.p,z=(p.zEdge+p.zToe)/2;
 for(const x of [0,...p.flights.map(f=>f.centerX)]){
  const h=ray(W.root,[x,-.5,z],[0,1,0],1).filter(h=>h.object.material.name==='marble');
  assert.ok(h.some(h=>Math.abs(h.point.y)<1e-5),'closed underside at '+x);
 }
 const boxes=W.builder.getColliders().filter(c=>c.min.z>=p.zToe-1e-6&&c.max.z<=p.zEdge+1e-6&&c.min.x>=-p.width/2-1e-6&&c.max.x<=p.width/2+1e-6);
 assert.ok(boxes.length>=64,'actual rail and imperial solids are registered');
 for(const b of boxes)for(const a of ['x','y','z'])assert.ok(Number.isFinite(b.min[a])&&Number.isFinite(b.max[a])&&b.min[a]<=b.max[a]);
});

for(const fps of [10,60])test(`R38 independent central courtyard start reaches a real flank rather than walking imperial stone ${fps}Hz`,t=>{
 const W=world(),p=W.p,f=p.flights[1],go=[[0,p.zToe-3],[f.centerX,p.zToe-3],[f.centerX,p.zToe],[f.centerX,p.zEdge+2.5],[0,p.zEdge+2.5],[0,gate.position.z+22]],points=[...go,...go.slice(0,-1).reverse()];
 const placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(W.cm,p);let r;
 try{r=replayTerrace(t,W,points,{fps,sprint:true,recordFrames:true});}finally{trace.restore();}
 assert.equal(placed.mock.callCount(),1);placed.mock.restore();assert.equal(r.arrived,true,JSON.stringify({end:r.end,stuckAt:r.stuckAt}));assert.equal(r.startFeet,0);assert.equal(r.end[2],0);
 assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)));
 assert.ok(r.frames.filter(s=>s.z>p.zToe&&s.z<p.zEdge).every(s=>s.x>p.imperialWidth/2),'no direct central stone crossing hidden by route helper');
});
