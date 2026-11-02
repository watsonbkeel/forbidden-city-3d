import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='dunben-front-photo-fit',done=new WeakSet();
export const DUNBEN_FIT=Object.freeze({x:-134.5,z:226,width:20,depth:11,bays:5,platformHeight:.3,stepRise:.15,stepDepth:1.4,bounds:Object.freeze([-147,0,211,-122,12,238])});
/** Own LOWER photo print41 is explicitly PRE-REPAIR Dunben, not Yuqing.
 * Three middle closed-door bays and two end windows; no current-state claim.
 * Location, low accessible platform, hidden faces and subdivisions are fits. */
export function buildDunbenFrontHall(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-134.5,226,0);f.name=ID;
  const dark=new T.MeshStandardMaterial({name:'dunben-window-dark-color-fit',color:0x263232,roughness:.9});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.dunbenStoneTop=true;return m;};
  stone('platform','wall_brick',22,.3,14,0,.15,0);
  stone('moon-platform','wall_brick',14,.3,4,0,.15,-9);
  // Real broad treads, wholly inside the cleared reserve; no invisible ramp.
  for(let i=0;i<2;i++)stone('central-step-'+i,'stone_slab',4.8,.15*(i+1),1.4,0,.075*(i+1),-13.8+1.4*i+.7);
  box('closed-back-wall-fit','wall_red',20,4.8,.35,0,2.7,5.325);
  for(const x of[-9.825,9.825])box('closed-side-wall-fit','wall_red',.35,4.8,10.3,x,2.7,0);
  box('south-facade-head','caihua_beam',20,.55,.4,0,4.95,-5.1);
  const bay=4;
  // The photo resolves the centre closed door and recessed side windows.
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
    box('grey-window-sill','wall_brick',bay-.18,1.1,.3,x,.85,-5.1);
    box('sill-window','wood_column',bay-.18,3.15,.16,x,2.975,-5.12).material=dark;
    for(const dx of[-bay/2+.09,-bay/4,0,bay/4,bay/2-.09])box('coarse-window-upright-fit','wood_column',.085,3.2,.10,x+dx,2.975,-5.25);
    for(const y of[1.4,2.98,4.55])box('coarse-window-crossbar-fit','wood_column',bay-.12,.085,.10,x,y,-5.25);
   }
  }
  for(let i=0;i<6;i++){
   const x=-10+i*bay,m=staged.mesh(f,new T.CylinderGeometry(.20,.23,4.7,12),kit.lib.material('wood_column'),x,2.65,-6);m.name=ID+'/front-column';box('column-stone-foot','stone_slab',.54,.16,.54,x,.38,-6);
  }
  box('front-porch-beam','caihua_beam',20,.55,.42,0,4.95,-6);
  for(const x of[-9.85,9.85])box('porch-return-beam-fit','caihua_beam',.32,.5,.9,x,4.95,-5.55);
  const roof=staged.roof(f,{type:'xieshan',width:20,depth:11,baseY:5.2,height:2.8,overhang:.9,brackets:true});roof.name=ID+'/single-main-roof';roof.userData.dunbenRoof=true;
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.dunbenStoneTop){const b=new T.Box3().setFromObject(m);b.dunbenStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-147,-1e-6,211-1e-6),new T.Vector3(-122,12,238));if(!safe.containsBox(b))throw Error('Dunben body escaped its cleared reserve');
  meta={id:ID,sourceObjectId:'FC-1ED6740852',source:'https://www.dpm.org.cn/explore/building/236570.html',sourcePaper:'https://img.dpm.org.cn/Uploads/File/2020/08/20/u5f3df3653f823.pdf',sourcePages:['p6/print41 LOWER: 大修前惇本殿外景'],photoPeriod:'EXPLICIT_PRE_REPAIR_PHOTOGRAPH_NOT_CURRENT_STATE',regionPlan:'https://www.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf',bays:5,closedDoorBays:3,sillWindowBays:2,wholeObjectAccepted:false,currentInteriorVerified:false,frontState:'CLOSED_CENTER_DOOR_ACCESSIBLE_PORCH_FIT',platformHeight:.3,stepRises:2,stepRise:.15,stepDepth:1.4,newRooms:0,newMapItems:0,
   sourceSupported:['independently captioned Dunben pre-repair exterior','five-bay yellow xieshan','six red front columns with recessed facade','three middle closed-door bays and two end sill-window bays','low grey platform and front stone approach'],
   fit:['all location/dimensions/equal bay divisions: not survey','all unseen rear and side closure','coarse colors and lattice/roof details, door leaf counts fit','low .3m platform and two .15m broad game-access steps'],
   excluded:['Yuqing front hall identity','Jide rear hall and connector','east/west wings and gate sequence','two photographed tubs and fine imperial-stone carving','all interior and furnishings'],unknown:['photograph date and post-repair changes/current admission','measured site location and sizes','unseen elevations and exact fine decorations','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
