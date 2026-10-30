import {fitFanhuaFloorFascia} from './FanhuaFloorFascia.js';
import {buildFanhuaFrontBalustrade} from './FanhuaFrontBalustrade.js';
import * as THREE from 'three';
import {buildXishangChannel} from './XishangChannel.js';
import {buildXishangStoneRails} from './XishangStoneRails.js';
import {fitNingshouSouthPhotoWindows} from './NingshouSouthPhotoWindows.js';

/**
 * R48 isolated, exact-identity NingShou architecture. Sources establish forms,
 * never the retained map dimensions. Legacy furnishings are explicitly marked
 * unverified and retained where they do not conflict with an attested plan.
 * Local -X is east, -Z is the principal front, and y=0 is courtyard ground.
 */
const DPM = n => `https://www.dpm.org.cn/explore/building/${n}.html`;
const FIT = 'MODEL_FIT_NOT_SURVEY';
const BASE = [
 ['place-ningshou-e66dfe768f','宁寿宫',-294.5,319.1,48.8,19.7,1,7.68,7,3,236471,'ningshou'],
 ['place-ningshou-e604d58704','遂初堂',-253.1,422.1,17.1,10.1,.5,5.5,5,3,236512,'suichu'],
 ['place-ningshou-9a08e177bc','寻沿书屋',-334.5,423.7,17.6,10.7,.5,5.5,5,1,236546,'xunyan'],
 ['place-ningshou-0d5f3d5831','庆寿堂',-334.8,439.6,17,9.8,.5,5.5,5,1,236539,'qingshou'],
 ['place-ningshou-7616c3b4b6','景福宫',-338.5,492.2,19.7,19.7,.8,6.5,5,5,236571,'jingfu'],
 ['place-ningshou-fadd286b97','禊赏亭',-240.7,371.4,6.7,12.4,.5,4.5,3,3,236514,'xishang'],
 ['place-ningshou-47ec73915d','碧螺亭',-259.1,465.1,5,4.9,.5,6,5,0,236435,'biluo'],
 ['place-ningshou-15c0d4e6bc','景祺阁',-293.3,496.8,31,11.2,.8,10.24,7,3,236480,'jingqi'],
 ['place-ningshou-c7215a0eda','延趣楼',-242.9,439.1,9.8,14,.5,8,5,3,236515,'yanqu'],
 ['place-ningshou-b6cde8615b','萃赏楼',-260.7,456.3,20.5,10.9,.5,8,5,3,236433,'cuishang'],
 ['place-ningshou-78e6a34c2d','阅是楼',-334.5,390.1,18.4,10.2,.5,8,5,3,236461,'yueshi'],
 ['place-ningshou-2318b5f73b','佛日楼',-319.8,513.3,11.5,8.9,.5,7,3,1,236573,'fori'],
 // R99 bounded engineering clearance fit, not a survey: move this entire
 // hall 2.25 south to clear the NE corner solid while retaining Jingfu access.
 ['place-ningshou-d40cef5893','梵华楼',-340,511.05,25.8,8.6,.5,7,7,1,236572,'fanhua'], ['place-ningshou-e32471b7c3','养性殿',-293.8,386.3,37.9,23.3,.9,7.36,9,4,236458,'yangxing'],
 ['place-ningshou-c715f850da','乐寿堂',-293.4,435.3,36.15,23.2,.9,7.36,7,3,236470,'leshou'],
 ['place-ningshou-722e40e471','符望阁',-259.1,484.6,23.1,22.5,1,12,5,5,236495,'fuwang'],
 ['place-ningshou-f4d12b27e6','倦勤斋',-252.6,513.6,31.5,8.8,.5,5.5,9,1,236478,'juanqin'],
 ['place-ningshou-82e7771bd4','畅音阁',-336.6,365.5,15.5,14.7,1.2,9.69,3,3,236437,'changyin'],
 ['place-ningshou-b607aa467b','皇极殿',-293.2,287.7,49.8,26.3,1.5,8.64,9,5,236476,'huangji'],
];
const freeze = o => { for (const v of Object.values(o)) if(v && typeof v==='object' && !Object.isFrozen(v)) freeze(v); return Object.freeze(o); };
function profile(row) {
 const [id,name,x,z,w,d,ph,colH,bays,depthBays,page,key]=row;
 if(['yangxing','leshou','fuwang','juanqin','changyin','huangji'].includes(key))return finalProfile(row);
 const rotated=key==='xishang'||key==='yanqu',localW=rotated?d:w,localD=rotated?w:d;
 const gallery=key==='jingqi'?1.3:['fori','fanhua'].includes(key)?1.1:key==='ningshou'?1.7:key==='jingfu'?1.65:key==='xishang'?0:Math.min(1.25,localD*.13);
 const p={id,name,key,zone:'ningshou',mode:'replace',x,z,w,d,ph,colH,bays,depthBays,localW,localD,gallery,rot:rotated?Math.PI/2:0,storeys:1,eaveCount:key==='biluo'?2:1,dimensionStatus:FIT,currentInventoryVerified:false,source:DPM(page),targetState:'OFFICIAL_ARCHITECTURE_DESCRIPTION_PARTIAL_FITTED_INTERPRETATION_NOT_2026_INVENTORY',portals:[],unknown:['Unpublished component dimensions and exact decorative patterns.','Current room inventory and visitor access are not established.']};
 const levelHeight={jingqi:4.65,yanqu:3.8,cuishang:3.8,yueshi:3.8,fori:3.2,fanhua:3.35}[key];
 if(levelHeight){p.storeys=2;p.eaveCount=key==='jingqi'?2:1;p.upperFloorY=ph+levelHeight;p.floorHeightStatus=FIT;p.upperAccess=key==='jingqi'?'FITTED_STAIR_AT_OFFICIAL_EAST_END_BAY_NO_TELEPORT':'ARCHITECTURAL_VIEWING_ONLY_STAIR_LOCATION_UNVERIFIED';}
 if(levelHeight){const iw=localW-(key==='yanqu'?gallery*2:0),width=Math.min(2.8,iw/bays-.6);p.portals=[{x:0,z:-localD/2+gallery,width,side:'front',status:'OFFICIAL_CENTRAL_BAY_FITTED_OPENING'},...(key==='cuishang'?[-1,1].map(i=>({x:i*localW/5,z:localD/2-gallery,width:2.8,side:'rear',status:'OFFICIAL_REAR_SECONDARY_BAY_FITTED_OPENING'})):[])];}
 else if(key==='ningshou')p.portals=[{x:-localW/7,z:-localD/2+gallery,width:3.2,side:'front',status:'OFFICIAL_EAST_SECONDARY_BAY_LOCATION_FITTED_OPENING'},...[-1,0,1].map(i=>({x:i*localW/7,z:localD/2-gallery,width:3.2,side:'rear',status:'OFFICIAL_REAR_CENTRAL_AND_SECONDARY_DOORS_FITTED_OPENINGS'}))];
 else if(key==='xishang')p.portals=[{x:0,z:-localD/2,width:2.2,side:'front',status:'FITTED_EAST_GALLERY_ACCESS'}];
 else if(key==='biluo')p.portals=[{x:-1.45,z:-.47,width:1.5,side:'east',status:'FITTED_EAST_SIDE_GROUND_VIEWING_ACCESS_MOUNTAIN_AND_SOUTH_BRIDGE_DEFERRED'}];
 else p.portals=[{x:0,z:-localD/2+gallery,width:Math.min(2.8,localW/bays-.6),side:'front',status:'OFFICIAL_CENTRAL_BAY_FITTED_OPENING'},...(key==='jingfu'?[{x:-(localW-gallery*2)*.4,z:localD/2-gallery,width:2.2,side:'rear',status:'OFFICIAL_REAR_EAST_END_BAY_FITTED_OPENING'}]:[{x:0,z:localD/2-gallery,width:Math.min(2.8,localW/bays-.6),side:'rear',status:'OFFICIAL_THROUGH_HALL_FITTED_OPENING'}])];
 p.portals=p.portals.map(q=>({...q,localX:q.x,localZ:q.z,worldX:x+Math.cos(p.rot)*q.x+Math.sin(p.rot)*q.z,worldZ:z-Math.sin(p.rot)*q.x+Math.cos(p.rot)*q.z}));
 for(const q of p.portals){const sign=q.side==='rear'?1:-1,pad=key==='ningshou'? .8:['jingfu','jingqi'].includes(key)?.8:.5,edge=key==='biluo'?sign*Math.min(localW,localD)*.38*1.35:sign*(localD/2+pad),toe=edge+sign*(ph>.55?ph*2.1:.05);q.approachX=key==='jingfu'&&q.side==='rear'?q.x-.8:q.x;const ax=q.approachX;const points=[[ax,toe+sign,0],[ax,toe,0],...(ph>.55?[[ax,(toe+edge)/2,ph/2]]:[]),[ax,edge-sign*.15,ph],...(ax!==q.x?[[ax,sign*(localD/2-.9),ph],[q.x,q.z+sign*.65,ph]]:[]),[q.x,q.z,ph],[q.x,q.z-sign*.7,ph]];q.approachPoints=points.map(([lx,lz,feetY])=>({localX:lx,localZ:lz,x:x+Math.cos(p.rot)*lx+Math.sin(p.rot)*lz,z:z-Math.sin(p.rot)*lx+Math.cos(p.rot)*lz,feetY}));}
 if(key==='biluo'){const q=p.portals[0];q.approachX=-3.6;q.normalLocalX=-1;q.normalLocalZ=0;q.normalWorldX=-1;q.normalWorldZ=0;q.approachPoints=[[-3.6,-.47,0],[-3.1,-.47,0],[-2.65,-.47,ph/2],[-2.2,-.47,ph],[-1.45,-.47,ph],[-.65,-.25,ph]].map(([localX,localZ,feetY])=>({localX,localZ,x:x+localX,z:z+localZ,feetY}));}
 // Local stone-field support only; route coordinates and the pavilion floor stay fixed.
 if(key==='xishang')for(const q of p.portals.flatMap(q=>q.approachPoints)){const halfW=localW*.66*.78/2,center=-localD*.32,halfD=localD*.32/2;if(Math.abs(q.localX)<=halfW&&Math.abs(q.localZ-center)<=halfD)q.feetY=ph+.2;}
 p.navigation={floorY:ph,upperDestinations:false,portals:p.portals,approachPoints:p.portals[0].approachPoints,spawn:key==='ningshou'?{x:-localW/7,z:-localD*.15}:key==='xishang'?{x:0,z:-localD*.3}:{x:0,z:0},status:'MODEL_CIRCULATION_NOT_MUSEUM_PERMISSION'};
 return freeze(p);
}
/** Final high-specificity profiles keep published facts separate from fitted
 * levels, dimensions and access. No upper destination is ever registered. */
function finalProfile(row) {
 const[id,name,x,z,w,d,ph,colH,bays,depthBays,page,key]=row;
 const gallery={yangxing:0,leshou:1.8,fuwang:1.5,juanqin:1.1,changyin:0,huangji:1.7}[key];
 const rot=key==='changyin'?Math.PI:0,p={id,name,key,zone:'ningshou',mode:key==='huangji'?'augment':'replace',x,z,w,d,ph,colH,bays,depthBays,localW:w,localD:d,gallery,rot,storeys:1,eaveCount:key==='huangji'?2:1,dimensionStatus:FIT,currentInventoryVerified:false,source:DPM(page),targetState:'OFFICIAL_ARCHITECTURE_DESCRIPTION_PARTIAL_FITTED_INTERPRETATION_NOT_2026_INVENTORY',unknown:['Exact dimensions and inventories are unverified unless explicitly cited.','Upper stair geometry and present museum visitor access are not established.']};
 if(key==='yangxing'){p.mainBays=3;p.partialUpperFloor=true;p.upperFloorY=4.5;p.upperAccess='WEST_SHRINE_ARCHITECTURAL_VIEW_ONLY';}
 if(key==='leshou'){p.storeys=2;p.partialUpperFloor=true;p.upperFloorY=6.6;p.eaveY=12.5;p.publishedGroundToRidge=18.7;p.modelRidgeY=18.7;p.heightDatum='OFFICIAL_COURTYARD_GROUND_TO_MAIN_RIDGE';p.upperAccess='ARCHITECTURAL_VIEWING_ONLY';}
 if(key==='fuwang'){p.partialIntermediateFloor=true;p.upperBays=3;p.upperLocalW=w*.66;p.upperLocalD=d*.66;p.storeys=3;p.eaveCount=2;p.upperFloorYs=[5,9];p.upperFloorY=5;p.upperAccess='ARCHITECTURAL_VIEWING_ONLY';}
 if(key==='juanqin'){p.partialUpperFloor=true;p.upperFloorY=3.35;p.upperAccess='ARCHITECTURAL_VIEWING_ONLY';}
 if(key==='changyin'){p.storeys=3;p.eaveCount=3;p.stageFloorYs=[ph,6.2,11.2];p.upperFloorY=6.2;p.roofBaseY=16.2;p.publishedTotalHeight=20.71;p.modelTopY=20.71;p.heightDatum='MODEL_DATUM_ASSUMPTION_COURTYARD_ZERO_TO_HIGHEST_ROOF_SOURCE_ONLY_SAYS_TOTAL_HEIGHT';p.upperAccess='ARCHITECTURAL_VIEWING_ONLY_REAR_STAIRS_GUARDED';}
 let openings;
 if(key==='huangji')openings=[-1,0,1].flatMap(i=>[{x:i*w/9,z:-d/2+gallery,width:3.2,side:'front'},{x:i*w/9,z:d/2,width:3.2,side:'rear'}]);
 else if(key==='fuwang')openings=[{x:0,z:-d/2+gallery,width:2.8,side:'front'},{x:0,z:d/2-gallery,width:2.8,side:'rear'},{x:-w/2+gallery,z:0,width:2.8,side:'east'},{x:w/2-gallery,z:0,width:2.8,side:'west'}];
 else if(key==='juanqin')openings=[{x:-w/2+2.5*w/9,z:-d/2+gallery,width:2.8,side:'front'}];
 else openings=[{x:0,z:-d/2+gallery,width:2.8,side:'front'},...(['yangxing','leshou','fuwang'].includes(key)?[{x:0,z:d/2-(key==='yangxing'?0:gallery),width:2.8,side:'rear'}]:[])];
 const toWorld=(lx,lz,feetY)=>({localX:lx,localZ:lz,x:x+Math.cos(rot)*lx+Math.sin(rot)*lz,z:z-Math.sin(rot)*lx+Math.cos(rot)*lz,feetY});
 p.portals=openings.map(q=>{if(['east','west'].includes(q.side)){const sign=q.side==='east'?-1:1,edge=sign*(w/2+.8),toe=edge+sign*ph*2.1,world=toWorld(q.x,q.z,ph),points=[[toe+sign,q.z,0],[toe,q.z,0],[(toe+edge)/2,q.z,ph/2],[edge-sign*.15,q.z,ph],[q.x,q.z,ph],[q.x-sign*.7,q.z,ph]];return{...q,approachX:q.x,localX:q.x,localZ:q.z,worldX:world.x,worldZ:world.z,normalLocalX:sign,normalLocalZ:0,normalWorldX:Math.cos(rot)*sign,normalWorldZ:-Math.sin(rot)*sign,status:'OFFICIAL_CARDINAL_DOOR_WITH_FITTED_GROUND_ACCESS',approachPoints:points.map(a=>toWorld(...a))};}const sign=q.side==='rear'?1:-1,pad=key==='huangji'?1.2:key==='juanqin'?.5:.8,edge=sign*(d/2+pad),toe=edge+sign*(ph>.55?ph*2.1:.05),world=toWorld(q.x,q.z,ph),points=[[q.x,toe+sign,0],[q.x,toe,0],...(ph>.55?[[q.x,(toe+edge)/2,ph/2]]:[]),[q.x,edge-sign*.15,ph],[q.x,q.z,ph],[q.x,q.z-sign*.7,ph]];
 return{...q,approachX:q.x,localX:q.x,localZ:q.z,worldX:world.x,worldZ:world.z,normalLocalX:0,normalLocalZ:sign,normalWorldX:Math.sin(rot)*sign,normalWorldZ:Math.cos(rot)*sign,status:'OFFICIAL_BAY_POSITION_WITH_FITTED_CLEAR_OPENING_AND_MODEL_ACCESS',approachPoints:points.map(a=>toWorld(...a))};});
 const spawn={x:key==='juanqin'?-7:0,z:key==='yangxing'?-3:key==='changyin'?-3:key==='huangji'?-5:key==='fuwang'?-7:key==='leshou'?-4:0};
 p.navigation={floorY:ph,upperDestinations:false,portals:p.portals,approachPoints:p.portals.find(q=>q.side==='front').approachPoints,spawn,status:'MODEL_CIRCULATION_NOT_MUSEUM_PERMISSION'};
 return freeze(p);
}
export const REMAINING_NINGSHOU_PROFILES=freeze(BASE.map(profile));
export function resolveRemainingProfile(zoneId,item) {
 if(zoneId!=='ningshou'||item?.kind!=='hall')return null;
 return REMAINING_NINGSHOU_PROFILES.find(p=>p.name===item.name&&p.x===item.x&&p.z===item.z&&p.w===item.w&&p.d===item.d)??null;
}
function validate(item,p) {
 if(!p||resolveRemainingProfile('ningshou',item)!==p)throw Error('Remaining NingShou requires its exact immutable identity profile');
 for(const key of['ph','colH'])if(item[key]!==p[key])throw Error('Remaining NingShou retained envelope mismatch: '+key);
}
const materialCache=new WeakMap();
function materials(kit) {
 if(materialCache.has(kit))return materialCache.get(kit);
 const m={};for(const [name,color,roughness,metalness]of[
 ['wood',0x573b26,.7,0],['red',0x8d2b23,.7,0],['black',0x201b18,.65,0],['gold',0xb38b3b,.42,.3],['stone',0xc7c5b7,.87,0],['brick',0x72746d,.92,0],['floor',0x50544e,.92,0],['paper',0xc8bda1,.88,0],['glass',0x82948f,.32,.1],['green',0x366c52,.39,.08],['yellow',0xbc8b2e,.4,.08],['blue',0x227686,.42,.08],['purple',0x70517d,.45,.08],['water',0x47625f,.26,.1],['bamboo',0x8d7d4c,.72,0]]){m[name]=new THREE.MeshStandardMaterial({name:`r48_ningshou_${name}_fit`,color,roughness,metalness,side:THREE.FrontSide});kit.owned.push(m[name]);}
 materialCache.set(kit,m);return m;
}
function context(kit,item,p,f=kit.frame(p.x,p.z,p.rot)) {
 const mats=materials(kit),records=[];
 const tag=(mesh,role,extra={})=>{mesh.name=`${p.key}-${role}`;mesh.userData={role,identity:p.id,dimensionStatus:FIT,...extra};return mesh;};
 const box=(role,mat,w,h,d,x,y,z,solid=false)=>{if([w,h,d,x,y,z].some(v=>!Number.isFinite(v))||Math.min(w,h,d)<=0)throw Error(`Invalid ${p.key}/${role}`);const mesh=tag(kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat]??kit.lib.material(mat),x,y,z),role);if(solid)kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return mesh;};
 const cylinder=(role,mat,r,h,x,y,z,solid=false,segments=12)=>{const mesh=tag(kit.mesh(f,new THREE.CylinderGeometry(r,r*1.03,h,segments),mats[mat],x,y,z),role);if(solid){mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;kit.col(f,x+b.min.x,y+b.min.y,z+b.min.z,x+b.max.x,y+b.max.y,z+b.max.z);mesh.userData.colliderPolicy='ACTUAL_TAPERED_CYLINDER_VERTEX_BOUNDS';}return mesh;};
 const walk=(x0,z0,x1,z1,y)=>{kit.walkBox(f,x0,z0,x1,z1,y);kit.walkables.at(-1).rescue=false;};
 return{kit,item,p,f,mats,tag,box,cylinder,walk,records};
}
/** Match visible sloping timber with short actual rotated-box envelopes, not
 * one giant stair AABB. The 5 cm downward-only safety allowance compensates
 * for CollisionManager's production eye-minus-.05 head top; it does not
 * narrow the body, add an upper walkable, or close the clear under-stair aisle. */
