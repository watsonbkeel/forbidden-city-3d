import assert from 'node:assert/strict';
import * as THREE from 'three';
// Explicit inverse for the newly authorized thin leaf proxies, not a blanket
// omission of colliders from old physical-retention assertions.
export function originalCollidersBeforeLeafSafety(kit) {
  kit.root.updateMatrixWorld(true);
  const added=new Set();
  kit.root.traverse(f=>{
    const expected=f.userData.structure?.openedLeafCollisionCount;
    if(expected===undefined)return;
    let count=0;
    f.traverse(m=>{
      if(!m.isMesh||m.material?.name!=='lattice_doors'||Math.abs(m.rotation.y-Math.PI/2)>1e-8)return;
      const box=new THREE.Box3().setFromObject(m);
      const matches=kit.colliders.filter(c=>['x','y','z'].every(a=>Math.abs(c.min[a]-box.min[a])<1e-8&&Math.abs(c.max[a]-box.max[a])<1e-8));
      assert.equal(matches.length,1,'every visible opened leaf has exactly its thin transformed physical box');
      assert.ok(!added.has(matches[0]),'leaf collider ownership is unique');added.add(matches[0]);count++;
    });
    assert.equal(count,expected);
  });
  return kit.colliders.filter(c=>!added.has(c));
}
