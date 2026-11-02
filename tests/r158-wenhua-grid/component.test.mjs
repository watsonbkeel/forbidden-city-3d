import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {built,parts,meshes,row,hash,physical,dispose,ray,triangles} from './fixture.mjs';
const fine=f=>parts(f).filter(m=>m.userData.wenhuaGateSouthWindow.role==='red-fine-grille');
test('photographed end window has actual red fine diagonal members in all four bounded panes',()=>{
 const f=built();const a=fine(f);assert.equal(a.length,72,'missing visible fine grille');
 assert.equal(new Set(a.map(m=>m.userData.wenhuaGateSouthWindow.pane)).size,4);
 for(const m of a){assert.equal(m.material.name,'wenhua_gate_red_frame');assert.ok(Math.abs(m.rotation.z)>.1);assert.equal(m.castShadow,true);assert.equal(m.receiveShadow,true);const b=new T.Box3().setFromObject(m);assert.ok(b.min.z>=f.g.z-.3-1e-6&&b.max.z<=f.g.z+.3);assert.ok(b.min.x>=f.g.x-15.69-1e-6&&b.max.x<=f.g.x-10.79+1e-6);assert.ok(b.min.y>=2.82-1e-6&&b.max.y<=6.79+1e-6);}
 assert.equal(f.g.wenhuaSouthWindow.majorDivisions.fineGridModeled,true);assert.equal(f.g.wenhuaSouthWindow.accepted,false);dispose(f);
});
test('only fine members added: all existing geometry/material/pose, physical rows and three portals preserved',()=>{
 const a=built('before'),b=built();assert.equal(hash(meshes(a.frame).map(row)),hash(meshes(b.frame).filter(m=>!fine(b).includes(m)).map(row)));assert.equal(hash(physical(a.kit)),hash(physical(b.kit)));
 for(const x of [-6.62,0,6.62])assert.equal(ray(b,[x,2.7,-1],[0,0,1],2).length,0);
 assert.equal(b.cm.checkCollision(new T.Vector3(b.g.x-13.24,4,b.g.z),.5),true);
 for(const m of fine(b))for(const t of triangles(m)){assert.ok(t.every(v=>Object.values(v).flat().every(Number.isFinite)));}
 dispose(a);dispose(b);
});
