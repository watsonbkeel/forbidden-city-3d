import assert from 'node:assert/strict';
import {firstHit} from './space-geometry.mjs';
/** One actual surface point per named object, from retained supported eyes.
 * Independent gaze directions; never evidence of one framed full facade. */
export function verifyTargetVisibility(eyes,targets,faces){
 return targets.map(target=>{
  const samples=(target.allowedEyes??eyes.map((_,i)=>i)).map(i=>{
   const eye=eyes[i],hit=firstHit(eye,target.point,faces),visible=hit?.object===target.object&&hit.point.distanceTo(target.point)<1e-5;
   return {eyeIndex:i,eye:eye.toArray(),targetPoint:target.point.toArray(),visible,firstOwner:hit?.object.uuid??null,firstName:hit?.object.name??null,firstPoint:hit?.point.toArray()??null,distance:hit?.distance??null};
  });
  assert.ok(samples.some(q=>q.visible),'No supported-eye original first-hit surface evidence for '+target.id);
  return {id:target.id,targetOwner:target.object.uuid,targetName:target.object.name,targetPoint:target.point.toArray(),visibleFrom:samples.filter(q=>q.visible).map(q=>q.eyeIndex),samples};
 });
}
