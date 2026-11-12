// Small actual Xianan gate lifecycle fixtures. No full zone, browser, GC or RSS claim.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
const ROOT=path.resolve(process.env.R262_REPO_ROOT??fileURLToPath(new URL('../',import.meta.url)));
const sourceURL=pathToFileURL(path.join(ROOT,'src/scene/palace/special/XiananContactSources.js')).href;
// Local RED/GREEN only; CI imports the checked-in source with this override unset.
if(process.env.R262_XIANAN_SOURCE)registerHooks({load(url,context,next){return url===sourceURL?{format:'module',source:fs.readFileSync(process.env.R262_XIANAN_SOURCE,'utf8'),shortCircuit:true}:next(url,context);}});
const mod=p=>import(pathToFileURL(path.join(ROOT,p)).href);
await mod('tests/lib/inner-palace-fixture.mjs');
const T=await mod('node_modules/three/build/three.module.js');
const {ZoneBase}=await mod('src/scene/zones/ZoneBase.js');
const {ZoneManager}=await mod('src/scene/zones/ZoneManager.js');
const {CollisionManager}=await mod('src/utils/Collision.js');
const {realTextureLibrary}=await mod('tests/lib/r48-real-texture-library.mjs');
const {getXiananManagedBirth,queryXiananContact,revokeXiananKit}=await import(sourceURL);
const priorWindow=globalThis.window;globalThis.window={location:{search:''}};after(()=>{globalThis.window=priorWindow;});
const cfg=()=>({...JSON.parse(fs.readFileSync(path.join(ROOT,'data/zones/outer-west.json'))),neighbors:[]});
const empty={id:'garden',name:'empty fixture',bounds:{x0:-2000,x1:-1000,z0:-2000,z1:-1000},items:[],neighbors:[]};
const dataFor=b=>({group:b.group,colliders:[...b.kit.colliders],walkables:[...b.kit.walkables],rooms:[],regions:[],mapItems:[],silhouette:null});
class Gate extends ZoneBase{build(){this.buildGate(this.zoneJson.items[30]);this.source=this.kit.root.children.at(-1);this.group=this.kit.finish();return this.data=dataFor(this);}}
class Empty extends ZoneBase{build(){this.group=this.kit.finish();return dataFor(this);}}
const names=['sumeru_band','stone_slab','wood_column'];
const listeners=m=>[...(m._listeners?.dispose??[])];
const snapshot=ms=>ms.map(listeners);
const difference=(before,after)=>after.map((row,i)=>row.filter(fn=>!before[i].includes(fn)));
const counts=rows=>rows.map(r=>r.length);
function removed(ms,rows){for(let i=0;i<ms.length;i++)for(const fn of rows[i])assert.ok(!listeners(ms[i]).includes(fn),'permanent cleanup removes exact generation callback');}
function retained(ms,rows){for(let i=0;i<ms.length;i++)for(const fn of rows[i])assert.ok(listeners(ms[i]).includes(fn),'live/cache/third-party generation callback remains');}
function library(){const lib=realTextureLibrary(),ms=names.map(n=>lib.material(n)),hits=[0,0,0],sentinels=ms.map((m,i)=>{const fn=()=>hits[i]++;m.addEventListener('dispose',fn);return[fn];});return{lib,ms,hits,sentinels};}
function setup(lib,{prebuilt=false,cold=false,Builder=Gate}={}){
 const scene=new T.Scene(),cm=new CollisionManager(),manager=new ZoneManager({reuseInactive:true});
 if(prebuilt||cold)manager.register(empty,Empty);
 if(!cold)manager.register(cfg(),Builder);
 manager.init(scene,lib,cm,prebuilt||cold?{x:-1500,z:-1500}:{x:300.9,z:-240.1});
 if(cold)manager.register(cfg(),Builder);
 return{scene,cm,manager,query(){return queryXiananContact(cm,new T.Vector3(300.9,0,-245),new T.Vector3(300.9,0,-244.8),.5);},entry(){return manager.loaded.get('outer-west');}};
}
const valid=s=>assert.equal(s.query()?.status,'valid');
const invalid=s=>assert.equal(s.query()?.status,'invalid');
function tombstone(entry){assert.throws(()=>getXiananManagedBirth(entry.builder,entry.data),e=>e.code==='XIANAN_UNTRUSTED_ADMISSION');}

test('three actual cold generations return shared material listeners to their initial count',()=>{
 const l=library(),initial=snapshot(l.ms),s=setup(l.lib,{cold:true});
 try{for(let i=0;i<3;i++){
  s.manager.loadZone('outer-west');valid(s);const e=s.entry(),own=difference(initial,snapshot(l.ms));assert.deepEqual(counts(own),[2,2,4]);
  s.manager.unloadZone('outer-west',{retain:false});assert.equal(e.builder.disposed,true);invalid(s);tombstone(e);removed(l.ms,own);assert.deepEqual(snapshot(l.ms),initial);assert.deepEqual(l.hits,[0,0,0]);
 }}finally{s.manager.dispose();l.lib.dispose();}
});

