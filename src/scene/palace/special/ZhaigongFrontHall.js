import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='zhaigong-front-photo-fit',done=new WeakSet();
export const ZHAIGONG_FRONT_FIT=Object.freeze({x:-93,z:256.2,mainWidth:28.6,mainDepth:13.4,platformHeight:.8,mainBays:5,baoxiaBays:3,bounds:Object.freeze([-110,0,238,-76,12,267])});
/** Own DPM 236463 text/photo: five-bay front hall, yellow xieshan roof and
 * projecting three-bay baoxia. Metric position/scale/hidden faces are a game
 * fit, not a survey or acceptance of the two-court compound. Closed pictured
 * facade; only its exterior porch/stairs are accessible. */
export function buildZhaigongFrontHall(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-93,256.2,0);f.name=ID;
  const windowMat=new T.MeshStandardMaterial({name:'zhaigong-window-dark-color-fit',color:0x263c42,roughness:.9});staged.owned.push(windowMat);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.zhaigongStoneTop=true;return m;};
  stone('main-platform','wall_brick',31,.8,16,0,.4,.3);
  stone('baoxia-platform','wall_brick',18.4,.8,5.7,0,.4,-10.45);
  // Four actual 0.2m rises per flight, broad visible 1m treads. No invisible ramp.
  for(const[name,x,toe]of[['central',0,-17.3],['east',-11.7,-11.7],['west',11.7,-11.7]])for(let i=0;i<4;i++)stone(name+'-step-'+i,'stone_slab',name==='central'?5:4,.2*(i+1),1,x,.1*(i+1),toe+i+.5);
  box('closed-back-wall-fit','wall_red',28.6,5.7,.35,0,3.65,6.55);
  for(const x of[-14.125,14.125])box('closed-side-wall-fit','wall_red',.35,5.7,13.1,x,3.65,0);
  box('south-head-beam','caihua_beam',28.6,.7,.45,0,6.0,-6.55);
  // Three door bays and two outer sill-window bays from the official text.
  // Leaf count/lattice and all unseen rear/sides are simplified engineering fits.
  for(const x of[-5.72,0,5.72])for(let i=0;i<4;i++){
   const xx=x+(i-1.5)*1.38;
   box('closed-door-leaf-fit','wood_column',1.33,4.7,.18,xx,3.15,-6.6);
   box('coarse-door-upper-panel-fit','wood_column',1.08,2.4,.04,xx,3.85,-6.71);
   box('coarse-door-lower-panel-fit','caihua_beam',1.08,.75,.04,xx,1.45,-6.71);
  }
  for(const x of[-11.44,11.44]){
   box('window-sill-masonry','wall_brick',5.35,1.2,.32,x,1.4,-6.58);
   const w=box('sill-window','wood_column',5.35,3.5,.16,x,3.75,-6.6);w.material=windowMat;
   for(const dx of[-2.65,-1.325,0,1.325,2.65])box('coarse-window-vertical-fit','wood_column',.09,3.58,.11,x+dx,3.75,-6.73);
   for(const y of[2.0,3.75,5.5])box('coarse-window-horizontal-fit','wood_column',5.4,.09,.11,x,y,-6.73);
  }
  const col=(role,x,z,h)=>{const m=staged.mesh(f,new T.CylinderGeometry(.23,.26,h,12),kit.lib.material('wood_column'),x,.8+h/2,z);m.name=ID+'/'+role;box(role+'-stone-foot','stone_slab',.64,.20,.64,x,.9,z);};
  for(const x of[-14.3,-8.58,-2.86,2.86,8.58,14.3])col('main-front-column',x,-6.5,5.1);
  for(const x of[-8.58,-2.86,2.86,8.58])col('baoxia-front-column',x,-12.3,5.1);
  box('baoxia-front-beam','caihua_beam',17.5,.65,.4,0,5.8,-12.3);
  for(const x of[-8.58,8.58])box('baoxia-side-beam','caihua_beam',.36,.55,5.8,x,5.85,-9.4);
  const mainRoof=staged.roof(f,{type:'xieshan',width:28.6,depth:13.4,baseY:6.5,height:3.4,overhang:.9,brackets:true});mainRoof.name=ID+'/main-roof';mainRoof.userData.zhaigongRoof='main-xieshan';
  const baoxiaRoof=staged.roof(f,{type:'xieshan',width:17.3,depth:5.8,baseY:5.9,height:2.2,overhang:.75,brackets:true},0,-9.6);baoxiaRoof.name=ID+'/baoxia-roof';baoxiaRoof.userData.zhaigongRoof='baoxia-fitted-xieshan';
  // Only the coarse white central stair rails visible in the own photo.
  // Posts/rails are independent real solids; their spacing/profile is fitted.
  for(const x of[-2.82,2.82])for(let i=0;i<5;i++){
   const z=-17.3+i,y=Math.min(.8,.2*i);
   box('central-white-rail-post-fit','stone_slab',.24,.78,.24,x,y+.39,z);
   if(i<4){const m=box('central-white-sloped-rail-fit','stone_slab',.18,.16,Math.hypot(1,.2),x,y+.65,z+.5);m.rotation.x=-Math.atan(.2);}
  }
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  f.traverse(m=>{
   if(!m.isMesh)return;
   if(m.userData.zhaigongStoneTop){const b=new T.Box3().setFromObject(m);b.zhaigongStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));
   try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-110,-1e-6,238),new T.Vector3(-76,12,267));if(!safe.containsBox(bounds))throw Error('Zhaigong visible geometry escaped the scanned reserve');
  meta={id:ID,sourceObjectId:'FC-8D4739DF1E',source:'https://www.dpm.org.cn/explore/building/236463.html',sourceImage:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98392602dde.jpg',mainBays:5,baoxiaBays:3,wholeObjectAccepted:false,currentInteriorVerified:false,partialCompound:true,frontState:'CLOSED_DOORS_WITH_ACCESSIBLE_PORCH_FIT',platformHeight:.8,stepRises:4,stepRise:.2,stepDepth:1,newRooms:0,newMapItems:0,
   sourceSupported:['five-bay main hall','yellow glazed xieshan main roof','projecting three-bay baoxia','three door bays and two sill-window bays','red exterior columns, low grey platform and visible stone stair approaches'],
   fit:['position and all metric dimensions, low step heights/depths','baoxia roof metric/type detail and invisible joins','door leaf count, simplified lattice, all unseen back/side faces','coarse colors/material sampling and central white rail details'],
   excluded:['Chengsu rear hall','side halls and linking galleries','interior, furniture and ceiling decoration','modern deer and exhibition panels'],unknown:['measured site coordinates','unseen rear/sides','current admission/interior','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
