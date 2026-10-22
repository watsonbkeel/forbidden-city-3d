import * as THREE from 'three';
// QA camera placement only. Never moves actors or changes collision/surface data.
export function patrolViewpoint(W,sample){
 const p=sample.position,h=sample.rotationYRad,attempts=[];
 for(const [distance,angle]of [[3,0],[2,0],[1.5,0],[3,Math.PI],[2,Math.PI],[1.5,Math.PI/2],[1.5,-Math.PI/2]]){
  const camera=[p[0]+Math.sin(h+angle)*distance,p[1]+1.7,p[2]+Math.cos(h+angle)*distance],ground=W.cm.getGroundHeight(camera[0],camera[2],p[1],.03),collision=W.cm.checkCollision(new THREE.Vector3(...camera),.5);attempts.push({camera,ground,collision});
  if(!collision&&Math.abs(ground-p[1])<.001)return{camera,target:[p[0],p[1]+.9,p[2]],attempts};
 }throw Error('No supported legal patrol observer among bounded candidates '+JSON.stringify(attempts));
}
