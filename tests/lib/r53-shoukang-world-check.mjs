// QA only: consumes an already-built world. Never creates/loads a zone or GLB.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
const evidence=JSON.parse(readFileSync(new URL('../../reports/r53-shoukang-east-materials/geometry-and-collision.json',import.meta.url)));
export const SHOUKANG_WORLD_ROUTE=[[289.2,219],[289.2,223.4],[283.59,223.4],[283.59,227],[283.59,229.8],[278.36,229.8],[278.36,236.8],[278.36,229.8],[283.59,229.8],[283.59,227],[283.59,223.4],[289.2,223.4],[289.2,219]];
export const SHOUKANG_MAP_ITEM={kind:'hall',name:'寿康宫',x:289.2,z:231,w:28.9,d:19.4};
export const SHOUKANG_PREFERRED_LANDING={x:289.2,z:214.3,y:0,lookAtX:289.2,lookAtZ:231};
export const SHOUKANG_SUPPORT_POINTS=[[276.15,238.4],[278.362589928,238.8],[280.5,239.5]];
export const SHOUKANG_WORLD_COLLIDERS=evidence.newColliders.map(c=>Object.fromEntries(['min','max'].map(side=>[side,c[side].map((v,i)=>v+[289.2,0,231][i])])));
const close=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol;
export function assertShoukangEastInWorld(W){
  const {scene,cm}=W;assert.ok(scene&&cm,'Pass the existing W.scene and W.cm; no build is performed');
  const map=W.zoneManager?.getMapItems?.()??W.mapItems;assert.ok(Array.isArray(map));
  const entries=map.filter(m=>m.name==='寿康宫'&&m.kind==='hall');assert.equal(entries.length,1);assert.deepEqual(entries[0],SHOUKANG_MAP_ITEM);
  const matches=SHOUKANG_WORLD_COLLIDERS.map(expected=>cm.colliders.filter(c=>['min','max'].every(side=>['x','y','z'].every((axis,i)=>close((c.box??c)[side][axis],expected[side][i])))));
  matches.forEach((m,i)=>assert.equal(m.length,1,`new structural collider ${i} must exist exactly once`));
  for(const [x,z] of SHOUKANG_SUPPORT_POINTS){assert.ok(close(cm.getGroundHeight(x,z,.75,.03),.75),'original floor supports the framework base');assert.ok(cm.walkables.some(w=>w.type==='box'&&close(w.box.max.y,.75)&&x>=w.box.min.x&&x<=w.box.max.x&&z>=w.box.min.z&&z<=w.box.max.z),'real floor primitive, not rescue');}
  const entryX=280.9751798561151;
  for(const dx of [-.65,0,.65])for(const dz of [-.7,0,.7])assert.equal(cm.checkCollision(new THREE.Vector3(entryX+dx,2.45,229.8+dz),.5),false,'retained east doorway clear');
  assert.equal(cm.checkCollision(new THREE.Vector3(278.36,2.45,236.8),.5),false,'north viewing point clear');
  const rooms=(W.rooms??W.zoneManager?.allRooms??[]).filter(r=>r.name==='寿康宫');
  for(const kind of ['shoukang-east-warm-viewing-zone','shoukang-central-viewing-zone','shoukang-west-warm-viewing-zone']){const room=rooms.find(r=>r.kind===kind);assert.ok(room);assert.equal(room.floorY,.75);for(const p of [...room.doors,...room.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,2.45,p.z),.5),false);}
  const records=[],materials=new Set();let triangles=0;const bounds=new THREE.Box3();scene.updateMatrixWorld(true);
  scene.traverse(o=>{records.push(...(o.userData.architecture??[]).filter(r=>r.id==='outer-west/shoukang-east-north-framework'));if(o.isMesh&&o.material?.name?.startsWith('r53_shoukang_east_')){materials.add(o.material.name);triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;bounds.union(new THREE.Box3().setFromObject(o));}});
  assert.equal(records.length,1);assert.equal(records[0].stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');assert.equal(records[0].source.photographyDate,null);assert.equal(records[0].source.restorationCampaign,null);assert.equal(materials.size,4);assert.equal(triangles,200);
  for(const [side,target]of [['min',[276.07,.75,238.18]],['max',[280.6551798561151,5,239.56]]])for(const [i,axis]of ['x','y','z'].entries())assert.ok(close(bounds[side][axis],target[i],1e-4));
  return {colliderMatches:matches.map(m=>m.length),materials:[...materials].sort(),triangles,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},mapItem:entries[0],supportY:.75,scope:'B_PROCEDURAL_AND_MERGED_ONLY; NO_SHOUKANG_S_GLB; NO_RUNTIME_GPU_CLAIM'};
}
