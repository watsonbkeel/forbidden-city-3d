import * as T from 'three';
import {SUIAN_SOURCE} from './YangxinSuianSource.js';
const PREFIX='R179_SU_';
const FRAME=[-16.15,-14.45],APERTURE=[-16.05,-14.55];
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:!(k in o)&&Object.isExtensible(o)};
const identity=m=>m.matrixAutoUpdate&&m.matrixWorldAutoUpdate&&m.position.lengthSq()===0&&m.quaternion.equals(new T.Quaternion())&&m.scale.equals(new T.Vector3(1,1,1));
function signature(m){return {name:m.name,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,data:m.userData,attrs:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,array:Array.from(a.array)}])),index:{type:m.geometry.index.array.constructor.name,array:Array.from(m.geometry.index.array)},material:{name:m.material.name,side:m.material.side,map:m.material.map?.name??null,color:m.material.color.toArray(),roughness:m.material.roughness}}}
/** Source-bound room topology and a plain south frame. No exact carving,
 * measured dimensions, new external shell, furniture or historical door pose.
 * All guards/allocation precede publication; only this exact board/proxy changes. */
export function installYangxinSuianRoom(root){
 if(!root?.isObject3D||root.parent||root.name!=='Scene'||!root.visible||!identity(root)||!Array.isArray(root.children)||!Object.isExtensible(root.children)||!Object.getOwnPropertyDescriptor(root.children,'length')?.writable||root.userData.suianRoom||!writable(root.userData,'suianRoom'))throw Error('Suian requires writable Yangxin source root once only');
 if(root.children.some((_,i)=>{const d=Object.getOwnPropertyDescriptor(root.children,String(i));return !d||!d.writable||!d.configurable}))throw Error('Suian requires writable child slots');
 if(root.userData.yangxinEastNorthSurface?.applied!==true||root.userData.yangxinEastNorthSurface.scope!=='FIVE_EXISTING_NORTH_PANELS_FINISH_ONLY'||root.userData.yangxinMainPartitions?.applied!==true||root.userData.yangxinFoldedDoors?.applied!==true)throw Error('Suian requires all preceding Yangxin stages');
 const names=new Map(),refs=new Map();root.traverse(m=>{if(m.isMesh){if(names.has(m.name)||m.name.startsWith(PREFIX)||m.name.startsWith('COL_'+PREFIX))throw Error('Suian duplicate source owner');names.set(m.name,m);refs.set(m.geometry,(refs.get(m.geometry)??0)+1)}});
 const sources=SUIAN_SOURCE.map(s=>{const m=names.get(s.name),g=m?.geometry,a=m?.material;if(!m||m.parent!==root||m.children.length||!writable(m,'geometry')||!writable(m,'parent')||!g?.isBufferGeometry||refs.get(g)!==1||g.groups.length||Object.keys(g.morphAttributes).length||g.drawRange.start!==0||g.drawRange.count!==Infinity||!a?.isMeshStandardMaterial||a.transparent||a.opacity!==1||!a.depthWrite||!a.colorWrite||!a.visible||a.wireframe||a.alphaTest||a.alphaMap||a.normalMap||a.bumpMap||a.displacementMap||a.clippingPlanes||JSON.stringify(signature(m))!==JSON.stringify(s))throw Error('Suian exact source changed '+s.name);return m});
 const [board,oldProxy]=sources;
 if(names.get('R88_YX_NORTH_EAST')?.material!==board.material||!board.material.map?.isTexture||board.material.map.name!=='r164-yangxin-east-north-panel')throw Error('Suian shared north material changed');
 const oldGeometry=board.geometry,oldProxyGeometry=oldProxy.geometry,oldChildren=[...root.children];
 const metaDescriptor=Object.getOwnPropertyDescriptor(root.userData,'suianRoom');
 const allocated=new Set(),group=new T.Group();group.name='r179-yangxin-suian-room';let material,retained,meta;
 const geo=(w,h,d)=>{const g=new T.BoxGeometry(w,h,d);allocated.add(g);g.computeBoundingBox();g.computeBoundingSphere();return g};
 const addProxy=(name,g,pos,owner,role)=>{const m=new T.Mesh(g,oldProxy.material);m.name='COL_'+PREFIX+name;m.position.copy(pos);m.userData={visibleOwner:owner,role,sourceObjectId:'FC-8E4E75BF02',fit:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED'};group.add(m);return m};
 const cleanup=()=>{const errors=[];for(const resource of [...allocated,...(material?[material]:[])])try{resource.dispose()}catch(error){errors.push(String(error?.message??error))}return errors};
 try{
  // Retained geometry keeps the original board coordinate system and UV field.
  // The whole frame strip is removed, not only the clear opening below its lintel.
  const p=oldGeometry.attributes.position;oldGeometry.computeBoundingBox();
  const left=board.position.x+oldGeometry.boundingBox.min.x,right=board.position.x+oldGeometry.boundingBox.max.x;
  for(const [name,a,b]of [['retained-east',left,FRAME[0]],['retained-west',FRAME[1],right]]){
   const g=geo(b-a,2.75,.12),v=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
   for(let i=0;i<v.count;i++){v.setX(i,v.getX(i)+(a+b)/2-board.position.x);if(Math.abs(n.getZ(i))===1)uv.setXY(i,(v.getX(i)/7.75+.5)*5,v.getY(i)/2.75+.5);else uv.setXY(i,.01,.01)}g.computeBoundingBox();g.computeBoundingSphere();
   if(name==='retained-east')retained=g;
   else{const m=new T.Mesh(g,board.material);m.name=PREFIX+name;m.position.copy(board.position);m.userData={role:'suian-retained-north-board',sourceOwner:board.name,sourceObjectId:'FC-8E4E75BF02'};group.add(m)}
   addProxy(name,g,board.position,name==='retained-east'?board.name:PREFIX+name,'suian-retained-board-proxy');
  }
  material=new T.MeshStandardMaterial({name:'r179-suian-plain-wood-fit',color:0x673827,roughness:.8,metalness:0});
  const solid=(name,a,b,role)=>{const g=geo(b[0]-a[0],b[1]-a[1],b[2]-a[2]),pos=new T.Vector3(...a.map((v,i)=>(v+b[i])/2)),m=new T.Mesh(g,material);m.name=PREFIX+name;m.position.copy(pos);m.userData={role,sourceObjectId:'FC-8E4E75BF02',fit:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED'};group.add(m);addProxy(name,g,pos,m.name,role)};
  solid('west-divider',[-14.36,0,.51],[-14.24,3.31,5.7],'suian-west-divider');
  solid('east-wall-closure',[-17.65,0,.39],[left,3.31,.51],'suian-east-wall-closure');
  solid('east-jamb',[FRAME[0],0,.39],[APERTURE[0],2.75,.51],'suian-south-fixed-jamb');
  solid('west-jamb',[APERTURE[1],0,.39],[FRAME[1],2.75,.51],'suian-south-fixed-jamb');
  solid('south-lintel',[APERTURE[0],2.5,.39],[APERTURE[1],2.84,.51],'suian-south-fixed-lintel');
  meta={applied:true,sourceObjectId:'FC-8E4E75BF02',name:'随安室',scope:'BASIC_ROOM_TOPOLOGY_AND_SOUTH_FIXED_FRAME',completeFurnishing:false,fit:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED',surveyCoordinates:null,sources:[{url:'https://www.dpm.org.cn/Uploads/File/2021/04/19/u607d452b5ff72.pdf',printedPage:258,figure:1,role:'NAMED_ROOM_ADJACENCY'},{url:'https://img.dpm.org.cn/Uploads/File/2022/08/29/u630c3a51986c6.pdf',printedPages:[110,111],role:'NAMED_ROOM_AND_TWO_OPPOSED_INTERIOR_VIEWS'}],bounds:{x:[-17.65,-14.36],z:[.51,5.7]},door:{x:APERTURE,z:.45,width:1.5,height:2.5},frameReplacementStrip:FRAME,retainedNorthDoor:{x:[-9.7,-7.9],z:.45},topologyChange:'NORTH_REAR_EAST_WEST_CROSSING_REPLACED_BY_SEPARATE_SOUTH_ENTRIES',incomplete:['Exact carved profiles, patterns and historical opening posture','North bed, plaque, lamps and complete furnishings','Surveyed dimensions and GPU acceptance']};
  root.add(group);
  board.geometry=retained;
  root.remove(oldProxy);
  root.userData.suianRoom=meta;
  // Publication has committed. Retirement is deliberately outside rollback:
  // a throwing dispose listener must never reattach a retired source object.
 }catch(error){
  board.geometry=oldGeometry;
  // Direct restoration avoids replaying a throwing publication event listener.
  for(const child of root.children)if(!oldChildren.includes(child))child.parent=null;
  root.children.splice(0,root.children.length,...oldChildren);for(const child of oldChildren)child.parent=root;
  if(metaDescriptor)Object.defineProperty(root.userData,'suianRoom',metaDescriptor);else delete root.userData.suianRoom;
  const cleanupErrors=cleanup();if(cleanupErrors.length)error.suianCleanupErrors=cleanupErrors;throw error;
 }
 const errors=[];for(const [owner,resource]of[[board.name,oldGeometry],[oldProxy.name,oldProxyGeometry]])try{resource.dispose()}catch(error){errors.push({owner,message:String(error?.message??error)})}
 meta.retirement={complete:errors.length===0,errors};return meta;
}
