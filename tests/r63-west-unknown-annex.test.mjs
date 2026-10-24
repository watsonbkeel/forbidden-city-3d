import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {fixture,indices,policy,snapshot,baselineTargets,meshRow,hash,declarations} from './lib/r63-west-unknown-annex-fixture.mjs';
let api={};try{api=await import('../src/scene/palace/special/WestUnknownAnnexInventory.js')}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e}
const apply=(...args)=>{assert.equal(typeof api.applyWestUnknownAnnexInventory,'function','bounded annex inventory helper must exist');return api.applyWestUnknownAnnexInventory(...args)};
const rows=[];
for(const i of indices)test(`R63 west annex ${i}: exact original furniture and exclusive COL withheld; all shell/floor/navigation retained`,t=>{
 const a=fixture(i),targets=baselineTargets(a),before=snapshot(a.kit),targetRows=targets.map(meshRow),removedDisposals=[],materialDisposals=[];
 assert.equal(targets.length,a.original.w<14?6:8,'frozen legacy generic furniture primitive count');
 const exactRemovalRows=targets.map(m=>{const p=m.position,g=m.geometry.parameters,box=new THREE.Box3(new THREE.Vector3(p.x-g.width/2,p.y-g.height/2,p.z-g.depth/2),new THREE.Vector3(p.x+g.width/2,p.y+g.height/2,p.z+g.depth/2)).applyMatrix4(a.built.f.matrixWorld),matches=before.colliders.filter(row=>row.flat().every((v,j)=>Math.abs(v-[...box.min.toArray(),...box.max.toArray()][j])<1e-8));assert.equal(matches.length,1,'each independently derived primitive has one dedicated before collider');return matches[0]});

 const targetGeometries=new Set(targets.map(m=>m.geometry)),originalDispose=THREE.BufferGeometry.prototype.dispose;t.mock.method(THREE.BufferGeometry.prototype,'dispose',function(){if(targetGeometries.has(this))removedDisposals.push(this);return originalDispose.call(this)});
 for(const m of new Set(targets.map(m=>m.material)))m.addEventListener('dispose',()=>materialDisposals.push(m));
 assert.strictEqual(apply(a.kit,a.ctx,a.built),a.built);const after=snapshot(a.kit);
 assert.deepEqual(after.meshes,before.meshes.filter(r=>!targetRows.some(t=>hash(t)===hash(r))));
 assert.equal(after.colliders.length,before.colliders.length-targets.length);assert.deepEqual(after.colliders,before.colliders.filter(row=>!exactRemovalRows.includes(row)),'all other exact structural colliders retained');
 assert.deepEqual(after.walkables,before.walkables);assert.deepEqual(after.maps,before.maps);assert.deepEqual(after.regions,before.regions);
 for(const k of ['id','name','kind','min','max','floorY','doors','spawns'])assert.deepEqual(after.rooms[0][k],before.rooms[0][k],k);
 assert.deepEqual(after.rooms[0].cover,[]);assert.equal(after.rooms[0].removedCoverCount,before.rooms[0].cover.length);
 for(const record of [a.built.f.userData.structure,after.rooms[0]])for(const[k,v]of Object.entries({inventoryStatus:'UNKNOWN',knownEmpty:false,accepted:false,presetUseStatus:'UNVERIFIED',roomBoundsStatus:'NOT_VALIDATED'}))assert.equal(record[k],v,k);
 assert.equal(removedDisposals.length,targets.length);assert.equal(materialDisposals.length,0);
 assert.throws(()=>apply(a.kit,a.ctx,a.built),/West unknown annex/);
 rows.push({index:i,baselineGeometryHash:hash(before.meshes),baselineNavigationHash:hash({colliders:before.colliders,walkables:before.walkables,rooms:before.rooms,maps:before.maps}),beforeMeshes:before.meshes.length,afterMeshes:after.meshes.length,removedMeshes:targets.length,removedColliders:before.colliders.length-after.colliders.length,removedCover:before.rooms[0].cover.length,legacyKind:before.rooms[0].kind,retainedGeometryHash:hash(after.meshes),room:after.rooms[0]});a.dispose();
});
test('R63 west annex missing policy is a byte-preserving no-op',()=>{const a=fixture(),before=snapshot(a.kit);assert.strictEqual(apply(a.kit,{...a.ctx,item:a.original},a.built),a.built);assert.deepEqual(snapshot(a.kit),before);a.dispose()});
test('R63 west annex permits independent facade additions and preserves their exact geometry and collision',()=>{const a=fixture(),detail=a.kit.mesh(a.built.f,new THREE.BoxGeometry(.12,.2,.3),a.kit.lib.material('wall_red'),0,8,0),before=meshRow(detail);a.kit.col(a.built.f,-.06,7.9,-.15,.06,8.1,.15);const collider=a.kit.colliders.at(-1);apply(a.kit,a.ctx,a.built);assert.deepEqual(meshRow(detail),before);assert.ok(a.kit.colliders.includes(collider));a.dispose()});
test('R63 west annex uses exact global room IDs and shared kit materials with two actual halls',()=>{const a=fixture(3),other=structuredClone(declarations[9]),second=a.z.buildHallBaseline(other),room=a.kit.rooms[1];assert.equal(room.id,1);apply(a.kit,a.ctx,a.built);apply(a.kit,{zoneId:'west-six',itemIndex:9,item:{...other,furnishingPolicy:policy(9)}},second);assert.equal(a.kit.rooms[0].id,0);assert.equal(room.id,1);assert.deepEqual(room.cover,[]);assert.equal(room.furnishingPolicy.target,'west-six/items/9');a.dispose()});
test('R63 west annex overlapping non-target geometry is not selected by bounds',()=>{const a=fixture(),ref=baselineTargets(a)[0],detail=a.kit.mesh(a.built.f,new THREE.BoxGeometry(.1,.1,.1),a.kit.lib.material('source_backed_retained'),...ref.position.toArray());detail.userData={sourceBacked:true};const before=meshRow(detail);apply(a.kit,a.ctx,a.built);assert.deepEqual(meshRow(detail),before);a.dispose()});
const mutations={
 'root transform drift':a=>a.kit.root.position.x=.01,
 'frame rotation drift':a=>a.built.f.rotation.y=.01,
 'frame scale drift':a=>a.built.f.scale.x=1.01,
 'attached root':a=>new THREE.Scene().add(a.kit.root),
 'unsupported known-empty policy':a=>a.item.furnishingPolicy.mode='known-empty',
 'extra policy field':a=>a.item.furnishingPolicy.accepted=true,
 'room id drift':a=>a.kit.rooms[0].id=9,
 'room kind drift':a=>a.kit.rooms[0].kind='bedchamber',
 'room name drift':a=>a.kit.rooms[0].name='invented',
 'room door drift':a=>a.kit.rooms[0].doors[0].x+=.01,
 'room bounds drift':a=>a.kit.rooms[0].min.x+=.01,
 'nonextensible room':a=>Object.preventExtensions(a.kit.rooms[0]),
 'readonly parent':a=>Object.defineProperty(baselineTargets(a)[0],'parent',{writable:false}),
 'custom collider splice':a=>a.kit.colliders.splice=()=>{throw Error('unexpected splice')},
 'custom frame remove':a=>a.built.f.remove=()=>{throw Error('unexpected remove')},
 'custom target dispose':a=>baselineTargets(a)[0].geometry.dispose=()=>{throw Error('unexpected disposal')},
 'target draw range drift':a=>baselineTargets(a)[0].geometry.setDrawRange(0,3),
 'target geometry groups drift':a=>baselineTargets(a)[0].geometry.groups=[],
 'material shader drift':a=>baselineTargets(a)[0].material.onBeforeCompile=()=>{},
 'material opacity drift':a=>baselineTargets(a)[0].material.opacity=.5,
 'target tagged fixed decoration':a=>baselineTargets(a)[0].userData.fixedDecoration=true,
 'borrowed collider as walkable':a=>{const c=a.kit.colliders.find(c=>c.min.y===a.original.ph&&Math.abs(c.max.y-a.original.ph-.85)<1e-8);assert.ok(c);a.kit.walkables.push({type:'box',box:c})},

 'wrong zone':a=>a.ctx.zoneId='east-six',
 'unsupported target':a=>{a.ctx.itemIndex=2;a.item.furnishingPolicy=policy(2)},
 'manual world transform':a=>a.built.f.matrixWorldAutoUpdate=false,
 'mesh render layer drift':a=>baselineTargets(a)[0].layers.set(2),
 'custom mesh renderer':a=>baselineTargets(a)[0].onBeforeRender=()=>{},
 'wrong index':a=>a.ctx.itemIndex=4,
 'wrong policy':a=>a.item.furnishingPolicy.scope='all',
 'declaration drift':a=>a.item.x+=.001,
 'added real name':a=>a.item.name='不应臆造的配殿名',
 'wrong structure identity':a=>a.built.f.userData.structure.id='west-six/another-building',
 'missing original structure storey':a=>delete a.built.f.userData.structure.storeys,
 'duplicate mesh':a=>{const m=baselineTargets(a)[0];a.built.f.add(m.clone())},
 'position corruption':a=>baselineTargets(a)[0].position.x+=.001,
 'vertex corruption':a=>baselineTargets(a)[0].geometry.attributes.position.array[0]+=.001,
 'normal corruption':a=>baselineTargets(a)[0].geometry.attributes.normal.array[0]+=.001,
 'index count corruption':a=>baselineTargets(a)[0].geometry.index.count=3,
 'position count corruption':a=>baselineTargets(a)[0].geometry.attributes.position.count=3,
 'malformed limitations':a=>a.built.f.userData.structure.limitations={},
 'frozen room':a=>Object.freeze(a.kit.rooms[0]),
 'frozen collider array':a=>Object.freeze(a.kit.colliders),
 'frozen frame child array':a=>Object.freeze(a.built.f.children),
 'frozen frame metadata':a=>Object.freeze(a.built.f.userData),
 'uv corruption':a=>baselineTargets(a)[0].geometry.attributes.uv.array[0]+=.001,
 'material corruption':a=>baselineTargets(a)[0].material.roughness=.21,
 'material replacement':a=>baselineTargets(a)[0].material=baselineTargets(a)[0].material.clone(),
 'custom depth material':a=>baselineTargets(a)[0].customDepthMaterial=new THREE.MeshDepthMaterial(),
 'custom distance material':a=>baselineTargets(a)[0].customDistanceMaterial=new THREE.MeshDistanceMaterial(),
 'custom shadow callback':a=>baselineTargets(a)[0].onBeforeShadow=()=>{},
 'throwing mesh removed listener':a=>baselineTargets(a)[0].addEventListener('removed',()=>{throw Error('custom removed listener')}),
 'throwing geometry disposal listener':a=>baselineTargets(a)[0].geometry.addEventListener('dispose',()=>{throw Error('custom disposal listener')}),
 'SkinnedMesh substitution':a=>{const m=baselineTargets(a)[0],skin=new THREE.SkinnedMesh(m.geometry,m.material);skin.position.copy(m.position);skin.castShadow=skin.receiveShadow=true;m.removeFromParent();a.built.f.add(skin)},
 'geometry name drift':a=>baselineTargets(a)[0].geometry.name='attested-furniture',
 'geometry metadata drift':a=>baselineTargets(a)[0].geometry.userData={preserve:true},
 'borrowed vertex payload':a=>{const m=baselineTargets(a)[0],borrow=m.clone();borrow.geometry=m.geometry.clone();borrow.geometry.setAttribute('position',m.geometry.attributes.position);borrow.position.x+=100;a.kit.root.add(borrow)},
 'borrowed geometry':a=>{const m=baselineTargets(a)[0],borrow=m.clone();borrow.position.x+=123;a.kit.root.add(borrow)},
 'missing geometry':a=>baselineTargets(a)[0].removeFromParent(),
 'duplicate frame':a=>a.kit.root.add(a.built.f.clone(false)),
 'room cover drift':a=>a.kit.rooms[0].cover.push({x:0,z:0}),
 'room spawn drift':a=>a.kit.rooms[0].spawns[0].x+=.01,
 'duplicate room':a=>a.kit.rooms.push(structuredClone(a.kit.rooms[0])),
 'duplicate collider':a=>{const m=baselineTargets(a)[0],p=m.position,g=m.geometry.parameters,b=new THREE.Box3(new THREE.Vector3(p.x-g.width/2,p.y-g.height/2,p.z-g.depth/2),new THREE.Vector3(p.x+g.width/2,p.y+g.height/2,p.z+g.depth/2)).applyMatrix4(a.built.f.matrixWorld);const c=a.kit.colliders.find(c=>Math.abs(c.min.x-b.min.x)<1e-8&&Math.abs(c.min.z-b.min.z)<1e-8&&Math.abs(c.min.y-b.min.y)<1e-8);assert.ok(c);a.kit.colliders.push(c.clone())},
 'stale collider with drifted bounds':a=>{const c=a.kit.colliders.find(c=>c.min.y===a.original.ph&&Math.abs(c.max.y-a.original.ph-.85)<1e-8);assert.ok(c);c.min.x+=.001},
};
for(const[name,mutate]of Object.entries(mutations))test(`R63 west annex fail-closed atomically: ${name}`,()=>{const a=fixture();mutate(a);const before=snapshot(a.kit);assert.throws(()=>apply(a.kit,a.ctx,a.built),/West unknown annex/);assert.deepEqual(snapshot(a.kit),before);if(Object.isFrozen(a.kit.colliders))a.kit.colliders=[...a.kit.colliders];a.kit.root.traverse(m=>{if(m.geometry){m.geometry._listeners={};m.geometry.dispose=THREE.BufferGeometry.prototype.dispose}m._listeners={}});if(a.kit.root.parent)a.kit.root.removeFromParent();a.dispose()});
test.after(()=>{fs.mkdirSync('reports/r63-west-unknown-annex',{recursive:true});fs.writeFileSync('reports/r63-west-unknown-annex/local-diff.json',JSON.stringify({scope:'13 actual bounded production constructors. No whole-zone/world/browser construction or historical inventory acceptance.',rows},null,2)+'\n')});
test('R63 west annex removal disposes exclusive geometry once and leaves shared materials to the kit lifecycle',t=>{
 const a=fixture(),targets=baselineTargets(a),owned=new Set(targets.map(m=>m.geometry)),counts=new Map(),materials=new Map();
 const originalDispose=THREE.BufferGeometry.prototype.dispose;
 t.mock.method(THREE.BufferGeometry.prototype,'dispose',function(){if(owned.has(this))counts.set(this,(counts.get(this)??0)+1);return originalDispose.call(this)});
 for(const m of new Set(targets.map(m=>m.material)))m.addEventListener('dispose',()=>materials.set(m,(materials.get(m)??0)+1));
 apply(a.kit,a.ctx,a.built);assert.deepEqual([...counts.values()],targets.map(()=>1));assert.equal(materials.size,0);
 const merged=a.kit.finish();assert.deepEqual([...counts.values()],targets.map(()=>1));assert.equal(materials.size,0);
 a.kit.dispose(merged);assert.deepEqual([...counts.values()],targets.map(()=>1));assert.deepEqual([...materials.values()],[1,1,1]);
});
