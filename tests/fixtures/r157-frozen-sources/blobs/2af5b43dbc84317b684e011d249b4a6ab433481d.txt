import * as THREE from 'three';

// Own official 236470 text establishes three window bands and four five-rail
// door leaves. Geometry, subdivisions and opened pose are fitted, not a survey.
export function buildLeshouSouthFront(c,{front,iw,h}) {
 const y=c.p.ph,bw=iw/7,low=h*.34,mid=low+(h-low)/2,top=h-.18;
 const box=(r,mat,w,hh,d,x,yy,z=front,solid=false)=>c.box('leshou-south-'+r,mat,w,hh,d,x,y+yy,z,solid);
 function grille(x,z,w,y0,y1){
  const height=y1-y0;
  box('upper-grille-field','paper',w-.10,height,.055,x,(y0+y1)/2,z,true);
  for(const xx of[x-w/2,x+w/2])box('upper-stile','red',.07,height,.11,xx,(y0+y1)/2,z-.035);
  for(const yy of[y0,y1])box('upper-rail','red',w,.08,.12,x,yy,z-.035);
  // Restrained stepped rectangular rhythm; exact historic cell motif/count
  // and painted detail are not claimed from the oblique photographs.
  const nx=5,nz=5,dx=w/nx,dy=height/nz;
  for(let i=1;i<nx;i++)box('grille-muntin','red',.027,height,.045,x-w/2+i*dx,(y0+y1)/2,z-.10);
  for(let j=1;j<nz;j++)box('grille-crossbar','red',w,.027,.045,x,y0+j*dy,z-.10);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
   const xx=x-w/2+(i+.5)*dx,yy=y0+(j+.5)*dy,s=(i+j)%2?1:-1;
   box('grille-step','red',dx*.52,.022,.04,xx+s*dx*.12,yy-dy*.18,z-.105);
   box('grille-step','red',.022,dy*.52,.04,xx-s*dx*.14,yy+dy*.07,z-.105);
  }
 }
 for(let bay=0;bay<7;bay++){
  const x=-iw/2+(bay+.5)*bw,w=bw-.16;
  if(bay===3){
   const dh=h*.66,dw=3.2;
   for(const sign of[-1,1]){
    box('door-jamb','red',.11,dh,.16,x+sign*(dw/2+.06),dh/2,front,true);
    const sideW=(w-dw)/2-.08;
    box('door-side-panel','red',sideW,dh,.18,x+sign*(dw/2+.08+sideW/2),dh/2,front,true);
    for(let leaf=0;leaf<2;leaf++){
     const xx=x+sign*(dw/2+.12+leaf*.12),lh=dh*.92,zz=front+.35;
     const m=box('folded-door-leaf','paper',.055,lh,.70,xx,lh/2,zz,true);
     m.userData.pose='FITTED_FOLDED_FOR_CIRCULATION_NOT_CLOSED_PHOTO_STATE';
     for(const dz of[-.32,.32])box('door-stile','red',.10,lh,.06,xx,lh/2,zz+dz);
     for(const yy of[.04,.5,1.0,lh*.55,lh-.04])box('door-rail','red',.10,.075,.70,xx,yy,zz);
    }
   }
   box('door-lintel','red',w,.18,.18,x,dh+.09,front,true);
   // The clear route stays at its inherited floor and width; a real framed
   // transom fills the upper bay rather than creating a second doorway.
   const transomBottom=dh+.24,split=Math.max(transomBottom+.3,mid);
   box('central-transom','paper',w,split-transomBottom,.07,x,(split+transomBottom)/2,front,true);
   for(const yy of[transomBottom,split])box('central-transom-rail','red',w,.08,.12,x,yy,front-.035);
   for(const xx of[-w/2,-w/4,0,w/4,w/2])box('central-transom-stile','red',.065,split-transomBottom,.12,x+xx,(split+transomBottom)/2,front-.035);
   // Central upper grille is kept separate from the six three-band window bays.
   const before=c.f.children.length;grille(x,front,w,split+.06,top);
   for(const m of c.f.children.slice(before))if(m.userData.role==='leshou-south-upper-grille-field')m.userData.role='leshou-south-central-upper-field';
  }else{
   const sill=.85;box('stone-sill','brick',w,sill,.20,x,sill/2,front,true);
   for(let leaf=0;leaf<2;leaf++){
    const lw=(w-.08)/2,lx=x+(leaf?1:-1)*(lw/2+.02);
    box('lower-glass','glass',lw-.10,low-sill,.055,lx,(low+sill)/2,front,true);
    for(const xx of[lx-lw/2,lx+lw/2])box('lower-stile','red',.07,low-sill,.12,xx,(low+sill)/2,front-.035);
    for(const yy of[sill,low])box('lower-rail','red',lw,.08,.12,lx,yy,front-.035);
    grille(lx,front,lw,low+.06,mid-.06);grille(lx,front,lw,mid+.06,top);
   }
  }
 }
 c.f.userData.leshouSouthFront={object:'FC-C715F850DA',source:'https://www.dpm.org.cn/explore/building/236470.html',accepted:false,state:'SOURCE_BOUNDED_SOUTH_FRONT_NOT_WHOLE_INTERIOR_ACCEPTANCE',windowBands:3,windowBays:6,centralLeaves:4,doorRailsPerLeaf:5,dimensions:'FITTED_WITHIN_RETAINED_36_15_BY_23_20_ENVELOPE_AND_18_7_RIDGE',doorPose:'FOLDED_FOR_MODEL_CIRCULATION_NOT_PHOTO_STATE',missing:['exact step lattice motif','stone relief, raised slab borders and top ornaments','painted eave narratives','unseen interior inventory']};
}

export function buildLeshouSouthApproach(c,{x,z,y,width}) {
 const run=y*2.1,n=Math.max(4,Math.ceil(y/.16)),flank=c.p.localW*.19;
 const shape=new THREE.Shape();shape.moveTo(z-run,0);shape.lineTo(z,0);shape.lineTo(z,y);shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false});
 geo.applyMatrix4(new THREE.Matrix4().set(0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,1));
 c.tag(c.kit.mesh(c.f,geo,c.mats.stone,x+width/2,0,0),'leshou-south-stone-incline',{relief:'PLAIN_NOT_RECONSTRUCTED'});
 c.kit.walkRamp(c.f,x-width/2,x+width/2,z-run,z,0,y);
 for(const sign of[-1,1]){
  const xx=x+sign*(width/2+flank/2);
  for(let i=0;i<n;i++){const h=y*(i+1)/n;c.box('leshou-south-broad-step','stone',flank,h,run/n+.01,xx,h/2,z-run+(i+.5)*run/n);}
  c.kit.walkRamp(c.f,xx-flank/2,xx+flank/2,z-run,z,0,y);
 }
}
