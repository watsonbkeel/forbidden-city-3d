import * as THREE from 'three';
import { buildStuddedDoor } from '../../HallKit.js';
import { zhaodeGateGeometry } from './ZhaodeGateProfile.js';
import { prunePavilionCoveredFaces } from '../../../render/PavilionRenderGeometry.js';

const tag=(o,role,extra={})=>{o.name=role;Object.assign(o.userData,{role,...extra});return o;};

/** Permanent B-only shell. The profile is the sole geometry/support authority. */
export function buildZhaodeGate(kit,opts) {
  const g=zhaodeGateGeometry(opts),f=kit.frame(g.x,g.z,g.rot),p=g.platform,b=g.building,ph=p.topY;
  f.name=opts.name??g.name;f.userData.gateGeometry=g;
  const boxes=[];
  const box=(role,material,w,h,d,x,y,z,parent=f)=>{const m=tag(kit.box(parent,material,w,h,d,x,y,z),role);boxes.push(m);return m;};
  const solid=(role,material,w,h,d,x,y,z)=>{const m=box(role,material,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
  // Adjacent closed volumes share only buried contact faces. The original
  // full-height brick box plus overlaid paving had coplanar exposed skins.
  const masonryH=ph-p.pavingThickness;
  solid('zhaode-platform','wall_brick',p.width,masonryH,p.depth,0,masonryH/2,0);
  solid('zhaode-platform-paving','stone_slab',p.width,p.pavingThickness,p.depth,0,ph-p.pavingThickness/2,0);
  const support=g.supports.platform;
  kit.walkables.push({type:'box',box:new THREE.Box3(new THREE.Vector3(...support.min),new THREE.Vector3(...support.max)),rescue:false,supportId:support.supportId});

  for(const [i,r] of g.ramps.entries()) {
    tag(kit.mesh(f,wedge(r.leftTop,r.rightTop,r.zTop,r.zToe,r.yTop,0),kit.lib.material('stone_slab'),0,0,0),'zhaode-ramp-solid',{side:r.side,supportId:r.supportId});
    kit.walkables.push({...g.supports.ramps[i]});
    // Inscribed slices stay below the true sloping support at both ends.
    const count=Math.ceil(r.run/.2);
    for(let j=0;j<count;j++){
      const t0=j/count,t1=(j+1)/count,z0=r.zTop+(r.zToe-r.zTop)*t0,z1=r.zTop+(r.zToe-r.zTop)*t1,top=r.yTop*(1-t1);
      if(top>.001)kit.col(f,r.leftTop,0,z0,r.rightTop,top,z1);
    }
    for(const side of [-1,1]) {
      const inner=side<0?r.outerLeft:r.rightTop,outer=side<0?r.leftTop:r.outerRight;
      tag(kit.mesh(f,wedge(inner,outer,r.zTop,r.zToe,r.yTop+.22,.22),kit.lib.material('stone_slab'),0,0,0),'zhaode-ramp-cheek',{side:r.side});
      const x=(inner+outer)/2;
      railing([x,ph+.22,r.zTop],[x,.22,r.zToe]);
      // Closed cheek volume, with shallow local slices, never one tall ramp AABB.
      for(let j=0;j<count;j++){
        const t0=j/count,t1=(j+1)/count,z0=r.zTop+(r.zToe-r.zTop)*t0,z1=r.zTop+(r.zToe-r.zTop)*t1,top=r.yTop*(1-t1)+.22;
        kit.col(f,inner,0,z0,outer,top,z1);
      }
    }
  }

  // Only these local contacts close the lower inherited wing ends. No lateral
  // stair, hidden lift, new door or south-facing-wing reconstruction is implied.
  for(const j of Object.values(g.joins)) {
    const sign=Math.sign(j.platformEdge),width=Math.abs(j.platformEdge-j.buildingEdge);
    // The closed platform already supplies the entire lower contact volume.
    // Red contact walls begin at its top, avoiding a second exposed skin over
    // the gray retaining face. Overall contact top remains absolute y=7.
    const wallH=j.topY-j.wallBaseY,wallY=(j.topY+j.wallBaseY)/2;
    solid('zhaode-abutment','wall_red',width,wallH,j.wallThickness,(j.platformEdge+j.buildingEdge)/2,wallY,0);
    solid('zhaode-wing-cap','wall_red',j.capThickness,wallH,j.capZMax-j.capZMin,j.platformEdge-sign*j.capThickness/2,wallY,(j.capZMin+j.capZMax)/2);
    // Rail ends are deliberately clear of the closed wall contact, not buried
    // through it; the complete contact itself is visible and collidable.
    const railX=j.platformEdge-sign*.12;
    railing([railX,ph,p.minZ+.12],[railX,ph,j.capZMin-.15]);
    railing([railX,ph,j.capZMax+.15],[railX,ph,p.maxZ-.12]);
  }
  for(const r of g.ramps)for(const side of [-1,1]){
    const end=side<0?r.outerLeft:r.outerRight;
    railing([side*(p.width/2-.12),ph,r.zTop],[end,ph,r.zTop]);
  }

  // Six front boundary columns describe THREE core bays plus
  // two narrower veranda spans, never five core bays or three portals.
  const columnGeometry=new THREE.CylinderGeometry(b.columnRadius,b.columnRadius*1.04,b.columnH,8);
  for(const x of b.columnXs)for(const z of b.columnZs){
    tag(kit.mesh(f,columnGeometry,kit.lib.material('wood_column'),x,ph+b.columnH/2,z),'zhaode-column');
    kit.col(f,x-b.columnRadius,ph,z-b.columnRadius,x+b.columnRadius,ph+b.columnH,z+b.columnRadius);
    box('zhaode-column-foot','stone_slab',.72,.16,.72,x,ph+.08,z);
  }
  for(const z of b.columnZs)box('zhaode-painted-beam','caihua_beam',b.width+.4,.65,.48,0,ph+b.columnH-.325,z);
  for(const side of [-1,1])box('zhaode-painted-beam','caihua_beam',.48,.65,b.depth+.4,side*b.width/2,ph+b.columnH-.325,0);
  const wallH=b.columnH-.65,aperture=g.portals[0];
  for(const z of [g.core.frontZ,g.core.rearZ])for(const side of [-1,1]){
    const panelWidth=(b.width-aperture.clearWidth)/2,x=side*(aperture.clearWidth/2+panelWidth/2);
    // Provisional full-height closure behind the outer colonnade; leave the
    // physical portal and end-wall/outer-beam junctions unchanged.
    solid('zhaode-side-panel','wall_red',panelWidth,g.core.panelHeight,g.core.wallThickness,x,ph+g.core.panelHeight/2,z);
    box('zhaode-panel-foot','wall_brick',panelWidth,.85,g.core.wallThickness+.04,x,ph+.425,z);
    // Narrow lateral closed panels are visible only on the south source face.
    if(z===g.core.frontZ)box('zhaode-closed-lateral-panel','door_studded',1.25,3.5,.1,side*8.93,ph+2.1,z-.25);
  }
  for(const side of [-1,1])solid('zhaode-end-closure','wall_red',g.core.wallThickness,wallH,b.depth,side*b.width/2,ph+wallH/2,0);
  for(const z of [g.core.frontZ,g.core.rearZ])solid('zhaode-door-head','caihua_beam',aperture.clearWidth,b.columnH-aperture.doorHeight,.4,0,ph+aperture.doorHeight+(b.columnH-aperture.doorHeight)/2,z);
  box('zhaode-threshold','wood_column',aperture.clearWidth,.12,.28,0,ph+.06,g.core.frontZ);
  const open=opts.open!==false,leafW=aperture.clearWidth/2-(open?.04:0);
  for(const side of [-1,1]){
    const leaf=tag(buildStuddedDoor(kit.lib,{width:leafW,height:aperture.doorHeight}),'zhaode-door-leaf',{open});
    leaf.position.set(open?side*(aperture.clearWidth/2+.13):side*leafW/2,ph,open?g.core.frontZ-leafW/2:g.core.frontZ);
    if(open)leaf.rotation.y=Math.PI/2;f.add(leaf);
    const dx=open?.125:leafW/2,dz=open?leafW/2:.125;
    kit.col(f,leaf.position.x-dx,ph,leaf.position.z-dz,leaf.position.x+dx,ph+aperture.doorHeight,leaf.position.z+dz);
  }
  const min=Math.min(g.roof.width,g.roof.depth),bracketH=THREE.MathUtils.clamp(min*.05,.6,1.8),hr=THREE.MathUtils.clamp(min*.011,.1,.42);
  const height=g.roof.ridgeAbovePlatform-b.columnH-bracketH-3.324*hr;
  const roof=tag(kit.roof(f,{type:'xieshan',width:g.roof.width,depth:g.roof.depth,overhang:g.roof.overhang,baseY:ph+b.columnH,height,layers:1,brackets:true,detail:'low'}),'zhaode-roof');
  f.updateMatrixWorld(true);
  const roofBounds=new THREE.Box3().setFromObject(roof);
  if(opts.plaque!==false)kit.plaque(f,opts.name??g.name,0,ph+b.columnH-.9,-b.depth/2-.29,.8,1.4);
  kit.mapRect(f,'gate',opts.name??g.name,b.width,b.depth,{gateProfile:g.profile,portalCount:1,platformY:ph,dimensionStatus:'provisional'});
  const {toWorld,...serializable}=g;
  f.userData.structure={...serializable,gateKind:'three-bay',streamLayer:'B',storeys:1,eaveCount:1,portalCount:1,coreBayCount:3,surroundingVeranda:true,
    openState:open?'playable-open':'closed',visitorPolicy:'Playable route is not museum visitor access permission.',
    dimensions:{status:'provisional',documentary:g.documentary,derived:g.derived,digitized:g.digitized,assumptions:g.provisional},
    roofBounds:{min:roofBounds.min.toArray(),max:roofBounds.max.toArray(),space:'world',ornamentalMaximumY:roofBounds.max.y,mainRidgeCapY:g.roof.ridgeWorldY},
    comparisonStatus:'south-source-compared; north and wing interfaces provisional'};
  f.userData.structure.pruning=prunePavilionCoveredFaces(f,boxes);
  return g.wallGapWidth;

  function railing(from,to) {
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a),length=delta.length();if(length<.01)return;
    const group=tag(new THREE.Group(),'zhaode-railing');f.add(group);
    const count=Math.max(1,Math.ceil(length/g.provisional.railMaximumSpacing));
    for(let i=0;i<=count;i++){const v=a.clone().lerp(b,i/count);box('zhaode-railing-post','marble',.2,g.provisional.railHeight,.2,v.x,v.y+g.provisional.railHeight/2,v.z,group);}
    // Low-detail solid panels and hand rails; no unsupported ornament or new
    // materials. All retain shadows. Horizontal silhouette stays guarded.
    for(const [offset,h] of [[.35,.5],[.87,.16]]){
      const v=a.clone().lerp(b,.5);v.y+=offset;
      const beam=tag(kit.mesh(group,new THREE.BoxGeometry(.18,h,length),kit.lib.material('marble'),v.x,v.y,v.z),'zhaode-railing-panel');
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());
    }
    const pieces=Math.max(1,Math.ceil(length/.3));
    for(let i=0;i<pieces;i++){const v=a.clone().lerp(b,i/pieces),w=a.clone().lerp(b,(i+1)/pieces);kit.col(f,Math.min(v.x,w.x)-.1,Math.min(v.y,w.y),Math.min(v.z,w.z)-.1,Math.max(v.x,w.x)+.1,Math.max(v.y,w.y)+g.provisional.railHeight,Math.max(v.z,w.z)+.1);}
  }
}

