// Consume an existing W only. No buildWorld, PalaceBuilder, scene creation,
// loader, collider edit, material substitution or hidden test-only geometry.
import assert from 'node:assert/strict';
import * as THREE from 'three';
const expected={ 'FC-58A3300503':{profile:'baohe-nine-walking-beasts',levels:{lower:9,upper:9},total:72,riders:8},'FC-5FAA15AE5C':{profile:'zhonghe-seven-walking-beasts',levels:{single:7},total:28,riders:4} };
const cell=p=>p.toArray().map(v=>Math.floor(v/.001));
function visible(o){for(let q=o;q;q=q.parent)assert.equal(q.visible,true);}
export function assertHallWalkingBeastsInWorld(W) {
  assert.ok(W?.scene&&W?.cm,'Pass an already-built W.scene and W.cm; no world is constructed');
  const records=[];W.scene.traverse(root=>{for(const row of root.userData.hallWalkingBeasts??[])records.push({root,row});});
  assert.equal(records.length,2,'owner hookup must preserve exactly Baohe and Zhonghe records through final merge');
  assert.equal(new Set(records.map(({row})=>row.entityId)).size,2);
  const report=[];
  for(const {root,row}of records){
    visible(root);const e=expected[row.entityId];assert.ok(e,'never apply the unsupported Taihe count');
    assert.equal(row.profile,e.profile);assert.equal(row.animalTotal,e.total);assert.equal(row.riderTotal,e.riders);assert.deepEqual(row.countsPerCorner,e.levels);
    assert.equal(row.status,'PARTIAL_VERIFY_PENDING');assert.equal(row.rows.length,e.riders);
    const vertices=new Map(),meshes=[];
    root.updateMatrixWorld(true);
    root.traverse(m=>{if(!m.isMesh||m.material?.name!=='roof_ridge_glaze')return;visible(m);assert.equal(m.material.visible,true);meshes.push(m);const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld),key=cell(p).join();if(!vertices.has(key))vertices.set(key,[]);vertices.get(key).push(p);}});
    assert.ok(meshes.length>0);let contacts=0;
    for(const r of row.rows){assert.equal(r.count,e.levels[r.level]);assert.equal(r.stations.length,r.count);
      for(const s of r.stations){assert.equal(s.footContacts.length,4);
        for(const foot of s.footContacts){const p=new THREE.Vector3().fromArray(foot).add(new THREE.Vector3().fromArray(row.position)).applyMatrix4(root.matrixWorld),base=cell(p);let found=false;
          for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if((vertices.get([base[0]+x,base[1]+y,base[2]+z].join())??[]).some(v=>v.distanceTo(p)<4e-5))found=true;
          assert.ok(found,`${row.profile} ${r.level}/${r.corner}/${s.index}: actual merged base vertex missing`);contacts++;
        }
      }
    }
    report.push({entityId:row.entityId,animals:row.animalTotal,riders:row.riderTotal,actualMergedFootContacts:contacts,status:row.status});
  }
  return {scope:'COUNT_AND_CONTACT_PARTIAL_NOT_BROWSER_OR_SPECIES_ACCEPTANCE',halls:report};
}
