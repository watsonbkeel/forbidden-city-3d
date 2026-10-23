import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL, fileURLToPath} from 'node:url';
import * as THREE from 'three';
import * as current from '../src/scene/characters/CharacterKit.js';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
import {CharacterResourcePool} from '../src/scene/characters/CharacterResourcePool.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {lifeSoleContacts} from './lib/r53-life-contact.mjs';
import {createFemaleIdleAudit} from './helpers/p3c-female-idle-sweep.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const frozenBytes=fs.readFileSync(new URL('./fixtures/r53-kit-before-kang.js.txt',import.meta.url));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(frozenBytes),'7696c28eaa608bcd726a724746a88a4770064d6b3da677445cad3dcc53a863ab','Frozen predecessor source bytes');
assert.equal(fs.readFileSync(path.join(root,'src/scene/characters/CharacterKit.js'),'utf8'),frozenBytes.toString().replace("seatVariant==='kang-low'?.04:0","seatVariant==='kang-low'?.06:0"),'Production scope is exactly one approved footY literal; no other source change');
// Portable committed snapshot; when the local predecessor exists, independently
// verify the fixture against its git blob. Remote/API commit IDs may differ.
try { const blob=execFileSync('git',['show','01b8a00:src/scene/characters/CharacterKit.js'],{cwd:root,stdio:['ignore','pipe','ignore']});assert.equal(sha(blob),sha(frozenBytes)); } catch(error) { if(error.code==='ERR_ASSERTION')throw error; }
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r53-kang-qa-'));
fs.writeFileSync(path.join(tmp,'package.json'),' {"type":"module"}');
fs.symlinkSync(path.join(root,'node_modules'),path.join(tmp,'node_modules'),'dir');
fs.writeFileSync(path.join(tmp,'CharacterKit.js'),frozenBytes);
const frozen=await import(pathToFileURL(path.join(tmp,'CharacterKit.js')));
const active=process.env.R53_KANG_RED==='1'?frozen:current;
const report={frozenSourceSha256:sha(frozenBytes),activeSource:process.env.R53_KANG_RED==='1'?'frozen predecessor (expected red)':'current production',scope:'Only kang-low shoe Y and existing continuous lower-robe transition. Kang-low bytes are new, NOT user-original C1 bytes; all other tested variant bytes exact.',nonKang:[],kang:[],contact:{},idle:[],cache:[]};
after(()=>{fs.mkdirSync(path.join(root,'reports/r53-kang-contact-fix'),{recursive:true});fs.writeFileSync(path.join(root,'reports/r53-kang-contact-fix',process.env.R53_KANG_RED==='1'?'red.json':'green.json'),JSON.stringify(report,null,2));fs.rmSync(tmp,{recursive:true,force:true});});
const hashGeometry=g=>{const h=crypto.createHash('sha256');for(const [name,a]of [...Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b)),['index',g.index]]){h.update(name);h.update(String(a.itemSize));h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}return h.digest('hex');};
const attrsFor=(g,i)=>({part:g.attributes.characterPart.getX(i),pivot:[0,1,2].map(k=>g.attributes.characterPivot.array[i*3+k]),weight:g.attributes.characterWeight.getX(i),torsoWeight:g.attributes.characterTorsoWeight.getX(i)});
const position=(g,i)=>[0,1,2].map(k=>g.attributes.position.array[i*3+k]);
const normal=(g,i)=>[0,1,2].map(k=>g.attributes.normal.array[i*3+k]);
const deformed=(g,i,time)=>deformCharacterVertex(position(g,i),normal(g,i),attrsFor(g,i),{time,phase:0,amplitude:.7,walkSpeed:0,poseIndex:1}).position;

test('all 111 non-kang combinations retain exact typed geometry/index bytes',()=>{
 for(const id of Object.keys(current.CHARACTER_TEMPLATES))for(const pose of current.CHARACTER_POSES)for(const lod of [0,1,2])for(const seatVariant of pose==='seated'?['standard','raised-footstool','throne-front-perch']:['standard']){
  const a=active.createCharacterGeometry(id,pose,lod,{seatVariant}),b=frozen.createCharacterGeometry(id,pose,lod,{seatVariant}),actual=hashGeometry(a),expected=hashGeometry(b);report.nonKang.push({id,pose,lod,seatVariant,sha256:actual});assert.equal(actual,expected);assert.deepEqual(a.userData,b.userData);a.dispose();b.dispose();
 }
 for(const id of ['consort-daily','maid-daily'])for(const lod of [0,1,2]){const a=active.createCharacterGeometry(id,'standing',lod,{femalePose:'walking'}),b=frozen.createCharacterGeometry(id,'standing',lod,{femalePose:'walking'});report.nonKang.push({id,pose:'walking',lod,sha256:hashGeometry(a)});assert.equal(hashGeometry(a),hashGeometry(b));a.dispose();b.dispose();}
 assert.equal(report.nonKang.length,111);
});

