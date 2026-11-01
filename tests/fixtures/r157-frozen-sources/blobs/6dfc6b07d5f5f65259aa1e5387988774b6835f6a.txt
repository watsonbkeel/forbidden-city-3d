import * as THREE from 'three';

// The own south photograph, not the official prose, supports these joinery
// and shallow upper-gallery relationships. Counts/poses remain fitted.
function windowPair(c,{x,z,w,h,y,upper=false}) {
 const box=(r,mat,ww,hh,dd,xx,yy,zz=z,solid=false)=>c.box('fuwang-south-'+r,mat,ww,hh,dd,xx,yy,zz,solid);
 const sill=upper?.48:.8,top=y+h-(upper?.25:.15);
 box(upper?'upper-sill':'lower-sill','red',w,sill,.18,x,y+sill/2,z,true);
 for(const sign of[-1,1]){
  const lw=(w-.10)/2,lx=x+sign*(lw/2+.025),bottom=y+sill;
  box(upper?'upper-glazed-field':'lower-glazed-field','glass',lw-.10,top-bottom,.055,lx,(bottom+top)/2,z,true);
  for(const xx of[lx-lw/2,lx+lw/2])box('window-stile','red',.075,top-bottom,.13,xx,(bottom+top)/2,z-.04);
  for(const yy of[bottom,top])box('window-rail','red',lw,.08,.13,lx,yy,z-.04);
  const nx=4,ny=5,dx=lw/nx,dy=(top-bottom)/ny;
  for(let i=1;i<nx;i++)box('window-muntin','green',.035,top-bottom,.045,lx-lw/2+i*dx,(bottom+top)/2,z-.11);
  for(let j=1;j<ny;j++)box('window-crossbar','green',lw,.035,.045,lx,bottom+j*dy,z-.11);
  // Sparse nested rectangles evoke the observed grille without claiming its
  // exact interlocking motif, inlay, painting or cell inventory.
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
   const xx=lx-lw/2+(i+.5)*dx,yy=bottom+(j+.5)*dy;
   for(const q of[-1,1]){
    box('window-inner-grid','green',dx*.52,.022,.035,xx,yy+q*dy*.26,z-.12);
    box('window-inner-grid','green',.022,dy*.52,.035,xx+q*dx*.26,yy,z-.12);
   }
  }
 }
}
export function buildFuwangSouthLower(c,{w,front,h=6.6}) {
 const y=c.p.ph,bw=w/5;
 for(let bay=0;bay<5;bay++){
  const x=-w/2+(bay+.5)*bw,pw=bw-.16;
  if(bay!==2){windowPair(c,{x,z:front,w:pw,h,y});continue;}
  const dw=3.2,dh=h*.84;
  for(const sign of[-1,1]){
   c.box('fuwang-south-door-jamb','red',.11,dh,.16,x+sign*(dw/2+.06),y+dh/2,front,true);
   const sw=(pw-dw)/2-.08;
   c.box('fuwang-south-door-side','red',sw,dh,.18,x+sign*(dw/2+.08+sw/2),y+dh/2,front,true);
   for(let leaf=0;leaf<2;leaf++){
    const xx=x+sign*(dw/2+.12+leaf*.12),lh=dh*.92,zz=front+.4;
    const m=c.box('fuwang-south-folded-leaf','red',.055,lh,.8,xx,y+lh/2,zz,true);m.userData.pose='FOUR_FITTED_FOLDED_LEAVES_NOT_CLOSED_PHOTO_STATE';
    c.box('fuwang-south-door-field','glass',.075,lh*.65,.64,xx,y+lh*.60,zz);
    for(const dz of[-.37,.37])c.box('fuwang-south-door-stile','green',.10,lh,.06,xx,y+lh/2,zz+dz);
    for(const yy of[.04,lh*.27,lh-.04])c.box('fuwang-south-door-rail','green',.10,.07,.8,xx,y+yy,zz);
   }
  }
  c.box('fuwang-south-door-lintel','red',pw,.18,.18,x,y+dh+.09,front,true);
  c.box('fuwang-south-door-transom','glass',pw,h-dh-.37,.07,x,y+dh+.22+(h-dh-.37)/2,front,true);
  for(const xx of[-pw/2,0,pw/2])c.box('fuwang-south-transom-stile','green',.06,h-dh-.37,.12,x+xx,y+dh+.22+(h-dh-.37)/2,front-.035);
 }
}
export function buildFuwangSouthUpper(c,{w,front,y,h}) {
 const setback=1,bw=w/3,z=front+setback;
 for(let i=0;i<3;i++)windowPair(c,{x:-w/2+(i+.5)*bw,z,w:bw-.16,h,y,upper:true});
 // South-only shallow gallery over the existing genuine upper floor. There
 // is deliberately no new upper walkable or destination.
 const rz=front+.12;
 c.box('fuwang-south-upper-foot-rail','red',w,.14,.12,0,y+.07,rz,true);
 for(const yy of[.58,1.08])c.box('fuwang-south-upper-front-rail','red',w,.10,.12,0,y+yy,rz,true);
 for(let i=0;i<=12;i++)c.box('fuwang-south-upper-baluster','red',.065,.94,.08,-w/2+i*w/12,y+.61,rz,true);
 for(let i=0;i<3;i++){
  const x=-w/2+(i+.5)*bw;
  c.box('fuwang-south-upper-base-panel','green',bw-.10,.22,.10,x,y+.26,rz,true);
  for(const yy of[.16,.36])c.box('fuwang-south-upper-gold-bound','gold',bw-.17,.015,.014,x,y+yy,rz-.06);
 }
 c.f.userData.fuwangSouthFront={object:'FC-722E40E471',source:'https://www.dpm.org.cn/explore/building/236495.html',accepted:false,state:'SOUTH_PHOTO_BOUNDED_NOT_HIDDEN_MAZE_ACCEPTANCE',lowerBays:5,lowerLeafCount:'FOUR_PHOTO_FITTED_NOT_OFFICIAL_PROSE_INVENTORY',actualOpening:3.2,navigationPortal:2.8,upperFrontSetback:setback,upperAccess:'UNCHANGED_VIEW_ONLY_NO_NEW_WALKABLES',dimensions:'FITTED_NOT_SURVEY',missing:['tree-hidden ends and exact return geometry','exact lattice and painted decoration','stone railing carving and post ornaments','unseen maze interiors']};
}
export function buildFuwangSouthSteps(c,{x,z,y,width}) {
 const clear=Math.max(5.2,c.p.localW*.22),run=y*2.1,n=Math.max(4,Math.ceil(y/.16));
 // One continuous photographed stair, NOT a central imperial stone incline.
 for(let i=0;i<n;i++){const top=y*(i+1)/n;c.box('fuwang-south-step','stone',clear,top,run/n+.01,x,top/2,z-run+(i+.5)*run/n);}
 c.kit.walkRamp(c.f,x-width/2,x+width/2,z-run,z,0,y);
 const wing=(clear-width)/2;
 for(const sign of[-1,1]){
  const wx=x+sign*(width/2+wing/2);c.kit.walkRamp(c.f,wx-wing/2,wx+wing/2,z-run,z,0,y);
  const xx=x+sign*(clear/2+.12);
  for(const t of[0,.5,1])c.box('fuwang-south-stone-post','stone',.22,.9,.22,xx,y*t+.45,z-run+t*run,true);
  // The photograph shows substantial stone below each inclined handrail.
  // Fill the post-to-post gaps with plain closed slabs, not invented carving.
  for(let part=0;part<2;part++){
   const z0=z-run+part*run/2+.11,z1=z-run+(part+1)*run/2-.11;
   const base=zz=>y*(zz-(z-run))/run,shape=new THREE.Shape();
   shape.moveTo(z0,base(z0)-.05);shape.lineTo(z1,base(z1)-.05);shape.lineTo(z1,base(z1)+.8);shape.lineTo(z0,base(z0)+.8);shape.closePath();
   const geometry=new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false});
   geometry.applyMatrix4(new THREE.Matrix4().set(0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,1));
   c.tag(c.kit.mesh(c.f,geometry,c.mats.stone,xx+.07,0,0),'fuwang-south-stone-infill',{relief:'PLAIN_CARVING_NOT_RECONSTRUCTED'});
   for(let i=0;i<8;i++){const a=z0+(z1-z0)*i/8,b=z0+(z1-z0)*(i+1)/8;c.kit.col(c.f,xx-.07,base(a)-.05,a,xx+.07,base(b)+.8,b);}
  }
  const rail=c.box('fuwang-south-stone-handrail','stone',.18,.13,Math.hypot(run,y),xx,y/2+.85,z-run/2);rail.rotation.x=-Math.atan2(y,run);
  rail.updateMatrix();rail.geometry.computeBoundingBox();const b=rail.geometry.boundingBox,sections=12;
  // Short actual rotated-box envelopes, never a stair-blocking giant AABB.
  for(let i=0;i<sections;i++){
   const lo=b.min.z+(b.max.z-b.min.z)*i/sections,hi=b.min.z+(b.max.z-b.min.z)*(i+1)/sections,bb=new THREE.Box3();
   for(const ax of[b.min.x,b.max.x])for(const ay of[b.min.y,b.max.y])for(const az of[lo,hi])bb.expandByPoint(new THREE.Vector3(ax,ay,az).applyMatrix4(rail.matrix));
   c.kit.col(c.f,bb.min.x,bb.min.y,bb.min.z,bb.max.x,bb.max.y,bb.max.z);
  }
  rail.userData.colliderPolicy='TWELVE_ACTUAL_ROTATED_BOX_ENVELOPES';
 }
}
