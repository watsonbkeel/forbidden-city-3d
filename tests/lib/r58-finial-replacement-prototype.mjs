// Unintegrated local geometry experiment only. Never imported by production.
import assert from 'node:assert/strict';
import * as THREE from 'three';
export function replaceSideShaftTopsLocally(W){
 const positions=W.g.userData.innerJinshuiSideFinials.placements,changed=positions.map(()=>0),point=new THREE.Vector3();W.scene.updateMatrixWorld(true);
 W.r.group.traverse(mesh=>{if(!mesh.isMesh)return;const a=mesh.geometry.attributes.position;
  assert.equal(mesh.matrixWorld.elements[5],1,'prototype expects unrotated original shaft Y');
  for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);
   const k=positions.findIndex(p=>Math.abs(point.y-p.y)<1e-5&&Math.abs(Math.abs(point.x-p.x)-.13)<1e-5&&Math.abs(Math.abs(point.z-p.z)-.13)<1e-5);
   if(k<0)continue;a.setY(i,a.getY(i)-.22);changed[k]++;
  }
  a.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
 });
 assert.ok(changed.every(n=>n===18),'all88 old shaft tops must be genuinely shortened, not covered');
 const matrix=new THREE.Matrix4(),heads=W.g.children[0];for(let i=0;i<heads.count;i++){heads.getMatrixAt(i,matrix);matrix.elements[13]-=.22;heads.setMatrixAt(i,matrix);}
 heads.instanceMatrix.needsUpdate=true;heads.computeBoundingBox();heads.computeBoundingSphere();W.scene.updateMatrixWorld(true);
 return {kind:'LOCAL_UNINTEGRATED_REPLACEMENT_PROTOTYPE',posts:88,modifiedTopVerticesPerPost:changed[0],shaftHeightBefore:1.17,shaftHeightAfter:.95,capHeightUnchanged:.22,originalShaftOnlyTotalHeight:1.17,additiveFixtureBeforeTotalHeight:1.39,replacementTotalPostHeight:1.17,sourceDimensions:'MODEL_FIT_NOT_SURVEYED',originalUpperRailLow:.92,originalUpperRailHigh:1.04,capBaseHeight:.95,upperRailCapVerticalOverlap:.09,collidersChanged:0,walkablesChanged:0};
}
