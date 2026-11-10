import * as T from 'three';
import {retainConstructionBranch} from '../ConstructionSources.js';
import {snapshotNode,verifyNode,snapshotMesh,verifyMesh,snapshotAncestors,verifyAncestors,snapshotDescriptor,verifyDescriptor} from '../../../controls/XiananContactIntegrity.js';

import {getXiananConstructionBirth,isBuiltXiananSource} from '../../zones/ZoneBase.js';
import {getXiananLifecycleTransition} from '../../zones/ZoneManager.js';

const kits=new WeakMap(),rows=new WeakMap(),managers=new WeakMap(),usedLoads=new WeakSet();
let serial=0;
const expected={kind:'gate',name:'咸安门',x:300.9,z:-240.1,w:24.1,gateKind:'five-bay',structureStatus:'provisional-preserved-baseline'};
const indices=[0,1,35,39,43],dimensions=[[25.7,.45,8.83],[25.8,.08,8.93],[3.82,.2,.4],[3.82,.2,.4],[3.82,.2,.4]],materials=['sumeru_band_material','stone_slab_material','wood_column_material','wood_column_material','wood_column_material'];
const key=t=>t.map(v=>v.join(',')).join('|');
const sameItem=i=>i&&Object.keys(i).length===Object.keys(expected).length&&Object.keys(expected).every(k=>i[k]===expected[k]);
function triangles(mesh){const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,out=[];mesh.updateWorldMatrix(true,false);for(let i=0;i<(ix?.count??p.count);i+=3)out.push([0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld).toArray()));return out;}
function boxFromTriangles(ts){
  if(ts.length!==12||new Set(ts.map(key)).size!==12)throw Error('Xianan source is not a complete box');
  const box=new T.Box3();for(const t of ts)for(const v of t)box.expandByPoint(new T.Vector3(...v));
  for(let axis=0;axis<3;axis++)for(const side of [0,1]){
    const plane=(side?box.max:box.min).getComponent(axis),other=[0,1,2].filter(a=>a!==axis),face=ts.filter(t=>t.every(v=>v[axis]===plane));
    if(face.length!==2)throw Error('Xianan source lacks a face');
    const ids=face.map(t=>t.map(v=>{let id=0;for(let j=0;j<2;j++){const a=other[j];if(v[a]!==box.min.getComponent(a)&&v[a]!==box.max.getComponent(a))throw Error('Nonrectangular Xianan box');if(v[a]===box.max.getComponent(a))id|=1<<j;}return id;}));
    const shared=ids[0].filter(v=>ids[1].includes(v));
    if(ids.some(a=>new Set(a).size!==3)||new Set(ids.flat()).size!==4||shared.length!==2||(shared[0]^shared[1])!==3)throw Error('Incomplete Xianan face');
    if(face.some(t=>new T.Triangle(...t.map(v=>new T.Vector3(...v))).getNormal(new T.Vector3()).getComponent(axis)*(side?1:-1)<1-1e-10))throw Error('Wrong Xianan winding');
  }
  return box;
}
const revoke=p=>{p.revoked=true;const active=p.binding?.deref();if(active)active.invalid=true;};
function watch(object,event,p){object.addEventListener(event,()=>revoke(p));}
function sourceValid(p){
  const kit=p.kit.deref(),frame=p.frame.deref(),item=p.item.deref(),zone=p.zone.deref(),walkable=p.walkable.deref();
  return !!kit&&!!frame&&isBuiltXiananSource(kit,frame,item,zone,walkable)&&zone?.id==='outer-west'&&zone.items[30]===item&&sameItem(item)&&kit.root.name==='outer-west'&&verifyNode(p.root)&&verifyNode(p.frameNode)&&frame.children.length===p.children.length&&p.children.every((r,i)=>r.deref()===frame.children[i])&&p.source.every(verifyMesh)&&kit.walkables.includes(walkable)&&verifyDescriptor(p.walkDescriptor)&&p.solids.every((s,i)=>kit.colliders.includes(s.deref())&&s.deref().equals(p.solidBoxes[i]));
}
function geometryValid(p){return !p.revoked&&sourceValid(p)&&(!p.finished||(verifyNode(p.groupNode)&&p.finished.every(verifyMesh)&&(!p.ancestry||verifyAncestors(p.ancestry))));}
const admissionError=()=>Object.assign(new Error('Untrusted Xianan managed admission'),{code:'XIANAN_UNTRUSTED_ADMISSION'});
function sameDenseRows(actual,original){
  if(!Array.isArray(actual)||!Array.isArray(original)||actual.length!==original.length)return false;
  for(let i=0;i<original.length;i++)if(!Object.hasOwn(actual,i)||!Object.hasOwn(original,i)||actual[i]!==original[i])return false;
  return true;
}
export function getXiananManagedBirth(builder,data){
  const p=kits.get(builder?.kit);if(!p)return null;
  if(p.birth.builder.deref()!==builder||data?.group!==p.group?.deref()||!sameDenseRows(data.colliders,builder.kit.colliders)||!sameDenseRows(data.walkables,builder.kit.walkables)||!geometryValid(p))throw admissionError();
  return p.birth;
}
export function hasXiananRegistration(cm,birth){const s=managers.get(cm);return !!s&&!s.invalid&&!s.cleared&&s.p.birth===birth&&cm.walkables.includes(s.row.deref());}
export function registerXiananSource(kit,frame,item,zoneJson,walkable){
  if(zoneJson?.id!=='outer-west'||zoneJson.items?.[30]!==item)return false;
  if(!isBuiltXiananSource(kit,frame,item,zoneJson,walkable))throw Error('Actual private Xianan construction birth required');
  const allMeshes=[];frame?.traverse(o=>{if(o.isMesh)allMeshes.push(o)});
  if(!sameItem(item)||kits.has(kit)||frame?.parent!==kit.root||kit.root.name!=='outer-west'||allMeshes.length!==58||!walkable||walkable!==kit.walkables.at(-1)||walkable.type!=='box')throw Error('Actual original Xianan construction required');
  kit.root.updateMatrixWorld(true);
  if(kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||!frame.position.equals(new T.Vector3(300.9,0,-240.1))||frame.rotation.toArray().slice(0,3).some(Boolean)||!frame.scale.equals(new T.Vector3(1,1,1)))throw Error('Original Xianan frame required');
  const positions=[[0,.45/2,0],[0,.45-.03,0],[-24.1/5,.45+.1,0],[0,.45+.1,0],[24.1/5,.45+.1,0]];
  const meshes=indices.map((index,i)=>{
    const m=allMeshes[index],d=dimensions[i];
    if(!m?.isMesh||m.parent!==frame||m.material?.name!==materials[i]||!m.position.equals(new T.Vector3(...positions[i]))||m.rotation.toArray().slice(0,3).some(Boolean)||!m.scale.equals(new T.Vector3(1,1,1)))throw Error('Original Xianan five boxes required');
    // applyBoxUV/applyBandUV intentionally return nonindexed BufferGeometry.
    // Certify actual six faces and exact Float32 local corners, not lost metadata.
    const box=boxFromTriangles(triangles(m));
    for(let a=0;a<3;a++)for(const side of [0,1]){
      const expected=frame.position.getComponent(a)+m.position.getComponent(a)+Math.fround((side?1:-1)*d[a]/2);
      if((side?box.max:box.min).getComponent(a)!==expected)throw Error('Changed Xianan original box extent');
    }
    return m;
  });
  const solidBoxes=kit.colliders.slice(-26).map(b=>b.clone());if(solidBoxes.length!==26)throw Error('Xianan original collision flow required');
  const p={birth:getXiananConstructionBirth(kit),everBound:false,revoked:false,kit:new WeakRef(kit),frame:new WeakRef(frame),item:new WeakRef(item),zone:new WeakRef(zoneJson),root:snapshotNode(kit.root),frameNode:snapshotNode(frame),children:frame.children.map(m=>new WeakRef(m)),source:meshes.map(mesh=>snapshotMesh(mesh)),sourceTriangles:meshes.map(triangles),walkable:new WeakRef(walkable),walkDescriptor:snapshotDescriptor(walkable),walkBox:walkable.box.clone(),solids:kit.colliders.slice(-26).map(b=>new WeakRef(b)),solidBoxes,finished:null};
  p.boxes=p.sourceTriangles.map(boxFromTriangles);p.domain=p.boxes.reduce((b,q)=>b.union(q),new T.Box3());
  if(!sourceValid(p))throw Error('Invalid Xianan source certificate');
  kits.set(kit,p);rows.set(walkable,p);retainConstructionBranch(kit,frame);
  for(const m of meshes)watch(m,'removed',p);watch(frame,'removed',p);
  return true;
}
export function finalizeXiananVisible(kit,merged){
  const p=kits.get(kit);if(!p)return false;
  if(p.revoked||p.finished||!sourceValid(p)){revoke(p);throw Error('Changed Xianan source before finish');}
  // Stream the real merged buckets. Only the sixty expected triangle keys and
  // matches survive; never copy the rest of a whole-zone material bucket.
  const wanted=new Map(),matches=p.sourceTriangles.map(ts=>new Array(ts.length)),fragments=new Map();
  p.sourceTriangles.forEach((ts,i)=>{
    const material=p.source[i].material.deref();let byKey=wanted.get(material);if(!byKey)wanted.set(material,byKey=new Map());
    ts.forEach((t,j)=>{const k=key(t.map(v=>v.map(Math.fround)));if(byKey.has(k))throw Error('Ambiguous Xianan source triangle');byKey.set(k,{i,j});});
  });
  merged.updateMatrixWorld(true);
  merged.traverse(mesh=>{
    const expected=wanted.get(mesh.material);if(!mesh.isMesh||!expected)return;
    const pos=mesh.geometry.attributes.position,index=mesh.geometry.index;
    for(let offset=0;offset<(index?.count??pos.count);offset+=3){
      const tri=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(pos,index?index.getX(offset+k):offset+k).applyMatrix4(mesh.matrixWorld).toArray());
      const target=expected.get(key(tri));if(!target)continue;
      if(matches[target.i][target.j])throw Error('Xianan finished triangle is not unique');
      matches[target.i][target.j]=tri;
      let offsets=fragments.get(mesh);if(!offsets)fragments.set(mesh,offsets=[]);offsets.push(offset);
    }
  });
  if(matches.some(ts=>ts.some(t=>!t)||ts.filter(Boolean).length!==12))throw Error('Missing Xianan finished triangle');
  p.boxes=matches.map(boxFromTriangles);p.domain=p.boxes.reduce((b,q)=>b.union(q),new T.Box3());
  p.finished=[...fragments].map(([mesh,offsets])=>snapshotMesh(mesh,offsets));p.group=new WeakRef(merged);p.groupNode=snapshotNode(merged);p.ancestry=null;p.scene=null;p.detached=false;
  merged.addEventListener('added',()=>{
    const transition=getXiananLifecycleTransition(merged,p.birth,'load');
    if(p.revoked||!verifyNode(p.groupNode,{ignoreParent:true})||!sourceValid(p)||!p.finished.every(verifyMesh)||!merged.parent?.isScene){revoke(p);return;}
    if(p.scene){
      if(!p.detached||!transition||transition.mode!=='retained'||transition.scene.deref()!==p.scene.deref()||transition.cm.deref()!==p.binding?.deref()?.cm.deref()){revoke(p);return;}
      if(!verifyAncestors(p.ancestry)){revoke(p);return;}
    }else{p.scene=new WeakRef(merged.parent);p.ancestry=snapshotAncestors(merged.parent);}
    if(merged.parent!==p.scene.deref()){revoke(p);return;}
    p.groupNode=snapshotNode(merged);p.detached=false;
  });
  merged.addEventListener('removed',()=>{
    const transition=getXiananLifecycleTransition(merged,p.birth,'unload'),active=p.binding?.deref();
    if(!transition||transition.cm.deref()!==active?.cm.deref()||p.revoked||!verifyNode(p.groupNode,{ignoreParent:true})||!sourceValid(p)||!p.finished.every(verifyMesh)){revoke(p);return;}
    active.invalid=true;p.detached=true;p.groupNode=snapshotNode(merged);
  });
  for(const s of [...p.source,...p.finished]){
    const mesh=s.node.node.deref();watch(mesh.geometry,'dispose',p);watch(mesh.material,'dispose',p);
    if(p.finished.includes(s))watch(mesh,'removed',p);
  }
  return true;
}
export function preserveXiananOwner(cm,target,original){
  const p=rows.get(original);if(!p)return false;
  const old=managers.get(cm),transition=p.group&&getXiananLifecycleTransition(p.group.deref(),p.birth,'load');
  const fail=()=>{
    if(old)old.invalid=true;
    else managers.set(cm,{p,cm:new WeakRef(cm),row:new WeakRef(target),tag:target.tag,generation:++serial,invalid:true,cleared:false});
    return false;
  };
  if(!geometryValid(p)||original!==p.walkable.deref()){revoke(p);return fail();}
  if(old&&!old.cleared)return fail();
  if(old&&(cm.walkables.includes(old.row.deref())||old.p!==p&&cm.colliders.some(c=>old.p.solids.some(s=>s.deref()===c.mesh))))return fail();
  if(old&&old.p!==p&&!old.p.revoked&&old.p.group?.deref()?.parent)return fail();
  if(p.everBound&&(!transition||transition.mode!=='retained'||transition.cm.deref()!==cm||usedLoads.has(transition)||old?.p!==p||!old.cleared))return fail();
  if(!p.everBound&&p.binding?.deref())return fail();
  const physical=[];
  for(let i=0;i<p.solids.length;i++){
    const found=cm.colliders.filter(c=>c.mesh===p.solids[i].deref());
    if(found.length!==1||!found[0].box.equals(p.solidBoxes[i])||found[0].tag!==target.tag||found[0].triangleSupport||found[0].overhead||found[0].xiqingRoofSurface)return fail();
    physical.push(snapshotDescriptor(found[0]));
  }
  if(target.type!=='box'||target.rescue!==(original.rescue!==false)||!target.box.equals(p.walkBox))return fail();
  if(transition){if(transition.cm.deref()!==cm||usedLoads.has(transition))return fail();usedLoads.add(transition);}
  const state={p,cm:new WeakRef(cm),row:new WeakRef(target),descriptor:snapshotDescriptor(target),physical,tag:target.tag,generation:++serial,invalid:false,cleared:false};
  managers.set(cm,state);p.binding=new WeakRef(state);p.everBound=true;return true;
}
export function revokeXiananOwners(cm,tag){const state=managers.get(cm);if(state&&(tag===undefined||tag===state.tag)){state.invalid=true;state.cleared=true;}}
export function revokeXiananKit(kit){const p=kits.get(kit);if(p)revoke(p);}
export function queryXiananContact(cm,from,to,radius=.5,camera=null){
  const state=managers.get(cm);if(!state)return null;
  const p=state.p,b=p.domain,pad=.5+.25;
  if(Math.max(from.x,to.x)<b.min.x-pad||Math.min(from.x,to.x)>b.max.x+pad||Math.max(from.z,to.z)<b.min.z-pad||Math.min(from.z,to.z)>b.max.z+pad)return null;
  const invalid=()=>({status:'invalid',generation:state.generation});
  if(p.revoked||state.invalid||state.cleared)return invalid();
  if(!geometryValid(p)){revoke(p);return invalid();}
  if(!verifyDescriptor(state.descriptor)||cm.walkables.filter(w=>w===state.row.deref()).length!==1||state.physical.some(s=>!verifyDescriptor(s)||!cm.colliders.includes(s.row.deref()))){state.invalid=true;return invalid();}
  if(!p.finished)return {status:'pending',generation:state.generation};
  if(p.detached||!p.scene||p.group.deref()?.parent!==p.scene.deref()){state.invalid=true;return invalid();}
  // Optional camera queries are visibility diagnostics only. Future native
  // motion must supply the real constructor-born controller's camera/session.
  if(camera&&(!camera.isCamera||p.finished.some(s=>!s.node.node.deref().layers.test(camera.layers))))return invalid();
  return {status:'valid',generation:state.generation,scene:p.scene.deref(),boxes:p.boxes.map(b=>b.clone()),radius};
}
