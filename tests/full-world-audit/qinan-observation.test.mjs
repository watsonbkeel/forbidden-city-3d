import test from 'node:test';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import * as T from 'three';import {registerHooks} from 'node:module';
import {buildWorld} from '../lib/world.mjs';import {replayTerrace} from '../lib/terrace-walk.mjs';import {QINAN_PROFILE,qinanGeometry} from '../../src/scene/palace/special/QinanProfile.js';import {createDOM} from '../lib/ui-dom.mjs';import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';import {Environment} from '../../src/scene/Environment.js';import {FirstPersonControls} from '../../src/controls/FirstPerson.js';import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
const hook=registerHooks({load(url,c,next){return next(url,url.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});const {Teleport}=await import('../../src/ui/Teleport.js'),{ZONES}=await import('../../data/zones/index.js');hook.deregister();
test('real Teleport.go source owner residency and original controller',async t=>{
 const W=await buildWorld({zones:[],statics:true,retainScene:true,realMaterials:true,realFinish:true});const dom=createDOM(),doc=globalThis.document,win=globalThis.window,create=dom.document.createElement.bind(dom.document);
 dom.document.createElement=s=>s==='canvas'?doc.createElement(s):create(s);dom.document.createElementNS=doc.createElementNS.bind(doc);dom.document.body.ownerDocument=dom.document;
 dom.window.location={search:process.env.QINAN_AUDIT_RESIDENCY==='all'?'?zones=all':''};globalThis.document=dom.document;globalThis.window=dom.window;
 const lib=realTextureLibrary(), env=new Environment(W.scene,null,lib), zm=new ZoneManager();let controls,tel;
 try{
 env.setupGround();for(const z of ZONES)zm.register(z);
 zm.init(W.scene,lib,W.cm,{x:18,z:477});
 const camera=new T.PerspectiveCamera();controls=new FirstPersonControls(camera,dom.document.body,W.cm);controls.setPosition(0,1.7,-494);tel=new Teleport(controls,zm,W.cm);
 const others=[];for(const name of tel.targets.keys()){if(name=== '钦安殿')continue;try{others.push([name,tel.landingFor(name)]);}catch(e){others.push([name,'error:'+e.message]);}};console.log('OTHER_TARGETS',others.length,createHash('sha256').update(JSON.stringify(others)).digest('hex'));
 const digest=profile=>{const v=structuredClone(profile);delete v.profileHash;const canonical=x=>x&&typeof x==='object'?(Array.isArray(x)?x.map(canonical):Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])]))):x;return createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');};
 const historical=structuredClone(QINAN_PROFILE);historical.navigation.position.z=477;
 assert.equal(digest(historical),'7c829298deee95c8b8b1857aac9b1fcbfb910b6585dbc1b4056ae349877ebd2a','only the named viewing coordinate differs from R49 architecture/navigation');
 assert.equal(digest(QINAN_PROFILE),QINAN_PROFILE.profileHash);
 assert.equal(others.length,194);assert.equal(createHash('sha256').update(JSON.stringify(others)).digest('hex'),'a25dc3ad819241b51cfc8f14288ea13376a963316071c047e2bc39f784583284','unchanged other registered target descriptors');
 const name='钦安殿', g=tel.geometryFor(name),p=tel.go(name);
 assert.ok(p?.viewpointVerified);assert.deepEqual([p.x,p.z,p.y,p.lookAtX,p.lookAtY,p.lookAtZ],[18,470,0,0,3,481.08]);
 assert.equal(p.mode,'exterior-view');assert.equal(p.zone,'garden');assert.equal(p.fallback,false);
 assert.match(tel.overlay.textContent,/地面观览点/);assert.deepEqual(controls.getPosition().toArray(),[18,1.7,470]);
 assert.ok(controls.camera.getWorldDirection(new T.Vector3()).distanceTo(new T.Vector3(0,3,481.08).sub(controls.getPosition()).normalize())<1e-8);
 const expectedIds=process.env.QINAN_AUDIT_RESIDENCY==='all'?ZONES.map(z=>z.id):['garden','axis-courts','east-six','west-six'];assert.deepEqual([...zm.getLoadedIds()].sort(),[...expectedIds].sort());
 const vintage={...g,navigation:{...g.navigation,position:{...g.navigation.position,z:477}}};assert.equal(tel.isExteriorViewSafe(tel.candidate(vintage,8,0),vintage),false,'real historical obstruction retained, never ignored');
 const cm=W.cm,body=new T.Box3(new T.Vector3(17.5,.01,469.5),new T.Vector3(18.5,2.05,470.5));
 assert.equal(cm.getGroundHeight(18,470,Infinity),0);assert.equal(cm.queryBox(body).filter(c=>c.box.intersectsBox(body)).length,0);
 // Genuine scene submissions (no GPU rasterization); clip only far, irrelevant bounding boxes.
 // Alpha-tested pixels are not evaluated. We conservatively retain their triangles.
 const clip=new T.Box3(new T.Vector3(-4,-.25,461),new T.Vector3(24,7,482)),boxes=cm.colliders.filter(c=>clip.intersectsBox(c.box)),face=boxes.find(c=>c.tag==='garden'&&Math.abs(c.box.min.x+2.145)<1e-6&&Math.abs(c.box.min.z-480.98)<1e-6);assert.ok(face);
 const solids=boxes.filter(c=>c!==face),meshes=[];W.scene.updateMatrixWorld(true);
 W.scene.traverseVisible(m=>{if(!m.isMesh)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();if(clip.intersectsBox(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)))meshes.push(m);});
 function panel(z){let visible=0,clearUpper=0;const eye=new T.Vector3(18,1.7,z);
 for(const x of [-1.2,-.6,0,.6,1.2])for(const y of [2.5,2.75,3,3.25,3.5]){
   const goal=new T.Vector3(x,y,481.08),direction=goal.clone().sub(eye).normalize(),ray=new T.Ray(eye,direction),end=ray.intersectBox(face.box,new T.Vector3());assert.ok(end);
   const raycast=new T.Raycaster(eye,direction,0,eye.distanceTo(goal)+1.3);const hit=raycast.intersectObjects(meshes,false).find(h=>{const m=Array.isArray(h.object.material)?h.object.material[h.face.materialIndex]:h.object.material;return m?.visible&&m.opacity!==0;});
   if(hit&&Math.abs(hit.point.x)<=2.15&&hit.point.y>=1.49&&hit.point.y<=4.63&&hit.point.z>=480.72&&hit.point.z<=481.23)visible++;
   const hitBox=new T.Vector3();if(y>=2.75&&!solids.some(c=>ray.intersectBox(c.box.clone().expandByScalar(.1),hitBox)&&eye.distanceTo(hitBox)<eye.distanceTo(end)-1e-5))clearUpper++;
 }return {visible,clearUpper};}
 const panelBefore=panel(477),panelAfter=panel(470);assert.ok(panelBefore.visible<5);assert.deepEqual(panelAfter,{visible:25,clearUpper:20});
 // Explicit negative controls: reject another real collider and unloaded cached geometry.
 const blocker=new T.Box3(new T.Vector3(8,0,474),new T.Vector3(10,8,478));
 const pose=tel.capturePose();cm.addCollider(blocker,'qinan-r3-foreign-obstruction');try{assert.equal(tel.go(name),null);assert.deepEqual(tel.capturePose(),pose);assert.match(tel.overlay.textContent,/暂不能传送/);}finally{cm.removeByTag('qinan-r3-foreign-obstruction');}
 assert.ok(tel.resolveLanding(name));zm.unloadZone('garden');assert.equal(tel.resolveLanding(name),null);assert.ok(tel.go(name)?.viewpointVerified);
 const sourceItem=ZONES.find(z=>z.id==='garden').items.find(row=>row.name===name);const route=qinanGeometry(sourceItem).navigation.virtualRoutes.find(route=>route.points[0][0]===18).points;
 const paths={oldNewOld:[[18,477],[18,470],[18,477]],publicSouthRoad:[[18,470],[18,465],[18,455],[18,465],[18,470]],sideInterior:[[18,470],...route,...route.slice(0,-1).reverse(),[18,470]]};
 for(const [key,points] of Object.entries(paths))for(const fps of[10,60]){
  const r=replayTerrace(t,W,points,{fps,recordFrames:true});assert.ok(r.arrived,`${key} ${fps}Hz ${r.stuckAt}`);assert.equal(r.startFeet,0);assert.ok(Math.abs(r.end[2])<1e-6);assert.ok(Math.hypot(r.end[0]-points[0][0],r.end[1]-points[0][1])<.7);
  assert.ok(r.frames.some(f=>Math.hypot(f.x-points[Math.floor(points.length/2)][0],f.z-points[Math.floor(points.length/2)][1])<.7),'native actor reached furthest waypoint');
 }
 t.diagnostic(JSON.stringify({resident:[...expectedIds].sort(),point:[p.x,p.z],panelBefore,panelAfter,otherTargets:others.length,foreignBlockerRejected:true,unloadedRejected:true,reloadAdmitted:true,nativeWalks:6}));

 }finally{tel?.dispose();controls?.dispose();zm.dispose();env.dispose();lib.dispose();globalThis.document=doc;if(win===undefined)delete globalThis.window;else globalThis.window=win;W.dispose();}
});
