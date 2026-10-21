import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { walkStraight } from '../lib/world.mjs';
// Canvas-only stubs used by the registered rear-palace materials.
import '../lib/inner-palace-fixture.mjs';

const near = (a, b, label = '') => assert.ok(Math.abs(a - b) < 1e-8, `${label}: ${a} != ${b}`);
function fixture(name = '三台') {
  const mats = new Map();
  const library = { material: n => mats.get(n) ?? (mats.set(n, new THREE.MeshStandardMaterial({ name: n })), mats.get(n)), tileSize: () => 2, aspect: () => 1 };
  const builder = new PalaceBuilder(new THREE.Scene(), library);
  // Rear-palace decorators require actual registered hall metadata. The side-
  // stair geometry isolation is only needed for the Three Halls fixture.
  if (name === '三台') builder.buildHall = () => {};
  builder.terraceOrnaments = () => {};
  let group, options, rects;
  const finish = builder.finish.bind(builder);
  builder.finish = g => { group = name === '后三宫' ? finish(g) : g; group.userData.architecture ??= []; return group; };
  const build = builder.buildTerraceUnion;
  builder.buildTerraceUnion = function(g, r, opts) { rects = structuredClone(r); options = opts; return build.call(this, g, r, opts); };
  const names = name === '三台' ? ['太和殿', '中和殿', '保和殿'] : ['乾清宫', '交泰殿', '坤宁宫'];
  builder.buildComplex(PALACE_LAYOUT.filter(h => names.includes(h.name)), {
    name, apron: name === '三台' ? 14 : 6, margin: 4,
    ...(name === '三台' ? { bottom: { halfW: 65, z0: -54, z1: 178 } } : {}),
  });
  const cm = new CollisionManager();
  cm.addColliders(builder.colliders); cm.addWalkables(builder.walkables);
  group.updateMatrixWorld(true);
  return { builder, group, cm, THREE, library, rects, options };
}

function sideRamps(builder) {
  return builder.walkables.filter(w => w.type === 'ramp' && w.axis === 'x' && w.minZ === 55.95 && w.maxZ === 60.05);
}

test('three-hall waist has exactly six physical x-ramp flights derived from its inherited tiers', () => {
  const W = fixture();
  const ramps = sideRamps(W.builder);
  assert.equal(ramps.length, 6, 'V4 has no ground-to-common-terrace side flights');
  for (const sign of [-1, 1]) {
    const own = ramps.filter(r => Math.sign(r.a0) === sign).sort((a,b) => a.y0-b.y0);
    for (let i = 0; i < 3; i++) {
      near(own[i].a0, sign * (16.5 + (2-i)*(8/3*1.6+1.2)), 'head');
      near(own[i].a1, own[i].a0 + sign * (8/3*1.6), 'toe');
      near(own[i].y1, i*8/3); near(own[i].y0, (i+1)*8/3);
    }
  }
});

for (const sign of [-1, 1]) test(`ground-origin ${sign < 0 ? 'east' : 'west'} approach ascends all three flights and returns to ground`, () => {
  const W = fixture();
  const ascent = walkStraight(W, [sign*36,58], [sign*15.5,58], { feet0: 0 });
  assert.equal(ascent.reached, ascent.total, `real ground approach is blocked: ${JSON.stringify(ascent)}`);
  near(ascent.feet, 8);
  const descent = walkStraight(W, [sign*15.5,58], [sign*36,58], { feet0: 8 });
  assert.equal(descent.reached, descent.total); near(descent.feet, 0);
});

for (const sign of [-1, 1]) for (const z of [52,64,72]) test(`retaining wall stays solid outside waist opening: side ${sign}, z ${z}`, () => {
  const W = fixture();
  const result = walkStraight(W, [sign*36,z], [sign*15.5,z], {feet0:0});
  assert.ok(result.reached < 9, JSON.stringify(result)); near(result.feet,0);
});

const triangles = group => { let count=0; group.traverse(o=>{if(o.isMesh) count+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}); return count; };

