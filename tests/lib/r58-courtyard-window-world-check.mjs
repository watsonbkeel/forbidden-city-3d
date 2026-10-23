// Pure consumer of an existing production-merged W. No world build, insertion,
// source mutation or collision registration. CPU contact probes, not browser QA.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';
import {courtyardWindowLayout} from '../../src/scene/palace/special/CourtyardWindowLeaves.js';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
export const courtyardWindowItems=[{gateProfile:'xihe',x:110.7,z:-301.1,rot:'west'},{gateProfile:'xiehe',x:-106.47,z:-300.3,rot:'east'}];
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
export function assertCourtyardWindowsInWorld(W,{profiles=['xihe','xiehe']}={}){
 assert.ok(W?.scene&&W.cm?.colliders&&W.cm?.getGroundHeight,'existing merged scene and real CollisionManager required');W.scene.updateMatrixWorld(true);
 const report={scope:'EXISTING_PRODUCTION_MERGED_TRIANGLES_NOT_BROWSER_ACCEPTANCE',windows:[],exactRetainedWindowColliders:0,routeHeadRays:0};
 for(const item of courtyardWindowItems.filter(o=>profiles.includes(o.gateProfile))){
  const g=sideGateGeometry(item),records=[];W.scene.traverse(o=>{for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r?.profile===g.profile)records.push(r);});assert.equal(records.length,1);
  const point=(x,y,z)=>{const [wx,wz]=g.toWorld(x,z);return new THREE.Vector3(wx,y,wz);};
  const inverse=new THREE.Matrix4().compose(new THREE.Vector3(g.x,0,g.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),g.rot),new THREE.Vector3(1,1,1)).invert();
  // Read each intersecting original triangle once. This is a lossless bounded
  // read-only triangle index, not reconstructed geometry or a proxy collider.
  // Avoid thousands of whole-world Raycaster traversals in the owner's W.
  const rows=gateTriangles(W.scene,g,inverse),localRay=new THREE.Ray(),hitPoint=new THREE.Vector3();
  const ray=(origin,direction,far)=>{
   localRay.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));let closest=null;
   for(const row of rows){
    const [a,b,c]=row.vertices,hit=row.side===THREE.BackSide?localRay.intersectTriangle(c,b,a,true,hitPoint):localRay.intersectTriangle(a,b,c,row.side!==THREE.DoubleSide,hitPoint);
    if(!hit)continue;const distance=hit.distanceTo(localRay.origin);if(distance>far||closest&&distance>=closest.distance)continue;
    closest={distance,z:hit.z,material:row.material,point:point(hit.x,hit.y,hit.z).toArray()};
   }return closest;
  };
  const surface=(x,y)=>{const hit=ray([x,y,g.depth/2+.5],[0,0,-1],.51);assert.ok(hit,`${g.profile}: closed window backing must remain`);return hit;};
  for(const bay of [0,4]){
   const bw=g.bayWidths[bay],cx=g.bayCenters[bay],layout=courtyardWindowLayout({profile:g.profile,cx,clear:bw-2*g.radius,bottom:g.platformY+.85,height:g.columnH-1.65,z:g.depth/2});
   const expected=new THREE.Box3(new THREE.Vector3(cx-bw/2,g.platformY,g.depth/2-.24),new THREE.Vector3(cx+bw/2,g.platformY+g.columnH-.65,g.depth/2+.24));
   const matrix=inverse.clone().invert();expected.applyMatrix4(matrix);
   assert.equal(W.cm.colliders.filter(c=>c.box.min.distanceTo(expected.min)<1e-8&&c.box.max.distanceTo(expected.max)<1e-8).length,1,'original closed-window collider exact');report.exactRetainedWindowColliders++;
   assert.equal(W.cm.checkCollision(point(cx,g.platformY+1.7,g.depth/2),.5),true,'lattice is not a passable opening');
   const leaves=[];
   for(const leaf of layout.leaves){
    const x=(leaf.left+leaf.right)/2,y=(leaf.middleBottom+leaf.middleTop)/2;
    const middle=surface(x,y);assert.ok(Math.abs(middle.z-(layout.z+.0775))<3e-5,'actual diagonal centre exists after merge');assert.match(middle.material,/wood_column/);
    const back=surface(x+layout.fit.pitch/4,y);assert.ok(Math.abs(back.z-(layout.z+.04))<3e-5,'actual diagonal gap exposes original opaque backing, not hidden old orthogonal grid');
    const fieldYs=[(leaf.bottom+layout.fit.rail+leaf.middleBottom)/2,(leaf.middleTop+leaf.top-layout.fit.rail)/2];
    for(const fy of fieldYs){const field=surface(x,fy);assert.ok(Math.abs(field.z-layout.front)<3e-5);assert.match(field.material,/wood_column/);}
    for(const sx of [(leaf.left+leaf.innerLeft)/2,(leaf.innerRight+leaf.right)/2])assert.ok(Math.abs(surface(sx,y).z-layout.front)<3e-5,'both real framing stiles survive');
    leaves.push({index:leaf.index,diagonal:middle.point,solidFields:fieldYs.map(fy=>point(x,fy,layout.front).toArray())});
   }
   // Count geometry-defined lower cavities, not source role tags (lost in merge).
   const countCavities=y=>{
    let count=0,previous=false;
    for(let i=0;i<241;i++){
     const x=layout.left+(layout.right-layout.left)*i/240,open=surface(x,y).z<layout.z+.083;
     if(open&&!previous)count++;previous=open;
    }
    return count;
   };
   const middleY=(layout.leaves[0].middleBottom+layout.leaves[0].middleTop)/2;
   assert.equal(countCavities(middleY),6,'six actual lower framed leaf cavities');
   assert.equal(countCavities((layout.transom.bottom+layout.transom.top)/2),1,'one actual uninterrupted upper transom');
   assert.ok(Math.abs(surface(cx,layout.split).z-layout.front)<3e-5,'single physical horizontal separator');
   const columnClearance=g.radius-.065;assert.ok(columnClearance>0);
   report.windows.push({profile:g.profile,bay,leaves,lowerCavities:6,upperCavities:1,sourceImage:layout.fit.sourceImage});
  }
  for(const portal of g.portals)for(const dx of [-.8,0,.8]){
   assert.equal(ray([portal.centerX+dx,g.platformY+1.7,g.depth/2+1],[0,0,-1],g.depth+2),null,'original three portal head rays remain clear');report.routeHeadRays++;
  }
 }
 return report;
}