function segmentedTimberCollider(c,mesh,{span=.16,headAllowance=.05}={}) {
 mesh.geometry.computeBoundingBox();mesh.updateMatrix();
 const b=mesh.geometry.boundingBox,n=Math.max(1,Math.ceil((b.max.z-b.min.z)/span)),v=new THREE.Vector3();
 for(let i=0;i<n;i++){
  const lo=b.min.z+(b.max.z-b.min.z)*i/n,hi=b.min.z+(b.max.z-b.min.z)*(i+1)/n,part=new THREE.Box3();
  for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[lo,hi])part.expandByPoint(v.set(x,y,z).applyMatrix4(mesh.matrix));
  c.kit.col(c.f,part.min.x,part.min.y-headAllowance,part.min.z,part.max.x,part.max.y,part.max.z);
 }
 mesh.userData.colliderPolicy='SHORT_ACTUAL_ROTATED_BOX_ENVELOPES_WITH_PRODUCTION_HEAD_ALLOWANCE';
 mesh.userData.colliderSegments=n;mesh.userData.colliderHeadAllowance=headAllowance;mesh.userData.colliderMaxLocalSpan=span;
}
function slab(c,role,x0,x1,z0,z1,y,{thickness=.15,walk=false,solid=true,mat='wood'}={}) {
 if(x1-x0<=.02||z1-z0<=.02)return;
 c.box(role,mat,x1-x0,thickness,z1-z0,(x0+x1)/2,y-thickness/2,(z0+z1)/2,solid);
 if(walk)c.walk(x0,z0,x1,z1,y);
}
function platform(c,w=c.p.localW,d=c.p.localD) {
 const {p,box,walk}=c,pad=Math.min(c.item.pad??.5,.8),pw=w+pad*2,pd=d+pad*2;
 box('platform-base','brick',pw,p.ph,pd,0,p.ph/2,0,p.ph>.55);
 slab(c,'platform-paving',-pw/2,pw/2,-pd/2,pd/2,p.ph,{walk:true,mat:'stone',thickness:.07,solid:false});
 slab(c,'interior-floor',-w/2,w/2,-d/2,d/2,p.ph+.014,{mat:'floor',solid:false,thickness:.035});
 for(const portal of p.portals)if(p.ph>.55){if(['east','west'].includes(portal.side))exteriorSideSteps(c,(portal.side==='east'?-1:1)*pw/2,portal.z,p.ph,portal.width,portal.side);else exteriorSteps(c,portal.approachX,(portal.side==='rear'?1:-1)*pd/2,p.ph,Math.max(2.25,portal.width),portal.side);}
 return{pw,pd};
}
function exteriorSteps(c,x,z,y,width,side='front') {
 const run=y*2.1,n=Math.max(4,Math.ceil(y/.16)),rear=side==='rear';
 for(let i=0;i<n;i++){const top=y*(i+1)/n,zz=rear?z+run-(i+.5)*run/n:z-run+(i+.5)*run/n;c.box('access-step','stone',width,top,run/n+.01,x,top/2,zz,false);}
 if(rear)c.kit.walkRamp(c.f,x-width/2,x+width/2,z,z+run,y,0);else c.kit.walkRamp(c.f,x-width/2,x+width/2,z-run,z,0,y);
}
function exteriorSideSteps(c,x,z,y,width,side) {
 const run=y*2.1,n=Math.max(4,Math.ceil(y/.16)),sign=side==='east'?-1:1;
 for(let i=0;i<n;i++){const top=y*(i+1)/n,xx=x+sign*(run-(i+.5)*run/n);c.box('access-side-step','stone',run/n+.01,top,width,xx,top/2,z,false);}
 const frame=new THREE.Group();frame.position.z=z;frame.rotation.y=Math.PI/2;c.f.add(frame);frame.updateMatrixWorld(true);
 if(sign<0)c.kit.walkRamp(frame,-width/2,width/2,x-run,x,0,y);else c.kit.walkRamp(frame,-width/2,width/2,x,x+run,y,0);
 frame.removeFromParent();
}
function column(c,x,z,y,h,{square=false,r=.19,role='column'}={}) {
 const m=square?c.box(role,'red',r*2,h,r*2,x,y+h/2,z,true):c.cylinder(role,'red',r,h,x,y+h/2,z,true);
 c.cylinder('column-base','stone',r*1.38,.16,x,y+.08,z,false);
 return m;
}
function frame(c,{w=c.p.localW,d=c.p.localD,y=c.p.ph,h=c.p.colH,bays=c.p.bays,depthBays=c.p.depthBays,sideColumns=true,square=false,role='column'}={}) {
 const radius=Math.min(.27,Math.max(.16,w/bays*.052));
 for(let i=0;i<=bays;i++)for(const sign of[-1,1])column(c,-w/2+i*w/bays,sign*d/2,y,h,{r:radius,square,role});
 if(sideColumns&&depthBays>1)for(let j=1;j<depthBays;j++)for(const sign of[-1,1])column(c,sign*w/2,-d/2+j*d/depthBays,y,h,{r:radius,square,role});
 for(const sign of[-1,1]){c.box('eave-beam','wood',w+.2,.36,.28,0,y+h-.18,sign*d/2);c.box('eave-beam','wood',.28,.36,d+.2,sign*w/2,y+h-.18,0);c.box('painted-beam-band','green',w,.13,.035,0,y+h-.14,sign*(d/2+.15));}
}
function panel(c,{x,z,w,h,y,side=false,pattern='steps',wall='red',upper=false}) {
 const add=(role,mat,ww,hh,dd,xx,yy,zz,solid=false)=>side?c.box(role,mat,dd,hh,ww,x+zz,yy,z+xx,solid):c.box(role,mat,ww,hh,dd,x+xx,yy,z+zz,solid);
 const sill=Math.min(.9,h*.25),top=h-.18,winH=top-sill;
 add('sill-wall',wall,w,sill,.2,0,y+sill/2,0,true);
 add('window-backing',pattern==='glass'?'glass':'paper',w-.13,winH,.055,0,y+sill+winH/2,0,true);
 for(const s of[-1,1])add('window-frame','wood',.08,winH,.1,s*(w/2-.05),y+sill+winH/2,-.04);
 for(const yy of[sill,top])add('window-frame','wood',w,.075,.12,0,y+yy,-.04);
 const n=pattern==='straight'?Math.max(4,Math.round(w/.25)):Math.max(3,Math.round(w/.5));
 for(let i=1;i<n;i++)add(pattern==='straight'?'straight-mullion':'window-mullion','wood',.037,winH,.07,-w/2+i*w/n,y+sill+winH/2,-.07);
 if(pattern==='steps')for(let k=1;k<4;k++)for(let i=0;i<n;i++)add('step-lattice','wood',w/n*.72,.035,.055,-w/2+(i+.5)*w/n+(k%2?.06:-.06),y+sill+k*winH/4,-.08);
 else for(const t of[.18,.75])add('window-crossbar','wood',w,.045,.08,0,y+sill+t*winH,-.08);
 if(upper)add('upper-window-band','gold',w-.12,.04,.04,0,y+top-.18,-.1);
}
function opening(c,{x,z,w,h,y,side=false,role='door-opening'}) {
 const add=(r,mat,ww,hh,dd,xx,yy,zz,solid=false)=>side?c.box(r,mat,dd,hh,ww,x+zz,yy,z+xx,solid):c.box(r,mat,ww,hh,dd,x+xx,yy,z+zz,solid);
 for(const sign of[-1,1])add(role+'-jamb','wood',.11,h,.16,sign*(w/2+.06),y+h/2,0,true);
 add(role+'-lintel','wood',w+.24,.18,.18,0,y+h+.09,0,true);
 // Open leaves lie along side walls. Their physical envelopes are identical
 // to their rendered orientation; there is no collider across the opening.
 for(const sign of[-1,1])add('open-door-leaf','wood',.1,h*.92,.5,sign*(w/2+.12),y+h*.46,.26,true);
}
function wallLine(c,{a0,a1,at,y,h,side=false,doors=[],mat='red',role='enclosure-wall'}) {
 let cursor=a0;for(const door of [...doors].sort((a,b)=>a.at-b.at)){const l=Math.max(a0,door.at-door.w/2),r=Math.min(a1,door.at+door.w/2);if(l>cursor)add(cursor,l,y,h);opening(c,{x:side?at:door.at,z:side?door.at:at,w:door.w,h:Math.min(3.15,h-.25),y,side,role:'partition-door'});const dh=Math.min(3.15,h-.25);if(h>dh+.2)add(l,r,y+dh+.18,h-dh-.18);cursor=Math.max(cursor,r);}if(a1>cursor)add(cursor,a1,y,h);
 function add(lo,hi,yy,hh){if(hi-lo<.01||hh<.01)return;c.box(role,mat,side?.18:hi-lo,hh,side?hi-lo:.18,side?at:(lo+hi)/2,yy+hh/2,side?(lo+hi)/2:at,true);}
}
function facade(c,{w=c.p.localW,d=c.p.localD,y=c.p.ph,h=c.p.colH-.42,bays=c.p.bays,depthBays=c.p.depthBays,sideDoors=[],inset=c.p.gallery,rearInset=inset,frontDoors=[Math.floor(c.p.bays/2)],backDoors=[],backWindows=true,sideWindows=false,pattern='steps',frontPattern=pattern,wall='red'}={}) {
 const iw=w-(sideWindows?inset*2:0),front=-d/2+inset,rear=d/2-rearInset,bw=iw/bays;
 for(const sign of[-1,1])for(let i=0;i<bays;i++){
  const x=-iw/2+(i+.5)*bw,z=sign<0?front:rear,door=(sign<0?frontDoors:backDoors).includes(i),pw=Math.max(.6,bw-.16),facePattern=sign<0?frontPattern:pattern;
  if(door){const dw=Math.min(pw-.14,3.2);opening(c,{x,z,w:dw,h:Math.min(3.2,h-.35),y});if(pw>dw+.1){for(const s of[-1,1]){const fill=(pw-dw)/2-.03;if(fill>.3)panel(c,{x:x+s*(dw/2+(pw-dw)/4),z,w:fill,h,y,pattern:facePattern,wall});else c.box('door-side-filler','wood',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,z,true);}}const dh=Math.min(3.2,h-.35);if(h-dh>.22)c.box('door-transom','wood',dw,h-dh-.18,.14,x,y+dh+.18+(h-dh-.18)/2,z,true);}
  else if(sign<0||backWindows)panel(c,{x,z,w:pw,h,y,pattern:facePattern,wall});
  else c.box('rear-masonry','red',bw,h,.2,x,y+h/2,z,true);
 }
 for(const sign of[-1,1]){
  if(sideWindows){const n=Math.max(1,depthBays),span=rear-front;for(let i=0;i<n;i++){const z=front+(i+.5)*span/n,pw=span/n-.12;if(sideDoors.includes(i)){const dw=Math.min(2.8,pw-.14),dh=Math.min(3.2,h-.35);opening(c,{x:sign*iw/2,z,w:dw,h:dh,y,side:true});for(const ss of[-1,1])panel(c,{x:sign*iw/2,z:z+ss*(dw/2+(pw-dw)/4),w:(pw-dw)/2-.03,h,y,side:true,pattern,wall});if(h>dh+.2)c.box('side-door-transom','wood',.14,h-dh-.18,dw,sign*iw/2,y+dh+.18+(h-dh-.18)/2,z,true);}else panel(c,{x:sign*iw/2,z,w:pw,h,y,side:true,pattern,wall});}}
  else c.box('gable-enclosure',wall,.22,h,rear-front,sign*w/2,y+h/2,(front+rear)/2,true);
 }
}
function ceiling(c,{x0=-c.p.localW/2+.2,x1=c.p.localW/2-.2,z0=-c.p.localD/2+c.p.gallery,z1=c.p.localD/2-c.p.gallery,y=c.p.ph+c.p.colH-.42,nx=c.p.bays,nz=Math.max(1,c.p.depthBays),round=false}={}) {
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
  const w=(x1-x0)/nx,d=(z1-z0)/nz,x=x0+(i+.5)*w,z=z0+(j+.5)*d;c.box('ceiling-coffer','wood',w-.08,.07,d-.08,x,y,z);
  if(round){const geo=new THREE.TorusGeometry(Math.min(w,d)*.22,.035,4,16);geo.rotateX(Math.PI/2);c.tag(c.kit.mesh(c.f,geo,c.mats.gold,x,y-.065,z),'round-longevity-ceiling',{motifStatus:'ABSTRACT_CIRCLE_NOT_BAT_OR_SHOU_CARVING_REPLICA'});}
  for(const sign of[-1,1]){c.box('ceiling-grid','gold',w,.055,.055,x,y-.055,z+sign*d/2);c.box('ceiling-grid','gold',.055,.055,d,x+sign*w/2,y-.055,z);}
 }
}
function removeDegenerateTriangles(geo) {
 const p=geo.attributes.position,index=geo.index,a=new THREE.Vector3(),b=new THREE.Vector3(),d=new THREE.Vector3(),kept=[];
 for(let j=0;j<(index?index.count:p.count);j+=3){const ids=[0,1,2].map(k=>index?index.getX(j+k):j+k);a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]).sub(a);d.fromBufferAttribute(p,ids[2]).sub(a);if(b.cross(d).lengthSq()>1e-16)kept.push(...ids);}
 geo.setIndex(kept);return geo;
}
/** A genuinely closed thin shell with separately wound top, underside and
 * boundary faces. FrontSide materials remain visible from the correct side;
 * DoubleSide must not conceal missing soffits or inverted roof triangles. */
function shellGeometry(vertices,indices,offset,normalAxis=1,normalSign=1) {
 const points=[],remap=[],pool=new Map();
 for(let i=0;i<vertices.length;i+=3){const p=vertices.slice(i,i+3),key=p.map(n=>Math.round(n*1e7)).join(',');if(!pool.has(key)){pool.set(key,points.length/3);points.push(...p);}remap.push(pool.get(key));}
 let top=indices.map(i=>remap[i]);const va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3();let normal=0;
 for(let i=0;i<top.length;i+=3){va.fromArray(points,top[i]*3);vb.fromArray(points,top[i+1]*3).sub(va);vc.fromArray(points,top[i+2]*3).sub(va);normal+=vb.cross(vc).getComponent(normalAxis);}
 if(normal*normalSign<0)for(let i=0;i<top.length;i+=3)[top[i+1],top[i+2]]=[top[i+2],top[i+1]];
 const n=points.length/3,all=[...points];for(let i=0;i<points.length;i+=3)all.push(points[i]+offset[0],points[i+1]+offset[1],points[i+2]+offset[2]);
 const faces=[...top],edges=new Map();for(let i=0;i<top.length;i+=3){const a=top[i],b=top[i+1],c=top[i+2];faces.push(c+n,b+n,a+n);for(const [u,v]of[[a,b],[b,c],[c,a]]){const key=Math.min(u,v)+','+Math.max(u,v);const e=edges.get(key);if(e)e.count++;else edges.set(key,{u,v,count:1});}}
 for(const{u,v,count}of edges.values())if(count===1)faces.push(u+n,v+n,v,u+n,v,u);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(all,3));geo.setIndex(faces);removeDegenerateTriangles(geo);geo.computeVertexNormals();return geo;
}
function surface(c,role,vertices,indices,mat,extra={}) {
 const roof=role==='roof-surface'||role==='roof-hip-skirt'||role==='jingqi-waist-eave';
 let geo;
 if(roof)geo=shellGeometry(vertices,indices,[0,-.075,0]);
 else if(role==='roof-curved-gable'){const sign=extra.endSign??1;geo=shellGeometry(vertices,indices,[-sign*.075,0,0],0,sign);}
 else{geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);removeDegenerateTriangles(geo);geo.computeVertexNormals();}
 return c.tag(c.kit.mesh(c.f,geo,c.mats[mat],0,0,0),role,{...extra,...(roof?{shellThickness:.075,facePolicy:'FRONTSIDE_CLOSED_TOP_SOFFIT_AND_EDGES'}:{})});
}
/** Curved no-ridge barrel roof, with a hipped lower skirt and closed end board.
 * Sections and rise are fits, not a measured Qing roof framing reconstruction. */
