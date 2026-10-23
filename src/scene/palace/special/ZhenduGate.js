import * as THREE from 'three';
import {buildStuddedDoor} from '../../HallKit.js';
import {prunePavilionCoveredFaces} from '../../../render/PavilionRenderGeometry.js';
import {zhenduGateGeometry} from './ZhenduGateProfile.js';
const tag=(object,role,extra={})=>{object.name=role;Object.assign(object.userData,{role,...extra});return object;};

/** Independent B-layer shell. Every collision/support comes from this profile;
 * PHOTO_FIT and unseen conservative closure remain explicitly unaccepted. */
export function buildZhenduGate(kit,item) {
  const g=zhenduGateGeometry(item),p=g.platform,b=g.building,ph=p.topY,f=kit.frame(g.x,g.z,g.rot),boxes=[];
  f.name=item.name??g.name;f.userData.gateGeometry=g;
  const box=(role,mat,w,h,d,x,y,z,parent=f)=>{const m=tag(kit.box(parent,mat,w,h,d,x,y,z),role);boxes.push(m);return m;};
  const solid=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
  // Masonry and pale edgework meet without overlaid coplanar skins. The crop
  // supports the material hierarchy, not these complete perimeter dimensions.
  const edge=.58,masonryH=ph-p.pavingThickness;
  solid('zhendu-platform','wall_brick',p.width-2*edge,masonryH,p.depth,0,masonryH/2,0);
  for(const sign of [-1,1])solid('zhendu-stone-edge','stone_slab',edge,masonryH,p.depth,sign*(p.width-edge)/2,masonryH/2,0);
  solid('zhendu-platform-paving','stone_slab',p.width-2*edge,p.pavingThickness,p.depth,0,ph-p.pavingThickness/2,0);
  // Pale paving edge strips abut the middle slab instead of overlaying it.
  for(const sign of [-1,1])solid('zhendu-stone-edge','stone_slab',edge,p.pavingThickness,p.depth,sign*(p.width-edge)/2,ph-p.pavingThickness/2,0);
  kit.walkables.push({type:'box',box:new THREE.Box3(new THREE.Vector3(...g.supports.platform.min),new THREE.Vector3(...g.supports.platform.max)),rescue:false,supportId:p.supportId});
  for(const [i,r]of g.ramps.entries()){
    tag(kit.mesh(f,closedWedge(r.leftTop,r.rightTop,r.zTop,r.zToe,r.yTop,0),kit.lib.material('stone_slab'),0,0,0),'zhendu-ramp-solid',{side:r.side,supportId:r.supportId});
    kit.walkables.push({...g.supports.ramps[i]});
    const slices=Math.ceil(r.run/.2);
    const body=(left,right,offset)=>{for(let j=0;j<slices;j++){const a=j/slices,bb=(j+1)/slices,y=r.yTop*(1-bb)+offset;if(y>.001)kit.col(f,left,0,r.zTop+(r.zToe-r.zTop)*a,right,y,r.zTop+(r.zToe-r.zTop)*bb);}};
    body(r.leftTop,r.rightTop,0);
    for(const sign of [-1,1]){
      const left=sign<0?r.outerLeft:r.rightTop,right=sign<0?r.leftTop:r.outerRight,x=(left+right)/2;
      tag(kit.mesh(f,closedWedge(left,right,r.zTop,r.zToe,r.yTop+.2,.2),kit.lib.material('stone_slab'),0,0,0),'zhendu-ramp-cheek',{side:r.side});body(left,right,.2);
      rail([x,ph+.2,r.zTop],[x,.2,r.zToe]);
      rail([sign*(p.width/2-.12),ph,r.zTop],[sign<0?r.outerLeft:r.outerRight,ph,r.zTop]);
    }
  }
  for(const j of Object.values(g.joins)){
    const sign=Math.sign(j.platformEdge),h=j.topY-ph,w=Math.abs(j.platformEdge-j.buildingEdge);
    solid('zhendu-abutment','wall_red',w,h,j.wallThickness,(j.platformEdge+j.buildingEdge)/2,ph+h/2,0);
    solid('zhendu-wing-cap','wall_red',j.capThickness,h,j.capZMax-j.capZMin,j.platformEdge-sign*j.capThickness/2,ph+h/2,(j.capZMin+j.capZMax)/2);
    const x=j.platformEdge-sign*.12;rail([x,ph,p.minZ+.12],[x,ph,j.capZMin-.15]);rail([x,ph,j.capZMax+.15],[x,ph,p.maxZ-.12]);
  }
  const column=new THREE.CylinderGeometry(b.columnRadius,b.columnRadius*1.04,b.columnH,10);
  for(const x of b.columnXs)for(const z of b.columnZs){
    tag(kit.mesh(f,column,kit.lib.material('wood_column'),x,ph+b.columnH/2,z),'zhendu-column');
    kit.col(f,x-b.columnRadius,ph,z-b.columnRadius,x+b.columnRadius,ph+b.columnH,z+b.columnRadius);
    box('zhendu-column-foot','stone_slab',.7,.15,.7,x,ph+.075,z);
  }
  for(const z of b.columnZs)box('zhendu-painted-beam','caihua_beam',b.width+.4,.61,.46,0,ph+b.columnH-.305,z);
  for(const sign of [-1,1])box('zhendu-painted-beam','caihua_beam',.46,.61,b.depth+.4,sign*b.width/2,ph+b.columnH-.305,0);
  // Lower, separated beam panels are visible between the red columns in the
  // close-up. No detailed figurative carving is invented from this small crop.
  let bayX=-g.core.width/2;
  for(const width of g.core.bayWidths){box('zhendu-painted-header','caihua_beam',width-.15,.52,.34,bayX+width/2,ph+b.columnH-1.02,b.columnZs[0]-.03);bayX+=width;}
  const portal=g.portals[0],panelW=(b.width-portal.clearWidth)/2;
  for(const z of [g.core.frontZ,g.core.rearZ])for(const sign of [-1,1]){
    const x=sign*(portal.clearWidth/2+panelW/2);
    solid('zhendu-side-panel','wall_red',panelW,b.columnH,g.core.wallThickness,x,ph+b.columnH/2,z);
    box('zhendu-panel-foot','wall_brick',panelW,.72,g.core.wallThickness+.035,x,ph+.36,z);
  }
  // Keep the documented lateral veranda as real space outside the core.
  // Front/rear narrow bay closures remain conservative, not extra portals.
  for(const sign of [-1,1])solid('zhendu-core-side-wall','wall_red',g.core.wallThickness,b.columnH,g.core.rearZ-g.core.frontZ,sign*g.core.width/2,ph+b.columnH/2,(g.core.frontZ+g.core.rearZ)/2);
  for(const z of [g.core.frontZ,g.core.rearZ])solid('zhendu-door-head','caihua_beam',portal.clearWidth,b.columnH-portal.doorHeight,.4,0,ph+(b.columnH+portal.doorHeight)/2,z);
  box('zhendu-threshold','wood_column',portal.clearWidth,.1,.26,0,ph+.05,g.core.frontZ);
  const open=item.open!==false,leafW=portal.clearWidth/2-(open?.04:0);
  for(const sign of [-1,1]){
    const leaf=tag(buildStuddedDoor(kit.lib,{width:leafW,height:portal.doorHeight}),'zhendu-door-leaf',{open});
    leaf.position.set(open?sign*(portal.clearWidth/2+.13):sign*leafW/2,ph,open?g.core.frontZ-leafW/2:g.core.frontZ);if(open)leaf.rotation.y=Math.PI/2;f.add(leaf);
    const dx=open?.125:leafW/2,dz=open?leafW/2:.125;kit.col(f,leaf.position.x-dx,ph,leaf.position.z-dz,leaf.position.x+dx,ph+portal.doorHeight,leaf.position.z+dz);
  }
  const min=Math.min(g.roof.width,g.roof.depth),bracketH=THREE.MathUtils.clamp(min*.05,.6,1.8),hr=THREE.MathUtils.clamp(min*.011,.1,.42);
  const roof=tag(kit.roof(f,{type:'xieshan',width:g.roof.width,depth:g.roof.depth,overhang:g.roof.overhang,baseY:ph+b.columnH,
    height:g.roof.ridgeAbovePlatform-b.columnH-bracketH-3.324*hr,layers:1,brackets:true,detail:'low'}),'zhendu-roof');
  f.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(roof);
  if(item.plaque!==false)kit.plaque(f,item.name??g.name,0,ph+b.columnH-.84,-b.depth/2-.28,.8,1.35);
  kit.mapRect(f,'gate',item.name??g.name,b.width,b.depth,{gateProfile:'zhendu',portalCount:1,platformY:ph,dimensionStatus:'PHOTO_FIT_AND_ENGINEERING_ASSUMPTION'});
  const {toWorld,...serializable}=g;
  f.userData.structure={...serializable,gateKind:'three-bay',streamLayer:'B',storeys:1,eaveCount:1,coreBayCount:3,portalCount:1,surroundingVeranda:true,provisionalLateralBayClosures:true,
    openState:open?'playable-open':'closed',visitorPolicy:'Playable continuity is not museum access permission.',
    dimensions:{status:'HISTORIC_DOCUMENT_PLUS_PHOTO_FIT',documentary:g.documentary,derived:g.derived,photoFit:g.photoFit,assumptions:g.assumptions},
    roofBounds:{min:bounds.min.toArray(),max:bounds.max.toArray(),space:'world',mainRidgeCapY:g.roof.ridgeWorldY},comparisonStatus:'VERIFY_PENDING; cropped source only, rear/plan/interior unresolved'};
  f.userData.structure.pruning=prunePavilionCoveredFaces(f,boxes);
  return g.wallGapWidth;

  function rail(from,to){
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a),length=delta.length();if(length<.01)return;
    const group=tag(new THREE.Group(),'zhendu-railing');f.add(group);
    const count=Math.ceil(length/g.assumptions.railMaximumSpacing),height=g.photoFit.railHeight.value;
    for(let i=0;i<=count;i++){
      const v=a.clone().lerp(b,i/count);box('zhendu-railing-post','marble',.22,height,.22,v.x,v.y+height/2,v.z,group);
      tag(kit.mesh(group,new THREE.SphereGeometry(.155,6,4),kit.lib.material('marble'),v.x,v.y+height-.08,v.z),'zhendu-rail-cap');
    }
    for(const [offset,h]of [[.28,.42],[.81,.14]]){
      const v=a.clone().lerp(b,.5);v.y+=offset;const m=tag(kit.mesh(group,new THREE.BoxGeometry(.18,h,length),kit.lib.material('marble'),v.x,v.y,v.z),'zhendu-railing-panel');m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());
    }
    // Physical guard follows the slope in short pieces instead of a tall AABB.
    const steps=Math.ceil(length/.2);
    for(let i=0;i<steps;i++){const u=a.clone().lerp(b,i/steps),v=a.clone().lerp(b,(i+1)/steps);kit.col(f,Math.min(u.x,v.x)-.11,Math.min(u.y,v.y),Math.min(u.z,v.z)-.11,Math.max(u.x,v.x)+.11,Math.max(u.y,v.y)+height,Math.max(u.z,v.z)+.11);}
  }
}

