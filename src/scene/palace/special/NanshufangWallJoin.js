import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createNanshufangTopologyBody} from './NanshufangTopologyBody.js';
const RECORDS={"11": {"kind": "wall", "from": [54.25, 203.85], "to": [54.25, 422.7], "h": 7, "gaps": [{"at": 249.2, "gate": "月华门"}, {"at": 313.7, "gate": "凤彩门"}, {"at": 354.2, "gate": "隆福门"}, {"at": 384.2, "gate": "增瑞门"}, {"at": 410, "gate": "端则门"}]}, "13": {"kind": "wall", "from": [19.3, 215.3], "to": [54.25, 215.3], "h": 7}, "20": {"kind": "corridor", "from": [51.15, 215.8], "to": [51.15, 242.4], "facing": "x-", "depth": 3.6, "colH": 3.4, "furnishingPolicy": {"mode": "unknown-inventory", "target": "garden/items/20", "runtimeInventoryId": "RI-772B9B8AB63B"}}};
const pending=new WeakSet(),done=new WeakSet(),I=new T.Matrix4(),SEAM=2**-16;
const same=(a,b)=>{if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const ks=Object.keys(a);return ks.length===Object.keys(b).length&&ks.every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));};
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&!Object.isFrozen(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
/** Early buildWall dispatch, never remove an already built original wall.
 * enabled=false returns control to unchanged generic wall. All dimensions fit. */
export function buildNanshufangWallJoin(k,item,z,{enabled=true}={}){
 if(typeof enabled!=='boolean')throw Error('D31 explicit boolean required');
 if(!enabled||z?.id!=='garden'||z.items?.indexOf(item)!==13)return false;
 const r=k?.root,arrays=['colliders','owned','walkables','rooms','mapItems'];
 if(!(k instanceof CourtKit)||!r||r.name!=='garden'||r.parent||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||!r.matrix.equals(I)||!r.matrixWorld.equals(I)||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!mutable(r.children)||arrays.some(n=>!mutable(k[n]))||pending.has(k)||done.has(k)||!same(z.bounds,{x0:-68.75,x1:68.75,z0:205,z1:525.8})||Object.entries(RECORDS).some(([i,v])=>!same(z.items[i],v)))throw Error('D31 strict source/host admission');
 pending.add(k);let body;const stage=Object.create(k);stage.root=new T.Group();stage.colliders=[];stage.owned=[];
 const oldChildren=[...r.children],lengths=Object.fromEntries(arrays.map(n=>[n,k[n].length]));let frames=[],success=false;
 try{
  body=createNanshufangTopologyBody({enabled:true});const box=new T.Box3().setFromObject(body.group);
  if(box.min.x!==43.5||box.max.x!==53.25||Math.abs(box.min.z-210.8)>1e-8||Math.abs(box.max.z-215.3)>1e-8)throw Error('D31 reserve drift');
  r.updateMatrixWorld(true);r.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-4110BD4CBE')throw Error('D31 duplicate');if(o.isMesh&&box.intersectsBox(new T.Box3().setFromObject(o)))throw Error('D31 existing geometry overlap');});
  for(const b of k.colliders){if(!b?.isBox3||b.isEmpty()||![...b.min.toArray(),...b.max.toArray()].every(Number.isFinite))throw Error('D31 invalid owner');if(b.max.y>0&&box.intersectsBox(b))throw Error('D31 original wall already built or contact overlap');}
  const segments=[[19.3,215.3,43.5+SEAM,215.3],[53.25-SEAM,215.3,54.25,215.3]];
  for(const [i,seg]of segments.entries()){const n=stage.root.children.length,c=stage.colliders.length;stage.wall(...seg,{h:7});for(const f of stage.root.children.slice(n))f.userData.d31WallSegment={source:'garden/items/13',segment:i};for(const b of stage.colliders.slice(c))b.d31WallSegment={source:'garden/items/13',segment:i};}
  body.meta.productionIntegrated=true;body.meta.normalHook='EXACT_GARDEN_WALL13_REPLACEMENT';body.meta.wholeObjectAccepted=false;body.meta.floatSeam=SEAM;
  frames=[...stage.root.children];for(const f of [...frames,body.group])r.add(f);
  k.colliders.push(...stage.colliders,...body.contacts);k.owned.push(...body.materials);done.add(k);success=true;return true;
 }finally{
  if(!success){for(const f of [...r.children])if(!oldChildren.includes(f)){r.children.splice(r.children.indexOf(f),1);f.parent=null;}for(const n of arrays)k[n].length=lengths[n];const seen=new Set();for(const f of [...stage.root.children,...frames])f.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}});body?.dispose();}
  pending.delete(k);
 }
}
