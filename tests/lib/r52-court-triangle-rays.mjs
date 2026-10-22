// Exact production instance deformation and triangle visibility, derived from frozen R51 evidence.
import * as T from 'three';
import assert from 'node:assert/strict';
import {deformCharacterVertex} from '../../src/scene/characters/CharacterAnimation.js';
import {characterGeometryOptionsFor} from '../../src/scene/characters/CharacterGeometryOptions.js';
function keyFor(a){const o=characterGeometryOptionsFor(a);return[a.templateId,a.pose,a.lod,a.zoneRef,o.seatVariant].join('|')+(o.femalePose?'|femalePose='+o.femalePose:'');}
export function productionInstances(system,submitted){const groups=new Map();for(const a of submitted){const k=keyFor(a);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(a);}
 const out=[];for(const [key,actors]of groups){const batch=system.renderer.batches.get(key);assert.equal(batch.mesh.count,actors.length);for(let ii=0;ii<actors.length;ii++){
  const source=batch.mesh.geometry,g=source.clone(),a=g.attributes,anim=source.attributes.characterAnim;
  const animation={time:system.renderer.timeUniform.value,phase:anim.getX(ii),amplitude:anim.getY(ii),walkSpeed:anim.getZ(ii),poseIndex:anim.getW(ii)};
  for(let vi=0;vi<a.position.count;vi++){const d=deformCharacterVertex([a.position.getX(vi),a.position.getY(vi),a.position.getZ(vi)],[a.normal.getX(vi),a.normal.getY(vi),a.normal.getZ(vi)],{part:a.characterPart.getX(vi),pivot:[a.characterPivot.getX(vi),a.characterPivot.getY(vi),a.characterPivot.getZ(vi)],weight:a.characterWeight.getX(vi),torsoWeight:a.characterTorsoWeight.getX(vi)},animation);a.position.setXYZ(vi,...d.position);a.normal.setXYZ(vi,...d.normal);}
  g.computeBoundingBox();g.computeBoundingSphere();const mesh=new T.Mesh(g,system.renderer.material);mesh.name=actors[ii].id;batch.mesh.getMatrixAt(ii,mesh.matrix);mesh.matrix.premultiply(batch.mesh.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.updateMatrixWorld(true);out.push({actor:actors[ii],mesh,batch:key,index:ii,visibility:a.characterVisibility.getX(ii)});
 }}return out;}
export function triangleRays(target,objects,camera){
 const mesh=target.mesh,g=mesh.geometry,p=g.attributes.position,idx=g.index,vertices=[new T.Vector3(),new T.Vector3(),new T.Vector3()],normal=new T.Vector3(),center=new T.Vector3(),front=[];
 for(let k=0;k<(idx?.count??p.count);k+=3){for(let j=0;j<3;j++)vertices[j].fromBufferAttribute(p,idx?idx.getX(k+j):k+j).applyMatrix4(mesh.matrixWorld);center.copy(vertices[0]).add(vertices[1]).add(vertices[2]).multiplyScalar(1/3);normal.subVectors(vertices[1],vertices[0]).cross(new T.Vector3().subVectors(vertices[2],vertices[0]));if(normal.dot(camera.position.clone().sub(center))<=0)continue;front.push({triangle:k/3,world:center.clone(),local:mesh.worldToLocal(center.clone())});}
 const ray=new T.Raycaster(),hits=[];for(const fraction of [.2,.4,.6,.8,.95])for(const x of [-.12,0,.12]){
  const y=g.boundingBox.min.y+fraction*(g.boundingBox.max.y-g.boundingBox.min.y),chosen=front.reduce((b,v)=>{const score=(v.local.y-y)**2+(v.local.x-x)**2;return!b||score<b.score?{...v,score}:b;},null);assert.ok(chosen);
  const delta=chosen.world.clone().sub(camera.position);ray.set(camera.position,delta.clone().normalize());ray.near=.001;ray.far=delta.length()+.01;const own=ray.intersectObject(mesh,false)[0];assert.ok(own,'Ray hits actual actor triangle');const first=ray.intersectObjects(objects,false)[0],ndc=chosen.world.clone().project(camera);hits.push({fraction,x,triangle:chosen.triangle,target:chosen.world.toArray(),inViewport:Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z>=-1&&ndc.z<=1,visible:first?.object===mesh,first:first?{name:first.object.name,material:first.object.material?.name,distance:first.distance}:null});
 }return{visible:hits.filter(h=>h.visible&&h.inViewport).length,total:hits.length,hits};}