function rolledRoof(c,{w=c.p.localW+.6,d=c.p.localD+.8,x=0,z=0,y=c.p.ph+c.p.colH,rise=Math.min(d*.27,2.6),tile='green',trim='yellow',hip=true,sourceVerge=false}={}) {
 const marker=new THREE.Group();marker.name=`${c.p.key}-rolled-roof-unit`;marker.userData={role:'rolled-roof-unit',dimensionStatus:FIT};c.f.add(marker);
 const end=hip?Math.min(d*.24,w*.15):0,core=w-2*end,steps=24,rows=6,vs=[],idx=[];
 for(let i=0;i<=rows;i++)for(let j=0;j<=steps;j++){
  const q=-1+2*j/steps,xx=-core/2+core*i/rows,zz=d*q/2,yy=y+rise*Math.pow(Math.max(0,Math.cos(q*Math.PI/2)),.72);vs.push(x+xx,yy,z+zz);
 }
 for(let i=0;i<rows;i++)for(let j=0;j<steps;j++){const a=i*(steps+1)+j,b=a+steps+1;idx.push(a,b,a+1,b,b+1,a+1);}surface(c,'roof-surface',vs,idx,tile,{form:hip?'SIMPLIFIED_ROLLED_HIP_GABLE':'ROLLED_HARD_GABLE'});
 // Hipped ends are only the lower roof skirt; the curved upper end board is
 // visible and closes the barrel. It is not a fictitious second storey.
 for(const sign of[-1,1]){
  if(hip){const pts=[x+sign*core/2,y+rise*.52,z-d*.34,x+sign*core/2,y+rise*.52,z+d*.34,x+sign*w/2,y,z+d/2,x+sign*w/2,y,z-d/2];surface(c,'roof-hip-skirt',pts,[0,1,2,0,2,3],tile);
   // Close the previously missing triangular corners between the rolled crown
   // and the hipped lower ends. These are real tile surfaces, not dark vents.
   for(const side of[-1,1])surface(c,'roof-hip-skirt',[x+sign*core/2,y,z+side*d/2,x+sign*core/2,y+rise*.52,z+side*d*.34,x+sign*w/2,y,z+side*d/2],[0,1,2],tile,{part:'CLOSED_HIP_CORNER'});
  }
  const verts=[x+sign*core/2,y,z];for(let j=0;j<=steps;j++){const q=-1+2*j/steps;verts.push(x+sign*core/2,y+rise*Math.pow(Math.max(0,Math.cos(q*Math.PI/2)),.72),z+d*q/2);}const ix=[];for(let j=1;j<=steps;j++)ix.push(0,j,j+1);surface(c,'roof-curved-gable',verts,ix,'wood',{endSign:sign,closure:'SOLID_END_BOARD_NOT_OPEN_BARREL'});
  c.box('glazed-eave-edge',trim,w,.13,.15,x,y,z+sign*d/2);
  if(sourceVerge){
   // The official YueShi front photograph shows green bands following the
   // rolled gable. Width/rise reuse the existing roof fit, not surveyed tiles.
   const ribbon=[],faces=[],width=.22;
   for(let j=0;j<=steps;j++){const q=-1+2*j/steps,yy=y+.055+rise*Math.pow(Math.max(0,Math.cos(q*Math.PI/2)),.72);for(const offset of[-width/2,width/2])ribbon.push(x+sign*core/2+offset,yy,z+d*q/2);}
   for(let j=0;j<steps;j++){const a=j*2;faces.push(a,a+2,a+1,a+1,a+2,a+3);}
   const geo=shellGeometry(ribbon,faces,[0,-.045,0]);c.tag(c.kit.mesh(c.f,geo,c.mats[trim],0,0,0),'r67-yueshi-green-curved-verge',{source:'https://img.dpm.org.cn/Uploads/Picture/dc/1565.jpg',dimensionStatus:FIT,measured:false,exactTileCount:false,physics:'DECORATIVE_EXISTING_ROOF_ENVELOPE',scope:'TWO_ROLLED_GABLE_CURVES_ONLY_HIP_CORNER_ORNAMENT_UNVERIFIED'});
  }
 }
 // Plain fitted bearing frame physically connects the rolled shell to the
 // existing eave beams. It is intentionally uncarved, not an invented dougong.
 for(const side of[-1,1]){
  c.box('fitted-bearing-eave-purlin','wood',w+.05,.18,.22,x,y-.045,z+side*d/2);
  c.box('fitted-bearing-crossbeam','wood',.22,.18,d+.12,x+side*(w/2-.3),y-.045,z);
 }
 c.box('fitted-bearing-tie-beam','wood',w-.3,.18,.24,x,y-.045,z);
 // Fine longitudinal ribs reveal the roof surface without claiming tile counts.
 for(let i=0;i<=Math.ceil(core/.45);i++){
  const xx=x-core/2+i*core/Math.ceil(core/.45),pts=[];for(let j=0;j<=12;j++){const q=-1+2*j/12;pts.push(new THREE.Vector3(xx,y+.025+rise*Math.pow(Math.max(0,Math.cos(q*Math.PI/2)),.72),z+d*q/2));}
  c.tag(c.kit.mesh(c.f,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.026,3,false),c.mats[tile],0,0,0),'roof-tile-rib');
 }
 return marker;
}
function ordinaryRoof(c,{type='xieshan',layers=1,w=c.p.localW+.3,d=c.p.localD+.3,x=0,z=0,y=c.p.ph+c.p.colH,tile='yellow',trim='yellow',height}={}) {
 const r=c.kit.roof(c.f,{type,width:w,depth:d,baseY:y,layers,brackets:false,...(height?{height}:{})},x,z),roofTile=c.kit.lib.material('roof_tile');
 // TextureLibrary's display name has a _material suffix; matching the shared
 // material object keeps production geometry/colour dispatch equal to fixtures.
 r.traverse(m=>{if(!m.isMesh)return;if(m.material===roofTile){removeDegenerateTriangles(m.geometry);m.material=c.mats[tile];c.tag(m,'roof-surface',{form:type});}else if(m.material===c.kit.ridge)m.material=c.mats[trim];});return r;
}
function rail(c,{x,z,length,y,side=false,mat='wood',gap=0,role='gallery-rail'}) {
 const add=(ww,hh,dd,xx,yy,zz)=>side?c.box(role,mat,dd,hh,ww,x+zz,yy,z+xx,true):c.box(role,mat,ww,hh,dd,x+xx,yy,z+zz,true);
 const spans=gap?[[-length/2,-gap/2],[gap/2,length/2]]:[[-length/2,length/2]];
 for(const[a,b]of spans){for(const hh of[.24,.88])add(b-a,.065,.08,(a+b)/2,y+hh,0);const n=Math.max(2,Math.ceil((b-a)/.65));for(let i=0;i<=n;i++)add(.07,.9,.08,a+(b-a)*i/n,y+.45,0);}
}
function retainLegacyNameSign(c) {
 const{p,item,kit,f}=c;
 if(p.mode==='augment'||item.plaque===false||!item.name)return null;
 // Preserve the original game's default name label. It is NOT asserted to be
 // an extant historic plaque; source-specific internal inscriptions are separate.
 const text=item.plaqueText??item.name,q=p.portals.find(q=>q.side==='front')??p.portals[0];
 const eave={yangxing:6.91,leshou:p.eaveY,fuwang:7.9,changyin:16.2,biluo:3.7}[p.key]??p.ph+p.colH;
 const y=p.key==='biluo'?2.85:eave-1,h=p.key==='biluo'?.95:1.35,w=h*.6;
 let target=f,x=0,z=p.key==='changyin'?-p.localD*.72/2-.24:q.localZ-.28;
 // Jingqi's upper front wall has a different inset from its ground portal.
 if(p.key==='jingqi')z=-p.localD/2+.7-.22;
 if(p.key==='biluo'){target=new THREE.Group();target.position.set(q.localX-.18,0,q.localZ);target.rotation.y=Math.PI/2;f.add(target);x=0;z=0;}
 const before=target.children.length;kit.plaque(target,text,x,y,z,w,h);
 for(const m of target.children.slice(before))c.tag(m,'legacy-model-name-sign',{text,source:'BASELINE_COURTKIT_HALL_NAME_DEFAULT',inventoryStatus:'LEGACY_MODEL_NAME_SIGN_UNVERIFIED_NOT_HISTORIC_PLAQUE'});
 return{text,registration:'retained-original-model-name-label',historicObjectVerified:false,localY:y,localZ:z,height:h,positionStatus:p.key==='jingqi'?'UPPER_FRONT_WALL_CLEARANCE_MODEL_FIT_NOT_SURVEYED':p.key==='changyin'?'OFFICIAL_UPPER_EAVE_LEVEL_WITH_FITTED_POSITION_AND_LEGACY_MODEL_STYLE':'FITTED_TO_REVISED_FACADE_OR_ENTRY'};
}
function finish(c,extra={}) {
 const {p,f,kit}=c,w=p.localW,d=p.localD;
 const legacyNameSign=retainLegacyNameSign(c);
 const doors=p.portals.map(q=>({x:q.x,z:q.z})),spawn=p.navigation.spawn;
 kit._lastFurnish={cover:[],spawns:[spawn]};kit.registerRoom(f,{name:p.name,kind:`r48-${p.key}-ground-viewing`,x0:-w/2+.35,x1:w/2-.35,z0:-d/2,z1:d/2,y:p.ph,h:Math.min(p.colH,4),doors});
 if(extra.legacyInventory?.status==='UNKNOWN'){const room=kit.rooms.at(-1);room.inventory={...extra.legacyInventory};}
 kit.mapRect(f,'hall',p.name,w+2*(c.item.pad??.5),d+2*(c.item.pad??.5),{profileId:p.id,fitStatus:FIT});
 f.userData.structure={...p,...extra,legacyNameSign,portals:p.portals,groundNavigation:p.navigation,actualComponentCount:0};f.traverse(m=>{if(m.isMesh)f.userData.structure.actualComponentCount++;});
 f.name=`${p.name}·官方形制局部拟合`;
 return{f,g:f.userData.structure,PW:w+2*(c.item.pad??.5),PD:d+2*(c.item.pad??.5),top:p.ph};
}
/** Existing hall-preset pieces retained as unverified assets, not evidence of
 * historic/current inventory. The three attested through halls lose only the
 * rear central table/chairs that obstruct their newly established through bay. */
function retainLegacyHall(c,{central=false,centralX=0,sideInset=0,benchZ=0}={}) {
 const{p}=c;
 // R67 I and R68 J exact reviewed hosts only. Generic presets do not
 // establish current museum inventory; UNKNOWN is not a known-empty room.
 if(['xunyan','qingshou','jingfu','jingqi','yueshi','leshou','changyin','suichu','cuishang','fuwang'].includes(p.key))return{source:'LEGACY_GENERIC_HALL_PRESET_NOT_MUSEUM_INVENTORY',status:'UNKNOWN',knownEmpty:false,accepted:false,currentInventoryVerified:false,retained:[],withheldMeshCount:central?8:4,withheldColliderCount:central?7:4,withheld:central?['table','table-gold-strip','two-chairs','two-cabinets','two-benches']:['two-cabinets','two-benches'],missingEvidence:['CURRENT_ROOM_INVENTORY','PLACEMENT','PERIOD_MAPPING'],notProofOfEmptyRoom:true};
 const rear=p.localD/2-p.gallery-.65;
 const put=(kind,w,h,d,x,z,mat='wood',raise=0)=>{const o=c.box('legacy-unverified-'+kind,mat,w,h,d,x,p.ph+raise+h/2,z,h>.36);o.userData.inventoryStatus='LEGACY_UNVERIFIED';o.userData.source='src/scene/palace/interiors.js PRESETS.hall';o.userData.placementStatus='FITTED_TO_REVISED_ENCLOSURE_NOT_HISTORIC_PLACEMENT';return o;};
 for(const sign of[-1,1]){put('cabinet',1.2,2.1,.55,p.key==='jingqi'&&sign<0?-6.7:sign*(p.key==='jingfu'?3.4:p.localW/2-1.05-sideInset),rear);put('bench',.5,.48,Math.min(2.4,(p.localD-2*p.gallery)*.35),p.key==='jingqi'&&sign<0?-7.9:sign*(p.localW/2-p.gallery*(p.key==='jingfu'?1:0)-.65-sideInset),p.key==='jingqi'&&sign<0?-1.1:benchZ,'red');}
 if(central){put('table',2.4,.85,.8,centralX,rear-.45);put('table-gold-strip',2.16,.06,.06,centralX,rear-.07,'gold',.86);for(const sign of[-1,1])put('chair',.6,1.1,.6,centralX+sign*.72,rear-1.35,'red');}
 return{source:'LEGACY_GENERIC_HALL_PRESET_NOT_MUSEUM_INVENTORY',retained:central?['table','two-chairs','two-cabinets','two-benches']:['two-cabinets','two-benches'],removed:central?[]:['central-table-and-chairs-conflict-with-attested-through-bay']};
}
function buildNingshou(c) {
 const{p}=c;platform(c);frame(c);facade(c,{frontDoors:[2],backDoors:[2,3,4],backWindows:false,pattern:'straight'});fitNingshouSouthPhotoWindows(c);ceiling(c,{round:true});ordinaryRoof(c);
 // Additional interior rows follow the attested three-deep organization. Equal
 // spacings are only a fit; removed ritual kang and stove inventories are absent.
 for(const x of[-p.localW*2/7,p.localW*2/7])for(const z of[-p.localD/6,p.localD/6])column(c,x,z,p.ph,p.colH-.42,{role:'inner-column',r:.23});
 return finish(c,{interiorPolicy:'REMOVED_KANG_NOT_RECREATED_EXHIBITION_INVENTORY_UNKNOWN',roofForm:'single-eave-xieshan',roomLayout:'seven-bay-three-depth-shell-east-secondary-entry',currentInventoryVerified:false});
}
/** Source-visible south tiger-stone facing, not a copied masonry map or survey.
 * Flat colored polygons remain on the existing plinth, no support/collider edits. */
function suichuStoneFacing(c){
 if(c.p.key!=='suichu')return;
 const w=c.p.localW+Math.min(c.item.pad??.5,.8)*2,h=c.p.ph-.05,z=-(c.p.localD+Math.min(c.item.pad??.5,.8)*2)/2;
 const positions=[],colors=[],palette=[0x8e9484,0x746f62,0xa69b87,0x68776e,0x9b7367,0xaaa99a].map(v=>new THREE.Color(v));
 const n=36,rows=2,dx=w/n,dy=h/rows;
 for(let j=0;j<rows;j++)for(let i=0;i<n;i++){
  const x=-w/2+(i+.5)*dx,y=(j+.5)*dy+.018,rx=dx*.46,ry=dy*.45,poly=[];
  for(let k=0;k<7;k++){const a=Math.PI*2*k/7,rr=.86+.12*Math.sin((i+1)*17+(j+1)*13+k*7);poly.push([x+Math.cos(a)*rx*rr,y+Math.sin(a)*ry*rr,z]);}
  const col=palette[(i*7+j*3)%palette.length];
  for(let k=0;k<7;k++){positions.push(x,y,z,...poly[(k+1)%7],...poly[k]);for(let v=0;v<3;v++)colors.push(col.r,col.g,col.b);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({name:'r68-suichu-stone-palette-fit',vertexColors:true,roughness:.94,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});c.kit.owned.push(mat);
 c.tag(c.kit.mesh(c.f,geo,mat,0,0,0),'platform-base',{detailRole:'r68-suichu-tiger-stone-facing',noMerge:true,scope:'SOUTH_PLINTH_FACE_ONLY',exactStoneLayout:false,sourceImage:'https://img.dpm.org.cn/Uploads/Picture/dc/1533[1024].jpg',photographyDate:null,accepted:false});
}
function buildThroughHall(c) {
 const{p}=c,brick=p.key!=='suichu';platform(c);suichuStoneFacing(c);frame(c);facade(c,{frontDoors:[2],backDoors:[2],pattern:'steps',wall:brick?'brick':'red'});ceiling(c,{nz:1});rolledRoof(c,{hip:!brick,tile:p.key==='qingshou'?'yellow':'green',trim:p.key==='qingshou'?'green':'yellow'});
 // Inner gallery column rows and the through-bay remain separate from the
 // exterior columns. No speculative bedroom/library furniture is inserted.
 for(const sign of[-1,1])for(let i=0;i<=p.bays;i++)column(c,-p.localW/2+i*p.localW/p.bays,sign*(p.localD/2-p.gallery),p.ph,p.colH-.4,{role:'inner-column',r:.15});
 const legacyInventory=retainLegacyHall(c);
 return finish(c,{legacyInventory,roofForm:p.key==='suichu'?'rolled-hip-gable':'rolled-hard-gable',interiorPolicy:legacyInventory.status==='UNKNOWN'?'SOURCED_THROUGH_PLAN_CURRENT_INVENTORY_UNKNOWN':'SOURCED_THROUGH_PLAN_WITH_NONCONFLICTING_LEGACY_UNVERIFIED_SIDE_PIECES',gallerySides:['south','north']});
}
function buildJingfu(c) {
 const{p}=c;platform(c);frame(c);facade(c,{frontDoors:[2],backDoors:[0],sideWindows:true});ceiling(c,{nx:5,nz:5});
 for(let j=0;j<3;j++)rolledRoof(c,{d:p.localD/3+.24,z:-p.localD/3+j*p.localD/3,rise:1.55,tile:'green',trim:'yellow'});
 // Interior column rows avoid the south central doorway and leave the main
 // central room unobstructed. The exact structural reduced-column scheme is unknown.
 for(const x of[-p.localW*.3,p.localW*.3])for(const z of[-p.localD*.3,0,p.localD*.3])column(c,x,z,p.ph,p.colH-.4,{role:'inner-column',r:.2});
 c.box('inner-nameboard','wood',3.1,.66,.13,0,p.ph+p.colH-1.05,p.localD/2-p.gallery-.2);
 c.kit.plaque(c.f,'五福五代堂',0,p.ph+p.colH-1.05,p.localD/2-p.gallery-.28,.5,1.2);
 const legacyInventory=retainLegacyHall(c,{central:true});
 return finish(c,{legacyInventory,roofForm:'three-connected-rolled-hip-gables',gallerySides:['south','north','east','west'],interiorPolicy:'ARCHITECTURAL_SHELL_NO_FABRICATED_WESTERN_INSTRUMENTS'});
}
function buildXishang(c) {
 const{p}=c,w=p.localW,d=p.localD;platform(c);const mainW=w*.66,mainD=d*.7;
 frame(c,{w:mainW,d:mainD,bays:3,depthBays:3});
 // Front, north and south projecting roofs form a convex cross. The retained
 // world envelope is unchanged; all projection lengths are explicit fits.
 ordinaryRoof(c,{type:'cuanjian',w:mainW*.65,d:mainD*.85,height:2.1,y:p.ph+p.colH});
 for(const [x,z,rw,rd]of[[0,-d*.27,mainW*.68,d*.5],[-w*.34,0,w*.32,mainD],[w*.34,0,w*.32,mainD]])rolledRoof(c,{x,z,w:rw,d:rd,y:p.ph+p.colH,rise:1.05,tile:'yellow',trim:'green'});
 // The dark screen is at the west/rear, not across the east entrance.
 c.box('rear-black-screen','black',mainW*.8,3.35,.15,0,p.ph+1.675,mainD/2-.1,true);
 for(const x of[-mainW*.4,mainW*.4])c.box('screen-gold-edge','gold',.04,3.2,.035,x,p.ph+1.67,mainD/2-.19);
 const channel=buildXishangChannel(c);
 const stoneRails=buildXishangStoneRails(c,{mainW,mainD});
 ceiling(c,{x0:-mainW/2,x1:mainW/2,z0:-mainD/2,z1:mainD/2,nx:3,nz:3});
 return finish(c,{planForm:'convex-cross-three-projections',streamLengthHistoricalMetres:27,streamLengthModelStatus:'MEASURED_MODEL_CURVE_NOT_27M_SITE_REPLICA',channel,stoneRails,interiorPolicy:'STONE_CHANNEL_AND_REAR_SCREEN_NO_FURNITURE'});
}
function petalRoof(c,{y,radius,rise,tile,trim}) {
 const rings=9,segs=60,vs=[],ix=[];
 for(let j=0;j<=rings;j++)for(let i=0;i<=segs;i++){const t=j/rings,a=-Math.PI/2+i*Math.PI*2/segs,petal=1+.13*Math.cos(5*(a+Math.PI/2)),r=radius*t*petal;vs.push(Math.cos(a)*r,y+rise*(1-t)**1.65+.12*t**3*Math.cos(5*(a+Math.PI/2)),Math.sin(a)*r);}
 for(let j=0;j<rings;j++)for(let i=0;i<segs;i++){const a=j*(segs+1)+i,b=a+segs+1;ix.push(a,b,a+1,b,b+1,a+1);}const roof=surface(c,'roof-surface',vs,ix,tile,{form:'FIVE_PETAL_PYRAMIDAL_FIT'});
 const points=[];for(let i=0;i<=60;i++){const a=-Math.PI/2+i*Math.PI*2/60,r=radius*(1+.13*Math.cos(5*(a+Math.PI/2)));points.push(new THREE.Vector3(Math.cos(a)*r,y+.12*Math.cos(5*(a+Math.PI/2)),Math.sin(a)*r));}c.tag(c.kit.mesh(c.f,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),80,.07,5,false),c.mats[trim],0,0,0),'plum-roof-edge');return roof;
}
/** Register conservative rectangles inside the actual tessellated top face.
 * An analytic circle would slightly overrun the 20/30-gon rendered platform. */
