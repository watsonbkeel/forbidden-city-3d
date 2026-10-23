// Export actual supplied merged triangles only. No builder or substitute model.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import * as THREE from 'three';
import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';
import {courtyardWindowItems} from './r58-courtyard-window-world-check.mjs';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
const colors={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f};
export function exportCourtyardWindowViews(W,out,stage,{profiles=['xihe','xiehe']}={}){
 if(!['before','after'].includes(stage))throw Error('before/after stage required');W.scene.updateMatrixWorld(true);fs.mkdirSync(out,{recursive:true});const output=[];
 for(const item of courtyardWindowItems.filter(o=>profiles.includes(o.gateProfile))){
  const g=sideGateGeometry(item),focus=g.bayCenters[g.profile==='xihe'?0:4],direction=g.profile==='xihe'?-1:1;
  const point=p=>{const [x,z]=g.toWorld(p[0],p[2]);return new THREE.Vector3(x,p[1],z);};
  const views=[{name:'source-scale',eye:[0,1.7,44],target:[0,6,0],fov:49},{name:'near',eye:[focus,1.7,g.depth/2+8],target:[focus,g.platformY+3.2,g.depth/2],fov:43},{name:'oblique',eye:[focus-direction*3,1.7,g.depth/2+7],target:[focus,g.platformY+3.2,g.depth/2],fov:43}];
  const rows=[];
  W.scene.traverse(o=>{
   if(!o.isMesh||o.isInstancedMesh)return;for(let p=o;p;p=p.parent)if(!p.visible)return;
   const geo=o.geometry,p=geo.attributes.position,n=geo.attributes.normal,idx=geo.index,nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
   for(let i=0;i<(idx?.count??p.count);i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
    if(v.every(v=>v.distanceTo(point([0,7,0]))>35))continue;
    const mat=Array.isArray(o.material)?o.material[geo.groups.find(gr=>i>=gr.start&&i<gr.start+gr.count)?.materialIndex??0]:o.material;if(!mat||mat.visible===false)continue;
    const name=solidMaterialNameAt(o,i/3).replace(/_material$/,''),color=new THREE.Color(colors[name]??0x93866d).toArray();
    rows.push({v:v.map(v=>v.toArray()),n:[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(n,idx?idx.getX(i+j):i+j).applyNormalMatrix(nm).toArray()),c:[color,color,color],side:mat.side});
   }
  });
  for(const view of views){
   const eye=point(view.eye),localEye=[...view.eye];localEye[1]=W.cm.getGroundHeight(eye.x,eye.z,g.platformY)+1.7;
   const camera=new THREE.PerspectiveCamera(view.fov,960/540,.03,120);camera.position.copy(point(localEye));camera.lookAt(point(view.target));camera.updateMatrixWorld(true);
   if(W.cm.checkCollision(camera.position,.5))throw Error('CPU camera must be supported and collision-free');
   const label=`${g.profile}-window-${view.name}-${stage}`,cameraData={position:camera.position.toArray(),target:point(view.target).toArray(),matrixWorldInverse:camera.matrixWorldInverse.toArray(),fov:view.fov,localEye,localTarget:view.target};
   const path=`${out}/${label}.json.gz`;fs.writeFileSync(path,gzipSync(JSON.stringify({kind:'ACTUAL_PRODUCTION_MERGED_COMPONENT; CPU FLAT PALETTE, NOT BROWSER ACCEPTANCE',label,camera:cameraData,triangles:rows})));output.push({profile:g.profile,path,stage,view:view.name,triangles:rows.length,camera:cameraData});
  }
 }
 return output;
}
