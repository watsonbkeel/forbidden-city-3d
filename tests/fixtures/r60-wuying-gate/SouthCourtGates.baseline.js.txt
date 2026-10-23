import {applyWenhuaGateSouthWindows} from './WenhuaGateSouthWindows.js';
import * as THREE from 'three';
import { buildStuddedDoor } from '../../HallKit.js';
const PROFILES={
 wenhua:{name:'文华门',x:-186.3,z:-245.2,w:33.1,d:17,ph:.8,colH:6.5,source:'https://www.dpm.org.cn/explore/building/236531.html'},
 wuying:{name:'武英门',x:220.8,z:-249.8,w:34.9,d:17.9,ph:.8,colH:6.6,source:'https://www.dpm.org.cn/explore/building/236500.html'},
};
export function southCourtGateGeometry(item){const p=PROFILES[item?.southGateProfile];if(!p||item.name!==p.name||item.x!==p.x||item.z!==p.z||item.w!==p.w||item.rot&&item.rot!=='south'||item.gateKind!=='five-bay')throw new Error('South court gate requires its registered five-bay model-fit profile');const bay=p.w/5,PD=p.d+1.6;return{...p,id:`south-gate:${item.southGateProfile}`,profile:item.southGateProfile,status:'OFFICIAL_TOPOLOGY_REVERSIBLE_MODEL_FIT',bays:5,pad:.8,southToe:p.z-PD/2-p.ph*1.6,northToe:p.z+PD/2+p.ph*1.6,portals:[-1,0,1].map(s=>({x:p.x+s*bay,z:p.z,width:bay-1})),limitations:['D1/OSM outer group estimates retained for gate plan; heights and detailing are reversible fits, not official measurements.']};}
export function buildSouthCourtGate(kit,item){const g=southCourtGateGeometry(item),f=kit.frame(g.x,g.z,0),b=g.w/5,ow=b-1,PW=g.w+1.6,PD=g.d+1.6,ph=g.ph,H=g.colH;
 kit.box(f,'sumeru_band',PW,ph,PD,0,ph/2,0,'band');kit.box(f,'stone_slab',PW+.1,.08,PD+.1,0,ph-.03,0);kit.walkBox(f,-PW/2,-PD/2,PW/2,PD/2,ph);kit.col(f,-PW/2+.05,0,-PD/2+.05,PW/2-.05,ph,PD/2-.05);
 const cg=new THREE.CylinderGeometry(.28,.29,H,12),mat=kit.lib.material('wood_column');
 for(let k=0;k<=5;k++)for(const z of[-g.d/2,0,g.d/2]){const x=-g.w/2+k*b;kit.mesh(f,cg,mat,x,ph+H/2,z);kit.col(f,x-.28,ph,z-.28,x+.28,ph+3,z+.28);}
 for(const x of[-1.5*b,-.5*b,.5*b,1.5*b]){kit.box(f,'wall_red',1,H,g.d-.8,x,ph+H/2,0);kit.box(f,'wall_brick',1.1,.7,g.d-.7,x,ph+.35,0);kit.col(f,x-.5,ph,-g.d/2+.4,x+.5,ph+H,g.d/2-.4);}
 for(const s of[-1,1]){kit.box(f,'wall_red',.7,H,g.d,s*g.w/2,ph+H/2,0);kit.col(f,s*g.w/2-.35,ph,-g.d/2,s*g.w/2+.35,ph+H,g.d/2);kit.box(f,'wall_red',b-1,H,.6,s*2*b,ph+H/2,0);kit.col(f,s*2*b-(b-1)/2,ph,-.3,s*2*b+(b-1)/2,ph+H,.3);kit.box(f,'caihua_beam',g.w+.5,.6,.45,0,ph+H-.3,s*g.d/2,'band');}
 for(const x of[-b,0,b]){kit.box(f,'wall_red',ow,H-4.6,.6,x,ph+4.6+(H-4.6)/2,0);kit.box(f,'wood_column',ow,.18,.35,x,ph+.09,0);for(const s of[-1,1]){const leaf=buildStuddedDoor(kit.lib,{width:ow/2-.1,height:4.6});leaf.position.set(x+s*(ow/2-.14),ph,.3+(ow/2-.1)/2);leaf.rotation.y=Math.PI/2;f.add(leaf);}for(const s of[-1,1]){const sf=new THREE.Group();sf.position.x=x;f.add(sf);sf.updateWorldMatrix(true,false);kit.steps(sf,{zEdge:s*PD/2,dir:s,y:ph,width:ow-.3});}}
 kit.roof(f,{type:'xieshan',width:g.w+.5,depth:g.d+.5,baseY:ph+H,layers:1,brackets:true});kit.plaque(f,g.name,0,ph+4.6+.06+.81,-.43,.95,1.5);const pair=kit.plaques.at(-1);for(const o of [pair.mesh,pair.frame])o.userData.nameboardMount={source:g.source,kind:'INSET_RED_DOORHEAD_NOT_OUTER_EAVE',status:'OFFICIAL_PHOTO_LAYER_WITH_MODEL_COORDINATE_FIT_NOT_SURVEYED',doorTop:ph+4.6,clearance:.06};kit.mapRect(f,'gate',g.name,g.w,g.d);f.userData.structure=g;applyWenhuaGateSouthWindows(kit,f);return{f,g,width:g.w};
}