function walkVisibleConvexTop(c,mesh,y,slices=24) {
 const a=mesh.geometry.attributes.position;let top=-Infinity,radius=0;
 for(let i=0;i<a.count;i++)top=Math.max(top,a.getY(i));
 for(let i=0;i<a.count;i++)if(Math.abs(a.getY(i)-top)<1e-6)radius=Math.max(radius,Math.hypot(a.getX(i),a.getZ(i)));
 const unique=new Map();
 for(let i=0;i<a.count;i++)if(Math.abs(a.getY(i)-top)<1e-6&&Math.hypot(a.getX(i),a.getZ(i))>radius*.99){const x=a.getX(i)+mesh.position.x,z=a.getZ(i)+mesh.position.z;unique.set(x.toFixed(7)+','+z.toFixed(7),{x,z});}
 const poly=[...unique.values()].sort((a,b)=>Math.atan2(a.z-mesh.position.z,a.x-mesh.position.x)-Math.atan2(b.z-mesh.position.z,b.x-mesh.position.x));
 const zmin=Math.min(...poly.map(v=>v.z))+1e-6,zmax=Math.max(...poly.map(v=>v.z))-1e-6;
 const span=z=>{const hits=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(z<Math.min(a.z,b.z)-1e-8||z>Math.max(a.z,b.z)+1e-8)continue;if(Math.abs(a.z-b.z)<1e-8){hits.push(a.x,b.x);continue;}const t=(z-a.z)/(b.z-a.z);hits.push(a.x+t*(b.x-a.x));}return[Math.min(...hits),Math.max(...hits)];};
 for(let j=0;j<slices;j++){const z0=zmin+j*(zmax-zmin)/slices,z1=zmin+(j+1)*(zmax-zmin)/slices,a=span(z0),b=span(z1),x0=Math.max(a[0],b[0])+1e-6,x1=Math.min(a[1],b[1])-1e-6;if(x1-x0>.02)c.walk(x0,z0,x1,z1,y);}
}
function buildBiluo(c) {
 const{p}=c,r=Math.min(p.localW,p.localD)*.38,y=p.ph,h=3.2;
 const platformMeshes=[c.cylinder('plum-platform-core','stone',r*1.02,y,0,y/2,0,false,30)];
 for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;platformMeshes.push(c.cylinder('plum-platform-petal','stone',r*.66,y,Math.cos(a)*r*.69,y/2,Math.sin(a)*r*.69,false,20));}
 // Fitted low east-side viewing steps. The historical mountain stair extent
 // remains unknown; these steps only join the retained low model datum.
 for(let i=0;i<3;i++){const height=y*(i+1)/3;c.box('fitted-east-viewing-step','stone',.305,height,1.5,-3.1+(i+.5)*.3,height/2,-.47,false);}
 const rampFrame=new THREE.Group();rampFrame.position.set(-2.65,0,-.47);rampFrame.rotation.y=Math.PI/2;c.f.add(rampFrame);rampFrame.updateMatrixWorld(true);c.kit.walkRamp(rampFrame,-.75,.75,-.45,.45,0,y);rampFrame.removeFromParent();
 // One low occupied platform, never a second floor inferred from two eaves.
 for(const mesh of platformMeshes)walkVisibleConvexTop(c,mesh,y);
 const angles=Array.from({length:5},(_,i)=>-Math.PI/2+Math.PI/5+i*2*Math.PI/5);
 for(const a of angles)column(c,Math.cos(a)*r,Math.sin(a)*r,y,h-.2,{r:.14});
 for(let i=0;i<5;i++){
  const a=angles[i],b=angles[(i+1)%5],x0=Math.cos(a)*r,z0=Math.sin(a)*r,x1=Math.cos(b)*r,z1=Math.sin(b)*r,dx=x1-x0,dz=z1-z0,openingSide=i===3;
  if(openingSide)continue;const n=8;for(let k=0;k<n;k++){const t=(k+.5)/n,x=x0+dx*t,z=z0+dz*t;c.cylinder('curved-stone-rail-post','stone',.045,.72,x,y+.36,z,true,8);}const rail=c.box('curved-stone-rail','stone',Math.hypot(dx,dz),.1,.1,(x0+x1)/2,y+.7,(z0+z1)/2,false);rail.rotation.y=-Math.atan2(dz,dx);
 }
 const lowerRoof=petalRoof(c,{y:y+h,radius:r*1.37,rise:1.2,tile:'blue',trim:'purple'}),upperRoof=petalRoof(c,{y:y+h+1.35,radius:r*1.05,rise:1.45,tile:'green',trim:'purple'});
 // Five short fitted bearing posts join the two actual roof shells. They do
 // not imply another occupied floor, a surveyed drum, or historic carved work.
 c.f.updateMatrixWorld(true);
 const inverse=c.f.matrixWorld.clone().invert();
 // Main column caps stop below the thin shell, instead of puncturing its tile
 // face. Small plain bearer blocks meet the actual downward soffit from below.
 for(const a of angles){const x=Math.cos(a)*r,z=Math.sin(a)*r,origin=new THREE.Vector3(x,y+h+4,z).applyMatrix4(c.f.matrixWorld),hit=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0)).intersectObject(lowerRoof)[0];if(!hit)throw Error('BiLuo lower bearer has no roof');const top=hit.point.clone().applyMatrix4(inverse).y-.04,bottom=y+h-.21;c.cylinder('biluo-lower-eave-bearer','wood',.065,top-bottom,x,(top+bottom)/2,z,false,8);}
 for(let i=0;i<5;i++){

  const a=-Math.PI/2+i*2*Math.PI/5,x=Math.cos(a)*r*.45,z=Math.sin(a)*r*.45,origin=new THREE.Vector3(x,y+h+5,z).applyMatrix4(c.f.matrixWorld),ray=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0));
  const lo=ray.intersectObject(lowerRoof)[0],hi=ray.intersectObject(upperRoof)[0];
  if(!lo||!hi)throw Error('BiLuo roof-bearing ray missed actual shell');
  const y0=lo.point.clone().applyMatrix4(inverse).y-.035;
  // Fit every actual top-cap vertex to the sloped roof shell. A centre-only
  // flat cap previously punctured the low side of the tile by about 18 mm.
  const y1=hi.point.clone().applyMatrix4(inverse).y-.04;
  const bearer=c.cylinder('biluo-upper-eave-bearer','wood',.075,y1-y0,x,(y0+y1)/2,z,false,8),positions=bearer.geometry.attributes.position,initialTop=(y1-y0)/2;
  for(let k=0;k<positions.count;k++)if(Math.abs(positions.getY(k)-initialTop)<1e-6){const origin=new THREE.Vector3(x+positions.getX(k),y+h+5,z+positions.getZ(k)).applyMatrix4(c.f.matrixWorld),hit=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0)).intersectObject(upperRoof)[0];if(!hit)throw Error('BiLuo upper bearer cap outside actual roof');positions.setY(k,hit.point.clone().applyMatrix4(inverse).y-.04-bearer.position.y);}
  positions.needsUpdate=true;bearer.geometry.computeVertexNormals();bearer.geometry.computeBoundingBox();bearer.geometry.computeBoundingSphere();bearer.userData.capPolicy='ACTUAL_VERTEX_SLOPED_CAP_EMBEDDED_IN_ROOF_SHELL';
 }

 // Official close view 1442: layered foot, neck, bowl, gold waist and ovoid.
 // Only the silhouette and color families are fitted; no ice-plum artwork.
 const finialBase=y+h+2.8,finialParts=[];
 finialParts.push(c.cylinder('r68-biluo-finial-foot','yellow',.20,.12,0,finialBase+.04,0,false,24));
 finialParts.push(c.cylinder('r68-biluo-finial-neck','blue',.17,.17,0,finialBase+.175,0,false,24));
 const bowl=c.tag(c.kit.mesh(c.f,new THREE.CylinderGeometry(.29,.17,.18,24),c.mats.blue,0,finialBase+.35,0),'r68-biluo-finial-bowl');finialParts.push(bowl);
 finialParts.push(c.cylinder('r68-biluo-finial-waist','yellow',.29,.09,0,finialBase+.475,0,false,24));
 const ball=c.tag(c.kit.mesh(c.f,new THREE.SphereGeometry(1,24,16),c.mats.blue,0,finialBase+.81,0),'r68-biluo-finial-ovoid');ball.scale.set(.30,.40,.30);finialParts.push(ball);
 for(const m of finialParts)m.userData.patternStatus='PLAIN_SILHOUETTE_NO_REPLICATED_ICE_PLUM_MOTIF';
 const finialFit={sourceImage:'https://img.dpm.org.cn/Uploads/Picture/dc/1442[1024].jpg',dimensionStatus:FIT,accepted:false,photographyDate:null,scope:'FIVE_PLAIN_LAYERS_AND_COLOR_FAMILIES_ONLY'};
 // Applied five-petal ceiling motif, visibly geometric rather than a claim to
 // reproduce the exceptionally fine surviving plum relief carving.
 c.cylinder('plum-ceiling-ground','wood',r,.07,0,y+h-.12,0,false,30);for(let i=0;i<5;i++){const a=i*2*Math.PI/5;c.cylinder('plum-ceiling-petal','paper',.22,.045,Math.cos(a)*.25,y+h-.17,Math.sin(a)*.25,false,12);}
 return finish(c,{finialFit,planForm:'five-petal-five-column',occupiedFloorCount:1,mountainBridgeStatus:'DEFERRED_NOT_PLACED_ON_FALSE_SURVEYED_MOUNTAIN',roofForm:'double-eave-five-petal-pointed',interiorPolicy:'OPEN_PAVILION_NO_GENERIC_FURNISHINGS'});
}

/** Meshes describe upper floors even where navigation must remain ground-only.
 * Holes are removed from the slab itself, not painted as black rectangles. */