/** Closed solid with face-oriented UVs; safe low-level geometry only. */
function closedWedge(left,right,zTop,zToe,yTop,yToe){
  const a=[left,yTop,zTop],b=[right,yTop,zTop],c=[right,yToe,zToe],d=[left,yToe,zToe],aa=[left,0,zTop],bb=[right,0,zTop],cc=[right,0,zToe],dd=[left,0,zToe],positions=[],uv=[];
  const face=(points,normal)=>{for(let i=1;i<points.length-1;i++){let tri=[points[0],points[i],points[i+1]],n=new THREE.Vector3().subVectors(new THREE.Vector3(...tri[1]),new THREE.Vector3(...tri[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...tri[2]),new THREE.Vector3(...tri[0])));if(n.lengthSq()<1e-16)continue;if(n.dot(new THREE.Vector3(...normal))<0)tri=[tri[0],tri[2],tri[1]];for(const p of tri){positions.push(...p);uv.push(...(Math.abs(normal[0])>.5?[p[2]/2,p[1]/2]:Math.abs(normal[2])>.5?[p[0]/2,p[1]/2]:[p[0]/2,p[2]/2]));}}};
  const sign=Math.sign(zToe-zTop);face([a,b,c,d],[0,1,0]);face([aa,dd,cc,bb],[0,-1,0]);face([a,aa,bb,b],[0,0,-sign]);face([d,c,cc,dd],[0,0,sign]);face([a,d,dd,aa],[-1,0,0]);face([b,bb,cc,c],[1,0,0]);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return geo;
}
