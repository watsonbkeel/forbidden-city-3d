import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {inflateSync} from 'node:zlib';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
const source=()=>JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
const opts={triadTextureFirst:true,dafotangOriginalArtwork:true,dafotangOriginalScope:'triad'};
const subjects=['amitabha','shakyamuni','bhaisajyaguru'];
// CPU-only PNG decoder for these checked 8-bit RGBA, noninterlaced originals.
// It inflates and reconstructs every scanline; not HTMLImageElement/WebGL proof.
function decodePNG(bytes){
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 let width,height,parts=[],ended=false;
 for(let p=8;p<bytes.length;){const len=bytes.readUInt32BE(p),kind=bytes.toString('ascii',p+4,p+8),chunk=bytes.subarray(p+8,p+8+len);assert.ok(p+12+len<=bytes.length);
  if(kind==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);assert.deepEqual([...chunk.subarray(8)],[8,6,0,0,0]);}
  if(kind==='IDAT')parts.push(chunk);if(kind==='IEND'){ended=true;break;}p+=12+len;
 }
 assert.ok(ended&&width===1024&&height===1536);const stride=width*4,raw=inflateSync(Buffer.concat(parts),{maxOutputLength:(stride+1)*height});assert.equal(raw.length,(stride+1)*height);const image=Buffer.alloc(stride*height);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];assert.ok(filter<=4);for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?image[i-4]:0,b=y?image[i-stride]:0,c=y&&x>=4?image[i-stride-4]:0;image[i]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}}
 assert.ok(image.some(v=>v>0));return[width,height];
}

