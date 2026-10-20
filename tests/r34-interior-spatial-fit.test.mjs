import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {library} from './lib/inner-palace-fixture.mjs';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
function hall(name){const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();b.buildHall(g,PALACE_LAYOUT.find(x=>x.name===name),name==='乾清宫'?2.16:P.frame.floorY,name==='乾清宫'?{heightReferenceY:7}:{});b.addObject(g);g.updateMatrixWorld(true);return{b,g};}
test('Qianqing frontage registers a wider central bay consistently in real column geometry',()=>{
 const{b,g}=hall('乾清宫');try{const columns=g.children.filter(m=>m.userData.qianqingColumn),xs=[...new Set(columns.map(m=>m.position.x))];
 assert.deepEqual(xs,[-23,-18,-13,-8,-3.25,3.25,8,13,18,23]);
 assert.equal(columns.length,56);assert.match(g.userData.qianqingFrontageFit.status,/ESTIMATED.*NOT_SURVEY/);
 }finally{b.dispose();}
});
test('Qianqing paired warm-room boundaries stop cross-wall walking but preserve side viewing and end passages',()=>{
 const{b,g}=hall('乾清宫');try{const walls=g.children.filter(m=>m.userData.qianqingWarmRoom?.kind==='boundary-panel');assert.ok(walls.length>=6,'paired warm rooms must have actual visible panels');
 for(const sign of[-1,1]){for(const z of[308,312,316.8,321,325.6])assert.ok(b.colliders.some(c=>c.containsPoint(new T.Vector3(sign*8,3.86,z))),'warm room must be closed at eye height');
 for(const z of[305.8,312,320,327.8])assert.ok(!b.colliders.some(c=>c.containsPoint(new T.Vector3(sign*20.5,3.86,z))),'end passage must remain continuous');
 for(const z of[308,312,316.8,321,325.6])assert.ok(!b.colliders.some(c=>c.containsPoint(new T.Vector3(sign*6.2,3.86,z))),'central side-view corridor must remain open');}
 assert.equal(g.userData.qianqingWarmRooms.rooms,2);
 }finally{b.dispose();}
});
test('Taihe grouped display now straddles middle gold row and places throne under retained caisson bay',()=>{
 assert.ok(P.dais.z0<P.columns.goldZ[1]&&P.dais.z1>P.columns.goldZ[1]);
 assert.ok(P.screen.z<P.columns.goldZ[2]);close(P.dais.z0,5.06);close(P.dais.z1,12.06);close(P.throne.z,9.26);close(P.screen.z,11.5);
 assert.ok(Math.abs(P.throne.z-P.caisson.z)<.3);close(P.caisson.z,9.51);close(P.ceilingY,9.47375);close(P.plaque.z,-5.8968);
 assert.equal(P.throne.overallHeight,1.725);assert.equal(P.plaque.width,6.8);assert.equal(P.couplets.height,7.5);
});
test('Taihe permanent dais collision and every stair front move with the visible group',()=>{
 const{b,g}=hall('太和殿');try{const platform=b.colliders.find(c=>Math.abs(c.min.x+3.6)<1e-6&&Math.abs(c.max.x-3.6)<1e-6&&Math.abs(c.max.y-(P.frame.floorY+4))<1e-6);assert.ok(platform);close(platform.min.z,5.06);close(platform.max.z,12.06);
 const steps=b.walkables.filter(w=>w.type==='box'&&!w.rescue);assert.equal(steps.length,21);close(Math.min(...steps.map(w=>w.box.min.z)),2.12);close(Math.max(...steps.map(w=>w.box.max.z)),5.06);
 }finally{b.dispose();}
});

