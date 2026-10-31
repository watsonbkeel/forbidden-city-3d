import * as THREE from 'three';
// Own exterior0/2 only: east five bays. Painted/art-carved motifs are omitted.
export function buildJuanqinEastFront(c){
 const{p,box}=c,w=p.localW,bw=w/9,front=-p.localD/2+p.gallery,outer=-p.localD/2,east=-w/2,cx=east+2.5*bw,h=p.colH-.42,y=p.ph;
 const rect=(role,mat,x,yy,z,ww,hh,t=.035)=>{for(const s of[-1,1]){box(role,mat,t,hh,.04,x+s*(ww-t)/2,yy,z);box(role,mat,ww,t,.04,x,yy+s*(hh-t)/2,z);}};
 for(let i=0;i<5;i++){
  const x=east+(i+.5)*bw,pw=bw-.16;
  if(i===2){
   const dw=Math.min(pw-.14,3.2),dh=4.05;
   for(const s of[-1,1]){box('juanqin-east-door-jamb','red',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);for(let n=0;n<2;n++){const xx=x+s*(dw/2+.13+n*.07),zz=front+.23+n*.5;box('juanqin-east-folded-leaf','red',.065,dh,.46,xx,y+dh/2,zz,true);box('juanqin-east-leaf-field','glass',.012,dh*.62,.37,xx-s*.04,y+dh*.65,zz);}
    const fill=(pw-dw)/2-.03;if(fill>0)box('juanqin-east-door-filler','red',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);
   }
   box('juanqin-east-door-lintel','red',dw+.24,.15,.18,x,y+dh+.075,front,true);const th=h-dh-.18;box('juanqin-east-door-transom','green',dw,th,.13,x,y+dh+.18+th/2,front,true);for(let j=0;j<5;j++)rect('juanqin-east-transom-grille','gold',x-dw/2+(j+.5)*dw/5,y+dh+.18+th/2,front-.09,dw/5-.09,th-.12,.025);
  }else{
   const sill=.42,mid=2.55,top=h-.12;box('juanqin-east-sill','brick',pw,sill,.2,x,y+sill/2,front,true);
   // Two sashes across and two vertical tiers: a fitted subdivision, not a
   // claim that every hidden muntin has been inventoried.
   for(const[lo,hi]of[[sill,mid],[mid,top]])for(const side of[-1,1]){
    const xx=x+side*pw/4,ww=pw/2-.07,hh=hi-lo-.07,yy=y+(lo+hi)/2;
    box('juanqin-east-window-field','glass',ww,hh,.055,xx,yy,front,true);rect('juanqin-east-window-frame','red',xx,yy,front-.065,ww+.035,hh+.04,.09);
    for(const t of[1,.76,.53])rect('juanqin-east-step-grid','wood',xx,yy,front-.125,ww*t-.10,hh*t-.10,.035);
    for(const sy of[-1,1])for(const sx of[-1,1])box('juanqin-east-step-link','wood',ww*.19,.035,.045,xx+sx*ww*.31,yy+sy*hh*.37,front-.125);
   }
  }
  const hx=east+(i+.5)*bw,hy=y+p.colH-.65;
  rect('juanqin-east-hanging-frame','green',hx,hy,outer-.03,bw-.22,.48,.055);
  for(let k=0;k<5;k++)rect('juanqin-east-hanging-grid','gold',hx-(bw-.3)/2+(k+.5)*(bw-.3)/5,hy,outer-.06,(bw-.3)/5-.10,.28,.022);
 }
 for(const [a,b]of[[east+.3,east+2*bw-.3],[east+3*bw+.3,east+5*bw-.3]]){
  const xx=(a+b)/2,z=outer-.30;box('juanqin-east-fixed-seat','red',b-a,.085,.28,xx,y+.48,z,true);
  for(const x of[a+.15,xx,b-.15])box('juanqin-east-seat-support','red',.13,.4375,.20,x,y+.21875,z,true);
 }
 const edge=-(p.localD/2+Math.min(c.item.pad??.5,.8)),run=.9,clear=3.2,n=5;
 for(let i=0;i<n;i++){const top=y*(i+1)/n;box('juanqin-east-step','stone',clear,top,run/n+.008,cx,top/2,edge-run+(i+.5)*run/n);}
 c.kit.walkRamp(c.f,cx-clear/2,cx+clear/2,edge-run,edge,0,y);
 for(const sign of[-1,1]){
  const x=cx+sign*(clear/2+.11);for(const t of[0,1])box('juanqin-east-stone-post','stone',.20,.66,.20,x,y*t+.33,edge-run+t*run,true);
  const a=edge-run+.1,b=edge-.1,base=z=>y*(z-(edge-run))/run,shape=new THREE.Shape();shape.moveTo(a,base(a)-.03);shape.lineTo(b,base(b)-.03);shape.lineTo(b,base(b)+.56);shape.lineTo(a,base(a)+.56);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:false});geo.applyMatrix4(new THREE.Matrix4().set(0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,1));c.tag(c.kit.mesh(c.f,geo,c.mats.stone,x+.065,0,0),'juanqin-east-stone-panel',{relief:'PLAIN_NO_CARVING_OR_LION_FINIAL'});
  for(let j=0;j<8;j++){const z0=a+(b-a)*j/8,z1=a+(b-a)*(j+1)/8;c.kit.col(c.f,x-.065,base(z0)-.03,z0,x+.065,base(z1)+.56,z1);}
 }
 const data={object:'FC-F4D12B27E6',source:'https://www.dpm.org.cn/explore/building/236478.html',accepted:false,scope:'EAST_FIVE_SOUTH_FRONTAGE_AND_WHOLE_ROOF_PALETTE_ONLY',dimensions:'MODEL_FIT_NOT_SURVEY',doorPose:'FOUR_FOLDED_LEAVES_CIRCULATION_FIT_PHOTO_CLOSED',roof:'OFFICIAL_GREEN_TILES_YELLOW_EDGES_EXISTING_GEOMETRY',stair:'CENTRAL_DOOR_ONLY_NO_IMPERIAL_SLAB_NO_FULL_FACADE_STAIR',missing:['exact carved and painted patterns','fixed-seat hidden ends','west-four facade details','unseen loft rooms'],newGroundRamps:1,newUpperDestinations:0};c.f.userData.juanqinEastFront=data;return data;
}
