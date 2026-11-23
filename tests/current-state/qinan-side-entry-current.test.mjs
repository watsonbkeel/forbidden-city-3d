import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import garden from '../../data/zones/garden.json' with {type:'json'};
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {Environment} from '../../src/scene/Environment.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {qinanGeometry} from '../../src/scene/palace/special/QinanProfile.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {replayCuiyun} from '../r175-cuiyun-hall/replay.mjs';
import {createDOM} from '../lib/ui-dom.mjs';

// Vite supplies implicit JSON in production; native Node needs the standard
// QA JSON attribute adapter solely while resolving the real Teleport module.
const hooks=registerHooks({load(url,context,next){
  return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);
}});
let Teleport;
try{({Teleport}=await import('../../src/ui/Teleport.js'));}
finally{hooks.deregister();}
const repo=new URL('../../',import.meta.url);

const item=garden.items.find(i=>i.qinanProfile==='qinan'),g=qinanGeometry(item);
const scope='ACTUAL_GARDEN_ZONE_MANAGER_AND_GARDEN_STATIC_ONLY_NOT_BROWSER_GPU_OR_FULL_CITY';
const v=(...p)=>new T.Vector3(...p),Y=g.datum.floorY,R=.5;
const eq=(a,b)=>Math.abs(a-b)<1e-7,mb=()=>Math.round(process.resourceUsage().maxRSS/1024);
const note=(kind,data)=>console.log(JSON.stringify({kind,scope,...data,peakMiB:mb()}));
const bounds=(min,max)=>new T.Box3(v(...min),v(...max));
const inXZ=(b,x,z)=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z;
const oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
let W,lib,cpu,scene,env,staticGarden,zm,zone,dom,actualMap,registered,ground;
before(()=>{
  cpu=installCpuDocument(createCanvas);
  const nativeCanvasDocument=globalThis.document;
  dom=createDOM();
  dom.window.location={search:''};
  dom.document.exitPointerLock=()=>{};
  const createElement=dom.document.createElement;
  dom.document.createElement=tag=>tag==='canvas'?nativeCanvasDocument.createElement(tag):createElement.call(dom.document,tag);
  dom.document.createElementNS=nativeCanvasDocument.createElementNS;
  globalThis.window=dom.window;
  globalThis.document=dom.document;
  lib=realTextureLibrary();scene=new T.Scene();env=new Environment(scene,null,lib);
  env.setupGround();
  ground=scene.children.find(o=>o.isMesh&&o.userData.environmentGroundSource===true);
  assert.ok(ground);
  staticGarden=new GardenBuilder(scene,lib).build(PALACE_LAYOUT.find(p=>p.type==='garden'));
  const cm=new CollisionManager();W={THREE:T,cm};
  const filenames=fs.readdirSync(new URL('data/zones/',repo)).filter(f=>f.endsWith('.json')).sort();
  const definitions=filenames.map(f=>JSON.parse(fs.readFileSync(new URL('data/zones/'+f,repo))));
  const intersect=d=>d.bounds.x0<=18.5&&d.bounds.x1>=-18.5&&d.bounds.z0<=500.5&&d.bounds.z1>=469.5;
  assert.deepEqual(definitions.filter(intersect).map(d=>d.id),['garden']);
  // No unrelated zones are built. Drop only absent neighbor IDs for this
  // scoped manager; original Garden items, bounds, builder and finish are used.
  zm=new ZoneManager({reuseInactive:true});
  zm.register({...garden,neighbors:[]});zm.init(scene,lib,cm,{x:18,z:470});
  assert.deepEqual(zm.getLoadedIds(),['garden']);
  assert.equal(zm.zones.get('garden').items,garden.items);
  zone=zm.loaded.get('garden').data;
  const statics=staticGarden.getColliders();
  cm.addColliders(statics,'garden-static');cm.addWalkables(staticGarden.getWalkables(),'garden-static');
  cm.setRegions(zm.getRegions());
  scene.updateMatrixWorld(true);
  assert.equal(zone.group.parent,scene);assert.equal(staticGarden.group.parent,scene);
  assert.ok(cm.colliders.filter(c=>c.tag==='garden').every(c=>zone.colliders.includes(c.mesh)));
  assert.ok(cm.colliders.filter(c=>c.tag==='garden-static').every(c=>statics.includes(c.mesh)));
  assert.equal(cm.dynamicBodies.size,0);
  actualMap=zone.mapItems.find(m=>m.qinanProfile==='qinan');
  assert.equal(actualMap.navigation.gameAccess,'virtual-interior-return');
  assert.equal(actualMap.profileHash,g.profileHash);
  assert.deepEqual(actualMap.navigation.position,{x:18,z:470,feetY:0});
  assert.deepEqual(actualMap.navigation.virtualRoutes,g.navigation.virtualRoutes);
  assert.equal(g.provenance.currentConditionAccepted,false);
  for(const n of ['钦安殿·主殿','钦安殿·前抱厦']){
    const room=zone.rooms.find(r=>r.name===n);assert.ok(room,n);
    assert.equal(room.kind,'virtual-tour');
  }
  const owners=zone.walkables.filter(w=>w.supportId?.startsWith('qinan-'));
  assert.equal(owners.length,g.supports.length);
  registered=new Map();
  for(const source of owners){
    const records=cm.walkables.filter(w=>w.tag==='garden'&&w.type==='box'&&w.rescue===false&&w.box.equals(source.box));
    assert.equal(records.length,1,source.supportId);
    registered.set(records[0],source.supportId);
  }
  note('born-owners',{profile:g.profileHash,counts:[zone.colliders.length,zone.walkables.length,statics.length,staticGarden.getWalkables().length],
    floorY:Y,qinanSupports:owners.length,portals:g.portals,actualLanding:actualMap.navigation.position});
});
after(()=>{
  try{zm?.dispose();W?.cm.clear();staticGarden?.dispose();env?.dispose();lib?.dispose();}
  finally{cpu?.restore();if(oldWindow)Object.defineProperty(globalThis,'window',oldWindow);else delete globalThis.window;}
});

