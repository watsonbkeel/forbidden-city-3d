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
  if(item.name)kit.plaque(f,item.name,0,g.ph+g.colH-.8,-g.d/2-.38,1.25,2.0);
 }
 const display=buildSouthGalleryDisplays(kit,f,g);
 kit._lastFurnish=null;
 kit.registerRoom(f,{name:g.name??`${g.court==='wenhua'?'文华':'武英'}殿穿廊`,kind:`${g.court}-gallery`,x0:-g.w/2+.35,x1:g.w/2-.35,z0:-g.d/2,z1:g.d/2,y:g.ph,h:g.colH-.85,doors:[{x:0,z:-g.d/2},{x:0,z:g.d/2}]});
 const room=kit.rooms.at(-1);room.spawns=[{x:g.navigation.inside.x,z:g.navigation.inside.z}];
 f.userData.structure={...g,display};f.userData.southCourt=g;
 return {f,g,display};
}
