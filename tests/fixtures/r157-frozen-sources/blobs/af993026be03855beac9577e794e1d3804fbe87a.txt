import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {cloneOverheadShape} from '../../../utils/OverheadShape.js';

export const TIANYI_FIT=Object.freeze({x:.5,z:465,bodyWidth:5.4,bodyDepth:3,platformWidth:6.3,platformDepth:3.9,floor:.45,bodyTop:4.5,radius:1.25,spring:2.1,arcSegments:24,stairRun:1.2,wingWidth:2.05,wingHeight:3.05,wingDepth:.38});
export const TIANYI_SOURCE='https://www.dpm.org.cn/explore/building/236541.html';
export function tianyiProfile(item){
  if(item.name!=='天一门'||item.gateProfile!=='tianyi'||item.gateKind!=='single-arched'||item.x!==.5||item.z!==465||item.rot!=='south')throw Error('Tianyi requires its exact named inherited south-facing anchor');
  if(item.w!==undefined&&item.w!==6.3)throw Error('Tianyi outer width is a retained map fit, not an arbitrary generic gate');
  const p=TIANYI_FIT,arc=Array.from({length:p.arcSegments+1},(_,i)=>{const a=Math.PI-i*Math.PI/p.arcSegments;return[i===0?-p.radius:i===p.arcSegments?p.radius:p.radius*Math.cos(a),p.floor+p.spring+p.radius*Math.sin(a)];});
  return{...p,arc,source:TIANYI_SOURCE,dimensionStatus:'PHOTO_FIT_AND_INHERITED_MAP_ENVELOPE_NOT_SURVEY',sourcePhotoDate:null,accepted:false};
}
export function tianyiAccess(side='south'){if(!['south','north'].includes(side))throw Error('Tianyi access side');const s=side==='south'?-1:1,p=TIANYI_FIT;return[[p.x,p.z+s*4],[p.x,p.z+s*3],[p.x,p.z+s*1.8],[p.x,p.z],[p.x,p.z-s*1.8],[p.x,p.z-s*3],[p.x,p.z-s*4]];}
export function tianyiGroundExclusions(){const p=TIANYI_FIT;return[[p.x-p.platformWidth/2,p.x+p.platformWidth/2,p.z-p.platformDepth/2,p.z+p.platformDepth/2],...[ -1,1 ].map(s=>[p.x-1.5,p.x+1.5,p.z+s*p.platformDepth/2-Math.max(0,-s*p.stairRun),p.z+s*p.platformDepth/2+Math.max(0,s*p.stairRun)]),...[-1,1].map(s=>{const x=p.x+s*(p.bodyWidth/2+p.wingWidth/2);return[x-p.wingWidth/2,x+p.wingWidth/2,p.z-p.bodyDepth/2-p.wingDepth/2,p.z-p.bodyDepth/2+p.wingDepth/2];})];}
function prism(points,z0,z1){const s=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y))),g=new THREE.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:1,steps:1});g.translate(0,0,z0);g.clearGroups();return g;}

/** B-only, one new named entity. Closed photographed doors are presented in a
 * reversible playable-open pose, not a claim of current museum access. */
