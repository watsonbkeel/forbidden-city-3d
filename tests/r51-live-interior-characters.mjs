// Diagnostic only: actual production System, Manager, Renderer and InteriorLoader.
// CPU frustum and exact deformed-geometry rays, not WebGL pixels or GPU acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks,createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {exportProductionView} from './lib/r51-production-raster.mjs';
const root=new URL('../',import.meta.url);
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
globalThis.document={hidden:false,addEventListener(){},removeEventListener(){},createElement:type=>type==='canvas'?createCanvas(1,1):{},createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');hook.deregister();
const {PalaceBuilder}=await import('../src/scene/PalaceBuilder.js');
const {PALACE_LAYOUT}=await import('../src/scene/Layout.js');
const {library}=await import('./lib/inner-palace-fixture.mjs');
const {CollisionManager}=await import('../src/utils/Collision.js');
const {CHARACTER_REGISTRY}=await import('../data/characters/index.js');
const {CharacterSystem}=await import('../src/scene/characters/CharacterSystem.js');
const {characterProjection}=await import('../src/scene/characters/CharacterLOD.js');
const {deformCharacterVertex}=await import('../src/scene/characters/CharacterAnimation.js');
const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
const {cpuDracoLoader}=await import('./lib/cpu-draco.mjs');
const cfg=JSON.parse(fs.readFileSync(new URL('data/interiors/taihe.json',root)));
const scene=new T.Scene(),builder=new PalaceBuilder(scene,library()),cm=new CollisionManager();
// All three halls are required to reproduce the production shared terrace datum.
// Building only Taihe incorrectly produces an 8m floor instead of 9.9375m.
builder.buildAll(PALACE_LAYOUT.filter(p=>['太和殿','中和殿','保和殿'].includes(p.name)));
cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);scene.updateMatrixWorld(true);
const loader=new InteriorLoader(scene,cm,{registry:{taihe:cfg}});
const camera=new T.PerspectiveCamera(75,16/9,.1,1600);
const system=new CharacterSystem({scene,camera,collisionManager:cm,interiors:loader});
assert.equal(system.validation.valid,true);
const actor=CHARACTER_REGISTRY.actors.find(a=>a.templateId==='emperor-ceremonial');
const b=fs.readFileSync(new URL('public'+cfg.model,root));
assert.equal(createHash('sha256').update(b).digest('hex'),cfg.asset.sha256);
const report={proofBoundary:'CPU actual production classes and exact triangle rays, not browser/WebGL pixels, GPU or texture acceptance.',scope:'All 38 registry entries retained. Only actual shared three-hall architecture built; unrelated actors can remain unsupported. No pre-resolved or seeded binding, no stubbed CharacterSystem/Manager/Renderer/WorldAdapter. GLTF network transport replaced by parsing exact shipped GLB bytes; InteriorLoader placement/validation/visibility/load/unload are unmodified.',sourceHashes:Object.fromEntries(['src/scene/characters/CharacterSystem.js','src/scene/characters/CharacterManager.js','src/scene/characters/CharacterRenderer.js','src/scene/characters/CharacterWorldAdapter.js','src/scene/interior/InteriorLoader.js','public'+cfg.model].map(p=>[p,createHash('sha256').update(fs.readFileSync(new URL(p,root))).digest('hex')])),rows:[]};
function aim(x,z){camera.position.set(x,cm.getGroundHeight(x,z,Infinity)+1.7,z);camera.lookAt(0,13.15,9.01);camera.updateMatrixWorld(true);}
async function advanceUntilEmperor(){for(let frame=0;frame<10000;frame++){system.update(1/60,{daylight:1,quality:'high',viewportHeight:1080});await Promise.resolve();const state=system.manager.states.get(actor.id),batch=[...system.renderer.batches.values()].find(b=>b.mesh.name.startsWith('characters:emperor-ceremonial|'));if(batch&&batch.mesh.count===1&&state.readiness===1)return frame+1;if(system.lastError)throw Error(system.lastError);}throw Error('Emperor did not reach an actual instance within bounded 10000 frames');}
function deformedInstance(batch){
 const source=batch.mesh.geometry,g=source.clone(),a=g.attributes,time=system.renderer.timeUniform.value,anim=source.attributes.characterAnim;
 const state={time,phase:anim.getX(0),amplitude:anim.getY(0),walkSpeed:anim.getZ(0),poseIndex:anim.getW(0)};
 for(let i=0;i<a.position.count;i++){
  const d=deformCharacterVertex([a.position.getX(i),a.position.getY(i),a.position.getZ(i)],[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],{part:a.characterPart.getX(i),pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)},state);
  a.position.setXYZ(i,...d.position);a.normal.setXYZ(i,...d.normal);
 }
 g.computeBoundingBox();g.computeBoundingSphere();const mesh=new T.Mesh(g,system.renderer.material);batch.mesh.getMatrixAt(0,mesh.matrix);mesh.matrix.premultiply(batch.mesh.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.updateMatrixWorld(true);return mesh;
}
function raysFor(batch){
 scene.updateMatrixWorld(true);const target=deformedInstance(batch),g=target.geometry,p=g.attributes.position,index=g.index,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),normal=new T.Vector3(),center=new T.Vector3(),front=[];
 for(let k=0;k<(index?.count??p.count);k+=3){a.fromBufferAttribute(p,index?index.getX(k):k);b.fromBufferAttribute(p,index?index.getX(k+1):k+1);c.fromBufferAttribute(p,index?index.getX(k+2):k+2);normal.subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();if(normal.z<.3)continue;center.copy(a).add(b).add(c).multiplyScalar(1/3);front.push({triangle:k/3,point:center.clone()});}
 const architectural=[];scene.traverse(o=>{if(!o.isMesh||o.userData.characterBatch)return;for(let p=o;p;p=p.parent)if(!p.visible)return;architectural.push(o);});
 const ray=new T.Raycaster(),hits=[];
 for(const fraction of [.25,.55,.85])for(const x of [-.12,0,.12]){const y=g.boundingBox.min.y+fraction*(g.boundingBox.max.y-g.boundingBox.min.y),chosen=front.reduce((best,v)=>{const score=(v.point.y-y)**2+(v.point.x-x)**2+.01*(g.boundingBox.max.z-v.point.z)**2;return !best||score<best.score?{...v,score}:best;},null),point=target.localToWorld(chosen.point.clone()),delta=point.clone().sub(camera.position);ray.set(camera.position,delta.clone().normalize());ray.near=.001;ray.far=delta.length()+.01;const own=ray.intersectObject(target,false)[0],all=ray.intersectObjects([...architectural,target],false),first=all[0];assert.ok(own,'actual target triangle intersected');hits.push({fraction,x,triangle:chosen.triangle,target:point.toArray(),visible:first?.object===target,first:first?{name:first.object===target?'emperor-instance':first.object.name,material:first.object.material?.name,distance:first.distance,point:first.point.toArray()}:null});}
 const result={visible:hits.filter(h=>h.visible).length,total:hits.length,hits};target.geometry.dispose();return result;
}
async function sample(label,x,z){
 aim(x,z);const frames=await advanceUntilEmperor();const state=system.manager.states.get(actor.id),batch=[...system.renderer.batches.values()].find(b=>b.mesh.name.startsWith('characters:emperor-ceremonial|'));
 const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 const shader={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};system.renderer.material.onBeforeCompile(shader);
 const row={label,interiorState:loader.getState('taihe'),interiorPosition:loader.getGroup('taihe')?.position.toArray(),floor:cm.getGroundHeight(0,0,Infinity),frames,camera:camera.position.toArray(),cameraCollision:cm.checkCollision(camera.position,.5),position:state.binding.position,lod:state.lod,projection:characterProjection(state.binding.position,camera,1080),instanceCount:batch.mesh.count,batchBoundsInFrustum:frustum.intersectsObject(batch.mesh),visibility:batch.mesh.geometry.attributes.characterVisibility.getX(0),shaderVisibilityAttributePresent:shader.vertexShader.includes('attribute float characterVisibility;'),shaderDiscardPresent:shader.fragmentShader.includes('if(vCharacterVisibility <= ct) discard;'),rays:raysFor(batch),systemStatus:system.statusSnapshot(),work:system.world.work.snapshot()};
 if(['S-door','S-near','Chuxiu-west-next-room'].includes(label)){
  fs.mkdirSync('/tmp/r51-live-role-geometry',{recursive:true});
  row.geometryExport=exportProductionView({scene,camera,characters:system},`/tmp/r51-live-role-geometry/${label}.json.gz`,{far:60});
 }
 report.rows.push(row);console.log(JSON.stringify({label,frames,camera:row.camera,cameraCollision:row.cameraCollision,lod:row.lod,instanceCount:row.instanceCount,batchBoundsInFrustum:row.batchBoundsInFrustum,visibility:row.visibility,visibleRayTargets:row.rays.visible,blockers:[...new Set(row.rays.hits.filter(h=>!h.visible).map(h=>h.first?.name))]}));
 assert.equal(row.cameraCollision,false);assert.equal(row.instanceCount,1);assert.equal(row.batchBoundsInFrustum,true);assert.equal(row.visibility,1);return row;
}
try{
 await sample('B-door',0,-19);
 const before=await sample('B-near',0,0);assert.ok(before.rays.visible>0);
 const decoder=new GLTFLoader().setDRACOLoader(await cpuDracoLoader()),parsed=await decoder.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'');
 let deliver;loader.gltf.load=(_u,ok)=>{deliver=ok;};const loading=loader.load('taihe');assert.equal(loader.getState('taihe'),'loading');
 await sample('B-while-S-loading',0,-19);deliver(parsed);assert.equal(await loading,true);
 await sample('S-door',0,-19);
 const after=await sample('S-near',0,0);assert.ok(after.rays.visible>0);assert.deepEqual(before.position,after.position);
 loader.unload('taihe');await sample('B-restored-near',0,0);
}finally{
 const out=new URL('reports/r51-visibility/live-interior-characters.json',root);fs.mkdirSync(new URL('.',out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');system.dispose();loader.dispose();builder.dispose();
}
