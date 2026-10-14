import * as THREE from 'three';
import { pavilionGeometry } from './PavilionProfiles.js';
import { prunePavilionCoveredFaces, splitPavilionDeckFaces } from '../../../render/PavilionRenderGeometry.js';

const tag=(object,role,data={})=>{object.name=role;Object.assign(object.userData,{role,...data});return object;};
const part=(parent,role,data={})=>{const group=tag(new THREE.Group(),role,data);parent.add(group);return group;};

/** One reusable assembly, two independently transcribed surveys. Front is -Z. */
export function buildSurveyedPavilion(kit,opts={}) {
  const g=pavilionGeometry(opts),f=kit.frame(g.x,g.z,g.rot),name=opts.name??g.name;
  f.name=name;
  const enter=opts.enter===true,lo=g.lower,up=g.upper,p=g.platform;
  const renderBoxes=[];
  const box=(parent,role,mat,w,h,d,x,y,z,data={})=>{
    const mesh=tag(kit.box(parent,mat,w,h,d,x,y,z),role,data);renderBoxes.push(mesh);return mesh;
  };
  const solid=(parent,role,mat,w,h,d,x,y,z,data={})=>{
    const o=box(parent,role,mat,w,h,d,x,y,z,data);
    kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return o;
  };
  const walk=(x0,z0,x1,z1,y)=>{kit.walkBox(f,x0,z0,x1,z1,y);kit.walkables.at(-1).rescue=false;};
  const segment=(parent,role,mat,a,b,height=.18,depth=.18,data={})=>{
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),mid=start.clone().lerp(end,.5);
    const o=box(parent,role,mat,depth,height,delta.length(),mid.x,mid.y,mid.z,data);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());return o;
  };
  const column=(x,z,y,h,level,r=.28,role='storey-column')=>{
    const o=tag(kit.mesh(f,new THREE.CylinderGeometry(r,r*1.04,h,8),kit.lib.material('wood_column'),x,y+h/2,z),role,{level});
    kit.col(f,x-r,y,z-r,x+r,y+h,z+r);return o;
  };
  // A broad front terrace, with the building deliberately toward its rear.
  solid(f,'plinth','wall_brick',p.width,p.y-g.elevations.front_court,p.depth,0,(p.y+g.elevations.front_court)/2,(p.z0+p.z1)/2);
  box(f,'plinth-coping','stone_slab',p.width,.16,p.depth,0,p.y-.08,(p.z0+p.z1)/2);
  walk(p.x0,p.z0,p.x1,p.z1,p.y);
  solid(f,'storey-floor','stone_slab',lo.width,.18,lo.depth,0,lo.floorY-.09,0,{level:1});
  walk(-lo.width/2,lo.front,lo.width/2,lo.rear,lo.floorY);
  // Two 32-tread stair flights share a visual 2.3m carved central strip.
  // Walk planes follow the actual tread rise. The strip is never the route.
  for(const flight of g.frontFlights) {
    const rise=flight.yTop-flight.yToe,run=flight.zTop-flight.zToe;
    for(let i=0;i<flight.steps;i++) {
      const top=flight.yToe+rise*(i+1)/flight.steps;
      const z0=flight.zToe+run*i/flight.steps,z1=flight.zToe+run*(i+1)/flight.steps;
      box(f,'front-stair-tread','stone_slab',flight.width,top-flight.yToe,z1-z0,flight.centerX,(top+flight.yToe)/2,(z0+z1)/2,{side:flight.side,step:i+1});
      // Top of the solid slice is below the continuous walking envelope at its
      // leading edge, avoiding invisible extra risers with the player capsule.
      const bottomTop=flight.yToe+rise*i/flight.steps;
      if(bottomTop>flight.yToe)kit.col(f,flight.centerX-flight.width/2,flight.yToe,z0,flight.centerX+flight.width/2,bottomTop,z1);
    }
    kit.walkRamp(f,flight.centerX-flight.width/2,flight.centerX+flight.width/2,flight.zToe,flight.zTop,flight.yToe,flight.yTop);kit.walkables.at(-1).rescue=false;
  }
  const strip=g.royalStrip,front=g.frontFlights[0];
  rampWedge(kit,f,'imperial-carved-strip',-strip.width/2,strip.width/2,strip.zToe,strip.zTop,front.yToe,p.y+.08,'marble');
  // A restrained raised carved spine and panel seams distinguish the imperial
  // stone from the stair treads. Ornament is a game abstraction, not a replica.
  for(let i=0;i<8;i++) {
    const t=(i+.5)/8,z=strip.zToe+(strip.zTop-strip.zToe)*t,y=front.yToe+(p.y-front.yToe)*t+.1;
    const ornament=box(f,'imperial-strip-relief','marble',1.35,.065,.55,0,y,z,{status:'PROVISIONAL_ORNAMENT'});
    ornament.rotation.y=(i%2?1:-1)*.25;
  }
  for(let i=0;i<64;i++){
    const t0=i/64,t1=(i+1)/64;
    kit.col(f,-strip.width/2,front.yToe,strip.zToe+(strip.zTop-strip.zToe)*t0,strip.width/2,front.yToe+(p.y-front.yToe)*t0+.08,strip.zToe+(strip.zTop-strip.zToe)*t1);
  }
  // Architectural stone guards flank the two stair flights; central top stays open.
  const approachHalf=strip.width/2+front.width;
  for(const sign of [-1,1])railing(kit,f,[sign*approachHalf,front.yToe,front.zToe],[sign*approachHalf,p.y,p.z0],{role:'front-stair-guard'},renderBoxes);
  for(const sign of [-1,1])railing(kit,f,[sign*approachHalf,p.y,p.z0],[sign*p.width/2,p.y,p.z0],{role:'terrace-front-guard'},renderBoxes);

  // Short side connections descend only ~0.9m to adopted veranda landings.
  // The actual neighboring corridors remain lower placeholders; guarded dead
  // ends disclose the unresolved interface rather than invent a court-height ramp.
  for(const s of g.sideConnections) {
    const run=Math.abs(s.xLanding-s.xTop),steps=s.direction==='south'?6:12;
    for(let i=0;i<steps;i++) {
      const t=(i+1)/steps,xx=s.xTop+(s.xLanding-s.xTop)*(i+.5)/steps;
      const y=s.yTop+(s.yLanding-s.yTop)*t;
      solid(f,s.direction==='south'?'side-south-step':'side-north-ridge','stone_slab',run/steps,y,s.width,xx,y/2,s.zCenter,{direction:s.direction,status:s.geometryStatus});
    }
    solid(f,'side-landing','stone_slab',s.landingLength,s.yLanding,s.width,(s.xLanding+s.xOuter)/2,s.yLanding/2,s.zCenter,{status:s.geometryStatus});
    const a=g.toWorld(s.xTop,s.zCenter),b=g.toWorld(s.xLanding,s.zCenter);
    const corners=[g.toWorld(s.xTop,s.zCenter-s.width/2),g.toWorld(s.xTop,s.zCenter+s.width/2),g.toWorld(s.xLanding,s.zCenter-s.width/2),g.toWorld(s.xLanding,s.zCenter+s.width/2)];
    const axis=Math.abs(b[0]-a[0])>=Math.abs(b[1]-a[1])?'x':'z',index=axis==='x'?0:1;
    kit.walkables.push({type:'ramp',axis,minX:Math.min(...corners.map(p=>p[0])),maxX:Math.max(...corners.map(p=>p[0])),minZ:Math.min(...corners.map(p=>p[1])),maxZ:Math.max(...corners.map(p=>p[1])),a0:a[index],a1:b[index],y0:s.yTop,y1:s.yLanding,rescue:false});
    walk(s.xLanding,s.zCenter-s.width/2,s.xOuter,s.zCenter+s.width/2,s.yLanding);
    railing(kit,f,[s.xOuter,s.yLanding,s.zCenter-s.width/2],[s.xOuter,s.yLanding,s.zCenter+s.width/2],{role:'side-landing-guard',status:s.guardStatus},renderBoxes);
    for(const edge of [-1,1])railing(kit,f,[s.xTop,s.yTop,s.zCenter+edge*s.width/2],[s.xOuter,s.yLanding,s.zCenter+edge*s.width/2],{role:'side-connector-guard',status:s.guardStatus},renderBoxes);
    const ends=[[p.z0,s.zCenter-s.width/2],[s.zCenter+s.width/2,p.z1]];
    for(const [z0,z1]of ends)railing(kit,f,[s.sign*p.width/2,p.y,z0],[s.sign*p.width/2,p.y,z1],{role:'terrace-side-guard'},renderBoxes);
  }
  // The rear terrace is not an invented rear entrance.
  railing(kit,f,[-p.width/2,p.y,p.z1],[p.width/2,p.y,p.z1],{role:'terrace-rear-guard'},renderBoxes);

  for(const x of lo.columnXs)for(const z of [lo.front,lo.rear])column(x,z,lo.floorY,lo.height,1,.30);
  for(const x of [lo.columnXs[0],lo.columnXs.at(-1)])for(const z of lo.columnZs.slice(1,-1))column(x,z,lo.floorY,lo.height,1,.30);
  for(const sign of [-1,1]) {
    solid(f,'lower-brick-side','wall_red',.65,lo.height,lo.depth,sign*lo.width/2,lo.floorY+lo.height/2,0);
    box(f,'lower-wall-footing','wall_brick',.7,.75,lo.depth,sign*lo.width/2,lo.floorY+.375,0);
  }
  solid(f,'lower-brick-rear','wall_red',lo.width,lo.height,.65,0,lo.floorY+lo.height/2,lo.rear);
  box(f,'lower-wall-footing','wall_brick',lo.width,.75,.7,0,lo.floorY+.375,lo.rear);
  const facadeH=lo.height-.65,doorH=facadeH-.15;
  for(let bay=0;bay<9;bay++) {
    const width=lo.intervals[bay],cx=(lo.columnXs[bay]+lo.columnXs[bay+1])/2,clear=width-.6;
    const kind=bay===4?'door':bay===0||bay===8?'brick':'window';
    const parent=part(f,'lower-front-bay',{bay,kind,width});
    if(kind==='brick') {
      solid(parent,'lower-blocked-bay','wall_red',width,facadeH,.65,cx,lo.floorY+facadeH/2,lo.front,{bay});
      box(parent,'lower-wall-footing','wall_brick',width,.75,.7,cx,lo.floorY+.375,lo.front);
    } else if(kind==='window') {
      const sill=.85,h=facadeH-sill-.2;
      solid(parent,'lower-window-sill','wall_brick',width,sill,.65,cx,lo.floorY+sill/2,lo.front);
      const window=part(parent,'lower-window',{bay});
      for(const sign of [-1,1])box(window,'lower-window-frame','wood_column',.13,h,.2,cx+sign*clear/2,lo.floorY+sill+h/2,lo.front);
      for(const y of [lo.floorY+sill,lo.floorY+sill+h])box(window,'lower-window-frame','wood_column',clear,.14,.2,cx,y,lo.front);
      for(let j=1;j<14;j++)box(window,'lower-window-bar','wood_column',.045,h,.08,cx-clear/2+j*clear/14,lo.floorY+sill+h/2,lo.front-.04);
      for(const end of [-1,1])for(let j=0;j<3;j++)box(window,'lower-window-bar','wood_column',clear,.045,.09,cx,lo.floorY+sill+h/2+end*(h*.29+j*.1),lo.front-.05);
      kit.col(f,cx-width/2,lo.floorY,lo.front-.325,cx+width/2,lo.floorY+facadeH,lo.front+.325);
    } else {
      const leafW=clear/2-.035;
      for(const sign of [-1,1]) {
        const leaf=part(parent,'lower-door-leaf',{open:enter});
        leaf.position.set(cx+(enter?sign*(clear/2-.08):sign*(leafW/2+.035)),lo.floorY+doorH/2,enter?lo.front+leafW/2:lo.front);
        if(enter)leaf.rotation.y=Math.PI/2;
        box(leaf,'lower-door-plank','wood_column',leafW,doorH,.18,0,0,0);
        for(let j=1;j<6;j++)box(leaf,'lower-door-seam','wall_red',.025,doorH-.08,.025,-leafW/2+j*leafW/6,0,-.105);
        for(const y of [-doorH*.28,doorH*.28])box(leaf,'lower-door-rail','wood_column',leafW-.08,.16,.1,0,y,-.12);
        tag(kit.mesh(leaf,new THREE.TorusGeometry(.14,.025,5,10),kit.gold,-sign*leafW*.27,-doorH*.05,-.15),'lower-door-ring');
        if(enter)kit.col(f,cx+sign*(clear/2-.08)-.1,lo.floorY,lo.front,cx+sign*(clear/2-.08)+.1,lo.floorY+doorH,lo.front+leafW);
      }
      if(!enter)kit.col(f,cx-clear/2,lo.floorY,lo.front-.1,cx+clear/2,lo.floorY+doorH,lo.front+.1);
      box(parent,'door-threshold','wood_column',clear,.12,.28,cx,lo.floorY+.06,lo.front);
      box(parent,'lower-door-lintel','wood_column',clear,facadeH-doorH,.3,cx,lo.floorY+(facadeH+doorH)/2,lo.front);
      // A gentle 10cm threshold accommodation connects the independently sourced datums.
      kit.walkRamp(f,-clear/2,clear/2,lo.front-.7,lo.front,p.y,lo.floorY);kit.walkables.at(-1).rescue=false;
    }
  }
  for(const z of [lo.front,lo.rear])box(f,'painted-beam','caihua_beam',lo.width+.35,.65,.5,0,lo.columnTop-.325,z);
  for(const sign of [-1,1])box(f,'painted-beam','caihua_beam',.5,.65,lo.depth+.35,sign*lo.width/2,lo.columnTop-.325,0);
  const lowerBracketH=g.elevations.lower_eave-lo.columnTop;
  for(const z of [lo.front,lo.rear])box(f,'lower-eave-bracket-band','dougong_band',lo.width+.35,lowerBracketH,.65,0,lo.columnTop+lowerBracketH/2,z);
  for(const sign of [-1,1])box(f,'lower-eave-bracket-band','dougong_band',.65,lowerBracketH,lo.depth+.35,sign*lo.width/2,lo.columnTop+lowerBracketH/2,0);
  // Load path through the interstitial 平座 layer. The short columns carry gallery
  // beams, while principal continuations are independent of the waist roof skin.
  // Transfer tier 1 bears on both real lower perimeter beams. The tiny
  // front/rear grid differences are preserved in the skewed timber tie lines.
  for(let i=0;i<10;i++)segment(f,'waist-lower-transfer-beam','wood_column',
    [up.front.x[i],lo.columnTop-.16,lo.front-.24],[up.rear.x[i],lo.columnTop-.16,lo.rear+.24],.32,.34,{status:'PROVISIONAL_NOT_SURVEYED'});
  for(const line of [up.front,up.rear])for(const x of line.x)column(x,line.z,lo.columnTop,up.floorY-lo.columnTop-.2,0,.22,'waist-principal-continuation');
  const waistSupports=g.gallery.supports.map(support=>{
    const t=(support.z-g.gallery.front.z)/g.gallery.depth;
    const galleryWidth=g.gallery.front.width*(1-t)+g.gallery.rear.width*t;
    const waistWidth=g.waist.frontWidth*(1-t)+g.waist.rearWidth*t;
    return {x:support.x*waistWidth/galleryWidth,z:(t-.5)*g.waist.depth,support};
  });
  // Tier 2 is carried by the principal continuations, with short cantilevers
  // outside the enclosure. No full slab and no stair-landing datum substitution.
  const bearingY=g.waist.supportBaseY-.16;
  for(const line of [up.front,up.rear])segment(f,'waist-bearing-longitudinal','wood_column',
    [-g.waist.frontWidth/2-.3,bearingY,line.z],[g.waist.frontWidth/2+.3,bearingY,line.z],.32,.34,{status:'PROVISIONAL_NOT_SURVEYED'});
  for(let i=0;i<10;i++) {
    const a=waistSupports[i],b=waistSupports[i+10];
    segment(f,'waist-post-bearing-beam','wood_column',[a.x,bearingY,a.z-.2],[b.x,bearingY,b.z+.2],.32,.32,{status:'PROVISIONAL_NOT_SURVEYED'});
  }
  for(const {x,z,support}of waistSupports) {
    column(x,z,g.waist.supportBaseY,up.floorY-g.waist.supportBaseY-.24,0,.16,'waist-short-column');
    box(f,'waist-bracket','dougong_band',.68,.35,.7,x,up.floorY-.415,z);
    segment(f,'waist-bearing-beam','caihua_beam',[x,up.floorY-.25,z],[support.x,up.floorY-.25,support.z],.24,.24);
  }
  for(const z of [-g.waist.depth/2,g.waist.depth/2])box(f,'waist-longitudinal-beam','caihua_beam',g.waist.frontWidth,.34,.34,0,up.floorY-.4,z);
  buildSkirt(kit,f,g.lowerRoof);

  // Upper wood floor follows the independent front/rear trapezoid; gallery paving
  // uses brick, coping stone, and a glazed fascia BELOW the walking surface.
  const shell=[ [up.front.x.at(-1),up.front.z],[up.front.x[0],up.front.z],[up.rear.x[0],up.rear.z],[up.rear.x.at(-1),up.rear.z] ];
  tag(kit.mesh(f,slabPolygon(shell,up.floorY-.24,up.floorY),kit.lib.material('wood_column'),0,0,0),'storey-floor',{level:2});
  walk(Math.min(...up.front.x,...up.rear.x),up.front.z,Math.max(...up.front.x,...up.rear.x),up.rear.z,up.floorY);
  kit.col(f,Math.min(...up.front.x,...up.rear.x),up.floorY-.24,up.front.z,Math.max(...up.front.x,...up.rear.x),up.floorY,up.rear.z);
  const d=g.deck;
  const deckPolygons=[
    [[d.x0,d.z0],[d.x1,d.z0],[up.front.x[0],up.front.z],[up.front.x.at(-1),up.front.z]],
    [[up.rear.x.at(-1),up.rear.z],[up.rear.x[0],up.rear.z],[d.x1,d.z1],[d.x0,d.z1]],
    [[d.x0,d.z0],[up.front.x.at(-1),up.front.z],[up.rear.x.at(-1),up.rear.z],[d.x0,d.z1]],
    [[up.front.x[0],up.front.z],[d.x1,d.z0],[d.x1,d.z1],[up.rear.x[0],up.rear.z]],
  ];
  for(const [side,polygon]of deckPolygons.entries()) {
    const slab=slabPolygon(polygon,up.floorY-.24,up.floorY),layers=splitPavilionDeckFaces(slab);slab.dispose();
    // Retain the exact solid, but do not promote every merged interior floor
    // into the shadow pass just because this elevated paving shares its finish.
    tag(kit.mesh(f,layers.surface,kit.floorMat,0,0,0),'balcony-deck',{side,surface:'shared-square-brick-paving-simplification'}).castShadow=false;
    tag(kit.mesh(f,layers.body,kit.lib.material('wall_brick'),0,0,0),'balcony-deck-body',{side,status:'PROVISIONAL_MASONRY_SUBSTRATE'});
    walk(Math.min(...polygon.map(p=>p[0])),Math.min(...polygon.map(p=>p[1])),Math.max(...polygon.map(p=>p[0])),Math.max(...polygon.map(p=>p[1])),up.floorY);
  }
  for(const line of [up.front,up.rear])for(const x of line.x)column(x,line.z,up.floorY,up.height,2,.22);
  for(const [i,label]of [[0,'right'],[9,'left']]) {
    const a=[up.front.x[i],up.floorY+up.height/2,up.front.z],b=[up.rear.x[i],up.floorY+up.height/2,up.rear.z];
    segment(f,'upper-wood-side','wood_column',a,b,up.height,.28,{side:label});
    // Tiny source taper is enclosed conservatively, never interpreted as a door.
    kit.col(f,Math.min(a[0],b[0])-.14,up.floorY,up.front.z,Math.max(a[0],b[0])+.14,up.columnTop,up.rear.z);
  }
  solid(f,'upper-wood-rear','wood_column',up.rear.width,up.height,.28,(up.rear.x[0]+up.rear.x.at(-1))/2,up.floorY+up.height/2,up.rear.z);
  for(const bay of [0,8])solid(f,'upper-closed-end-bay','wood_column',up.front.intervals[bay],up.height,.28,(up.front.x[bay]+up.front.x[bay+1])/2,up.floorY+up.height/2,up.front.z,{bay});
  for(const opening of up.front.openingBays) {
    const {bay,width,x:bayX}=opening,parent=part(f,'upper-front-bay',{bay,width});
    for(let j=0;j<4;j++) {
      const leafW=(width-.44)/4,cx=bayX+(j-1.5)*leafW,leafH=up.height-.45;
      const leaf=part(parent,'upper-lattice-leaf',{bay,leaf:j});
      box(leaf,'upper-lattice-lower-panel','wood_column',leafW-.045,.95,.12,cx,up.floorY+.475,up.front.z);
      for(const sign of [-1,1])box(leaf,'upper-lattice-frame','wood_column',.075,leafH,.15,cx+sign*(leafW-.075)/2,up.floorY+leafH/2,up.front.z);
      for(const y of [up.floorY+.95,up.floorY+leafH])box(leaf,'upper-lattice-frame','wood_column',leafW,.1,.15,cx,y,up.front.z);
      const cellH=.57,latticeW=leafW-.15;
      for(let y=up.floorY+1.02;y+cellH<up.floorY+leafH;y+=cellH)for(const sign of [-1,1]) {
        const bar=box(leaf,'upper-lattice-bar','wood_column',.038,Math.hypot(latticeW,cellH),.06,cx,y+cellH/2,up.front.z-.035);
        bar.rotation.z=sign*Math.atan2(latticeW,cellH);
      }
    }
    kit.col(f,bayX-width/2,up.floorY,up.front.z-.14,bayX+width/2,up.columnTop,up.front.z+.14);
  }
  for(const line of [up.front,up.rear])box(f,'painted-beam','caihua_beam',line.width+.3,.45,.45,(line.x[0]+line.x.at(-1))/2,up.columnTop-.225,line.z);
  const galleryH=up.columnTop-up.floorY;
  g.gallery.supports.forEach((s,index)=>solid(f,'balcony-eave-support','wood_column',.24,galleryH,.24,s.x,up.floorY+galleryH/2,s.z,{index,section:'square',line:s.line}));
  const perimeter=[
    ['front',[g.gallery.front.x.at(-1),g.gallery.front.z],[g.gallery.front.x[0],g.gallery.front.z]],
    ['right',[g.gallery.front.x[0],g.gallery.front.z],[g.gallery.rear.x[0],g.gallery.rear.z]],
    ['rear',[g.gallery.rear.x[0],g.gallery.rear.z],[g.gallery.rear.x.at(-1),g.gallery.rear.z]],
    ['left',[g.gallery.rear.x.at(-1),g.gallery.rear.z],[g.gallery.front.x.at(-1),g.gallery.front.z]],
  ];
  const railH=g.assumptions.upperRail.height,fasciaH=g.profile==='hongyi'?.765:.75;
  for(const [side,a,b]of perimeter) {
    const rail=part(f,'balcony-railing',{side}),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(const h of [.14,.42,railH-.06])segment(rail,'balcony-rail','wood_column',[a[0],up.floorY+h,a[1]],[b[0],up.floorY+h,b[1]],.12,.1);
    const count=Math.ceil(length/.82);
    for(let i=0;i<=count;i++)box(rail,'balcony-baluster','wood_column',.075,railH,.075,a[0]+(b[0]-a[0])*i/count,up.floorY+railH/2,a[1]+(b[1]-a[1])*i/count);
    kit.col(f,Math.min(a[0],b[0])-.06,up.floorY,Math.min(a[1],b[1])-.06,Math.max(a[0],b[0])+.06,up.floorY+railH,Math.max(a[1],b[1])+.06);
    segment(f,'gallery-coping','marble',[a[0],up.floorY-.065,a[1]],[b[0],up.floorY-.065,b[1]],.13,.48);
    segment(f,'gallery-hanging-fascia','dougong_band',[a[0],up.floorY-.13-fasciaH/2,a[1]],[b[0],up.floorY-.13-fasciaH/2,b[1]],fasciaH,.18);
    segment(f,'gallery-top-beam','caihua_beam',[a[0],up.columnTop-.2,a[1]],[b[0],up.columnTop-.2,b[1]],.4,.36);
  }
  const roof=tag(kit.roof(f,{type:'wudian',width:g.gallery.width,depth:g.gallery.depth,baseY:g.roof.baseY,height:g.roof.height,overhang:g.roof.overhang,brackets:true,layers:1},0,g.roof.centerZ),'upper-hip-roof',{roofType:'wudian',layers:1,ridgeReference:g.elevations.ridge,ridgeReferenceObject:g.roof.ridgeReferenceObject,ornamentFidelity:g.roof.ornamentFidelity,eaveReference:g.elevations.upper_eave});
  if(enter)kit.registerRoom(f,{name,kind:'hall',...g.roomBounds,doors:[{x:0,z:lo.front}]});
  if(opts.plaque===true)kit.plaque(f,name,0,lo.columnTop-.5,lo.front-.35,1.1,1.5);
  if(opts.map!==false) {
    const centre=g.toWorld(0,(p.z0+p.z1)/2),q=Math.abs(Math.sin(g.rot))>.5;
    kit.mapItems.push({kind:opts.map??'hall',name,x:centre[0],z:centre[1],w:q?p.depth:p.width,d:q?p.width:p.depth,pavilionProfile:g.profile});
  }
  f.userData.pavilion={id:g.id,profile:g.profile,name,source:g.source,surveySource:g.surveySource,facing:g.facing,sourceFacing:g.sourceFacing,
    storeys:[{level:1,bays:9,depthBays:3,width:lo.width,depth:lo.depth,floorY:lo.floorY,height:lo.height,columnXs:lo.columnXs,columnZs:lo.columnZs},
      {level:2,bays:7,enclosureIntervals:9,width:up.width,depth:up.depth,floorY:up.floorY,height:up.height,frontGrid:up.front,rearGrid:up.rear}],
    balcony:{width:g.gallery.width,depth:g.gallery.depth,floorY:up.floorY,supports:24,sides:4,access:'no-verified-stair',front:g.gallery.front,rear:g.gallery.rear,deck:g.deck},
    openings:{lowerDoorLeaves:2,lowerWindowBays:6,lowerBlockedEndBays:[0,8],upperFrontLeaves:28,upperClosedEndBays:[0,8],lowerDoor:enter?'open-for-playable-route':'closed-reference-state'},
    dimensions:{status:'mixed-evidence',measurements:g.measurements,assumptions:g.assumptions,officialOverallHeight:g.measurements.overview_height.value,generatedTopY:roof.userData.topY,currentCondition2026Accepted:false},
    elevations:g.elevations,waist:g.waist,platform:g.platform,frontFlights:g.frontFlights,approaches:g.approaches,roomBounds:g.roomBounds,sideConnections:g.sideConnections,interface:g.interface,
    rearAcceptance:'UNKNOWN_2026',visitorPolicy:'Playable lower entry is a game choice, not museum access permission.'};
  const renderGeometry=prunePavilionCoveredFaces(f,renderBoxes);
  return {f,group:f,PW:p.width,PD:p.depth,top:p.y,geometry:g,renderGeometry};
}

