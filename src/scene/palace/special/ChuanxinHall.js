import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const FIT='OFFICIAL_PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED';
export const CHUANXIN_FIT=Object.freeze({x:-236.5,z:-198,width:19.2,depth:10.4,floor:.45,eave:4.95,ridge:7.75});
export const CHUANXIN_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236526.html','https://img.dpm.org.cn/Uploads/pdf/3718/T00020_00.pdf','https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf']);
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Only the independently evidenced main hall. The 100x25 courtyard is NOT
 * erected here: no guessed rear buildings, side gates or southern entrance.
 * All dimensions/position are a reversible fit within the audited vacant box.
 * Four photo-visible centre leaves are folded for interaction, not a claim of
 * current museum admission. Unknown interior remains empty. */
export function buildChuanxinHall(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds;
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData?.structure?.id==='chuanxin-main-hall')||!Array.isArray(kit.colliders)||!Array.isArray(kit.walkables)||!Array.isArray(kit.owned)||!Array.isArray(kit.mapItems)||[kit.root.children,kit.colliders,kit.walkables,kit.owned,kit.mapItems].some(a=>Object.isFrozen(a)||!Object.isExtensible(a)))throw Error('Chuanxin hall requires retained outer-east registration and fresh untransformed CourtKit');
 const p=CHUANXIN_FIT,frame=new T.Group();frame.name='chuanxin-main-hall';frame.position.set(p.x,0,p.z);
 const geometries=[],materials=[],owners=[],walkables=[];
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=mat('chuanxin-muted-red',0x9d4935),dark=mat('chuanxin-window-shadow',0x3a3830),stone=mat('chuanxin-stone',0xb9b5a8),brick=mat('chuanxin-plinth-brick',0x777b78),plaster=mat('chuanxin-plain-gable',0xb8b3a4),green=mat('chuanxin-painted-band',0x506d5c),wood=mat('chuanxin-beam',0x614b38),yellow=kit.lib.material('roof_tile');
 const add=(geo,material,role,parts)=>{geometries.push(geo);const m=new T.Mesh(geo,material);m.name='chuanxin-'+role;m.userData.chuanxinRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,m,w,h,d,x,y,z)=>add(new T.BoxGeometry(w,h,d).translate(x,y,z),m,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);if(['plinth','stone-floor','lower-step','upper-step'].includes(id)){const m=parts[0],box=new T.Box3().setFromBufferAttribute(m.geometry.attributes.position).applyMatrix4(m.matrixWorld);box.chuanxinSolid={id,objectId:'FC-F608EC3356'};owners.push(box);m.userData.chuanxinBoxOwner=id;if(id!=='plinth'){const top=box.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,chuanxinSolidTop:id});}return;}const a=[];for(const m of parts){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++){const v=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);a.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],'chuanxin-main-hall:'+id),c=shape.box.clone();c.triangleSupport=shape;c.chuanxinHall={id,objectId:'FC-F608EC3356'};owners.push(c);for(const m of parts)m.userData.chuanxinOwner=shape.id;}finally{g.dispose();}};
 const single=(role,m,w,h,d,x,y,z)=>{const a=[];box(a,role,m,w,h,d,x,y,z);own(a,role);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const halfRoof=6.0,curve=z=>p.eave+(p.ridge-p.eave)*(.32*(1-Math.abs(z)/halfRoof)+.68*(1-Math.abs(z)/halfRoof)**2);
 // Photo-backed linked circular lattice, not a decorative historical census.
 const lattice=(parts,cx,cy,cz,w,h,folded=false)=>{const cols=Math.max(1,Math.floor(w/.34)),rows=Math.max(1,Math.floor(h/.32));for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=cx+(i-(cols-1)/2)*.32,y=cy+(j-(rows-1)/2)*.30;const g=new T.TorusGeometry(.175,.018,4,12);if(folded){g.rotateY(Math.PI/2);g.translate(cx-Math.sign(cx)*.085,y,cz+(i-(cols-1)/2)*.32);}else g.translate(x,y,cz);add(g,red,'linked-lattice',parts);}};
 const window=(id,cx,w)=>{const parts=[],bottom=1.55,top=4.28,z=-5.20;box(parts,'sill-lower-panel',plaster,w,1.10,.22,cx,1.0,z+.02);for(const x of[cx-w/2,cx+w/2])box(parts,'window-stile',red,.10,top-bottom,.14,x,(top+bottom)/2,z);for(const y of[bottom,top])box(parts,'window-rail',red,w,.10,.14,cx,y,z);const pane=w/4;for(let k=0;k<4;k++){const x=cx-w/2+pane*(k+.5);box(parts,'window-backing',dark,pane-.08,top-bottom-.12,.07,x,(top+bottom)/2,z+.025);if(k)box(parts,'window-mullion',red,.065,top-bottom,.14,cx-w/2+pane*k,(top+bottom)/2,z);lattice(parts,x,(top+bottom)/2,z-.065,pane-.12,top-bottom-.2);}own(parts,id);};
 const leaf=(s,k)=>{const parts=[],x=s*(1.73+k*.035),z=-4.78+k*.78,bottom=.45,top=4.22,width=.76;box(parts,'folded-leaf-panel',red,.105,1.22,width,x,bottom+.61,z);box(parts,'folded-leaf-dark-upper',dark,.065,top-bottom-1.28,width-.10,x,bottom+1.28+(top-bottom-1.28)/2,z);for(const zz of[z-width/2,z+width/2])box(parts,'folded-leaf-edge',red,.13,top-bottom,.065,x,(top+bottom)/2,zz);for(const y of[bottom,bottom+1.25,top])box(parts,'folded-leaf-rail',red,.13,.085,width,x,y,z);lattice(parts,x,(bottom+1.30+top-.08)/2,z,width-.16,top-bottom-1.48,true);own(parts,'folded-leaf-'+s+'-'+k);};
 try{
  single('plinth',brick,19.8,.45,11,0,.225,0);
  single('stone-floor',stone,19.8,.055,11,0,.4225,0);
  // Two .15m solid treads plus .45m platform top = three small rises.
  single('lower-step',stone,4.4,.15,1,0,.075,-7);
  single('upper-step',stone,4.4,.30,1,0,.15,-6);
  single('rear-wall',plaster,19.2,4.5,.30,0,2.70,5.05);
  for(const s of[-1,1]){
   single('side-wall-'+s,plaster,.30,4.5,10.4,s*9.45,2.70,0);
   const parts=[],section=[[-5.2,4.72],[5.2,4.72]];for(let i=0;i<=24;i++){const z=halfRoof-2*halfRoof*i/24;section.push([z,curve(z)-.205]);}
   add(prism(section,s<0?-9.6:9.3,s<0?-9.3:9.6),plaster,'gable-infill',parts);own(parts,'gable-'+s);
  }
  for(const x of[-9.6,-5.76,-1.92,1.92,5.76,9.6]){const parts=[];add(new T.CylinderGeometry(.18,.21,4.5,12).translate(x,2.70,-5.15),red,'front-column',parts);own(parts,'front-column-'+x);}
  for(const x of[-7.68,-3.84,3.84,7.68])window('side-sill-window-'+x,x,3.48);
  single('head-beam',red,19.2,.32,.32,0,4.63,-5.17);
  single('muted-painted-head-band',green,19.1,.18,.05,0,4.61,-5.345);
  single('front-inner-beam',wood,18.8,.25,.30,0,4.72,-4.85);
  single('rear-inner-beam',wood,18.8,.25,.30,0,4.72,4.85);
  // No unverified inscription, elaborate bracket sculpture or altar furniture.
  for(const s of[-1,1])for(let k=0;k<2;k++)leaf(s,k);
  single('centre-upper-panel',red,3.46,.25,.15,0,4.385,-5.17);
  const points=Array.from({length:25},(_,i)=>{const z=-halfRoof+2*halfRoof*i/24;return[z,curve(z)];}),parts=[];
  add(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.20])],-9.6,9.6),yellow,'yellow-hard-gable-sheet',parts);
  for(let i=0;i<=64;i++){const x=-9.55+19.10*i/64,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.025,z)));add(new T.TubeGeometry(path,24,.043,5,false),yellow,'yellow-tile-roll',parts);for(const t of[0,1]){const c=path.getPoint(t),n=path.getTangent(t).multiplyScalar(t===0?-1:1),g=new T.CircleGeometry(.043,5);g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),n)));g.translate(...c.toArray());add(g,yellow,'tile-end',parts);}}
  box(parts,'plain-ridge',yellow,19.25,.23,.28,0,p.ridge+.10,0);own(parts,'hard-gable-roof');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:'chuanxin-main-hall',objectId:'FC-F608EC3356',name:'传心殿',...p,bays:5,depthBays:3,mainHallCount:1,frontLeafCount:4,interiorFurnishings:0,wholeCourtyardAccepted:false,dimensions:FIT,sourceUrls:[...CHUANXIN_SOURCES],photographyDate:null,openState:'FOUR_VISIBLE_FOLDED_LEAVES_INTERACTIVE_FIT_NOT_CURRENT_PUBLIC_ADMISSION',scope:'MAIN_HALL_ONLY_NO_COURT_OR_REAR_BUILDINGS',unknown:['measured location/dimensions','complete current rear and side facades','decorative carving and painted artwork','current interior/use and admission','GPU/mobile visual acceptance'],withheldIdentities:['FC-905A51A8BC','FC-CE6964B462','FC-73FC3BE9A7','FC-D852D8A192','FC-92B6D8420A'],triangleOwners:owners.filter(b=>b.triangleSupport).length,visibleBoxOwners:owners.filter(b=>b.chuanxinSolid).length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.walkables.push(...walkables);kit.owned.push(...materials);kit.mapItems.push({kind:'hall',name:'传心殿',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,sourceStatus:FIT,objectId:meta.objectId});return{frame,meta};
}