test('six new flights are true closed 17-tread profiles with matching openings and provisional metadata', () => {
  const W=fixture(), profile=W.builder.terraceProfiles?.[0];
  assert.ok(profile, 'the physical three-hall terrace must expose one shared profile');
  assert.equal(profile.id,'three-hall-waist-stairs');
  assert.equal(profile.evidenceClass,'ENGINEERING_ASSUMPTION_WITH_PLAN_SUPPORTED_TOPOLOGY');
  assert.equal(profile.currentAccessStatus,'UNKNOWN');
  assert.deepEqual(profile.openingZ,[55.5,60.5]);
  assert.deepEqual(profile.walkableCrossZ,[55.95,60.05]);
  assert.deepEqual(profile.bodyCenterCrossZ,[56.45,59.55]);
  assert.equal(profile.centerZ,58); assert.equal(profile.outerWidth,5);
  assert.equal(profile.flights.length,6);
  for(const f of profile.flights) {
    const mesh=W.group.getObjectByName(`${f.id}:closed-treads`);
    assert.ok(mesh, `${f.id} needs one real stair mesh`);
    assert.equal(f.treadCount,17); assert.equal(triangles(mesh),140);
    assert.equal(triangles(W.group.getObjectByName(f.id)),164);
    assert.equal(mesh.material,W.library.material('marble'));
    assert.ok(mesh.castShadow && mesh.receiveShadow);
    for(const key of ['position','normal','uv']) assert.ok([...mesh.geometry.attributes[key].array].every(Number.isFinite));
    near(Math.abs(f.xToe-f.xEdge),64/15);
    assert.deepEqual(f.openingZ,profile.openingZ);
  }
});

test('only side flights and six rail splits change geometry; every existing terrace body face stays exact', () => {
  const W=fixture();
  const old=new PalaceBuilder(new THREE.Scene(),W.library), before=new THREE.Group(), after=new THREE.Group();
  const { sideStairProfile, ...options }=W.options;
  old.buildTerraceUnion(before,W.rects,options);
  const next=new PalaceBuilder(new THREE.Scene(),W.library);
  next.buildTerraceUnion(after,W.rects,W.options);
  assert.equal(triangles(after)-triangles(before),1056);
  const bodies=g=>{const out=[];g.traverse(o=>{if(o.isMesh&&['sumeru_band','stone_slab'].includes(o.material.name))out.push({pos:o.position.toArray(),p:[...o.geometry.attributes.position.array],n:[...o.geometry.attributes.normal.array],uv:[...o.geometry.attributes.uv.array]});});return out;};
  assert.deepEqual(bodies(after),bodies(before),'no optional terrace-body face pruning');
  assert.equal(next.colliders.length-old.colliders.length,60);
  assert.equal(next.walkables.length-old.walkables.length,6);
  assert.equal(fixture('后三宫').builder.terraceProfiles?.length??0,0,'rear-palace own profile must not enter the historical three-tier route registry');
});

function ray(mesh, origin, direction) {
  mesh.updateMatrixWorld(true);
  return new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction).normalize()).intersectObject(mesh,true)[0];
}

test('every stair is a nondegenerate closed manifold with outward faces and metric UVs', () => {
  const W=fixture();
  for(const f of W.builder.terraceProfiles[0].flights) {
    const mesh=W.group.getObjectByName(`${f.id}:closed-treads`),g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
    const edges=new Map(), key=v=>v.toArray().map(v=>Math.round(v*1e5)).join(',');
    let volume=0;
    for(let i=0;i<p.count;i+=3) {
      const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,i+j));
      const normal=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0]));
      assert.ok(normal.length()>1e-7,`${f.id}: degenerate triangle`);
      assert.ok(normal.dot(new THREE.Vector3().fromBufferAttribute(n,i))>0, 'outward winding matches normal');
      volume+=v[0].dot(new THREE.Vector3().crossVectors(v[1],v[2]))/6;
      for(let j=0;j<3;j++) {const a=key(v[j]),b=key(v[(j+1)%3]),k=[a,b].sort().join('|');const list=edges.get(k)??[];list.push([a,b]);edges.set(k,list);}
      for(let j=0;j<3;j++) {
        const at=i+j,x=p.getX(at),y=p.getY(at),z=p.getZ(at),nx=n.getX(at),ny=n.getY(at),nz=n.getZ(at);
        const expected=Math.abs(ny)>.9?[x/2,z/2]:Math.abs(nx)>.9?[z*Math.sign(nx)/2,y/2]:[x*Math.sign(nz)/2,y/2];
        assert.ok(Math.abs(uv.getX(at)-expected[0])<1e-5 && Math.abs(uv.getY(at)-expected[1])<1e-5);
      }
    }
    for(const pair of edges.values()) {assert.equal(pair.length,2,'all edges have exactly two incident faces');assert.deepEqual(pair[0],pair[1].slice().reverse(),'incident winding is opposite');}
    assert.ok(Math.abs(volume-f.run*(f.y1-f.y0)*f.width/2)<1e-4,'positive closed volume, within Float32 coordinate precision');
  }
});

