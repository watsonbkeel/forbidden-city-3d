import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {gateFixture,baselineGate,retainedRows,triangleRows,nav,hash} from './lib/r61-qianqing-gate-fixture.mjs';
const old=gateFixture(baselineGate),now=gateFixture();
test.after(()=>{old.dispose();now.dispose();});
test('two actual south end fields have central tall/wide and two lower narrow fitted frames',()=>{
 const fields=now.root.userData.qianqingGate.southWindowGroups;assert.equal(fields?.length,2,'actual production hook is missing');
 const rays=new THREE.Raycaster();for(const f of fields){assert.equal(f.panels.length,3);assert.equal(f.sourcePhotoDate,null);assert.equal(f.completeWindowRestoration,false);const c=f.panels[1];assert.ok(c.width>2*f.panels[0].width);assert.ok(c.height>f.panels[0].height);
  for(const p of f.panels){rays.set(new THREE.Vector3(p.x,p.bottom+p.height,now.data.position.z+f.z-1),new THREE.Vector3(0,0,1));const hits=rays.intersectObject(now.root,true);const hit=hits.find(h=>Math.abs(h.point.z-(now.data.position.z+f.z-.24))<1e-5);assert.ok(hit,'actual front top-frame triangle, not just metadata');}
 }
});
test('all colliders, supports, three rear doors, stairs and connector remain exact frozen R60',()=>{assert.deepEqual(nav(now),nav(old));const a={...now.root.userData.qianqingGate};delete a.southWindowGroups;assert.deepEqual(a,old.root.userData.qianqingGate);});
test('all triangles outside two south outer-face window bands retain every attribute and position',()=>{assert.equal(hash(retainedRows(now)),hash(retainedRows(old)));});
test('rear windows and south inner faces do not inherit unobserved front tripartite form',()=>{const z=-now.data.dimensions.depth/2;for(const side of ['rear','south-inside']){const extract=f=>triangleRows(f).filter(r=>side==='rear'?r.v.every(v=>v[2]>-z-.3):r.v.every(v=>Math.abs(v[2]-z)<.25&&v[2]>=z+.039)).map(r=>JSON.stringify(r)).sort();assert.equal(hash(extract(now)),hash(extract(old)));}});
test('no additional production texture or draw material, bounded nondegenerate geometry',()=>{const mats=f=>{const a=[];f.root.traverse(m=>{if(m.isMesh)for(const x of(Array.isArray(m.material)?m.material:[m.material]))a.push(x.name);});return a.sort();};assert.deepEqual(mats(now),mats(old));const rows=triangleRows(now);assert.ok(rows.length-triangleRows(old).length<200);for(const r of rows.filter(r=>r.material.startsWith('qianqing_window'))){const[a,b,c]=r.v.map(v=>new THREE.Vector3(...v));assert.ok(b.sub(a).cross(c.sub(a)).lengthSq()>1e-16);}});
