import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='tianqiong-front-photo-fit',done=new WeakSet();
export const TIANQIONG_FIT=Object.freeze({x:-194.5,z:435,width:20,depth:11,bays:5,platformHeight:.3,stepRise:.15,stepDepth:1.4,bounds:Object.freeze([-208,0,420,-181,12,449])});
/** Official 2015 p4/print182 photo shows three middle closed facade groups.
 * Text states five bays; the cropped two end bays are plain closed FITS.
 * This is not the separate Tianqiong gate, Qinhao gate, or whole compound. */
export function buildTianqiongFrontHall(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-194.5,435,0);f.name=ID;
  const dark=new T.MeshStandardMaterial({name:'tianqiong-window-dark-color-fit',color:0x263232,roughness:.9});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.tianqiongStoneTop=true;return m;};
  stone('platform','wall_brick',22,.3,14,0,.15,0);
  stone('front-platform-fit','wall_brick',14,.3,4,0,.15,-9);
  // Real broad treads, wholly inside the cleared reserve; no invisible ramp.
  for(let i=0;i<2;i++)stone('central-step-'+i,'stone_slab',4.8,.15*(i+1),1.4,0,.075*(i+1),-13.8+1.4*i+.7);
  box('closed-back-wall-fit','wall_red',20,4.8,.35,0,2.7,5.325);
  for(const x of[-9.825,9.825])box('closed-side-wall-fit','wall_red',.35,4.8,10.3,x,2.7,0);
  box('south-facade-head','caihua_beam',20,.55,.4,0,4.95,-5.1);
  const bay=4;
  // Own cropped photo resolves three middle closed leaf groups, not end windows.
  // Equal bay division and coarse subdivisions do not purport to be measured.
  for(let i=-2;i<=2;i++){
   const x=i*bay;
   if(Math.abs(i)<=1){for(let leaf=0;leaf<4;leaf++){
    const xx=x+(leaf-1.5)*.95;box('closed-center-door-leaf-fit','wood_column',.94,4.3,.18,xx,2.45,-5.12);
    box('door-upper-dark-panel-fit','wood_column',.74,2.5,.04,xx,3.2,-5.23).material=dark;
    for(const dx of[-.27,0,.27])box('door-coarse-lattice-fit','wood_column',.055,2.5,.06,xx+dx,3.2,-5.27);
    for(const y of[1.98,3.2,4.42])box('door-coarse-lattice-fit','wood_column',.78,.06,.06,xx,y,-5.27);
    box('door-lower-solid-panel-fit','wood_column',.76,1.1,.04,xx,.9,-5.23);
   }}else{
    box('unseen-end-bay-closed-fit','wall_red',bay-.12,4.3,.3,x,2.45,-5.1);
   }
  }
  for(let i=0;i<6;i++){
   const x=-10+i*bay,m=staged.mesh(f,new T.CylinderGeometry(.20,.23,4.7,12),kit.lib.material('wood_column'),x,2.65,-6);m.name=ID+'/front-column';box('column-stone-foot','stone_slab',.54,.16,.54,x,.38,-6);
  }
  box('front-porch-beam','caihua_beam',20,.55,.42,0,4.95,-6);
  for(const x of[-9.85,9.85])box('porch-return-beam-fit','caihua_beam',.32,.5,.9,x,4.95,-5.55);
  const roof=staged.roof(f,{type:'xieshan',width:20,depth:11,baseY:5.2,height:2.8,overhang:.9,brackets:true});roof.name=ID+'/single-main-roof';roof.userData.tianqiongRoof=true;
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.tianqiongStoneTop){const b=new T.Box3().setFromObject(m);b.tianqiongStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-208,-1e-6,420-1e-6),new T.Vector3(-181,12,449));if(!safe.containsBox(b))throw Error('Tianqiong body escaped its cleared reserve');
  meta={id:ID,sourceObjectId:'FC-7CE51EACB4',source:'https://www.dpm.org.cn/explore/building/236542.html',sourcePaper:'https://www.dpm.org.cn/Uploads/File/2020/02/20/u5e4e51460a8aa.pdf',sourcePages:['p4/print182 Fig1 天穹宝殿'],photoPeriod:'PUBLISHED_2015_PHOTO_DATE_UNCONFIRMED_NOT_CURRENT_STATE',bays:5,closedDoorBays:3,endBayAppearanceVerified:false,wholeObjectAccepted:false,currentInteriorVerified:false,frontState:'CLOSED_CENTER_DOOR_ACCESSIBLE_PORCH_FIT',platformHeight:.3,stepRises:2,stepRise:.15,stepDepth:1.4,newRooms:0,newMapItems:0,
   sourceSupported:['independently captioned Tianqiong main-hall exterior','text: five bays, yellow xieshan, south facing','photo: red front columns and three middle closed leaf groups','low grey platform and front stone approach','relative east of Jingyang and west of east passage'],
   fit:['all location/dimensions/equal bay divisions: no anchor or survey','two cropped end bays plain closed; unseen rear and side closure','coarse colors and lattice/roof details, door leaf counts fit','low .3m platform and two .15m broad game-access steps'],
   excluded:['Tianqiong entrance gate and Qinhao gate identities','compound walls/east-west wings/south rooms','incense burner, deity statues, interior pavilion and all furnishings','fine carving and copied Dunben end-window details'],unknown:['photo date and subsequent changes/current admission','measured site location and sizes','cropped end-bay appearances and unseen elevations','exact fine decorations and GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
