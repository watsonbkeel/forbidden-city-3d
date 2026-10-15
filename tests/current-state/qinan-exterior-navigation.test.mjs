import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { buildWorld, hallGeom } from '../lib/world.mjs';
import { qinanGeometry, QINAN_PROFILE } from '../../src/scene/palace/special/QinanProfile.js';
import { PLAYER } from '../../src/config/constants.js';
const hooks=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {Teleport}=await import('../../src/ui/Teleport.js');
const {Minimap}=await import('../../src/ui/Minimap.js');
hooks.deregister();
const item={kind:'hall',name:'钦安殿',structure:'qinan-hall',qinanProfile:'qinan',x:0,z:493.1,rot:0};
const g=qinanGeometry(item);
let promise;const world=()=>promise??=buildWorld();
function target(W){const t=Object.create(Teleport.prototype);t.targets=new Map([[item.name,item]]);t.zoneManager={getMapItems:()=>W.mapItems,getLoadedIds:()=>['garden'],loaded:new Map([['garden',{data:{mapItems:W.mapItems}}]])};t.collisionManager=W.cm;return t;}

test('Qinan hall geometry dispatch is explicitly exterior-only, never the pavilion/generic doorway adapter',()=>{
 const h=hallGeom(item);assert.equal(h.profile.profile,'qinan');assert.equal(h.enter,false);assert.equal(h.backDoor,false);assert.equal(h.open,false);
 assert.equal(h.navigation.mode,'exterior-view');assert.equal(h.doorX,undefined);assert.equal(h.run,undefined);assert.deepEqual(h.footprints,g.map.footprints);
});
test('Qinan teleport consumes the one profile viewpoint and true look-at instead of the inherited facade depth',async()=>{
 const t=target(await world()),geometry=t.geometryFor(item.name),p=t.landingFor(item.name);
 assert.equal(geometry.navigation.mode,'exterior-view');assert.deepEqual([p.x,p.z,p.y],[18,477,0]);
 assert.deepEqual([p.lookAtX,p.lookAtY,p.lookAtZ],[0,3,481.08]);assert.equal(p.viewpointId,'qinan-southwest-ground');
 assert.equal(p.profileHash,QINAN_PROFILE.profileHash);assert.equal(p.validatedAgainstProfileHash,null);
 assert.deepEqual(t.candidate(geometry,100,999),p,'caller distances cannot invent another exterior point');
});
test('real full-world Qin’an viewpoint accepts only resident collision geometry and remains on world ground',async()=>{
 const W=await world(),t=target(W),p=t.resolveLanding(item.name);
 assert.ok(p,'the single candidate must be valid in the newly constructed complete world');assert.equal(p.mode,'exterior-view');assert.equal(p.y,0);
 assert.equal(p.fallback,false);assert.equal(p.viewpointVerified,true);assert.equal(p.validatedAgainstProfileHash,g.profileHash);
 assert.equal(W.cm.checkCollision(new THREE.Vector3(p.x,PLAYER.HEIGHT,p.z),.5),false);
 t.zoneManager.getLoadedIds=()=>[];assert.equal(t.resolveLanding(item.name),null,'cached map metadata does not prove residency');
});
test('missing actual Qin’an support rejects viewpoint validation even when cached map and loaded ids remain',async()=>{
 const W=await world(),t=target(W),old=W.cm.walkables;W.cm.walkables=old.filter(w=>!(w.tag==='garden'&&w.type==='box'&&Math.abs(w.box.min.x-g.supports[0].min[0])<1e-8&&Math.abs(w.box.min.z-g.supports[0].min[2])<1e-8));
 try{assert.equal(t.resolveLanding(item.name),null);}finally{W.cm.walkables=old;}
});
test('blocked or elevated viewpoint fails closed with one candidate and no lateral/platform fallback',async()=>{
 const W=await world(),t=target(W);let calls=0;const original=t.candidate;t.candidate=function(...args){calls++;return original.apply(this,args);};
 W.cm.addCollider(new THREE.Box3(new THREE.Vector3(17,0,476),new THREE.Vector3(19,4,478)),'qinan-negative');
 try{assert.equal(t.resolveLanding(item.name),null);assert.equal(calls,1);}finally{W.cm.removeByTag('qinan-negative');}
 W.cm.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(17,0,476),new THREE.Vector3(19,5,478)),rescue:false},'qinan-negative');
 try{assert.equal(t.resolveLanding(item.name),null,'infinite-height spawn may not bless a platform above the candidate');}finally{W.cm.removeByTag('qinan-negative');}
});
test('a real occluding wall between ground viewpoint and annex rejects the view',async()=>{
 const W=await world(),t=target(W);
 W.cm.addCollider(new THREE.Box3(new THREE.Vector3(8,0,477),new THREE.Vector3(10,8,481)),'qinan-negative');
 try{assert.equal(t.resolveLanding(item.name),null);}finally{W.cm.removeByTag('qinan-negative');}
});
test('minimap draws two separate physical footprints, keeps inherited label anchor, and identifies the exterior action',async()=>{
 const W=await world(),it=W.mapItems.find(i=>i.qinanProfile==='qinan');assert.ok(it);const rectangles=[],texts=[];
 const m=Object.create(Minimap.prototype);m.items=[it];m.labels=[];m.worldToMap=(x,z)=>({x,y:z});m.rectOf=(x,z,w,d)=>[x-w/2,z-d/2,w,d];
 m.ctx={fillRect:(...v)=>rectangles.push(v),strokeRect(){},measureText:t=>({width:t.length*5}),fillText:(...v)=>texts.push(v)};
 m.drawSideItems();assert.deepEqual(rectangles.slice(0,2),it.footprints.map(p=>m.rectOf(p.x,p.z,p.w,p.d)));
 assert.equal(m.labels.length,1);assert.equal(m.labels[0].name,'钦安殿');assert.equal(m.labels[0].mode,'exterior-view');assert.deepEqual([m.labels[0].x,m.labels[0].y],[0,493.1]);
 assert.equal(texts[0][0],'钦安殿（外观）');
});
test('settings and map disclose ground-only preview, missing south stonework, and unknown modern access',()=>{
 const settings=fs.readFileSync(new URL('../../src/ui/SettingsMenu.js',import.meta.url),'utf8'),map=fs.readFileSync(new URL('../../src/ui/Minimap.js',import.meta.url),'utf8');
 for(const phrase of ['钦安殿','地面外观','台上及室内路线未验收','南侧轴线复合石构','不代表现场开放'])assert.ok(settings.includes(phrase),phrase);
 assert.ok(map.includes('钦安殿仅设地面外观观览点'));
 assert.ok(settings.includes('日光为用于辨识建筑体量的示意晴天方向，并非当前天气或实景照片匹配。'));
});

