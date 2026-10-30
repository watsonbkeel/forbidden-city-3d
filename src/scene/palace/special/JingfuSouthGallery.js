// Own official front-gallery view (7411), not an interior photograph.
// Grid counts, colours and member dimensions are model fits, not surveys.
export function buildJingfuSouthGallery(c){
 const{p,box}=c,w=p.localW,front=-p.localD/2+p.gallery,outer=-p.localD/2,iw=w-2*p.gallery,bw=iw/5,h=p.colH-.42,y=p.ph;
 const rect=(role,mat,x,yy,z,ww,hh,t=.035)=>{for(const s of[-1,1]){box(role,mat,t,hh,.045,x+s*(ww-t)/2,yy,z);box(role,mat,ww,t,.045,x,yy+s*(hh-t)/2,z);}};
 for(let i=0;i<5;i++){
  const x=-iw/2+(i+.5)*bw,pw=bw-.16;
  if(i===2){
   // Match the old generic opening exactly, including its physical jambs.
   const dw=Math.min(pw-.14,3.2),dh=Math.min(3.2,h-.35);
   for(const s of[-1,1]){box('jingfu-south-door-jamb','bamboo',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);box('jingfu-south-open-leaf','bamboo',.1,dh*.92,.5,x+s*(dw/2+.12),y+dh*.46,front+.26,true);const fill=(pw-dw)/2-.03;if(fill>0)box('jingfu-south-door-filler','bamboo',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);}
   box('jingfu-south-door-lintel','bamboo',dw+.24,.18,.18,x,y+dh+.09,front,true);
   const th=h-dh-.18;box('jingfu-south-transom','paper',dw,th,.14,x,y+dh+.18+th/2,front,true);
   for(let j=0;j<5;j++){const xx=x-dw/2+(j+.5)*dw/5;rect('jingfu-south-transom-grille','bamboo',xx,y+dh+.18+th/2,front-.09,dw/5-.08,th-.15);}
  }else{
   const sill=.9,top=h-.18,transom=1.25,split=top-transom;
   box('jingfu-south-sill','brick',pw,sill,.2,x,y+sill/2,front,true);
   for(const[lo,hi]of[[sill,split],[split,top]]){
    const hh=hi-lo;box('jingfu-south-window-field','paper',pw-.13,hh,.055,x,y+(lo+hi)/2,front,true);
    rect('jingfu-south-window-frame','bamboo',x,y+(lo+hi)/2,front-.06,pw,hh,.08);
    const rows=lo===sill?3:1;
    for(let k=0;k<3;k++)for(let j=0;j<rows;j++){const xx=x-pw/2+(k+.5)*pw/3,yy=y+lo+(j+.5)*hh/rows,ww=pw/3-.12,rh=hh/rows-.12;rect('jingfu-south-nested-grille','bamboo',xx,yy,front-.11,ww,rh);rect('jingfu-south-nested-grille','bamboo',xx,yy,front-.11,ww*.62,rh*.67,.025);}
   }
  }
 }
 // Existing south column geometry/colliders remain exact. Warm ochre is a
 // photograph-based palette fit; not a claim that bare timber was observed.
 for(const m of c.f.children)if(m.userData.role==='column'&&Math.abs(m.position.z-outer)<1e-8){m.material=c.mats.bamboo;m.userData.paletteStatus='WARM_OCHRE_PHOTO_FIT_NOT_MATERIAL_IDENTIFICATION';const r=m.geometry.parameters.radiusTop??.2;c.cylinder('jingfu-south-base-shoulder','stone',r*1.30,.10,m.position.x,y+.21,outer,true,20).userData.relief='PLAIN_VOLUME_NOT_CARVED_LOTUS';}
 const cy=y+p.colH-.5,z0=outer+.16,z1=front-.12,span=z1-z0,cellW=w/5/4,cellD=span/2;
 for(let i=0;i<5;i++)for(let a=0;a<4;a++)for(let b=0;b<2;b++){
  const x=-w/2+(i*4+a+.5)*cellW,z=z0+(b+.5)*cellD;
  box('jingfu-south-ceiling-field','green',cellW-.06,.06,cellD-.06,x,cy,z);
  for(const s of[-1,1]){box('jingfu-south-ceiling-rim','bamboo',cellW,.055,.035,x,cy-.05,z+s*(cellD-.035)/2);box('jingfu-south-ceiling-rim','bamboo',.035,.055,cellD,x+s*(cellW-.035)/2,cy-.05,z);}
 }
 for(let i=0;i<=5;i++)box('jingfu-south-cross-beam','green',.16,.24,span+.14,-w/2+i*w/5,cy-.06,(z0+z1)/2);
 for(const z of[z0,z1])box('jingfu-south-ceiling-edge','green',w,.19,.12,0,cy-.05,z);
 const data={object:'FC-7616C3B4B6',source:'https://www.dpm.org.cn/explore/building/236571.html',image:'https://img.dpm.org.cn/Uploads/Picture/dc/7411.jpg',scope:'SOUTH_GALLERY_JOINERY_OVERHEAD_AND_SOUTH_COLUMN_PALETTE_ONLY',accepted:false,dimensionStatus:'PHOTO_RELATIONSHIPS_MODEL_FITS_NOT_SURVEY',doorPose:'OPEN_MODEL_CIRCULATION_FIT_NOT_CONFIRMED_PHOTO_LEAF_INVENTORY',columnPalette:'WARM_OCHRE_NOT_CONFIRMED_BARE_WOOD',ceiling:'PLAIN_GREEN_FIELDS_NO_SU_STYLE_PICTURE_RECONSTRUCTION',baseRelief:'PLAIN_VOLUME_NOT_CARVED_LOTUS',missing:['EXACT_JOINERY_INVENTORY','LOTUS_CARVING','SU_STYLE_PAINTING','FIVE_FU_FIVE_GENERATIONS_INTERIOR_PHOTOS'],newWalkables:0};
 c.f.userData.jingfuSouthGallery=data;return data;
}
