import {CourtKit} from '../kit.js';
import * as T from 'three';
import {buildRoof} from '../../RoofBuilder.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {QIANDONG_SECOND_FRONT_COURT as P,validateQiandongSecondFrontCourt} from './QiandongSecondFrontCourtProfile.js';
const ARRAYS=['colliders','walkables','rooms','mapItems','regions','plaques','owned'];
const KEY='qiandongSecondFrontOwner';
function selected(kit,item,zone,key,other){
 if(!item||!Object.hasOwn(item,key))return false;
 validateQiandongSecondFrontCourt(zone);
 if(item!==zone.items[key==='qiandongSecondFrontGate'?58:59]||Object.hasOwn(item,other))throw Error('Qiandong front selector identity mismatch');
 const writable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
 const r=kit.root;
 if(r.name!=='east-six'||r.parent||!r.visible||!r.matrixAutoUpdate||r.position.lengthSq()||r.rotation.toArray().slice(0,3).some(Boolean)||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!writable(r.children)||ARRAYS.some(k=>!writable(kit[k]))||r.children.some(o=>o.userData[KEY]===key))throw Error('Qiandong front kit root/arrays/duplicate mismatch');
 return true;
}
/** Atomic local staging, using the real CourtKit methods, not a parallel kit.
 * Library/retained kit materials are borrowed; only new geometries are freed
 * on rollback. RoofBuilder's own temporary materials are adopted once. */
