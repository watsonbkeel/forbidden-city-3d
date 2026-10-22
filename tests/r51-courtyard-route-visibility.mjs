// Actual map destination selection (Teleport.go), FirstPersonControls walking,
// dynamic ZoneManager, and unmodified production character pipeline.
// CPU submitted-instance triangle rays only. No browser/GPU acceptance claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks,createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {createDOM} from './lib/ui-dom.mjs';
import {exportProductionView} from './lib/r51-production-raster.mjs';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
import {characterGeometryOptionsFor} from '../src/scene/characters/CharacterGeometryOptions.js';
const root=new URL('../',import.meta.url);
const dom=createDOM(),create=dom.document.createElement;
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
dom.document.createElement=t=>t==='canvas'?createCanvas(1,1):create(t);
dom.document.createElementNS=()=>({addEventListener(){},removeEventListener(){}});
dom.document.hidden=false;dom.document.body.ownerDocument=dom.document;
Object.assign(dom.window,{location:{search:''},innerWidth:1280,innerHeight:720});
Object.assign(globalThis,{document:dom.document,window:dom.window});
Object.defineProperty(globalThis,'navigator',{value:{userAgent:'CPU route diagnostic',maxTouchPoints:0},configurable:true});
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {ZONES}=await import('../data/zones/index.js');
const {Teleport}=await import('../src/ui/Teleport.js');
const {FirstPersonControls}=await import('../src/controls/FirstPerson.js');hook.deregister();
const {PALACE_LAYOUT}=await import('../src/scene/Layout.js');
const {PalaceBuilder}=await import('../src/scene/PalaceBuilder.js');
const {ZoneManager}=await import('../src/scene/zones/ZoneManager.js');
const {Environment}=await import('../src/scene/Environment.js');
const {CollisionManager}=await import('../src/utils/Collision.js');
const {CharacterSystem}=await import('../src/scene/characters/CharacterSystem.js');
const {getBeijingDayCycle}=await import('../src/scene/sky/BeijingDayCycle.js');
const {CHARACTER_REGISTRY}=await import('../data/characters/index.js');
const sourceFiles=['src/scene/characters/CharacterSystem.js','src/scene/characters/CharacterManager.js','src/scene/characters/CharacterRenderer.js','src/scene/characters/CharacterWorldAdapter.js','src/controls/FirstPerson.js','src/ui/Teleport.js','src/scene/zones/ZoneManager.js','data/characters/actors.json','data/characters/paths.json','data/zones/west-six.json'];
const hashes=()=>Object.fromEntries(sourceFiles.map(p=>[p,createHash('sha256').update(fs.readFileSync(new URL(p,root))).digest('hex')]));
const report={proofBoundary:'CPU exact deformed triangles from production instance streams, not browser, WebGL, GPU, textures, shadows, or historical acceptance.',scope:'All 38 registry actors retained; all actual PALACE_LAYOUT architecture and all production zone data registered/prebuilt. ZoneManager dynamically attaches/unloads actual groups/colliders. Environment.setupGround only; unrelated sky, Enclosure, Garden, optional streamed interior overlays are omitted. Walking uses actual FirstPersonControls.update with its previous-time input set to 1/60s; no character, architecture, collision, binding, position or scale substitution. Map selection is actual Teleport.go, not a rendered map click.',sourceHashes:hashes(),date:'2026-10-22T08:20:10Z',daylight:getBeijingDayCycle(new Date('2026-10-22T08:20:10Z')).lighting.daylight,registryCount:CHARACTER_REGISTRY.actors.length,routes:[],samples:[],lifecycle:[]};
const scene=new T.Scene(),cm=new CollisionManager(),mats=new Map(),lib={material:(n,p={})=>{const k=n+JSON.stringify(p);if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({name:n,...p}));return mats.get(k);},tileSize:()=>1,aspect:()=>1};
const env=new Environment(scene,null,lib);env.setupGround();
const pb=new PalaceBuilder(scene,lib);pb.buildAll(PALACE_LAYOUT);cm.addColliders(pb.getColliders());cm.addWalkables(pb.getWalkables());
const zones=new ZoneManager();for(const z of ZONES)zones.register(z);zones.init(scene,lib,cm,{x:0,z:-494});
const camera=new T.PerspectiveCamera(60,1280/720,.1,2000);
const controls=new FirstPersonControls(camera,dom.document.body,cm);controls.setHeadBob(false);controls.setFreeMove(true);controls.setPosition(0,1.7,-494);controls.lookAt(0,-450);
const teleport=new Teleport(controls,zones,cm);
const system=new CharacterSystem({scene,camera,collisionManager:cm,zoneManager:zones,documentObject:dom.document});
let submitted=[];const originalRender=system.renderer.render.bind(system.renderer);
system.renderer.render=(actors,...args)=>{submitted=actors.map(a=>({...a,position:[...a.position]}));return originalRender(actors,...args);};
function key(code,down){(down?controls.onKeyDown.bind(controls):controls.onKeyUp.bind(controls))({code,target:dom.document.body,repeat:false,preventDefault(){}});}
async function tick(walk=false){if(walk){controls.prevTime=performance.now()-1000/60;controls.update();}camera.updateMatrixWorld(true);zones.update(camera.position);system.update(1/60,{daylight:report.daylight,quality:'high',viewportHeight:720});await Promise.resolve();assert.equal(system.lastError,null);}
async function frames(n){for(let i=0;i<n;i++)await tick();}
const stateIds=ids=>ids.map(id=>{const s=system.manager.states.get(id);return{id,bound:!!s?.binding,position:s?.binding?.position,pending:s?.pending,error:s?.error,readiness:s?.readiness,lod:s?.lod,submitted:submitted.filter(a=>a.id===id).map(a=>({position:a.position,lod:a.lod,visibility:a.visibility}))};});
async function ready(ids,max=6000){for(let i=0;i<max;i++){await tick();if(ids.every(id=>submitted.some(a=>a.id===id&&a.visibility>=.999)))return i+1;}throw Error('Unready '+JSON.stringify({ids:stateIds(ids),queue:system.world.work.snapshot(),status:system.statusSnapshot()}));}
async function walkTo(x,z){const row={from:camera.position.toArray(),target:[x,z],frames:0,distance:0,maxStep:0,collisions:0};let previous=camera.position.clone(),stuck=0;
 key('KeyW',true);
 try{for(let i=0;i<4000;i++){
  if(Math.hypot(x-camera.position.x,z-camera.position.z)<.12)break;
  controls.lookAt(x,z);controls.keyPressTimes.set('KeyW',performance.now());
  await tick(true);const d=Math.hypot(camera.position.x-previous.x,camera.position.z-previous.z);row.distance+=d;row.maxStep=Math.max(row.maxStep,d);row.frames++;row.collisions+=Number(cm.checkCollision(camera.position,.5));stuck=d<.0001?stuck+1:0;previous.copy(camera.position);if(stuck>30)break;
 }}finally{key('KeyW',false);controls.stop();}
 row.end=camera.position.toArray();row.remaining=Math.hypot(x-camera.position.x,z-camera.position.z);row.reached=row.remaining<.12;report.routes.at(-1).walk.push(row);console.log('WALK',JSON.stringify(row));assert.ok(row.reached,'Actual controller route blocked: '+JSON.stringify(row));assert.equal(row.collisions,0);return row;
}
async function enter(name,points){const landing=teleport.go(name);assert.ok(landing,'Teleport.go '+name+' must return actual safe landing');const row={mapDestination:name,landing,landingCamera:camera.position.toArray(),landingCollision:cm.checkCollision(camera.position,.5),walk:[]};report.routes.push(row);assert.equal(row.landingCollision,false);for(const p of points)await walkTo(...p);return row;}
function keyFor(a){const o=characterGeometryOptionsFor(a);return[a.templateId,a.pose,a.lod,a.zoneRef,o.seatVariant].join('|')+(o.femalePose?'|femalePose='+o.femalePose:'');}
function instances(){const groups=new Map();for(const a of submitted){const k=keyFor(a);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(a);}
 const out=[];for(const [key,actors]of groups){const batch=system.renderer.batches.get(key);assert.equal(batch.mesh.count,actors.length);for(let ii=0;ii<actors.length;ii++){
  const source=batch.mesh.geometry,g=source.clone(),a=g.attributes,anim=source.attributes.characterAnim;
  const animation={time:system.renderer.timeUniform.value,phase:anim.getX(ii),amplitude:anim.getY(ii),walkSpeed:anim.getZ(ii),poseIndex:anim.getW(ii)};
  for(let vi=0;vi<a.position.count;vi++){const d=deformCharacterVertex([a.position.getX(vi),a.position.getY(vi),a.position.getZ(vi)],[a.normal.getX(vi),a.normal.getY(vi),a.normal.getZ(vi)],{part:a.characterPart.getX(vi),pivot:[a.characterPivot.getX(vi),a.characterPivot.getY(vi),a.characterPivot.getZ(vi)],weight:a.characterWeight.getX(vi),torsoWeight:a.characterTorsoWeight.getX(vi)},animation);a.position.setXYZ(vi,...d.position);a.normal.setXYZ(vi,...d.normal);}
  g.computeBoundingBox();g.computeBoundingSphere();const mesh=new T.Mesh(g,system.renderer.material);mesh.name=actors[ii].id;batch.mesh.getMatrixAt(ii,mesh.matrix);mesh.matrix.premultiply(batch.mesh.matrixWorld);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.updateMatrixWorld(true);out.push({actor:actors[ii],mesh,batch:key,index:ii,visibility:a.characterVisibility.getX(ii)});
 }}return out;}
