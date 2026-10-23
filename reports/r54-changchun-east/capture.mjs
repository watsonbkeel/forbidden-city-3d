import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync,gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { fixture,captureRetained,retainedAreas,localBounds,meshList,sha,item } from '../../tests/lib/r54-changchun-capture.mjs';
const out=new URL('./',import.meta.url),baselineRoot=process.argv[2];
let v;
if(baselineRoot) {
  const root=path.resolve(baselineRoot),{ZoneBase}=await import(pathToFileURL(path.join(root,'src/scene/zones/ZoneBase.js')));
  const {library}=await import(pathToFileURL(path.join(root,'tests/lib/inner-palace-fixture.mjs')));
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/zones/west-six.json'))),b=new ZoneBase(library(),data),{f}=b.buildHall(item);
  b.kit.root.updateMatrixWorld(true);v={b,f,dispose:()=>b.kit.dispose(b.kit.root)};
} else v=fixture();
const triangles=[],meshes=[],inverse=v.f.matrixWorld.clone().invert(),added=new Set(v.added?meshList(v.added):[]);
for(const m of meshList(v.f)) {
  if(!m.material||m.material.transparent||m.material.visible===false)continue;
  const matrix=inverse.clone().multiply(m.matrixWorld),normal=new THREE.Matrix3().getNormalMatrix(matrix),p=m.geometry.attributes.position,n=m.geometry.attributes.normal,ix=m.geometry.index;
  meshes.push({role:m.userData.role??m.name,addition:added.has(m),bounds:localBounds(m,v.f),triangles:(ix?.count??p.count)/3});
  for(let k=0;k<(ix?.count??p.count);k+=3){const ids=[0,1,2].map(j=>ix?ix.getX(k+j):k+j);triangles.push({v:ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(matrix).toArray()),n:ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(normal).normalize().toArray()),c:ids.map(()=>m.material.color.toArray()),side:m.material.side,character:false,role:m.userData.role??m.name,addition:added.has(m)});}
}
const label=baselineRoot?'before':v.added.userData.stage.includes('WHITE')?'white':'material';
const cameras=[['front',[-10.84,2.3,-1.2],[-10.84,2.75,4.6],60],['oblique',[-9.65,2.3,1.1],[-10.84,2.55,4.6],70]];
for(const [view,from,to,fov] of cameras) {
  const camera=new THREE.PerspectiveCamera(fov,16/9,.03,80);camera.position.fromArray(from);camera.lookAt(...to);camera.updateMatrixWorld(true);
  const row={label,view,kind:'CPU perspective of actual production builder geometry; no browser/GPU claim',camera:{position:from,target:to,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray(),fov,aspect:camera.aspect},sourceCharacterInstances:0,triangles};
  fs.writeFileSync(new URL(`${label}-${view}.json.gz`,out),gzipSync(JSON.stringify(row)));
}
if(v.added) {
  const range=v.added.userData.colliderRange,baseline=JSON.parse(gunzipSync(fs.readFileSync(new URL('../../tests/fixtures/r54-changchun-r53-baseline.json.gz',import.meta.url))));
  const oldCols=baseline.replaced.filter(r=>r.role==='changchun-kang-cover-post').map(r=>{
    const m=new THREE.Matrix4().fromArray(r.matrix),center=new THREE.Vector3().setFromMatrixPosition(m),half=new THREE.Vector3(.065,1.55,.065);return{min:center.clone().sub(half).toArray(),max:center.clone().add(half).toArray()};
  });
  const summary={base:baseline.base,label,source:{file:'source-original.jpg',sha256:sha(fs.readFileSync(new URL('source-original.jpg',out)))},provenance:v.added.userData,
    replacement:{removedMeshes:8,removedTriangles:96,removedColliders:4,retainedEastKang:true},addition:{meshes:added.size,triangles:triangles.filter(t=>t.addition).length,materials:new Set([...added].map(o=>o.material)).size,colliders:range.end-range.start,walkables:0,rooms:0,mapEntries:0,bounds:localBounds(v.added,v.f)},
    retainedCaptureSHA256:sha(captureRetained(v)),retainedAreas:retainedAreas(v.f),removedColliders:oldCols,newColliders:v.b.kit.colliders.slice(range.start,range.end).map(b=>({min:b.min.toArray(),max:b.max.toArray()})),meshes};
  fs.writeFileSync(new URL(`${label}-geometry-and-collision.json`,out),JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify({label,...summary.addition}));
}
v.dispose();
