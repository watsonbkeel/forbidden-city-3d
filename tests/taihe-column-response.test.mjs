import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import * as THREE from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {captureTaiheControl} from './lib/taihe-core-fixture.mjs';
import {restoreLoadingWelcomeBytes} from './lib/loading-welcome-source-delta.mjs';
import {createTaiheColumnAtlas} from '../src/scene/palace/special/TaiheColumnSurface.js';
import {installTaiheColumnTextures} from '../src/scene/interior/TaiheCoreContract.js';
import base from './fixtures/taihe-column-response-baseline.json' with {type:'json'};
import P from '../data/architecture/taihe-core.json' with {type:'json'};
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const response=()=>import('../src/scene/palace/special/TaiheColumnResponse.js');
async function source(){const bytes=read('public/models/interiors/taihe-v17-display-28d7a11dbeda.glb');return(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'')).scene;}
function gold(root){let found;root.traverse(o=>{if(o.isMesh&&o.material.name==='taihe_gold')found=o;});assert.ok(found);return found;}
function originalAttributes(g){return Object.fromEntries(Object.entries(g.attributes).filter(([k])=>k!=='color').map(([k,a])=>[k,{count:a.count,itemSize:a.itemSize,sha256:sha(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}]));}
function classify(g){const p=g.attributes.position,idx=g.index,used=new Map(),centres=P.columns.x.flatMap(x=>P.columns.goldZ.map(z=>[x,z]));let decorated=0,neutral=0;
 for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),ps=ids.map(id=>[p.getX(id),p.getY(id),p.getZ(id)]),c=centres.find(c=>ps.every(v=>v[1]>=.19999&&v[1]<=P.columns.height+.00001&&Math.hypot(v[0]-c[0],v[2]-c[1])<=.52001));const cap=ps.every(v=>Math.abs(v[1]-.2)<1e-5)||ps.every(v=>Math.abs(v[1]-P.columns.height)<1e-5),on=!!c&&!cap;on?decorated++:neutral++;
 for(const id of ids){if(used.has(id))assert.equal(used.get(id),on,'indexed vertices never cross cap/decorated ownership');used.set(id,on);}}
 return{used,decorated,neutral};}
