import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';

const BUILDING='https://www.dpm.org.cn/explore/building/236482.html';
const PAPER='https://img.dpm.org.cn/Uploads/File/2021/11/08/u6188edf18abbd.pdf';
const FIT='REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const tag=(object,role,extra={})=>{object.name=role;Object.assign(object.userData,{role,dimensionStatus:FIT,...extra});return object;};

/** Coordinates are deliberately local, reversible fits, NOT historical drawing
 * dimensions or a survey. +X is west and +Z is north in this application.
 * The registered front footprint/entry is retained; rear access is withheld.
 */
export function yudeGeometry(item){
  if(item?.structure!=='yude-bath-compound'||item.name!=='浴德堂'||item.x!==246||item.z!==-177.2||item.w!==12.7||item.d!==8.2||item.bays!==3||item.ph!==.5||item.pad!==.5||item.colH!==5.12||item.enter!==true||item.throne!==false||(item.rot!==undefined&&item.rot!==0))throw Error('Yude requires its registered three-bay south-facing front hall');
  return {
    id:'yude-bath-compound',x:item.x,z:item.z,
    front:{id:'front-hall',x:0,z:0,w:item.w,d:item.d,bays:3,ph:item.ph,colH:item.colH,roof:'rolled-xieshan'},
    annex:{id:'rear-annex',x:1.85,z:5.6,w:8.8,d:3,bays:2,h:4.15,placementStatus:'HISTORICAL_UNLABELLED_REAR_PROJECTION_INTERPRETED_AS_SHALLOW_ANNEX_FIT',roof:'unverified-simple-covered-connection'},
    northRoom:{id:'north-room',x:2.8,z:17.5,w:5.8,d:4.4,bays:2,h:3.4,roof:'rolled-hard-gable'},
    bath:{id:'square-bath',x:-3.3,z:12,w:5.4,d:5.4,h:3.1,domeRadius:2.55,domeRise:1.65,lanternWidth:1.25,lanternHeight:.65},
    passage:{id:'bent-brick-vault',width:1.55,height:2.65,points:[[-item.w/3,item.d/2],[-item.w/3,7.8],[-3.3,7.8],[-3.3,9.3]],closed:true},
    dimensions:{status:FIT,front:'Retained R36 model envelope; not a measured footprint',rear:'Topology-guided local fit, not dimensions copied from the historical plan'},
    sources:[
      {url:BUILDING,period:'CURRENT_OFFICIAL_DESCRIPTION_UNDATED',facts:['South-facing three-bay front hall with yellow rolled-xieshan roof','Two-bay rear annex and west-offset two-bay north room with rolled-hard-gable roof','Bent brick-vault passage from east secondary bay to square domed bath','West-side well pavilion exists; exact model placement withheld']},
      {url:PAPER,period:'HISTORICAL_1942_DRAWING_REPUBLISHED_2021',pages:[50,51],drawingDates:['1942-01','1942-05'],use:'Topology context only; historical drawings are not a current survey'},
      {url:PAPER,period:'PHOTO_PUBLISHED_2021_PHOTOGRAPHY_DATE_UNKNOWN',pages:[51],use:'Gray low dome, small polygonal glazed lantern, red walls over gray masonry with yellow cap'},
    ],
    accessPolicy:'FRONT_ENTRY_RETAINED_REAR_EXTERIOR_ONLY_NOT_VISITOR_ACCESS',
    unknowns:['Actual rear component dimensions, datum levels and present access','Annex roof form and exact junction geometry','Well pavilion roof and current placement beyond western boundary','Boiler, subterranean furnace, pipes and service circulation remain unmodeled','Bath interior finish is documented but not accessible or furnished in this model'],
  };
}

function sheet(kit,parent,role,material,rows,columns,sample){
  const positions=[],uv=[],indices=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){const p=sample(i/rows,j/columns);positions.push(...p);uv.push(p[0],p[2]);}
  for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){const a=i*(columns+1)+j,b=a+1,c=a+columns+1,d=c+1;indices.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  // Local sheets use outward upper normals; no global DoubleSide material.
  let ny=0;for(let i=0;i<geo.attributes.normal.count;i++)ny+=geo.attributes.normal.getY(i);
  if(ny<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];geo.setIndex(indices);geo.computeVertexNormals();}
  return tag(kit.mesh(parent,geo,material,0,0,0),role);
}

/** Rounded continuous crown, without the generic raised ridge or ridge beasts.
 * Front xieshan has a separate lower hip skirt and upper gable faces; hard-gable
 * ends stop at the wall. Profile proportions are fits, not roof measurements.
 */
