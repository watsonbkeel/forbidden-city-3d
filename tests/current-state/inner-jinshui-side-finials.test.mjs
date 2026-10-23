import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildInnerJinshui, innerJinshuiProfile, INNER_JINSHUI } from '../../src/scene/palace/special/InnerJinshui.js';
import { JINSHUI_BRIDGES } from '../../src/scene/palace/river.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { replayKunning } from '../lib/kunning-walk.mjs';
const api = await import('../../src/scene/palace/special/InnerJinshuiSideFinials.js').catch(error => ({error}));
const river = {position:{x:0,z:-310.8},bridges:JINSHUI_BRIDGES};
const mat = new THREE.MeshStandardMaterial({name:'marble'});
const library = {material:()=>mat,tileSize:()=>2};
const targets = ['inner-jinshui:bridge-1','inner-jinshui:bridge-2','inner-jinshui:bridge-4','inner-jinshui:bridge-5'];
function ready(){assert.equal(typeof api.buildInnerJinshuiSideFinials,'function',`Missing source-scoped finial helper: ${api.error?.message}`);}
function head(profile=innerJinshuiProfile(river)){ready();return api.buildInnerJinshuiSideFinials(library,profile);}
function deckAt(b,z){for(let i=1;i<b.deck.length;i++)if(z<=b.deck[i].z){const a=b.deck[i-1],c=b.deck[i];return a.y+(c.y-a.y)*(z-a.z)/(c.z-a.z);}throw new Error('Outside deck');}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);

test('only the four side bridges receive caps on their 88 existing posts',()=>{
 const profile=innerJinshuiProfile(river),before=JSON.stringify(profile),group=head(profile);
 assert.equal(JSON.stringify(profile),before,'consumer must not mutate shared water or bridge profiles');
 const data=group.userData.innerJinshuiSideFinials;
 assert.deepEqual(data.bridgeIds,targets);assert.equal(data.placements.length,88);
 assert.equal(data.addedBridgeCount,0);assert.equal(data.addedColliderCount,0);assert.equal(data.addedWalkableCount,0);
 assert.equal(data.historicalPostCountVerified,false);assert.equal(data.carvedGroovesVerified,false);
 assert.match(data.status,/FIT.*NOT_SURVEYED/);
 assert.equal(data.sources.length,2);
 const inherited=buildInnerJinshui(library,river,mat);inherited.group.updateMatrixWorld(true);
 for(const cap of data.placements){const hits=new THREE.Raycaster(new THREE.Vector3(cap.x,cap.y+1,cap.z),new THREE.Vector3(0,-1,0),0,2).intersectObject(inherited.group,true);assert.ok(hits.length,cap.bridgeId);close(hits[0].point.y,cap.y);}
 assert.equal(group.children.length,1);assert.equal(group.children[0].isInstancedMesh,true);assert.equal(group.children[0].count,88);
 assert.equal(group.children[0].material,mat,'reuse caller-owned marble');
 for(const b of profile.bridges){const rows=data.placements.filter(p=>p.bridgeId===b.id);assert.equal(rows.length,b.id.endsWith('-3')?0:22);
  for(const p of rows){const z=b.minZ+INNER_JINSHUI.bridgeRailEndInset+(b.length-2*INNER_JINSHUI.bridgeRailEndInset)*p.postIndex/10;
   close(p.x,b.x+p.side*b.railX);close(p.z,z);close(p.y,deckAt(b,z)+1.17);
  }
 }
});

test('same-profile matrices are translated once and cap geometry stays within the retained post footprint',()=>{
 const custom={position:{x:11.3,z:-390.2},bridges:JINSHUI_BRIDGES.map(b=>({...b}))};
 custom.bridges[0].width=7.1;custom.bridges[0].length=23;
 const p=innerJinshuiProfile(custom),g=head(p),mesh=g.children[0],matrix=new THREE.Matrix4(),v=new THREE.Vector3();g.updateMatrixWorld(true);
 for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);v.setFromMatrixPosition(matrix).applyMatrix4(mesh.matrixWorld);const row=g.userData.innerJinshuiSideFinials.placements[i];close(v.x,row.x);close(v.y,row.y);close(v.z,row.z);}
 mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;assert.ok(Math.max(Math.abs(b.min.x),b.max.x,Math.abs(b.min.z),b.max.z)<=.13+1e-6);close(b.min.y,0);assert.ok(b.max.y<=.23);
 const triangles=(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3;assert.ok(triangles<=128,`one shared head exceeded budget: ${triangles}`);
 assert.ok(mesh.geometry.attributes.normal);assert.ok(mesh.geometry.attributes.uv);
 assert.equal(g.userData.innerJinshuiSideFinials.carving,'OMITTED_UNVERIFIED_MICRODETAIL');
});

