import * as THREE from 'three';
import {buildStuddedDoor} from '../../HallKit.js';

const SOURCE='https://www.dpm.org.cn/explore/building/236543.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/8401.jpg';
// Museum evidence establishes THREE wall gates, not these dimensions. Preserve
// the inherited central opening; side widths and spacing are an explicit fit.
const PORTALS=Object.freeze([Object.freeze({x:-7.1,w:3.6,h:5}),Object.freeze({x:0,w:5,h:5}),Object.freeze({x:7.1,w:3.6,h:5})]);
export function shunzhenProfile(item){
 if(item.name!=='顺贞门'||item.gateProfile!=='shunzhen'||item.gateKind!=='three-wall-portals'||item.x!==.5||item.z!==518.3||item.rot!=='south'||item.w!==5||item.h!==5||item.open!==true)throw Error('Shunzhen requires its exact named, playable-open engineering profile');
 return Object.freeze({id:'garden/shunzhen-gates',x:.5,z:518.3,portals:PORTALS,wallInterfaceWidth:20.6,depth:3.5,pierWidth:1.4,bodyTop:6.5,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEY',source:SOURCE,photo:PHOTO,sourcePhotoCoverage:'CENTRAL_GATE_ONLY_SIDE_SPACING_UNMEASURED',openState:'PLAYABLE_OPEN_NOT_MUSEUM_PERMISSION',court:'DEFERRED_NOT_RECONSTRUCTED',accepted:false});
}
export function buildShunzhenGate(kit,item){
 const p=shunzhenProfile(item),f=kit.frame(p.x,p.z,0);f.name='顺贞门';
 const glaze=new THREE.MeshStandardMaterial({name:'r90_shunzhen_plain_green_glaze',color:0x2c6854,roughness:.55});kit.owned.push(glaze);
 const box=(role,mat,w,h,d,x,y,z,solid=false)=>{const m=kit.box(f,mat,w,h,d,x,y,z);m.name=role;if(solid)kit.col(f,x-w/2,0,z-d/2,x+w/2,Math.min(3,y+h/2),z+d/2);return m;};
 for(const o of p.portals){
  for(const s of[-1,1]){const x=o.x+s*(o.w/2+p.pierWidth/2);box('shunzhen-pier-brick','wall_brick',p.pierWidth,1,p.depth,x,.5,0);box('shunzhen-pier','wall_red',p.pierWidth,p.bodyTop-1,p.depth,x,(p.bodyTop+1)/2,0);kit.col(f,x-p.pierWidth/2,0,-p.depth/2,x+p.pierWidth/2,3,p.depth/2);}
  box('shunzhen-overdoor','wall_red',o.w,p.bodyTop-o.h,p.depth,o.x,(p.bodyTop+o.h)/2,0);
  // Thin ground threshold, not an invented raised foundation or stair flight.
  box('shunzhen-threshold','stone_slab',o.w+.1,.1,p.depth+.1,o.x,.05,0);
  for(const z of[-p.depth/2-.015,p.depth/2+.015]){const m=box('shunzhen-plain-glaze-band','wall_red',o.w+2*p.pierWidth,.22,.05,o.x,p.bodyTop-.4,z);m.material=glaze;}
  // Each roof stays within its own wall-interface width so adjoining roofs do
  // not penetrate each other. Small fit, no replica of unverified ornaments.
  kit.roof(f,{type:'xieshan',width:o.w+2*p.pierWidth-.2,depth:p.depth,overhang:.1,baseY:p.bodyTop,height:1.3,brackets:false,detail:'low'},o.x,0);
  for(const s of[-1,1]){const leafWidth=o.w/2-.05,d=buildStuddedDoor(kit.lib,{width:leafWidth,height:o.h-.1});d.name='shunzhen-open-door';d.position.set(o.x+s*(o.w/2-.14),0,-p.depth/2+.3+leafWidth/2);d.rotation.y=Math.PI/2;f.add(d);f.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(d);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);kit.colliders.push(b);}
 }
 // Photo from Shenwu shows a single blue central plaque on the north face.
 // Reuse the existing atlas label; it is not a facsimile of historic calligraphy.
 kit.plaque(f,'顺贞门',0,5.75,p.depth/2+.13,.72,1.2);
 const plaque=kit.plaques.at(-1);plaque.mesh.geometry.rotateY(Math.PI);plaque.frame.position.z=p.depth/2+.07;
 plaque.mesh.userData.shunzhenPlaque={side:'north',text:'顺贞门',status:'EXISTING_LABEL_STYLE_NOT_CALLIGRAPHIC_REPLICA'};
 // One place/card/teleport identity for all three physical portals.
 kit.mapRect(f,'gate','顺贞门',p.wallInterfaceWidth,p.depth,{gateProfile:'shunzhen',dimensionStatus:p.dimensionStatus,portalCount:3});
 f.userData.structure=p;
 return p.wallInterfaceWidth;
}