function upperFloor(c, { holes = [], walk = false, y = c.p.upperFloorY } = {}) {
 const x0=-c.p.localW/2+.12,x1=-x0,z0=-c.p.localD/2+.12,z1=-z0;
 const xs=[x0,x1,...holes.flatMap(q=>[q.x0,q.x1])].sort((a,b)=>a-b);
 const zs=[z0,z1,...holes.flatMap(q=>[q.z0,q.z1])].sort((a,b)=>a-b);
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
  const x=(xs[i-1]+xs[i])/2,z=(zs[j-1]+zs[j])/2;
  if(holes.some(q=>x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1))continue;
  slab(c,'upper-floor-slab',xs[i-1],xs[i],zs[j-1],zs[j],y,{walk,thickness:.18});
 }
 return holes.map(q=>({...q,x:(q.x0+q.x1)/2,z:(q.z0+q.z1)/2,y,status:'FITTED_REAL_OPENING_NOT_TEXTURE'}));
}
function guardOpening(c,q,{openFront=false,y=c.p.upperFloorY}={}) {
 const role='void-guardrail',mat='wood',w=q.x1-q.x0,d=q.z1-q.z0;
 for(const x of[q.x0,q.x1])rail(c,{x,z:(q.z0+q.z1)/2,length:d,y,side:true,mat,role});
 rail(c,{x:(q.x0+q.x1)/2,z:q.z1,length:w,y,mat,role});
 if(!openFront)rail(c,{x:(q.x0+q.x1)/2,z:q.z0,length:w,y,mat,role});
}
function perimeterRail(c,y,{front=true,rear=true,sides=true}={}) {
 const w=c.p.localW-.2,d=c.p.localD-.2;
 if(front)rail(c,{x:0,z:-d/2,length:w,y});
 if(rear)rail(c,{x:0,z:d/2,length:w,y});
 if(sides)for(const sign of[-1,1])rail(c,{x:sign*w/2,z:0,length:d,y,side:true});
}
function twoLevelFrame(c,{groundGallery=c.p.gallery,upperGallery=c.p.gallery,frontDoors=[Math.floor(c.p.bays/2)],rearDoors=[],pattern='steps',wall='red',sideWindows=false,rearInset=groundGallery,upperFrontPattern=pattern}={}) {
 const{p}=c,h0=p.upperFloorY-p.ph,h1=p.ph+p.colH-p.upperFloorY;
 platform(c);
 frame(c,{h:h0-.08});
 facade(c,{h:h0-.35,inset:groundGallery,rearInset,frontDoors,backDoors:rearDoors,pattern,wall,sideWindows});
 frame(c,{y:p.upperFloorY,h:h1,role:'upper-level-frame'});
 facade(c,{y:p.upperFloorY,h:h1-.35,inset:upperGallery,rearInset,frontDoors:[Math.floor(p.bays/2)],backDoors:[],pattern,frontPattern:upperFrontPattern,wall,sideWindows});
 return{h0,h1};
}
function hangingFrieze(c,{y=c.p.ph+c.p.colH-.45,z=-c.p.localD/2,w=c.p.localW,bays=c.p.bays}={}) {
 for(let i=0;i<bays;i++){
  const x=-w/2+(i+.5)*w/bays,bw=w/bays-.3;
  c.box('hanging-frieze','wood',bw,.12,.09,x,y,z);
  for(const sign of[-1,1])c.box('hanging-frieze-pendant','wood',.12,.48,.1,x+sign*(bw/2-.14),y-.24,z);
 }
}
function retainLegacyRoom(c) {
 if(c.p.key==='yanqu')return{source:'LEGACY_GENERIC_ROOM_PRESET_NOT_MUSEUM_INVENTORY',status:'UNKNOWN',knownEmpty:false,accepted:false,currentInventoryVerified:false,retained:[],withheldMeshCount:6,withheldColliderCount:5,withheld:['kang','mattress','small-table','two-stools','cabinet'],notProofOfEmptyRoom:true,missingEvidence:['CURRENT_ROOM_INVENTORY','PLACEMENT','PERIOD_MAPPING']};
 const{p}=c,back=p.localD/2-p.gallery-.45,right=(p.localW-2*p.gallery)*.28,left=-right;
 const put=(kind,w,h,d,x,z,mat='wood',raise=0)=>{const m=c.box('legacy-unverified-'+kind,mat,w,h,d,x,p.ph+raise+h/2,z,h>.36);m.userData.inventoryStatus='LEGACY_UNVERIFIED';m.userData.source='src/scene/palace/interiors.js PRESETS.room';};
 put('kang',2.6,.62,1.7,right,back-.65);put('mattress',2.34,.08,1.445,right,back-.65,'paper',.62);
 put('small-table',.9,.8,.9,left,back-1.05);for(const sign of[-1,1])put('stool',.4,.45,.4,left+sign*.75,back-1.05,'red');put('cabinet',1,1.9,.5,left,back);
 return{source:'LEGACY_GENERIC_ROOM_PRESET_NOT_MUSEUM_INVENTORY',retained:['kang','mattress','small-table','two-stools','cabinet'],placementStatus:'FITTED_WITHIN_REVISED_ENCLOSURE'};
}
function buildJingqi(c) {
 const{p}=c;twoLevelFrame(c,{pattern:'glass',upperFrontPattern:'steps',upperGallery:.7});
 c.f.userData.r67JingqiUpperWindow={source:'https://www.dpm.org.cn/explore/building/236480.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/4750[1024].jpg',scope:'UPPER_SOUTH_FIELDS_ONLY_LOWER_GLASS_UNCHANGED',motif:'SIMPLIFIED_STEP_LATTICE_NOT_EXACT_BUBUJIN_REPLICA',measured:false,accepted:false};
 const hole={x0:-14.7,x1:-12.1,z0:-3.5,z1:3.35};
 const floorVoids=upperFloor(c,{holes:[hole],walk:true});guardOpening(c,hole,{openFront:true});perimeterRail(c,p.upperFloorY);
 // A real sloping stair in the attested east end bay. Run, pitch, direction,
 // opening and landing sizes are fitted, not surveyed historic stair dimensions.
 const stair={x:-13.4,zBottom:3.2,zTop:-3.5,width:2.2,y0:p.ph,y1:p.upperFloorY,positionSource:p.source,dimensionsStatus:FIT,route:[[0,2.5],[-10.5,2.5],[-10.5,3.25],[-13.4,3.25],[-13.4,3.2],[-13.4,-3.5],[-13.4,-4.2],[-10.5,-4.2]]};
 const count=30,run=stair.zBottom-stair.zTop,rise=stair.y1-stair.y0;
 for(let i=0;i<count;i++){
  const z=stair.zBottom-(i+.5)*run/count,y=stair.y0+rise*(i+1)/count;
  c.box('stair-tread','wood',stair.width,.09,run/count+.012,stair.x,y-.045,z,false);
  if(i>=4)for(const sign of[-1,1])c.box('stair-side-guard','wood',.07,.92,.07,stair.x+sign*(stair.width/2+.06),y+.46,z,true);
 }
 c.kit.walkRamp(c.f,stair.x-stair.width/2,stair.x+stair.width/2,stair.zBottom,stair.zTop,stair.y0,stair.y1);
 // East secondary-bay small rooms use openings in genuine partition walls.
 for(const x of[-4.4,-9])wallLine(c,{a0:-p.localD/2+p.gallery,a1:p.localD/2-p.gallery,at:x,y:p.ph,h:4.25,side:true,doors:[{at:2.5,w:2.1}],mat:'wood',role:'jingqi-east-room-partition'});
 wallLine(c,{a0:-9,a1:-4.4,at:0,y:p.ph,h:4.25,doors:[{at:-6.7,w:2.1}],mat:'wood',role:'jingqi-east-room-partition'});
 // Concave stage: three low connected rectangles, front passage and two
 // background openings. Plain panels deliberately do not invent the mural.
 const sx=p.localW*2/7,sz=1.5,sw=4.3,sd=3.5,sy=p.ph+.35;
 slab(c,'jingqi-concave-stage',sx-sw/2,sx+sw/2,sz+.8,sz+sd/2,sy,{mat:'wood',thickness:.35});
 for(const sign of[-1,1])slab(c,'jingqi-concave-stage',sx+sign*sw/2-(sign>0?.85:0),sx+sign*sw/2+(sign<0?.85:0),sz-sd/2,sz+.8,sy,{mat:'wood',thickness:.35});
 wallLine(c,{a0:sx-sw/2,a1:sx+sw/2,at:sz+sd/2,y:sy,h:2.7,doors:[{at:sx-1.1,w:.85},{at:sx+1.1,w:.85}],mat:'wood',role:'jingqi-stage-backdrop'});
 const legacyInventory=retainLegacyHall(c,{central:true,centralX:3.7});
 ordinaryRoof(c,{w:p.localW+.4,d:p.localD+.5,y:p.ph+p.colH,type:'xieshan'});
 // A narrow perimeter waist canopy does not cover the upper occupied floor.
 const edge=p.upperFloorY-.22;
 for(const sign of[-1,1])surface(c,'jingqi-waist-eave',[-p.localW/2-.4,edge,sign*(p.localD/2+.4),p.localW/2+.4,edge,sign*(p.localD/2+.4),p.localW/2,edge+.28,sign*(p.localD/2-1),-p.localW/2,edge+.28,sign*(p.localD/2-1)],[0,1,2,0,2,3],'yellow');
 for(const sign of[-1,1])surface(c,'jingqi-waist-eave',[sign*(p.localW/2+.4),edge,-p.localD/2-.4,sign*(p.localW/2+.4),edge,p.localD/2+.4,sign*(p.localW/2-1),edge+.28,p.localD/2,sign*(p.localW/2-1),edge+.28,-p.localD/2],[0,1,2,0,2,3],'yellow');
 ceiling(c,{y:p.ph+p.colH-.25,nx:7,nz:3});
 return finish(c,{floorVoids,stair,legacyInventory,upperNavigation:'PHYSICAL_STAIR_ONLY_NO_TELEPORT',interiorPolicy:'SOURCED_EAST_ROOMS_WEST_CONCAVE_STAGE_WITH_FITTED_DIMENSIONS',roofForm:'UPPER_XIESHAN_WITH_NARROW_WAIST_EAVE'});
}
function buildYanqu(c) {
 const{p}=c;twoLevelFrame(c,{sideWindows:true});upperFloor(c);perimeterRail(c,p.upperFloorY,{rear:false});
 for(const y of[p.ph+p.upperFloorY-p.ph-.35,p.ph+p.colH-.35])hangingFrieze(c,{y});
 // East, north and south galleries follow the east-facing frame. A plain
 // porcelain color cue is explicit approximation, not a copied inlay design.
 for(const y of[p.ph+1.8,p.upperFloorY+1.8])for(let i=0;i<12;i++){
  const m=c.box('porcelain-inlay-material-cue',i%2?'blue':'paper',.12,.12,.03,-4.2+i*.76,y,p.localD/2-p.gallery-.13);m.userData.patternStatus='ABSTRACT_MATERIAL_CUE_NOT_ORIGINAL_PATTERN';
 }
 const legacyInventory=retainLegacyRoom(c);
 rolledRoof(c,{tile:'green',trim:'yellow'});ceiling(c,{y:p.ph+p.colH-.25,nx:5,nz:3});
 return finish(c,{legacyInventory,removedBridgeRecreated:false,gallerySides:['east','north','south'],interiorPolicy:'REAL_TWO_LEVEL_ENCLOSURE_WITH_PORCELAIN_MATERIAL_CUES_CURRENT_INVENTORY_UNKNOWN',upperNavigation:'VIEW_ONLY_NO_UNVERIFIED_STAIR_OR_BRIDGE'});
}
function buildCuishang(c) {
 const{p}=c;twoLevelFrame(c,{rearDoors:[1,3]});upperFloor(c);perimeterRail(c,p.upperFloorY);
 const bw=p.localW/5;
 c.box('cuishang-upper-west-dark-gallery','wood',bw-.22,3.45,.14,p.localW/2-bw/2,p.upperFloorY+1.725,-p.localD/2+.12,true);
 for(const y of[p.upperFloorY-.35,p.ph+p.colH-.35])hangingFrieze(c,{y});
 const legacyInventory=retainLegacyHall(c,{central:true});
 rolledRoof(c,{tile:'yellow',trim:'green'});ceiling(c,{y:p.ph+p.colH-.25,nx:5,nz:3});
 return finish(c,{legacyInventory,upperFrontGallery:{openBays:[0,1,2,3],enclosedWestEndBay:4},upperBridgeStatus:'KNOWN_LINK_TO_BILUO_NOT_YET_FITTED_OR_WALKABLE',interiorPolicy:'REAL_TWO_LEVEL_GALLERIES_WITH_SOURCE_BACKED_ASYMMETRIC_UPPER_FRONT'});
}
function buildYueshi(c) {
 const{p}=c;twoLevelFrame(c,{pattern:'glass',wall:'brick'});upperFloor(c);perimeterRail(c,p.upperFloorY,{rear:false,sides:false});
 // Ground central doors have three visual leaves, upper six. Open side leaves
 // remain outside the clear aperture; counts are ornament bands, not extra walls.
 for(const[y,n]of[[p.ph,3],[p.upperFloorY,6]])for(let i=0;i<n;i++)c.box('yueshi-glass-door-transom','glass',p.localW/5/n-.06,.55,.055,-p.localW/10+(i+.5)*p.localW/5/n,y+2.95,-p.localD/2+p.gallery);
 const legacyInventory=retainLegacyHall(c,{central:true});
 rolledRoof(c,{tile:'yellow',trim:'green',sourceVerge:true});ceiling(c,{y:p.ph+p.colH-.25,nx:5,nz:3});
 return finish(c,{legacyInventory,removedTerracesRecreated:false,roofForm:'SINGLE_ROLLED_HIP_GABLE_OVER_TWO_STOREYS',interiorPolicy:'ARCHITECTURAL_THEATRE_VIEWING_HALL_NOT_RECREATED_HISTORIC_THRONE_IN_CURRENT_EXHIBITION',upperNavigation:'VIEW_ONLY_STAIR_LOCATION_UNKNOWN'});
}
function altarOutline(c,{x,z,w,d,y=c.p.ph,role='dated-altar-plinth'}) {
 const m=c.box(role,'wood',w,.46,d,x,y+.23,z,true);m.userData.inventoryStatus='ARCHITECTURAL_DAIS_OUTLINE_NOT_FABRICATED_STATUE';m.userData.currentInventoryVerified=false;
 c.box('altar-upper-edge','gold',w+.04,.05,d+.04,x,y+.485,z,false);
}
function buildFori(c) {
 const{p}=c,h0=p.upperFloorY-p.ph;twoLevelFrame(c,{rearInset:0});upperFloor(c);perimeterRail(c,p.upperFloorY,{rear:false,sides:false});hangingFrieze(c);
 for(const x of[-p.localW/6,p.localW/6])wallLine(c,{a0:-p.localD/2+p.gallery,a1:p.localD/2,at:x,y:p.ph,h:h0-.2,side:true,doors:[{at:-1.7,w:1.7}],mat:'wood',role:'fori-lower-shrine-partition'});
 for(const x of[-p.localW/3,0,p.localW/3])altarOutline(c,{x,z:2.6,w:2.15,d:.8,role:'fori-lower-altar-outline'});
 // Upper three-sided offering-table arrangement only. No unsourced Buddha
 // sculpture or automatic multiplication into the historical 378 figure count.
 for(const x of[-p.localW/3,0,p.localW/3])altarOutline(c,{x,z:2.6,w:2.15,d:.8,y:p.upperFloorY,role:'fori-upper-altar-outline'});
 for(const sign of[-1,1])altarOutline(c,{x:sign*(p.localW/2-.65),z:0,w:.65,d:4.6,y:p.upperFloorY,role:'fori-upper-side-offering-outline'});
 rolledRoof(c,{tile:'yellow',trim:'green'});ceiling(c,{y:p.ph+p.colH-.25,nx:3,nz:1});
 return finish(c,{interiorPolicy:'SOURCED_PARTITIONS_AND_THREE_SIDED_ALTAR_LAYOUT_NO_INVENTED_BUDDHA',externalStairStatus:'OFFICIAL_EAST_STONE_CONNECTION_NOT_FITTED_IN_RETAINED_ENVELOPE',historicalFigureCountsNotModelled:[378],upperNavigation:'VIEW_ONLY_NO_FALSE_STAIR'});
}
function buildFanhua(c) {
 const{p}=c,bw=p.localW/7,h0=p.upperFloorY-p.ph,holes=[];twoLevelFrame(c,{rearInset:0});buildFanhuaFrontBalustrade(c);fitFanhuaFloorFascia(c);hangingFrieze(c);
 for(let i=0;i<7;i++)if(i!==3){const x=-p.localW/2+(i+.5)*bw;holes.push({x0:x-.85,x1:x+.85,z0:-1.05,z1:1.05});}
 const floorVoids=upperFloor(c,{holes});for(const q of holes)guardOpening(c,q);
 for(let i=1;i<7;i++)for(const y of[p.ph,p.upperFloorY])wallLine(c,{a0:-p.localD/2+p.gallery,a1:p.localD/2,at:-p.localW/2+i*bw,y,h:(y===p.ph?h0:p.ph+p.colH-p.upperFloorY)-.22,side:true,doors:[{at:-2,w:1.7}],mat:'wood',role:'fanhua-seven-bay-partition'});
 for(let i=0;i<7;i++){
  const x=-p.localW/2+(i+.5)*bw;
  if(i===3){altarOutline(c,{x,z:1.8,w:1.5,d:.9,role:'fanhua-central-standing-statue-pedestal-outline'});altarOutline(c,{x,z:2.9,w:2,d:.8,y:p.upperFloorY,role:'fanhua-upper-central-altar-outline'});continue;}
  altarOutline(c,{x,z:0,w:1.35,d:1.35,role:'fanhua-stupa-plinth'});
  altarOutline(c,{x,z:2.9,w:bw-.4,d:.65,y:p.upperFloorY,role:'fanhua-upper-north-altar-outline'});
  for(const sign of[-1,1]){
   const gx=x+sign*(bw/2-.22);c.box('fanhua-side-niche-frame','wood',.18,2,3.6,gx,p.upperFloorY+1.6,.4,true);
   for(let j=0;j<5;j++)c.box('fanhua-empty-niche-divider','gold',.035,2,.04,gx-sign*.11,p.upperFloorY+1.6,-1.2+j*.8,false);
  }
 }
 rolledRoof(c,{tile:'yellow',trim:'green'});ceiling(c,{y:p.ph+p.colH-.25,nx:7,nz:1});
 return finish(c,{floorVoids,interiorPolicy:'SIX_REAL_VERTICAL_VOIDS_AND_ALTAR_OUTLINES_NO_INVENTED_BUDDHA_OR_THANGKA',historicalFigureCountsNotModelled:[54,122,786],upperNavigation:'VIEW_ONLY_EXTERNAL_CONNECTION_UNFITTED'});
}

function octagonalCaisson(c,{x=0,z=0,y=7,radius=2,role='octagonal-caisson-ring'}={}) {
 // Actual stepped octagonal annuli and rising walls, not detached decorative
 // sticks. The lowest apron overlaps the fitted ceiling aperture; each riser
 // connects adjacent rings, and the cap overlaps the innermost ledge.
 const octagon=(r)=>{const path=new THREE.Path();for(let i=0;i<8;i++){const a=i*Math.PI/4;if(i===0)path.moveTo(r*Math.cos(a),r*Math.sin(a));else path.lineTo(r*Math.cos(a),r*Math.sin(a));}path.closePath();return path;};
 const ring=(outer,inner,yy,depth,r)=>{const path=octagon(outer),shape=new THREE.Shape(path.getPoints());shape.holes.push(octagon(inner));const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false});geo.rotateX(Math.PI/2);return c.tag(c.kit.mesh(c.f,geo,c.mats.gold,x,yy+depth/2,z),r);};
 for(let level=0;level<3;level++){
  const outer=level===0?radius+.14:radius-level*.24,inner=radius-(level+1)*.24;
  ring(outer,inner,y+level*.13,.12,role);
  if(level<2)ring(inner+.045,inner-.045,y+level*.13+.125,.14,'octagonal-caisson-rising-wall');
 }
 c.cylinder('octagonal-caisson-inner-ground','gold',radius-.62,.07,x,y+.34,z,false,8);
}

