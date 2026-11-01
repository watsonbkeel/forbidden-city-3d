import * as THREE from 'three';
// Own south photograph. Trees obscure end details; repeated joinery and all
// dimensions remain fitted. The light lower fields are not identified as glass.
export function buildSuichuSouthFront(c){
 const{p,box}=c,w=p.localW,bw=w/5,front=-p.localD/2+p.gallery,outer=-p.localD/2,h=p.colH-.42,y=p.ph;
 const light=new THREE.MeshStandardMaterial({name:'suichu_south_light_covering_fit',color:0xc5cbc2,roughness:.92}),dark=new THREE.MeshStandardMaterial({name:'suichu_south_dark_upper_fit',color:0x283f38,roughness:.88});c.kit.owned.push(light,dark);
 const rect=(role,mat,x,yy,z,ww,hh,t=.06)=>{for(const s of[-1,1]){box(role,mat,t,hh,.06,x+s*(ww-t)/2,yy,z);box(role,mat,ww,t,.06,x,yy+s*(hh-t)/2,z);}};
 for(let i=0;i<5;i++){
  const x=-w/2+(i+.5)*bw,pw=bw-.16;
  if(i===2){const dw=Math.min(pw-.14,3.2),dh=Math.min(3.2,h-.35);
   for(const s of[-1,1]){box('suichu-south-door-jamb','red',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);const fill=(pw-dw)/2-.03;if(fill>0)box('suichu-south-door-filler','red',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);
    for(let j=0;j<2;j++){const xx=x+s*(dw/2+.17+j*.13),z=front+.32;box('suichu-south-open-leaf','red',.08,dh,.60,xx,y+dh/2,z,true);const m=box('suichu-south-leaf-field','green',.014,dh*.61,.46,xx-s*.05,y+dh*.65,z);m.material=dark;for(let k=1;k<5;k++)box('suichu-south-leaf-grid','green',.018,.028,.45,xx-s*.065,y+dh*.36+k*dh*.56/5,z);}
   }
   box('suichu-south-door-lintel','red',dw+.24,.18,.18,x,y+dh+.09,front,true);const th=h-dh-.18,m=box('suichu-south-transom-field','green',dw,th,.14,x,y+dh+.18+th/2,front,true);m.material=dark;
   for(let j=0;j<4;j++)rect('suichu-south-transom-grid','green',x-dw/2+(j+.5)*dw/4,y+dh+.18+th/2,front-.1,dw/4-.08,th-.14,.035);
  }else{
   const sill=.58,split=2.15,top=h-.18;box('suichu-south-sill','red',pw,sill,.20,x,y+sill/2,front,true);
   for(const s of[-1,1]){const xx=x+s*pw/4,ww=pw/2-.08;
    const lo=box('suichu-south-lower-field','paper',ww,split-sill-.08,.055,xx,y+(sill+split)/2,front,true);lo.material=light;rect('suichu-south-window-frame','red',xx,y+(sill+split)/2,front-.065,ww+.03,split-sill);
    const hi=box('suichu-south-upper-field','green',ww,top-split-.08,.055,xx,y+(split+top)/2,front,true);hi.material=dark;rect('suichu-south-window-frame','red',xx,y+(split+top)/2,front-.065,ww+.03,top-split);
    for(let k=0;k<3;k++){const gx=xx-ww/2+(k+.5)*ww/3;rect('suichu-south-plain-grid','green',gx,y+(split+top)/2,front-.115,ww/3-.07,top-split-.25,.028);for(const t of[-1,1])box('suichu-south-grid-cross','green',ww/3-.08,.026,.045,gx,y+(split+top)/2+t*(top-split)*.23,front-.12);}
   }
  }
 }
 // Low front railing leaves a generous central gap clear of the existing
 // four-metre seven-tread flight. It does not certify a full lateral gallery.
 const gap=4.1,rz=outer+.08;
 for(const s of[-1,1]){const a=s<0?-w/2:gap/2,b=s<0?-gap/2:w/2,ww=b-a,x=(a+b)/2;
  for(const hh of[.12,.58])box('suichu-south-low-rail','red',ww,.085,.12,x,y+hh,rz,true);
  const n=6;for(let j=0;j<=n;j++)box('suichu-south-rail-post','red',.08,.63,.12,a+j*ww/n,y+.315,rz,true);
  for(let j=0;j<n;j++)rect('suichu-south-rail-grid','green',a+(j+.5)*ww/n,y+.35,rz-.055,ww/n-.15,.32,.035);
 }
 for(let i=0;i<5;i++){const x=-w/2+(i+.5)*bw,ww=bw-.35,yy=y+p.colH-.68;box('suichu-south-hanging-band','green',ww,.10,.08,x,yy,outer-.01);for(let j=0;j<5;j++)rect('suichu-south-hanging-grid','blue',x-ww/2+(j+.5)*ww/5,yy-.18,outer-.05,ww/5-.05,.28,.027);for(const s of[-1,1])box('suichu-south-hanging-return','green',.075,.42,.08,x+s*(ww/2-.05),yy-.24,outer-.01);}
 const data={object:'FC-E604D58704',source:'https://www.dpm.org.cn/explore/building/236512.html',accepted:false,scope:'FIVE_BAY_SOUTH_JOINERY_AND_FRONT_GALLERY_WITH_RETAINED_STEPS_BASINS',dimensions:'MODEL_FIT_NOT_SURVEY',lowerField:'LIGHT_PHOTO_FIELD_OR_COVERING_MATERIAL_UNVERIFIED',doorPose:'FOUR_FOLDED_OPEN_LEAVES_MODEL_FIT_COUNT_UNVERIFIED',galleryAccess:'CENTRAL_THROUGH_ROUTE_TESTED_LATERAL_GALLERY_NOT_CERTIFIED',newGroundRamps:0,newUpperDestinations:0,retained:['source tiger-stone platform face','both shaped basins and exact contacts','seven actual treads and sloping cheeks','roof, side/rear and through-hall'],missing:['original lattice pattern and exact paint','tree-obscured end details','exact leaf count and dimensions','current2025 room exhibition mapping','unseen wing gallery junctions']};c.f.userData.suichuSouthFront=data;return data;
}
