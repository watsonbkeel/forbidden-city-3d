import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const WENYUAN_STELE_FIT=Object.freeze({x:-212.5,z:-132.8,width:6,depth:6,floor:.25,eave:4.85,ridge:7.45,roofWidth:8});
const ID='FC-F23B7824D4',PREFIX='wenyuan-stele:';
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Official p011/photo8: enclosed red pavilion, helmet-shaped yellow roof,
 * one stele. All dimensions and the open south doorway are interactive fits.
 * No invented inscription, rear door or claim of current public admission. */
export function buildWenyuanStelePavilion(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds;
 if(!identity(kit?.root)||kit.root.name!=='outer-east'||b?.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit.root.children.some(c=>c.userData.structure?.id==='wenyuan-stele-pavilion'))throw Error('Original outer-east and unique Wenyuan stele host required');
 const p=WENYUAN_STELE_FIT,frame=new T.Group();frame.name='wenyuan-stele-pavilion';frame.position.set(p.x,0,p.z);
 const geometries=[],materials=[],colliders=[];
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name:'wenyuan-stele-'+name,color,roughness:.86});materials.push(m);return m;};
 const red=mat('red-enclosure-fit',0x963d2c),stone=mat('stone-fit',0xc5bb9f),dark=mat('dark-beam-fit',0x42544b),bronze=mat('plain-grey-stele-fit',0x77756c),yellow=kit.lib.material('roof_tile');
 const add=(g,m,role)=>{geometries.push(g);const mesh=new T.Mesh(g,m);mesh.name='wenyuan-stele-'+role;mesh.userData.steleRole=role;mesh.castShadow=mesh.receiveShadow=true;frame.add(mesh);return mesh;};
 const owner=(mesh,role)=>{
  frame.updateMatrixWorld(true);const g=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
  try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],PREFIX+role),box=shape.box.clone();box.triangleSupport=shape;colliders.push(box);mesh.userData.steleOwner=shape.id;}finally{g.dispose();}
 };
 const box=(role,m,w,h,d,x,y,z)=>{const mesh=add(new T.BoxGeometry(w,h,d).translate(x,y,z),m,role);owner(mesh,role);return mesh;};
 let floorBox;
 try{
  const floor=add(new T.BoxGeometry(6.5,p.floor,6.5).translate(0,p.floor/2,0),stone,'visible-low-plinth');frame.updateMatrixWorld(true);floorBox=new T.Box3().setFromObject(floor);floorBox.wenyuanStelePlinth=true;colliders.push(floorBox);floor.userData.steleBoxOwner=true;
  for(const s of[-1,1]){
   box('side-wall-'+s,red,.32,3.65,6,s*2.84,p.floor+1.825,0);
   box('side-stone-foot-'+s,stone,.37,.7,6.04,s*2.84,p.floor+.35,0);
   box('side-upper-frame-'+s,stone,.35,.2,6.0,s*2.84,4.0,0);
   box('front-wall-'+s,red,1.75,3.65,.32,s*2.125,p.floor+1.825,-2.84);
   box('front-stone-foot-'+s,stone,1.78,.7,.37,s*2.125,p.floor+.35,-2.84);
   box('door-jamb-'+s,red,.16,3.35,.40,s*1.22,p.floor+1.675,-2.85);
   // Leaves visibly folded along the jambs, not deleted to force navigation.
   box('folded-door-leaf-'+s,red,.11,3.10,.95,s*1.25,p.floor+1.55,-2.36);
   box('front-upper-frame-'+s,stone,1.70,.2,.35,s*2.125,4.0,-2.84);
  }
  box('rear-wall',red,5.68,3.65,.32,0,p.floor+1.825,2.84);
  box('rear-stone-foot',stone,5.72,.7,.37,0,p.floor+.35,2.84);
  box('rear-upper-frame',stone,5.72,.2,.35,0,4.0,2.84);
  box('door-lintel',red,2.5,.35,.4,0,3.77,-2.84);
  for(const s of[-1,1]){
   box('front-back-beam-'+s,dark,6.45,.5,.35,0,4.35,s*2.84);
   box('side-beam-'+s,dark,.35,.5,6.0,s*2.84,4.35,0);
  }
  box('stele-base',stone,2.15,.42,1.25,0,p.floor+.21,.4);
  const sh=new T.Shape();sh.moveTo(-.74,0);sh.lineTo(.74,0);sh.lineTo(.74,2.15);sh.absarc(0,2.15,.74,0,Math.PI,false);sh.lineTo(-.74,0);
  const sg=new T.ExtrudeGeometry(sh,{depth:.42,bevelEnabled:false,curveSegments:12});sg.translate(0,p.floor+.42,.19);const sm=add(sg,bronze,'stele-body');owner(sm,'stele-body');
  // Closed two-sided square helmet shell. Corners turn upwards; no generic
  // hip roof is substituted. Profile is a coarse photographic outline only.
  const n=24,half=p.roofWidth/2,v=[],ix=[],stride=n+1;
  const roofY=(x,z)=>{const r=Math.max(Math.abs(x),Math.abs(z))/half,t=Math.min(1,r/.9),dome=1-t*t*(3-2*t);return p.eave+(p.ridge-p.eave)*dome+.88*Math.pow(Math.abs(x*z)/(half*half),4);};
  for(const lower of[false,true])for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const x=-half+2*half*i/n,z=-half+2*half*j/n;v.push(x,roofY(x,z)-(lower?.18:0),z);}
  const off=stride*stride;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*stride+i,c=a+stride,b=a+1,d=c+1;ix.push(a,c,b,b,c,d,a+off,b+off,c+off,b+off,d+off,c+off);}
  const perimeter=[];for(let i=0;i<n;i++)perimeter.push(i);for(let j=0;j<n;j++)perimeter.push(j*stride+n);for(let i=n;i>0;i--)perimeter.push(n*stride+i);for(let j=n;j>0;j--)perimeter.push(j*stride);
  for(let i=0;i<perimeter.length;i++){const a=perimeter[i],b=perimeter[(i+1)%perimeter.length];ix.push(a,b,a+off,b,b+off,a+off);}
  const rg=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));rg.setIndex(ix);rg.computeVertexNormals();rg.setAttribute('uv',new T.Float32BufferAttribute(v.flatMap((_,i)=>i%3===0?[v[i]/.6,v[i+2]/.6]:[]),2));const rm=add(rg,yellow,'helmet-roof');owner(rm,'helmet-roof');
  const neck=add(new T.CylinderGeometry(.22,.30,.28,12).translate(0,p.ridge+.12,0),yellow,'finial-neck');owner(neck,'finial-neck');
  const finial=add(new T.SphereGeometry(.34,12,10).scale(.85,1.2,.85).translate(0,p.ridge+.51,0),yellow,'plain-finial');owner(finial,'plain-finial');
 }catch(error){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());throw error;}
 const meta={id:'wenyuan-stele-pavilion',objectId:ID,name:'文渊阁碑亭',...p,steles:1,inscription:'NOT_RECONSTRUCTED',dimensions:'PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED',southOpening:'FOLDED_LEAVES_INTERACTIVE_FIT_NOT_PUBLIC_ADMISSION',wholeObjectAccepted:false,sourceUrls:['https://www.dpm.org.cn/explore/building/236513.html','https://www.dpm.org.cn/Uploads/File/pdf/a7/67/b3/a767b32d6015563d8947b50650c815cb.pdf'],limitations:['Roof profile, dimensions, location and stele dimensions are engineering estimates','No specific text, rear facade detail or decorative carving reconstructed','No GPU or mobile acceptance'],triangleOwners:colliders.filter(c=>c.triangleSupport).length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...materials);const support=floorBox.clone();support.min.y=support.max.y;kit.walkables.push({type:'box',box:support});kit.mapItems.push({kind:'pavilion',name:meta.name,x:p.x,z:p.z,w:6.5,d:6.5,rot:0,objectId:ID,sourceStatus:meta.dimensions});return{frame,meta};
}