test('non-inner-Jinshui or missing target profiles fail closed, never decorate other bridges',()=>{
 ready();const p=innerJinshuiProfile(river);
 assert.throws(()=>api.buildInnerJinshuiSideFinials(library,{...p,id:'r36-south-precinct'}),/Inner Jinshui/);
 assert.throws(()=>api.buildInnerJinshuiSideFinials(library,{...p,bridges:p.bridges.slice(0,4)}),/five|bridge/i);
});

for(const fps of [10,60])for(const reverse of [false,true])test(`unchanged bridge support and pure W crossing with added visual caps at ${fps} Hz reverse=${reverse}`,t=>{
 const result=buildInnerJinshui(library,river,mat),before=JSON.stringify({c:result.colliders,w:result.walkables});const scene=new THREE.Group();scene.add(result.group,head(result.profile));scene.updateMatrixWorld(true);
 assert.equal(JSON.stringify({c:result.colliders,w:result.walkables}),before);
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(result.colliders);cm.addWalkables(result.walkables);
 for(const b of result.profile.bridges){const points=[[b.x,b.z-14],[b.x,b.z+14]];if(reverse)points.reverse();
  const r=replayKunning(t,{THREE,cm},points,{startFeet:0,fps,sprint:false,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify(r));assert.ok(r.minFeet>=0);assert.ok(r.maxFeet>.8);assert.ok(Math.abs(r.end[2])<1e-6);
 }
});

const worldCheck=await import('../lib/r58-bridge-finial-world-check.mjs').catch(error=>({error}));
function localW(){const r=buildInnerJinshui(library,river,mat),scene=new THREE.Group(),cm=new CollisionManager();scene.add(r.group,head(r.profile));cm.addColliders(r.colliders);cm.addWalkables(r.walkables);scene.updateMatrixWorld(true);return {THREE,scene,cm};}
test('read-only existing-W consumer checks actual caps and bridge support without rebuilding',()=>{
 assert.equal(typeof worldCheck.assertInnerJinshuiFinialsInWorld,'function',worldCheck.error?.message);
 const W=localW(),before={children:W.scene.children.length,colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
 const r=worldCheck.assertInnerJinshuiFinialsInWorld(W);assert.equal(r.capCount,88);assert.equal(r.bridgeCount,5);assert.equal(r.supportSamples,15);
 assert.deepEqual({children:W.scene.children.length,colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},before);
});
test('existing-W consumer rejects missing duplicate hidden and displaced finials',()=>{
 assert.equal(typeof worldCheck.assertInnerJinshuiFinialsInWorld,'function',worldCheck.error?.message);
 for(const sabotage of ['missing','duplicate','hidden','displaced','floating-with-record','duplicate-with-record','hidden-river']){const W=localW(),g=W.scene.getObjectByName('inner-jinshui-side-finials');
  if(sabotage==='missing')g.removeFromParent();if(sabotage==='duplicate')W.scene.add(g.clone());if(sabotage==='hidden')g.visible=false;if(sabotage==='displaced')g.position.z+=.5;
  if(sabotage==='floating-with-record'){g.position.y+=.4;for(const p of g.userData.innerJinshuiSideFinials.placements)p.y+=.4;}
  if(sabotage==='duplicate-with-record'){const mesh=g.children[0],matrix=new THREE.Matrix4();mesh.getMatrixAt(0,matrix);mesh.setMatrixAt(1,matrix);g.userData.innerJinshuiSideFinials.placements[1]={...g.userData.innerJinshuiSideFinials.placements[0]};}
  if(sabotage==='hidden-river')W.scene.children.find(o=>o.userData.innerJinshui).visible=false;
  W.scene.updateMatrixWorld(true);assert.throws(()=>worldCheck.assertInnerJinshuiFinialsInWorld(W),undefined,sabotage);
 }
});

test('ordinary PalaceBuilder disposal releases instancing resources once and retains library marble',async()=>{
 const {PalaceBuilder}=await import('../../src/scene/PalaceBuilder.js');
 const scene=new THREE.Group(),builder=new PalaceBuilder(scene,{...library,owns:m=>m===mat}),group=head(),mesh=group.children[0];
 let geoDisposals=0,instanceDisposals=0,materialDisposals=0;
 mesh.geometry.addEventListener('dispose',()=>geoDisposals++);mesh.addEventListener('dispose',()=>instanceDisposals++);
 const materialListener=()=>materialDisposals++;mat.addEventListener('dispose',materialListener);
 builder.addObject(group);builder.dispose();mat.removeEventListener('dispose',materialListener);
 assert.equal(geoDisposals,1);assert.equal(instanceDisposals,1);assert.equal(materialDisposals,0);
 mesh.geometry.dispose();assert.equal(instanceDisposals,1,'forwarding listener must detach before repeated geometry disposal');
 assert.equal(group.parent,null);assert.equal(builder.ownedObjects.size,0);
});
