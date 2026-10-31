import * as THREE from 'three';
import {QIANQING_FLOORS} from '../../../controls/QianqingAssemblySupport.js';
/** Nominal common terrace from the Palace Museum's 后三宫 description.
 * The small one-stone hall lip is a PHOTO-FIT trial, not a surveyed height.
 * Current official oblique views show the three halls opening near the common
 * deck, rather than three additional 1.5–2m staircases stacked on it.
 */
export const INNER_PALACE_LEVELS = Object.freeze({
  terraceY: 2,
  hallLip: .16,
  hallFloorY: 2.16,
  causewayWidth: 10,
  heightSource: 'https://www.dpm.org.cn/explore/building/236467.html',
  widthSource: 'https://img.dpm.org.cn/Uploads/pdf/2201/T00007_00.pdf',
  heightStatus: 'museum nominal common terrace; local level datum approximate',
  lipStatus: 'single-stone topology photo-compared; 0.16m is provisional',
  widthStatus: '1983 museum article states approximately 10m; edge basis unspecified',
});

export function buildInnerPalaceLip(b, g, { z0, w, d, y, ph, surfaceMaterial = null }) {
  if (y !== INNER_PALACE_LEVELS.terraceY || ph !== INNER_PALACE_LEVELS.hallLip)
    throw new Error('Inner-palace common-deck/lip interface drift');
  const lip = b.libBox(g, 'stone_slab', w, ph, d, 0, y + ph / 2, z0, 'box');
  if (surfaceMaterial) lip.material = surfaceMaterial;
  // R118: only the existing Qianqing low lip uses its finished Float32
  // body/support, with the original live terrace as its bounded handoff.
  if(z0===316.8&&w===49&&d===28){
    lip.updateWorldMatrix(true,false);const p=lip.geometry.attributes.position,points=[];
    for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(lip.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}
    const owner=new THREE.Box3().setFromPoints(points);
    owner.furnitureMotionScope={kind:'qianqing-assemblies',id:'qianqing-terrace-hall-lip',floor:QIANQING_FLOORS.terrace,minOffsetX:-1,maxOffsetX:owner.max.x-owner.min.x+1,minOffsetZ:-1,maxOffsetZ:owner.max.z-owner.min.z+1};
    // Keep the original geometry-only builder interface (col/walkBox) usable.
    // Production builders expose the owner array and retain the exact scope.
    if(Array.isArray(b.colliders))b.colliders.push(owner);else b.col(...owner.min.toArray(),...owner.max.toArray());
    b.walkBox(owner.min.x,owner.min.z,owner.max.x,owner.max.z,owner.max.y);return y+ph;
  }
  b.walkBox(-w / 2, z0 - d / 2, w / 2, z0 + d / 2, y + ph);
  // This is the actual low stone body, not an invisible tall stair cheek.
  // The unchanged player step clearance permits stepping onto it from the deck.
  b.col(-w / 2, y, z0 - d / 2, w / 2, y + ph, z0 + d / 2);
  return y + ph;
}
