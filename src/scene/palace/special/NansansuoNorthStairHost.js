import {retainConstructionBranch} from '../ConstructionSources.js';
import * as T from 'three';
import source from '../../../../data/architecture/nansansuo-north-stair-contacts.json' with {type:'json'};
import {isCertifiedNansansuoNorthHost} from './NansansuoNorthEaves.js';
import {validateNansansuoInventoryPolicy} from '../NansansuoInventoryPolicy.js';
export const nansansuoNorthStairGroups=source.groups;
const hosts=new WeakMap(),owners=new WeakMap(),ids=new Set(source.groups.flatMap(g=>g.surfaces.map(p=>p.id))),near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const matches=(w,p)=>w?.type===p.type&&(p.type==='box'?w.box?.isBox3&&p.min.every((v,i)=>near(w.box.min.getComponent(i),v))&&p.max.every((v,i)=>near(w.box.max.getComponent(i),v)):w.axis===p.axis&&['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],p[k])));
export const isNansansuoNorthStairGroup=id=>source.groups.some(g=>g.id===id);
export const isNansansuoNorthStairId=id=>ids.has(id);
/** Exact original faces only. Called within the successful three-host terminal
 * publication, after complete old geometry/roof source authentication. A copied
 * host, legacy direct call or copied live support has no private provenance. */
export function authorizeNansansuoNorthStairHost(builder,parent,zoneJson,itemIndex,surfaces){
 const group=source.groups.find(g=>g.host.itemIndex===itemIndex),h=group?.host,item=zoneJson?.items?.[itemIndex],g=parent?.userData.structure;
 if(!group||!isCertifiedNansansuoNorthHost(parent)||zoneJson?.id!=='outer-east'||builder.root?.name!=='outer-east'||parent.parent!==builder.root||!builder.root.children.includes(parent)||hosts.has(parent)||!parent.visible||parent.position.x!==h.x||parent.position.y!==0||parent.position.z!==h.z||parent.rotation.toArray().slice(0,3).some(Boolean)||!parent.scale.equals(new T.Vector3(1,1,1))||g?.remainingId!==h.remainingId||g.remainingProfile!==h.remainingProfile||surfaces?.length!==2)return false;
 const addons=parent.children.filter(c=>c.userData.nansansuoNorthEaves?.itemIndex===itemIndex);if(addons.length!==1||addons[0].userData.nansansuoNorthEaves.retainedSourceId!==h.remainingId)return false;
 validateNansansuoInventoryPolicy({zoneId:zoneJson.id,itemIndex,item});
 if(surfaces.some((w,i)=>!Object.isExtensible(w)||w.bPrincipalStairId!==undefined||owners.has(w)||!matches(w,group.surfaces[i])||!builder.walkables.includes(w)||builder.walkables.filter(q=>matches(q,group.surfaces[i])).length!==1))return false;
 const proof={builder,parent,group,surfaces:[...surfaces]};hosts.set(parent,proof);surfaces.forEach((w,i)=>owners.set(w,{id:group.surfaces[i].id,proof}));retainConstructionBranch(builder,parent);return true;
}
export function validNansansuoNorthStairHost(builder,parent,groupId){const p=hosts.get(parent),h=p?.group.host,g=parent?.userData.structure;return !!p&&p.builder===builder&&p.group.id===groupId&&parent.parent===builder.root&&builder.root.children.includes(parent)&&parent.position.x===h.x&&parent.position.y===0&&parent.position.z===h.z&&parent.rotation.toArray().slice(0,3).every(v=>v===0)&&parent.scale.equals(new T.Vector3(1,1,1))&&g?.remainingId===h.remainingId&&g.remainingProfile===h.remainingProfile&&p.surfaces.every((w,i)=>builder.walkables.includes(w)&&matches(w,p.group.surfaces[i])&&owners.get(w)?.id===p.group.surfaces[i].id);}
export function preserveNansansuoNorthStairOwner(target,original,id){const p=owners.get(original);if(!p||p.id!==id)return false;owners.set(target,p);return true;}
export const validNansansuoNorthStairOwner=(w,id)=>owners.get(w)?.id===id;
export function revokeNansansuoNorthStairHost(parent){const p=hosts.get(parent);if(p){for(const w of p.surfaces){owners.delete(w);delete w.bPrincipalStairId;}hosts.delete(parent);}}
