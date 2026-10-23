import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileProductionMain,lightWorld,installMainEnvironment,submittedInstances,advanceMain} from './lib/r51-production-main.mjs';
const compiled=await compileProductionMain();
test('R59 production main registers108 and starts real instances by default, without changing formal acceptance or normal off/on controls',async t=>{
 const W=lightWorld(),host=installMainEnvironment(W),app=new compiled.module.ForbiddenCityApp(),report={boundary:'Production-compiled real main/Settings/characters entry wiring with explicit CPU world/GPU shells. Ground-only fixture verifies boot/control wiring; all108 physical scene bindings are separately verified in the one-world suite.',entry:compiled.evidence};
 t.after(()=>{app.dispose();host.restore();fs.mkdirSync('reports/r59-b-stage',{recursive:true});fs.writeFileSync('reports/r59-b-stage/production-main.json',JSON.stringify(report,null,2)+'\n');});
 await app.init();assert.equal(compiled.module.CHARACTER_REGISTRY.actors.length,108);assert.equal(app.characters.statusSnapshot().registered,108);assert.equal(app.characters.enabled,true);assert.equal(app.characters.snapshot().contentApproved,false);assert.equal(app.characters.snapshot().acceptance.complete,false);
 const button=app.settingsMenu.panel.querySelector('#characters-toggle-btn');assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(app.settingsMenu.panel.querySelector('#characters-preview-toggle-btn'),null);assert.equal(app.characters.renderer.scene,app.scene);assert.equal(app.characters.world.scene,app.scene);assert.equal(app.characters.camera,app.camera);
 report.dayFrames=await advanceMain(app,{maxFrames:16000,until:a=>submittedInstances(a).instances>0});report.day={status:app.characters.statusSnapshot(),render:submittedInstances(app)};assert.ok(report.day.render.instances>0);assert.equal(report.day.render.rootAttachedToMainScene,true);assert.ok(report.day.render.meshes.some(m=>m.count>0&&m.isInstancedMesh&&m.indices>0));
 button.click();await advanceMain(app,{maxFrames:20});assert.equal(app.characters.enabled,false);assert.equal(button.getAttribute('aria-pressed'),'false');assert.equal(submittedInstances(app).instances,0);
 button.click();report.onFrames=await advanceMain(app,{maxFrames:16000,until:a=>submittedInstances(a).instances>0});assert.ok(submittedInstances(app).instances>0);assert.equal(button.getAttribute('aria-pressed'),'true');assert.equal(app.characters.snapshot().contentApproved,false);
 report.nightFrames=await advanceMain(app,{daylight:0,maxFrames:16000,until:(a,n)=>n>=35&&submittedInstances(a).instances>0});report.night={status:app.characters.statusSnapshot(),render:submittedInstances(app)};assert.ok(report.night.render.instances>0);assert.ok([...app.characters.manager.states.values()].filter(s=>s.binding&&s.lod<3&&s.visibility*s.readiness>0).every(s=>s.actor.schedule==='guard-duty'));report.pass=true;
});
