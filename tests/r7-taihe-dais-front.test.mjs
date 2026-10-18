import {restorePreR9Architecture} from './lib/r9-architecture-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import * as THREE from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {captureTaiheControl} from './lib/taihe-core-fixture.mjs';import {CollisionManager} from '../src/utils/Collision.js';import {PLAYER} from '../src/config/constants.js';import P from '../data/architecture/taihe-core.json' with {type:'json'};import D from '../data/architecture/taihe-dais-front.json' with {type:'json'};import cfg from '../data/interiors/taihe.json' with {type:'json'};import manifest from '../docs/current-state/taihe-dais-front/SOURCE-MANIFEST.json' with {type:'json'};import {validateTaiheCore} from '../src/scene/interior/TaiheCoreContract.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url));const sha=b=>createHash('sha256').update(b).digest('hex');
const asset=read('public'+cfg.model);const load=async()=>new GLTFLoader().parseAsync(asset.buffer.slice(asset.byteOffset,asset.byteOffset+asset.length),'');
function setup(){const s=captureTaiheControl('太和殿'),cm=new CollisionManager();cm.addColliders(s.builder.colliders);cm.addWalkables(s.builder.walkables);cm.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(-31.5,0,-18.5),new THREE.Vector3(31.5,P.frame.floorY,18.5))});return{...s,cm};}
test('new front has three flights and four separately evidenced incense tables with honest dimension/date limits',()=>{assert.equal(D.frontFlights.length,3);assert.deepEqual(D.incenseTables.x,[-3.34,-1.45,1.45,3.34]);assert.match(D.status,/provisional/);assert.ok(D.sources.every(s=>s.startsWith('https://')&&s.includes('dpm.org.cn')));assert.match(D.limits.join(' '),/1900.*2026/);assert.match(D.limits.join(' '),/lateral.*unresolved/);assert.equal(P.dais.width,7.2);assert.equal(P.dais.z0,7.06);assert.equal(P.frame.floorY,9.9375);});
test('actual fine asset accepts exact new identities and retains original eight batches and budgets',async()=>{assert.equal(sha(asset),cfg.asset.sha256);assert.equal(sha(asset),manifest.asset.sha256);assert.equal(asset.length,cfg.asset.encodedBytes);assert.equal(manifest.asset.visibleTriangles,17924);const root=(await load()).scene;assert.deepEqual(validateTaiheCore(root,cfg),{triangles:17924,meshes:8});assert.ok(17924+60<=18000);for(const key of Object.keys(manifest.identity)){const c=structuredClone(cfg);delete c.asset[key];assert.throws(()=>validateTaiheCore(root,c),/dais front/);}});
test('real coarse fallback is exactly1600 triangles/eight owners, with no new material or texture',()=>{const s=setup();try{const b=s.group.children.filter(m=>m.userData.taiheCoreOwner);assert.equal(b.length,8);assert.equal(new Set(b.map(m=>m.material)).size,8);assert.equal(b.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),1600);assert.equal(P.budgets.fallbackVisibleTriangles,1600);assert.equal(P.budgets.sVisibleTriangles,18000);}finally{s.builder.dispose();}});
for(const fps of [60,10])for(const speed of [PLAYER.MOVE_SPEED,PLAYER.SPRINT_SPEED])for(const f of D.frontFlights)test(`actual controller steps approach and return x${f.x} fps${fps} speed${speed}`,()=>{const s=setup();try{const cm=s.cm,feet=P.frame.floorY;let p=new THREE.Vector3(f.x,feet+PLAYER.HEIGHT,3.4);assert.equal(cm.checkCollision(p,.5),false);let highest=feet;for(const goal of [6.25,3.4]){let frames=0;while(Math.abs(p.z-goal)>1e-5&&frames++<3000){const dz=Math.sign(goal-p.z)*Math.min(speed/fps,Math.abs(goal-p.z));p=cm.getValidPosition(p,p.clone().add(new THREE.Vector3(0,0,dz)),.5,p.y-PLAYER.HEIGHT);assert.equal(cm.checkCollision(p,.5),false);highest=Math.max(highest,p.y-PLAYER.HEIGHT);}assert.ok(Math.abs(p.z-goal)<1e-5,`blocked ${p.z} before ${goal}`);}assert.ok(highest>feet+1.4);assert.ok(Math.abs(p.y-PLAYER.HEIGHT-feet)<1e-6);}finally{s.builder.dispose();}});
test('tables and actual rail locations remain solid; throne platform remains closed',()=>{const s=setup();try{for(const x of D.incenseTables.x)assert.equal(s.cm.checkCollision(new THREE.Vector3(x,P.frame.floorY+PLAYER.HEIGHT,D.incenseTables.z),.5),true);for(const x of D.railX)assert.equal(s.cm.checkCollision(new THREE.Vector3(x,P.frame.floorY+PLAYER.HEIGHT,4.2),.5),true);assert.equal(s.cm.checkCollision(new THREE.Vector3(0,P.frame.floorY+P.dais.height+PLAYER.HEIGHT,10),.5),true);}finally{s.builder.dispose();}});
test('center cover support follows the actual independent sheet, never a rescue teleport',()=>{const s=setup();try{const toe=P.dais.z0-P.dais.steps*P.dais.stepRun,end=P.dais.z0-P.dais.stepRun;for(const t of [0,.2,.5,.8,1]){const z=toe+t*(end-toe),h=P.frame.floorY+P.dais.height/P.dais.steps+D.cover.offset+t*(P.dais.height-P.dais.height/P.dais.steps);assert.ok(Math.abs(s.cm.getGroundHeight(0,z,h,.01)-h)<1e-7);}const faces=s.cm.walkables.filter(w=>w.type==='box'&&w.box.min.z>=toe-1e-7&&w.box.max.z<=P.dais.z0+1e-7);assert.equal(faces.filter(w=>w.rescue===false).length,21);}finally{s.builder.dispose();}});

