import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from './lib/r158-arrow-south-lattice-fixture.mjs';
import {applyArrowSouthDoorLattice} from '../src/scene/palace/special/ArrowSouthDoorLattice.js';
import {arrowKneeSnapshot,meshes} from './lib/r59-arrow-knees-qa.mjs';
import {assertArrowSouthDoorLatticeInWorld} from './lib/r158-arrow-south-lattice-world-check.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const roles=['arrow-south-secondary-diagonal-lattice','arrow-south-secondary-dark-infill'];
const target=m=>m.userData.role==='arrow-plain-lattice'&&Math.abs(m.position.z+6.8)<1e-7&&Math.abs(m.position.x)>2.75&&Math.abs(m.position.x)<8.25;
const snapshot=f=>({actual:arrowKneeSnapshot(f,false),children:[...f.frame.children],owned:[...f.kit.owned],ownedArray:f.kit.owned,childrenArray:f.frame.children,userData:structuredClone(f.frame.userData)});
function exactRollback(f,b){assert.deepEqual(arrowKneeSnapshot(f,false),b.actual);assert.equal(f.frame.children,b.childrenArray);assert.equal(f.kit.owned,b.ownedArray);assert.deepEqual(f.frame.children,b.children);assert.deepEqual(f.kit.owned,b.owned);assert.deepEqual(f.frame.userData,b.userData);assert.ok(b.children.every(m=>m.parent===f.frame));assert.equal(meshes(f.frame).filter(m=>roles.includes(m.userData.role)).length,0);assert.equal(meshes(f.frame).filter(target).length,64);}

for(const fault of['owned-before','owned-after-first','owned-after-both','add-before','add-after-first','add-after-all','removed-first','removed-last'])test(`lattice commit ${fault} rolls back exact live objects/owners, disposes every staged resource once, then retries without duplicate infill`,()=>{
 const f=fixture(),old=meshes(f.frame).filter(target),b=snapshot(f),oldDisposals=new Map(old.map(m=>[m.geometry,0])),watch=new Map(),capture=[];
 const monitor=o=>{if(watch.has(o))return;watch.set(o,0);o.addEventListener('dispose',()=>watch.set(o,watch.get(o)+1));};
 for(const m of old)m.geometry.addEventListener('dispose',()=>oldDisposals.set(m.geometry,oldDisposals.get(m.geometry)+1));
 const gold=f.kit.gold;let goldDisposals=0;gold.addEventListener('dispose',()=>goldDisposals++);
 const update=THREE.Mesh.prototype.updateMorphTargets;
 THREE.Mesh.prototype.updateMorphTargets=function(...args){const r=update.apply(this,args);if(this.material?.name?.startsWith('arrow_south_secondary_')){capture.push(this);monitor(this.geometry);monitor(this.material);}return r;};
 const originalAdd=f.frame.add;let listener,watched;
 const restoreFault=()=>{delete f.frame.add;delete f.kit.owned.push;if(listener)watched.removeEventListener('removed',listener);};
 let merged;
 try{
  if(fault.startsWith('owned-'))f.kit.owned.push=function(...args){if(fault==='owned-after-first')Array.prototype.push.call(this,args[0]);if(fault==='owned-after-both')Array.prototype.push.apply(this,args);throw Error('injected '+fault);};
  if(fault.startsWith('add-'))f.frame.add=function(...args){if(fault==='add-after-first')originalAdd.call(this,args[0]);if(fault==='add-after-all')originalAdd.apply(this,args);throw Error('injected '+fault);};
  if(fault.startsWith('removed-')){watched=fault==='removed-first'?old[0]:old.at(-1);listener=()=>{throw Error('injected '+fault);};watched.addEventListener('removed',listener);}
  assert.throws(()=>applyArrowSouthDoorLattice(f.kit,f.frame,f.item),new RegExp('injected '+fault));restoreFault();exactRollback(f,b);assert.ok([...oldDisposals.values()].every(n=>n===0),'no retained source geometry was disposed before successful commit');assert.equal(goldDisposals,0);
  const failed=[...capture];assert.equal(failed.length,16,'all sixteen real offline staged meshes were observed');assert.equal(new Set(failed.map(m=>m.geometry)).size,16);assert.equal(new Set(failed.map(m=>m.material)).size,2);assert.ok(failed.every(m=>m.parent===null),'failed staged meshes are fully detached');for(const m of failed){assert.equal(watch.get(m.geometry),1);assert.equal(watch.get(m.material),1);assert.ok(!f.kit.owned.includes(m.material));}
  capture.length=0;applyArrowSouthDoorLattice(f.kit,f.frame,f.item);const retried=[...capture];assert.equal(retried.length,16);assert.equal(meshes(f.frame).filter(m=>m.userData.role===roles[0]).length,8);assert.equal(meshes(f.frame).filter(m=>m.userData.role===roles[1]).length,8);assert.equal(meshes(f.frame).filter(target).length,0);assert.ok([...oldDisposals.values()].every(n=>n===1));for(const m of retried){assert.equal(watch.get(m.geometry),0);assert.equal(watch.get(m.material),0);assert.equal(f.kit.owned.filter(x=>x===m.material).length,1);}
  THREE.Mesh.prototype.updateMorphTargets=update;const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);merged=f.kit.finish();for(const m of meshes(merged).filter(m=>m.material?.name?.startsWith('arrow_south_secondary_')))monitor(m.geometry);const scene=new THREE.Scene();scene.add(merged);assert.equal(assertArrowSouthDoorLatticeInWorld({scene,cm}).infillTriangles,96);f.kit.dispose(merged);merged=null;for(const n of watch.values())assert.equal(n,1,'failed and retried source/merged geometry and private materials each dispose once');assert.ok([...oldDisposals.values()].every(n=>n===1));assert.equal(goldDisposals,1);
 }finally{restoreFault();THREE.Mesh.prototype.updateMorphTargets=update;if(merged)f.kit.dispose(merged);else if(goldDisposals===0)f.dispose();}
});

