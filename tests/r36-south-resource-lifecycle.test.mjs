import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneManager } from '../src/scene/zones/ZoneManager.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { PalaceBuilder } from '../src/scene/PalaceBuilder.js';
import { Environment } from '../src/scene/Environment.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { TextureLibrary, TEXTURE_SPECS } from '../src/utils/TextureLibrary.js';
import { resourceBudget } from './lib/resource-budget.mjs';
import './lib/inner-palace-fixture.mjs'; // only the canvas/image DOM boundary

// Real Three resources, real TextureLibrary ownership, real merge and disposal
// events. This is a CPU ownership test, not a GPU-memory/FPS measurement.
function watch(resource) {
  let count=0;resource.addEventListener('dispose',()=>count++);return()=>count;
}
function sharedLibrary(t) {
  const library=new TextureLibrary();
  // Avoid network/fallback canvas pixels without replacing material ownership.
  for(const name of Object.keys(TEXTURE_SPECS))library.colors.set(name,new THREE.Texture({width:64,height:64}));
  const watched=new Map();
  const snapshot=()=>{for(const resource of [...library.materials.values(),...library.allTextures()])if(!watched.has(resource))watched.set(resource,watch(resource));};
  snapshot();
  t.after(()=>library.dispose());
  return {library,snapshot,watched};
}
function resources(root) {
  const geometries=new Set(),materials=new Set();
  root.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const m of Array.isArray(object.material)?object.material:[object.material])if(m)materials.add(m);});
  return {geometries,materials};
}
function displayMesh(object) {
  for(let p=object;p;p=p.parent)if(/^(wenhua|wuying)-/.test(p.userData.role??''))return true;
  return false;
}

for(const zone of ['outer-east','outer-west'])test(`R36 complete ${zone} unload/reload releases all private gallery resources once and preserves borrowed materials`,t=>{
  const {library,snapshot,watched}=sharedLibrary(t),scene=new THREE.Scene();
  const config=JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url)));
  const retired=[],seenPrivate=new Set();let expectedBudget,expectedNavigation;
  for(let cycle=0;cycle<3;cycle++){
    const builder=new ZoneBase(library,config),sourceCounts=new Map(),originalFinish=builder.kit.finish;
    builder.kit.finish=function(){
      this.root.traverse(object=>{if(object.isMesh&&displayMesh(object)&&!sourceCounts.has(object.geometry))sourceCounts.set(object.geometry,watch(object.geometry));});
      return originalFinish.call(this);
    };
    const data=builder.build();scene.add(data.group);
    assert.ok(sourceCounts.size>25,'exercise actual display put/new Mesh geometry, not only kit.box helpers');
    for(const count of sourceCounts.values())assert.equal(count(),1,'real merge releases each source display geometry exactly once');
    const current=resources(data.group),owned=new Set(builder.kit.owned),privateCounts=[];
    const gallery=[...owned].filter(m=>/^(wenhua|wuying)_/.test(m.name));
    assert.ok(gallery.length>=5,'source-specific private display materials exist');
    for(const material of current.materials){
      assert.ok(library.owns(material)||owned.has(material),`unregistered private runtime material: ${material.name}`);
    }
    for(const material of owned){
      assert.equal(library.owns(material),false,'a kit must not claim shared library ownership');
      assert.equal(seenPrivate.has(material),false,'reload receives fresh private materials');seenPrivate.add(material);
      privateCounts.push(watch(material));
    }
    const geometryCounts=[...current.geometries].map(watch),textureCounts=[...new Set(builder.kit.ownedTextures??[])].map(watch);
    const budget=resourceBudget([data.group]);
    const navigation=JSON.stringify({colliders:data.colliders,walkables:data.walkables,mapItems:data.mapItems});
    if(cycle===0){expectedBudget=budget;expectedNavigation=navigation;}else{
      assert.deepEqual(budget,expectedBudget,'reload cannot accumulate private resources');
      assert.equal(navigation,expectedNavigation,'unload/reload preserves actual collision and map contracts');
    }
    snapshot();builder.dispose();builder.dispose();
    assert.equal(builder.group,null);assert.equal(scene.children.length,0);
    assert.equal(builder.kit.colliders.length,0);assert.equal(builder.kit.walkables.length,0);
    retired.push(...privateCounts,...geometryCounts,...textureCounts);
    for(const count of retired)assert.equal(count(),1,'retired owned resources stay disposed once');
    for(const count of sourceCounts.values())assert.equal(count(),1,'teardown cannot re-dispose premerge display sources');
    for(const count of watched.values())assert.equal(count(),0,'all shared library materials/textures survive zone teardown');
  }
});

