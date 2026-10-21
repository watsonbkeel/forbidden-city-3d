import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {hallSignature} from './lib/r40-hall-signature.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const data=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))),item=data.items.find(i=>i.name==='古华轩'&&i.kind==='hall');
const u=new URL('../src/scene/palace/special/GuhuaPavilion.js',import.meta.url),api=existsSync(u)?await import(u):{};
const nodes=(root,role)=>{const out=[];root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
function fixture(whole=false){assert.equal(typeof api.buildGuhuaPavilion,'function');const b=new ZoneBase(library(),data);let f;if(whole)b.build();else({f}=b.buildHall(item));b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return{b,f,cm};}
test('R42 Guhua dispatches one open navigation region without generic opaque walls or furnishings',()=>{
 const{b,f}=fixture();assert.equal(item.bays,3);assert.equal(item.structure,'guhua-open-pavilion');assert.equal(b.kit.rooms.length,1);assert.equal(b.kit.rooms[0].kind,'guhua-open-navigation-zone');assert.equal(b.kit.mapItems.filter(m=>m.name==='古华轩').length,1);assert.equal(f.children.filter(o=>o.material?.name==='wall_red').length,0);assert.equal(f.children.filter(o=>o.material?.name==='lattice_doors').length,0);assert.equal(nodes(f,'guhua-stone-floor').length,1);assert.ok(nodes(f,'guhua-ceiling-panel').length>0);assert.ok(nodes(f,'guhua-seat-top').length>=4);assert.ok(nodes(f,'guhua-inner-frame').length>0);assert.match(f.userData.structure.roofStatus,/UNCHANGED/);assert.match(f.userData.structure.state,/2025/);assert.equal(f.userData.structure.siteAccessVerified,false);b.dispose();
});
for(const fps of[10,60])test(`R42 actual full-zone Guhua front/back and surrounding gallery repeated at${fps}Hz`,t=>{
 const{b,cm}=fixture(true);const route=[[0,-6.5],[0,-3.4],[0,0],[0,3.4],[0,6.3],[0,3.4],[-6.2,3.4],[-6.2,-3.4],[6.2,-3.4],[6.2,3.4],[0,3.4],[0,-3.4],[0,-6.5],[0,-3.4],[-6.2,-3.4],[-6.2,3.4],[6.2,3.4],[6.2,-3.4],[0,-3.4],[0,-6.5]].map(([x,z])=>[item.x+x,item.z+z]);const trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},route,{fps,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=item.ph-.01);assert.equal(trace.samples.some(s=>s.source==='rescue'),false);for(const f of r.frames)assert.ok(Number.isFinite(f.feet)&&Number.isFinite(f.ground));}finally{trace.restore();b.dispose();}
});
test('R42 actual registered front/back openings and central sightline stay unobstructed',()=>{
 const{b,f,cm}=fixture();assert.equal(b.kit.rooms[0].doors.length,2);for(const p of[...b.kit.rooms[0].doors,...b.kit.rooms[0].spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.5),false);for(let z=-5;z<=5;z+=.2)assert.equal(cm.checkCollision(new THREE.Vector3(item.x,item.ph+1.7,item.z+z),.5),false);const ray=new THREE.Raycaster(new THREE.Vector3(0,item.ph+1.7,-6),new THREE.Vector3(0,0,1),0,12);f.updateMatrixWorld(true);ray.ray.origin.applyMatrix4(f.matrixWorld);assert.equal(ray.intersectObject(f,true).length,0);b.dispose();
});
test('R42 malformed or transplanted pavilion profiles fail before changing shell state',()=>{
 assert.equal(typeof api.buildGuhuaPavilion,'function');for(const ch of[{name:'遂初堂'},{x:0},{bays:5},{guhuaProfile:'invented'},{backDoor:true},{roomBays:1},{w:15}]){const b=new ZoneBase(library(),data);assert.throws(()=>b.buildHall({...item,...ch}),/Guhua/);assert.equal(b.kit.root.children.length,0);}
});
test('R42 all121 non-target halls retain complete independently captured R41 signatures',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r42-halls-baseline.json',import.meta.url))).halls,seen=[];let count=0;for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(s=>s.endsWith('.json'))){const d=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));for(const[i,it]of d.items.entries()){if(it.kind!=='hall')continue;const key=d.id+'/'+i;seen.push(key);assert.equal(old[key].name,it.name??null);if(key==='ningshou/17')continue;const b=new ZoneBase(library(),d);b.buildHall(it);assert.deepEqual(hallSignature(b.kit),{geometry:old[key].geometry,navigation:old[key].navigation},key);b.dispose();count++;}}assert.equal(count,121);assert.deepEqual(seen.sort(),Object.keys(old).sort());
});