function stage(kit,key,build){
 const tmp=Object.assign(Object.create(Object.getPrototypeOf(kit)),kit,{root:new T.Group()});tmp.root.name=kit.root.name;
 for(const k of ARRAYS)tmp[k]=[];
 const geos=new Set(),mesh=kit.mesh;
 tmp.mesh=function(parent,g,...rest){geos.add(g);return mesh.call(this,parent,g,...rest)};
 const cleanup=()=>{tmp.root.traverse(o=>{if(o.isMesh)geos.add(o.geometry)});for(const g of geos)g.dispose();for(const m of tmp.owned)m.dispose()};
 let result;
 try{result=build(tmp);result.source.userData[KEY]=key;tmp.root.updateMatrixWorld(true)}catch(e){cleanup();throw e}
 // Capture RoofBuilder meshes too before reparenting removes them from tmp.
 result.source.traverse(o=>{if(o.isMesh)geos.add(o.geometry)});
 const children=[...kit.root.children],arrays=Object.fromEntries(ARRAYS.map(k=>[k,[...kit[k]]]));
 try{kit.root.add(result.source);for(const k of ARRAYS)kit[k].push(...tmp[k])}
 catch(e){kit.root.children=children;for(const c of children)c.parent=kit.root;result.source.parent=tmp.root;for(const k of ARRAYS)Array.prototype.splice.call(kit[k],0,kit[k].length,...arrays[k]);cleanup();throw e}
 return result;
}
function box(kit,frame,role,w,h,d,x,y,z,collision=true){
 const mat=kit.lib.material(role==='floor'?'stone_slab':'wall_red');
 const m=kit.mesh(frame,new T.BoxGeometry(w,h,d),mat,x,y,z);m.name=`qiandong-front:${role}`;m.userData.qiandongRole=role;
 if(collision)kit.col(frame,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);
 return m;
}
function roof(kit,frame,{width,depth,baseY,height,type,id}){
 const r=buildRoof(kit.lib,{width,depth,baseY,height,type,overhang:P.fit.roofOverhang,layers:1,brackets:false,detail:'low'});
 frame.add(r);kit.adopt(r);r.name='qiandong-front:roof';r.userData.qiandongRole='roof';
 triangles(kit,r,id);
 return r;
}
function triangles(kit,root,id){
 kit.root.updateMatrixWorld(true);const values=[];
 root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const vs=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(m.matrixWorld));if(new T.Triangle(...vs).getArea()<1e-12)continue;for(const v of vs)values.push(v.x,v.y,v.z)}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));
 try{const owner=triangleInstance(createTriangleTemplate(g),[0,0,0],`qiandong-front:actual-roof:${id}`);const b=owner.box.clone();b.triangleSupport=owner;kit.colliders.push(b)}finally{g.dispose()}
}
export function buildQiandongSecondFrontGate(kit,item,zoneJson){
 if(!selected(kit,item,zoneJson,'qiandongSecondFrontGate','qiandongSecondFrontCourt'))return null;
 return stage(kit,'qiandongSecondFrontGate',tmp=>{
  const source=tmp.frame(item.x,item.z),net=P.fit.gateNetWidth,flank=(item.w-net)/2;
  // No platform or street ramp: threshold remains existing earth level y=0.
  // Separate 2.4m-deep roof is overhead-only. Net door height 4.6m; the
  // solid upper transom joins the original tall perimeter without fake air.
  // Ground-bearing flanks fit entirely in the retained 1m-thick wall band.
  for(const side of[-1,1])box(tmp,source,'gate-flank',flank,P.fit.gateRoofBaseY,P.fit.gateDepth,side*(net/2+flank/2),P.fit.gateRoofBaseY/2,0);
  box(tmp,source,'gate-head',net,P.fit.gateRoofBaseY-P.fit.gateNetHeight,P.fit.gateDepth,0,(P.fit.gateRoofBaseY+P.fit.gateNetHeight)/2,0);
  roof(tmp,source,{width:item.w,depth:P.fit.gateRoofDepth,baseY:P.fit.gateRoofBaseY,height:P.fit.gateRoofHeight,type:'xieshan',id:'south-entry'});
  source.userData.structure={id:'east-six/qiandong-second-front-entry',status:P.status,source:'2020 DPM figure10 / official south xieshan gate category',openingWidth:net,openingHeight:P.fit.gateNetHeight,wallGap:item.w,thresholdY:0,unknown:'screen, leaf pose, elevation, detailing'};
  return {width:item.w,source};
 });
}
export function buildQiandongSecondFrontCourt(kit,item,zoneJson){
 if(!selected(kit,item,zoneJson,'qiandongSecondFrontCourt','qiandongSecondFrontGate'))return null;
 return stage(kit,'qiandongSecondFrontCourt',tmp=>{
  const source=tmp.frame(0,0),rooms=[];
  for(const r of P.rooms){
   const b=r.symbol,turned=!!r.rot,cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2;
   const w=(turned?b.z1-b.z0:b.x1-b.x0)-2*P.fit.wallRetreat,d=(turned?b.x1-b.x0:b.z1-b.z0)-2*P.fit.wallRetreat;
   const f=tmp.frame(cx,cz,r.rot);source.add(f);f.updateMatrixWorld(true);f.userData.qiandongRoom=r.id;
   const h=P.fit.wallHeight,t=.24,dw=P.fit.doorWidth,dh=P.fit.doorHeight;
   box(tmp,f,'floor',w,.12,d,0,-.06,0,false);tmp.walkBox(f,-w/2,-d/2,w/2,d/2,0);
   box(tmp,f,'rear-wall',w,h,t,0,h/2,d/2-t/2);
   for(const side of[-1,1]){
    box(tmp,f,'side-wall',t,h,d-t,side*(w/2-t/2),h/2,-t/2);
    const flank=(w-dw)/2;
    box(tmp,f,'front-jamb',flank,h,t,side*(dw/2+flank/2),h/2,-d/2+t/2);
   }
   box(tmp,f,'door-head',dw,h-dh,t,0,dh+(h-dh)/2,-d/2+t/2);
   roof(tmp,f,{width:w,depth:d,baseY:h+.12,height:1.6,type:'gable',id:r.id});
   const world=(x,z)=>new T.Vector3(x,0,z).applyMatrix4(f.matrixWorld),a=world(-w/2+t,-d/2+t),c=world(w/2-t,d/2-t),door=world(0,-d/2);
   // registerRoom's generic fallback manufactures a spawn even for []; this
   // source-unknown shell deliberately publishes only its real empty room.
   const room={id:kit.rooms.length+tmp.rooms.length,kind:'hall',sourceId:`${P.id}/${r.id}`,min:{x:Math.min(a.x,c.x),y:0,z:Math.min(a.z,c.z)},max:{x:Math.max(a.x,c.x),y:h,z:Math.max(a.z,c.z)},floorY:0,doors:[{x:door.x,z:door.z}],cover:[],spawns:[]};
   tmp.rooms.push(room);rooms.push(room);
  }
  source.userData.structure={id:P.id,status:P.status,source:'2020 DPM figure10',rooms:3,unknown:'screen, annexes, interiors, exact elevations and any particular historical year'};
  return {source,rooms};
 });
}


