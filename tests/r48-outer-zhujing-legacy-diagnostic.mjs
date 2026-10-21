// Opt-in OLD-WAYPOINT FAILURE REPRODUCER, not a default release .test.mjs.
// Frozen original proof: outer-zhujing-legacy-diagnostic.json; original test SHA93857d6dc64c3ca59b553f54c6a1b93b084484fd10d82b47b1c415432db18415.
// Independent final-four review. Production geometry, character constants and
// expected failures are never changed here. DOM/clock are the only movement stubs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {PLAYER} from '../src/config/constants.js';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {CourtKit,FACE} from '../src/scene/palace/kit.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {buildSouthCourtHall} from '../src/scene/palace/special/SouthCourtHalls.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {buildWorld} from './lib/world.mjs';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {createPhysicalWaypointDriver} from './lib/physical-waypoints.mjs';
import {zoneRoutes} from './lib/auto-routes.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {first21Signature} from './r48-outer-first21-helper.mjs';
import * as api from '../src/scene/palace/special/RemainingOuterHalls.js';

const dir=new URL('../docs/current-state/r48-remaining/',import.meta.url);
const rows=JSON.parse(readFileSync(new URL('outer-scope.json',dir)));
const names=['主敬殿','本仁殿','集义殿','恒寿斋'];
const results=[],routes=[],legacyRoutes=[],freeProbes=[],proxyBounds=[],scheduled=[];
const reportURL=new URL('outer-zhujing-legacy-replay.json',dir);
const previous=existsSync(reportURL)?JSON.parse(readFileSync(reportURL)):{};
const hash=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const moduleSHA256=hash(readFileSync(new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url)));
const check=(name,fn)=>{scheduled.push(name);return test(name,async t=>{try{await fn(t);results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});throw e;}});};
function realLibrary(){const lib=new TextureLibrary();for(const key of Object.keys(TEXTURE_SPECS))lib.colors.set(key,new T.Texture({width:64,height:64}));return lib;}
function fixture(name,{real=true,augment=true}={}){
 const row=rows.find(r=>r.name===name),item=row.baselineItem,lib=real?realLibrary():library(),kit=new CourtKit(lib,row.zone),p=api.resolveRemainingProfile(row.zone,item);
 assert.ok(p,`${name}: expected explicit live final-four identity`);
 const base=name==='主敬殿'?buildSouthCourtHall(kit,item):kit.hall({...item,rot:typeof item.rot==='string'?FACE[item.rot]:item.rot});
 kit.buildPlaqueAtlas();const out=augment?api.augmentRemainingHall(kit,item,base,p):base;kit.root.updateMatrixWorld(true);
 return{row,item,p,kit,lib,...out,dispose(){kit.dispose(kit.root);if(real)lib.dispose();}};
}
const nodes=(f,role)=>{const out=[];f.traverse(n=>{if(n.userData.role===role)out.push(n)});return out};
const meshes=f=>{const out=[];f.traverse(n=>{if(n.isMesh&&n.visible)out.push(n)});return out};
function tris(m,relative=null){const a=m.geometry.attributes.position,ix=m.geometry.index,out=[],matrix=relative?relative.clone().multiply(m.matrixWorld):m.matrixWorld;for(let i=0;i<(ix?.count??a.count);i+=3)out.push(new T.Triangle(...[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+j):i+j).applyMatrix4(matrix))));return out;}
function solidContact(solid,other,tolerance=2e-6){solid.geometry.computeBoundingBox();const box=solid.geometry.boundingBox.clone().expandByScalar(tolerance),inverse=solid.matrixWorld.clone().invert();return tris(other,inverse).some(tri=>box.intersectsTriangle(tri));}
function meshSignature(f){return hash(meshes(f).map(m=>({name:m.name.replace(/_material\b/g,''),role:m.userData.role,matrix:m.matrixWorld.toArray(),a:Object.fromEntries(Object.entries(m.geometry.attributes).filter(([k])=>k!=='uv').map(([k,a])=>[k,Array.from(a.array)])),ix:m.geometry.index?Array.from(m.geometry.index.array):null})));}
const isMat=(fx,m,key)=>m.material===fx.lib.material(key);
const under=(node,parent)=>{for(let n=node;n;n=n.parent)if(n===parent)return true;return false;};

for(const name of names)check(`final4 ${name}: real TextureLibrary matches stub geometry, navigation and ownership`,()=>{
 const a=fixture(name),b=fixture(name,{real:false});try{
  assert.equal(meshSignature(a.f),meshSignature(b.f));
  for(const key of ['colliders','walkables','rooms','regions','mapItems'])assert.equal(JSON.stringify(a.kit[key]),JSON.stringify(b.kit[key]),key);
  assert.deepEqual(a.g,b.g);assert.equal(a.g.wholeBuildingComplete,false);assert.equal(a.p.currentInventoryVerified,false);assert.equal(a.p.visitorAccessVerified,false);
  for(const m of meshes(a.f)){assert.ok(m.matrixWorld.elements.every(Number.isFinite));assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));assert.ok(a.lib.owns(m.material)||a.kit.owned.includes(m.material),'real material must have an owner');}
 }finally{a.dispose();b.dispose();}
});

for(const name of names)check(`final4 ${name}: original rooms, furniture and undeclared shell geometry remain byte-identical`,()=>{
 const fx=fixture(name,{augment:false}),{f,kit,item,p}=fx;try{
  const old=meshes(f).map(n=>({n,geometry:n.geometry,attributes:hash(Object.fromEntries(Object.entries(n.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)]))),matrix:n.matrixWorld.toArray(),position:n.position.toArray(),rotation:n.rotation.y,material:n.material,wasRoof:f.children.some(r=>r.name.startsWith('roof_')&&under(n,r))}));
  const state=Object.fromEntries(['rooms','regions','mapItems','walkables'].map(k=>[k,JSON.stringify(kit[k])])),display=JSON.stringify(f.userData.structure.display??null);
  const out=api.augmentRemainingHall(kit,item,fx,p);kit.root.updateMatrixWorld(true);let removed=0;
  for(const q of old){if(!under(q.n,f)){removed++;assert.ok(name==='恒寿斋'?q.wasRoof:['本仁殿','集义殿'].includes(name)&&(isMat(fx,q.n,'lattice_doors')||isMat(fx,q.n,'wall_red'))&&q.n.position.z<0,'undeclared old object removed');continue;}
   assert.equal(q.n.geometry,q.geometry);assert.equal(hash(Object.fromEntries(Object.entries(q.n.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)]))),q.attributes);assert.equal(q.n.material,q.material);
   if(name==='主敬殿'&&isMat(fx,q.n,'lattice_doors')&&Math.abs(Math.sin(q.rotation))>.99&&q.position[2]<0){
    assert.equal(q.n.userData.r48OpenPoseFit,'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT');assert.equal(q.n.userData.source,null);assert.deepEqual(q.n.userData.oldPosition,q.position);assert.equal(q.n.userData.oldRotation,q.rotation);
    assert.deepEqual(q.n.position.toArray(),[q.position[0],q.position[1],-item.d-q.position[2]]);assert.equal(q.n.rotation.y,-q.rotation);
   }else assert.deepEqual(q.n.matrixWorld.toArray(),q.matrix);
  }
  if(['本仁殿','集义殿'].includes(name))assert.equal(removed,7,'only six generic front door/window meshes and the one red head may be removed');
  if(name==='主敬殿'){assert.equal(removed,0);assert.equal(old.filter(q=>q.n.userData.r48OpenPoseFit).length,2);assert.equal(out.g.openDoorPose.changedFrontLeaves,2);}
  for(const[k,value]of Object.entries(state))assert.equal(JSON.stringify(kit[k]),value,`${k} changed`);
  assert.equal(JSON.stringify(out.g.display??null),display);if(name!=='主敬殿')assert.equal(out.g.interiorChanged,false);
 }finally{fx.dispose();}
});

