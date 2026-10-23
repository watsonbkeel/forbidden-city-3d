import test,{after} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import zlib from 'node:zlib';import {registerHooks}from'node:module';
registerHooks({load(url,c,next){if(url.endsWith('.json'))return{format:'module',source:`export default ${fs.readFileSync(new URL(url),'utf8')}`,shortCircuit:true};return next(url,c);}});
const THREE=await import('three');const{InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');const{INTERIORS}=await import('../src/scene/interior/registry.js');const{CollisionManager}=await import('../src/utils/Collision.js');
const{rearPalaceFragment}=await import('./lib/r54-jiaotai-fragment.mjs');const{replayKunning}=await import('./lib/kunning-walk.mjs');const{traceTerraceGround}=await import('./lib/terrace-walk.mjs');
const{actualKunningRoot,assertKunningStovesInWorld,R55_KUNNING_OBSERVATION_ROUTE}=await import('./lib/r55-kunning-world.mjs');
const{scene,builder}=rearPalaceFragment(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(builder.colliders,'real-B-rear-palaces');cm.addWalkables(builder.walkables,'real-B-rear-palaces');
const W={scene,cm,THREE},interiors=new InteriorLoader(scene,cm,{registry:{kunning:INTERIORS.kunning}});
const deliver=async()=>{const root=await actualKunningRoot();interiors.gltf.load=(url,ok)=>{assert.equal(url,INTERIORS.kunning.model);ok({scene:root});};return root;};
const routeEvidence=[];
const recordRoute=(kind,options,r)=>{if(process.env.R55_WRITE_EVIDENCE)routeEvidence.push({kind,...options,arrived:r.arrived,end:r.end,frames:r.frames});};
const settle=()=>interiors.update({x:-5,z:386.1},performance.now()+500);
await assertKunningStovesInWorld(W,{interiors,layer:'B'});
test('real Kunning S installs once, fades, releases all owned resources, and returns to identical B',async()=>{
 const root=await deliver();const disposed=[];root.traverse(m=>{if(m.isMesh){for(const r of[m.geometry,m.material])if(!disposed.some(p=>p.r===r)){const p={r,count:0};r.addEventListener('dispose',()=>p.count++);disposed.push(p);}}});
 assert.equal(await interiors.load('kunning'),true);settle();await assertKunningStovesInWorld(W,{interiors,layer:'S'});assert.equal(await interiors.load('kunning'),true);
 interiors.unload('kunning');await assertKunningStovesInWorld(W,{interiors,layer:'B'});assert.ok(disposed.every(p=>p.count===1),'each owned geometry/material disposed exactly once');
 await deliver();assert.equal(await interiors.load('kunning'),true);settle();await assertKunningStovesInWorld(W,{interiors,layer:'S'});
});
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`actual S-loaded doorway/ritual/stove observation roundtrip ${fps}Hz sprint=${sprint} S=${backward}`,t=>{
 assert.equal(interiors.getState('kunning'),'loaded');const tr=traceTerraceGround(cm,{flights:[]});try{const r=replayKunning(t,W,R55_KUNNING_OBSERVATION_ROUTE,{startFeet:2,fps,sprint,backward,recordFrames:true});recordRoute('observation',{fps,sprint,backward,diagonal:false},r);assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.frames.every(f=>f.ground>=2-1e-6&&f.ground<=2.260001),'only B floor or inherited 2.26m doorway threshold, never stove ascent');assert.equal(tr.samples.some(s=>s.source==='rescue'),false);assert.ok(r.frames.every(f=>!cm.checkCollision(new THREE.Vector3(f.x,Math.max(f.feet,f.ground)+1.7,f.z),.5)),'continuous recorded body clears all actual colliders');}finally{tr.restore();}
});
// Exercise simultaneous W+D / S+D, not merely a diagonally oriented W path.
const {FirstPersonControls}=await import('../src/controls/FirstPerson.js');
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`actual S-loaded diagonal ${backward?'S+D':'W+D'} roundtrip ${fps}Hz sprint=${sprint}`,t=>{
 const update=FirstPersonControls.prototype.update;
 const hook=t.mock.method(FirstPersonControls.prototype,'update',function(...args){this.moveRight=this.moveForward||this.moveBackward;if(this.moveRight)this.camera.rotateY(this.moveBackward?-Math.PI/4:Math.PI/4);return update.apply(this,args);});
 const tr=traceTerraceGround(cm,{flights:[]});try{const r=replayKunning(t,W,R55_KUNNING_OBSERVATION_ROUTE,{startFeet:2,fps,sprint,backward,recordFrames:true});recordRoute('observation',{fps,sprint,backward,diagonal:true},r);assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(tr.samples.some(s=>s.source==='rescue'),false);assert.ok(r.frames.every(f=>f.ground>=2-1e-6&&f.ground<=2.260001));assert.ok(r.frames.every(f=>!cm.checkCollision(new THREE.Vector3(f.x,Math.max(f.feet,f.ground)+1.7,f.z),.5)));}finally{tr.restore();hook.mock.restore();}
});
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`actual grounded controller is stopped before stove solid ${fps}Hz sprint=${sprint} S=${backward}`,t=>{
 const r=replayKunning(t,W,[[-5.22,389.5],[-5.22,392]],{startFeet:2.16,fps,sprint,backward,recordFrames:true});
 recordRoute('blocked-approach',{fps,sprint,backward,diagonal:false},r);assert.equal(r.arrived,false,'must not cross the stove');assert.ok(r.end[1]<=390.22501,JSON.stringify(r.end));assert.ok(r.frames.every(f=>Math.abs(f.ground-2.16)<1e-6&&f.feet<=2.160001),'no artificial step support or upward rescue');
});
for(const fps of[10,60])test(`actual controller jumps onto stove and settles ${fps}Hz`,t=>{
 assert.equal(interiors.getState('kunning'),'loaded');const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{},doc={addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),controls=new FirstPersonControls(new THREE.PerspectiveCamera(),{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},cm);
 try{controls.controls.isLocked=true;controls.setHeadBob(false);controls.setPosition(-5.22,2.16+1.7,389.8);controls.lookAt(-5.22,392);controls.moveForward=true;controls.jump();let maxFeet=controls.feetY;const landed=[];
  for(let i=0;i<fps*4;i++){now+=1000/fps;if(controls.camera.position.z>391.8)controls.moveForward=false;controls.update();maxFeet=Math.max(maxFeet,controls.feetY);if(i>fps*2)landed.push(controls.feetY);}
  assert.ok(maxFeet>2.89,'real jump clears stove top');assert.ok(landed.length>0&&landed.every(y=>Math.abs(y-2.59)<1e-5),'landed support equals visible .43m top');assert.ok(controls.camera.position.z>390.725&&controls.camera.position.z<393.025);
 }finally{controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
});
test('network failure keeps B and subsequent explicit unload/reload recovers cleanly',async()=>{
 interiors.unload('kunning');interiors.gltf.load=(_url,_ok,_progress,error)=>error(new Error('Injected network failure'));
 assert.equal(await interiors.load('kunning'),false);assert.equal(interiors.getState('kunning'),'failed');await assertKunningStovesInWorld(W,{interiors,layer:'B'});
 interiors.unload('kunning');await deliver();assert.equal(await interiors.load('kunning'),true);settle();await assertKunningStovesInWorld(W,{interiors,layer:'S'});
});
test('late cancelled load and rejected contract release actual bytes without S remnants or B mutations',async()=>{
 interiors.unload('kunning');let done;const root=await actualKunningRoot();interiors.gltf.load=(_u,ok)=>{done=ok;};const pending=interiors.load('kunning');interiors.unload('kunning');done({scene:root});assert.equal(await pending,false);await assertKunningStovesInWorld(W,{interiors,layer:'B'});
 const bad=await deliver();bad.getObjectByName('KUNNING_CONTRACT').userData.profileHash='bad';assert.equal(await interiors.load('kunning'),false);await assertKunningStovesInWorld(W,{interiors,layer:'B'});interiors.unload('kunning');await deliver();assert.equal(await interiors.load('kunning'),true);settle();await assertKunningStovesInWorld(W,{interiors,layer:'S'});interiors.dispose();await assertKunningStovesInWorld(W,{interiors,layer:'B'});
});

after(()=>{if(!process.env.R55_WRITE_EVIDENCE)return;const out=new URL('../docs/validation/r55-kunning-low-stoves/route-evidence.json.gz',import.meta.url);fs.writeFileSync(out,zlib.gzipSync(JSON.stringify({kind:'REAL_FIRST_PERSON_CONTROLS_REAR_PALACE_FRAGMENT_ONLY',stove:{min:[-7.22,2.16,390.725],max:[-3.22,2.59,393.025]},B:cm.colliders.filter(c=>c.box.max.y>2.16&&c.box.min.y<3.86).map(c=>({tag:c.tag,min:c.box.min.toArray(),max:c.box.max.toArray()})),waypoints:R55_KUNNING_OBSERVATION_ROUTE,runs:routeEvidence})+'\n')); });
