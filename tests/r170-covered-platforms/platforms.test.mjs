import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {cases,fixture,physical,retained,upward,T} from './fixture.mjs';
const baseline=JSON.parse(fs.readFileSync(new URL('./baseline.json',import.meta.url)));
assert.equal(baseline.publicCommit,'d9172faf9595b34cd15477a2912cb397a7013186');
for(const c of cases)test(c.name+': one render owner, unchanged full physics and all retained render data',()=>{const f=fixture(c);try{const height=c.family==='side'?f.base.parent.userData.structure.platformY:c.item.ph??.9,old=baseline.rows[c.name];
 assert.equal(upward(f.base,height).length,0,'covered platform base must not retain its duplicate upward face');assert.equal(upward(f.cover,height).length,2,'whole original paving top remains');
 assert.equal((f.base.geometry.index?.count??f.base.geometry.attributes.position.count),c.family==='outer'?old.baseIndexCount-6:42,'exact top removal and separately authorized side-strip clipping');assert.deepEqual(physical(f.kit),old.physical);assert.equal(retained(f,old.baseAttributeSizes),old.retained);
 const sideWitnesses=[];
 if(c.family!=='outer'){
  const coverBox=f.cover.geometry.boundingBox.clone().applyMatrix4(f.cover.matrix),y=(coverBox.min.y+coverBox.max.y)/2;
  for(const axis of['x','z'])for(const sign of[-1,1]){const point=coverBox.getCenter(new T.Vector3());point.y=y;point[axis]=sign<0?coverBox.min[axis]:coverBox.max[axis];point.applyMatrix4(f.cover.parent.matrixWorld);const normal=new T.Vector3();normal[axis]=sign;normal.transformDirection(f.cover.parent.matrixWorld);sideWitnesses.push({point,normal});const ray=new T.Raycaster(point.clone().addScaledVector(normal,1.7),normal.clone().negate(),0,2),hits=ray.intersectObjects([f.base,f.cover]);assert.ok(hits.some(h=>h.object===f.cover&&h.point.distanceTo(point)<1e-5),c.name+' real cap side remains');assert.ok(!hits.some(h=>h.object===f.base&&h.point.distanceTo(point)<1e-5),c.name+' no coincident brick strip');}
 }
 const baseMaterial=f.base.material,coverMaterial=f.cover.material;const merged=f.finish();let baseArea=0,coverArea=0;merged.traverse(m=>{if(!m.isMesh||![baseMaterial,coverMaterial].includes(m.material))return;for(const p of upward(m,height)){const area=new T.Triangle(...p).getArea();if(m.material===baseMaterial)baseArea+=area;else coverArea+=area;}});
 assert.equal(baseArea,old.mergedBaseArea-old.targetMergedBaseArea,'final merge removes exactly the declared base top, not other surfaces');assert.equal(coverArea,old.mergedCoverArea);assert.deepEqual(physical(f.kit),old.physical);
 for(const {point,normal} of sideWitnesses){
  // Material batching writes world positions to Float32. Use that exact plane,
  // not the pre-bake double translation (no widening of the tie tolerance).
  const mergedPoint=point.clone(),axis=['x','z'].find(k=>Math.abs(normal[k])>.999999);assert.ok(axis);mergedPoint[axis]=Math.fround(point[axis]);
  const ray=new T.Raycaster(mergedPoint.clone().addScaledVector(normal,1.7),normal.clone().negate(),0,2),at=ray.intersectObject(merged,true).filter(h=>h.point.distanceTo(mergedPoint)<1e-5);assert.ok(at.some(h=>h.object.material===coverMaterial),c.name+' final merged cap side remains');assert.ok(!at.some(h=>h.object.material===baseMaterial),c.name+' final merged brick strip absent');}
 }finally{f.dispose();globalThis.gc?.();}});
