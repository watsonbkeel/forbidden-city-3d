import * as THREE from 'three';
import { buildStuddedDoor } from '../../HallKit.js';
import { sideGateGeometry } from './SideGateProfiles.js';
import { buildXiheCourtyardCorbels } from './SideGateExteriorDetails.js';
import { buildXieheCourtyardKnees } from './XieheCourtyardKnees.js';
import { buildCourtyardWindowLeaves } from './CourtyardWindowLeaves.js';
import { prunePavilionCoveredFaces } from '../../../render/PavilionRenderGeometry.js';

const tag=(o,role,data={})=>{o.name=role;Object.assign(o.userData,{role,...data});return o;};

/** A five-bay timber gate hall. Three openings share a vestibule, not tunnels. */
export function buildSideGate(kit,opts) {
  const g=sideGateGeometry(opts),f=kit.frame(g.x,g.z,g.rot);
  f.name=opts.name??g.name;
  const ph=g.platformY, d=g.depth,w=g.width,h=g.columnH;
  // Only actual closed kit.box primitives can prove a face is buried. Keep
  // this registry local to the gate; roof/wedge/sphere bounds are not solids.
  const renderBoxes=[];
  const box=(role,mat,W,H,D,x,y,z)=>{
    const o=tag(kit.box(f,mat,W,H,D,x,y,z),role);renderBoxes.push(o);return o;
  };
  const solid=(role,mat,W,H,D,x,y,z)=>{
    const o=box(role,mat,W,H,D,x,y,z);
    kit.col(f,x-W/2,y-H/2,z-D/2,x+W/2,y+H/2,z+D/2);return o;
  };
  solid('gate-platform','wall_brick',g.platformWidth,ph,g.platformDepth,0,ph/2,0);
  box('gate-platform-paving','stone_slab',g.platformWidth,.08,g.platformDepth,0,ph-.04,0);
  kit.walkBox(f,-g.platformWidth/2,-g.platformDepth/2,g.platformWidth/2,g.platformDepth/2,ph);
  kit.walkables.at(-1).rescue=false; // Reach the platform through its real ramps.

  for(const r of g.ramps) {
    tag(kit.mesh(f,rampSolid(r),kit.lib.material('stone_slab'),0,0,0),'gate-ramp-solid',{side:r.side});
    registerRamp(kit,f,r);
    // Inscribed short solids represent the wedge volume without a giant AABB
    // across its flare. Tops stay below the exact walk surface at every point.
    const slices=Math.ceil(Math.abs(r.zToe-r.zTop)/.2);
    const edge=(side,t)=>r[side+'Top']+(r[side+'Toe']-r[side+'Top'])*t;
    for(let i=0;i<slices;i++) {
      const t0=i/slices,t1=(i+1)/slices;
      const left=Math.max(edge('left',t0),edge('left',t1));
      const right=Math.min(edge('right',t0),edge('right',t1));
      const top=r.yTop*(1-t1);
      if(top>.001&&right>left)kit.col(f,left,0,r.zTop+(r.zToe-r.zTop)*t0,right,top,r.zTop+(r.zToe-r.zTop)*t1);
    }
    // Narrow physical transverse scoring on the low gates' 礓磋 ramps. These
    // sit flush and do not invent a tall stair or alter the continuous walk plane.
    if(!g.railings) for(let t=.08;t<.99;t+=.08) {
      const z=r.zTop+(r.zToe-r.zTop)*t,y=r.yTop*(1-t);
      box('gate-ramp-score','wall_brick',r.rightTop-r.leftTop,.012,.025,(r.leftTop+r.rightTop)/2,y+.003,z);
    }
    if(g.railings) for(const edge of ['left','right']) {
      railing(kit,f,[r[edge+'Top'],ph,r.zTop],[r[edge+'Toe'],0,r.zToe],renderBoxes);
    }
  }
  if(g.railings) {
    for(const side of [-1,1]) railing(kit,f,[side*g.platformWidth/2,ph,-g.platformDepth/2],[side*g.platformWidth/2,ph,g.platformDepth/2],renderBoxes);
    for(const r of g.ramps) {
      railing(kit,f,[-g.platformWidth/2,ph,r.zTop],[r.leftTop,ph,r.zTop],renderBoxes);
      railing(kit,f,[r.rightTop,ph,r.zTop],[g.platformWidth/2,ph,r.zTop],renderBoxes);
    }
  }

  const colGeo=new THREE.CylinderGeometry(g.radius,g.radius*1.04,h,10);
  for(const x of g.columnXs) for(const z of g.columnZs) {
    tag(kit.mesh(f,colGeo,kit.lib.material('wood_column'),x,ph+h/2,z),'gate-column');
    kit.col(f,x-g.radius,ph,z-g.radius,x+g.radius,ph+h,z+g.radius);
    box('gate-column-foot','stone_slab',g.radius*2+.12,.15,g.radius*2+.12,x,ph+.075,z);
  }
  // Beam rings above each supported grid line leave the ground-level vestibule open.
  for(const z of g.columnZs) box('gate-painted-beam','caihua_beam',w+.4,.65,.48,0,ph+h-.325,z);
  for(const side of [-1,1]) box('gate-painted-beam','caihua_beam',.48,.65,d+.4,side*w/2,ph+h-.325,0);

  // Both end bays are physical sill walls and lattice windows at the two eaves.
  // For gates other than Xihe, the unseen reverse detailing is conservative and
  // explicitly provisional; it is not a photographic acceptance claim.
  const sill=.85,windowH=h-1.65;
  for(const i of [0,4]) for(const z of [-d/2,d/2]) {
    const cx=g.bayCenters[i],bw=g.bayWidths[i],clear=bw-2*g.radius;
    solid('gate-window-sill','wall_brick',bw,sill,.48,cx,ph+sill/2,z);
    const pane=tag(new THREE.Group(),'gate-window',{bay:i,side:z<0?'front':'rear'}); f.add(pane);
    tag(kit.mesh(pane,new THREE.BoxGeometry(clear,windowH,.08),kit.lacquer,cx,ph+sill+windowH/2,z),'gate-window-shadow');
    for(const side of [-1,1]) box('gate-window-frame','wood_column',.13,windowH,.18,cx+side*clear/2,ph+sill+windowH/2,z);
    for(const y of [ph+sill,ph+sill+windowH]) box('gate-window-frame','wood_column',clear,.13,.18,cx,y,z);
    if(z>0&&(g.profile==='xihe'||g.profile==='xiehe')) {
      buildCourtyardWindowLeaves(kit,pane,{profile:g.profile,bay:i,cx,clear,bottom:ph+sill,height:windowH,z});
    } else {
      for(let j=1;j<12;j++)box('gate-window-bar','wood_column',.045,windowH,.14,cx-clear/2+j*clear/12,ph+sill+windowH/2,z);
      for(let j=1;j<8;j++)box('gate-window-bar','wood_column',clear,.045,.14,cx,ph+sill+j*windowH/8,z);
    }
    box('gate-window-head','caihua_beam',bw,.5,.48,cx,ph+h-.9,z);
    kit.col(f,cx-bw/2,ph,z-.24,cx+bw/2,ph+h-.65,z+.24);
  }
  // Outer mountain walls are short-width enclosure, never inter-portal piers.
  for(const side of [-1,1]) {
    if(g.sideDoor&&side===1) {
      // The source confirms a side door, but not its dimensions or exact bay.
      // Place one closed door on the provisional central side grid; do not copy it.
      const doorW=1.6,doorH=2.6;
      for(const zSign of [-1,1]) solid('gate-side-wall','wall_red',.45,h-.65,(d-doorW)/2,side*w/2,ph+(h-.65)/2,zSign*(d+doorW)/4);
      solid('gate-side-door','wood_column',.25,doorH,doorW,side*w/2,ph+doorH/2,0);
      solid('gate-side-door-head','wall_red',.45,h-.65-doorH,doorW,side*w/2,ph+doorH+(h-.65-doorH)/2,0);
    } else solid('gate-side-wall','wall_red',.45,h-.65,d,side*w/2,ph+(h-.65)/2,0);
  }

  const open=opts.open!==false,doorH=h-1;
  for(const p of g.portals) {
    const leafW=p.clearWidth/2-.04;
    box('gate-threshold','wood_column',p.clearWidth,.12,.28,p.centerX,ph+.06,g.doorZ);
    box('gate-door-lintel','caihua_beam',p.clearWidth,.65,.35,p.centerX,ph+doorH+.325,g.doorZ);
    for(const side of [-1,1]) {
      const leaf=tag(buildStuddedDoor(kit.lib,{width:leafW,height:doorH}),'gate-door-leaf',{bay:p.bay,open});
      leaf.position.set(open?p.centerX+side*(p.clearWidth/2-.03):p.centerX+side*(leafW/2+.02),ph,open?g.doorZ-leafW/2:g.doorZ);
      if(open) leaf.rotation.y=Math.PI/2;
      f.add(leaf);
      const dx=open?.125:leafW/2,dz=open?leafW/2:.125;
      kit.col(f,leaf.position.x-dx,ph,leaf.position.z-dz,leaf.position.x+dx,ph+doorH,leaf.position.z+dz);
    }
  }
  const roofW=w+.4,roofD=d+.4;
  const bracketH=THREE.MathUtils.clamp(Math.min(roofW,roofD)*.05,.6,1.8);
  const hr=THREE.MathUtils.clamp(Math.min(roofW,roofD)*.011,.1,.42);
  // RoofBuilder's centre ridge cap adds 3.324*hr above its nominal surface.
  // Keep Xiehe's official 11.43 m measured ABOVE the platform, not the courtyard.
  const roofHeight=g.ridgeAbovePlatform-h-bracketH-3.324*hr;
  const roof=kit.roof(f,{type:'xieshan',width:roofW,depth:roofD,baseY:ph+h,height:roofHeight,layers:1,brackets:true});
  tag(roof,'side-gate-roof');
  if(opts.plaque!==false)kit.plaque(f,g.name,0,ph+h-.9,-d/2-.29,.8,1.4);
  if(g.profile==='xihe')buildXiheCourtyardCorbels(kit,f,g);
  if(g.profile==='xiehe')buildXieheCourtyardKnees(kit,f,g);
  kit.mapRect(f,'gate',opts.name??g.name,w,d,{gateProfile:g.profile,portalCount:3,platformY:ph});
  const point=(x,y,z)=>{const [wx,wz]=g.toWorld(x,z);return {x:wx,y,z:wz};};
  f.userData.structure={
    id:g.id,profile:g.profile,name:g.name,gateKind:'five-bay',storeys:1,eaveCount:1,roof:'xieshan',portalCount:3,
    facing:g.facing,sourceFacing:g.sourceFacing,source:g.source,bayWidths:g.bayWidths,depthBays:g.depthBays,
    width:w,depth:d,platformY:ph,platformWidth:g.platformWidth,platformDepth:g.platformDepth,
    doorLine:g.doorLine,doorZ:g.doorZ,ridgeZ:g.ridgeZ,ridgeAbovePlatform:g.ridgeAbovePlatform,
    dimensions:{status:'provisional',verified:g.verified,assumptions:'Unlisted widths, depth, column grid, height split, door size, detailed rail and ramp outline are image-based engineering approximations.'},
    unknowns:['Measured bay widths and depth','Complete current reverse elevation','Exact side connections',...(g.depthBays===null?['Depth-bay count and all ramp measurements']:[]),...(g.profile==='xiehe'?['Exact door depth line','Complete east ramp']:[]),...(g.profile==='xihe'?['Exact river-following flare outline','Side-door dimensions and side']:[])],
    openState:open?'playable-open':'closed',visitorPolicy:'Game movement is not museum visitor access permission.',
    portals:g.portals.map(p=>({...p,front:point(p.centerX,ph,-d/2),rear:point(p.centerX,ph,d/2),door:point(p.centerX,ph,g.doorZ)})),
    ramps:g.ramps.map(r=>({...r,topLeft:point(r.leftTop,ph,r.zTop),topRight:point(r.rightTop,ph,r.zTop),toeLeft:point(r.leftToe,0,r.zToe),toeRight:point(r.rightToe,0,r.zToe)})),
  };
  prunePavilionCoveredFaces(f,renderBoxes);
  return w;
}

