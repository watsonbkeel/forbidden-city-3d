// Successor to the frozen two-hall checker. Read only the existing W scene:
// no world construction, source substitution, filtering-out Taihe, or colliders.
import assert from 'node:assert/strict';
import * as THREE from 'three';
const expected=Object.freeze({
  'FC-A478209231':{profile:'taihe-ten-walking-beasts',levels:{lower:10,upper:10},total:80,riders:8},
  'FC-58A3300503':{profile:'baohe-nine-walking-beasts',levels:{lower:9,upper:9},total:72,riders:8},
  'FC-5FAA15AE5C':{profile:'zhonghe-seven-walking-beasts',levels:{single:7},total:28,riders:4},
});
const tolerance=4e-5,cell=p=>p.toArray().map(v=>Math.floor(v/.001));
function visible(o){for(let q=o;q;q=q.parent)assert.equal(q.visible,true,'hall ancestry must remain visible');}
function ridgeEvidence(root){
  const vertices=new Map(),triangles=[];
  root.updateMatrixWorld(true);
  root.traverse(mesh=>{
    if(!mesh.isMesh||mesh.material?.name!=='roof_ridge_glaze')return;
    visible(mesh);assert.equal(mesh.material.visible,true);
    const a=mesh.geometry.attributes.position,index=mesh.geometry.index;
    const start=mesh.geometry.drawRange.start,end=Math.min(index?.count??a.count,start+mesh.geometry.drawRange.count);
    for(let i=start;i+2<end;i+=3){
      const points=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,index?.getX(i+k)??i+k).applyMatrix4(mesh.matrixWorld));
      for(const p of points){const key=cell(p).join();if(!vertices.has(key))vertices.set(key,[]);vertices.get(key).push(p);}
      triangles.push({triangle:new THREE.Triangle(...points),box:new THREE.Box3().setFromPoints(points).expandByScalar(tolerance)});
    }
  });
  assert.ok(triangles.length>0,'actual submitted ridge material missing');
  return {vertices,triangles};
}
function hasVertex(vertices,p){
  const base=cell(p);
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)
    if((vertices.get([base[0]+x,base[1]+y,base[2]+z].join())??[]).some(v=>v.distanceTo(p)<tolerance))return true;
  return false;
}
export function assertThreeHallWalkingBeastsInWorld(W){
  assert.ok(W?.scene&&W?.cm,'Pass an already-built W.scene and W.cm; no world is constructed');
  const records=[];W.scene.traverse(root=>{for(const row of root.userData.hallWalkingBeasts??[])records.push({root,row});});
  assert.equal(records.length,3,'exactly Taihe, Baohe and Zhonghe hall records must survive final merge');
  assert.equal(new Set(records.map(({row})=>row.entityId)).size,3,'hall profile records must not duplicate');
  const cache=new Map(),report=[];
  for(const {root,row}of records){
    visible(root);const e=expected[row.entityId];assert.ok(e,'unreviewed hall profile');
    assert.equal(row.profile,e.profile);assert.deepEqual(row.countsPerCorner,e.levels);
    assert.equal(row.animalTotal,e.total);assert.equal(row.riderTotal,e.riders);assert.equal(row.rows.length,e.riders);
    assert.equal(row.status,'PARTIAL_VERIFY_PENDING');assert.equal(row.detail,'high');
    for(const level of Object.keys(e.levels))assert.deepEqual(row.rows.filter(r=>r.level===level).map(r=>r.corner).sort(),[0,1,2,3]);
    if(!cache.has(root))cache.set(root,ridgeEvidence(root));const {vertices,triangles}=cache.get(root);
    const offset=new THREE.Vector3().fromArray(row.position),allFeet=new Set();let contacts=0,supports=0;
    for(const r of row.rows){
      assert.equal(r.count,e.levels[r.level]);assert.equal(r.stations.length,r.count);
      assert.ok(r.arcLength>r.stations.at(-1).distance+r.scale*.29+r.radius*2);
      let prior=-Infinity;
      for(const [i,s]of r.stations.entries()){
        assert.equal(s.index,i+1);assert.ok(s.distance>prior,'each animal needs a distinct increasing station');prior=s.distance;
        assert.equal(s.footContacts.length,4);
        for(const foot of s.footContacts){
          const p=new THREE.Vector3().fromArray(foot).add(offset).applyMatrix4(root.matrixWorld),key=p.toArray().map(v=>v.toFixed(5)).join();
          assert.equal(allFeet.has(key),false,'duplicate animal/base contacts must not inflate count');allFeet.add(key);
          assert.ok(hasVertex(vertices,p),`${row.profile} ${r.level}/${r.corner}/${s.index}: actual merged base vertex missing`);contacts++;
          // A body face touches its own foot at a vertex. Exclude those faces:
          // support must be another actual submitted triangle, with the foot
          // inside/on its face, NOT a contact copied from metadata or the body.
          const support=triangles.some(({triangle:t,box})=>box.containsPoint(p)&&
            ![t.a,t.b,t.c].some(v=>v.distanceTo(p)<tolerance)&&
            t.closestPointToPoint(p,new THREE.Vector3()).distanceTo(p)<tolerance);
          assert.ok(support,`${row.profile} ${r.level}/${r.corner}/${s.index}: actual merged ridge support triangle missing`);supports++;
        }
      }
    }
    assert.equal(contacts,e.total*4);assert.equal(supports,contacts);
    report.push({entityId:row.entityId,animals:e.total,riders:e.riders,rows:row.rows.length,actualMergedFootContacts:contacts,actualMergedRidgeTriangleContacts:supports,status:row.status});
  }
  return {scope:'THREE_HALL_COUNT_AND_ACTUAL_TRIANGLE_CONTACT_PARTIAL_NOT_BROWSER_OR_SPECIES_ACCEPTANCE',halls:report.sort((a,b)=>a.entityId.localeCompare(b.entityId))};
}
