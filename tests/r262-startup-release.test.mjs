// Focused CPU fixture only. No complete zone, browser, forced GC or RSS claim.
// Production regression: omitting/moving startup release must fail before next build.
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

// Adapted from the independently reviewed small-probe, but the real manager now
// issues release itself; no scene.add observer invokes the proposed behavior.
test('native startup releases selectively after publication/silhouette, before next build; authentic lifecycle stays valid',()=>{
  const config=JSON.parse(fs.readFileSync(path.join(ROOT,'data/zones/outer-west.json')));
  const lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),environment=new Environment(scene,null,lib);
  environment.setupGround();const manager=new ZoneManager({reuseInactive:true});
  const events=[];let released=false,startup=true,calls=0,nextCalls=0,sourceRemoved=0,rawRemoved=0,disposed=0,groupRemoved=0;
  class Gate extends ZoneBase {
    build(){
      events.push('build-gate');assert.throws(()=>ZoneBase.prototype.releaseConstructionReferences.call(this),/not finished/);
      const raw=this.kit.frame(500,500);raw.name='unused';this.raw=raw;
      const geometry=new T.BoxGeometry(1,1,1);raw.add(new T.Mesh(geometry,lib.material('stone_slab')));
      const leaf=new T.Mesh(new T.BoxGeometry(.2,.2,.2),lib.material('stone_slab'));leaf.userData.noMerge=true;raw.add(leaf);this.leaf=leaf;
      const shape=triangleInstance(createTriangleTemplate(geometry),[500,0,500],'fixture-triangle');const body=shape.box.clone();body.triangleSupport=shape;this.kit.colliders.push(body);this.shape=shape;
      this.buildGate(this.zoneJson.items[30]);this.source=this.kit.root.children.at(-1);
      this.group=this.kit.finish();
      this.source.addEventListener('removed',()=>sourceRemoved++);raw.addEventListener('removed',()=>rawRemoved++);this.group.addEventListener('removed',()=>groupRemoved++);
      const seen=new Set();for(const root of[this.kit.root,this.group])root.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.addEventListener('dispose',()=>disposed++);}});
      for(const m of this.kit.owned)m.addEventListener('dispose',()=>disposed++);
      this.data=dataFor(this);return this.data;
    }
    releaseConstructionReferences(){
      calls++;if(!startup)return super.releaseConstructionReferences();
      events.push('release-gate');assert.notEqual(this.disposed,true);assert.equal(this.group,this.data.group);assert.notEqual(this.group,this.kit.root);
      assert.equal(manager.prebuilt.get('outer-west').builder,this);assert.equal(manager.prebuilt.get('outer-west').data,this.data);
      const silhouette=manager.silhouettes.get('outer-west');assert.equal(silhouette.parent,scene);assert.equal(this.data.silhouette,silhouette);
      const before=digest(this.group),silBefore=digest(silhouette),certificate=proof(this.group),birth=getXiananManagedBirth(this,this.data);
      assert.ok(birth);const rows=JSON.stringify([this.data.colliders,this.data.walkables,this.data.mapItems,this.data.rooms,this.data.regions]);
      const texture=this.kit.ownedTextures[0],material=this.kit.owned.find(m=>m.name==='kit_plaques');
      const query=new T.Box3(new T.Vector3(499.9,-.1,499.9),new T.Vector3(500.1,.1,500.1));assert.equal(triangleBodyIntersects(this.shape,query),true);
      super.releaseConstructionReferences();
      assert.equal(digest(this.group),before);assert.equal(digest(silhouette),silBefore);assert.equal(proofCurrent(certificate),true);assert.equal(getXiananManagedBirth(this,this.data),birth);
      assert.equal(JSON.stringify([this.data.colliders,this.data.walkables,this.data.mapItems,this.data.rooms,this.data.regions]),rows);
      assert.deepEqual(this.kit.root.children,[this.source]);assert.equal(this.raw.parent,null);assert.equal(this.leaf.parent,this.group);assert.equal(this.kit.plaques.length,0);
      assert.equal(material.map,texture);assert.equal(this.kit.ownedTextures.includes(texture),true);
      assert.deepEqual([sourceRemoved,groupRemoved,rawRemoved,disposed],[0,0,1,0]);assert.equal(triangleBodyIntersects(this.shape,query),true);
      super.releaseConstructionReferences();assert.deepEqual([sourceRemoved,rawRemoved,disposed],[0,1,0]);released=true;
    }
  }
  class Next extends ZoneBase {
    build(){events.push('build-next');assert.equal(released,true,'prior zone must release before the next build begins');this.group=this.kit.finish();this.data=dataFor(this);return this.data;}
    releaseConstructionReferences(){nextCalls++;events.push('release-next');assert.notEqual(this.disposed,true);assert.equal(this.group,this.data.group);assert.notEqual(this.group,this.kit.root);assert.equal(manager.prebuilt.get('east-six').data,this.data);assert.equal(manager.silhouettes.has('east-six'),false);super.releaseConstructionReferences();}
  }
  manager.register({...config,neighbors:[]},Gate);manager.register(nextZone,Next);
  try{
    manager.init(scene,lib,cm,{x:300.9,z:-240.1});startup=false;
    assert.deepEqual(events,['build-gate','release-gate','build-next','release-next']);assert.equal(calls,1);assert.equal(nextCalls,1);
    const from=new T.Vector3(300.9,0,-245),to=new T.Vector3(300.9,0,-244.8),query=()=>queryXiananContact(cm,from,to,.5);
    assert.equal(query()?.status,'valid');assert.equal(xiananGroundCovered(scene,from,to),true);
    const first=manager.loaded.get('outer-west'),generation=query().generation;
    manager.unloadZone('outer-west');assert.equal(query()?.status,'invalid');assert.equal(manager.inactiveCache.entries.size,1);assert.equal(calls,2,'original cache release is retained');
    manager.loadZone('outer-west');assert.equal(manager.loaded.get('outer-west'),first);assert.equal(query()?.status,'valid');assert.notEqual(query().generation,generation);assert.equal(calls,2,'cached admission adds no startup/cold release');
    first.builder.kit.root.remove(first.builder.source);assert.equal(query()?.status,'invalid','real retained-source removal still revokes proof');
    cm.removeByTag('outer-west');manager.loaded.delete('outer-west');first.builder.dispose();
  }finally{manager.dispose();environment.dispose();lib.dispose();}
});

