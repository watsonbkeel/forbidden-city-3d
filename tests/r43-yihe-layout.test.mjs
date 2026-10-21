import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {hallSignature} from './lib/r40-hall-signature.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const data=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))),item=data.items.find(i=>i.name==='颐和轩'&&i.kind==='hall');
const url=new URL('../src/scene/palace/special/YiheHall.js',import.meta.url),api=existsSync(url)?await import(url):{};
function fixture(whole=false){assert.equal(typeof api.buildYiheHall,'function');const b=new ZoneBase(library(),data);let f;if(whole)b.build();else({f}=b.buildHall(item));b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return{b,f,cm};}
function nodes(f,role){const a=[];f.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;}
test('R43 Yihe has distinct seven main and five annex bay axes with three open front bays',()=>{
 const{b,f}=fixture();const g=f.userData.structure;assert.equal(item.bays,7);assert.equal(g.mainBays,7);assert.equal(g.frontAnnexBays,5);assert.equal(g.rearAnnexBays,3);assert.equal(g.frontOpenBays,3);assert.equal(nodes(f,'yihe-main-front-column').length,8);assert.equal(nodes(f,'yihe-front-annex-column').length,6);assert.equal(nodes(f,'yihe-main-rear-column').length,8);assert.equal(b.kit.mapItems.filter(x=>x.name==='颐和轩').length,1);assert.match(g.roofStatus,/UNCHANGED/);assert.equal(g.currentInventoryVerified,false);assert.ok(nodes(f,'yihe-suian-north-window').length);assert.ok(nodes(f,'yihe-suian-neck').length>=4);assert.equal(nodes(f,'yihe-bed-niche-contour').length,1);b.dispose();
});
for(const fps of[10,60])for(const backward of[false,true])test(`R43 full-zone Yihe central entry and west-facing Suian turn-in route at${fps}Hz ${backward?'S':'W'} sprint`,t=>{
 const{b,cm}=fixture(true);const route=[[0,-15],[0,-9],[0,-3],[0,0],[-5.8,0],[-5.8,-4.15],[-8.1,-4.15],[-8.1,-6.1],[-9.75,-6.1],[-9.75,-8.3],[-9.75,-9.5],[-9.75,-8.3],[-9.75,-6.1],[-8.1,-6.1],[-8.1,-4.15],[-5.8,-4.15],[0,-3],[0,-9],[0,-15],[0,-9],[0,-3],[-5.8,-3],[-5.8,-4.15],[-8.1,-4.15],[-8.1,-6.1],[-9.75,-6.1],[-9.75,-8.3],[-9.75,-6.1],[-8.1,-6.1],[-8.1,-4.15],[-5.8,-4.15],[0,-3],[0,-15]].map(([x,z])=>[item.x+x,item.z+z]);const trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},route,{fps,backward,sprint:true,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=item.ph-.01);assert.equal(trace.samples.some(s=>s.source==='rescue'),false);for(const f of r.frames)assert.ok(Number.isFinite(f.feet)&&Number.isFinite(f.ground));}finally{trace.restore();b.dispose();}
});
test('R43 Suian window remains blocked while west-facing vestibule aperture is genuinely open',()=>{
 const{b,f,cm}=fixture();assert.equal(cm.checkCollision(new THREE.Vector3(item.x-10.3,item.ph+1.7,item.z-5.25),.5),true);for(const p of[[-7.31,-4.15],[-8.1,-5.25],[-9.75,-7.25],[-9.75,-9.2]])assert.equal(cm.checkCollision(new THREE.Vector3(item.x+p[0],item.ph+1.7,item.z+p[1]),.5),false,JSON.stringify(p));for(const r of b.kit.rooms)for(const p of[...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.5),false,JSON.stringify(p));b.dispose();
});
test('R43 Yihe malformed profiles reject before geometry',()=>{assert.equal(typeof api.buildYiheHall,'function');for(const ch of[{name:'乐寿堂'},{x:0},{bays:5},{w:35},{backDoor:true},{roofH:30},{layers:2},{roomBays:1},{yiheProfile:'invented'},{eaveCount:2},{brackets:false},{storeys:2},{frontEnclosureInset:2}]){const b=new ZoneBase(library(),data);assert.throws(()=>b.buildHall({...item,...ch}),/Yihe/);assert.equal(b.kit.root.children.length,0);}const foreign=new ZoneBase(library(),{...data,id:'east-six'});assert.throws(()=>foreign.buildHall(item),/Yihe requires ningshou/);assert.equal(foreign.kit.root.children.length,0);});
test('R43 all121 non-target halls retain independent R42 geometry material and navigation signatures',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r43-halls-baseline.json',import.meta.url))).halls,seen=[];let count=0;for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(s=>s.endsWith('.json'))){const d=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));for(const[i,it]of d.items.entries()){if(it.kind!=='hall')continue;const key=d.id+'/'+i;seen.push(key);assert.equal(old[key].name,it.name??null);if(key==='ningshou/15')continue;const b=new ZoneBase(library(),d);b.buildHall(it);assert.deepEqual(hallSignature(b.kit),{geometry:old[key].geometry,navigation:old[key].navigation},key);b.dispose();count++;}}assert.equal(count,121);assert.deepEqual(seen.sort(),Object.keys(old).sort());
});