function inspect(mesh,count,bytes){const g=mesh.geometry,c=g.attributes.color;assert.ok(c,'runtime Float32 gain attribute');assert.equal(c.itemSize,3);assert.ok(c.array instanceof Float32Array);assert.equal(c.normalized,false);assert.equal(c.array.byteLength,bytes);const {used,decorated}=classify(g);assert.equal(decorated,count);assert.equal(used.size,g.attributes.position.count);const factors=mesh.material.color.toArray(),expected=[.65,.43,.10].map((v,k)=>Math.fround(v/factors[k]));
 for(const [id,on] of used){const uv=g.attributes.uv;assert.equal(uv.getX(id)!==0,on);for(let k=0;k<3;k++)assert.equal(c.array[id*3+k],on?expected[k]:1);}
 assert.equal(mesh.material.vertexColors,true);assert.ok(Math.abs(mesh.material.metalness-.55)<1e-7);return expected;
}
test('runtime response installs on actual B and loaded S with exact neutral and preserved geometry',async()=>{
 const b=captureTaiheControl('太和殿'),bm=gold(b.group),s=await source(),sm=gold(s),attrs=originalAttributes(sm.geometry),index=sha(Buffer.from(sm.geometry.index.array.buffer,sm.geometry.index.array.byteOffset,sm.geometry.index.array.byteLength));
 inspect(bm,144,17352);installTaiheColumnTextures(s,bm.material);inspect(sm,3192,217752);assert.deepEqual(originalAttributes(sm.geometry),attrs);assert.equal(sha(Buffer.from(sm.geometry.index.array.buffer,sm.geometry.index.array.byteOffset,sm.geometry.index.array.byteLength)),index);assert.notEqual(sm.geometry.attributes.color.array,bm.geometry.attributes.color.array);
 for(const record of base.fallback){const m=b.group.children.find(o=>o.material?.name===record.material);assert.deepEqual(originalAttributes(m.geometry),record.attributes);assert.deepEqual({color:m.material.color.toArray(),roughness:m.material.roughness,metalness:m.material.metalness,envMapIntensity:m.material.envMapIntensity,side:m.material.side,transparent:m.material.transparent,opacity:m.material.opacity},record.materialFactors);if(m!==bm)assert.equal(m.geometry.attributes.color,undefined);}
 b.builder.dispose();
});
test('only patterned roughness G changes: all color, bump and unused bytes, neutral tail and budgets stay exact',()=>{
 const a=createTaiheColumnAtlas();assert.equal(a.gpuBytes,1398104);for(let i=0;i<a.colorMips.length;i++){const c=a.colorMips[i],r=a.reliefMips[i],f=base.atlas[i];assert.equal(sha(c.data),f.colorSHA256);assert.equal(sha(r.data.filter((v,k)=>k%4!==1)),f.reliefRBASHA256);
 for(let y=0;y<r.height;y++)for(let x=0;x<r.width;x++){const off=(y*r.width+x)*4,patterned=r.width>=32&&x>=r.width/32&&x<31*r.width/32&&y>=r.height/32&&y<31*r.height/32;
  if(!patterned)assert.equal(r.data[off+1],255);else assert.ok(Math.abs(r.data[off+1]-Math.round(255*(.54+.28*(1-r.data[off]/255))))<=1,'bounded roughness response');}
 }
});
test('gains are bounded in linear space at every color mip and remain explicit visual-trial parameters',async()=>{
 const {TAIHE_COLUMN_RESPONSE:R}=await response();assert.deepEqual(R.linearTarget,[.65,.43,.10]);const b=captureTaiheControl('太和殿'),m=gold(b.group);for(const mip of createTaiheColumnAtlas().colorMips)for(let i=0;i<mip.data.length;i+=4){const c=new THREE.Color().setRGB(mip.data[i]/255,mip.data[i+1]/255,mip.data[i+2]/255,THREE.SRGBColorSpace).toArray();for(let k=0;k<3;k++)assert.ok(c[k]*R.linearTarget[k]<=1);}
 assert.equal(m.material.bumpScale,.0015);b.builder.dispose();
});
test('malformed UV ownership and foreign colors fail before mutating geometry/material',async()=>{
 const {applyTaiheColumnResponse}=await response();for(const kind of ['mixed','range','NaN','missing','color','factor']){const s=await source(),m=gold(s),g=m.geometry;if(kind==='missing')g.deleteAttribute('uv');else if(kind==='mixed'){const ids=[g.index.getX(0),g.index.getX(1),g.index.getX(2)];g.attributes.uv.setXY(ids[0],0,0);g.attributes.uv.setXY(ids[1],.5,.5);}else if(kind==='range')g.attributes.uv.setXY(0,1.5,.5);else if(kind==='NaN')g.attributes.uv.setXY(0,NaN,.5);else if(kind==='color')g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));else m.material.color.r=0;
 const color=g.attributes.color;assert.throws(()=>applyTaiheColumnResponse(m),/Taihe column response/);assert.equal(g.attributes.color,color);assert.equal(m.material.vertexColors,false);}
});
test('selected protected files remain byte-exact after the finite welcome restoration',()=>{for(const [p,h] of Object.entries(base.protectedFiles))assert.equal(sha(p==='main.js'?restoreLoadingWelcomeBytes(read(p)):read(p)),h,p);});

