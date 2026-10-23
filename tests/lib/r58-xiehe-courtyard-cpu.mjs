// Writes CPU inputs from supplied ACTUAL merged triangles. Never builds a world.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {xieheGeometry} from './r58-xiehe-courtyard-world-check.mjs';
const colors={wood_column:0x8c2d22,caihua_beam:0x357e80,dougong_band:0x335d62,wall_red:0x89382e,wall_brick:0x827c70,stone_slab:0xb4afa0,marble:0xc4bca5,roof_tile:0xcb9828,rafters:0x82573a,kit_lacquer:0x75251f};
const views=[{name:'courtyard-wide',eye:[0,1.7,38],target:[0,7,0],fov:53},{name:'courtyard-paired-knees',eye:[3,0,11],target:[3,7.8,5],fov:46}];
export function exportXieheCourtyardViews(W,out,stage,{scope='ACTUAL_MERGED_COMPONENT_ONLY'}={}){
 if(!['before','after'].includes(stage))throw Error('Stage must be before or after');
 const g=xieheGeometry(),toWorld=p=>{const [x,z]=g.toWorld(p[0],p[2]);return new THREE.Vector3(x,p[1],z);};
 W.scene.updateMatrixWorld(true);fs.mkdirSync(out,{recursive:true});
 const output=[];
 for(const view of views){
  const localEye=[...view.eye],eye=toWorld(localEye);localEye[1]=W.cm.getGroundHeight(eye.x,eye.z,g.platformY)+1.7;
  const camera=new THREE.PerspectiveCamera(view.fov,960/540,.03,100);camera.position.copy(toWorld(localEye));camera.lookAt(toWorld(view.target));camera.updateMatrixWorld(true);
  if(W.cm.checkCollision(camera.position,.5))throw Error('Diagnostic camera must be supported and collision-free');
  const triangles=[];
  W.scene.traverse(o=>{
   if(!o.isMesh||o.isInstancedMesh)return;for(let p=o;p;p=p.parent)if(!p.visible)return;
   const geo=o.geometry,pos=geo.attributes.position,norm=geo.attributes.normal,idx=geo.index,nm=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
   for(let i=0;i<(idx?.count??pos.count);i+=3){
    const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(pos,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
    // Preserve the actual supplied scene. Bound export to the gate vicinity;
    // this is a diagnostic crop, not reconstructed/replaced neighbouring geometry.
    if(v.every(p=>p.distanceTo(toWorld([0,7,0]))>45))continue;
    const mat=Array.isArray(o.material)?o.material[geo.groups.find(gr=>i>=gr.start&&i<gr.start+gr.count)?.materialIndex??0]:o.material;
    if(!mat||mat.visible===false)continue;
    const name=solidMaterialNameAt(o,i/3).replace(/_material$/,''),color=new THREE.Color(colors[name]??0x93866d).toArray();
    const n=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(norm,idx?idx.getX(i+j):i+j).applyNormalMatrix(nm).toArray());
    triangles.push({v:v.map(p=>p.toArray()),n,c:[color,color,color],side:mat.side});
   }
  });
  const label=`xiehe-${view.name}-${stage}`,data={kind:`${scope}; CPU FLAT-PALETTE DIAGNOSTIC, NOT BROWSER ACCEPTANCE`,label,camera:{position:camera.position.toArray(),target:toWorld(view.target).toArray(),fov:view.fov,matrixWorldInverse:camera.matrixWorldInverse.toArray(),localEye,localTarget:view.target},triangles};
  const path=`${out}/${label}.json.gz`;fs.writeFileSync(path,gzipSync(JSON.stringify(data)));output.push({path,scope,stage,camera:data.camera,triangles:triangles.length});
 }
 return output;
}
