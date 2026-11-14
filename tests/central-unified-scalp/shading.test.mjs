import test from 'node:test';import assert from 'node:assert/strict';
test('implicit surface normals come from same smooth field gradient',async()=>{
 const {createSmoothBuddhaBody}=await import('../../src/scene/palace/special/SmoothBuddhaBody.js');const g=createSmoothBuddhaBody([{center:[0,0,0],radii:[.3,.3,.3]}],{step:.04});assert.equal(g.userData.bodyField.normalMethod,'SAME_FIELD_CENTRAL_GRADIENT');const p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<p.count;i++){const dot=p.getX(i)*n.getX(i)+p.getY(i)*n.getY(i)+p.getZ(i)*n.getZ(i);assert.ok(dot>.295);assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-6);}g.dispose();
});
import * as T from 'three';
test('art blend is zero on shared gold boundary and rises inside without moving geometry',async()=>{
 const m=await import('../../src/scene/palace/special/StudyArtBlend.js').catch(()=>null);assert.ok(m?.prepareStudyArtBlend,'material transition missing');const g=new T.PlaneGeometry(1,1,8,8),before=g.attributes.position.array.slice();g.clearGroups();g.addGroup(0,g.index.count/2,0);g.addGroup(g.index.count/2,g.index.count/2,1);m.prepareStudyArtBlend(g);
 const a=g.attributes.studyArtBlend;assert.ok([...a.array].some(v=>v===0));assert.ok([...a.array].some(v=>v>.99));assert.ok([...a.array].every(v=>v>=0&&v<=1));assert.deepEqual(g.attributes.position.array,before);
 const material=m.createStudyArtMaterial(null),shader={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>',fragmentShader:'#include <common>\n#include <map_fragment>'};material.onBeforeCompile(shader);assert.ok(shader.fragmentShader.includes('mix(studyGold'));assert.ok(shader.vertexShader.includes('vStudyArtBlend=studyArtBlend'));material.dispose();g.dispose();
});
test('main sample uses art transition and a five-point real core contact footprint',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import('../../src/scene/palace/special/CentralBuddhaVolumeStudy.js'),{createSmoothBuddhaBody}=await import('../../src/scene/palace/special/SmoothBuddhaBody.js'),{createEightTierLotus}=await import('../../src/scene/palace/special/EightTierLotus.js');const r=createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)});assert.ok(r.mesh.geometry.attributes.studyArtBlend);const body=createSmoothBuddhaBody(r.meta.parts.filter(p=>r.meta.bodyField.unionParts.includes(p.name))),lotus=createEightTierLotus();lotus.scale(1,.81/lotus.boundingBox.max.y,1);
 const material=new T.MeshBasicMaterial({side:T.DoubleSide}),bm=new T.Mesh(body,material),lm=new T.Mesh(lotus,[material,material,material]);bm.updateMatrixWorld();lm.updateMatrixWorld();for(const x of [0,-.2,.2,-.4,.4]){const seat=new T.Raycaster(new T.Vector3(x,1,.08),new T.Vector3(0,-1,0)).intersectObject(lm).find(h=>h.face.materialIndex===0),bottom=new T.Raycaster(new T.Vector3(x,.5,.08),new T.Vector3(0,1,0)).intersectObject(bm)[0];assert.ok(seat&&bottom);assert.ok(bottom.point.y<=seat.point.y,`body floating at x=${x}`);assert.ok(seat.point.y-bottom.point.y<.04);}
 body.dispose();lotus.dispose();material.dispose();r.dispose();
});
