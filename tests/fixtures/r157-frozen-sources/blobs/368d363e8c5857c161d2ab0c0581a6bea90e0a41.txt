import * as THREE from 'three';
import {buildRoof} from '../../RoofBuilder.js';

/** R71-M optional distant exterior ONLY. Every metric below is a reversible
 * engineering fit, NOT a survey. Official 225x400 Fig17 supports the south
 * axial composition, tree rows, red platform and yellow roof silhouette.
 * Printed p161 supports roof class, NOT the adjacent Zhonghuamen dimensions.
 * No portal, plaque, interior, measured spacing or destination is claimed.
 */
export const DUANMEN_FIT = Object.freeze({
  entityId:'FC-88674ADACB', centreZ:-760, platformWidth:64, platformDepth:28,
  platformHeight:11, hallWidth:52, hallDepth:19, hallHeight:7,
  roof:Object.freeze({type:'xieshan',layers:2,height:8,detail:'low'}),
  apron:Object.freeze({width:110,minZ:-810,maxZ:-650}),
  avenue:Object.freeze({width:18,minZ:-740,maxZ:-600}),
  trees:Object.freeze({x:29,firstZ:-620,spacing:12,countPerSide:10,height:10}),
});
export function buildDuanmenBackdrop(lib) {
  const p=DUANMEN_FIT,g=new THREE.Group();g.name='duanmen-distant-exterior';
  g.userData={entityId:p.entityId,stage:'DISTANT_EXTERIOR_PARTIAL',enterable:false,measured:false,
    fit:p,source:'https://www.dpm.org.cn/forum_detail/100138.html#figure17',
    limits:'边界外端门远景，尚不可进入；位置、尺度和树列为拟合，非测绘。无室内、匾额与门洞复原。'};
  const mat=(name,color)=>new THREE.MeshStandardMaterial({name,color,roughness:0.94});
  const red=mat('duanmen-fit-red',0x983d31),stone=mat('duanmen-fit-stone',0x918d80),
    wood=mat('duanmen-fit-wood',0x63382c),green=mat('duanmen-fit-tree',0x35583a);
  function box(name,w,h,d,x,y,z,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.name=name;mesh.position.set(x,y,z);g.add(mesh);return mesh;}
  // Solid coarse distant mass. Openings cannot be established from this image;
  // a fake usable arch would mislead visitors at the retained boundary.
  box('duanmen-unresolved-platform-mass',p.platformWidth,p.platformHeight,p.platformDepth,0,p.platformHeight/2,p.centreZ,red);
  box('duanmen-unresolved-upper-shell',p.hallWidth,p.hallHeight,p.hallDepth,0,p.platformHeight+p.hallHeight/2,p.centreZ,red);
  const roof=buildRoof(lib,{...p.roof,width:p.hallWidth,depth:p.hallDepth,baseY:p.platformHeight+p.hallHeight});
  roof.position.z=p.centreZ;g.add(roof);
  // Remote ground extension begins where original ground ends, never changes it.
  box('duanmen-remote-ground',p.apron.width,0.02,p.apron.maxZ-p.apron.minZ,0,-0.02,(p.apron.maxZ+p.apron.minZ)/2,stone);
  box('duanmen-fit-axial-paving',p.avenue.width,0.018,p.avenue.maxZ-p.avenue.minZ,0,0.012,(p.avenue.maxZ+p.avenue.minZ)/2,stone);
  for(const side of[-1,1])for(let i=0;i<p.trees.countPerSide;i++){
    const z=p.trees.firstZ-i*p.trees.spacing,x=side*p.trees.x;
    box('duanmen-fit-tree-trunk',0.45,5,0.45,x,2.5,z,wood);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.9,0),green);
    crown.name='duanmen-fit-tree-crown';crown.position.set(x,7,z);crown.scale.set(1,1.1,1);g.add(crown);
  }
  return g;
}
