import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {fixture,roles,meshes,meshRows,hash,physical,triangles,snapshot,rayLocal,geometryHealth} from '../lib/r58-court-facade-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('../fixtures/r58-court-facade-baseline.json',import.meta.url))).profiles;
const corbel=m=>m.userData.role==='xihe-courtyard-corbel';
test('raw pre-pruning source and final corbel triangles are all nondegenerate',()=>{let raw;const f=fixture('xihe',{},null,kit=>{const map=kit.mapRect.bind(kit);kit.mapRect=(...args)=>{raw=geometryHealth(args[0]);return map(...args);};});assert.equal(raw.triangles,7600);assert.equal(geometryHealth(f.frame).triangles,6634);});

test('six curved Xihe rear corbels are added while all baseline geometry, materials and registrations stay exact',()=>{
 const f=fixture('xihe'),parts=roles(f.frame,'xihe-courtyard-corbel');assert.equal(parts.length,6);
 assert.equal(hash(meshRows(f.frame,corbel)),baseline.xihe.all);assert.equal(hash(physical(f.kit)),baseline.xihe.physics);
 assert.deepEqual(parts.map(o=>o.userData.bay),[1,1,2,2,3,3]);
 for(const m of parts){assert.equal(m.material,f.lib.material('caihua_beam'));const b=new THREE.Box3().setFromObject(m);assert.ok(b.min.y>f.g.platformY+4.6);assert.equal(m.userData.side,'rear');assert.equal(m.userData.status,'PHOTO_FIT');assert.ok(m.geometry.attributes.position.count>36);}
 geometryHealth(f.frame);assert.ok(triangles(f.frame)-baseline.xihe.triangles<650);
});
for(const profile of ['xiehe','jingyun','longzong'])test(`${profile} remains byte-identical and gets no copied Xihe silhouette`,()=>{const f=fixture(profile);assert.deepEqual(snapshot(f),baseline[profile]);assert.equal(roles(f.frame,'xihe-courtyard-corbel').length,0);});
test('curved silhouette has a real undercut and legal-eye visibility before and after actual material merge',()=>{
 const f=fixture('xihe'),g=f.g,parts=roles(f.frame,'xihe-courtyard-corbel');assert.equal(parts.length,6);
 const samples=parts.map(m=>{m.geometry.computeBoundingBox();const p=new THREE.Vector3(.35,-.28,m.userData.direction*.101).applyMatrix4(m.matrixWorld);const q=f.frame.worldToLocal(p.clone());return q.toArray();});
 const eyes=samples.map(p=>{const z=g.depth/2+4,[x,wz]=g.toWorld(p[0],z),feet=f.cm.getGroundHeight(x,wz,g.platformY);const eye=[p[0],feet+1.7,z];assert.equal(f.cm.checkCollision(new THREE.Vector3(x,eye[1],wz),.5),false);return eye;});
 const visible=root=>samples.forEach((p,i)=>{const d=new THREE.Vector3(...p).sub(new THREE.Vector3(...eyes[i]));const hits=rayLocal(root,g,eyes[i],d.clone().normalize().toArray(),d.length()+.03);assert.ok(hits.length);assert.ok(hits[0].point.distanceTo(new THREE.Vector3(...p).applyMatrix4(f.frame.matrixWorld))<.06,'actual nearest surface is the photographed member');});
 visible(f.frame);
 // Rays perpendicular to the facade distinguish the dropped curved edge from a box.
 const one=parts[0],localRay=(x,y)=>{const origin=new THREE.Vector3(x,y,1).applyMatrix4(one.matrixWorld),direction=new THREE.Vector3(0,0,-1).transformDirection(one.matrixWorld);return new THREE.Raycaster(origin,direction,0,2).intersectObject(one);};
 assert.ok(localRay(.12,-.48).length);assert.equal(localRay(1.25,-.48).length,0);assert.ok(localRay(1.25,-.06).length);
 const before=triangles(f.frame),merged=f.kit.finish();merged.updateMatrixWorld(true);assert.equal(triangles(merged),before);assert.equal(meshes(merged).length,12);visible(merged);geometryHealth(merged);
});
test('all three actual open routes keep body and rendered head clearance at every cardinal rotation',()=>{
 for(const rot of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const f=fixture('xihe',{rot}),g=f.g;assert.equal(roles(f.frame,'xihe-courtyard-corbel').length,6);for(const portal of g.portals)for(const dx of [-.8,0,.8]){const x=portal.centerX+dx;assert.equal(rayLocal(f.frame,g,[x,g.platformY+1.7,-g.depth/2-1],[0,0,1],g.depth+2).length,0);for(const z of [-g.depth/2,0,g.depth/2]){const [wx,wz]=g.toWorld(x,z);assert.equal(f.cm.checkCollision(new THREE.Vector3(wx,g.platformY+1.7,wz),.5),false);assert.ok(rayLocal(f.frame,g,[x,g.platformY+1.7,z],[0,1,0],10)[0].distance>3);}}}
});
test('corbels have fresh owned geometry; merge and disposal free geometry once and never free shared materials',()=>{
 const a=fixture('xihe'),b=fixture('xihe'),parts=roles(a.frame,'xihe-courtyard-corbel');assert.equal(parts.length,6);const count=new Map();for(const m of parts){assert.ok(!meshes(b.frame).some(n=>n.geometry===m.geometry));if(!count.has(m.geometry)){count.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>count.set(m.geometry,count.get(m.geometry)+1));}}
 let materialDisposals=0;a.lib.material('caihua_beam').addEventListener('dispose',()=>materialDisposals++);const root=a.kit.finish();for(const n of count.values())assert.equal(n,1);a.kit.dispose(root);for(const n of count.values())assert.equal(n,1);assert.equal(materialDisposals,0);
});
