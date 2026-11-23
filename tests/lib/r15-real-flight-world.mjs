import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {INITIAL_VIEW_POSITION} from '../../src/config/initialView.js';
import {Environment} from '../../src/scene/Environment.js';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {setBuildingDetailQuality} from '../../src/render/BuildingDetailQuality.js';
import {createPalaceFlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';
import {LANDING_CHOICES} from '../../src/scene/flight/FlightState.js';
import {installCpuDocument} from './finished-world-lifecycle.mjs';
import {loadLocalTextureLibrary} from './r58-zuoyi-real-texture-loader.mjs';

const scope='R15_CURRENT_COMPLETE_STATIC_FLIGHT_GRID_REAL_DEFAULT_STREAMING_NO_GPU';
const trace=(phase,detail={})=>console.log(JSON.stringify({scope,phase,maxRSSKiB:process.resourceUsage().maxRSS,...detail}));
const gridDigest=grid=>createHash('sha256')
  .update(Buffer.from(grid.heights.buffer,grid.heights.byteOffset,grid.heights.byteLength))
  .update(grid.water).digest('hex');

// Equivalent to the browser's bundled static production index. Only Node's
// JSON import attribute is supplied; no source or zone data is rewritten.
async function actualZones(){
  const hook=registerHooks({load(url,context,next){
    return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);
  }});
  try{return (await import('../../data/zones/index.js')).ZONES;}
  finally{hook.deregister();}
}

