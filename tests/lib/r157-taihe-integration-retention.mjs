import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {library} from './inner-palace-fixture.mjs';
const hash=x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const root=new URL('../fixtures/r157-taihe-integration/',import.meta.url);
const source=fs.readFileSync(new URL('terrace-ornaments-055947.txt',root),'utf8');
const provenance=JSON.parse(fs.readFileSync(new URL('provenance.json',root)));
assert.equal(provenance.methodSHA256,'ef633ead27d92963712992e1033b1cf24fc015214948efaa84a74f5a2739644c');
assert.equal(hash(source),provenance.methodSHA256,'historical method fixture is independently pinned');
export const historicalTerraceOrnaments=new Function('THREE',`return class {${source}}.prototype.terraceOrnaments`)(THREE);
const bounds=c=>({min:c.min.toArray(),max:c.max.toArray(),triangleId:c.triangleSupport?.id??null});
const mat=m=>({type:m.type,color:m.color?.getHex(),roughness:m.roughness,metalness:m.metalness,side:m.side,opacity:m.opacity,transparent:m.transparent,map:m.map?.uuid??null});
const rows=meshes=>meshes.map(m=>({name:m.name,position:m.position.toArray(),rotation:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow,material:Array.isArray(m.material)?m.material.map(mat):mat(m.material),geometry:{index:m.geometry.index?[...m.geometry.index.array]:null,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]]))}}));
export function verifyTaiheInstrumentReplacement({y=8,zf=-36.06666666666666}={}){
 const lib=library(),before=new PalaceBuilder(new THREE.Scene(),lib),after=new PalaceBuilder(new THREE.Scene(),lib),a=new THREE.Group(),b=new THREE.Group(),r={hw:54.06666666666666,z0:zf-3};
 before.addObject(a);after.addObject(b);
 try{
  historicalTerraceOrnaments.call(before,a,r,y);after.terraceOrnaments(b,r,y);
  const old=a.children.filter(m=>Math.abs(m.position.x)===17&&Math.abs(m.position.z-(zf+1))<1e-9);
  const boxes=before.colliders.filter(c=>Math.abs((c.min.x+c.max.x)/2)===17&&c.min.y===y&&c.max.y===y+3&&Math.abs(c.max.x-c.min.x-1.6)<1e-9&&Math.abs(c.min.z-(zf+.2))<1e-9&&Math.abs(c.max.z-(zf+1.8))<1e-9);
  assert.equal(old.length,4);assert.equal(boxes.length,2);
  const pair=b.children.filter(g=>g.name==='axis/taihe-terrace-instruments');assert.equal(pair.length,1,'actual production method must install one pair');
  assert.equal(pair[0].children.length,29);const targets=after.colliders.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));assert.equal(targets.length,29);
  const out={removedMeshes:old.length,removedColliders:boxes.length,addedVisibleSolids:29,addedColliders:targets.length,otherMeshHashBefore:hash(rows(a.children.filter(m=>!old.includes(m)))),otherMeshHashAfter:hash(rows(b.children.filter(m=>m!==pair[0]))),nonTargetCollidersBefore:before.colliders.filter(c=>!boxes.includes(c)).map(bounds),nonTargetCollidersAfter:after.colliders.filter(c=>!targets.includes(c)).map(bounds),walkablesBefore:before.walkables,walkablesAfter:after.walkables,input:{y,zf}};
  assert.equal(out.otherMeshHashBefore,out.otherMeshHashAfter);assert.deepEqual(out.nonTargetCollidersBefore,out.nonTargetCollidersAfter);assert.deepEqual(out.walkablesBefore,out.walkablesAfter);return out;
 }finally{before.dispose();after.dispose();}
}