for(const name of names)check(`final4 ${name}: new geometry is nondegenerate and merge/disposal retain library ownership`,()=>{
 const fx=fixture(name),{f,kit,lib,p}=fx;let finished=false;try{
  const raw=new Map(),owned=new Map(),shared=new Map();
  for(const m of kit.owned){owned.set(m,0);m.addEventListener('dispose',()=>owned.set(m,owned.get(m)+1));}
  for(const m of lib.materials.values()){shared.set(m,0);m.addEventListener('dispose',()=>shared.set(m,shared.get(m)+1));}
  const roof=f.children.find(n=>n.userData.remainingRoof==='hengshou-plain-flush-gable');
  for(const m of meshes(f)){
   if(!raw.has(m.geometry)){raw.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>raw.set(m.geometry,raw.get(m.geometry)+1));}
   if(m.userData.remainingOuterId===p.id||roof&&under(m,roof))for(const t of tris(m))assert.ok(t.getArea()>1e-10,`${m.name} degenerate new triangle`);
  }
  const merged=kit.finish();for(const n of raw.values())assert.equal(n,1,'raw geometry must dispose exactly once at merge');kit.dispose(merged);finished=true;
  for(const n of owned.values())assert.equal(n,1,'private material must dispose exactly once');for(const n of shared.values())assert.equal(n,0,'shared real library material must survive hall disposal');
 }finally{if(!finished)kit.dispose(kit.root);lib.dispose();}
});

for(const name of ['本仁殿','集义殿']){
 check(`final4 ${name}: own photo identity, four four-leaf sill windows and model-only folded central door`,()=>{
  const fx=fixture(name),{f,g,p}=fx;try{
   assert.match(g.photoFacade.photo,new RegExp(`/1.tiles/${p.key==='jiyi'?'l':'r'}/`));assert.equal(g.photoFacade.photographyDate,null);assert.match(g.interiorStatus,/EVIDENCE_BLOCKED/);
   assert.equal(g.photoFacade.bayCountStatus,p.key==='jiyi'?'FIVE_GROUPS_VISIBLE_IN_OWN_PANORAMA':'FIVE_RETAINED_BAYS_ARE_ENVELOPE_FIT_OBSCURED_IN_OWN_PHOTO');
   assert.equal(g.photoFacade.windowGroups.length,4);assert.ok(g.photoFacade.windowGroups.every(w=>w.leafCount===4&&/FITTED/.test(w.counts)));
   for(const[role,n]of [['stone-window-sill',4],['window-recess',16],['window-leaf-stile',32],['window-leaf-rail',32],['window-lower-panel',16],['central-door-door-leaf',4]])assert.equal(nodes(f,p.key+'-photo-'+role).length,n);
   assert.match(g.photoFacade.centralDoorPose,/MODEL_ACCESS_NOT_PHOTOGRAPHED_OPEN_STATE/);
  }finally{fx.dispose();}
 });
 check(`final4 ${name}: all new diamond lattice segments actually meet solid frames`,()=>{
  const fx=fixture(name),{f,p}=fx;try{
   const lattice=nodes(f,p.key+'-photo-diamond-lattice'),supports=['window-leaf-stile','window-leaf-rail','window-lower-panel'].flatMap(s=>nodes(f,p.key+'-photo-'+s));assert.ok(lattice.length>300);
   const unsupported=lattice.filter(l=>!supports.some(s=>solidContact(s,l)));
   assert.equal(unsupported.length,0,JSON.stringify({unsupported:unsupported.length,total:lattice.length,example:unsupported[0]?.position.toArray()}));
   for(const sill of nodes(f,p.key+'-photo-stone-window-sill'))assert.ok(nodes(f,p.key+'-photo-window-leaf-stile').some(s=>solidContact(sill,s)),'window frame must bear on its real stone sill');
  }finally{fx.dispose();}
 });
 check(`final4 ${name}: upper windows are visible and not hidden behind an old red head`,()=>{
  const fx=fixture(name),{f,item,p,g}=fx;try{
   const H=item.colH-T.MathUtils.clamp(item.colH*.12,.45,.85),top=item.ph+H-.3,front=-item.d/2,dir=new T.Vector3(0,0,1).transformDirection(f.matrixWorld);
   for(const w of g.photoFacade.windowGroups)for(let k=0;k<4;k++)for(const y of [top-.12,top-.38,item.ph+1.5]){
    const x=w.x0+(k+.5)*(w.x1-w.x0)/4,origin=f.localToWorld(new T.Vector3(x,y,front-.8)),hits=new T.Raycaster(origin,dir,0,1.2).intersectObject(f,true),first=hits[0];
    assert.ok(first,'window ray must hit an actual facade');assert.ok(first.object.userData.role?.startsWith(p.key+'-photo-window')||first.object.userData.role===p.key+'-photo-diamond-lattice',JSON.stringify({x,y,first:first.object.name}));
   }
  }finally{fx.dispose();}
 });
}

