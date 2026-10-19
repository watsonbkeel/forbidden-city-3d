import {restorePreFurnishingSurfaceSource} from './lib/taihe-furnishing-surface-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {buildTaiheCeiling} from '../src/scene/palace/special/TaiheCore.js';
import {taiheCeilingMaterial,TAIHE_CEILING_TILE} from '../src/scene/palace/special/TaiheCeilingMaterial.js';
import {drawTaiheCeilingTile} from '../src/scene/palace/special/TaiheCeilingArtwork.js';
import {mergeByMaterial} from '../src/utils/MergeUtils.js';
import {restorePreCeilingSource} from './lib/taihe-ceiling-retention.mjs';
import delta from './fixtures/taihe-ceiling-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const file='src/scene/palace/special/TaiheCore.js';
const code=restorePreFurnishingSurfaceSource(file,fs.readFileSync(new URL('../'+file,import.meta.url)));
const oldSource=restorePreCeilingSource(file,code).toString().replace(/from '(\.[^']+)'/g,(_,p)=>`from '${new URL(p,new URL('../'+file,import.meta.url)).href}'`).replace(/from 'three'/g,`from '${new URL('../node_modules/three/build/three.module.js',import.meta.url).href}'`);
const old=await import(`data:text/javascript,${encodeURIComponent(oldSource)}`);
function context() {const calls=[];const ctx=new Proxy({},{get:(_,k)=>(...args)=>{calls.push([k,...args]);},set:(_,k,v)=>{calls.push(['set',k,v]);return true;}});return{ctx,calls};}
function fixture(t){const saved=globalThis.document,canvases=[];globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');const c=context(),canvas={width:0,height:0,getContext:kind=>{assert.equal(kind,'2d');return c.ctx;},calls:c.calls};canvases.push(canvas);return canvas;}};t.after(()=>{globalThis.document=saved;});const mats=new Map(),lib={material:(n,p={})=>{const k=n+JSON.stringify(p);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name:n,...p}));return mats.get(k);},tileSize:()=>1,aspect:()=>1};return{builder:new PalaceBuilder(new THREE.Scene(),lib),canvases};}
const geom=g=>({position:[...g.attributes.position.array],normal:[...g.attributes.normal.array],uv:[...g.attributes.uv.array],index:g.index?[...g.index.array]:null});
test('only the exact two source substitutions compose with every frozen older source guard',()=>{
 const row=delta.files[file];assert.equal(sha(code),row.candidateSHA256);assert.equal(sha(restorePreCeilingSource(file,code)),row.baselineSHA256);
 for(const d of row.deltas)for(const replacement of ['',d.after+d.after])assert.throws(()=>restorePreCeilingSource(file,code.toString().replace(d.after,replacement)));
 assert.throws(()=>restorePreCeilingSource(file,code+'\n'));
});
test('four real ceiling planes preserve exact positions, normals, winding, UV repeat and opening',t=>{
 const {builder}=fixture(t),a=new THREE.Group(),b=new THREE.Group(),args={x0:0,z0:30,y:9.9375,w:63,d:37};buildTaiheCeiling(builder,a,args);old.buildTaiheCeiling(builder,b,args);
 const beams=a.children.filter(o=>o.userData.taihePermanent==='central-beam');assert.equal(beams.length,6);for(const beam of beams)a.remove(beam);const frames=a.children.filter(o=>o.userData.taihePermanent==='coffer-frame');assert.equal(frames.length,28);assert.equal(frames.reduce((n,o)=>n+o.geometry.index.count/3,0),280);for(const frame of frames)a.remove(frame);assert.equal(a.children.length,4);assert.equal(b.children.length,4);
 for(let i=0;i<4;i++){const x=a.children[i],y=b.children[i];assert.deepEqual(geom(x.geometry),geom(y.geometry));assert.deepEqual(x.position.toArray(),y.position.toArray());assert.deepEqual(x.userData,y.userData);assert.equal(x.material,taiheCeilingMaterial(builder));assert.equal(y.material,builder.ceilingMaterial());assert.notEqual(x.material,y.material);}
 assert.equal(a.children.reduce((n,m)=>n+m.geometry.index.count/3,0),8);assert.deepEqual(builder.colliders,[]);assert.deepEqual(builder.walkables,[]);builder.dispose();
});
test('new material is cached per builder, preserves physical response and owns its one texture once',t=>{
 const {builder,canvases}=fixture(t),legacy=builder.ceilingMaterial(),legacyCalls=structuredClone(canvases[0].calls),m=taiheCeilingMaterial(builder);assert.equal(taiheCeilingMaterial(builder),m);assert.equal(canvases.length,2);assert.equal(canvases[1].width,512);assert.equal(canvases[1].height,512);
 for(const key of ['roughness','metalness','side','transparent','opacity','depthWrite','envMapIntensity','toneMapped'])assert.equal(m[key],legacy[key],key);
 assert.deepEqual(m.color.toArray(),legacy.color.toArray());assert.deepEqual(m.emissive.toArray(),legacy.emissive.toArray());assert.equal(m.normalMap,null);assert.equal(m.bumpMap,null);assert.equal(m.roughnessMap,null);assert.equal(m.onBeforeCompile,legacy.onBeforeCompile);
 assert.equal(m.map.colorSpace,THREE.SRGBColorSpace);assert.equal(m.map.wrapS,THREE.RepeatWrapping);assert.equal(m.map.wrapT,THREE.RepeatWrapping);assert.equal(m.map.minFilter,THREE.LinearMipmapLinearFilter);assert.equal(m.map.generateMipmaps,true);assert.equal(m.map.anisotropy,1);assert.deepEqual(canvases[0].calls,legacyCalls);
 let bytes=0;for(let n=512;n>=1;n/=2)bytes+=n*n*4;assert.equal(bytes,TAIHE_CEILING_TILE.rgbaMipBytes);assert.ok(bytes<1400000);
 let disposed=0;m.map.addEventListener('dispose',()=>disposed++);builder.dispose();assert.equal(disposed,1);m.dispose();assert.equal(disposed,1);
});
test('isolated ceiling planes retain one texture batch and no triangles; beam delta has its own guard',t=>{
 const {builder}=fixture(t),a=new THREE.Group(),b=new THREE.Group();
 for(const [g,fn]of [[a,buildTaiheCeiling],[b,old.buildTaiheCeiling]]){fn(builder,g,{x0:0,z0:0,y:9.9375,w:63,d:37});for(const beam of g.children.filter(o=>['central-beam','coffer-frame'].includes(o.userData.taihePermanent)))g.remove(beam);for(const z of [70,140]){const m=new THREE.Mesh(new THREE.PlaneGeometry(20,20),builder.ceilingMaterial());m.position.z=z;g.add(m);}}
 const x=mergeByMaterial(a),y=mergeByMaterial(b);assert.equal(x.children.length,2);assert.equal(y.children.length,1);const tris=g=>g.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);assert.equal(tris(x),tris(y));assert.equal(tris(x),12);
 assert.equal(x.children.find(m=>m.material===builder.ceilingMaterial()).geometry.attributes.position.count,12);builder.dispose();
});
test('artwork is deterministic, bounded and original vector drawing with no remote asset or dynamic entropy',()=>{
 const a=context(),b=context();drawTaiheCeilingTile(a.ctx,512);drawTaiheCeilingTile(b.ctx,512);assert.deepEqual(a.calls,b.calls);assert.ok(a.calls.length>80);assert.ok(a.calls.length<1200,'bounded commands including style assignments');assert.ok(a.calls.some(c=>c[0]==='bezierCurveTo'));assert.ok(a.calls.some(c=>c[0]==='stroke'));assert.equal(a.calls.filter(c=>c[0]==='save').length,a.calls.filter(c=>c[0]==='restore').length);
 const src=fs.readFileSync(new URL('../src/scene/palace/special/TaiheCeilingArtwork.js',import.meta.url),'utf8');assert.doesNotMatch(src,/Math\.random|Date\.|fetch\(|drawImage|new Image|setTimeout/);
 for(const call of a.calls)for(const value of call.slice(1))if(typeof value==='number')assert.ok(Number.isFinite(value));
});
