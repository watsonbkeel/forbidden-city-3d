// Read-only CPU extraction of the actual production CharacterRenderer stream.
// Geometry copies are solely for ray tests; they are never added to the scene.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {characterGeometryOptionsFor} from '../../src/scene/characters/CharacterGeometryOptions.js';
import {deformCharacterVertex} from '../../src/scene/characters/CharacterAnimation.js';
export function characterBatchKey(actor){const o=characterGeometryOptionsFor(actor);return[actor.templateId,actor.pose,actor.lod,actor.zoneRef,o.seatVariant].join('|')+(o.femalePose?'|femalePose='+o.femalePose:'');}
export function observeCharacterSubmissions(system){
 let submitted=[];const renderer=system.renderer,originalRender=renderer.render,originalClear=renderer.clear;
 renderer.render=function(actors,...args){submitted=actors.map(a=>({...a,position:[...a.position]}));return originalRender.call(this,actors,...args);};
 renderer.clear=function(...args){submitted=[];return originalClear.apply(this,args);};
 return{get submitted(){return submitted;},dispose(){renderer.render=originalRender;renderer.clear=originalClear;},
  meshes(){
   const groups=new Map();for(const actor of submitted){const key=characterBatchKey(actor);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(actor);}
   const result=[];for(const[key,actors]of groups){const batch=renderer.batches.get(key);assert.ok(batch,'Actual submitted batch '+key);assert.equal(batch.mesh.count,actors.length);
    for(let ii=0;ii<actors.length;ii++){
     const source=batch.mesh.geometry,g=source.clone(),a=g.attributes,anim=source.attributes.characterAnim;
     const animation={time:renderer.timeUniform.value,phase:anim.getX(ii),amplitude:anim.getY(ii),walkSpeed:anim.getZ(ii),poseIndex:anim.getW(ii)};
     for(let vi=0;vi<a.position.count;vi++){const d=deformCharacterVertex([a.position.getX(vi),a.position.getY(vi),a.position.getZ(vi)],[a.normal.getX(vi),a.normal.getY(vi),a.normal.getZ(vi)],{part:a.characterPart.getX(vi),pivot:[a.characterPivot.getX(vi),a.characterPivot.getY(vi),a.characterPivot.getZ(vi)],weight:a.characterWeight.getX(vi),torsoWeight:a.characterTorsoWeight.getX(vi)},animation);a.position.setXYZ(vi,...d.position);a.normal.setXYZ(vi,...d.normal);}
     g.computeBoundingBox();g.computeBoundingSphere();const mesh=new THREE.Mesh(g,renderer.material);mesh.name=actors[ii].id;batch.mesh.getMatrixAt(ii,mesh.matrix);mesh.matrix.premultiply(batch.mesh.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.updateMatrixWorld(true);
     result.push({actor:actors[ii],mesh,batch:key,index:ii,visibility:source.attributes.characterVisibility.getX(ii)});
    }
   }assert.equal(result.length,renderer.last.renderCopies);return result;
  }};
}
export function visibleArchitecture(scene){const result=[];scene.traverse(mesh=>{if(!mesh.isMesh||mesh.userData.characterBatch)return;for(let p=mesh;p;p=p.parent)if(!p.visible)return;result.push(mesh);});return result;}
export function actualTriangleRays(camera,target,objects){
 const mesh=target.mesh,g=mesh.geometry,p=g.attributes.position,index=g.index,vertices=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],normal=new THREE.Vector3(),center=new THREE.Vector3(),front=[];
 for(let k=0;k<(index?.count??p.count);k+=3){for(let j=0;j<3;j++)vertices[j].fromBufferAttribute(p,index?index.getX(k+j):k+j).applyMatrix4(mesh.matrixWorld);center.copy(vertices[0]).add(vertices[1]).add(vertices[2]).multiplyScalar(1/3);normal.subVectors(vertices[1],vertices[0]).cross(new THREE.Vector3().subVectors(vertices[2],vertices[0]));if(normal.dot(camera.position.clone().sub(center))<=0)continue;front.push({triangle:k/3,world:center.clone(),local:mesh.worldToLocal(center.clone())});}
 const ray=new THREE.Raycaster(),hits=[];for(const fraction of [.25,.55,.85])for(const x of [-.12,0,.12]){
  const y=g.boundingBox.min.y+fraction*(g.boundingBox.max.y-g.boundingBox.min.y),chosen=front.reduce((best,v)=>{const score=(v.local.y-y)**2+(v.local.x-x)**2;return!best||score<best.score?{...v,score}:best;},null);assert.ok(chosen,'Actual front-facing character triangles');
  const delta=chosen.world.clone().sub(camera.position);ray.set(camera.position,delta.clone().normalize());ray.near=.001;ray.far=delta.length()+.01;assert.ok(ray.intersectObject(mesh,false)[0],'Target ray intersects actual deformed geometry');const first=ray.intersectObjects(objects,false)[0],ndc=chosen.world.clone().project(camera);
  hits.push({fraction,x,triangle:chosen.triangle,target:chosen.world.toArray(),inViewport:Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z>=-1&&ndc.z<=1,visible:first?.object===mesh,first:first?{name:first.object.name,material:first.object.material?.name,distance:first.distance}:null});
 }return{visible:hits.filter(h=>h.visible&&h.inViewport).length,total:hits.length,hits};
}
export function actualSoleContact(target,architecture,{tolerance=.001}={}){
 const g=target.mesh.geometry,a=g.attributes,ray=new THREE.Raycaster(),result=[];
 for(const part of [4,5]){const indices=[];for(let i=0;i<a.position.count;i++)if(a.characterPart.getX(i)===part)indices.push(i);assert.ok(indices.length);
  const minY=Math.min(...indices.map(i=>a.position.getY(i))),sole=indices.filter(i=>Math.abs(a.position.getY(i)-minY)<1e-7),points=[];
  for(const i of sole){const p=new THREE.Vector3().fromBufferAttribute(a.position,i).applyMatrix4(target.mesh.matrixWorld);ray.set(p.clone().add(new THREE.Vector3(0,.05,0)),new THREE.Vector3(0,-1,0));ray.near=.00001;ray.far=.10;const hit=ray.intersectObjects(architecture,false).find(h=>h.face?.normal&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);points.push({vertex:i,world:p.toArray(),surface:hit?{name:hit.object.name,material:hit.object.material?.name,world:hit.point.toArray()}:null,gapMeters:hit?p.y-hit.point.y:null});}
  result.push({part,points,withinContactTolerance:points.every(p=>p.gapMeters!==null&&Math.abs(p.gapMeters)<=tolerance)});
 }return result;
}
