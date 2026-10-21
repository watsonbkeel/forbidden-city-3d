import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {registerHooks} from 'node:module';import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
import {allMeshes,taiheHall,taiheAsset,taiheConfig as cfg} from './lib/r34-interior-fixture.mjs';
const hook=registerHooks({load(url,c,next){if(url.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(url),'utf8'),shortCircuit:true};return next(url,c);}});
const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');const{CollisionManager}=await import('../src/utils/Collision.js');
function displayBounds(root,floor){root.updateMatrixWorld(true);const points=[];for(const m of allMeshes(root)){const p=m.geometry.attributes.position,index=m.geometry.index;for(let k=0;k<(index?.count??p.count);k++){const i=index?index.getX(k):k,q=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(Math.abs(q.x)<3.64&&q.y-floor<7&&q.z>0)points.push(q);}}return new T.Box3().setFromPoints(points);}
test('native and S display footprints align with moved steps and retain exact geometry budgets',async()=>{
 const{builder,group}=taiheHall(),fine=await taiheAsset();try{const b=new T.Group();for(const m of allMeshes(group).filter(m=>m.userData.taiheCoreOwner))b.add(m.clone());const bb=displayBounds(b,P.frame.floorY),ss=displayBounds(fine,0);
 for(const side of['min','max'])for(const axis of['x','z'])assert.ok(Math.abs(bb[side][axis]-ss[side][axis])<.04,`${side}.${axis}`);
 assert.ok(Math.abs(ss.min.z-2.1025)<.03);assert.ok(Math.abs(ss.max.z-12.08)<.001);
 assert.equal(allMeshes(b).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),1600);
 assert.equal(allMeshes(fine).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),17924);
 }finally{for(const m of allMeshes(fine)){m.geometry.dispose();m.material.dispose();}builder.dispose();}
});
test('actual loader toggles one R34 core while permanent navigation stays invariant through success, failure, cancellation and disposal',async()=>{
 const{builder,group}=taiheHall(),scene=builder.scene,cm=new CollisionManager();cm.addColliders(builder.colliders,'permanent');cm.addWalkables(builder.walkables,'permanent');cm.addWalkable({type:'box',box:new T.Box3(new T.Vector3(-31.5,P.frame.floorY,-18.5),new T.Vector3(31.5,P.frame.floorY,18.5))},'floor');
 const loader=new InteriorLoader(scene,cm,{registry:{taihe:cfg}}),fallback=allMeshes(group).filter(m=>m.userData.taiheCoreOwner),snapshot=()=>JSON.stringify({c:cm.colliders.map(c=>c.box),w:cm.walkables}),before=snapshot();
 const owned=new Map();for(const m of allMeshes(group))for(const resource of[m.geometry,m.material])if(!owned.has(resource)){owned.set(resource,0);resource.addEventListener('dispose',()=>owned.set(resource,owned.get(resource)+1));}
 const check=loaded=>{assert.ok(fallback.every(m=>m.visible===!loaded));assert.equal(loader.getGroup('taihe')?.visible??false,loaded);assert.equal(snapshot(),before);};
 try{for(let i=0;i<2;i++){loader.gltf.load=async(_u,ok)=>ok({scene:await taiheAsset()});assert.equal(await loader.load('taihe'),true);check(true);const bb=displayBounds(loader.getGroup('taihe'),P.frame.floorY);assert.ok(Math.abs(bb.max.z-12.08)<.001);loader.unload('taihe');check(false);}
 const bad=await taiheAsset();bad.getObjectByName('TAIHE_CORE_CONTRACT').userData.spatialFitDeltaZ=-1;loader.gltf.load=(_u,ok)=>ok({scene:bad});const warn=console.warn;console.warn=()=>{};try{assert.equal(await loader.load('taihe'),false);}finally{console.warn=warn;}check(false);loader.unload('taihe');
 let finish;loader.gltf.load=(_u,ok)=>{finish=ok;};const pending=loader.load('taihe');loader.unload('taihe');finish({scene:await taiheAsset()});assert.equal(await pending,false);check(false);
 loader.gltf.load=async(_u,ok)=>ok({scene:await taiheAsset()});assert.equal(await loader.load('taihe'),true);check(true);
 assert.ok([...owned.values()].every(n=>n===0),'loader never disposes permanent core');
 }finally{loader.dispose();builder.dispose();}
 assert.ok([...owned.values()].every(n=>n===1),'each owned geometry/material disposed once');
});