/** Closed wedge mesh with true tapered side faces, never a floating plane. */
function rampSolid(r) {
  const a=[r.leftTop,r.yTop,r.zTop],b=[r.rightTop,r.yTop,r.zTop],c=[r.rightToe,0,r.zToe],d=[r.leftToe,0,r.zToe];
  const aa=[a[0],0,a[2]],bb=[b[0],0,b[2]];
  const vertices=[],uv=[];
  const face=(pts,normal)=>{
    for(let i=1;i<pts.length-1;i++) {
      let tri=[pts[0],pts[i],pts[i+1]];
      const n=new THREE.Vector3().subVectors(new THREE.Vector3(...tri[1]),new THREE.Vector3(...tri[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...tri[2]),new THREE.Vector3(...tri[0])));
      if(n.dot(new THREE.Vector3(...normal))<0)tri=[tri[0],tri[2],tri[1]];
      for(const p of tri){vertices.push(...p);uv.push(p[0]/2,(p[2]+p[1])/2);}
    }
  };
  face([a,b,c,d],[0,1,0]);face([aa,d,c,bb],[0,-1,0]);
  face([a,aa,bb,b],[0,0,-Math.sign(r.zToe-r.zTop)]);
  face([a,d,aa],[-1,0,0]);face([b,bb,c],[1,0,0]);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return geo;
}

