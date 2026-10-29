import * as THREE from 'three';

// Own official photographs establish present glass joinery, a stone incline
// between steps and green/blue/gold annex coffers. Every dimension, count of
// coffer cells and opened door pose below is fitted, not a measured inventory.
export function yangxingSouthPanel(c,{x,z,w,h,y}) {
 const box=(role,mat,ww,hh,dd,xx,yy,zz,solid=false)=>c.box('yangxing-south-'+role,mat,ww,hh,dd,x+xx,y+yy,z+zz,solid);
 const sill=Math.min(.9,h*.25),top=h-.18,winH=top-sill;
 box('sill','red',w,sill,.2,0,sill/2,0,true);
 // Keep the original full glazed closure collider: thin muntins must not
 // silently turn a previously closed bay into a traversable opening.
 box('glass-backing','glass',w-.13,winH,.055,0,sill+winH/2,0,true);
 for(let leaf=0;leaf<2;leaf++){
  const lw=(w-.14)/2,lx=-w/2+.07+(leaf+.5)*lw;
  const marker=box('glass-leaf','red',.065,winH,.10,lx-lw/2+.033,sill+winH/2,-.045);
  marker.userData.joineryState='CURRENT_GLASS_NOT_ORIGINAL_DIAMOND_LATTICE';
  for(const xx of[lx-lw/2+.033,lx+lw/2-.033])box('stile-gold-edge','gold',.012,winH-.08,.015,xx,sill+winH/2,-.102);
  for(const yy of[sill,top,sill+winH*.62])box('leaf-rail','red',lw,.075,.12,lx,yy,-.045);
  // Photo-supported fine rectangular upper grille over a larger plain pane.
  const gh=winH*.38,gy=top-gh/2;
  for(let j=1;j<5;j++)box('upper-muntin','red',.025,gh,.045,lx-lw/2+j*lw/5,gy,-.10);
  for(let j=1;j<4;j++)box('upper-crossbar','red',lw,.025,.045,lx,top-j*gh/4,-.10);
 }
 box('outer-stile','red',.065,winH,.10,w/2-.038,sill+winH/2,-.045);
}

export function buildYangxingSouthSteps(c,{x,z,y,width}) {
 const run=y*2.1,n=Math.max(4,Math.ceil(y/.16));
 // Central stone slope is plain: actual carved relief is not reconstructed.
 // Its top follows the retained navigable ramp exactly, with no false floor.
 const shape=new THREE.Shape();shape.moveTo(z-run,0);shape.lineTo(z,0);shape.lineTo(z,y);shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false});
 // shape coordinates (z,y) -> (x,y,z), extrusion spans the old clear width.
 geo.applyMatrix4(new THREE.Matrix4().set(0,0,-1,0,0,1,0,0,1,0,0,0,0,0,0,1));
 c.tag(c.kit.mesh(c.f,geo,c.mats.stone,x+width/2,0,0),'yangxing-south-stone-incline',{carvingStatus:'PLAIN_UNCARVED_SOURCE_RELIEF_NOT_REPLICATED'});
 c.kit.walkRamp(c.f,x-width/2,x+width/2,z-run,z,0,y);
 const flank=2.2;
 for(const sign of[-1,1]){
  const xx=x+sign*(width/2+flank/2);
  for(let i=0;i<n;i++){const top=y*(i+1)/n,zz=z-run+(i+.5)*run/n;c.box('yangxing-south-flanking-step','stone',flank,top,run/n+.01,xx,top/2,zz);}
  c.kit.walkRamp(c.f,xx-flank/2,xx+flank/2,z-run,z,0,y);
 }
}