const commonGateSlabInstalled=new WeakSet();
const COMMON_SLAB_ID='east-six/items/42/existing-stone-slab';
/** Support-only correction for the exact existing common gate. The caller is
 * the immediate real CourtKit.gate post-hook, never a merged-scene search.
 * No source geometry/material/collider/room is allocated, edited or disposed.
 * Primitive provenance survives finish; the weak once-marker owns no source. */
export function applyQiandongCommonGateSlabSupport(kit,frame,item,zoneJson){
 if(zoneJson?.id!=='east-six'||!item||zoneJson.items?.[42]!==item)return null;
 const fail=()=>{throw Error('Qiandong common gate actual slab source mismatch')};
 validateQiandongSecondFrontCourt(zoneJson);
 if(commonGateSlabInstalled.has(frame)||kit?.walkables?.some(w=>w.qiandongCommonGateSlab?.id===COMMON_SLAB_ID))throw Error('Qiandong common gate slab support already installed / duplicate');
 const unit=new T.Vector3(1,1,1),identity=new T.Matrix4(),translation=new T.Matrix4().makeTranslation(-142,0,466);
 const zero=o=>o.position.toArray().every(v=>Number.isFinite(v)&&v===0)&&o.rotation.toArray().slice(0,3).every(v=>Number.isFinite(v)&&v===0)&&o.quaternion.toArray().every((v,i)=>Number.isFinite(v)&&v===(i===3?1:0))&&o.scale.equals(unit);
 const root=kit?.root,walks=kit?.walkables;
 if(!(kit instanceof CourtKit)||kit.gate!==CourtKit.prototype.gate||kit.walkBox!==CourtKit.prototype.walkBox||!root||root.name!=='east-six'||root.parent||!root.visible||!root.matrixAutoUpdate||!zero(root)||!root.matrix.equals(identity)||!root.matrixWorld.equals(identity)||!frame?.isGroup||frame.parent!==root||root.children.at(-1)!==frame||!frame.visible||!frame.matrixAutoUpdate||!frame.position.equals(new T.Vector3(-142,0,466))||!frame.rotation.toArray().slice(0,3).every(v=>Number.isFinite(v)&&v===0)||!frame.quaternion.equals(new T.Quaternion())||!frame.scale.equals(unit)||!frame.matrix.equals(translation)||!frame.matrixWorld.equals(translation)||JSON.stringify(frame.userData.structure)!==JSON.stringify({gateKind:'wall',storeys:1,eaveCount:1,portalCount:1})||root.children.filter(o=>o.isGroup&&o.position.x===-142&&o.position.z===466&&o.userData.structure?.gateKind==='wall').length!==1||!Array.isArray(walks)||!Object.isExtensible(walks)||!Object.getOwnPropertyDescriptor(walks,'length')?.writable||Object.getOwnPropertyDescriptor(kit,'walkables')?.value!==walks||!Object.getOwnPropertyDescriptor(kit,'walkables')?.writable||Object.getOwnPropertyNames(walks).some(k=>/^\d+$/.test(k)&&(!Object.getOwnPropertyDescriptor(walks,k)?.writable||!Object.getOwnPropertyDescriptor(walks,k)?.configurable)))fail();
 // The exact original producer has one direct stone_slab, not an arbitrary
 // horizontal object selected by a plausible name or world bounding box.
 // Read the real TextureLibrary cache; material() could allocate on a bad
 // frame/cache miss, which source validation must never do.
 const stone=kit.lib?.materials instanceof Map?kit.lib.materials.get('stone_slab|{}'):null;
 if(!stone?.isMaterial)fail();
 const matches=frame.children.filter(o=>o.isMesh&&o.material===stone);
 if(matches.length!==1)fail();
 const slab=matches[0],g=slab.geometry,p=g?.attributes?.position,n=g?.attributes?.normal,uv=g?.attributes?.uv;
 const local=new T.Matrix4().compose(slab.position,slab.quaternion,slab.scale),world=new T.Matrix4().multiplyMatrices(translation,local);
 if(slab.parent!==frame||!slab.visible||!slab.matrixAutoUpdate||!slab.castShadow||!slab.receiveShadow||!slab.position.equals(new T.Vector3(0,.05,0))||!slab.rotation.toArray().slice(0,3).every(v=>Number.isFinite(v)&&v===0)||!slab.quaternion.equals(new T.Quaternion())||!slab.scale.equals(unit)||![identity,local].some(m=>slab.matrix.equals(m))||![identity,translation,world].some(m=>slab.matrixWorld.equals(m))||stone.opacity!==1||stone.transparent||stone.visible===false||!g?.isBufferGeometry||g.index!==null||g.drawRange.start!==0||g.drawRange.count!==Infinity||Object.keys(g.morphAttributes).length||Object.keys(g.attributes).sort().join(',')!=='normal,position,uv'||JSON.stringify(g.groups)!==JSON.stringify(Array.from({length:6},(_,i)=>({start:i*6,count:6,materialIndex:i}))))fail();
 for(const [a,size] of [[p,3],[n,3],[uv,2]])if(!a||a.isInterleavedBufferAttribute||a.normalized||a.itemSize!==size||a.count!==36||!(a.array instanceof Float32Array)||!a.array.every(Number.isFinite))fail();
 let shared=false;root.traverse(o=>{if(o.isMesh&&o!==slab&&o.geometry===g)shared=true});if(shared)fail();
 const half=[Math.fround(6.6/2),Math.fround(.1/2),Math.fround(3.3/2)],tile=kit.lib.tileSize('stone_slab'),faces=new Map(),sourceLocal=new T.Box3();
 if(!Number.isFinite(tile)||tile<=0)fail();
 for(let i=0;i<36;i++){
  const a=[p.getX(i),p.getY(i),p.getZ(i)],normal=[n.getX(i),n.getY(i),n.getZ(i)];
  if(!a.every((v,k)=>v===half[k]||v===-half[k])||normal.filter(v=>v!==0).length!==1||!normal.every(v=>v===0||v===1||v===-1))fail();
  let u,v;if(normal[1]){u=a[0];v=a[2]}else if(normal[0]){u=a[2]*normal[0];v=a[1]}else{u=a[0]*normal[2];v=a[1]}
  if(uv.getX(i)!==Math.fround(u/tile)||uv.getY(i)!==Math.fround(v/tile))fail();
  sourceLocal.expandByPoint(new T.Vector3(...a).applyMatrix4(local));
 }
 // Check all twelve outward triangles and all six complete rectangular faces.
 // A malformed or duplicated horizontal triangle cannot masquerade as a slab.
 for(let i=0;i<36;i+=3){
  const normal=[n.getX(i),n.getY(i),n.getZ(i)],axis=normal.findIndex(v=>v!==0),sign=normal[axis],points=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j));
  for(let j=0;j<3;j++)if(points[j].getComponent(axis)!==sign*half[axis]||[n.getX(i+j),n.getY(i+j),n.getZ(i+j)].some((v,k)=>v!==normal[k]))fail();
  const cross=new T.Vector3().subVectors(points[1],points[0]).cross(new T.Vector3().subVectors(points[2],points[0]));if(cross.dot(new T.Vector3(...normal))<=0)fail();
  const ids=points.map(v=>[v.x,v.y,v.z].reduce((id,q,k)=>id+(q>0?1<<k:0),0)),key=axis+':'+sign;
  if(new Set(ids).size!==3)fail();if(!faces.has(key))faces.set(key,[]);faces.get(key).push(ids);
 }
 if(faces.size!==6)fail();for(const triangles of faces.values()){if(triangles.length!==2)fail();const shared=triangles[0].filter(v=>triangles[1].includes(v));if(shared.length!==2||((shared[0]^shared[1]).toString(2).replaceAll('0','').length!==2))fail()}
 const sourceWorld=sourceLocal.clone().applyMatrix4(translation),top=sourceWorld.clone();top.min.y=top.max.y;
 if(![...sourceWorld.min.toArray(),...sourceWorld.max.toArray()].every(Number.isFinite)||Math.abs(sourceWorld.max.y-.1)>1e-7||Math.abs(sourceWorld.min.y)>1e-7)fail();
 // Retain the actual original two base colliders and its original6.4m gap.
 for(const side of[-1,1]){const x=-142+side*2.5;const rows=kit.colliders.filter(c=>[c.min.x-(x-.7),c.max.x-(x+.7),c.min.y,c.max.y-3,c.min.z-464.6,c.max.z-467.4].every(v=>Number.isFinite(v)&&Math.abs(v)<1e-7));if(rows.length!==1)fail()}
 if(walks.some(w=>w.type==='box'&&w.box?.equals(top)))throw Error('Qiandong common gate slab support duplicate');
 const owner=Object.freeze({id:COMMON_SLAB_ID,sourceFrameUuid:frame.uuid,sourceMeshUuid:slab.uuid,sourceGeometryUuid:g.uuid,sourceMaterialUuid:stone.uuid,sourceTop:sourceWorld.max.y,sourceMin:Object.freeze(sourceWorld.min.toArray()),sourceMax:Object.freeze(sourceWorld.max.toArray()),scope:'EXISTING_VISIBLE_SOURCE_SUPPORT_ONLY'});
 const before=[...walks];let walkable;
 try{
  kit.walkBox(frame,sourceLocal.min.x,sourceLocal.min.z,sourceLocal.max.x,sourceLocal.max.z,sourceLocal.max.y);
  walkable=walks.at(-1);if(kit.walkables!==walks||walks.length!==before.length+1||before.some((w,i)=>walks[i]!==w)||walkable?.type!=='box'||!walkable.box.equals(top))fail();
  walkable.rescue=false;walkable.qiandongCommonGateSlab=owner;
 }catch(error){kit.walkables=walks;Array.prototype.splice.call(walks,0,walks.length,...before);throw error}
 commonGateSlabInstalled.add(frame);
 return {source:slab,walkable};
}