const decode=b=>{const n=b.readUInt32LE(12),g=JSON.parse(b.toString('utf8',20,20+n));return{g,views:g.bufferViews.map(v=>b.subarray(28+n+(v.byteOffset??0),28+n+(v.byteOffset??0)+v.byteLength))};};
const indices=(d,p)=>{const a=d.g.accessors[p.indices],b=d.views[a.bufferView],w=a.componentType===5123?2:4;return Array.from({length:a.count},(_,i)=>w===2?b.readUInt16LE(i*w):b.readUInt32LE(i*w));};
function verifyRetained(currentBytes){
 const baseBytes=read('public/models/interiors/taihe-furnishing-surfaces-a4a0b82f9f76.glb');assert.equal(sha(baseBytes),manifest.baselineSHA256);
 const maskBytes=read('assets-src/interiors/taihe_dais/retirement-mask.json');assert.equal(sha(maskBytes),manifest.identity.daisFrontMaskSHA256);
 const mask=JSON.parse(maskBytes),old=decode(baseBytes),now=decode(currentBytes);assert.equal(mask.triangles.length,744);
 assert.deepEqual(now.g.materials,old.g.materials);assert.deepEqual(now.g.images,old.g.images);assert.deepEqual(now.g.textures,old.g.textures);
 assert.equal(now.g.meshes.length,old.g.meshes.length);
 for(let i=0;i<old.g.meshes.length;i++){
  const p=old.g.meshes[i].primitives[0],q=now.g.meshes[i].primitives[0],name=old.g.materials[p.material].name;
  assert.equal(q.material,p.material);assert.deepEqual(Object.keys(q.attributes).sort(),Object.keys(p.attributes).sort());
  for(const key of Object.keys(p.attributes)){
   const a=old.g.accessors[p.attributes[key]],b=now.g.accessors[q.attributes[key]],before=old.views[a.bufferView],after=now.views[b.bufferView];
   assert.equal(b.componentType,a.componentType);assert.equal(b.type,a.type);assert.ok(after.subarray(0,before.length).equals(before),`${name}/${key}: every old attribute byte retained`);
  }
  const ids=indices(old,p),current=indices(now,q),rows=mask.triangles.filter(r=>r.material===name),retired=new Set(rows.map(r=>r.triangleOrdinal));
  for(const row of rows)assert.deepEqual(ids.slice(row.triangleOrdinal*3,row.triangleOrdinal*3+3),row.indices);
  const kept=ids.filter((_,j)=>!retired.has(Math.floor(j/3)));
  assert.deepEqual(current.slice(0,kept.length),kept,`${name}: retained ordered faces`);
  if(!['taihe_lacquer','taihe_dark_gold','taihe_teal','taihe_gold'].includes(name))assert.equal(current.length,kept.length);
  else assert.ok(current.slice(kept.length).every(v=>v>=old.g.accessors[p.attributes.POSITION].count),'new faces own only appended vertices');
 }
}
test('all nonretired S attributes, indices, materials and registration remain exact',()=>verifyRetained(asset));
test('retention rejects unrelated attribute mutation even at unchanged vertex count',()=>{
 const d=decode(asset),p=d.g.meshes.find(m=>d.g.materials[m.primitives[0].material].name==='taihe_gold').primitives[0],a=d.g.accessors[p.attributes.POSITION],v=d.g.bufferViews[a.bufferView];const bad=Buffer.from(asset),offset=28+bad.readUInt32LE(12)+v.byteOffset;bad.writeFloatLE(bad.readFloatLE(offset)+.1,offset);assert.throws(()=>verifyRetained(bad));
});
test('every new identity rejects missing or altered asset and registry values',async()=>{
 for(const key of Object.keys(manifest.identity))for(const target of ['asset','registry'])for(const mutation of ['missing','changed']){
  const scene=(await load()).scene,c=structuredClone(cfg),subject=target==='asset'?scene.getObjectByName('TAIHE_CORE_CONTRACT').userData:c.asset;
  if(mutation==='missing')delete subject[key];else subject[key]=typeof subject[key]==='number'?subject[key]+1:!subject[key];assert.throws(()=>validateTaiheCore(scene,c),/dais front/);
 }
});
test('finite source migration restores only its enumerated changes and rejects drift',async()=>{
 const {restorePreTaiheDaisSource}=await import('./lib/r7-taihe-dais-retention.mjs'),delta=JSON.parse(read('tests/fixtures/r7-taihe-dais-source-delta.json'));
 for(const[path,row]of Object.entries(delta.files)){const {restorePreIncenseSource}=await import('./lib/r8-incense-retention.mjs');const current=restorePreIncenseSource(path,restorePreR9Architecture(path,read(path)));assert.equal(sha(restorePreTaiheDaisSource(path,current)),row.baselineSHA256);assert.throws(()=>restorePreTaiheDaisSource(path,Buffer.concat([current,Buffer.from('\n')])));for(const h of row.deltas){assert.equal(current.toString().split(h.after).length,2,'negative mutation must actually change one exact hunk');assert.throws(()=>restorePreTaiheDaisSource(path,Buffer.from(current.toString().replace(h.after,h.after+h.after))));}}
});
test('CPU generator reproduces actual GLB, fallback and manifest byte-for-byte in an isolated output folder',async()=>{
 const {spawnSync}=await import('node:child_process'),os=await import('node:os'),path=await import('node:path');const out=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-dais-rebuild-'));
 try{const r=spawnSync('python3',['assets-src/interiors/taihe_dais/build.py',out],{cwd:new URL('../',import.meta.url),encoding:'utf8',timeout:10000});assert.equal(r.status,0,r.stderr);
 for(const p of [manifest.asset.path,'src/scene/palace/special/TaiheDaisFallbackData.js','docs/current-state/taihe-dais-front/SOURCE-MANIFEST.json'])assert.ok(fs.readFileSync(path.join(out,p)).equals(read(p)),p);
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
test('generated staircase solids are closed, outward, nondegenerate with exact tread volumes at both LODs',async()=>{
 const {spawnSync}=await import('node:child_process');const r=spawnSync('python3',['tests/lib/check-taihe-dais-geometry.py'],{cwd:new URL('../',import.meta.url),encoding:'utf8',timeout:5000});assert.equal(r.status,0,r.stderr);const p=JSON.parse(r.stdout);assert.equal(p.S.closedFrontFlights,3);assert.equal(p.B.separateTables,4);
});
