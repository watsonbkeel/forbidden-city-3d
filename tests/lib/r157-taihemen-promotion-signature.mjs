// Exact component oracle. Only explicitly enumerated production identity fields
// differ; no geometry, material, pose, render state or physics exemptions.
import {createHash} from 'node:crypto';
import {taiheWorldPhysics} from './r157-taihe-world-retention.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function stable(x){if(x===undefined||x===null||typeof x!=='object')return x;if(x.isMaterial)return stable(x.toJSON());if(Array.isArray(x))return x.map(stable);return Object.fromEntries(Object.keys(x).filter(k=>k!=='uuid').sort().map(k=>[k,stable(x[k])]));}
function materialValue(m){const j=m.toJSON(),ids=new Map();function collect(x,path='root'){if(!x||typeof x!=='object')return;if(x.uuid)ids.set(x.uuid,path);for(const[k,v]of Object.entries(x))if(k!=='uuid')collect(v,path+'.'+k);}collect(j);function normalize(x){if(typeof x==='string'&&ids.has(x))return '@'+ids.get(x);if(x===null||typeof x!=='object')return x;if(Array.isArray(x))return x.map(normalize);return Object.fromEntries(Object.keys(x).filter(k=>k!=='uuid').sort().map(k=>[k,normalize(x[k])]));}return normalize(j);}
export function taihemenPromotionSignature(W,{details=false}={}){
 const rows=[],geometries=new Map(),materials=new Map();W.root.updateWorldMatrix(true,true);
 W.root.traverse(o=>{
  const data=stable(o.userData);
  if(o===W.root){const p=data.taihemenSouth;if(p.candidateStatus==='PRODUCTION_C_SOURCE_FIT_NOT_SURVEY')p.candidateStatus='ISOLATED_C_SOURCE_FIT_NOT_SURVEY';const profiles=[...p.fixtures,...(data.architecture??[]).filter(a=>p.fixtureIds.includes(a.id)&&a.profile?.id===a.id).map(a=>a.profile)];for(const f of profiles){if(f.productionBinding===f.id&&f.implementedInProduction===true){delete f.productionBinding;f.implementedInProduction=false;}}}
  const f=data.structure?.profile;if(f&&W.p.fixtureIds.includes(data.structure.id)&&f.id===data.structure.id&&f.productionBinding===f.id&&f.implementedInProduction===true){delete f.productionBinding;f.implementedInProduction=false;}
  const mats=(Array.isArray(o.material)?o.material:[o.material]).filter(Boolean);
  for(const m of mats)if(!materials.has(m))materials.set(m,materials.size);
  if(o.geometry&&!geometries.has(o.geometry))geometries.set(o.geometry,geometries.size);
  rows.push({type:o.type,name:o.name,matrix:o.matrix.toArray(),world:o.matrixWorld.toArray(),visible:o.visible,layers:o.layers.mask,renderOrder:o.renderOrder,frustumCulled:o.frustumCulled,matrixAutoUpdate:o.matrixAutoUpdate,matrixWorldAutoUpdate:o.matrixWorldAutoUpdate,castShadow:o.castShadow,receiveShadow:o.receiveShadow,data,materials:mats.map(m=>[materials.get(m),materialValue(m)]),geometry:o.geometry?{shared:geometries.get(o.geometry),drawRange:o.geometry.drawRange,groups:o.geometry.groups,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,array:Array.from(a.array)}])),index:o.geometry.index?Array.from(o.geometry.index.array):null}:null});
 });
 if(details)return rows;
 return {visual:hash(rows),physics:hash(taiheWorldPhysics(W)),objects:rows.length,geometries:geometries.size,materials:materials.size};
}
