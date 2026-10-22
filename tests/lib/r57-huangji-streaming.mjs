/** Test/report adapter for exact Huangji bytes, not production loader code.
 * Uses real GLTFLoader plus the repository's pinned Draco CPU decoder. No
 * flattening, recomputed normals, recreated materials, texture or network I/O.
 * Call B before S on the SAME world/loader. Reset explicitly only across a
 * separately audited ZoneManager unload/rebind, never to excuse an S delta. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {cpuDracoLoader} from './cpu-draco.mjs';
import {HUANGJI_COLUMN_SEGMENTS} from '../../src/scene/interior/HuangjiColumnSafety.js';

const ROOT = new URL('../../', import.meta.url);
export const HUANGJI_CONFIG = JSON.parse(fs.readFileSync(new URL('data/interiors/huangji.json', ROOT)));
export const HUANGJI_SHA256 = '0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6';
const MODEL = '/models/interiors/huangji-aligned-0a79ec49e8cd.glb';
const TAG = 'interior:huangji', ROLE = 'huangji-kit-throne-fallback';
const hash = value => createHash('sha256').update(Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
const boxJSON = box => ({min:box.min.toArray(), max:box.max.toArray()});
const bytes = fs.readFileSync(new URL(`public${HUANGJI_CONFIG.model}`, ROOT));
assert.equal(HUANGJI_CONFIG.model, MODEL, 'configured final aligned Huangji asset');
assert.equal(hash(bytes), HUANGJI_SHA256, 'exact configured Huangji bytes');
const gltfJSON = JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
assert.equal(gltfJSON.images?.length ?? 0, 0, 'adapter does not test texture I/O');
assert.equal(gltfJSON.textures?.length ?? 0, 0, 'adapter does not test texture I/O');
let decoder;
export async function actualHuangjiRoot() {
 decoder ??= cpuDracoLoader().then(draco => new GLTFLoader().setDRACOLoader(draco));
 // Each parse owns fresh resources; cloning a cached root would share resources
 // with an earlier generation that InteriorLoader correctly disposes.
 return (await (await decoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength), '')).scene;
}
function attributeRow(attribute) {
 assert.equal(attribute.isInterleavedBufferAttribute ?? false, false, 'unexpected interleaved source attributes');
 const a=attribute.array;
 return {itemSize:attribute.itemSize, count:attribute.count, normalized:attribute.normalized,
  type:a.constructor.name, sha256:hash(Buffer.from(a.buffer,a.byteOffset,a.byteLength))};
}
function materialRow(material) {
 // Material.toJSON contains every serializable PBR and raster-state setting.
 // UUID and generator metadata are instance identity, not material semantics.
 const value=material.toJSON(); delete value.uuid; delete value.metadata;
 assert.equal(value.textures,undefined,'texture rendering is outside this CPU audit');
 assert.equal(value.images,undefined,'texture rendering is outside this CPU audit');
 return value;
}
function geometryRow(geometry) {
 return {attributes:Object.fromEntries(Object.keys(geometry.attributes).sort().map(k=>[k,attributeRow(geometry.attributes[k])])),
  index:geometry.index ? attributeRow(geometry.index) : null,
  groups:geometry.groups, drawRange:{start:geometry.drawRange.start,count:Number.isFinite(geometry.drawRange.count)?geometry.drawRange.count:'Infinity'},
  morphAttributes:Object.fromEntries(Object.keys(geometry.morphAttributes).sort().map(k=>[k,geometry.morphAttributes[k].map(attributeRow)])), morphTargetsRelative:geometry.morphTargetsRelative};
}
export function huangjiRootSignature(root) {
 assert.ok(root?.isObject3D, 'actual Huangji scene required');
 root.updateMatrixWorld(true);
 const walk=node=>({name:node.name,type:node.type,matrix:node.matrix.toArray(),userData:node.userData,
  ...(node.isMesh?{geometry:geometryRow(node.geometry),materials:[].concat(node.material).map(materialRow)}:{}),children:node.children.map(walk)});
 // Local transforms retain the glTF scene hierarchy but exclude the loader's
 // outer world frame. Proxy visibility/shadow flags are intentionally runtime.
 return hash(walk(root));
}
function proxyRows(root) {
 root.updateMatrixWorld(true);const rows=[];
 root.traverse(o=>{if(o.isMesh&&/^(COL_|WALK_)/.test(o.name))rows.push({name:o.name,...boxJSON(new THREE.Box3().setFromObject(o))});});
 return rows;
}
let referencePromise;
async function reference() {
 referencePromise ??= (async()=>{
  const root=await actualHuangjiRoot();
  const value={signature:huangjiRootSignature(root),localProxies:proxyRows(root),meshCount:0,renderableTriangles:0};
  const resources=new Set();
  root.traverse(o=>{if(o.isMesh){value.meshCount++;if(!/^(COL_|WALK_)/.test(o.name))value.renderableTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;resources.add(o.geometry);[].concat(o.material).forEach(m=>resources.add(m));}});
  resources.forEach(r=>r.dispose());return value;
 })(); return referencePromise;
}
function nonSRows(cm) {
 return {colliders:cm.colliders.filter(c=>c.tag!==TAG).map(c=>({tag:c.tag,...boxJSON(c.box)})),
  walkables:cm.walkables.filter(w=>w.tag!==TAG).map(w=>w.type==='box'?{tag:w.tag,type:w.type,rescue:w.rescue,...boxJSON(w.box)}:{...w})};
}
const baselines=new WeakMap();
export function resetHuangjiAuditBaseline(W) {
 assert.equal(W.cm.colliders.filter(c=>c.tag===TAG).length,0,'reset only after S unloaded');
 assert.equal(W.cm.walkables.filter(w=>w.tag===TAG).length,0,'reset only after S unloaded');
 assert.equal(W.scene.getObjectByName(TAG),undefined,'reset only after S scene detached');
 baselines.delete(W);
}
function fallbacks(scene) {
 const found=[];scene.traverse(o=>{if(o.isMesh&&o.userData.role===ROLE)found.push(o);});
 assert.equal(found.length,4,'four actual Huangji fallback meshes must be resident');
 assert.deepEqual(found.map(o=>o.userData.fallbackPart).sort(),['back','dais','screen','seat'],'exact fallback parts');
 for(const o of found){assert.equal(o.userData.catalogId,'place-ningshou-b607aa467b','fallback identity');assert.equal(o.userData.noMerge,true,'fallback cannot be a shared material batch');}
 return found;
}
function fallbackSignature(mesh) {
 mesh.updateMatrixWorld(true);
 return hash({matrix:mesh.matrix.toArray(),geometry:geometryRow(mesh.geometry),materials:[].concat(mesh.material).map(x=>{const value=x.toJSON();delete value.uuid;delete value.metadata;return value;})});
}
function captureBaseline(W) {
 const meshes=fallbacks(W.scene);
 assert.ok(meshes.every(m=>m.visible),'capture only visible B fallback');
 return {rows:nonSRows(W.cm), colliderRefs:W.cm.colliders.filter(c=>c.tag!==TAG),walkableRefs:W.cm.walkables.filter(w=>w.tag!==TAG),
  fallback:meshes.map(m=>({mesh:m,parent:m.parent,geometry:m.geometry,material:m.material,signature:fallbackSignature(m)})),
  floorY:W.cm.getGroundHeight(HUANGJI_CONFIG.frame.x,HUANGJI_CONFIG.frame.z,0,999)};
}
function assertBaseline(W,baseline) {
 assert.deepEqual(nonSRows(W.cm),baseline.rows,'B collision and support registrations remain exact');
 const actualC=W.cm.colliders.filter(c=>c.tag!==TAG),actualW=W.cm.walkables.filter(w=>w.tag!==TAG);
 for(const [actual,expected] of [[actualC,baseline.colliderRefs],[actualW,baseline.walkableRefs]]){assert.equal(actual.length,expected.length);actual.forEach((record,i)=>assert.equal(record,expected[i],'B collision and support ownership remains exact'));}
 const current=fallbacks(W.scene);
 for(const r of baseline.fallback){assert.ok(current.includes(r.mesh),'same actual fallback identity');assert.equal(r.mesh.parent,r.parent,'fallback parent retained');assert.equal(r.mesh.geometry,r.geometry);assert.equal(r.mesh.material,r.material);assert.equal(fallbackSignature(r.mesh),r.signature,'fallback geometry/material semantics retained');}
}
function transformProxy(row, matrix) {
 return {name:row.name,...boxJSON(new THREE.Box3(new THREE.Vector3(...row.min),new THREE.Vector3(...row.max)).applyMatrix4(matrix))};
}
function boxKey(row){return JSON.stringify({min:row.min,max:row.max});}

export async function auditHuangjiLoadedInWorld(W, {interiors,layer}) {
 assert.ok(layer==='B'||layer==='S','explicit B or S layer required');
 assert.equal(interiors.cm,W.cm,'same production CollisionManager');assert.equal(interiors.scene,W.scene,'same production world scene');
 const h=interiors.halls.get('huangji');assert.ok(h,'Huangji registered in supplied loader');assert.deepEqual(h.cfg,HUANGJI_CONFIG,'exact configured Huangji registry data');
 if(!baselines.has(W)){assert.equal(layer,'B','capture B before installing S');baselines.set(W,captureBaseline(W));}
 const baseline=baselines.get(W);assertBaseline(W,baseline);
 const colliders=W.cm.colliders.filter(c=>c.tag===TAG),walkables=W.cm.walkables.filter(w=>w.tag===TAG);
 if(layer==='B'){
  assert.equal(colliders.length,0);assert.equal(walkables.length,0);assert.equal(h.group,null);assert.notEqual(h.state,'loaded');
  assert.equal(W.scene.getObjectByName(TAG),undefined);assert.ok(baseline.fallback.every(r=>r.mesh.visible),'all four actual B fallback meshes restored');
  return {layer,colliders:0,walkables:0,BPreserved:true,BRegistrationSignature:hash(baseline.rows),BCounts:{colliders:baseline.rows.colliders.length,walkables:baseline.rows.walkables.length}};
 }
 assert.equal(h.state,'loaded');assert.equal(Boolean(h.fade),false,'Huangji is an atomic swap, not a timed fade');
 assert.equal(h.group.parent,W.scene);assert.equal(h.group.visible,true);assert.ok(baseline.fallback.every(r=>!r.mesh.visible),'only actual fallback parts replaced');
 assert.deepEqual(new Set(h.fallback),new Set(baseline.fallback.map(r=>r.mesh)));
 const roots=h.group.children.filter(o=>!o.isLight);assert.equal(roots.length,1,'exactly one decoded source scene');const root=roots[0],expected=await reference();
 const signature=huangjiRootSignature(root);assert.equal(signature,expected.signature,'actual Huangji hierarchy/geometry/materials, not matching labels or counts');
 assert.equal(expected.meshCount,15);assert.equal(expected.renderableTriangles,24024);assert.equal(interiors.history.huangji.tris,24024);
 const frame=HUANGJI_CONFIG.frame,anchor=HUANGJI_CONFIG.anchor;
 assert.deepEqual(h.group.position.toArray(),[frame.x+anchor.x,baseline.floorY+anchor.y,frame.z+anchor.z]);assert.equal(h.group.rotation.y,frame.rot??0);
 h.group.updateMatrixWorld(true);
 const sourceProxies=expected.localProxies.map(r=>transformProxy(r,h.group.matrixWorld));
 const slices=HUANGJI_COLUMN_SEGMENTS.map(([,x0,y0,z0,x1,y1,z1])=>boxJSON(new THREE.Box3(new THREE.Vector3(x0,Math.max(0,y0-.05),z0),new THREE.Vector3(x1,y1,z1)).applyMatrix4(h.group.matrixWorld)));
 const expectedC=[...sourceProxies.filter(r=>r.name.startsWith('COL_')),...slices];
 assert.equal(colliders.length,53,'five actual COL proxies plus 48 production column slices');assert.equal(walkables.length,1,'one actual WALK_dais_low support');
 assert.deepEqual(colliders.map(c=>boxKey(boxJSON(c.box))).sort(),expectedC.map(boxKey).sort(),'exact installed proxy and column-safety geometry');
 assert.deepEqual(walkables.map(w=>boxKey(boxJSON(w.box))),sourceProxies.filter(r=>r.name.startsWith('WALK_')).map(boxKey),'exact installed decoded walk support');
 assert.equal(walkables[0].type,'box');assert.equal(walkables[0].rescue,false,'S support cannot manufacture upward rescue');
 for(const r of sourceProxies)assert.equal(root.getObjectByName(r.name).visible,false,'decoded proxy hidden, not removed');
 const actualProxies=proxyRows(root);assert.deepEqual(actualProxies,sourceProxies,'source hierarchy placement retained');
 return {layer,model:MODEL,assetSHA256:HUANGJI_SHA256,encodedBytes:bytes.length,meshCount:expected.meshCount,renderableTriangles:expected.renderableTriangles,
  loadedRootSignature:signature,proxySignature:hash(actualProxies),registeredColliderSignature:hash(colliders.map(c=>boxJSON(c.box))),
  colliders:colliders.length,walkables:walkables.length,proxyRows:actualProxies,floorY:baseline.floorY,atomicSwap:true,fadeActive:false,BPreserved:true,
  BRegistrationSignature:hash(baseline.rows),delta:{colliders:53,walkables:1,visibleFallbacks:-4,ownedSceneGroups:1}};
}
