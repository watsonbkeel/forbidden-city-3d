// Unintegrated source/contact experiment. No production hookup.
// Actual bounded bridge meshes, not a browser or reconstructed full world.
import fs from 'node:fs';
import zlib from 'node:zlib';
import * as THREE from 'three';
import { buildInnerJinshui } from '../../src/scene/palace/special/InnerJinshui.js';
import { buildInnerJinshuiSideFinials } from '../../src/scene/palace/special/InnerJinshuiSideFinials.js';
import { replaceSideShaftTopsLocally } from '../../tests/lib/r58-finial-replacement-prototype.mjs';
import { JINSHUI_BRIDGES } from '../../src/scene/palace/river.js';
const out='reports/r58-a-bridge-replacement-prototype';fs.mkdirSync(out,{recursive:true});
const mats=new Map(),library={material(n){if(!mats.has(n))mats.set(n,new THREE.MeshStandardMaterial({name:n,color:n==='marble'?0xd6d0ba:n==='wall_brick'?0x716c60:0x7c7970}));return mats.get(n);},tileSize:()=>2};
const river={position:{x:0,z:-310.8},bridges:JINSHUI_BRIDGES};
const result=buildInnerJinshui(library,river,new THREE.MeshStandardMaterial({name:'water',color:0x4a7782}));
const heads=buildInnerJinshuiSideFinials(library,result.profile),root=new THREE.Group();root.add(result.group);
const camera=new THREE.PerspectiveCamera(48,960/540,.03,200);camera.position.set(-21.5,3.4,-323.3);camera.lookAt(-13,1,-311.8);camera.updateMatrixWorld(true);
function capture(label){root.updateMatrixWorld(true);const triangles=[];
 root.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry,a=geo.attributes.position,n=geo.attributes.normal,idx=geo.index,m=new THREE.Matrix4(),world=new THREE.Matrix4(),nm=new THREE.Matrix3();
  for(let instance=0;instance<(o.isInstancedMesh?o.count:1);instance++){
   if(o.isInstancedMesh){o.getMatrixAt(instance,m);world.multiplyMatrices(o.matrixWorld,m);}else world.copy(o.matrixWorld);nm.getNormalMatrix(world);
   for(let i=0;i<(idx?.count??a.count);i+=3){const v=[],normals=[];for(let j=0;j<3;j++){const q=idx?idx.getX(i+j):i+j;v.push(new THREE.Vector3().fromBufferAttribute(a,q).applyMatrix4(world).toArray());normals.push(new THREE.Vector3().fromBufferAttribute(n,q).applyNormalMatrix(nm).toArray());}
    // Clip only wholly distant triangles, never replace generated surfaces.
    if(v.every(q=>q[0]<-37)||v.every(q=>q[0]>-3)||v.every(q=>q[2]<-327)||v.every(q=>q[2]>-296))continue;
    triangles.push({v,n:normals,c:Array(3).fill(o.material.color.toArray()),side:o.material.side});
   }
  }
 });
 const data={kind:'BOUNDED ACTUAL GEOMETRY CPU DIAGNOSTIC; NOT GAME OR WEBGL ACCEPTANCE',label,camera:{position:camera.position.toArray(),target:[-13,1,-311.8],fov:camera.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray()},triangles};
 fs.writeFileSync(`${out}/${label}.json.gz`,zlib.gzipSync(JSON.stringify(data)));
}
capture('before');root.add(heads);replaceSideShaftTopsLocally({g:heads,r:result,scene:root});capture('after');
const h=heads.children[0],g=h.geometry;console.log(JSON.stringify({instances:h.count,sharedTriangles:g.index.count/3,submittedTriangles:g.index.count/3*h.count,drawCallsPerMaterialPass:1,geometryBytes:Object.values(g.attributes).reduce((s,a)=>s+a.array.byteLength,0)+g.index.array.byteLength,instanceBytes:h.instanceMatrix.array.byteLength,addedColliderCount:0,addedWalkableCount:0,addedBridgeCount:0},null,2));
