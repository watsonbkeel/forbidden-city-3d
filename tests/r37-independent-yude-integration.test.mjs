import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { TextureLibrary, TEXTURE_SPECS } from '../src/utils/TextureLibrary.js';
import { yudeGeometry } from '../src/scene/palace/special/YudeBath.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';
import { resourceBudget } from './lib/resource-budget.mjs';

// Independent full-zone CPU geometry/controller audit. Actual render merge is
// enabled. DOM/canvas boundaries are simulated, not browser/phone acceptance.
const config=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url)));
const item=config.items.find(i=>i.name==='浴德堂'),g=yudeGeometry(item);
let cached;
function fixture(){
  if(cached)return cached;
  const builder=new ZoneBase(library(),config),parts=[];
  const finish=builder.kit.finish;
  builder.kit.finish=function(){
    this.root.updateMatrixWorld(true);
    this.root.traverse(o=>{if(o.isMesh&&o.userData.role?.startsWith('yude-'))parts.push({role:o.userData.role,box:new THREE.Box3().setFromObject(o),material:o.material?.name,metadata:structuredClone(o.userData)});});
    return finish.call(this);
  };
  const data=builder.build(),cm=new CollisionManager();
  cm.addColliders(data.colliders,'outer-west');cm.addWalkables(data.walkables,'outer-west');
  data.group.updateMatrixWorld(true);
  return cached={THREE,builder,data,cm,parts};
}
function ray(root,from,dir,length){return new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...dir),0,length).intersectObject(root,true);}
function isBlocked(f,x,z){return f.cm.checkCollision(new THREE.Vector3(x,2.2,z),.45);}

test('R37 independent: merged rear solids agree with real collision rather than metadata-only components',()=>{
  const f=fixture();
  for(const p of [g.annex,g.northRoom,g.bath]){
    const x=g.x+p.x,z=g.z+p.z;
    assert.equal(isBlocked(f,x,z),true,p.id+' is exterior-only');
    for(const s of [-1,1]){
      const hits=ray(f.data.group,[x+s*(p.w/2+.25),2.2,z],[-s,0,0],.5);
      assert.ok(hits.some(h=>Math.abs(h.point.x-(x+s*p.w/2))<1e-4),p.id+' real merged side wall');
    }
  }
  for(let i=1;i<g.passage.points.length;i++){
    const a=g.passage.points[i-1],b=g.passage.points[i],x=g.x+(a[0]+b[0])/2,z=g.z+(a[1]+b[1])/2;
    assert.equal(isBlocked(f,x,z),true,'closed passage segment '+i);
    const hits=ray(f.data.group,[x,4,z],[0,-1,0],4);
    assert.ok(hits.some(h=>h.object.material.name==='wall_brick'&&h.point.y>2.2),'actual brick vault '+i);
  }
  const dome=f.parts.find(p=>p.role==='yude-bath-dome');
  assert.ok(dome&&dome.box.max.y-dome.box.min.y<2);
  const hits=ray(f.data.group,[g.x+g.bath.x+1,g.bath.h+10,g.z+g.bath.z],[0,-1,0],12);
  assert.ok(hits.some(h=>h.object.material.name==='yude_bath_grey_render'&&h.point.y>g.front.ph+g.bath.h));
});

test('R37 independent: only original front room/card/spawns exist and its rear wall is genuinely closed',()=>{
  const f=fixture(),rooms=f.data.rooms.filter(r=>r.name==='浴德堂'),maps=f.data.mapItems.filter(m=>m.name==='浴德堂');
  assert.equal(rooms.length,1);assert.equal(maps.length,1);assert.deepEqual([maps[0].x,maps[0].z],[246,-177.2]);
  assert.equal(f.data.group.userData.architecture.filter(a=>a.id==='yude-bath-compound').length,1);
  for(const p of [g.annex,g.northRoom,g.bath])assert.equal(f.data.rooms.some(r=>r.min.x<g.x+p.x&&r.max.x>g.x+p.x&&r.min.z<g.z+p.z&&r.max.z>g.z+p.z),false,p.id+' has no new visitor room');
  for(const p of rooms[0].spawns)assert.equal(isBlocked(f,p.x,p.z),false,'retained spawn is clear');
  const x=g.x,z=g.z+g.front.d/2;
  assert.equal(isBlocked(f,x,z),true,'retired generic rear route stays closed');
  assert.ok(ray(f.data.group,[x,2.2,z-1],[0,0,1],1.4).length>0,'visible rear wall accompanies collision');
  assert.equal(isBlocked(f,g.x,g.z-g.front.d/2),false,'south entrance is not sealed');
});