for(const frozen of['owned','children'])test(`frozen ${frozen} array rejects before offline stage or any live mutation`,()=>{
 const f=fixture(),b=snapshot(f);let created=0;const update=THREE.Mesh.prototype.updateMorphTargets;THREE.Mesh.prototype.updateMorphTargets=function(...args){const r=update.apply(this,args);if(this.material?.name?.startsWith('arrow_south_secondary_'))created++;return r;};
 try{Object.freeze(frozen==='owned'?f.kit.owned:f.frame.children);assert.throws(()=>applyArrowSouthDoorLattice(f.kit,f.frame,f.item),/mutable child and ownership arrays/);exactRollback(f,b);assert.equal(created,0);}finally{THREE.Mesh.prototype.updateMorphTargets=update;f.dispose();}
});

test('rollback cleanup attempts every staged resource if one disposal listener also throws, while retaining the initiating commit error',()=>{
 const f=fixture(),b=snapshot(f),watch=new Map(),staged=[],update=THREE.Mesh.prototype.updateMorphTargets;
 const track=o=>{if(watch.has(o))return;watch.set(o,0);o.addEventListener('dispose',()=>watch.set(o,watch.get(o)+1));};
 THREE.Mesh.prototype.updateMorphTargets=function(...args){const r=update.apply(this,args);if(this.material?.name?.startsWith('arrow_south_secondary_')){staged.push(this);track(this.geometry);track(this.material);if(staged.length===1)this.material.addEventListener('dispose',()=>{throw Error('injected cleanup listener');});}return r;};
 f.kit.owned.push=function(){throw Error('initiating ownership failure');};
 try{assert.throws(()=>applyArrowSouthDoorLattice(f.kit,f.frame,f.item),error=>error instanceof AggregateError&&error.cause.message==='initiating ownership failure'&&error.errors.some(e=>e.message==='injected cleanup listener'));delete f.kit.owned.push;exactRollback(f,b);assert.equal(staged.length,16);assert.equal(watch.size,18);for(const n of watch.values())assert.equal(n,1);assert.ok(staged.every(m=>m.parent===null));}finally{delete f.kit.owned.push;THREE.Mesh.prototype.updateMorphTargets=update;f.dispose();}
});

test('a temporary strip disposal failure releases every allocated offline geometry once before any host or ownership mutation',()=>{
 const f=fixture(),b=snapshot(f),created=new Set(),disposed=new Map(),set=THREE.BufferGeometry.prototype.setAttribute,dispose=THREE.BufferGeometry.prototype.dispose;let injected=false;
 THREE.BufferGeometry.prototype.setAttribute=function(...args){created.add(this);return set.apply(this,args);};
 THREE.BufferGeometry.prototype.dispose=function(...args){disposed.set(this,(disposed.get(this)??0)+1);const r=dispose.apply(this,args);if(!injected&&this.type==='ExtrudeGeometry'){injected=true;throw Error('injected temporary strip cleanup');}return r;};
 try{assert.throws(()=>applyArrowSouthDoorLattice(f.kit,f.frame,f.item),/temporary strip cleanup/);exactRollback(f,b);assert.ok(created.size>10);assert.ok([...created].every(g=>disposed.get(g)===1),'all temporary strips and their merged offline result release exactly once');}finally{THREE.BufferGeometry.prototype.setAttribute=set;THREE.BufferGeometry.prototype.dispose=dispose;f.dispose();}
});

