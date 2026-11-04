import {retainConstructionBranch} from '../ConstructionSources.js';
import * as T from 'three';
import {isBuiltNansansuoFrontFrame} from './NansansuoFrontHalls.js';
import source from '../../../../data/architecture/nansansuo-front-stair-contacts.json' with {type:'json'};
import {validateNansansuoInventoryPolicy} from '../NansansuoInventoryPolicy.js';
export const nansansuoFrontStairGroups=source.groups;
const hosts=new WeakMap(),owners=new WeakMap(),ids=new Set(source.groups.flatMap(g=>g.surfaces.map(p=>p.id)));
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const matches=(w,p)=>w?.type===p.type&&(p.type==='box'?w.box?.isBox3&&p.min.every((v,i)=>near(w.box.min.getComponent(i),v))&&p.max.every((v,i)=>near(w.box.max.getComponent(i),v)):w.axis===p.axis&&['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],p[k])));
export const isNansansuoFrontStairGroup=id=>source.groups.some(g=>g.id===id);
export const isNansansuoFrontStairId=id=>ids.has(id);
/** Called ONLY inside the successful terminal adapter transaction. The exact
 * source geometry/20-collider/11-low-mesh certification already precedes this.
 * No support is fabricated and legacy direct builders never call this API. */
export function authorizeNansansuoFrontStairHost(builder,parent,zoneJson,itemIndex,surfaces,lowMeshes){
 const group=source.groups.find(g=>g.host.itemIndex===itemIndex),h=group?.host,item=zoneJson?.items?.[itemIndex],g=parent?.userData.nansansuoFrontHall;
 if(!group||!isBuiltNansansuoFrontFrame(parent)||zoneJson.id!=='outer-east'||builder.root?.name!=='outer-east'||!builder.root.children.includes(parent)||parent.parent!==builder.root||hosts.has(parent)||parent.name!==undefined&&parent.name!==''||parent.position.x!==h.x||parent.position.y||parent.position.z!==h.z||parent.rotation.toArray().slice(0,3).some(Boolean)||!parent.scale.equals(new T.Vector3(1,1,1))||!parent.visible||g?.objectId!==h.objectId||g.name!==h.name||g.x!==h.x||g.z!==h.z||g.width!==h.w||g.depth!==h.d||g.floorY!==h.floorY||parent.userData.structure?.scope!=='OWN_EXISTING_FRONT_HALL_ONLY'||!Array.isArray(lowMeshes)||lowMeshes.length!==11||lowMeshes.some(m=>m.parent!==parent||!parent.children.includes(m))||!Array.isArray(surfaces)||surfaces.length!==2)return false;
 validateNansansuoInventoryPolicy({zoneId:zoneJson.id,itemIndex,item});
 if(surfaces.some((w,i)=>!Object.isExtensible(w)||w.bPrincipalStairId!==undefined||!matches(w,group.surfaces[i])||builder.walkables.filter(q=>matches(q,group.surfaces[i])).length!==1||!builder.walkables.includes(w)||owners.has(w)))return false;
 const proof={builder,parent,group,surfaces:[...surfaces]};hosts.set(parent,proof);surfaces.forEach((w,i)=>owners.set(w,{id:group.surfaces[i].id,host:proof}));retainConstructionBranch(builder,parent);return true;
}
export function validNansansuoFrontStairHost(builder,parent,groupId){const p=hosts.get(parent),h=p?.group.host,g=parent?.userData.nansansuoFrontHall;return !!p&&p.builder===builder&&p.group.id===groupId&&builder.root.children.includes(parent)&&parent.parent===builder.root&&parent.position.x===h.x&&parent.position.y===0&&parent.position.z===h.z&&parent.rotation.toArray().slice(0,3).every(v=>v===0)&&parent.scale.equals(new T.Vector3(1,1,1))&&g?.objectId===h.objectId&&g.floorY===h.floorY&&p.surfaces.every((w,i)=>builder.walkables.includes(w)&&matches(w,p.group.surfaces[i])&&owners.get(w)?.id===p.group.surfaces[i].id);}
export function preserveNansansuoFrontStairOwner(target,original,id){const p=owners.get(original);if(!p||p.id!==id)return false;owners.set(target,p);return true;}
export const validNansansuoFrontStairOwner=(w,id)=>owners.get(w)?.id===id;
export function revokeNansansuoFrontStairHost(parent){const p=hosts.get(parent);if(p){for(const w of p.surfaces){owners.delete(w);delete w.bPrincipalStairId;}hosts.delete(parent);}}
