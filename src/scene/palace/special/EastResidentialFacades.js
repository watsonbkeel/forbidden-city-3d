import {fitCanopyToMainRoof} from './CanopyRoofSurfaceJoint.js';
import * as THREE from 'three';
const page=n=>`https://www.dpm.org.cn/explore/building/${n}.html`;
const photo=(date,file)=>`https://img.dpm.org.cn/Uploads/Picture/${date}/${file}.jpg`;
export const EAST_FACADE_PROFILES=Object.freeze({
 'jingren-rear-entry':{name:'景仁宫',x:-93.4,z:331,w:28,d:13.7,source:page(236509),rearEntry:true,rearGlazingSource:'https://www.dpm.org.cn/Uploads/File/2020/08/03/u5f27ba6cdb98c.pdf'},
 'zhongcui-front-veranda':{name:'钟粹宫',x:-93.4,z:433.2,w:28.6,d:15.2,source:page(236484),frontInset:2.0,photoSource:photo('2020/04/17','s5e99847e500e7')},
 'yonghe-open-baoxia':{name:'永和宫',x:-149,z:379.1,w:27.8,d:12,source:page(236518),openCanopy:true,photoSource:photo('2020/04/20','s5e9d39e4779a2'),undersidePhoto:photo('2020/04/20','s5e9d39e47b346')},
});
const tag=(o,role,data={})=>{o.name=role;Object.assign(o.userData,{role,...data});return o;};
export function eastFacadeProfile(item){
 const p=EAST_FACADE_PROFILES[item.facadeProfile];
 if(!p||item.structure!=='east-residential-facade'||item.kind!=='hall'||item.name!==p.name)throw Error('East facade identity mismatch');
 for(const[k,v]of Object.entries({x:p.x,z:p.z,w:p.w,d:p.d,pad:.8,ph:.6,colH:6.72,bays:5}))if(item[k]!==v)throw Error(`East facade retained envelope mismatch: ${k}`);
 if(item.rot!==undefined||item.backDoor||item.roomBays||item.enter!==true||item.throne!==true||item.roof!=='xieshan')throw Error('East facade requires its retained south-facing five-bay shell');
 return{...p,id:'east-six/'+item.facadeProfile,profile:item.facadeProfile,photographyDate:null,dimensionStatus:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED',furnitureStatus:'RETAINED_GENERIC_SEAT_SHAPE_UNVERIFIED',targetState:'OFFICIAL_TEXT_AND_UNDATED_MUSEUM_PHOTO_PARTIAL_RELATIONSHIPS',doorPose:'FITTED_VIEWING_ACCESS_NOT_HISTORICAL_OR_CURRENT_POSE',seatPlacementStatus:p.rearEntry?'FITTED_GAME_ACCESS_CLEARANCE_NOT_HISTORICAL_COORDINATE':'RETAINED_UNVERIFIED_GENERIC_PLACEMENT'};
}
function owned(kit,name,color,extra={}){const m=new THREE.MeshStandardMaterial({name,color,roughness:.8,...extra});kit.owned.push(m);return m;}
function box(kit,parent,role,mat,w,h,d,x,y,z,data={}){return tag(kit.mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z),role,data);}
function windowBuilder(kit,p){
 const wood=kit.lib.material('wood_column');
 const panel=p.rearEntry?owned(kit,'jingren_retained_glazing_fit',0xb7c4c3,{transparent:true,opacity:.42,roughness:.35,depthWrite:false}):owned(kit,'east_plain_window_panel_fit',0xd7d4c4);
 return({f,x,z,width,height,floorY,side})=>{
  if(p.rearEntry?side<0:side>0)return false;
  const group=tag(new THREE.Group(),p.rearEntry?'jingren-rear-glazed-fit':'east-facade-sill-window',{source:p.rearEntry?p.rearGlazingSource:p.source,photoSource:p.photoSource??null,localZ:z,photographyDate:null,dimensionStatus:p.dimensionStatus,patternStatus:p.rearEntry?'PLAIN_RECTANGULAR_GLAZING_FIT_NOT_MIRRORED_FRONT_LATTICE':'SILL_UPPER_RECTILINEAR_FRAME_FIT_NOT_EXACT_PATTERN_OR_PAINTING'});f.add(group);
  const sill=.9,panelH=height-sill,mid=floorY+sill+panelH/2;
  box(kit,group,'east-window-masonry-sill',kit.lib.material('wall_brick'),width,sill,.24,x,floorY+sill/2,z);
  box(kit,group,'east-window-plain-panel',panel,width-.12,panelH-.12,.055,x,mid,z);
  for(const sx of[-1,1])box(kit,group,'east-window-jamb',wood,.10,panelH,.15,x+sx*(width-.1)/2,mid,z-.025);
  for(const yy of[floorY+sill+.05,floorY+height-.05])box(kit,group,'east-window-frame-rail',wood,width,.10,.15,x,yy,z-.025);
  if(p.rearEntry){
   // Rectangular glazing is separately documented in the restoration paper;
   // its exact rear elevation is not known and is not copied from the front.
   for(const sx of[-1,1])box(kit,group,'jingren-rear-plain-mullion',wood,.07,panelH,.12,x+sx*width/6,mid,z-.04);
   box(kit,group,'jingren-rear-plain-transom',wood,width,.07,.12,x,mid,z-.04);
  }else{
   const split=floorY+sill+panelH*.46;
   box(kit,group,'east-window-section-rail',wood,width,.12,.15,x,split,z-.04);
   // Only the upper zone gets a rectilinear stepped-frame interpretation.
   // Pale lower artwork and exact bubujin / prop-up hardware are not invented.
   const upperH=floorY+height-.12-split;
   for(let col=0;col<3;col++){
    const cx=x+(col-1)*width/3,ww=width/3-.14;
    for(const inset of[0,.14]){
     const w=ww-2*inset,h=upperH-.20-2*inset,cy=split+upperH/2;
     for(const sx of[-1,1])box(kit,group,'east-window-upper-frame',wood,.045,h,.10,cx+sx*w/2,cy,z-.07);
     for(const sy of[-1,1])box(kit,group,'east-window-upper-frame',wood,w,.045,.10,cx,cy+sy*h/2,z-.07);
    }
   }
  }
  return true;
 };
}
function plainCeiling(kit,p){
 const paper=owned(kit,'yonghe_plain_ceiling_paper_fit',0xe3ddca),wood=owned(kit,'yonghe_unpainted_grid_fit',0x9a805d);
 return({f,w,d,y,z})=>{
  const g=tag(new THREE.Group(),'east-plain-ceiling',{source:p.source,location:'MAIN_ENCLOSED_ROOM_ONLY',dimensionStatus:p.dimensionStatus,patternStatus:'TEXT_GROUNDED_SCHEMATIC_NOT_MEASURED_GRID'});f.add(g);
  const plane=new THREE.PlaneGeometry(w,d);plane.rotateX(Math.PI/2);tag(kit.mesh(g,plane,paper,0,y,z),'yonghe-main-paper-ceiling');
  for(let i=0;i<=10;i++)box(kit,g,'yonghe-main-ceiling-grid',wood,.075,.06,d,-w/2+i*w/10,y-.035,z);
  for(let i=0;i<=6;i++)box(kit,g,'yonghe-main-ceiling-grid',wood,w,.06,.075,0,y-.035,z-d/2+i*d/6);
 };
}
function curvedSurface(width,z0,z1,eaveY,rise,offset=0,reverse=false){
 const pos=[],uv=[],idx=[],segments=24;
 for(let i=0;i<=segments;i++){
  const t=i/segments,z=z0+(z1-z0)*t,y=eaveY+rise*Math.sin(Math.PI*t)+offset;
  for(const x of[-width/2,width/2]){pos.push(x,y,z);uv.push((x+width/2)/1.2,(z-z0)/1.2);}
 }
 for(let i=0;i<segments;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(...(reverse?[a,b,c,b,d,c]:[a,c,b,b,c,d]));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function openCanopy(kit,f,item,p){
 const g=tag(new THREE.Group(),'yonghe-open-canopy',{source:p.source,photoSource:p.photoSource,undersidePhoto:p.undersidePhoto,photographyDate:null,dimensionStatus:p.dimensionStatus,roofJointStatus:'CONCEALED_JUNCTION_UNKNOWN_FITTED_OVERLAP',interpretation:'OPEN_THREE_BAY_ROUNDED_CANOPY_NO_ENCLOSURE_OR_FLAT_CEILING'});f.add(g);
 const bay=item.w/5,width=bay*3,front=-item.d/2,projection=2.2,columnZ=front-projection,eaveY=item.ph+item.colH*.94,rise=1.25,z0=columnZ-.45,z1=front+.55,roofWidth=width+.8;
 const wood=kit.lib.material('wood_column'),paint=kit.lib.material('caihua_beam');
 for(let i=0;i<4;i++){
  const x=(-1.5+i)*bay,r=.3,h=eaveY-item.ph;
  tag(kit.mesh(g,new THREE.CylinderGeometry(r,r*1.04,h,12),wood,x,item.ph+h/2,columnZ),'yonghe-canopy-column',{dimensionStatus:p.dimensionStatus});
  kit.col(f,x-r,item.ph,columnZ-r,x+r,item.ph+3,columnZ+r);
 }
 box(kit,g,'yonghe-canopy-front-beam',paint,width+.4,.42,.38,0,eaveY-.2,columnZ);
 const samples=16;
 const strip=(x,role,mat,thickness,height)=>{
  for(let j=0;j<samples;j++){
   const t0=j/samples,t1=(j+1)/samples,a={z:z0+(z1-z0)*t0,y:eaveY+rise*Math.sin(Math.PI*t0)-.1},b={z:z0+(z1-z0)*t1,y:eaveY+rise*Math.sin(Math.PI*t1)-.1};
   const m=box(kit,g,role,mat,thickness,height,Math.hypot(b.z-a.z,b.y-a.y)+.015,x,(a.y+b.y)/2-height/2,(a.z+b.z)/2);m.rotation.x=-Math.atan2(b.y-a.y,b.z-a.z);
  }
 };
 for(let i=0;i<=12;i++)strip(-width/2+i*width/12,'yonghe-curved-rafter',paint,.12,.16);
 for(const side of[-1,1])strip(side*roofWidth/2,'yonghe-rounded-bargeboard',wood,.16,.44);
 tag(kit.mesh(g,curvedSurface(roofWidth,z0,z1,eaveY,rise),kit.lib.material('roof_tile'),0,0,0),'yonghe-curved-roof-tiles');
 tag(kit.mesh(g,curvedSurface(roofWidth,z0,z1,eaveY,rise,-.08,true),kit.lib.material('rafters'),0,0,0),'yonghe-curved-roof-underside');
 // Extend the existing platform only south of its old edge: no coplanar slabs
 // over the retained platform, and no phantom room beneath the open canopy.
 const oldEdge=front-item.pad,newEdge=columnZ-.7,platformW=width+1.6,len=oldEdge-newEdge,cz=(oldEdge+newEdge)/2;
 box(kit,g,'yonghe-canopy-platform',kit.lib.material('wall_brick'),platformW,item.ph,len,0,item.ph/2,cz);
 const capJoin=oldEdge-.06; // retained hall cap extends .06 beyond its platform edge
 box(kit,g,'yonghe-canopy-platform-cap',kit.lib.material('stone_slab'),platformW,.08,capJoin-newEdge,0,item.ph-.03,(capJoin+newEdge)/2);
 kit.walkBox(f,-platformW/2,newEdge,platformW/2,oldEdge,item.ph);
 kit.col(f,-platformW/2+.05,0,newEdge+.05,platformW/2-.05,item.ph,oldEdge);
 kit.steps(f,{zEdge:newEdge,dir:-1,y:item.ph,width:4.6});
 g.userData.platformFront=newEdge;g.userData.columnFront=columnZ;g.userData.width=width;
 return g;
}
export function buildEastResidentialFacade(kit,item){
 const p=eastFacadeProfile(item),{structure,facadeProfile,...shell}=item;
 const result=kit.hall({...shell,backDoor:!!p.rearEntry,frontEnclosureInset:p.frontInset??0,frontSteps:!p.openCanopy,panelBuilder:windowBuilder(kit,p),...(p.openCanopy?{ceilingBuilder:plainCeiling(kit,p),plaque:false}:{})});
 if(p.openCanopy){
  const mainRoof=result.f.children.find(m=>m.name.startsWith('roof_')&&m.userData.eaveY!==undefined);
  const canopy=openCanopy(kit,result.f,item,p);
  const roofMeshes=canopy.children.filter(m=>['yonghe-curved-rafter','yonghe-rounded-bargeboard','yonghe-curved-roof-tiles','yonghe-curved-roof-underside'].includes(m.name));
  fitCanopyToMainRoof({hall:result.f,mainRoof,meshes:roofMeshes,capParent:canopy,capMaterial:kit.lib.material('roof_tile')});
  // The official underside view locates the complete board ABOVE the main
  // door head, behind the open baoxia's front beam. That nearer beam can
  // naturally hide the board from the courtyard. It is not the mounting datum.
  const beamH=THREE.MathUtils.clamp(item.colH*.12,.45,.85);
  const doorHeadY=item.ph+(item.colH-beamH)*.8;
  const h=1.5,w=1.05,y=doorHeadY+.08+(h+.12)/2,z=-item.d/2-.42;
  const fit={doorHeadY,completeFrameClearance:.08,canopyEaveY:item.ph+item.colH*.94,
   status:'PHOTO_RELATIONSHIP_WITH_LOCAL_CANOPY_HEIGHT_FIT_NOT_SURVEYED',
   visibilityPolicy:'RETAIN_FRONT_BEAM_OBSTRUCTION_FROM_COURTYARD'};
  kit.plaque(result.f,item.plaqueText??item.name,0,y,z,w,h);
  result.f.userData.nameboardMount={status:'PHOTO_GUIDED_MODEL_FIT_NOT_SURVEYED',
   source:p.source,photo:p.undersidePhoto??'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e47b346.jpg',
   ...fit,position:[0,y,z],width:w,height:h,
   interpretation:'Complete vertical board above the main door head and in front of its painted beam, behind the baoxia front beam; original nameboard size retained and canopy height is a local model fit, not surveyed photo proportions. Chinese-only simplified lettering is not a Manchu/Han facsimile'};
  for(const object of [kit.plaques.at(-1).mesh,kit.plaques.at(-1).frame])
   object.userData.nameboardMount=result.f.userData.nameboardMount;
 }
 result.f.userData.structure={...result.f.userData.structure,...p,...(result.f.userData.nameboardMount?{nameboardMount:result.f.userData.nameboardMount}:{}),frontEnclosureInset:p.frontInset??0,accessStatus:'MODEL_PASSAGE_NOT_HISTORICAL_DOOR_OR_STAIR_MEASUREMENT'};
 return{...result,p};
}
