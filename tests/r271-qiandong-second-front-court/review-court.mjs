import * as T from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {Environment,getCreatedEnvironmentGround} from '../../src/scene/Environment.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';
import {ShadowSetup} from '../../src/render/ShadowSetup.js';
import {setBuildingDetailQuality} from '../../src/render/BuildingDetailQuality.js';
import zoneJSON from '../../data/zones/east-six.json';
import actorsJSON from '../../data/characters/actors.json';
import bedsJSON from '../../data/characters/night-beds.json';
import nightJSON from '../../data/characters/night-routes.json';
import anchorsJSON from '../../data/characters/anchors.json';
import {LABEL,SETTINGS,VIEWS,ROUTES,requireReady,contactState,observeFootContact} from './contract.mjs';
const receipt={status:'LOADING',label:LABEL,identity:__R271_REVIEW_IDENTITY__,scope:'ACTUAL_EAST_SIX_FINITE_SCRIPTED_CONTROLLER',physicsConsumer:'PRODUCTION_FIRST_PERSON_SCRIPTED',releaseAccepted:false,visualReview:'REQUIRED',postProcessing:SETTINGS.postProcessing,errors:[],routes:[],limitations:['No native/public input automation','No full World or 21-NPC dynamic binding','No ZoneManager unload/rebuild or shared Taihe/Chuxiu lifecycle','No parent-zone numeric room baseline','No historic photo-match or proportion acceptance']};
const require=(v,m)=>{if(!v)throw Error(m);};
let renderer,scene,camera,library,environment,shadow,builder,data,cm,controls,disposed=false;
const resources=new Map(),buttons=[],itemFrames=new Map(),roomSources=new WeakMap(),roomStacks=new WeakMap();
let oldRefs,oldValues,sourceMeshes=[],finalMeshes=[],geometryBefore,triangleRequirements=new Map(),contactMeshes=[],contactOwners=new WeakMap(),walkableInputs=new WeakMap(),itemWalkableSources=new WeakMap();
const watch=(r,owner)=>{if(!r?.addEventListener)return;const row=resources.get(r.uuid);if(row){if(!row.owners.includes(owner))row.owners.push(owner);return;}const value={uuid:r.uuid,type:r.type??r.constructor.name,owners:[owner],disposals:0};resources.set(r.uuid,value);r.addEventListener('dispose',()=>value.disposals++);};
const watchTree=(root,owner,materials=false)=>root?.traverse(n=>{watch(n.geometry,owner);if(materials)for(const m of(Array.isArray(n.material)?n.material:[n.material]))watch(m,library?.owns?.(m)?'TextureLibrary':owner);});
const bbox=n=>{const b=new T.Box3().setFromObject(n,true);require(!b.isEmpty()&&[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite),'nonfinite real source bounds');return {min:b.min.toArray(),max:b.max.toArray()};};
const meshes=root=>{const a=[];root.traverse(n=>{if(n.isMesh)a.push(n);});return a;};
const publish=()=>{document.querySelector('#status').textContent=receipt.status;};
const fail=e=>{receipt.status='FAILED';receipt.errors.push(String(e?.stack??e));publish();};
function dispose(){
 if(disposed)return receipt.cleanup;disposed=true;buttons.forEach(b=>b.disabled=true);const errors=[];const run=(name,fn)=>{try{fn();}catch(e){errors.push(name+': '+e.message);}};
 run('controls',()=>{controls?.stop();controls?.dispose();controls=null;});
 run('collision owners',()=>{cm?.removeByTag('east-six');cm?.setRegions([]);cm?.clear();});
 const physicsReferencesCleared=!cm?.colliders.length&&!cm?.walkables.length&&!cm?.dynamicBodies.size;
 run('zone',()=>builder?.dispose());
 // ZoneBase owns disposal, not this review. Drop construction/room refs only
 // after its production dispose, never dispose source/merged geometry twice.
 run('review references',()=>{if(builder){builder.kit.rooms.length=0;builder.kit.regions.length=0;builder.kit.mapItems.length=0;}itemFrames.clear();sourceMeshes=[];finalMeshes=[];contactMeshes=[];oldRefs=null;oldValues=null;data=null;});
 run('environment',()=>environment?.dispose());run('library',()=>library?.dispose());
 run('renderer',()=>{renderer?.renderLists.dispose();renderer?.dispose();renderer?.forceContextLoss();});
 const observed=[...resources.values()],bad=observed.filter(r=>r.disposals!==1);
 receipt.cleanup={status:errors.length||bad.length?'FAILED':'COMPLETE',errors,resources:observed,bad,physicsReferencesCleared,controlsDetached:controls===null,zoneDisposed:builder?.disposed===true,scope:'Observed live source and final zone geometries, kit-owned materials/textures, Environment objects, and TextureLibrary owners only; no full ZoneManager lifecycle'};
 builder=cm=library=environment=renderer=scene=camera=shadow=null;return receipt.cleanup;
}
window.__R271_COURT_REVIEW__=Object.freeze({read:()=>structuredClone(receipt),dispose});
window.addEventListener('error',e=>fail(e.error??e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));window.addEventListener('pagehide',dispose,{once:true});
function instrumentZone(){
 const kit=builder.kit;
 for(const method of ['buildHall','buildGate','buildCourtWalls','buildWall','buildCorridor']){const original=builder[method];builder[method]=function(item,...rest){const index=zoneJSON.items.indexOf(item),children=new Set(kit.root.children),rooms=new Set(kit.rooms),walkables=new Set(kit.walkables);const result=original.call(this,item,...rest);if(index===58)require(kit.rooms.length===rooms.size,'new gate registered a room');for(const w of kit.walkables)if(!walkables.has(w))itemWalkableSources.set(w,{itemIndex:index,method});const frames=kit.root.children.filter(f=>!children.has(f));itemFrames.set(index,[...(itemFrames.get(index)??[]),...frames]);for(const room of kit.rooms)if(!rooms.has(room))roomSources.set(room,'data/zones/east-six.json/items/'+index);return result;};}
 const push=kit.rooms.push;
 Object.defineProperty(kit.rooms,'push',{configurable:true,writable:true,value:function(...rows){
  if(rows.some(r=>r.sourceId?.startsWith('east-six/qiandong-second-front-court/'))){require(!oldRefs,'new rooms published more than once');oldRefs=[...this];oldValues=oldRefs.map(r=>JSON.stringify(r));}
  for(const r of rows){roomStacks.set(r,new Error('registration observation').stack);if(r.sourceObjectId==='FC-59F7BB24CB')roomSources.set(r,'src/scene/palace/special/JideRearHall.js -> WeiyuStudyAnnex.js/registerRoom');}
  return push.apply(this,rows);
 }});
 const atlas=kit.buildPlaqueAtlas;kit.buildPlaqueAtlas=function(){
  const result=atlas.call(this);kit.root.updateMatrixWorld(true);sourceMeshes=meshes(kit.root);watchTree(kit.root,'ZoneBase source');kit.owned.forEach(r=>watch(r,'CourtKit owned'));kit.ownedTextures?.forEach(r=>watch(r,'CourtKit owned texture'));geometryBefore=measureBefore();return result;
 };
 const finish=kit.finish;kit.finish=function(){
  receipt.rooms=roomProof();const group=finish.call(this);group.updateMatrixWorld(true);finalMeshes=meshes(group);watchTree(group,'ZoneBase merged');kit.owned.forEach(r=>watch(r,'CourtKit owned'));kit.ownedTextures?.forEach(r=>watch(r,'CourtKit owned texture'));receipt.structure=measureAfter(group);return group;
 };
}
function roomProof(){
 const rooms=builder.kit.rooms;require(oldRefs?.length>0,'pre-body room prefix not observed');const prefixPreserved=oldRefs.every((r,i)=>rooms[i]===r&&JSON.stringify(r)===oldValues[i]);
 const old=oldRefs.map((r,index)=>{const source=roomSources.get(r);require(source,'unresolved original room declaration '+index+' '+(r.name??r.sourceId??r.id));return {index,source,registrationStack:roomStacks.get(r),record:structuredClone(r)};});
 const newRooms=rooms.slice(oldRefs.length),ids=newRooms.map(r=>r.sourceId?.split('/').at(-1));require(JSON.stringify(ids)==='["westWing","eastWing","northRoom"]','last three real rooms wrong');
 return {prefixPreserved,old,new:ids,newRecords:structuredClone(newRooms),newFinalThree:rooms.length===oldRefs.length+3,baseline:'Source/call order and same-build pre-body object identity only. Candidate numeric fields recorded, NOT compared to a whole parent build.'};
}
function measureBefore(){
 const kit=builder.kit,owners=[];
 for(const [index,roots] of itemFrames)if([15,17,36,38,42,43,44,45,46,47,48,58].includes(index))for(const root of roots)owners.push({id:'item/'+index,root});
 for(const root of kit.root.children)if(root.userData.qiandongSecondFrontOwner==='qiandongSecondFrontCourt')owners.push({id:'new-body',root});
 require(owners.some(o=>o.id==='item/58')&&owners.some(o=>o.id==='new-body')&&owners.some(o=>o.id==='item/45')&&owners.some(o=>o.id==='item/43'),'real gate/body/neighbors missing');
 triangleRequirements=new Map();for(const {root} of owners)for(const n of meshes(root))forEachTriangle(n,key=>{const row=triangleRequirements.get(key)??{required:0,found:0};row.required++;triangleRequirements.set(key,row);});
 const rows=owners.map(({id,root})=>({id,uuid:root.uuid,bounds:bbox(root),structure:structuredClone(root.userData.structure??null),meshes:meshes(root).map(n=>({uuid:n.uuid,name:n.name,geometry:n.geometry.uuid,material:Array.isArray(n.material)?n.material.map(m=>m.uuid):n.material.uuid,bounds:bbox(n),role:n.userData.qiandongRole??null}))}));
 const body=owners.find(o=>o.id==='new-body').root,newGate=owners.find(o=>o.id==='item/58').root;
 const rooms=body.children.filter(f=>f.userData.qiandongRoom).map(f=>({id:f.userData.qiandongRoom,bounds:bbox(f)}));require(rooms.length===3,'three room sources missing');
 const roofs=[];for(const root of[body,newGate])root.traverse(n=>{if(n.userData.qiandongRole==='roof')roofs.push({uuid:n.uuid,bounds:bbox(n)});});
 const actors=actorsJSON.actors.filter(a=>a.zoneRef==='east-six'),beds=bedsJSON.beds.filter(b=>b.zoneRef==='east-six'),bedIds=new Set(beds.map(b=>b.id)),nightPaths=nightJSON.paths.filter(p=>bedIds.has(p.bedId));require(actors.length===21&&nightPaths.length===10,'static NPC identity scope changed');
 const nightMaxZ=Math.max(...nightPaths.flatMap(p=>p.points.map(q=>q[2]))),newMinZ=Math.min(bbox(body).min[2],bbox(newGate).min[2]);require(newMinZ>nightMaxZ+1,'new actual geometry intrudes static night-path envelope');
 receipt.staticNPC={actorIds:actors.map(a=>a.id),anchors:anchorsJSON.filter(a=>a.zoneRef==='east-six'),nightBedIds:nightPaths.map(p=>p.bedId),nightMaxZ,newActualMinZ:newMinZ,geometryGap:newMinZ-nightMaxZ,dynamicBinding:'NOT_RUN',allNPCSupport:'NOT_RUN',proof:'Static original refs plus actual new source geometry envelope separation only'};
 const newMeshSet=new Set([...meshes(body),...meshes(newGate)]),newMeshes=[...newMeshSet];
 const overlap=(a,b)=>a.min.every((v,i)=>Math.min(a.max[i],b.max[i])-Math.max(v,b.min[i])>1e-5);
 const intersections=[];
 for(const owner of rows.filter(o=>o.id!=='new-body'&&o.id!=='item/58'))for(const old of owner.meshes)for(const n of newMeshes){const a=bbox(n);if(overlap(a,old.bounds))intersections.push({newMesh:n.uuid,oldMesh:old.uuid,oldOwner:owner.id,newRole:n.userData.qiandongRole??'roof-submesh',bounds:{new:a,old:old.bounds},interpretation:owner.id==='item/43'?'REVIEW_DESIGNED_WALL_GATE_SEAM_OR_ROOF_CONTACT':'REVIEW_POSITIVE_AABB_OVERLAP_NOT_TRIANGLE_COLLISION'});}
 return {owners:rows,rooms,gate:bbox(newGate),body:bbox(body),roofs,intersections,sourceMeshCount:sourceMeshes.length,sourceElements:elementCount(sourceMeshes),newMeshIds:newMeshes.map(n=>n.uuid)};
}
function forEachTriangle(n,visit){
 if(n.isInstancedMesh||Array.isArray(n.material))throw Error('selected source requires explicit noninstanced single material');
 const p=n.geometry.attributes.position,ix=n.geometry.index,v=new T.Vector3();
 for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[];for(let j=0;j<3;j++){v.fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(n.matrixWorld);vertices.push(v.toArray().map(Math.fround).join(','));}visit(n.material.uuid+':'+vertices.sort().join(';'));}
}
function elementCount(list){const counts=new Map();for(const n of list){if(n.isInstancedMesh)continue;const key=Array.isArray(n.material)?n.material.map(m=>m.uuid).join(','):n.material.uuid;counts.set(key,(counts.get(key)??0)+(n.geometry.index?.count??n.geometry.attributes.position.count));}return [...counts].sort((a,b)=>a[0].localeCompare(b[0]));}
function measureAfter(group){
 for(const n of finalMeshes)if(!n.isInstancedMesh&&!Array.isArray(n.material))forEachTriangle(n,key=>{const r=triangleRequirements.get(key);if(r)r.found++;});
 require([...triangleRequirements.values()].every(r=>r.found>=r.required),'actual source world triangles missing after normal merge');
 const triangleProof={selectedTriangleKeys:triangleRequirements.size,matched:true,precision:'source world coordinates converted to actual Float32 merge values; unordered triangle vertices plus exact material UUID'};triangleRequirements.clear();
 const after=elementCount(finalMeshes);require(JSON.stringify(after)===JSON.stringify(geometryBefore.sourceElements),'normal merge lost/changed material vertex elements');
 const retained=new Set(builder.kit.colliders),contacts=builder.kit.colliders.filter(c=>c.triangleSupport?.id.startsWith('qiandong-front:actual-roof:'));
 require(contacts.length===4,'actual four new roof contact owners missing');
 const owners=geometryBefore.owners;const wall=owners.find(o=>o.id==='item/43'),old45=owners.find(o=>o.id==='item/45'),north=geometryBefore.rooms.find(r=>r.id==='northRoom');
 const gap45=old45.bounds.min[2]-north.bounds.max[2];require(gap45>0,'new north room intersects retained45 envelope');
 const southCapMax=Math.max(...wall.meshes.filter(m=>m.bounds.max[2]<468&&m.bounds.min[2]>464).map(m=>m.bounds.max[1]));
 require(Number.isFinite(southCapMax),'actual south wall cap not identified');
 const gateRoof=geometryBefore.roofs.find(r=>r.bounds.min[2]<465);
 const wingGap=Math.min(...geometryBefore.rooms.filter(r=>r.id!=='northRoom').map(r=>r.bounds.min[2]))-Math.max(...wall.meshes.filter(m=>m.bounds.max[2]<468&&m.bounds.min[2]>464).map(m=>m.bounds.max[2]));
 require(gateRoof.bounds.min[1]>southCapMax&&wingGap>0,'actual gate roof/wing to south cap clearance failed');
 return {triangleProof,beforeAfter:true,sourceLinks:true,groundBodySeparateFromRoof:true,measured:true,before:geometryBefore,after:{bounds:bbox(group),meshCount:finalMeshes.length,materialElements:after,architecture:structuredClone(group.userData.architecture),roofContacts:contacts.map(c=>({id:c.triangleSupport.id,bounds:{min:c.min.toArray(),max:c.max.toArray()},sourceRetained:retained.has(c),triangles:c.triangleSupport.template.triangles.length}))},gaps:{northToOld45:gap45,gateRoofAboveSouthCap:gateRoof.bounds.min[1]-southCapMax,wingSouthCap:wingGap},scope:'Whole-zone normal merge material element conservation and actual source/CPU roof contacts. AABB contacts are reported separately from finite movement, not a proof of historical geometry or no triangle intersection.'};
}
function collectContactMeshes(){
 const ground=getCreatedEnvironmentGround(scene);require(ground,'actual Environment birth required');
 contactMeshes=[];contactOwners=new WeakMap();
 const add=(mesh,owner)=>{if(contactOwners.has(mesh))return;contactOwners.set(mesh,owner);contactMeshes.push(mesh);};
 // Include the Environment's roads, plazas, and any other real low mesh as
 // well as base ground. No exclusion based on the desired logical result.
 environment.objects.forEach((root,index)=>root.traverse(n=>{if(n.isMesh)add(n,n===ground?'Environment.ground':'Environment.objects/'+index);}));
 finalMeshes.forEach(n=>add(n,'ZoneBase/east-six'));
 require(contactOwners.get(ground)==='Environment.ground','original ground absent from actual observed objects');
}
function observeAt(x,z,feet,logicalGroundY,airborne){
 const ground=getCreatedEnvironmentGround(scene);require(ground&&contactOwners.get(ground)==='Environment.ground','actual Environment ground owner revoked/missing');
 const padding=(PLAYER.STEP_UP??.6)+.12,high=Math.max(feet,logicalGroundY)+padding,low=Math.min(feet,logicalGroundY)-padding;
 const visible=object=>{for(let n=object;n;n=n.parent)if(n.visible===false)return false;return true;};
 const actual=contactMeshes.filter(visible),downRay=new T.Raycaster(new T.Vector3(x,high,z),new T.Vector3(0,-1,0),0,high-low),upRay=new T.Raycaster(new T.Vector3(x,low,z),new T.Vector3(0,1,0),0,high-low);
 const rows=(hits,orientation)=>hits.flatMap(h=>{
  const material=Array.isArray(h.object.material)?h.object.material[h.face?.materialIndex??0]:h.object.material;if(material?.visible===false||!h.face)return [];
  const normal=h.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(h.object.matrixWorld)).normalize();if(orientation*normal.y<=.5)return [];
  const sourceOwner=contactOwners.get(h.object);require(sourceOwner,'unowned actual ray intersection');
  return [{sourceOwner,meshUuid:h.object.uuid,geometryUuid:h.object.geometry.uuid,faceIndex:h.faceIndex,point:h.point.toArray(),normalWorld:normal.toArray()}];
 });
 const upwardHits=rows(downRay.intersectObjects(actual,false),1),downwardHits=rows(upRay.intersectObjects(actual,false),-1),surfaceInputs={upwardHits,downwardHits};
 const surfaceObservation=observeFootContact({feet,logicalGroundY,airborne,...surfaceInputs});
 const located=cm.walkables.map((w,i)=>({w,i})).filter(({w})=>w.type==='box'?x>=w.box.min.x&&x<=w.box.max.x&&z>=w.box.min.z&&z<=w.box.max.z:x>=w.minX&&x<=w.maxX&&z>=w.minZ&&z<=w.maxZ);
 const nearbyRamps=located.filter(({w})=>w.type==='ramp').map(({w,i})=>walkableRow(w,i));
 const boxes=located.filter(({w})=>w.type==='box'&&logicalGroundY>1e-6&&Math.abs(w.box.max.y-logicalGroundY)<1e-6).map(({w,i})=>walkableRow(w,i));
 const logicalHits=[...upwardHits].filter(h=>Math.abs(h.point[1]-logicalGroundY)<.065&&(h.sourceOwner==='Environment.ground'&&Math.abs(logicalGroundY)<1e-6||h.sourceOwner==='ZoneBase/east-six'&&boxes.length)).sort((a,b)=>Math.abs(a.point[1]-logicalGroundY)-Math.abs(b.point[1]-logicalGroundY)||Number(a.sourceOwner==='Environment.ground')-Number(b.sourceOwner==='Environment.ground'));
 const h=logicalHits[0];let support;
 // The five retained ph=.45 halls do not take CourtKit's ph>.55 steps path.
 // If an actual original ramp is nevertheless reached, preserve its exact
 // source primitive and fail this fixed box/ground scope, never default to0
 // or invent a broad logical-ramp/visible-step contact exception.
 if(nearbyRamps.length)support={verified:false,kind:'UNREVIEWED_REAL_RAMP_IN_FIXED_ROUTE',walkables:nearbyRamps};
 else support=h?{verified:true,kind:h.sourceOwner==='Environment.ground'?'ENVIRONMENT_TRIANGLE':'ACTUAL_WALKABLE_AND_MESH_TRIANGLE',meshUuid:h.meshUuid,geometryUuid:h.geometryUuid,faceIndex:h.faceIndex,point:h.point,...(h.sourceOwner==='Environment.ground'?{groundOwner:'Environment.setupGround/getCreatedEnvironmentGround'}:{walkables:boxes})}:{verified:false,kind:'UNPROVEN_LOGICAL_SUPPORT'};
 return {support,surfaceInputs,surfaceObservation,nearbyRamps,rayWindow:{low,high,stepUp:PLAYER.STEP_UP??.6,source:'original PLAYER.STEP_UP plus .12m observational ray padding',actualMeshes:actual.length},environmentGroundWitness:upwardHits.filter(h=>h.meshUuid===ground.uuid)};
}
function walkablePrimitive(w){
 if(w.type==='box')return {type:'box',min:w.box.min.toArray(),max:w.box.max.toArray()};
 const keys=['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1','crossMin0','crossMax0','crossMin1','crossMax1'];return {type:'ramp',...Object.fromEntries(keys.filter(k=>w[k]!==undefined).map(k=>[k,w[k]]))};
}
function walkableRow(w,index){
 const original=walkableInputs.get(w);require(original,'actual CM walkable lost its original ZoneBase source');
 const primitive=walkablePrimitive(w),originalPrimitive=walkablePrimitive(original);require(JSON.stringify(primitive)===JSON.stringify(originalPrimitive),'CM/source primitive mismatch');
 return {index,tag:w.tag,sourceIndex:data.walkables.indexOf(original),sourceItem:itemWalkableSources.get(original)??null,producer:'ZoneBase.build().walkables -> CollisionManager.addWalkables',primitive,originalPrimitive};
}
function controllerSample(controller,dt=null){
 const pos=controller.camera.position,feet=controller.feetY,logicalGroundY=controller.groundY;
 require(pos.x>=-201&&pos.x<=-82&&pos.z>=463.35&&pos.z<=503&&feet>=-.01&&feet+PLAYER.HEIGHT<=2.5,'outside statically reviewed physical corridor');
 const observation=observeAt(pos.x,pos.z,feet,logicalGroundY,controller.airborne),physical=observation.surfaceObservation;
 return {dt,position:pos.toArray(),feet,logicalGroundY,airborne:controller.airborne,verticalVelocity:controller.verticalVelocity,onSupport:controller.onSupport,trackedGround:controller._trackedGround??null,speed:controller.motion.speed,contactState:physical.contactState,feetAtLogicalGround:Math.abs(feet-logicalGroundY)<.0051,actualTriangleContact:physical.actualTriangleContact,feetToRealTriangle:physical.feetToRealTriangle,bodyClear:!cm.checkCollision(new T.Vector3(pos.x,feet+PLAYER.HEIGHT,pos.z),.5),...observation};
}
function observeOldGateCenter(){
 // Independent initialization, not a route teleport or collision-only claim.
 // It preserves the exact old gate-centre surface discrepancy if still present.
 const gate=zoneJSON.items[42],c=new FirstPersonControls(new T.PerspectiveCamera(),renderer.domElement,cm);
 try{c.freeMove=true;c.setHeadBob(false);c.setPosition(gate.x,PLAYER.HEIGHT,gate.z);receipt.oldGateCenterProbe={kind:'INDEPENDENT_PRODUCTION_CONTROLLER_INITIALIZATION_NOT_ROUTE',sourceItemIndex:42,sourceItemPoint:[gate.x,gate.z],sample:controllerSample(c),note:'Actual original controller initialization; source plate, logical ground and physical surface are distinct evidence.'};}
 finally{c.stop();c.dispose();}
}
function routePlans(){
 const gate=zoneJSON.items[58],common=zoneJSON.items[42],streetZ=463.85,entry=[gate.x,streetZ],inside=[gate.x,469],plans=[{id:'street-west',points:[[gate.x,streetZ],[gate.x+8,streetZ],[gate.x,streetZ]]},{id:'street-east',points:[[gate.x,streetZ],[gate.x-8,streetZ],[gate.x,streetZ]]},{id:'new-entry',points:[entry,inside,entry]}];
 for(const r of data.rooms.slice(-3)){const d=r.doors[0],cx=(r.min.x+r.max.x)/2,cz=(r.min.z+r.max.z)/2,v=new T.Vector2(cx-d.x,cz-d.z).normalize(),outside=[d.x-v.x*.9,d.z-v.y*.9],inn=[d.x+v.x*.9,d.z+v.y*.9],mid=[gate.x,d.z-v.y*1.5];plans.push({id:'new-'+r.sourceId.split('/').at(-1),roomIndex:data.rooms.indexOf(r),door:structuredClone(d),points:[entry,inside,mid,outside,inn,outside,mid,inside,entry]});}
 for(let i=44;i<=48;i++){const rs=data.rooms.filter(r=>roomSources.get(r)==='data/zones/east-six.json/items/'+i);require(rs.length,'old shell has no registered real room '+i);const r=rs.reduce((a,b)=>Math.abs((b.min.x+b.max.x)/2-zoneJSON.items[i].x)<Math.abs((a.min.x+a.max.x)/2-zoneJSON.items[i].x)?b:a),d=r.doors.reduce((a,b)=>b.z<a.z?b:a);require(d&&d.z<500,'old south entrance unresolved '+i);const sourceWalkables=data.walkables.filter(w=>itemWalkableSources.get(w)?.itemIndex===i);require(sourceWalkables.length,'old hall actual walkable source missing');const southEdge=Math.min(...sourceWalkables.map(w=>w.type==='box'?w.box.min.z:w.minZ));const start=[common.x,streetZ],corner=[common.x,490],align=[d.x,490],outside=[d.x,Math.min(d.z-1,southEdge-1)],inn=[d.x,d.z+1];plans.push({id:'old-'+i,originalEntryWalkables:sourceWalkables.map(w=>({sourceIndex:data.walkables.indexOf(w),primitive:walkablePrimitive(w)})),outsideRule:'one metre south of entire actual original entry walkable range, then continuous controller crossing',roomIndex:data.rooms.indexOf(r),door:structuredClone(d),points:[start,[common.x,470],corner,align,outside,inn,outside,align,corner,[common.x,470],start]});}
 return plans.map(p=>({...p,points:p.points.filter((v,i,a)=>!i||Math.hypot(v[0]-a[i-1][0],v[1]-a[i-1][1])>1e-5)}));
}
async function runRoute(plan){
 const r={id:plan.id,status:'FAILED',plan,teleports:0,rescues:0,samples:[],settlements:[],reached:false,initialization:{kind:'INDEPENDENT_VERIFIED_START',verified:false},steering:'Browser FirstPersonControls freeMove, scripted camera yaw and forward state, bounded approx60Hz steps; not public/native input'};receipt.routes.push(r);
 const movementCamera=new T.PerspectiveCamera();controls=new FirstPersonControls(movementCamera,renderer.domElement,cm);controls.freeMove=true;controls.setHeadBob(false);controls.setPosition(plan.points[0][0],PLAYER.HEIGHT,plan.points[0][1]);
 let prior=[movementCamera.position.x,movementCamera.position.z],priorFeet=controls.feetY;const originalHeight=cm.getGroundHeight;
 const sample=(dt=null,settlingWaypoint=null)=>{
  const s=controllerSample(controls,dt);if(settlingWaypoint!==null)s.settlingWaypoint=settlingWaypoint;r.samples.push(s);
  require(s.support.verified&&s.bodyClear,'actual support/body failed '+plan.id);
  // Normal production smoothing may be explicitly non-direct. A converged
  // logical foot hidden beneath a real foreground solid is never admitted.
  require(s.surfaceObservation.logicalState!=='DIRECT'||s.actualTriangleContact,'logical foot conflicts with actual surface/foot occupancy '+plan.id);
  return s;
 };
 try{
  const initial=sample();r.initialization={...r.initialization,verified:true,position:initial.position,feet:initial.feet,support:initial.support};
  cm.getGroundHeight=function(x,z,feet=0,step=PLAYER.STEP_UP??.6,...rest){const h=originalHeight.call(this,x,z,feet,step,...rest);if(h>feet+step+1e-6)r.rescues++;return h;};
  for(let leg=1;leg<plan.points.length;leg++){
   const target=plan.points[leg];let arrived=false;const limit=Math.ceil(Math.hypot(target[0]-prior[0],target[1]-prior[1])/2*60)+240;
   require(limit<=5000,'finite route leg bound');
   for(let frame=0;frame<limit;frame++){
    const distance=Math.hypot(target[0]-movementCamera.position.x,target[1]-movementCamera.position.z);if(distance<.18){arrived=true;controls.stop();break;}
    controls.lookAt(...target);movementCamera.updateMatrixWorld(true);controls.moveForward=true;controls.canSprint=false;controls.prevTime=performance.now()-1000/60;const priorTime=controls.prevTime;controls.update();const dt=(controls.prevTime-priorTime)/1000;require(dt>0&&dt<=.1,'bounded actual controller frame');
    const pos=movementCamera.position;require(Math.hypot(pos.x-prior[0],pos.z-prior[1])<.25&&Math.abs(controls.feetY-priorFeet)<.61,'discontinuous/rescue frame');require(!r.rescues,'production rescue observed');sample(dt);prior=[pos.x,pos.z];priorFeet=controls.feetY;
    if(frame%120===0)await new Promise(resolve=>setTimeout(resolve,0));
   }
   require(arrived,'route did not reach waypoint '+leg);
   // Stop through the production input API, then let its original smooth-up/
   // short-drop physics converge. No setPosition/teleport/ground override.
   let steady=0,settled=null,stableSampleIndices=[];
   for(let frame=0;frame<120;frame++){
    controls.prevTime=performance.now()-1000/60;const t=controls.prevTime;controls.update();const dt=(controls.prevTime-t)/1000;require(dt>0&&dt<=.1,'bounded settlement frame');const s=sample(dt,leg);
    const reached=Math.hypot(target[0]-movementCamera.position.x,target[1]-movementCamera.position.z)<.18;
    const stable=reached&&s.feetAtLogicalGround&&s.actualTriangleContact&&controls.motion.speed<.01;steady=stable?steady+1:0;stableSampleIndices=stable?[...stableSampleIndices,r.samples.length-1]:[];
    if(steady>=6){settled={waypoint:leg,target:[...target],position:s.position,feet:s.feet,logicalGroundY:s.logicalGroundY,reached,feetAtLogicalGround:s.feetAtLogicalGround,actualTriangleContact:s.actualTriangleContact,speed:controls.motion.speed,support:s.support,surfaceObservation:s.surfaceObservation,stableFrames:steady,stableSampleIndices:[...stableSampleIndices],sampleIndex:r.samples.length-1};break;}
   }
   require(settled,'no real settled contact at waypoint '+leg);r.settlements.push(settled);r.samples.at(-1).reachedWaypoint=leg;prior=[movementCamera.position.x,movementCamera.position.z];priorFeet=controls.feetY;
  }
  r.reached=true;r.status='PASS';
 }catch(e){r.error=String(e.stack);r.diagnosis=plan.id.startsWith('old-')?'Preserved candidate failure. Parent baseline not run; causation UNDETERMINED, do not attribute to R271 or omit.':'Preserved actual route failure';}
 finally{cm.getGroundHeight=originalHeight;controls.stop();controls.dispose();controls=null;}
}
function renderView(id){
 const v=VIEWS.find(v=>v.id===id);require(v&&!disposed,'known view/live scene required');camera.position.fromArray(v.position);camera.fov=v.fov;camera.lookAt(...v.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 const point=new T.Vector3(...v.position);require(!sourceMeshes.some(n=>{const b=new T.Box3().setFromObject(n,true);return b.containsPoint(point);}), 'review camera inside known source geometry');
 environment.update(camera,0);shadow.updateShadowLOD(camera,meshes(scene),150);renderer.render(scene,camera);renderer.getContext().finish();const gl=renderer.getContext();
 receipt.view={...v,worldPosition:camera.position.toArray(),kind:'FIXED_REVIEW_CAMERA_SEPARATE_FROM_ROUTES',knownSourceEnvelopeClear:true};receipt.draw={...renderer.info.render};receipt.gl={lost:gl.isContextLost(),error:gl.getError(),version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),width:gl.drawingBufferWidth,height:gl.drawingBufferHeight};buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));
}
for(const v of VIEWS){const b=document.createElement('button');b.textContent=v.label;b.dataset.view=v.id;b.disabled=true;b.onclick=()=>{try{renderView(v.id);requireReady(receipt);}catch(e){fail(e);}};document.querySelector('#views').append(b);buttons.push(b);}
async function initialize(){try{
 scene=new T.Scene();camera=new T.PerspectiveCamera(60,1280/800,.1,2500);renderer=new T.WebGLRenderer({canvas:document.querySelector('#hall'),antialias:true,alpha:false});renderer.setPixelRatio(1);renderer.setSize(1280,800,false);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=SETTINGS.exposure;renderer.outputColorSpace=T.SRGBColorSpace;renderer.domElement.addEventListener('webglcontextlost',()=>{if(!disposed)fail(Error('WebGL context lost'));});shadow=new ShadowSetup(renderer);shadow.init('high');
 const textureErrors=[],manager=new T.LoadingManager();manager.onError=url=>textureErrors.push(url);library=new TextureLibrary({quality:'hd',anisotropy:Math.min(renderer.capabilities.getMaxAnisotropy(),8),manager});setBuildingDetailQuality(library,'high');await library.load();library.allTextures().forEach(r=>watch(r,'TextureLibrary'));
 receipt.textures={manifest:!!library.manifest,loadedFromFile:[...library.loadedFromFile].sort(),fallbacks:Object.keys(TEXTURE_SPECS).filter(n=>!library.has(n)),missingNormals:Object.entries(library.manifest?.textures??{}).filter(([n,v])=>v.normal&&!library.normals.has(n)).map(([n])=>n),errors:textureErrors};require(receipt.textures.manifest&&!receipt.textures.fallbacks.length&&!receipt.textures.missingNormals.length&&!textureErrors.length,'original textures incomplete');
 await document.fonts.load('16px "Noto Sans CJK SC"','乾东二所');await document.fonts.ready;receipt.fonts={status:document.fonts.status,cjk:document.fonts.check('16px "Noto Sans CJK SC"','乾东二所'),verification:'FontFaceSet plus pinned CI fc-match receipt'};
 environment=new Environment(scene,renderer,library);environment.init();environment.setTimePreview(new Date(SETTINGS.date));environment.setQuality(true);environment.objects.forEach(o=>watchTree(o,'Environment',true));require(getCreatedEnvironmentGround(scene),'production-created ground missing');
 builder=new ZoneBase(library,zoneJSON);instrumentZone();data=builder.build();scene.add(data.group);scene.updateMatrixWorld(true);cm=new CollisionManager();const riverIdentity=cm.rivers;cm.addColliders(data.colliders,'east-six');const addWalkable=cm.addWalkable;cm.addWalkable=function(input,tag){const start=this.walkables.length,result=addWalkable.call(this,input,tag);for(const w of this.walkables.slice(start))walkableInputs.set(w,input);return result;};try{cm.addWalkables(data.walkables,'east-six');}finally{cm.addWalkable=addWalkable;}cm.setRegions(data.regions);receipt.zone={id:zoneJSON.id,items:zoneJSON.items.length,normalFinish:builder.group===data.group,defaultRivers:cm.rivers===riverIdentity&&cm.rivers.length>0,colliders:cm.colliders.length,walkables:cm.walkables.length,rooms:data.rooms.length,metrics:builder.getBuildStepMetrics()};
 receipt.collisionOwners=cm.colliders.map((c,i)=>({index:i,tag:c.tag,originalIndex:data.colliders.indexOf(c.mesh),triangleSource:c.triangleSupport?.id??null,bounds:{min:c.box.min.toArray(),max:c.box.max.toArray()}}));
 collectContactMeshes();observeOldGateCenter();
 for(const plan of routePlans())await runRoute(plan);
 [...library.materials.values()].forEach(r=>watch(r,'TextureLibrary'));renderView(VIEWS[0].id);requireReady(receipt);receipt.status='READY';buttons.forEach(b=>b.disabled=false);publish();
 }catch(e){fail(e);dispose();}}
void initialize();