test('Qianqing all central doors, raised windows and end mouths use the same nonuniform axes',()=>{
 const{b,g}=hall('乾清宫');try{const f=g.userData.qianqingFrontageFit,r=46/9*.08,windows=g.children.filter(m=>m.userData.qianqingFrontEnclosure?.kind==='window'),leaves=g.children.filter(m=>m.userData.qianqingFrontEnclosure?.kind==='leaf');
 assert.equal(windows.length,4);assert.equal(leaves.length,6);
 for(const m of windows){const i=m.userData.qianqingFrontEnclosure.bay,box=new T.Box3().setFromObject(m);close((box.min.x+box.max.x)/2,(f.x[i]+f.x[i+1])/2);close(box.max.x-box.min.x,f.x[i+1]-f.x[i]-2*r);}
 for(const i of[3,4,5]){const pair=leaves.filter(m=>m.userData.qianqingFrontEnclosure.bay===i);close((pair[0].position.x+pair[1].position.x)/2,(f.x[i]+f.x[i+1])/2);}
 const p=g.userData.qianqingPassages;close(p.inner,18);close(p.centerX,20.5);close(p.bayW,5);
 for(const sign of[-1,1])for(const z of[p.zSouth,p.zNorth]){const mouths=g.children.filter(m=>m.userData.qianqingPassage?.kind==='mouth-jamb'&&m.userData.qianqingPassage.sign===sign&&m.userData.qianqingPassage.zf===z);assert.equal(mouths.length,2);close((mouths[0].position.x+mouths[1].position.x)/2,sign*20.5);}
 }finally{b.dispose();}
});

test('Qianqing actual full-height partitions close both faces with no central-hall or veranda false wall',()=>{
 const{b,g}=hall('乾清宫');try{const walls=g.children.filter(m=>m.userData.qianqingWarmRoom?.kind==='boundary-panel');
 for(const sign of[-1,1])for(const z of[308,312,316.8,321,325.6])for(const y of[2.36,3.86,7.5])for(const side of[-1,1]){
 const eye=new T.Vector3(sign*8+side,y,z),ray=new T.Raycaster(eye,new T.Vector3(-side,0,0),0,2),hits=ray.intersectObjects(walls);assert.ok(hits.length);close(hits[0].point.x,sign*8+side*.12);
 }
 for(const z of[305.8,327.8]){const ray=new T.Raycaster(new T.Vector3(-16,3.86,z),new T.Vector3(1,0,0),0,32);assert.equal(ray.intersectObjects(walls).length,0);}
 }finally{b.dispose();}
});

test('native rail parity changes exactly 24 old side-sheet Y values, retaining triangle cost and all other batch data',async()=>{
 const {appendTaiheDaisFront}=await import('../src/scene/palace/special/TaiheDaisFront.js');
 const {TAIHE_DAIS_FALLBACK_DATA:source}=await import('../src/scene/palace/special/TaiheDaisFallbackData.js');
 const group=new T.Group(),materials=Object.fromEntries(['gold','darkGold','red','teal'].map(k=>[k,new T.MeshStandardMaterial()]));appendTaiheDaisFront(group,materials);let changed=0;
 const decode=s=>{const b=Buffer.from(s,'base64');return Array.from({length:b.length/4},(_,i)=>b.readFloatLE(i*4));};
 try{for(let k=0;k<source.length;k++){const mesh=group.children[k],before=decode(source[k].position),after=mesh.geometry.attributes.position.array;close(mesh.position.z,-2);assert.equal(before.length,after.length);assert.deepEqual(Array.from(mesh.geometry.attributes.normal.array),decode(source[k].normal));
 for(let i=0;i<before.length;i++){if(before[i]===after[i])continue;assert.equal(i%3,1);close(Math.abs(before[i-1]),3.48);assert.ok([7.06,14.06].some(z=>Math.abs(before[i+1]-z)<1e-5));close(after[i],before[i]<2.1?2.7025:2.7375);changed++;}}
 assert.equal(changed,24);
 }finally{group.traverse(m=>m.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());}
});


test('unknown frontage envelopes and duplicate warm-room owners fail closed',async()=>{
 const{qianqingFrontageGrid}=await import('../src/scene/palace/QianqingFrontageGrid.js');for(const w of[0,45,47,NaN,Infinity])assert.throws(()=>qianqingFrontageGrid(w),/Unregistered/);
 const{buildQianqingWarmRooms}=await import('../src/scene/palace/QianqingWarmRooms.js'),{b,g}=hall('乾清宫');try{assert.throws(()=>buildQianqingWarmRooms(b,g,{x0:0,z0:316.8,y:2.16,w:46,d:25,H:7.22,beamH:.8664}),/Duplicate/);}finally{b.dispose();}
});
