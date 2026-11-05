import {buildGuhuaFrontOpenwork} from './GuhuaFrontOpenwork.js';
import * as THREE from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236431.html';
const PHOTO='https://img.dpm.org.cn/Uploads/image/2025/09/29/c2f44b867bfa08-NeYmtDOcI218985.png';
export const GUHUA_FIT=Object.freeze({profile:'guhua-open-restored-2025-fit-v1',galleryInset:1.8,frameHeight:4.15,openingHeight:3.05,seatHeight:.48,seatDepth:.42});
export function guhuaGeometry(item){
 if(item.name!=='古华轩'||item.structure!=='guhua-open-pavilion'||item.guhuaProfile!==GUHUA_FIT.profile)throw Error('Guhua single-building profile required');
 for(const[k,v]of Object.entries({x:-253.9,z:387.4,w:14.3,d:8.7,pad:.5,ph:.5,colH:5,bays:3}))if(Math.abs(item[k]-v)>1e-7||!Number.isFinite(item[k]))throw Error('Guhua retained envelope mismatch: '+k);
 for(const key of['layers','eaveCount','roofH','brackets','storeys','hardGableEnd','frontEnclosureInset','frontSteps','panelBuilder','ceilingBuilder','map','plaque','plaqueText'])if(item[key]!==undefined)throw Error('Guhua forbids unreviewed shell override: '+key);
 if(item.roof!=='xieshan'||item.backDoor||item.roomBays||item.throne||item.open||item.enter===false||(item.rot!==undefined&&item.rot!==0&&item.rot!=='south'))throw Error('Guhua incompatible shell options');
 return{id:'ningshou/guhua-open-pavilion',profile:GUHUA_FIT.profile,x:item.x,z:item.z,w:item.w,d:item.d,floorY:item.ph,innerWidth:item.w-2*GUHUA_FIT.galleryInset,innerDepth:item.d-2*GUHUA_FIT.galleryInset,dimensionStatus:'MODEL_FIT_NOT_SURVEY',state:'2025_RESTORED_REPLICA_REFERENCE_NOT_ORIGINAL_QIANLONG_FABRIC',sources:[SOURCE,'https://www.dpm.org.cn/show/371726.html',PHOTO,'https://www.ad.tsinghua.edu.cn/info/1061/32199.htm'],photographyDate:null,siteAccessVerified:false,roofStatus:'UNCHANGED_APPROXIMATE_XIESHAN_JUANPENG_AND_PALETTE_DEFERRED',furnitureStatus:'GENERIC_DESK_PRESET_REMOVED_NOT_A_CLAIM_OF_EMPTY_INVENTORY',navigationStatus:'ONE_OPEN_VIEWING_REGION_NOT_HISTORICAL_ROOM_COUNT',fit:GUHUA_FIT,limitations:['Three bays and open pavilion/gallery relationships are attested; equal axes and all lengths are fits.','Plain grids do not reproduce restored Guangxu-period motifs or applied floral ceiling relief.','Side/rear seat interruptions and stair geometry are unmeasured; retained half-metre step is game access, not museum permission.','Background red wall in source photograph is not this pavilion enclosure.']};
}
export function buildGuhuaPavilion(kit,item){
 const g=guhuaGeometry(item),p=GUHUA_FIT,{structure,guhuaProfile,...shell}=item;
 const built=kit.hall({...shell,rot:0,open:true,throne:false,interior:'empty'}),f=built.f,y=item.ph;
 const mats={};for(const[name,color]of Object.entries({stone:0x777870,wood:0x6c5035,black:0x191512,gold:0xac8a44,red:0x923026,green:0x285b49})){mats[name]=new THREE.MeshStandardMaterial({name:'guhua_'+name+'_fit',color,roughness:name==='stone'?.9:.66,metalness:name==='gold'?.25:0});kit.owned.push(mats[name]);}
 const box=(role,mat,w,h,d,x,yy,z,solid=false)=>{const m=kit.mesh(f,new THREE.BoxGeometry(w,h,d),mats[mat],x,yy,z);m.name=role;m.userData={role,dimensionStatus:g.dimensionStatus};if(solid)kit.col(f,x-w/2,yy-h/2,z-d/2,x+w/2,yy+h/2,z+d/2);return m;};
 // Keep original platform geometry/support, replace only the generic floor finish.
 for(const m of [...f.children])if(m.isMesh&&m.material===kit.floorMat){m.removeFromParent();m.geometry.dispose();}
 const floor=new THREE.PlaneGeometry(item.w,item.d);floor.rotateX(-Math.PI/2);const fm=kit.mesh(f,floor,mats.stone,0,y+.02,0);fm.name='guhua-stone-floor';fm.userData.role=fm.name;
 // open:true intentionally omits the generic ceiling. Add a restrained wood grid,
 // not imperial painted roundels or an invented exact floral relief pattern.
 const cy=y+item.colH-.67;
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  const w=g.innerWidth/3,d=g.innerDepth/3,x=-g.innerWidth/2+(i+.5)*w,z=-g.innerDepth/2+(j+.5)*d;
  box('guhua-ceiling-panel','wood',w-.12,.08,d-.12,x,cy,z);
  for(const s of[-1,1]){box('guhua-ceiling-grid','wood',w,.09,.09,x,cy-.045,z+s*d/2);box('guhua-ceiling-grid','wood',.09,.09,d,x+s*w/2,cy-.045,z);}
 }
 // A permeable inner screen ring, with a full-height opening in every fitted bay.
 // The wider central north/south route is never a painted or colliding fake hole.
 function frame(cx,cz,width,side){
  const add=(role,mat,w,h,d,x,yy,z,solid=false)=>side?box(role,mat,d,h,w,cx+z,yy,cz+x,solid):box(role,mat,w,h,d,cx+x,yy,cz+z,solid);
  const h=p.frameHeight,post=.16;
  for(const s of[-1,1]){
   add('guhua-inner-frame','black',post,h,.14,s*(width/2-post/2),y+h/2,0,true);
   add('guhua-inner-gold-edge','gold',.027,h-.15,.025,s*(width/2-post/2),y+h/2,-.084);
   // Open rectangular upper corners; exact restored decorative carving deferred.
   add('guhua-inner-frame','black',.28,.13,.14,s*(width/2-.28),y+p.openingHeight,0,true);
  }
  for(const yy of[p.openingHeight+.18,h-.07])add('guhua-inner-frame','black',width,.14,.14,0,y+yy,0,true);
  if(!side&&Math.abs(cx)<1e-6&&Math.abs(cz+g.innerDepth/2)<1e-6)buildGuhuaFrontOpenwork({add,width,y,height:h,openingHeight:p.openingHeight,f,cx,cz,innerDepth:g.innerDepth});
  else for(let k=1;k<6;k++)add('guhua-inner-openwork','black',.045,h-p.openingHeight-.3,.08,-width/2+k*width/6,y+(h+p.openingHeight)/2,0,true);
  add('guhua-inner-gold-edge','gold',width-.14,.025,.025,0,y+p.openingHeight+.18,-.084);
 }
 const bw=g.innerWidth/3;
 for(const s of[-1,1])for(let i=0;i<3;i++)frame(-g.innerWidth/2+(i+.5)*bw,s*g.innerDepth/2,bw,false);
 for(const s of[-1,1])frame(s*g.innerWidth/2,0,g.innerDepth,true);
 // Low benches/openwork rails stop at central north/south openings. Side spans
 // and their exact interruptions are fitted, not surveyed elevation drawings.
 function seat(cx,cz,length,side){
  const add=(role,mat,w,h,d,x,yy,z,solid=false)=>side?box(role,mat,d,h,w,cx+z,yy,cz+x,solid):box(role,mat,w,h,d,cx+x,yy,cz+z,solid);
  add('guhua-seat-top','red',length,.12,p.seatDepth,0,y+p.seatHeight-.06,0,true);
  for(const yy of[.06,.3])add('guhua-low-rail','green',length,.06,.07,0,y+yy,0,true);
  const n=Math.max(2,Math.round(length/.65));for(let i=0;i<=n;i++)add('guhua-low-rail','green',.065,.3,.08,-length/2+i*length/n,y+.19,0,true);
 }
 const outerBay=item.w/3;
 for(const s of[-1,1])for(const sx of[-1,1])seat(sx*outerBay,s*item.d/2,outerBay-.68,false);
 for(const s of[-1,1])seat(s*item.w/2,0,item.d-p.seatDepth,true);
 kit._lastFurnish={cover:[],spawns:[{x:0,z:0}]};
 kit.registerRoom(f,{name:item.name,kind:'guhua-open-navigation-zone',x0:-item.w/2,x1:item.w/2,z0:-item.d/2,z1:item.d/2,y,h:p.frameHeight,doors:[{x:0,z:-item.d/2},{x:0,z:item.d/2}]});
 f.userData.structure={...g,storeys:1,eaveCount:1};f.name='古华轩·开放亭轩局部拟合';return{...built,g};
}
