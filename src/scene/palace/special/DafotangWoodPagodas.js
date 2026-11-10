import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='dafotang-wood-pagodas-source-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const OFFSET=[221.9,0,241.1];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value'in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const identity=o=>o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));

/** Wang Jiapeng 2015, printed304 fig16: a pair of zitan nine-storey
 * octagonal towers with square bases, added AFTER Qianlong23. Not the user's
 * Yuan-inspired triad and not a reconstruction of the current museum display.
 * All measurements, colour, niche framing, back and plain top are model fits.
 * Unmodeled small images are not a claim that the historical niches were empty.
 * Geometry is owned here; both materials are borrowed from the caller. */
export function createDafotangWoodPagodas({materials}={}){
 if(!materials?.body?.isMaterial||!materials?.trim?.isMaterial||materials.body===materials.trim)throw Error('Two distinct borrowed wood materials required');
 const group=new T.Group(),meshes=[],owned=new Set();group.name=ID;let disposed=false;
 const keep=g=>(owned.add(g),g);
 function add(tower,role,level,geometry,material=materials.body){
  keep(geometry);geometry.translate(tower.userData.side*2.83,.9,2.4);geometry.computeBoundingBox();
  const m=new T.Mesh(geometry,material);m.name=`${ID}/${tower.userData.side}/${level}/${role}/${meshes.length}`;
  Object.assign(m.userData,{pagodaRole:role,pagodaLevel:level,pagodaSide:tower.userData.side});m.castShadow=m.receiveShadow=true;tower.add(m);meshes.push(m);return m;
 }
 function box(w,h,d,x,y,z,yaw=0){return keep(new T.BoxGeometry(w,h,d)).rotateY(yaw).translate(x,y,z);}
 function oct(top,bottom,h,y){return keep(new T.CylinderGeometry(top,bottom,h,8,1,false)).rotateY(Math.PI/8).translate(0,y,0);}
 try{
  for(const side of[-1,1]){
   const tower=new T.Group();tower.name=ID+'/'+side;tower.userData.side=side;group.add(tower);
   add(tower,'square-foot',-1,box(1.4,.2,1.4,0,.1,0),materials.trim);
   add(tower,'square-step',-1,box(1.26,.15,1.26,0,.275,0));
   add(tower,'octagonal-plinth',-1,oct(.46,.50,.5,.6));
   add(tower,'plinth-cap',-1,oct(.54,.58,.15,.925),materials.trim);
   for(let level=0;level<9;level++){
    const y=1+level*.43,r=.52-level*.025,eave=.64-level*.03;
    // The smaller core leaves eight real shallow recesses behind the eight
    // corner posts. Lintel and sill close their top and bottom; no tiny deity
    // or conjectural historical ornament is substituted for missing evidence.
    add(tower,'recess-core',level,oct(r*.80,r*.80,.35,y+.175));
    add(tower,'bay-sill',level,oct(r,r,.04,y+.02),materials.trim);
    for(let k=0;k<8;k++){
     const theta=k*Math.PI/4+Math.PI/8,width=.055*(r/.52);
     add(tower,'bay-post',level,box(width,.31,width,Math.sin(theta)*(r-width/2),y+.195,Math.cos(theta)*(r-width/2),theta),materials.trim);
    }
    add(tower,'bay-lintel',level,oct(r,r,.045,y+.3275),materials.trim);
    add(tower,'eave',level,oct(eave*.82,eave,.08,y+.39),materials.trim);
   }
   add(tower,'plain-top-base',-1,oct(.12,.25,.15,4.945));
   add(tower,'plain-top',-1,oct(.025,.12,.18,5.11),materials.trim);
  }
  const metadata={id:ID,status:'SOURCE_GUIDED_HISTORICAL_SCENE_MODEL_FIT',sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf'],sourceFigures:['2015:printed304:fig16'],materialIdentity:'ZITAN_CARVED_WOOD',addedAfter:'QIANLONG_23',yuanDesignApplied:false,currentMuseumReconstruction:false,figureCaptionLocation:'LUOYANG_MUSEUM',sourceHeight:'APPROXIMATELY_OVER_FIVE_METRES',fittedHeight:5.2,levelsPerTower:9,facesPerLevel:8,positions:[[-2.83,.9,2.4],[2.83,.9,2.4]],smallFiguresModeled:0,unmodeledDoesNotMeanHistoricallyEmpty:true,fit:['all numeric dimensions and coordinates','each tier proportion','niche depth and frames','plain top','back','neutral dark wood colour'],unmodeled:['small carved images; no allocation of textual count per face or tier','detailed railings and ornament','measured finial'],completeHistoricalDisplay:false,photographsAdded:0,newWalkables:0,newRooms:0};
  group.userData.dafotangWoodPagodas=metadata;
  const triangles=meshes.reduce((n,m)=>n+m.geometry.index.count/3,0);if(meshes.length>260||triangles>6000)throw Error('Pagoda geometry budget exceeded');
  return{group,meshes,metadata,dispose(){if(disposed)return;disposed=true;for(const geometry of owned)geometry.dispose();group.removeFromParent();}};
 }catch(error){for(const geometry of owned)geometry.dispose();throw error;}
}

function validate({kit,f,g,p}={}){
 if(p?.id!==PLACE||p.key!=='dafotang'||g?.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.front!==-8.1||g.rear!==8.1||g.inventory?.status!=='UNKNOWN'||g.historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit'||g.historicLayout?.id!=='dafotang-historic-spatial-fit-v1'||g.triadFit?.id!=='dafotang-three-design-figures-v1'||g.weituoFit?.id!=='dafotang-east-weituo-source-fit-v1'||g.woodPagodasFit||!writable(g,'woodPagodasFit')||!f||f.parent!==kit?.root||kit.root.name!=='outer-west'||kit.root.parent||!identity(kit.root)||!f.position.equals(new T.Vector3(...OFFSET))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!kit.root.matrixAutoUpdate||!kit.root.matrixWorldAutoUpdate||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned))throw Error('Exact unchanged Dafotang host required; duplicate pagodas refused');
 if(JSON.stringify(g.historicLayout.guardianSlots?.map(s=>[s.subjectId,s.position]))!==JSON.stringify([['heavenly-king',[2.83,1.32,5.6]],['weituo',[-2.83,1.32,5.6]]]))throw Error('Exact guardian slots required before pagodas');
 if(f.children.some(o=>o.name===ID||o.userData.dafotangWoodPagodas))throw Error('Duplicate pagoda geometry refused');
 for(const id of[g.historicLayout.id,g.weituoFit.id]){
  const matches=f.children.filter(o=>o.name===id);if(matches.length!==1)throw Error('Unique retained host component required');const component=matches[0];
  if(!identity(component)||!component.visible||!component.matrixAutoUpdate||!component.matrixWorldAutoUpdate||!component.children.length||component.children.some(m=>!m.isMesh||!m.visible||!identity(m)||!m.geometry?.attributes?.position||!m.geometry.index||!m.matrixAutoUpdate||!m.matrixWorldAutoUpdate))throw Error('Retained host geometry or transforms changed');
  if(id===g.weituoFit.id&&component.userData.dafotangWeituo!==g.weituoFit)throw Error('Retained Weituo metadata owner changed');
 }
 f.updateWorldMatrix(true,true);
}

/** Additive atomic installation. Existing pedestal/figure geometries, photos,
 * inventory, room and walking lists are never edited. Material buckets are
 * unique to this pair, and all CPU owners copy the actual visible triangles. */
export function buildDafotangWoodPagodas(c){
 validate(c);const{kit,f,g}=c,materials=[],contacts=[];let out,published=false;
 const prior={children:[...f.children],colliders:[...kit.colliders],owned:[...kit.owned],descriptor:Object.getOwnPropertyDescriptor(g,'woodPagodasFit')};
 try{
  for(const[name,color]of[['body',0x332820],['trim',0x514035]])materials.push(new T.MeshStandardMaterial({name:'dafotang_zitan_'+name+'_nonoriginal_fit',color,roughness:.92,metalness:0}));
  out=createDafotangWoodPagodas({materials:{body:materials[0],trim:materials[1]}});
  for(const m of out.meshes){const shape=triangleInstance(createTriangleTemplate(m.geometry),OFFSET,m.name+'/'+m.uuid),box=shape.box.clone();box.triangleSupport=shape;box.dafotangWoodPagodaMesh=m.uuid;box.dafotangWoodPagodaRole=m.userData.pagodaRole;contacts.push(box);}
  f.add(out.group);out.group.updateWorldMatrix(true,true);kit.colliders.push(...contacts);kit.owned.push(...materials);g.woodPagodasFit=out.metadata;published=true;
  return{group:out.group,meshes:out.meshes,metadata:out.metadata,contacts};
 }catch(error){
  // Bypass overridable push/add/remove methods during restoration. Clear the
  // new parent pointer before disposal so rollback cannot emit removal hooks.
  if(out?.group.parent===f)out.group.parent=null;
  Array.prototype.splice.call(f.children,0,f.children.length,...prior.children);for(const child of prior.children)child.parent=f;
  Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...prior.colliders);Array.prototype.splice.call(kit.owned,0,kit.owned.length,...prior.owned);
  if(prior.descriptor)Object.defineProperty(g,'woodPagodasFit',prior.descriptor);else delete g.woodPagodasFit;
  throw error;
 }finally{if(!published){out?.dispose();for(const material of materials)material.dispose();}}
}