function rolledRoof(kit,f,{x,z,w,d,y,rise,type},material){
  const roof=tag(new THREE.Group(),'yude-rolled-roof',{type,hasRaisedRidge:false,source:BUILDING});roof.position.set(x,y,z);f.add(roof);
  const half=d/2,hw=w/2,skirt=type==='rolled-xieshan'?.7:0,breakZ=half*.64,breakY=rise*.36;
  const height=q=>breakY+(rise-breakY)*Math.cos(q*Math.PI/2);
  // Top's tangent is horizontal at Z=0, with continuous tiles across the crown.
  sheet(kit,roof,'yude-rolled-crown',material,20,8,(u,v)=>[(v*2-1)*hw,height(Math.abs(u*2-1)),(u*2-1)*breakZ]);
  for(const s of[-1,1]){
    sheet(kit,roof,'yude-rolled-lower-slope',material,4,8,(u,v)=>[(v*2-1)*(hw+u*skirt),breakY*(1-u),s*(breakZ+u*(half-breakZ+.35))]);
    if(skirt){
      sheet(kit,roof,'yude-xieshan-hip-end',material,4,8,(u,v)=>[s*(hw+u*skirt),breakY*(1-u),(v*2-1)*(breakZ+u*(half-breakZ+.35))]);
    }
    const points=[];for(let i=0;i<=20;i++){const z=(i/20*2-1)*breakZ;points.push(new THREE.Vector2(z,height(Math.abs(z/breakZ))));}if(skirt)points.push(new THREE.Vector2(breakZ,breakY),new THREE.Vector2(-breakZ,breakY));
    else points.push(new THREE.Vector2(half+.35,0),new THREE.Vector2(-half-.35,0));
    const geometry=new THREE.ShapeGeometry(new THREE.Shape(points));geometry.rotateY(Math.PI/2);const wall=tag(kit.mesh(roof,geometry,kit.lib.material('wall_red',{side:THREE.DoubleSide}),s*hw,0,0),'yude-rolled-gable');wall.userData.source=BUILDING;
  }
  return roof;
}

