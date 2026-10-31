import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {buildRoof} from '../../src/scene/RoofBuilder.js';
import {library,signature,triangles,release,captureModule} from '../lib/r58-hall-beast-fixture.mjs';

const baseline=JSON.parse(readFileSync(new URL('./qianqing-roof-baseline.json',import.meta.url)));
export const options={type:'wudian',width:46.6,depth:25.6,layers:2,baseY:9.38,brackets:true,sides:4};
const selected={...options,walkingBeastProfile:'qianqing'};
const captured=await captureModule();
function rawBuild(opts,observe,lib=library()){
  globalThis.__r58HipCapture=observe;
  try{return captured.buildRoof(lib,opts);}finally{delete globalThis.__r58HipCapture;}
}
function meshTriangles(mesh){
  mesh.updateMatrixWorld(true);
  const p=mesh.geometry.attributes.position,index=mesh.geometry.index,out=[];
  for(let i=0;i<(index?.count??p.count);i+=3)out.push(new T.Triangle(...[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,index?.getX(i+k)??i+k).applyMatrix4(mesh.matrixWorld))));
  return out;
}

for(const row of baseline.rows)test(`R159 non-target roof fingerprint retained: ${row.name}/${row.detail}`,()=>{
  const roof=buildRoof(library(),row.opts);
  assert.deepEqual(signature(roof),row.signature);
  assert.equal(triangles(roof),row.triangles);
  release(roof);
});

test('R159 Qianqing emits 72 actual body/head pairs and 8 distinct riders across both eave levels',()=>{
  let raw;
  const roof=rawBuild(selected,g=>{raw=g.children.map(m=>({name:m.name,type:m.geometry?.type}));});
  const data=roof.userData.walkingBeasts;
  assert.equal(data.entityId,'FC-38B23747E9');
  assert.equal(data.animalTotal,72);assert.equal(data.riderTotal,8);
  assert.deepEqual(data.countsPerCorner,{lower:9,upper:9});
  assert.equal(raw.filter(m=>m.name==='walking-beast-body').length,72);
  assert.equal(raw.filter(m=>m.name==='walking-beast-head').length,72);
  assert.equal(raw.filter(m=>m.type==='ConeGeometry').length,8);
  assert.deepEqual(data.rows.map(r=>[r.level,r.corner,r.count]),['lower','upper'].flatMap(l=>[0,1,2,3].map(i=>[l,i,9])));
  release(roof);
});

test('R159 only walking animals change; all ridges, tiles, riders, brackets and roof-body attributes retain exact current source',()=>{
  const signatures=[];
  for(const opts of[options,selected]){const roof=rawBuild(opts,g=>signatures.push(signature(g,{excludeWalking:true})));release(roof);}
  assert.deepEqual(signatures[1],signatures[0]);
});

test('R159 exact final batch budget replaces 32 generic animals by 72 without extra draw materials or textures',()=>{
  const roof=buildRoof(library(),selected),old=baseline.rows.find(r=>r.name==='qianqing'&&r.detail==='high');
  assert.equal(triangles(roof)-old.triangles,2984,'full underside triangulation is included in the submitted budget');
  assert.equal(roof.children.length,old.signature.meshes);
  assert.equal(roof.userData.walkingBeasts.rows.reduce((n,r)=>n+r.animalTriangles,0),3752,'72 seated bodies and 72 heads, not a corner-only box count');
  let bytes=0;roof.traverse(m=>{if(m.isMesh)bytes+=Object.values(m.geometry.attributes).reduce((n,a)=>n+a.array.byteLength,0)+(m.geometry.index?.array.byteLength??0);});
  assert.equal(bytes,1531008,'final attributes increase by exactly 286,464 bytes');
  release(roof);
});

test('R159 all 288 contact corners belong to real raw ridge triangles and actual submitted Float32 body vertices',()=>{
  let raw;
  const roof=rawBuild(selected,g=>{raw=g.children.filter(m=>m.isMesh).map(m=>({name:m.name,type:m.geometry.type,path:m.geometry.parameters?.path,faces:meshTriangles(m)}));});
  const ridges=raw.filter(m=>m.type==='TubeGeometry'),bodies=raw.filter(m=>m.name==='walking-beast-body');
  const final=[];roof.traverse(m=>{if(m.isMesh)final.push(...meshTriangles(m).flatMap(t=>[t.a,t.b,t.c]));});
  let bi=0,contacts=0;
  for(const [ri,row]of roof.userData.walkingBeasts.rows.entries()){
    assert.ok(row.arcLength>row.stations.at(-1).distance+row.scale*.29+row.radius*2);
    for(const station of row.stations){
      assert.ok(ridges[ri].path.getPoint(station.t).distanceTo(new T.Vector3(...station.center))<1e-10);
      assert.equal(station.footContacts.length,4);
      for(const xyz of station.footContacts){const v=new T.Vector3(...xyz);
        assert.ok(ridges[ri].faces.some(t=>t.closestPointToPoint(v,new T.Vector3()).distanceTo(v)<1e-7));
        assert.ok(bodies[bi].faces.some(t=>[t.a,t.b,t.c].some(p=>p.distanceTo(v)<3e-6)));
        assert.ok(final.some(p=>p.distanceTo(v)<3e-6),'contact persists after final Float32 merge');contacts++;
      }bi++;
    }
  }
  assert.equal(contacts,288);assert.equal(bi,72);release(roof);
});