function registerRamp(kit,f,r) {
  const p=(x,z)=>new THREE.Vector3(x,0,z).applyMatrix4(f.matrixWorld);
  const a=p(r.leftTop,r.zTop),b=p(r.rightTop,r.zTop),c=p(r.leftToe,r.zToe),d=p(r.rightToe,r.zToe);
  const alongZ=Math.abs(b.x-a.x)>=Math.abs(b.z-a.z);
  const axis=alongZ?'z':'x',cross=alongZ?'x':'z';
  kit.walkables.push({type:'ramp',axis,minX:Math.min(a.x,b.x,c.x,d.x),maxX:Math.max(a.x,b.x,c.x,d.x),minZ:Math.min(a.z,b.z,c.z,d.z),maxZ:Math.max(a.z,b.z,c.z,d.z),
    a0:a[axis],a1:c[axis],y0:r.yTop,y1:0,
    crossMin0:Math.min(a[cross],b[cross]),crossMax0:Math.max(a[cross],b[cross]),crossMin1:Math.min(c[cross],d[cross]),crossMax1:Math.max(c[cross],d[cross])});
}

function railing(kit,f,from,to,renderBoxes) {
  const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a),len=delta.length();
  if(len<.01)return;
  const n=Math.max(1,Math.ceil(len/2));
  for(let i=0;i<=n;i++) {
    const p=a.clone().lerp(b,i/n);
    renderBoxes.push(tag(kit.box(f,'marble',.24,.95,.24,p.x,p.y+.475,p.z),'gate-railing-post'));
    tag(kit.mesh(f,new THREE.SphereGeometry(.16,6,4),kit.lib.material('marble'),p.x,p.y+1,p.z),'gate-railing-cap');
  }
  for(const y of [.25,.7]) {
    const p=a.clone().lerp(b,.5);p.y+=y;
    const beam=tag(kit.mesh(f,new THREE.BoxGeometry(.16,.16,len),kit.lib.material('marble'),p.x,p.y,p.z),'gate-railing-bar');
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());
  }
  // Small conservative AABBs follow the actual diagonal, not its whole envelope.
  const pieces=Math.max(1,Math.ceil(len/.35));
  for(let i=0;i<pieces;i++) {
    const p=a.clone().lerp(b,i/pieces),q=a.clone().lerp(b,(i+1)/pieces);
    kit.col(f,Math.min(p.x,q.x)-.1,Math.min(p.y,q.y),Math.min(p.z,q.z)-.1,Math.max(p.x,q.x)+.1,Math.max(p.y,q.y)+.95,Math.max(p.z,q.z)+.1);
  }
}