check('final4 主敬殿: independent dark a075 first-period detail is not a complete inventory or copied main hall',()=>{
 const fx=fixture('主敬殿'),{f,g,p}=fx;try{
  assert.match(g.photoDetail.up,/20260911-dz\/panos\/a075.tiles\/u\//);assert.match(g.photoDetail.front,/a075.tiles\/f\//);assert.match(g.photoDetail.period,/FIRST_PERIOD/);assert.equal(g.photoDetail.photographyDate,null);
  assert.match(g.photoDetail.artwork,/UNMODELED/);assert.match(g.photoDetail.cofferGrid.status,/FITTED/);assert.equal(g.photoDetail.runtimeLightsAdded,0);
  const labels=nodes(f,'zhujing-modern-blank-hanging-label');assert.equal(labels.length,1);assert.match(labels[0].userData.text,/UNMODELED/);assert.match(labels[0].userData.count,/ONE_VISIBLE_TYPE_SAMPLE/);
  assert.equal(meshes(f).filter(m=>m.userData.remainingOuterId===p.id&&m.material.emissive?.getHex()>0).length,0);let lights=0;f.traverse(n=>{if(n.isLight)lights++});assert.equal(lights,0);
 }finally{fx.dispose();}
});
check('final4 主敬殿: coffer frame, beams, track suspension and blank label have actual solid connections and head clearance',()=>{
 const fx=fixture('主敬殿'),{f,item}=fx;try{
  const field=meshes(f).find(m=>m.geometry.type==='PlaneGeometry'&&isMat(fx,m,'caihua_beam')&&m.geometry.parameters.width===item.w&&m.geometry.parameters.height===item.d),frames=nodes(f,'zhujing-own-photo-coffer-frame'),beams=nodes(f,'zhujing-own-photo-ceiling-cross-beam');assert.ok(field);assert.equal(frames.length,29);assert.equal(beams.length,4);
  for(const n of frames)assert.ok(solidContact(n,field),'coffer must meet retained ceiling');
  const ring=meshes(f).filter(m=>isMat(fx,m,'caihua_beam')&&m!==field);for(const n of beams)assert.ok(ring.some(r=>solidContact(n,r)),'new cross beam must join old structural perimeter');
  const tracks=nodes(f,'zhujing-modern-suspended-track'),hangers=nodes(f,'zhujing-modern-track-hanger');assert.equal(tracks.length,2);assert.equal(hangers.length,6);
  for(const n of hangers){assert.ok(tracks.some(s=>solidContact(s,n)),'hanger to track');assert.ok(solidContact(n,field),'hanger to retained ceiling');}
  for(const n of tracks)assert.ok(hangers.some(s=>solidContact(n,s)));
  const label=nodes(f,'zhujing-modern-blank-hanging-label')[0],wire=nodes(f,'zhujing-modern-label-hanger')[0],ret=nodes(f,'zhujing-modern-label-track-return')[0];assert.ok(solidContact(label,wire));assert.ok(solidContact(ret,wire));assert.ok(tracks.some(t=>solidContact(t,ret)));
  for(const m of meshes(f).filter(m=>m.userData.remainingOuterId))assert.ok(new T.Box3().setFromObject(m).min.y>item.ph+PLAYER.HEIGHT,'all added suspended detail must clear full 1.7 m body');
 }finally{fx.dispose();}
});

check('final4 恒寿斋: own 2020 plain hard-gable and 2007 three-bay evidence, interior and visitor access remain withheld',()=>{
 const fx=fixture('恒寿斋'),{f,g,item,kit,p}=fx;try{
  assert.equal(item.bays,3);assert.equal(item.enter,false);assert.equal(p.navigation,null);assert.equal(kit.rooms.length,0);assert.match(g.interiorStatus,/EVIDENCE_BLOCKED_NO_REASSIGNMENT/);assert.match(g.sourceRoof.source,/u5facb56c07c8f.pdf$/);assert.equal(g.sourcePlan.publicationYear,2007);assert.match(g.sourcePlan.source,/T00008_00.pdf$/);assert.equal(g.sourcePlan.surveyDate,null);assert.match(g.sourceRoof.bracketDetail,/NOT_YET_MODELED/);assert.match(g.sourceRoof.tileColour,/UNVERIFIED/);
  const cols=meshes(f).filter(n=>n.geometry.type==='CylinderGeometry'&&isMat(fx,n,'wood_column'));assert.equal(cols.length,8,'three fitted bays use four retained posts on each long side, not the six sampled columns from the paper');
 }finally{fx.dispose();}
});
check('final4 恒寿斋: rendered roof ends are flush, FrontSide shell is closed above/below and old wall stops at post centre',()=>{
 const fx=fixture('恒寿斋'),{f,item}=fx;try{
  const roof=f.children.find(n=>n.userData.remainingRoof==='hengshou-plain-flush-gable');assert.ok(roof);const half=item.w/2+.35,roofMeshes=meshes(roof);
  for(const m of roofMeshes){assert.equal(m.material.side,T.FrontSide);for(const tri of tris(m,f.matrixWorld.clone().invert()))for(const v of [tri.a,tri.b,tri.c])assert.ok(Math.abs(v.x)<=half+1e-5,'gable must not project beyond actual wall end');}
  const sides=f.children.filter(n=>n.isMesh&&isMat(fx,n,'wall_red')&&Math.abs(Math.abs(n.position.x)-item.w/2)<1e-6);
  assert.equal(sides.length,2);for(const side of sides){side.geometry.computeBoundingBox();assert.ok(Math.abs(side.geometry.boundingBox.max.z-item.d/2)<1e-6);assert.ok(Math.abs(side.geometry.boundingBox.min.z+item.d/2)<1e-6);}
  for(const x of[-half+.02,-half/2,0,half/2,half-.02])for(const z of[-item.d*.48,0,item.d*.48])for(const sign of[-1,1]){
   const origin=f.localToWorld(new T.Vector3(x,sign>0?15:0,z)),hit=new T.Raycaster(origin,new T.Vector3(0,-sign,0),0,20).intersectObject(roof,true)[0];assert.ok(hit,`closed roof ray ${x}/${z}/${sign}`);assert.ok(hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y*sign>.01,'outward FrontSide normal');
  }
  for(const sign of[-1,1]){const origin=f.localToWorld(new T.Vector3(sign*(half+1),item.ph+item.colH+.6,0)),hit=new T.Raycaster(origin,new T.Vector3(-sign,0,0),0,2).intersectObject(roof,true)[0];assert.ok(hit,'real outward gable surface');assert.ok(Math.abs(f.worldToLocal(hit.point.clone()).x-sign*half)<1e-5);}
 }finally{fx.dispose();}
});
check('final4 恒寿斋: retained columns, ring beams and replacement roof have real bearing contact',()=>{
 const fx=fixture('恒寿斋'),{f,item}=fx;try{
  const cols=meshes(f).filter(m=>m.geometry.type==='CylinderGeometry'&&isMat(fx,m,'wood_column')),beams=f.children.filter(m=>m.isMesh&&isMat(fx,m,'caihua_beam')),roof=f.children.find(n=>n.userData.remainingRoof);
  for(const c of cols)assert.ok(beams.some(b=>solidContact(b,c)),'column must meet retained ring beam');
  for(const b of beams)assert.ok(meshes(roof).some(r=>solidContact(b,r)),'roof must meet actual supporting beam triangles');
  assert.ok(Math.abs(new T.Box3().setFromObject(cols[0]).max.y-(item.ph+item.colH))<1e-6);
 }finally{fx.dispose();}
});
check('final4 恒寿斋: instance cleanup removes exactly four zero-area index triples and preserves every valid vertex normal UV',()=>{
 const fx=fixture('恒寿斋'),{f,item,kit,g}=fx;try{
  const actual=meshes(f.children.find(n=>n.userData.remainingRoof)),referenceFrame=kit.frame(0,0,0),reference=meshes(kit.roof(referenceFrame,{type:'gable',width:item.w+.7,depth:item.d+.5,baseY:item.ph+item.colH,layers:1,brackets:false,hardGableEnd:true}));let removed=0;
  assert.equal(actual.length,reference.length);
  for(const original of reference){const current=actual.find(m=>m.material===original.material);assert.ok(current);assert.deepEqual(Object.keys(current.geometry.attributes),Object.keys(original.geometry.attributes));
   for(const[key,a]of Object.entries(original.geometry.attributes))assert.deepEqual(Array.from(current.geometry.attributes[key].array),Array.from(a.array),key+' changed while filtering invalid index triples');
   const a=original.geometry.attributes.position,ix=original.geometry.index,expected=[];
   for(let i=0;i<(ix?.count??a.count);i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),tri=new T.Triangle(...ids.map(id=>new T.Vector3().fromBufferAttribute(a,id)));if(tri.getArea()<=1e-10)removed++;else expected.push(...ids);}
   assert.deepEqual(Array.from(current.geometry.index?.array??Array.from({length:current.geometry.attributes.position.count},(_,i)=>i)),expected,'only invalid triangles may be removed');
  }
  assert.equal(removed,4);assert.equal(g.sourceRoof.removedDegenerateTriangles,4);
 }finally{fx.dispose();}
});

for(const name of ['主敬殿','本仁殿','集义殿'])check(`final4 ${name}: visible retained cylinders and opened leaves have component-sized collision coverage`,()=>{
 const fx=fixture(name),{f,kit,p}=fx;try{
  const targets=meshes(f).filter(m=>m.geometry.type==='CylinderGeometry'&&isMat(fx,m,'wood_column')||isMat(fx,m,'lattice_doors')&&Math.abs(Math.sin(m.rotation.y))>.99||m.userData.role===p.key+'-photo-central-door-door-leaf');assert.ok(targets.length>=16);
  for(const m of targets){const bb=new T.Box3().setFromObject(m);assert.ok(kit.colliders.some(c=>c.clone().expandByScalar(1e-6).containsBox(bb)),JSON.stringify({mesh:m.name,position:m.position.toArray(),bounds:{min:bb.min.toArray(),max:bb.max.toArray()}}));}
 }finally{fx.dispose();}
});

