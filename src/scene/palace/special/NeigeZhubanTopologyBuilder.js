import * as T from 'three';
import {createNeigeZhubanTopology} from './NeigeZhubanTopology.js';
const RECORDS={"0":{"kind":"gate","name":"协和门","x":-106.47,"z":-300.3,"rot":"east","style":"hall","gateKind":"five-bay","gateProfile":"xiehe","open":true,"dimensionStatus":"provisional"},"2":{"kind":"gate","name":"左翼门","x":-106.47,"z":-53.1,"rot":"east","style":"hall"},"4":{"kind":"gate","name":"景运门","x":-106.47,"z":174.1,"rot":"east","style":"hall","gateKind":"five-bay","gateProfile":"jingyun","open":true,"dimensionStatus":"provisional"},"6":{"kind":"wall","from":[-106.47,-416],"to":[-106.47,203.85],"h":7,"gaps":[{"at":-300.3,"gate":"协和门"},{"at":-53.1,"gate":"左翼门"},{"at":174.1,"gate":"景运门"},{"at":-109.3,"w":43.212,"source":"pavilion-rear-shell-interface","pavilionProfile":"tiren"}]}};
const done=new WeakSet(),pending=new WeakSet(),identity=new T.Matrix4();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const same=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;return Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));};
const finite=b=>b?.isBox3&&!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite);
export function buildNeigeZhubanTopology(builder,zone){
 if(zone?.id!=='axis-courts')return false;
 if(builder?.group||builder?.disposed)throw Error('B23 finished/disposed builder');
 const k=builder?.kit,r=k?.root;
 if(!r?.isGroup||r.name!=='axis-courts'||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(identity)||!r.matrixWorld.equals(identity)||!mutable(r.children)||['colliders','owned','walkables','rooms','mapItems'].some(n=>!mutable(k[n]))||!same(zone.bounds,{x0:-130,x1:157.5,z0:-494,z1:204.6})||!zone.neighbors?.includes('outer-east')||Object.entries(RECORDS).some(([i,v])=>!same(zone.items?.[i],v))||![0,2,4].every(i=>Number.isFinite(builder.gateWidths?.get(zone.items[i].name))))throw Error('B23 exact normal axis host required');
 if(done.has(k)||pending.has(k))throw Error('B23 once');
 let duplicate=false,meshes=0;r.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-15E0B02776')duplicate=true;if(o.isMesh)meshes++;});if(duplicate||!meshes||!k.colliders.length)throw Error('B23 duplicate or absent existing host');
 pending.add(k);const before=[k.colliders.length,k.owned.length];let a,ok=false;
 try{
  a=createNeigeZhubanTopology({enabled:true});a.group.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(a.group),reserve=new T.Box3(new T.Vector3(-129.001,-.00001,-394.901),new T.Vector3(-119.999,4.201,-388.899));if(!finite(bounds)||!reserve.containsBox(bounds))throw Error('B23 own reserve exceeded');
  r.updateMatrixWorld(true);r.traverse(m=>{if(m.isMesh){const b=new T.Box3().setFromObject(m);if(!finite(b)||bounds.intersectsBox(b))throw Error('B23 invalid/overlapping axis mesh');}});for(const b of k.colliders)if(!finite(b)||bounds.intersectsBox(b))throw Error('B23 invalid/overlapping axis owner');
  const meta=a.group.userData.structure;Object.assign(meta,{productionIntegrated:true,defaultEnabled:true,singleOwnership:'axis-courts ONLY; no outer-east attachment',directoryZoneMigrationPending:false});r.add(a.group);k.colliders.push(...a.contacts);k.owned.push(...a.materials);done.add(k);ok=true;return{group:a.group,contacts:a.contacts,materials:a.materials,meta};
 }finally{if(!ok){k.colliders.length=before[0];k.owned.length=before[1];a?.dispose();}pending.delete(k);}
}