function actualGround(x,z){
  assert.equal(W.cm.getGroundHeight(x,z,0,PLAYER.STEP_UP,R),0);
  assert.equal(W.cm.checkCollision(v(x,PLAYER.HEIGHT,z),R),false);
  const groundHit=new T.Raycaster(v(x,.03,z),v(0,-1,0),0,.05).intersectObject(ground,false)[0];
  assert.ok(groundHit&&eq(groundHit.point.y,0),'actual normal environment plane at route origin');
}
function route(sign,mapPoint){
  const z=g.z+g.terraceGuide.sideStairCenterZ;
  const original=[[sign*18,477],[sign*18,z],[sign*8,z],[0,z],[0,g.z]];
  assert.deepEqual(g.navigation.virtualRoutes.find(r=>r.id===g.portals.find(p=>p.sign===sign).id).points,original);
  assert.equal(z,483.20000000000005);
  // Preserve all R49 coordinates. Only separate map route prepends and
  // appends the admitted current public west observation pose.
  const forward=mapPoint?[mapPoint,...original]:original;
  return [...forward,...forward.slice(0,-1).reverse()];
}
function ownerOf(x,z,y){
  return [...registered].flatMap(([w,id])=>inXZ(w.box,x,z)&&eq(w.box.max.y,y)?[id]:[]);
}
function contact(x,z,feet){
  const cm=W.cm,eye=v(x,feet+PLAYER.HEIGHT,z),hit=cm.checkCollision(eye,R);
  const owned=cm.queryBox(cm._overheadBodyBox).filter(c=>c.box.intersectsBox(
    c.overhead||c.triangleSupport||c.xiqingRoofSurface?cm._overheadBodyBox:cm.playerBox));
  return {x,z,feet,floor:cm.getGroundHeight(x,z,feet,PLAYER.STEP_UP,R),hit,
    ownerSupports:ownerOf(x,z,feet),
    nearbySolids:owned.slice(0,12).map(c=>({tag:c.tag,min:c.box.min.toArray(),max:c.box.max.toArray(),
      triangleId:c.triangleSupport?.id??null}))};
}
function stairSolids() {
  const cm=W.cm;
  const pairs=[...registered].filter(([,id])=>/-step-/.test(id)).map(([support,id])=>{
    const box=support.box;
    const candidates=cm.colliders.filter(c=>c.tag==='garden'&&!c.triangleSupport&&!c.xiqingRoofSurface&&!c.overhead&&
      eq(c.box.min.y,0)&&eq(c.box.max.y,box.max.y)&&['x','z'].every(k=>eq(c.box.min[k],box.min[k])&&eq(c.box.max[k],box.max[k])));
    assert.equal(candidates.length,1,id+' unique physically owned stone body');
    assert.ok(zone.colliders.includes(candidates[0].mesh));
    return [candidates[0],id];
  });
  return new Map(pairs);
}
// Observe the real vertical stage directly; no physics, coordinates, timing,
// registration or movement functions are replaced except this call-through
// telemetry on the authored test's real controller prototype.
function recordGroundStages(t,fn){
  const rows=[],stage=FirstPersonControls.prototype.updateGround;
  const spy=t.mock.method(FirstPersonControls.prototype,'updateGround',function(...args){
    const {x,z}=this.camera.position,preFeet=this.feetY,tracked=this._trackedGround,preGround=this.groundY,airborne=this.airborne;
    const result=stage.apply(this,args);
    rows.push({x,z,preFeet,tracked,preGround,airborne,after:{x:this.camera.position.x,z:this.camera.position.z,feet:this.feetY,ground:this.groundY,airborne:this.airborne}});
    return result;
  });
  try{return{route:fn(),rows};}finally{spy.mock.restore();spy.mock.resetCalls();}
}
function ownedSupportHeight(stage,frame,solids,sign){
  const cm=W.cm;
  const sx=stage.x,sz=stage.z,pre=stage.preFeet,limit=pre+.05,radius=.3;
  const liveHeight=cm.supportHeight(sx,sz,limit);
  const selected=[...solids].flatMap(([c,id])=>{
    if(!id.startsWith('qinan-'+(sign<0?'east':'west')+'-step-')||!eq(c.box.max.y,liveHeight))return [];
    const pad=Math.max(c.box.min.x-sx,sx-c.box.max.x,c.box.min.z-sz,sz-c.box.max.z,0);
    if(pad>radius||c.box.max.y>limit)return [];
    return [{id,pad,min:c.box.min.toArray(),max:c.box.max.toArray()}];
  });
  // Cross-check actual cached substep height rather than assume every frame
  // matches a centre query. Untracked fallback uses the actual live query.
  const walk=stage.tracked??cm.getGroundHeight(sx,sz,stage.airborne?pre:Math.max(pre,stage.preGround),PLAYER.STEP_UP);
  return {frame,pre,limit,liveHeight,walk,afterGround:stage.after.ground,selected,
    maxRuleAgrees:eq(Math.max(walk,liveHeight),stage.after.ground)};
}
function debugCameraContacts(frame,solids){
  const cm=W.cm,eye=v(frame.x,frame.feet+PLAYER.HEIGHT,frame.z);
  if(!cm.checkCollision(eye,R))return null;
  const body=cm.playerBox.clone();
  const rows=cm.queryBox(cm._overheadBodyBox).filter(c=>c.box.intersectsBox(
    c.overhead||c.triangleSupport||c.xiqingRoofSurface?cm._overheadBodyBox:body));
  const overlap=rows.map(c=>{
    const lo=body.min.clone().max(c.box.min),hi=body.max.clone().min(c.box.max);
    const overlap=hi.clone().sub(lo).toArray();
    const id=solids.get(c)??null;
    const x=(lo.x+hi.x)/2,z=(lo.z+hi.z)/2,top=c.box.max.y;
    const visible=id&&overlap.every(a=>a>0)?new T.Raycaster(v(x,top+.02,z),v(0,-1,0),0,.04).intersectObject(zone.group,true)
      .find(h=>Math.abs(h.point.y-top)<1e-5):null;
    return {id,tag:c.tag,min:c.box.min.toArray(),max:c.box.max.toArray(),overlap,
      visibleTread:visible?{y:visible.point.y,material:visible.object.material.name}:null};
  });
  return {frame,renderedEye:eye.toArray(),debugBody:{min:body.min.toArray(),max:body.max.toArray()},overlap};
}
function runRoute(t,p,sign,fps,kind){
  actualGround(...p[0]);
  const capture=recordGroundStages(t,()=>replayTerrace(t,W,p,{fps,sprint:false,backward:false,recordFrames:true}));
  const r=capture.route,solids=stairSolids();
  assert.equal(capture.rows.length,r.frames.length+(r.arrived?2*fps:0));
  const tied=r.frames.map((f,i)=>{
    const stage=capture.rows[i];
    assert.ok(eq(stage.after.x,f.x)&&eq(stage.after.z,f.z)&&eq(stage.after.feet,f.feet)&&eq(stage.after.ground,f.ground),'actual vertical observation and original physical frame align');
    return {f,stage};
  });
  const hits=tied.filter(({f})=>f.ground>0).map(({f,stage})=>({f,stage,owners:ownerOf(f.x,f.z,f.ground)}));
  const supportIds=[...new Set(hits.flatMap(h=>h.owners))];
  const noCenter=hits.flatMap(({f,stage,owners})=>owners.length?[]:[ownedSupportHeight(stage,f,solids,sign)]);
  const unknown=noCenter.filter(q=>!q.maxRuleAgrees||!q.selected.length||!eq(q.liveHeight,q.frame.ground)||q.walk>q.liveHeight||
    q.frame.waypoint!==(p.length===11?8:7)||Math.abs(q.liveHeight-q.walk)>.150000001);
  const {frames,...summary}=r,last=frames.at(-1);
  const tooClose=r.arrived?null:contact(last.x,last.z,last.feet);
  const stuckBehind=!r.arrived&&r.stuckAt?[.05,.15,.25,.4,.6].map(d=>{
    const n=Math.hypot(r.stuckAt[0]-last.x,r.stuckAt[1]-last.z);
    const f=Math.min(1,d/n);return contact(last.x+f*(r.stuckAt[0]-last.x),last.z+f*(r.stuckAt[1]-last.z),last.feet);
  }):[];
  const logical=r.frames.filter(f=>W.cm.checkCollision(v(f.x,Math.max(f.feet,f.ground)+PLAYER.HEIGHT,f.z),R));
  const cameraRows=r.frames.flatMap(f=>{const q=debugCameraContacts(f,solids);return q?[q]:[];});
  const interior=hits.find(({f,owners})=>Math.abs(f.x)<1&&Math.abs(f.z-g.z)<1&&Math.abs(f.feet-Y)<.01&&owners.includes('qinan-main-platform'));
  const max=(values)=>Math.max(0,...values);
  note(kind,{sign,fps,p,...summary,frameCount:frames.length,supportIds,
    supportedOutsideCenter:noCenter.length,maximumSupportPad:max(noCenter.flatMap(q=>q.selected.map(o=>o.pad))),
    unknown:unknown.slice(0,2),logicalHits:logical.slice(0,2),logicalHitCount:logical.length,
    debugCameraOverlap:{samples:cameraRows.length,owners:cameraRows.flatMap(q=>q.overlap.map(o=>o.id)),
      maxBoxOverlapY:max(cameraRows.flatMap(q=>q.overlap.map(o=>o.overlap[1]))),first:cameraRows[0]},
    interior,tooClose,stuckBehind});
  assert.equal(r.arrived,true,'exact authored input did not reach all waypoints; see approach contacts');
  assert.equal(r.driver.crossings.length,p.length-1);
  assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=Y-.01);assert.equal(r.end[2],0);
  assert.ok(interior,'real room/platform support inside main hall');
  assert.ok(supportIds.includes('qinan-annex-platform'));
  const side=sign<0?'east':'west';
  const hasOnCertainSide=sign=>hits.some(({f,owners})=>Math.sign(f.x)===sign&&owners.some(id=>id.startsWith('qinan-'+(sign<0?'east':'west')+'-step-')));
  assert.ok(hasOnCertainSide(sign)&&!hasOnCertainSide(-sign),side+' alone must supply the raised side stair on the signed route');
  assert.deepEqual(unknown,[],'all elevated movement must bind the actual selected Qin’an support; no rescue or invisible floor');
  assert.deepEqual(logical,[],'every known native supported body pose stays out of actual registered solids');
  // The camera's smoothed feet are not the native grounded motion body.
  // Keep their bounded debug overlap separate, not a general clearance waiver.
  assert.ok(cameraRows.every(q=>q.frame.waypoint===2&&fps===60&&
    q.frame.ground-q.frame.feet>=0&&q.frame.ground-q.frame.feet<=.07&&
    q.overlap.length&&q.overlap.every(o=>o.id&&o.visibleTread&&
      o.overlap[1]>0&&o.overlap[1]<=.02&&q.renderedEye[1]-o.max[1]>=1.3)),
    'only a bounded ascent smoothing overlap with actual visible stair stone is observed');
}
for(const sign of [-1,1])for(const fps of [10,60])test('Current Qin’an '+(sign<0?'east':'west')+' virtual side entrance and same-way return at '+fps+' Hz',t=>{
  runRoute(t,route(sign),sign,fps,'exact-r49-side-route');
});

