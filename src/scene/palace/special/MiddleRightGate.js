import {middleRightRoofOptions,MIDDLE_RIGHT_ROOF} from './MiddleRightRoofProfile.js';
import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='FC-85E0528ECA', MODE='own-three-bay-end-aisles';
const AXES=Object.freeze([-8.2,-6.35,-2.5,2.5,6.35,8.2]);
const tag=(o,role)=>{o.name=`middle-right:${role}`;o.userData.role=role;return o;};
/** Own1665/1623/1615 full cubes. Dimensions are coupled engineering fits,
 * never survey measurements; only this original object may consume them. */
export function middleRightGateGeometry(item,zoneId,index){
 if(item.kind!=='gate'||zoneId!=='axis-courts'||index!==14||item.name!=='中右门'||item.x!==80||item.z!==-12.2||item.style!=='hall'||item.rot!==undefined||item.gateProfile!==undefined||item.middleRightGate!==MODE||item.open!==undefined&&typeof item.open!=='boolean')throw Error('Invalid own middle-right gate binding');
 return {id:ID,profile:MODE,x:80,z:-12.2,rot:0,width:16.4,depth:6.4,columnAxes:[...AXES],floorY:2.6,northPorchY:2.36,columnTopY:7.05,doorPlane:1.6,doorClearWidth:3.0,doorHeight:3.7,doorOpenAngle:125*Math.PI/180,doorFit:'OWN_NEAR_LEAF_EDGE_COUPLED_ENGINEERING_NOT_MEASURED_ANGLE',open:item.open!==false,
  ramps:[{side:'south',halfWidth:5.45,railCenter:5.2,zTop:-3.6,zToe:-23.9,yTop:2.6},{side:'north',halfWidth:5.05,railCenter:4.8,zTop:3.6,zToe:20.1,yTop:2.36}],
  sourceViews:['1665','1623','1615'],dimensionStatus:'OWN_PHOTO_COUPLED_ENGINEERING_FIT_NOT_SURVEY',wholeObjectAccepted:false};
}
export function buildMiddleRightGate(kit,item,zoneId,index){
 const g=middleRightGateGeometry(item,zoneId,index),f=kit.frame(g.x,g.z,0);f.name='中右门';f.userData.gateGeometry=g;f.userData.structure={id:`axis-courts/items/${index}`,objectId:ID,profile:MODE,wholeObjectAccepted:false,dimensionStatus:g.dimensionStatus,sourceViews:g.sourceViews};
 const color=(name,hex)=>{const m=new T.MeshStandardMaterial({name,color:hex,roughness:.92});kit.owned.push(m);return m;};
 const ochre=color('middle_right_north_ochre',0x987653),edge=color('middle_right_north_blue_border',0x42685f);
 const box=(role,mat,w,h,d,x,y,z,parent=f)=>tag(typeof mat==='string'?kit.box(parent,mat,w,h,d,x,y,z):kit.mesh(parent,new T.BoxGeometry(w,h,d),mat,x,y,z),role);
 const solid=(role,mat,w,h,d,x,y,z,{overhead=false}={})=>{const m=box(role,mat,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);if(overhead){const b=kit.colliders.at(-1);b.overhead={type:'piecewise-linear-x',sourceId:`middle-right:${role}`,points:[[b.min.x,b.min.y],[b.max.x,b.min.y]],minZ:b.min.z,maxZ:b.max.z,topY:b.max.y};}return m;};
 const platform=(role,x0,x1,z0,z1,y0,y1)=>{solid(role,'wall_brick',x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);box(`${role}-paving`,'stone_slab',x1-x0,.04,z1-z0,(x0+x1)/2,y1-.02,(z0+z1)/2);kit.walkBox(f,x0,z0,x1,z1,y1);};
 // One real lower platform, raised hall only to the south of the north door.
 // North exterior paving is lower; no invisible full-height slab bridges it.
 platform('lower-platform',-8.4,8.4,-3.6,3.6,0,g.northPorchY);
 platform('raised-hall',-8.4,8.4,-3.6,g.doorPlane,g.northPorchY,g.floorY);
 platform('north-stone-threshold',-2.1,2.1,g.doorPlane,g.doorPlane+.08,g.northPorchY,g.floorY); // one minimal low edge; strip count does not prove three historical steps
 // The photo's central removable board remains a distinct modern piece, not
 // permanent ancient masonry or a courtyard-wide rescue plane.
 const board=tag(kit.mesh(f,wedge(-.48,.48,g.doorPlane-.08,g.doorPlane+.68,g.floorY+.015,g.northPorchY+.015,g.northPorchY-.015),color('middle_right_modern_board',0x77766b),0,0,0),'north-removable-board');
 board.userData.historicalFabric=false;registerRampBody(kit,f,-.48,.48,g.doorPlane-.08,g.doorPlane+.68,g.floorY+.015,g.northPorchY+.015,g.northPorchY-.015);kit.walkRamp(f,-.48,.48,g.doorPlane-.08,g.doorPlane+.68,g.floorY+.015,g.northPorchY+.015);
 for(const r of g.ramps){const m=tag(kit.mesh(f,wedge(-r.halfWidth,r.halfWidth,r.zTop,r.zToe,r.yTop,0,0),kit.lib.material('stone_slab'),0,0,0),`${r.side}-full-ramp`);registerRampBody(kit,f,-r.halfWidth,r.halfWidth,r.zTop,r.zToe,r.yTop,0,0);kit.walkRamp(f,-r.halfWidth,r.halfWidth,r.zTop,r.zToe,r.yTop,0);}
 // Front/back six axes; the central north doorway has its own two visible
 // round supports. Do not invent a hidden third complete six-column row.
 const colGeo=new T.CylinderGeometry(.25,.27,g.columnTopY-g.floorY,12);
 for(const z of[-3.2,3.2])for(const x of AXES){const base=z>0?g.northPorchY:g.floorY;solid('column-stone-foot','stone_slab',.66,g.floorY-base+.12,.66,x,base+(g.floorY-base+.12)/2,z);tag(kit.mesh(f,colGeo,kit.lib.material('wood_column'),x,(g.floorY+g.columnTopY)/2,z),'main-column');kit.col(f,x-.27,base,z-.27,x+.27,g.columnTopY,z+.27);}
 for(const x of[-2.5,2.5]){tag(kit.mesh(f,colGeo,kit.lib.material('wood_column'),x,(g.floorY+g.columnTopY)/2,g.doorPlane),'north-door-column');kit.col(f,x-.27,g.floorY,g.doorPlane-.27,x+.27,g.columnTopY,g.doorPlane+.27);}
 for(const z of[-3.2,3.2])solid('front-back-painted-beam','caihua_beam',16.8,.6,.42,0,g.columnTopY-.3,z,{overhead:true});
 for(const side of[-1,1]){
  const x=side*4.425;
  // North solid face is the room boundary, not a full-depth passage divider.
  solid('north-brick-foot','wall_brick',3.65,.75,.30,x,g.northPorchY+.375,g.doorPlane);
  solid('north-solid-panel',ochre,3.65,g.columnTopY-g.northPorchY-.75,.26,x,(g.columnTopY+g.northPorchY+.75)/2,g.doorPlane);
  for(const dx of[-1,1])box('north-blue-border',edge,.055,3.45,.03,x+dx*1.77,g.northPorchY+2.45,g.doorPlane+.145);
  // Main room end returns and a real masonry barrier across each narrow aisle
  // retain the courtyard separation; the two narrow bays are not extra portals.
  solid('room-end-return',ochre,.26,g.columnTopY-g.floorY,4.45,side*6.35,(g.columnTopY+g.floorY)/2,-.625);
  solid('narrow-aisle-firewall','wall_red',1.85,7-g.northPorchY,.6,side*7.275,(7+g.northPorchY)/2,0);
  solid('short-entry-return',ochre,.22,g.columnTopY-g.floorY,.55,side*2.33,(g.columnTopY+g.floorY)/2,g.doorPlane+.275);
  addSouthWindow(kit,f,box,x,g.floorY);
 }
 // Own near-view hardware identifies the outer visible edge as the free
 // edge. This coupled narrower frame / over-open leaf family matches both
 // face width and visibility;125deg is engineering, not a measured angle.
 const doorHalf=g.doorClearWidth/2,leafWidth=doorHalf-.02;
 for(const side of[-1,1]){
  solid('door-jamb','wood_column',.20,g.doorHeight+.20,.30,side*(doorHalf+.1),g.floorY+(g.doorHeight+.20)/2,g.doorPlane);
  const inner=doorHalf+.2,outer=2.6,x=side*(inner+outer)/2;
  solid('fixed-door-side-stone-foot','wall_brick',outer-inner,g.floorY-g.northPorchY,.30,x,(g.floorY+g.northPorchY)/2,g.doorPlane);
  solid('fixed-red-door-side-frame','wood_column',outer-inner,g.columnTopY-g.floorY,.26,x,(g.columnTopY+g.floorY)/2,g.doorPlane);
 }
 solid('north-door-head','wood_column',g.doorClearWidth+.4,.28,.36,0,g.floorY+g.doorHeight+.14,g.doorPlane,{overhead:true});
 solid('north-door-upper-panel','wall_red',g.doorClearWidth+.4,g.columnTopY-(g.floorY+g.doorHeight+.28),.30,0,(g.columnTopY+g.floorY+g.doorHeight+.28)/2,g.doorPlane,{overhead:true});
 for(const side of[-1,1]){
  const leaf=tag(new T.Group(),'door-leaf');leaf.position.set(side*doorHalf,g.floorY,g.doorPlane);leaf.rotation.y=g.open?side*g.doorOpenAngle:0;f.add(leaf);
  const panel=box('door-red-body',kit.lacquer,leafWidth,g.doorHeight,.14,-side*leafWidth/2,g.doorHeight/2,0,leaf);
  const front=tag(kit.mesh(leaf,new T.PlaneGeometry(leafWidth,g.doorHeight),kit.lib.material('door_studded'),-side*leafWidth/2,g.doorHeight/2,-.071),'door-south-studded-face');front.rotation.y=Math.PI;front.userData.scope='OWN_SOUTH_FACE_OPENING_NORTH_NOT_MIRRORED_BACK';
  // An oblique leaf cannot use its broad AABB as the solid: that would
  // block the source-visible side air. Register its actual closed box mesh.
  registerTriangles(kit,f,[panel],`door-leaf:${side}`);
 }
 addOwnRoof(kit,f,g,box,solid);
 addOwnRails(kit,f,g);
 kit.mapRect(f,'gate',item.name,16.8,7.2,{objectId:ID,wholeObjectAccepted:false});
 for(const r of g.ramps)kit.mapRect(f,'walkway',`${item.name}${r.side==='north'?'北':'南'}慢道`,r.halfWidth*2,Math.abs(r.zToe-r.zTop),{objectId:ID,z:g.z+(r.zTop+r.zToe)/2});
 return {width:g.width,geometry:g,frame:f};
}
function addOwnRails(kit,f,g){
 const mat=kit.lib.material('marble');
 const add=(parent,geo,role,x=0,y=0,z=0)=>tag(kit.mesh(parent,geo,mat,x,y,z),role);
 for(const r of g.ramps){const sign=Math.sign(r.zToe-r.zTop),at=z=>r.yTop*Math.max(0,Math.min(1,1-(z-r.zTop)/(r.zToe-r.zTop))),first=r.zTop,last=r.zToe-sign*.85,stations=Array.from({length:10},(_,i)=>first+(last-first)*i/9);
  for(const hand of[-1,1]){const x=hand*r.railCenter;
   for(const [i,z]of stations.entries()){
    const post=tag(new T.Group(),'main-rail-post');post.position.set(x,at(z),z);post.userData.middleRightRail={side:r.side,hand,kind:'post',station:i};f.add(post);
    const parts=[add(post,new T.BoxGeometry(.34,.14,.34),'rail-post-foot',0,.07,0),add(post,new T.BoxGeometry(.22,.80,.22),'rail-post-stem',0,.54,0)];
    // Own near-rail views show a swollen lotus/bulb outline, not a bare
    // cone. Coarse turned profile only: no invented petal/relief census.
    const crown=new T.LatheGeometry([[0,.94],[.12,.94],[.145,.98],[.115,1.02],[.145,1.065],[.11,1.12],[0,1.17]].map(([r,y])=>new T.Vector2(r,y)),8);parts.push(add(post,crown,'rail-post-coarse-crown'));
    registerTriangles(kit,f,parts,`${r.side}:${hand}:post:${i}`);
   }
   for(let i=0;i<9;i++){
    const a=stations[i],b=stations[i+1],parts=[],strip=(role,za,zb,lo,hi,t)=>{const sh=new T.Shape();sh.moveTo(-za,at(za)+lo);sh.lineTo(-zb,at(zb)+lo);sh.lineTo(-zb,at(zb)+hi);sh.lineTo(-za,at(za)+hi);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:t,steps:1,bevelEnabled:false});geo.rotateY(Math.PI/2);geo.translate(x-t/2,0,0);const m=add(f,geo,role);parts.push(m);return m;};
    strip('rail-bottom-plinth',a,b,0,.16,.27);strip('rail-lower-solid-panel',a,b,.16,.53,.18);strip('rail-middle-band',a,b,.53,.59,.22);strip('rail-upper-coping',a,b,.82,.93,.25);
    // Own near-side photos show one bottle-like middle support and half
    // brackets at the two ends, not a pair of equally spaced straight bars.
    const shaped=(role,z,points)=>{const sh=new T.Shape();for(const[i,[along,height]]of points.entries()){const zz=z+sign*along,yy=at(zz)+height;if(i)sh.lineTo(-zz,yy);else sh.moveTo(-zz,yy);}sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:.16,steps:1,bevelEnabled:false});geo.rotateY(Math.PI/2);geo.translate(x-.08,0,0);parts.push(add(f,geo,role));};
    shaped('rail-central-shaped-support',(a+b)/2,[[-.10,.59],[.10,.59],[.10,.63],[.055,.67],[.065,.72],[.13,.78],[.13,.82],[-.13,.82],[-.13,.78],[-.065,.72],[-.055,.67],[-.10,.63]]);
    const half=[[0,.59],[.06,.59],[.08,.64],[.13,.69],[.22,.73],[.26,.78],[.26,.82],[0,.82]];
    shaped('rail-end-shaped-bracket',a,half);shaped('rail-end-shaped-bracket',b,half.map(([z,y])=>[-z,y]));
    registerTriangles(kit,f,parts,`${r.side}:${hand}:panel:${i}`);
   }
   const terminal=tag(new T.Group(),'rail-scroll-terminal');terminal.userData.middleRightRail={side:r.side,hand,kind:'scroll'};f.add(terminal);
   const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(0,.96);sh.bezierCurveTo(.16,.98,.30,.91,.34,.76);sh.bezierCurveTo(.43,.88,.59,.76,.60,.54);sh.bezierCurveTo(.62,.30,.72,.19,.91,.08);sh.lineTo(.91,0);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:.18,steps:1,bevelEnabled:false,curveSegments:5});geo.rotateY(-sign*Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i)+last;p.setXYZ(i,p.getX(i)+x+sign*.09,p.getY(i)+at(z),z);}geo.computeVertexNormals();const m=add(terminal,geo,'coarse-scroll-body');registerTriangles(kit,f,[m],`${r.side}:${hand}:scroll`);
   // Visible horizontal return topology only. Its hidden individual bay census
   // is not manufactured from a spacing formula or counted with the 9 main bays.
   const a=x,b=hand*8.15,y=r.yTop,z=r.zTop,parts=[];for(const[low,high,t]of[[.12,.53,.18],[.82,.93,.24]])parts.push(add(f,new T.BoxGeometry(Math.abs(b-a),high-low,t),'platform-return-visible-band',(a+b)/2,y+(low+high)/2,z));registerTriangles(kit,f,parts,`${r.side}:${hand}:platform-return`);
  }
 }
 f.userData.railEvidence={mainSequences:'four independently counted own sequences',mainBaysPerRun:9,mainPostsPerRun:10,scrollPerRun:1,returnCensus:'occluded/unverified',carving:'coarse solid lower/open upper type, not relief replication'};
}
function addOwnRoof(kit,f,g,box,solid){
 const roof=tag(kit.roof(f,middleRightRoofOptions()),'own-complete-roof'),tiles=[],ridges=[];roof.traverse(m=>{if(!m.isMesh)return;if(m.material===kit.lib.material('roof_tile'))tiles.push(m);if(m.material===kit.ridge)ridges.push(m);});
 if(!tiles.length)throw Error('Own middle-right roof missing tile shell');
 const shell=new T.Group();tag(shell,'own-roof-inner-shell');f.add(shell);
 for(const mesh of tiles){const geo=mesh.geometry.clone();if(!geo.index)geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));const ix=geo.index;for(let i=0;i<ix.count;i+=3){const a=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,a);}geo.translate(0,-.15,0);geo.computeVertexNormals();const m=tag(kit.mesh(shell,geo,kit.lib.material('rafters'),0,0,0),'inner-sloped-roof-lining');m.applyMatrix4(mesh.matrix);}
 // Only visible coarse transverse/longitudinal member types; no hidden joint census.
 for(const z of[-2.7,0,2.7])solid('visible-transverse-frame','caihua_beam',12.7,.26,.30,0,g.floorY+4.58,z,{overhead:true});
 for(const x of[-2.5,2.5])solid('visible-longitudinal-frame','caihua_beam',.26,.24,6.4,x,g.floorY+5.0,0,{overhead:true});
 const p=MIDDLE_RIGHT_ROOF,coefficient=t=>.48*(1-t)+.52*(1-t)*(1-t);
 for(let x=-6.3;x<=6.3+.01;x+=.42)for(const sign of[-1,1]){const points=[];for(let i=0;i<=8;i++){const z=sign*(.1+(p.eaveHalfDepth-.12)*i/8),t=Math.abs(z)/p.eaveHalfDepth;points.push(new T.Vector3(x,p.eaveY+(p.ridgeY-p.eaveY)*coefficient(t)-.23,z));}tag(kit.mesh(f,new T.TubeGeometry(new T.CatmullRomCurve3(points),8,.045,4,false),kit.lib.material('wood_column'),0,0,0),'visible-coarse-rafter');}
 roof.userData.sourceFit={objectId:g.id,metric:'conditional not surveyed',cornerWalkingBeasts:'not reconstructed; counts/species unverified',interior:'visible coarse layers only, no hidden joints'};
 registerTriangles(kit,f,tiles,'actual-roof-tile-surface');
 // Each visible ridge/cap/chiwen is its own real mesh owner: never replace the
 // complete roof envelope by a solid AABB or leave raised ornament bodies ghosted.
 if(!ridges.length)throw Error('Own middle-right roof missing visible ridge solids');
 for(const [i,mesh] of ridges.entries())registerTriangles(kit,f,[mesh],`actual-roof-ridge:${i}`);
}
function addSouthWindow(kit,f,box,x,floor){
 const z=-2.9,w=3.65;box('south-window-brick-foot','wall_brick',w,.55,.26,x,floor+.275,z);box('south-window-bottom-panel','wood_column',w,.38,.18,x,floor+.74,z);
 for(const dx of[-1,1])box('south-window-frame','wood_column',.12,3.6,.20,x+dx*(w/2-.06),floor+2.2,z);
 for(const y of[1.0,3.05,3.20,3.80])box('south-window-cross-frame','wood_column',w,.10,.20,x,floor+y,z);
 const grid=(cx,cy,width,height,diagonal)=>{
  for(const s of[-1,1])box('south-window-light-frame','wood_column',.065,height,.17,cx+s*width/2,cy,z);
  if(!diagonal){for(let dx=-width/2+.09;dx<width/2;dx+=.13)box('south-window-straight-grid','wood_column',.024,height,.06,cx+dx,cy,z);for(let dy=-height/2+.09;dy<height/2;dy+=.16)box('south-window-straight-grid','wood_column',width,.024,.06,cx,cy+dy,z);}
  else for(const slope of[-1,1])for(let b=-height/2-width/2+.1;b<height/2+width/2;b+=.18){const lo=Math.max(-width/2,slope===1?-height/2-b:b-height/2),hi=Math.min(width/2,slope===1?height/2-b:b+height/2);if(hi<=lo)continue;const m=box('south-window-diamond-grid','wood_column',(hi-lo)*Math.SQRT2,.022,.06,cx+(lo+hi)/2,cy+slope*(lo+hi)/2+b,z);m.rotation.z=slope*Math.PI/4;}
 };
 for(const[i,dx]of[-1.15,0,1.15].entries()){grid(x+dx,floor+2.025,.99,1.95,i!==1);grid(x+dx,floor+3.5,.99,.50,true);}
 kit.col(f,x-w/2,floor,z-.14,x+w/2,floor+3.85,z+.14);
}
function registerRampBody(kit,f,left,right,a,b,ya,yb,bottom){
 // Analytic walkRamp is the actual visible top. Ordinary inscribed body cells
 // remain entirely BELOW that plane and use existing low-step clearance;
 // triangle-body foot boxes would intersect an ascending sloped floor itself.
 const n=Math.ceil(Math.abs(b-a)/.25);
 for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,z0=a+(b-a)*t0,z1=a+(b-a)*t1,top=Math.min(ya+(yb-ya)*t0,ya+(yb-ya)*t1);if(top>bottom+1e-7)kit.col(f,left,bottom,z0,right,top,z1);}
}
function registerTriangles(kit,f,meshes,id){f.updateMatrixWorld(true);const values=[];for(const m of meshes){const p=m.geometry.attributes.position,ix=m.geometry.index,v=new T.Vector3();for(let i=0;i<(ix?.count??p.count);i+=3){const tri=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld));if(new T.Triangle(...tri).getArea()<1e-12)continue;for(const q of tri)values.push(q.x,q.y,q.z);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(values,3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`middle-right:${id}`),b=owner.box.clone();b.triangleSupport=owner;kit.colliders.push(b);}finally{g.dispose();}}
function wedge(left,right,zTop,zToe,yTop,yToe,bottom){
 const a=[left,yTop,zTop],b=[right,yTop,zTop],c=[right,yToe,zToe],d=[left,yToe,zToe],aa=[left,bottom,zTop],bb=[right,bottom,zTop],cc=[right,bottom,zToe],dd=[left,bottom,zToe],pos=[],uv=[];
 const face=(points,normal)=>{for(let i=1;i<points.length-1;i++){let q=[points[0],points[i],points[i+1]],n=new T.Vector3().subVectors(new T.Vector3(...q[1]),new T.Vector3(...q[0])).cross(new T.Vector3().subVectors(new T.Vector3(...q[2]),new T.Vector3(...q[0])));if(n.lengthSq()<1e-16)continue;if(n.dot(new T.Vector3(...normal))<0)q=[q[0],q[2],q[1]];for(const v of q){pos.push(...v);uv.push(v[0]/2,(Math.abs(normal[1])>.5?v[2]:v[1])/2);}}};
 const s=Math.sign(zToe-zTop);face([a,b,c,d],[0,1,0]);face([aa,dd,cc,bb],[0,-1,0]);face([a,aa,bb,b],[0,0,-s]);face([d,c,cc,dd],[0,0,s]);face([a,d,dd,aa],[-1,0,0]);face([b,bb,cc,c],[1,0,0]);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return geo;
}
