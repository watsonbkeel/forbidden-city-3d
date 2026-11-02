import * as T from 'three';
import {buildRoof} from '../../RoofBuilder.js';
import {validateNansansuoInventoryPolicy} from '../NansansuoInventoryPolicy.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const RECORDS=[{index:12,name:'南三所西所前殿',x:-251.8,id:'FC-172C8CBF68',profile:'place-outer-east-172c8cbf68'},{index:14,name:'南三所中所前殿',x:-285.4,id:'FC-C1914091EC',profile:'place-outer-east-c1914091ec'},{index:16,name:'南三所东所前殿',x:-317.4,id:'FC-2E6207278C',profile:'place-outer-east-2e6207278c'}];
const builtFrontFrames=new WeakSet();
export const isBuiltNansansuoFrontFrame=frame=>builtFrontFrames.has(frame);
const ARRAYS=['colliders','walkables','rooms','regions','mapItems','plaques','owned'];
const tag=(m,role)=>{m.name=`nansansuo-front:${role}`;m.userData.nansansuoFrontHall={role};return m;};
const params=item=>{const p={};for(const k of['x','z','w','d','colH','roof','enter','interior','name'])if(Object.hasOwn(item,k))p[k]=item[k];return {...p,rot:0}};
function validate(kit,item,{zoneId,itemIndex,zoneJson}){
 const record=RECORDS.find(r=>r.index===itemIndex);if(zoneId!=='outer-east'||!record)return null;
 if(zoneJson?.id!==zoneId||zoneJson.items?.[itemIndex]!==item||item.name!==record.name||zoneJson.items.filter(q=>q?.kind==='hall'&&q.name===record.name).length!==1)throw Error('Nansansuo front requires exact unique original declaration');
 validateNansansuoInventoryPolicy({zoneId,itemIndex,item},params(item));
 const root=kit.root,writable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
 if(root.name!==zoneId||root.parent||!root.visible||!root.matrixAutoUpdate||!Object.isExtensible(root)||!Object.getOwnPropertyDescriptor(root,'children')?.writable||!writable(root.children)||ARRAYS.some(k=>!writable(kit[k]))||root.position.lengthSq()||root.rotation.toArray().slice(0,3).some(Boolean)||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||root.children.some(f=>f.userData.nansansuoFrontHall?.objectId===record.id))throw Error('Nansansuo front root/array/duplicate contract mismatch');
 return record;
}
/** Only the three inherited south-row shells. The nine-hall stage grid remains
 * unresolved. No relocation, new third row, historical furniture or back-row edit.
 * Existing strict UNKNOWN inventory API builds the retained base/room first. */
