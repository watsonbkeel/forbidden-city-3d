import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import fs from 'node:fs';
import { CourtKit } from '../src/scene/palace/kit.js';
import { sideGateGeometry } from '../src/scene/palace/special/SideGateProfiles.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { PLAYER } from '../src/config/constants.js';
import { JINSHUI_BRIDGES } from '../src/scene/palace/river.js';
import { replayKunning } from './lib/kunning-walk.mjs';

const api = await import('../src/scene/palace/special/InnerJinshui.js').catch(error => ({ error }));
const river = {name:'金水河',type:'river',position:{x:0,y:-.3,z:-310.8},bridges:JINSHUI_BRIDGES,dimensions:{width:100,depth:15,height:.5}};
const close=(a,b,label='')=>assert.ok(Math.abs(a-b)<2e-5,`${label}: ${a} != ${b}`);
function ready() { assert.equal(typeof api.buildInnerJinshui,'function',`Missing coherent river builder: ${api.error?.message}`); }
function fixture(item=river) {
  ready();
  const materials=new Map();
  const library={material(name){if(!materials.has(name))materials.set(name,new THREE.MeshStandardMaterial({name}));return materials.get(name);},tileSize:()=>2,aspect:()=>1};
  const waterMaterial=new THREE.MeshStandardMaterial({name:'water'});
  const result=api.buildInnerJinshui(library,item,waterMaterial);
  result.group.updateMatrixWorld(true);
  const cm=new CollisionManager();cm.rivers=[];cm.addColliders(result.colliders);cm.addWalkables(result.walkables);
  // Only the pending three-line integration is supplied here. Physics, body,
  // movement and support code are the production implementations unchanged.
  cm.checkRiverCrossing=(position,radius)=>api.canCrossInnerJinshui(item,position,radius);
  return {THREE,...result,cm,materials,waterMaterial,library};
}
function down(group,x,z,y=5) { return new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,-1,0)).intersectObject(group,true); }

test('documentary topology is separate from fitted reach and retained independent bridge entries',()=>{
  ready();const p=api.innerJinshuiProfile(river);
  assert.match(p.status,/FIT.*NOT_SURVEYED/);
  assert.equal(p.bridges.length,5);
  assert.deepEqual(p.bridges.map(b=>b.x),[-30,-13,0,13,30]);
  assert.deepEqual(p.bridges.map(b=>b.z),Array(5).fill(-310.8));
  assert.deepEqual(p.bridges.map(b=>[b.width,b.length]),Array.from({length:5},()=>[6.1,21]));
  assert.equal(new Set(p.bridges).size,5);
  assert.ok(p.sources.some(s=>s.url.includes('236439')));
  assert.ok(p.sources.some(s=>s.url.includes('map3.jpg')));
  assert.ok(p.sources.some(s=>s.url.includes('s5a6079fc517e1')));
  assert.ok(p.banks.north.at(0).z>p.banks.north.find(b=>Math.abs(b.x)<1e-8).z+12);
  assert.ok(p.banks.north.at(-1).z>p.banks.north.find(b=>Math.abs(b.x)<1e-8).z+12);
  assert.equal(p.ends,'OPEN_MODEL_BOUNDARIES_NOT_COMPLETE_WATER_SYSTEM');
});

test('actual water and ground cutout share the bowed polygon rather than a rectangle',()=>{
  const f=fixture(),p=f.profile;
  // Shape uses (world x,-world z), matching Environment.
  const groundShape=new THREE.Shape();
  groundShape.moveTo(-150,220);groundShape.lineTo(150,220);groundShape.lineTo(150,380);groundShape.lineTo(-150,380);groundShape.closePath();
  groundShape.holes.push(api.innerJinshuiGroundPath(river));
  const ground=new THREE.Mesh(new THREE.ShapeGeometry(groundShape),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));ground.rotation.x=-Math.PI/2;ground.updateMatrixWorld(true);
  let waterChecks=0,dryChecks=0;
  for(let x=-72;x<=72;x+=4)for(let z=-326;z<=-280;z+=3){
    const water=down(f.water,x,z).length>0,land=down(ground,x,z).length>0;
    assert.notEqual(water,land,`water/ground must partition ${x},${z}`);
    if(!p.bridges.some(b=>Math.abs(x-b.x)<b.width/2+.1))assert.equal(api.canCrossInnerJinshui(river,{x,z},0),!water,`guard ${x},${z}`);
    if(water)waterChecks++;else dryChecks++;
  }
  assert.ok(waterChecks>80&&dryChecks>80);
  assert.equal(down(f.water,0,-310.8)[0].object.material,f.waterMaterial);
  assert.equal(down(f.water,0,-290).length,0);
  assert.ok(down(f.water,70,-293).length>0,'north-turned shoulder is water beyond old rectangle');
  const gap=api.innerJinshuiRoadGap(river,4);
  for(const x of [-4,0,4])for(const z of [gap.minZ-.1,gap.maxZ+.1])assert.equal(down(f.water,x,z).length,0,'split decorative road stays dry');
  assert.ok(gap.minZ<=-318.3&&gap.maxZ>=-303.3);
  ground.geometry.dispose();ground.material.dispose();
});

