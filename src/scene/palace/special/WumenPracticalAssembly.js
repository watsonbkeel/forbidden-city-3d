import {authorizeWumenSouthDeckSources} from './WumenSouthDeckBoundary.js';
import * as THREE from 'three';
import {WUMEN_PRACTICAL_FIT as FIT} from './WumenPracticalFit.js';
import {buildWumenJointVisiblePlatform} from './WumenPracticalPlatform.js';
import {buildWumenPracticalUpper} from './WumenPracticalUpper.js';
import {triangleInstance} from '../../../utils/TriangleSupport.js';
import {cloneOverheadShape} from '../../../utils/OverheadShape.js';

const geometries=root=>{const result=new Set();root.traverse(o=>{if(o.geometry)result.add(o.geometry);});return result;};
function worldCollider(source,offset){
 const result=source.clone().translate(offset);
 if(source.triangleSupport){const q=source.triangleSupport;result.triangleSupport=triangleInstance(q.template,q.offset.clone().add(offset).toArray(),q.id);result.copy(result.triangleSupport.box);}
 if(source.overhead){const q=source.overhead;result.overhead=cloneOverheadShape({...q,points:q.points.map(([x,y])=>[x+offset.x,y+offset.y]),minZ:q.minZ+offset.z,maxZ:q.maxZ+offset.z,topY:q.topY+offset.y},result);}
 return result;
}
function worldSupport(source,offset){
 if(source.type==='box')return {...source,rescue:false,box:source.box.clone().translate(offset)};
 return {...source,minX:source.minX+offset.x,maxX:source.maxX+offset.x,minZ:source.minZ+offset.z,maxZ:source.maxZ+offset.z,a0:source.a0+(source.axis==='x'?offset.x:offset.z),a1:source.a1+(source.axis==='x'?offset.x:offset.z),y0:source.y0+offset.y,y1:source.y1+offset.y};
}

/** Replace only the raw Wumen contribution immediately before PalaceBuilder's
 * normal finish/merge. The caller captures start indices before buildWumen.
 * No global-neighbour filter, shared controller hook or offline dependency.
 * This is an engineering practical version, not museum/survey acceptance. */
export function installWumenPracticalAssembly(builder,parent,data,{colliderStart,walkableStart}={}){
 if(data?.name!=='午门'||builder?.ox!==0||builder?.oz!==-419.6)return false;
 if(parent?.userData.r157WumenPractical)return false;
 if(parent?.name!=='午门'||!parent.isGroup||parent.position.lengthSq()||!parent.quaternion.equals(new THREE.Quaternion())||!parent.scale.equals(new THREE.Vector3(1,1,1)))throw Error('Practical Wumen needs its original unmerged component');
 if(!Number.isInteger(colliderStart)||!Number.isInteger(walkableStart)||colliderStart<0||walkableStart<0||colliderStart>builder.colliders.length||walkableStart>builder.walkables.length)throw Error('Practical Wumen needs explicit contribution start indices');
 const originalChildren=[...parent.children],main=parent.children.find(o=>o.userData.structure?.id==='axis/wumen-upper-tower'),roof=parent.children.find(o=>o.userData.wumenVerticalProfile),plaque=parent.children.find(o=>o.name==='wumen-south-gate-name-plaque');
 if(!main||!roof||!plaque||main.position.x!==0||main.position.y!==12.3||main.position.z!==0)throw Error('Practical Wumen retained main tower missing');
 for(const target of FIT.targetGroups.filter(t=>t.kind!=='link')){const old=target.originalBTargetPaths[0].reduce((o,i)=>o?.children[i],parent);if(old?.userData.structure?.id!==target.id)throw Error('Practical Wumen source instance mismatch '+target.id);}
 const oldGeometries=geometries(parent),offset=new THREE.Vector3(builder.ox,0,builder.oz),captured={group:parent,data,lib:builder.library};
 let platform,upper,committed=false;
 try{
  platform=buildWumenJointVisiblePlatform(captured);
  upper=buildWumenPracticalUpper(captured);
  const colliders=platform.colliders.map(row=>worldCollider(row,offset));
  const supports=platform.walkables.map(row=>worldSupport(row,offset));
  authorizeWumenSouthDeckSources(supports);
  // Main body keeps its inherited finite three-metre gameplay proxies; its
  // complete render model, original rooms, open doors and roof are unchanged.
  for(const row of main.userData.colliders??[])colliders.push(worldCollider(row.clone().translate(main.position),offset));
  upper.group.updateMatrixWorld(true);
  const addMesh=mesh=>colliders.push(worldCollider(new THREE.Box3().setFromObject(mesh),offset));
  for(const body of upper.upperInstances){addMesh(body.closedBody);addMesh(body.beam);}
  for(const {mesh}of upper.shafts)addMesh(mesh);
  for(const link of upper.links)for(const mesh of link.group.children)if(mesh!==link.roof)addMesh(mesh);
  // High roofs remain visual geometry as in the predecessor, not broad AABB
  // floors. Ordinary walking routes never rely on roof-top traversal.
  const receipt={revision:FIT.revision,installed:true,basis:FIT.basis,scopeIds:['FC-AD4377DF51','FC-B0439D9BED','FC-FB99F593DB','FC-08AF02314B','FC-86C9330D65'],worldAnchor:offset.toArray(),portalCount:5,
   pavilions:FIT.targetGroups.filter(t=>t.kind==='pavilion').map(t=>({id:t.id,axisWidth:t.columnAxisSize[0],axisDepth:t.columnAxisSize[1],position:t.bodyFrame.translationXYZ,end:t.id.includes('-SOUTH-')?'south':'north'})),
   wings:FIT.targetGroups.filter(t=>t.kind==='wing').map(t=>({id:t.id,bays:13,axisLength:t.columnAxisSize[0],position:t.bodyFrame.translationXYZ})),
   links:upper.links.map(l=>({id:l.id,instruments:'UNKNOWN_NO_NEW_INVENTORY'})),supports,colliderCount:colliders.length,supportCount:supports.length,
   northPortalTranslationZ:platform.contract.northHeadTranslationZ,unchangedMain:true,roofTopAccess:'NOT_CERTIFIED_RETAINED_HIGH_ROOF_SCOPE',wholeObjectAccepted:false};
  const retained=new Set([main,roof,plaque]);
  for(const child of originalChildren)if(!retained.has(child))parent.remove(child);
  parent.add(platform.group,upper.group);
  builder.colliders.splice(colliderStart,builder.colliders.length-colliderStart,...colliders);
  builder.walkables.splice(walkableStart,builder.walkables.length-walkableStart,...supports);
  parent.userData.r157WumenPractical={revision:receipt.revision,scopeIds:receipt.scopeIds,basis:receipt.basis,northPortalTranslationZ:receipt.northPortalTranslationZ,colliderCount:receipt.colliderCount,supportCount:receipt.supportCount,wholeObjectAccepted:false,roofTopAccess:receipt.roofTopAccess};
  parent.userData.structure={id:'FC-AD4377DF51',status:'R157_PRACTICAL_ENGINEERING_ASSEMBLY',wholeObjectAccepted:false,source:FIT.sources,scopeIds:receipt.scopeIds};
  committed=true;
  const live=geometries(parent);
  for(const geometry of oldGeometries)if(!live.has(geometry))geometry.dispose();
  return receipt;
 }catch(error){
  // Construction stages do not move caller nodes or mutate its physical arrays.
  // Their explicit owned handles exclude source/library materials and buffers.
  if(!committed){upper?.dispose();platform?.dispose();}throw error;
 }
}
