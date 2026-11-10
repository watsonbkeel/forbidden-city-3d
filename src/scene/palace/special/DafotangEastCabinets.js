import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='dafotang-east-cabinets-source-fit-v1',PLACE='place-outer-west-6cae88b6a2',OFFSET=[221.9,0,241.1];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value'in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const identity=o=>o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const unchanged=o=>identity(o)&&o.visible&&o.matrixAutoUpdate&&o.matrixWorldAutoUpdate;
/** Direct east-wall evidence: Wang Jiapeng2015 printed306 fig22. Four tall
 * central panels and two shorter end panels behind the arhat platform.
 * ALL dimensions/coordinates/sections/colour/backing are MODEL_FIT, not survey.
 * No tsa-tsa are modeled or allocated from the textual total2188. Plain backing
 * does not claim historically empty panels. Both materials are borrowed. */
export function createDafotangEastCabinets({materials}={}){
 if(!materials?.back?.isMaterial||!materials?.frame?.isMaterial||materials.back===materials.frame)throw Error('Two distinct borrowed materials required');
 const group=new T.Group(),meshes=[],owned=new Set();group.name=ID;let disposed=false;
 function box(panel,role,w,h,d,x,y,z,material){const geometry=new T.BoxGeometry(w,h,d);owned.add(geometry);geometry.translate(x,y,z);geometry.computeBoundingBox();const mesh=new T.Mesh(geometry,material);mesh.name=`${ID}/${panel.userData.cabinetIndex}/${role}/${meshes.length}`;Object.assign(mesh.userData,{cabinetIndex:panel.userData.cabinetIndex,cabinetRole:role});mesh.castShadow=mesh.receiveShadow=true;panel.add(mesh);meshes.push(mesh);}
 try{
  const panels=[[-3.75,.90,2.25,2.70],[-1.23,1.16,3.60,2.90],[-.01,1.16,3.60,2.90],[1.21,1.16,3.60,2.90],[2.43,1.16,3.60,2.90],[4.95,.90,2.25,2.70]];
  panels.forEach(([z,w,h,bottom],i)=>{const panel=new T.Group();panel.name=ID+'/'+i;panel.userData.cabinetIndex=i;group.add(panel);const y=bottom+h/2;box(panel,'back',.04,h,w,-9.65,y,z,materials.back);for(const sign of[-1,1])box(panel,'side-frame',.10,h-.10,.05,-9.60,y,z+sign*(w/2-.025),materials.frame);for(const sign of[-1,1])box(panel,'cross-frame',.10,.05,w,-9.60,y+sign*(h/2-.025),z,materials.frame);});
  const metadata={id:ID,status:'SOURCE_GUIDED_HISTORICAL_SCENE_MODEL_FIT',sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf'],sourceFigures:['2015:printed306:fig22'],side:'east',tallCentralFrames:4,shorterEndFrames:2,dimensionStatus:'MODEL_FIT_NOT_SURVEY',fit:['all dimensions and absolute coordinates','frame sections, depth, gaps and plain backing','neutral fitted colours; no historical palette claim'],panelFit:panels.map(([z,width,height,bottom])=>({z,width,height,bottom,backX:-9.65,backDepth:.04,frameX:-9.60,frameDepth:.10,railSection:.05})),smallFiguresModeled:0,unmodeledDoesNotMeanHistoricallyEmpty:true,unmodeled:['individual tsa-tsa contents and count allocation','carving, historical colour and unseen construction','individual east arhat order'],completeHistoricalDisplay:false,photographsAdded:0,newWalkables:0,newRooms:0};
  group.userData.dafotangEastCabinets=metadata;if(meshes.length!==30||meshes.reduce((n,m)=>n+m.geometry.index.count/3,0)!==360)throw Error('East cabinet budget exceeded');
  return{group,meshes,metadata,dispose(){if(disposed)return;disposed=true;for(const geometry of owned)geometry.dispose();group.removeFromParent();}};
 }catch(error){for(const geometry of owned)geometry.dispose();throw error;}
}
function validate(c){
 const{kit,f,g,p}=c??{};
 if(p?.id!==PLACE||p.key!=='dafotang'||g?.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.front!==-8.1||g.rear!==8.1||g.inventory?.status!=='UNKNOWN'||g.historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit'||g.historicLayout?.id!=='dafotang-historic-spatial-fit-v1'||g.triadFit?.id!=='dafotang-three-design-figures-v1'||g.weituoFit?.id!=='dafotang-east-weituo-source-fit-v1'||g.woodPagodasFit?.id!=='dafotang-wood-pagodas-source-fit-v1'||g.eastCabinetsFit||!writable(g,'eastCabinetsFit')||!f||f.parent!==kit?.root||kit.root.name!=='outer-west'||kit.root.parent||!unchanged(kit.root)||!f.position.equals(new T.Vector3(...OFFSET))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.visible||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned))throw Error('Exact unchanged Dafotang host required; duplicate east cabinets refused');
 const east=g.historicLayout.arhatPlatforms?.filter(s=>s.side==='east');if(east?.length!==1||east[0].figureCount!==9||JSON.stringify(east[0].position)!=='[-8.48,0.92,0.6]')throw Error('Retained east platform metadata changed');
 const partition=g.warmRoomPartitions?.filter(s=>s.x<0);if(partition?.length!==1||Math.abs(partition[0].x-(-45.7/7*1.5))>1e-9||Math.abs(partition[0].doorZ+5.9)>1e-9||partition[0].doorW!==1.8||partition[0].doorH!==2.65)throw Error('Retained east partition metadata changed');
 if(f.children.some(o=>o.name===ID||o.userData.dafotangEastCabinets))throw Error('Duplicate east cabinet geometry refused');
 const validMesh=m=>m.isMesh&&unchanged(m)&&m.geometry?.attributes?.position&&m.geometry.index;
 for(const[key,data]of[['historicLayout','dafotangHistoricLayout'],['weituoFit','dafotangWeituo'],['woodPagodasFit','dafotangWoodPagodas']]){
  const matches=f.children.filter(o=>o.name===g[key].id);if(matches.length!==1)throw Error('Unique retained component required');const group=matches[0];if(!unchanged(group)||group.userData[data]!==g[key])throw Error('Retained component identity changed');
  if(key==='woodPagodasFit'){if(group.children.length!==2||new Set(group.children.map(t=>t.userData.side)).size!==2||group.children.some(t=>!t.isGroup||![-1,1].includes(t.userData.side)||!unchanged(t)||t.children.length!==114||t.children.some(m=>!validMesh(m))))throw Error('Retained nested pagoda geometry changed');}
  else if(!group.children.length||group.children.some(m=>!validMesh(m)))throw Error('Retained flat geometry changed');
 }
 f.updateWorldMatrix(true,true);
}
/** Atomic additive install; borrowed old geometry, rooms, walks and photos are
 * never edited. Metadata guards are not a real-host geometry acceptance test. */
export function buildDafotangEastCabinets(c){
 validate(c);const{kit,f,g}=c,materials=[],contacts=[];let out,published=false;
 const prior={children:[...f.children],colliders:[...kit.colliders],owned:[...kit.owned],descriptor:Object.getOwnPropertyDescriptor(g,'eastCabinetsFit')};
 try{
  for(const[name,color]of[['back',0x66503c],['frame',0x9c7e40]])materials.push(new T.MeshStandardMaterial({name:'dafotang_east_cabinet_'+name+'_model_fit',color,roughness:.88,metalness:0}));
  out=createDafotangEastCabinets({materials:{back:materials[0],frame:materials[1]}});
  for(const m of out.meshes){const shape=triangleInstance(createTriangleTemplate(m.geometry),OFFSET,m.name+'/'+m.uuid),box=shape.box.clone();box.triangleSupport=shape;box.dafotangEastCabinetMesh=m.uuid;box.dafotangEastCabinetRole=m.userData.cabinetRole;contacts.push(box);}
  f.add(out.group);out.group.updateWorldMatrix(true,true);kit.colliders.push(...contacts);kit.owned.push(...materials);g.eastCabinetsFit=out.metadata;published=true;
  return{group:out.group,meshes:out.meshes,metadata:out.metadata,contacts};
 }catch(error){
  if(out?.group.parent===f)out.group.parent=null;
  Array.prototype.splice.call(f.children,0,f.children.length,...prior.children);for(const child of prior.children)child.parent=f;
  Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...prior.colliders);Array.prototype.splice.call(kit.owned,0,kit.owned.length,...prior.owned);
  if(prior.descriptor)Object.defineProperty(g,'eastCabinetsFit',prior.descriptor);else delete g.eastCabinetsFit;
  throw error;
 }finally{if(!published){out?.dispose();for(const material of materials)material.dispose();}}
}
