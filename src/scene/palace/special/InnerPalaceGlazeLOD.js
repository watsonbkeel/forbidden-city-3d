import * as THREE from 'three';
import { mergeByMaterial } from '../../../utils/MergeUtils.js';

// A 0.65m wall subtends about2px at240m in the1280x720/FOV70 budget view.
// Keep every cap/cheek, but only one in four tiny openwork modules at that range.
// Near geometry and all collision remain exact. This is a visual LOD trial.
export const INNER_GLAZE_LOD = Object.freeze({ distance:240, hysteresis:.1, moduleStride:4, centerZ:366 });
const prefix='inner-palace-glazed-brick:';
export function captureInnerGlazeCoarse(root) {
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),g=new THREE.Group();
 root.traverse(m=>{
  if(!m.isMesh||!m.material.name.startsWith(prefix)||m.userData.innerGlazeCoarse!==true)return;
  const geometry=m.geometry.clone();geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld));
  const copy=new THREE.Mesh(geometry,m.material);copy.castShadow=m.castShadow;copy.receiveShadow=m.receiveShadow;g.add(copy);
 });
 if(!g.children.length)throw Error('Rear-palace coarse glaze source missing');
 return mergeByMaterial(g,{name:'rear-glaze-far'});
}
export function installInnerGlazeLOD(root,coarse) {
 const meshes=root.children.filter(m=>m.isMesh&&m.material.name.startsWith(prefix));
 if(meshes.length!==2||coarse.children.length!==2)throw Error('Rear glaze requires exactly two colour batches per level');
 const fine=new THREE.Group();fine.name='rear-glaze-near';for(const m of meshes)fine.add(m);
 const lod=new THREE.LOD();lod.name='rear-glaze-distance-detail';lod.position.z=INNER_GLAZE_LOD.centerZ;
 for(const g of[fine,coarse])g.position.z=-INNER_GLAZE_LOD.centerZ;
 lod.addLevel(fine,0);lod.addLevel(coarse,INNER_GLAZE_LOD.distance,INNER_GLAZE_LOD.hysteresis);coarse.visible=false;root.add(lod);
 lod.userData.detailStatus='240m visual LOD trial; near shapes and collisions unchanged';
 return lod;
}
