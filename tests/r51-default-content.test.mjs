import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CharacterSystem } from '../src/scene/characters/CharacterSystem.js';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
function setup(options={}) {
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,1.6,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 let resolves=0;
 const adapter={getRevision:()=>1,resolve:actor=>{resolves++;return options.binding?.(actor)??{status:'ready',position:[0,0,0],rotationYRad:0,support:{},...(actor.placement.mode==='path'?{path:{status:'ready',points:[[0,0,0],[0,0,20]],formationSize:3}}:{})}},cancelPending(){},dispose(){}};
 const system=new CharacterSystem({scene,camera,adapter,documentObject:null,...options});
 return{system,scene,resolves:()=>resolves};
}
const tick=(s,daylight=1,n=4)=>{for(let i=0;i<n;i++)s.update(.1,{daylight})};
const copies=scene=>{let n=0;scene.traverse(o=>{if(o.isInstancedMesh&&o.visible)n+=o.count});return n};
test('R51 production-default System renders real scene meshes without formal acceptance',()=>{
 const {system,scene,resolves}=setup();try{tick(system);const s=system.snapshot();assert.equal(s.registered,38);assert.equal(s.contentEnabled,true);assert.equal(s.loaded,38);assert.ok(s.visible>0);assert.ok(resolves()>0);assert.ok(copies(scene)>0);assert.equal(s.rollout,'candidate-visible');assert.equal(s.contentApproved,false);assert.deepEqual(s.acceptance,{complete:false,appearance:'confirmed',gpu:'unverified',mobile:'unverified',history:'partial'});}finally{system.dispose()}
});
test('ordinary off clears all real render instances; ordinary on restores without a DEV action',()=>{
 const {system,scene}=setup();try{tick(system);assert.ok(copies(scene)>0);system.setEnabled(false);assert.equal(copies(scene),0);assert.equal(system.snapshot().loaded,0);system.setEnabled(true);tick(system);assert.ok(copies(scene)>0);assert.equal(system.snapshot().previewActive,false);assert.equal(system.snapshot().acceptance.complete,false);}finally{system.dispose()}
});
test('default-on still respects explicit content unavailable and required bad/pending support',()=>{
 const closed=setup({contentEnabled:false});try{tick(closed.system);assert.equal(closed.resolves(),0);assert.equal(copies(closed.scene),0);assert.equal(closed.system.snapshot().registered,38);}finally{closed.system.dispose()}
 for(const status of ['pending','error']){const {system,scene}=setup({binding:()=>({status,reason:'unverified fixture support'})});try{tick(system);assert.equal(copies(scene),0);assert.equal(system.snapshot().loaded,0);assert.equal(system.snapshot()[status==='error'?'errors':'pending'],38);assert.equal(system.snapshot().registered,38);}finally{system.dispose()}}
});
test('night retains real guard instances but never schedules an emperor or living-scene actor',()=>{
 const {system,scene}=setup();try{tick(system,0,30);assert.ok(copies(scene)>0);const visible=[...system.manager.states.values()].filter(s=>s.lod!==3&&s.visibility>0);assert.ok(visible.length>0);assert.ok(visible.every(s=>s.actor.schedule==='guard-duty'));assert.equal(system.snapshot().daylight,0);assert.equal(system.snapshot().acceptance.gpu,'unverified');}finally{system.dispose()}
});
test('read-only per-frame UI status does not sort diagnostic timing buffers',()=>{
 const {system}=setup();try{tick(system);system.snapshot=()=>{throw Error('full diagnostic snapshot must not be used for UI sync')};system.manager.samples=new Proxy([],{get(){throw Error('timing buffer should not be visited')}});const s=system.statusSnapshot();assert.equal(s.loaded,38);assert.equal(s.contentEnabled,true);assert.equal(s.enabled,true);}finally{system.dispose()}
});
test('ordinary retry after a transient renderer fault clears current error only after success and retains diagnostic history',()=>{
 const {system}=setup();try{const render=system.renderer.render.bind(system.renderer);let once=true;system.renderer.render=(...args)=>{if(once){once=false;throw Error('once-only-render-fault')}return render(...args)};
 system.update(.1);assert.equal(system.enabled,false);assert.match(system.statusSnapshot().lastError,/once-only-render-fault/);
 system.update(.1);assert.match(system.statusSnapshot().lastError,/once-only-render-fault/,'disabled frames do not erase an active failure');
 system.setEnabled(true);assert.match(system.statusSnapshot().lastError,/once-only-render-fault/,'click alone does not claim recovery');tick(system);assert.ok(system.snapshot().visible>0);assert.equal(system.statusSnapshot().lastError,null);assert.match(system.snapshot().lastFailure,/once-only-render-fault/);
 }finally{system.dispose()}
});
