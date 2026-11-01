import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {library} from '../../lib/inner-palace-fixture.mjs';
import {zhongheFragment,meshRows,hash} from '../../lib/r55-zhonghe-fragment.mjs';
import {triangleBodyIntersects} from '../../../src/utils/TriangleSupport.js';
import {mergeByMaterial} from '../../../src/utils/MergeUtils.js';
import retained from '../../fixtures/r157-zhonghe-stands-retained.json' with {type:'json'};
const path=new URL('../../../src/scene/palace/special/ZhongheDisplayStands.js',import.meta.url);
const api=fs.existsSync(path)?await import(path):{};
const ID='zhonghe-slender-display-stands';
function fixture(){const f=zhongheFragment({plinth:true});f.target=f.group.getObjectByName(ID);return f;}
const target=m=>m.userData.zhongheStand===true;
const bounds=c=>({min:c.min.toArray(),max:c.max.toArray()});
function close(f){f.builder.dispose();}
test('dedicated source-bound stand API exists',()=>assert.equal(typeof api.buildZhongheDisplayStands,'function'));
test('actual Zhonghe replaces exactly two target objects and preserves every non-target mesh/collider/support',()=>{
 const f=fixture();try{assert.ok(f.target,'new stand pair actually hooked into production Zhonghe component');
  const meshes=[];f.group.traverse(m=>{if(m.isMesh)meshes.push(m)});const rows=meshRows(f.group);
  assert.equal(hash(rows.filter((r,i)=>!target(meshes[i]))),retained.nonTargetMeshes);
  assert.equal(hash(f.builder.colliders.filter(c=>!c.triangleSupport?.id.startsWith(ID)).map(bounds)),retained.nonTargetColliders);
  assert.equal(hash(f.builder.walkables),retained.walkables);
  assert.deepEqual(f.target.userData.structure.retainedCenters,[[-4.56*.35,64],[4.56*.35,64]]);
 }finally{close(f);}
});
test('coarse source geometry has thin supports and small display, not broad drum bodies or invented carving',()=>{
 const f=fixture();try{assert.ok(f.target);const p=f.target.userData.structure;assert.match(p.source,/1569/);assert.equal(p.accepted,false);assert.match(p.dimensions,/FIT/);assert.equal(p.legCountStatus,'ENGINEERING_FIT_NOT_IDENTIFIED_FROM_PHOTO');
  for(const side of[-1,1]){const parts=f.target.children.filter(m=>m.userData.side===side),bb=new T.Box3();parts.forEach(m=>bb.union(new T.Box3().setFromObject(m)));const size=bb.getSize(new T.Vector3());assert.ok(size.x<.8&&size.z<.8&&size.y<1.6);
   assert.ok(parts.some(m=>m.userData.role==='slender-leg'));assert.ok(parts.some(m=>m.userData.role==='shallow-tray'));assert.ok(parts.some(m=>m.userData.role==='plain-small-display'));assert.equal(parts.some(m=>/dragon|inscription|lid|flame/.test(m.name)),false);
  }
 }finally{close(f);}
});
test('each closed visible solid owns exact triangle collision while between-leg air remains empty',()=>{
 const f=fixture();try{assert.ok(f.target);const cs=f.builder.colliders.filter(c=>c.triangleSupport?.id.startsWith(ID));assert.equal(cs.length,f.target.children.length);
  for(const m of f.target.children){const c=cs.find(c=>c.triangleSupport.id===m.userData.collisionId);assert.ok(c);assert.ok(c.equals(c.triangleSupport.box));const a=m.geometry.attributes.position,ix=m.geometry.index,edges=new Map();let volume=0;
   for(let i=0;i<(ix?.count??a.count);i+=3){const pts=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k));assert.ok(new T.Triangle(...pts).getArea()>1e-10);volume+=pts[0].dot(pts[1].clone().cross(pts[2]))/6;
    for(let k=0;k<3;k++){const key=[pts[k],pts[(k+1)%3]].map(p=>p.toArray().map(x=>x.toFixed(5)).join(',')).sort().join('/');edges.set(key,(edges.get(key)??0)+1);}
   }assert.ok([...edges.values()].every(v=>v===2),m.name+' closed');assert.ok(volume>1e-9,m.name+' outward');
  }
  const x=1.596,z=64,probe=new T.Box3(new T.Vector3(x-.05,8.9,z-.05),new T.Vector3(x+.05,9.1,z+.05));assert.equal(cs.some(c=>triangleBodyIntersects(c.triangleSupport,probe)),false,'no invisible old box between legs');
  const leg=f.target.children.find(m=>m.userData.role==='slender-leg');const b=new T.Box3().setFromObject(leg),point=b.getCenter(new T.Vector3()),stone=new T.Box3().setFromCenterAndSize(point,new T.Vector3(.02,.02,.02));assert.ok(cs.some(c=>triangleBodyIntersects(c.triangleSupport,stone)),'actual leg remains physical');
  const normalBody=new T.Box3(new T.Vector3(x-.5,8.63,z-.5),new T.Vector3(x+.5,10.33,z+.5));assert.ok(cs.some(c=>triangleBodyIntersects(c.triangleSupport,normalBody)),'normal body cannot walk through the furniture');
 }finally{close(f);}
});
test('invalid and duplicate hosts reject before visible/collision mutations',()=>{
 assert.equal(typeof api.buildZhongheDisplayStands,'function');const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();g.userData.structure={id:'other'};
 assert.throws(()=>api.buildZhongheDisplayStands(b,g,{x0:0,y:8.6,ztb0:66.2,thW:4.56}));assert.equal(g.children.length,0);assert.equal(b.colliders.length,0);b.dispose();
 const f=fixture();try{const n=f.builder.colliders.length;assert.throws(()=>api.buildZhongheDisplayStands(f.builder,f.shell,{x0:0,y:8.6,ztb0:66.2,thW:4.56}));assert.equal(f.builder.colliders.length,n);}finally{close(f);}
});
test('material merge preserves actual face hits and all source/merged geometries dispose once',()=>{
 const f=fixture();try{assert.ok(f.target);const counts=new Map();const own=g=>g.traverse(m=>{if(m.geometry&&!counts.has(m.geometry)){counts.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>counts.set(m.geometry,counts.get(m.geometry)+1));}});own(f.target);
 const ray=new T.Raycaster(new T.Vector3(1.596,11,64),new T.Vector3(0,-1,0)),before=ray.intersectObject(f.target,true)[0]?.point.toArray();assert.ok(before);
 const merged=mergeByMaterial(f.target,{name:ID});f.shell.remove(f.target);f.shell.add(merged);merged.updateMatrixWorld(true);assert.deepEqual(ray.intersectObject(merged,true)[0].point.toArray(),before);assert.ok(merged.children.length<=3);own(merged);close(f);assert.ok([...counts.values()].every(n=>n===1));
 }finally{ /* builder disposed above after successful comparison */ }
});
