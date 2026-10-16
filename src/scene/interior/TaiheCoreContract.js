import * as THREE from 'three';
import { applyTaiheColumnResponse } from '../palace/special/TaiheColumnResponse.js';
import { attachTaiheColumnTextures } from '../palace/special/TaiheColumnSurface.js';
import { TAIHE_CORE as P, TAIHE_CORE_CONTRACT as CONTRACT, TAIHE_FALLBACK_OWNER } from '../palace/special/TaiheCoreProfile.js';
import { taiheGlyphMaterial } from '../palace/special/TaiheCore.js';

// Runtime-only identities: asset extras cannot request disposal exemptions.
const sharedAtlases = new WeakMap();
const sharedColumnAtlases = new WeakMap();
export const isTaiheSharedAtlas = (material, texture) => sharedAtlases.get(material) === texture || sharedColumnAtlases.get(material)?.has(texture) === true;

/** The only switchable meshes are explicitly owned fallback batches, never a material bucket. */
export function taiheFallbackMeshes(scene) {
  const owned=[];scene.traverse(o=>{if(o.isMesh&&o.userData.taiheCoreOwner===TAIHE_FALLBACK_OWNER)owned.push(o);});return owned;
}
export function validateTaiheCore(root,cfg) {
  const contracts=[];root.traverse(o=>{if(o.name==='TAIHE_CORE_CONTRACT')contracts.push(o);});
  if(contracts.length!==1)throw new Error('Taihe core requires exactly one profile contract');
  const c=contracts[0].userData;
  for(const [key,value] of Object.entries(CONTRACT))if(c[key]!==value)throw new Error(`Taihe core ${key} mismatch`);
  if(c.profileSHA256!==cfg.asset?.profileSHA256||c.sourceSHA256!==cfg.asset?.sourceSHA256)throw new Error('Taihe core source/profile digest mismatch');
  if(c.columnSurfaceUVSHA256!==cfg.asset?.columnSurfaceUVSHA256)throw new Error('Taihe column UV source digest mismatch');
  let tris=0,meshes=0;const mats=new Set();root.updateMatrixWorld(true);
  root.traverse(o=>{
    if(!o.isMesh)return;
    if(/^(COL_|WALK_)/.test(o.name))throw new Error('Taihe core may not replace permanent navigation');
    if(Array.isArray(o.material))throw new Error('Taihe core expects single-material batches');
    const position=o.geometry?.attributes?.position;
    const count=o.geometry?.index?.count??position?.count;
    if(!position||position.count===0||!Number.isFinite(count)||!Number.isInteger(count)||count<=0||count%3!==0||!position.array.every(Number.isFinite))throw new Error('Taihe core nonfinite or empty geometry');
    meshes++;mats.add(o.material);tris+=count/3;
    const box=new THREE.Box3().setFromObject(o);
    if(box.isEmpty()||![...box.min.toArray(),...box.max.toArray()].every(Number.isFinite))throw new Error('Taihe core nonfinite or empty bounds');
    if(box.min.x< -5 || box.max.x>5 ||box.min.z< -6.2||box.max.z>14.2||box.min.y<-.001||box.max.y>P.caisson.topY+.0001)throw new Error('Taihe core escapes approved envelope');
  });
  if(!Number.isFinite(tris)||!Number.isInteger(tris)||tris!==cfg.asset?.renderableTriangles||tris>P.budgets.sVisibleTriangles||meshes>P.budgets.visibleMaterialBatches||mats.size>P.budgets.visibleMaterialBatches)throw new Error('Taihe core geometry budget mismatch');
  if(![...mats].some(m=>m.name==='taihe_glyph_atlas'))throw new Error('Taihe core lettering atlas missing');
  return {triangles:tris,meshes};
}
export function installTaiheGlyphs(root,atlas) {
  if(!atlas?.isTexture)throw new Error('Taihe fallback lettering atlas unavailable');
  const material=taiheGlyphMaterial(atlas),old=new Set();
  sharedAtlases.set(material,atlas);
  root.traverse(o=>{if(o.isMesh&&o.material.name==='taihe_glyph_atlas'){old.add(o.material);o.material=material;}});
  old.forEach(m=>m.dispose());
}

export function installTaiheColumnTextures(root, fallbackGold) {
  if(!fallbackGold?.map?.isTexture || !fallbackGold?.bumpMap?.isTexture || fallbackGold.roughnessMap!==fallbackGold.bumpMap)throw new Error('Taihe fallback column atlas unavailable');
  const textures={color:fallbackGold.map,relief:fallbackGold.bumpMap};
  root.traverse(o=>{if(o.isMesh&&o.material.name==='taihe_gold'){attachTaiheColumnTextures(o.material,textures);sharedColumnAtlases.set(o.material,new Set(Object.values(textures)));applyTaiheColumnResponse(o,root);}});
}
