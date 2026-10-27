import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {registerHooks} from 'node:module';
import {bindRoot,measure,nowNs,resourceInventory,sha256} from './measurement.mjs';
import {snapshotWorld} from './snapshot.mjs';
import {installCpuPlatform} from './cpu-platform.mjs';
const options=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,all)=>{if(i%2===0)a.push([v.replace(/^--/,''),all[i+1]]);return a;},[]));
if(options.scenario!=='startup')throw Error('Only startup scenario is implemented; no fallback');
if(!['high','low'].includes(options.quality)||!path.isAbsolute(options.out??''))throw Error('quality high|low and absolute --out required');
if(fs.existsSync(options.out))throw Error('refusing to overwrite raw output');
const driverDirectory=path.dirname(fileURLToPath(import.meta.url));
const driverBinding=()=>Object.fromEntries(fs.readdirSync(driverDirectory).filter(p=>p.endsWith('.mjs')).sort().map(p=>[p,sha256(fs.readFileSync(path.join(driverDirectory,p)))]));
const driver=driverBinding();
const binding=bindRoot(options.root),root=binding.root,platform=await installCpuPlatform(root);
const hook=registerHooks({load(url,context,next){const r=next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);if(!url.endsWith('/CanopyRoofSurfaceJoint.js'))return r;let source=String(r.source).replace('export function fitCanopyToMainRoof(', 'function fitCanopyImplementation(');source+='\nexport function fitCanopyToMainRoof(options){const start=process.hrtime.bigint();const result=fitCanopyImplementation(options);(globalThis.__r116FitTimes??=[]).push({ms:Number(process.hrtime.bigint()-start)/1e6,beforeTriangles:result.beforeTriangles,afterTriangles:result.afterTriangles,capPatches:result.capPatches,capTriangles:result.capTriangles});return result;}\n';return {...r,source};}});
const imp=p=>import(pathToFileURL(path.join(root,p)).href);
const THREE=await import(pathToFileURL(path.join(path.dirname(platform.require.resolve('three')),'three.module.js')));
// Independent post-startup asset maturity window; not a timing replacement.
const assetEvents=[],pendingAssets=new Set(),assetErrors=[];
THREE.DefaultLoadingManager.setURLModifier(url=>url.startsWith('/textures/')?path.join(root,'public',url):url);
const originalStart=THREE.DefaultLoadingManager.itemStart.bind(THREE.DefaultLoadingManager), originalEnd=THREE.DefaultLoadingManager.itemEnd.bind(THREE.DefaultLoadingManager), originalError=THREE.DefaultLoadingManager.itemError.bind(THREE.DefaultLoadingManager);
THREE.DefaultLoadingManager.itemStart=url=>{pendingAssets.add(url);assetEvents.push({event:'start',url});return originalStart(url);};
THREE.DefaultLoadingManager.itemEnd=url=>{pendingAssets.delete(url);assetEvents.push({event:'end',url});return originalEnd(url);};
THREE.DefaultLoadingManager.itemError=url=>{assetErrors.push(url);return originalError(url);};
const [{TextureLibrary,TEXTURE_SPECS},{setBuildingDetailQuality},{Environment},{PalaceBuilder},{Enclosure},{GardenBuilder},{ZoneManager},{ZoneBase},{CollisionManager},{PALACE_LAYOUT},{ZONES},{INITIAL_VIEW_POSITION},{RoomNightLights},{createPalaceFlightEnvelope},{FirstPersonControls}]=await Promise.all([
 'src/utils/TextureLibrary.js','src/render/BuildingDetailQuality.js','src/scene/Environment.js','src/scene/PalaceBuilder.js','src/scene/Enclosure.js','src/scene/GardenBuilder.js','src/scene/zones/ZoneManager.js','src/scene/zones/ZoneBase.js','src/utils/Collision.js','src/scene/Layout.js','data/zones/index.js','src/config/initialView.js','src/scene/sky/RoomNightLights.js','src/scene/flight/FlightEnvelope.js','src/controls/FirstPerson.js'].map(imp));