export function buildNansansuoFrontHall(kit,item,context){
 const record=validate(kit,item,context);if(!record)return null;
 const tmp=Object.assign(Object.create(Object.getPrototypeOf(kit)),kit,{root:new T.Group()});tmp.root.name=kit.root.name;for(const k of ARRAYS)tmp[k]=[];
 const geometries=new Set(),materials=[],sourceMesh=kit.mesh;tmp.mesh=function(parent,g,...rest){geometries.add(g);return sourceMesh.call(this,parent,g,...rest)};
 const collect=root=>root.traverse(m=>{if(m.isMesh)geometries.add(m.geometry)});
 const dispose=()=>{collect(tmp.root);for(const g of geometries)g.dispose();for(const m of materials)m.dispose()};
 let built,geometry;
 try{
  // Material/UV dependencies are resolved before legacy roof allocation. All
  // shared handles are borrowed read-only; plain own palette is private.
  const keys=['sumeru_band','stone_slab','marble','wood_column','caihua_beam','wall_red','lattice_doors','roof_tile','rafters','dougong_band'],cache=new Map(keys.map(n=>[n,kit.lib.material(n)])),tiles=new Map(keys.map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(keys.map(n=>[n,kit.lib.aspect(n)]));
  tmp.lib={material:n=>{if(!cache.has(n))throw Error('Unexpected retained front material');return cache.get(n)},tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  built=tmp.nansansuoUnknownHall(params(item),{zoneId:context.zoneId,itemIndex:context.itemIndex,item});const f=built.f;collect(f);
  const retained=f.children.filter(m=>m.isMesh&&(m.material===kit.floorMat||m.material===cache.get('marble')||m.material===cache.get('sumeru_band')&&m.position.y===.45||m.material===cache.get('stone_slab')&&Math.abs(m.position.y-.87)<1e-6));
  if(retained.length!==11||tmp.walkables.length!==2||tmp.rooms.length!==1||!tmp.colliders[0])throw Error('Retained front floor/step/room contract drift');
  const kept=new Set(retained);for(const child of[...f.children])if(!kept.has(child))f.remove(child);
  tmp.colliders=[tmp.colliders[0]];tmp.plaques=[];
  const own=(name,color,roughness)=>{const m=new T.MeshStandardMaterial({name,color,roughness});materials.push(m);tmp.owned.push(m);return m};
  const green=own('nansansuo_front_green_glaze',0x396b4a,.43),red=own('nansansuo_front_plain_red',0x792e24,.74),wood=own('nansansuo_front_plain_timber',0x4b352b,.85);
  const w=item.w,d=item.d,ph=.9,top=ph+item.colH,beamH=item.colH*.12,wallH=item.colH-beamH,doorH=wallH*.8,clear=2.65,axes=[-w/2,-w/6,w/6,w/2],front=-d/2;let ordinal=0;
  const box=(role,mat,W,H,D,x,y,z,parent=f)=>tag(tmp.mesh(parent,new T.BoxGeometry(W,H,D),mat,x,y,z),role);
  const solid=(role,mat,W,H,D,x,y,z)=>{const m=box(role,mat,W,H,D,x,y,z);register(tmp,m,`${record.index}:${role}:${ordinal++}`);return m};
  const col=new T.CylinderGeometry(.22,.24,item.colH,12);
  for(const z of[front,-front])for(const x of axes){const m=tag(tmp.mesh(f,col,red,x,ph+item.colH/2,z),'column');register(tmp,m,`${record.index}:column:${ordinal++}`)}
  for(const z of[front,-front])solid('plain-long-beam',wood,w+.5,beamH,.45,0,top-beamH/2,z);
  for(const side of[-1,1]){
   solid('retained-envelope-side-wall',red,.7,wallH,d,side*w/2,ph+wallH/2,0);
   solid('unverified-opaque-front-flank',red,w/3-.48,wallH,.20,side*w/3,ph+wallH/2,front);
   solid('plain-central-jamb',red,.18,doorH,.25,side*(clear/2+.09),ph+doorH/2,front);
   const inner=clear/2+.18,outer=w/6-.24;solid('technical-central-side-closure',red,outer-inner,wallH,.20,side*(inner+outer)/2,ph+wallH/2,front);
   const leaf=new T.Group();leaf.position.set(side*clear/2,ph,front);leaf.rotation.y=side*Math.PI/2;f.add(leaf);const m=box('virtual-plain-open-leaf',red,clear/2-.02,doorH,.12,-side*(clear/2-.02)/2,doorH/2,0,leaf);register(tmp,m,`${record.index}:leaf:${side}`);
  }
  solid('retained-closed-back-envelope',red,w,wallH,.6,0,ph+wallH/2,d/2);
  solid('central-head',red,clear+.36,wallH-doorH,.25,0,ph+doorH+(wallH-doorH)/2,front);
  // Technical plain ceiling, not a sourced painted ceiling or hidden timber census.
  solid('plain-technical-ceiling',wood,w,.10,d,0,top-beamH-.05,0);
  const roofLib={material:n=>n==='roof_tile'?green:n==='wall_red'?red:wood,tileSize:()=>1,aspect:()=>1};
  const roof=buildRoof(roofLib,{type:'xieshan',width:w,depth:d,baseY:top,height:4,overhang:1.2,layers:1,brackets:false,detail:'low'});collect(roof);f.add(roof);roof.name='nansansuo-front:green-xieshan';roof.userData.nansansuoFrontRoof=true;
  roof.traverse(m=>{if(m.isMesh&&['roof_ridge_glaze','roof_finial_gold'].includes(m.material.name))m.material=green});for(const m of roof.userData.ownedMaterials??[])m.dispose();roof.userData.ownedMaterials=[];register(tmp,roof,`${record.index}:actual-complete-roof`);
  geometry={objectId:record.id,name:record.name,bays:3,columnAxes:axes,roof:'green-single-eave-xieshan',x:item.x,z:item.z,width:w,depth:d,floorY:ph,columnTopY:top,centralClearWidth:clear,retainedLowMeshes:11,surveyed:false,wholeObjectAccepted:false,dimensionStatus:'ORIGINAL_ENVELOPE_AND_FLOOR_WITH_BOUNDED_THREE_BAY_ENGINEERING_FIT_NOT_SURVEY',stageGrid:'THREE_EXISTING_SOUTH_ROW_SHELLS_ONLY; MIDDLE_REAR_MAPPING_REMAINS_UNRESOLVED',doorPose:'VIRTUAL_PLAIN_OPEN_LEAVES_NOT_OBSERVED_STATE',unseen:'Exact front lattice/window divisions, painting, plaques, roof ornaments, bracket detail, hidden north details and current interior inventory unverified; technical plain closures are not reconstructions',source:'https://www.dpm.org.cn/explore/building/236452.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/4647[1024].jpg',map:'https://img.dpm.org.cn/static/themes/image/xf/map3.jpg',typeConfirmation:'https://www.sina.cn/news/detail/5074467804153118.html',sourceBoundary:'2024 publisher-authenticated text distinguishes the three first-court halls as three-bay xieshan; no fine author photograph detail copied',contact:'Actual upper source mesh triangles; unchanged original platform/steps/walkables and strict UNKNOWN room policy'};
  f.userData.nansansuoFrontHall=geometry;f.userData.structure={...geometry,id:record.profile,scope:'OWN_EXISTING_FRONT_HALL_ONLY',canonicalName:record.name};built.geometry=geometry;
 }catch(error){dispose();throw error}
 const children=[...kit.root.children],snapshots=Object.fromEntries(ARRAYS.map(k=>[k,[...kit[k]]]));
 try{const offset=kit.rooms.length;tmp.rooms.forEach((r,i)=>r.id=offset+i);kit.root.add(built.f);for(const k of ARRAYS)kit[k].push(...tmp[k]);}
 catch(error){kit.root.children=children;for(const f of children)f.parent=kit.root;built.f.parent=tmp.root;for(const k of ARRAYS)Array.prototype.splice.call(kit[k],0,kit[k].length,...snapshots[k]);dispose();throw error}
 const alive=new Set();built.f.traverse(m=>{if(m.isMesh)alive.add(m.geometry)});for(const g of geometries)if(!alive.has(g))g.dispose();
 builtFrontFrames.add(built.f);return built;
}
function register(kit,root,id){kit.root.updateMatrixWorld(true);const values=[];root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const vs=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld));if(new T.Triangle(...vs).getArea()<1e-12)continue;for(const v of vs)values.push(v.x,v.y,v.z)}});const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`nansansuo-front:${id}`),b=owner.box.clone();b.triangleSupport=owner;kit.colliders.push(b)}finally{g.dispose()}}
