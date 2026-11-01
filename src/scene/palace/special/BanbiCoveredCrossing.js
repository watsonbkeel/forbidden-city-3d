import {sideGateGalleryOptions} from './SideGateGalleryProfiles.js';
import * as THREE from 'three';

/** Only the source-bound half bridge's existing Xiehe culvert roof. +X=west.
 * Absolute coordinates / strip width remain an engineering fit, not a survey.
 * This is not a generic permission to walk over any water or any culvert. */
export function banbiCoveredStrip(bridge,culvert){
 if(bridge?.id!=='xiehe-banbi'||bridge.axis!=='z'||bridge.railSides?.length!==1||bridge.railSides[0]!==-1||culvert?.id!=='xiehe-north'||culvert.axis!=='x')throw new Error('Banbi cover requires its one east rail and own existing culvert');
 // Read the retained current north-gallery depth: its 0.5m CourtKit pad is
 // real foundation, not traversable grass. Do not reuse the old shallow edge.
 const gallery=sideGateGalleryOptions('axis-courts',27,{kind:'corridor',facing:'x+',from:[-103.37,-286.1],to:[-103.37,-222.2]});
 const minX=culvert.x-culvert.length/2,maxX=-103.37-gallery.depth/2-.5,roofMinZ=culvert.z-culvert.width/2-.55,roofMaxZ=culvert.z+culvert.width/2+.55,minZ=bridge.z-bridge.length/2,maxZ=bridge.z+bridge.length/2;
 if(![bridge.x,bridge.z,bridge.width,bridge.length,culvert.x,culvert.z,culvert.width,culvert.length,minX,maxX,minZ,maxZ,roofMinZ,roofMaxZ].every(Number.isFinite)||bridge.width<=0||bridge.length<=0||culvert.width<=0||culvert.length<=0||Math.abs(bridge.x+bridge.width/2-minX)>1e-8||bridge.z!==culvert.z||maxX<=minX||maxX>culvert.x+culvert.length/2||minZ>=roofMinZ||maxZ<=roofMaxZ)throw new Error('Banbi cover must meet the real culvert roof and bridge west edge');
 return Object.freeze({kind:'BANBI_VISIBLE_EXISTING_CULVERT_ROOF_CAP',minX,maxX,minZ,maxZ,roofMinZ,roofMaxZ,bottomY:.16,topY:.18,dimensionStatus:'SOURCE_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED'});
}

/** A square footprint must lie wholly on the union of the actual stone deck
 * and actual roof cap. The east stone edge retains its physical rail margin;
 * the open west edge is a join, not an imaginary second rail. */
export function pointOnBanbiCoveredCrossing(bridge,x,z,radius=0){
 const c=bridge.cover;if(bridge.id!=='xiehe-banbi'||bridge.axis!=='z'||c?.kind!=='BANBI_VISIBLE_EXISTING_CULVERT_ROOF_CAP')return false;
 if(![x,z,radius].every(Number.isFinite)||radius<0)return false;
 const stone={minX:bridge.x-bridge.width/2+.23,maxX:bridge.x+bridge.width/2,minZ:bridge.z-bridge.length/2,maxZ:bridge.z+bridge.length/2};
 const inRect=(p,xx,zz)=>xx>=p.minX&&xx<=p.maxX&&zz>=p.minZ&&zz<=p.maxZ;
 return [x-radius,x+radius].every(xx=>[z-radius,z+radius].every(zz=>inRect(stone,xx,zz)||inRect(c,xx,zz)));
}

/** A genuinely visible grass cap sits on the existing stone tube's flat top.
 * Its exact geometry Box3 supplies both ordinary solid and non-rescuing support;
 * no hidden rectangle or full-height gallery floor is created. */
export function buildBanbiCoveredStrip(library,bridge,culvert){
 const c=banbiCoveredStrip(bridge,culvert),group=new THREE.Group(),colliders=[],walkables=[];group.name='banbi-visible-covered-culvert-strip';
 // The roof cap rests on the actual stone tube. Its two low grass landings
 // rest on the unchanged dry banks, rather than an invisible extension in air.
 for(const [name,minZ,maxZ,bottomY]of[['roof',c.roofMinZ,c.roofMaxZ,c.bottomY],['south-bank',c.minZ,c.roofMinZ,0],['north-bank',c.roofMaxZ,c.maxZ,0]]){
  const geometry=new THREE.BoxGeometry(c.maxX-c.minX,c.topY-bottomY,maxZ-minZ),mesh=new THREE.Mesh(geometry,library.material('grass'));
  mesh.name=`banbi-cover:${name}`;mesh.position.set((c.minX+c.maxX)/2,(bottomY+c.topY)/2,(minZ+maxZ)/2);mesh.castShadow=mesh.receiveShadow=true;mesh.userData.structureId=`xiehe-banbi:covered-${name}`;group.add(mesh);mesh.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(mesh);colliders.push(box);walkables.push({type:'box',box,rescue:false,structureId:mesh.userData.structureId});
 }
 return{group,colliders,walkables,profile:c};
}
