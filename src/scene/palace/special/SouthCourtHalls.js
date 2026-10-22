import * as THREE from 'three';
import { SOUTH_COURTS, southCourtGeometry } from './SouthCourtProfiles.js';
import { buildSouthGalleryDisplays } from './SouthGalleryDisplays.js';
export { SOUTH_COURTS, southCourtGeometry } from './SouthCourtProfiles.js';

/** A dedicated opt-in, not a global change to CourtKit hall defaults. */
export function buildSouthCourtHall(kit,item){
 const g=southCourtGeometry(item),roomStart=kit.rooms.length,regionStart=kit.regions.length;let f;
 if(g.part==='connector'){
  f=kit.frame(g.x,g.z,0);
  kit.box(f,'wall_brick',g.w,g.ph,g.d,0,g.ph/2,0);
  kit.box(f,'stone_slab',g.w,.06,g.d,0,g.ph-.02,0);
  kit.walkBox(f,-g.w/2,-g.d/2,g.w/2,g.d/2,g.ph);
  // No crosswise step or end wall at either adjoining hall: one floor datum.
  // Wuying side doors follow its two documented fire-exit interruptions.
  // Wenhua panorama shows continuous case lines; do not copy those gaps.
  for(const side of[-1,1]){
   for(const [z0,z1]of(g.court==='wuying'?[[-g.d/2,-1.15],[1.15,g.d/2]]:[[-g.d/2,g.d/2]])){
    kit.box(f,'wall_red',.35,g.colH,z1-z0,side*g.w/2,g.ph+g.colH/2,(z0+z1)/2);
    kit.col(f,side*g.w/2-.175,g.ph,z0,side*g.w/2+.175,g.ph+g.colH,z1);
   }
   kit.box(f,'caihua_beam',.45,.5,g.d+.1,side*g.w/2,g.ph+g.colH-.25,0,'band');
   // Closed current/model side exit: photo/design evidence gives location,
   // not public access permission or a free-opening external staircase.
   if(g.court==='wuying'){
   kit.box(f,'lattice_doors',.14,3,2.3,side*g.w/2,g.ph+1.5,0,'band');
   kit.col(f,side*g.w/2-.1,g.ph,-1.15,side*g.w/2+.1,g.ph+3,1.15);
   kit.box(f,'wall_red',.35,g.colH-3,2.3,side*g.w/2,g.ph+3+(g.colH-3)/2,0);
   }
  }
  const roof=kit.roof(f,{type:'gable',width:g.d+.3,depth:g.w+.3,baseY:g.ph+g.colH,layers:1,brackets:false});roof.rotation.y=Math.PI/2;
  const ceiling=new THREE.PlaneGeometry(g.w,g.d);ceiling.rotateX(Math.PI/2);kit.mesh(f,ceiling,kit.lib.material('caihua_beam'),0,g.ph+g.colH-.52,0);
 }else{
  const {structure,southCourtProfile,...plain}=item;
  const result=kit.hall({...plain,rot:0,throne:false,interior:'empty',backDoor:true,plaque:false});f=result.f;
  kit.rooms.splice(roomStart);
  kit.regions.splice(regionStart);
  // The main and rear halls meet the connector on the same platform; remove
  // only the two unused inward stairs, never foreign geometry/collision.
  // Their geometry stays within the fitted connector platform and is hidden
  // below its floor; the platform top is the sole navigation datum.
  if(item.name){
   if(g.part==='rear'){
    // A rear-hall board belongs below the connector ceiling, not embedded
    // through it on the tall rear hall. The dated Wenhua panorama attests a
    // suspended Zhujing board; Jingsi retains only a model wayfinding label.
    const connector=SOUTH_COURTS[g.court].connector;
    const ceiling=connector.ph+connector.colH-.52,w=1.05,h=1.5;
    const top=ceiling-.18,y=top-h/2,z=-g.d/2-.8;
    kit.plaque(f,item.name,0,y,z,w,h);
    const mount=kit.box(f,'wood_column',.09,.18,.09,0,ceiling-.09,z+.06);
    mount.name='rear-hall-nameboard-suspension';
    f.userData.nameboardMount={
     status:g.court==='wenhua'?'DATED_PHOTO_GUIDED_MOUNT_MODEL_FIT':'MODEL_WAYFINDING_LABEL_NOT_ATTESTED_HISTORICAL_PLAQUE',
     source:g.court==='wenhua'?'https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a057.tiles/f/l1/01/l1_f_01_01.jpg':'https://www.dpm.org.cn/explore/building/236500.html',
     position:[0,y,z],width:w,height:h,ceilingY:ceiling,
     dimensions:'REVERSIBLE_CLEARANCE_FIT_NOT_SURVEYED',
     limitation:g.court==='wenhua'?'Dated panorama shows a vertical board below a connector beam; exact mount coordinates and carved border not reproduced.':'Name identifies the documented rear hall only. Available 2021 gallery panoramas do not attest this physical nameboard or its mounting position.'};
   }else kit.plaque(f,item.name,0,g.ph+g.colH-.8,-g.d/2-.38,1.25,2.0);
  }
 }
 const display=buildSouthGalleryDisplays(kit,f,g);
 kit._lastFurnish=null;
 kit.registerRoom(f,{name:g.name??`${g.court==='wenhua'?'文华':'武英'}殿穿廊`,kind:`${g.court}-gallery`,x0:-g.w/2+.35,x1:g.w/2-.35,z0:-g.d/2,z1:g.d/2,y:g.ph,h:g.colH-.85,doors:[{x:0,z:-g.d/2},{x:0,z:g.d/2}]});
 const room=kit.rooms.at(-1);room.spawns=[{x:g.navigation.inside.x,z:g.navigation.inside.z}];
 f.userData.structure={...g,display,...(f.userData.nameboardMount?{nameboardMount:f.userData.nameboardMount}:{})};f.userData.southCourt=g;
 return {f,g,display};
}
