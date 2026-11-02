import {authorizeNansansuoFrontStairHost,revokeNansansuoFrontStairHost,nansansuoFrontStairGroups} from './NansansuoFrontStairHost.js';
import {registerBPrincipalStairs} from '../BPrincipalStairContact.js';
import * as T from 'three';
import {buildNansansuoFrontHall} from './NansansuoFrontHalls.js';
import {augmentRemainingHall,resolveRemainingProfile} from './RemainingOuterHalls.js';
import {validateNansansuoInventoryPolicy} from '../NansansuoInventoryPolicy.js';
const RECORDS=[{index:12,name:'南三所西所前殿',profile:'place-outer-east-172c8cbf68',key:'sansuo-west-front'},{index:14,name:'南三所中所前殿',profile:'place-outer-east-c1914091ec',key:'sansuo-center-front'},{index:16,name:'南三所东所前殿',profile:'place-outer-east-2e6207278c',key:'sansuo-east-front'}];
const ARRAYS=['colliders','walkables','rooms','regions','mapItems','plaques','owned'];
const fail=message=>{throw Error(`Nansansuo front finalizer ${message}`)};
const writable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const fresh=kit=>{const k=Object.assign(Object.create(Object.getPrototypeOf(kit)),kit,{root:new T.Group()});k.root.name=kit.root.name;for(const a of ARRAYS)k[a]=[];return k};
const dispose=k=>{const geo=new Set();k.root.traverse(m=>{if(m.isMesh)geo.add(m.geometry)});for(const g of geo)g.dispose();for(const m of k.owned)m.dispose()};
const params=item=>{const p={};for(const k of['x','z','w','d','colH','roof','enter','interior','name'])if(Object.hasOwn(item,k))p[k]=item[k];return {...p,rot:0}};
const serial=x=>JSON.stringify(x);
const boxKey=b=>serial([b.min.toArray(),b.max.toArray()]);
const roomKey=({id,...rest})=>serial(rest);
const buffers=g=>[g.index,...Object.values(g.attributes)].filter(Boolean).map(a=>a.array.buffer);
function low(kit,frame){return frame.children.filter(m=>m.isMesh&&(m.material===kit.floorMat||m.material===kit.lib.material('marble')||m.material===kit.lib.material('sumeru_band')&&m.position.y===.45||m.material===kit.lib.material('stone_slab')&&Math.abs(m.position.y-.87)<1e-6))}
function meshRows(root){const rows=[];root.traverse(m=>{if(!m.isMesh)return;const mat=m.material;rows.push({name:m.name,p:m.position.toArray(),q:m.quaternion.toArray(),s:m.scale.toArray(),visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,material:mat?{name:mat.name,color:mat.color?.getHex(),map:mat.map?.uuid??null,normal:mat.normalMap?.uuid??null,side:mat.side,roughness:mat.roughness,metalness:mat.metalness,transparent:mat.transparent,opacity:mat.opacity}:null,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([n,a])=>[n,{type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,values:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null,groups:m.geometry.groups,draw:[m.geometry.drawRange.start,String(m.geometry.drawRange.count)]})});return rows}
/** Terminal ordinary-build adapter only. Historical buildHall fixtures retain
 * their old six-shell source. No nearby/name-only removal and no source fallback.
 * Each original collider is authenticated against its exact full source frame. */
export function finishNansansuoFrontHalls(kit,zoneJson){
 if(zoneJson?.id!=='outer-east')return null;
 const targets=(zoneJson.items??[]).filter(q=>q?.kind==='hall'&&RECORDS.some(r=>r.name===q.name));if(!targets.length)return null;
 if(targets.length!==3)fail('requires all three unique declarations');
 for(const r of RECORDS){const item=zoneJson.items[r.index];if(!item||item.name!==r.name||targets.filter(q=>q.name===r.name).length!==1)fail('declaration source mismatch');validateNansansuoInventoryPolicy({zoneId:zoneJson.id,itemIndex:r.index,item},params(item))}
 const root=kit.root;
 if(root.name!=='outer-east'||root.parent||!root.visible||!root.matrixAutoUpdate||!Object.getOwnPropertyDescriptor(root,'children')?.writable||!writable(root.children)||ARRAYS.some(a=>!writable(kit[a]))||root.position.lengthSq()||root.rotation.toArray().slice(0,3).some(Boolean)||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4()))fail('root/array source mismatch');
 if(root.children.some(f=>f.userData.nansansuoFrontHall))fail('already installed / duplicate source');
 const reference=fresh(kit),rows=[];
 try{
  for(const r of RECORDS){
   const item=zoneJson.items[r.index],matches=root.children.filter(f=>f.userData.structure?.remainingId===r.profile&&f.userData.structure?.remainingProfile===r.key);
   if(matches.length!==1)fail('requires unique actual legacy source frame');const old=matches[0];
   if(old.parent!==root||!old.visible||old.position.x!==item.x||old.position.y||old.position.z!==item.z||old.rotation.toArray().slice(0,3).some(Boolean)||!old.scale.equals(new T.Vector3(1,1,1))||!Object.getOwnPropertyDescriptor(old,'children')?.writable||!writable(old.children))fail('legacy frame transform/source mismatch');
   const c=reference.colliders.length,w=reference.walkables.length,rooms=reference.rooms.length,maps=reference.mapItems.length,regions=reference.regions.length;
   let b=reference.nansansuoUnknownHall(params(item),{zoneId:zoneJson.id,itemIndex:r.index,item});b=augmentRemainingHall(reference,item,b,resolveRemainingProfile(zoneJson.id,item));
   if(serial(meshRows(old))!==serial(meshRows(b.f)))fail('legacy geometry/material source mismatch');
   const expected=reference.colliders.slice(c);if(expected.length!==20||expected.some(q=>q.triangleSupport||q.overhead||q.xiqingRoofSurface))fail('unexpected legacy collider source');
   const actual=expected.map(q=>{const found=kit.colliders.filter(a=>!a.triangleSupport&&!a.overhead&&!a.xiqingRoofSurface&&boxKey(a)===boxKey(q));if(found.length!==1)fail('requires 20 exact unique actual collider references');return found[0]});
   for(const [collection,values,key]of[[kit.walkables,reference.walkables.slice(w),serial],[kit.rooms,reference.rooms.slice(rooms),roomKey],[kit.mapItems,reference.mapItems.slice(maps),serial],[kit.regions,reference.regions.slice(regions),serial]])for(const q of values)if(collection.filter(a=>key(a)===key(q)).length!==1)fail('legacy room/support/map source mismatch');
   const plaques=kit.plaques.filter(p=>p.mesh?.parent===old||p.frame?.parent===old);if(plaques.length!==1||plaques[0].mesh.parent!==old||plaques[0].frame.parent!==old||plaques[0].text!==item.name)fail('legacy plaque source mismatch');
   const retained=low(kit,old);if(retained.length!==11||retained.some(m=>!Object.getOwnPropertyDescriptor(m,'parent')?.writable))fail('legacy low-source contract mismatch');
   const walkables=reference.walkables.slice(w).map(q=>kit.walkables.find(a=>serial(a)===serial(q)));
   rows.push({r,item,old,colliders:actual,plaques,low:retained,walkables});
  }
 }finally{dispose(reference)}
 const allOld=new Set(),originalLow=new Set(rows.flatMap(r=>r.low));for(const row of rows)row.old.traverse(m=>{if(m.isMesh)allOld.add(m)});
 const removedGeometry=new Set([...allOld].filter(m=>!originalLow.has(m)).map(m=>m.geometry));const removedBuffers=new Set([...removedGeometry].flatMap(buffers));root.traverse(m=>{if(m.isMesh&&!allOld.has(m)&&(removedGeometry.has(m.geometry)||buffers(m.geometry).some(b=>removedBuffers.has(b))))fail('legacy geometry shared outside exact target frames')});
 const candidate=fresh(kit);
 try{for(const row of rows){row.built=buildNansansuoFrontHall(candidate,row.item,{zoneId:zoneJson.id,itemIndex:row.r.index,zoneJson});row.new=row.built.f;row.clones=low(candidate,row.new);if(row.clones.length!==11||serial(row.clones.map(m=>meshRows(m)))!==serial(row.low.map(m=>meshRows(m))))fail('candidate low geometry differs from certified source');}}
 catch(error){dispose(candidate);throw error}
 const rootChildren=root.children,oldChildren=new Map(rows.map(r=>[r.old,r.old.children])),newChildren=new Map(rows.map(r=>[r.new,r.new.children])),snapshots=Object.fromEntries(['colliders','plaques','owned'].map(a=>[a,[...kit[a]]])),discarded=new Set(rows.flatMap(r=>r.colliders.slice(1))),sourcePlaques=new Set(rows.flatMap(r=>r.plaques)),oldToNew=new Map(rows.map(r=>[r.old,r.new]));
 const newUpper=candidate.colliders.filter(c=>c.triangleSupport);
 try{
  for(const row of rows){const replace=new Map(row.clones.map((m,i)=>[m,row.low[i]]));row.new.children=row.new.children.map(m=>replace.get(m)??m);row.old.children=row.old.children.filter(m=>!originalLow.has(m));for(const m of row.low)m.parent=row.new;row.old.parent=null;row.new.parent=root;}
  root.children=rootChildren.map(f=>oldToNew.get(f)??f);
  kit.colliders.splice(0,kit.colliders.length,...snapshots.colliders.filter(c=>!discarded.has(c)),...newUpper);
  kit.plaques.splice(0,kit.plaques.length,...snapshots.plaques.filter(p=>!sourcePlaques.has(p)));
  kit.owned.push(...candidate.owned);
  for(const row of rows){const group=nansansuoFrontStairGroups.find(g=>g.host.itemIndex===row.r.index);if(!authorizeNansansuoFrontStairHost(kit,row.new,zoneJson,row.r.index,row.walkables,row.low)||!registerBPrincipalStairs(kit,row.new,group.id,0))fail('actual front stair source registration failed');}
 }catch(error){
  for(const row of rows)revokeNansansuoFrontStairHost(row.new);
  root.children=rootChildren;for(const row of rows){row.old.children=oldChildren.get(row.old);for(const m of row.old.children)m.parent=row.old;row.old.parent=root;row.new.children=newChildren.get(row.new);for(const m of row.new.children)m.parent=row.new;row.new.parent=candidate.root;}
  for(const a of['colliders','plaques','owned'])Array.prototype.splice.call(kit[a],0,kit[a].length,...snapshots[a]);dispose(candidate);throw error;
 }
 // Only now release obsolete source geometry. Original low meshes and all
 // borrowed/shared materials survive unchanged; private new palette is kit-owned.
 for(const g of removedGeometry)g.dispose();for(const g of new Set(rows.flatMap(r=>r.clones.map(m=>m.geometry))))g.dispose();
 return rows.map(r=>r.built.geometry);
}
