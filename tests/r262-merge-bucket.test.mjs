// Tiny CPU fixtures only. Captured bucket/clone references are intentionally held
// by tests: these observations are NOT garbage-collection or RSS measurements.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {registerHooks,createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
const ROOT=path.resolve(process.env.R262_REPO_ROOT??fileURLToPath(new URL('../',import.meta.url))),require=createRequire(path.join(ROOT,'package.json'));
const file=path.join(ROOT,'src/utils/MergeUtils.js'),url=pathToFileURL(file).href;
const hash=s=>createHash('sha256').update(s).digest('hex');
const BASE_HASH='c05e4cb0447433b83c7d14c0c5996e96a5b080fa474f667a87c93d6f3f1011c6';
const working=fs.readFileSync(process.env.R262_MERGE_SOURCE??file,'utf8');
// Recover only the exact pinned old bytes, not a moving HEAD^ baseline. The
// unchanged SHA rejects any other edit and works on later unchanged descendants.
const baselineSource=hash(working)===BASE_HASH?working:working.replace('    geometries.length = 0;\n','');
assert.equal(hash(baselineSource),BASE_HASH,'fixed pre-change baseline is not replaced by candidate');
if(process.env.R262_MERGE_SOURCE)registerHooks({load(u,c,next){return u===url?{format:'module',source:fs.readFileSync(process.env.R262_MERGE_SOURCE,'utf8'),shortCircuit:true}:next(u,c);}});
const threeURL=pathToFileURL(path.join(ROOT,'node_modules/three/build/three.module.js')).href;
const baselineResolved=baselineSource.replace(/from '([^']+)'/g,(_,s)=>"from '"+(s==='three'?threeURL:pathToFileURL(require.resolve(s)).href)+"'");
const {mergeByMaterial:oldMerge}=await import('data:text/javascript;base64,'+Buffer.from(baselineResolved).toString('base64'));
const {mergeByMaterial:merge}=await import(url);
const mod=p=>import(pathToFileURL(path.join(ROOT,p)).href);
const T=await import(threeURL);
const bytes=a=>Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength).toString('hex');
function geometry(g){return{attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{array:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,bytes:bytes(a)}])),index:g.index?bytes(g.index):null,morph:Object.keys(g.morphAttributes),box:g.boundingBox?[g.boundingBox.min.toArray(),g.boundingBox.max.toArray()]:null,sphere:g.boundingSphere?[g.boundingSphere.center.toArray(),g.boundingSphere.radius]:null};}
function output(group){return{name:group.name,position:group.position.toArray(),quaternion:group.quaternion.toArray(),scale:group.scale.toArray(),visible:group.visible,userData:group.userData,children:group.children.map(m=>({name:m.name,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,userData:m.userData,material:m.material?.uuid,geometry:m.geometry?geometry(m.geometry):null}))};}
function scene(materials,{nullMerge=false,shouan=false}={}){
 const root=new T.Group();root.name='fixture-root';root.position.set(2,3,4);root.rotation.y=.2;root.scale.set(1.2,.8,1.1);root.userData={fixture:true};const sources=[];
 for(let i=0;i<4;i++){
  let g=new T.BoxGeometry(1+i*.1,1,1);if(i%2)g=g.toNonIndexed();
  if(i===1){g.deleteAttribute('normal');g.deleteAttribute('uv');}
  g.setAttribute('discarded',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));
  g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(.25+i*.1),3));
  g.morphAttributes.position=[g.attributes.position.clone()];
  if(nullMerge){if(g.index)g=g.toNonIndexed();if(i===1)g.setAttribute('position',new T.BufferAttribute(new Float64Array(g.attributes.position.array),3));}
  const m=new T.Mesh(g,materials[Math.floor(i/2)]);m.name='source-'+i;m.position.set(i,.1*i,-i);m.rotation.z=.13*i;if(i===2)m.scale.x=-1;m.castShadow=i%2===0;m.receiveShadow=i%2===1;root.add(m);sources.push(m);
 }
 const keep=new T.Mesh(new T.BoxGeometry(.1,.2,.3),materials[0]);keep.name='kept';keep.userData.noMerge=true;keep.position.set(3,4,5);root.add(keep);
 return{root,sources,keep};
}
function observe(s,materials,run,{throwAt=-1,reenter=false}={}){
 const buckets=[],clones=[],events=[],states=[],reads=[],sourceBefore=s.sources.map(m=>geometry(m.geometry)),originalSet=Map.prototype.set,restores=[];const sentinel=Error('expected temporary dispose');let reentered=false;
 Map.prototype.set=function(k,v){if(materials.includes(v?.material)&&Array.isArray(v?.geometries))buckets.push(v);return originalSet.call(this,k,v);};
 for(const [i,m]of s.sources.entries()){
  const key=m.geometry.index?'toNonIndexed':'clone',original=m.geometry[key];restores.push(()=>{m.geometry[key]=original;});
  m.geometry[key]=function(...a){const clone=original.apply(this,a);clones.push(clone);clone.addEventListener('dispose',()=>{events.push('temp-'+i);states.push(buckets.map(b=>b.geometries.length));reads.push(geometry(clone));if(reenter&&!reentered){reentered=true;const inner=new T.Group();inner.add(new T.Mesh(new T.BoxGeometry(.1,.1,.1),new T.MeshStandardMaterial()));const out=merge(inner);assert.equal(out.children.length,1);out.children[0].geometry.dispose();out.children[0].material.dispose();}if(i===throwAt)throw sentinel;});return clone;};
  m.geometry.addEventListener('dispose',()=>events.push('source-'+i));
 }
 s.keep.addEventListener('removed',()=>events.push('keep-moved'));
 let result,error;try{result=run(s.root);}catch(e){error=e;}finally{Map.prototype.set=originalSet;for(const restore of restores)restore();}
 return{buckets,clones,events,states,reads,result,error,sentinel,sourceBefore,sourceAfter:s.sources.map(m=>geometry(m.geometry))};
}
function materials(){return[new T.MeshStandardMaterial({name:'first'}),new T.MeshStandardMaterial({name:'second'})];}
function cleanup(s,observed,mats){observed?.result?.traverse(o=>o.geometry?.dispose());s.root.traverse(o=>o.geometry?.dispose());mats.forEach(m=>m.dispose());}

