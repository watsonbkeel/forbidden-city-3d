import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { createDOM } from './ui-dom.mjs';
import * as THREE from 'three';
import { CollisionManager } from '../../src/utils/Collision.js';
import { Environment } from '../../src/scene/Environment.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const three = pathToFileURL(createRequire(import.meta.url).resolve('three')).href.replace('/three.cjs', '/three.module.js');
const hash = source => createHash('sha256').update(source).digest('hex');
const sourceFiles = ['main.js', 'src/scene/characters/CharacterSystem.js', 'src/scene/characters/CharacterManager.js', 'src/scene/characters/CharacterRenderer.js', 'src/scene/characters/CharacterWorldAdapter.js', 'src/ui/SettingsMenu.js'];
const generic = name => `export class ${name} { constructor(){this.state='idle';this.visible=false;this.occupied=false;this.container=document.createElement('div');this.targets=new Map();} init(){} update(){} render(){} onResize(){} setQuality(){} setMuted(){} start(){} dispose(){} placeBelow(){} getMapMarker(){} allowWalkingTeleport(){return true;} }`;
const stubs = {
 'src/utils/TextureLibrary.js': `export class TextureLibrary { constructor(){return globalThis.__r51ProductionWorld.lib;} }`,
 'src/scene/Environment.js': `export class Environment { constructor(){this.dayCycle={lighting:{daylight:1},beijingTime:{minutesOfDay:600}};} init(){} setQuality(){} update(){} dispose(){} }`,
 'src/scene/PalaceBuilder.js': `export class PalaceBuilder { constructor(scene){this.scene=scene;} buildAll(){const w=globalThis.__r51ProductionWorld;for(const child of [...w.scene.children])this.scene.add(child);} getColliders(){return [];} getWalkables(){return [];} update(){} dispose(){} }`,
 'src/scene/Enclosure.js': `export class Enclosure { build(){return this;} getColliders(){return [];} update(){} dispose(){} }`,
 'src/scene/GardenBuilder.js': `export class GardenBuilder { build(){return this;} getColliders(){return [];} getWalkables(){return [];} update(){} dispose(){} }`,
 'src/utils/Collision.js': `export class CollisionManager { constructor(){return globalThis.__r51ProductionWorld.cm;} }`,
 'src/scene/zones/ZoneManager.js': `export class ZoneManager { constructor(){const w=globalThis.__r51ProductionWorld;this.loaded=w.zoneManager.loaded;this.zones=new Map();this.prebuilt=new Map();} register(zone){this.zones.set(zone.id,zone);} init(scene){scene.userData.zoneManager=this;} getRegions(){return globalThis.__r51ProductionWorld.regions??[];} getRooms(){return globalThis.__r51ProductionWorld.rooms??[];} getMapItems(){return globalThis.__r51ProductionWorld.mapItems??[];} getLoadedIds(){return [...this.loaded.keys()];} getCurrentId(){return 'static';} update(){} dispose(){} }`,
 'src/controls/FirstPerson.js': `export class FirstPersonControls { constructor(camera){this.camera=camera;this.controls={isLocked:false,addEventListener(){},removeEventListener(){}};this.motion={speed:0,sprint:false,footstep:false};} setPosition(x,y,z){this.camera.position.set(x,y,z);} lookAt(x,z){this.camera.lookAt(x,this.camera.position.y,z);} getPosition(){return this.camera.position;} isLocked(){return false;} update(){} setMapOpen(){} setFreeMove(){} stop(){} unlock(){} lock(){} dispose(){} }`,
 'src/scene/interior/InteriorLoader.js': `export class InteriorLoader { update(){} setSuspended(){} dispose(){} }`,
 'src/scene/flight/FlightEnvelope.js': `export const FLIGHT_BOUNDS={};export const createPalaceFlightEnvelope=()=>({});`,
 ...Object.fromEntries([
  ['src/render/PostProcessing.js','PostProcessing'],['src/audio/Ambience.js','Ambience'],['src/ui/Minimap.js','Minimap'],['src/ui/Teleport.js','Teleport'],['src/ui/PerfHUD.js','PerfHUD'],['src/scene/flight/FlightTour.js','FlightTour'],['src/scene/sky/HistoricalSkyLamps.js','HistoricalSkyLamps'],['src/ui/DayNightPanel.js','DayNightPanel'],['src/ui/HelpPanel.js','HelpPanel'],
 ].map(([p,n])=>[p,generic(n)])),
};

/** Production-compile the complete real main class. The only main transform is
 * removing its automatic bootstrap and exporting the class. No method body is
 * rewritten. Dependency seams are explicitly listed in the returned evidence.
 * These are CPU integration tests, never WebGL/browser/visual acceptance. */
