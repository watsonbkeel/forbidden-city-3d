// Pure consumer of existing production output, never constructs a world.
// Storage is bounded by 100 foot queries per hall, not by zone vertex count.
import assert from 'node:assert/strict';
import * as THREE from 'three';
const cellSize=.001,epsilon=4e-5;
const grid=p=>[Math.floor(p.x/cellSize),Math.floor(p.y/cellSize),Math.floor(p.z/cellSize)];
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
export function assertEastFiveRoofBeastsInWorld(W){
  assert.ok(W?.scene&&W?.cm,'Pass existing W.scene/W.cm');
  const records=[];
  W.scene.traverse(root=>{for(const r of Array.isArray(root.userData.eastFiveRoofBeasts)?root.userData.eastFiveRoofBeasts:[])records.push({root,r});});
  assert.equal(records.length,2,'exactly two East Five Roof Beast targets must survive merge');
  assert.deepEqual(records.map(({r})=>r.itemIndex).sort((a,b)=>a-b),[2,16]);
  const output=[];
  for(const{root,r}of records){
    assert.equal(r.animalTotal,20);assert.equal(r.riderTotal,4);assert.equal(r.triangles,512);assert.equal(r.rows.length,4);
    assert.equal(r.detail,'low');assert.equal(r.legacyAnimalTotal,0);assert.equal(visible(root),true);
    root.updateMatrixWorld(true);
    const queries=[],buckets=new Map(),bounds=new THREE.Box3(),offset=new THREE.Vector3().fromArray(r.position);
    for(const row of r.rows){
      assert.equal(row.count,5);assert.equal(row.stations.length,5);
      for(const o of[row.rider,...row.stations])for(const foot of o.footContacts){
        const p=new THREE.Vector3().fromArray(foot).add(offset).applyMatrix4(root.matrixWorld),query={p,found:false};
        queries.push(query);bounds.expandByPoint(p);const key=grid(p).join();
        if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(query);
      }
    }
    assert.equal(queries.length,100,'all 80 animal and 20 rider base vertices remain required');
    bounds.expandByScalar(epsilon);
    const vertex=new THREE.Vector3(),meshBounds=new THREE.Box3();let matched=0;
    root.traverse(m=>{
      if(matched===queries.length||!m.isMesh||!visible(m))return;
      const a=m.geometry.attributes.position;if(!a)return;
      if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();
      meshBounds.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
      if(!meshBounds.intersectsBox(bounds))return;
      for(let i=0;i<a.count&&matched<queries.length;i++){
        vertex.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);
        if(!bounds.containsPoint(vertex))continue;
        const cell=grid(vertex);
        for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
          for(const query of buckets.get([cell[0]+x,cell[1]+y,cell[2]+z].join())??[]){
            if(!query.found&&query.p.distanceTo(vertex)<epsilon){query.found=true;matched++;}
          }
        }
      }
    });
    for(const query of queries)assert.ok(query.found,`${r.id}: actual merged foot vertex missing`);
    output.push({id:r.id,animals:20,separateRiders:4,contacts:queries.length,addedTriangles:512});
  }
  return{scope:'COUNT_CONTACT_PARTIAL_NOT_SPECIES_OR_BROWSER_ACCEPTANCE',targets:output};
}