test('each completed bucket is empty before the next bucket disposal; current callback sees intact array',()=>{
 const mats=materials(),s=scene(mats),o=observe(s,mats,merge);
 try{assert.equal(o.error,undefined);assert.deepEqual(o.states,[[2,2],[2,2],[0,2],[0,2]]);assert.deepEqual(o.buckets.map(b=>b.geometries.length),[0,0]);assert.deepEqual(o.events,['temp-0','temp-1','temp-2','temp-3','keep-moved','source-0','source-1','source-2','source-3']);assert.ok(o.result.children.includes(s.keep));}finally{cleanup(s,o,mats);}
});

test('fixed baseline and candidate share the actual Three ESM constructor identities',()=>{
 const mats=materials(),a=scene(mats),b=scene(mats),old=observe(a,mats,oldMerge),current=observe(b,mats,merge);
 try{assert.equal(old.error,undefined);assert.equal(current.error,undefined);
  for(const group of[old.result,current.result]){
   assert.ok(group.constructor===T.Group,'baseline and candidate Group must be the same actual ESM class');
   assert.ok(group.matrix.constructor===T.Matrix4,'matrix identity must also match actual ESM Three');
   assert.ok(group.children.every(m=>m.constructor===T.Mesh),'baseline and candidate Mesh must share actual ESM class');
  }
 }finally{cleanup(a,old,mats);cleanup(b,current,[]);}
});