function managerFixture({enabled=true}={}){
 globalThis.window={location:{search:''}};
 const m=new ZoneManager({reuseInactive:true,triadTextureFirst:enabled}),scene=new T.Scene(),cm=new CollisionManager(),owners=[];
 class Builder{
  constructor(lib,config,options={}){this.triadTextureFirst=options.triadTextureFirst===true;this.options=options;this.config=config;this.starts=0;owners.push(this);}
  build(){this.group=new T.Group();this.group.name=this.config.id;return{group:this.group,colliders:[],walkables:[],rooms:[],mapItems:[],regions:[]};}
  startTextureFirstSession(){if(this.triadTextureFirst&&!this.disposed&&this.group.parent)this.starts++;}
  dispose(){this.disposed=true;this.group?.removeFromParent();}
 }
 m.register({id:'outer-west',name:'outer',bounds:{x0:0,x1:10,z0:0,z1:10},neighbors:[],items:[]},Builder);
 m.scene=scene;m.collisionManager=cm;m.library={owns:()=>false};m.prebuilt=new Map();m.silhouettes=new Map();m.currentId='outer-west';scene.userData.zoneManager=m;
 return{m,scene,cm,owners,Builder,dispose:()=>m.dispose()};
}
test('manager passes exact opt-in only to outer-west and starts after notification',()=>{const f=managerFixture();try{f.m.onLoad=()=>assert.equal(f.owners.at(-1).starts,0);f.m.loadZone('outer-west');const b=f.owners[0];assert.deepEqual(b.options,opts);assert.equal(b.starts,1);f.m.unloadZone('outer-west');assert.equal(b.disposed,true);assert.equal(f.m.inactiveCache.has('outer-west',f.m.zones.get('outer-west'),'independent'),false);f.m.loadZone('outer-west');assert.equal(f.owners.length,2);assert.equal(f.owners[1].starts,1);}finally{f.dispose();}});
test('manager init prebuild does not start inactive outer-west session; admission then cold reentry starts once',()=>{const f=managerFixture();try{f.m.register({id:'west-six',name:'start',bounds:{x0:20,x1:30,z0:20,z1:30},neighbors:[],items:[]},f.Builder);f.m.init(f.scene,f.m.library,f.cm,{x:25,z:25});const outer=f.owners.find(x=>x.config.id==='outer-west');assert.equal(outer.triadTextureFirst,true);assert.equal(outer.starts,0);assert.equal(outer.group.parent,null);f.m.loadZone('outer-west');assert.equal(outer.starts,1);f.m.unloadZone('outer-west');assert.equal(outer.disposed,true);f.m.loadZone('outer-west');assert.notEqual(f.m.loaded.get('outer-west').builder,outer);assert.equal(f.m.loaded.get('outer-west').builder.starts,1);}finally{f.dispose();}});
test('default-off manager never opts in or starts a texture session',()=>{const f=managerFixture({enabled:false});try{f.m.loadZone('outer-west');assert.equal(f.owners[0].triadTextureFirst,false);assert.equal(f.owners[0].starts,0);}finally{f.dispose();}});
test('failed registration and failed onLoad do not start texture fetch',()=>{for(const phase of['registration','notification']){const f=managerFixture(),err=Error(phase);try{if(phase==='registration')f.cm.addWalkables=()=>{throw err};else f.m.onLoad=()=>{throw err};assert.throws(()=>f.m.loadZone('outer-west'),e=>e===err);assert.equal(f.owners[0].starts,0);assert.equal(f.owners[0].disposed,true);assert.equal(f.m.loaded.size,0);}finally{f.dispose();}}});
test('reentrant load listener retirement does not start old generation or notify later listeners',()=>{const f=managerFixture();let late=0;try{f.m.lifecycleListeners.add(event=>{if(event==='load')f.m.unloadZone('outer-west')});f.m.lifecycleListeners.add(event=>{if(event==='load')late++});f.m.loadZone('outer-west');assert.equal(f.owners[0].disposed,true);assert.equal(f.owners[0].starts,0);assert.equal(late,0);assert.equal(f.m.loaded.size,0);}finally{f.dispose();}});
test('reentrant successor is retained when old onLoad throws',()=>{const f=managerFixture(),err=Error('old generation');let first=true;try{f.m.onLoad=()=>{if(first){first=false;f.m.unloadZone('outer-west');f.m.loadZone('outer-west');throw err;}};assert.throws(()=>f.m.loadZone('outer-west'),e=>e===err);assert.equal(f.owners.length,2);assert.equal(f.owners[0].disposed,true);assert.equal(f.m.loaded.get('outer-west').builder,f.owners[1]);assert.equal(f.owners[1].starts,1);assert.equal(f.owners[1].disposed,undefined);assert.equal(f.owners[1].group.parent,f.scene);}finally{f.dispose();}});
test('actual full outer-west: no detached fetch; native PNG CPU decode, independent fallback and retirement',async()=>{
 const prior={document:globalThis.document,Image:globalThis.Image,fetch:globalThis.fetch};const nativeFetch=prior.fetch,urls=[],decoded=[];let fail='bhaisajyaguru';
 globalThis.document={baseURI:'https://trial.invalid/forbidden-city-3d/',createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 globalThis.Image=class{async decode(){const response=await nativeFetch(this.src);const bytes=Buffer.from(await response.arrayBuffer());const size=decodePNG(bytes);[this.width,this.height]=size;decoded.push(size);}};
 globalThis.fetch=async(url,options)=>{urls.push(String(url));assert.ok(options.signal);const match=String(url).match(/\/textures\/dafotang-original\/(amitabha|shakyamuni|bhaisajyaguru)-refined-v2\.png$/);assert.ok(match,'only existing original PNG is fetched');if(match[1]===fail)return new Response('',{status:503});return new Response(fs.readFileSync(new URL(`../../public/textures/dafotang-original/${match[1]}-refined-v2.png`,import.meta.url)),{status:200,headers:{'content-type':'image/png'}});};
 let b;
 try{
  b=new ZoneBase(realTextureLibrary(),source(),opts);const data=b.build();await Promise.resolve();assert.equal(urls.length,0,'startup construction has no fetch');assert.equal(b.dafotangOriginalSession,undefined);b.startTextureFirstSession();await Promise.resolve();assert.equal(urls.length,0,'detached host cannot load');
  const scene=new T.Scene();scene.add(data.group);b.startTextureFirstSession();const s=b.dafotangOriginalSession;assert.ok(s);await s.ready;assert.equal(urls.length,3);assert.equal(s.status,'PARTIAL_FALLBACK',JSON.stringify(data.group.userData.architecture.find(r=>r.id==='place-outer-west-6cae88b6a2').originalArtworkTriad.slots));assert.deepEqual(decoded,[[1024,1536],[1024,1536]]);
  for(const id of subjects){assert.equal(s.slots[id].status,id===fail?'FALLBACK':'READY_FOR_HALL_QA');const mesh=s.slots[id].presentation;if(id!==fail){assert.equal(mesh.parent,data.group);assert.equal(mesh.name,'texture-first-'+id);assert.equal(mesh.material.alphaTest,.2);}}
  const states=data.group.userData.architecture.find(r=>r.id==='place-outer-west-6cae88b6a2').originalArtworkTriad.slots;
  for(const id of subjects)for(const n of states[id].fallbackMaterialNames){const m=data.group.children.find(o=>o.material?.name===n);assert.equal(m.visible,id===fail,'per-statue fallback');}
  s.dispose();assert.equal(s.status,'DISPOSED');assert.equal(Object.values(s.slots).every(x=>x.presentation===null),true);
  // Test-owned host readmission exercises existing session ownership restoration;
  // ordinary manager retirement instead disposes the entire builder (tested above).
  b.dafotangOriginalSession=null;fail=null;b.startTextureFirstSession();const renewed=b.dafotangOriginalSession;await renewed.ready;
  assert.equal(renewed.status,'READY_FOR_HALL_QA');assert.equal(urls.length,6);assert.equal(decoded.length,5);
  const maps=subjects.map(id=>{assert.equal(renewed.slots[id].status,'READY_FOR_HALL_QA');const mesh=renewed.slots[id].presentation;assert.equal(mesh.parent,data.group);assert.equal(mesh.name,'texture-first-'+id);return mesh.material.map;});assert.equal(new Set(maps).size,3,'each subject owns its own decoded painting');
  for(const id of subjects)for(const n of states[id].fallbackMaterialNames)assert.equal(data.group.children.find(o=>o.material?.name===n).visible,false);
  b.dispose();assert.equal(renewed.status,'DISPOSED');assert.equal(Object.values(renewed.slots).every(x=>x.presentation===null),true);b.startTextureFirstSession();await Promise.resolve();assert.equal(urls.length,6,'retired builder cannot restart');
 }finally{b?.dispose();Object.assign(globalThis,prior);}
});
