import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jiuqing-south-porch-photo-fragment',done=new WeakSet();
export const JIUQING_SOURCE='https://img.dpm.org.cn/Uploads/pdf/1520/T00007_00.pdf';
/** 1986 journal p7 fig1: only a coarse visible porch fragment. Black-and-white
 * source does not verify color, current condition, exact bays or a whole office. */
export function buildJiuqingSouthPorchFragment(kit,item,zoneId,index,resolvedGaps){
 if(zoneId!=='axis-courts'||index!==21)return false;
 const gates=kit?.mapItems?.filter(q=>q.kind==='gate'&&q.name==='内左门'&&q.x===-62.4&&q.z===203.85)??[],gap=resolvedGaps?.[0];
 if(kit?.root?.name!=='axis-courts'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||item?.kind!=='wall'||JSON.stringify(item.from)!=='[-54.25,203.85]'||JSON.stringify(item.to)!=='[-106.47,203.85]'||item.h!==7||item.t!==undefined||JSON.stringify(item.gaps)!=='[{"at":-62.4,"gate":"内左门"}]'||gates.length!==1||resolvedGaps?.length!==1||gap.at!==-62.4||gap.w!==6.4||gap.w!==gates[0].w||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Original axis21 with normally resolved inner-left gap required');
 const staged=new CourtKit(kit.lib,'axis-courts');let f,meta;
 try{
  staged.wall(-54.25,203.85,-106.47,203.85,{h:7,gaps:[...resolvedGaps.map(g=>({...g})),{at:-87.3,w:9}]});
  f=staged.frame(-87.3,201.7,0);f.name=ID;
  const dark=new T.MeshStandardMaterial({name:'jiuqing-closed-window-color-fit',color:0x323839,roughness:.92});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m};
  const platform=box('low-grey-platform','wall_brick',9,.2,5.4,0,.1,-.2);platform.userData.jiuqingVisiblePlatform=true;
  box('closed-north-back-wall','wall_red',9,4.1,.5,0,2.25,2.15);
  for(const x of[-4.35,4.35])box('closed-end-fit','wall_red',.3,4.1,2.6,x,2.25,.85);
  box('closed-door-window-backing','wall_red',8.7,3.7,.2,0,2.05,-.45);
  // Three displayed sections fit a short crop, not the full historical bay count.
  for(const x of[-2.9,0,2.9]){
   if(x===0){for(const dx of[-.64,.64])box('closed-door-leaf-color-fit','wood_column',1.23,3.2,.10,x+dx,1.8,-.60);}
   else{box('grey-lower-window-wall','wall_brick',2.65,1.05,.12,x,.725,-.59);box('dark-upper-window-fit','wood_column',2.55,1.9,.08,x,2.25,-.66).material=dark;for(const dx of[-1.29,0,1.29])box('coarse-window-frame-color-fit','wood_column',.085,2,.10,x+dx,2.25,-.72);for(const y of[1.29,2.25,3.21])box('coarse-window-frame-color-fit','wood_column',2.65,.085,.10,x,y,-.72);}
  }
  for(const x of[-4.2,-1.4,1.4,4.2]){const m=staged.mesh(f,new T.CylinderGeometry(.16,.18,4.1,12),kit.lib.material('wood_column'),x,2.25,-2);m.name=ID+'/round-porch-column-color-fit';box('grey-column-foot','stone_slab',.43,.18,.43,x,.29,-2);}
  box('front-beam-color-fit','caihua_beam',9,.45,.28,0,4.2,-2);box('rear-bearing-beam-color-fit','caihua_beam',9,.35,.28,0,4.25,2.15);
  // Hidden roof ends and metric section are fitted; no copied office identity.
  staged.roof(f,{type:'gable',width:8.2,depth:4.6,baseY:4.4,height:1.65,overhang:.3,brackets:false});
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate actual mesh owners: never join disconnected walls/columns into
  // one point-inside volume which would block the visibly open porch.
  f.traverse(m=>{if(!m.isMesh||m===platform)return;const vertices=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??a.count);k+=3){const v=[0,1,2].map(j=>{const q=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z))});if(new T.Triangle(...v).getArea()>=1e-12)vertices.push(...v.flatMap(q=>q.toArray()));}if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}});
  const b=new T.Box3().setFromObject(platform);b.jiuqingVisiblePlatform=true;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});
  meta={id:ID,sourceObjectId:'FC-CC6E0C0C81',source:JIUQING_SOURCE,sourceCaption:'1986 issue1 p7 figure1 清代九卿房原址',sourceTarget:'axis-courts/items/21 ONLY x[-91.8,-82.8]',partialFragment:true,wholeObjectAccepted:false,currentConditionVerified:false,currentInteriorVerified:false,
   photoSupported:['row of exterior columns','recessed closed door/window facade','low masonry base','projecting eave'],displayDivisions:3,divisionStatus:'CROPPED_ENGINEERING_FIT_NOT_TOTAL_BAYS',colorStatus:'ALL_COLORS_FITTED_BLACK_AND_WHITE_SOURCE',roofEndsStatus:'UNVERIFIED_ENGINEERING_GABLE_FIT',locationStatus:'RELATIVE_AREA_SOURCE_SUPPORTED_METRIC_POSITION_FITTED_NOT_SURVEY',platformHeight:.2,resolvedGapAt:gap.at,resolvedGapWidth:gap.w,newRooms:0,newMapItems:0,
   unknown:['current appearance and admission','full office boundary and exact bay/window count','measured coordinates/heights/depth and original colors','hidden roof ends/back/sides','current furnishings','GPU/mobile appearance'],excludedIdentities:['FC-A9B0A95830','FC-418DFCE4F5']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
