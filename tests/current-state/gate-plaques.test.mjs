import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { captureGate } from '../lib/gate-tower-fixture.mjs';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';

const gates = new Map(['午门', '神武门'].map(name => [name, captureGate(name)]));
const plaques = c => c.group.children.filter(o => o.userData.gatePlaque);

test('exactly one evidence-labelled plaque is built on each supported cardinal facade', () => {
  const w = plaques(gates.get('午门')), s = plaques(gates.get('神武门'));
  assert.equal(w.length, 1); assert.equal(s.length, 1);
  assert.equal(w[0].name, 'wumen-south-gate-name-plaque');
  assert.equal(w[0].userData.gatePlaque.text, '午門');
  assert.equal(w[0].userData.gatePlaque.side, 'south');
  assert.equal(s[0].name, 'shenwu-north-institution-plaque');
  assert.equal(s[0].userData.gatePlaque.text, '故宫博物院');
  assert.equal(s[0].userData.gatePlaque.side, 'north');
  for (const c of gates.values()) assert.equal(c.builder._own.has('plaque:神武门'), false);
  assert.equal(gates.get('神武门').group.userData.gatePlaqueOmissions[0].status, 'DEFERRED_UNVERIFIED_MANCHU_SCRIPT');
});

test('lettering is confined to the outward-facing front; sides and backs are unlettered', () => {
  for (const [name,c] of gates) {
    const p = plaques(c)[0]; assert.ok(p, `${name} plaque missing`);
    assert.equal(p.material.length, 2); assert.equal(p.material[0].map, null);
    assert.ok(p.material[1].map?.isCanvasTexture); assert.equal(p.material[1].side, THREE.FrontSide);
    const geo = p.geometry, normal = geo.attributes.normal;
    for (const group of geo.groups) for (let i = group.start; i < group.start + group.count; i++) {
      const j = geo.index ? geo.index.getX(i) : i;
      assert.equal(group.materialIndex === 1, normal.getZ(j) > 0.99);
    }
    const n = new THREE.Vector3(0,0,1).applyQuaternion(p.quaternion);
    assert.ok(Math.abs(n.z - (name === '午门' ? -1 : 1)) < 1e-12);
  }
});

test('Wumen fits actual lower roof and upper fascia, independently of roof topY', () => {
  const c = gates.get('午门'), p = plaques(c)[0], roof = c.group.children.find(o => o.name === 'roof_wudian');
  assert.ok(p, 'Wumen plaque missing');
  const band = roof.userData.doubleEaveMountingBand;
  assert.ok(band, 'actual double-eave locals must expose a mounting band');
  const bounds = new THREE.Box3().setFromObject(p);
  assert.ok(bounds.min.y >= p.userData.gatePlaque.mount.lowerY + .099);
  assert.ok(bounds.max.y <= p.userData.gatePlaque.mount.upperFasciaBottomY - .099);
  assert.ok(bounds.max.z < -band.halfDepth);
  assert.ok(p.position.y > c.tower.position.y + c.tower.userData.topY);
  assert.equal(p.userData.gatePlaque.dimensions.status, 'SOURCE_PHOTO_PROPORTION_MODEL_CHOICE_NOT_SURVEY');
  assert.ok(Math.abs(p.userData.gatePlaque.dimensions.innerWidth / p.userData.gatePlaque.dimensions.innerHeight - .75) < 1e-12);
});

test('Shenwu institution plaque clears the retained opening and top strip, with no invented canopy', () => {
  const c = gates.get('神武门'), p = plaques(c)[0]; assert.ok(p, 'institution plaque missing');
  const b = new THREE.Box3().setFromObject(p), d = p.userData.gatePlaque.dimensions;
  assert.equal(d.width, 9); assert.equal(d.height, 2.5); assert.equal(p.position.y, 8.4);
  assert.ok(b.min.y > 6.5); assert.ok(b.max.y < 10);
  assert.ok(b.min.z > c.data.dimensions.depth / 2);
  assert.equal(p.userData.gatePlaque.mount.canopyStatus, 'ABSENT_IN_RETAINED_MODEL');
});

test('production merge retains both semantic plaque identity and explicit deferred upper north sign', () => {
  for (const [name] of gates) {
    const c=captureGate(name), merged=PalaceBuilder.prototype.finish.call(c.builder,c.group);
    const found=merged.children.filter(o=>o.userData.gatePlaque); assert.equal(found.length,1);
    found[0].geometry.attributes.position.array.forEach(v=>assert.ok(Number.isFinite(v)));
    if(name==='神武门') assert.equal(merged.userData.gatePlaqueOmissions[0].id,'shenwu-north-dual-script-gate-name-plaque');
  }
});