for(const fps of [10,60])for(const sprint of [false,true])test(`R37 independent: current front entry returns to real ground ${fps}Hz sprint=${sprint}`,t=>{
  const f=fixture(),go=[[246,-185],[246,-181.3],[246,-177.7]],points=[...go,...go.slice(0,-1).reverse()];
  const placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(f.cm,{flights:[]});let result;
  try{result=replayTerrace(t,f,points,{fps,sprint,recordFrames:true});}finally{trace.restore();}
  assert.equal(placed.mock.callCount(),1);placed.mock.restore();
  assert.equal(result.startFeet,0);assert.equal(result.arrived,true,JSON.stringify({end:result.end,stuckAt:result.stuckAt}));
  assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false);
  const inside=result.frames.filter(p=>Math.abs(p.x-246)<.5&&p.z>-180.5&&p.z<-178);
  assert.ok(inside.length>0);assert.ok(inside.every(p=>Math.abs(p.ground-.5)<.01&&p.feet>.3),'actual floor supports traversal');
  assert.ok(result.frames.every(p=>[p.x,p.z,p.feet,p.ground].every(Number.isFinite)&&p.feet>=0));
});

for(const fps of [10,60])test(`R37 independent: exterior perimeter remains walkable around rear compound ${fps}Hz`,t=>{
  const f=fixture(),go=[[254.3,-185],[254.3,-154.5],[237,-154.5],[237,-185]],points=[...go,...go.slice(0,-1).reverse()];
  const placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(f.cm,{flights:[]});let result;
  try{result=replayTerrace(t,f,points,{fps,sprint:true,recordFrames:true});}finally{trace.restore();}
  assert.equal(placed.mock.callCount(),1);placed.mock.restore();
  assert.equal(result.startFeet,0);assert.equal(result.arrived,true,JSON.stringify({end:result.end,stuckAt:result.stuckAt}));
  assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false);
  assert.ok(result.frames.every(p=>p.ground===0&&p.feet===0),'no rear visitor support or invisible broad platform');
});

test('R37 independent: merged front roof covers the occupied room and retains a visible interior ceiling',()=>{
  const f=fixture();
  for(const x of [-5,-3,0,3,5])for(const z of [-3,-1,0,1,3]){
    const down=ray(f.data.group,[g.x+x,12,g.z+z],[0,-1,0],12);
    assert.ok(down.some(h=>h.object.material.name==='roof_tile'&&h.point.y>5.6),`roof cover at ${x},${z}`);
    const up=ray(f.data.group,[g.x+x,2.2,g.z+z],[0,1,0],10);
    assert.ok(up.some(h=>h.point.y>4.5&&h.point.y<6),'ceiling must not disappear when old roof is removed');
  }
  const frontDome=f.parts.filter(p=>p.role==='yude-bath-dome'&&p.box.min.z<g.z+g.front.d/2);
  assert.equal(frontDome.length,0,'bath dome must not replace the front hall');
  const roofs=f.parts.filter(p=>p.role==='yude-rolled-crown');
  assert.equal(roofs.length,2,'unverified annex cover is not an invented third roof');
  assert.ok(roofs.every(p=>p.metadata.dimensionStatus==='REVERSIBLE_MODEL_FIT_NOT_SURVEYED'));
});

function watch(resource){let count=0;resource.addEventListener('dispose',()=>count++);return()=>count;}
test('R37 independent: actual Yude merge and repeated full-zone teardown release private resources exactly once',()=>{
  const lib=new TextureLibrary();for(const name of Object.keys(TEXTURE_SPECS))lib.colors.set(name,new THREE.Texture({width:64,height:64}));
  const shared=new Map(),retired=[],privateSeen=new Set();let expectedBudget,expectedNav;
  try{for(let cycle=0;cycle<3;cycle++){
    const builder=new ZoneBase(lib,config),source=new Map(),finish=builder.kit.finish;
    builder.kit.finish=function(){this.root.traverse(o=>{if(o.isMesh&&o.userData.role?.startsWith('yude-')&&!source.has(o.geometry))source.set(o.geometry,watch(o.geometry));});return finish.call(this);};
    const data=builder.build(),owned=builder.kit.owned.filter(m=>m.name.startsWith('yude_'));
    assert.equal(owned.length,3);assert.ok(source.size>100,'actual tiled caps/vault/dome are covered');
    for(const count of source.values())assert.equal(count(),1,'merge releases source geometry');
    for(const m of owned){assert.equal(privateSeen.has(m),false);privateSeen.add(m);retired.push(watch(m));}
    data.group.traverse(o=>{if(o.geometry)retired.push(watch(o.geometry));});
    for(const r of [...lib.materials.values(),...lib.allTextures()])if(!shared.has(r))shared.set(r,watch(r));
    const budget=resourceBudget([data.group]),nav=JSON.stringify({colliders:data.colliders,walkables:data.walkables,rooms:data.rooms,mapItems:data.mapItems});
    if(cycle===0){expectedBudget=budget;expectedNav=nav;}else{assert.deepEqual(budget,expectedBudget);assert.equal(nav,expectedNav);}
    builder.dispose();builder.dispose();
    for(const count of retired)assert.equal(count(),1);for(const count of source.values())assert.equal(count(),1);
    for(const count of shared.values())assert.equal(count(),0,'borrowed material/texture must survive');
  }}finally{lib.dispose();}
});

test.after(()=>cached?.builder.dispose());
