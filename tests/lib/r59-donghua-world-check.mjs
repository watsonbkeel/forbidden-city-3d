// Read-only consumer of an already constructed, merged production W. No loader,
// scene constructor, world build or test invocation occurs in this module.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createHash} from 'node:crypto';
const KEY='donghua_central_nine_row_front';
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
function runs(image,axis='y',at=65/762,range=[.04,.98]){
 const {width:w,height:h}=image,data=image.getContext('2d').getImageData(0,0,w,h).data,n=axis==='y'?h:w,found=[];let start=null;
 for(let p=Math.round(range[0]*n);p<Math.round(range[1]*n);p++){
  const x=axis==='y'?Math.round(at*w):p,y=axis==='y'?p:Math.round(at*h),i=(y*w+x)*4,r=data[i],g=data[i+1],b=data[i+2],gold=g>55&&g>1.5*b&&r>1.1*g;
  if(gold&&start===null)start=p;if(!gold&&start!==null){found.push([start,p-1]);start=null;}
 }
 const joined=[];for(const [a,b]of found){if(joined.length&&a-joined.at(-1)[1]<n*.014)joined.at(-1)[1]=b;else joined.push([a,b]);}return joined.filter(([a,b])=>b-a>n*.014);
}
function hit(scene,eye,target){const d=target.clone().sub(eye);return new THREE.Raycaster(eye,d.clone().normalize(),0,d.length()+.02).intersectObject(scene,true).find(h=>visible(h.object));}
function pointAt(fs,u,v){const q=new THREE.Vector3(u,v,0);for(const f of fs){const w=THREE.Triangle.getBarycoord(q,...f.us,new THREE.Vector3());if(w&&Math.min(w.x,w.y,w.z)>=-1e-6)return f.ps[0].clone().multiplyScalar(w.x).addScaledVector(f.ps[1],w.y).addScaledVector(f.ps[2],w.z);}return null;}
const pixelsHash=texture=>{const im=texture.image;return createHash('sha256').update(im.getContext('2d').getImageData(0,0,im.width,im.height).data).digest('hex');};
export function assertDonghuaCentralDoorFrontInWorld(W){
 assert.ok(W?.scene&&W.cm&&W.library,'Supply an already built actual W with loaded door images');W.scene.updateMatrixWorld(true);
 const meshes=[],records=[];W.scene.traverse(o=>{if(o.isMesh&&o.material?.name===KEY)meshes.push(o);if(o.userData.donghuaCentralDoorFront)records.push(o.userData.donghuaCentralDoorFront);});
 assert.equal(records.length,1,'Exactly one dispatched root record after production finish');assert.equal(records[0].objectId,'FC-C8AD5BD621');assert.equal(records[0].status,'PARTIAL_COUNT_CORRECTED');assert.equal(records[0].verticalRows,9);assert.equal(records[0].horizontalColumns,8);assert.equal(records[0].visibleGraphicFit.minY,0);
 assert.equal(meshes.length,1,'One material bucket for the two central skins');const mesh=meshes[0],mat=mesh.material,g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;
 assert.ok(visible(mesh));assert.equal((idx?.count??p.count)/3,4);assert.equal(mat,W.library.materials.get(KEY));assert.equal(mat.map,W.library.colors.get(KEY));assert.equal(mat.normalMap,W.library.normals.get(KEY));for(const r of [mat,mat.map,mat.normalMap])assert.equal(W.library.owns(r),true);
 const base=W.library.material('door_studded');assert.equal(runs(base.map.image).length,10);assert.notEqual(base.map.source,mat.map.source);assert.notEqual(base.normalMap.source,mat.normalMap.source);assert.ok(mat.normalMap.image.width>64);
 assert.deepEqual(mat.map.repeat.toArray(),[1,1]);assert.equal(mat.map.wrapS,THREE.ClampToEdgeWrapping);assert.equal(mat.map.wrapT,THREE.ClampToEdgeWrapping);
 const rowRuns=runs(mat.map.image),columnRuns=runs(mat.map.image,'x',85/926,[.04,.96]);assert.equal(rowRuns.length,9);assert.equal(columnRuns.length,8);
 const groups=[];for(let i=0;i<4;i++){
  const ids=[0,1,2].map(k=>idx?idx.getX(i*3+k):i*3+k),ps=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(mesh.matrixWorld)),us=ids.map(j=>new THREE.Vector3(uv.getX(j),uv.getY(j),0)),tri=new THREE.Triangle(...ps),normal=tri.getNormal(new THREE.Vector3());
  assert.ok(tri.getArea()>7);assert.ok(ps.every(v=>Math.abs(v.x+370.98)<1.321&&v.y>=-.0001&&v.y<=6.0001&&v.z>-260&&v.z<-254));
  let fs=groups.find(a=>Math.abs(a[0].ps[0].z-ps[0].z)<1e-4);if(!fs)groups.push(fs=[]);fs.push({ps,us,normal});
 }assert.equal(groups.length,2);assert.ok(groups.every(a=>a.length===2));
 const image=mat.map.image,ctx=image.getContext('2d'),leaves=[];
 for(const fs of groups){
  const center=new THREE.Box3().setFromPoints(fs.flatMap(f=>f.ps)).getCenter(new THREE.Vector3()),normal=fs[0].normal;assert.ok(normal.z*(center.z>-257?-1:1)>.999);
  const eye=new THREE.Vector3(-370.98,W.cm.getGroundHeight(-370.98,-257,.45)+1.7,-257);assert.equal(W.cm.checkCollision(eye,.5),false);assert.equal(hit(W.scene,eye,center)?.object,mesh);
  const rowHits=[];for(const [a,b]of rowRuns){const x=Math.round(65/762*image.width);let y=null,pixel=null;
   for(let py=a;py<=b;py++){const q=[...ctx.getImageData(x,py,1,1).data];if(q[1]>55&&q[1]>q[2]*1.5&&q[0]>q[1]*1.1){y=py;pixel=q;break;}}assert.notEqual(y,null);
   const uv=[(x+.5)/image.width,1-(y+.5)/image.height],target=pointAt(fs,...uv);assert.ok(target);const h=hit(W.scene,eye,target);assert.equal(h?.object,mesh);assert.ok(h.point.distanceTo(target)<.02);rowHits.push({uv,pixel,point:target.toArray(),hit:h.point.toArray()});
  }
  const bottom=pointAt(fs,.5,.002);assert.ok(bottom.y<.02&&bottom.y>0);const h=hit(W.scene,eye,bottom);assert.equal(h?.object,mesh);assert.ok(h.point.distanceTo(bottom)<.02);
  leaves.push({center:center.toArray(),normal:normal.toArray(),eye:eye.toArray(),rows:rowHits,bottomEdge:bottom.toArray()});
 }
 return{scope:'EXISTING_PRODUCTION_WORLD_CONSUMER_REAL_DOOR_UV_PIXELS_AND_RAYS_CPU_NOT_BROWSER',objectId:'FC-C8AD5BD621',actualTriangles:4,rowsPerLeaf:9,columnLayout:8,originalSharedRows:10,leaves,
  colorPixelsSha256:pixelsHash(mat.map),normalPixelsSha256:pixelsHash(mat.normalMap),
  limitations:'Count-layout correction only. Inherited ring artwork interrupts some grid positions; neither a claim of 72 independent rendered studs nor calibrated hardware, color, spacing or aspect. Browser visual verification remains pending.'};
}