export function buildYudeBath(kit,item){
  const g=yudeGeometry(item),{structure,...plain}=item;
  const {f}=kit.hall({...plain,backDoor:false,interior:'empty',throne:false});
  f.name='浴德堂及后部浴室';f.userData.structure=g;
  // A localized replacement, following the existing Wenyuan builder pattern.
  for(const child of [...f.children])if(child.name.startsWith('roof_')){child.removeFromParent();child.traverse(n=>n.geometry?.dispose());}
  const own=(name,color,roughness=.88)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness});kit.owned.push(m);return m;};
  const grey=own('yude_bath_grey_render',0x747571),stone=kit.lib.material('wall_brick'),red=kit.lib.material('wall_red'),tile=kit.lib.material('roof_tile');
  const glass=own('yude_lantern_pale_glass',0xaabbb8,.3),frame=own('yude_lantern_stone_frame',0xa5a397);
  const box=(role,material,w,h,d,x,y,z,extra={})=>tag(kit.mesh(f,applyBoxUV(new THREE.BoxGeometry(w,h,d),1),material,x,y,z),role,extra);
  rolledRoof(kit,f,{x:0,z:0,w:g.front.w+.45,d:g.front.d+.6,y:g.front.ph+g.front.colH,rise:2.05,type:g.front.roof},tile);
  const closedBlock=(p,role)=>{
    box(role,red,p.w,p.h,p.d,p.x,g.front.ph+p.h/2,p.z,{source:BUILDING,closed:true,bays:p.bays});
    box('yude-grey-masonry-plinth',stone,p.w,g.front.ph+.45,p.d,p.x,(g.front.ph+.45)/2,p.z,{source:PAPER});
    kit.col(f,p.x-p.w/2,0,p.z-p.d/2,p.x+p.w/2,g.front.ph+p.h,p.z+p.d/2);
  };
  closedBlock(g.annex,'yude-rear-annex');
  // No invented annex roof type: conservative covered mass below the retained
  // front eaves; documented as unresolved, not labelled rolled-xieshan.
  box('yude-annex-unverified-cover',tile,g.annex.w+.2,.18,g.annex.d+.2,g.annex.x,g.front.ph+g.annex.h,g.annex.z,{source:BUILDING,fidelity:'UNVERIFIED_COVER_NOT_ROOF_RECONSTRUCTION'});
  closedBlock(g.northRoom,'yude-north-room');
  rolledRoof(kit,f,{...g.northRoom,y:g.front.ph+g.northRoom.h,rise:1.25,type:g.northRoom.roof},tile);
  closedBlock(g.bath,'yude-square-bath');
  // One representative photographed red/gray/yellow wall treatment, confined
  // to the bath shell. Counts, spacing and corner junctions are all fitted.
  // This does not impose one invented plinth ratio on the surrounding court.
  const capY=g.front.ph+g.bath.h,capSpan=g.bath.w+.22,capDepth=.48;
  for(let side=0;side<4;side++){
    const cap=tag(new THREE.Group(),'yude-bath-cap-run',{source:PAPER});
    cap.position.set(g.bath.x,capY,g.bath.z);cap.rotation.y=side*Math.PI/2;f.add(cap);
    const roof=sheet(kit,cap,'yude-bath-wall-cap',tile,4,16,(u,v)=>[(v-.5)*capSpan,.14*(1-Math.abs(u*2-1)),g.bath.d/2+(u-.5)*capDepth]);roof.userData.source=PAPER;
    const count=Math.floor(capSpan/.36),spacing=capSpan/count;
    for(let k=0;k<count;k++){
      const x=-capSpan/2+(k+.5)*spacing,z=g.bath.d/2+capDepth/2;
      const geo=new THREE.CylinderGeometry(.075,.075,.1,8,1,false,0,Math.PI);geo.rotateZ(Math.PI/2);geo.rotateY(Math.PI/2);
      tag(kit.mesh(cap,geo,tile,x,.015,z),'yude-cap-barrel-end',{source:PAPER});
      const shape=new THREE.Shape();shape.moveTo(-spacing*.38,0);shape.quadraticCurveTo(-spacing*.2,-.09,0,-.14);shape.quadraticCurveTo(spacing*.2,-.09,spacing*.38,0);shape.closePath();
      const drip=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false});
      tag(kit.mesh(cap,drip,tile,x+spacing/2,-.015,z-.02),'yude-cap-drip-tile',{source:PAPER});
    }
  }
  // Render a spherical cap without a solid top pole: the small lantern sits
  // above a real circular aperture. Low rise and opening are photo fits.
  const b=g.bath,R=b.domeRadius,H=b.domeRise,opening=b.lanternWidth*.42;
  const sphereR=(R*R+H*H)/(2*H),center=H-sphereR;
  const dome=sheet(kit,f,'yude-bath-dome',grey,14,48,(u,v)=>{const r=opening+(R-opening)*u,a=v*2*Math.PI;return[b.x+r*Math.cos(a),g.front.ph+b.h+center+Math.sqrt(sphereR*sphereR-r*r),b.z+r*Math.sin(a)];});
  dome.userData.source=PAPER;
  const lantern=tag(new THREE.Group(),'yude-bath-lantern',{width:b.lanternWidth,source:PAPER,photographyDate:null});lantern.position.set(b.x,g.front.ph+b.h+H-.02,b.z);f.add(lantern);
  const lr=b.lanternWidth/2,lH=b.lanternHeight;
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,cx=Math.cos(a)*lr,cz=Math.sin(a)*lr;
    tag(kit.mesh(lantern,new THREE.CylinderGeometry(.045,.045,lH,6),frame,cx,lH/2,cz),'yude-lantern-mullion');
    const aa=a+Math.PI/8,window=tag(kit.mesh(lantern,new THREE.PlaneGeometry(2*lr*Math.sin(Math.PI/8),lH*.75),glass,Math.cos(aa)*lr*Math.cos(Math.PI/8),lH/2,Math.sin(aa)*lr*Math.cos(Math.PI/8)),'yude-lantern-window');window.rotation.y=Math.PI/2-aa;
  }
  tag(kit.mesh(lantern,new THREE.CylinderGeometry(lr+.1,lr+.1,.12,8),frame,0,.02,0),'yude-lantern-sill');
  tag(kit.mesh(lantern,new THREE.ConeGeometry(lr+.18,.25,8),frame,0,lH+.12,0),'yude-lantern-cap');
  // Each bent-passage segment is its own footprint, not a giant rear-court
  // collider. Deliberately closed, with no new rear visitor floor/spawn.
  const p=g.passage;
  for(let i=1;i<p.points.length;i++){
    const a=p.points[i-1],b=p.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,alongZ=Math.abs(dz)>Math.abs(dx),w=alongZ?p.width:length,d=alongZ?length:p.width;
    box('yude-brick-vault-passage-base',stone,w,p.height-p.width/2,d,cx,g.front.ph+(p.height-p.width/2)/2,cz,{source:BUILDING,segment:i,closed:true});
    const geom=new THREE.CylinderGeometry(p.width/2,p.width/2,length,16,1,false,0,Math.PI);geom.rotateZ(Math.PI/2);if(alongZ)geom.rotateY(Math.PI/2);
    tag(kit.mesh(f,geom,stone,cx,g.front.ph+p.height-p.width/2,cz),'yude-brick-vault-passage',{segment:i,source:BUILDING});
    kit.col(f,cx-w/2,0,cz-d/2,cx+w/2,g.front.ph+p.height,cz+d/2);
  }
  // The documented east secondary-bay door is represented closed at its
  // source location; the historical topology is not public-access evidence.
  box('yude-east-bay-rear-closed-door',kit.lib.material('lattice_doors'),1.25,2.35,.07,p.points[0][0],g.front.ph+1.175,g.front.d/2-.32,{source:BUILDING,access:'CLOSED_REAR'});
  return{f,g};
}