test('Current Qin’an public map lands outside and the west virtual entrance is reachable on foot',t=>{
  const camera=new T.PerspectiveCamera(),host=dom.document.createElement('div');
  host.ownerDocument=dom.document; // Three PointerLockControls uses the host's standard DOM owner.
  const controls=new FirstPersonControls(camera,host,W.cm);
  let teleport;
  try{
    controls.setPosition(18,PLAYER.HEIGHT,469);
    teleport=new Teleport(controls,zm,W.cm);
    assert.equal(teleport.targets.get(item.name),item,'the real imported map target is exactly registered in source Garden');
    const p=teleport.go(item.name);assert.ok(p,'ground observation point must be admitted using actual local resident ownership');
    assert.deepEqual([p.x,p.z,p.y,p.mode,p.zone],[18,470,0,'exterior-view','garden']);
    assert.equal(p.validatedAgainstProfileHash,g.profileHash);
    assert.equal(p.fallback,false);
    assert.equal(controls.getFeetY(),0);
    assert.match(teleport.overlay.textContent,/东西侧阶入殿并原路返回.*不代表现场开放/);
    const expected=v(0,3,481.08).sub(camera.position).normalize();
    assert.ok(camera.getWorldDirection(v()).distanceTo(expected)<1e-8);
    runRoute(t,route(1,[p.x,p.z]),1,10,'actual-public-landing-then-west-route');
  }finally{teleport?.dispose();controls.dispose();}
});