test('each real vault is open across its full bridge width, with masonry above and at springing',()=>{
  const f=fixture();
  for(const b of f.profile.bridges){
    const startX=b.x-b.width/2-.1;
    const cast=(z,y)=>new THREE.Raycaster(new THREE.Vector3(startX,y,z),new THREE.Vector3(1,0,0),0,b.width+.2).intersectObject(f.group,true);
    assert.equal(cast((b.opening[0]+b.opening[1])/2,-.3).length,0,`${b.id} real open vault`);
    assert.ok(cast(b.z,.65).length>0,`${b.id} stone above crown`);
    assert.ok(cast(b.minZ+.3,-.3).length>0,`${b.id} south abutment`);
    assert.ok(cast(b.maxZ-.3,-.3).length>0,`${b.id} north abutment`);
    assert.ok(b.opening[0]>b.minZ+1&&b.opening[1]<b.maxZ-1,'visible landing overlap each bank');
  }
});

test('generated deck triangles and every production walk ramp agree throughout all five crossings',()=>{
  const f=fixture();
  for(const b of f.profile.bridges)for(const offset of [-1.5,0,1.5])for(let z=b.minZ+.01;z<b.maxZ;z+=.31){
    const ramp=f.walkables.find(w=>w.structureId===b.id&&z>=w.minZ-1e-9&&z<=w.maxZ+1e-9);
    assert.ok(ramp);const t=(z-ramp.a0)/(ramp.a1-ramp.a0),expected=ramp.y0+t*(ramp.y1-ramp.y0);
    const hit=down(f.group,b.x+offset,z)[0];assert.ok(hit);close(hit.point.y,expected,b.id);
    close(f.cm.getGroundHeight(b.x+offset,z,expected,.6),expected,'physical support');
    assert.equal(f.cm.checkCollision(new THREE.Vector3(b.x+offset,expected+PLAYER.HEIGHT,z),.5),false,'open bridge deck');
  }
});

test('water guard rejects curved non-bridge water and radius overlap, while bank rail gaps keep five entrances open',()=>{
  const f=fixture();
  for(const b of f.profile.bridges)for(const dz of [-11,-8,0,8,11])assert.equal(f.cm.checkCollision(new THREE.Vector3(b.x,PLAYER.HEIGHT+.9,b.z+dz),.5),false,`${b.id}/${dz}`);
  for(const x of [-60,-44,-21,-7,7,21,44,60]){
    const bank=f.profile.banks.north.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);
    assert.equal(api.canCrossInnerJinshui(river,{x:bank.x,z:bank.z-2},.5),false);
    assert.equal(api.canCrossInnerJinshui(river,{x:bank.x,z:bank.z+.25},.5),false,'footprint touches water');
    assert.equal(api.canCrossInnerJinshui(river,{x:bank.x,z:bank.z+1.6},.5),true,'dry path outside bank');
  }
  assert.equal(f.cm.checkCollision(new THREE.Vector3(2.5,PLAYER.HEIGHT+.9,-310.8),.5),true,'bridge rail blocks lateral exit');
});

test('translation moves actual water, bridge decks, support and colliders once with unchanged topology',()=>{
  const a=fixture(),b=fixture({...river,position:{...river.position,x:7,z:-290.8}});
  assert.equal(a.colliders.length,b.colliders.length);assert.equal(a.walkables.length,b.walkables.length);
  for(let i=0;i<a.colliders.length;i++)assert.ok(a.colliders[i].clone().translate(new THREE.Vector3(7,0,20)).equals(b.colliders[i]));
  for(let i=0;i<a.walkables.length;i++){close(b.walkables[i].minX-a.walkables[i].minX,7);close(b.walkables[i].a0-a.walkables[i].a0,20);close(b.walkables[i].y0,a.walkables[i].y0);}
  close(down(b.group,7,-290.8)[0].point.y,down(a.group,0,-310.8)[0].point.y);
});

