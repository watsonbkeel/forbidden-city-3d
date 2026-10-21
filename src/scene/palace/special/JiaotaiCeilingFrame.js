import * as THREE from 'three';

/** Topology from museum photographs; retained hall axes and model-fit heights.
 * These are NOT a measured caisson section or a surveyed interior column grid. */
export const JIAOTAI_CENTRAL = Object.freeze({
  id:'jiaotai-central-frame-r28',source:'https://www.dpm.org.cn/explore/building/236467.html',
  dimensionStatus:'PHOTO_FIT_WITHIN_RETAINED_MODEL_NOT_SURVEY',
  hallWidth:19,hallDepth:19,bodyH:6.2,centreZ:3.02,
  halfSpan:3.10,ceilingOffset:-.03,rise:1.58,
  mirrorRadius:.35,mirrorCentreAboveCeiling:.02,
  lodDistance:90,lodHysteresis:.10,
});
export function jiaotaiFrame({w,d,H}){
  const p=JIAOTAI_CENTRAL;
  if(![w,d,H].every(Number.isFinite)||Math.abs(w-p.hallWidth)>1e-8||Math.abs(d-p.hallDepth)>1e-8||H!==p.bodyH)throw Error('Registered Jiaotai envelope required');
  return {...p,minX:-p.halfSpan,maxX:p.halfSpan,minZ:p.centreZ-p.halfSpan,maxZ:p.centreZ+p.halfSpan};
}
/** Four disjoint downward quads open ONLY the hidden planar closure. */
export function jiaotaiCeilingRing({W,D,y,tile,opening}){
  const p=jiaotaiFrame({w:19,d:19,H:6.2});
  if(!opening||opening.id!==p.id||![W,D,y,tile].every(Number.isFinite)||tile<=0)throw Error('Explicit Jiaotai ceiling opening required');
  for(const k of['minX','maxX','minZ','maxZ'])if(opening[k]!==p[k])throw Error('Unregistered Jiaotai opening');
  if(p.minX<=-W/2||p.maxX>=W/2||p.minZ<=-D/2||p.maxZ>=D/2)throw Error('Jiaotai opening exceeds ceiling');
  const pos=[],uv=[],idx=[];
  const quad=(x1,x2,z1,z2)=>{const n=pos.length/3;for(const[x,z]of[[x1,z1],[x2,z1],[x2,z2],[x1,z2]]){pos.push(x,y,z);uv.push(x/tile,z/tile);}idx.push(n,n+1,n+2,n,n+2,n+3);};
  quad(-W/2,W/2,-D/2,p.minZ);quad(-W/2,W/2,p.maxZ,D/2);quad(-W/2,p.minX,p.minZ,p.maxZ);quad(p.maxX,W/2,p.minZ,p.maxZ);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