const phases={},zoneBuilds=[],registration=[],kitFinish=[];
const {CourtKit}=await imp('src/scene/palace/kit.js');
const oldFinish=CourtKit.prototype.finish;CourtKit.prototype.finish=function(...args){const r=measure(()=>oldFinish.apply(this,args));kitFinish.push({name:this.root.name,ms:r.ms});return r.value;};let zoneBuildCount=0;
const oldBuild=ZoneBase.prototype.build;ZoneBase.prototype.build=function(...args){const r=measure(()=>oldBuild.apply(this,args));zoneBuilds.push({id:this.zoneJson?.id??'unknown',ms:r.ms});zoneBuildCount++;return r.value;};
for(const name of ['addColliders','addWalkables']){const old=CollisionManager.prototype[name];CollisionManager.prototype[name]=function(...args){const r=measure(()=>old.apply(this,args));registration.push({method:name,count:args[0]?.length??null,ms:r.ms});return r.value;};}
function phase(name,fn){const r=measure(fn);phases[name]=r.ms;process.stderr.write(`${name}: ${r.ms.toFixed(3)} ms\n`);return r.value;}
globalThis.gc?.();const memoryBefore=process.memoryUsage(),start=nowNs();
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,16/9,.1,5000);
const library=new TextureLibrary({quality:options.quality==='high'?'hd':'sd',anisotropy:options.quality==='high'?8:2,baseUrl:path.join(root,'public/textures',options.quality==='high'?'hd':'sd')+'/'});
setBuildingDetailQuality(library,options.quality);
const t=nowNs();await library.load();phases.textureLocalReadDecode=Number(nowNs()-t)/1e6;
if(library.loadedFromFile.size!==Object.keys(TEXTURE_SPECS).length||library.normals.size!==Object.values(library.manifest.textures).filter(v=>v.normal).length)throw Error('actual file textures missing; fallback forbidden');
const environment=phase('environmentCpu',()=>{const e=new Environment(scene,null,library);for(const method of ['setupSky','setupSkyline','setupGround','setupDuanmenBackdrop','setupFog','setupLights'])e[method]();e.applyDayCycle(new Date('2026-10-26T04:00:00Z'),true);e.setQuality(options.quality==='high');return e;});
const palaceBuilder=phase('palaceBuild',()=>{const b=new PalaceBuilder(scene,library);b.buildAll(PALACE_LAYOUT);return b;});
const enclosure=phase('enclosureBuild',()=>new Enclosure(scene,library).build());
const garden=phase('gardenBuild',()=>new GardenBuilder(scene,library).build(PALACE_LAYOUT.find(p=>p.type==='garden')));
const cm=new CollisionManager();
const zoneManager=phase('zoneInit',()=>{const z=new ZoneManager({reuseInactive:true});ZONES.forEach(v=>z.register(v));z.init(scene,library,cm,INITIAL_VIEW_POSITION);return z;});
phase('staticRegistration',()=>{cm.addColliders(palaceBuilder.getColliders());cm.addWalkables(palaceBuilder.getWalkables());cm.addColliders(enclosure.getColliders());cm.addColliders(garden.getColliders());cm.addWalkables(garden.getWalkables());cm.setRegions(zoneManager.getRegions());});
const rooms=zoneManager.getRooms(),axialRooms=PALACE_LAYOUT.filter(h=>h.type==='palace').map(h=>{const{x,z}=h.position,w=h.dimensions.width,d=h.dimensions.depth,floorY=cm.getGroundHeight(x+w*.25,z,0,30);return{name:h.name,floorY,min:{x:x-w/2+1,y:floorY,z:z-d/2+1},max:{x:x+w/2-1,y:floorY+7,z:z+d/2-1}};});
const roomNightLights=phase('roomNightLights',()=>new RoomNightLights({scene,rooms:[...rooms,...axialRooms],collisionManager:cm,additionalColliders:[...zoneManager.prebuilt.values()].flatMap(e=>e.data.colliders)}));
const controls=phase('controlsReady',()=>{const c=new FirstPersonControls(camera,document.body,cm);c.setPosition(INITIAL_VIEW_POSITION.x,INITIAL_VIEW_POSITION.y,INITIAL_VIEW_POSITION.z);c.lookAt(0,-390);return c;});
const flight=phase('flightEnvelope',()=>createPalaceFlightEnvelope({palaceBuilder,enclosure,garden,zoneManager,layout:PALACE_LAYOUT}));
const [{CharacterSystem},{InteriorLoader},{HistoricalSkyLamps},{FlightTour}]=await Promise.all(['src/scene/characters/CharacterSystem.js','src/scene/interior/InteriorLoader.js','src/scene/sky/HistoricalSkyLamps.js','src/scene/flight/FlightTour.js'].map(imp));
const interiors=phase('interiorLoaderSetup',()=>new InteriorLoader(scene,cm));
const characters=phase('characterSystemSetup',()=>new CharacterSystem({scene,camera,collisionManager:cm,zoneManager,interiors,getViewState:()=>({mode:'ground',position:camera.position}),getPlayerState:()=>({position:[camera.position.x,controls.feetY,camera.position.z],radius:.5,height:1.7})}));
if(!characters.validation.valid)throw Error('character registry invalid');
const historicalLamps=phase('historicalLampsSetup',()=>new HistoricalSkyLamps({scene,collisionManager:cm,envelope:flight,playerPosition:()=>camera.position,flightState:()=>null}));
const flightTour=phase('flightTourSetup',()=>new FlightTour({scene,camera,controls,collisionManager:cm,zoneManager,envelope:flight}));
const readyCpuMs=Number(nowNs()-start)/1e6,memoryReady=process.memoryUsage(),startupMaxRssKiB=process.resourceUsage().maxRSS;
const maturityStart=Date.now();
while(pendingAssets.size){if(Date.now()-maturityStart>30000)throw Error('pending assets timeout '+JSON.stringify([...pendingAssets]));await new Promise(r=>setTimeout(r,5));}
if(assetErrors.length)throw Error('asset error '+JSON.stringify(assetErrors));
const paintStates=[],nineDragon=[];const seenMaterial=new Set();
for(const r of [scene,...[...zoneManager.prebuilt.values()].map(e=>e.data.group)])r.traverse(o=>{
 if(o.userData?.paintState)paintStates.push({name:o.name,key:'paintState',state:o.userData.paintState});
 for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){if(seenMaterial.has(m))continue;seenMaterial.add(m);
 for(const key of ['screenPaintState','friezePaintState'])if(m.userData?.[key])paintStates.push({name:m.name,key,state:m.userData[key]});
 if(m.name==='kit_nine_dragon_face'){const image=m.map?.image;if(!image?.width||!image?.height)throw Error('nine dragon not decoded');nineDragon.push({name:m.name,width:image.width,height:image.height});}
 }});