for(const failure of ['build','silhouette','release'])test(`${failure} failure propagates, never continues or reports startup ok`,()=>{
  const lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),manager=new ZoneManager();let releases=0,nextBuilt=false,brokenGroup;
  class Broken extends ZoneBase {
    build(){if(failure==='build')throw Error('expected build failure');this.group=this.kit.finish();if(failure==='silhouette'){brokenGroup=this.group;this.group.updateMatrixWorld=()=>{throw Error('expected silhouette failure');};}return dataFor(this);}
    releaseConstructionReferences(){releases++;if(failure==='release')throw Error('expected release failure');super.releaseConstructionReferences();}
  }
  class Next extends ZoneBase{build(){nextBuilt=true;throw Error('next must not build');}}
  manager.register(tiny,Broken);manager.register(nextZone,Next);
  try{assert.throws(()=>manager.init(scene,lib,cm,{x:1,z:1}),new RegExp('expected '+failure+' failure'));assert.equal(releases,failure==='release'?1:0);assert.equal(nextBuilt,false);assert.equal(manager.getLoadMetrics().lastStartup.outcome,'error');}
  finally{if(brokenGroup)delete brokenGroup.updateMatrixWorld;manager.dispose();lib.dispose();}
});

test('optional release remains compatible with builders that do not expose it',()=>{
  const lib=realTextureLibrary(),scene=new T.Scene(),cm=new CollisionManager(),manager=new ZoneManager();
  class OptOut extends ZoneBase{constructor(...args){super(...args);this.releaseConstructionReferences=undefined;}build(){this.group=this.kit.finish();return dataFor(this);}}
  manager.register(tiny,OptOut);try{manager.init(scene,lib,cm,{x:1,z:1});assert.deepEqual(manager.getLoadedIds(),['axis-courts']);assert.equal(manager.getLoadMetrics().lastStartup.outcome,'ok');}finally{manager.dispose();lib.dispose();}
});