/** Extruded four-point floor/deck, preserving the unequal enclosure lines. */
function slabPolygon(poly,y0,y1) {
  const shape=new THREE.Shape();poly.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:y1-y0,bevelEnabled:false,steps:1});
  geo.rotateX(-Math.PI/2);geo.translate(0,y0,0);return geo;
}

function rampWedge(kit,f,role,x0,x1,z0,z1,y0,y1,material) {
  const pos=[x0,y0,z0,x1,y0,z0,x0,y1,z1,x1,y1,z1,x0,y0,z1,x1,y0,z1];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setIndex([0,2,1,1,2,3,0,4,2,1,3,5,4,5,3,4,3,2,0,1,5,0,5,4]);
  geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1,0,0,1,0],2));geo.computeVertexNormals();
  return tag(kit.mesh(f,geo,kit.lib.material(material),0,0,0),role);
}

/** Low-detail stone guard, using existing shared materials and no new draw call. */
function railing(kit,f,a,b,data={},renderBoxes) {
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start),len=delta.length(),n=Math.max(1,Math.ceil(len/2.6));
  for(let i=0;i<=n;i++){
    const p=start.clone().lerp(end,i/n);
    const post=tag(kit.box(f,'marble',.24,.9,.24,p.x,p.y+.45,p.z),data.role??'stone-guard',data);renderBoxes.push(post);
    tag(kit.mesh(f,new THREE.SphereGeometry(.15,5,3),kit.lib.material('marble'),p.x,p.y+.95,p.z),'guard-finial',data);
  }
  for(const y of [.26,.7]) {
    const mid=start.clone().lerp(end,.5);mid.y+=y;
    const beam=tag(kit.box(f,'marble',.14,.14,len,mid.x,mid.y,mid.z),'stone-guard-beam',data);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());renderBoxes.push(beam);
  }
  const pieces=Math.max(1,Math.ceil(len/.35));
  for(let i=0;i<pieces;i++){
    const p=start.clone().lerp(end,i/pieces),q=start.clone().lerp(end,(i+1)/pieces);
    kit.col(f,Math.min(p.x,q.x)-.1,Math.min(p.y,q.y),Math.min(p.z,q.z)-.1,Math.max(p.x,q.x)+.1,Math.max(p.y,q.y)+.95,Math.max(p.z,q.z)+.1);
  }
}