test('actual prebuilt and retained reload keep same birth and exact listeners without duplicate registration',()=>{
 const l=library(),initial=snapshot(l.ms),s=setup(l.lib,{prebuilt:true});
 try{const e=s.manager.prebuilt.get('outer-west'),birth=getXiananManagedBirth(e.builder,e.data),installed=snapshot(l.ms);assert.deepEqual(counts(difference(initial,installed)),[2,2,4]);
  s.manager.loadZone('outer-west');valid(s);assert.ok(s.entry()===e);assert.equal(s.manager.getLoadMetrics().lastLoad.mode,'prebuilt');
  s.manager.unloadZone('outer-west');invalid(s);assert.ok(s.manager.inactiveCache.entries.get('outer-west').entry===e);assert.deepEqual(snapshot(l.ms),installed);
  s.manager.loadZone('outer-west');valid(s);assert.ok(s.entry()===e);assert.ok(getXiananManagedBirth(e.builder,e.data)===birth);assert.deepEqual(snapshot(l.ms),installed);assert.equal(s.manager.getLoadMetrics().lastLoad.mode,'cached');
 }finally{s.manager.dispose();l.lib.dispose();}
});

test('two real generations share materials but permanent cleanup removes only its own exact callbacks',()=>{
 const l=library(),initial=snapshot(l.ms),a=setup(l.lib),afterA=snapshot(l.ms),ownA=difference(initial,afterA),b=setup(l.lib),ownB=difference(afterA,snapshot(l.ms));
 try{valid(a);valid(b);assert.deepEqual(counts(ownB),[2,2,4]);const ae=a.entry();a.manager.unloadZone('outer-west',{retain:false});removed(l.ms,ownA);retained(l.ms,ownB);retained(l.ms,l.sentinels);valid(b);tombstone(ae);assert.deepEqual(l.hits,[0,0,0]);
  b.manager.unloadZone('outer-west',{retain:false});removed(l.ms,ownB);assert.deepEqual(snapshot(l.ms),initial);
 }finally{a.manager.dispose();b.manager.dispose();l.lib.dispose();}
});

for(const cached of[false,true])test(`real material dispose still revokes ${cached?'cached':'active'} certificate until permanent cleanup`,()=>{
 const l=library(),before=snapshot(l.ms),s=setup(l.lib),own=difference(before,snapshot(l.ms)),e=s.entry();
 try{if(cached)s.manager.unloadZone('outer-west');l.ms[1].dispose();assert.deepEqual(l.hits,[0,1,0]);invalid(s);tombstone(e);retained(l.ms,own);
  if(cached){assert.throws(()=>s.manager.loadZone('outer-west'),x=>x.code==='XIANAN_UNTRUSTED_ADMISSION');assert.equal(e.builder.disposed,true);}
  else s.manager.unloadZone('outer-west',{retain:false});
  removed(l.ms,own);tombstone(e);s.manager.loadZone('outer-west');assert.ok(s.entry().builder!==e.builder);valid(s);
 }finally{s.manager.dispose();l.lib.dispose();}
});

for(const change of['source-parent','source-geometry','finished-geometry'])for(const cached of[false,true])test(`${change} tamper in ${cached?'cache':'active'} remains fail-closed even after restored values`,()=>{
 const l=library(),before=snapshot(l.ms),s=setup(l.lib),e=s.entry(),own=difference(before,snapshot(l.ms));
 try{if(cached)s.manager.unloadZone('outer-west');let restore;
  if(change==='source-parent'){const frame=e.builder.source,parent=frame.parent;parent.remove(frame);restore=()=>parent.add(frame);}
  else{const g=change==='source-geometry'?e.builder.source.children[0].geometry:e.data.group.children.find(m=>m.isMesh&&names.some(n=>m.material.name===n+'_material')).geometry,a=g.attributes.position,old=a.getX(0);a.setX(0,old+.25);restore=()=>a.setX(0,old);}
  // Managed birth reads the actual same proof even while no active row exists.
  tombstone(e);
  // Observe tampering through the real query/admission before restoring values.
  if(cached){assert.throws(()=>s.manager.loadZone('outer-west'),x=>x.code==='XIANAN_UNTRUSTED_ADMISSION');restore();}
  else{invalid(s);restore();invalid(s);s.manager.unloadZone('outer-west',{retain:false});}
  removed(l.ms,own);tombstone(e);assert.throws(()=>e.builder.buildGate(e.builder.zoneJson.items[30]));
  s.manager.loadZone('outer-west');valid(s);
 }finally{s.manager.dispose();l.lib.dispose();}
});