function retainKitThrone(c,{role='retained-kit-throne',backDoor=c.item.backDoor??false}={}) {
 const{p,kit,f}=c,n=Math.max(3,Math.round(p.w/3.6)|1),bay=p.w/n,tw=Math.min(bay*1.4,5),tz=p.d/2-(backDoor?Math.min(3.4,p.d*.36):Math.min(2.6,p.d*.3));
 for(const[r,ww,hh,dd,yy,zz,mat]of[[role+'-dais',tw,.5,2.4,.25,tz,kit.lacquer],[role+'-seat',1.4,.6,1,.8,tz,kit.gold],[role+'-back',1.5,1.2,.2,1.6,tz+.5,kit.gold],[role+'-screen',tw*.8,2.6,.25,1.8,tz+1.15,kit.gold]]){
  const mesh=c.tag(kit.mesh(f,new THREE.BoxGeometry(ww,hh,dd),mat,0,p.ph+yy,zz),r);mesh.userData.inventoryStatus='RETAINED_LEGACY_KIT_THRONE_SOURCE_ATTESTS_THRONE_BUT_DIMENSIONS_UNVERIFIED';
 }
 kit.col(f,-tw/2,p.ph,tz-1.2,tw/2,p.ph+3,tz+1.3);
 return{tz,tw,bay,source:'RETAINED_BASELINE_KIT_THRONE_NOT_ADDITIONAL_FURNITURE'};
}
function buildYangxing(c) {
 const{p}=c,w=p.localW,d=p.localD,front=-d/2,rear=d/2,annexDepth=3.2,bodyFront=front+annexDepth,annexH=p.colH-1.35,big=w/3;
 platform(c);
 // Three main structural bays, each subdivided by square posts. The middle
 // three visible subdivisions are narrow/wide/narrow as in the official image.
 const weights=[1,1,1,.8,1.4,.8,1,1,1],edges=[-w/2];for(const q of weights)edges.push(edges.at(-1)+q*w/9);
 for(const x of edges)for(const z of[bodyFront,rear])column(c,x,z,p.ph,p.colH,{square:true,r:.23,role:'yangxing-square-subdivision-post'});
 for(const x of[-w/2,w/2])for(let j=1;j<4;j++)column(c,x,bodyFront+j*(rear-bodyFront)/4,p.ph,p.colH,{square:true,r:.23,role:'yangxing-side-column'});
 for(const z of[bodyFront,rear])c.box('yangxing-main-beam','wood',w+.25,.4,.32,0,p.ph+p.colH-.2,z);
 for(const x of[-w/2,w/2])c.box('yangxing-main-beam','wood',.32,.4,rear-bodyFront,x,p.ph+p.colH-.2,(rear+bodyFront)/2);
 const annexIndices=[3,4,5,6],frontAnnexBays=annexIndices.map(i=>({index:i,x0:edges[i],x1:edges[i+1],z0:front,z1:bodyFront,positionStatus:'PHOTO_TOPOLOGY_CENTRE_THREE_PLUS_WEST_ONE_DIMENSIONS_FITTED'}));
 for(let i=0;i<9;i++){
  const x=(edges[i]+edges[i+1])/2,bw=edges[i+1]-edges[i],isAnnex=annexIndices.includes(i),z=isAnnex?front:bodyFront,h=isAnnex?annexH-.3:p.colH-.42;
  if(i===4){opening(c,{x,z,w:2.8,h:3.3,y:p.ph,role:'yangxing-four-leaf-central-door'});for(const sign of[-1,1])panel(c,{x:x+sign*(bw/4+.7),z,w:(bw-2.8)/2-.12,h,y:p.ph,pattern:'glass'});c.box('yangxing-central-door-transom','glass',2.8,h-3.5,.07,x,p.ph+3.5+(h-3.5)/2,z,true);}
  else panel(c,{x,z,w:bw-.16,h,y:p.ph,pattern:'glass'});
  // Central rear door, with closed glazed bays to either side; widths fitted.
  if(i===4){opening(c,{x,z:rear,w:2.8,h:3.3,y:p.ph});c.box('yangxing-rear-door-transom','wood',2.8,p.colH-3.95,.12,x,p.ph+3.55+(p.colH-3.95)/2,rear,true);for(const sign of[-1,1])panel(c,{x:x+sign*(bw/4+.7),z:rear,w:(bw-2.8)/2-.12,h:p.colH-.42,y:p.ph,pattern:'glass'});}
  else panel(c,{x,z:rear,w:bw-.16,h:p.colH-.42,y:p.ph,pattern:'glass'});
 }
 // One continuous four-bay front annex roof, not four directional pavilions.
 const ax0=edges[3],ax1=edges[7],aw=ax1-ax0,ac=(ax0+ax1)/2;
 for(const x of edges.slice(3,8))column(c,x,front,p.ph,annexH,{square:true,r:.23,role:'yangxing-annex-square-post'});
 c.box('yangxing-annex-front-beam','wood',aw,.36,.32,ac,p.ph+annexH-.18,front);
 for(const x of[ax0,ax1])c.box('yangxing-annex-side-enclosure','red',.18,annexH-.4,annexDepth,x,p.ph+(annexH-.4)/2,(front+bodyFront)/2,true);
 for(const x of[-w/2,w/2])c.box('yangxing-main-gable','red',.22,p.colH-.42,rear-bodyFront,x,p.ph+(p.colH-.42)/2,(rear+bodyFront)/2,true);
 ordinaryRoof(c,{w:w+.5,d:rear-bodyFront+.5,z:(rear+bodyFront)/2});
 rolledRoof(c,{w:aw+.5,d:annexDepth+.7,x:ac,z:(front+bodyFront)/2,y:p.ph+annexH,rise:1.15,tile:'yellow',trim:'yellow'});
 // Attested partitions isolate the central audience hall and asymmetric east/
 // west apartments. Their exact coordinates are fitted to the retained map.
 for(const x of[-big/2,big/2])wallLine(c,{a0:bodyFront,a1:rear,at:x,y:p.ph,h:p.colH-.42,side:true,doors:[{at:-2,w:2.2}],mat:'wood',role:'yangxing-central-partition'});
 wallLine(c,{a0:-w/2,a1:-big/2,at:1.6,y:p.ph,h:p.colH-.42,doors:[{at:-big,w:2.2}],mat:'wood',role:'yangxing-east-room-partition'});
 wallLine(c,{a0:big/2,a1:w/2,at:1.6,y:p.ph,h:p.colH-.42,doors:[{at:big*.8,w:2.2}],mat:'wood',role:'yangxing-west-room-partition'});
 const westEnd=w/2-w/9;
 wallLine(c,{a0:bodyFront,a1:rear,at:westEnd,y:p.ph,h:p.colH-.42,side:true,doors:[{at:-4,w:2},{at:5,w:2}],mat:'wood',role:'yangxing-moyun-partition'});
 slab(c,'yangxing-west-upper-floor',big/2+.12,westEnd-.12,1.8,rear-.2,p.upperFloorY,{thickness:.18});
 // Plain fitted bearing frame: the source supports a two-level western shrine,
 // not these exact members or column counts. Do not leave the 9.65 m deep slab
 // visually cantilevering from its rear column row. The low front supports sit
 // at the room corners, outside the existing central opening and side door.
 const loft={x0:big/2+.12,x1:westEnd-.12,z0:1.8,z1:rear-.2,bottom:p.upperFloorY-.18},beamH=.25,beamY=loft.bottom-beamH/2;
 for(const x of[loft.x0+.05,loft.x1-.05])c.box('yangxing-west-loft-fitted-ground-post','wood',.22,loft.bottom-beamH-p.ph,.22,x,(p.ph+loft.bottom-beamH)/2,loft.z0+.06,true);
 for(const z of[loft.z0,loft.z1])c.box('yangxing-west-loft-fitted-transverse-beam','wood',loft.x1-loft.x0+.24,beamH,.3,(loft.x0+loft.x1)/2,beamY,z);
 for(const t of[0,.25,.5,.75,1])c.box('yangxing-west-loft-fitted-longitudinal-beam','wood',.24,beamH,loft.z1-loft.z0+.24,loft.x0+(loft.x1-loft.x0)*t,beamY,(loft.z0+loft.z1)/2);

 rail(c,{x:(big/2+westEnd)/2,z:1.8,length:westEnd-big/2-.24,y:p.upperFloorY,role:'yangxing-west-shrine-upper-guard'});
 altarOutline(c,{x:(big/2+westEnd)/2,z:rear-1.2,w:3.2,d:1.1,role:'yangxing-west-lower-shrine-plinth'});
 altarOutline(c,{x:(big/2+westEnd)/2,z:rear-1.2,w:3.2,d:1.1,y:p.upperFloorY,role:'yangxing-west-upper-shrine-plinth'});
 const throne=retainKitThrone(c,{role:'yangxing-throne'});
 const ceilingY=p.ph+p.colH-.35,shape=new THREE.Shape();shape.moveTo(-big/2+.2,bodyFront);shape.lineTo(big/2-.2,bodyFront);shape.lineTo(big/2-.2,rear);shape.lineTo(-big/2+.2,rear);shape.closePath();const oct=new THREE.Path();for(let i=0;i<8;i++){const a=i*Math.PI/4,x=2.18*Math.cos(a),z=throne.tz+2.18*Math.sin(a);if(i===0)oct.moveTo(x,z);else oct.lineTo(x,z);}oct.closePath();shape.holes.push(oct);const cg=new THREE.ExtrudeGeometry(shape,{depth:.07,bevelEnabled:false});cg.rotateX(Math.PI/2);c.tag(c.kit.mesh(c.f,cg,c.mats.wood,0,ceilingY,0),'yangxing-octagonal-ceiling-aperture');
 // An actual octagonal ceiling opening reveals the raised rings. There is no
 // opaque generic coffer placed across the sourced caisson's cavity.
 for(const z of[bodyFront+4,bodyFront+8,bodyFront+12])if(z<throne.tz-2.3)c.box('yangxing-ceiling-grid','gold',big-.4,.055,.055,0,ceilingY-.08,z);
 for(const x of[-big/6,big/6])c.box('yangxing-ceiling-grid','gold',.055,.055,throne.tz-2.3-bodyFront,x,ceilingY-.08,(bodyFront+throne.tz-2.3)/2);
 octagonalCaisson(c,{z:throne.tz,y:ceilingY-.04,radius:2.1});
 return finish(c,{frontAnnexBays,mainStructuralBays:3,facadeSubdivisions:9,throne,roomPlan:['central-audience-hall','east-front-mingchuang','east-rear-suianshi','west-front-changchun','west-rear-two-level-shrine','west-end-moyun'],omittedEarRoom:'XIANGXUE_TANG_OUTSIDE_RETAINED_ENVELOPE_POSITION_UNFITTED',upperNavigation:'WEST_SHRINE_VIEW_ONLY_NO_INVENTED_STAIR',interiorPolicy:'ATTESTED_ASYMMETRIC_APARTMENTS_AND_ONE_RETAINED_THRONE_NO_INVENTED_STATUES'});
}

/** Keep the roof bearing plane fixed while fitting its genuine geometry to a
 * published vertical datum. This adjusts a model rise, not the source value. */
function fitRoofTop(c,roof,baseY,targetY) {
 roof.updateMatrixWorld(true);const before=new THREE.Box3().setFromObject(roof).max.y,scale=(targetY-baseY)/(before-baseY);
 if(!(scale>0&&Number.isFinite(scale)))throw Error('Invalid fitted roof vertical datum');
 roof.scale.y*=scale;roof.position.y=baseY*(1-scale);roof.userData.topY=targetY;roof.userData.verticalFit={baseY,targetY,scale,status:FIT};roof.updateMatrixWorld(true);
 return{baseY,targetY,scale,actualTop:new THREE.Box3().setFromObject(roof).max.y};
}
function fanWindowPanel(c,{x,z,y,w,h}) {
 const outer=new THREE.Shape();outer.moveTo(-w/2,0);outer.lineTo(w/2,0);outer.lineTo(w/2,h);outer.lineTo(-w/2,h);outer.closePath();
 const pts=[],cy=.55,inner=.95,outerR=1.9;
 for(let i=0;i<=16;i++){const a=Math.PI/3+i*Math.PI/3/16;pts.push(new THREE.Vector2(Math.cos(a)*outerR,cy+Math.sin(a)*outerR));}
 for(let i=16;i>=0;i--){const a=Math.PI/3+i*Math.PI/3/16;pts.push(new THREE.Vector2(Math.cos(a)*inner,cy+Math.sin(a)*inner));}
 const hole=new THREE.Path(pts);hole.closePath();outer.holes.push(hole);
 const geo=new THREE.ExtrudeGeometry(outer,{depth:.12,bevelEnabled:false,curveSegments:8});geo.translate(0,0,-.06);
 c.tag(c.kit.mesh(c.f,geo,c.mats.paper,x,y,z),'leshou-fan-window-partition',{source:'DPM_2025_P106_MODERN_PHOTO',outlineStatus:'FITTED_FAN_SHAPED_APERTURE_NOT_ORNAMENT_REPLICA'});
 const glassShape=new THREE.Shape(pts),glassGeo=new THREE.ExtrudeGeometry(glassShape,{depth:.025,bevelEnabled:false});glassGeo.translate(0,0,-.0125);
 c.tag(c.kit.mesh(c.f,glassGeo,c.mats.glass,x,y,z),'leshou-fan-window-glass');
 // A glazed opening is not a walk-through doorway; its panel remains solid.
 c.kit.col(c.f,x-w/2,y,z-.06,x+w/2,y+h,z+.06);
 const path=pts.map(q=>new THREE.Vector3(x+q.x,y+q.y,z-.075));path.push(path[0].clone());
 c.tag(c.kit.mesh(c.f,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path,false,'catmullrom',0),64,.045,5,false),c.mats.wood,0,0,0),'leshou-fan-window-frame');
}
function buildLeshou(c) {
 const{p}=c,w=p.localW,d=p.localD,bw=w/7,iw=w-p.gallery*2,front=-d/2+p.gallery,rear=d/2-p.gallery,y=p.ph,ceilingY=p.eaveY-.48,h0=p.upperFloorY-y;
 platform(c);frame(c,{h:p.eaveY-y});
 // Exterior windows are one continuous tall facade with three true stacked
 // light bands, not a second exterior storey invented from the hidden loft.
 facade(c,{h:h0-.3,sideWindows:true,frontDoors:[3],backDoors:[3],pattern:'glass'});
 for(const sign of[-1,1])for(let i=0;i<7;i++)for(let level=0;level<2;level++)panel(c,{x:-iw/2+(i+.5)*iw/7,z:sign<0?front:rear,w:iw/7-.16,h:(p.eaveY-p.upperFloorY-.3)/2,y:p.upperFloorY+level*(p.eaveY-p.upperFloorY-.3)/2,pattern:'steps',upper:true});
 for(const sign of[-1,1])for(let j=0;j<3;j++)panel(c,{x:sign*iw/2,z:front+(j+.5)*(rear-front)/3,w:(rear-front)/3-.16,h:p.eaveY-p.upperFloorY-.3,y:p.upperFloorY,side:true,pattern:'steps',upper:true});
 for(const sign of[-1,1])for(const yy of[p.upperFloorY-.25,p.upperFloorY+(p.eaveY-p.upperFloorY-.3)/2-.1])c.box('leshou-window-band-beam','wood',iw,.5,.23,0,yy,sign<0?front:rear);
 const central=1.5*bw,outerSplit=2.5*bw,northStrip=rear-1.1,spanZ=1.2;
 const holes=[{x0:-central,x1:central,z0:front+.12,z1:-spanZ},{x0:-central,x1:central,z0:spanZ,z1:northStrip}];
 // H-shaped floor: side wings joined by the east-west middle passage. South
 // outer rooms and the narrow north wall passage intentionally remain single.
 const floorVoids=holes.map(q=>({...q,x:(q.x0+q.x1)/2,z:(q.z0+q.z1)/2,y:p.upperFloorY,status:'SOURCE_DOUBLE_HEIGHT_FITTED_BOUNDARY'}));
 slab(c,'leshou-transverse-upper-gallery',-central,central,-spanZ,spanZ,p.upperFloorY,{thickness:.2});
 for(const sign of[-1,1]){
  const x0=sign<0?-iw/2+.1:central,x1=sign<0?-central:iw/2-.1;
  slab(c,'upper-floor-slab',x0,x1,-1.2,northStrip,p.upperFloorY,{thickness:.2});
  slab(c,'upper-floor-slab',sign<0?-outerSplit:central,sign<0?-central:outerSplit,front+.12,-1.2,p.upperFloorY,{thickness:.2});
  rail(c,{x:sign*central,z:(front+northStrip)/2,length:northStrip-front,y:p.upperFloorY,side:true,role:'leshou-inner-gallery-guard'});
  rail(c,{x:sign*(central+(iw/2-central)/2),z:northStrip,length:iw/2-central,y:p.upperFloorY,role:'leshou-north-single-storey-guard'});
  rail(c,{x:sign*(outerSplit+(iw/2-outerSplit)/2),z:-1.2,length:iw/2-outerSplit,y:p.upperFloorY,role:'leshou-south-single-storey-guard'});
  rail(c,{x:sign*outerSplit,z:(front-1.2)/2,length:-1.2-front,y:p.upperFloorY,side:true,role:'leshou-south-single-storey-guard'});
 }
 for(const z of[-spanZ,spanZ])rail(c,{x:0,z,length:central*2,y:p.upperFloorY,role:'leshou-transverse-gallery-guard'});
 for(const z of[-spanZ,spanZ])c.box('leshou-transverse-floor-bearing','wood',central*2+.3,.2,.25,0,p.upperFloorY-.3,z);
 // Reduced front column row: the four central/front gold columns are absent.
 // Six surviving inner posts are fitted; the source's 1.82 m / 1.6 m offsets
 // are applied to their corresponding support posts, not called a survey.
 const oldGold=[[-2.5*bw,-3.8],[2.5*bw,-3.8],...[-1.5,-.5,.5,1.5].map(k=>[k*bw,3.8])];
 for(const[x,z]of oldGold){column(c,x,z,y,p.eaveY-y,{r:.27,role:'leshou-retained-inner-gold-column'});column(c,x,z-1.82,y,ceilingY-y-.1,{r:.24,role:'leshou-reduced-column-added-post'});}
 for(const x of[-2.5*bw,2.5*bw])column(c,x,rear-1.6,y,ceilingY-y-.1,{r:.24,role:'leshou-reduced-column-added-post'});
 for(const x of[-central,central])wallLine(c,{a0:front,a1:northStrip,at:x,y,h:h0-.25,side:true,doors:[{at:-5,w:2.2},{at:0,w:2.2},{at:5,w:2.2}],mat:'wood',role:'leshou-side-apartment-partition'});
 for(const sign of[-1,1]){
  wallLine(c,{a0:front,a1:northStrip,at:sign*outerSplit,y,h:h0-.25,side:true,doors:[{at:-4,w:1.9},{at:5.6,w:1.9}],mat:'wood',role:'leshou-side-wing-partition'});
  wallLine(c,{a0:sign<0?-outerSplit:central,a1:sign<0?-central:outerSplit,at:1.3,y,h:h0-.25,doors:[{at:sign*2*bw,w:2}],mat:'wood',role:'leshou-side-wing-cross-partition'});
 }
 // East outer bay: the photographed fan window lies in the partition between
 // its front and rear room, without fabricating historic painted wall scenes.
 fanWindowPanel(c,{x:-(outerSplit+iw/2)/2,z:1.3,y,w:iw/2-outerSplit,h:h0-.25});
 wallLine(c,{a0:outerSplit,a1:iw/2,at:1.3,y,h:h0-.25,doors:[{at:(outerSplit+iw/2)/2,w:1.8}],mat:'wood',role:'leshou-west-outer-room-partition'});
 // The jade mountain itself is not approximated by a fabricated green lump.
 // Only its attested northern hall location is marked with a restrained plinth.
 altarOutline(c,{x:0,z:6.1,w:4,d:1.6,role:'leshou-northern-jade-mountain-plinth-outline'});
 const legacyInventory=retainLegacyHall(c,{central:true,centralX:5.5,sideInset:1.8});
 ceiling(c,{x0:-iw/2,x1:iw/2,z0:front,z1:rear,y:ceilingY,nx:7,nz:5});
 for(const[x,z]of[...oldGold.map(([x,z])=>[x,z-1.82]),[-2.5*bw,rear-1.6],[2.5*bw,rear-1.6]])c.box('leshou-ceiling-support-beam','wood',bw*.9,.18,.25,x,ceilingY-.1,z);
 const roof=ordinaryRoof(c,{w:w+.3,d:d+.3,y:p.eaveY,height:5.4});const roofVerticalFit=fitRoofTop(c,roof,p.eaveY,p.modelRidgeY);
 return finish(c,{floorVoids,legacyInventory,roofVerticalFit,addedPostOffsets:{sixSouth:1.82,twoSouthOfRearEave:1.6,status:'OFFICIAL_RELATIVE_OFFSETS_WITH_FITTED_REFERENCE_POSTS'},floorPlan:'NORTH_SOUTH_DOUBLE_HEIGHT_HALLS_AND_TRANSVERSE_UPPER_PASSAGE',singleStoreyExceptions:['SOUTH_OUTER_SIDE_ROOMS','NORTH_WALL_PASSAGE'],interiorPlanDate:'HISTORIC_YANGSHILEI_TOPOLOGY_PLUS_MODERN_FAN_WINDOW_PHOTO_NOT_CURRENT_INVENTORY',upperNavigation:'REAL_PARTIAL_FLOOR_VIEW_ONLY_NO_UNVERIFIED_STAIR_OR_DESTINATION',jadeMountain:'ATTESTED_NORTH_HALL_PLINTH_ONLY_ARTWORK_NOT_FABRICATED'});
}

/** Four-sided hollow waist roof: the centre is truly absent, so no tiled sheet
 * cuts through the upper inhabited storey. All four skirts have real soffits. */
