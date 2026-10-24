import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {PLAYER} from '../src/config/constants.js';
import {compileProductionMain,lightWorld,installMainEnvironment,submittedInstances,advanceMain} from './lib/r51-production-main.mjs';

const compiled=await compileProductionMain();
const output='reports/r66-h-stage/entry-production-main.json';
const bodyCount=app=>app.collisionManager.dynamicBodies.get(app.characters.interaction)?.length??0;
const readyStates=app=>[...app.characters.manager.states.values()].filter(s=>s.binding&&s.readiness>0);

// Main method bodies, Settings, the character pipeline and CollisionManager are
// real. The retained helper supplies explicit CPU world/GPU/controller shells.
// This is entry wiring evidence, not full-world, browser, GPU or visual QA.
test('R66 production entry runs the real character renderer and owns the live dynamic-body channel',async t=>{
 const world=lightWorld(),host=installMainEnvironment(world),app=new compiled.module.ForbiddenCityApp();
 const report={boundary:'Production-compiled main with retained explicit CPU seams; real ground-only support, character pipeline, Settings and collision manager. Not a browser, WebGL or all-building acceptance.',entry:compiled.evidence,checks:{}};
 t.after(()=>{app.dispose();report.disposal={dynamicOwners:world.cm.dynamicBodies.size};host.restore();fs.mkdirSync('reports/r66-h-stage',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');});
 await app.init();
 app.flight.position=new THREE.Vector3(22,0,-494); // Complete the documented FlightTour CPU shell for occupied-frame location lookup.
 assert.equal(compiled.module.CHARACTER_REGISTRY.actors.length,108);
 assert.equal(app.characters.manager.states.size,108);
 assert.equal(app.characters.enabled,true);
 assert.equal(app.characters.world.scene,app.scene);
 assert.equal(app.characters.renderer.scene,app.scene);
 assert.equal(app.characters.camera,app.camera);
 assert.equal(app.collisionManager,world.cm);
 assert.equal(app.characters.interaction.cm,app.collisionManager,'do not wire interactions to a detached/test-only manager');
 const toggle=app.settingsMenu.panel.querySelector('#characters-toggle-btn');
 assert.equal(toggle.getAttribute('aria-pressed'),'true');
 assert.equal(app.settingsMenu.panel.querySelector('#characters-preview-toggle-btn'),null);
 assert.equal(app.characters.snapshot().contentApproved,false);
 assert.equal(app.characters.snapshot().acceptance.complete,false);
 report.checks.registration={registered:108,defaultOn:true,formalAcceptance:false};

 await t.test('day and night submit actual ceremony instances, not only guard schedule metadata',async()=>{
  // The court ground is present in lightWorld, unlike the throne and hall floors.
  app.camera.position.set(-12,PLAYER.HEIGHT,-105);app.camera.lookAt(-12,1,-80);
  report.dayFrames=await advanceMain(app,{maxFrames:16000,until:a=>submittedInstances(a).meshes.some(m=>m.count>0&&m.name.includes('official-ceremonial'))&&bodyCount(a)>0});
  report.day={status:app.characters.statusSnapshot(),render:submittedInstances(app),bodies:bodyCount(app)};
  assert.ok(report.day.render.instances>0);
  assert.ok(report.day.render.meshes.some(m=>m.count>0&&m.name.includes('official-ceremonial')&&m.isInstancedMesh&&m.indices>0));
  assert.equal(report.day.render.rootAttachedToMainScene,true);
  assert.ok(bodyCount(app)>0);
  assert.deepEqual([...app.collisionManager.dynamicBodies.keys()],[app.characters.interaction]);
  report.nightFrames=await advanceMain(app,{daylight:0,maxFrames:120,until:(a,frame)=>frame>=35&&submittedInstances(a).meshes.some(m=>m.count>0&&m.name.includes('official-ceremonial'))});
  report.night={status:app.characters.statusSnapshot(),render:submittedInstances(app),bodies:bodyCount(app),eligibleSchedules:[...new Set(readyStates(app).filter(s=>s.activeSchedule&&s.visibility===1).map(s=>s.actor.schedule))]};
  assert.ok(report.night.render.instances>0);
  assert.ok(report.night.render.meshes.some(m=>m.count>0&&m.name.includes('official-ceremonial')),'ceremony-daylight metadata must not make officials disappear at night');
  assert.ok(readyStates(app).some(s=>s.actor.schedule==='ceremony-daylight'&&s.activeSchedule===true&&s.visibility===1));
  assert.ok(readyStates(app).every(s=>s.activeSchedule===true&&s.visibility===1));
  assert.ok(bodyCount(app)>0);
  report.checks.actualDayNightSubmission=true;
 });

 await t.test('all 108 production-manager states are time-eligible while quality budgets stay bounded',()=>{
  // Explicit schedule-only fixture: no invented claims of architectural binding.
  // Reuse the constructor installed by real production main, not a test manager.
  const Manager=app.characters.manager.constructor,registry=compiled.module.CHARACTER_REGISTRY;
  const camera=new THREE.PerspectiveCamera(80,1,.1,2000);camera.position.set(0,1.7,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
  let selected=[];
  const manager=new Manager({registry,contentEnabled:true,adapter:{getRevision:()=>1,resolve:()=>({status:'ready',position:[0,0,0],rotationYRad:0})},renderer:{render:actors=>(selected=actors,{}),clear:()=>{selected=[];},dispose(){}}});
  try{
   const rows=[];
   for(const daylight of [1,.5,0,.01,1]){
    for(let frame=0;frame<5;frame++)manager.update(.1,{camera,daylight,quality:'high'});
    assert.equal(manager.stats.loaded,108);
    assert.equal([...manager.states.values()].filter(s=>s.activeSchedule===true&&s.visibility===1).length,108);
    assert.equal(selected.length,64);
    const schedules=[...new Set([...manager.states.values()].map(s=>s.actor.schedule))].sort();
    assert.ok(schedules.includes('ceremony-daylight'));assert.ok(schedules.includes('guard-duty'));
    rows.push({daylight,registered:108,timeEligible:108,highQualitySubmitted:selected.length,schedules});
    manager.update(.1,{camera,daylight,quality:'low'});assert.equal(selected.length,32);rows.at(-1).lowQualitySubmitted=selected.length;
   }
   report.checks.all108TimeEligibility={boundary:'Production manager class with synthetic same-position supports and a renderer recorder; proves schedule eligibility and budgets only, not world binding or GPU drawing.',rows};
  }finally{manager.dispose();}
 });

 await t.test('the production player callback rejects flight cameras and samples live grounded/airborne feet',async()=>{
  const interaction=app.characters.interaction,getPlayer=interaction.getPlayerState;
  assert.equal(typeof getPlayer,'function');
  assert.equal(getPlayer(),null,'the control shell has no finite feet until explicitly supplied');
  Object.assign(app.controls,{feetY:.3,groundY:2,airborne:false,bobOffset:new THREE.Vector3(.012,.035,-.008)});
  app.camera.position.set(12.012,51.7,-20.008);
  assert.deepEqual(getPlayer(),{position:[12,2,-20],radius:.5,height:PLAYER.HEIGHT});
  app.controls.airborne=true;app.controls.feetY=.8;
  assert.deepEqual(getPlayer(),{position:[12,.8,-20],radius:.5,height:PLAYER.HEIGHT});
  const cases=[];
  for(const cameraPosition of [[100,30,100],[0,120,-80],[-50,8,20]]){
   app.flight.occupied=true;app.camera.position.fromArray(cameraPosition);
   assert.equal(getPlayer(),null,'occupied flight must never fabricate a pedestrian at the follow/pilot camera');
   await advanceMain(app,{daylight:0,maxFrames:1});
   assert.equal(interaction.player,null);
   cases.push({cameraPosition,result:null});
  }
  app.flight.occupied=false;app.controls.feetY=NaN;assert.equal(getPlayer(),null);
  app.controls.feetY=0;app.controls.groundY=0;app.controls.airborne=false;app.controls.bobOffset.set(0,0,0);
  app.camera.position.set(-12,PLAYER.HEIGHT,-105);app.camera.lookAt(-12,1,-80);
  await advanceMain(app,{daylight:0,maxFrames:1});
  assert.deepEqual(interaction.player,{position:[-12,0,-105],radius:.5,height:PLAYER.HEIGHT});
  report.checks.playerCallback={boundary:'Actual compiled main closure; finite feet/ground/bob and occupied values are supplied on the documented controller/flight shells. Real flight/controller integration is a separate retained test suite.',groundedUsesMaxFeetAndGround:true,airborneUsesFeet:true,bobRemoved:true,flightCases:cases,restoredAfterFlight:true};
 });

 await t.test('the existing Settings toggle clears rendered instances and only its own dynamic-body owner',async()=>{
  await advanceMain(app,{daylight:0,maxFrames:16000,until:a=>submittedInstances(a).instances>0&&bodyCount(a)>0});
  assert.ok(bodyCount(app)>0);assert.ok(submittedInstances(app).instances>0);
  const unrelatedOwner={fixture:'unrelated dynamic owner'};
  app.collisionManager.setDynamicBodies(unrelatedOwner,[{id:'other-pedestrian',parts:[{ax:1000,az:1000,bx:1000,bz:1000,radius:.3,minY:0,maxY:1.7}]}]);
  const unrelatedBodies=app.collisionManager.dynamicBodies.get(unrelatedOwner);
  toggle.click();
  assert.equal(app.characters.enabled,false);assert.equal(toggle.getAttribute('aria-pressed'),'false');
  assert.equal(submittedInstances(app).instances,0);assert.equal(app.collisionManager.dynamicBodies.has(app.characters.interaction),false);
  await advanceMain(app,{daylight:0,maxFrames:20});assert.equal(submittedInstances(app).instances,0);assert.equal(bodyCount(app),0);
  assert.equal(app.collisionManager.dynamicBodies.get(unrelatedOwner),unrelatedBodies,'disabling people must not clear unrelated body owners');
  toggle.click();
  report.reenabledFrames=await advanceMain(app,{daylight:0,maxFrames:16000,until:a=>submittedInstances(a).instances>0&&bodyCount(a)>0});
  assert.equal(toggle.getAttribute('aria-pressed'),'true');assert.ok(submittedInstances(app).instances>0);assert.ok(bodyCount(app)>0);
  assert.equal(app.characters.snapshot().contentApproved,false);assert.equal(app.characters.snapshot().acceptance.complete,false);
  assert.equal(app.collisionManager.dynamicBodies.get(unrelatedOwner),unrelatedBodies);app.collisionManager.clearDynamicBodies(unrelatedOwner);
  report.checks.settingsOffOn={offClearsInstances:true,offClearsDynamicBodies:true,unrelatedOwnerPreserved:true,onRestoresBoth:true,formalAcceptance:false};
 });

 await t.test('author click, production Escape handler and secondary touch open the same Settings dialog',()=>{
  // Only fill a missing no-op in the retained FlightTour CPU shell.
  app.flight.clearInput=()=>{};
  const menu=app.settingsMenu,launcher=menu.launcher,panel=menu.panel,overlay=menu.overlay;
  assert.deepEqual(launcher.children.map(child=>child.textContent),['作者','陈华山&陈诺']);
  for(const activation of ['click','Escape','secondary-touch']){
   launcher.focus();
   if(activation==='click')launcher.click();
   else if(activation==='Escape')host.dom.dispatch(document.body,'keydown',{key:'Escape',code:'Escape',repeat:false});
   else {const held={identifier:1,target:document.body},tap={identifier:2,target:launcher};host.dom.dispatch(launcher,'touchstart',{touches:[held,tap],changedTouches:[tap]});}
   assert.equal(menu.visible,true);assert.equal(menu.panel,panel);assert.equal(menu.overlay,overlay);
   assert.equal(app.settingsTourSession.paused,true);assert.equal(document.activeElement.id,'settings-title');
   assert.equal(launcher.getAttribute('aria-expanded'),'true');
   menu.panel.querySelector('#resume-btn').click();
   assert.equal(menu.visible,false);assert.equal(app.settingsTourSession.paused,false);
   assert.equal(document.activeElement,launcher);assert.equal(launcher.getAttribute('aria-expanded'),'false');
  }
  report.checks.sameSettingsActivation={events:['click','Escape through actual main handler','secondary-touch'],samePanel:true,samePauseSession:true,focusRestored:true,extraShell:'FlightTour.clearInput no-op and finite aircraft position for main location lookup; flight implementation is not under test here.'};
 });
 report.pass=Object.values(report.checks).length===6;
});
