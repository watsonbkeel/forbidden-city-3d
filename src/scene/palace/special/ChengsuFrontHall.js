import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='chengsu-front-photo-fit',done=new WeakSet();
export const CHENGSU_FIT=Object.freeze({x:-93.7,z:283.6,width:32,depth:14.5,bays:7,platformHeight:.6,stepRise:.2,stepDepth:1.8,bounds:Object.freeze([-112,0,270,-75.4,12,294])});
/** DPM's own labelled Chengsu facade, not the Zhaigong front hall/baoxia.
 * Seven bays and yellow xieshan are separately stated in the Chinese text.
 * Cropped ends, hidden faces, all metrics and coarse facade detail remain fits.
 * Closed centre door, accessible exterior porch; no interior or side ranges. */
export function buildChengsuFrontHall(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-93.7,283.6,0);f.name=ID;
  const dark=new T.MeshStandardMaterial({name:'chengsu-window-dark-color-fit',color:0x263232,roughness:.9});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.chengsuStoneTop=true;return m;};
  stone('platform','wall_brick',34,.6,17.2,0,.3,.4);
  // Real broad treads, wholly inside the cleared reserve; no invisible ramp.
  for(let i=0;i<3;i++)stone('central-step-'+i,'stone_slab',5.8,.2*(i+1),1.8,0,.1*(i+1),-13.6+1.8*i+.9);
  box('closed-back-wall-fit','wall_red',32,5.8,.35,0,3.5,7.0);
  for(const x of[-15.825,15.825])box('closed-side-wall-fit','wall_red',.35,5.8,12.1,x,3.5,.95);
  box('south-facade-head','caihua_beam',32,.65,.4,0,5.95,-5.1);
  const bay=32/7;
  // The photo resolves the centre closed door and recessed side windows.
  // Equal bay division and coarse subdivisions do not purport to be measured.
  for(let i=-3;i<=3;i++){
   const x=i*bay;
   if(i===0){for(let leaf=0;leaf<4;leaf++){
    const xx=(leaf-1.5)*1.05;box('closed-center-door-leaf-fit','wood_column',1.01,4.8,.18,xx,3,-5.12);
    box('door-upper-dark-panel-fit','wood_column',.78,2.7,.04,xx,3.9,-5.23).material=dark;
    for(const dx of[-.27,0,.27])box('door-coarse-lattice-fit','wood_column',.055,2.7,.06,xx+dx,3.9,-5.27);
    for(const y of[2.58,3.9,5.22])box('door-coarse-lattice-fit','wood_column',.82,.06,.06,xx,y,-5.27);
    box('door-lower-solid-panel-fit','wood_column',.8,1.15,.04,xx,1.27,-5.23);
   }}else{
    box('grey-window-sill','wall_brick',bay-.18,1.25,.3,x,1.225,-5.1);
    box('sill-window','wood_column',bay-.18,3.7,.16,x,3.7,-5.12).material=dark;
    for(const dx of[-bay/2+.09,-bay/4,0,bay/4,bay/2-.09])box('coarse-window-upright-fit','wood_column',.085,3.76,.10,x+dx,3.7,-5.25);
    for(const y of[1.85,3.7,5.55])box('coarse-window-crossbar-fit','wood_column',bay-.12,.085,.10,x,y,-5.25);
   }
  }
  for(let i=0;i<8;i++){
   const x=-16+i*bay,m=staged.mesh(f,new T.CylinderGeometry(.23,.26,5.2,12),kit.lib.material('wood_column'),x,3.2,-7);m.name=ID+'/front-column';box('column-stone-foot','stone_slab',.62,.18,.62,x,.69,-7);
  }
  box('front-porch-beam','caihua_beam',32,.65,.42,0,5.82,-7);
  for(const x of[-15.85,15.85])box('porch-return-beam-fit','caihua_beam',.32,.55,1.9,x,5.82,-6.05);
  const roof=staged.roof(f,{type:'xieshan',width:32,depth:14.5,baseY:6.15,height:3.35,overhang:.9,brackets:true});roof.name=ID+'/single-main-roof';roof.userData.chengsuRoof=true;
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.chengsuStoneTop){const b=new T.Box3().setFromObject(m);b.chengsuStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-112,-1e-6,270-1e-6),new T.Vector3(-75.4,12,294));if(!safe.containsBox(b))throw Error('Chengsu body escaped its cleared reserve');
  meta={id:ID,sourceObjectId:'FC-DD68A90CC7',source:'https://www.dpm.org.cn/explore/building/236463.html',photoIdentityPage:'https://intl.dpm.org.cn/explore/build_maps.html',sourceImage:'https://intl.dpm.org.cn/Uploads/Picture/2023/06/21/s64926bf08ea58.jpg',bays:7,wholeObjectAccepted:false,currentInteriorVerified:false,frontState:'CLOSED_CENTER_DOOR_ACCESSIBLE_PORCH_FIT',platformHeight:.6,stepRises:3,stepRise:.2,stepDepth:1.8,newRooms:0,newMapItems:0,
   sourceSupported:['separate seven-bay rear sleeping hall','single yellow glazed xieshan roof','front row of red columns','recessed centre closed doorway and side sill windows','low grey masonry platform'],
   fit:['all position/dimensions and equal bay divisions','cropped roof ends and all unseen back/side faces','coarse color, door/window subdivisions and roof detail','low platform and broad three-step access'],
   excluded:['two-bay side annexes','eleven-bay side corridors','interior and furnishings','modern metal crowd barriers and waste bins'],unknown:['measured site geometry','current interior and admission','detailed decoration','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
