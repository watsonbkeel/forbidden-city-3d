import fs from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { fixture, capture, localBounds, sha, item } from '../../tests/lib/r53-shoukang-capture.mjs';
const out = new URL('./', import.meta.url), f = fixture(), added = new Set(); f.added.traverse(o => added.add(o));
const inverse = f.f.matrixWorld.clone().invert(), oldRows=[], newRows=[], meshes=[];
f.f.traverse(m => { if (!m.isMesh || !m.material || m.material.transparent || m.material.visible === false) return;
  const matrix = inverse.clone().multiply(m.matrixWorld), normal = new THREE.Matrix3().getNormalMatrix(matrix), p=m.geometry.attributes.position, n=m.geometry.attributes.normal, ix=m.geometry.index, rows=added.has(m)?newRows:oldRows;
  meshes.push({role:m.userData.role??m.name,addition:added.has(m),bounds:localBounds(m,f.f),triangles:(ix?.count??p.count)/3});
  for(let k=0;k<(ix?.count??p.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);rows.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(matrix).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(normal).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false,role:m.userData.role??m.name});}
});
for(const [view,from,to] of [['front',[-10.83741,2.65,-.4],[-10.83741,2.65,8.2]],['oblique',[-9.2,3.2,1.5],[-10.83741,2.65,8.2]]]) {
  const camera=new THREE.PerspectiveCamera(44,16/9,.03,80);camera.position.fromArray(from);camera.lookAt(...to);camera.updateMatrixWorld(true);
  for(const [label,triangles] of [['before',oldRows],['after',[...oldRows,...newRows]]]) {
    const current={label:'partial material pass',view,kind:'CPU perspective of actual production builder geometry; no browser/GPU claim',camera:{position:from,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray(),fov:camera.fov,aspect:camera.aspect},sourceCharacterInstances:0,triangles};
    const row = label==='before' ? {...JSON.parse(gunzipSync(fs.readFileSync(new URL(`../r53-shoukang-east/after-${view}.json.gz`,out)))),label:'white checkpoint'} : current;
    fs.writeFileSync(new URL(`${label}-${view}.json.gz`,out),gzipSync(JSON.stringify(row)));
  }
}
const range=f.added.userData.colliderRange, summary={base:'2a7c6fd09086e6b73c0745aa7cfca4534bbfd9a6',whiteCheckpoint:'8f3f86736fa59dc260eb54cf776882ec15a40a5b',source:{file:'../r53-shoukang-east/source-original.jpg',originalExtractedFilename:'shoukang-east-warmroom-original-000.jpg',sha256:createHash('sha256').update(fs.readFileSync(new URL('../r53-shoukang-east/source-original.jpg',out))).digest('hex')},provenance:f.added.userData,addition:{meshes:meshes.filter(x=>x.addition).length,triangles:newRows.length,materials:4,colliders:range.end-range.start,walkables:0,rooms:0,mapEntries:0,bounds:localBounds(f.added,f.f)},retainedCaptureSHA256:sha(capture(f,true)),newColliders:f.b.kit.colliders.slice(range.start,range.end).map(b=>({min:b.min.toArray().map((v,i)=>v-([item.x,0,item.z][i])),max:b.max.toArray().map((v,i)=>v-([item.x,0,item.z][i]))})),meshes};
fs.writeFileSync(new URL('geometry-and-collision.json',out),JSON.stringify(summary,null,2)+'\n');f.dispose(); console.log(JSON.stringify(summary.addition));