// Keep every other zone, static collision and river. Only the affected east
// zone is rebuilt through the explicit worker dispatch with the REAL library.
const W=await buildWorld(),data=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url))),zoneLib=realLibrary();
class Preview extends ZoneBase{
 constructor(){super(zoneLib,data);this.halls=new Map();this.kit.finish=()=>{this.kit.root.updateMatrixWorld(true);return this.kit.root;};}
 buildHall(item){const p=api.resolveRemainingProfile(data.id,item),base=p?.mode==='replace'?api.buildRemainingHall(this.kit,item,p):super.buildHall(item),out=p?.mode==='augment'&&base.f.userData.remainingOuter?.id!==p.id?api.augmentRemainingHall(this.kit,item,base,p):base;this.halls.set(item.name,out);return out;}
}
const zone=new Preview(),build=zone.build();W.cm.removeByTag(data.id);W.cm.addColliders(build.colliders,data.id);W.cm.addWalkables(build.walkables,data.id);
const renderRows=meshes(zone.kit.root).map(m=>({m,box:new T.Box3().setFromObject(m),triangles:tris(m)}));
// Role attribution is tied to exact retained generated dimensions and shared
// material identity, never to arbitrary low height or an object's string name.
const terrainRoles=new Map();
for(const name of ['文华殿','主敬殿','本仁殿','集义殿']){
 const item=data.items.find(i=>i.name===name),hall=zone.halls.get(name),ph=item.ph,pad=item.pad??1,PW=item.w+2*pad,PD=item.d+2*pad;
 for(const m of hall.f.children.filter(n=>n.isMesh)){
  m.geometry.computeBoundingBox();const b=m.geometry.boundingBox,size=b.getSize(new T.Vector3()),near=(a,v)=>Math.abs(a-v)<2e-5,center=m.position;
  let kind=null;
  if(center.x===0&&center.z===0&&near(center.y,ph/2)&&near(size.x,PW)&&near(size.y,ph)&&near(size.z,PD)&&m.material===zoneLib.material(ph>=.8?'sumeru_band':'wall_brick'))kind='RETAINED_PLATFORM_BODY';
  if(center.x===0&&center.z===0&&near(center.y,ph-.03)&&near(size.x,PW+.12)&&near(size.y,.08)&&near(size.z,PD+.12)&&m.material===zoneLib.material('stone_slab'))kind='RETAINED_PROJECTING_STONE_CAP';
  if(name==='文华殿'&&m.material===zoneLib.material('marble')&&center.x===0&&center.z<-PD/2&&center.y>0&&center.y+size.y/2<=ph+1e-5)kind='RETAINED_WENHUA_SOUTH_STEP';
  const bay=item.w/item.bays,r=T.MathUtils.clamp(bay*.07,.2,.34);
  if(m.material===zoneLib.material('wood_column')&&center.x===0&&near(Math.abs(center.z),item.d/2)&&near(center.y,ph+.11)&&near(size.x,bay-2*r)&&near(size.y,.22)&&near(size.z,.3))kind='RETAINED_CENTRAL_THRESHOLD';
  if(kind)terrainRoles.set(m,{building:name,kind,localCenter:center.toArray(),size:size.toArray(),geometryHash:hash(Array.from(m.geometry.attributes.position.array)),fullTop:new T.Box3().setFromObject(m).max.y});
 }
}
for(const name of ['本仁殿','集义殿'])assert.equal([...terrainRoles.values()].filter(v=>v.building===name).filter(v=>v.kind!=='RETAINED_CENTRAL_THRESHOLD').length,2,'only exact old platform and cap are platform-terrain candidates');