test('finite merged geometry stays bounded and all resources are caller-owned/disposable',()=>{
  const f=fixture();let vertices=0,meshes=0;const geometries=new Set(),materials=new Set();
  f.group.traverse(m=>{if(!m.isMesh)return;meshes++;vertices+=m.geometry.attributes.position.count;geometries.add(m.geometry);materials.add(m.material);
    assert.equal(m.visible,true);assert.ok(m.geometry.attributes.uv&&m.geometry.attributes.normal);
    for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));
    const n=m.geometry.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);
  });
  assert.ok(meshes<=5,`${meshes} meshes`);assert.ok(vertices<60000,`${vertices} vertices`);assert.ok(materials.size<=4);
  assert.ok([...materials].every(m=>m===f.waterMaterial||[...f.materials.values()].includes(m)),'no hidden texture/material allocations');
  let disposed=0;for(const g of geometries){g.addEventListener('dispose',()=>disposed++);g.dispose();}assert.equal(disposed,geometries.size);
});


test('independent bridge entries control real geometry and reject unsupported registrations',()=>{
  ready();const edited={...river,bridges:river.bridges.map((b,i)=>i===2?{...b,width:8.1,length:23}: {...b})};
  const f=fixture(edited),p=f.profile;
  assert.deepEqual(p.bridges.map(b=>b.width),[6.1,6.1,8.1,6.1,6.1]);
  assert.deepEqual(p.bridges.map(b=>b.length),[21,21,23,21,21]);
  assert.ok(down(f.group,3.3,-310.8).some(h=>h.point.y>.85),'wider centre has actual deck');
  assert.equal(api.canCrossInnerJinshui(edited,{x:3.1,z:-310.8},.5),true);
  assert.equal(api.canCrossInnerJinshui(river,{x:3.1,z:-310.8},.5),false);
  assert.throws(()=>api.innerJinshuiProfile({...river,position:{x:NaN,z:0}}),/finite/);
  assert.throws(()=>api.innerJinshuiProfile({...river,bridges:river.bridges.slice(1)}),/five/);
  assert.throws(()=>api.innerJinshuiProfile({...river,bridges:river.bridges.map(b=>({...b,width:0}))}),/width/);
  assert.throws(()=>api.canCrossInnerJinshui(river,{x:0,z:0},-.1),/radius/);
});

test('both reach boundaries remain open instead of becoming transverse masonry dams',()=>{
  const f=fixture();
  for(const side of [-1,1]){
    const edge=side*76,point=new THREE.Vector3(edge+side*.5,-.3,-290.8),direction=new THREE.Vector3(-side,0,0);
    const hits=new THREE.Raycaster(point,direction,0,1).intersectObject(f.group,true);
    assert.equal(hits.length,0,'the channel mouth has no wall or fake bridge shadow');
  }
});

for(const fps of [10,60])for(const sprint of [false,true])for(const reverse of [false,true])test(`all five bridges use real controller ${fps}Hz sprint=${sprint} reverse=${reverse}`,t=>{
  const f=fixture();
  for(const b of f.profile.bridges){const points=[[b.x,b.z-14],[b.x,b.z+14]];if(reverse)points.reverse();
    const result=replayKunning(t,f,points,{startFeet:0,fps,sprint});
    assert.equal(result.arrived,true,JSON.stringify(result));assert.ok(result.maxFeet>.8);assert.ok(result.minFeet>=0);close(result.end[2],0);
  }
});


for(const fps of [10,60])for(const sprint of [false,true])test(`north-bank approaches reach both retained side-gateway ramps ${fps}Hz sprint=${sprint}`,t=>{
  const oldDocument=globalThis.document,ctx=new Proxy({}, {get:()=>()=>({data:[]}),set:()=>true});
  globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
  try {
    const f=fixture(),kit=new CourtKit(f.library);
    const axis=JSON.parse(fs.readFileSync(new URL('../data/zones/axis-courts.json',import.meta.url),'utf8'));
    const items=['协和门','熙和门'].map(name=>axis.items.find(v=>v.kind==='gate'&&v.name===name));
    for(const item of items)kit.gate({...item,plaque:false});
    f.cm.addColliders(kit.colliders);f.cm.addWalkables(kit.walkables);
    for(const item of items){
      const g=sideGateGeometry(item),sign=Math.sign(g.x),front=g.ramps.find(r=>r.side==='front'),rear=g.ramps.find(r=>r.side==='rear');
      const transit=[rear.zToe+2,rear.zToe,rear.zTop,front.zTop,front.zToe,front.zToe-2].map(z=>g.toWorld(0,z));
      // Two fitted approach points skirt the north bank and the bounded open
      // reach end. They are route QA coordinates, not historical path surveys.
      const points=[[sign*30,g.z],[sign*30,-280],[sign*80,-280],...transit];
      const result=replayKunning(t,f,points,{startFeet:0,fps,sprint});
      assert.equal(result.arrived,true,JSON.stringify({name:g.name,...result}));
      assert.ok(result.maxFeet>=2.61);assert.ok(result.minFeet>=0);close(result.end[2],0);
    }
  } finally {globalThis.document=oldDocument;}
});