test('all 21 kang combinations preserve head/arms/upper-body/pelvis bytes and protected topology',()=>{
 const byPart=(g,part)=>Array.from({length:g.attributes.position.count},(_,i)=>i).filter(i=>attrsFor(g,i).part===part);
 const subsetHash=(g,ids)=>{const h=crypto.createHash('sha256');for(const [name,a]of Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b))){h.update(name);for(const i of ids)h.update(Buffer.from(a.array.buffer,a.array.byteOffset+i*a.itemSize*4,a.itemSize*4));}return h.digest('hex');};
 const partTopology=(g,part)=>{const ids=byPart(g,part),map=new Map(ids.map((v,i)=>[v,i])),rows=[];for(let j=0;j<g.index.count;j+=3){const t=[0,1,2].map(k=>g.index.getX(j+k));if(t.every(i=>map.has(i)))rows.push(t.map(i=>map.get(i)).join(','));}return sha(rows.join(';'));};
 for(const id of Object.keys(current.CHARACTER_TEMPLATES))for(const lod of [0,1,2]){
  const a=active.createCharacterGeometry(id,'seated',lod,{seatVariant:'kang-low'}),b=frozen.createCharacterGeometry(id,'seated',lod,{seatVariant:'kang-low'}),parts=[];
  assert.deepEqual(a.userData.seatContact,b.userData.seatContact);assert.deepEqual(a.userData.seatPelvis,b.userData.seatPelvis);
  // Existing ribbon sampling depends on path length. Its lower-robe vertex
  // count changes, so compare each protected anatomical stream, not shifted
  // global vertex numbers. No geometric tolerance or rounding is used.
  for(const part of [0,1,2,3]){const ai=byPart(a,part),bi=byPart(b,part);assert.equal(ai.length,bi.length);const actual=subsetHash(a,ai),expected=subsetHash(b,bi);assert.equal(actual,expected,`${id}/L${lod}/part${part} raw bytes`);assert.equal(partTopology(a,part),partTopology(b,part));parts.push({part,vertices:ai.length,sha256:actual});}
  for(const part of [4,5]){const ai=byPart(a,part),bi=byPart(b,part);assert.equal(ai.length,bi.length);assert.equal(partTopology(a,part),partTopology(b,part));for(let j=0;j<ai.length;j++){const p=position(a,ai[j]),q=position(b,bi[j]);assert.equal(p[0],q[0]);assert.equal(p[2],q[2]);assert.ok(Math.abs(p[1]-q[1]-.02)<1e-7);assert.equal(attrsFor(a,ai[j]).torsoWeight,0);}}
  const ai=byPart(a,6),bi=byPart(b,6),upperA=ai.filter(i=>position(a,i)[1]>=.57),upperB=bi.filter(i=>position(b,i)[1]>=.57);assert.equal(upperA.length,upperB.length);assert.equal(subsetHash(a,upperA),subsetHash(b,upperB),'Lower-robe changes must not reach pelvis');
  const oldHash=hashGeometry(b),newHash=hashGeometry(a);assert.notEqual(oldHash,newHash,'Kang-low correction produces new bytes, not C1 bytes');
  report.kang.push({id,lod,oldSha256:oldHash,newSha256:newHash,protectedParts:parts,oldVertices:b.attributes.position.count,newVertices:a.attributes.position.count,oldTriangles:b.index.count/3,newTriangles:a.index.count/3,oldLowerRobeVertices:bi.length,newLowerRobeVertices:ai.length,topologyNote:'Existing lower-robe ribbon segment count can change with path length; protected anatomical streams and their local triangle indices remain exact.'});a.dispose();b.dispose();
 }
});