test('all tread tops, exposed risers, stepped sides, head, underside and visible cheeks raycast', () => {
  const W=fixture();
  for(const f of W.builder.terraceProfiles[0].flights) {
    const mesh=W.group.getObjectByName(`${f.id}:closed-treads`),rise=f.y1-f.y0,sr=f.run/f.treadCount;
    for(let k=0;k<f.treadCount;k++) {
      const top=f.y1-(k+1)*rise/(f.treadCount+1),x=f.xEdge+f.dir*(k+.5)*sr;
      const topHit=ray(mesh,[x,f.y1+1,f.centerZ],[0,-1,0]);
      assert.ok(topHit); assert.ok(Math.abs(topHit.point.y-top)<2e-5,'each actual tread is exposed');
      const low=k===f.treadCount-1?f.y0:top-rise/(f.treadCount+1);
      const riserX=f.xEdge+f.dir*(k+1)*sr;
      const hit=ray(mesh,[riserX+f.dir*.05,(top+low)/2,f.centerZ],[-f.dir,0,0]);
      assert.ok(hit&&Math.abs(hit.distance-.05)<2e-5,`${f.id} riser ${k}`);
      for(const zsign of [-1,1]) {
        const side=ray(mesh,[x,(top+f.y0)/2,f.centerZ+zsign*(f.width/2+1)],[0,0,-zsign]);
        assert.ok(side&&Math.abs(side.distance-1)<2e-5,'stepped side profile is enclosed');
      }
    }
    assert.ok(ray(mesh,[f.xEdge-f.dir,f.y0+.05,f.centerZ],[f.dir,0,0]),'rear/head closure');
    assert.ok(ray(mesh,[(f.xEdge+f.xToe)/2,f.y0-1,f.centerZ],[0,1,0]),'underside closure');
    for(const zsign of [-1,1]) {
      const cheek=W.group.getObjectByName(`${f.id}:cheek:${zsign}`);
      assert.ok(ray(cheek,[(f.xEdge+f.xToe)/2,(f.y0+f.y1)/2+.1,f.centerZ+zsign*(f.width/2+1)],[0,0,-zsign]),'visible solid cheek');
    }
    const masonry=[]; W.group.traverse(o=>{if(o.isMesh&&o.material.name==='sumeru_band')masonry.push(o);});
    const backing=new THREE.Raycaster(new THREE.Vector3(f.xEdge+f.dir*.2,f.y1-.05,f.centerZ),new THREE.Vector3(-f.dir,0,0)).intersectObjects(masonry)[0];
    assert.ok(backing&&Math.abs(backing.distance-.2)<2e-5,'retaining masonry and final head riser remain behind the stairs');
  }
});