test('stale resident profile identity cannot validate the current source viewpoint',async()=>{
 const W=await world(),t=target(W);t.zoneManager.loaded=new Map([['garden',{data:{mapItems:W.mapItems.map(m=>m.qinanProfile==='qinan'?{...m,profileHash:'stale-resident-profile'}:m)}}]]);
 assert.equal(t.resolveLanding(item.name),null,'loaded old geometry must not be stamped with the new source hash');
});

test('real ZoneManager loads and registers Qin’an before the first collision query, then real controls land at ground view',async()=>{
 const W=await buildWorld({zones:[]}),savedDoc=globalThis.document,savedWindow=globalThis.window,noop=()=>{};
 globalThis.window={location:{search:''},addEventListener:noop,removeEventListener:noop};
 globalThis.document={...savedDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
 const {ZoneManager}=await import('../../src/scene/zones/ZoneManager.js');
 const {FirstPersonControls}=await import('../../src/controls/FirstPerson.js');
 const mats=new Map(),lib=new Proxy({material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>1,aspect:()=>1},{get:(t,k)=>k in t?t[k]:()=>null});
 const zm=new ZoneManager(),scene=new THREE.Scene();
 zm.register({id:'qinan-test-origin',bounds:{x0:-10,x1:10,z0:-1000,z1:-900},neighbors:[],items:[]});
 const garden=(await world()).zones.find(z=>z.json.id==='garden').json;zm.register({...garden,neighbors:[]});
 zm.init(scene,lib,W.cm,{x:0,z:-950});
 const camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:globalThis.document,addEventListener:noop,removeEventListener:noop},W.cm);
 const t=target(W);t.zoneManager=zm;t.controls=controls;t.overlay={textContent:'',style:{}};
 const checks=[],original=W.cm.getGroundHeight;
 W.cm.getGroundHeight=function(...args){checks.push({loaded:zm.getLoadedIds(),resident:this.walkables.filter(w=>w.tag==='garden').length});return original.apply(this,args);};
 try{
  assert.ok(!zm.getLoadedIds().includes('garden'));
  const p=t.go(item.name);assert.ok(p);assert.equal(p.y,0);assert.equal(controls.getFeetY(),0);assert.equal(p.zone,'garden');
  assert.equal(p.validatedAgainstProfileHash,g.profileHash);assert.ok(checks.length>0);assert.ok(checks.every(c=>c.loaded.includes('garden')&&c.resident>=g.supports.length));
  const direction=camera.getWorldDirection(new THREE.Vector3()),expected=new THREE.Vector3(0,3,481.08).sub(camera.position).normalize();assert.ok(direction.distanceTo(expected)<1e-8);
  assert.ok(t.overlay.textContent.includes('地面外观预览'));
 }finally{clearTimeout(t.overlayTimer);W.cm.getGroundHeight=original;controls.dispose();zm.dispose();globalThis.document=savedDoc;globalThis.window=savedWindow;}
});