function waistRoof(c,{outerW,outerD,innerW,innerD,y,rise=1,tile='yellow',trim='blue',role='fuwang-hollow-waist-roof'}) {
 const outer=[[-outerW/2,-outerD/2],[outerW/2,-outerD/2],[outerW/2,outerD/2],[-outerW/2,outerD/2]],inner=[[-innerW/2,-innerD/2],[innerW/2,-innerD/2],[innerW/2,innerD/2],[-innerW/2,innerD/2]];
 for(let i=0;i<4;i++){const j=(i+1)%4,a=outer[i],b=outer[j],d=inner[i],e=inner[j];surface(c,'roof-hip-skirt',[a[0],y,a[1],b[0],y,b[1],e[0],y+rise,e[1],d[0],y+rise,d[1]],[0,1,2,0,2,3],tile,{part:role});const side=i%2===1,len=side?outerD:outerW,x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;c.box('glazed-eave-edge',trim,side?.16:len,.14,side?len:.16,x,y,z);c.box('waist-roof-bearing-beam','wood',side?.26:len,.25,side?len:.26,x,y-.1,z);const ix=(d[0]+e[0])/2,iz=(d[1]+e[1])/2;c.box('waist-roof-inner-junction-fascia',trim,side?.2:innerW,.18,side?innerD:.2,ix,y+rise-.055,iz);} // Plain cross-bridges overlap both the projecting waist purlins and the
 // smaller standing eave frame, closing the measured 30 mm corner gap.
 for(const sign of[-1,1])c.box('waist-roof-bearing-crossbridge','wood',.38,.25,outerD+.12,sign*(outerW/2-.15),y-.1,0);
}

function buildFuwang(c) {
 const{p}=c,w=p.localW,d=p.localD,iw=w-p.gallery*2,id=d-p.gallery*2,bw=iw/5,bd=id/5,coreX=bw/2,coreZ=bd/2,mid=p.upperFloorYs[0],top=p.upperFloorYs[1],eave=p.ph+p.colH;
 platform(c);frame(c,{h:7.9-p.ph});
 facade(c,{h:6.6,sideWindows:true,sideDoors:[2],frontDoors:[2],backDoors:[2],pattern:'steps'});
 // Four convex radial rooms surround the attested central stair room. The
 // intercardinal compartment groups are deliberately asymmetric only where
 // sources establish it; ornament and movable historic thrones are not faked.
 for(const z of[-coreZ,coreZ])wallLine(c,{a0:-coreX,a1:coreX,at:z,y:p.ph,h:3.5,mat:'wood',role:'fuwang-ground-core-screen'});
 for(const x of[-coreX,coreX]){
  wallLine(c,{a0:-coreZ,a1:coreZ,at:x,y:p.ph,h:3.5,side:true,doors:[{at:0,w:1.4}],mat:'wood',role:'fuwang-ground-core-screen'});
  c.box('fuwang-closed-stair-entry','wood',.12,2.2,1.4,x,p.ph+1.1,0,true);
 }
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const x0=sx<0?-1.5*bw:coreX,x1=sx<0?-coreX:1.5*bw,z0=sz<0?-1.5*bd:coreZ,z1=sz<0?-coreZ:1.5*bd;
  // Two exposed sides of each diagonal room group shape the neighboring
  // cardinal hall's convex projection rather than making a random maze.
  wallLine(c,{a0:x0,a1:x1,at:sz*coreZ,y:p.ph,h:3.5,doors:[{at:(x0+x1)/2,w:1.45}],mat:'wood',role:'fuwang-radial-room-partition'});
  wallLine(c,{a0:z0,a1:z1,at:sx*coreX,y:p.ph,h:3.5,side:true,doors:[{at:(z0+z1)/2,w:1.45}],mat:'wood',role:'fuwang-radial-room-partition'});
  wallLine(c,{a0:x0,a1:x1,at:(z0+z1)/2,y:p.ph,h:3.5,doors:[{at:(x0+x1)/2,w:1.25}],mat:'wood',role:'fuwang-corner-compartment-screen'});
 }
 // Only the explicitly attested north central mezzanine is reconstructed.
 // Other hidden mezzanines may exist; lack of plans is not evidence of absence.
 slab(c,'upper-floor-slab',-coreX,coreX,coreZ,id/2-.12,mid,{thickness:.18});
 rail(c,{x:0,z:coreZ,length:coreX*2,y:mid,role:'fuwang-north-mezzanine-guard'});
 for(const x of[-coreX,coreX])rail(c,{x,z:(coreZ+id/2)/2,length:id/2-coreZ,y:mid,side:true,role:'fuwang-north-mezzanine-guard'});
 // Fitted plain supports make the north partial mezzanine a real borne floor.
 for(const x of[-coreX,coreX])for(const z of[coreZ,id/2-.12])column(c,x,z,p.ph,mid-p.ph-.18,{r:.12,square:true,role:'fuwang-north-mezzanine-support'});
 for(const x of[-coreX,coreX])c.box('fuwang-north-mezzanine-bearing','wood',.24,.25,id/2-coreZ,x,mid-.25,(coreZ+id/2)/2);
 for(const z of[coreZ,id/2-.12])c.box('fuwang-north-mezzanine-bearing','wood',coreX*2+.24,.25,.24,0,mid-.25,z);
 const uW=p.upperLocalW,uD=p.upperLocalD,hole={x0:-coreX,x1:coreX,z0:-coreZ,z1:coreZ};
 for(const[x0,x1,z0,z1]of[[-uW/2,-coreX,-uD/2,uD/2],[coreX,uW/2,-uD/2,uD/2],[-coreX,coreX,-uD/2,-coreZ],[-coreX,coreX,coreZ,uD/2]])slab(c,'upper-floor-slab',x0,x1,z0,z1,top,{thickness:.2});
 guardOpening(c,hole,{y:top});
 frame(c,{w:uW,d:uD,y:top,h:eave-top,bays:3,depthBays:3,role:'fuwang-upper-three-bay-column'});
 facade(c,{w:uW,d:uD,y:top,h:eave-top-.25,bays:3,depthBays:3,inset:0,rearInset:0,frontDoors:[],backDoors:[],sideWindows:true,pattern:'steps'});
 // The actual source has stairs in the centre. These steep enclosed flights
 // express only that location; pitches/landings are model fits and not access.
 for(let flight=0;flight<2;flight++){
  const n=16,y0=flight?mid:p.ph,y1=flight?top:mid,x=flight?.9:-.9;
  for(let k=0;k<n;k++){const t=(k+.5)/n,z=(flight?1:-1)*(1.5-3*t),yy=y0+(y1-y0)*(k+1)/n;c.box('fuwang-central-stair-flight','wood',1.35,.14,3/n+.015,x,yy-.07,z,true);}
  for(const side of[-1,1]){const stringer=c.box('fuwang-fitted-stair-stringer','wood',.14,.3,Math.hypot(3,y1-y0),x+side*.52,(y0+y1)/2-.05,0);stringer.rotation.x=(flight?1:-1)*Math.atan2(y1-y0,3);}
 }
 slab(c,'fuwang-central-stair-landing',-1.6,1.6,1.4,coreZ,mid,{thickness:.18});
 slab(c,'fuwang-central-upper-stair-landing',.2,1.6,-coreZ-.2,-1.4,top,{thickness:.18});
 // Close off both ends of the visible flights with physical guards. No upper
 // room, walkable rescue surface, teleporter or automatic route is registered.
 for(const y of[mid,top])rail(c,{x:0,z:0,length:3.3,y,role:'fuwang-unavailable-stair-guard'});
 // Real framing anchors both the large lower skirt and set-back upper roof.
 for(const x of[-uW/2,uW/2])for(const z of[-uD/2,uD/2])column(c,x,z,p.ph,top-p.ph,{r:.23,role:'fuwang-upper-floor-support-post'});
 for(const sign of[-1,1]){c.box('fuwang-upper-floor-bearing','wood',uW,.3,.28,0,top-.15,sign*uD/2);c.box('fuwang-upper-floor-bearing','wood',.28,.3,uD,sign*uW/2,top-.15,0);}
 waistRoof(c,{outerW:w+.5,outerD:d+.5,innerW:uW+.15,innerD:uD+.15,y:7.9,rise:1.2});
 const roof=ordinaryRoof(c,{type:'cuanjian',w:uW+.3,d:uD+.3,y:eave,height:3.3,tile:'yellow',trim:'blue'});
 ceiling(c,{x0:-uW/2,x1:uW/2,z0:-uD/2,z1:uD/2,y:eave-.35,nx:3,nz:3});
 const legacyInventory=retainLegacyHall(c,{central:true,centralX:5.8,sideInset:1.5,benchZ:3.9});
 return finish(c,{legacyInventory,groundPlan:'FOUR_SYMMETRIC_CONVEX_SPACES_AROUND_CENTRAL_CORE',topStoreyPlan:'OPEN_HALL',topStoreyStairVoid:hole,intermediateFloor:{side:'north',x0:-coreX,x1:coreX,z0:coreZ,z1:id/2-.12,y:mid,status:'EVIDENCE_LIMITED_PARTIAL_NOT_ASSERTED_ONLY_HISTORIC_MEZZANINE'},centralStairPolicy:'SOURCE_LOCATION_WITH_FITTED_ENCLOSED_NON_VISITABLE_FLIGHTS',upperNavigation:'VIEW_ONLY_NO_UPPER_DESTINATION',furnitureStatus:'HISTORIC_FOUR_DIRECTION_THRONES_NOT_NEWLY_INVENTED'});
}

function buildJuanqin(c) {
 const{p}=c,w=p.localW,d=p.localD,bw=w/9,front=-d/2+p.gallery,rear=d/2,boundary=-w/2+5*bw,east=-w/2,west=w/2,upper=p.upperFloorY;
 platform(c);frame(c);facade(c,{frontDoors:[2],backDoors:[],backWindows:false,pattern:'steps'});
 // Eastern five bays have a U-shaped internal loft: northern strip and two
 // side returns. The front-middle volume is genuinely open above.
 const left=east+bw,right=boundary-bw,backBand=1.45;
 slab(c,'juanqin-east-concave-mezzanine',east+.15,boundary-.15,backBand,rear-.15,upper,{thickness:.18});
 slab(c,'juanqin-east-concave-mezzanine',east+.15,left,front+.1,backBand,upper,{thickness:.18});
 slab(c,'juanqin-east-concave-mezzanine',right,boundary-.15,front+.1,backBand,upper,{thickness:.18});
 rail(c,{x:(left+right)/2,z:backBand,length:right-left,y:upper,role:'juanqin-loft-void-guard'});
 for(const x of[left,right])rail(c,{x,z:(front+backBand)/2,length:backBand-front,y:upper,side:true,role:'juanqin-loft-void-guard'});
 for(let i=0;i<5;i++){const x=east+(i+.5)*bw;wallLine(c,{a0:east+i*bw,a1:east+(i+1)*bw,at:backBand,y:p.ph,h:upper-p.ph-.18,doors:[{at:x,w:1.65}],mat:'wood',role:'juanqin-east-rear-room-screen'});}
 for(let i=1;i<5;i++)wallLine(c,{a0:backBand,a1:rear,at:east+i*bw,y:p.ph,h:upper-p.ph-.18,side:true,mat:'wood',role:'juanqin-east-rear-partition'});
 for(const x of[left,right])wallLine(c,{a0:front,a1:backBand,at:x,y:p.ph,h:upper-p.ph-.18,side:true,doors:[{at:-.85,w:1.9}],mat:'wood',role:'juanqin-east-side-partition'});
 for(const x of[east+.15,left,right,boundary-.15])for(const z of[front+.1,backBand])column(c,x,z,p.ph,upper-p.ph-.18,{r:.11,square:true,role:'juanqin-loft-support-post'});
 for(const z of[backBand,rear-.15])c.box('juanqin-loft-bearing-beam','wood',boundary-east-.3,.2,.2,(east+boundary)/2,upper-.2,z);
 for(const x of[left,right])c.box('juanqin-loft-bearing-beam','wood',.2,.2,backBand-front,x,upper-.2,(front+backBand)/2);
 wallLine(c,{a0:front,a1:rear,at:boundary,y:p.ph,h:p.colH-.35,side:true,doors:[{at:-2.15,w:1.8}],mat:'wood',role:'juanqin-east-west-connection'});
 // West-end stage faces east (local -X). It is not a generic hall table and
 // must stay in a double-height room, with no false full-width upper slab.
 const stage={x0:west-4.5,x1:west-.7,z0:-2.3,z1:2.8,y:p.ph+.45};
 c.box('juanqin-west-stage','wood',stage.x1-stage.x0,.45,stage.z1-stage.z0,(stage.x0+stage.x1)/2,p.ph+.225,(stage.z0+stage.z1)/2,false);c.walk(stage.x0,stage.z0,stage.x1,stage.z1,stage.y);
 for(let i=0;i<3;i++){const y=.15*(i+1);c.box('juanqin-stage-step','wood',.25,y,1.8,stage.x0-.75+(i+.5)*.25,p.ph+y/2,.2,false);}
 const ramp=new THREE.Group();ramp.position.set(stage.x0-.375,0,.2);ramp.rotation.y=Math.PI/2;c.f.add(ramp);ramp.updateMatrixWorld(true);c.kit.walkRamp(ramp,-.9,.9,-.375,.375,p.ph,stage.y);ramp.removeFromParent();
 for(const x of[stage.x0+.18,stage.x1-.18])for(const z of[stage.z0+.18,stage.z1-.18])c.cylinder('juanqin-bamboo-stage-column','bamboo',.1,4,x,stage.y+2,z,true,10);
 for(const z of[stage.z0+.18,stage.z1-.18])c.box('juanqin-bamboo-stage-canopy','bamboo',stage.x1-stage.x0,.18,.16,(stage.x0+stage.x1)/2,stage.y+3.94,z);
 for(const x of[stage.x0+.18,stage.x1-.18])c.box('juanqin-bamboo-stage-canopy','bamboo',.16,.18,stage.z1-stage.z0,x,stage.y+3.94,(stage.z0+stage.z1)/2);
 wallLine(c,{a0:stage.z0,a1:stage.z1,at:stage.x1-.15,y:stage.y,h:3.7,side:true,doors:[{at:-1.3,w:1.3},{at:1.7,w:1.3}],mat:'bamboo',role:'juanqin-stage-rear-exit-screen'});
 const audience={x0:boundary+.35,x1:boundary+3.5,z0:-.9,z1:rear-.35};
 slab(c,'juanqin-audience-upper-floor',audience.x0,audience.x1,audience.z0,audience.z1,upper,{thickness:.18});
 rail(c,{x:audience.x1,z:(audience.z0+audience.z1)/2,length:audience.z1-audience.z0,y:upper,side:true,role:'juanqin-audience-upper-guard'});
 for(const z of[audience.z0,audience.z1])rail(c,{x:(audience.x0+audience.x1)/2,z,length:audience.x1-audience.x0,y:upper,role:'juanqin-audience-upper-guard'});
 for(const x of[audience.x0,audience.x1])for(const z of[audience.z0,audience.z1])column(c,x,z,p.ph,upper-p.ph,{r:.12,square:true,role:'juanqin-audience-support-post'});
 altarOutline(c,{x:(audience.x0+audience.x1)/2,z:2.7,w:2.5,d:1.4,role:'juanqin-lower-audience-dais-outline'});
 // Circular south screen and matching northern image-position outline are
 // structural frames only; the surviving illusionistic painting is not faked.
 const screenX=(audience.x1+stage.x0)/2;
 for(const [z,role]of[[front+.15,'juanqin-bamboo-screen-frame'],[rear-.15,'juanqin-north-painting-position-outline']]){
  const torus=new THREE.TorusGeometry(1.2,.075,8,40);c.tag(c.kit.mesh(c.f,torus,c.mats.bamboo,screenX,p.ph+2.4,z),role,{decorationStatus:'FRAME_ONLY_NO_FABRICATED_PANORAMA'});
  for(const sign of[-1,1])c.box('juanqin-bamboo-screen-upright','bamboo',.12,4.3,.12,screenX+sign*1.5,p.ph+2.15,z,true);
  c.box('juanqin-bamboo-screen-top','bamboo',3.1,.12,.12,screenX,p.ph+4.3,z);
 }
 // R68: withhold seven unsupported generic movable pieces. Attested
 // theatre, dais, loft and screen outlines remain separate architectural fits.
 const legacyInventory={source:'LEGACY_GENERIC_HALL_PRESET_NOT_MUSEUM_INVENTORY',status:'UNKNOWN',knownEmpty:false,accepted:false,currentInventoryVerified:false,retained:[],withheldMeshCount:7,withheldColliderCount:7,withheld:['table','two-chairs','two-cabinets','two-benches'],notProofOfEmptyRoom:true,missingEvidence:['CURRENT_ROOM_INVENTORY','PLACEMENT','PERIOD_MAPPING']};
 rolledRoof(c,{hip:false,tile:'yellow',trim:'yellow'});ceiling(c,{y:p.ph+p.colH-.3,nx:9,nz:2});
 return finish(c,{eastBays:5,westBays:4,stageFaces:'east',audienceFaces:'west',eastLoftVoid:{x0:left,x1:right,z0:front,z1:backBand},stage,audience,legacyInventory,upperNavigation:'REAL_U_LOFT_AND_AUDIENCE_BALCONY_VIEW_ONLY_UNMEASURED_STAIRS_OMITTED',artworkPolicy:'NO_FABRICATED_PANORAMA_BAMBOO_CARVING_OR_PAINTING'});
}