test('fixed original and candidate preserve output bytes, material/keep identity, mirror, attributes and Shouan colors',()=>{
 for(const shouan of [false,true]){
  const mats=materials();if(shouan){mats[1].name='shouan_entry_flush_photo_fit';mats[1].vertexColors=true;mats[1].userData.shouanEntryVertexColors=true;}
  const a=scene(mats),b=scene(mats),old=observe(a,mats,oldMerge),current=observe(b,mats,merge);
  try{assert.equal(old.error,undefined);assert.equal(current.error,undefined);assert.deepEqual(output(current.result),output(old.result));assert.deepEqual(current.events,old.events);assert.deepEqual(current.sourceAfter,current.sourceBefore);assert.deepEqual(old.sourceAfter,old.sourceBefore);
   assert.ok(current.result.children.includes(b.keep));assert.ok(old.result.children.includes(a.keep));for(let i=0;i<2;i++){assert.ok(current.result.children[i].material===mats[i]);assert.equal('discarded'in current.result.children[i].geometry.attributes,false);assert.equal('color'in current.result.children[i].geometry.attributes,shouan&&i===1);}
   assert.ok(current.clones.every(clone=>Object.values(clone.attributes).every(a=>!current.result.children.slice(0,2).some(m=>Object.values(m.geometry.attributes).some(b=>b.array.buffer===a.array.buffer)))));
  }finally{cleanup(a,old,mats);cleanup(b,current,[]);}
 }
});

for(const at of [1,2])test(`temporary dispose exception ${at} preserves original error and public side-effect order`,()=>{
 const mats=materials(),a=scene(mats),b=scene(mats),old=observe(a,mats,oldMerge,{throwAt:at}),current=observe(b,mats,merge,{throwAt:at});
 try{assert.ok(old.error===old.sentinel);assert.ok(current.error===current.sentinel);assert.deepEqual(current.events,old.events);assert.ok(a.keep.parent===a.root&&b.keep.parent===b.root);assert.deepEqual(current.buckets.map(b=>b.geometries.length),at===1?[2,2]:[0,2]);assert.deepEqual(old.buckets.map(b=>b.geometries.length),[2,2]);assert.deepEqual(current.sourceAfter,current.sourceBefore);}finally{cleanup(a,old,mats);cleanup(b,current,[]);}
});

test('real null merge preserves original errors/disposals and drops only completed private list',()=>{
 const mats=materials(),a=scene(mats,{nullMerge:true}),b=scene(mats,{nullMerge:true});const original=console.error,errors=[];let old,current;
 try{console.error=(...args)=>errors.push(args.join(' '));old=observe(a,mats,oldMerge);const prior=errors.splice(0);current=observe(b,mats,merge);assert.equal(old.error,undefined);assert.equal(current.error,undefined);assert.deepEqual(errors,prior);assert.equal(errors.length,2);assert.deepEqual(output(current.result),output(old.result));assert.equal(current.result.children.filter(x=>x.material===mats[0]&&x!==b.keep).length,0);assert.deepEqual(current.events,old.events);assert.deepEqual(current.buckets.map(b=>b.geometries.length),[0,0]);}
 finally{console.error=original;cleanup(a,old,mats);cleanup(b,current,[]);}
});

test('externally retained clones stay readable after clear, async continuation and reentrant merge',async()=>{
 const mats=materials(),s=scene(mats),o=observe(s,mats,merge,{reenter:true});
 try{assert.equal(o.error,undefined);assert.deepEqual(o.buckets.map(b=>b.geometries.length),[0,0]);await Promise.resolve();assert.deepEqual(o.clones.map(geometry),o.reads);assert.ok(o.clones.every(g=>g.attributes.position.count>0));assert.ok(o.result.children.includes(s.keep));}finally{cleanup(s,o,mats);}
});

