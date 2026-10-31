import * as THREE from 'three';
import {applyBandUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236430.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed051855.jpg';
/** Exact front-hall binding, not a general palace window default. Official
 * front view and text distinguish five middle door bays from four end windows.
 * Sill height/spacing are reversible fits. Fine six-wan joinery is not restored.
 */
export function applyFengxianFrontWindows(kit,zone,item,built) {
 if(zone!=='east-six'||item.name!=='奉先殿')return false;
 const expected={x:-182.3,z:253.3,w:52.6,d:30.5,pad:1.2,ph:1.2,colH:8.32,bays:9,layers:2,roof:'wudian'};
 for(const[k,v]of Object.entries(expected))if(item[k]!==v)throw Error('Fengxian front identity/profile mismatch: '+k);
 const {f}=built;if(f.userData.fengxianFrontWindows)throw Error('Fengxian window hook applied twice');
 const bay=item.w/9,sill=1.05,fields=[];
 for(const index of[0,1,7,8]){
  const x=-item.w/2+(index+.5)*bay,z=-item.d/2;
  const targets=f.children.filter(m=>m.isMesh&&(m.geometry.index?.count??m.geometry.attributes.position.count)===36&&Math.abs(m.position.x-x)<1e-7&&Math.abs(m.position.z-z)<1e-7&&['lattice_doors','lattice_doors_material'].includes(m.material?.name));
  if(targets.length!==1)throw Error('Fengxian front window geometry missing/ambiguous');
  const panel=targets[0],old=panel.geometry;old.computeBoundingBox();const size=old.boundingBox.getSize(new THREE.Vector3()),{x:width,y:height,z:depth}=size;
  if(Math.abs(depth-.14)>1e-6)throw Error('Unexpected Fengxian window thickness');
  if(height<=sill)throw Error('Fengxian invalid window sill');
  panel.geometry=applyBandUV(new THREE.BoxGeometry(width,height-sill,depth),kit.lib.tileSize('lattice_doors'));
  panel.position.y+=sill/2;old.dispose();
  panel.userData.fengxianFrontWindow={bay:index,sillY:item.ph+sill,status:'PHOTO_TOPOLOGY_WITH_FITTED_METRICS'};
  const base=kit.box(f,'wall_red',width,sill,.14,x,item.ph+sill/2,z,'band');
  base.userData.fengxianFrontSill={bay:index};
  fields.push({bay:index,x,width,bottomY:item.ph+sill,topY:item.ph+height,sillHeight:sill});
 }
 f.userData.fengxianFrontWindows={source:SOURCE,photo:PHOTO,photographDate:null,status:'PARTIAL',accepted:false,
  frontBays:9,middleDoorBays:[2,3,4,5,6],openDoorBays:[4],fields,
  dimensions:'RETAINED_FOOTPRINT_AND_PHOTO_COMPATIBLE_SILL_FIT_NOT_SURVEYED',
  residual:'Inherited generic lattice texture is not a faithful six-wan joinery/calligraphy replica. Rear facade, connector, ritual furniture and terrace remain separately unresolved.'};
 f.userData.structure={...f.userData.structure,id:'fengxian-front-hall',objectId:'FC-D8AEF2E8A9',scope:'FRONT_FACADE_ONLY',x:item.x,z:item.z,frontWindowReview:f.userData.fengxianFrontWindows};
 return true;
}