function instrumentAcceptedSubsteps(cm,trace){
 const originalMove=cm.getValidPosition,originalCheck=cm.checkCollision,accepted=[];let active=0;
 cm.getValidPosition=function(...args){active++;try{return originalMove.apply(this,args);}finally{active--;}};
 cm.checkCollision=function(position,...args){const blocked=originalCheck.call(this,position,...args);if(active&&!blocked){const g=trace.samples.at(-1);accepted.push({x:position.x,z:position.z,physicsFeet:position.y-PLAYER.HEIGHT,groundSample:g?{feetIn:g.feetIn,height:g.height,source:g.source,supportIndex:g.supportIndex}:null});}return blocked;};
 return{accepted,restore(){cm.getValidPosition=originalMove;cm.checkCollision=originalCheck;}};
}
// Explicit historical diagnostic: replay the captured old contract even after owner fixes the current consumer.
const legacySnapshot=JSON.parse(readFileSync(new URL('outer-final-navigation-delta.json',dir)));
const originalAutoContract=legacySnapshot.baselineAutoContract;
assert.ok(originalAutoContract?.pts?.length,'actual shared auto-route contract must exist');
const originalAutoContractSHA256=legacySnapshot.baselineAutoContract.sha256;
function entryRoute(name,offset=0,variant="review-fit"){if(variant==='legacy-auto-contract')return originalAutoContract.pts.slice(0,(originalAutoContract.pts.length+1)/2);const {f}=zone.halls.get(name),item=data.items.find(i=>i.name===name);if(name==='主敬殿'){
 // Clear Wenhua's retained folded tip before turning. The -6.3 m inherited
 // waypoint crossed the tip; -6 m is an actual body-clear approach, not a fix.
 const front=data.items.find(i=>i.southCourtProfile==='wenhua-front'),x=front.x+offset;
 if(variant==='legacy-r36-integration'){
  const gate=data.items.find(i=>i.name==='文华门'),link=data.items.find(i=>i.southCourtProfile==='wenhua-connector');
  return[[gate.x,gate.z-14],[gate.x,gate.z+14],[x,gate.z+14],[x,front.z-front.d/2-front.pad-front.ph*1.6-1],[x,front.z-6.3],[x+11,front.z-6.3],[x+11,front.z+5.7],[x,front.z+5.7],[link.x,link.z],[x,item.z-5],[x+2.3,item.z-5],[x+2.3,item.z-.5],[x,item.z-.5]];
 }
 const old=variant==='legacy-r36-courts';
 return[[x,front.z-front.d/2-4],[x,front.z-(old?6.3:6)],[x+11,front.z-(old?6.3:6)],[x+11,front.z+5.7],[x,front.z+5.7],[x,item.z-(old?5:5.6)],[x+2.3,item.z-(old?5:4.8)],[x+2.3,item.z-.5],[x,item.z-.5]];
 }
 return[-item.d/2-2.5,-item.d/2-1.05,-item.d/2-.1,-item.d/2+1.5].map(z=>{const p=f.localToWorld(new T.Vector3(offset,0,z));return[p.x,p.z];});
}
const bbLeafBottom=leaf=>new T.Box3().setFromObject(leaf).min.y;
check('final4 主敬殿: outward leaf envelope does not penetrate I-passage cases, beams, columns or old circular display',()=>{
 const hall=zone.halls.get('主敬殿'),leaves=meshes(hall.f).filter(m=>m.userData.r48OpenPoseFit);assert.equal(leaves.length,2);
 for(const leaf of leaves){
  leaf.geometry.computeBoundingBox();const interior=leaf.geometry.boundingBox.clone().expandByScalar(-2e-5),inverse=leaf.matrixWorld.clone().invert();
  for(const q of renderRows){if(q.m===leaf||!q.box.intersectsBox(new T.Box3().setFromObject(leaf)))continue;
   const isBearingTop=q.box.max.y<=1.225&&(q.m.material===zoneLib.material('stone_slab')||q.m.material===zone.kit.floorMat);
   if(isBearingTop){assert.ok(q.box.max.y-bbLeafBottom(leaf)<=.025,'retained floor overlay at leaf bearing stays within existing datum');continue;}assert.equal(tris(q.m,inverse).some(t=>interior.intersectsTriangle(t)),false,JSON.stringify({leaf:leaf.position.toArray(),other:q.m.name,role:q.m.userData.role,otherPosition:q.m.position.toArray()}));}
  const bb=new T.Box3().setFromObject(leaf);assert.ok(bb.max.z<=-173+.001,'entire front leaf opens outside the front face');
  // Both ends bear on the retained connector/main-platform top, rather than
  // being placed beyond the existing floor into unsupported exterior space.
  for(const z of[bb.min.z+.02,bb.max.z-.02]){
   const hit=new T.Raycaster(new T.Vector3((bb.min.x+bb.max.x)/2,1.265,z),new T.Vector3(0,-1,0),0,.1).intersectObjects(renderRows.filter(q=>q.m!==leaf).map(q=>q.m),false)[0];assert.ok(hit&&Math.abs(hit.point.y-1.2)<.025,'outward leaf has real same-height platform support');
  }
 }
});
const routeCases=[];
for(const name of ['主敬殿','本仁殿','集义殿'])for(const offset of(name==='主敬殿'?[-.08,0,.08]:[0]))routeCases.push({name,offset,variant:'review-fit'});
for(const variant of['legacy-r36-courts','legacy-r36-integration','legacy-auto-contract'])routeCases.push({name:'主敬殿',offset:0,variant});
for(const {name,offset,variant}of routeCases)for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])check(`${variant==='review-fit'?'final4':'legacy-consumer'} ${name}: ${variant} real entry, terrain-step attribution and non-terrain body clearance ${fps}/${sprint}/${backward}/${offset}`,t=>{
 const leg=entryRoute(name,offset,variant),trace=traceTerraceGround(W.cm,{flights:[]}),substeps=instrumentAcceptedSubsteps(W.cm,trace);let r;try{r=replayTerrace(t,W,[...leg,...leg.slice(0,-1).reverse()],{fps,sprint,backward,recordFrames:true});}finally{substeps.restore();trace.restore();}
 const strictContacts=[],violations=[],knownTerrainContacts=[],inheritedContacts=[],renderSupport=[],inheritedSupport=[],acceptedSupportErrors=[];
 const record={name,variant,source:variant==='legacy-auto-contract'?{file:'tests/lib/auto-routes.mjs',sha256:originalAutoContractSHA256,name:originalAutoContract.name}:null,waypoints:leg,fps,sprint,backward,offset,arrived:r.arrived,stuckAt:r.stuckAt??null,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end,frameCount:r.frames.length,unsafeGroundSamples:trace.samples.filter(s=>s.source==='rescue'||s.source==='unverified').length};(variant==='review-fit'?routes:legacyRoutes).push(record);
 for(const fr of r.frames){const body=new T.Box3(new T.Vector3(fr.x-.499,fr.feet+.351,fr.z-.499),new T.Vector3(fr.x+.499,fr.feet+PLAYER.HEIGHT-1e-6,fr.z+.499));
  // Every intersecting triangle remains recorded before role attribution.
  // The 0.6 m step allowance is not a blanket exemption for low objects.
  for(const q of renderRows){if(!q.box.intersectsBox(body))continue;const triangles=q.triangles.filter(tr=>body.intersectsTriangle(tr));if(!triangles.length)continue;
   const physicsBody=new T.Box3(new T.Vector3(fr.x-.499,fr.ground+.351,fr.z-.499),new T.Vector3(fr.x+.499,fr.ground+PLAYER.HEIGHT-1e-6,fr.z+.499)),terrain=terrainRoles.get(q.m),maxY=Math.max(...triangles.flatMap(t=>[t.a.y,t.b.y,t.c.y])),contact={frame:fr,mesh:q.m.name,role:q.m.userData.role??null,material:q.m.material?.name,local:q.m.position.toArray(),terrain:terrain??null,parts:[...new Set(triangles.map(tr=>Math.abs(tr.getNormal(new T.Vector3()).y)>.99?'HORIZONTAL_TOP_OR_BOTTOM':'SIDE_FACE'))],maxTriangleY:maxY,riseAbovePhysicsGround:maxY-fr.ground,riseAboveSmoothedFeet:maxY-fr.feet,triangle:[triangles[0].a.toArray(),triangles[0].b.toArray(),triangles[0].c.toArray()],physicsBodyAlsoIntersects:triangles.some(t=>physicsBody.intersectsTriangle(t)),smoothedFootLag:fr.ground-fr.feet,productionCollision:W.cm.checkCollision(new T.Vector3(fr.x,fr.feet+PLAYER.HEIGHT,fr.z))};strictContacts.push(contact);
   if(terrain?.building==='文华殿'){contact.classification='BASELINE_INHERITED_WENHUA_TERRAIN_CONTACT';inheritedContacts.push(contact);}
   else if(terrain&&maxY-fr.ground<=PLAYER.STEP_UP+1e-6){contact.classification=terrain.kind==='RETAINED_CENTRAL_THRESHOLD'&&!contact.physicsBodyAlsoIntersects?'SMOOTHED_CAMERA_ONLY_RETAINED_THRESHOLD_CONTACT':'EXACT_RETAINED_LOW_TERRAIN__REQUIRES_SUCCESSFUL_STEP_AND_VISIBLE_SUPPORT';knownTerrainContacts.push(contact);}
   else{contact.classification='UNEXEMPTED_BODY_INTERSECTION';violations.push(contact);}
  }
  if(Math.abs(fr.ground-(name==='主敬殿'?1.2:.5))<1e-6){const hit=new T.Raycaster(new T.Vector3(fr.x,fr.ground+.065,fr.z),new T.Vector3(0,-1,0),0,.4).intersectObject(zone.kit.root,true)[0];if(!hit||Math.abs(hit.point.y-fr.ground)>.025){
   const front=data.items.find(i=>i.southCourtProfile==='wenhua-front'),edge=front.z-front.d/2-front.pad;
   const inherited=name==='主敬殿'&&Math.abs(fr.x-front.x)<2.3&&fr.z<edge-.06&&fr.z>edge-front.ph*1.6&&hit&&terrainRoles.get(hit.object)?.kind==='RETAINED_WENHUA_SOUTH_STEP';
   (inherited?inheritedSupport:renderSupport).push({frame:fr,hit:hit?.object.name??null,visibleTop:hit?.point.y??null,selectedGround:fr.ground,classification:inherited?'BASELINE_INHERITED_WENHUA_COLLIDER_FOOTPRINT_SUPPORT_OVER_DISCRETE_STEPS':'UNEXEMPTED_MISSING_VISIBLE_SUPPORT'});
  }}
 }
 const item=data.items.find(i=>i.name===name),hall=zone.halls.get(name),inHall=s=>{const q=hall.f.worldToLocal(new T.Vector3(s.x,0,s.z));return Math.abs(q.x)<=item.w/2+(item.pad??1)&&Math.abs(q.z)<=item.d/2+(item.pad??1);};
 const hallSubsteps=substeps.accepted.filter(s=>inHall(s)),rises=hallSubsteps.map(s=>s.groundSample?s.groundSample.height-s.groundSample.feetIn:0),landed=hallSubsteps.filter(s=>Math.abs(s.physicsFeet-item.ph)<1e-6),visibleDeviations=[];
 for(const s of landed){const hit=new T.Raycaster(new T.Vector3(s.x,item.ph+.065,s.z),new T.Vector3(0,-1,0),0,.09).intersectObject(zone.kit.root,true)[0],deviation=hit?Math.abs(hit.point.y-item.ph):null;if(deviation!==null)visibleDeviations.push(deviation);if(deviation===null||deviation>.025)acceptedSupportErrors.push({...s,visibleTop:hit?.point.y??null});}
 const rising=hallSubsteps.filter(s=>s.groundSample&&s.groundSample.height-s.groundSample.feetIn>1e-6).slice(0,3).map(s=>{const hit=new T.Raycaster(new T.Vector3(s.x,s.physicsFeet+.065,s.z),new T.Vector3(0,-1,0),0,.09).intersectObject(zone.kit.root,true)[0];return{...s,visibleTop:hit?.point.y??null,visibleMinusPhysics:hit?hit.point.y-s.physicsFeet:null};});
 record.acceptedSubsteps={count:substeps.accepted.length,insideHall:hallSubsteps.length,landedCount:landed.length,maximumActualRise:Math.max(0,...rises),maximumVisibleTopDeviation:Math.max(0,...visibleDeviations),sampleRising:rising,supportErrors:acceptedSupportErrors.slice(0,3)};
 const attribution=new Map();for(const c of strictContacts){const key=[c.terrain?.building,c.terrain?.kind,c.classification].join('/');let row=attribution.get(key);if(!row){row={key,count:0,parts:[],maxRiseAbovePhysicsGround:0,maxRiseAboveSmoothedFeet:0,maximumSmoothedFootLag:0,physicsBodyAlsoIntersects:0,sample:c};attribution.set(key,row);}row.count++;row.parts=[...new Set([...row.parts,...c.parts])];row.maxRiseAbovePhysicsGround=Math.max(row.maxRiseAbovePhysicsGround,c.riseAbovePhysicsGround);row.maxRiseAboveSmoothedFeet=Math.max(row.maxRiseAboveSmoothedFeet,c.riseAboveSmoothedFeet);row.maximumSmoothedFootLag=Math.max(row.maximumSmoothedFootLag,c.smoothedFootLag);if(c.physicsBodyAlsoIntersects)row.physicsBodyAlsoIntersects++;}record.contactAttribution=[...attribution.values()];
 const compact=xs=>xs.slice(0,4);Object.assign(record,{strictBodyContactCount:strictContacts.length,strictBodyContacts:compact(strictContacts),knownLowTerrainContactCount:knownTerrainContacts.length,knownLowTerrainContacts:compact(knownTerrainContacts),inheritedWenhuaContactCount:inheritedContacts.length,inheritedWenhuaContacts:compact(inheritedContacts),inheritedWenhuaSupportCount:inheritedSupport.length,inheritedWenhuaSupport:compact(inheritedSupport),violationCount:violations.length,violations:compact(violations),unsupportedCount:renderSupport.length,renderSupport:compact(renderSupport),actualContactsExceedingStepUp:strictContacts.filter(c=>c.terrain?.building===name&&c.riseAbovePhysicsGround>PLAYER.STEP_UP+1e-6).length});
 record.bodyClearanceVerdict=record.violationCount===0&&record.unsupportedCount===0&&record.actualContactsExceedingStepUp===0?'PASS':'FAIL';record.consumerReady=r.arrived&&record.bodyClearanceVerdict==='PASS'&&record.unsafeGroundSamples===0&&acceptedSupportErrors.length===0;
 assert.equal(r.arrived,true,JSON.stringify({stuck:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.equal(record.unsafeGroundSamples,0,'no rescue or forged support');assert.ok(r.maxFeet>=(name==='主敬殿'?1.19:.49));assert.ok(r.end[2]<.03);
 assert.ok(record.acceptedSubsteps.landedCount>0);assert.ok(record.acceptedSubsteps.maximumActualRise<=PLAYER.STEP_UP+1e-6,'actual accepted terrain step exceeds configured allowance');assert.equal(acceptedSupportErrors.length,0,JSON.stringify(record.acceptedSubsteps));assert.equal(record.actualContactsExceedingStepUp,0,'actual known local terrain contact exceeds step-up');
 assert.equal(record.violationCount,0,JSON.stringify(record));assert.equal(record.unsupportedCount,0,JSON.stringify(record));
});


check('paired 主敬殿: two new proxies equal real retained rim/light bounds and do not turn conservative corners into room blocks',()=>{
 const fx=fixture('主敬殿'),{f,kit,g}=fx;try{
  assert.equal(g.circularDisplayProxies.count,2);assert.equal(g.circularDisplayProxies.geometry,'RETAINED_UNMODIFIED');
  const display=f.children.find(n=>n.userData.role==='wenhua-rear-circular-display'),rim=display.children.find(n=>n.geometry?.type==='TorusGeometry'),light=f.children.find(n=>n.userData.role==='wenhua-rear-display-light');
  for(const [kind,m]of[['rim',rim],['light',light]]){
   const b=new T.Box3().setFromObject(m),meta=m.userData.actualComponentProxy;assert.ok(meta);assert.equal(meta.lowerHeadMargin,0);
   const local=new T.Box3(new T.Vector3(...meta.bounds.min),new T.Vector3(...meta.bounds.max)).applyMatrix4(f.matrixWorld);
   assert.ok(local.min.distanceTo(b.min)<1e-6&&local.max.distanceTo(b.max)<1e-6,'metadata must match actual transformed vertices');
   const exact=kit.colliders.filter(c=>c.min.distanceTo(b.min)<1e-6&&c.max.distanceTo(b.max)<1e-6);assert.equal(exact.length,1,'one exact component proxy, not a group proxy');
   assert.ok(b.max.z-b.min.z<=.091,'thin component must not occupy the room depth');proxyBounds.push({kind,min:b.min.toArray(),max:b.max.toArray(),metadata:meta});
  }
  // The torus AABB conservatively covers empty corners. Prove that limitation
  // explicitly, then keep both 1m-body side corridors outside the full box.
  const b=new T.Box3().setFromObject(rim),corner=new T.Box3(new T.Vector3(b.max.x-.09,b.max.y-.09,b.min.z),new T.Vector3(b.max.x-.01,b.max.y-.01,b.max.z));
  assert.equal(tris(rim).some(tr=>corner.intersectsTriangle(tr)),false,'corner witness must contain no visible torus triangle');
  for(const sign of[-1,1])for(const z of[-171.8,-171.35,-171,-170.5,-169,-167.5]){
   const point=new T.Vector3(f.position.x+sign*2.3,1.2+PLAYER.HEIGHT,z);assert.equal(W.cm.checkCollision(point),false,'actual full-body side passage must remain open outside the conservative corner');
  }
 }finally{fx.dispose();}
});
function freeDisplayRun(t,{fps,sprint,backward,path}){
 const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};globalThis.document={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new T.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:globalThis.document,addEventListener:noop,removeEventListener:noop},W.cm),frames=[];
 let currentStage='',activeMove=0;const blockedPressSubsteps=[],oldMove=W.cm.getValidPosition,oldCheck=W.cm.checkCollision;
 W.cm.getValidPosition=function(...args){activeMove++;try{return oldMove.apply(this,args);}finally{activeMove--;}};
 W.cm.checkCollision=function(position,...args){const blocked=oldCheck.call(this,position,...args);if(blocked&&activeMove&&currentStage==='free-forward-press')blockedPressSubsteps.push({x:position.x,y:position.y,z:position.z});return blocked;};
 controls.controls.isLocked=true;const approach=entryRoute('主敬殿').slice(0,6),x=approach[0][0];controls.setPosition(x,PLAYER.HEIGHT,approach[0][1]);
 const physical=()=>[camera.position.x-controls.bobOffset.x,camera.position.z-controls.bobOffset.z];
 const step=(target,stage,run=sprint)=>{
  currentStage=stage;controls.moveForward=!backward;controls.moveBackward=backward;controls.canSprint=run;now+=1000/fps;
  camera.position.sub(controls.bobOffset);camera.lookAt(backward?2*camera.position.x-target[0]:target[0],camera.position.y,backward?2*camera.position.z-target[1]:target[1]);camera.position.add(controls.bobOffset);camera.updateMatrixWorld(true);controls.update();
  const p=physical();frames.push({time:now/1000,x:p[0],z:p[1],feet:controls.feetY,ground:controls.groundY,stage,speed:controls.motion.speed});return p;
 };
 const drive=(points,stage)=>{
  const driver=createPhysicalWaypointDriver(points);let count=0,lastIndex=driver.index;
  while(!driver.complete){const before=physical(),cmd=driver.command(before,sprint),after=step(cmd.target,stage,cmd.canSprint);driver.observe(before,after);if(lastIndex!==driver.index){lastIndex=driver.index;count=0;}if(++count>fps*35)return{arrived:false,stage,point:points[driver.index],position:after};}
  return{arrived:true,stage};
 };
 try{
  const entered=drive(approach,'real-ground-entry');if(!entered.arrived)return{frames,...entered};let pressed=null;
  if(path==='press-and-retreat'){
   // A sustained real input deliberately presses against the rendered ring;
   // unlike waypoint success it proves that arbitrary free movement is stopped.
   for(let i=0;i<fps*2;i++)step([x,-169],'free-forward-press',sprint);
   const p=physical(),last=frames.filter(q=>q.stage==='free-forward-press').slice(-Math.max(2,fps/2));pressed={end:p,tailMotion:Math.hypot(last.at(-1).x-last[0].x,last.at(-1).z-last[0].z),minZ:Math.min(...last.map(q=>q.z)),maxZ:Math.max(...last.map(q=>q.z))};
   const rejected=blockedPressSubsteps.slice(-fps*4).filter(q=>q.z>p[1]+1e-6);pressed.blockedSubstepCount=blockedPressSubsteps.length;pressed.nearestRejected=rejected.sort((a,b)=>a.z-b.z)[0]??null;pressed.nearestRejectedAdvance=pressed.nearestRejected?pressed.nearestRejected.z-p[1]:null;
   const retreat=drive([p,[x,-172.6]],'free-retreat');if(!retreat.arrived)return{frames,pressed,...retreat};
  }else{
   const sign=path==='left-loop'?-1:1,turns=[physical(),[x+sign*2.3,-171.8],[x+sign*2.3,-167.5],[x,-167.5]],loop=drive([...turns,...turns.slice(0,-1).reverse()],'free-side-loop');if(!loop.arrived)return{frames,...loop};
  }
  const returned=drive([physical(),...approach.slice(0,-1).reverse()],'return-to-real-ground');
  controls.moveForward=false;controls.moveBackward=false;for(let i=0;i<fps*2;i++){now+=1000/fps;controls.update();}
  return{frames,pressed,...returned,end:[...physical(),controls.feetY]};
 }finally{W.cm.getValidPosition=oldMove;W.cm.checkCollision=oldCheck;controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
}
for(const path of['press-and-retreat','left-loop','right-loop'])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])check(`paired 主敬殿: arbitrary ${path} real-body clearance ${fps}/${sprint}/${backward}`,t=>{
 const trace=traceTerraceGround(W.cm,{flights:[]});let r;try{r=freeDisplayRun(t,{fps,sprint,backward,path});}finally{trace.restore();}
 const violations=[],inherited=[],supportErrors=[];
 for(const fr of r.frames){
  // The I-passage and complete rear room use actual world triangles. Wenhua
  // approach contacts remain in the unchanged 69-check suite, not silently
  // relabelled as a new proxy defect or counted as this room's clear result.
  if(fr.z< -191.3)continue;
  const body=new T.Box3(new T.Vector3(fr.x-.499,fr.feet+.351,fr.z-.499),new T.Vector3(fr.x+.499,fr.feet+PLAYER.HEIGHT-1e-6,fr.z+.499));
  for(const q of renderRows){if(!q.box.intersectsBox(body))continue;const tri=q.triangles.find(t=>body.intersectsTriangle(t));if(tri){const terrain=terrainRoles.get(q.m),row={frame:fr,role:q.m.userData.role??null,material:q.m.material.name,local:q.m.position.toArray(),triangle:[tri.a.toArray(),tri.b.toArray(),tri.c.toArray()]};(terrain?.building==='文华殿'?inherited:violations).push(row);}}
  const hit=new T.Raycaster(new T.Vector3(fr.x,fr.ground+.065,fr.z),new T.Vector3(0,-1,0),0,.09).intersectObject(zone.kit.root,true)[0];if(!hit||Math.abs(hit.point.y-fr.ground)>.025)supportErrors.push({frame:fr,visibleTop:hit?.point.y??null});
 }
 const record={path,fps,sprint,backward,arrived:r.arrived,stuckAt:r.point??null,end:r.end,pressed:r.pressed,frames:r.frames.length,actualBodyFrames:r.frames.filter(q=>q.z>=-191.3).length,violations:violations.slice(0,6),violationCount:violations.length,inheritedContactCount:inherited.length,supportErrors:supportErrors.slice(0,4),supportErrorCount:supportErrors.length,unsafeGround:trace.samples.filter(s=>s.source==='rescue'||s.source==='unverified').length};freeProbes.push(record);
 assert.equal(r.arrived,true,JSON.stringify(record));assert.equal(record.unsafeGround,0);assert.ok(r.end[2]<.03,'return to real ground after continuous run');assert.equal(violations.length,0,JSON.stringify(record));assert.equal(supportErrors.length,0,JSON.stringify(record));
 if(path==='press-and-retreat'){const rim=proxyBounds.find(q=>q.kind==='rim');assert.ok(rim);assert.ok(r.pressed.tailMotion<.015,'sustained pressing stops instead of tunnelling');assert.ok(r.pressed.end[1]+.499<=rim.min[2]+1e-5,'actual 1m-body stops before visible rim tip');const edge=rim.min[2]-.5,clearance=edge-r.pressed.end[1],q=new T.Vector3(r.pressed.end[0],1.2+PLAYER.HEIGHT,edge-.001);
  record.pressed.actualProxyBoundary=edge;record.pressed.discreteSubstepRemainder=clearance;assert.equal(W.cm.checkCollision(q),false,'space immediately before actual thin proxy remains free');q.z=edge+.001;assert.equal(W.cm.checkCollision(q),true,'space immediately beyond actual thin proxy is blocked');
  assert.ok(r.pressed.nearestRejected&&r.pressed.nearestRejectedAdvance>0,'real checkCollision rejected an actual forward substep');assert.ok(clearance>=-1e-6&&clearance<=r.pressed.nearestRejectedAdvance+1e-6,'stand-off must be explained by the measured rejected substep, not an invisible extra proxy margin');}
});

