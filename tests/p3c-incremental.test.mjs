import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CharacterWorkQueue } from '../src/scene/characters/CharacterWorkQueue.js';
import { CharacterWorldAdapter } from '../src/scene/characters/CharacterWorldAdapter.js';

test('cooperative queue stops on elapsed time and leaves incomplete work unpublished',async()=>{
 let time=0,finished=false; const q=new CharacterWorkQueue({now:()=>time});
 function* work(){for(let i=0;i<20;i++){time+=.25;yield {kind:'test',workUnits:1,maxWorkUnits:1};}return 42;}
 const p=q.request('one',work,{version:'v1'}).then(v=>{finished=true;return v;});
 const a=q.advance({budgetMs:1,version:'v1'});assert.equal(a.steps,4);assert.equal(a.elapsedMs,1);assert.equal(finished,false);assert.equal(q.snapshot().pending,1);
 while(q.snapshot().pending)q.advance({budgetMs:1,version:'v1'});
 assert.equal(await p,42);assert.equal(q.snapshot().maxStepWorkUnits,1);
});
test('queue deduplicates and cancels stale versions without publishing partial work',async()=>{
 const q=new CharacterWorkQueue();let cleaned=false;
 function* work(){try{yield {kind:'test',workUnits:1,maxWorkUnits:1};return {status:'ready'};}finally{cleaned=true;}}
 const a=q.request('one',work,{version:'old'});assert.equal(q.request('one',work,{version:'old'}),a);
 q.advance({budgetMs:10,maxSteps:1,version:'old'});q.advance({budgetMs:10,version:'new'});
 assert.equal((await a).status,'pending');assert.equal(cleaned,true);assert.equal(q.snapshot().pending,0);
});
function fixture(){
 const scene=new THREE.Scene(),floor=new THREE.Mesh(new THREE.BoxGeometry(20,.2,20,80,1,80),new THREE.MeshBasicMaterial());floor.position.y=-.1;scene.add(floor);
 const registry={anchors:[{id:'a',zoneRef:'static',resolver:'world',positionMeters:[0,0,0],rotationYRad:0}],surfaces:[{id:'floor',zoneRef:'static',anchorRef:'a',kind:'ground',localBoundsMeters:[-10,10,-10,10],expectedHeightMeters:0,heightToleranceMeters:.03}],seats:[],paths:[{id:'path',zoneRef:'static',anchorRef:'a',surfaceRef:'floor',pointsLocalMeters:[[0,0,0],[0,0,4]],radiusMeters:.3,safetyMarginMeters:.1,validationSpacingMeters:.25}]};
 const actor={id:'actor',templateId:'guard-duty',zoneRef:'static',placement:{mode:'path',pathRef:'path',surfaceRef:'floor'},behavior:{basePose:'standing'}};
 return {scene,registry,actor,collisionManager:{colliders:[],walkables:[],checkRiverCrossing:()=>true,checkBoundary:()=>true}};
}
test('async world validation yields within one route, then matches its synchronous oracle',async()=>{
 const f=fixture(),a=new CharacterWorldAdapter(f),reference=a.resolve(f.actor);a.invalidate();let complete=false;
 const p=a.request(f.actor,()=>({})).then(v=>{complete=true;return v});
 a.advance({budgetMs:100,maxSteps:1});await Promise.resolve();assert.equal(complete,false);assert.equal(a.cache.size,0);
 let frames=0;while(a.work.snapshot().pending){a.advance({budgetMs:.25,maxSteps:100});if(++frames>50000)throw Error('queue did not finish');}
 const result=await p;assert.equal(result.status,'ready');assert.deepEqual(result.position,reference.position);assert.deepEqual(result.path.samples,reference.path.samples);assert.ok(frames>1);assert.ok(a.work.snapshot().maxStepWorkUnits<=256);
});
test('an invalidated in-flight route cannot publish old floor evidence',async()=>{
 const f=fixture(),a=new CharacterWorldAdapter(f),p=a.request(f.actor,()=>({}));a.advance({budgetMs:100,maxSteps:2});
 f.scene.clear();a.invalidate();assert.equal((await p).status,'pending');const p2=a.request(f.actor,()=>({}));
 while(a.work.snapshot().pending)a.advance({budgetMs:5});assert.notEqual((await p2).status,'ready');assert.equal(a.cache.size,0);assert.equal(a.pathCache.size,0);
});
test('actual flat-layer geometry is tried before cheaper empty envelope geometry',()=>{
 const scene=new THREE.Scene(),floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20,32,32),new THREE.MeshBasicMaterial());floor.rotation.x=-Math.PI/2;scene.add(floor);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-2,.001,-1,-2,-.001,1,-1,0,0,2,.001,-1,1,0,0,2,-.001,1],3));const empty=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));scene.add(empty);
 const a=new CharacterWorldAdapter({scene}),r=a.supportAt([0,0,0],0,.03,{renderedOnly:true});assert.equal(r.status,'ready');assert.equal(a.stats.raycastMeshTests,1,'still raycast real flat geometry, not its box or cheaper empty envelopes');
});
