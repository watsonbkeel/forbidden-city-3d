import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {fixture,rawPanelFixture,nodes,snapshot,triangles,hash,ray} from './lib/r58-zhaode-panel-fixture.mjs';
const url=new URL('../src/scene/palace/special/ZhaodeSouthPanels.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const baseline=JSON.parse(readFileSync(new URL('../reports/r58-zhaode-south-panels/baseline.json',import.meta.url)));
const apply=(f)=>{assert.equal(typeof api.applyZhaodeSouthPanels,'function','dedicated bounded surface helper required');return api.applyZhaodeSouthPanels(f.kit,f.frame);};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const dispose=f=>{f.kit.dispose(f.kit.root);f.lib.dispose();};
const exactFrame=f=>hash(f.frame.children.map(m=>({uuid:m.uuid,geometry:m.geometry.uuid,material:m.material.uuid,position:m.position.toArray(),triangles:triangles(m)})));

test('only two canonical south broad-bay paint fields change; all other geometry and registrations stay exact',()=>{
 const f=fixture(),s=snapshot(f),paint=nodes(f.frame,'zhaode-south-panel-paint');
 assert.equal(paint.length,2,'two bounded south fields, not a general wall recolor');
 for(const key of ['nonTargetHash','targetOtherFacesHash','registrationHash','bounds','colliders','walkables','rooms'])assert.deepEqual(s[key],baseline[key],key);
 assert.equal(s.materials,baseline.materials+1);assert.equal(s.meshes,baseline.meshes+2);assert.equal(s.triangles,baseline.triangles+64);
 for(const m of paint){const b=new THREE.Box3().setFromObject(m);near(b.min.z,-4.424);near(b.max.z,-4.424);near(b.max.x-b.min.x,4.2);near(b.min.y,4.066);near(b.max.y,8.766);assert.ok(Math.abs((b.min.x+b.max.x)/2)>5);assert.equal(m.material,paint[0].material);}
 const palette=paint[0].material.map;assert.equal(palette.isDataTexture,true);assert.equal(palette.image.width*palette.image.height,4);assert.equal(palette.image.data.length,16);assert.equal(palette.minFilter,THREE.NearestFilter);assert.equal(palette.magFilter,THREE.NearestFilter);assert.equal(palette.generateMipmaps,false);assert.equal(palette.colorSpace,THREE.SRGBColorSpace);
 dispose(f);
});

test('wrong instance, missing/altered target, shared source and repeat applications fail closed without side effects',()=>{
 for(const change of [f=>{f.frame.name='贞度门';},f=>{f.frame.userData.gateGeometry.profile='zhendu';},f=>{f.frame.remove(f.frame.children[0]);},f=>{f.frame.children[0].position.x+=.01;},f=>{f.frame.children[0].geometry.attributes.normal.setZ(30,1);},f=>{f.frame.children[1].geometry=f.frame.children[0].geometry;}]){
  const f=rawPanelFixture();change(f);const before=exactFrame(f),owned=f.kit.owned.length,tex=f.kit.ownedTextures?.length??0;
  assert.equal(apply(f),false);assert.equal(exactFrame(f),before);assert.equal(f.kit.owned.length,owned);assert.equal(f.kit.ownedTextures?.length??0,tex);dispose(f);
 }
 const f=rawPanelFixture();assert.equal(apply(f),true);const before=exactFrame(f);assert.equal(apply(f),false);assert.equal(exactFrame(f),before);dispose(f);
});

test('source and candidate triangles are nondegenerate and same-plane coverage has no double skins',()=>{
 const f=rawPanelFixture(),sources=f.frame.children.slice(0,2),old=sources.map(m=>m.geometry);let disposed=0;old.forEach(g=>g.addEventListener('dispose',()=>disposed++));
 for(const m of sources)for(const tri of triangles(m)){const [a,b,c]=tri.map(v=>new THREE.Vector3(...v.position));assert.ok(b.sub(a).cross(c.sub(a)).length()>1e-8);}
 assert.equal(apply(f),true);assert.equal(disposed,2);
 for(const m of f.frame.children)for(const tri of triangles(m)){
  const [a,b,c]=tri.map(v=>new THREE.Vector3(...v.position)),cross=b.sub(a).cross(c.sub(a));assert.ok(cross.length()>1e-8);assert.ok(cross.normalize().dot(new THREE.Vector3(...tri[0].normal))>.99999);
  const [u,v,w]=tri.map(p=>p.uv);assert.ok(Math.abs((v[0]-u[0])*(w[1]-u[1])-(v[1]-u[1])*(w[0]-u[0]))>1e-10,'noncollapsed UV');
 }
 for(const sign of [-1,1])for(const x of [2.51,3.31,3.45,3.48,3.52,5.12,7.46,7.49,8.9,10.01])for(const y of [3.55,4.08,4.22,4.25,4.29,5.23,8.57,8.63,8.75,9.2]){
  const hits=ray(f.frame,[sign*x,y,-7],[0,0,1],3);assert.equal(hits.length,1,`one skin at ${sign*x}/${y}`);near(hits[0].point.z,-4.424);
 }
 dispose(f);
});

test('merged first hits preserve portal, side and rear closure; palette UV and exact disposal survive finish',()=>{
 const f=fixture(),paint=nodes(f.frame,'zhaode-south-panel-paint');assert.equal(paint.length,2);
 const materials=[...f.lib.materials.values()],owned=[...f.kit.owned],texture=paint[0].material.map,watched=new Map();
 const watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};
 f.frame.traverse(m=>{if(m.geometry)watch(m.geometry);});const sources=[...watched.keys()];[...materials,...owned,texture].forEach(watch);
 const merged=f.kit.finish();for(const g of sources)assert.equal(watched.get(g),1);merged.traverse(m=>{if(m.geometry)watch(m.geometry);});
 const paints=merged.children.filter(m=>m.material===paint[0].material);assert.equal(paints.length,1,'one new merged draw');assert.equal(paints[0].material.map,texture);
 const sampled=new Set();for(const tri of triangles(paints[0])){const uv=tri.map(v=>v.uv),ids=uv.map(([u,v])=>Math.floor(u*4));assert.equal(new Set(ids).size,1);sampled.add(ids[0]);assert.ok(uv.every(([u,v])=>u>=0&&u<=1&&v>=0&&v<=1));}
 assert.deepEqual([...sampled].sort(),[0,1,2,3]);
 for(const sign of [-1,1]){
  for(const x of [3.31,3.45,3.48,3.52,5.21,7.49]){const h=ray(merged,[sign*x,6.1,-5],[0,0,1],1);assert.equal(h.length,1);assert.equal(h[0].object.material,paint[0].material);near(h[0].point.z,-4.424);}
  assert.equal(ray(merged,[sign*5.21,6.1,0],[0,0,-1],5)[0].object.material,f.lib.material('wall_red'));
  assert.equal(ray(merged,[sign*5.21,6.1,7],[0,0,-1],5)[0].object.material,f.lib.material('wall_red'));
 }
 for(const x of [-1.5,0,1.5])assert.equal(ray(merged,[x,4.8,-8],[0,0,1],16).length,0);
 assert.equal(merged.children.length,baseline.mergedDraws+1);f.kit.dispose(merged);
 for(const o of [...owned,texture,...merged.children.map(m=>m.geometry)])assert.equal(watched.get(o),1);
 for(const m of materials)assert.equal(watched.get(m),0);f.lib.dispose();
});
