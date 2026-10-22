// Resource ownership and provenance checks only; this helper never builds a world.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {CharacterSystem} from '../../src/scene/characters/CharacterSystem.js';
import {observeCharacterSubmissions} from './r52-character-scene.mjs';
import {assertR53LifeActorBaseline} from './r53-life-candidates.mjs';

function canonicalOutput(value){
 const absolute=path.resolve(value);let existing=absolute;
 while(!fs.existsSync(existing))existing=path.dirname(existing);
 return path.resolve(fs.realpathSync(existing),path.relative(existing,absolute));
}
function outsideFrozen(value){
 assert.equal(typeof value,'string');const resolved=canonicalOutput(value);
 for(const frozen of ['reports/r53-life-candidates','/tmp/r53-life-candidates-geometry']){const protectedPath=canonicalOutput(frozen);assert.ok(resolved!==protectedPath&&!resolved.startsWith(protectedPath+path.sep),'Cannot overwrite frozen evidence: '+value);}
 return resolved;
}
export function r53LifeProofOptions({worldState,out,geometryOut}={}){
 assert.ok(['frozen-r52','integrated-r53'].includes(worldState),'Explicit worldState must be frozen-r52 or integrated-r53');
 const token=randomUUID(),stateLabel=worldState==='frozen-r52'?'Candidate proof on frozen R52':'Household proof on explicitly supplied integrated R53';
 return{worldState,out:outsideFrozen(out??`reports/r53-life-revalidation/${worldState}-${token}`),geometryOut:outsideFrozen(geometryOut??`/tmp/r53-life-revalidation-geometry/${worldState}-${token}`),boundary:stateLabel+'. One actual production world and System/Manager/Renderer; CPU submitted-geometry support, frustum and occlusion evidence only. No browser, GPU, mobile, texture, performance or historical acceptance.'};
}
export function assertR53LifeWorldState(worldState,sourceHashes){
 if(worldState==='frozen-r52'){const frozen=JSON.parse(gunzipSync(fs.readFileSync('reports/r53-life-candidates/candidate-world-proof.json.gz')));assert.deepEqual(sourceHashes,frozen.sourceHashes,'A frozen-r52 label requires the exact frozen R52 world source fingerprints');}
}
export function acquireR53LifeProofContext(W,registry,{externalSystem,externalObserver}={}){
 assertR53LifeActorBaseline(registry);assert.equal(registry.actors.length,77,'Proof requires all77');
 assert.ok(externalObserver===undefined||externalSystem!==undefined,'externalObserver requires externalSystem');
 if(externalSystem!==undefined){assert.ok(externalSystem instanceof CharacterSystem,'externalSystem must be a real CharacterSystem');assert.equal(externalSystem.disposed,false,'externalSystem is disposed');}
 if(externalObserver!==undefined)assert.ok(externalObserver&&Array.isArray(externalObserver.submitted)&&typeof externalObserver.meshes==='function'&&typeof externalObserver.dispose==='function','Invalid external observer interface');
 const ownsSystem=!externalSystem,camera=externalSystem?.camera??new THREE.PerspectiveCamera(65,16/9,.1,2000);
 if(ownsSystem){camera.position.set(0,1.7,-494);camera.lookAt(0,1,-480);camera.updateMatrixWorld(true);}
 const system=externalSystem??new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:W.dom.document});
 let observer,originalRender,checkedRender;
 try{
  assert.equal(system.world.scene,W.scene,'Supplied system world scene differs');assert.equal(system.world.cm,W.cm,'Supplied system collision manager differs');assert.equal(system.world.zoneManager,W.zoneManager,'Supplied system zone manager differs');
  assert.equal(system.renderer.scene,W.scene,'Supplied renderer scene differs');assert.equal(system.renderer.root.parent,W.scene,'Supplied renderer root is detached');assert.equal(system.manager.renderer,system.renderer,'Supplied manager renderer differs');assert.ok(camera?.isPerspectiveCamera,'Supplied camera must be perspective');
  assert.deepEqual(system.validation.errors,[]);assert.deepEqual(system.manager.registry,registry,'Supplied manager registry differs');assert.deepEqual(system.world.registry,registry,'Supplied world registry differs');
  assert.deepEqual([...system.manager.states.values()].map(s=>s.actor),registry.actors,'Supplied system actor records differ');
  observer=externalObserver??observeCharacterSubmissions(system);originalRender=system.renderer.render;
  // Check the observer against each real call to this exact renderer, after its
  // existing observation chain has run. A foreign/stale observer cannot pass a
  // nonempty view merely by reporting unrelated ready actors or meshes.
  checkedRender=function(actors,...args){const result=originalRender.call(this,actors,...args);assert.deepEqual(observer.submitted,actors.map(a=>({...a,position:[...a.position]})),'Observer must track the same renderer submissions');return result;};
  system.renderer.render=checkedRender;
 }catch(error){if(observer&&!externalObserver)observer.dispose();if(ownsSystem)system.dispose();throw error;}
 const budget=system.preparationBudgetMs;let disposed=false;
 return{system,camera,observer,ownsSystem,ownsObserver:!externalObserver,dispose(){if(disposed)return;disposed=true;system.renderer.render=originalRender;system.preparationBudgetMs=budget;if(!externalObserver)observer.dispose();if(ownsSystem)system.dispose();}};
}
