import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import * as T from 'three';
import '../lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {Environment} from '../../src/scene/Environment.js';
import {CollisionManager} from '../../src/utils/Collision.js';
export {T,assert};
export {out,save} from './diagnostics.mjs';
import {verifyInputs} from './baseline-inputs.mjs';
export {verifyInputs};
export const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
export const EPS=1e-8;
const base=new URL('../../',import.meta.url);
const key=tri=>tri.map(v=>v.join(',')).sort().join('|');
export function triangles(mesh){const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,result=[];for(let i=0;i<(ix?.count??p.count);i+=3)result.push([0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(mesh.matrixWorld).toArray()));return result;}
const bounds=rows=>({min:[0,1,2].map(k=>Math.min(...rows.flat().map(v=>v[k]))),max:[0,1,2].map(k=>Math.max(...rows.flat().map(v=>v[k])))});
const near=(a,b,e=2e-5)=>Math.abs(a-b)<=e;
// Independent oracle: accept only actual complete, six-faced axis-aligned boxes.
// AABB alone never certifies an arbitrary mesh. Every two-triangle face must
// contain the four corners, cover the full face area and share a true diagonal.
export function certifyClosedBox(rows,label){
 assert.equal(rows.length,12,label+' has twelve actual triangles');
 assert.equal(new Set(rows.map(key)).size,12,label+' triangles are distinct');
 const b=bounds(rows),faces=[];
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const plane=(sign<0?b.min:b.max)[axis],axes=[0,1,2].filter(k=>k!==axis);
  const q=rows.filter(t=>t.every(v=>v[axis]===plane));assert.equal(q.length,2,label+' face '+axis+'/'+sign);
  const corner=v=>{let c=0;for(let j=0;j<2;j++){const a=axes[j];assert.ok(v[a]===b.min[a]||v[a]===b.max[a],label+' rectangular face corner');if(v[a]===b.max[a])c+=1<<j;}return c;};
  const indices=q.map(t=>t.map(corner));assert.ok(indices.every(t=>new Set(t).size===3));assert.equal(new Set(indices.flat()).size,4);
  const shared=indices[0].filter(i=>indices[1].includes(i));assert.equal(shared.length,2);assert.equal(shared[0]^shared[1],3,label+' face shares diagonal');
  let area=0;for(const tri of q){const t=new T.Triangle(...tri.map(v=>new T.Vector3(...v)));area+=t.getArea();const normal=t.getNormal(new T.Vector3());assert.ok(normal.getComponent(axis)*sign>1-1e-10,label+' outward face winding');}
  assert.ok(Math.abs(area-(b.max[axes[0]]-b.min[axes[0]])*(b.max[axes[1]]-b.min[axes[1]]))<1e-7,label+' complete face area');faces.push({axis,sign,plane,triangles:q});
 }
 return{label,...b,faces,triangles:rows};
}
// Full native-size SQUARE footprint and full feet-to-eye height. No .35m
// step clearance, no .3m foot shrink and no centimeter tolerance.
export function positiveOverlap(eye,feet,box,radius=.5){
 const bodyMin=[eye[0]-radius,feet,eye[2]-radius],bodyMax=[eye[0]+radius,eye[1],eye[2]+radius];
 const depths=[0,1,2].map(k=>Math.min(bodyMax[k],box.max[k])-Math.max(bodyMin[k],box.min[k]));
 return{intersects:depths.every(d=>d>EPS),depths,bodyMin,bodyMax};
}
export function contacts(eye,feet,boxes){return boxes.map(b=>({role:b.label,...positiveOverlap(eye,feet,b)})).filter(b=>b.intersects);}
export function makeFixture({beforeFinish}={}){
 const hashes=verifyInputs(),data=JSON.parse(fs.readFileSync(new URL('data/zones/outer-west.json',base))),lib=realTextureLibrary(),builder=new ZoneBase(lib,data),scene=new T.Scene(),environment=new Environment(scene,null,lib),cm=new CollisionManager();let merged;
 const dispose=()=>{cm.clear();builder.kit.dispose(merged??builder.kit.root);environment.dispose();lib.dispose();};
 try{
  assert.deepEqual(data.items[30],{kind:'gate',name:'咸安门',x:300.9,z:-240.1,w:24.1,gateKind:'five-bay',structureStatus:'provisional-preserved-baseline'});
  const width=builder.buildGate(data.items[30]);assert.equal(width,24.1);builder.gateWidths.set(data.items[30].name,width);
  assert.equal(builder.kit.root.children.length,1);const frame=builder.kit.root.children[0];builder.kit.root.updateMatrixWorld(true);
  const allSource=[];frame.traverse(o=>{if(o.isMesh)allSource.push(o)});assert.equal(allSource.length,58,'retain all original gate meshes');assert.equal(builder.kit.walkables.length,1,'retain only original gate support');assert.equal(builder.kit.colliders.length,26,'retain all original gate colliders');
  const nullMaterials=allSource.filter(m=>m.material===null);assert.equal(nullMaterials.length,1,'only original pending plaque has null material');assert.equal(builder.kit.plaques.length,1);assert.equal(builder.kit.plaques[0].mesh===nullMaterials[0],true,'null material belongs to pending atlas, not a low solid');
  const descriptions=[['base','sumeru_band_material',[288.05,0,-244.515],[313.75,.45,-235.685]],['cap','stone_slab_material',[288,.38,-244.565],[313.8,.46,-235.635]],['leftThreshold','wood_column_material',[294.17,.45,-240.3],[297.99,.65,-239.9]],['centralThreshold','wood_column_material',[298.99,.45,-240.3],[302.81,.65,-239.9]],['rightThreshold','wood_column_material',[303.81,.45,-240.3],[307.63,.65,-239.9]]];
  const sources=descriptions.map(([role,material,lo,hi])=>{const candidates=allSource.filter(m=>{if(m.material?.name!==material)return false;const b=bounds(triangles(m));return b.min.every((v,i)=>near(v,lo[i]))&&b.max.every((v,i)=>near(v,hi[i]));});assert.equal(candidates.length,1,'unique original '+role);return{role,mesh:candidates[0],cert:certifyClosedBox(triangles(candidates[0]),role)};});
  const gateFloor=builder.kit.walkables[0].box.clone();assert.equal(gateFloor.max.y,.45);
  const sourceState=allSource.map(m=>({name:m.name,material:m.material?.name??null,matrixWorld:m.matrixWorld.toArray(),trianglesHash:sha(JSON.stringify(triangles(m)))}));
  const physicalState={colliders:builder.kit.colliders.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),walkables:builder.kit.walkables.map(w=>({type:w.type,min:w.box.min.toArray(),max:w.box.max.toArray(),rescue:w.rescue??null}))};
  environment.setupGround();scene.updateMatrixWorld(true);const ground=environment.objects.filter(o=>o.userData.environmentGroundSource);assert.equal(ground.length,1,'actual Environment ground source');
  cm.addColliders(builder.kit.colliders,'xianan-only');cm.addWalkables(builder.kit.walkables,'xianan-only');assert.equal(cm.rivers.length,1);assert.equal(cm.moats.length,1);
  beforeFinish?.({builder,cm,frame,scene,ground:ground[0]});let atlasCalls=0;const atlas=builder.kit.buildPlaqueAtlas;builder.kit.buildPlaqueAtlas=function(){atlasCalls++;return atlas.call(this)};merged=builder.kit.finish();assert.equal(atlasCalls,1);scene.add(merged);scene.updateMatrixWorld(true);
  const buckets=new Map();merged.traverse(m=>{if(m.isMesh){const rows=triangles(m);let byKey=buckets.get(m.material);if(!byKey)buckets.set(m.material,byKey=new Map());rows.forEach((tri,index)=>{const k=key(tri),old=byKey.get(k)??[];old.push({mesh:m.name,index,tri});byKey.set(k,old);});}});
  const finished=sources.map(s=>{const byKey=buckets.get(s.mesh.material);assert.ok(byKey,'finished material for '+s.role);const matches=s.cert.triangles.map(tri=>{const k=key(tri.map(v=>v.map(Math.fround))),rows=byKey.get(k)??[];assert.equal(rows.length,1,'unique finished triangle '+s.role);return rows[0];});return{...certifyClosedBox(matches.map(r=>r.tri),s.role),matches:matches.map(({mesh,index})=>({mesh,index}))};});
  let finalMeshes=0,finalTriangles=0;scene.traverse(m=>{if(m.isMesh){finalMeshes++;finalTriangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;}});
  return{T,lib,builder,scene,environment,cm,frame,merged,sources,ground:ground[0],width,gateFloor,sourceBoxes:sources.map(s=>s.cert),finishedBoxes:finished,identity:{scope:'ONLY_ORIGINAL_XIANAN_GATE_AND_ACTUAL_ENVIRONMENT_SETUPGROUND_NOT_COURT_BAOYUN_ZONE_OR_WORLD',productCommit:'UNCOMMITTED_R190_CANDIDATE_ON_5d30c836',candidateCommit:'5d30c8366c8430f27cb9664b2b64f30e64e87cca',hashes,sourceGateMeshes:allSource.length,sourceState,physicalState,gateFloor:{min:gateFloor.min.toArray(),max:gateFloor.max.toArray()},returnedOpeningWidth:width,finishedSceneMeshes:finalMeshes,finishedSceneTriangles:finalTriangles,colliders:cm.colliders.length,walkables:cm.walkables.length,rivers:cm.rivers.length,moats:cm.moats.length},dispose};
 }catch(e){dispose();throw e;}
}