check('final4 changes preserve all post-entry first21 geometry, collisions, rooms and navigation hashes',()=>{
 const baseline=JSON.parse(readFileSync(new URL('outer-first21-post-entry-signatures.json',dir)));assert.equal(baseline.records.length,21);for(const row of baseline.records)assert.deepEqual(first21Signature(rows.find(r=>r.id===row.id)),row.signature,row.name);
});

test.after(()=>{
 zone.dispose();zoneLib.dispose();
 const contactSummary=['主敬殿','本仁殿','集义殿'].map(name=>{const a=routes.filter(q=>q.name===name);return{name,routes:a.length,arrived:a.filter(q=>q.arrived).length,strictBodyContacts:a.reduce((s,q)=>s+q.strictBodyContactCount,0),attributedLowTerrain:a.reduce((s,q)=>s+q.knownLowTerrainContactCount,0),inheritedWenhuaContacts:a.reduce((s,q)=>s+q.inheritedWenhuaContactCount,0),inheritedWenhuaSupportSamples:a.reduce((s,q)=>s+q.inheritedWenhuaSupportCount,0),unexemptedIntersections:a.reduce((s,q)=>s+q.violationCount,0),maxAcceptedHallStep:Math.max(0,...a.map(q=>q.acceptedSubsteps.maximumActualRise)),maxVisibleSupportDifference:Math.max(0,...a.map(q=>q.acceptedSubsteps.maximumVisibleTopDeviation))};});
 const failed=results.filter(r=>r.status==='FAIL'),localFailures=failed.filter(r=>!r.name.startsWith('legacy-consumer ')),legacyFailures=failed.filter(r=>r.name.startsWith('legacy-consumer ')),legacyRouteSummary=['legacy-r36-courts','legacy-r36-integration','legacy-auto-contract'].map(variant=>{const a=legacyRoutes.filter(q=>q.variant===variant);return{variant,routes:a.length,arrived:a.filter(q=>q.arrived).length,bodyClearancePass:a.filter(q=>q.bodyClearanceVerdict==='PASS').length,consumerReady:a.filter(q=>q.consumerReady).length,unexemptedIntersections:a.reduce((sum,q)=>sum+q.violationCount,0),failingModes:a.filter(q=>!q.consumerReady).map(q=>({fps:q.fps,sprint:q.sprint,backward:q.backward,arrived:q.arrived,violationCount:q.violationCount,stuckAt:q.stuckAt}))};}),priorRuns=[...(previous.priorRuns??[]),...(previous.summary?[{moduleSHA256:previous.moduleSHA256,generatedAt:previous.generatedAt,summary:previous.summary,failures:previous.results.filter(r=>r.status==='FAIL'),routes:previous.routes,legacyRoutes:previous.legacyRoutes??[]}]:[])],report={review:'R48 paired Zhujing component-proxy independent review',frozenB7:{module:'b7d318a374e8249b272ddada2dcf5feb6ce9b59772f1dc1c9ab2e7d34e6e4be4',test:'214de14b0e6ee39935b09383ff72fe8b9e8d10bb6bae100c4401d7791d320ab8',report:'bec1264139defbab15110b80cc79eca085b1ccbb430cbacba5d5cde246b8cf6e'},proxyBounds,freeProbes,status:results.length!==scheduled.length?'INCOMPLETE_TEST_SELECTION':localFailures.length?'FAIL':legacyFailures.length?'LOCAL_GEOMETRY_PASS_LEGACY_ROUTE_FAIL':'PASS_WITH_EVIDENCE_LIMITS',moduleSHA256,generatedAt:new Date().toISOString(),initialRedEvidence:previous.initialRedEvidence??null,priorRuns,scope:{identities:names,wholeBuildingComplete:false,interiorsBlocked:['本仁殿','集义殿','恒寿斋'],zhujing:'Only dark a075 first-period ceiling structure, modern track and one blank label type; existing dedicated display retained',hengshou:'No visitor destination or current storage claim'},method:{materials:'Real TextureLibrary with real ownership/cache naming and inert image handles; parity against stub geometry, collisions and metadata',movement:'Production FirstPersonControls and CollisionManager, all world collisions/rivers retained; east zone replaced once through real-library worker dispatch; DOM and clock only stubbed',body:'Every actual world-space rendered triangle contact retained against smoothed-feet full-height body. Only exact original platform/cap/central-threshold identities with actual contact rise <= STEP_UP are attributed as low-terrain contacts, conditional on accepted production substeps, visible same-height support and completed round trip. Unchanged Wenhua terrain is reported independently as baseline inherited; no arbitrary low-object exemption.',geometry:'Actual mesh vertices, FrontSide raycasts and triangle-vs-solid contact; not metadata-only or mock movement'},productionConsumerVerified:false,consumerBoundary:'Direct shared tests/lib/auto-routes.mjs contract and two older R36 route consumers are replayed unchanged. Production controls/collisions are real, but the affected east zone is worker preview dispatch; owner production wiring is not verified. New review-fit waypoint success does not prove existing contract acceptance.',originalAutoContract:{file:'tests/lib/auto-routes.mjs',sha256:originalAutoContractSHA256,name:originalAutoContract.name,pts:originalAutoContract.pts},routeCorrections:{sources:['tests/lib/auto-routes.mjs','tests/r36-south-courts.test.mjs','tests/r36-south-independent-hall-integration.test.mjs'],wenhua:{old:[[-186.4,-205.3],[-175.4,-205.3]],next:[[-186.4,-205],[-175.4,-205]],reason:'Baseline unchanged Wenhua folded-leaf tip intersects original body route; unrelated to the new final-four proxies'},zhujing:{old:[[-186.4,-172],[-184.1,-172]],next:[[-186.4,-172.6],[-184.1,-171.8]],reason:'New thin retained-leaf proxies exposed impossible old inward pose, requiring explicit outward model-access fit. After pose repair, diagonal waypoints clear retained column and actual circular ring; old lateral turn can still scrape real ring at 10 Hz despite arrival.'}},summary:{scheduled:scheduled.length,total:results.length,passed:results.length-failed.length,failed:failed.length,modes:routes.length,localTests:results.filter(r=>!r.name.startsWith('legacy-consumer ')).length,localFailed:localFailures.length,legacyTests:results.filter(r=>r.name.startsWith('legacy-consumer ')).length,legacyFailed:legacyFailures.length,legacyModes:legacyRoutes.length},contactSummary,legacyRouteSummary,results,routes,legacyRoutes};
 if(process.env.R48_WRITE_OUTER_LEGACY_DIAGNOSTIC==='1')writeFileSync(reportURL,JSON.stringify(report,null,2)+'\n');
 const lines=['# R48 主敬薄代理追加独立审查','',`状态：${report.status}。${report.summary.passed}/${report.summary.total} 项通过；${routes.length} 条新测试路径模式及 ${legacyRoutes.length} 条旧消费者路径诊断模式已执行。`,`被审模块 SHA-256：${moduleSHA256}`,'','## 两薄代理自由输入复核',`- 自由逼近后退、左右绕圆展体共 ${freeProbes.length} 模式；到达 ${freeProbes.filter(q=>q.arrived).length}，未豁免实际身体相交 ${freeProbes.reduce((n,q)=>n+q.violationCount,0)}。`,`- 两组件真实顶点包络、保守空角与两侧完整通路均单独检查；未把包围盒声称成可见实心几何。`,'- 首轮测试额外假设停住后距表面小于6cm，已证实是测试假设错误：原控制器按完整子步接受/拒绝，可能留7.8–10.7cm余量。当前直接记录真实被拒子步，并验证包络边界前1mm可站、后1mm受阻；没有改代理或放宽身体安全门槛。原失败保留在 priorRuns。','','## 范围与边界','- 仅主敬殿、本仁殿、集义殿、恒寿斋的本次局部变化，不代表整殿全部完成。','- 本仁、集义、恒寿现代内饰仍 blocked；恒寿保持闭合模型，没有伪造开放目的地或当前库房用途。','- 主敬仅用自身 20260911 a075 第一期暗图增补天花结构、现代轨道及一类空白吊签，旧专用展柜和器物保留。','','## 实际检查','- 真实 TextureLibrary 和 stub 几何、碰撞、房间、元数据一致性；不依赖裸 material.name。','- 原节点几何与材质保留；B/J 仅移除 7 个指定旧正面网格，恒寿仅替换屋顶；主敬仅两前折叶按显式model-access-fit外开，原矩阵和几何均有核对。','- 实际窗格承托、立面遮挡、吊挂接合、FrontSide 闭壳和真实柱梁屋面接合。','- 三处入口采用真实控制器 10/60 Hz × 步行/冲刺 × 正向/倒走；主敬另含±.08m横偏，共40往返模式。全身渲染接触全部保留，并按精确旧平台/石帽身份与实际成功子步归因。','- 旧21逐身份几何与功能摘要核对。','','## 旧消费者路线独立红证据','- 新测试 waypoint 可通不代表 owner 的生产接线已完成。已直接调用 tests/lib/auto-routes.mjs 的共享合同路线，并额外原样回放两个 R36 验收路线；没有修改这些消费者或声称 owner 生产接线已完成。',...legacyRouteSummary.map(q=>`- ${q.variant}：到达 ${q.arrived}/${q.routes}，真实身体净空通过 ${q.bodyClearancePass}/${q.routes}，完整接受 ${q.consumerReady}/${q.routes}；未豁免真实相交 ${q.unexemptedIntersections}。`),'- 文华横转两点：(-186.4,-205.3)、(-175.4,-205.3) → (-186.4,-205.0)、(-175.4,-205.0)。这是旧叶尖端相交的既有问题。','- 主敬横转两点：(-186.4,-172.0)、(-184.1,-172.0) → (-186.4,-172.6)、(-184.1,-171.8)。新薄代理暴露原向内折叶净空不足，已由显式外开 pose 修复；斜绕另避开真实柱与圆展体木框，不能仅以到达判成功。','','## 失败项',...(failed.length?failed.map(r=>`- ${r.name}: ${r.message.split('\n')[0].slice(0,220)}（完整帧/三角见 JSON）。`):['- 无。']),'','## 接触与通行不能混淆',...contactSummary.map(q=>`- ${q.name}：${q.arrived}/${q.routes} 往返到达；严身体接触 ${q.strictBodyContacts}，精确旧低地形归因 ${q.attributedLowTerrain}，未豁免相交 ${q.unexemptedIntersections}；真实入殿子步最大抬升 ${q.maxAcceptedHallStep.toFixed(2)}m，可见支撑偏差最大 ${q.maxVisibleSupportDifference.toFixed(3)}m。文华旧地形接触 ${q.inheritedWenhuaContacts}、旧踏步支撑偏差 ${q.inheritedWenhuaSupportSamples} 另列。`),'- 严格平滑相机身体扫描仍记录低台沿接触；只有旧平台/石帽、接触高度不超过STEP_UP .6、真实子步抬升与可见脚面吻合且往返到达时，才归为可跨低地形，不声称完全没有身体接触。','- 原门槛由精确旧节点识别；记录平滑feet与实际physics ground的差值，避免将相机平滑迟滞误作控制器没登上平台。','- 未改文华殿原阶梯/台基/门槛接触，以及旧碰撞脚印支撑比离散踏步高的样本，独立记为baseline inherited，不因本轮不修改而删除。','','## 历史红证据','- 旧完整合同路线经过文华门，仍会记录其原阶梯/台沿接触；这些不属于本次四身份，保持未豁免诊断，不能据此归咎新四身份或静默删除。','- 首版本仁与集义各384个新菱格均与窗框分离，深度间隙0.0475m；原模块和数值保留在 JSON 的 initialRedEvidence。','- 后续通过不抹去首版红证据；当前结果只对应上列模块哈希。','','## 复现','node --test tests/r48-outer-zhujing-proxy-review.test.mjs','node --test tests/r48-outer-first21-retention.test.mjs',''];
 if(process.env.R48_WRITE_OUTER_LEGACY_DIAGNOSTIC==='1')writeFileSync(new URL('outer-zhujing-legacy-replay.md',dir),lines.join('\n'));
});
