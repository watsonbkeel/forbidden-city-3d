import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {existsSync} from 'node:fs';
import {captureGate,meshFingerprint} from './lib/gate-tower-fixture.mjs';
import {withWumenNorthPortals} from './lib/wumen-north-portal-fixture.mjs';
const moduleURL=new URL('../src/scene/palace/special/WumenSouthPortalCanopies.js',import.meta.url);
const api=existsSync(moduleURL)?await import(moduleURL):null;
const openings=[{x:-17.5,w:5},{x:0,w:9},{x:17.5,w:5}];
const input=withWumenNorthPortals(captureGate());
const physics=JSON.stringify([input.builder.colliders,input.builder.walkables]),materials=[...input.builder.ownedMaterials];
const {wumenSouthCanopyStages}=await import('./lib/wumen-south-canopy-fixture.mjs');
const stages=wumenSouthCanopyStages(input),source=stages.before,group=stages.after.group,dm=source.data.dimensions;
group.updateMatrixWorld(true);
const added=group.getObjectByName('wumen-south-three-canopies');
test('exactly three plain south canopy groups are added, not another hall roof',()=>{
 assert.ok(added,'missing source-visible small protective canopies');assert.equal(added.children.length,3);
 for(const child of added.children){assert.equal(child.children.length,1);assert.equal(child.children[0].material,source.lib.material('roof_tile'));}
});
for(const o of openings)test(`south canopy ${o.x}: positive closed roof above mouth, no body intrusion`,()=>{
 const h=o.w>=8?8:6.5,ray=new THREE.Raycaster(new THREE.Vector3(o.x,h+2,dm.platformSouth-.6),new THREE.Vector3(0,-1,0),0,2);
 const roof=ray.intersectObject(group,true);assert.ok(roof.length,'missing actual canopy surface');assert.equal(roof[0].object.material.name,'roof_tile');
 const child=added?.children.find(c=>c.userData.portalCenter===o.x);assert.ok(child);
 const bounds=new THREE.Box3().setFromObject(child);
 assert.ok(bounds.min.y>h);assert.ok(bounds.max.y<dm.platformHeight);assert.ok(bounds.min.x<o.x-o.w/2&&bounds.max.x>o.x+o.w/2);
 assert.ok(Math.abs(bounds.min.z-(dm.platformSouth-1.1))<1e-5);assert.ok(Math.abs(bounds.max.z-(dm.platformSouth+.04))<1e-5);
 const body=new THREE.Box3(new THREE.Vector3(o.x-.5,.03,dm.platformSouth-2),new THREE.Vector3(o.x+.5,1.7,dm.platformSouth+1));
 assert.equal(bounds.intersectsBox(body),false);
 const p=child.children[0].geometry.attributes.position,idx=child.children[0].geometry.index;
 let volume=0;const edges=new Map(),key=v=>v.toArray().map(x=>x.toFixed(5)).join(',');
 for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k));volume+=v[0].dot(v[1].clone().cross(v[2]))/6;
  for(let j=0;j<3;j++){const edge=[key(v[j]),key(v[(j+1)%3])].sort().join('|');edges.set(edge,(edges.get(edge)??0)+1);}
 }
 assert.ok(volume>0,'actual positive volume, not a flat decal');assert.ok([...edges.values()].every(n=>n===2),'closed manifold roof');
});
test('original roofs, tower, ascent, portals and all registered physics are unchanged',()=>{
 assert.equal(group.children.length,source.group.children.length+1);
 for(let i=0;i<source.group.children.length;i++)assert.equal(meshFingerprint(group.children[i]),meshFingerprint(source.group.children[i]));
 assert.equal(JSON.stringify([source.builder.colliders,source.builder.walkables]),physics);assert.deepEqual(source.builder.ownedMaterials,materials);
});

test('fit accepts only the retained south mouths, and rejects invalid or reordered identities',()=>{
 const opts={openings,southZ:-13.3,platformHeight:12},p=api.wumenSouthCanopyProfiles(opts);
 assert.ok(Object.isFrozen(p)&&p.every(Object.isFrozen));
 for(const delta of [{openings:[]},{openings:[...openings].reverse()},{southZ:NaN},{southZ:-13.2},{platformHeight:Infinity},{platformHeight:13}])assert.throws(()=>api.wumenSouthCanopyProfiles({...opts,...delta}),/retained/);
});
test('finite canopy history rejects duplicate or altered layers rather than hiding them',()=>{
 const exact=wumenSouthCanopyStages(stages.after);assert.equal(meshFingerprint(exact.before.group),meshFingerprint(source.group));
 const changed={...stages.after,group:stages.after.group.clone(true)};changed.group.getObjectByName('wumen-south-three-canopies').position.y+=.1;
 assert.throws(()=>wumenSouthCanopyStages(changed),/Unrecognized/);
});

const {CollisionManager}=await import('../src/utils/Collision.js');
const {replayKunning}=await import('./lib/kunning-walk.mjs');
const {evaluateWumenSouthCanopies}=await import('./lib/r58-wumen-south-canopy-qa.mjs');
function existingWorld(root){const scene=new THREE.Scene(),copy=root.clone(true);copy.position.set(input.data.position.x,0,input.data.position.z);scene.add(copy);scene.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(input.builder.colliders);cm.addWalkables(input.builder.walkables);return {THREE,scene,cm};}
test('same-W canopy QA rejects missing, hidden and zero-opacity canopies',()=>{
 const W=existingWorld(group);assert.equal(evaluateWumenSouthCanopies(W).pass,true);
 assert.equal(evaluateWumenSouthCanopies(existingWorld(source.group)).pass,false);
 const roof=W.scene.getObjectByName('wumen-south-three-canopies').children[1].children[0];roof.visible=false;assert.equal(evaluateWumenSouthCanopies(W).pass,false);roof.visible=true;
 roof.material=roof.material.clone();roof.material.visible=false;assert.equal(evaluateWumenSouthCanopies(W).pass,false);
 roof.material.visible=true;roof.material.transparent=true;roof.material.opacity=0;assert.equal(evaluateWumenSouthCanopies(W).pass,false);
});
for(const fps of [10,60])for(const reverse of [false,true])for(const o of openings)test(`canopy-stage real controller ${o.x}, ${fps}Hz, reverse=${reverse}`,t=>{
 const W=existingWorld(group),zs=[dm.platformSouth-2,dm.platformNorth+2];if(reverse)zs.reverse();
 const result=replayKunning(t,W,zs.map(z=>[o.x,z+input.data.position.z]),{startFeet:0,fps,recordFrames:true});
 assert.equal(result.arrived,true);assert.equal(result.minFeet,0);assert.equal(result.maxFeet,0);
 assert.ok(result.frames.every(f=>!W.cm.checkCollision(new THREE.Vector3(f.x,f.feet+1.7,f.z),.5)));
});