function raysFor(target,objects){
 const mesh=target.mesh,g=mesh.geometry,p=g.attributes.position,idx=g.index,vertices=[new T.Vector3(),new T.Vector3(),new T.Vector3()],normal=new T.Vector3(),center=new T.Vector3(),front=[];
 for(let k=0;k<(idx?.count??p.count);k+=3){for(let j=0;j<3;j++)vertices[j].fromBufferAttribute(p,idx?idx.getX(k+j):k+j).applyMatrix4(mesh.matrixWorld);center.copy(vertices[0]).add(vertices[1]).add(vertices[2]).multiplyScalar(1/3);normal.subVectors(vertices[1],vertices[0]).cross(new T.Vector3().subVectors(vertices[2],vertices[0]));if(normal.dot(camera.position.clone().sub(center))<=0)continue;front.push({triangle:k/3,world:center.clone(),local:mesh.worldToLocal(center.clone())});}
 const ray=new T.Raycaster(),hits=[];for(const fraction of [.2,.4,.6,.8,.95])for(const x of [-.12,0,.12]){
  const y=g.boundingBox.min.y+fraction*(g.boundingBox.max.y-g.boundingBox.min.y),chosen=front.reduce((b,v)=>{const score=(v.local.y-y)**2+(v.local.x-x)**2;return!b||score<b.score?{...v,score}:b;},null);assert.ok(chosen);
  const delta=chosen.world.clone().sub(camera.position);ray.set(camera.position,delta.clone().normalize());ray.near=.001;ray.far=delta.length()+.01;const own=ray.intersectObject(mesh,false)[0];assert.ok(own,'Ray hits actual actor triangle');const first=ray.intersectObjects(objects,false)[0],ndc=chosen.world.clone().project(camera);hits.push({fraction,x,triangle:chosen.triangle,target:chosen.world.toArray(),inViewport:Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z>=-1&&ndc.z<=1,visible:first?.object===mesh,first:first?{name:first.object.name,material:first.object.material?.name,distance:first.distance}:null});
 }return{visible:hits.filter(h=>h.visible&&h.inViewport).length,total:hits.length,hits};}