import {createGatePlaque,buildWumenSouthPlaque} from '../../src/scene/palace/special/GatePlaques.js';
function withRecordedCanvas(run) {
  const saved=globalThis.document;
  globalThis.document={createElement:()=>{
    const calls=[],context={fillText(...args){calls.push({args,fill:this.fillStyle,font:this.font});},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){}};
    return {width:0,height:0,calls,getContext:()=>context};
  }};
  try{return run();}finally{globalThis.document=saved;}
}
const plaqueSpec={id:'test-plaque',text:'故宫博物院',width:9,height:2.5,layout:'horizontal',style:'institution',script:'Han',side:'north'};
test('actual Canvas text calls read left-to-right north and top-to-bottom south, with upright UVs',()=>withRecordedCanvas(()=>{
  const builder=new PalaceBuilder(new THREE.Scene(),{});
  const horizontal=createGatePlaque(builder,plaqueSpec);
  const vertical=createGatePlaque(builder,{...plaqueSpec,text:'午門',width:1.98,height:2.2,layout:'vertical',style:'gate-name',side:'south'});
  for(const p of [horizontal,vertical]){
    const {image}=p.material[1].map,calls=image.calls;
    assert.equal(calls.map(c=>c.args[0]).join(''),p.userData.gatePlaque.text);
    assert.ok(calls.every(c=>c.fill===(p===horizontal?'#34302b':'#e6bd59')));
    if(p===horizontal){for(let i=1;i<calls.length;i++)assert.ok(calls[i].args[1]>calls[i-1].args[1]);assert.equal(new Set(calls.map(c=>c.args[2])).size,1);}
    else{for(let i=1;i<calls.length;i++)assert.ok(calls[i].args[2]>calls[i-1].args[2]);assert.equal(new Set(calls.map(c=>c.args[1])).size,1);}
    const right=new THREE.Vector3(1,0,0).applyQuaternion(p.quaternion);
    assert.ok(right.dot(p===horizontal?new THREE.Vector3(1,0,0):new THREE.Vector3(-1,0,0))>.999);
    assert.equal(p.material[1].map.flipY,true);
    const {position,uv,normal}=p.geometry.attributes,{width,height}=p.userData.gatePlaque.dimensions;
    for(let i=0;i<position.count;i++)if(normal.getZ(i)>.99){assert.ok(Math.abs(uv.getX(i)-(position.getX(i)/width+.5))<1e-6);assert.ok(Math.abs(uv.getY(i)-(position.getY(i)/height+.5))<1e-6);}
    assert.equal(p.geometry.groups.length,2,'one unlettered and one front draw only');
  }
}));

test('gate-local cache distinguishes text, layout, style and dimensions; exact repeat reuses material',()=>withRecordedCanvas(()=>{
  const builder=new PalaceBuilder(new THREE.Scene(),{}),first=createGatePlaque(builder,plaqueSpec);
  assert.equal(createGatePlaque(builder,{...plaqueSpec,id:'other-id'}).material[1],first.material[1]);
  for(const change of [{text:'午門'},{layout:'vertical'},{style:'gate-name'},{width:8},{height:3},{depth:.2}])assert.notEqual(createGatePlaque(builder,{...plaqueSpec,...change}).material[1],first.material[1]);
  assert.throws(()=>createGatePlaque(builder,{...plaqueSpec,script:'unverified-Manchu'}),/script/);
  for(const width of [0,-1,Infinity,NaN])assert.throws(()=>createGatePlaque(builder,{...plaqueSpec,width}),/finite/);
}));

test('Wumen mounting depends on generated local band and remains separated from actual roof surfaces',()=>{
  const c=gates.get('午门'),roof=c.group.children.find(o=>o.name==='roof_wudian'),p=plaques(c)[0];
  const oldTop=roof.userData.topY;roof.userData.topY=10000;
  try{assert.deepEqual(buildWumenSouthPlaque(c.builder,roof).position,p.position);}finally{roof.userData.topY=oldTop;}
  // CPU rays sample the plaque plane and its outward thickness; the uppermost
  // lower-roof hit lies below it and the next soffit hit stays above it.
  const b=new THREE.Box3().setFromObject(p);
  for(const x of [-p.userData.gatePlaque.dimensions.width*.4,0,p.userData.gatePlaque.dimensions.width*.4])for(const z of [b.min.z,b.max.z]){
    const hits=new THREE.Raycaster(new THREE.Vector3(x,0,z),new THREE.Vector3(0,1,0),0,50).intersectObject(roof,true);
    assert.ok(hits.some(h=>h.point.y>b.max.y),'upper roof visible to upward ray');
    assert.equal(hits.filter(h=>h.point.y>=b.min.y-1e-5&&h.point.y<=b.max.y+1e-5).length,0,'plaque must not intersect retained roofs');
  }
});

test('only new plaque maps are disposed with their owned face materials',()=>withRecordedCanvas(()=>{
  const builder=new PalaceBuilder(new THREE.Scene(),{}),p=createGatePlaque(builder,plaqueSpec);let disposed=0;
  p.material[1].map.addEventListener('dispose',()=>disposed++);builder.dispose();assert.equal(disposed,1);
}));

import fs from 'node:fs';
import {railPaths} from '../lib/gate-rail-retention.mjs';
import {restorePreWumenAscent} from '../lib/wumen-ascent-retention.mjs';
const historicalBudget=JSON.parse(fs.readFileSync(new URL('../fixtures/v10-gate-rail-d-baseline.json',import.meta.url)));
for(const [name,c] of gates)test(`${name}: explicit candidate budget replaces one mesh, adds one material, and preserves physics`,()=>{
  let meshes=0,triangles=0;const materials=new Set();
  // Keep the immutable plaque budget after only the validated newer ascent scope.
  restorePreWumenAscent(c).group.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;
    for(const material of Array.isArray(m.material)?m.material:[m.material])materials.add(material);
  });
  const old=historicalBudget[name];
  assert.equal(meshes,old.meshes);assert.equal(materials.size,old.materials+1);
  assert.equal(triangles,old.triangles-4*railPaths[name].length+(name==='午门'?536:0));
  const p=plaques(c)[0],origin=new THREE.Vector3(0,p.position.y,p.position.z+(name==='午门'?-3:3));
  const direction=new THREE.Vector3(0,0,name==='午门'?1:-1);
  const hits=new THREE.Raycaster(origin,direction,0,6).intersectObject(p);
  assert.ok(hits.length);assert.equal(hits[0].face.materialIndex,1,'cardinal outward viewer sees the only lettered surface');
});
