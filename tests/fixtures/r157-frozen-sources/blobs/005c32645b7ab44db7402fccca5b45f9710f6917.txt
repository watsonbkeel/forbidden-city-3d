import {applyWenyuanUpperSouthWindows} from './WenyuanUpperSouthWindows.js';
import {fitRegisteredNameboard} from './FittedNameboardMount.js';
import * as THREE from 'three';
import { buildRoof } from '../../RoofBuilder.js';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
export function wenyuanGeometry(item){if(item?.structure!=='wenyuan-pavilion'||item.name!=='文渊阁'||item.x!==-186.5||item.z!==-132.8||item.w!==40.5||item.d!==17.9||item.bays!==6||item.ph!==.5||item.pad!==.5)throw new Error('Wenyuan requires its explicit six-bay retained-envelope fit');return{id:'wenyuan-pavilion',x:item.x,z:item.z,w:item.w,d:item.d,ph:.5,pad:.5,bays:6,exteriorStoreys:2,historicalInternalLevels:3,lowerHeight:4.45,upperFloor:5.5,upperHeight:3.6,entry:{x:item.x-item.w/12,z:item.z-item.d/2},navigation:{id:'wenyuan-pond-approach',status:'FITTED_MODEL_ROUTE_NOT_CURRENT_VISITOR_PERMISSION',points:[{x:-186.5,z:-156.3,y:0},{x:-186.5,z:-143.2,y:.041},{x:item.x-item.w/12,z:-143.2,y:0},{x:item.x-item.w/12,z:item.z-item.d/2+1,y:.5}]},status:'OFFICIAL_TOPOLOGY_REVERSIBLE_MODEL_FIT',source:'https://www.dpm.org.cn/explore/building/236513.html',interiorPolicy:'UNFURNISHED_UNSURVEYED_NO_INVENTED_BOOKCASES',limitations:['Six bays, external two storeys/internal three levels and black tiles with green trim are official.','The third historical internal level and western end stair are not fabricated from an exterior photograph.','Envelope uses retained D1/OSM fit; storey heights, setbacks and roof rise are not surveyed.']};}
export function buildWenyuanPavilion(kit,item){const g=wenyuanGeometry(item),{structure,...plain}=item;
 const{f}=kit.hall({...plain,colH:g.lowerHeight,layers:1,interior:'empty',throne:false,enter:true});
 // Replace the generic single-body roof with an open-centred lower skirt and
 // a real upper exterior wall storey. Two eaves alone are not two storeys.
 for(const child of [...f.children])if(child.name.startsWith('roof_')){child.removeFromParent();child.traverse(n=>n.geometry?.dispose());}
 const dark=kit.lib.material('roof_tile').clone();dark.name='wenyuan_black_glazed_tile';dark.color.setHex(0x252a2b);const green=new THREE.MeshStandardMaterial({name:'wenyuan_green_glazed_edge',color:0x37694b,roughness:.38});kit.owned.push(dark,green);
 const plane=(points,mat)=>{const pos=[];for(const i of[0,1,2,0,2,3])pos.push(...points[i]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.computeVertexNormals();return kit.mesh(f,applyBoxUV(geo,kit.lib.tileSize('roof_tile')),mat,0,0,0);};
 const ow=g.w/2+1.45,od=g.d/2+1.45,iw=g.w/2-.9,id=g.d/2-1.05,low=4.92,high=6.0;
 for(const s of[-1,1]){const pts=[[-ow,low,s*od],[ow,low,s*od],[iw,high,s*id],[-iw,high,s*id]];if(s<0)pts.reverse();plane(pts,dark);kit.mesh(f,new THREE.BoxGeometry(2*ow,.13,.22),green,0,low,s*od);const ends=[[s*ow,low,od],[s*ow,low,-od],[s*iw,high,-id],[s*iw,high,id]];if(s<0)ends.reverse();plane(ends,dark);kit.mesh(f,new THREE.BoxGeometry(.22,.13,2*od),green,s*ow,low,0);}
 const uw=iw*2,ud=id*2,uy=g.upperFloor,H=g.upperHeight;
 for(const s of[-1,1]){kit.box(f,'wall_red',.45,H,ud,s*uw/2,uy+H/2,0);kit.box(f,'lattice_doors',uw,.72*H,.18,0,uy+H*.45,s*ud/2,'band');kit.box(f,'wall_red',uw,.55,.25,0,uy+.275,s*ud/2);kit.box(f,'caihua_beam',uw+.3,.5,.4,0,uy+H-.25,s*ud/2,'band');}
 const cg=new THREE.CylinderGeometry(.25,.27,H,12);for(let k=0;k<=6;k++)for(const s of[-1,1])kit.mesh(f,cg,kit.lib.material('wood_column'),-uw/2+k*uw/6,uy+H/2,s*ud/2);
 const proxy=Object.create(kit.lib);proxy.material=n=>n==='roof_tile'?dark:kit.lib.material(n);const roof=buildRoof(proxy,{detail:'low',type:'xieshan',width:uw+.5,depth:ud+.5,baseY:uy+H,layers:1,brackets:true});
 roof.traverse(n=>{if(n.isMesh&&n.material.name==='roof_ridge_glaze')n.material=green;});for(const mat of roof.userData.ownedMaterials??[])if(mat.name==='roof_ridge_glaze')mat.dispose();else kit.owned.push(mat);roof.userData.ownedMaterials=[];f.add(roof);
 g.nameboardMount=fitRegisteredNameboard(kit,f,item.name,{z:-g.d/2-.5,reason:'Retained model label in front of, never inside, the true central column; historic plaque position unverified'});
 f.userData.structure=g;applyWenyuanUpperSouthWindows(kit,f,item);return{f,g};
}
