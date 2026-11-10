// Focused CPU fixture only. No complete zone, browser, forced GC or RSS claim.
// Regression: only successful fresh cold builds release before admission; cache paths do not.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const ROOT=path.resolve(process.env.R262_REPO_ROOT??fileURLToPath(new URL('../',import.meta.url)));
const managerURL=pathToFileURL(path.join(ROOT,'src/scene/zones/ZoneManager.js')).href;
// Local RED/GREEN may supply only the reviewed candidate at the original module
// identity; CI leaves this unset and imports the actual checked-in manager.
if(process.env.R262_ZONE_MANAGER_SOURCE)registerHooks({load(url,context,next){
  return url===managerURL?{format:'module',source:fs.readFileSync(process.env.R262_ZONE_MANAGER_SOURCE,'utf8'),shortCircuit:true}:next(url,context);
}});
const mod=p=>import(pathToFileURL(path.join(ROOT,p)).href);
await mod('tests/lib/inner-palace-fixture.mjs');
const T=await mod('node_modules/three/build/three.module.js');
const {ZoneBase}=await mod('src/scene/zones/ZoneBase.js');
const {ZoneManager}=await import(managerURL);
const {CollisionManager}=await mod('src/utils/Collision.js');
const {Environment}=await mod('src/scene/Environment.js');
const {realTextureLibrary}=await mod('tests/lib/r48-real-texture-library.mjs');
const {getXiananManagedBirth,queryXiananContact}=await mod('src/scene/palace/special/XiananContactSources.js');
const {createTriangleTemplate,triangleInstance,triangleBodyIntersects}=await mod('src/utils/TriangleSupport.js');
const {proof,proofCurrent}=await mod('src/utils/SceneSourceProof.js');
const {xiananGroundCovered}=await mod('src/controls/XiananGroundWitness.js');
const previousWindow=globalThis.window;globalThis.window={location:{search:''}};
after(()=>{globalThis.window=previousWindow;});
const dataFor=b=>({group:b.group,colliders:[...b.kit.colliders],walkables:[...b.kit.walkables],regions:[],rooms:[],mapItems:[],silhouette:null});
const digest=g=>{g.updateMatrixWorld(true);const h=createHash('sha256');g.traverse(o=>{h.update(JSON.stringify([o.uuid,o.type,o.name,o.parent?.uuid,o.visible,o.matrixWorld.elements,o.userData,o.material?.uuid]));if(o.geometry){for(const a of Object.values(o.geometry.attributes))h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));if(o.geometry.index)h.update(Buffer.from(o.geometry.index.array.buffer));}});return h.digest('hex')};
const tiny={id:'axis-courts',name:'fixture',bounds:{x0:0,x1:2,z0:0,z1:2},items:[],neighbors:[]};
const nextZone={id:'east-six',name:'fixture-next',bounds:{x0:9000,x1:9001,z0:9000,z1:9001},items:[],neighbors:[]};

const {buildDafotangMainPlaque}=await mod('src/scene/palace/special/DafotangMainPlaque.js');
function smallManager({reuseInactive=false}={}){
 const lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),manager=new ZoneManager({reuseInactive});
 class Empty extends ZoneBase{build(){this.group=this.kit.finish();return dataFor(this);}}
 manager.register({id:'garden',name:'empty setup',bounds:{x0:-2000,x1:-1000,z0:-2000,z1:-1000},items:[],neighbors:[]},Empty);
 manager.init(scene,lib,cm,{x:-1500,z:-1500});manager.unloadZone('garden',{retain:false});return{lib,scene,cm,manager,dispose(){manager.dispose();lib.dispose();}};
}
class Small extends ZoneBase{
 build(){this.releases=0;this.raw=this.kit.frame(0,0);this.raw.add(new T.Mesh(new T.BoxGeometry(1,1,1),this.library.material('stone_slab')));this.group=this.kit.finish();return this.data=dataFor(this);}
 releaseConstructionReferences(){this.releases++;super.releaseConstructionReferences();}
}