test('malformed Shouan colors still fail before any clone or dispose',()=>{
 const mats=materials();mats[1].name='shouan_entry_flush_photo_fit';mats[1].vertexColors=true;mats[1].userData.shouanEntryVertexColors=true;const a=scene(mats),b=scene(mats);
 for(const s of[a,b])s.sources[3].geometry.setAttribute('color',new T.BufferAttribute(new Float64Array(s.sources[3].geometry.attributes.position.count*3),3));
 const old=observe(a,mats,oldMerge),current=observe(b,mats,merge);
 try{assert.ok(old.error instanceof TypeError&&current.error instanceof TypeError);assert.equal(current.error.message,old.error.message);assert.equal(current.clones.length,0);assert.equal(old.clones.length,0);assert.deepEqual(current.events,[]);assert.deepEqual(current.buckets,[]);}finally{cleanup(a,old,mats);cleanup(b,current,[]);}
});

await mod('tests/lib/inner-palace-fixture.mjs');
const {ZoneBase}=await mod('src/scene/zones/ZoneBase.js');
const {ZoneManager}=await mod('src/scene/zones/ZoneManager.js');
const {CollisionManager}=await mod('src/utils/Collision.js');
const {realTextureLibrary}=await mod('tests/lib/r48-real-texture-library.mjs');
const {getXiananManagedBirth,queryXiananContact}=await mod('src/scene/palace/special/XiananContactSources.js');
const priorWindow=globalThis.window;globalThis.window={location:{search:''}};after(()=>{globalThis.window=priorWindow;});
for(const tamper of ['source-parent','source-geometry','finished-geometry'])test(`real Xianan startup/cache/cold stays valid and ${tamper} still fails closed`,()=>{
 const lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),manager=new ZoneManager({reuseInactive:true});const config=JSON.parse(fs.readFileSync(path.join(ROOT,'data/zones/outer-west.json')));
 class Gate extends ZoneBase{build(){this.buildGate(this.zoneJson.items[30]);this.source=this.kit.root.children.at(-1);this.group=this.kit.finish();return this.data={group:this.group,colliders:[...this.kit.colliders],walkables:[...this.kit.walkables],rooms:[],regions:[],mapItems:[],silhouette:null};}}
 manager.register({...config,neighbors:[]},Gate);const query=()=>queryXiananContact(cm,new T.Vector3(300.9,0,-245),new T.Vector3(300.9,0,-244.8),.5);
 try{manager.init(scene,lib,cm,{x:300.9,z:-240.1});assert.equal(query()?.status,'valid');const first=manager.loaded.get('outer-west'),birth=getXiananManagedBirth(first.builder,first.data);assert.ok(birth);
  manager.unloadZone('outer-west');assert.equal(query()?.status,'invalid');assert.equal(manager.inactiveCache.entries.size,1);manager.loadZone('outer-west');assert.ok(manager.loaded.get('outer-west')===first);assert.equal(query()?.status,'valid');assert.ok(getXiananManagedBirth(first.builder,first.data)===birth);
  manager.unloadZone('outer-west',{retain:false});manager.loadZone('outer-west');const entry=manager.loaded.get('outer-west');assert.ok(entry!==first);assert.equal(query()?.status,'valid');assert.equal(manager.getLoadMetrics().lastLoad.mode,'cold');
  if(tamper==='source-parent')entry.builder.kit.root.remove(entry.builder.source);
  else {const geometries=new Set();(tamper==='source-geometry'?entry.builder.source:entry.data.group).traverse(o=>{if(o.geometry)geometries.add(o.geometry);});assert.ok(geometries.size>0);for(const g of geometries){const a=g.attributes.position;a.setX(0,a.getX(0)+.25);a.needsUpdate=true;}}
  assert.equal(query()?.status,'invalid','authentic source/final geometry mutation must not retain authorization');
  cm.removeByTag('outer-west');manager.loaded.delete('outer-west');entry.builder.dispose();
 }finally{manager.dispose();lib.dispose();}
});
