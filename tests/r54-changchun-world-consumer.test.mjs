import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from './lib/r54-changchun-capture.mjs';
import {assertChangchunEastInWorld,CHANGCHUN_EAST_COLLIDER_DELTA,CHANGCHUN_EAST_SUPPORT_DELTA} from './lib/r54-changchun-world-check.mjs';
test('R54 read-only already-built W consumer sees final merged alcove, exact collision replacement and unchanged supports',()=>{
  const v=fixture(),scene=new THREE.Scene(),merged=v.b.kit.finish();scene.add(merged);
  try{const W={scene,cm:v.cm,mapItems:v.b.kit.mapItems,rooms:v.b.kit.rooms},before={objects:scene.children.length,colliders:v.cm.colliders.length,walkables:v.cm.walkables.length};
    const result=assertChangchunEastInWorld(W);assert.equal(result.triangles,1764);assert.equal(CHANGCHUN_EAST_COLLIDER_DELTA.removed.length,4);assert.equal(CHANGCHUN_EAST_COLLIDER_DELTA.added.length,26);assert.deepEqual(CHANGCHUN_EAST_SUPPORT_DELTA,{removed:[],added:[]});assert.deepEqual({objects:scene.children.length,colliders:v.cm.colliders.length,walkables:v.cm.walkables.length},before);
    const index=v.added.userData.colliderRange.start,removed=v.cm.colliders.splice(index,1)[0];assert.throws(()=>assertChangchunEastInWorld(W),/collider/);v.cm.colliders.splice(index,0,removed);
  }finally{v.b.kit.dispose(merged);}
});

test('R54 Changchun consumer tolerates unrelated multi-material world meshes without masking missing own materials',()=>{
  const v=fixture(),scene=new THREE.Scene(),merged=v.b.kit.finish(),geo=new THREE.BoxGeometry(1,1,1),mats=[new THREE.MeshBasicMaterial(),new THREE.MeshBasicMaterial()],other=new THREE.Mesh(geo,mats);scene.add(merged,other);
  try{const W={scene,cm:v.cm,mapItems:v.b.kit.mapItems,rooms:v.b.kit.rooms};assert.equal(assertChangchunEastInWorld(W).materials.length,4);const own=[];scene.traverse(o=>{if(o.isMesh&&o.material?.name==='r54_changchun_east_trim')own.push(o)});assert.ok(own.length);for(const o of own)o.material.name='missing_r54_trim';assert.throws(()=>assertChangchunEastInWorld(W),/3 !== 4|Expected values/);}finally{geo.dispose();mats.forEach(m=>m.dispose());v.b.kit.dispose(merged);}
});

test('R54 Changchun consumer tolerates unnamed unrelated rooms but still rejects a missing own viewing room',()=>{
 const v=fixture(),scene=new THREE.Scene(),merged=v.b.kit.finish();scene.add(merged);try{const rooms=[...v.b.kit.rooms,{name:null},{name:undefined}],W={scene,cm:v.cm,mapItems:v.b.kit.mapItems,rooms};assert.equal(assertChangchunEastInWorld(W).roomCount,3);const i=rooms.findIndex(r=>r.name?.startsWith('长春宫·观览区'));assert.ok(i>=0);rooms.splice(i,1);assert.throws(()=>assertChangchunEastInWorld(W),/2 !== 3|Expected values/);}finally{v.b.kit.dispose(merged);}
});
