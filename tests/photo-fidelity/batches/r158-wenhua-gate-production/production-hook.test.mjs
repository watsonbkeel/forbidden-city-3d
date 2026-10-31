// No proposed-hook loader, fixture builder rewriting, or finalizer injection.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const repo=path.resolve(process.env.WENHUA_PRODUCTION_REPO??new URL('../../../../',import.meta.url).pathname),url=p=>pathToFileURL(path.join(repo,p));
await import(url('tests/lib/inner-palace-fixture.mjs'));
const {realTextureLibrary}=await import(url('tests/lib/r48-real-texture-library.mjs'));
const {CourtKit}=await import(url('src/scene/palace/kit.js'));
const {buildSouthCourtGate}=await import(url('src/scene/palace/special/SouthCourtGates.js'));
const {CollisionManager}=await import(url('src/utils/Collision.js'));
test('real production SouthCourtGates installs source-owned approaches once and preserves the existing incomplete window status',()=>{
 const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-east');let merged;
 try{const item=JSON.parse(fs.readFileSync(url('data/zones/outer-east.json'))).items.find(i=>i.southGateProfile==='wenhua');const {f,g}=buildSouthCourtGate(kit,item);
 assert.ok(g.wenhuaGateApproaches,'actual producer must install the Wenhua approach hook');
 assert.equal(g.wenhuaGateApproaches.accepted,false);assert.equal(g.wenhuaGateApproaches.status,'VERIFY_PENDING');assert.equal(g.wenhuaSouthWindow.majorDivisions.fineGridModeled,false);
 const owned=kit.colliders.filter(c=>c.wenhuaGateApproach);assert.equal(owned.length,3);assert.equal(kit.colliders.length,30);assert.equal(kit.walkables.length,1);assert.equal(kit.walkables[0].type,'box');
 assert.equal(g.wenhuaGateApproaches.cleanup.attempted,42);assert.equal(g.wenhuaGateApproaches.cleanup.failed,0);
 let parts=0;f.traverse(m=>{if(m.isMesh&&m.userData.wenhuaGateApproach)parts++;});assert.ok(parts>60);
 merged=kit.finish();merged.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
 assert.equal(cm.colliders.filter(c=>c.mesh.wenhuaGateApproach).length,3);assert.equal(cm.colliders.filter(c=>c.xiqingRoofSurface?.id?.startsWith('wenhua-gate-approach-')).length,2);
 assert.equal(cm.colliders.filter(c=>c.furnitureMotionScope?.kind==='wenhua-gate-approaches').length,1);
 }finally{kit.dispose(merged??kit.root);lib.dispose();}
});

test('real producer equals reviewed isolated target and leaves the Wuying producer exactly unchanged',async()=>{
 // Explicitly disable the proposal loader. The isolated fixture alone strips
 // the hook and applies the already-reviewed finalizer; production stays raw.
 process.env.WENHUA_SHARED_HOOKS='off';
 const {fixture,dispose,row,meshes,hash}=await import('../r158-wenhua-gate/fixture.mjs');
 const signature=f=>({meshes:meshes(f.frame).map(row),groups:(()=>{const a=[];f.frame.traverse(o=>{a.push({type:o.type,position:o.position.toArray(),rotation:o.rotation.toArray(),scale:o.scale.toArray(),visible:o.visible,layers:o.layers.mask,renderOrder:o.renderOrder,matrixAutoUpdate:o.matrixAutoUpdate,userData:o.userData});});return a;})(),colliders:f.kit.colliders,walkables:f.kit.walkables,rooms:f.kit.rooms,regions:f.kit.regions,mapItems:f.kit.mapItems});
 for(const profile of ['wenhua','wuying']){const isolated=fixture(profile==='wenhua',profile),zone=profile==='wenhua'?'outer-east':'outer-west',lib=realTextureLibrary(),kit=new CourtKit(lib,zone);try{const item=JSON.parse(fs.readFileSync(url(`data/zones/${zone}.json`))).items.find(i=>i.southGateProfile===profile),{f:frame,g}=buildSouthCourtGate(kit,item),actual={kit,frame,g};frame.updateMatrixWorld(true);assert.equal(hash(signature(actual)),hash(signature(isolated)),profile+' exact geometry, metadata, group state, material names and physical records');const expected=hash(signature(actual));frame.visible=false;assert.notEqual(hash(signature(actual)),expected,'real hidden owner must be detected');frame.visible=true;const m=meshes(frame)[0];m.position.x+=.001;assert.notEqual(hash(signature(actual)),expected,'real geometry pose drift must be detected');}finally{kit.dispose(kit.root);lib.dispose();dispose(isolated);}}
});
