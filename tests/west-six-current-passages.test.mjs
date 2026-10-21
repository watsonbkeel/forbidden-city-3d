import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {restorePreR32Source} from './lib/r32-source-retention.mjs';
import west from '../data/zones/west-six.json' with {type:'json'};
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import{buildWorld,walkStraight}from'./lib/world.mjs';import{setupMap}from'./lib/map-fixture.mjs';
const gateNames=['储秀门','长春门'];
const fixture=()=>new ZoneBase({material:n=>new THREE.MeshStandardMaterial({name:n}),tileSize:()=>1,aspect:()=>1},{id:'west-test',items:[]});
test('two demolished gates retain estimated identity/map points but no invented physical gate',()=>{
 for(const name of gateNames){const item=west.items.find(i=>i.name===name&&i.kind==='gate');assert.equal(item.historicalSite?.status,'demolished');assert.equal(item.historicalSite.coordinateStatus,'estimated');const z=fixture();assert.equal(z.buildGate(item),0);assert.equal(z.kit.root.children.length,0);assert.equal(z.kit.colliders.length,0);assert.equal(z.kit.walkables.length,0);assert.equal(z.kit.mapItems.length,1);assert.deepEqual([z.kit.mapItems[0].x,z.kit.mapItems[0].z],[item.x,item.z]);assert.equal(z.kit.mapItems[0].historicalSite,true);}
});
for(const [label,patch]of [['unsupported status',{status:'unknown'}],['unproved source',{sourceUrl:'https://example.com'}],['unverified coordinate claim',{coordinateStatus:'surveyed'}]])test(`historic marker rejects ${label} before suppressing geometry`,()=>{
 const z=fixture();assert.throws(()=>z.buildGate({kind:'gate',name:'fixture',x:1,z:2,historicalSite:{status:'demolished',coordinateStatus:'estimated',sourceUrl:'https://www.dpm.org.cn/explore/building/236486.html',...patch}}),/historical site/);assert.equal(z.kit.root.children.length,0);assert.equal(z.kit.mapItems.length,0);
});
test('source-proven through halls expose five-bay front/rear openings without invented central furniture',()=>{
 for(const[name,canonical]of [['翊坤宫后殿','体和殿'],['太极殿后殿','体元殿']]){const p=west.items.find(i=>i.kind==='hall'&&i.name===name);assert.equal(p.backDoor,true);assert.equal(p.bays,5);assert.equal(p.interior,'empty');assert.equal(p.roof,'gable');assert.equal(p.plaqueText,canonical);}
});
test('both connected palace pairs are walkable through rear halls and old gate points in both directions',async()=>{
 const W=await buildWorld({zones:[{file:'west-six.json',json:west}],statics:false});
 for(const[name,gate]of [['翊坤宫后殿','储秀门'],['太极殿后殿','长春门']]){const h=west.items.find(i=>i.name===name),g=west.items.find(i=>i.name===gate);const route=[[h.x,h.z-h.d/2-1.2],[h.x,h.z+h.d/2+1.2],[g.x,g.z+3]];
  for(const points of [route,[...route].reverse()]){let feet=0;for(let i=1;i<points.length;i++){const r=walkStraight(W,points[i-1],points[i],{feet0:feet});assert.ok(r.reached>=r.total-.1,`${name} ${i}: ${JSON.stringify(r)}`);feet=r.feet;}}
 }
 for(const wall of west.items.filter(i=>i.repairRole==='connected-court-perimeter')){const [x,z]=wall.from.map((v,i)=>(v+wall.to[i])/2);assert.ok(W.cm.checkCollision(new THREE.Vector3(x,1.7,z),.5),'outer seam remains a wall');}
});
test('old-site map labels preserve the selectable original name and never draw a solid gate footprint',async t=>{
 const s=await setupMap(t);s.map.items=gateNames.map(name=>{const g=west.items.find(i=>i.name===name);return{kind:'gate',name,x:g.x,z:g.z,w:0,d:0,historicalSite:true};});
 const calls=[];s.map.ctx=new Proxy({measureText:t=>({width:t.length*6})},{get:(o,k)=>k in o?o[k]:(...args)=>calls.push([k,...args]),set:(o,k,v)=>(o[k]=v,true)});
 const labels=[];s.map.drawLabel=(...args)=>labels.push(args);s.map.drawSideItems();
 assert.equal(calls.filter(c=>c[0]==='fillRect').length,0);assert.deepEqual(labels.map(l=>l[0]),gateNames.map(n=>n+'（旧址）'));assert.deepEqual(labels.map(l=>l[5]),gateNames);
});

test('historical west-six data retains only eight evidence-bound items and four provisional perimeter joins after exact R32 source restoration',async()=>{
 const {default:delta}=await import('./fixtures/west-six-current-passages.json',{with:{type:'json'}});const {createHash}=await import('node:crypto');
 const bytes=readFileSync(new URL('../data/zones/west-six.json',import.meta.url));
 const current=JSON.parse(restorePreR32Source('data/zones/west-six.json',bytes));
 assert.throws(()=>restorePreR32Source('data/zones/west-six.json',Buffer.concat([bytes,Buffer.from('\n')])));
 assert.deepEqual(current.items.filter(i=>i.repairRole==='connected-court-perimeter'),delta.addedPerimeterWalls);
 current.items=current.items.filter(i=>i.repairRole!=='connected-court-perimeter');
 for(const d of delta.changes){assert.deepEqual(current.items[d.index],d.after);for(const key of ['x','z','w','d','ph','colH','x0','x1','z0','z1'])assert.equal(d.after[key],d.before[key],`${d.before.name??d.index}: ${key} anchor/dimension retained`);current.items[d.index]=d.before;}
 assert.equal(createHash('sha256').update(JSON.stringify(current)).digest('hex'),delta.baselineJSONSHA256);
});
test('formal through-hall plaque text does not rename navigation or legacy buildings',()=>{
 for(const name of ['翊坤宫后殿','太极殿后殿']){const z=fixture(),calls=[];z.kit.plaque=(...a)=>calls.push(a);z.buildHall(west.items.find(i=>i.kind==='hall'&&i.name===name));assert.equal(calls[0][1],name==='翊坤宫后殿'?'体和殿':'体元殿');assert.equal(z.kit.mapItems[0].name,name);}
 const z=fixture(),calls=[];z.kit.plaque=(...a)=>calls.push(a);z.buildHall({kind:'hall',name:'旧名称保留',x:0,z:0,w:10,d:5,interior:'empty'});assert.equal(calls[0][1],'旧名称保留');
});