test('R159 actual complete body+head bounds clear preceding/following animals and retained riders',()=>{
  let raw;
  const roof=rawBuild(selected,g=>{raw=g.children.filter(m=>m.isMesh).map(m=>({name:m.name,type:m.geometry.type,box:new T.Box3().setFromObject(m)}));});
  const animals=raw.filter(m=>m.name.startsWith('walking-beast-')),riders=raw.filter(m=>m.type==='ConeGeometry');let i=0;
  for(const [r,row]of roof.userData.walkingBeasts.rows.entries()){
    let previous=riders[r].box;
    for(let j=0;j<row.count;j++){const box=animals[i++].box.clone().union(animals[i++].box);assert.equal(previous.intersectsBox(box),false);previous=box;}
  }release(roof);
});

test('R159 low detail retains the exact previous roof without pretending that omitted animals exist',()=>{
  const roof=buildRoof(library(),{...selected,detail:'low'}),old=baseline.rows.find(r=>r.name==='qianqing'&&r.detail==='low');
  assert.deepEqual(signature(roof),old.signature);assert.equal(triangles(roof),old.triangles);
  assert.equal(roof.userData.walkingBeasts.animalTotal,0);assert.equal(roof.userData.walkingBeasts.riderTotal,0);assert.deepEqual(roof.userData.walkingBeasts.rows,[]);release(roof);
});

test('R159 dry profile refuses other halls and malformed shape overrides before allocating material resources',()=>{
  for(const bad of[{width:46},{depth:25},{height:9},{overhang:2},{layers:1},{type:'xieshan'},{sides:8},{brackets:false},{baseY:NaN},{baseY:undefined},{_lift:1},{_walkingLayer:'upper'},{wumenVerticalProfile:{}},{jiaotaiCeilingOpening:{}},{baoheInteriorOpening:{}}]){
    const lib=library();assert.throws(()=>buildRoof(lib,{...selected,...bad}));assert.equal(lib.mats.size,0);
  }
});

test('R159 target-source default arithmetic reaches the reviewed profile without rounding roof geometry',async()=>{
  const {PALACE_LAYOUT}=await import('../../src/scene/Layout.js'),d=PALACE_LAYOUT.find(x=>x.name==='乾清宫');
  const roof=buildRoof(library(),{...selected,width:d.dimensions.width+.6,depth:d.dimensions.depth+.6});
  assert.equal(roof.userData.walkingBeasts.animalTotal,72);release(roof);
});

test('R159 source/intermediate/final geometries and private materials retain one disposal owner',()=>{
  const old=T.BufferGeometry.prototype.dispose,oldMaterial=T.Material.prototype.dispose,counts=new Map(),materials=new Map();
  T.BufferGeometry.prototype.dispose=function(){counts.set(this,(counts.get(this)??0)+1);return old.call(this);};
  T.Material.prototype.dispose=function(){materials.set(this,(materials.get(this)??0)+1);return oldMaterial.call(this);};
  try{for(let k=0;k<2;k++){
    let inputs;const lib=library(),roof=rawBuild(selected,g=>{inputs=g.children.filter(m=>m.isMesh).map(m=>m.geometry);},lib);
    for(const g of inputs)assert.equal(counts.get(g),1);
    roof.traverse(m=>{if(m.isMesh)assert.equal(counts.get(m.geometry),undefined);});
    release(roof);roof.traverse(m=>{if(m.isMesh)assert.equal(counts.get(m.geometry),1);});
    for(const m of roof.userData.ownedMaterials)assert.equal(materials.get(m),1);
    for(const m of lib.mats.values())assert.equal(materials.get(m),undefined,'never dispose the shared TextureLibrary owner');
  }assert.ok([...counts.values()].every(n=>n===1));assert.ok([...materials.values()].every(n=>n===1));}
  finally{T.BufferGeometry.prototype.dispose=old;T.Material.prototype.dispose=oldMaterial;}
});
