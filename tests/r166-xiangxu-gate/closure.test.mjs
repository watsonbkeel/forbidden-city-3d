import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {triangleBodyIntersects} from '../../src/utils/TriangleSupport.js';
import {buildXiangxuGlazedGate} from '../../src/scene/palace/special/XiangxuGlazedGate.js';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/east-six.json',import.meta.url)));
function fixture(t){const lib=realTextureLibrary(),kit=new CourtKit(lib,'east-six');t.after(()=>{kit.dispose(kit.root);lib.dispose()});return{kit,...buildXiangxuGlazedGate(kit,zone)};}
const meshes=f=>{const rows=[];f.traverse(m=>{if(m.isMesh)rows.push(m)});return rows;};
const role=(frame,name)=>meshes(frame).filter(m=>m.userData.xiangxuRole===name);
// The photo supports continuous material in these three regions. Numeric
// samples test the chosen game fit, not a measured historic elevation.
function solidAt(kit,frame,x,y,expectedRole){
 frame.updateWorldMatrix(true,true);
 for(const direction of[-1,1]){
  const ray=new T.Raycaster(new T.Vector3(-134.5+x,y,207-direction*10),new T.Vector3(0,0,direction),0,20);
  const hits=ray.intersectObject(frame,true),hit=hits.find(h=>h.object.userData.xiangxuRole===expectedRole);
  assert.ok(hit,`${expectedRole} visible closure at ${x},${y} from ${direction}`);
  const owner=kit.colliders.find(c=>c.xiangxuMesh===hit.object.uuid);
  assert.ok(owner?.triangleSupport,`${expectedRole} exact triangle contact`);
  const body=new T.Box3().setFromCenterAndSize(hit.point,new T.Vector3(.02,.02,.04));
  assert.ok(triangleBodyIntersects(owner.triangleSupport,body),`${expectedRole} contact coincides with visible surface`);
 }
}
function upperClosure(kit,frame){for(const y of[3.49,3.8,4.22])for(const x of[-1.4,0,1.4])solidAt(kit,frame,x,y,'solid-door-transom');}
function wingClosure(kit,frame){for(const side of[-1,1]){for(const y of[1,2,3.15])solidAt(kit,frame,side*3.15,y,'short-self-owned-wall');solidAt(kit,frame,side*3.1875,.175,'short-wing-stone-foot');}}
test('the photographed solid upper door band closes the chosen fit with visible triangles and matching contacts',t=>{const{kit,frame}=fixture(t);assert.equal(role(frame,'solid-door-transom').length,1);upperClosure(kit,frame);const band=new T.Box3().setFromObject(role(frame,'solid-door-transom')[0]);assert.ok(band.min.y<=3.47&&band.max.y>=4.235);assert.ok(band.min.x<=-135.95&&band.max.x>=-133.05);assert.ok(band.min.y>=3.4&&band.max.y<=4.4,'bounded local closure only');});
test('both self-owned short wings and feet join their piers without extending outer endpoints',t=>{const{kit,frame}=fixture(t);wingClosure(kit,frame);for(const name of['short-self-owned-wall','short-wing-stone-foot'])for(const m of role(frame,name)){const b=new T.Box3().setFromObject(m),side=Math.sign(m.position.x),inner=side>0?b.min.x+134.5:-(b.max.x+134.5),outer=side>0?b.max.x+134.5:-(b.min.x+134.5);assert.ok(inner<=3.100001);assert.ok(Math.abs(outer-5.5)<1e-6,'same old outer endpoint');}});
test('closure oracle rejects missing visible bands, detached wings and contact-only or visual-only substitutes',t=>{const{kit,frame}=fixture(t);upperClosure(kit,frame);wingClosure(kit,frame);const band=role(frame,'solid-door-transom')[0];frame.remove(band);assert.throws(()=>upperClosure(kit,frame),/visible closure/);frame.add(band);const wall=role(frame,'short-self-owned-wall')[0];frame.remove(wall);assert.throws(()=>wingClosure(kit,frame),/visible closure/);frame.add(wall);const index=kit.colliders.findIndex(c=>c.xiangxuMesh===band.uuid),owner=kit.colliders.splice(index,1)[0];assert.throws(()=>upperClosure(kit,frame),/exact triangle contact/);kit.colliders.splice(index,0,owner);upperClosure(kit,frame);wingClosure(kit,frame);});
