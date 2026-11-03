import fs from 'node:fs';
import assert from 'node:assert/strict';
const base='file:///workspace/scratch/02a8023d1a85/r163-jingyi-0108/';
const T=await import(base+'node_modules/three/build/three.module.js');
const {library}=await import(base+'tests/lib/inner-palace-fixture.mjs');
const {CourtKit}=await import(base+'src/scene/palace/kit.js');
const {buildJingyiXuan}=await import(base+'src/scene/palace/special/JingyiXuan.js');
const zone=JSON.parse(fs.readFileSync(new URL('data/zones/outer-west.json',base)));
const results=[];
for(const mode of ['unmerged','merged']){
 const lib=library(),shared=new Set(),oldMaterial=lib.material;lib.material=(...args)=>{const m=oldMaterial(...args);shared.add(m);return m;};
 const k=new CourtKit(lib,'outer-west'),alloc=new Set(),gDispose=new Map(),mDispose=new Map();
 const oldSet=T.BufferGeometry.prototype.setAttribute,oldG=T.BufferGeometry.prototype.dispose,oldM=T.Material.prototype.dispose;
 T.BufferGeometry.prototype.setAttribute=function(...a){alloc.add(this);return oldSet.apply(this,a);};
 T.BufferGeometry.prototype.dispose=function(...a){gDispose.set(this,(gDispose.get(this)??0)+1);return oldG.apply(this,a);};
 T.Material.prototype.dispose=function(...a){mDispose.set(this,(mDispose.get(this)??0)+1);return oldM.apply(this,a);};
 try{
  const {frame}=buildJingyiXuan(k,zone); frame.updateMatrixWorld(true);
  const actual=[];frame.traverse(m=>{if(!m.isMesh||m.userData.jingyiStoneTop)return;const a=m.geometry.attributes.position,ix=m.geometry.index,rows=[];for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)rows.push(...q.flatMap(p=>p.toArray()));}actual.push(rows);});
  const owners=k.colliders.filter(c=>c.triangleSupport).map(c=>c.triangleSupport.template.triangles.flatMap(q=>[q.triangle.a,q.triangle.b,q.triangle.c].flatMap(p=>p.toArray())));assert.deepEqual(owners,actual,'all owner vertices equal actual world geometry, in order');
  const owned=[...k.owned],group=mode==='merged'?k.finish():k.root;
  const newCount=[];group.traverse(m=>{if(m.isMesh)newCount.push(m)});
  k.dispose(group);
  for(const g of alloc)assert.equal(gDispose.get(g),1,mode+' geometry allocation disposed once');
  for(const m of owned)assert.equal(mDispose.get(m),1,mode+' owned material disposed once');
  for(const m of shared)assert.equal(mDispose.get(m),undefined,mode+' shared material preserved');
  assert.equal(k.colliders.length,0);assert.equal(k.walkables.length,0);
  results.push({mode,geometryAllocations:alloc.size,privateMaterials:owned.length,sharedMaterials:shared.size,finalMeshes:newCount.length,nonStoneTriangleOwners:owners.length,ownerGeometryExact:true,disposal:'all owned allocations once; shared handles untouched'});
 }finally{T.BufferGeometry.prototype.setAttribute=oldSet;T.BufferGeometry.prototype.dispose=oldG;T.Material.prototype.dispose=oldM;}
}
fs.writeFileSync('/tmp/r163-reviewer-lifecycle.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