test('actual fresh and repeated cold admissions selectively release real Xianan sources without disposal',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(ROOT,'data/zones/outer-west.json'))),lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),manager=new ZoneManager();let startup=true,builds=0;
 class Gate extends ZoneBase{
  build(){this.number=++builds;this.releases=0;this.raw=this.kit.frame(500,500);for(let i=0;i<16;i++)this.raw.add(new T.Mesh(new T.BoxGeometry(1,1,1),lib.material('stone_slab')));
   this.leaf=new T.Mesh(new T.BoxGeometry(.2,.2,.2),lib.material('stone_slab'));this.leaf.userData.noMerge=true;this.raw.add(this.leaf);
   this.buildGate(this.zoneJson.items[30]);this.source=this.kit.root.children.at(-1);this.group=this.kit.finish();this.data=dataFor(this);this.disposes=0;
   const resources=new Set([...this.kit.owned,...(this.kit.ownedTextures??[])]);for(const root of [this.kit.root,this.group])root.traverse(o=>{if(o.geometry)resources.add(o.geometry);});for(const r of resources)r.addEventListener('dispose',()=>this.disposes++);
   return this.data;
  }
  releaseConstructionReferences(){this.releases++;if(startup)return super.releaseConstructionReferences();
   assert.equal(this.disposed,undefined);assert.ok(this.group===this.data.group&&this.group!==this.kit.root);assert.equal(manager.loaded.has('outer-west'),false);assert.equal(this.group.parent,null);
   const before=digest(this.group),cert=proof(this.group),birth=getXiananManagedBirth(this,this.data),rows=JSON.stringify([this.data.colliders,this.data.walkables,this.data.rooms,this.data.regions,this.data.mapItems]);assert.ok(birth);
   super.releaseConstructionReferences();
   assert.equal(digest(this.group),before);assert.equal(proofCurrent(cert),true);assert.equal(getXiananManagedBirth(this,this.data),birth);assert.equal(JSON.stringify([this.data.colliders,this.data.walkables,this.data.rooms,this.data.regions,this.data.mapItems]),rows);
   assert.ok(this.kit.root.children.length===1&&this.kit.root.children[0]===this.source);assert.equal(this.raw.parent,null);assert.ok(this.leaf.parent===this.group);assert.equal(this.kit.plaques.length,0);assert.equal(this.disposes,0);
  }
 }
 manager.register({...config,neighbors:[]},Gate);
 const query=()=>queryXiananContact(cm,new T.Vector3(300.9,0,-245),new T.Vector3(300.9,0,-244.8),.5);
 try{manager.init(scene,lib,cm,{x:300.9,z:-240.1});startup=false;const first=manager.loaded.get('outer-west');assert.equal(first.builder.releases,1);
  for(let i=0;i<2;i++){manager.unloadZone('outer-west',{retain:false});assert.equal(query()?.status,'invalid');manager.loadZone('outer-west');const entry=manager.loaded.get('outer-west');assert.equal(entry.builder.releases,1,'cold completion must release exactly once');assert.equal(entry.builder.raw.parent,null);assert.equal(entry.builder.disposes,0);assert.equal(query()?.status,'valid');assert.equal(manager.getLoadMetrics().lastLoad.mode,'cold');}
  const last=manager.loaded.get('outer-west');last.builder.kit.root.remove(last.builder.source);assert.equal(query()?.status,'invalid','removing a retained real source still revokes admission');
  cm.removeByTag('outer-west');manager.loaded.delete('outer-west');last.builder.dispose();
 }finally{manager.dispose();lib.dispose();}
});

test('successful release happens before scene registration, notification and next build',()=>{
 const s=smallManager(),events=[];let previous;
 class First extends Small{build(){events.push('build-first');previous=this;return super.build();}releaseConstructionReferences(){events.push('release-first');assert.equal(s.cm.colliders.length,0);assert.equal(s.manager.loaded.size,0);super.releaseConstructionReferences();}}
 class Next extends Small{build(){assert.equal(previous.raw.parent,null,'next cold build must not retain prior unused source root');events.push('build-next');return super.build();}}
 s.manager.register(tiny,First);s.manager.register(nextZone,Next);s.manager.onLoad=id=>events.push('notify-'+id);
 try{s.manager.loadZone(tiny.id);s.manager.loadZone(nextZone.id);assert.deepEqual(events,['build-first','release-first','notify-axis-courts','build-next','notify-east-six']);}finally{s.dispose();}
});

test('prebuilt and actual inactive-cache reuse add no release call',()=>{
 const s=smallManager({reuseInactive:true});s.manager.register(tiny,Small);const config=s.manager.zones.get(tiny.id),builder=new Small(s.lib,config),data=builder.build();
 s.manager.prebuilt.set(tiny.id,{builder,data,config,detailQuality:s.manager.detailQualityFor(tiny.id)});
 try{s.manager.loadZone(tiny.id);assert.equal(builder.releases,0);const entry=s.manager.loaded.get(tiny.id);s.manager.unloadZone(tiny.id);assert.equal(builder.releases,1,'existing unload cache release remains');assert.equal(s.manager.inactiveCache.entries.size,1);s.manager.loadZone(tiny.id);assert.ok(s.manager.loaded.get(tiny.id)===entry);assert.equal(builder.releases,1);assert.equal(s.manager.getLoadMetrics().lastLoad.mode,'cached');}finally{s.dispose();}
});

