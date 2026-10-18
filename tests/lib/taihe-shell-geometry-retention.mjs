import {preDaisFallbackView} from './r7-taihe-dais-fallback-retention.mjs';
// Finite historical view only. Validate live retained data before reinserting
// the exact retired faces; never normalize coordinates, materials or UVs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {read,decode} from './taihe-column-fixture.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const BASE_SHA='28d7a11dbeda023762c8c9eed44eb65c5f4c8270ddfb9d7088e40f6b6991399c';
const MASK_SHA='231113dd6726175be9de932cbf6c0a36fe7466e88e5910df6aa9660f49ba2079';
const FALLBACK_SHA='207179833e759953cb3b4e416b728db905b2748db0fe623820c5c33635aaba10';
const baseBytes=read('public/models/interiors/taihe-v17-display-28d7a11dbeda.glb');
const maskBytes=read('assets-src/interiors/taihe_caisson/retired_shell_faces.json');
const fixtureBytes=read('tests/fixtures/taihe-shell-fallback-retirement.json');
assert.equal(sha(baseBytes),BASE_SHA);assert.equal(sha(maskBytes),MASK_SHA);assert.equal(sha(fixtureBytes),FALLBACK_SHA);
const base=decode(baseBytes),mask=JSON.parse(maskBytes),fixture=JSON.parse(fixtureBytes);
const parts=new Set(mask.parts);assert.equal(parts.size,19);assert.equal(mask.triangles.length,320);
function grouped(triangles){
 const groups=new Map();for(const t of triangles){if(!groups.has(t.material))groups.set(t.material,[]);groups.get(t.material).push(t);}
 assert.deepEqual([...groups.values()].flat(),triangles,'material batches retain their original contiguous order');return groups;
}
const oldGroups=grouped(base.triangles),retired=new Map();
for(const row of mask.triangles){
 const ids=retired.get(row.material)??new Set();assert.ok(!ids.has(row.triangleOrdinal));ids.add(row.triangleOrdinal);retired.set(row.material,ids);
}
const retainedInventory=base.inventory.filter(row=>!parts.has(row.name));
assert.equal(base.inventory.length-retainedInventory.length,19);
let cached;
function context(){
 const bytes=read('docs/current-state/taihe-caisson/SOURCE-MANIFEST.json'),key=sha(bytes);
 if(cached?.key===key)return cached;
 const manifest=JSON.parse(bytes);assert.equal(manifest.schema,'taihe-caisson-shell-replacement-2','combined shell manifest is required');
 assert.equal(manifest.baselineSHA256,BASE_SHA);assert.equal(manifest.retirement.baselineSHA256,BASE_SHA);assert.equal(manifest.retirement.maskSHA256,MASK_SHA);
 assert.equal(manifest.retirement.removedTriangles,320);assert.deepEqual(manifest.retirement.retiredParts,mask.parts);
 assert.equal(manifest.identity.caissonShellMaskSHA256,MASK_SHA);assert.equal(manifest.identity.caissonBaseAssetSHA256,BASE_SHA);assert.equal(manifest.identity.caissonRemovedTriangles,320);
 const assetBytes=read(manifest.asset.path);assert.equal(sha(assetBytes),manifest.asset.sha256,'declared detail bytes');
 const reference=decode(assetBytes),referenceGroups=grouped(reference.triangles),additions=new Map();
 for(const row of manifest.accessorPrefixes.filter(row=>row.semantic==='POSITION')){
  assert.ok(['taihe_gold','taihe_dark_gold'].includes(row.material));assert.ok(!additions.has(row.material));assert.equal(row.addedBytes%36,0);assert.ok(row.addedBytes>0);additions.set(row.material,row.addedBytes/36);
 }
 assert.equal([...additions.values()].reduce((a,b)=>a+b,0),manifest.identity.caissonTriangles+manifest.identity.caissonShellTriangles,'only declared shell and dragon faces may form tails');
 assert.equal(reference.triangles.length,12128-320+[...additions.values()].reduce((a,b)=>a+b,0));
 const fallbackBytes=read(manifest.fallback.path);assert.equal(sha(fallbackBytes),manifest.fallback.sha256,'declared fallback bytes');
 const match=fallbackBytes.toString().match(/export const TAIHE_CAISSON_FALLBACK_DATA = (\[[\s\S]*\]);\s*$/);assert.ok(match);
 const fallbackRows=new Map();
 for(const row of JSON.parse(match[1])){
  const material={gold:'taihe_gold',darkGold:'taihe_dark_gold'}[row.material];assert.ok(material);assert.ok(!fallbackRows.has(material));
  const position=Buffer.from(row.position,'base64'),normal=Buffer.from(row.normal,'base64');assert.equal(position.length,normal.length);assert.equal(position.length%36,0);
  // mergeByMaterial bakes the identity frame too, including exact normal
  // normalization and signed-zero arithmetic. Reproduce that finite operation,
  // rather than weakening the actual appended-byte comparison with a tolerance.
  const geometry=new THREE.BufferGeometry();
  for(const [name,bytes]of Object.entries({position,normal})){const values=new Float32Array(bytes.length/4);for(let i=0;i<values.length;i++)values[i]=bytes.readFloatLE(i*4);geometry.setAttribute(name,new THREE.BufferAttribute(values,3));}
  geometry.applyMatrix4(new THREE.Matrix4());
  const baked=Object.fromEntries(['position','normal'].map(name=>{const a=geometry.attributes[name];return[name,Buffer.from(new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength))];}));
  fallbackRows.set(material,{...baked,vertices:position.length/12});geometry.dispose();
 }
 const added=[...fallbackRows.values()].reduce((sum,r)=>sum+r.vertices/3,0);
 assert.equal(manifest.fallback.retiredTriangles,48);assert.equal(added,manifest.fallback.addedTriangles);assert.equal(added,manifest.fallback.shellTriangles+manifest.fallback.dragonTriangles);
 cached={key,manifest,referenceGroups,additions,fallbackRows};return cached;
}
function checkContract(integrated,manifest){
 for(const [key,value]of Object.entries(base.contract))if(key!=='inventory')assert.deepEqual(integrated.contract[key],value,`retained contract ${key}`);
 for(const [key,value]of Object.entries(manifest.identity))assert.deepEqual(integrated.contract[key],value,`declared identity ${key}`);
 assert.deepEqual(Object.keys(integrated.contract).sort(),[...new Set([...Object.keys(base.contract),...Object.keys(manifest.identity)])].sort(),'no unrelated contract fields');
}
export function restoreHistoricalInventory(integrated){
 const {manifest}=context();checkContract(integrated,manifest);
 assert.deepEqual(JSON.parse(integrated.contract.inventory),integrated.inventory,'decoded inventory agrees with the contract');
 assert.deepEqual(integrated.inventory,[...retainedInventory,...manifest.appendedInventory],'only exact retired inventory members and declared additions differ');
 return structuredClone(base.inventory);
}
export function restoreHistoricalDetail(integrated){
 const {manifest,referenceGroups,additions}=context();restoreHistoricalInventory(integrated);
 const groups=grouped(integrated.triangles);assert.deepEqual([...groups.keys()],[...oldGroups.keys()]);
 const restored=[];
 for(const [material,old]of oldGroups){
  const removed=retired.get(material)??new Set(),actual=groups.get(material),kept=old.filter((_,i)=>!removed.has(i)),added=additions.get(material)??0;
  assert.equal(actual.length,kept.length+added,`${material}: exact retained and added counts`);
  assert.deepEqual(actual.slice(0,kept.length),kept,`${material}: every nonretired ordered face and attribute is exact`);
  assert.deepEqual(actual.slice(kept.length),referenceGroups.get(material).slice(kept.length),`${material}: only the manifest-bound appended tail is excluded`);
  let cursor=0;for(let i=0;i<old.length;i++)restored.push(removed.has(i)?structuredClone(old[i]):actual[cursor++]);
 }
 assert.equal(restored.length,12128);assert.equal(integrated.triangles.length,manifest.asset.renderableTriangles);
 return restored;
}
const attrBytes=(a,start,count)=>Buffer.from(a.array.buffer,a.array.byteOffset+start*a.itemSize*4,count*a.itemSize*4);
export function restoreHistoricalFallbackAttributes(mesh){
 mesh=preDaisFallbackView(mesh);
 const {fallbackRows}=context(),material=mesh.material?.name,record=fixture.perMaterial[material];assert.ok(record,'known original fallback material');
 const g=mesh.geometry;assert.equal(g.index,null,'fallback remains nonindexed');assert.equal(mesh.material.side,record.materialSide,'retained shared material side');
 assert.deepEqual(Object.keys(g.attributes).sort(),Object.keys(record.attributes).sort(),'no missing or foreign attributes');
 const removed=new Map(fixture.triangles.filter(row=>row.material===material).map(row=>[row.triangleOrdinal,row]));
 const keptVertices=record.preCaissonVertexCount-removed.size*3,added=fallbackRows.get(material),addedVertices=added?.vertices??0,result={};
 for(const [name,original]of Object.entries(record.attributes)){
  const a=g.attributes[name];assert.ok(a.array instanceof Float32Array);assert.equal(a.itemSize,original.itemSize);assert.equal(a.normalized,original.normalized);assert.equal(a.count,keptVertices+addedVertices,`${material}/${name}: exact retained and appended counts`);
  const tail=attrBytes(a,keptVertices,addedVertices);
  if(name==='position'||name==='normal')assert.deepEqual(tail,added?.[name]??Buffer.alloc(0),`${material}/${name}: exact generated shell/dragon tail`);
  else for(const value of a.array.slice(keptVertices*a.itemSize))assert.equal(value,name==='color'?1:0,`${material}/${name}: neutral appended ownership`);
  const pieces=[];let cursor=0;
  for(let i=0;i<record.preCaissonTriangleCount;i++){
   if(removed.has(i)){
    const saved=removed.get(i).attributes[name],bytes=Buffer.from(saved.bytesHex,'hex');assert.equal(sha(bytes),saved.sha256);assert.equal(bytes.length,3*a.itemSize*4);pieces.push(bytes);
   }else{pieces.push(attrBytes(a,cursor,3));cursor+=3;}
  }
  assert.equal(cursor,keptVertices);
  const restored=Buffer.concat(pieces);assert.equal(sha(restored),original.preCaissonSHA256,`${material}/${name}: every retained byte and its original order must survive`);
  const array=new Float32Array(record.preCaissonVertexCount*a.itemSize);for(let i=0;i<array.length;i++)array[i]=restored.readFloatLE(i*4);
  const attribute=new THREE.BufferAttribute(array,a.itemSize,a.normalized);assert.deepEqual(attrBytes(attribute,0,attribute.count),restored);result[name]=attribute;
 }
 return result;
}