/** Closed wedge (including the underside), with finite UVs and outward normals. */
function wedge(left,right,zTop,zToe,yTop,yToe) {
  const a=[left,yTop,zTop],b=[right,yTop,zTop],c=[right,yToe,zToe],d=[left,yToe,zToe],aa=[left,0,zTop],bb=[right,0,zTop],cc=[right,0,zToe],dd=[left,0,zToe];
  const positions=[],uv=[];
  const face=(points,normal)=>{for(let i=1;i<points.length-1;i++){let tri=[points[0],points[i],points[i+1]];const n=new THREE.Vector3().subVectors(new THREE.Vector3(...tri[1]),new THREE.Vector3(...tri[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...tri[2]),new THREE.Vector3(...tri[0])));if(n.lengthSq()<1e-16)continue;if(n.dot(new THREE.Vector3(...normal))<0)tri=[tri[0],tri[2],tri[1]];for(const p of tri){positions.push(...p);
        // Project each face on its own non-collapsing metre-scale axes.
        if(Math.abs(normal[0])>.5)uv.push(p[2]/2,p[1]/2);
        else if(Math.abs(normal[2])>.5)uv.push(p[0]/2,p[1]/2);
        else uv.push(p[0]/2,p[2]/2);}}};
  const sign=Math.sign(zToe-zTop);face([a,b,c,d],[0,1,0]);face([aa,dd,cc,bb],[0,-1,0]);face([a,aa,bb,b],[0,0,-sign]);face([d,c,cc,dd],[0,0,sign]);face([a,d,dd,aa],[-1,0,0]);face([b,bb,cc,c],[1,0,0]);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();return geometry;
}
