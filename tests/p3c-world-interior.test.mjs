import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
registerHooks({load(url,c,next){if(url.endsWith('.json'))return {format:'module',source:'export default '+fs.readFileSync(new URL(url),'utf8'),shortCircuit:true};return next(url,c);}});
const at=p=>import(pathToFileURL(process.cwd()+'/'+p));
const {buildCharacterWorld}=await at('tests/p3c-world-fixture.mjs');
const {InteriorLoader}=await at('src/scene/interior/InteriorLoader.js');
const {taiheAsset,taiheConfig:cfg}=await at('tests/lib/r34-interior-fixture.mjs');
const {taiheFallbackMeshes}=await at('src/scene/interior/TaiheCoreContract.js');
const {createCharacterGeometry}=await at('src/scene/characters/CharacterKit.js');
const {CHARACTER_REGISTRY}=await at('data/characters/index.js');
test('actual Taihe GLB atomic replacement preserves seated support over 20 cycles, contract failure and late callbacks',async()=>{
const W=await buildCharacterWorld(),loader=new InteriorLoader(W.scene,W.cm,{registry:{taihe:cfg}});W.adapter.interiors=loader;
const actor=CHARACTER_REGISTRY.actors.find(a=>a.id==='taihe-emperor-01');
const g=createCharacterGeometry(actor.templateId,'seated',0,{seatVariant:actor.behavior.seatVariant});
const points=[[0,12.6975,9.05],[-.12,12.5075,8.43],[.12,12.5075,8.43]],fallback=taiheFallbackMeshes(W.scene);
const physics=()=>JSON.stringify({c:W.cm.colliders.map(c=>c.box),w:W.cm.walkables}),baseline=physics();
const supports=()=>points.map(p=>W.adapter.supportAt(p,p[1],.03,{renderedOnly:true}));
const events=[];let prior=W.adapter.getRevision(actor);
function uniqueSupportAt(p){
 const {THREE:T}=W, meshes=[];W.scene.updateMatrixWorld(true);
 W.scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||/^(COL_|WALK_)/.test(o.name))return;for(let q=o;q;q=q.parent)if(!q.visible||q.userData?.characterLayer||q.userData?.isCharacter)return;meshes.push(o);});
 const ray=new T.Raycaster(new T.Vector3(p[0],p[1]+.04,p[2]),new T.Vector3(0,-1,0),0,.08);
 const hits=ray.intersectObjects(meshes,false).filter(h=>Math.abs(h.point.y-p[1])<=.0300001&&h.face?.normal.clone().transformDirection(h.object.matrixWorld).y>=.5);
 const unique=[...new Set(hits.map(h=>h.object))];assert.equal(unique.length,1,JSON.stringify(unique.map(m=>m.name)));return unique[0];
}
function verify(label,loaded){
 const hits=supports(),resolved=W.adapter.resolve(actor,g.userData);
 assert.equal(resolved.status,'ready',JSON.stringify(resolved));assert.equal(W.adapter.cache.size,1);
 for(const p of points){const owner=uniqueSupportAt(p);assert.match(owner.name,loaded?/^merged_taihe_/:/^taihe-core-fallback_taihe_/);}
 for(const hit of hits){assert.equal(hit.status,'ready');assert.equal(hit.kind,'rendered-geometry');assert.match(hit.meshName,loaded?/^merged_taihe_/:/^taihe-core-fallback_taihe_/);}
 assert.equal(fallback.length,8);assert.ok(fallback.every(m=>m.visible===!loaded));assert.equal(loader.getGroup('taihe')?.visible??false,loaded);assert.equal(physics(),baseline);
 const revision=W.adapter.getRevision(actor);events.push({label,revision,seat:hits[0].heightMeters,foot:hits[1].heightMeters,seatMeshId:hits[0].meshId,footMeshId:hits[1].meshId});return revision;
}
verify('initial B',false);
for(let i=0;i<20;i++){
 const root=await taiheAsset();let deliver;
 loader.gltf.load=(_u,ok)=>{deliver=ok};
 const p=loader.load('taihe'),loading=verify(`loading ${i}`,false);assert.notEqual(loading,prior);
 deliver({scene:root});assert.equal(await p,true);
 const loaded=verify(`S ${i}`,true);assert.notEqual(loaded,loading);
 const before=W.adapter.stats.supportQueries;W.adapter.resolve(actor,g.userData);assert.equal(W.adapter.stats.supportQueries,before,'stable state should hit resolved cache');
 loader.unload('taihe');prior=verify(`B ${i}`,false);assert.notEqual(prior,loaded);
}
const bad=await taiheAsset();bad.getObjectByName('TAIHE_CORE_CONTRACT').userData.revision='wrong';loader.gltf.load=(_u,ok)=>ok({scene:bad});assert.equal(await loader.load('taihe'),false);verify('failed preserves B',false);loader.unload('taihe');
let late;loader.gltf.load=(_u,ok)=>late=ok;const cancelled=loader.load('taihe');loader.unload('taihe');late({scene:await taiheAsset()});assert.equal(await cancelled,false);verify('late callback preserves B',false);
loader.gltf.load=async(_u,ok)=>ok({scene:await taiheAsset()});assert.equal(await loader.load('taihe'),true);loader.dispose();verify('dispose restores B',false);
g.dispose();W.adapter.dispose();
const summary={ok:true,cycles:20,checks:events.length,uniqueSupportChecks:events.length*points.length,adapterCacheMax:1,colliders:W.cm.colliders.length,walkables:W.cm.walkables.length,first:events.slice(0,4),last:events.slice(-5)};fs.writeFileSync('/tmp/r50-world-interior-results.json',JSON.stringify(summary,null,2)+'\n');
});