for(const position of['first','middle','last'])test(`retired ${position} geometry disposal error releases all 64 old resources once and explicitly reports the already committed lattice`,()=>{
 const f=fixture(),old=meshes(f.frame).filter(target),before=snapshot(f),counts=new Map(old.map(m=>[m.geometry,0])),staged=[],watch=new Map(),update=THREE.Mesh.prototype.updateMorphTargets;
 const monitor=o=>{if(watch.has(o))return;watch.set(o,0);o.addEventListener('dispose',()=>watch.set(o,watch.get(o)+1));};
 for(const m of old)m.geometry.addEventListener('dispose',()=>counts.set(m.geometry,counts.get(m.geometry)+1));
 const index=position==='first'?0:position==='middle'?Math.floor(old.length/2):old.length-1;old[index].geometry.addEventListener('dispose',()=>{throw Error('injected retired '+position);});
 THREE.Mesh.prototype.updateMorphTargets=function(...args){const r=update.apply(this,args);if(this.material?.name?.startsWith('arrow_south_secondary_')){staged.push(this);monitor(this.geometry);monitor(this.material);}return r;};
 let merged;
 try{
  let error;try{applyArrowSouthDoorLattice(f.kit,f.frame,f.item);}catch(e){error=e;}
  assert.ok(error instanceof AggregateError,'post-commit cleanup error aggregates notification failures');assert.equal(error.code,'ARROW_LATTICE_COMMITTED_CLEANUP_ERROR');assert.equal(error.committed,true);assert.equal(error.cleanupPhase,'RETIRED_GEOMETRY_AFTER_COMMIT');assert.match(error.message,/committed/);assert.ok(error.errors.some(e=>e.message==='injected retired '+position));assert.equal(error.result.replacedMeshes,64);assert.equal(error.result.addedMeshes,16);assert.equal(error.result.visualAcceptance,'VERIFY_PENDING');
  assert.ok([...counts.values()].every(n=>n===1),'all 64 retired geometries were attempted exactly once despite the throwing listener');assert.ok(old.every(m=>m.parent===null));assert.equal(meshes(f.frame).filter(target).length,0);assert.equal(meshes(f.frame).filter(m=>m.userData.role===roles[0]).length,8);assert.equal(meshes(f.frame).filter(m=>m.userData.role===roles[1]).length,8);assert.equal(staged.length,16);assert.equal(f.kit.owned.length,before.owned.length+2);for(const m of staged){assert.equal(m.parent,f.frame);assert.equal(f.kit.owned.filter(x=>x===m.material).length,1);assert.equal(watch.get(m.geometry),0);assert.equal(watch.get(m.material),0);}
  const committed=arrowKneeSnapshot(f,false),owners=[...f.kit.owned];assert.equal(committed.physics,before.actual.physics);assert.throws(()=>applyArrowSouthDoorLattice(f.kit,f.frame,f.item),/already/);assert.deepEqual(arrowKneeSnapshot(f,false),committed);assert.deepEqual(f.kit.owned,owners);assert.equal(staged.length,16,'retry does not allocate after a committed cleanup error');
  THREE.Mesh.prototype.updateMorphTargets=update;const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);merged=f.kit.finish();for(const m of meshes(merged).filter(m=>m.material?.name?.startsWith('arrow_south_secondary_')))monitor(m.geometry);const scene=new THREE.Scene();scene.add(merged);assert.equal(assertArrowSouthDoorLatticeInWorld({scene,cm}).triangles,1728);f.kit.dispose(merged);merged=null;for(const n of watch.values())assert.equal(n,1);assert.ok([...counts.values()].every(n=>n===1),'normal later teardown never redisposes retired resources');
 }finally{THREE.Mesh.prototype.updateMorphTargets=update;if(merged)f.kit.dispose(merged);else if([...watch.values()].some(n=>n===0))f.dispose();}
});