export async function currentFlightWorld(){
  const cpu=installCpuDocument(createCanvas),previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
  const scene=new T.Scene(),cm=new CollisionManager();
  let library,environment,palaceBuilder,enclosure,garden,zoneManager,disposed=false;
  function dispose(primary){
    if(disposed){if(primary)throw primary;return;}
    disposed=true;
    const failures=primary?[primary]:[];
    const attempt=fn=>{try{fn();}catch(error){failures.push(error);}};
    // Normal managed unload must run before clearing CM's source-bound
    // registrations. Even a failed owner cannot prevent the others retiring.
    attempt(()=>{if(zoneManager?.prebuilt)zoneManager.dispose();});
    attempt(()=>cm.clear());
    attempt(()=>garden?.dispose());attempt(()=>enclosure?.dispose());
    attempt(()=>palaceBuilder?.dispose());attempt(()=>environment?.dispose());
    attempt(()=>library?.dispose());
    attempt(()=>{if(previousWindow)Object.defineProperty(globalThis,'window',previousWindow);else delete globalThis.window;});
    attempt(()=>cpu.restore());
    if(failures.length===1)throw failures[0];
    if(failures.length)throw new AggregateError(failures,'R15 source flight fixture setup/disposal failed');
    assert.equal(scene.children.length,0,'actual static and zone owners detached');
    assert.equal(cm.colliders.length+cm.walkables.length,0,'all physics released');
  }
  try {
    Object.defineProperty(globalThis,'window',{value:{location:{search:''}},writable:true,configurable:true});
    const ZONES=await actualZones();
    const assets=await loadLocalTextureLibrary({quality:'sd',scope:'all'});
    library=assets.library;
    setBuildingDetailQuality(library,'high');
    const entries=library.manifest.textures,keys=Object.keys(TEXTURE_SPECS).sort();
    assert.deepEqual(Object.keys(entries).sort(),keys);
    assert.deepEqual([...library.loadedFromFile].sort(),keys,'no fallback albedo');
    const normals=keys.filter(k=>entries[k].normal);
    assert.deepEqual([...library.normals.keys()].sort(),normals);
    assert.equal(assets.reads.length,keys.length+normals.length,'every shipped SD manifest file loaded exactly once');
    for(const k of keys){
      const {width,height}=entries[k].sd;
      assert.deepEqual([library.color(k).image.width,library.color(k).image.height],[width,height],k);
      assert.equal(library.aspect(k),width/height,k);
    }
    trace('real-local-textures',{albedo:keys.length,normals:normals.length,quality:'sd',buildingDetail:'high'});

    // The production flight collector excludes Environment itself; its real
    // ground is still present for any private walking-contact witness.
    environment=new Environment(scene,null,library);environment.setupGround();
    palaceBuilder=new PalaceBuilder(scene,library);palaceBuilder.buildAll(PALACE_LAYOUT);
    enclosure=new Enclosure(scene,library);enclosure.build();
    garden=new GardenBuilder(scene,library);garden.build(PALACE_LAYOUT.find(p=>p.type==='garden'));
    trace('actual-static-merged',{palaceRoots:palaceBuilder.ownedObjects.size});

    // Ordinary startup, not the debug ?zones=all path and no experimental
    // texture-first triad. Manager publishes current private source owners.
    zoneManager=new ZoneManager({reuseInactive:true});
    for(const zone of ZONES)zoneManager.register(zone);
    zoneManager.init(scene,library,cm,INITIAL_VIEW_POSITION);
    cm.addColliders(palaceBuilder.getColliders());cm.addWalkables(palaceBuilder.getWalkables());
    cm.addColliders(enclosure.getColliders());
    cm.addColliders(garden.getColliders());cm.addWalkables(garden.getWalkables());
    cm.setRegions(zoneManager.getRegions());
    const initial=zoneManager.currentId;
    assert.equal(initial,'axis-courts');
    assert.equal(zoneManager.loadAll,false);
    assert.equal(zoneManager.triadTextureFirst,false);
    assert.deepEqual([...zoneManager.loaded.keys()],[initial]);
    const zoneIds=ZONES.map(z=>z.id);
    assert.deepEqual([...zoneManager.zones.keys()],zoneIds);
    assert.deepEqual([...zoneManager.prebuilt.keys()],zoneIds.filter(id=>id!==initial));
    for(const id of zoneIds){
      const live=zoneManager.loaded.get(id),entry=live??zoneManager.prebuilt.get(id);
      assert.ok(entry?.data?.group?.isGroup&&entry.builder.group===entry.data.group,id+' normally finished source');
      assert.equal(entry.data.group.parent,live?scene:null,id+' prebuilt versus admitted owner');
    }
    const east=zoneManager.prebuilt.get('east-six').data;
    const slab=east.walkables.filter(w=>w.qiandongCommonGateSlab?.id==='east-six/items/42/existing-stone-slab');
    assert.equal(slab.length,1,'the actual east-six common gate source hook ran once');
    assert.equal(library.materials.get('stone_slab|{}'),library.material('stone_slab'));
    trace('actual-default-zone-prebuild',{initial,prebuilt:[...zoneManager.prebuilt.keys()],eastSlabTop:slab[0].box.max.y});

    // Rasterize the very same loaded+prebuilt merged roots main.js uses.
    // Then use real unload to verify the original all-inactive race condition:
    // a stand-alone resident scalar grid, with no live zone geometry required.
    const envelope=createPalaceFlightEnvelope({palaceBuilder,enclosure,garden,zoneManager,layout:PALACE_LAYOUT});
    const digest=gridDigest(envelope),first=zoneManager.loaded.get(initial);
    zoneManager.unloadZone(initial,{retain:false});
    assert.equal(zoneManager.loaded.size,0);
    assert.equal(first.data.group.parent,null);
    assert.ok(cm.colliders.every(r=>r.tag!==initial)&&cm.walkables.every(r=>r.tag!==initial));
    assert.equal(gridDigest(envelope),digest,'physical streaming unload must not remove a resident flight cell');
    assert.equal(cpu.stats.fetches,0,'no unexpected network loads');
    trace('full-grid-after-unload',{...envelope.summary(),gridSha256:digest,zoneIds});

    function prepareDismount(pad){
      assert.ok(LANDING_CHOICES.includes(pad),'production offered pad, not a moved test point');
      // This is the actual synchronous dismount load in FlightTour.exit.
      const id=zoneManager.ensureLoadedAt(pad.x,pad.z);
      assert.ok(id,'live zone covers '+pad.id);
      const required=[id,...zoneManager.zones.get(id).neighbors];
      for(const key of required)assert.equal(zoneManager.loaded.get(key)?.data.group.parent,scene,key+' admitted by production load');
      assert.equal(gridDigest(envelope),digest,'actual dismount load leaves the resident rotor grid intact');
      trace('real-dismount-owners',{pad:pad.id,required,colliders:cm.colliders.length,walkables:cm.walkables.length});
    }
    return {envelope,cm,zoneManager,prepareDismount,dispose};
  }catch(error){dispose(error);}
}