/** An annular four-slope waist roof; no fake full floor in its empty centre. */
function buildSkirt(kit,f,p) {
  const group=part(f,'lower-eave-skirt');
  const corners=(w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
  const inner=corners(p.innerWidth,p.innerDepth),outer=corners(p.width,p.depth);
  const point=(side,u,t,inset=0)=>{
    const next=(side+1)%4,lerp=THREE.MathUtils.lerp;
    return [lerp(lerp(inner[side][0],inner[next][0],u),lerp(outer[side][0],outer[next][0],u),t),
      lerp(p.innerY,p.outerY,.6*t+.4*t*t)+.24*Math.pow(Math.abs(2*u-1),8)*t*t-inset,
      lerp(lerp(inner[side][1],inner[next][1],u),lerp(outer[side][1],outer[next][1],u),t)];
  };
  for(let side=0;side<4;side++) {
    for(const [mat,under]of [['roof_tile',false],['rafters',true]]) {
      const positions=[],uv=[],indices=[],cols=12,rows=4;
      for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
        positions.push(...point(side,col/cols,row/rows,under?.16:0));uv.push(col/cols*(side%2?p.depth:p.width)/kit.lib.tileSize(mat),row/rows*3);
      }
      for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
        const a=row*(cols+1)+col,b=a+1,c=a+cols+1,d=c+1;indices.push(...(under?[a,c,b,b,c,d]:[a,b,c,b,d,c]));
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
      tag(kit.mesh(group,geo,kit.lib.material(mat),0,0,0),under?'skirt-soffit':'skirt-slope',{side});
    }
    const points=Array.from({length:7},(_,i)=>new THREE.Vector3(...point(side,0,i/6)));
    kit.mesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),8,.1,4,false),kit.ridge,0,.07,0);
  }
  return group;
}