for(const missing of ['data','builder'])test(`incomplete cached ${missing} never opts into cold release, including rollback`,()=>{
 const s=smallManager();let releases=0,last;
 class BrokenCache extends Small{constructor(...a){super(...a);last=this;}build(){if(missing==='data')throw Error('expected cached build failure');return super.build();}releaseConstructionReferences(){releases++;super.releaseConstructionReferences();}}
 s.manager.register(tiny,BrokenCache);const config=s.manager.zones.get(tiny.id),cached={config,detailQuality:s.manager.detailQualityFor(tiny.id)};
 if(missing==='data')cached.builder=new BrokenCache(s.lib,config);else{const b=new Small(s.lib,config);cached.data=b.build();s.manager.onLoad=()=>{throw Error('expected cached notify failure');};s.extra=b;}
 s.manager.prebuilt.set(tiny.id,cached);
 try{assert.throws(()=>s.manager.loadZone(tiny.id),/expected cached/);assert.equal(releases,0);assert.equal(s.manager.loaded.size,0);assert.equal(last.disposed,true);}finally{s.extra?.dispose();s.dispose();}
});

for(const failure of ['build','release','scene','colliders','walkables','notify'])test(`${failure} error retains existing cold rollback and original error`,()=>{
 const s=smallManager(),expected=Error('expected '+failure);let last,releases=0,notify=0;
 class Broken extends Small{constructor(...a){super(...a);last=this;}build(){if(failure==='build')throw expected;return super.build();}releaseConstructionReferences(){releases++;if(failure==='release')throw expected;super.releaseConstructionReferences();}}
 s.manager.register(tiny,Broken);s.manager.buildTimes.set(tiny.id,123);
 const originals={add:s.scene.add,colliders:s.cm.addColliders,walkables:s.cm.addWalkables};
 if(failure==='scene')s.scene.add=()=>{throw expected;};if(failure==='colliders')s.cm.addColliders=()=>{throw expected;};if(failure==='walkables')s.cm.addWalkables=()=>{throw expected;};s.manager.onLoad=()=>{notify++;if(failure==='notify')throw expected;};
 try{assert.throws(()=>s.manager.loadZone(tiny.id),e=>e===expected);assert.equal(releases,failure==='build'?0:1);assert.equal(last.disposed,true);assert.equal(s.manager.loaded.size,0);assert.equal(s.manager.prebuilt.size,0);assert.equal(s.cm.colliders.length,0);assert.equal(s.cm.walkables.length,0);assert.equal(s.manager.buildTimes.get(tiny.id),123);assert.equal(notify,failure==='notify'?1:0);const metric=s.manager.getLoadMetrics().lastLoad;assert.equal(metric.outcome,'error');assert.equal(metric.failedPhase,failure==='release'?null:failure);}
 finally{s.scene.add=originals.add;s.cm.addColliders=originals.colliders;s.cm.addWalkables=originals.walkables;s.dispose();}
});

test('optional release method remains optional on a successful cold builder',()=>{
 const s=smallManager();class Optional extends Small{constructor(...a){super(...a);this.releaseConstructionReferences=undefined;}}s.manager.register(tiny,Optional);
 try{s.manager.loadZone(tiny.id);assert.equal(s.manager.loaded.size,1);assert.equal(s.manager.getLoadMetrics().lastLoad.outcome,'ok');}finally{s.dispose();}
});

