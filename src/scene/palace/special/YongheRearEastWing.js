import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yonghe-rear-east-photo-fit',done=new WeakSet();
export const YONGHE_REAR_EAST_FIT=Object.freeze({x:-166.2,z:392.5,width:7.2,depth:3.6,bays:3,bounds:Object.freeze([-168.8,0,387.5,-162.8,7,397.2])});
export function buildYongheRearEastWing(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-166.2,392.5,-Math.PI/2);f.name=ID;
  const pane=new T.MeshStandardMaterial({name:'yonghe-rear-east-window-coarse-fit',color:0x617880,roughness:.9});staged.owned.push(pane);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.yongheRearEastStoneTop=true;return m;};
  stone('platform','wall_brick',8,.2,4.7,0,.1,-.35);
  stone('front-step','stone_slab',2.6,.1,.6,0,.05,-2.95);
  box('closed-back-fit','wall_red',7.2,3.1,.24,0,1.75,1.68);
  for(const x of[-3.48,3.48])box('closed-side-fit','wall_red',.24,3.1,3.36,x,1.75,0);
  // Actual cover shows open middle doorway. No interior evidence is installed;
  // this deliberately closed group is an explicit exterior-only limitation.
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.56;box('closed-central-leaf-adaptation','wood_column',.55,2.85,.16,x,1.625,-1.78);
   box('coarse-upper-door-panel-fit','wood_column',.43,1.6,.04,x,2.1,-1.88).material=pane;
   for(const dx of[-.14,.14])box('coarse-door-upright-fit','wood_column',.04,1.6,.04,x+dx,2.1,-1.91);
  }
  for(const x of[-2.4,2.4]){
   box('window-sill','wall_brick',2.24,.75,.25,x,.575,-1.75);
   box('sill-window','wood_column',2.24,2.1,.15,x,2,-1.78).material=pane;
   for(const dx of[-1.1,-.55,0,.55,1.1])box('coarse-window-upright-fit','wood_column',.055,2.1,.06,x+dx,2,-1.89);
   for(const y of[.96,1.65,2.35,3.04])box('coarse-window-crossbar-fit','wood_column',2.27,.055,.06,x,y,-1.89);
  }
  for(let i=0;i<4;i++){const x=-3.6+i*2.4,m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.2,10),kit.lib.material('wood_column'),x,1.8,-2.02);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',7.2,.3,.3,0,3.35,-1.85);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:7.2,depth:3.6,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yongheRearEastStoneTop){const b=new T.Box3().setFromObject(m);b.yongheRearEastStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-168.8,-1e-6,387.5),new T.Vector3(-162.8,7,397.2));if(!safe.containsBox(b))throw Error('Own rear east wing escaped corrected reserve '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-D240B3E3A3',source:'https://www.dpm.org.cn/explore/building/236518.html',ownViewpoint:'3668',ownGroup:'158',ownSphPic:'1943461388466900992',ownPhoto:'https://file-pano.dpm.org.cn/panorama/2025/07/10/e17fea3b-4e5d-4ef5-84cb-d32950029454.jpg',bays:3,photoDoorState:'OPEN',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official rear-court paragraph independently says east/west wings three bays, yellow hard-gable, middle doorway','own named rear EAST wing cover: middle door group, flanking sill windows, red posts and grey low platform','rear east side facing courtyard, separate from front wing and Tongshunzhai rear main hall'],
   fit:['all coordinates/dimensions, compact three-bay footprint and low platform','equal bays, coarse color/window subdivisions, unseen rear and sides','closed middle door adaptation; no interior built despite open photo','low .2m platform and .1m real approach step'],
   excluded:['front wing identity east-six item32','Tongshunzhai rear main hall item31','rear west wing','museum signs, temporary bins/plants and furnishings','new path behind building or moved old wall/roof'],unknown:['surveyed dimensions/current admission','exact window/door details and hidden elevations','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
