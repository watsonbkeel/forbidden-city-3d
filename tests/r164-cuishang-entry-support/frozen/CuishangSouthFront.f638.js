import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
// Own exterior1496: fitted weathered joinery and pierced rail silhouettes.
// Neither the historical photo surface nor plain grids claim current inventory.
export function buildCuishangSouthFront(c){
 const{p}=c,w=p.localW,bw=w/5,front=-p.localD/2+p.gallery,outer=-p.localD/2,h0=p.upperFloorY-p.ph-.35,h1=p.ph+p.colH-p.upperFloorY-.35;
 const weathered=new THREE.MeshStandardMaterial({name:'cuishang_south_weathered_photo_fit',color:0x606454,roughness:.94}),dark=new THREE.MeshStandardMaterial({name:'cuishang_south_dark_field_fit',color:0x2b3027,roughness:.9});c.kit.owned.push(weathered,dark);
 const box=(role,mat,...args)=>{const m=c.box(role,mat,...args);if(['red','wood'].includes(mat))m.material=weathered;if(mat==='glass')m.material=dark;return m;};
 for(const m of c.f.children)if(m.isMesh&&['column','upper-level-frame','eave-beam'].includes(m.userData.role)&&Math.abs(m.position.z-outer)<.01){m.userData.cuishangSouthPhotoTint=true;m.userData.originalMaterialName=m.material.name;m.material=weathered;}

 function rect(role,mat,x,y,z,ww,hh,t=.065){for(const s of[-1,1]){box(role,mat,t,hh,.065,x+s*(ww-t)/2,y,z);box(role,mat,ww,t,.065,x,y+s*(hh-t)/2,z);}}
 for(const upper of[false,true]){const y=upper?p.upperFloorY:p.ph,h=upper?h1:h0;
  for(let i=0;i<5;i++){
   const x=-w/2+(i+.5)*bw,pw=bw-.16;
   if(i===2){
    const dw=Math.min(pw-.14,3.2),dh=Math.min(3.2,h-.35);
    if(!upper){
     for(const s of[-1,1]){box('cuishang-south-door-jamb','red',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);const fill=(pw-dw)/2-.03;box('cuishang-south-door-filler','red',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);}
     for(let n=0;n<4;n++){const sign=n<2?-1:1,xx=sign*(dw/2+.17+(n%2)*.13),zz=front+.35;box('cuishang-south-open-leaf','red',.08,dh,.64,xx,y+dh/2,zz,true);box('cuishang-south-leaf-glass','glass',.014,dh-.45,.49,xx-sign*.05,y+dh/2+.1,zz);}
     box('cuishang-south-door-lintel','red',dw+.24,.18,.18,x,y+dh+.09,front,true);
     const th=h-dh-.18;if(th>0)box('cuishang-south-door-transom','red',dw,th,.14,x,y+dh+.18+th/2,front,true);
    }else for(let n=0;n<4;n++){const cell=pw/4,xx=x-pw/2+(n+.5)*cell;box('cuishang-south-upper-leaf','red',cell-.025,h,.14,xx,y+h/2,front,true);box('cuishang-south-upper-leaf-glass','glass',cell-.11,h*.62,.025,xx,y+h*.64,front-.085);rect('cuishang-south-upper-leaf-frame','red',xx,y+h*.64,front-.12,cell-.08,h*.62+.04);for(let k=1;k<5;k++)box('cuishang-south-upper-leaf-grid','red',cell-.12,.026,.035,xx,y+h*.35+k*h*.57/5,front-.14);}
   }else{
    const sill=.62,split=sill+(h-sill)*.57,top=h-.12;box('cuishang-south-sill','brick',pw,sill,.2,x,y+sill/2,front,true);
    for(const s of[-1,1]){const xx=x+s*pw/4,ww=pw/2-.07;
     box('cuishang-south-window-lower-field','glass',ww,split-sill-.07,.055,xx,y+(sill+split)/2,front,true);
     rect('cuishang-south-window-frame','red',xx,y+(sill+split)/2,front-.065,ww+.03,split-sill);
     box('cuishang-south-window-upper-field','glass',ww,top-split-.06,.055,xx,y+(split+top)/2,front,true);
     rect('cuishang-south-window-frame','red',xx,y+(split+top)/2,front-.065,ww+.03,top-split);
     // Two interlocking plain stepped rectangles, not original exact lattice.
     for(const k of[-1,1])rect('cuishang-south-step-grid','red',xx+k*ww*.19,y+(split+top)/2,front-.12,ww*.54,(top-split)*.67,.025);
    }
   }
  }
 }
 // Four eastern upper galleries remain open; retained west dark-gallery wall
 // stays unaltered. Five apertures per panel are a fit, not counted originals.
 for(let i=0;i<4;i++){
  const ww=bw-.35,x=-w/2+(i+.5)*bw,yy=p.upperFloorY+.10,z=outer+.08,shape=new THREE.Shape();
  shape.moveTo(-ww/2,0);shape.lineTo(ww/2,0);shape.lineTo(ww/2,.86);shape.lineTo(-ww/2,.86);shape.closePath();
  for(let j=0;j<5;j++){const xx=-ww/2+(j+.5)*ww/5,hw=.20,path=new THREE.Path();path.moveTo(xx-hw,.14);path.lineTo(xx-hw,.50);path.lineTo(xx-.12,.62);path.lineTo(xx-.08,.72);path.lineTo(xx+.08,.72);path.lineTo(xx+.12,.62);path.lineTo(xx+hw,.50);path.lineTo(xx+hw,.14);path.closePath();shape.holes.push(path);}
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false}),m=c.tag(c.kit.mesh(c.f,geo,weathered,x,yy,z),'cuishang-south-perforated-rail',{panel:i,apertureCountStatus:'FIVE_FITTED_HOLES_NOT_ORIGINAL_COUNT'});const parts=[m];
  parts.push(box('cuishang-south-rail-cap','wood',ww+.08,.10,.16,x,yy+.91,z+.05));
  for(const sign of[-1,1])parts.push(box('cuishang-south-rail-post','wood',.13,1,.16,x+sign*ww/2,yy+.5,z+.05));
  // One exact rendered component, never mixed triangle-panel/theoretical-box
  // cap contacts. F32 cap tops must govern the landing height too.
  const faces=[];for(const part of parts){part.userData.panel=i;part.updateWorldMatrix(true,false);const pp=part.geometry.attributes.position,ix=part.geometry.index;for(let j=0;j<(ix?.count??pp.count);j+=3)faces.push({source:{mesh:c.f.children.indexOf(part),triangle:j/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pp,ix?ix.getX(j+k):j+k).applyMatrix4(part.matrixWorld))});}
  const contact=createXiqingSurface(faces,'cuishang-south-panel-'+i),b=contact.box.clone();b.xiqingRoofSurface=contact;b.cuishangSouthRail=i;c.kit.colliders.push(b);

 }
 // Existing west dark-gallery solid owns bounded dispatch, not a new volume.
 const wall=c.f.children.find(m=>m.userData.role==='cuishang-upper-west-dark-gallery'),size=wall.geometry.parameters,wp=wall.position,ownedBox=new THREE.Box3(new THREE.Vector3(wp.x-size.width/2,wp.y-size.height/2,wp.z-size.depth/2),new THREE.Vector3(wp.x+size.width/2,wp.y+size.height/2,wp.z+size.depth/2)).applyMatrix4(c.f.matrixWorld),scopeOwner=c.kit.colliders.find(q=>q.equals(ownedBox));
 if(!scopeOwner)throw Error('Cuishang exact retained gallery scope owner required');scopeOwner.furnitureMotionScope={kind:'cuishang-south-rails',id:'cuishang-south-rails',groundY:0,minOffsetX:p.x-w/2-.7-scopeOwner.min.x,maxOffsetX:p.x+w/2+.7-scopeOwner.min.x,minOffsetZ:p.z+outer-2-scopeOwner.min.z,maxOffsetZ:p.z+outer+1.6-scopeOwner.min.z};
 const fasciaY=p.upperFloorY-.23;box('cuishang-south-floor-fascia','green',w,.30,.075,0,fasciaY,outer-.08);
 for(const yy of[-.13,.13])box('cuishang-south-fascia-border','gold',w,.025,.025,0,fasciaY+yy,outer-.13);
 for(let i=0;i<40;i++){const x=-w/2+(i+.5)*w/40;rect('cuishang-south-fascia-plain-field','gold',x,fasciaY,outer-.135,w/40-.08,.20,.022);}
 for(const[y,upper]of[[p.upperFloorY-.35,false],[p.ph+p.colH-.35,true]])for(let i=0;i<(upper?4:5);i++){const x=-w/2+(i+.5)*bw,ww=bw-.3;box('cuishang-south-hanging-band','wood',ww,.1,.08,x,y,outer);for(let j=0;j<6;j++)rect('cuishang-south-hanging-grid','wood',x-ww/2+(j+.5)*ww/6,y-.18,outer-.03,ww/6-.06,.25,.026);for(const sign of[-1,1])box('cuishang-south-hanging-return','wood',.08,.36,.08,x+sign*(ww/2-.07),y-.26,outer);}
 const data={object:'FC-B6CDE8615B',source:'https://www.dpm.org.cn/explore/building/236433.html',accepted:false,scope:'TWO_LEVEL_SOUTH_JOINERY_EAST_FOUR_OPEN_GALLERIES_PIERCED_RAILS_AND_FASCIA',dimensions:'MODEL_FIT_NOT_SURVEY',doorPose:'FOUR_FITTED_OPEN_LOWER_AND_CLOSED_UPPER_LEAVES_NOT_VERIFIED_COUNT',upperRail:'FOUR_PIERCED_PANELS_FIVE_FITTED_HOLES_EACH_NOT_ORIGINAL_CARVING',photoSurface:'DATED_WEATHERED_COLOR_FIT_NOT_2025_CURRENT_PAINT',newGroundRamps:0,newUpperDestinations:0,retained:['western upper dark-gallery wall','roof side rear and both floors','original three ground portals and navigation'],missing:['original step lattice and carved kui-dragon panels','original painted scroll/Bogu artwork','tree-obscured end details and measured dimensions','current interior exhibition','upper bridge to Biluo and western link to Yunguang','lateral gallery traverse certification']};c.f.userData.cuishangSouthFront=data;return data;
}
