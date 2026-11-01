import * as THREE from 'three';
import { buildWuyingObservedCases } from './WuyingObservedCases.js';
const WENHUA='https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/';
const photo=(scene,face='f')=>`${WENHUA}panos/${scene}.tiles/${face}/l1/01/l1_${face}_01_01.jpg`;
function tag(object,role,data={}){object.name=role;Object.assign(object.userData,{role,...data});return object;}
function materials(kit,court){
 const key=`_${court}GalleryMaterials`;if(kit[key])return kit[key];
 const make=(name,color,extra={})=>{const m=new THREE.MeshStandardMaterial({name,color,roughness:.76,metalness:0,...extra});kit.owned.push(m);return m;};
 return kit[key]={frame:make(`${court}_display_matte_frame`,court==='wuying'?0x701f20:0x442d38),lining:make(`${court}_display_lining`,court==='wuying'?0xccc9bd:0x6b4f60),table:make(`${court}_display_pale_table`,0xd0c6af),glass:make(`${court}_display_glass`,0xc5d6d0,{transparent:true,opacity:.13,depthWrite:false,roughness:.18,side:THREE.DoubleSide}),ink:make(`${court}_display_dark_metal`,0x231d1b),plinth:make('wuying_independent_pale_plinth',0xc9c7bf),paper:make(`${court}_exhibit_lattice_lining`,0xd7c8aa),wood:make('wenhua_exhibit_screen_wood',0x775034),light:make(`${court}_display_light`,0xf1ebd9,{emissive:0xf1ebd9,emissiveIntensity:.45})};
}
function chamferPlan(x0,z0,x1,z1,c=.22){c=Math.min(c,(x1-x0)/3,(z1-z0)/3);return[[x0+c,z0],[x1-c,z0],[x1,z0+c],[x1,z1-c],[x1-c,z1],[x0+c,z1],[x0,z1-c],[x0,z0+c]];}
function prism(points,y,h){const shape=new THREE.Shape();points.forEach(([x,z],i)=>shape[i?'lineTo':'moveTo'](x,-z));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,steps:1});geo.rotateX(-Math.PI/2);geo.translate(0,y,0);return geo;}

/** Three distinct Wenhua installation areas, and Wuying's documented I-plan.
 * Dated equipment topology is reproduced; no unverified current art inventory.
 */
