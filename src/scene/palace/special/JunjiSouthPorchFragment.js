import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='junji-south-porch-photo-fragment',done=new WeakSet();
export const JUNJI_SOURCES=Object.freeze(['https://www.dpm.org.cn/court/system/236360.html','https://img.dpm.org.cn/Uploads/Picture/2021/11/25/s619f1e0d6209d.jpg','https://www.dpm.org.cn/explore/building/236496.html']);
/** Own exterior photo only: red-column south porch, doors/windows, grey base
 * and short flights. One fitted fragment, NOT all offices or an interior. */
export function buildJunjiSouthPorchFragment(kit,item,zoneId,index,resolvedGaps){
 if(zoneId!=='axis-courts'||index!==23)return false;
 const gates=kit?.mapItems?.filter(q=>q.kind==='gate'&&q.name==='内右门'&&q.x===65.4&&q.z===203.85)??[],gap=resolvedGaps?.[0];
 if(kit?.root?.name!=='axis-courts'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||item?.kind!=='wall'||JSON.stringify(item.from)!=='[54.25,203.85]'||JSON.stringify(item.to)!=='[110.7,203.85]'||item.h!==7||item.t!==undefined||JSON.stringify(item.gaps)!=='[{"at":65.4,"gate":"内右门"}]'||gates.length!==1||resolvedGaps?.length!==1||gap.at!==65.4||!Number.isFinite(gap.w)||gap.w!==gates[0].w||gap.w<=0||gap.at+gap.w/2>=82.6||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Exact original axis23 and normally resolved inner-right gate required');
 const staged=new CourtKit(kit.lib,'axis-courts');let f,meta;
 try{
  // Keep BOTH sides and the real gate opening; the fragment is a second cut,
  // never a new inferred width or removal of the whole north boundary.
  staged.wall(54.25,203.85,110.7,203.85,{h:7,gaps:[...resolvedGaps.map(g=>({...g})),{at:88.6,w:12}]});
  f=staged.frame(88.6,201.15,0);f.name=ID;const dark=new T.MeshStandardMaterial({name:'junji-own-photo-closed-dark-window-fit',color:0x283333,roughness:.92});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m},low=[];
  low.push(box('visible-grey-low-platform','wall_brick',12,.3,5.5,0,.15,.25));
  box('closed-north-back-wall','wall_red',12,4.1,.5,0,2.35,2.7);
  for(const x of[-5.85,5.85])box('closed-end-fit','wall_red',.3,4.1,3.4,x,2.35,1);
  box('closed-door-window-backing','wall_red',11.7,3.7,.2,0,2.15,-.7);
  // Four display divisions are an engineering crop, not a verified room count.
  for(const x of[-4.5,-1.5,1.5,4.5]){
   if(x===-4.5||x===1.5){for(const dx of[-.66,.66])box('closed-red-door-leaf','wood_column',1.27,3.2,.10,x+dx,1.9,-.86);}
   else{box('grey-window-lower-wall','wall_brick',2.7,1.1,.12,x,.85,-.87);box('dark-upper-window','wood_column',2.6,1.8,.08,x,2.3,-.88).material=dark;for(const dx of[-1.3,0,1.3])box('coarse-red-window-frame','wood_column',.09,1.9,.10,x+dx,2.3,-.94);for(const y of[1.35,2.3,3.25])box('coarse-red-window-frame','wood_column',2.7,.09,.10,x,y,-.94);}
  }
  for(const x of[-5.8,-3,0,3,5.8]){const m=staged.mesh(f,new T.CylinderGeometry(.17,.19,4.1,12),kit.lib.material('wood_column'),x,2.35,-2.2);m.name=ID+'/red-round-column';box('grey-column-foot','stone_slab',.46,.2,.46,x,.4,-2.2);}
  box('coarse-blue-green-front-beam','caihua_beam',12,.48,.30,0,4.35,-2.2);box('rear-bearing-beam','caihua_beam',12,.35,.28,0,4.35,2.7);
  staged.roof(f,{type:'gable',width:12,depth:5.5,baseY:4.6,height:1.9,overhang:.3,brackets:false});
  // Two photo-informed short flight locations, count/rise/run fitted. Each
  // real box owns its top; no triangle step-air barrier or invisible ramp.
  for(const x of[-4.5,1.5])for(let i=0;i<2;i++)low.push(box('visible-short-grey-step-fit','stone_slab',2.6,(i+1)*.1,.65,x,(i+1)*.05,-3.475+i*.65));
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Keep each actual closed solid separate. A single bounding owner combining
  // disconnected walls, columns and roof can falsely treat the open porch as
  // an enclosed volume in point-inside tests. Do not create an air-room box.
  f.traverse(m=>{if(!m.isMesh||low.includes(m))return;const vertices=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??a.count);k+=3){const v=[0,1,2].map(j=>{const q=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z))});if(new T.Triangle(...v).getArea()>=1e-12)vertices.push(...v.flatMap(q=>q.toArray()));}if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}});
  for(const m of low){const b=new T.Box3().setFromObject(m);b.junjiVisibleLowSolid=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});}
  meta={id:ID,sourceObjectId:'FC-1D2C9A3A6A',name:'军机处值房局部南廊拟合',sources:[...JUNJI_SOURCES],sourceTarget:'axis-courts/items/23 ONLY x[82.6,94.6]',relativeLocationVerified:true,metricLocationVerified:false,wholeObjectAccepted:false,currentInteriorVerified:false,partialFragment:true,photoSupported:['continuous yellow roof','red round-column exterior porch','closed red doors','dark upper windows with grey lower walls','low grey plinth and short stone flights'],displayDivisions:4,displayDivisionStatus:'FITTED_CROP_NOT_VERIFIED_TOTAL_BAY_COUNT',stepStatus:'TWO_SHORT_FLIGHTS_VISIBLE_BOX_FIT_NOT_MEASURED_COUNT_OR_RISE',resolvedGapWidth:gap.w,resolvedGapAt:gap.at,oldWallActualCollisionHeight:3,platformHeight:.3,newRooms:0,newMapItems:0,unknown:['full office boundaries and exact bay/door/window counts','precise metric position/width/depth/heights and step locations','roof ends and concealed sides','photograph date and current admission','current interior furnishings','GPU/mobile visual acceptance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
