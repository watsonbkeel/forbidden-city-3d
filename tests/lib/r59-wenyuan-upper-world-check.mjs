import assert from 'node:assert/strict';import * as THREE from 'three';
const x=-186.5,z=-132.8;
const visible=m=>{for(let a=m;a;a=a.parent)if(!a.visible)return false;return m.material?.visible!==false;};
export function assertWenyuanUpperSouthWindowsInWorld(W){
 const scene=W.scene??W.group;assert.ok(scene&&W.cm,'Existing scene and actual same-world collision manager are required');scene.updateMatrixWorld(true);
 const names=new Set(['wenyuan_photo_upper_green','wenyuan_photo_upper_frame','wenyuan_photo_upper_unmodeled_grille']);let visibleSamples=0,bodySamples=0;
 for(const y of [6.3,7.1,8.3])for(let px=-19;px<=19;px+=.19){
  const hits=new THREE.Raycaster(new THREE.Vector3(x+px,y,z-8.5),new THREE.Vector3(0,0,1),0,1).intersectObject(scene,true).filter(h=>visible(h.object));
  assert.ok(hits.length&&names.has(hits[0].object.material.name),`Wenyuan actual visible facade missing at ${px},${y}`);assert.ok(hits[0].point.z>=z-8&&hits[0].point.z<=z-7.81+1e-4);visibleSamples++;
  assert.equal(W.cm.checkCollision(new THREE.Vector3(x+px,y,z-7.9),.5),true,'A full-radius body cannot cross the actual closed band');bodySamples++;
 }
 const ranges=[[258,299],[328,454],[488,616],[650,848],[884,1012],[1050,1182]],pxToX=p=>19.35-(p-238)/972*38.7;
 let frameSamples=0,recessSamples=0;
 for(const[i,[left,right]]of ranges.entries()){
  const a=pxToX(right),b=pxToX(left),count=i===0?2:6;
  const probes=[[a+.065,'wenyuan_photo_upper_frame',-7.99],[b-.065,'wenyuan_photo_upper_frame',-7.99]];
  for(let k=1;k<count;k++)probes.push([a+(b-a)*k/count,'wenyuan_photo_upper_frame',-7.99]);
  for(let k=0;k<count;k++)probes.push([a+(b-a)*(k+.5)/count,'wenyuan_photo_upper_unmodeled_grille',-7.875]);
  for(const[p,name,depth]of probes){const h=new THREE.Raycaster(new THREE.Vector3(x+p,7.1,z-8.5),new THREE.Vector3(0,0,1),0,1).intersectObject(scene,true).find(h=>visible(h.object));assert.ok(h);assert.equal(h.object.material.name,name);assert.ok(Math.abs(h.point.z-z-depth)<1e-4);if(name.endsWith('_frame'))frameSamples++;else recessSamples++;}
 }
 for(const y of[6.3,7.1,8.3]){const h=new THREE.Raycaster(new THREE.Vector3(x,y,z+8.5),new THREE.Vector3(0,0,-1),0,1).intersectObject(scene,true);assert.ok(h.length);assert.ok(!names.has(h[0].object.material.name),'North facade must not be replaced by the south photograph');}
 return{status:'PASS_CPU_GEOMETRY_AND_CAPSULE_NOT_BROWSER',source:'https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg',groups:6,visibleSamples,bodySamples,frameSamples,recessSamples,northRetained:true};
}
