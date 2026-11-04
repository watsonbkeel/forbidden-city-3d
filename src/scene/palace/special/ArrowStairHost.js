import {retainConstructionBranch} from '../ConstructionSources.js';
import * as T from 'three';
import group from '../../../../data/architecture/arrow-existing-stair-contacts.json' with {type:'json'};
import {isBuiltArrowFrame} from './EnclosedPavilions.js';
export const arrowStairGroup=group;
const hosts=new WeakMap(),owners=new WeakMap(),near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const matches=(w,p)=>w?.type===p.type&&(p.type==='box'?w.box?.isBox3&&p.min.every((v,i)=>near(w.box.min.getComponent(i),v))&&p.max.every((v,i)=>near(w.box.max.getComponent(i),v)):w.axis===p.axis&&['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],p[k])));
export const isArrowStairId=id=>group.surfaces.some(p=>p.id===id);
/** Bind only the original three surfaces of a normally completed dedicated Arrow hall.
 * Copying a frame or labels cannot acquire the builder's private identity. */
export function authorizeArrowStairHost(builder,parent,surfaces){
 const h=group.host,g=parent?.userData.structure;
 if(!isBuiltArrowFrame(parent)||builder.root?.name!=='outer-east'||parent.parent!==builder.root||!builder.root.children.includes(parent)||hosts.has(parent)||parent.position.x!==h.x||parent.position.y!==0||parent.position.z!==h.z||parent.rotation.toArray().slice(0,3).some(Boolean)||!parent.scale.equals(new T.Vector3(1,1,1))||!parent.visible||!g||['id','key','profile'].some(k=>g[k]!==h[k])||surfaces?.length!==3)return false;
 if(surfaces.some((w,i)=>!Object.isExtensible(w)||w.bPrincipalStairId!==undefined||owners.has(w)||!matches(w,group.surfaces[i])||!builder.walkables.includes(w)||builder.walkables.filter(q=>matches(q,group.surfaces[i])).length!==1))return false;
 const proof={builder,parent,surfaces:[...surfaces]};hosts.set(parent,proof);surfaces.forEach((w,i)=>owners.set(w,{id:group.surfaces[i].id,proof}));retainConstructionBranch(builder,parent);return true;
}
export function validArrowStairHost(builder,parent){const p=hosts.get(parent);return !!p&&p.builder===builder&&parent.parent===builder.root&&builder.root.children.includes(parent)&&parent.position.x===group.host.x&&parent.position.y===0&&parent.position.z===group.host.z&&parent.rotation.toArray().slice(0,3).every(v=>v===0)&&parent.scale.equals(new T.Vector3(1,1,1))&&p.surfaces.every((w,i)=>builder.walkables.includes(w)&&matches(w,group.surfaces[i])&&owners.get(w)?.id===group.surfaces[i].id);}
export function preserveArrowStairOwner(target,original,id){const p=owners.get(original);if(!p||p.id!==id)return false;owners.set(target,p);return true;}
export const validArrowStairOwner=(w,id)=>owners.get(w)?.id===id;
export function revokeArrowStairHost(parent){const p=hosts.get(parent);if(p){p.surfaces.forEach(w=>{owners.delete(w);delete w.bPrincipalStairId});hosts.delete(parent);}}
