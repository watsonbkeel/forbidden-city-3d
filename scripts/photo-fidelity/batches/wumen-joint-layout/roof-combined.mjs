import * as T from 'three';
import {createUpperReassemblyContract} from './upper-contract.mjs';
import {createRoofSection} from './roof-section-evaluator.mjs';
import {buildRoofSectionSurfaces} from './roof-section-surfaces.mjs';
import {buildRoofSectionTrims} from './roof-section-trims.mjs';
import {collectActualPlatformTriangles} from './platform-cpu.mjs';
// Explicit diagnostic palette, NOT production texture/material reconstruction.
export function buildRoofDiagnostic(mode){
 if(!['predecessor','proposal'].includes(mode))throw Error('Unknown roof diagnostic mode');
 const materials={},owned=[],layers=[],group=new T.Group();group.name=`UNINSTALLED-ROOF-DIAGNOSTIC/${mode}`;let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;const errors=[];for(const x of [...owned,...Object.values(materials)])try{x.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'roof composition retirement');};
 try{
 for(const [name,color]of Object.entries({tile:0xc7b484,soffit:0xb9b6aa,fascia:0x89765d,ridge:0x9c7c39,gold:0xd7b95d}))materials[name]=new T.MeshStandardMaterial({color});
 for(const instance of createUpperReassemblyContract().roofKnots.instances)for(const layer of instance.kind==='pavilion'?['lower','upper']:['single']){
  const section=createRoofSection(instance.id,layer,mode),surface=buildRoofSectionSurfaces(section,materials);owned.push(surface);group.add(surface.group);
  const trim=buildRoofSectionTrims(section,materials);owned.push(trim);group.add(trim.group);layers.push({instanceId:instance.id,layer,section,surface,trim});
 }
 group.updateMatrixWorld(true);return{group,mode,layers,materials,accepted:false,runtimeInstalled:false,routeAccepted:false,dispose};
 }catch(error){try{dispose();}catch(cleanup){if(error instanceof Error&&Object.isExtensible(error))Object.defineProperty(error,'cleanupErrors',{value:cleanup.errors});}throw error;}
}
export function roofDiagnosticTriangles(candidate){return collectActualPlatformTriangles([candidate.group]);}
function triangles(mesh){
 for(let o=mesh;o;o=o.parent)if(!o.visible)return[];
 const g=mesh.geometry,p=g.attributes.position,indices=g.index.array,result=[];
 for(let j=g.drawRange.start;j+2<Math.min(indices.length,g.drawRange.start+g.drawRange.count);j+=3){const v=Array.from(indices.slice(j,j+3),k=>new T.Vector3().fromBufferAttribute(p,k).applyMatrix4(mesh.matrixWorld));result.push({v,triangle:new T.Triangle(...v),bounds:new T.Box3().setFromPoints(v),ordinal:j/3});}return result;
}
function boundaries(list){const edges=new Map();for(const {v}of list)for(let j=0;j<3;j++){const key=[JSON.stringify(v[j].toArray()),JSON.stringify(v[(j+1)%3].toArray())].sort().join('|');edges.set(key,(edges.get(key)??0)+1);}return{uniqueEdges:edges.size,boundaryEdges:[...edges.values()].filter(n=>n===1).length,exactMultiplicityOverTwo:[...edges.values()].filter(n=>n>2).length,weldPolicy:'EXACT_TRANSFORMED_COORDINATES_NO_EPSILON'};}
function intersects(a,b){
 for(const [x,y]of [[a,b],[b,a]])for(let j=0;j<3;j++){const from=x.v[j],to=x.v[(j+1)%3],direction=to.clone().sub(from),length=direction.length();if(!length)continue;const hit=new T.Ray(from,direction.multiplyScalar(1/length)).intersectTriangle(...y.v,false,new T.Vector3());if(hit&&hit.distanceToSquared(from)<=length*length)return true;}
 return false;
}
export function diagnoseRoofBoundaries(candidate){
 candidate.group.updateWorldMatrix(true,true);const result={accepted:false,supportVerified:false,scope:'ACTUAL_TRIANGLE_DECORATIVE_BOUNDARY_DIAGNOSTIC_NOT_CONTACT_ACCEPTANCE',intersectionPolicy:'EXACT_LIBRARY_SEGMENT_TRIANGLE_BOTH_DIRECTIONS_NO_TOLERANCE_BRIDGE; COPLANAR_OR_TANGENT_AMBIGUITY_NOT_CLOSED',layers:[],hips:[]};
 for(const item of candidate.layers){
  const tile=[];const surfaces={};for(const kind of ['tile','soffit','fascia']){const all=[];for(let face=0;face<4;face++){const mesh=item.surface.group.children.find(m=>m.name===`${kind}/${face}`);if(!mesh)throw Error('missing surface');all.push(...triangles(mesh));}surfaces[kind]=boundaries(all);if(kind==='tile')tile.push(...all);}
  result.layers.push({instanceId:item.instanceId,layer:item.layer,surfaceBoundaries:surfaces,trimBoundaries:item.trim.group.children.map(m=>({name:m.name,...boundaries(triangles(m))}))});
  for(let face=0;face<4;face++){
   const m=item.trim.group.children.find(m=>m.name===`hip/${face}`);if(!m)throw Error('missing hip');const tube=triangles(m),p=m.geometry.attributes.position;if(p.count!==45)throw Error('hip radial topology differs');
   const rings=[];for(let ring=0;ring<=8;ring++){const centre=new T.Vector3();for(let j=0;j<4;j++)centre.add(new T.Vector3().fromBufferAttribute(p,ring*5+j).applyMatrix4(m.matrixWorld));centre.multiplyScalar(.25);let distance=Infinity;for(const t of tile)distance=Math.min(distance,centre.distanceTo(t.triangle.closestPointToPoint(centre,new T.Vector3())));rings.push({ring,topologyVertices:4,centre:centre.toArray(),distanceToTile:distance});}
   const strips=Array.from({length:8},(_,strip)=>({strip,intersectingTubeTriangles:0,tileTrianglePairs:0}));
   for(const a of tube){const s=strips[Math.floor(a.ordinal/8)];let any=false;for(const b of tile){if(!a.bounds.intersectsBox(b.bounds))continue;if(intersects(a,b)){s.tileTrianglePairs++;any=true;}}if(any)s.intersectingTubeTriangles++;}
   result.hips.push({instanceId:item.instanceId,layer:item.layer,face,nominalRadius:item.section.recipe.hr,rings,strips,interpretation:'PROXIMITY_AND_INTERSECTION_COUNTS_DO_NOT_PROVE_SEALED_CONTACT_OR_SUPPORT'});
  }
 }
 return result;
}

// Narrow diagnostic primitive. False includes unresolved coplanar/tangent cases; not separation proof.
export {intersects as roofTriangleIntersectionDiagnostic};