test('Current Qin’an north wall and closed south panel block departure from supported interior',t=>{
  const center=g.z,b=g.mainBody.columnFootGrid,a=g.mainBody.enclosureApproximation,n=g.southAnnex;
  const wallZ=g.z+b.zs.at(-1),southZ=g.z+n.frontZ;
  const nx=g.x+b.width/2,smin=b.xs[2]+n.skin.columnRadius,smax=b.xs[3]-n.skin.columnRadius;
  const north=bounds([-nx,Y,wallZ-a.wallThickness/2],[nx,g.levels.eaveColumnTop,wallZ+a.wallThickness/2]);
  const south=bounds([smin,Y,southZ-n.skin.wallThickness/2],[smax,n.columnTopY,southZ+n.skin.wallThickness/2]);
  for(const [kind,pts,want,dir] of [
    ['north-wall',[[0,center],[0,500]],north,1],
    ['closed-south-panel',[[0,483.2],[0,480.5]],south,-1],
  ]){
    const [x,z]=pts[0];
    assert.ok(ownerOf(x,z,Y).length,'must begin on real interior support');
    assert.equal(W.cm.checkCollision(v(x,Y+PLAYER.HEIGHT,z),R),false,'not a vacuous already occupied origin');
    const physical=W.cm.colliders.filter(c=>c.tag==='garden'&&c.box.min.distanceTo(want.min)<1e-7&&c.box.max.distanceTo(want.max)<1e-7);
    assert.equal(physical.length,1,kind+' exactly one actual source-bound solid');
    assert.ok(zone.colliders.includes(physical[0].mesh));
    const r=replayCuiyun(t,W,pts,{fps:10,startFeet:Y,recordFrames:true,sprint:false,backward:false});
    const stop=r.allFrames.at(-1);
    const face=(dir>0?physical[0].box.min.z:physical[0].box.max.z)-dir*R;
    const witness=contact(0,face+dir*.03,Y);
    note(kind,{pts,start:{x,z,Y},last:stop,actualWall:physical[0].box.toArray?.()??[physical[0].box.min.toArray(),physical[0].box.max.toArray()],face,witness});
    assert.equal(r.arrived,false);assert.ok(dir*(stop.z-z)>.4);
    assert.equal(stop.feet,Y);assert.ok(0<=dir*(face-stop.z)&&dir*(face-stop.z)<.7);
    assert.equal(W.cm.checkCollision(v(stop.x,Y+PLAYER.HEIGHT,stop.z),R),false);
    assert.equal(witness.hit,true);
    assert.ok(witness.nearbySolids.some(c=>c.tag==='garden'&&v(...c.min).distanceTo(want.min)<1e-7&&v(...c.max).distanceTo(want.max)<1e-7));
  }
});