test('browser teleport harness isolates the exterior view while every original entrance-target statement stays byte-exact',async()=>{
 const {readHistoricalSource}=await import('../lib/historical-sources.mjs');
 const file='tests/p1u-teleport.cjs',source=fs.readFileSync(new URL(`../../${file}`,import.meta.url),'utf8');
 const marker=/        \/\/ BEGIN QINAN EXTERIOR VIEW\n[\s\S]*?        \/\/ END QINAN EXTERIOR VIEW\n/;
 const exterior=source.match(marker);assert.ok(exterior,'typed exterior branch required before the legacy doorway probe');
 assert.ok(exterior[0].includes("g.navigation?.mode === 'exterior-view'"));assert.ok(exterior[0].includes('lookAtY'));assert.ok(exterior[0].includes('residentHash'));
 assert.ok(!exterior[0].includes('getValidPosition'),'exterior observation never claims a forward entrance walk');
 assert.equal(source.replace(marker,''),readHistoricalSource('a59fa7ec18b6ce991128a2e7700ba09be3128078',file).toString('utf8'));
});

function sourceTargetPanel(W) {
 const n=g.southAnnex,xs=g.mainBody.columnFootGrid.xs;
 const min=new THREE.Vector3(g.x+xs[2]+n.skin.columnRadius,g.datum.floorY,g.z+n.frontZ-n.skin.wallThickness/2);
 const max=new THREE.Vector3(g.x+xs[3]-n.skin.columnRadius,n.columnTopY,g.z+n.frontZ+n.skin.wallThickness/2);
 const matches=W.cm.colliders.filter(c=>c.tag==='garden'&&c.box.min.distanceTo(min)<1e-8&&c.box.max.distanceTo(max)<1e-8);
 assert.equal(matches.length,1,'one actual source-derived central annex panel');return matches[0];
}
test('target-containing occluder cannot inherit the observed facade exemption, even with the garden tag',async()=>{
 const W=await world(),t=target(W),eye=new THREE.Vector3(18,PLAYER.HEIGHT,477),look=new THREE.Vector3(0,3,481.08);
 const blocker=new THREE.Box3(new THREE.Vector3(-1,0,477),new THREE.Vector3(10,8,482));
 const hit=new THREE.Ray(eye,look.clone().sub(eye).normalize()).intersectBox(blocker,new THREE.Vector3());
 assert.ok(blocker.containsPoint(look));assert.ok(eye.distanceTo(look)-eye.distanceTo(hit)>10,'negative box begins over 10m before target');
 for(const tag of ['qinan-negative','garden']){const original=W.cm.colliders;W.cm.colliders=[...original,{mesh:blocker,box:blocker,tag}];
  try{assert.equal(t.resolveLanding(item.name),null,tag);}finally{W.cm.colliders=original;}}
});
test('source-bounded facade termination accepts the actual thin panel at an oblique angle',async()=>{
 const W=await world(),t=target(W),c=sourceTargetPanel(W),eye=new THREE.Vector3(18,PLAYER.HEIGHT,477),look=new THREE.Vector3(0,3,481.08);
 assert.ok(Math.abs(c.box.max.z-c.box.min.z-.2)<1e-8);
 const hit=new THREE.Ray(eye,look.clone().sub(eye).normalize()).intersectBox(c.box,new THREE.Vector3());
 assert.ok(eye.distanceTo(look)-eye.distanceTo(hit)>.4,'a flat .25m cutoff would falsely reject this legitimate oblique panel');
 assert.ok(t.resolveLanding(item.name));
});
test('missing, enlarged or foreign-tagged target facade cannot validate the view',async()=>{
 const W=await world(),t=target(W),panel=sourceTargetPanel(W),original=W.cm.colliders;
 const stretched=panel.box.clone();stretched.min.z-=.01;
 for(const replacement of [null,{...panel,box:stretched},{...panel,tag:'qinan-foreign'}]){
  W.cm.colliders=original.filter(c=>c!==panel);if(replacement)W.cm.colliders.push(replacement);
  try{assert.equal(t.resolveLanding(item.name),null);}finally{W.cm.colliders=original;}
 }
});

test('duplicate or moved source facade identity fails closed instead of blessing an ambiguous terminal surface',async()=>{
 const W=await world(),t=target(W),panel=sourceTargetPanel(W),original=W.cm.colliders;
 const moved={...panel,box:panel.box.clone().translate(new THREE.Vector3(.01,0,0))};
 for(const colliders of [[...original,{...panel,box:panel.box.clone()}],original.map(c=>c===panel?moved:c)]){
  W.cm.colliders=colliders;try{assert.equal(t.resolveLanding(item.name),null);}finally{W.cm.colliders=original;}
 }
});