for(const sign of [-1,1]) test(`cheeks, diagonal entry and under-platform bypass stay blocked on side ${sign}`,()=>{
  const W=fixture();
  for(const offset of [-2.1,-1.56,1.56,2.1]) {
    const r=walkStraight(W,[sign*36,58+offset],[sign*15.5,58+offset],{feet0:0});
    assert.ok(r.reached<5,`${offset}: ${JSON.stringify(r)}`);near(r.feet,0);
  }
  for(const f of W.builder.terraceProfiles[0].flights.filter(f=>f.dir===sign)) for(const sz of [-1,1]) {
    const x=(f.xToe+f.xEdge)/2;
    for(const dx of [0,sign*.8,-sign*.8]) {
      const r=walkStraight(W,[x+dx,58+sz*4],[x,58],{feet0:f.y0});
      assert.ok(r.reached<2,`cross-flight cheek/diagonal entry: ${JSON.stringify(r)}`);
      assert.ok(r.feet<=f.y0+.01);
    }
  }
});

test('post-batch front-face ray hits and normals preserve both sides without mirrored winding',()=>{
  const W=fixture(), before=W.group;
  const queries=[];
  for(const f of W.builder.terraceProfiles[0].flights) {
    const rise=f.y1-f.y0,n=f.treadCount,sr=f.run/n;
    for(let k=0;k<n;k++) {
      const top=f.y1-(k+1)*rise/(n+1),low=k===n-1?f.y0:top-rise/(n+1),x=f.xEdge+f.dir*(k+.5)*sr;
      queries.push([[x,f.y1+1,f.centerZ],[0,-1,0]],[[f.xEdge+f.dir*((k+1)*sr+.05),(top+low)/2,f.centerZ],[-f.dir,0,0]]);
      for(const sz of [-1,1]) queries.push([[x,(top+f.y0)/2,f.centerZ+sz*(f.width/2+1)],[0,0,-sz]]);
    }
    queries.push([[(f.xEdge+f.xToe)/2,f.y0-1,f.centerZ],[0,1,0]],[[f.xEdge+f.dir*.2,f.y1-.05,f.centerZ],[-f.dir,0,0]]);
  }
  const expected=queries.map(q=>ray(before,...q));
  const merged=PalaceBuilder.prototype.finish.call(W.builder,before);
  assert.equal(merged.userData.architecture.find(a=>a.id==='three-hall-waist-stairs').flights.length,6);
  queries.forEach((q,i)=>{
    const hit=ray(merged,...q),old=expected[i]; assert.ok(hit&&old,`external ray ${i}`);
    assert.ok(Math.abs(hit.distance-old.distance)<3e-5,`post-merge hit ${i}`);
    const n1=hit.face.normal.clone().transformDirection(hit.object.matrixWorld),n0=old.face.normal.clone().transformDirection(old.object.matrixWorld);
    assert.ok(n1.dot(n0)>.99999,`post-merge normal ${i}`);
    assert.equal(hit.object.material.side,THREE.FrontSide);
    assert.ok(hit.uv.distanceTo(old.uv)<3e-5,`post-merge UV ${i}`);
  });
});

test('new terrace metadata, colliders and owned geometry dispose cleanly, and rebuild without duplicates',()=>{
  const W=fixture();
  const mats=new Set();W.group.traverse(o=>{if(o.material)mats.add(o.material);});W.library.owns=m=>mats.has(m);
  let libraryDisposals=0;mats.forEach(m=>m.addEventListener('dispose',()=>libraryDisposals++));
  const merged=PalaceBuilder.prototype.finish.call(W.builder,W.group),counts={geometry:0,disposed:0};
  merged.traverse(o=>{if(o.geometry){counts.geometry++;o.geometry.addEventListener('dispose',()=>counts.disposed++);}});
  const cm=new CollisionManager();cm.addColliders(W.builder.colliders,'terrace');cm.addWalkables(W.builder.walkables,'terrace');
  cm.removeByTag('terrace'); assert.equal(cm.colliders.length,0);assert.equal(cm.walkables.length,0);
  W.builder.dispose();assert.equal(counts.disposed,counts.geometry);assert.equal(libraryDisposals,0);
  assert.equal(W.builder.terraceProfiles.length,0,'disposed profile must not remain live metadata');
  assert.equal(W.builder.colliders.length,0);assert.equal(W.builder.walkables.length,0);assert.equal(W.builder.scene.children.length,0);
  const rebuilt=fixture();assert.equal(rebuilt.builder.terraceProfiles.length,1);assert.equal(sideRamps(rebuilt.builder).length,6);
});
