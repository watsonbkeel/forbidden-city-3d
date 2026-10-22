// Read-only QA consumer of an already built W. Never builds a zone, loads a GLB,
// creates a support surface, changes collision, or drives a production character.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
const evidence=JSON.parse(readFileSync(new URL('../../reports/r54-changchun-east/material-geometry-and-collision.json',import.meta.url)));
export const CHANGCHUN_EAST_WORLD_ROUTE=[[0,-10],[0,-1.2],[-10.84,-1.2],[-10.84,2.55],[-10.84,-1.2],[10.84,-1.2],[0,-1.2],[0,-10],[0,-1.2],[-10.84,-1.2],[-9.65,2.55],[-10.84,-1.2],[0,-1.2],[0,-10]].map(([x,z])=>[150.2+x,379.6+z]);
export const CHANGCHUN_EAST_COLLIDER_DELTA=Object.freeze({removed:evidence.removedColliders,added:evidence.newColliders});
export const CHANGCHUN_EAST_SUPPORT_DELTA=Object.freeze({removed:[],added:[]});
export const CHANGCHUN_EAST_LEGAL_VIEWS=Object.freeze([{eye:[139.36,2.3,378.4],target:[139.36,2.75,384.2],fov:60},{eye:[140.55,2.3,380.7],target:[139.36,2.55,384.2],fov:70}]);
export const CHANGCHUN_EAST_RETAINED_FINGERPRINTS=evidence.retainedAreas;
const close=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol;
const sameBox=(box,row)=>['min','max'].every(side=>['x','y','z'].every((axis,i)=>close(box[side][axis],row[side][i])));
export function assertChangchunEastInWorld(W) {
  const {scene,cm}=W;assert.ok(scene&&cm,'Pass existing W.scene and W.cm; no world build is performed');
  const added=evidence.newColliders.map(row=>cm.colliders.filter(c=>sameBox(c.box??c,row)).length);
  added.forEach((n,i)=>assert.equal(n,1,`east replacement collider ${i} must exist exactly once`));
  const removed=evidence.removedColliders.map(row=>cm.colliders.filter(c=>sameBox(c.box??c,row)).length);
  removed.forEach((n,i)=>assert.equal(n,0,`old generic east post collider ${i} must be removed, not accumulated`));
  const map=W.zoneManager?.getMapItems?.()??W.mapItems;assert.ok(Array.isArray(map));
  const entries=map.filter(m=>m.kind==='hall'&&m.name==='长春宫');assert.equal(entries.length,1);
  assert.deepEqual(entries[0],{kind:'hall',name:'长春宫',x:150.2,z:379.6,w:28.700000000000003,d:15.4});
  const points=[[-10.84,-1.2],[-10.84,2.55],[-9.65,2.55],[10.84,-1.2],[0,-1.2]];
  for(const [dx,dz] of points){const x=150.2+dx,z=379.6+dz;assert.equal(cm.checkCollision(new THREE.Vector3(x,2.3,z),.5),false,'retained eye-height body clearance');assert.ok(close(cm.getGroundHeight(x,z,.6,.03),.6),'retained floor support, not rescue');assert.ok(cm.walkables.some(w=>w.type==='box'&&close(w.box.max.y,.6)&&x>=w.box.min.x&&x<=w.box.max.x&&z>=w.box.min.z&&z<=w.box.max.z),'original actual walkable primitive');}
  const rooms=(W.rooms??W.zoneManager?.allRooms??[]).filter(r=>r.name?.startsWith('长春宫·观览区'));
  assert.equal(rooms.length,3);for(const room of rooms){assert.equal(room.kind,'source-domestic-viewing-zone');assert.equal(room.floorY,.6);for(const p of [...room.doors,...room.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,2.3,p.z),.5),false);}
  const records=[],materials=new Set(),bounds=new THREE.Box3();let triangles=0;scene.updateMatrixWorld(true);
  scene.traverse(o=>{records.push(...(o.userData.architecture??[]).filter(r=>r.id==='west-six/changchun-east-kang-layers'));if(o.isMesh&&o.material?.name?.startsWith('r54_changchun_east_')){materials.add(o.material.name);triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;bounds.union(new THREE.Box3().setFromObject(o));}});
  assert.equal(records.length,1);assert.equal(records[0].source.visibleCentralFieldCount,6);assert.equal(records[0].source.rearScreenTotalPanelCount,null);assert.equal(records[0].source.photographyDate,null);
  assert.equal(records[0].stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');assert.equal(materials.size,4);assert.equal(triangles,1764);
  for(const side of ['min','max'])for(const [i,axis] of ['x','y','z'].entries())assert.ok(close(bounds[side][axis],evidence.addition.bounds[side][axis]+[150.2,0,379.6][i],1e-4),`new ${side}.${axis} bounds`);
  return {colliderMatches:added,oldColliderMatches:removed,supportDelta:CHANGCHUN_EAST_SUPPORT_DELTA,triangles,materials:[...materials].sort(),bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},mapItem:entries[0],roomCount:rooms.length,scope:'B_PROCEDURAL_AND_MERGED_ONLY; NO_NEW_GLB; NO_GPU_OR_CURRENT_INVENTORY_CLAIM'};
}
