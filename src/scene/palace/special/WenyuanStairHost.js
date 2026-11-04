import {retainConstructionBranch} from '../ConstructionSources.js';
import * as T from 'three';
import group from '../../../../data/architecture/wenyuan-west-stair-contacts.json' with {type:'json'};
import {isBuiltWenyuanStairFrame} from './WenyuanPavilion.js';
export const wenyuanStairGroup=group;
const hosts=new WeakMap(),owners=new WeakMap(),near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const plain=o=>!!o&&o.visible&&o.rotation.toArray().slice(0,3).every(v=>v===0)&&o.scale.equals(new T.Vector3(1,1,1));
const matches=(w,p)=>w?.type===p.type&&(p.type==='box'?w.box?.isBox3&&p.min.every((v,i)=>near(w.box.min.getComponent(i),v))&&p.max.every((v,i)=>near(w.box.max.getComponent(i),v)):w.axis===p.axis&&['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],p[k])));
const frameValid=(builder,parent)=>isBuiltWenyuanStairFrame(parent)&&builder.root?.name==='outer-east'&&plain(builder.root)&&builder.root.position.lengthSq()===0&&parent.parent===builder.root&&builder.root.children.includes(parent)&&plain(parent)&&parent.position.x===group.host.x&&parent.position.y===0&&parent.position.z===group.host.z&&['id','remainingProfile','remainingId'].every(k=>parent.userData.structure?.[k]===group.host[k]);
/** Six exact existing surfaces, authenticated only after the real dedicated three-level builder finishes. */
export function authorizeWenyuanStairHost(builder,parent){
 if(!frameValid(builder,parent)||hosts.has(parent))return false;
 const rows=group.surfaces.map(p=>builder.walkables.filter(w=>matches(w,p)));
 if(rows.some(a=>a.length!==1||!Object.isExtensible(a[0])||a[0].bPrincipalStairId!==undefined||owners.has(a[0])))return false;
 const surfaces=rows.map(a=>a[0]),proof={builder,parent,surfaces};hosts.set(parent,proof);surfaces.forEach((w,i)=>owners.set(w,{id:group.surfaces[i].id,proof}));retainConstructionBranch(builder,parent);return true;
}
export function validWenyuanStairHost(builder,parent){const p=hosts.get(parent);return !!p&&p.builder===builder&&frameValid(builder,parent)&&p.surfaces.every((w,i)=>builder.walkables.includes(w)&&matches(w,group.surfaces[i])&&owners.get(w)?.id===group.surfaces[i].id);}
export const isWenyuanStairId=id=>group.surfaces.some(p=>p.id===id);
export function preserveWenyuanStairOwner(target,original,id){const p=owners.get(original);if(!p||p.id!==id||!validWenyuanStairHost(p.proof.builder,p.proof.parent))return false;owners.set(target,p);return true;}
export function validWenyuanStairOwner(w,id){const p=owners.get(w);return p?.id===id&&validWenyuanStairHost(p.proof.builder,p.proof.parent);}
export function revokeWenyuanStairHost(parent){const p=hosts.get(parent);if(p){p.surfaces.forEach(w=>{owners.delete(w);delete w.bPrincipalStairId});hosts.delete(parent);}}