test('direct permanent revoke is idempotent and preserves managed tombstones and third-party listeners',()=>{
 const l=library(),before=snapshot(l.ms),s=setup(l.lib),e=s.entry(),own=difference(before,snapshot(l.ms));
 try{valid(s);revokeXiananKit(e.builder.kit);invalid(s);tombstone(e);removed(l.ms,own);retained(l.ms,l.sentinels);revokeXiananKit(e.builder.kit);tombstone(e);assert.deepEqual(snapshot(l.ms),before);assert.deepEqual(l.hits,[0,0,0]);revokeXiananKit({});
 }finally{s.manager.dispose();l.lib.dispose();}
});

test('registered before finish with no material watches safely revokes and cannot be readmitted',()=>{
 const l=library(),before=snapshot(l.ms),b=new Gate(l.lib,cfg());
 try{b.buildGate(b.zoneJson.items[30]);const data=dataFor(b);revokeXiananKit(b.kit);revokeXiananKit(b.kit);assert.deepEqual(snapshot(l.ms),before);tombstone({builder:b,data});assert.throws(()=>b.buildGate(b.zoneJson.items[30]));b.kit.dispose();}
 finally{l.lib.dispose();}
});

for(const afterAdd of[false,true])test(`actual cold rollback cleans partially installed material listeners when add throws ${afterAdd?'after':'before'} registration`,()=>{
 const l=library(),before=snapshot(l.ms),s=setup(l.lib,{cold:true}),sentinel=Error('expected partial finalize failure'),originals=l.ms.map(m=>m.addEventListener);let count=0,b;
 class Partial extends Gate{constructor(...args){super(...args);b=this;}}
 s.manager.zones.get('outer-west').BuilderClass=Partial;
 for(const [i,m]of l.ms.entries())m.addEventListener=function(type,fn){if(type==='dispose'&&++count===3){if(afterAdd)originals[i].call(this,type,fn);throw sentinel;}return originals[i].call(this,type,fn);};
 try{assert.throws(()=>s.manager.loadZone('outer-west'),e=>e===sentinel);assert.equal(b.disposed,true);assert.equal(s.manager.loaded.has('outer-west'),false);assert.equal(s.manager.inactiveCache.entries.size,0);assert.deepEqual(snapshot(l.ms),before);assert.deepEqual(l.hits,[0,0,0]);tombstone({builder:b,data:dataFor(b)});}
 finally{for(const m of l.ms)delete m.addEventListener;s.manager.dispose();l.lib.dispose();}
});

test('permanent listener cleanup precedes later geometry dispose error without hiding the original error',()=>{
 const l=library(),before=snapshot(l.ms),s=setup(l.lib),e=s.entry(),own=difference(before,snapshot(l.ms)),g=e.data.group.children.find(o=>o.isMesh).geometry,sentinel=Error('expected later geometry failure'),fail=()=>{throw sentinel;};g.addEventListener('dispose',fail);
 try{assert.throws(()=>e.builder.kit.dispose(e.data.group),x=>x===sentinel);invalid(s);tombstone(e);removed(l.ms,own);retained(l.ms,l.sentinels);assert.deepEqual(l.hits,[0,0,0]);}
 finally{g.removeEventListener('dispose',fail);s.manager.dispose();l.lib.dispose();}
});

test('material dispatch snapshot allows reentrant kit disposal without removing another generation',()=>{
 const l=library();let a;const reenter=()=>a.entry().builder.kit.dispose();l.ms[1].addEventListener('dispose',reenter);const before=snapshot(l.ms);a=setup(l.lib);const afterA=snapshot(l.ms),ownA=difference(before,afterA),b=setup(l.lib),ownB=difference(afterA,snapshot(l.ms));
 try{l.ms[1].dispose();invalid(a);invalid(b);removed(l.ms,ownA);retained(l.ms,ownB);retained(l.ms,l.sentinels);assert.ok(listeners(l.ms[1]).includes(reenter));assert.deepEqual(l.hits,[0,1,0]);tombstone(a.entry());tombstone(b.entry());revokeXiananKit(b.entry().builder.kit);removed(l.ms,ownB);}
 finally{l.ms[1].removeEventListener('dispose',reenter);a.manager.dispose();b.manager.dispose();l.lib.dispose();}
});

for(const mode of['cache-release','manager-dispose'])test(`${mode} delegates permanent cleanup while retained cache itself keeps watches`,()=>{
 const l=library(),before=snapshot(l.ms),s=setup(l.lib),e=s.entry(),own=difference(before,snapshot(l.ms));
 try{s.manager.unloadZone('outer-west');retained(l.ms,own);assert.ok(s.manager.inactiveCache.entries.has('outer-west'));if(mode==='cache-release')assert.equal(s.manager.inactiveCache.release('outer-west'),true);else s.manager.dispose();assert.equal(e.builder.disposed,true);removed(l.ms,own);tombstone(e);retained(l.ms,l.sentinels);assert.deepEqual(l.hits,[0,0,0]);}
 finally{s.manager.dispose();l.lib.dispose();}
});