let hall,architecture;
function localHall(){if(hall)return;const zone=JSON.parse(fs.readFileSync(path.join(root,'data/zones/west-six.json'))),builder=new ZoneBase(library(),zone),start=performance.now();builder.buildHall(zone.items.find(i=>i.kind==='hall'&&i.name==='储秀宫'));hall=builder.kit.finish();hall.updateMatrixWorld(true);architecture=[];hall.traverse(m=>{if(m.isMesh)architecture.push(m)});report.contact.hallBuildMilliseconds=performance.now()-start;}
function hitAt(point){const ray=new THREE.Raycaster(new THREE.Vector3(...point).add(new THREE.Vector3(0,.10,0)),new THREE.Vector3(0,-1,0),.000001,.2);return ray.intersectObjects(architecture,false).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);}

test('actual Chuxiu hall triangles: feet .60→.62; unchanged seat 1.05 and full-cycle grounded sole/continuous robe',()=>{
 localHall();const g=active.createCharacterGeometry('consort-daily','seated',0,{seatVariant:'kang-low'}),old=frozen.createCharacterGeometry('consort-daily','seated',0,{seatVariant:'kang-low'}),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.position.set(100.22,.5599999523162842,438.16);mesh.rotation.y=Math.PI;mesh.updateMatrixWorld(true);
 const oldMesh=new THREE.Mesh(old,mesh.material);oldMesh.matrixWorld.copy(mesh.matrixWorld);const previous=lifeSoleContacts({mesh:oldMesh},architecture),now=lifeSoleContacts({mesh},architecture);report.contact.oldSoles=previous;report.contact.newSoles=now;report.contact.actorPosition=mesh.position.toArray();
 // Real floor is .62, not the underlying .60/.61 platform surfaces.
 for(const s of previous)for(const p of s.points)assert.ok(Math.abs(p.gapMeters+.02)<1e-6);
 for(const s of now)for(const p of s.points){assert.ok(Math.abs(p.surface.world[1]-.62)<1e-6);assert.ok(Math.abs(p.world[1]-.62)<1e-6);assert.ok(Math.abs(p.gapMeters)<1e-6,'Actual sole must touch visible floor, not penetrate by 20 mm');}
 const seat=[];for(let i=0;i<g.attributes.position.count;i++){const p=position(g,i);if(attrsFor(g,i).part===0&&Math.abs(p[1]-.49)<1e-6){const q=new THREE.Vector3(...p).applyMatrix4(mesh.matrixWorld),hit=hitAt(q.toArray());assert.ok(hit);assert.ok(Math.abs(hit.point.y-1.05)<1e-6);assert.ok(Math.abs(q.y-hit.point.y)<1e-6);seat.push({vertex:i,world:q.toArray(),surface:hit.object.name,contactY:hit.point.y});assert.equal(attrsFor(g,i).torsoWeight,0);}}
 assert.ok(seat.length>=28);report.contact.seatTrianglesContact=seat;
 const stationary=[];for(let i=0;i<g.attributes.position.count;i++){const at=attrsFor(g,i);if([4,5].includes(at.part)||(at.part===6&&position(g,i)[1]<=.52)){assert.equal(at.torsoWeight,0);stationary.push(i);}}
 // Seated parts 4/5/6 have no local animation branch, and torsoWeight=0
 // removes lean/breath for every real time, not merely at sample times.
 let maxDrift=0;for(let n=0;n<=256;n++)for(const i of stationary){const p=position(g,i),d=deformed(g,i,200*Math.PI*n/256);maxDrift=Math.max(maxDrift,...p.map((x,k)=>Math.abs(x-d[k])));}assert.ok(maxDrift<1e-14);
 // Actual main garment uses shared indexed rings. Closed edge incidence proves
 // no split seam/hole; connected lowest→waist shell, including repaired rings.
 const edges=new Map(),adj=new Map();for(let j=0;j<g.index.count;j+=3){const ids=[0,1,2].map(k=>g.index.getX(j+k));for(let k=0;k<3;k++){const u=ids[k],v=ids[(k+1)%3],key=[u,v].sort((a,b)=>a-b).join(',');edges.set(key,(edges.get(key)??0)+1);if(!adj.has(u))adj.set(u,new Set());adj.get(u).add(v);if(!adj.has(v))adj.set(v,new Set());adj.get(v).add(u);}}
 const connected=new Set([0]),queue=[0];for(let j=0;j<queue.length;j++)for(const v of adj.get(queue[j])??[])if(!connected.has(v)){connected.add(v);queue.push(v);}assert.ok([...connected].some(i=>position(g,i)[1]>.95));assert.ok([...connected].some(i=>position(g,i)[1]<.13));for(const [key,count]of edges){const [u,v]=key.split(',').map(Number);if(connected.has(u)&&connected.has(v))assert.equal(count,2,'Closed shared-index garment edge');}
 let transitionTriangles=0;for(let j=0;j<g.index.count;j+=3){const ids=[0,1,2].map(k=>g.index.getX(j+k));if(ids.every(i=>connected.has(i))&&ids.some(i=>position(g,i)[1]<.49)&&ids.some(i=>position(g,i)[1]>=.49)){transitionTriangles++;const [a,b,c]=ids.map(i=>new THREE.Vector3(...position(g,i)));assert.ok(new THREE.Triangle(a,b,c).getArea()>1e-8);}}
 assert.ok(transitionTriangles>=28);report.contact.idle={periodSeconds:200*Math.PI,samples:257,stationaryVertices:stationary.length,maxDrift,continuousTimeReason:'Seated shoes and affected lower-robe vertices have no local motion and exactly zero torsoWeight. All affected indexed triangles remain unchanged for every time.',closedConnectedShellVertices:connected.size,transitionTriangles};g.dispose();old.dispose();mesh.material.dispose();
});

