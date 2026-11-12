import * as T from 'three';
import {createChunhuaFront} from './ChunhuaOpenFront.js';
const RECORDS={"22":{"kind":"gate","name":"慈宁门","x":222.2,"z":155.7,"style":"hall","w":25.3,"gateKind":"five-bay","structureStatus":"source-bound-gate-hall-photo-fit","gateProfile":"cining-entry","rot":"south","open":true},"23":{"kind":"courtWalls","x0":187,"x1":258,"z0":155.7,"z1":295,"gates":[{"side":"s","at":222.2,"gate":"慈宁门"}]},"26":{"kind":"hall","x":199.2,"z":276.5,"w":14.4,"d":11.3,"pad":0.5,"ph":0.45,"colH":5.44,"roof":"gable","brackets":false,"map":"hall","source":"estimated"},"27":{"kind":"hall","x":223.1,"z":276.5,"w":14.4,"d":11.3,"pad":0.5,"ph":0.45,"colH":5.44,"roof":"gable","brackets":false,"map":"hall","source":"estimated"},"28":{"kind":"hall","x":245.9,"z":276.5,"w":12.6,"d":11.3,"pad":0.5,"ph":0.45,"colH":5.44,"roof":"gable","brackets":false,"map":"hall","source":"estimated"},"37":{"kind":"gate","name":"建福门","x":183.7,"z":409.4},"38":{"kind":"courtWalls","x0":178.6,"x1":245,"z0":409.4,"z1":520,"gates":[{"side":"s","at":183.7,"gate":"建福门"}]},"39":{"kind":"hall","name":"延春阁","x":216,"z":485.5,"w":23.5,"d":24.3,"pad":0.8,"ph":0.75,"colH":10.24,"roof":"pavilion","layers":2}};
const done=new WeakSet(),pending=new WeakSet(),identity=new T.Matrix4();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const same=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const ks=Object.keys(a);return ks.length===Object.keys(b).length&&ks.every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));};
const finiteBox=b=>b?.isBox3&&!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite);
export function buildChunhuaOpenFront(builder,zone){
 if(zone?.id!=='outer-west')return false;
 if(builder?.group||builder?.disposed)throw Error('H37 finished or disposed builder');
 const k=builder?.kit,r=k?.root;
 if(!r?.isGroup||r.name!=='outer-west'||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||!r.matrix.equals(identity)||!r.matrixWorld.equals(identity)||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!mutable(r.children)||['colliders','owned','walkables','rooms','mapItems'].some(n=>!mutable(k[n]))||Object.entries(RECORDS).some(([i,v])=>!same(zone.items?.[i],v)))throw Error('H37 exact mutable original host');
 if(done.has(k)||pending.has(k))throw Error('H37 once');
 const ids=[];r.traverse(o=>{if(o.userData.structure?.sourceObjectId)ids.push(o.userData.structure.sourceObjectId);});
 if(ids.includes('FC-98F5C6BC6B'))throw Error('H37 duplicate identity');
 if(['FC-ADC59D34D5','FC-F95F60645E','FC-C7BA2B3690','FC-DAA0E0A7B9','FC-2953884F94'].some(id=>ids.filter(q=>q===id).length!==1))throw Error('H37 missing actual neighboring host');
 if(![199.2,223.1,245.9].every(x=>r.children.some(g=>g.position.x===x&&g.position.z===276.5&&g.children.some(m=>m.isMesh))))throw Error('H37 missing original rear hosts');
 pending.add(k);const lengths=[k.colliders.length,k.owned.length];let a,ok=false;
 try{
  a=createChunhuaFront();a.group.position.set(216,0,304.4);a.group.updateMatrixWorld(true);const box=new T.Box3().setFromObject(a.group);
  r.updateMatrixWorld(true);r.traverse(m=>{if(m.isMesh){const old=new T.Box3().setFromObject(m);if(!finiteBox(old)||box.intersectsBox(old))throw Error('H37 invalid or overlapping actual mesh');}});
  for(const old of k.colliders)if(!finiteBox(old)||box.intersectsBox(old))throw Error('H37 invalid or overlapping owner');
  const contacts=a.contacts.map(c=>{const b=c.clone().translate(a.group.position);b.chunhuaFrontProxy=true;return b;});
  const meta=a.group.userData.structure;Object.assign(meta,{productionIntegrated:true,normalHook:'NEW_LIMITED_OPEN_FRONT_NOT_OLD_FROZEN_DIAGNOSIS',defaultEnabled:true,worldXDeltaFromD1:3.8,collision:'INDEPENDENT_CONSERVATIVE_PRIMITIVE_BOXES_OPEN_CENTRE'});
  r.add(a.group);k.colliders.push(...contacts);k.owned.push(...a.materials);done.add(k);ok=true;return{group:a.group,contacts,materials:a.materials,meta};
 }finally{if(!ok){k.colliders.length=lengths[0];k.owned.length=lengths[1];a?.dispose();}pending.delete(k);}
}
