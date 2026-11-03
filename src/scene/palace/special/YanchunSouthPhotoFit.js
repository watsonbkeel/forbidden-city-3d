import * as THREE from 'three';
import { fitRegisteredNameboard } from './FittedNameboardMount.js';

export const YANCHUN_SOUTH_FIT=Object.freeze({
 entityId:'FC-12BEB1BB0E',status:'PHOTO_FIT_NOT_SURVEYED',visualAcceptance:'VERIFY_PENDING',photographyDate:null,
 page:'https://www.dpm.org.cn/explore/building/236524.html',
 photo:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d41b19d7f7.jpg',
 photoSHA256:'fda0c35ed50b0d23f5b4151702faec1089f74fff3c9e999d170579d159e162f9',
 scope:'SOUTH_FRONT_ONLY_FINISHED_STATE_PHOTO',unknown:['carved ornament','exact dimensions','rear/side baluster forms','capture date'],
});
function guard(c){if(c.p.key!=='yanchun'||c.item.name!=='延春阁'||c.item.x!==216||c.item.z!==485.5||c.g.w!==23.5||c.g.d!==24.3)throw Error('Yanchun photo fit requires exact retained host');}
// R163 changes appearance only. The old R66 candidate changed access geometry;
// its withdrawal is not permission to change the retained rail or roof physics.
export function fitYanchunSouthTurnedRail(c){
 guard(c);
 const role='yanchun-upper-balcony-rail',z=-8.12,close=(a,b)=>Math.abs(a-b)<1e-8;
 const first=c.f.children.findIndex(m=>m.userData.role===role&&close(m.position.z,z));
 const south=c.f.children.slice(first,first+27),bars=south.slice(2),selected=new Set(south);
 const corners=c.f.children.filter(m=>!selected.has(m)&&m.userData.role===role+'-baluster'&&close(m.position.z,z));
 const box=(m,w,h,d)=>m?.isMesh&&m.geometry.type==='BoxGeometry'&&close(m.geometry.parameters.width,w)&&close(m.geometry.parameters.height,h)&&close(m.geometry.parameters.depth,d);
 if(first<0||south.length!==27||!box(south[0],15.44,.12,.10)||!box(south[1],15.44,.09,.08)||
    !south.slice(0,2).every((m,i)=>m.userData.role===role+(i?'-lower':'')&&close(m.position.x,0)&&close(m.position.y,i?7.35:7.92)&&close(m.position.z,z))||
    !bars.every((m,i)=>m.userData.role===role+'-baluster'&&box(m,.07,.92,.07)&&close(m.position.x,-7.72+15.44*i/24)&&close(m.position.y,7.46)&&close(m.position.z,z))||
    corners.length!==2||!corners.every((m,i)=>box(m,.07,.92,.07)&&close(m.position.x,i?7.72:-7.72)&&close(m.position.y,7.46)))throw Error('Yanchun requires the complete retained south rail');
 const info={...YANCHUN_SOUTH_FIT,source:YANCHUN_SOUTH_FIT.page,
  repeatCountStatus:'RETAINED_MODEL_25_NOT_PHOTO_COUNT',dimensions:'RETAINED_MODEL_POSITIONS_HEIGHTS_ENVELOPE_NOT_SURVEYED',
  appearance:'SOUTH_PHOTO_PALE_TURNED_BALUSTERS_AND_TWO_PALE_HORIZONTAL_RAILS',materialInterpretation:'PALE_FINISH_VISIBLE_SUBSTRATE_UNKNOWN',
  profileStatus:'SIMPLIFIED_TURNED_SILHOUETTE_NOT_CARVED_OR_MEASURED',physics:'UNCHANGED_COLLIDERS_AND_NAVIGATION',cornerOverlapPolicy:'TWO_EXISTING_SIDE_ENDPOINT_BOXES_RECOLORED_ONLY'};
 const pale=new THREE.MeshStandardMaterial({name:'yanchun_south_pale_finish_photo_fit',color:0xe6dfca,roughness:.82});c.kit.owned.push(pale);
 const points=[[0,-.46],[.027,-.46],[.027,-.39],[.035,-.35],[.029,-.29],[.018,-.17],[.015,.04],[.024,.18],[.035,.28],[.029,.37],[.024,.40],[.024,.46],[0,.46]].map(([r,y])=>new THREE.Vector2(r,y));
 const turned=new THREE.LatheGeometry(points,12);
 // Lathe's axis rings create one zero-area cap triangle per segment. Remove
 // only those duplicate-axis triangles, retaining real closed cap triangles.
 const pos=turned.attributes.position,ix=turned.index,indices=[];
 for(let i=0;i<ix.count;i+=3){const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)],t=new THREE.Triangle(...ids.map(j=>new THREE.Vector3().fromBufferAttribute(pos,j)));if(t.getArea()>1e-12)indices.push(...ids);}
 turned.setIndex(indices);
 for(const m of bars){m.geometry.dispose();m.geometry=turned;}
 for(const m of [...south,...corners]){m.material=pale;Object.assign(m.userData,info);}
 c.f.userData.r163YanchunSouthRail=info;
 return info;
}
export function fitYanchunFrontPlaque(c){guard(c);return fitRegisteredNameboard(c.kit,c.f,'延春阁',{x:0,y:4.97,z:-12.35,...YANCHUN_SOUTH_FIT,reason:'FINISHED_PHOTO_HIGH_FRONT_BEAM_NOT_RECESSED_GROUND_WALL',fitRange:{y:[4.8,5.1],z:[-12.5,-12.25]},width:.9,height:1.5});}
