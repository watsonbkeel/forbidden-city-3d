import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {capture} from './r48-review-outer-finishes-capture.mjs';
import {registerHooks} from 'node:module';
import * as T from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {PLAYER} from '../src/config/constants.js';
import {wuyingGalleryRoute} from './lib/r52-wuying-routes.mjs';
const report={commit:'509fdf7efb4c1415aa59be709c2f4b1ffe3a2432',retention:[],routes:[],geometry:[]};
const old=JSON.parse(readFileSync(new URL('./fixtures/r48-outer-independent-e0d19a5.json',import.meta.url))),now=await capture(fileURLToPath(new URL('..',import.meta.url)));
for(const r of old)test(`independent actual parent retention: ${r.name}`,()=>{assert.deepEqual(now.find(n=>n.id===r.id),r);report.retention.push(r.name)});
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))),zone=new ZoneBase(library(),data);zone.kit.finish=()=>zone.kit.root;const built=zone.build();built.group.updateMatrixWorld(true);
const mesh=[];built.group.traverse(m=>{if(m.isMesh)mesh.push({m,b:new T.Box3().setFromObject(m)})});
const triList=m=>{const p=m.geometry.attributes.position,i=m.geometry.index;const out=[];for(let k=0;k<(i?.count??p.count);k+=3)out.push(new T.Triangle(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i?i.getX(k+j):k+j).applyMatrix4(m.matrixWorld))));return out};
const triangleCache=new WeakMap();const tris=m=>{if(!triangleCache.has(m))triangleCache.set(m,triList(m));return triangleCache.get(m)};
const hooks=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
const {buildWorld}=await import('./lib/world.mjs');const {Teleport}=await import('../src/ui/Teleport.js');const W=await buildWorld();hooks.deregister();
const tel=Object.create(Teleport.prototype);tel.targets=new Map(W.halls.map(h=>[h.item.name,h.item]));tel.collisionManager=W.cm;tel.zoneManager={getMapItems:()=>W.mapItems,getLoadedIds:()=>W.zones.map(z=>z.json.id)};
for(const name of ['武英殿','敬思殿','宝蕴楼'])test(`independent whole-world runtime landing ${name}`,()=>{const p=tel.resolveLanding(name),g=tel.geometryFor(name);assert.ok(p);assert.equal(tel.isSafe(p,g),true);report.geometry.push({name,landing:p,enter:g.enter})});
// This review keeps its frozen retention oracle but replays current-world routes.
const wuyingFront=data.items.find(i=>i.southCourtProfile==='wuying-front'),wuyingRear=data.items.find(i=>i.southCourtProfile==='wuying-rear');
const routes=[
 {name:'Wuying south-entry to Jingsi through I-plan west aisle',points:wuyingGalleryRoute(wuyingFront,{side:'west',rear:wuyingRear})},
 {name:'Wuying south-entry to Jingsi through I-plan east aisle',points:wuyingGalleryRoute(wuyingFront,{side:'east',rear:wuyingRear})},
 {name:'Jingsi north doorway from rear courtyard',points:[[219.5,-154.5],[219.5,-159.8],[219.5,-161.7],[217.3,-161.7],[217.3,-165.9]]},
 {name:'Baoyun open courtyard main-front exterior route',points:[[300.9,-237.7],[300.9,-227.7],[292.9,-227.7],[292.9,-216.7],[300.9,-216.7],[308.9,-216.7],[308.9,-227.7],[300.9,-227.7]]}
];
for(const route of routes)for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`independent all-world movement and new-detail triangle-clearance ${route.name} ${fps}/${sprint}/${backward}`,t=>{
 const trace=traceTerraceGround(W.cm,{flights:[]});try{const r=replayTerrace(t,W,[...route.points,...route.points.slice(0,-1).reverse()],{fps,sprint,backward,recordFrames:true});const summary={route:route.name,fps,sprint,backward,...r,frames:r.frames.length};report.routes.push(summary);assert.equal(r.arrived,true,JSON.stringify(summary));assert.equal(r.startFeet,route.name.startsWith('Baoyun')?.45:0);assert.ok(Math.abs(r.end[2]-r.startFeet)<1e-6);assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);
 const hits=[],newHits=[];for(const f of r.frames){const body=new T.Box3(new T.Vector3(f.x-.499,Math.max(f.feet,f.ground)+.351,f.z-.499),new T.Vector3(f.x+.499,Math.max(f.feet,f.ground)+PLAYER.HEIGHT-.051,f.z+.499));for(const {m,b}of mesh){if(!b.intersectsBox(body))continue;if(tris(m).some(tr=>body.intersectsTriangle(tr))){const hit={frame:f,mesh:m.name,role:m.userData.role,material:m.material?.name,newDetail:!!m.userData.remainingOuterId};if(m.userData.remainingOuterId)newHits.push(hit);else if(hits.length<8)hits.push(hit);}}}summary.inheritedTriangleContacts=hits;summary.newTriangleContacts=newHits;assert.equal(newHits.length,0,JSON.stringify(newHits.slice(0,8)));
 }finally{trace.restore();}});
for(const name of['武英殿','敬思殿'])test(`independent ${name} added equipment stays away from every retained ceramic/display glass and new ceiling stays clear`,()=>{
 const row=data.items.find(i=>i.name===name),z=new ZoneBase(library(),{id:data.id}),base=z.buildHallBaseline(row),original=[];base.f.updateMatrixWorld(true);base.f.traverse(n=>{if(n.isMesh)original.push(n)});const {augmentRemainingHall,resolveRemainingProfile}=awaitApi;
 const b=augmentRemainingHall(z.kit,row,base,resolveRemainingProfile(data.id,row));b.f.updateMatrixWorld(true);const fresh=[];b.f.traverse(n=>{if(n.isMesh&&!original.includes(n))fresh.push(n)});
 const protectedMeshes=original.filter(n=>/ceramic|independent-case-glass|display-glass|display_light/.test(n.userData.role??'')||/display_glass|display_light/.test(n.material?.name??''));let checks=0;const collisions=[];
 for(const n of fresh){const bb=new T.Box3().setFromObject(n);for(const m of protectedMeshes){if(!new T.Box3().setFromObject(m).intersectsBox(bb))continue;checks++;if(tris(m).some(tr=>bb.intersectsTriangle(tr)))collisions.push({new:n.name,old:m.name,oldRole:m.userData.role});}}
 report.geometry.push({name,addedMeshes:fresh.length,protectedMeshCount:protectedMeshes.length,possibleIntersections:checks,collisions});assert.equal(collisions.length,0,JSON.stringify(collisions.slice(0,12)));z.kit.dispose(z.kit.root);
});
const awaitApi=await import('../src/scene/palace/special/RemainingOuterHalls.js');
test.after(()=>{if(process.env.R48_OUTER_REVIEW_DIR)writeFileSync(process.env.R48_OUTER_REVIEW_DIR+'/independent-results.json',JSON.stringify(report,null,2));zone.kit.dispose(zone.kit.root)});