export function buildSouthGalleryDisplays(kit,f,g){
 const court=g.court,m=materials(kit,court),y=g.ph,caseH=court==='wuying'?3.65:3.45;
 const gap=court==='wuying'?.65:.5,depth=court==='wuying'?(g.part==='connector'?.8:.9):1.05;
 const box=(role,mat,w,h,d,x,yy,z,data={})=>tag(kit.mesh(f,new THREE.BoxGeometry(w,h,d),mat,x,yy,z),role,data);
 const addCase=(x0,z0,x1,z1,axis,identity,opts={})=>{
  const points=chamferPlan(x0,z0,x1,z1),width=x1-x0,run=z1-z0,H=opts.low?1.15:caseH,base=court==='wuying'?.56:opts.low?.82:.12;
  const source=court==='wuying'?g.exhibit.source:opts.source??photo(g.part==='connector'?'a057':g.part==='rear'?'a075':'a015',g.part==='front'||g.part==='connector'?'f':'r');
  const group=new THREE.Group();group.name=`${court}-display-case`;group.userData={role:`${court}-display-case`,identity,source,sourceDate:g.exhibit.sourceDate,newsPublicationDate:g.exhibit.newsPublicationDate,panoramaPackageDate:g.exhibit.panoramaPackageDate,photographyDate:null,dimensionStatus:court==='wuying'?'PUBLISHED_2020_CASE_DESIGN__RUNS_AND_FRAME_SPLIT_FIT':'VISUAL_APPROXIMATION_NOT_PUBLISHED_MEASUREMENT',actualPeriod:court==='wuying'?'2021_OPENING_PANORAMA_NOT_2026_INVENTORY':'2026_09_FIRST_PERIOD_STRUCTURE__SECOND_PERIOD_OBJECTS_UNVERIFIED',bounds:{x0,z0,x1,z1},caseH:H,cornerDegrees:135};f.add(group);
  const put=(geo,mat,role)=>{const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=mesh.receiveShadow=true;if(role)mesh.userData.role=role;group.add(mesh);return mesh;};
  put(prism(points,y,base),m.frame);put(prism(points,y+H-(opts.low?.045:.24),opts.low?.045:.24),opts.low?m.ink:m.frame);
  put(prism(points,y+base,H-base-(opts.low?.045:.24)),m.glass,opts.low?'wenhua-low-horizontal-case':undefined);
  if(court==='wuying'){
   put(prism(chamferPlan(x0+.055,z0+.055,x1-.055,z1-.055,.18),y+base,.08),m.lining);
   const backing=axis==='z'?{w:.06,d:run-.15,x:(x0+x1)/2+Math.sign((x0+x1)/2)*(width/2-.06),z:(z0+z1)/2}:{w:width-.15,d:.06,x:(x0+x1)/2,z:(z0+z1)/2+Math.sign((z0+z1)/2)*(run/2-.06)};
   box('wuying-display-backing',m.lining,backing.w,2.53,backing.d,backing.x,y+.56+1.265,backing.z);
  }else{
   const alongZ=axis==='z',cx=(x0+x1)/2,cz=(z0+z1)/2,w=alongZ?width*.72:width-.3,d=alongZ?run-.3:run*.72,tableY=opts.low?.87:.94;
   // a057-f shows both corridor sides rising away from the aisle. This is
   // dated exhibition equipment, not imperial furniture or current artwork.
   // All angles, thicknesses and heights below remain reversible model fits.
   const inclined=g.part==='connector'&&alongZ&&!opts.low,angle=inclined?Math.sign(cx)*Math.PI/7:0;
   const supportData={source,representation:'Photographed support only; no fabricated second-period artwork',dimensionStatus:'VISUAL_FIT_NOT_MEASURED',photographyDate:null,actualPeriod:'2026_09_FIRST_PERIOD_STRUCTURE__SECOND_PERIOD_OBJECTS_UNVERIFIED'};
   const board=box('wenhua-scroll-support',m.table,w,.075,d,cx,y+tableY,cz,supportData);board.rotation.z=angle;
   if(inclined){
    const edge=new THREE.Vector3(-Math.sign(cx)*w/2,.075/2,0).applyEuler(board.rotation).add(board.position);
    const lip=box('wenhua-scroll-retaining-lip',m.table,.045,.045,d,edge.x,edge.y+.015,edge.z,{...supportData,representation:'Visible lower edge stop; thickness fitted, no artwork'});lip.rotation.z=angle;
   }
   if(!opts.low){for(const s of[-1,1])for(const t of[-1,1]){
    const dx=s*(w/2-.09),top=inclined?tableY+Math.sin(angle)*dx-.075/2:.925,bottom=.075;
    box('wenhua-scroll-table-leg',m.table,.055,top-bottom,.055,cx+Math.cos(angle)*dx,y+(top+bottom)/2,cz+t*(d/2-.09));
   }
    const back=alongZ?{w:.08,d:run,x:cx+Math.sign(cx)*(width/2-.06),z:cz}:{w:width,d:.08,x:cx,z:cz+Math.sign(cz)*(run/2-.06)};
    box('wenhua-purple-backing',m.lining,back.w,H-.3,back.d,back.x,y+(H-.3)/2,back.z);
    box('wenhua-continuous-light-strip',m.light,alongZ?.06:width-.12,.045,alongZ?run-.12:.06,cx,y+H-.28,cz);
   }
  }
  kit.col(f,x0,y,z0,x1,y+H,z1);return {x0,z0,x1,z1,axis,caseH:H,source,identity};
 };
 const hx=g.w/2-gap,hz=g.d/2-gap,doorHalf=g.part==='connector'?1.1:3.2,cases=[];
 for(const side of[-1,1]){
  const x0=side<0?-hx:hx-depth,x1=side<0?-hx+depth:hx;
  const intervals=g.part==='connector'?(court==='wuying'?[[-hz,-1.15],[1.15,hz]]:[[-hz,hz]]):[[-hz+depth,hz-depth]];
  for(const[z0,z1]of intervals)cases.push(addCase(x0,z0,x1,z1,'z',`${g.part}-${side<0?'east':'west'}`));
 }
 if(g.part!=='connector')for(const side of[-1,1])for(const sign of[-1,1]){
  const z0=side<0?-hz:hz-depth,z1=side<0?-hz+depth:hz,x0=sign<0?-hx+depth:doorHalf,x1=sign<0?-doorHalf:hx-depth;
  if(x1>x0)cases.push(addCase(x0,z0,x1,z1,'x',`${g.part}-${side<0?'south':'north'}-${sign}`));
 }
 let observedObjects=[];
 if(court==='wuying')observedObjects=buildWuyingObservedCases(kit,f,g,m);
 if(court==='wenhua'&&g.part==='front'){
  // a015/a035: a free-standing tall island, with low horizontal glass cases.
  // Its contour is a reversible fit; it is not an extra historic palace wall.
  const w=18,d=2.5,cz=-1,H=3.65;
  box('wenhua-front-island-wall',m.lining,w,H,d,0,y+H/2,cz,{source:photo('a035','b'),dimensionStatus:'VISUAL_APPROXIMATION',actualPeriod:'2026_09_FIRST_PERIOD_STRUCTURE'});kit.col(f,-w/2,y,cz-d/2,w/2,y+H,cz+d/2);
  // a035-b directly proves only the north long-face low case. a015-l
  // is its oblique view, not proof of three additional surrounding cases.
  cases.push(addCase(-w/2-.7,cz+d/2,w/2+.7,cz+d/2+.7,'x','front-island-north',{low:true,source:photo('a035','b')}));
  // One REAL circular passage. Reflected circles in glass are not extra doors.
  const W=8.8,Hs=4.35,cy=1.45,r=1.65,zs=g.d/2-.42,a=Math.asin(cy/r),floorHalf=Math.sqrt(r*r-cy*cy),shape=new THREE.Shape();shape.moveTo(-W/2,0);shape.lineTo(-floorHalf,0);
  const arc=[];for(let k=0;k<=48;k++){const theta=Math.PI+a-(Math.PI+2*a)*k/48,p=new THREE.Vector3(r*Math.cos(theta),cy+r*Math.sin(theta),0);shape.lineTo(p.x,p.y);arc.push(p);}shape.lineTo(W/2,0);shape.lineTo(W/2,Hs);shape.lineTo(-W/2,Hs);shape.closePath();
  const screen=tag(kit.mesh(f,new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false}),m.paper,0,y,zs-.09),'wenhua-circular-screen',{source:photo('a035','f'),passable:true,dimensionStatus:'VISUAL_APPROXIMATION',circleCount:1});
  tag(kit.mesh(f,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc),64,.055,8,false),m.wood,0,y,zs-.105),'wenhua-circle-rim');
  for(let x=-W/2;x<=W/2;x+=.23){const bottom=Math.abs(x)<r?cy+Math.sqrt(r*r-x*x):0;box('wenhua-vertical-screen-lattice',m.wood,.045,Hs-bottom,.04,x,y+bottom+(Hs-bottom)/2,zs-.12);}
  // a035-f / a052-b: framed pale panels with horizontal muntins. Widths
  // and repeat counts are fitted; the single circular opening stays untouched.
  const frameData={source:photo('a035','f'),reverseSource:photo('a052','b'),dimensionStatus:'VISUAL_FIT_NOT_MEASURED',photographyDate:null,actualPeriod:'2026_09_FIRST_PERIOD_STRUCTURE'};
  const barH=.065;
  for(const yy of [.72,1.48,2.24,3,3.76]){
   const nearest=Math.max(0,Math.abs(yy-cy)-barH/2),opening=nearest<r?Math.sqrt(r*r-nearest*nearest):0;
   if(opening===0)box('wenhua-horizontal-screen-muntin',m.wood,W,barH,.06,0,y+yy,zs-.13,frameData);
   else for(const side of[-1,1]){const length=W/2-opening;box('wenhua-horizontal-screen-muntin',m.wood,length,barH,.06,side*(opening+length/2),y+yy,zs-.13,frameData);}
  }
  const postW=.14;
  for(const x of[-W/2+postW/2,-2.2,0,2.2,W/2-postW/2]){
   const inner=Math.max(0,Math.abs(x)-postW/2),bottom=inner<r?cy+Math.sqrt(r*r-inner*inner):0;
   box('wenhua-screen-panel-post',m.wood,postW,Hs-bottom,.09,x,y+bottom+(Hs-bottom)/2,zs-.15,frameData);
  }
  for(let yy=0;yy<Hs;yy+=.2){const hi=Math.min(Hs,yy+.2),openAt=hh=>Math.abs(hh-cy)<r?Math.sqrt(r*r-(hh-cy)**2):0,opening=Math.min(openAt(yy),openAt(hi));for(const s of[-1,1])kit.col(f,s<0?-W/2:opening,y+yy,zs-.1,s<0?-opening:W/2,y+hi,zs+.1);}
 }
 if(court==='wenhua'&&g.part==='rear'){
  // a062/a094: a glazed ROUND DISPLAY, not a second moon gate. Retain
  // two routes around its sides and deliberately withhold unverified artwork.
  const w=3.2,H=4,z=-g.d/2+2,group=new THREE.Group();tag(group,'wenhua-rear-circular-display',{passable:false,source:photo('a062','f'),dimensionStatus:'VISUAL_APPROXIMATION',artifactPolicy:'SECOND_PERIOD_WORK_NOT_POSITION_VERIFIED'});f.add(group);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(w,H,.45),m.frame);panel.position.set(0,y+H/2,z);group.add(panel);
  const glass=new THREE.Mesh(new THREE.CircleGeometry(1.28,48),m.glass);glass.position.set(0,y+1.85,z-.24);group.add(glass);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.3,.045,8,48),m.wood);rim.position.set(0,y+1.85,z-.26);group.add(rim);
  box('wenhua-rear-display-light',m.light,1.5,.045,.08,0,y+3.12,z-.27);kit.col(f,-w/2,y,z-.225,w/2,y+H,z+.225);
 }
 return {cases,observedObjects,sourceDate:g.exhibit.sourceDate,artifactPolicy:'NO_UNVERIFIED_CURRENT_OBJECT_IDENTITY_OR_INVENTORY'};
}
