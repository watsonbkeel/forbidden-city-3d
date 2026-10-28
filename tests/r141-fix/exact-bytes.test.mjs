import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import{registerTaiheReplacement,revokeTaiheReplacement,taiheReplacementFor}from'../../src/scene/interior/TaiheReplacementOwnership.js';
import{TAIHE_FALLBACK_OWNER}from'../../src/scene/palace/special/TaiheCoreProfile.js';
for(const offset of[0,2])test(`runtime replacement byte proof: odd Uint16 count, offset ${offset}, exact subarray window`,()=>{
 const scene=new T.Scene(),group=new T.Group(),fallback=Array.from({length:8},()=>{const m=new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial());m.userData.taiheCoreOwner=TAIHE_FALLBACK_OWNER;m.visible=false;scene.add(m);return m;});scene.add(group);
 const buffer=new ArrayBuffer(32),indices=new Uint16Array(buffer,offset,3);indices.set([0,1,2]);const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array([0,0,0,1,0,0,0,1,0]),3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array([0,0,1,0,0,1,0,0,1]),3));g.setIndex(new T.BufferAttribute(indices,1));group.add(new T.Mesh(g,new T.MeshBasicMaterial()));
 registerTaiheReplacement(fallback,group,scene);assert.ok(taiheReplacementFor(fallback[0]));
 indices[2]=1;assert.equal(taiheReplacementFor(fallback[0]),null,'last two-byte tail mutation rejected');indices[2]=2;assert.ok(taiheReplacementFor(fallback[0]));
 new Uint8Array(buffer)[31]=99;assert.ok(taiheReplacementFor(fallback[0]),'unrelated bytes outside actual view are not a source');
 g.attributes.position.array[0]=-0;assert.equal(taiheReplacementFor(fallback[0]),null,'raw signed-zero difference rejected');g.attributes.position.array[0]=0;assert.ok(taiheReplacementFor(fallback[0]));
 const other=new T.Scene();assert.throws(()=>registerTaiheReplacement(fallback,group,other),/identity|installed/);
 revokeTaiheReplacement(fallback);assert.equal(taiheReplacementFor(fallback[0]),null);for(const m of fallback){m.geometry.dispose();m.material.dispose();}g.dispose();group.children[0].material.dispose();
});
