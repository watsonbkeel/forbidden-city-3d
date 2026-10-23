import * as THREE from 'three';
// Bounded observer search only. A legal camera is not proof that the selected
// person is visible through another person; require actual submitted-triangle rays.
export async function visiblePatrolViewpoint(W,sample,checkVisible){
 const p=sample.position,h=sample.rotationYRad,attempts=[];
 for(const distance of [1.5,2,3])for(const angle of [Math.PI/2,-Math.PI/2,Math.PI/4,-Math.PI/4,0,Math.PI]){
  const camera=[p[0]+Math.sin(h+angle)*distance,p[1]+1.7,p[2]+Math.cos(h+angle)*distance],target=[p[0],p[1]+.9,p[2]],ground=W.cm.getGroundHeight(camera[0],camera[2],p[1],.03),collision=W.cm.checkCollision(new THREE.Vector3(...camera),.5),row={camera,target,ground,collision};attempts.push(row);
  if(collision||Math.abs(ground-p[1])>.001)continue;
  row.visible=await checkVisible({camera,target});if(row.visible>0)return{camera,target,attempts};
 }throw Error('No visibly clear supported patrol observer among 18 bounded candidates '+JSON.stringify(attempts));
}

export const isGuardPatrolActor=actor=>actor?.placement?.mode==='path'&&actor?.schedule==='guard-duty';