function stageRingFloor(c,{w,d,y,hole,role}) {
 for(const[x0,x1,z0,z1]of[[-w/2,hole.x0,-d/2,d/2],[hole.x1,w/2,-d/2,d/2],[hole.x0,hole.x1,-d/2,hole.z0],[hole.x0,hole.x1,hole.z1,d/2]])slab(c,role,x0,x1,z0,z1,y,{thickness:.2});
 guardOpening(c,hole,{y});
}
function buildChangyin(c) {
 const{p}=c,w=p.localW,d=p.localD,levels=p.stageFloorYs,midW=w*.88,midD=d*.88,topW=w*.72,topD=d*.72;
 platform(c);frame(c,{h:4.6});
 // An open lower stage, not a conventional windowed hall. No inner posts are
 // added; the four 45-degree corner beams carry the upper performance stages.
 for(const side of[-1,1]){
  rail(c,{x:side*w/2,z:0,length:d,y:p.ph,side:true,role:'changyin-ground-perimeter-rail'});
 }
 rail(c,{x:0,z:-d/2,length:w,y:p.ph,gap:2.8,role:'changyin-ground-perimeter-rail'});
 wallLine(c,{a0:-w/2,a1:w/2,at:d/2,y:p.ph,h:4.35,doors:[{at:-w/3,w:1.8},{at:w/3,w:1.8}],mat:'wood',role:'changyin-rear-stage-screen'});
 const leg=3.7;
 for(const sx of[-1,1])for(const sz of[-1,1]){const beam=c.box('changyin-diagonal-corner-beam','wood',Math.SQRT2*leg,.4,.34,sx*(w/2-leg/2),levels[1]-.2,sz*(d/2-leg/2));beam.rotation.y=Math.atan2(sz,sx);beam.userData.placementStatus='OFFICIAL_45_DEGREE_BEAM_TYPE_FITTED_LENGTH';}
 const stageVoids=[];
 for(const[level,ww,dd]of[[1,midW,midD],[2,topW,topD]]){
  const y=levels[level],next=level===1?10.8:p.roofBaseY,hole={x0:-2.1,x1:2.1,z0:-1.8,z1:1.8};
  stageRingFloor(c,{w:ww,d:dd,y,hole,role:'changyin-upper-stage-floor'});stageVoids.push({...hole,y,status:'TRUE_ALIGNED_STAGE_WELL_FITTED_EXTENT'});
  frame(c,{w:ww,d:dd,y,h:next-y,bays:3,depthBays:3,role:'changyin-upper-perimeter-column'});
  // North-facing front stage balcony stays open, while fitted rear/side
  // enclosure represents the source's upper working spaces, not bedrooms.
  for(const sign of[-1,1]){rail(c,{x:sign*ww/2,z:0,length:dd,y,side:true,role:'changyin-upper-stage-rail'});}
  rail(c,{x:0,z:-dd/2,length:ww,y,role:'changyin-upper-stage-rail'});
  wallLine(c,{a0:-ww/2,a1:ww/2,at:dd/2,y,h:next-y-.3,doors:[{at:0,w:1.8}],mat:'red',role:'changyin-upper-rear-screen'});
  for(const sign of[-1,1])panel(c,{x:sign*ww/2,z:dd*.23,w:dd*.52,h:next-y-.3,y,side:true,pattern:'steps'});
  // Spool and crossbeam indicate the attested hoisting arrangement without
  // pretending the moving mechanism or original hardware was surveyed.
  c.box('changyin-pulley-support-beam','wood',hole.x1-hole.x0+.3,.22,.22,0,y+1.2,0);
  for(const x of[hole.x0,hole.x1])column(c,x,0,y,1.2,{r:.09,square:true,role:'changyin-pulley-support-post'});
  const wheel=c.cylinder('changyin-pulley-outline','wood',.24,.45,0,y+.95,0,false,16);wheel.rotation.z=Math.PI/2;
  c.cylinder('changyin-rope-outline','bamboo',.018,2.0,0,y-.1,0,false,6);
  if(level===1)for(const sign of[-1,1])c.box('changyin-upper-floor-bearing','wood',midW,.4,.3,0,levels[2]-.2,sign*midD/2);
 }
 for(const sign of[-1,1]){c.box('changyin-upper-floor-crossbearing','wood',midW,.4,.28,0,levels[2]-.2,sign*topD/2);c.box('changyin-upper-floor-crossbearing','wood',.28,.4,midD,sign*topW/2,levels[2]-.2,0);}
 c.f.traverse(m=>{if(m.isMesh&&['changyin-ground-perimeter-rail','changyin-upper-stage-rail'].includes(m.userData.role)){m.material=c.mats.red;m.userData.colorStatus='OFFICIAL_PHOTO_RED_APPROXIMATION_NOT_MEASURED_PAINT';}});
 c.f.traverse(m=>{if(m.isMesh&&['column','changyin-upper-perimeter-column'].includes(m.userData.role)){m.material=c.mats.green;m.userData.colorStatus='OFFICIAL_EXTERIOR_PHOTO_GREEN_COLUMN_COLOUR_APPROXIMATION';}});
 // Closed trapdoor is a real timber lid, never a painted hole or a new fall
 // hazard. The subterranean wells are omitted because their geometry is unknown.
 c.box('changyin-ground-trapdoor','wood',2.1,.045,1.8,0,p.ph+.037,0,false);
 for(const sign of[-1,1])c.box('changyin-trapdoor-edge','black',2.15,.025,.035,0,p.ph+.065,sign*.91);
 // Four real but non-visitable rear stair flights. They join a visible upper
 // rear landing; lower barriers and side rails have actual colliders.
 const stairCount=4,stairRun=4.7,z0=2.0,z1=z0+stairRun,stairWidth=1.3;
 for(const x of[-5.4,-1.8,1.8,5.4]){
  const n=27;for(let k=0;k<n;k++){const y=p.ph+(levels[1]-p.ph)*(k+1)/n;c.box('changyin-rear-stair-step','wood',stairWidth,.14,stairRun/n+.015,x,y-.07,z0+(k+.5)*stairRun/n,true);}
  for(const sign of[-1,1]){const stringer=c.box('changyin-fitted-stair-stringer','wood',.14,.3,Math.hypot(stairRun,levels[1]-p.ph),x+sign*(stairWidth/2-.14),(p.ph+levels[1])/2-.05,(z0+z1)/2);stringer.rotation.x=-Math.atan2(levels[1]-p.ph,stairRun);const handrail=c.box('changyin-rear-stair-handrail','wood',.07,.08,Math.hypot(stairRun,levels[1]-p.ph),x+sign*(stairWidth/2+.03),(p.ph+levels[1])/2+.91,(z0+z1)/2);handrail.rotation.x=stringer.rotation.x;segmentedTimberCollider(c,stringer);segmentedTimberCollider(c,handrail);}
  c.box('changyin-rear-stair-closed-entry','wood',stairWidth+.16,2.2,.13,x,p.ph+1.1,z0-.2,true);
  for(const sign of[-1,1])for(let k=0;k<=n;k+=3){const t=k/n,yy=p.ph+(levels[1]-p.ph)*t;const guard=c.box('changyin-rear-stair-side-guard','wood',.07,.95,.07,x+sign*(stairWidth/2+.03),yy+.475,z0+t*stairRun);segmentedTimberCollider(c,guard);}
 }
 slab(c,'changyin-rear-upper-landing',-midW/2,midW/2,z1-.3,midD/2+.3,levels[1],{thickness:.2});
 rail(c,{x:0,z:z1,length:midW,y:levels[1],role:'changyin-rear-landing-guard'});
 waistRoof(c,{outerW:w+.6,outerD:d+.6,innerW:midW+.15,innerD:midD+.15,y:5.8,rise:.8,trim:'yellow',role:'changyin-lower-waist'});
 waistRoof(c,{outerW:midW+.6,outerD:midD+.6,innerW:topW+.15,innerD:topD+.15,y:10.8,rise:.8,trim:'yellow',role:'changyin-middle-waist'});
 // Retain the old movable generic inventory as unverified stage-side props.
 // The official interior photo does show tables/chairs, but is not proof of
 // the exact count or placement of these previously shipped model objects.
 const legacyInventory=retainLegacyHall(c,{central:true,centralX:0,sideInset:.4});
 // The source says total height 20.71 m without naming a measured datum.
 // Courtyard zero to highest modeled roof point is our declared interpretation.
 const before=new Set(c.f.children);rolledRoof(c,{w:topW+.6,d:topD+.6,y:p.roofBaseY,rise:4.45,tile:'green',trim:'yellow'});
 const roofGroup=new THREE.Group();roofGroup.name='changyin-upper-roof-height-fit';c.f.add(roofGroup);for(const child of[...c.f.children])if(child!==roofGroup&&!before.has(child))roofGroup.attach(child);
 const roofVerticalFit=fitRoofTop(c,roofGroup,p.roofBaseY,p.modelTopY);
 return finish(c,{stageVoids,stairCount,roofVerticalFit,groundStageNoInnerColumns:true,stageNames:['寿台','禄台','福台'],heightInterpretation:p.heightDatum,stairPolicy:'FOUR_FITTED_REAR_FLIGHTS_PHYSICALLY_GUARDED_NO_UPPER_ACCESS',upperNavigation:'REAL_STAGES_AND_WELLS_VIEW_ONLY_NO_TELEPORT',rearDressingHall:'OFFICIAL_FIVE_BAY_ATTACHED_BUILDING_OUTSIDE_THIS_RETAINED_IDENTITY_ENVELOPE_NOT_NEWLY_FABRICATED',undergroundWells:'OFFICIAL_EXISTENCE_GEOMETRY_UNKNOWN_NOT_MODELLED',legacyInventory});
}

function localMeshBounds(f,mesh) {
 mesh.updateWorldMatrix(true,false);const a=mesh.geometry.attributes.position,toLocal=f.matrixWorld.clone().invert().multiply(mesh.matrixWorld),box=new THREE.Box3(),v=new THREE.Vector3();
 for(let i=0;i<a.count;i++)box.expandByPoint(v.fromBufferAttribute(a,i).applyMatrix4(toLocal));return box;
}
function closeBounds(a,b,tolerance=1e-4){return a.min.distanceTo(b.min)<tolerance&&a.max.distanceTo(b.max)<tolerance;}
function buildHuangjiAugment(kit,item,built,p) {
 const c=context(kit,item,p,built.f),{f}=c,w=p.localW,d=p.localD,oldBays=Math.max(3,Math.round(w/3.6)|1),oldBay=w/oldBays,tw=Math.min(oldBay*1.4,5),tz=d/2-Math.min(3.4,d*.36),PW=w+2*item.pad,PD=d+2*item.pad;
 f.updateMatrixWorld(true);const oldDirect=[...f.children].filter(m=>m.isMesh),removed=[],disposed=new Set(),fallback=[];
 const expected=[['dais',tw,.5,2.4,p.ph+.25,tz,kit.lacquer],['seat',1.4,.6,1,p.ph+.8,tz,kit.gold],['back',1.5,1.2,.2,p.ph+1.6,tz+.5,kit.gold],['screen',tw*.8,2.6,.25,p.ph+1.8,tz+1.15,kit.gold]];
 // Identify the ORIGINAL four boxes by actual transformed vertices, never by
 // geometry.parameters (UV conversion may already have discarded them).
 for(const[part,ww,hh,dd,yy,zz,material]of expected){const box=new THREE.Box3(new THREE.Vector3(-ww/2,yy-hh/2,zz-dd/2),new THREE.Vector3(ww/2,yy+hh/2,zz+dd/2)),matches=oldDirect.filter(m=>m.material===material&&closeBounds(localMeshBounds(f,m),box));if(matches.length!==1)throw Error('Huangji original throne fallback not uniquely identified: '+part);const mesh=matches[0],clone=material.clone();clone.name='r48_huangji_fallback_'+part;kit.owned.push(clone);mesh.material=clone;mesh.name='huangji-kit-throne-fallback-'+part;mesh.userData={...mesh.userData,role:'huangji-kit-throne-fallback',fallbackPart:part,noMerge:true,identity:p.id,catalogId:p.id,interiorFallbackFor:'huangji',visibilityPolicy:'OWNER_LOADER_ATOMIC_GLB_SUCCESS_HIDE_FAIL_OR_UNLOAD_RESTORE',localBounds:{min:box.min.toArray(),max:box.max.toArray()}};fallback.push(mesh);}
 const removableMaterials=new Set(['wood_column','caihua_beam','wall_red','lattice_doors'].map(key=>kit.lib.material(key))),oldMarble=kit.lib.material('marble');
 for(const mesh of oldDirect){if(fallback.includes(mesh)||mesh.material===null)continue;const box=localMeshBounds(f,mesh),centre=box.getCenter(new THREE.Vector3()),inside=box.min.x>=-w/2-.6&&box.max.x<=w/2+.6&&box.min.z>=-d/2-.8&&box.max.z<=d/2+.8&&box.min.y>=p.ph-.02&&box.max.y<=p.ph+p.colH+.02;
  const oldEnvelope=removableMaterials.has(mesh.material)&&inside;
  const oldStep=mesh.material===oldMarble&&Math.abs(centre.x)<3&&Math.abs(centre.z)>PD/2-.05&&box.max.y<p.ph+.3;
  if(oldEnvelope||oldStep){removed.push({material:mesh.material.name,min:box.min.toArray(),max:box.max.toArray()});mesh.removeFromParent();disposed.add(mesh.geometry);}
 }
 for(const geo of disposed)geo.dispose();
 // Remove only the exact old facade/column proxies within this identity, not
 // platform, furniture, another hall, or the independently loaded GLB proxies.
 const inv=f.matrixWorld.clone().invert(),isOldEnvelope=b=>{const q=b.clone().applyMatrix4(inv);return Math.abs(q.min.y-p.ph)<1e-6&&Math.abs(q.max.y-(p.ph+3))<1e-6&&q.min.x>=-w/2-.6&&q.max.x<=w/2+.6&&q.min.z>=-d/2-.6&&q.max.z<=d/2+.6&&(Math.abs((q.min.z+q.max.z)/2)>=d/2-.3||Math.abs((q.min.x+q.max.x)/2)>=w/2-.36);};
 const oldProxyCount=kit.colliders.filter(isOldEnvelope).length;kit.colliders=kit.colliders.filter(b=>!isOldEnvelope(b));
 kit.walkables=kit.walkables.filter(q=>!(q.type==='ramp'&&q.minX>=p.x-3&&q.maxX<=p.x+3&&q.minZ>=p.z-PD/2-5&&q.maxZ<=p.z+PD/2+5&&Math.max(q.y0,q.y1)===p.ph));
 // Keep the original platform and roof. Only its displayed bay grid and
 // enclosing facade are changed from the generic fifteen to sourced nine.
 frame(c,{bays:9,depthBays:5,h:p.colH});
 facade(c,{bays:9,frontDoors:[3,4,5],backDoors:[3,4,5],inset:p.gallery,rearInset:0,pattern:'steps'});
 for(const q of p.portals)exteriorSteps(c,q.x,(q.side==='rear'?1:-1)*PD/2,p.ph,q.width,q.side);
 const ceilingY=p.ph+7.77,holes=[{x0:-3.401,x1:3.401,z0:4.799,z1:11.601},...[-3.9,3.9].flatMap(x=>[6.4,11.1].map(z=>({x0:x-.48,x1:x+.48,z0:z-.48,z1:z+.48})))];
 const xs=[-w/2+.2,w/2-.2,...Array.from({length:8},(_,i)=>-w/2+(i+1)*w/9),...holes.flatMap(q=>[q.x0,q.x1])].sort((a,b)=>a-b),zs=[-d/2+p.gallery,d/2-.2,...Array.from({length:4},(_,i)=>-d/2+(i+1)*d/5),...holes.flatMap(q=>[q.z0,q.z1])].sort((a,b)=>a-b);
 let ceilingPanels=0;
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){const x=(xs[i-1]+xs[i])/2,z=(zs[j-1]+zs[j])/2;if(holes.some(q=>x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1))continue;if(xs[i]-xs[i-1]<.025||zs[j]-zs[j-1]<.025)continue;slab(c,'huangji-fitted-coffer-panel',xs[i-1],xs[i],zs[j-1],zs[j],ceilingY,{mat:'wood',thickness:.065,solid:false});ceilingPanels++;}
 // The actual asset supplies the four gold columns and caisson. Never make a
 // second set or infer their position from stale pre-alignment node names.
 for(const q of holes){for(const z of[q.z0,q.z1])c.box('huangji-caisson-opening-border','gold',q.x1-q.x0,.07,.035,(q.x0+q.x1)/2,ceilingY-.07,z);for(const x of[q.x0,q.x1])c.box('huangji-caisson-opening-border','gold',.035,.07,q.z1-q.z0,x,ceilingY-.07,(q.z0+q.z1)/2);}
 const throneLocal=new THREE.Box3(new THREE.Vector3(-tw/2,p.ph,tz-1.2),new THREE.Vector3(tw/2,p.ph+3,tz+1.3)),throneWorld=throneLocal.clone().applyMatrix4(f.matrixWorld),throneProxies=kit.colliders.filter(b=>closeBounds(b,throneWorld));if(throneProxies.length!==1)throw Error('Huangji original throne collider ownership ambiguous');
 throneProxies[0].userData={role:'huangji-kit-throne-fallback-collider',identity:p.id,interiorFallbackFor:'huangji'};
 const exactRecord=r=>r.name===p.name;kit.rooms=kit.rooms.filter(r=>!exactRecord(r));kit.mapItems=kit.mapItems.filter(r=>!exactRecord(r));kit.regions=kit.regions.filter(r=>!exactRecord(r));
 const result=finish(c,{originalBays:oldBays,actualFacadeBays:9,legacyFallbackContract:{meshRole:'huangji-kit-throne-fallback',parts:fallback.map(m=>m.userData.fallbackPart),width:tw,throneZ:tz,colliderLocal:{min:throneLocal.min.toArray(),max:throneLocal.max.toArray()},colliderWorld:{min:throneWorld.min.toArray(),max:throneWorld.max.toArray()},loaderOwner:'SHARED_INTERIOR_LOADER_ATOMIC_SWITCH_REQUIRED'},existingGLB:{asset:'huangji-aligned-0a79ec49e8cd.glb',sha256:'0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6',visibleTriangles:24024,caissonAndFourGoldColumns:'RETAINED_NOT_DUPLICATED'},ceilingOpenings:holes,ceilingY,ceilingPanels,removedLegacyMeshCount:removed.length,removedLegacyProxyCount:oldProxyCount,interiorPolicy:'PRESERVE_EXISTING_ART_ASSET_AND_EXACT_FALLBACK_ONLY_NEW_SOURCE_NINE_BAY_ARCHITECTURE_AND_COFFER_OPENINGS'});
 result.PW=built.PW;result.PD=built.PD;result.top=built.top;return result;
}

export function buildRemainingHall(kit,item,p) {
 validate(item,p);const c=context(kit,item,p);
 switch(p.key){case'ningshou':return buildNingshou(c);case'suichu':case'xunyan':case'qingshou':return buildThroughHall(c);case'jingfu':return buildJingfu(c);case'xishang':return buildXishang(c);case'biluo':return buildBiluo(c);case'jingqi':return buildJingqi(c);case'yanqu':return buildYanqu(c);case'cuishang':return buildCuishang(c);case'yueshi':return buildYueshi(c);case'fori':return buildFori(c);case'fanhua':return buildFanhua(c);case'yangxing':return buildYangxing(c);case'leshou':return buildLeshou(c);case'fuwang':return buildFuwang(c);case'juanqin':return buildJuanqin(c);case'changyin':return buildChangyin(c);default:throw Error('Remaining NingShou profile not implemented');}
}
export function augmentRemainingHall(kit,item,built,p){validate(item,p);if(p.key!=='huangji'||p.mode!=='augment')throw Error('Only exact Huangji augmentation is supported');return buildHuangjiAugment(kit,item,built,p);}
