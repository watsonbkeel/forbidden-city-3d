import {buildWeiyuStudyAnnex,WEIYU_ID} from './WeiyuStudyAnnex.js';
import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jide-rear-text-fit',done=new WeakSet();
export const JIDE_FIT=Object.freeze({x:-134.5,z:282.5,width:20,depth:11,bays:5,platformHeight:.3,stepRise:.15,stepDepth:1.4,bounds:Object.freeze([-147,0,273,-122,12,292])});
/** Official-text/region-plan rear hall only. No own exterior photograph,
 * complete interior claim. The named E49 annex is a separate sourced addition.
 * All metre dimensions and the visiting door state are engineering fits. */
export function buildJideRearHall(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','regions','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-134.5,282.5,0);f.name=ID;
  const dark=new T.MeshStandardMaterial({name:'jide-window-dark-color-fit',color:0x263232,roughness:.9});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.jideStoneTop=true;return m;};
  stone('platform','wall_brick',22,.3,12,0,.15,0);
  // Real broad treads, wholly inside the cleared reserve; no invisible ramp.
  for(let i=0;i<2;i++)stone('central-step-'+i,'stone_slab',4.8,.15*(i+1),1.4,0,.075*(i+1),-8.8+1.4*i+.7);
  for(const x of[-9.825,9.825])box('closed-side-wall-fit','wall_red',.35,4.8,10.3,x,2.7,0);
  const bay=4;
  // Official prose supports four front sill-window bays and five rear ones.
  // No own facade photograph: coarse panels only, no invented fine lattice.
  const window=(role,x,z)=>{
   box(role+'-sill','wall_brick',3.82,1.1,.3,x,.85,z);
   box(role,'wood_column',3.82,3.15,.16,x,2.975,z).material=dark;
   for(const dx of[-1.9,0,1.9])box(role+'-coarse-frame','wood_column',.085,3.2,.10,x+dx,2.975,z-Math.sign(-z)*.1);
   for(const y of[1.4,4.55])box(role+'-coarse-frame','wood_column',3.88,.085,.10,x,y,z-Math.sign(-z)*.1);
  };
  for(let i=-2;i<=2;i++){
   const x=i*bay;
   if(i===0){for(let leaf=0;leaf<4;leaf++)box('closed-center-door-leaf-fit','wood_column',.94,4.3,.18,(leaf-1.5)*.95,2.45,-4.7);}
   else window('sill-window',x,-4.7);
   window('rear-sill-window',x,5.325);
  }
  box('south-facade-head','caihua_beam',20,.55,.4,0,4.95,-4.7);
  box('north-facade-head','caihua_beam',20,.55,.4,0,4.95,5.325);
  for(let i=0;i<6;i++){
   const x=-10+i*bay,m=staged.mesh(f,new T.CylinderGeometry(.20,.23,4.7,12),kit.lib.material('wood_column'),x,2.65,-5.4);m.name=ID+'/front-column';box('column-stone-foot','stone_slab',.54,.16,.54,x,.38,-5.4);
  }
  box('front-porch-beam','caihua_beam',20,.55,.42,0,4.95,-5.4);
  for(const x of[-9.85,9.85])box('porch-return-beam-fit','caihua_beam',.32,.5,.5,x,4.95,-5.15);
  const roof=staged.roof(f,{type:'xieshan',width:20,depth:11,baseY:5.2,height:2.8,overhang:.9,brackets:true});roof.name=ID+'/single-main-roof';roof.userData.jideRoof=true;
  const weiyu=buildWeiyuStudyAnnex(staged,f);
  f.updateWorldMatrix(true,true);weiyu.frame.updateWorldMatrix(true,true);
  for(const ownerRoot of[f,weiyu.frame]){let ownerIndex=0;const ownerId=ownerRoot===f?ID:WEIYU_ID;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  ownerRoot.traverse(m=>{if(!m.isMesh)return;if(m.userData.jideStoneTop||m.userData.weiyuStoneTop){const b=new T.Box3().setFromObject(m);b.jideStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false,...(m.userData.weiyuStoneTop?{sourceObjectId:'FC-59F7BB24CB',sourceMeshName:m.name}:{})});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ownerId+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });}
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-147,-1e-6,273-1e-6),new T.Vector3(-122,12,292));if(!safe.containsBox(b))throw Error('Yuqing body escaped its cleared reserve');
  meta={id:ID,sourceObjectId:'FC-7AACE4D51F',source:'https://www.dpm.org.cn/explore/building/236570.html',sourcePaper:'https://www.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf',sourcePages:['p2/print110 figure1: blue rear hall north of orange front hall; yellow connector distinct'],identityEvidence:'OFFICIAL_TEXT_REAR_HALL_AND_REGION_PLAN',ownPhoto:null,facadeVerified:false,bays:5,frontSillWindowBays:4,rearSillWindowBays:5,wholeObjectAccepted:false,currentInteriorVerified:false,frontState:'GAME_VISIT_OPEN_CENTER_FOR_NAMED_WEIYU_ROUTE',platformHeight:.3,stepRises:2,stepRise:.15,stepDepth:1.4,newRooms:0,newMapItems:0,
   sourceSupported:['official five-bay by three-bay yellow xieshan rear hall; the interior central plaque names Jide Tang','front middle connects to separate corridor; small plank door and front side sill windows; rear all sill windows','2021 region plan separately identifies rear hall north of front hall, connector between'],
   fit:['all placement/metre dimensions, compact low base and two real broad steps','plain dark window panels/coarse frames, original four middle leaves retained in an open game visiting state; colors and own present exterior details unverified','front door/window plane recessed to localZ -4.7 for safely accessible exterior platform; not surveyed porch depth','side elevations and roof dimensions engineering fit'],
   excluded:['already-built Yuqing FRONT hall and Dunben hall','connecting corridor, Wanzwei library furniture or complete maze interiors; sourced E49 annex is separately identified below','new palace walls/gates, shifted old street, borrowed front-hall photograph as rear proof'],unknown:['current facade photograph/precise exterior patterns and original dimensions','interior maze/room layout/furnishings and present admission','GPU/mobile appearance']};meta.additions=[weiyu.meta];meta.gameDoorState='GAME_VISIT_OPEN_FIT';f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);kit.rooms.push(...staged.rooms);kit.regions.push(...staged.regions);done.add(kit);return{frame:f,meta};
}
