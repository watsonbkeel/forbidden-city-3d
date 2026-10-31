import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {CollisionManager} from '../../../../src/utils/Collision.js';import {registerWumenJointAscentOwners,validateWumenJointAscentBinding} from '../../../../src/controls/WumenJointAscentContact.js';import {buildWumenAscentContactRig} from '../../../../scripts/photo-fidelity/batches/wumen-joint-layout/ascent-contact.mjs';import {buildWumenJointTestGround} from '../../../../scripts/photo-fidelity/batches/wumen-joint-layout/test-ground.mjs';
function setup(t,physical=true){const m=new T.MeshStandardMaterial(),rig=buildWumenAscentContactRig(m),groundMaterial=new T.MeshStandardMaterial(),g=buildWumenJointTestGround(groundMaterial),cm=new CollisionManager();for(const p of rig.pieces){cm.addColliders(p.colliders);cm.addWalkable(p.walkable);}if(physical){cm.addCollider(g.collider);cm.addWalkable(g.walkable);}t.after(()=>{rig.dispose();g.dispose();m.dispose();groundMaterial.dispose();});return{cm,rig,g};}
const register=({cm,rig,g})=>registerWumenJointAscentOwners(cm,rig.pieces,{groundOwner:g});
test('explicit whole-ground opt-in exposes exactly two fixed patch IDs without creating physical rows',t=>{const s=setup(t),rows=s.cm.colliders.slice(),walks=s.cm.walkables.slice(),b=register(s);t.after(()=>b.dispose());assert.deepEqual(b.groundPatchIDs,['east/ground-approach','west/ground-approach']);assert.ok(Object.isFrozen(b.groundPatchIDs));assert.equal(b.groundSourceID,'wumen-joint/test-ground');assert.equal(b.routeAcceptance,false);assert.equal(validateWumenJointAscentBinding(s.cm),b);assert.deepEqual(s.cm.colliders,rows);assert.deepEqual(s.cm.walkables,walks);assert.equal(s.cm.colliders.length,545);assert.equal(s.cm.walkables.length,15);});
test('omitted ground authority remains absent, while unknown or fake optional ground is rejected',t=>{const a=setup(t),b=registerWumenJointAscentOwners(a.cm,a.rig.pieces);t.after(()=>b.dispose());assert.equal(b.groundSourceID,undefined);assert.equal(b.groundPatchIDs,undefined);for(const options of [{groundOwner:{}},{groundOwner:null},{unexpected:true}]){const s=setup(t);assert.throws(()=>registerWumenJointAscentOwners(s.cm,s.rig.pieces,options),/Wumen joint/);assert.equal(validateWumenJointAscentBinding(s.cm),null);}});
test('visible ground without its real collider and flat support cannot acquire authority',t=>{const s=setup(t,false);assert.throws(()=>register(s),/Wumen joint/);assert.equal(validateWumenJointAscentBinding(s.cm),null);});
for(const [name,mutate]of Object.entries({
 hidden:s=>s.g.mesh.visible=false,shifted:s=>s.g.mesh.position.x=.1,
 wrongName:s=>s.g.mesh.name='fake-ground',instanced:s=>s.g.mesh.isInstancedMesh=true,
 emissive:s=>s.g.mesh.material.emissive.set(0x00ff00),shaderFlag:s=>s.g.mesh.material.isRawShaderMaterial=true,
 actualVertex:s=>s.g.mesh.geometry.attributes.position.array[0]+=.1,
 index:s=>s.g.mesh.geometry.index.array[0]=s.g.mesh.geometry.index.array[1],
 uv:s=>s.g.mesh.geometry.attributes.uv.array[0]+=.1,
 groups:s=>s.g.mesh.geometry.groups[0].count=0,
 drawRange:s=>s.g.mesh.geometry.drawRange.count=0,
 gpuType:s=>s.g.mesh.geometry.attributes.position.gpuType=T.IntType,
 removedBody:s=>s.cm.colliders.pop(),duplicateBody:s=>s.cm.colliders.push(s.cm.colliders.at(-1)),
 removedSupport:s=>s.cm.walkables.pop(),duplicateSupport:s=>s.cm.walkables.push(s.cm.walkables.at(-1)),
 wrongSupport:s=>s.cm.walkables.at(-1).box.max.y=.01,
 rescue:s=>s.cm.walkables.at(-1).rescue=true,
 hiddenSemantic:s=>Object.defineProperty(s.cm.walkables.at(-1),'extra',{value:true}),
 replacedGeometry:s=>s.g.mesh.geometry=s.g.mesh.geometry.clone(),
 replacedRow:s=>s.cm.colliders[s.cm.colliders.length-1]={...s.cm.colliders.at(-1)},
 })){test(`registered whole-ground witness rejects ${name} drift`,t=>{const s=setup(t),b=register(s);t.after(()=>b.dispose());mutate(s);assert.throws(()=>validateWumenJointAscentBinding(s.cm),/Wumen joint/);});}
