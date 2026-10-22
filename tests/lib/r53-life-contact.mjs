import assert from 'node:assert/strict';
import * as THREE from 'three';
import {deformCharacterVertex} from '../../src/scene/characters/CharacterAnimation.js';
// Sole vertices come from the actual submitted, already-deformed instance. The
// ray reaches the approved <=65 mm swing lift; never lowers actor placement.
export function lifeSoleContacts(target,architecture){
 const a=target.mesh.geometry.attributes,ray=new THREE.Raycaster(),result=[];
 for(const part of [4,5]){const ids=[];for(let i=0;i<a.position.count;i++)if(a.characterPart.getX(i)===part)ids.push(i);assert.ok(ids.length);const minY=Math.min(...ids.map(i=>a.position.getY(i))),sole=ids.filter(i=>Math.abs(a.position.getY(i)-minY)<1e-7),points=[];
  for(const i of sole){const p=new THREE.Vector3().fromBufferAttribute(a.position,i).applyMatrix4(target.mesh.matrixWorld);ray.set(p.clone().add(new THREE.Vector3(0,.1,0)),new THREE.Vector3(0,-1,0));ray.near=.00001;ray.far=.2;const hit=ray.intersectObjects(architecture,false).find(h=>h.face?.normal&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);points.push({vertex:i,world:p.toArray(),surface:hit?{name:hit.object.name,material:hit.object.material?.name,world:hit.point.toArray()}:null,gapMeters:hit?p.y-hit.point.y:null});}result.push({part,points});
 }return result;
}
export function assertLifeSoleSupport(soles,walkSpeed){
 const gaps=soles.flatMap(s=>s.points.map(p=>p.gapMeters));assert.ok(gaps.length>0&&gaps.every(Number.isFinite),'Every actual sole vertex needs visible support');assert.ok(gaps.every(g=>g>=-.001),'No sole penetration');
 const grounded=soles.filter(s=>s.points.every(p=>Math.abs(p.gapMeters)<=.001)).length;
 if(walkSpeed>0){assert.ok(grounded>=1,'Walking requires a grounded sole');assert.ok(gaps.every(g=>g<=.066),'Swing clearance stays inside existing 65 mm animation');}
 else assert.equal(grounded,2,'Both standing soles must touch actual visible support within 1 mm');
 return{groundedFeet:grounded,maximumGapMeters:Math.max(...gaps),minimumGapMeters:Math.min(...gaps),rule:walkSpeed>0?'One planted foot; existing swing lift <=65 mm plus 1 mm tolerance':'Two grounded feet within 1 mm'};
}

// Efficient per-frame contact sampling from the live submitted GPU attribute
// stream. The world support corridor is independently triangle-probed at <=.25 m.
// This never uses the actor's nominal animation object or substitutes geometry.
export function submittedLifeSoles(system,submitted,targetId,footIndexCache=new WeakMap()){
 const target=submitted.find(a=>a.id===targetId);assert.ok(target,'Target must actually be submitted');
 const key=[target.templateId,target.pose,target.lod,target.zoneRef,target.behavior?.seatVariant??'standard'].join('|')+(target.templateId==='maid-daily'&&target.placement.mode==='path'?'|femalePose=walking':'');
 const peers=submitted.filter(a=>[a.templateId,a.pose,a.lod,a.zoneRef,a.behavior?.seatVariant??'standard'].join('|')+(a.templateId==='maid-daily'&&a.placement.mode==='path'?'|femalePose=walking':'')===key),instance=peers.findIndex(a=>a.id===targetId),batch=system.renderer.batches.get(key);assert.ok(batch&&instance>=0);const a=batch.mesh.geometry.attributes;
 let feet=footIndexCache.get(batch.mesh.geometry);if(!feet){feet=[4,5].map(part=>{const ids=[];for(let i=0;i<a.position.count;i++)if(a.characterPart.getX(i)===part)ids.push(i);return{part,ids};});footIndexCache.set(batch.mesh.geometry,feet);}
 const anim=a.characterAnim,state={time:system.renderer.timeUniform.value,phase:anim.getX(instance),amplitude:anim.getY(instance),walkSpeed:anim.getZ(instance),poseIndex:anim.getW(instance)},matrix=new THREE.Matrix4();batch.mesh.getMatrixAt(instance,matrix);matrix.premultiply(batch.mesh.matrixWorld);
 const soles=feet.map(({part,ids})=>{const points=ids.map(i=>{const d=deformCharacterVertex([a.position.getX(i),a.position.getY(i),a.position.getZ(i)],[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],{part:a.characterPart.getX(i),pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)},state).position;const p=new THREE.Vector3(...d).applyMatrix4(matrix);return{localY:d[1],world:p.toArray(),gapMeters:p.y-target.position[1]};}),minimum=Math.min(...points.map(p=>p.localY));return{part,points:points.filter(p=>Math.abs(p.localY-minimum)<1e-7)};});
 return{...assertLifeSoleSupport(soles,state.walkSpeed),animation:state,soles};
}