function gateTriangles(scene,g,inverse){
 const rows=[],region=new THREE.Box3(new THREE.Vector3(-g.width/2-.5,g.platformY,g.depth/-2-1),new THREE.Vector3(g.width/2+.5,g.platformY+g.columnH,g.depth/2+1));
 const bounds=new THREE.Box3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 scene.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||!visible(o))return;
  const geo=o.geometry,p=geo.attributes.position,idx=geo.index,matrix=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld);
  const meshBounds=geo.boundingBox?.clone()??new THREE.Box3().setFromBufferAttribute(p);if(!region.intersectsBox(meshBounds.applyMatrix4(matrix)))return;
  for(let i=0;i<(idx?.count??p.count);i+=3){
   a.fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(matrix);b.fromBufferAttribute(p,idx?idx.getX(i+1):i+1).applyMatrix4(matrix);c.fromBufferAttribute(p,idx?idx.getX(i+2):i+2).applyMatrix4(matrix);
   bounds.setFromPoints([a,b,c]);if(!region.intersectsBox(bounds))continue;
   const material=Array.isArray(o.material)?o.material[geo.groups.find(gr=>i>=gr.start&&i<gr.start+gr.count)?.materialIndex??0]:o.material;if(!material||material.visible===false)continue;
   rows.push({vertices:[a.clone(),b.clone(),c.clone()],side:material.side,material:solidMaterialNameAt(o,i/3)});
  }
 });return rows;
}