function plaqueHost(builder){
 const kit=builder.kit,f=kit.frame(221.9,241.1),old=builder.library.material('stone_slab');kit.root.name='outer-west';
 const g={id:'place-outer-west-6cae88b6a2',w:45.7,d:16.2,y:.9,h:7.84,bays:7,front:-8.1,rear:8.1,inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit'},historicLayout:{id:'dafotang-historic-spatial-fit-v1'},eastCabinetsFit:{id:'dafotang-east-cabinets-source-fit-v1'}};f.userData.structure=g;
 const box=(name,w,h,d,x,y,z,parent=f)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),old);m.position.set(x,y,z);m.name=name;parent.add(m);return m;};
 const shrine=new T.Group();shrine.name=g.historicLayout.id;shrine.userData.dafotangHistoricLayout=g.historicLayout;f.add(shrine);
 box('upper-front-entablature',5,.22,.28,0,6.34,4.55,shrine).userData.dafotangLayoutRole='upper-front-entablature';box('dafotang-plain-ceiling',45.7,.08,16.2,0,8.24,0);
 for(let k=1;k<7;k++)box('dafotang-transverse-ceiling-frame',.2,.26,16.2,-22.85+k*45.7/7,8.04,0);for(const z of[-2.7,2.7])box('dafotang-longitudinal-ceiling-frame',45.7,.24,.18,0,8.02,z);
 const calls=[],imageLoader={load(url,onLoad,onProgress,onError){calls.push({url,onLoad,onError});return{};}};
 return{f,calls,out:buildDafotangMainPlaque({kit,f,g,p:{id:g.id,key:'dafotang',zone:'outer-west'}},{imageLoader,baseURL:'/forbidden-city-3d/'})};
}
for(const delivery of ['success','failure','unload-first'])test(`cold release preserves real plaque leaf and async texture ownership: ${delivery}`,()=>{
 const s=smallManager();let b;
 class Plaque extends ZoneBase{build(){b=this;this.releases=0;Object.assign(this,plaqueHost(this));this.group=this.kit.finish();this.data=dataFor(this);this.disposes=0;for(const r of [...this.kit.owned,...this.kit.ownedTextures,...this.out.meshes.map(m=>m.geometry)])r.addEventListener('dispose',()=>this.disposes++);return this.data;}releaseConstructionReferences(){this.releases++;const before=digest(this.group);super.releaseConstructionReferences();assert.equal(digest(this.group),before);}}
 s.manager.register({...tiny,id:'outer-west'},Plaque);
 try{s.manager.loadZone('outer-west');assert.equal(b.releases,1);assert.equal(b.f.parent,null);assert.equal(b.disposes,0);const leaves=[...b.out.meshes],texture=b.out.texture;assert.ok(leaves.every(m=>m.parent===b.group));assert.ok(b.kit.ownedTextures.includes(texture));assert.equal(b.out.state.status,'loading');
  if(delivery==='unload-first')s.manager.unloadZone('outer-west',{retain:false});
  if(delivery==='failure')b.calls[0].onError();else b.calls[0].onLoad({complete:true,width:768,height:286});
  assert.equal(b.out.state.status,delivery==='success'?'ready':delivery==='failure'?'failed':'disposed');
  if(delivery==='success'){assert.ok(leaves.every(m=>m.parent===b.group&&m.visible&&m.material.visible));assert.ok(leaves.some(m=>m.material.map===texture));}
  else assert.ok(leaves.every(m=>!m.visible));
  if(delivery!=='unload-first')s.manager.unloadZone('outer-west',{retain:false});let closed=0;b.calls[0].onLoad({complete:true,width:768,height:286,close(){closed++;}});assert.equal(closed,1);assert.equal(b.out.state.status,'disposed');assert.ok(leaves.every(m=>!m.visible));
 }finally{s.dispose();}
});

test('bounded existing zone log observer preserves missing/error evidence and never reads console objects',()=>{
 const source=fs.readFileSync(process.env.R262_SMOKE_SOURCE??path.join(ROOT,'tests/production-smoke.mjs'),'utf8');
 const line=source.split('\n').find(line=>line.trim().startsWith("page.on('console',m=>{const text=m.text();"));
 assert.ok(line,'separate read-only zone completion listener required');
 const callback=line.trim().slice("page.on('console',".length,-2);
 const result={zoneLifecycle:[],status:'FAIL',console:[]};let flushed=0;
 const observe=Function('result','checkpoint','stage','return '+callback)(result,()=>flushed++,'test-stage');
 const message=(text,type='log')=>({text:()=>text,type:()=>type,args(){throw Error('must not read console object arguments');}});
 observe(message('unrelated'));observe(message('[ZoneManager] 加载区域 outer-west','error'));
 assert.equal(result.zoneLifecycle.length,0);assert.equal(flushed,0);assert.equal(result.status,'FAIL');
 for(let i=0;i<300;i++)observe(message('[ZoneManager] '+(i%2?'卸载区域 ':'加载区域 ')+'outer-west '+'.'.repeat(900)));
 assert.equal(result.zoneLifecycle.length,256);assert.equal(flushed,256);assert.equal(result.status,'FAIL');assert.deepEqual(result.console,[]);
 for(const row of result.zoneLifecycle){assert.equal(row.stage,'test-stage');assert.ok(Number.isFinite(Date.parse(row.at)));assert.equal(row.text.length,512);}
});

test('cold-return markers add observations at existing boundaries, without replacing route gates',()=>{
 const source=fs.readFileSync(process.env.R262_SMOKE_SOURCE??path.join(ROOT,'tests/production-smoke.mjs'),'utf8');
 for(const text of ['cold return travel requested','cold return response and click completed','cold return loaded HUD confirmed'])assert.equal(source.split("mark('"+text+"');").length-1,1);
 const region=source.slice(source.indexOf('const countBeforeReturn='),source.indexOf('result.returnNativeDecode='));
 const requested=region.indexOf("mark('cold return travel requested')"),travel=region.indexOf('const [returned]=await Promise.all'),completed=region.indexOf("mark('cold return response and click completed')"),bytes=region.indexOf('check(plaqueResponses.length>countBeforeReturn'),hud=region.indexOf('await page.waitForFunction'),confirmed=region.indexOf("mark('cold return loaded HUD confirmed')");
 assert.ok(requested>=0&&requested<travel&&travel<completed&&completed<bytes&&bytes<hud&&hud<confirmed);
});
