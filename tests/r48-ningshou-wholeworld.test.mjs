import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
// The worker may verify against the current integration dispatch without
// mutating it. In the integrated repository the default root is this project.
const root=process.env.R48_INTEGRATION_ROOT?pathToFileURL(resolve(process.env.R48_INTEGRATION_ROOT)+sep):new URL('../',import.meta.url);
const source=readFileSync(new URL('../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url),'utf8');
const hook=registerHooks({load(url,context,next){if(url.endsWith('/RemainingNingshouHalls.js'))return{format:'module',source,shortCircuit:true};return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const{Teleport}=await import(new URL('src/ui/Teleport.js',root));
const{buildWorld}=await import(new URL('tests/lib/world.mjs',root));
const{REMAINING_NINGSHOU_PROFILES}=await import(new URL('src/scene/palace/special/RemainingNingshouHalls.js',root));
const W=await buildWorld();hook.deregister();
const t=Object.create(Teleport.prototype);t.targets=new Map(W.halls.map(h=>[h.item.name,h.item]));t.collisionManager=W.cm;t.zoneManager={getMapItems:()=>W.mapItems,getLoadedIds:()=>W.zones.map(z=>z.json.id)};
for(const p of REMAINING_NINGSHOU_PROFILES)test(`R48 whole-world ${p.name} current Teleport.isSafe follows the real profile entry`,()=>{const g=t.geometryFor(p.name),landing=t.landingFor(p.name);assert.equal(g.entryProfile,p.id);assert.equal(W.cm.getGroundHeight(landing.x,landing.z,Infinity),0,'start must be courtyard ground, never a neighbouring platform');assert.equal(t.isSafe(landing,g),true,JSON.stringify({g,landing}));assert.equal(landing.approachVerified,true);assert.equal(landing.y,0);});
for(const fps of[10,60])for(const backward of[false,true])test(`R48 BiLuo whole-world east approach and retreat at ${fps} Hz backward=${backward}`,async tr=>{const p=REMAINING_NINGSHOU_PROFILES.find(p=>p.key==='biluo'),a=p.portals[0].approachPoints.map(q=>[q.x,q.z]),points=[...a,[p.x,p.z],...a.slice().reverse()];assert.equal(p.portals[0].side,'east');assert.equal(p.portals[0].normalLocalX,-1);const{replayTerrace,traceTerraceGround}=await import('./lib/terrace-walk.mjs');const trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayTerrace(tr,{cm:W.cm,THREE},points,{fps,backward,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();}});
for(const fps of[10,60])test(`R48 JingQi whole-world real stair round trip at ${fps} Hz`,async tr=>{
 const p=REMAINING_NINGSHOU_PROFILES.find(p=>p.key==='jingqi'),{CourtKit}=await import(new URL('src/scene/palace/kit.js',root)),{buildRemainingHall}=await import(new URL('src/scene/palace/special/RemainingNingshouHalls.js',root)),{library}=await import('./lib/inner-palace-fixture.mjs'),item=t.targets.get(p.name),kit=new CourtKit(library(),'ningshou'),{f}=buildRemainingHall(kit,item,p),s=f.userData.structure.stair;
 const a=[...p.portals[0].approachPoints.map(q=>[q.x,q.z]),...s.route.map(([x,z])=>[p.x+x,p.z+z])],points=[...a,...a.slice(0,-1).reverse()],{replayTerrace,traceTerraceGround}=await import('./lib/terrace-walk.mjs'),trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayTerrace(tr,{cm:W.cm,THREE},points,{fps,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.ok(result.maxFeet>=p.upperFloorY-.01);assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();kit.dispose(f);}
});