test('actual deformed knee/lap palm triangles preserve contact throughout sampled common idle cycle',()=>{
 const N=1256;for(const id of ['consort-daily','maid-daily']){const audit=createFemaleIdleAudit(id,'kang-low',active.createCharacterGeometry);let hand=Infinity,palmMin=Infinity,palmMax=-Infinity,stack=Infinity;for(let n=0;n<=N;n++){const r=audit.measure({time:200*Math.PI*n/N,phase:0,amplitude:.7});hand=Math.min(hand,r.handMin);palmMin=Math.min(palmMin,r.palmMin);palmMax=Math.max(palmMax,r.palmMin);stack=Math.min(stack,r.stackMin);assert.ok(r.handMin>=0,`${id} skin intersects lap at ${r.time}`);assert.ok(r.palmMin>=0&&r.palmMin<.006);assert.ok(r.stackMin>=0&&r.stackMin<.003);}report.idle.push({id,samples:N+1,periodSeconds:200*Math.PI,handMinimum:hand,palmMinimum:palmMin,palmMaximum:palmMax,stackMinimum:stack,counts:audit.counts,kernelMaxError:audit.kernelMaxError,limitation:'Finite triangle-surface sampling, not a complete continuous-time triangle collision solver; unchanged upper/lap geometry and animation additionally preserve predecessor behavior.'});audit.dispose();}
});

test('real pool separates seatVariant/LOD, cancels partial preparation, and reuses current fixed geometry',()=>{
 const pool=new CharacterResourcePool();try{for(const lod of [0,1,2]){const canceled=pool.prepare('consort-daily','seated',lod,{seatVariant:'kang-low'});assert.equal(canceled.next().done,false);canceled.return();assert.equal(pool.entries.has(`consort-daily|seated|${lod}|kang-low`),false);const prepared=pool.prepare('consort-daily','seated',lod,{seatVariant:'kang-low'});let out;do{out=prepared.next();}while(!out.done);const a=pool.acquire('consort-daily','seated',lod,{seatVariant:'kang-low'}),standard=pool.acquire('consort-daily','seated',lod);assert.equal(a.geometry,out.value.geometry);assert.notEqual(a.key,standard.key);assert.notEqual(a.geometry,standard.geometry);const direct=current.createCharacterGeometry('consort-daily','seated',lod,{seatVariant:'kang-low'});assert.equal(hashGeometry(a.geometry),hashGeometry(direct));pool.release(a.key);const again=pool.acquire('consort-daily','seated',lod,{seatVariant:'kang-low'});assert.equal(again.geometry,a.geometry);const shoes=[];for(let i=0;i<a.geometry.attributes.position.count;i++)if([4,5].includes(attrsFor(a.geometry,i).part))shoes.push(position(a.geometry,i)[1]);assert.ok(Math.abs(Math.min(...shoes)-.06)<1e-7);report.cache.push({lod,key:a.key,geometrySha256:hashGeometry(a.geometry),minimumShoeY:Math.min(...shoes),cancellation:'No partial entry published',reacquired:'Same corrected geometry identity'});direct.dispose();pool.release(again.key);pool.release(standard.key);}}finally{pool.dispose();}
});