export function buildTianyiGate(kit,item){
  const p=tianyiProfile(item),f=kit.frame(p.x,p.z,0);f.name='天一门';
  const glaze=new THREE.MeshStandardMaterial({name:'r64_tianyi_green_glaze_plain',color:0x29644e,roughness:.55});kit.owned.push(glaze);
  const tag=(m,role)=>{m.name=m.userData.role=role;return m;};
  const box=(role,mat,w,h,d,x,y,z,solid=false)=>{const m=tag(kit.box(f,mat,w,h,d,x,y,z),role);if(solid)kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
  const green=(role,w,h,d,x,y,z)=>{const m=box(role,'wood_column',w,h,d,x,y,z);m.material=glaze;return m;};
  box('tianyi-platform','stone_slab',p.platformWidth,p.floor,p.platformDepth,0,p.floor/2,0,true);
  kit.walkBox(f,-p.platformWidth/2,-p.platformDepth/2,p.platformWidth/2,p.platformDepth/2,p.floor);kit.walkables.at(-1).rescue=false;
  for(const s of[-1,1]){
    for(let i=0;i<3;i++){const h=p.floor*(i+1)/3,z=s*(p.platformDepth/2+p.stairRun-(i+.5)*p.stairRun/3);box('tianyi-visible-step','stone_slab',3,h,p.stairRun/3,0,h/2,z,true);}
    kit.walkRamp(f,-1.5,1.5,s*(p.platformDepth/2+p.stairRun),s*p.platformDepth/2,0,p.floor);
  }
  // A genuine concave prism, with the same piecewise inner curve as collision.
  const hw=p.bodyWidth/2,hd=p.bodyDepth/2;
  const outline=[[-hw,p.floor],[-hw,p.bodyTop],[hw,p.bodyTop],[hw,p.floor],[p.radius,p.floor],...p.arc.slice().reverse(),[-p.radius,p.floor]];
  tag(kit.mesh(f,applyBoxUV(prism(outline,-hd,hd),kit.lib.tileSize('wall_brick')),kit.lib.material('wall_brick'),0,0,0),'tianyi-arched-masonry');
  for(const s of[-1,1])kit.col(f,s<0?-hw:p.radius,p.floor,-hd,s<0?-p.radius:hw,p.bodyTop,hd);
  const points=p.arc.map(([x,y])=>[x+p.x,y]),proxy=new THREE.Box3(new THREE.Vector3(points[0][0],Math.min(...points.map(q=>q[1])),p.z-hd),new THREE.Vector3(points.at(-1)[0],p.bodyTop,p.z+hd));
  proxy.overhead=cloneOverheadShape({type:'piecewise-linear-x',points,minZ:proxy.min.z,maxZ:proxy.max.z,topY:p.bodyTop,sourceId:'garden/tianyi-arch'},proxy);kit.colliders.push(proxy);
  green('tianyi-glazed-frieze',p.bodyWidth,.32,p.bodyDepth,0,p.bodyTop+.16,0);
  for(const z of[-hd,hd])for(let i=0;i<9;i++)green('tianyi-glazed-bracket-fit',.22,.2,.42,-2.35+i*4.7/8,p.bodyTop+.4,z);
  // Existing roof builder gives a bounded xieshan shell, not a generic timber hall.
  tag(kit.roof(f,{type:'xieshan',width:5.4,depth:3,overhang:.45,baseY:p.bodyTop+.5,height:.95,brackets:false,detail:'low'}),'tianyi-yellow-xieshan-roof');
  for(const s of[-1,1]){
    const x=s*(hw+p.wingWidth/2),z=-hd;
    box('tianyi-screen-foot','stone_slab',p.wingWidth,.4,p.wingDepth,x,.2,z,true);
    box('tianyi-screen-plain-field','wall_red',p.wingWidth,p.wingHeight-.4,p.wingDepth,x,(p.wingHeight+.4)/2,z,true);
    for(const y of[.48,p.wingHeight-.08])green('tianyi-screen-green-border',p.wingWidth,.16,p.wingDepth+.02,x,y,z);
    for(const q of[-1,1])green('tianyi-screen-green-border',.13,p.wingHeight-.5,p.wingDepth+.02,x+q*(p.wingWidth/2-.065),(p.wingHeight+.4)/2,z);
    tag(kit.roof(f,{type:'xieshan',width:p.wingWidth,depth:.65,overhang:.2,baseY:p.wingHeight,height:.5,brackets:false,detail:'low'},x,z),'tianyi-screen-yellow-roof');
  }
  // Front-plane hinges and outward playable pose keep the arched high ends out
  // of the lower lateral vault. This clearance fit is not a surveyed hinge pose.
  const open=item.open!==false;
  for(const s of[-1,1]){
    const half=p.arc.filter(([x])=>s*x>=-1e-10),ends=half.map(([x,y])=>[x-s*p.radius,y]);
    const poly=[...ends,[half.at(-1)[0]-s*p.radius,p.floor],[half[0][0]-s*p.radius,p.floor]];
    const leaf=tag(kit.mesh(f,prism(poly,-.05,.05),kit.lacquer,s*p.radius,0,0),'tianyi-arched-door-leaf');
    leaf.position.x=s*(p.radius+(open?-.015:0));leaf.position.z=-hd-.06;if(open)leaf.rotation.y=-s*Math.PI/2;
    leaf.userData.pose=open?'PLAYABLE_OPEN_NOT_MUSEUM_PERMISSION':'CLOSED';
    f.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(leaf);kit.colliders.push(b);
  }
  for(const s of[-1,1])for(const z of[-p.platformDepth/2,p.platformDepth/2]){
    const len=(p.platformWidth-3)/2,cx=s*(1.5+len/2);
    box('tianyi-stone-rail','marble',len,.42,.16,cx,p.floor+.3,z,true);
    box('tianyi-stone-handrail','marble',len,.1,.22,cx,p.floor+.72,z,true);
    for(const x of[s*1.55,s*(p.platformWidth/2-.1)])box('tianyi-stone-post','marble',.18,.85,.18,x,p.floor+.425,z,true);
  }
  kit.plaque(f,'天一門',0,p.bodyTop+.22,-hd-.11,.62,.9);
  kit.mapRect(f,'gate','天一门',p.platformWidth,p.platformDepth,{gateProfile:'tianyi',dimensionStatus:p.dimensionStatus,platformY:p.floor});
  f.userData.structure={...p,id:'garden/tianyi-gate',gateProfile:'tianyi',gateKind:'single-arched',portalCount:1,streamLayer:'B',openState:open?'PLAYABLE_OPEN_NOT_MUSEUM_PERMISSION':'CLOSED',sourceDoorPose:'CLOSED_IN_SOUTH_PHOTO_PARTLY_OPEN_IN_REAR_PHOTO',sculpture:'UNRECONSTRUCTED_NO_GENERIC_XIEZHI_OR_SCREEN_ORNAMENT',plaque:'HAN_ONLY_SIMPLIFIED_FRAME_MANCHU_OMITTED',courtWalls:'UNRECONSTRUCTED_BEYOND_PAIRED_PHOTOGRAPHED_SCREENS'};
  return p.platformWidth;
}