test('repeat installation is idempotent and never compounds or shares gain arrays',async()=>{
 const {applyTaiheColumnResponse}=await response(),b=captureTaiheControl('太和殿'),bm=gold(b.group),first=bm.geometry.attributes.color,bytes=Buffer.from(first.array.buffer).slice();
 assert.equal(applyTaiheColumnResponse(bm),first);assert.deepEqual(Buffer.from(first.array.buffer),bytes);
 const s=await source(),sm=gold(s);installTaiheColumnTextures(s,bm.material);const second=sm.geometry.attributes.color;installTaiheColumnTextures(s,bm.material);assert.equal(sm.geometry.attributes.color,second);assert.notEqual(second.array,first.array);
 sm.material.color.r+=.01;assert.throws(()=>applyTaiheColumnResponse(sm),/owned response changed/);b.builder.dispose();
});
test('no shared factor, alpha, texture type, fetch or shader-hook escape is introduced',async()=>{
 const code=read('src/scene/palace/special/TaiheColumnResponse.js').toString();assert.doesNotMatch(code,/fetch\(|onBeforeCompile|emissive|envMapIntensity|\.color\.(?:set|multiply)|metalness\s*=|roughness\s*=/);assert.match(code,/BufferAttribute\(array,3,false\)/);
 const b=captureTaiheControl('太和殿'),m=gold(b.group).material;assert.equal(m.transparent,false);assert.equal(m.opacity,1);assert.equal(m.map.type,THREE.UnsignedByteType);assert.equal(m.roughnessMap,m.bumpMap);assert.equal(m.map.colorSpace,THREE.SRGBColorSpace);assert.equal(m.bumpMap.colorSpace,THREE.NoColorSpace);b.builder.dispose();
});

test('finite response source delta composes with, never replaces, old protected baselines',async()=>{
 const {restorePreColumnResponseSource:restore}=await import('./lib/taihe-column-response-retention.mjs'),delta=JSON.parse(read('tests/fixtures/taihe-column-response-delta.json'));
 for(const [path,r] of Object.entries(delta.files)){const bytes=read(path);assert.equal(sha(restore(path,bytes)),r.baselineSHA256);assert.throws(()=>restore(path,bytes+'\n'));for(const d of r.deltas)for(const after of ['',d.after+d.after])assert.throws(()=>restore(path,bytes.toString().replace(d.after,after)));}
});

test('a gold material cannot enable an external colored alias; actual S/B references are exclusive',async()=>{
 const {applyTaiheColumnResponse}=await response(),b=captureTaiheControl('太和殿'),bm=gold(b.group);assert.equal(b.group.children.filter(o=>o.isMesh&&o.material===bm.material).length,1);
 const s=await source(),m=gold(s),g=new THREE.BoxGeometry();g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(.2),3));const alias=new THREE.Mesh(g,m.material);s.add(alias);
 assert.throws(()=>applyTaiheColumnResponse(m,s),/shared material/);assert.equal(m.material.vertexColors,false);assert.equal(m.geometry.attributes.color,undefined);assert.equal(alias.geometry.attributes.color.array[0],Math.fround(.2));
 s.remove(alias);applyTaiheColumnResponse(m,s);assert.equal(s.children.filter(o=>o.isMesh&&o.material===m.material).length,1);s.add(alias);assert.throws(()=>applyTaiheColumnResponse(m,s),/shared material/);b.builder.dispose();
});

test('repeat install rejects in-place color or UV mutation without replacing the owned array',async()=>{
 const {applyTaiheColumnResponse}=await response();for(const kind of ['color','uv','normalized','itemSize']){const s=await source(),m=gold(s);applyTaiheColumnResponse(m,s);const c=m.geometry.attributes.color;
 if(kind==='color')c.array[0]+=.125;if(kind==='uv')m.geometry.attributes.uv.setXY(0,NaN,.5);if(kind==='normalized')c.normalized=true;if(kind==='itemSize')c.itemSize=4;
 assert.throws(()=>applyTaiheColumnResponse(m,s),/Taihe column response/);assert.equal(m.geometry.attributes.color,c);}
});

test('actual Float32 S/B gains stay bounded at every mip; neutral base and BRDF factors are exact',async()=>{
 const b=captureTaiheControl('太和殿'),bm=gold(b.group),s=await source(),sm=gold(s),before=sm.material.color.toArray(),rough=sm.material.roughness,metal=sm.material.metalness;installTaiheColumnTextures(s,bm.material);assert.deepEqual(sm.material.color.toArray(),before);assert.equal(sm.material.roughness,rough);assert.equal(sm.material.metalness,metal);
 for(const m of [bm,sm]){const g=m.geometry,{used}=classify(g),ids=[...used],on=ids.find(([,v])=>v)[0],off=ids.find(([,v])=>!v)[0],f=m.material.color.toArray(),a=g.attributes.color.array;
  for(let k=0;k<3;k++){assert.equal(a[off*3+k],1);assert.equal(a[off*3+k]*f[k],f[k]);assert.ok(Math.abs(a[on*3+k]*f[k]-[.65,.43,.10][k])<3e-8);}
  for(const mip of createTaiheColumnAtlas().colorMips)for(let i=0;i<mip.data.length;i+=4){const c=new THREE.Color().setRGB(mip.data[i]/255,mip.data[i+1]/255,mip.data[i+2]/255,THREE.SRGBColorSpace).toArray();for(let k=0;k<3;k++)assert.ok(c[k]*a[on*3+k]*f[k]<=1);}
 }
 b.builder.dispose();
});
test('response source, buffer budget and visual-trial provenance are explicitly identified',()=>{
 const cfg=JSON.parse(read('data/interiors/taihe.json'));assert.equal(cfg.asset.columnResponseSourceSHA256,sha(read('src/scene/palace/special/TaiheColumnResponse.js')));assert.deepEqual(cfg.asset.columnResponseBufferBytes,{S:217752,B:17352});assert.match(cfg.asset.columnResponse,/Visual-trial/);
});
