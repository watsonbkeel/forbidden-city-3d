import test from 'node:test';
import assert from 'node:assert/strict';
import{existsSync,readFileSync,readdirSync}from'node:fs';
import * as THREE from 'three';
import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
import{library}from'./lib/inner-palace-fixture.mjs';
import{hallSignature}from'./lib/r40-hall-signature.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/east-six.json',import.meta.url)));
const url=new URL('../src/scene/palace/special/EastResidentialFacades.js',import.meta.url),api=existsSync(url)?await import(url):{};
const target={景仁宫:'jingren-rear-entry',钟粹宫:'zhongcui-front-veranda',永和宫:'yonghe-open-baoxia'};
const nodes=(f,role)=>{const out=[];f.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
function fixture(name){assert.equal(typeof api.buildEastResidentialFacade,'function','source-specific east facade builder missing');const item=config.items.find(i=>i.kind==='hall'&&i.name===name),b=new ZoneBase(library(),config),result=b.buildHall(item);b.kit.root.updateMatrixWorld(true);return{item,b,...result};}
for(const[name,id]of Object.entries(target))test(`R40 ${name} opts into only its own documented facade relationship`,()=>{
 const{b,item,f}=fixture(name);assert.equal(item.facadeProfile,id);assert.equal(f.userData.structure.profile,id);assert.equal(f.userData.structure.photographyDate,null);assert.match(f.userData.structure.dimensionStatus,/FIT/);assert.equal(b.kit.rooms.length,1);assert.equal(b.kit.mapItems.filter(m=>m.name===name).length,1);assert.match(f.userData.structure.furnitureStatus,/UNVERIFIED/);b.kit.dispose(b.kit.root);
});
test('R40 Zhongcui enclosure is behind existing round columns under one original roof',()=>{
 const{b,item,f}=fixture('钟粹宫'),windows=nodes(f,'east-facade-sill-window');assert.equal(windows.length,4);for(const w of windows)assert.equal(w.userData.localZ,-item.d/2+2.0);
 const cols=f.children.filter(o=>o.geometry?.type==='CylinderGeometry'&&o.material?.name==='wood_column'&&Math.abs(o.position.z+item.d/2)<1e-7);assert.equal(cols.length,6);assert.equal(nodes(f,'yonghe-open-canopy').length,0);
 assert.deepEqual(b.kit.rooms[0].doors,[{x:item.x,z:+(item.z-item.d/2+2.0).toFixed(2)}]);b.kit.dispose(b.kit.root);
});
test('R40 Yonghe baoxia is an open three-bay canopy, not a duplicate enclosed room or ceiling',()=>{
 const{b,item,f}=fixture('永和宫'),canopy=nodes(f,'yonghe-open-canopy');assert.equal(canopy.length,1);assert.equal(nodes(f,'yonghe-canopy-column').length,4);assert.ok(nodes(f,'yonghe-curved-rafter').length>=4);assert.equal(nodes(canopy[0],'east-plain-ceiling').length,0);assert.equal(nodes(f,'east-plain-ceiling').length,1);assert.equal(nodes(f,'yonghe-canopy-wall').length,0);assert.equal(b.kit.rooms[0].doors[0].z,+(item.z-item.d/2).toFixed(2));
 const xs=nodes(f,'yonghe-canopy-column').map(o=>o.position.x).sort((a,b)=>a-b);for(let i=0;i<4;i++)assert.ok(Math.abs(xs[i]-(-1.5+i)*item.w/5)<1e-6);assert.match(canopy[0].userData.roofJointStatus,/UNKNOWN/);b.kit.dispose(b.kit.root);
});
test('R40 Jingren opens rear center but does not mirror front lattice onto rear glazing',()=>{
 const{b,item,f}=fixture('景仁宫');assert.equal(b.kit.rooms[0].doors.length,2);assert.ok(b.kit.rooms[0].doors.some(d=>d.z===+(item.z+item.d/2).toFixed(2)));assert.equal(nodes(f,'jingren-rear-glazed-fit').length,4);assert.match(f.userData.structure.seatPlacementStatus,/GAME_ACCESS/);b.kit.dispose(b.kit.root);
});
test('R40 all119 non-target hall geometry/material/navigation signatures retain independent frozen R39 captures',()=>{
 const frozen=JSON.parse(readFileSync(new URL('./fixtures/r40-non-target-halls.json',import.meta.url))).halls,seen=[];let retained=0;
 for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(s=>s.endsWith('.json'))){const d=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));for(const[i,item]of d.items.entries()){if(item.kind!=='hall')continue;const key=d.id+'/'+i;seen.push(key);assert.equal(frozen[key]?.name,item.name??null);if(d.id==='east-six'&&target[item.name])continue;const b=new ZoneBase(library(),d);b.buildHall(item);assert.deepEqual(hallSignature(b.kit),{geometry:frozen[key].geometry,navigation:frozen[key].navigation},key+' '+item.name);b.kit.dispose(b.kit.root);retained++;}}
 assert.deepEqual(seen.sort(),Object.keys(frozen).sort());assert.equal(retained,119);
});
test('R40 malformed or transplanted facade identities reject before shell mutation',()=>{
 assert.equal(typeof api.buildEastResidentialFacade,'function');const item=config.items.find(i=>i.kind==='hall'&&i.name==='永和宫');for(const change of[{x:0},{bays:7},{w:30},{facadeProfile:'bad'},{rot:1},{backDoor:true}]){const b=new ZoneBase(library(),config);assert.throws(()=>b.buildHall({...item,...change}),/East facade/);assert.equal(b.kit.root.children.length,0);}
});
