import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {fixture,roles,meshes,meshRows,lowerWindow,hash,physical,triangles,snapshot,rayLocal,geometryHealth} from '../lib/r58-court-facade-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('../fixtures/r58-court-facade-baseline.json',import.meta.url))).profiles;
test('Tiren replaces only six lower window groups with twelve separately framed straight-lattice leaves',()=>{
 const f=fixture('tiren'),leaves=roles(f.frame,'lower-window-leaf');assert.equal(leaves.length,12);
 assert.equal(hash(meshRows(f.frame,lowerWindow)),baseline.tiren.retainedWithoutLowerWindows,'all non-target actual geometry and material properties stay bit-exact');assert.equal(hash(physical(f.kit)),baseline.tiren.physics);
 assert.equal(roles(f.frame,'upper-lattice-leaf').length,28);assert.equal(roles(f.frame,'lower-window').length,6);
 for(const bay of [1,2,3,5,6,7]){const pair=leaves.filter(o=>o.userData.bay===bay);assert.equal(pair.length,2);for(const leaf of pair){assert.equal(roles(leaf,'lower-window-leaf-stile').length,2);assert.equal(roles(leaf,'lower-window-leaf-rail').length,2);assert.equal(roles(leaf,'lower-window-leaf-bar').length,6);}}
 assert.equal(roles(f.frame,'lower-window-frame').length,0,'old giant frame not hidden behind new sashes');assert.equal(roles(f.frame,'lower-window-bar').length,0,'old center/grid is replaced, not layered');
 assert.ok(Math.abs(f.g.lower.width-43.712)<1e-9);assert.ok(Math.abs(f.g.lower.depth-16.736)<1e-9);geometryHealth(f.frame);assert.ok(triangles(f.frame)-baseline.tiren.triangles<1000);
});
test('all six paired windows retain their original outer envelope and use only original shared materials',()=>{
 const f=fixture('tiren'),lo=f.g.lower,h=lo.height-.65-.85-.2;
 for(const window of roles(f.frame,'lower-window')){const bay=window.userData.bay,cx=(lo.columnXs[bay]+lo.columnXs[bay+1])/2,clear=lo.intervals[bay]-.6;const box=new THREE.Box3();for(const m of meshes(window)){assert.equal(m.material,f.lib.material('wood_column'));m.geometry.computeBoundingBox();box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrix));}const expected=[cx-clear/2-.065,lo.floorY+.85-.07,lo.front-.1,cx+clear/2+.065,lo.floorY+.85+h+.07,lo.front+.1];[...box.min.toArray(),...box.max.toArray()].forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<2e-6));}
 assert.equal(roles(f.frame,'lower-window-leaf').length,12);
});
test('Hongyi, including its six original windows and upper gallery, is byte-identical',()=>{const f=fixture('hongyi');assert.deepEqual(snapshot(f),baseline.hongyi);assert.equal(roles(f.frame,'lower-window-leaf').length,0);});
test('paired meeting stiles are visible from legal terrace eye height after merge and main entry remains clear',()=>{
 const f=fixture('tiren',{enter:true}),lo=f.g.lower,leaves=roles(f.frame,'lower-window-leaf');assert.equal(leaves.length,12);
 const targets=leaves.map(o=>{const m=roles(o,'lower-window-leaf-stile').find(m=>m.userData.edge==='meeting');return [m.position.x,f.g.platform.y+1.7,lo.front-.101];});
 const visible=root=>targets.forEach(p=>{const eye=[p[0],f.g.platform.y+1.7,lo.front-2],[wx,wz]=f.g.toWorld(eye[0],eye[2]);assert.equal(f.cm.getGroundHeight(wx,wz,f.g.platform.y),f.g.platform.y);assert.equal(f.cm.checkCollision(new THREE.Vector3(wx,eye[1],wz),.5),false);const hits=rayLocal(root,f.g,eye,[0,0,1],2.1);assert.ok(hits.length);assert.ok(Math.abs(hits[0].distance-1.9)<.002);});
 visible(f.frame);assert.equal(rayLocal(f.frame,f.g,[0,lo.floorY+1.7,lo.front-1],[0,0,1],3).length,0);
 const root=f.kit.finish();root.updateMatrixWorld(true);visible(root);assert.equal(meshes(root).length,12);geometryHealth(root);
 for(const x of [-1,0,1]){const [wx,wz]=f.g.toWorld(x,lo.front);assert.equal(f.cm.checkCollision(new THREE.Vector3(wx,lo.floorY+1.7,wz),.5),false);}
});
test('new leaves are source-owned and their merge/disposal never frees caller materials',()=>{
 const a=fixture('tiren'),b=fixture('tiren'),leafMeshes=roles(a.frame,'lower-window-leaf').flatMap(meshes);assert.ok(leafMeshes.length>0);const count=new Map();for(const m of leafMeshes){assert.ok(!meshes(b.frame).some(n=>n.geometry===m.geometry));count.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>count.set(m.geometry,count.get(m.geometry)+1));}let freed=0;a.lib.material('wood_column').addEventListener('dispose',()=>freed++);const root=a.kit.finish();for(const n of count.values())assert.equal(n,1);a.kit.dispose(root);assert.equal(freed,0);for(const n of count.values())assert.equal(n,1);
});

test('Tiren raw targeted boxes are nondegenerate before covered-face pruning',()=>{let checked=0;const f=fixture('tiren',{},null,kit=>{const box=kit.box.bind(kit);kit.box=(...args)=>{const m=box(...args);if(args[0].userData.role==='lower-window-leaf'){geometryHealth(m);checked++;}return m;};});assert.equal(checked,192);geometryHealth(f.frame);});