const retainedHallSupportsInstalled=new WeakSet();
/** Only the five existing R62 anonymous shells. This post-policy hook adds
 * contact for retained exposed meshes, never architecture or a new room base.
 * All source validation completes before any ordinary walkBox publication. */
export function applyQiandongRetainedHallSourceSupports(kit,built,item,zoneJson,newRooms){
 if(zoneJson?.id!=='east-six'||!item)return null;
 const index=zoneJson.items?.indexOf(item)??-1;
 if(index<44||index>48)return null;
 const fail=reason=>{throw Error(`Qiandong retained hall ${index} source mismatch: ${reason}`)};
 validateQiandongSecondFrontCourt(zoneJson);
 const frame=built?.f,root=kit?.root,walks=kit?.walkables,prefix=`east-six/items/${index}/retained-source/`;
 if(retainedHallSupportsInstalled.has(frame)||walks?.some(w=>w.qiandongRetainedHallSurface?.id?.startsWith(prefix)))throw Error('Qiandong retained hall supports already installed / duplicate');
 const unit=new T.Vector3(1,1,1),identity=new T.Matrix4(),translation=new T.Matrix4().makeTranslation(item.x,0,item.z);
 const zeroPose=o=>o.position.toArray().every(v=>Number.isFinite(v)&&v===0)&&o.rotation.toArray().slice(0,3).every(v=>Number.isFinite(v)&&v===0)&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(unit);
 if(!(kit instanceof CourtKit)||kit.hall!==CourtKit.prototype.hall||kit.walkBox!==CourtKit.prototype.walkBox||root?.name!=='east-six'||root.parent||!root.visible||!root.matrixAutoUpdate||!root.matrixWorldAutoUpdate||!zeroPose(root)||!root.matrix.equals(identity)||!root.matrixWorld.equals(identity)||!frame?.isGroup||frame.parent!==root||root.children.at(-1)!==frame||!frame.visible||!frame.matrixAutoUpdate||!frame.matrixWorldAutoUpdate||!frame.position.equals(new T.Vector3(item.x,0,item.z))||!frame.rotation.toArray().slice(0,3).every(v=>Number.isFinite(v)&&v===0)||!frame.quaternion.equals(new T.Quaternion())||!frame.scale.equals(unit)||!frame.matrix.equals(translation)||!frame.matrixWorld.equals(translation)||root.children.filter(o=>o.isGroup&&o.position.x===item.x&&o.position.z===item.z).length!==1)fail('actual producer/frame');
 if(built.top!==item.ph||built.PW!==item.w+2*item.pad||built.PD!==item.d+2*item.pad)fail('producer result');
 const policy={mode:'unknown-inventory',target:`east-six/items/${index}`,scope:'r62-east-24-unnamed-annex-furnish-room-only'},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),s=frame.userData.structure;
 if(!same(frame.userData.eastUnknownAnnexInventory,{...policy,removedMeshes:8,removedColliders:8,removedCover:2})||s?.id!==`east-six/unnamed-annex-${index}`||s.inventoryBinding!==policy.target||s.inventoryStatus!=='UNKNOWN'||s.accepted!==false||s.knownEmpty!==false||!same(s.furnishingPolicy,policy)||s.furnitureStatus!=='UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY'||s.currentInventoryVerified!==false)fail('actual completed R62 policy');
 const room=newRooms?.[0],beam=T.MathUtils.clamp(item.colH*.12,.45,.85),door={x:+item.x.toFixed(2),z:+(item.z-item.d/2).toFixed(2)};
 if(!Array.isArray(newRooms)||newRooms.length!==1||!room||room!==kit.rooms.at(-1)||room.id!==kit.rooms.indexOf(room)||!Number.isInteger(room.id)||room.name!==null||room.kind!=='hall'||room.floorY!==item.ph||!same(room.min,{x:item.x+(-item.w/2+.35),y:item.ph,z:item.z-item.d/2})||!same(room.max,{x:item.x+(item.w/2-.35),y:item.ph+(item.colH-beam),z:item.z+item.d/2})||!same(room.doors,[door])||room.inventoryStatus!=='UNKNOWN'||room.accepted!==false||room.knownEmpty!==false||!same(room.furnishingPolicy,policy)||room.removedCoverCount!==2||!same(room.cover,[])||room.spawns.length!==2)fail('actual newly registered R62 room');
 const ownArray=Object.getOwnPropertyDescriptor(kit,'walkables');
 if(!Array.isArray(walks)||!Object.isExtensible(walks)||!Object.getOwnPropertyDescriptor(walks,'length')?.writable||ownArray?.value!==walks||!ownArray.writable||Object.getOwnPropertyNames(walks).some(k=>/^\d+$/.test(k)&&(!Object.getOwnPropertyDescriptor(walks,k)?.writable||!Object.getOwnPropertyDescriptor(walks,k)?.configurable)))fail('publication contract');
 const originalBase=new T.Box3(new T.Vector3(-built.PW/2,item.ph,-built.PD/2),new T.Vector3(built.PW/2,item.ph,built.PD/2)).applyMatrix4(translation);
 if(walks.filter(w=>w.type==='box'&&w.box?.equals(originalBase)).length!==1)fail('original structural base');
 if(!(kit.lib?.materials instanceof Map))fail('borrowed material cache');
 const stone=kit.lib.materials.get('stone_slab|{}'),wood=kit.lib.materials.get('wood_column|{}'),floor=kit.floorMat;
 if(!stone?.isMaterial||!wood?.isMaterial||!floor?.isMaterial||floor.name!=='kit_floor_flat'||kit.owned.filter(m=>m===floor).length!==1||!kit._interiorMats)fail('retained material ownership');
 let furnishings=false;frame.traverse(m=>{if(m.isMesh&&Object.values(kit._interiorMats).includes(m.material))furnishings=true});if(furnishings)fail('R62 furniture exclusion');
 const bays=Math.max(3,Math.round(item.w/3.6)|1),bay=item.w/bays,r=T.MathUtils.clamp(bay*.07,.2,.34);
 const descriptors=[{role:'landing',mat:stone,materialKey:'stone_slab',pose:[0,item.ph-.03,0],size:[built.PW+.12,.08,built.PD+.12]},
  {role:'threshold',mat:wood,materialKey:'wood_column',pose:[-item.w/2+(Math.floor((bays-1)/2)+.5)*bay,item.ph+.11,-item.d/2],size:[bay-2*r,.22,.3]},
  {role:'interior',mat:floor,pose:[0,item.ph+.02,0],plane:true,size:[item.w,item.d]}];
 const sources=[],contacts=[],sourceResources=new Set();
 for(const d of descriptors){
  const matches=[];frame.traverse(m=>{if(m.isMesh&&m.material===d.mat&&(d.role!=='threshold'||m.position.y===d.pose[1]||(m.position.x===d.pose[0]&&m.position.z===d.pose[2])))matches.push(m)});
  if(matches.length!==1)fail(`${d.role} unique source`);const m=matches[0],g=m.geometry,local=new T.Matrix4().makeTranslation(...d.pose),world=new T.Matrix4().multiplyMatrices(translation,local);
  if(Object.getPrototypeOf(m)!==T.Mesh.prototype||m.isInstancedMesh||m.children.length||m.layers.mask!==1||m.matrixWorldAutoUpdate!==true||m.parent!==frame||m.name!==''||Object.keys(m.userData).length||!m.visible||!m.matrixAutoUpdate||!m.position.equals(new T.Vector3(...d.pose))||!m.rotation.toArray().slice(0,3).every(v=>Number.isFinite(v)&&v===0)||!m.quaternion.equals(new T.Quaternion())||!m.scale.equals(unit)||![identity,local].some(a=>m.matrix.equals(a))||![identity,translation,world].some(a=>m.matrixWorld.equals(a))||m.receiveShadow!==true||m.castShadow!==!d.plane||d.mat.opacity!==1||d.mat.transparent||d.mat.visible===false||!g?.isBufferGeometry||g.drawRange.start!==0||g.drawRange.count!==Infinity||Object.keys(g.morphAttributes).length||Object.keys(g.attributes).sort().join(',')!=='normal,position,uv')fail(`${d.role} source state`);
  const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,count=d.plane?4:36;
  for(const [a,size] of [[p,3],[n,3],[uv,2]])if(!a||a.isInterleavedBufferAttribute||a.normalized||a.itemSize!==size||a.count!==count||!(a.array instanceof Float32Array)||!a.array.every(Number.isFinite))fail(`${d.role} finite payload`);
  const sourceLocal=new T.Box3();
  if(d.plane){
   const hx=Math.fround(item.w/2),hz=Math.fround(item.d/2),tiny=Math.fround(hz*Math.cos(Math.PI/2)),nz=Math.fround(Math.cos(Math.PI/2)),span=.64*4; // existing GOLD_BRICK_TILE, not a fit
   const points=[[-hx,tiny,-hz],[hx,tiny,-hz],[-hx,-tiny,hz],[hx,-tiny,hz]],uvs=[[0,Math.fround(item.d/span)],[Math.fround(item.w/span),Math.fround(item.d/span)],[0,0],[Math.fround(item.w/span),0]];
   if(!g.index||g.index.itemSize!==1||!(g.index.array instanceof Uint16Array)||!same(Array.from(g.index.array),[0,2,1,2,3,1])||g.groups.length)fail('interior faces');
   for(let i=0;i<4;i++){if(!same([p.getX(i),p.getY(i),p.getZ(i)],points[i])||!same([n.getX(i),n.getY(i),n.getZ(i)],[0,1,nz])||!same([uv.getX(i),uv.getY(i)],uvs[i]))fail('interior actual plane');sourceLocal.expandByPoint(new T.Vector3(...points[i]).applyMatrix4(local))}
  }else{
   if(g.index!==null||!same(g.groups,Array.from({length:6},(_,i)=>({start:i*6,count:6,materialIndex:i}))))fail(`${d.role} box faces`);
   const half=d.size.map(v=>Math.fround(v/2)),tile=kit.lib.tileSize(d.materialKey),faces=new Map();if(!Number.isFinite(tile)||tile<=0)fail('source UV tile');
   for(let i=0;i<36;i++){const a=[p.getX(i),p.getY(i),p.getZ(i)],normal=[n.getX(i),n.getY(i),n.getZ(i)];if(!a.every((v,k)=>v===half[k]||v===-half[k])||normal.filter(v=>v!==0).length!==1||!normal.every(v=>v===0||v===1||v===-1))fail(`${d.role} corners`);let u,v;if(normal[1]){u=a[0];v=a[2]}else if(normal[0]){u=a[2]*normal[0];v=a[1]}else{u=a[0]*normal[2];v=a[1]}if(uv.getX(i)!==Math.fround(u/tile)||uv.getY(i)!==Math.fround(v/tile))fail(`${d.role} UV`);sourceLocal.expandByPoint(new T.Vector3(...a).applyMatrix4(local))}
   for(let i=0;i<36;i+=3){const normal=[n.getX(i),n.getY(i),n.getZ(i)],axis=normal.findIndex(v=>v!==0),sign=normal[axis],points=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j));for(let j=0;j<3;j++)if(points[j].getComponent(axis)!==sign*half[axis]||[n.getX(i+j),n.getY(i+j),n.getZ(i+j)].some((v,k)=>v!==normal[k]))fail(`${d.role} face normal`);const cross=new T.Vector3().subVectors(points[1],points[0]).cross(new T.Vector3().subVectors(points[2],points[0]));if(cross.dot(new T.Vector3(...normal))<=0)fail(`${d.role} winding`);const ids=points.map(v=>[v.x,v.y,v.z].reduce((id,q,k)=>id+(q>0?1<<k:0),0)),key=axis+':'+sign;if(new Set(ids).size!==3)fail(`${d.role} triangle`);if(!faces.has(key))faces.set(key,[]);faces.get(key).push(ids)}
   if(faces.size!==6)fail(`${d.role} complete box`);for(const rows of faces.values()){if(rows.length!==2)fail(`${d.role} face count`);const shared=rows[0].filter(v=>rows[1].includes(v));if(shared.length!==2||(shared[0]^shared[1]).toString(2).replaceAll('0','').length!==2)fail(`${d.role} face coverage`)}
  }
  const bounds=sourceLocal.clone().applyMatrix4(translation),top=bounds.clone();top.min.y=top.max.y;if(![...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite)||bounds.max.x<=bounds.min.x||bounds.max.z<=bounds.min.z)fail(`${d.role} source bounds`);
  for(const a of Object.values(g.attributes)){if(sourceResources.has(a.array.buffer))fail('shared source payload');sourceResources.add(a.array.buffer)}if(g.index){if(sourceResources.has(g.index.array.buffer))fail('shared source index');sourceResources.add(g.index.array.buffer)}
  const owner=Object.freeze({id:prefix+d.role,role:d.role,itemIndex:index,sourceFrameUuid:frame.uuid,sourceMeshUuid:m.uuid,sourceGeometryUuid:g.uuid,sourceMaterialUuid:d.mat.uuid,sourceMin:Object.freeze(bounds.min.toArray()),sourceMax:Object.freeze(bounds.max.toArray()),sourceTop:bounds.max.y,structuralFloorY:item.ph,scope:'EXISTING_R62_RETAINED_SOURCE_SUPPORT_ONLY'});
  sources.push(m);contacts.push({local:sourceLocal,box:top,owner});
 }
 let shared=false;root.traverse(m=>{if(m.isMesh&&!sources.includes(m)&&[...Object.values(m.geometry.attributes),...(m.geometry.index?[m.geometry.index]:[])].some(a=>sourceResources.has(a.array.buffer)))shared=true});if(shared)fail('borrowed source geometry');
 if(contacts.some(c=>walks.some(w=>w.type==='box'&&w.box?.equals(c.box))))throw Error('Qiandong retained hall source support duplicate');
 const before=[...walks],added=[];
 try{
  for(const c of contacts){kit.walkBox(frame,c.local.min.x,c.local.min.z,c.local.max.x,c.local.max.z,c.local.max.y);const w=walks.at(-1);if(kit.walkables!==walks||walks.length!==before.length+added.length+1||before.some((v,i)=>walks[i]!==v)||w?.type!=='box'||!w.box.equals(c.box))fail('source support publication');w.rescue=false;w.qiandongRetainedHallSurface=c.owner;added.push(w)}
  if(added.some((w,i)=>walks[before.length+i]!==w||!w.box.equals(contacts[i].box)||w.rescue!==false||w.qiandongRetainedHallSurface!==contacts[i].owner))fail('complete source-support batch');
 }
 catch(error){kit.walkables=walks;Array.prototype.splice.call(walks,0,walks.length,...before);throw error}
 retainedHallSupportsInstalled.add(frame);
 return{sources,walkables:added};
}
