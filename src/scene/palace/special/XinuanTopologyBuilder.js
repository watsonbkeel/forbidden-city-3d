import * as T from 'three';
import {CourtKit} from '../kit.js';
import {KUNNING_PROFILE} from './KunningProfile.js';
import {createXinuanTopologyMassing} from './XinuanTopologyMassing.js';
const RECORDS={"8":{"kind":"gate","name":"增瑞门","x":54.25,"z":384.2,"rot":"west"},"9":{"kind":"gate","name":"端则门","x":54.25,"z":410,"rot":"west","source":"estimated"},"11":{"kind":"wall","from":[54.25,203.85],"to":[54.25,422.7],"h":7,"gaps":[{"at":249.2,"gate":"月华门"},{"at":313.7,"gate":"凤彩门"},{"at":354.2,"gate":"隆福门"},{"at":384.2,"gate":"增瑞门"},{"at":410,"gate":"端则门"}]},"24":{"kind":"corridor","from":[51.15,390.2],"to":[51.15,404],"facing":"x-","depth":3.6,"colH":3.4,"furnishingPolicy":{"mode":"unknown-inventory","target":"garden/items/24","runtimeInventoryId":"RI-C112A7BE8A39"}},"29":{"kind":"gate","name":"坤宁门","x":1.1,"z":422.7,"style":"hall","w":12,"gateKind":"three-bay","gateProfile":"kunning","rot":"north"},"32":{"kind":"wall","from":[-68,422.7],"to":[68,422.7],"h":7,"gaps":[{"at":1.1,"gate":"坤宁门"},{"at":-64,"gate":"长康左门"},{"at":63.7,"gate":"长康右门"}]}};
const pending=new WeakSet(),done=new WeakSet(),identity=new T.Matrix4();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&!Object.isFrozen(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const finite=b=>b?.isBox3&&!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite);
const same=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const k=Object.keys(a);return k.length===Object.keys(b).length&&k.every(x=>Object.hasOwn(b,x)&&same(a[x],b[x]));};
function admit(k,z){
 const r=k?.root,b=z.bounds;
 if(!(k instanceof CourtKit)||!r||r.parent||r.name!=='garden'||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||!r.matrix.equals(identity)||!r.matrixWorld.equals(identity)||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!mutable(r.children)||['colliders','owned','rooms','walkables','mapItems'].some(n=>!mutable(k[n]))||pending.has(k)||done.has(k)||!same(b,{x0:-68.75,x1:68.75,z0:205,z1:525.8})||Object.entries(RECORDS).some(([i,record])=>!same(z.items?.[i],record)))throw Error('D26 strict west garden admission failed');
 if(KUNNING_PROFILE.profileHash!=='1bb852b57c93427ac87a15f7052014d233459575d4ee9608055903cd4c334192')throw Error('D26 retained independent palace profile changed');
 let duplicate=false;r.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-C3BA7692B4')duplicate=true;});if(duplicate)throw Error('D26 already owned');
 for(const [x,z,rot]of [[54.25,384.2,-Math.PI/2],[54.25,410,-Math.PI/2],[51.15,397.1,Math.PI/2]]){
  const matches=r.children.filter(f=>f.position.x===x&&Math.abs(f.position.z-z)<1e-10);if(matches.length!==1)throw Error('D26 missing independent west neighbor');const f=matches[0];let meshes=0;f.traverse(o=>{if(o.isMesh&&o.geometry?.attributes?.position?.count)meshes++;});if(!meshes||f.position.y!==0||f.rotation.x||f.rotation.z||f.rotation.y!==rot||!f.matrixAutoUpdate||!f.scale.equals(new T.Vector3(1,1,1)))throw Error('D26 changed west neighbor transform or geometry');
 }
}
/** Normal garden hook. Shared three-palace deck is independently built/checked
 * by finite admission tests, NOT claimed live-visible from this garden root. */
export function buildXinuanTopologyMassing(k,z){
 if(z?.id!=='garden')return false;admit(k,z);pending.add(k);
 const before={colliders:k.colliders.length,owned:k.owned.length};let a,success=false;
 try{
  a=createXinuanTopologyMassing({enabled:true});const bounds=new T.Box3().setFromObject(a.group);if(!new T.Box3(new T.Vector3(30.999,-.00001,394.099),new T.Vector3(39.001,4.541,400.101)).containsBox(bounds))throw Error('D26 reserve drift');
  for(const b of k.colliders){if(!finite(b))throw Error('D26 invalid owner');if(b.max.y>0&&bounds.intersectsBox(b))throw Error('D26 existing contact overlap');}
  k.root.updateMatrixWorld(true);k.root.traverse(m=>{if(m.isMesh){const b=new T.Box3().setFromObject(m);if(!finite(b)||bounds.intersectsBox(b))throw Error('D26 invalid or intersecting neighbor mesh');}});
  for(const v of KUNNING_PROFILE.protectedVolumes){const offset=new T.Vector3(0,2.16,386.1),b=new T.Box3(new T.Vector3(...v.bounds.min).add(offset),new T.Vector3(...v.bounds.max).add(offset));if(bounds.intersectsBox(b))throw Error('D26 protected Kunning passage');}
  a.meta.defaultEnabled=true;a.meta.installation='NORMAL_GARDEN_WEST_HOST_ENGINEERING_FIT';a.meta.visualAcceptance='PENDING_REAL_SCENE_NOT_HISTORIC_SHAPE_VERIFIED';
  k.root.add(a.group);k.colliders.push(...a.contacts);k.owned.push(...a.materials);done.add(k);success=true;return{group:a.group,meta:a.meta,contacts:a.contacts,materials:a.materials};
 }finally{
  if(!success){k.colliders.length=before.colliders;k.owned.length=before.owned;a?.dispose();}pending.delete(k);
 }
}
