import * as THREE from 'three';

// Existing aligned asset, not a claim of measured or complete historical furniture.
export const HUANGJI_ASSET = '/models/interiors/huangji-aligned-0a79ec49e8cd.glb';
export const HUANGJI_FALLBACK_ROLE = 'huangji-kit-throne-fallback';
const PARTS = ['dais', 'seat', 'back', 'screen'];
const TRIANGLES = Object.freeze({COL_0:12,COL_1:12,COL_2:12,COL_3:12,COL_dais:12,dais_low:12,floor_base:12,floor_tiles:6160,merged_caisson_blue:460,merged_gold_lacquer:16192,merged_mirror_pearl:640,merged_red_lacquer:168,merged_stone:368,throne_cushion:12,WALK_dais_low:12});

export function huangjiFallbackMeshes(scene) {
  const found=[];
  scene.traverse(o=>{if(o.isMesh&&o.userData.role===HUANGJI_FALLBACK_ROLE)found.push(o);});
  if(found.length!==4||new Set(found.map(o=>o.userData.fallbackPart)).size!==4||found.some(o=>o.userData.catalogId!=='place-ningshou-b607aa467b'||!PARTS.includes(o.userData.fallbackPart)||o.userData.noMerge!==true||!o.visible))throw new Error('Huangji fallback ownership unavailable');
  return found;
}

export function validateHuangjiLayer(root,cfg) {
  if(cfg?.id!=='huangji'||cfg.model!==HUANGJI_ASSET)throw new Error('Huangji aligned asset contract mismatch');
  root.updateMatrixWorld(true);const seen=new Set(),bounds=new THREE.Box3();
  root.traverse(o=>{
    if(!o.isMesh)return;
    const p=o.geometry?.attributes.position,idx=o.geometry?.index;
    if(!p||seen.has(o.name)||TRIANGLES[o.name]!==((idx?.count??p.count)/3))throw new Error('Huangji asset mesh inventory mismatch');
    seen.add(o.name);
    for(const x of o.matrixWorld.elements)if(!Number.isFinite(x))throw new Error('Huangji nonfinite matrix');
    const v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
      if(!Number.isFinite(v.x)||!Number.isFinite(v.y)||!Number.isFinite(v.z))throw new Error('Huangji nonfinite geometry');
      if(!/^(COL_|WALK_)/.test(o.name))bounds.expandByPoint(v);
    }
  });
  if(seen.size!==Object.keys(TRIANGLES).length)throw new Error('Huangji incomplete aligned layer');
  const expected=[-24.8,0,-13.05,24.8,7.790188789,13.050322533];
  const actual=[...bounds.min.toArray(),...bounds.max.toArray()];
  if(actual.some((v,i)=>Math.abs(v-expected[i])>.002))throw new Error('Huangji aligned geometry bounds mismatch');
  return bounds;
}