async function sample(label,ids,target,{exportGeometry=true}={}){
 camera.lookAt(...target);camera.updateMatrixWorld(true);const preparedFrames=await ready(ids);await frames(30);scene.updateMatrixWorld(true);
 const active=instances(),arch=[];scene.traverse(m=>{if(!m.isMesh||m.userData.characterBatch)return;for(let p=m;p;p=p.parent)if(!p.visible)return;arch.push(m);});
 const all=[...arch,...active.map(a=>a.mesh)],row={label,camera:camera.position.toArray(),cameraCollision:cm.checkCollision(camera.position,.5),preparedFrames,loadedZones:zones.getLoadedIds(),actors:[]};
 for(const id of ids){const copies=active.filter(a=>a.actor.id===id);assert.equal(copies.length,1,'One settled render instance for '+id);const a=copies[0];row.actors.push({id,position:a.actor.position,lod:a.actor.lod,batch:a.batch,instanceIndex:a.index,visibility:a.visibility,rays:raysFor(a,all)});}
 for(const a of active)a.mesh.geometry.dispose();
 if(exportGeometry){fs.mkdirSync('/tmp/r51-courtyard-route-geometry',{recursive:true});row.geometryExport=exportProductionView({scene,camera,characters:system},`/tmp/r51-courtyard-route-geometry/${label}.json.gz`,{far:70});}
 report.samples.push(row);console.log('SAMPLE',JSON.stringify({label,camera:row.camera,preparedFrames,actors:row.actors.map(a=>({id:a.id,position:a.position,visibility:a.visibility,rays:a.rays.visible,blockers:[...new Set(a.rays.hits.filter(h=>!h.visible).map(h=>h.first?.name+':'+h.first?.material))]}))}));
 assert.equal(row.cameraCollision,false);for(const a of row.actors){assert.equal(a.visibility,1);assert.ok(a.rays.visible>0,label+' '+a.id+' has visible actual triangles');}return row;
}
const Y=['yongshou-consort-01','yongshou-maid-01'],K=['yikun-consort-01','yikun-eunuch-01'],P=['west-lane-guard-01','west-lane-guard-02','west-lane-guard-03'];
try{
 assert.equal(report.registryCount,38);await frames(120);
 await enter('永寿门',[[95.4,308.5],[94.9,309.5]]);await sample('yongshou-court',Y,[94.9,1,316]);
 await enter('翊坤门',[[94.6,363],[92,363]]);await sample('yikun-court',K,[90.15,1,369.5]);
 await enter('永寿门',[[95.4,301],[122,301],[122,314]]);const before=await sample('west-second-lane',P,[122,1,331]);
 await frames(600);const after=await sample('west-second-lane-after-10s',P,[122,1,331],{exportGeometry:false});
 const movements=P.map(id=>{const a=before.actors.find(a=>a.id===id),b=after.actors.find(a=>a.id===id);return{id,from:a.position,to:b.position,distanceMeters:new T.Vector3(...a.position).distanceTo(new T.Vector3(...b.position))};});for(const m of movements)assert.ok(m.distanceMeters>1,'Patrol actually moved: '+m.id);report.lifecycle.push({kind:'patrol-motion',approximateSimulationGapSeconds:10.5,movements});
 system.setEnabled(false);await frames(2);assert.equal(system.renderer.batches.size,0);report.lifecycle.push({kind:'off',status:system.statusSnapshot(),batches:system.renderer.batches.size});
 system.setEnabled(true);await sample('patrol-after-on',P,[122,1,331],{exportGeometry:false});report.lifecycle.push({kind:'on',status:system.statusSnapshot(),actors:stateIds(P)});
 await enter('午门',[]);await frames(120);assert.equal(zones.loaded.has('west-six'),false);assert.ok(!submitted.some(a=>a.zoneRef==='west-six'));report.lifecycle.push({kind:'zone-unloaded',loadedZones:zones.getLoadedIds(),westActorInstances:submitted.filter(a=>a.zoneRef==='west-six').length,states:stateIds([...Y,...K,...P])});
 await enter('永寿门',[[95.4,308.5],[94.9,309.5]]);await sample('yongshou-after-zone-reentry',Y,[94.9,1,316],{exportGeometry:false});
 await enter('翊坤门',[[94.6,363],[92,363]]);await sample('yikun-after-zone-reentry',K,[90.15,1,369.5],{exportGeometry:false});
 report.finalSourceHashes=hashes();assert.deepEqual(report.finalSourceHashes,report.sourceHashes,'Production sources stable throughout run');report.success=true;
}catch(e){report.success=false;report.error=String(e);throw e;}finally{
 fs.mkdirSync(new URL('reports/r51-visibility/',root),{recursive:true});fs.writeFileSync(new URL('reports/r51-visibility/r51-courtyard-route-visibility.json',root),JSON.stringify(report,null,2)+'\n');teleport.dispose();controls.dispose();system.dispose();zones.dispose();pb.dispose();
}