export function buildYangxingAnnexCoffers(c,{x0,x1,z0,z1,y}) {
 const blue=c.mats.blue.clone();blue.name='yangxing-photo-blue-field-fit';blue.color.setHex(0x304b86);c.kit.owned.push(blue);
 const nx=12,nz=3,dx=(x1-x0)/nx,dz=(z1-z0)/nz;
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
  const x=x0+(i+.5)*dx,z=z0+(j+.5)*dz,yy=y-.13;
  c.box('yangxing-annex-coffer-backing','green',dx,.08,dz,x,yy,z);
  // Nested square green frame surrounds a blue round field. Dragons,
  // corner flowers and Su-style beam paintings remain explicitly absent.
  for(const s of[-1,1]){
   c.box('yangxing-annex-coffer-frame','green',dx,.10,.065,x,yy-.07,z+s*(dz/2-.033));
   c.box('yangxing-annex-coffer-frame','green',.065,.10,dz,x+s*(dx/2-.033),yy-.07,z);
   c.box('yangxing-annex-coffer-gold-border','gold',dx-.16,.014,.018,x,yy-.046,z+s*(dz/2-.10));
   c.box('yangxing-annex-coffer-gold-border','gold',.018,.014,dz-.20,x+s*(dx/2-.08),yy-.046,z);
  }
  const radius=Math.min(dx,dz)*.32;
  c.cylinder('yangxing-annex-coffer-blue-field','blue',radius,.012,x,yy-.046,z,false,24).material=blue;
  const g=new THREE.TorusGeometry(radius,.012,4,24);g.rotateX(Math.PI/2);
  c.tag(c.kit.mesh(c.f,g,c.mats.gold,x,yy-.054,z),'yangxing-annex-coffer-circle-border');
 }
 c.f.userData.yangxingSouthEntrance={accepted:false,source:'https://www.dpm.org.cn/explore/building/236458.html',object:'FC-E32471B7C3',state:'SOURCE_BOUNDED_SOUTH_ENTRANCE_NOT_WHOLE_INTERIOR_ACCEPTANCE',dimensions:'MODEL_FIT_NOT_SURVEY',cofferGrid:[nx,nz],missing:['stone relief','coffer dragons and flowers','Su-style painted narratives','unseen interiors'],doorPose:'RETAINED_OPEN_FOR_MODEL_CIRCULATION_NOT_PHOTO_STATE'};
}

// Four photographed glazed leaves are folded beside the inherited 2.8 m
// opening for model circulation; the official photo shows them closed.
export function buildYangxingSouthDoor(c,{x,z,y,h}) {
 const w=2.8,dh=3.3;
 for(const sign of[-1,1]){
  c.box('yangxing-four-leaf-central-door-jamb','wood',.11,dh,.16,x+sign*(w/2+.06),y+dh/2,z,true);
  for(let leaf=0;leaf<2;leaf++){
   const xx=x+sign*(w/2+.12+leaf*.12),zz=z+.35,lh=dh*.92,lw=.7;
   const m=c.box('yangxing-south-folded-glass-leaf','glass',.055,lh,lw,xx,y+lh/2,zz,true);
   m.userData.pose='FITTED_FOLDED_FOR_MODEL_CIRCULATION_NOT_PHOTO_STATE';
   for(const edge of[-1,1]){
    c.box('yangxing-south-door-stile','red',.10,lh,.06,xx,y+lh/2,zz+edge*(lw/2-.03));
    c.box('yangxing-south-door-rail','red',.10,.075,lw,xx,y+(edge+1)*lh/2,zz);
   }
   c.box('yangxing-south-door-rail','red',.10,.07,lw,xx,y+.75,zz);
  }
 }
 c.box('yangxing-four-leaf-central-door-lintel','wood',w+.24,.18,.18,x,y+dh+.09,z,true);
 const bottom=3.5,top=h-.14,th=top-bottom;
 c.box('yangxing-central-door-transom','glass',w,th,.07,x,y+(bottom+top)/2,z,true);
 for(const sign of[-1,1]){
  c.box('yangxing-south-transom-rail','red',w,.065,.12,x,y+(sign<0?bottom:top),z-.035);
  c.box('yangxing-south-transom-gold-edge','gold',w-.08,.012,.015,x,y+(sign<0?bottom+.05:top-.05),z-.102);
 }
 for(const offset of[-w/2,0,w/2])c.box('yangxing-south-transom-stile','red',.065,th,.12,x+offset,y+(bottom+top)/2,z-.035);
}
