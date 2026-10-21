import * as THREE from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236448.html',SURVEY='https://www.dpm.org.cn/Uploads/File/pdf/ff/8e/7f/ff8e7f5fee79130164656141fe26d725.pdf',DISPLAY='https://www.dpm.org.cn/Uploads/File/2019/11/30/u5de26f7031b50.pdf';
export const SHOUKANG_FIT=Object.freeze({profile:'shoukang-front-display-2018-fit-v1',bayWeights:Object.freeze([13.5,13.5,15.5,13.5,13.5]),frontInset:2,warmPassageZ:-1.2,warmPassageWidth:2.6,seatZ:4.1,screenZ:5.0,platformHeight:.12});
export function shoukangGeometry(item){
 if(item.kind!=='hall'||item.name!=='寿康宫'||item.structure!=='shoukang-front-hall'||item.shoukangProfile!==SHOUKANG_FIT.profile)throw Error('Shoukang single-building profile required');
 for(const[k,v]of Object.entries({x:289.2,z:231,w:26.9,d:17.4,pad:1,ph:.75,colH:7.28,bays:5}))if(!Number.isFinite(item[k])||Math.abs(item[k]-v)>1e-7)throw Error('Shoukang retained envelope mismatch: '+k);
 for(const k of['layers','eaveCount','roofH','brackets','storeys','hardGableEnd','frontEnclosureInset','frontSteps','panelBuilder','ceilingBuilder','map','plaque','plaqueText','roomBays','backDoor','open','interior'])if(item[k]!==undefined)throw Error('Shoukang forbids unreviewed shell override: '+k);
 if(item.roof!=='xieshan'||item.enter!==true||item.throne!==true||(item.rot!==undefined&&item.rot!==0&&item.rot!=='south'))throw Error('Shoukang incompatible shell options');
 const widths=SHOUKANG_FIT.bayWeights.map(v=>item.w*v/69.5),axes=[-item.w/2];for(const w of widths)axes.push(axes.at(-1)+w);
 return{id:'outer-west/shoukang-front-hall',profile:SHOUKANG_FIT.profile,storeys:1,eaveCount:1,bayWeights:SHOUKANG_FIT.bayWeights,bayWidths:widths,bayAxes:axes,dimensionStatus:'PUBLISHED_BAY_RATIO_WITH_RETAINED_MODEL_WIDTH_FIT',warmRoomOpeningStatus:'GAME_ACCESS_FIT_NOT_SURVEYED_HISTORICAL_APERTURE',source:SOURCE,sources:[SOURCE,SURVEY,DISPLAY],ratioSourcePage:150,displaySourcePages:[27,28,29],targetState:'2015_RESTORED_DISPLAY_AS_PHOTOGRAPHED_BY_2018_NOT_2026_INVENTORY',currentInventoryVerified:false,photographyDate:null,siteAccessVerified:false,roofStatus:'RETAINED_APPROXIMATE_SHELL',navigationStatus:'THREE_VIEWING_REGIONS_NOT_EXHAUSTIVE_HISTORICAL_ROOM_COUNT',fit:SHOUKANG_FIT,objectMeasurements:{seat:{width:1.175,depth:.84,height:.98,page:29,basis:'STANDALONE_WOOD_OBJECT_EXCLUDING_PLATFORM_AND_UPHOLSTERY'},screen:{width:3.19,depth:.32,height:3.10,page:27,basis:'OVERALL_SCREEN_ENVELOPE_NOT_BASE_THICKNESS'}},limitations:['Existing26.9x17.4 envelope, heights, object positions and veranda depth are model fits; bay ratios alone are published.','Warm-room planes follow outer-bay interpretation; opening positions and joinery are unverified fits.','Four-leaf door counts are attested; open folded pose and simplified diamond grids do not reproduce exact Sanjiao-liuwan joinery.','Rear stair is a game-access fit, not a measured site stair or permission to visit.','No Buddhist objects, western shrine or rear-hall bedroom furniture added.']};
}
export function buildShoukangHall(kit,item){
 const g=shoukangGeometry(item),p=SHOUKANG_FIT,y=item.ph,H=item.colH-.85,front=-item.d/2+p.frontInset,rear=item.d/2,axes=g.bayAxes,cs=kit.colliders.length,rs=kit.rooms.length,gs=kit.regions.length;
 const{structure,shoukangProfile,...shell}=item,built=kit.hall({...shell,bays:7,rot:0,throne:false,interior:'empty'}),f=built.f;
 // Preserve only original roof/platform/front stairs/floor and plaque. Remove
 // the generic seven-bay enclosure, painted ceiling and empty room registration.
 const remove=new Set(['wood_column','wall_red','lattice_doors','caihua_beam']),geos=new Set();for(const m of [...f.children])if(m.isMesh&&remove.has(m.material?.name)){geos.add(m.geometry);m.removeFromParent();}for(const geo of geos)geo.dispose();
 kit.colliders.splice(cs,kit.colliders.length-cs,...kit.colliders.slice(cs).filter(c=>c.min.y<y-1e-7));kit.rooms.splice(rs);kit.regions.splice(gs);
 const mats={};for(const[n,c]of Object.entries({red:0x83332a,wood:0x4a3025,panel:0x77908a,plaster:0xbaab8d,cloth:0xc7aa54,blue:0x334f65,ceiling:0x514c3d})){mats[n]=new THREE.MeshStandardMaterial({name:'shoukang_'+n+'_fit',color:c,roughness:.8});kit.owned.push(mats[n]);}
 function box(role,mat,w,h,d,x,yy,z,solid=true,parent=f){const m=kit.mesh(parent,new THREE.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name=role;m.userData={role,dimensionStatus:g.dimensionStatus};if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);return m;}
 for(const x of axes)for(const z of[-item.d/2,rear]){const r=.31,m=kit.mesh(f,new THREE.CylinderGeometry(r,r*1.05,item.colH,12),mats.red,x,y+item.colH/2,z);m.name='shoukang-column';m.userData.role=m.name;kit.col(f,x-r,y,z-r,x+r,y+3,z+r);}
 for(const s of[-1,1])box('shoukang-side-wall','red',.3,H,item.d,s*item.w/2,y+H/2,0);
 // Conservative diamond-grid cues, not a claim to reproduce exact carved joinery.
 function grid(cx,z,w,h,cy,side){for(const sign of[-1,1])for(let c=-w/2-h/2;c<=w/2+h/2;c+=.45){const pts=[];for(const x of[-w/2,w/2]){const yy=sign*x+c;if(Math.abs(yy)<=h/2)pts.push([x,yy]);}for(const yy of[-h/2,h/2]){const x=(yy-c)/sign;if(Math.abs(x)<=w/2)pts.push([x,yy]);}if(pts.length<2)continue;const[a,b]=pts,dx=b[0]-a[0],dy=b[1]-a[1];if(Math.hypot(dx,dy)<1e-7)continue;const m=box('shoukang-fitted-diamond-grid','red',Math.hypot(dx,dy),.028,.03,cx+(a[0]+b[0])/2,cy+(a[1]+b[1])/2,z+side*.09,false);m.rotation.z=Math.atan2(dy,dx);}}
 for(const side of[-1,1]){const z=side<0?front:rear;for(let i=0;i<5;i++){const x0=axes[i],x1=axes[i+1],w=x1-x0,cx=(x0+x1)/2,door=side<0?[1,2,3].includes(i):i===2;
  box('shoukang-facade-head','red',w,H-4.05,.25,cx,y+4.05+(H-4.05)/2,z);
  for(const x of[x0,x1])box('shoukang-facade-post','wood',.16,4.05,.24,x,y+2.025,z);
  if(door){for(const sign of[-1,1])for(let leaf=0;leaf<2;leaf++){const x=cx+sign*(w/2-.37-leaf*.14),depth=w/4;box(side<0?'shoukang-front-door-leaf':'shoukang-rear-door-leaf','wood',.09,3.85,depth,x,y+1.925,z-side*(depth/2+.02));}}
  else{box('shoukang-window-sill','red',w,.95,.28,cx,y+.475,z);if(side<0){const lw=(w-.32)/4;for(let k=0;k<4;k++){const x=x0+.16+(k+.5)*lw;box('shoukang-front-window-leaf','wood',lw-.035,3.1,.14,x,y+2.5,z);grid(x,z,lw-.09,2.8,y+2.5,side);}}
   else{box('shoukang-rear-window','wood',w-.32,3.1,.14,cx,y+2.5,z);grid(cx,z,w-.4,2.8,y+2.5,side);}}
 }}
 // Source warm-room outer bays, but no source claims these fitted apertures are
 // historic surveyed door positions or exact partition construction.
 for(const x of[axes[1],axes[4]]){const lo=p.warmPassageZ-p.warmPassageWidth/2,hi=p.warmPassageZ+p.warmPassageWidth/2;for(const[a,b]of[[front,lo],[hi,rear]])box('shoukang-warm-partition','plaster',.16,H,b-a,x,y+H/2,(a+b)/2);for(const z of[lo,hi])box('shoukang-warm-opening-frame','wood',.2,3.3,.12,x,y+1.65,z);box('shoukang-warm-opening-head','wood',.2,.16,p.warmPassageWidth,x,y+3.3,p.warmPassageZ);}
 kit.steps(f,{zEdge:item.d/2+item.pad,dir:1,y,width:4.6});
 for(let i=0;i<5;i++)for(let j=0;j<3;j++)box('shoukang-plain-ceiling-grid','ceiling',g.bayWidths[i]-.08,.08,item.d/3-.08,(axes[i]+axes[i+1])/2,y+H,-item.d/2+(j+.5)*item.d/3,false);
 for(const z of[-item.d/2,front,rear])box('shoukang-frame-beam','wood',item.w,.35,.3,0,y+item.colH-.2,z,false);
 // The dated display photograph supports the central ensemble. Published object
 // envelopes are separated from fitted platform, upholstery and placement.
 const base=y+p.platformHeight;box('shoukang-display-platform-fit','wood',4.8,p.platformHeight,3.9,0,y+p.platformHeight/2,p.seatZ);box('shoukang-plain-carpet-fit','cloth',4.6,.012,3.7,0,base+.006,p.seatZ,false);
 const group=(role,basis)=>{const o=new THREE.Group();o.name=role;o.userData={role,measurementStatus:'PUBLISHED_OBJECT_ENVELOPE',basis,source:DISPLAY};f.add(o);return o;},seat=group('shoukang-seat-assembly',g.objectMeasurements.seat.basis),sz=p.seatZ;
 box('shoukang-seat-base','wood',1.175,.08,.84,0,base+.04,sz,true,seat);
 for(const x of[-.5375,.5375])for(const z of[sz-.37,sz+.37])box('shoukang-seat-leg','wood',.10,.38,.10,x,base+.23,z,true,seat);
 box('shoukang-seat-top','wood',1.175,.12,.84,0,base+.44,sz,true,seat);box('shoukang-seat-back','wood',1.175,.48,.09,0,base+.74,sz+.375,true,seat);
 for(const s of[-1,1])box('shoukang-seat-arm','wood',.08,.42,.84,s*(1.175/2-.04),base+.71,sz,true,seat);
 box('shoukang-plain-cushion-fit','cloth',1.0,.08,.65,0,base+.54,sz-.03,false);box('shoukang-footstool-fit','blue',1.05,.2,.42,0,y+.1,sz-.95);
 const screen=group('shoukang-screen-assembly',g.objectMeasurements.screen.basis),zz=p.screenZ;box('shoukang-screen-base','wood',3.19,.12,.32,0,base+.06,zz,true,screen);
 for(const[cx,w,h]of[[0,1.45,3.1],[-1.16,.87,2.75],[1.16,.87,2.75]]){box('shoukang-screen-panel','wood',w,h-.12,.12,cx,base+.12+(h-.12)/2,zz,true,screen);box('shoukang-screen-unpainted-inset','panel',w-.15,h-.42,.025,cx,base+.12+(h-.12)/2,zz-.075,false,screen);}
 const cuts=[-item.w/2,axes[1],axes[4],item.w/2];for(let i=0;i<3;i++){const doors=i===1?[...g.bayWidths.map((_,j)=>j).filter(j=>[1,2,3].includes(j)).map(j=>({x:(axes[j]+axes[j+1])/2,z:front})),{x:0,z:rear},{x:axes[1],z:p.warmPassageZ},{x:axes[4],z:p.warmPassageZ}]:[{x:i===0?axes[1]:axes[4],z:p.warmPassageZ}];kit._lastFurnish={cover:[],spawns:[{x:i===1?0:(cuts[i]+cuts[i+1])/2,z:p.warmPassageZ}]};kit.registerRoom(f,{name:item.name,kind:i===0?'shoukang-east-warm-viewing-zone':i===2?'shoukang-west-warm-viewing-zone':'shoukang-central-viewing-zone',x0:cuts[i]+.25,x1:cuts[i+1]-.25,z0:front,z1:rear,y,h:H,doors});}
 f.userData.structure=g;f.name='寿康宫·正殿局部陈列拟合';return{...built,g};
}
