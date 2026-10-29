import * as THREE from 'three';
// Own south photos only. Plain round-ended grille relationships are fitted;
// no longevity character, Buddhist inventory or original carved art is made.
export function buildFanhuaSouthFront(c){
 const{p,box}=c,w=p.localW,bw=w/7,front=-p.localD/2+p.gallery,outer=-p.localD/2,h0=p.upperFloorY-p.ph-.35,h1=p.ph+p.colH-p.upperFloorY-.35;
 const rect=(role,mat,x,y,z,ww,hh,t=.06)=>{for(const s of[-1,1]){box(role,mat,t,hh,.06,x+s*(ww-t)/2,y,z);box(role,mat,ww,t,.06,x,y+s*(hh-t)/2,z);}};
 function field(x,y,ww,hh,upper){
  box(upper?'fanhua-south-upper-field':'fanhua-south-lower-field','glass',ww,hh,.055,x,y,front,true);rect('fanhua-south-sash-frame','red',x,y,front-.065,ww+.04,hh+.04,.075);
  for(let i=0;i<3;i++){
   const xx=x-ww/2+(i+.5)*ww/3;box('fanhua-south-grille-upright','green',.027,hh-.16,.035,xx,y,front-.12);
   for(const s of[-1,1]){const geo=new THREE.TorusGeometry(.058,.009,3,12),m=c.tag(c.kit.mesh(c.f,geo,c.mats.green,xx,y+s*(hh/2-.10),front-.12),'fanhua-south-plain-round-end',{patternStatus:'PLAIN_ROUND_END_NOT_ORIGINAL_SHOU_OR_CARVING'});m.scale.x=1.2;m.scale.y=.68;}
  }
  for(const s of[-1,1])box('fanhua-south-grille-crossbar','green',ww-.08,.025,.035,x,y+s*(hh/2-.22),front-.12);
 }
 for(const upper of[false,true]){
  const y=upper?p.upperFloorY:p.ph,h=upper?h1:h0;
  for(let i=0;i<7;i++){
   const x=-w/2+(i+.5)*bw,pw=bw-.16;
   if(!upper&&i===3){
    const dw=Math.min(pw-.14,3.2),dh=Math.min(3.2,h-.35);
    for(const s of[-1,1]){box('fanhua-south-door-jamb','red',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);for(let n=0;n<2;n++){const xx=x+s*(dw/2+.13+n*.07),zz=front+.23+n*.5;box('fanhua-south-folded-leaf','red',.065,dh,.46,xx,y+dh/2,zz,true);box('fanhua-south-leaf-field','glass',.012,dh*.58,.37,xx-s*.04,y+dh*.66,zz);}
     const fill=(pw-dw)/2-.03;if(fill>0)box('fanhua-south-door-filler','red',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);
    }
    box('fanhua-south-door-lintel','red',dw+.24,.18,.18,x,y+dh+.09,front,true);const th=h-dh-.18;if(th>0)box('fanhua-south-door-transom','green',dw,th,.13,x,y+dh+.18+th/2,front,true);
   }else{
    const sill=upper?.20:.62,top=h-.16,mid=(sill+top)/2;
    box('fanhua-south-sill',upper?'red':'stone',pw,sill,.20,x,y+sill/2,front,true);
    for(const[lo,hi]of[[sill,mid],[mid,top]])for(const side of[-1,1])field(x+side*pw/4,y+(lo+hi)/2,pw/2-.07,hi-lo-.08,upper);
   }
  }
 }
 // Only underside of the existing front-gallery floor; no room ceiling or
 // floor void is filled and no upper walking support is introduced.
 const z0=outer+.18,z1=front-.12,cy=p.upperFloorY-.28,cellW=w/7/3,cellD=(z1-z0)/2;
 for(let i=0;i<21;i++)for(let j=0;j<2;j++){
  const x=-w/2+(i+.5)*cellW,z=z0+(j+.5)*cellD;box('fanhua-south-gallery-coffer','green',cellW-.05,.06,cellD-.05,x,cy,z);
  for(const s of[-1,1]){box('fanhua-south-gallery-grid','wood',cellW,.04,.035,x,cy-.045,z+s*cellD/2);box('fanhua-south-gallery-grid','wood',.035,.04,cellD,x+s*cellW/2,cy-.045,z);}
 }
 const edge=-(p.localD/2+Math.min(c.item.pad??.5,.8)),run=.9,clear=3.2,y=p.ph;
 for(let i=0;i<5;i++){const top=y*(i+1)/5;box('fanhua-south-step','stone',clear,top,run/5+.008,0,top/2,edge-run+(i+.5)*run/5);}c.kit.walkRamp(c.f,-clear/2,clear/2,edge-run,edge,0,y);
 for(const sign of[-1,1]){
  const x=sign*(clear/2+.11);for(const t of[0,1])box('fanhua-south-stone-post','stone',.20,.66,.20,x,y*t+.33,edge-run+t*run,true);
  const a=edge-run+.1,b=edge-.1,base=z=>y*(z-(edge-run))/run,shape=new THREE.Shape();shape.moveTo(a,base(a)-.03);shape.lineTo(b,base(b)-.03);shape.lineTo(b,base(b)+.56);shape.lineTo(a,base(a)+.56);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:false});geo.applyMatrix4(new THREE.Matrix4().set(0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,1));c.tag(c.kit.mesh(c.f,geo,c.mats.stone,x+.065,0,0),'fanhua-south-stone-panel',{relief:'PLAIN_NO_ORIGINAL_CARVING'});
  for(let j=0;j<8;j++){const z0=a+(b-a)*j/8,z1=a+(b-a)*(j+1)/8;c.kit.col(c.f,x-.065,base(z0)-.03,z0,x+.065,base(z1)+.56,z1);}
 }
 const data={object:'FC-D40CEF5893',source:'https://www.dpm.org.cn/explore/building/236572.html',accepted:false,scope:'TWO_LEVEL_SEVEN_BAY_SOUTH_JOINERY_GALLERY_SOFFIT_AND_CENTRAL_APPROACH',dimensions:'MODEL_FIT_NOT_SURVEY',upperCentralState:'CLOSED_GLAZED_JOINERY_PHOTO_STATE_NOT_PROOF_OF_PERMANENT_FIXED_WINDOW',lowerDoorPose:'FOUR_FOLDED_LEAVES_MODEL_CIRCULATION_FIT',stair:'FITTED_GROUND_TRANSITION_NOT_PHOTO_MEASURED_TREAD_COUNT',newGroundRamps:1,newUpperDestinations:0,retained:['previous source balustrade and floor fascia','roof and six floor voids','all interior partitions and altar outlines'],missing:['exact original lattice characters and carving','painted decoration','unseen six-category Buddhist inventories','full stair dimensions']};c.f.userData.fanhuaSouthFront=data;return data;
}
