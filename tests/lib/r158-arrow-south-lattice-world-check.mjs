// Pure read-only consumer: accepts an ALREADY BUILT production W, never builds
// another world, patches imports, allocates graphics resources or runs a test.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {assertArrowSouthKneesInWorld} from './r59-arrow-knees-world-check.mjs';
const NAME='arrow_south_secondary_lattice_fit',INFILL='arrow_south_secondary_infill_fit',X=-154.7,Z=78.8,TOL=7e-5;
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
export function assertArrowSouthDoorLatticeInWorld(W){
 assert.ok(W?.scene?.traverse&&W.cm?.getGroundHeight,'Supply already-built W.scene and real W.cm');
 W.scene.updateWorldMatrix(true,true);const triangles=[],infillTriangles=[],buckets=new Set(),infillBuckets=new Set();
 W.scene.traverse(o=>{
  if(!o.isMesh||!o.geometry?.attributes.position)return;
  if(![NAME,INFILL].includes(o.material?.name)&&!o.userData.solidMaterialBatch?.sources?.some(s=>[NAME,INFILL].includes(s.materialName)))return;
  assert.ok(visible(o),'actual lattice bucket must be visible');const p=o.geometry.attributes.position,idx=o.geometry.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){const materialName=solidMaterialNameAt(o,i/3);if(![NAME,INFILL].includes(materialName))continue;const row=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld));if(materialName===NAME){triangles.push(row);buckets.add(o);}else{infillTriangles.push(row);infillBuckets.add(o);}}
 });
 assert.equal(triangles.length,1728,'actual merged lattice must contain 1728 triangles');assert.equal(buckets.size,1,'one lattice material bucket');
 const leaves=[1,3].flatMap(bay=>Array.from({length:4},(_,i)=>({x:-13.75+bay*5.5+.18+(i+.5)*1.285,width:1.195,triangles:[]})));
 for(const tri of triangles){assert.ok(tri.every(p=>p.toArray().every(Number.isFinite)),'finite actual lattice triangles');const leaf=leaves.find(l=>tri.every(p=>p.x>=X+l.x-l.width/2-TOL&&p.x<=X+l.x+l.width/2+TOL));assert.ok(leaf,'actual lattice x bound stays on one retained closed leaf');leaf.triangles.push(tri);}
 assert.equal(infillTriangles.length,96,'actual merged infill must contain 96 triangles');assert.equal(infillBuckets.size,1,'one opaque infill material bucket');
 for(const leaf of leaves){const rows=infillTriangles.filter(tri=>tri.every(p=>p.x>=X+leaf.x-leaf.width/2-TOL&&p.x<=X+leaf.x+leaf.width/2+TOL));assert.equal(rows.length,12,'one closed upper infill per reviewed leaf');const b=new THREE.Box3();rows.flat().forEach(p=>b.expandByPoint(p));for(const[a,expected]of[[b.min.y,2.95],[b.max.y,5.25],[b.min.z,Z-6.879],[b.max.z,Z-6.871]])assert.ok(Math.abs(a-expected)<TOL,'actual infill bound stays between retained board and new relief');}
 const directions=[0,0];
 for(const leaf of leaves){assert.equal(leaf.triangles.length,216,'same finite lattice detail on all eight retained leaves');const b=new THREE.Box3();leaf.triangles.flat().forEach(p=>b.expandByPoint(p));for(const[a,expected]of[[b.min.x,X+leaf.x-leaf.width/2],[b.max.x,X+leaf.x+leaf.width/2],[b.min.y,2.95],[b.max.y,5.25],[b.min.z,Z-6.93],[b.max.z,Z-6.87]])assert.ok(Math.abs(a-expected)<TOL,'actual lattice bound matches reviewed upper-leaf volume');
  for(const tri of leaf.triangles)for(let j=0;j<3;j++){const a=tri[j],c=tri[(j+1)%3],dx=c.x-a.x,dy=c.y-a.y;if(Math.abs(dx)>.1&&Math.abs(dy)>.1&&Math.abs(Math.abs(dx)-Math.abs(dy))<TOL&&Math.abs(c.z-a.z)<TOL)directions[dx*dy<0?0:1]++;}
 }
 assert.ok(directions.every(n=>n>64),'both actual diagonal directions remain present');const retained=assertArrowSouthKneesInWorld(W);
 return{entityId:'FC-AF36D75128',scope:'ACTUAL ALREADY-MERGED TRIANGLES; LOCAL DETAIL ONLY',triangles:triangles.length,infillTriangles:infillTriangles.length,leafCount:leaves.length,diagonalEdgeCounts:directions,retainedKneeTriangles:retained.triangles,routeChecks:retained.routeChecks,browserAcceptance:false,wholeObjectAccepted:false,visualAcceptance:'VERIFY_PENDING'};
}
