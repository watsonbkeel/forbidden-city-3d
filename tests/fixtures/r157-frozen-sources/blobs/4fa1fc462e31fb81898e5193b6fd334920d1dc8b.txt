import * as THREE from 'three';

export const JINGYANG_REAR_SOURCE='https://www.dpm.org.cn/explore/building/236511.html';
export const JINGYANG_REAR_PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d19e160e96.jpg';
const identity={kind:'hall',x:-148.5,z:453.5,w:24,d:9.6,pad:.6,ph:.45,colH:6.08,roof:'xieshan',map:'hall'};
const optional=new Set(['bays']);

// Extrude the planar UNION of axis-aligned strips. Interior contact faces are
// omitted rather than stacked coplanar boxes; every emitted triangle has area.
// The grid is only topology for this one fitted window, not a texture template.
function stripUnion(rectangles,z0,z1){
 const axes=k=>[...new Set(rectangles.flatMap(r=>[r[k],r[k+1]]).map(v=>+v.toFixed(7)))].sort((a,b)=>a-b),xs=axes(0),ys=axes(2);
 const nx=xs.length-1,ny=ys.length-1,filled=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++){const cx=(xs[x]+xs[x+1])/2,cy=(ys[y]+ys[y+1])/2;filled[x][y]=rectangles.some(([a,b,c,d])=>cx>a-1e-8&&cx<b+1e-8&&cy>c-1e-8&&cy<d+1e-8);}
 const pos=[],normal=[],uv=[];
 const face=(corners,n)=>{for(const i of[0,1,2,0,2,3]){pos.push(...corners[i]);normal.push(...n);uv.push(corners[i][0],corners[i][1]);}};
 const at=(x,y)=>filled[x]?.[y]??false;
 // Merge adjacent occupied cells into disjoint coplanar rectangles. The
 // exact same grid/occupancy owns the outline; only redundant face splits go.
 const used=Array.from({length:nx},()=>new Array(ny).fill(false));
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(at(x,y)&&!used[x][y]){
  let right=x+1,top=y+1;
  while(right<nx&&at(right,y)&&!used[right][y])right++;
  while(top<ny&&Array.from({length:right-x},(_,k)=>x+k).every(k=>at(k,top)&&!used[k][top]))top++;
  for(let i=x;i<right;i++)for(let j=y;j<top;j++)used[i][j]=true;
  const a=xs[x],b=xs[right],c=ys[y],d=ys[top];
  face([[a,c,z0],[a,d,z0],[b,d,z0],[b,c,z0]],[0,0,-1]);
  face([[a,c,z1],[b,c,z1],[b,d,z1],[a,d,z1]],[0,0,1]);
 }
 // Keep every exterior and opening-return side, coalescing only contiguous
 // boundary segments on the same plane with the same outward normal.
 for(let x=0;x<=nx;x++)for(const sign of[-1,1]){
  const exposed=y=>sign<0?at(x,y)&&!at(x-1,y):at(x-1,y)&&!at(x,y);
  for(let y=0;y<ny;){if(!exposed(y)){y++;continue;}const start=y;while(y<ny&&exposed(y))y++;
   const a=xs[x],c=ys[start],d=ys[y];
   if(sign<0)face([[a,c,z0],[a,c,z1],[a,d,z1],[a,d,z0]],[-1,0,0]);
   else face([[a,c,z0],[a,d,z0],[a,d,z1],[a,c,z1]],[1,0,0]);
  }
 }
 for(let y=0;y<=ny;y++)for(const sign of[-1,1]){
  const exposed=x=>sign<0?at(x,y)&&!at(x,y-1):at(x,y-1)&&!at(x,y);
  for(let x=0;x<nx;){if(!exposed(x)){x++;continue;}const start=x;while(x<nx&&exposed(x))x++;
   const a=xs[start],b=xs[x],c=ys[y];
   if(sign<0)face([[a,c,z0],[b,c,z0],[b,c,z1],[a,c,z1]],[0,-1,0]);
   else face([[a,c,z0],[a,c,z1],[b,c,z1],[b,c,z0]],[0,1,0]);
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeBoundingBox();geo.computeBoundingSphere();return geo;
}

/** Replace only east-six/items/38. Five bays are source-attested; retained
 * metres, four-leaf grouping and simplified straight/step runs are MODEL FITS.
 * This helper does not alter any shared builder or mutate the source item.
 */
export function buildJingyangRearFacade(kit,item,zoneId){
 if(zoneId!=='east-six'||kit?.root?.name!=='east-six'||!item||Object.entries(identity).some(([k,v])=>item[k]!==v)||
   Object.keys(item).some(k=>!(k in identity)&&!optional.has(k))||(item.bays!==undefined&&item.bays!==5)||
   kit.root.children.some(f=>f.userData.structure?.objectId==='FC-8B02DC003C'))throw Error('Jingyang rear identity or retained shell mismatch');
 const own=(name,color)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness:.92});kit.owned.push(m);return m;};
 const red=own('jingyang_rear_photo_red_frame',0x85372d),stone=own('jingyang_rear_photo_sill',0xa49c88),recess=own('jingyang_rear_closed_window_recess',0x818b82);
 const panelBuilder=({f,x,z,width,height,floorY,side,bayIndex})=>{
  if(side!==-1)return false;
  const sillHeight=1.0,y0=floorY+sillHeight,y1=floorY+height,x0=x-width/2,x1=x+width/2,t=.10;
  const meta={objectId:'FC-8B02DC003C',source:JINGYANG_REAR_SOURCE,photo:JINGYANG_REAR_PHOTO,photographyDate:null,
   role:'window',bayIndex,surveyed:false,patternStatus:'PARTIAL_VISIBLE_STRAIGHT_STEP_MODEL_FIT_NOT_MEASURED_OR_COMPLETE',
   countStatus:'FOUR_LEAF_GROUPS_AND_THREE_STRAIGHT_RUNS_PER_GROUP_ARE_FIT_CONTROLS_NOT_SURVEY_COUNTS',
   finePattern:'UNRESOLVED_SMALL_JOINTS_AND_FINE_REPEAT_NOT_RECONSTRUCTED',backingMaterial:'OPAQUE_CLOSED_RECESS_FIT_NOT_A_MATERIAL_IDENTIFICATION',
   sillHeight,leafGroupsFit:4,straightRunsPerLeafFit:3,closedNotPassage:true,
   bounds:{min:[x0,floorY,z-.21],max:[x1,y1,z+.19]}};
  const group=new THREE.Group();group.name='jingyang-rear-south-high-sill-window';group.userData.jingyangRearWindow=meta;f.add(group);
  const mesh=(geo,mat,role)=>{const m=kit.mesh(group,geo,mat,0,0,0);m.name='jingyang-rear-'+role;m.userData.jingyangRearWindow={...meta,role};return m;};
  const box=(a,b,c,d,e,g,mat,role)=>mesh(new THREE.BoxGeometry(b-a,d-c,g-e).translate((a+b)/2,(c+d)/2,(e+g)/2),mat,role);
  box(x0,x1,floorY,y0-.10,z-.19,z+.19,stone,'high-masonry-sill');
  box(x0,x1,y0-.10,y0,z-.21,z+.17,red,'sill-cap');
  // The recess stops behind the red frame. The facade does not claim glass,
  // paper, or a photographed interior inventory behind the grilles.
  box(x0+t,x1-t,y0+t,y1-t,z-.04,z+.02,recess,'closed-recess');
  const rects=[[x0,x0+t,y0,y1],[x1-t,x1,y0,y1],[x0+t,x1-t,y0,y0+t],[x0+t,x1-t,y1-t,y1]];
  const innerW=width-2*t,leafW=innerW/4,bot=y0+t,top=y1-t;
  // 05 shows four broad leaf groups in each of the four high-sill windows.
  // Only the clear long vertical and stepped end relationships are fitted;
  // this is deliberately not a copied front-hall pattern or exact lattice.
  for(let k=1;k<4;k++){const q=x0+t+k*leafW;rects.push([q-.045,q+.045,bot,top]);}
  for(let k=0;k<4;k++){
   const a=x0+t+k*leafW+.065,b=x0+t+(k+1)*leafW-.065,span=b-a;
   for(let j=0;j<3;j++){
    const q=a+span*(j+1)/4,lo=bot+.14+(j===1?.12:0),hi=top-.14-(j===1?.12:0),s=.035;
    rects.push([q-s/2,q+s/2,lo,hi]);
    // Short offset returns give the observed coarse stepped ends, without
    // continuing an unverified repeat through the whole opening.
    const reach=span*.18,dir=j===2?-1:1;
    const q1=q+dir*reach;
    rects.push([Math.min(q,q1)-s/2,Math.max(q,q1)+s/2,lo,lo+s]);
    rects.push([Math.min(q,q1)-s/2,Math.max(q,q1)+s/2,hi-s,hi]);
    rects.push([q1-s/2,q1+s/2,lo,lo+.12]);
    rects.push([q1-s/2,q1+s/2,hi-.12,hi]);
   }
  }
  mesh(stripUnion(rects,z-.21,z-.04),red,'partial-straight-step-grille');
  return true; // kit owns the four new bay-wide, closed-window proxies.
 };
 const result=kit.hall({...item,bays:5,panelBuilder});
 result.f.userData.structure={...result.f.userData.structure,id:'jingyang-rear-facade',profile:'jingyang-rear-facade',objectId:'FC-8B02DC003C',
  canonicalName:'景阳宫后殿（御书房）',source:JINGYANG_REAR_SOURCE,photo:JINGYANG_REAR_PHOTO,photographyDate:null,
  bays:5,oldEffectiveBays:7,status:'PARTIAL_SOURCE_GUIDED_FACADE_MODEL_FIT',dimensionStatus:'RETAINED_SHELL_ENVELOPE_AND_FITTED_WINDOW_PROPORTIONS_NOT_SURVEYED',
  sourceClaim:'Rear hall has five bays and a xieshan roof; official image 05 shows a central entrance and four high-sill south window groups.',
  interiorStatus:'EXISTING_R39_GENERIC_HALL_FURNITURE_UNVERIFIED_UNCHANGED',
  rearStatus:'UNOBSERVED_REAR_RETAINED_PLAIN_NOT_RECONSTRUCTED',nameboardStatus:'ORIGINAL_UNNAMED_ITEM_NO_NEW_INSCRIPTION_ADDED',
  accessStatus:'CENTRAL_MODEL_PASSAGE_RETAINED_WITH_FIVE_BAY_COLUMNS_AND_PROXIES_NOT_HISTORICAL_MEASUREMENTS'};
 return result;
}
