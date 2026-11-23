import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from 'three';
import {library} from '../lib/inner-palace-fixture.mjs';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {buildWallCap} from '../../src/scene/RoofBuilder.js';

// Same CURRENT transitive dependencies on both sides; the earlier Enclosure
// module itself is the exact R140 Git blob, not a source inverse of the subject.
const historical = gunzipSync(readFileSync(new URL('../fixtures/r140/Enclosure-native-r140.js.txt.gz',import.meta.url)));
const digest = buf=>createHash('sha256').update(buf).digest('hex');
assert.equal(digest(historical),'31ec78a3afcaf92db6916eb020a4fefe0fa8a6904ac38329d19d41e869b2f514');
const baseURL = new URL('../../src/scene/Enclosure.js',import.meta.url);
const rewritten = historical.toString('utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>'from '+q+(id.startsWith('.')?new URL(id,baseURL).href:import.meta.resolve(id))+q);
const {Enclosure:Before}=await import('data:text/javascript;base64,'+Buffer.from(rewritten).toString('base64'));
function capture(Api) {
 const lib={...library(),owns:()=>false}, obj=new Api(new T.Scene(),lib), parent=new T.Group(), parts=[];
 const range=(method,fn,params=[])=>{
  const n=parent.children.length,c=obj.colliders.length; fn();
  parts.push({method,params,kids:parent.children.slice(n),boxes:obj.colliders.slice(c)});
 };
 for(const m of ['addWallSegment','addWallSegmentZ']){
  const fn=obj[m].bind(obj);obj[m]=(...a)=>{assert.equal(a[0],parent);range(m,()=>fn(...a),a[1]);};
 }
 obj.buildOuterWalls(parent);
 for(const m of ['buildCornerTowers','buildCorridorHalls'])range(m,()=>obj[m](parent));
 parent.updateMatrixWorld(true);
 return {lib,obj,parts,dispose(){parent.traverse(m=>m.geometry?.dispose());obj.dispose();}};
}
const meshes=kids=>kids.flatMap(k=>{const out=[];k.traverse(o=>{if(o.isMesh)out.push(o);});return out;});
const rect=b=>[...b.min.toArray(),...b.max.toArray()];
const buffer=a=>[a.itemSize,a.count,a.normalized,a.array.constructor.name,digest(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))];
function row(m){
 const g=m.geometry;
 return [m.name,m.material.name,m.material.color?.getHex(),m.castShadow,m.receiveShadow,m.visible,
  m.matrixWorld.toArray(),m.userData.r140CityBrick||null,
  Object.entries(g.attributes).map(([k,a])=>[k,buffer(a)]),g.index?buffer(g.index):null,g.groups];
}
function near(a,b,eps=2e-5) {
 assert.equal(a.length,b.length);
 for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i]-b[i])<=eps,`coordinate ${i}: ${a[i]} != ${b[i]} (tol ${eps})`);
}
function triWorld(a,b,uv=false){
 assert.equal(a.material.name,b.material.name);
 assert.equal(a.geometry.index,null);assert.equal(b.geometry.index,null);
 for(const key of ['position','normal',...(uv?['uv']:[])]){
  const aa=a.geometry.getAttribute(key),bb=b.geometry.getAttribute(key);assert.equal(aa.count,bb.count);
  for(let i=0;i<aa.count;i++){
   if(key==='uv'){near([aa.getX(i),aa.getY(i)],[bb.getX(i),bb.getY(i)]); continue;}
   const v=(m,attr)=>{const p=new T.Vector3().fromBufferAttribute(attr,i);return(key==='position'?p.applyMatrix4(m.matrixWorld):p.transformDirection(m.matrixWorld)).toArray();};
   near(v(a,aa),v(b,bb));
  }
 }
}
// Fixed independent numerical audit registration for R157 model (not a site
// survey). Each row = cell X interval, Z interval, physical upper Y. X<0=east.
const z0=-425,zs=-416.9013245033113,z1=-416.4;
const cellTable=[
 [[70.28990066225165,83.00513245033113,zs,z1,10],[83.00513245033113,89.09784768211921,zs,z1,10],[89.09784768211921,97.9,z0,zs,10],[89.09784768211921,97.9,zs,z1,10],[97.9,372.2,z0,zs,3],[97.9,372.2,zs,z1,3]],
 [[-372.2,-97.9,z0,zs,3],[-372.2,-97.9,zs,z1,3],[-97.9,-89.36274834437086,z0,zs,10],[-97.9,-89.36274834437086,zs,z1,10],[-89.36274834437086,-82.54155629139073,zs,z1,10],[-82.54155629139073,-70.15745033112583,zs,z1,10],[-63.601158940397355,-63.5,z0,zs,10],[-63.601158940397355,-63.5,zs,z1,10]]
];
function checkBrick(m,lib) {
 assert.equal(m.material,lib.material('wall_brick'));
 const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,u=m.geometry.attributes.uv;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);
  const expected=ny!==0?[x,z]:nx!==0?[z*Math.sign(nx),y]:[x*Math.sign(nz),y];
  near([u.getX(i),u.getY(i)],expected,1e-6); // fixture brick tile = one metre
 }
}
test('current R157 changes only the two Wumen south-wall junctions: ordered enclosure meshes and physical owners',()=>{
 const a=capture(Before),b=capture(Enclosure);
 try{
  const ops=['addWallSegment','addWallSegment','addWallSegment','addWallSegment',...Array(4).fill('addWallSegmentZ'),'buildCornerTowers','buildCorridorHalls'];
  for(const v of [a,b])assert.deepEqual(v.parts.map(p=>p.method),ops);
  const size=v=>v.parts.map(p=>meshes(p.kids).length);
  for(const [v,outer,cs] of [[a,926,12],[b,950,24]]){
   const sizes=size(v);
   assert.equal(sizes.slice(0,8).reduce((x,y)=>x+y,0),outer);
   assert.deepEqual(sizes.slice(8),[44,0]);
   assert.equal(v.obj.getColliders().length,cs);
   assert.deepEqual(v.parts.flatMap(p=>p.boxes),v.obj.getColliders());
  }
  for(let i=0;i<ops.length;i++){
   const x=a.parts[i],y=b.parts[i];
   assert.deepEqual(x.params,y.params);
   if(i>=2){ // two northern segments, four east/west segments, four corner towers and empty corridors
    assert.deepEqual(meshes(x.kids).map(row),meshes(y.kids).map(row),'ordered retained '+i);
    assert.deepEqual(x.boxes,y.boxes,'ordered physical contacts '+i);continue;
   }
   const side=i===0?'west':'east',sgn=i===0?1:-1;
   assert.equal(x.params.wumenCapFit.side,sgn);
   assert.equal(x.boxes.length,1);
   near(rect(x.boxes[0]),[i===0?60:-372.2,0,z0,i===0?372.2:-60,3,z1]);
   assert.equal(y.kids.length,1); const group=y.kids[0],cells=cellTable[i];
   assert.equal(group.name,'wumen-practical-wall-junction-'+side);assert.equal(group.userData.r157WumenWallJunction.side,sgn);
   assert.equal(y.boxes.length,cells.length);assert.equal(group.userData.r157WumenWallJunction.cells,cells.length);
   for(const [j,[lo,hi,front,back,yMax]] of cells.entries()){
    near(rect(y.boxes[j]),[lo,0,front,hi,yMax,back],1e-8);
    for(const [n,h0,h1,label] of [[0,0,1.5,'wall-base'],[1,1.5,10,'wall-body']]){
     const m=group.children[2*j+n];assert.equal(m.name,label);checkBrick(m,b.lib);
     near(rect(new T.Box3().setFromObject(m)),[lo,h0,front,hi,h1,back]);
    }
   }
   const cap=group.children[2*cells.length],earlierCap=x.kids[2];assert.ok(cap.isGroup&&earlierCap.isGroup);
   const capMeshes=meshes([cap]),preCapMeshes=meshes([earlierCap]);
   assert.equal(capMeshes.length,preCapMeshes.length);assert.ok(capMeshes.length>0);
   // Historical cap world triangles are retained; builder recentres the
   // shortened section, so verify current UVs against that cap, not R140 UVs.
   const canonical=buildWallCap(b.lib,{length:372.2-97.9,thickness:8.6});
   canonical.position.set(sgn*(372.2+97.9)/2,10,-420.7);canonical.updateMatrixWorld(true);
   try{const expected=meshes([canonical]);assert.equal(expected.length,capMeshes.length);
    for(let j=0;j<expected.length;j++){triWorld(preCapMeshes[j],capMeshes[j]);triWorld(expected[j],capMeshes[j],true);}
   }finally{canonical.traverse(m=>m.geometry?.dispose());for(const m of canonical.userData.ownedMaterials||[])m.dispose();}
   const before=x.kids.slice(3),after=group.children.slice(2*cells.length+1);
   assert.ok(before.length>60);assert.equal(before.length,after.length);
   for(let j=0;j<before.length;j++){assert.equal(before[j].userData.r140CityBrick.scope,'OUTER_CRENEL_ONLY');assert.equal(after[j].name,'wall-crenel');triWorld(before[j],after[j],true);checkBrick(after[j],b.lib);}
  }
 }finally{a.dispose();b.dispose();}
});
