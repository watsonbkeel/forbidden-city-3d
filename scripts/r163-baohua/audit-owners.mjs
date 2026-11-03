// Author direct real-owner and successful lifecycle audit, not independent-review execution.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=process.cwd()+'/';
const T=await import(root+'node_modules/three/build/three.module.js');
const {CourtKit}=await import(root+'src/scene/palace/kit.js');
const {library}=await import(root+'tests/lib/inner-palace-fixture.mjs');
const {buildBaohuaDian}=await import(root+'src/scene/palace/special/BaohuaDian.js');
const zone=JSON.parse(fs.readFileSync(root+'data/zones/outer-west.json'));
const output=[];
for(const merged of [false,true]){
 const lib=library(),k=new CourtKit(lib,'outer-west');
 const allocated=new Set(),disposed=new Map(),materials=new Set(),shared=new Set(),mdisposed=new Map();
 const sa=T.BufferGeometry.prototype.setAttribute,gd=T.BufferGeometry.prototype.dispose,mv=T.Material.prototype.setValues,md=T.Material.prototype.dispose,lm=lib.material;
 T.BufferGeometry.prototype.setAttribute=function(...a){allocated.add(this);return sa.apply(this,a)};
 T.BufferGeometry.prototype.dispose=function(...a){disposed.set(this,(disposed.get(this)||0)+1);return gd.apply(this,a)};
 T.Material.prototype.setValues=function(...a){materials.add(this);return mv.apply(this,a)};
 T.Material.prototype.dispose=function(...a){mdisposed.set(this,(mdisposed.get(this)||0)+1);return md.apply(this,a)};
 lib.material=(...a)=>{const m=lm(...a);shared.add(m);return m};
 try{
  const {frame}=buildBaohuaDian(k,zone);let idx=0,tris=0;
  frame.updateWorldMatrix(true,true);
  frame.traverse(m=>{
   if(!m.isMesh)return;
   if(m.userData.baohuaStoneTop){assert.ok(k.colliders.some(c=>c.baohuaStoneTop===m.userData.baohuaStoneTop && c.equals(new T.Box3().setFromObject(m))));return;}
   const ownerId=`baohua-dian/${idx++}/${m.name.slice('baohua-dian/'.length)}`; const owner=k.colliders.find(c=>c.triangleSupport?.id===ownerId)?.triangleSupport;
   assert.ok(owner,m.name);const actual=owner.template.triangles.flatMap(t=>[...t.triangle.a.toArray(),...t.triangle.b.toArray(),...t.triangle.c.toArray()]);
   const p=m.geometry.attributes.position,ix=m.geometry.index,expected=[];
   for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>1e-12)expected.push(...v.flatMap(q=>q.toArray()));}
   assert.deepEqual(actual,expected,m.name);tris+=actual.length/9;
  });
  const finish=merged?k.finish():k.root;k.dispose(finish);
  for(const g of allocated)assert.equal(disposed.get(g),1,'geometry not disposed exactly once '+g.uuid);
  for(const m of materials)if(!shared.has(m))assert.equal(mdisposed.get(m),1,'private material not disposed once '+m.name);
  for(const m of shared)assert.equal(mdisposed.get(m),undefined,'shared material disposed '+m.name);
  output.push({merged,actualMeshOwnersExact:idx,ownedTriangles:tris,privateGeometries:allocated.size,privateMaterials:[...materials].filter(m=>!shared.has(m)).length,sharedMaterials:shared.size,allDisposedExactlyOnce:true});
 }finally{T.BufferGeometry.prototype.setAttribute=sa;T.BufferGeometry.prototype.dispose=gd;T.Material.prototype.setValues=mv;T.Material.prototype.dispose=md;}
}
fs.writeFileSync('reports/r163-baohua/owner-disposal.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output));