export async function compileProductionMain({ frozenDirectory = null, sourceOverrides = {} } = {}) {
 const sources = new Map(sourceFiles.map(p=>[path.join(root,p),sourceOverrides[p] ?? fs.readFileSync(frozenDirectory && ['main.js','CharacterSystem.js','CharacterManager.js','SettingsMenu.js'].includes(path.basename(p)) ? path.join(frozenDirectory,path.basename(p)) : path.join(root,p),'utf8')]));
 const main = sources.get(path.join(root,'main.js'));
 const bootstrap = main.indexOf('\nconst app = new ForbiddenCityApp();');
 if(bootstrap < 0 || main.indexOf('const app = new ForbiddenCityApp();', bootstrap+2)>=0)throw Error('Unrecognized main bootstrap seam');
 const exportedMain = main.slice(0,bootstrap)+'\nexport { ForbiddenCityApp };\n';
 const bundle = await build({root,configFile:false,envFile:false,publicDir:false,logLevel:'silent',
  define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.BASE_URL':'"/forbidden-city-3d/"'},
  plugins:[{name:'r51-production-main-cpu-seams',enforce:'pre',
   resolveId(id,importer){
    if(id==='r51-main-entry'||id.endsWith('/r51-main-entry'))return '\0r51-main-entry';
    if(id==='three'&&importer===path.join(root,'main.js'))return '\0r51-three-main-gpu-shell';
    if(importer===path.join(root,'main.js')){const rel=id.replace(/^\.\//,'');if(stubs[rel])return '\0r51-stub:'+rel;}
    return null;
   },
   load(id){
    if(id==='\0r51-main-entry')return `export {ForbiddenCityApp} from ${JSON.stringify(path.join(root,'main.js'))};export {CHARACTER_REGISTRY} from ${JSON.stringify(path.join(root,'data/characters/index.js'))};`;
    if(id==='\0r51-three-main-gpu-shell')return `export * from 'three';export class WebGLRenderer { constructor(){this.domElement=document.createElement('canvas');this.shadowMap={};this.capabilities={getMaxAnisotropy:()=>1};} setSize(){} setPixelRatio(){} dispose(){} }`;
    if(id.startsWith('\0r51-stub:'))return stubs[id.slice('\0r51-stub:'.length)];
    if(id===path.join(root,'main.js'))return exportedMain;
    return sources.get(id)??null;
   },
  }],build:{write:false,minify:false,target:'esnext',lib:{entry:'r51-main-entry',formats:['es']},rollupOptions:{external:(id,importer)=>id==='three'&&importer!==path.join(root,'main.js'),output:{paths:{three}}}}});
 const code=(Array.isArray(bundle)?bundle[0]:bundle).output.find(x=>x.type==='chunk'&&x.isEntry).code;
 const module=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 return {module,code,evidence:{kind:'Vite production-compiled complete main class with explicit CPU dependency seams',mainSourceSha256:hash(main),mainClassBytesSha256:hash(main.slice(0,bootstrap)),productionBundleSha256:hash(code),mainTransform:'Only remove automatic bootstrap beginning at const app = new ForbiddenCityApp(); and export ForbiddenCityApp; all preceding bytes unchanged.',unmodifiedMainMethods:['constructor','init','createScene','createCamera','createRenderer','createUI','animate','dispose'],realCharacterModules:['CharacterSystem','CharacterManager','CharacterWorldAdapter','CharacterRenderer','CharacterResourcePool','CharacterKit','PatrolController','SettingsMenu'],dependencySeams:Object.keys(stubs),gpuSeam:'THREE.WebGLRenderer shell only. All other THREE classes, including Scene, PerspectiveCamera, Mesh, and InstancedMesh, are real.',sources:Object.fromEntries([...sources].map(([p,s])=>[path.relative(root,p),hash(s)]))}};
}

export function lightWorld() {
 const scene=new THREE.Scene(),cm=new CollisionManager(),mats=new Map();
 const lib={material:(name,options={})=>{if(!mats.has(name))mats.set(name,new THREE.MeshStandardMaterial({name,...options}));return mats.get(name);},tileSize:()=>1,aspect:()=>1,load:async()=>{},dispose(){}};
 const env=new Environment(scene,null,lib);env.setupGround();scene.updateMatrixWorld(true);
 return {scene,cm,lib,zoneManager:{loaded:new Map()},kind:'Production Environment.setupGround geometry only; not full architecture'};
}

export function installMainEnvironment(world) {
 const prior=Object.fromEntries(['document','window','navigator','requestAnimationFrame','cancelAnimationFrame','__r51ProductionWorld'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const dom=createDOM();dom.document.hidden=false;dom.document.createTextNode=text=>{const e=dom.document.createElement('span');e.textContent=text;return e;};
 const oldCreate=dom.document.createElement;
 dom.document.createElement=tag=>{const el=oldCreate(tag);el.replaceChildren=(...nodes)=>{for(const c of [...el.children])c.remove();el.append(...nodes);};return el;};
 Object.assign(dom.window,{innerWidth:1280,innerHeight:720,devicePixelRatio:1,location:{search:''}});
 let frameId=0;const frames=new Map();
 Object.defineProperty(globalThis,'navigator',{value:{userAgent:'R51 CPU integration',maxTouchPoints:0},configurable:true});
 Object.assign(globalThis,{document:dom.document,window:dom.window,__r51ProductionWorld:world,requestAnimationFrame:cb=>{const id=++frameId;if(cb.name==='bound animate')frames.set(id,cb);else queueMicrotask(()=>cb(performance.now()));return id;},cancelAnimationFrame:id=>frames.delete(id)});
 if(!world.lib){const mats=new Map();world.lib={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>1,aspect:()=>1,load:async()=>{},dispose(){}};}
 return {dom,frames,restore(){for(const [k,desc]of Object.entries(prior)){if(desc)Object.defineProperty(globalThis,k,desc);else delete globalThis[k];}}};
}

export function submittedInstances(app) {
 const root=app.characters.renderer.root;
 return {rootName:root.name,rootAttachedToMainScene:root.parent===app.scene,instances:root.children.reduce((n,m)=>n+(m.isInstancedMesh?m.count:0),0),meshes:root.children.map(m=>({name:m.name,isInstancedMesh:m.isInstancedMesh,count:m.count,vertices:m.geometry.attributes.position.count,indices:m.geometry.index?.count??0}))};
}

export async function advanceMain(app,{daylight=1,maxFrames=12000,until=()=>false}={}){
 app.environment.dayCycle.lighting.daylight=daylight;
 for(let frame=0;frame<maxFrames;frame++){
  app.lastFrameTime=performance.now()-100;
  app.animate();
  await Promise.resolve();
  if(until(app,frame))return frame+1;
 }
 return maxFrames;
}
