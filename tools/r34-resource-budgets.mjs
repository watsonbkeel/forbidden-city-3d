import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
registerHooks({load(url,context,next){if(url.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(url),'utf8'),shortCircuit:true};return next(url,context);}});
const T=await import('three');
const {resourceBudget}=await import('../tests/lib/resource-budget.mjs');
const {BatchedBuilder}=await import('../src/render/BatchedBuilder.js');
const {cpuDracoLoader}=await import('../tests/lib/cpu-draco.mjs');
const draco=await cpuDracoLoader();
// CPU geometry fixture only: no image decode, GPU upload, WebGL, or browser.
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
globalThis.window={location:{search:''}};
const {TextureLibrary,TEXTURE_SPECS}=await import('../src/utils/TextureLibrary.js');
const {PalaceBuilder}=await import('../src/scene/PalaceBuilder.js');
const {PALACE_LAYOUT}=await import('../src/scene/Layout.js');
const {Enclosure}=await import('../src/scene/Enclosure.js');
const {GardenBuilder}=await import('../src/scene/GardenBuilder.js');
const {Environment}=await import('../src/scene/Environment.js');
const {ZoneManager}=await import('../src/scene/zones/ZoneManager.js');
const {CollisionManager}=await import('../src/utils/Collision.js');
const {INITIAL_VIEW_POSITION}=await import('../src/config/initialView.js');
const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');
const {INTERIORS}=await import('../src/scene/interior/registry.js');
const {createHelicopterModel}=await import('../src/scene/flight/HelicopterModel.js');
const {HistoricalSkyLamps}=await import('../src/scene/sky/HistoricalSkyLamps.js');
const sha=v=>createHash('sha256').update(v).digest('hex');
const library=new TextureLibrary();library.manifest=JSON.parse(fs.readFileSync(new URL('../public/textures/hd/manifest.json',import.meta.url)));
for(const name of Object.keys(TEXTURE_SPECS)){
 const entry=library.manifest.textures[name],image={width:entry.hd.width,height:entry.hd.height};
 library.colors.set(name,library.configure(new T.Texture(image),name,'color'));
 if(entry.normal)library.normals.set(name,library.configure(new T.Texture(image),name,'normal'));
}
const scene=new T.Scene(),cm=new CollisionManager(),permanent={};
const batcher=new BatchedBuilder(scene);
function renderBatchAllocation(){
 batcher.begin();
 const buffers=resourceBudget([batcher.container]),entries=batcher.batches.flatMap(b=>b.entries);
 const triangles=e=>(e.mesh.geometry.index?.count??e.mesh.geometry.attributes.position.count)/3;
 const result={batches:batcher.batches.length,sourceMeshes:entries.length,geometryCapacityBytes:buffers.geometryBytes,matrixTextureBytes:batcher.batches.reduce((n,b)=>n+(b.batch._matricesTexture?.image?.data?.byteLength??0),0),sourceTriangles:entries.reduce((n,e)=>n+triangles(e),0),visibleSourceTriangles:entries.filter(e=>e.visible).reduce((n,e)=>n+triangles(e),0)};
 batcher.end();return result;
}
const log=console.log;console.log=()=>{};
function measure(label,fn){const before=new Set(scene.children);const t=performance.now();const value=fn();const roots=scene.children.filter(r=>!before.has(r));permanent[label]={...resourceBudget(roots),buildMs:+(performance.now()-t).toFixed(2)};return value;}
const palace=measure('palace',()=>{const p=new PalaceBuilder(scene,library);p.buildAll(PALACE_LAYOUT);return p;});
const enclosure=measure('enclosure',()=>new Enclosure(scene,library).build());
const garden=measure('garden',()=>new GardenBuilder(scene,library).build(PALACE_LAYOUT.find(r=>r.type==='garden')));
class CPUEnvironment extends Environment { setupIBL() {} } // Only the GPU PMREM boundary is excluded.
const environment=measure('environmentGeometry',()=>{const e=new CPUEnvironment(scene,null,library);e.init();return e;});
cm.addColliders(palace.getColliders());cm.addWalkables(palace.getWalkables());cm.addColliders(enclosure.getColliders());cm.addColliders(garden.getColliders());cm.addWalkables(garden.getWalkables());
const permanentRoots=[...scene.children],permanentTotal=resourceBudget(permanentRoots);
const zones=new ZoneManager();for(const file of fs.readdirSync(new URL('../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json')))zones.register(JSON.parse(fs.readFileSync(new URL('../data/zones/'+file,import.meta.url))));
// Match runtime registered order, which defines overlapping-zone selection.
const {ZONES}=await import('../data/zones/index.js');zones.zones.clear();for(const zone of ZONES)zones.register(zone);
const startup=performance.now();zones.init(scene,library,cm,INITIAL_VIEW_POSITION);
const startupZoneBuildMs=+(performance.now()-startup).toFixed(2);
const navigation=()=>sha(JSON.stringify({colliders:cm.colliders,walkables:cm.walkables}));
const snapshot=label=>({label,renderBatchAllocation:renderBatchAllocation(),loaded:zones.getLoadedIds(),cached:[...zones.prebuilt.keys()],scene:resourceBudget(scene.children),loadedZones:resourceBudget([...zones.loaded.values()].map(v=>v.data.group)),prebuiltCache:resourceBudget([...zones.prebuilt.values()].map(v=>v.data.group)),silhouettes:resourceBudget([...zones.silhouettes.values()]),allRetainedGeometry:resourceBudget([...scene.children,...[...zones.prebuilt.values()].map(v=>v.data.group)]),colliders:cm.colliders.length,walkables:cm.walkables.length,navigationSHA256:navigation()});
const snapshots=[snapshot('initial-before-neighbor-queue')],zoneRows={};
for(const [id]of zones.zones){const data=zones.loaded.get(id)?.data??zones.prebuilt.get(id).data;zoneRows[id]={...resourceBudget([data.group]),colliders:data.colliders.length,walkables:data.walkables.length,rooms:data.rooms.length,mapItems:data.mapItems.length};}
for(let i=0;i<100&&zones.buildQueue.length;i++)zones.processBuildQueue();snapshots.push(snapshot('initial-after-neighbor-queue'));
for(const [name,x,z]of[['taihe',0,-30],['qianqing',0,301],['chuxiu',94.8,425],['return-start',INITIAL_VIEW_POSITION.x,INITIAL_VIEW_POSITION.z]]){
 zones.ensureLoadedAt(x,z);zones.update({x,z});for(let i=0;i<100&&zones.buildQueue.length;i++)zones.processBuildQueue();zones.update({x,z});snapshots.push(snapshot(name));
}
const lifecycle={};
for(const id of zones.zones.keys()){
 zones.loadZone(id);const data=zones.loaded.get(id).data;
 const before={budget:resourceBudget([data.group]),colliders:sha(JSON.stringify(data.colliders)),walkables:sha(JSON.stringify(data.walkables)),rooms:sha(JSON.stringify(data.rooms)),mapItems:sha(JSON.stringify(data.mapItems))};
 let geometryDisposals=0,materialDisposals=0;const geometries=new Set(),materials=new Set(),geometryCounts=new Map();
 data.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});
 for(const g of geometries){geometryCounts.set(g,0);g.addEventListener('dispose',()=>{geometryDisposals++;geometryCounts.set(g,geometryCounts.get(g)+1);});}
 for(const m of materials)m.addEventListener('dispose',()=>materialDisposals++);
 let sharedDisposals=0,sharedTextureDisposals=0;const observe=()=>sharedDisposals++,observeTexture=()=>sharedTextureDisposals++;for(const m of library.materials.values())m.addEventListener('dispose',observe);for(const t of library.allTextures())t.addEventListener('dispose',observeTexture);
 zones.unloadZone(id);const silhouetteVisibleUnloaded=zones.silhouettes.get(id)?.visible;const remainingTags=cm.colliders.filter(c=>c.tag===id).length+cm.walkables.filter(w=>w.tag===id).length;
 zones.loadZone(id);const next=zones.loaded.get(id).data,after={budget:resourceBudget([next.group]),colliders:sha(JSON.stringify(next.colliders)),walkables:sha(JSON.stringify(next.walkables)),rooms:sha(JSON.stringify(next.rooms)),mapItems:sha(JSON.stringify(next.mapItems))};
 for(const m of library.materials.values())m.removeEventListener('dispose',observe);for(const t of library.allTextures())t.removeEventListener('dispose',observeTexture);
 lifecycle[id]={silhouetteVisibleUnloaded,silhouetteVisibleLoaded:zones.silhouettes.get(id)?.visible,equalBeforeAfter:JSON.stringify(before)===JSON.stringify(after),geometryDisposals,geometryDisposalMin:Math.min(...geometryCounts.values()),geometryDisposalMax:Math.max(...geometryCounts.values()),uniqueGeometries:geometries.size,materialDisposals,sharedDisposals,sharedTextureDisposals,remainingTags,...before};
}
snapshots.push(snapshot('all-zones-after-reload-cycles'));
const optional={};
for(const[id,cfg]of Object.entries(INTERIORS)){
 const bytes=fs.readFileSync(new URL('../public'+cfg.model,import.meta.url));
 let gltf;try{gltf=await new GLTFLoader().setDRACOLoader(draco).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');}catch(error){
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  optional[id]={model:cfg.model,fileBytes:bytes.length,sha256:sha(bytes),loaded:false,state:'not-exercised',reason:error.message,declaredPrimitives:(json.meshes??[]).reduce((n,m)=>n+m.primitives.length,0),declaredTriangles:(json.meshes??[]).flatMap(m=>m.primitives).reduce((n,p)=>n+(json.accessors[p.indices??p.attributes.POSITION]?.count??0)/3,0)};continue;
 }
 const loader=new InteriorLoader(scene,cm,{registry:{[id]:cfg}}),beforeNav=navigation();let ok;
 loader.gltf.load=(_url,done)=>done(gltf);ok=await loader.load(id);
 const state=loader.halls.get(id),loadedNav={colliders:cm.colliders.length,walkables:cm.walkables.length};
 optional[id]={model:cfg.model,fileBytes:bytes.length,sha256:sha(bytes),loaded:ok,state:state.state,assetGraph:resourceBudget([gltf.scene]),installed:resourceBudget([state.group]),history:loader.history[id],loadedNavigation:loadedNav};
 const installedGeometries=new Set();state.group?.traverse(o=>{if(o.geometry)installedGeometries.add(o.geometry);});let disposedGeometryEvents=0;const installedCounts=new Map();for(const geometry of installedGeometries){installedCounts.set(geometry,0);geometry.addEventListener('dispose',()=>{disposedGeometryEvents++;installedCounts.set(geometry,installedCounts.get(geometry)+1);});}
 loader.unload(id);optional[id].navigationRestored=navigation()===beforeNav;optional[id].disposal={uniqueGeometries:installedGeometries.size,events:disposedGeometryEvents,min:Math.min(...installedCounts.values()),max:Math.max(...installedCounts.values())};
 const reloaded=await new GLTFLoader().setDRACOLoader(draco).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');loader.gltf.load=(_url,done)=>done(reloaded);
 optional[id].reloadSucceeded=await loader.load(id);optional[id].reloadBudgetIdentical=JSON.stringify(resourceBudget([loader.halls.get(id).group]))===JSON.stringify(optional[id].installed);
 loader.unload(id);optional[id].reloadNavigationRestored=navigation()===beforeNav;loader.dispose();
}
const textureFiles=Object.values(library.manifest.textures).flatMap(v=>[v.color,v.normal].filter(Boolean));
function sourceTree(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sourceTree(new URL(e.name+'/',root)):[new URL(e.name,root)]);}
const sourceIdentities=Object.fromEntries(['src/','data/'].flatMap(dir=>sourceTree(new URL('../'+dir,import.meta.url))).sort((a,b)=>a.href.localeCompare(b.href)).map(url=>[url.pathname.split('/').slice(url.pathname.includes('/src/')?url.pathname.split('/').indexOf('src'):url.pathname.split('/').indexOf('data')).join('/'),sha(fs.readFileSync(url))]));
const silhouetteDisposal=Object.fromEntries([...zones.silhouettes].map(([id,mesh])=>{const row={geometry:0,material:0};mesh.geometry.addEventListener('dispose',()=>row.geometry++);mesh.material.addEventListener('dispose',()=>row.material++);return[id,row];}));
const supplementalScene=new T.Scene(),aircraft=createHelicopterModel();supplementalScene.add(aircraft.group);
const lamps=new HistoricalSkyLamps({scene:supplementalScene,collisionManager:new CollisionManager(),envelope:{removeExtra(){},addExtra(){}},playerPosition:()=>null,flightState:()=>null});
const supplementalResident={scope:'Retained main-created geometry, separate from architectural snapshots and their batching; lamps disabled by default',helicopter:resourceBudget([aircraft.group]),historicalSkyLamps:resourceBudget([lamps.group]),combined:resourceBudget(supplementalScene.children)};
const report={schema:1,supplementalResident,silhouetteDisposal,sourceTreeSHA256:sha(JSON.stringify(sourceIdentities)),sourceIdentities,kind:'CPU geometry and resource ownership inventory; not WebGL/GPU/FPS evidence',limitations:['Textures have manifest dimensions but are not decoded or uploaded.','Architectural snapshots exclude helicopter and optional sky-lamp geometry, which are inventoried separately in supplementalResident. Their additional batch copies are not included. Future main-created fixture classes require explicit capture integration. Environment lights, IBL and postprocessing GPU targets are excluded. Architectural render batch geometry and matrix texture capacity are reported separately; not GPU allocation.','Visible counts respect ancestor visibility, not camera frustum, occlusion, material visibility, or draw calls.','Geometry bytes are unique backing ArrayBuffer sizes, not complete JS or GPU memory.','All resident LOD levels and cached prebuilt zones are included.','Optional model parsing exercises actual loader install/unload with the pinned bundled CPU Draco decoder, but not browser-worker/network fetch or image decode.','CPU elapsed times are diagnostic only, not device performance claims.'],permanent,permanentTotal,startupZoneBuildMs,zones:zoneRows,snapshots,lifecycle,optional,sharedTextureManifest:{files:textureFiles.length,downloadBytes:textureFiles.reduce((n,f)=>n+fs.statSync(new URL('../public/textures/hd/'+f,import.meta.url)).size,0),estimatedRGBA8BaseLevelBytes:Object.values(library.manifest.textures).reduce((n,e)=>n+e.hd.width*e.hd.height*4*(e.normal?2:1),0)}};
aircraft.dispose();lamps.dispose();batcher.dispose();zones.dispose();palace.dispose();enclosure.dispose();garden.dispose();environment.dispose();library.dispose();console.log=log;
if(!Object.values(lifecycle).every(r=>r.equalBeforeAfter&&r.sharedDisposals===0&&r.sharedTextureDisposals===0&&r.geometryDisposalMin===1&&r.geometryDisposalMax===1&&r.remainingTags===0&&r.silhouetteVisibleUnloaded===true&&r.silhouetteVisibleLoaded===false&&r.geometryDisposals===r.uniqueGeometries))throw Error('Zone lifecycle resource/navigation invariant failed');
if(!Object.values(optional).every(r=>r.loaded&&r.navigationRestored&&r.reloadSucceeded&&r.reloadBudgetIdentical&&r.reloadNavigationRestored&&r.disposal.events===r.disposal.uniqueGeometries&&r.disposal.min===1&&r.disposal.max===1))throw Error('Optional interior lifecycle invariant failed');
if(!Object.values(silhouetteDisposal).every(r=>r.geometry===1&&r.material===1))throw Error('Silhouette final ownership invariant failed');
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');else console.log(JSON.stringify(report,null,2));
console.error(JSON.stringify({output,permanentTotal,zones:Object.keys(zoneRows).length,cycles:Object.values(lifecycle).every(r=>r.equalBeforeAfter&&r.sharedDisposals===0&&r.remainingTags===0),optional:Object.fromEntries(Object.entries(optional).map(([k,v])=>[k,{loaded:v.loaded,restored:v.navigationRestored}]))}));
