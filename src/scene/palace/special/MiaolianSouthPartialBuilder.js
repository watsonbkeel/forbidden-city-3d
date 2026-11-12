import * as T from 'three';
import {createMiaolianSouthPartial,MIAOLIAN_ID} from './MiaolianSouthPartial.js';
const RECORDS={"37":{"kind":"gate","name":"建福门","x":183.7,"z":409.4},"38":{"kind":"courtWalls","x0":178.6,"x1":245,"z0":409.4,"z1":520,"gates":[{"side":"s","at":183.7,"gate":"建福门"}]},"39":{"kind":"hall","name":"延春阁","x":216,"z":485.5,"w":23.5,"d":24.3,"pad":0.8,"ph":0.75,"colH":10.24,"roof":"pavilion","layers":2},"40":{"kind":"region","name":"建福宫花园","x0":178.6,"x1":245,"z0":409.4,"z1":520}};
const ORIGINAL_BOUNDS={"x0":178.05,"x1":382,"z0":-355.24,"z1":529.9};
const pending=new WeakSet(),done=new WeakSet(),I=new T.Matrix4();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&!Object.isFrozen(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const same=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));};
const finite=b=>b?.isBox3&&!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite);
const positive=(a,b)=>{const s=a.clone().intersect(b).getSize(new T.Vector3());return s.x>1e-5&&s.y>1e-5&&s.z>1e-5;};
export function buildMiaolianSouthPartial(k,zone){
 if(zone?.id!=='outer-west')return false;const r=k?.root;if(!same(zone.bounds,ORIGINAL_BOUNDS)||zone.items?.length!==58)throw Error('H24 exact full original host only');
 if(!r?.isGroup||r.name!=='outer-west'||r.parent||r.userData.architecture||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||!r.matrix.equals(I)||!r.matrixWorld.equals(I)||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!mutable(r.children)||['colliders','owned','walkables','rooms','mapItems','regions'].some(n=>!mutable(k[n]))||Object.entries(RECORDS).some(([i,x])=>!same(zone.items?.[i],x)))throw Error('H24 exact mutable unmerged host');
 if(pending.has(k)||done.has(k))throw Error('H24 once');let own=0;const names=[];r.traverse(o=>{if(o.userData.structure?.sourceObjectId===MIAOLIAN_ID)own++;if(o.isGroup)names.push(o.name)});if(own)throw Error('H24 duplicate identity');
 if(!['bilin-guan','ninghui-hall'].every(n=>names.filter(x=>x===n).length===1))throw Error('H24 missing real neighbors');
 const length=[k.colliders.length,k.owned.length];let a,ok=false;pending.add(k);
 try{a=createMiaolianSouthPartial();a.group.position.set(237,0,477.35);a.group.updateMatrixWorld(true);r.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(a.group),contact=a.contact.clone().translate(a.group.position);contact.miaolianSouthPartialProxy=true;
  if(!finite(bounds)||!finite(contact))throw Error('H24 invalid body');
  // Float32 boxes may differ a few ULPs from the analytic proxy, never enough to alter the route margin.
  if(bounds.min.distanceTo(contact.min)>1e-5||bounds.max.distanceTo(contact.max)>1e-5)throw Error('H24 geometry proxy mismatch');
  for(const b of k.colliders)if(!finite(b)||positive(contact,b))throw Error('H24 invalid or overlapping owner');
  r.traverse(o=>{if(o.isMesh){const b=new T.Box3().setFromObject(o);if(!finite(b)||positive(contact,b))throw Error('H24 invalid or overlapping mesh');}});
  Object.assign(a.group.userData.structure,{productionIntegrated:true,normalHook:'AFTER_ALL_EXISTING_NEIGHBORS_BEFORE_MERGE',engineeringReserve:{min:contact.min.toArray(),max:contact.max.toArray()},southGapNotWalkable:true});
  r.add(a.group);k.colliders.push(contact);k.owned.push(...a.materials);done.add(k);ok=true;return{group:a.group,contact,meta:a.group.userData.structure};
 }finally{if(!ok){k.colliders.length=length[0];k.owned.length=length[1];a?.dispose();}pending.delete(k);}
}
