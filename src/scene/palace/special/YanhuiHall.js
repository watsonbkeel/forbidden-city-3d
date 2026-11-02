import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yanhui-source-fit',done=new WeakSet();
export const YANHUI_FIT=Object.freeze({x:31.8,z:514.5,width:9.6,depth:3.6,bays:3,bounds:Object.freeze([25.9,0,511.6,37.7,9.8,517.4])});
export function buildYanhuiHall(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(31.8,514.5,0);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=typeof mat==='string'?staged.box(f,mat,w,h,d,x,y,z):staged.mesh(f,new T.BoxGeometry(w,h,d),mat,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.yanhuiStoneTop=true;return m;};
  stone('platform','wall_brick',10.4,.2,4.2,0,.1,0);
  stone('front-step','stone_slab',2.8,.1,.4,0,.05,-2.3);
  box('closed-back-fit','wall_red',9.6,3.1,.24,0,1.75,1.68);
  for(const x of[-4.68,4.68])box('closed-side-fit','wall_red',.24,3.1,3.36,x,1.75,0);
  // Coarse own-photo lower six-leaf bay and two sill-window bays. No carved
  // lattice patterns, stair to upper gallery, interior or mezzanine is invented.
  const dark=new T.MeshStandardMaterial({name:'yanhui_coarse_window_fit',color:0x3c3430,roughness:.9}),light=new T.MeshStandardMaterial({name:'yanhui_lower_window_fit',color:0x828783,roughness:.8});staged.owned.push(dark,light);
  for(let i=0;i<6;i++){const x=-1.333333333+i*.533333333;box('closed-central-leaf','wood_column',.533333333,2.85,.2,x,1.625,-.9);box('central-upper-panel',dark,.39,1.15,.04,x,2.12,-1.02);}
  for(const x of[-3.2,3.2]){
   box('closed-window-backing','wall_red',3.2,3.1,.24,x,1.75,-.9);
   box('sill-window',light,2.7,1.1,.04,x,1.23,-1.04);
   box('coarse-upper-window',dark,2.7,.75,.04,x,2.35,-1.04);
   for(const dx of[-.85,0,.85])box('coarse-window-upright','wood_column',.055,.75,.05,x+dx,2.35,-1.07);
  }
  for(const x of[-4.8,-1.6,1.6,4.8]){const m=staged.mesh(f,new T.CylinderGeometry(.13,.15,3.2,10),kit.lib.material('wood_column'),x,1.8,-1.9);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',9.6,.3,.3,0,3.35,-1.8);
  // Four sealed sloped waist-eave slabs form an actual open-centre ring, not
  // a complete hidden roof intersecting the upper closed room.
  const slab=(name,corners)=>{const verts=[...corners,...corners.map(p=>[p[0],p[1]-.12,p[2]])],ids=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7],g=new T.BufferGeometry(),v=[];for(const i of ids)v.push(...verts[i]);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(v.flatMap((_,i)=>i%3===0?[v[i]*.5,v[i+2]*.5]:[]),2));g.computeVertexNormals();const m=staged.mesh(f,g,kit.lib.material('roof_tile'),0,0,0);m.name=ID+'/'+name;};
  slab('waist-eave-front',[[-5.25,3.6,-2.25],[5.25,3.6,-2.25],[4.15,4.25,-.95],[-4.15,4.25,-.95]]);
  slab('waist-eave-back',[[5.25,3.6,2.25],[-5.25,3.6,2.25],[-4.15,4.25,.95],[4.15,4.25,.95]]);
  slab('waist-eave-left',[[-5.25,3.6,2.25],[-5.25,3.6,-2.25],[-4.15,4.25,-.95],[-4.15,4.25,.95]]);
  slab('waist-eave-right',[[5.25,3.6,-2.25],[5.25,3.6,2.25],[4.15,4.25,.95],[4.15,4.25,-.95]]);
  box('upper-gallery-floor-visible-only','wood_column',10.2,.16,3.8,0,4.3,0);
  box('upper-closed-back-fit','wall_red',8.3,3.1,.2,0,5.95,.85);
  for(const x of[-4.05,4.05])box('upper-closed-side-fit','wall_red',.2,3.1,1.7,x,5.95,0);
  box('upper-closed-front-fit','wall_red',8.3,3.1,.2,0,5.95,-.75);
  for(const x of[-2.8,0,2.8]){box('upper-window-coarse',dark,2.35,2.15,.04,x,6.0,-.87);for(const dx of[-.65,0,.65])box('upper-window-upright','wood_column',.06,2.15,.05,x+dx,6.0,-.9);}
  for(const x of[-4.9,-1.63,1.63,4.9])for(const z of[-1.75,1.75]){const m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.1,8),kit.lib.material('wood_column'),x,5.95,z);m.name=ID+'/upper-gallery-column';}
  for(const z of[-1.8,1.8]){box('upper-gallery-rail','wood_column',10,.13,.13,0,5.25,z);box('upper-gallery-bottom-rail','wood_column',10,.12,.12,0,4.65,z);for(let i=0;i<15;i++)box('upper-gallery-baluster','wood_column',.08,.65,.08,-4.9+i*.7,4.94,z);}
  for(const x of[-4.95,4.95]){box('upper-gallery-side-rail','wood_column',.13,.13,3.6,x,5.25,0);box('upper-gallery-side-bottom','wood_column',.12,.12,3.6,x,4.65,0);for(const z of[-1.2,-.6,0,.6,1.2])box('upper-gallery-side-baluster','wood_column',.08,.65,.08,x,4.94,z);}
  const roof=staged.roof(f,{type:'xieshan',width:9.6,depth:3.6,baseY:7.5,height:1.8,overhang:.5,brackets:false});roof.name=ID+'/official-upper-hip-and-gable';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yanhuiStoneTop){const b=new T.Box3().setFromObject(m);b.yanhuiStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(25.9,-1e-6,511.6),new T.Vector3(37.7,9.8,517.4));if(!safe.containsBox(b))throw Error('Yanhui actual geometry escaped approved full envelope '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-7E30C9E212',name:'延晖阁',source:'https://www.dpm.org.cn/explore/building/236489.html',identityEvidence:'OWN_OFFICIAL_YANHUI_TEXT_AND_PHOTO',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e998976b7450.jpg',bays:3,exteriorFloors:2,closedCentralLeaves:6,upperAccess:false,photoDoorState:'CLOSED_LOWER_LEAVES_AND_UPPER_ENCLOSURE',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',facadeVerified:false,roofTypeVerified:true,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['own official text: northwest garden, north wall, south-facing three bays, yellow hip-and-gable, externally two storeys with an internal hidden level; central six leaves and side sill windows; upper gallery','own photo: two-level exterior, yellow waist eave, red closed lower doors, upper gallery columns and rail, coarse dark window regions'],
   fit:['all coordinates and dimensions including9.6 by3.6, exterior heights and gallery/eave proportions; no survey','coarse window divisions/colors; hidden sides/back; low .2 platform/.1 step and recessed lower front porch','upper gallery/waist-eave visible only; actual geometry has collision but no public walkable or access route'],
   excluded:['interior, hidden mezzanine model, upstairs stair and public access','photo foreground ancient trees, plaque, fine patterns and fittings','any trimming of garden beds/trees/paths or old north wall'],unknown:['exact contemporary facade proportions/materials','surveyed position and modern admission','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