if(paintStates.length!==3||paintStates.some(p=>p.state!=='ready')||nineDragon.length!==1)throw Error('maturity incomplete '+JSON.stringify({paintStates,nineDragon}));
const maturity={assetEvents,assetErrors,paintStates,nineDragon,pending:[...pendingAssets],waitMs:Date.now()-maturityStart,scope:'actual local decoding and Canvas2D callbacks; NOT GPU'};
const snapshot=options.snapshot==='true'?snapshotWorld({scene,builders:[library,environment,palaceBuilder,enclosure,garden,roomNightLights,flight],zoneManager,collisionManager:cm,characters,createCanvas:platform.createCanvas}):{status:'NOT_REQUESTED: timings exclude heavyweight equivalence capture'};
const resources=resourceInventory([scene,library,environment,palaceBuilder,enclosure,garden,zoneManager,cm,roomNightLights,flight]);
const state={loaded:[...zoneManager.loaded.keys()],prebuilt:[...zoneManager.prebuilt.keys()],queued:[...zoneManager.buildQueue],rooms:rooms.length,mapItems:zoneManager.getMapItems().length,nightSites:roomNightLights.sites.length,nightSitesSha:sha256(JSON.stringify(roomNightLights.sites)),nightUnplacedSha:sha256(JSON.stringify(roomNightLights.unplaced)),nightUnplaced:roomNightLights.unplaced.length,flight:flight.summary(),flightHeightsSha:sha256(Buffer.from(flight.heights.buffer)),flightWaterSha:sha256(Buffer.from(flight.water.buffer)),characters:characters.snapshot(),colliders:cm.colliders.length,walkables:cm.walkables.length};
phase('dispose',()=>{flightTour.dispose();historicalLamps.dispose();characters.dispose();interiors.dispose();controls.dispose?.();roomNightLights.dispose();zoneManager.dispose();garden.dispose();enclosure.dispose();palaceBuilder.dispose();environment.dispose();library.dispose();});
globalThis.gc?.();const after=bindRoot(root);if(JSON.stringify(after)!==JSON.stringify(binding))throw Error('source changed during process');
if(JSON.stringify(driverBinding())!==JSON.stringify(driver))throw Error('measurement driver changed during process');
const output={canopyFitTimes:globalThis.__r116FitTimes,maturity,driver,protocol:'r116-startup-cpu-v4',scenario:options.scenario,quality:options.quality,binding,configuration:{reuseInactive:true,seed:platform.seed,textureQuality:library.quality,transport:platform.transport,fixedDate:'2026-10-26T04:00:00Z'},NOT_RUN:['GPU renderer/shader/upload/IBL','browser/network loading','mobile device','character first submitted instance (separate scenario pending)','UI and postprocessing readiness'],phases,readyCpuMs,zoneBuildCount,zoneBuilds,kitFinish,registration,state,snapshot,resources,memory:{startupMaxRssKiB,peakMeaning:'OS process RSS high-water through startup before heavy snapshot/inventory; heap/external/arrayBuffers are boundary samples only',before:memoryBefore,ready:memoryReady,afterDispose:process.memoryUsage()},gc:typeof globalThis.gc==='function'};
fs.mkdirSync(path.dirname(options.out),{recursive:true});fs.writeFileSync(options.out,JSON.stringify(output,null,2)+'\n');hook.deregister();
