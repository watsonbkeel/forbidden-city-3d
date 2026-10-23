// Pure consumer of an already-built W: never constructs a world or changes it.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
export const WENHUA_GATE_WINDOW_VIEWS=[
 {name:'south-whole',eye:[0,7,-50],target:[0,5,0],fov:42},
 {name:'right-window-close',eye:[-13.24,4,-12],target:[-13.24,3.8,0],fov:38},
 {name:'right-window-oblique',eye:[-14.5,3.7,-6.5],target:[-13.24,3.8,0],fov:55},
];
export function assertWenhuaGateSouthWindowInWorld(W){
 assert.ok(W.scene&&W.cm,'already-built scene and collision manager required');
 const records=[];W.scene.traverse(o=>{for(const r of[o.userData.structure,...(o.userData.architecture??[])])if(r?.id==='south-gate:wenhua')records.push(r);});
 assert.equal(records.length,1,'exactly one Wenhua gate production assembly required');
 const g=records[0];assert.equal(g.wenhuaSouthWindow?.objectId,'FC-5652FA389B');assert.equal(g.wenhuaSouthWindow.accepted,false);
 const point=(x,y,z)=>new THREE.Vector3(g.x+x,y,g.z+z),ray=(p,d,far=2)=>new THREE.Raycaster(point(...p),new THREE.Vector3(...d),0,far).intersectObject(W.scene,true);
 const probes=[];
 for(const [p,material,z]of [[[-13.24,1.4,-1],'wenhua_gate_pale_sill',-.28],[[-15.77,4,-1],'wenhua_gate_red_frame',-.3],[[-12.6,4,-1],'wenhua_gate_closed_recess',-.12]]){
  const h=ray(p,[0,0,1],1);assert.equal(h.length,1);assert.equal(solidMaterialNameAt(h[0].object,h[0].faceIndex),material);assert.ok(Math.abs(h[0].point.z-g.z-z)<1e-5);probes.push({localRay:p,material,hit:h[0].point.toArray()});
 }
 const divisionProbes=[];
 if(g.wenhuaSouthWindow.majorDivisions){
  const fit=g.wenhuaSouthWindow.majorDivisions;assert.equal(fit.normalizedCenters.length,3);
  for(const u of fit.normalizedCenters){const p=[-10.79-4.9*u,4.1,-1],h=ray(p,[0,0,1],1);
   assert.equal(h.length,2,'division front plus separated opaque backing');assert.equal(solidMaterialNameAt(h[0].object,h[0].faceIndex),'wenhua_gate_red_frame');assert.ok(Math.abs(h[0].point.z-g.z+.28)<1e-5);
   // finish() stores world vertices in Float32: compare the actual expected
   // rounded planes, rather than subtracting two separately rounded depths.
   const mergedGap=Math.fround(g.z-.12)-Math.fround(g.z-.28);
   assert.equal(solidMaterialNameAt(h[1].object,h[1].faceIndex),'wenhua_gate_closed_recess');assert.ok(Math.abs(h[1].distance-h[0].distance-mergedGap)<1e-6);divisionProbes.push(p);
  }
 }
 assert.equal(W.cm.checkCollision(point(-13.24,2.5,0),.5),true,'window remains blocked by original collider');
 for(const x of[-6.62,0,6.62]){assert.equal(ray([x,2.5,-1],[0,0,1]).length,0);assert.equal(W.cm.checkCollision(point(x,2.5,0),.5),false,'all three original portal centers remain open');}
 for(const [p,d]of [[[13.24,4,-1],[0,0,1]],[[-13.24,4,1],[0,0,-1]]]){const h=ray(p,d);assert.ok(h.length);assert.match(solidMaterialNameAt(h[0].object,h[0].faceIndex),/wall_red/);}
 return{scope:'EXISTING_WORLD_TRIANGLE_AND_COLLISION_DIAGNOSTIC_NOT_BROWSER_ACCEPTANCE',objectId:'FC-5652FA389B',probes,divisionProbes,portalCenters:3,closedWindowCollision:true,accepted:false};
}