test('R36 actual PalaceBuilder water owner and Environment cutout survive three rebuilds without geometry leaks or borrowed-material disposal',t=>{
  const {library,snapshot,watched}=sharedLibrary(t),scene=new THREE.Scene(),retired=[];
  const river=PALACE_LAYOUT.find(item=>item.type==='river');let expectedBudget,expectedNavigation;
  for(let cycle=0;cycle<3;cycle++){
    const environment=new Environment(scene,null,library);environment.setupGround();
    const builder=new PalaceBuilder(scene,library);builder.buildAll([river]);
    const roots=[...builder.ownedObjects];
    assert.equal(roots.filter(root=>root.name==='south-water-system').length,1);
    assert.equal(roots.filter(root=>root.name==='金水河').length,1,'central river must not be duplicated by the extension');
    const water=builder.materials.water,current=resources(scene),geometries=[...current.geometries].map(watch);
    const waterCount=watch(water),budget=resourceBudget([scene]);
    const navigation=JSON.stringify({colliders:builder.getColliders(),walkables:builder.getWalkables()});
    if(cycle===0){expectedBudget=budget;expectedNavigation=navigation;}else{
      assert.deepEqual(budget,expectedBudget);assert.equal(navigation,expectedNavigation);
    }
    assert.ok([...current.materials].every(m=>m===water||library.owns(m)),'water owns only its water material; masonry/ground remain borrowed');
    snapshot();builder.dispose();builder.dispose();environment.dispose();environment.dispose();
    assert.equal(scene.children.length,0);assert.equal(builder.ownedObjects.size,0);
    assert.equal(builder.colliders.length,0);assert.equal(builder.walkables.length,0);
    retired.push(waterCount,...geometries);for(const count of retired)assert.equal(count(),1);
    for(const count of watched.values())assert.equal(count(),0,'library resources must survive water/ground teardown and be reused');
  }
});


test('R36 actual streaming manager removes southern collision tags and reconstructs zones without duplicate map identities',t=>{
  const oldWindow=globalThis.window;globalThis.window={location:{search:''}};t.after(()=>{globalThis.window=oldWindow;});
  t.mock.method(console,'log',()=>{});
  const {library,snapshot,watched}=sharedLibrary(t),scene=new THREE.Scene(),cm=new CollisionManager(),manager=new ZoneManager();
  for(const zone of ['outer-east','outer-west'])manager.register(JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url))));
  manager.init(scene,library,cm,{x:-186.4,z:-199});
  const identities=JSON.stringify(manager.allMapItems),retired=[];let expectedCounts;
  try {
    for(let cycle=0;cycle<3;cycle++){
      for(const zone of ['outer-east','outer-west'])manager.loadZone(zone);
      assert.equal(manager.loaded.size,2);assert.equal(manager.prebuilt.size,0);
      const counts={colliders:cm.colliders.length,walkables:cm.walkables.length};
      if(cycle===0)expectedCounts=counts;else assert.deepEqual(counts,expectedCounts,'streaming cannot accumulate collision proxies');
      assert.equal(JSON.stringify(manager.allMapItems),identities,'public footprint identities do not multiply on reload');
      const current=[];
      for(const {builder,data} of manager.loaded.values()){
        current.push(...[...resources(data.group).geometries].map(watch),...[...new Set(builder.kit.owned)].map(watch));
      }
      snapshot();
      for(const zone of ['outer-east','outer-west']){manager.unloadZone(zone);manager.unloadZone(zone);}
      assert.equal(manager.loaded.size,0);assert.equal(cm.colliders.length,0);assert.equal(cm.walkables.length,0);
      retired.push(...current);for(const count of retired)assert.equal(count(),1);
      for(const count of watched.values())assert.equal(count(),0,'streaming cannot release library resources');
    }
  }finally{manager.dispose();}
  assert.equal(scene.children.length,0);for(const count of retired)assert.equal(count(),1);
});
