import test from 'node:test';
import assert from 'node:assert/strict';
import {taihemenFragment,regionTriangles,hash,hookup,baselineSource,candidateSource} from './lib/r58-taihemen-fragment.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import * as THREE from 'three';
const ray=(root,from,dir,length)=>new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...dir),0,length).intersectObject(root,true);

test('actual hooked Taihemen gate exposes seven porch bays without the old broad south wall AABBs',()=>{
  const W=taihemenFragment();try {
    const p=W.root.userData.taihemenSouthEnclosure;
    assert.ok(p,'owner hookup has not replaced the generic south facade');
    const w=W.data.dimensions.width,z=W.data.position.z+p.southEaveZ,y=3.44;
    for(const bay of [1,2,3,4,5,6,7]) {
      const x=-w/2+(bay+.5)*w/9;
      assert.equal(W.cm.checkCollision(new THREE.Vector3(x,y+1.7,z),.5),false,`eave bay ${bay}`);
      assert.equal(ray(W.root,[x,y+1.7,z-.7],[0,0,1],1.4).length,0);
      assert.equal(W.cm.getGroundHeight(x,z,y,.03),y,'original platform support');
    }
    for(const bay of [0,8]) {
      const x=-w/2+(bay+.5)*w/9;
      assert.equal(W.cm.checkCollision(new THREE.Vector3(x,y+1.7,z),.5),true);
      assert.ok(ray(W.root,[x,y+1.7,z-.7],[0,0,1],1.4).length);
    }
  } finally {W.builder.dispose();}
});

test('all 40 column transforms, roof, plaque, north-half triangles and support primitives remain exact',()=>{
  const before=taihemenFragment({candidate:false}),after=taihemenFragment();
  try {
    assert.equal(after.builder.columns.length,40);
    assert.deepEqual(after.builder.columns,before.builder.columns);
    assert.equal(hash(after.builder.roofRows),hash(before.builder.roofRows));
    assert.equal(hash(after.builder.plaqueRows),hash(before.builder.plaqueRows));
    assert.equal(hash(after.builder.walkables),hash(before.builder.walkables));
    assert.deepEqual(after.p,before.p);
    const north=v=>v[2]>=before.data.position.z;
    assert.equal(hash(regionTriangles(after.root,north)),hash(regionTriangles(before.root,north)));
    const northColliders=b=>b.colliders.filter(c=>c.min.z>=before.data.position.z).map(c=>c.toArray?.()??{min:c.min.toArray(),max:c.max.toArray()});
    assert.deepEqual(northColliders(after.builder),northColliders(before.builder));
    assert.equal(hash(regionTriangles(after.root,v=>v[1]<3.44-1e-5)),hash(regionTriangles(before.root,v=>v[1]<3.44-1e-5)));
    assert.equal(hookup.length,3);
    assert.equal(candidateSource.includes("太和门: { bays: 9, roof: 'xieshan', layers: 2, open: 3, baseH: 3.44"),true);
    assert.notEqual(hash(candidateSource),hash(baselineSource));
  } finally {before.builder.dispose();after.builder.dispose();}
});

for(const fps of [10,60])for(const sprint of [false,true])test(`actual controller ground-start porch sweep, inner passage and north return ${fps}Hz sprint=${sprint}`,t=>{
  const W=taihemenFragment();const placed=t.mock.method(FirstPersonControls.prototype,'setPosition');
  const f=W.p.flights[1],eave=W.data.position.z-W.data.dimensions.depth/2,porch=eave+2.3;
  const go=[[0,W.p.zToe-3],[f.centerX,W.p.zToe-3],[f.centerX,W.p.zEdge],[f.centerX,porch],[-16.02,porch],[16.02,porch],[0,porch],[0,W.data.position.z+22]];
  const trace=traceTerraceGround(W.cm,W.p);
  try {
    const result=replayTerrace(t,W,[...go,...go.slice(0,-1).reverse()],{fps,sprint,recordFrames:true});
    assert.equal(placed.mock.callCount(),1,'no corrective teleport or elevated spawn');
    assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));
    assert.equal(result.startFeet,0);assert.equal(result.end[2],0);
    assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)));
    const porchFrames=result.frames.filter(s=>s.z>eave+.6&&s.z<eave+4&&Math.abs(s.x)<18);
    assert.ok(porchFrames.length>20);
    for(const s of porchFrames) {
      assert.equal(W.cm.checkCollision(new THREE.Vector3(s.x,s.feet+1.7,s.z),.5),false);
      assert.ok(Math.abs(s.ground-3.44)<1e-9);
      const hits=ray(W.root,[s.x,3.6,s.z],[0,-1,0],.3);
      assert.ok(hits.some(h=>Math.abs(h.point.y-3.47)<.02),'rendered slab under actual body contact');
    }
  } finally {trace.restore();placed.mock.restore();W.builder.dispose();}
});

for(const fps of [10,60])test(`closed recessed bay stops the real controller while the porch remains traversable ${fps}Hz`,t=>{
  const W=taihemenFragment(),f=W.p.flights[1],eave=W.data.position.z-W.data.dimensions.depth/2;
  const trace=traceTerraceGround(W.cm,W.p);
  try {
    const r=replayTerrace(t,W,[[f.centerX,W.p.zToe-3],[f.centerX,W.p.zEdge],[f.centerX,eave+2.3],[10.68,eave+2.3],[10.68,W.data.position.z]],{fps,sprint:true,recordFrames:true});
    assert.equal(r.arrived,false);assert.equal(r.startFeet,0);
    const inner=W.data.position.z-20.54/2+20.54/3;
    assert.ok(r.end[1]<inner-.4&&r.end[1]>inner-1.2,JSON.stringify(r.end));
    assert.ok(ray(W.root,[10.68,5.14,inner-1],[0,0,1],2).length);
    assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)));
  } finally {trace.restore();W.builder.dispose();}
});

test('fragment baseline remains independent when the owner has already applied the hookup',async()=>{
  const api=await import('./lib/r58-taihemen-fragment.mjs');
  assert.equal(typeof api.restoreTaihemenHookup,'function','missing reversible baseline extraction');
  assert.equal(api.restoreTaihemenHookup(api.candidateSource),api.baselineSource);
  assert.equal(api.applyTaihemenHookup(api.candidateSource),api.candidateSource);
  assert.equal(api.restoreTaihemenHookup(api.baselineSource),api.baselineSource);
});
