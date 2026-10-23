// Read-only checks of the actual submitted, merged world. This is CPU UV/image
// and visibility evidence, not a browser/GPU texture or photographic acceptance.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {goldRuns,textureHash} from './r58-zuoyi-door-fixture.mjs';
const key='zuoyi_nine_row_front';
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
export function assertZuoyiDoorFrontInWorld(W){
 assert.ok(W?.scene&&W.cm&&W.library,'Existing actual world with a loaded door library required');W.scene.updateMatrixWorld(true);
 const meshes=[],records=[];W.scene.traverse(m=>{if(m.isMesh&&m.material?.name===key)meshes.push(m);if(m.userData.zuoyiDoorFront)records.push(m.userData.zuoyiDoorFront);});
 assert.equal(records.length,1,'One dispatched record, not an isolated helper result');assert.equal(records[0].status,'PARTIAL_COUNT_CORRECTED');assert.equal(records[0].verticalRows,9);
 assert.equal(meshes.length,1,'Exactly one merged front material mesh');const m=meshes[0],mat=m.material,g=m.geometry,idx=g.index,p=g.attributes.position,uv=g.attributes.uv;
 assert.ok(visible(m));assert.equal((idx?.count??p.count)/3,4,'Two actual leaf skins, four triangles');assert.equal(mat,W.library.materials.get(key));assert.equal(W.library.owns(mat),true);
 assert.equal(mat.map,W.library.colors.get(key));assert.equal(mat.normalMap,W.library.normals.get(key));assert.ok(mat.normalMap?.image?.width>64);
 const original=W.library.color('door_studded');assert.equal(goldRuns(original.image).length,10,'Original shared project texture must retain its ten rows');assert.notEqual(mat.map.source,original.source,'Original texture Source must not be mutated');
 const runs=goldRuns(mat.map.image);assert.equal(runs.length,9);assert.deepEqual(mat.map.repeat.toArray(),[1,1]);assert.equal(mat.map.wrapS,THREE.ClampToEdgeWrapping);assert.equal(mat.map.wrapT,THREE.ClampToEdgeWrapping);
 const faces=[];for(let i=0;i<4;i++){
  const js=[0,1,2].map(k=>idx?idx.getX(i*3+k):i*3+k),ps=js.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld)),us=js.map(j=>new THREE.Vector3(uv.getX(j),uv.getY(j),0)),tri=new THREE.Triangle(...ps),normal=tri.getNormal(new THREE.Vector3());
  assert.ok(tri.getArea()>1);assert.ok(ps.every(v=>Math.abs(v.x+105.045)<1.2&&v.y>=-.0001&&v.y<=4.4001&&v.z>-56&&v.z<-50));faces.push({ps,us,normal});
 }
 const groups=[];for(const f of faces){let group=groups.find(a=>Math.abs(a[0].ps[0].z-f.ps[0].z)<1e-4);if(!group)groups.push(group=[]);group.push(f);}assert.equal(groups.length,2);assert.ok(groups.every(a=>a.length===2));
 const leaves=[];
 for(const fs of groups){
  const center=new THREE.Box3().setFromPoints(fs.flatMap(f=>f.ps)).getCenter(new THREE.Vector3()),normal=fs[0].normal;assert.ok(normal.z*(center.z>-53.1?-1:1)>.999,'Each actual opened front must face the current passage, not the retained rear wall');
  let eye=null;for(const distance of[2.2,3,4])for(const dx of[0,-.6,.6]){
   const a=center.clone().addScaledVector(normal,distance);a.x+=dx;const feet=W.cm.getGroundHeight(a.x,a.z,.45);a.y=feet+1.7;if(W.cm.checkCollision(a,.5))continue;
   const d=center.clone().sub(a),h=new THREE.Raycaster(a,d.clone().normalize(),0,d.length()+.02).intersectObject(W.scene,true).find(h=>visible(h.object));if(h?.object===m&&h.point.distanceTo(center)<.02){eye=a;break;}
  }assert.ok(eye,'At least one legal ground-supported front observer sees this actual skin');
  const rowHits=[];for(const [a,b]of runs){const q=new THREE.Vector3(65/762,1-(a+b)/2/mat.map.image.height,0);let target;
   for(const f of fs){const weights=THREE.Triangle.getBarycoord(q,...f.us,new THREE.Vector3());if(weights&&Math.min(weights.x,weights.y,weights.z)>=-1e-6){target=f.ps[0].clone().multiplyScalar(weights.x).addScaledVector(f.ps[1],weights.y).addScaledVector(f.ps[2],weights.z);break;}}
   assert.ok(target,'Texture row maps inside an actual front triangle');const delta=target.clone().sub(eye),hit=new THREE.Raycaster(eye,delta.clone().normalize(),0,delta.length()+.02).intersectObject(W.scene,true).find(h=>visible(h.object));assert.equal(hit?.object,m,'Each gold-row UV sample must be visible, not metadata only');assert.ok(hit.point.distanceTo(target)<.02);rowHits.push({uv:q.toArray().slice(0,2),point:target.toArray(),hit:hit.point.toArray()});
  }leaves.push({center:center.toArray(),eye:eye.toArray(),rowHits});
 }
 return{scope:'REAL_PRODUCTION_DISPATCH_AND_MERGED_TRIANGLES_WITH_REAL_LOCAL_DOOR_ASSETS_ONLY_NOT_BROWSER',leaves,actualTriangles:4,rowsPerLeaf:9,originalSharedRows:10,colorPixelsSha256:textureHash(mat.map),normalPixelsSha256:textureHash(mat.normalMap),hardware:'INHERITED_COUNT_EDIT_AND_VISIBLE_HEIGHT_FIT_NOT_HISTORIC_HARDWARE_RECONSTRUCTION',otherWorldMaterials:'CPU_ONLY'};
}
