import {restoreHistoricalDetail,restoreHistoricalInventory,restoreHistoricalFallbackAttributes} from './taihe-shell-geometry-retention.mjs';
export {restoreHistoricalInventory};
import {restorePreColumnMaterialSource} from './taihe-column-material-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {read, decode, canonical, historicalCaissonCandidate as candidate} from './taihe-column-fixture.mjs';
import {captureTaiheControl} from './taihe-core-fixture.mjs';
// Historical display migration view; current furniture retention is checked separately.
export {read, candidate};
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export const baseline = JSON.parse(read('tests/fixtures/taihe-display-baseline.json'));
export const originalS = decode(read(baseline.SAsset));
export const materials = {gold:'taihe_gold',darkGold:'taihe_dark_gold',red:'taihe_lacquer',teal:'taihe_teal',dark:'taihe_dark_wood',stone:'taihe_stone',pearl:'taihe_pearl',glyph:'taihe_glyph_atlas'};
export const source = lod => JSON.parse(read(`assets-src/interiors/taihe_display/approved/artifacts/meshes-${lod}.json`));
export const coreImport = "import { appendTaiheDisplayPairs } from './TaiheDisplayPairs.js';\n";
export const coreAppend = '  appendTaiheDisplayPairs(g,m);\n';
export function restoreCore(bytes) {
  let s = restorePreColumnMaterialSource('src/scene/palace/special/TaiheCore.js',bytes).toString();
  for (const insertion of [coreImport,coreAppend]) {
    assert.equal(s.split(insertion).length,2,'exactly one bounded display insertion');
    s=s.replace(insertion,'');
  }
  assert.equal(digest(s),'0b9b0a9fdbcf039dda092342030e6dba303d28e1565403f4a9025d2953813384','all original fallback source bytes are frozen');
  return Buffer.from(s);
}
export function splitS(integrated = candidate) {
  const expected=new Map();
  for(const t of originalS.triangles){const k=canonical(t);expected.set(k,(expected.get(k)??0)+1);}
  const original=[],display=[];
  for(const t of restoreHistoricalDetail(integrated)){const k=canonical(t);if(expected.get(k)){expected.set(k,expected.get(k)-1);original.push(t);}else display.push(t);}
  assert.equal([...expected.values()].reduce((a,b)=>a+b,0),0,'every original V17 triangle and attribute survives exactly');
  assert.equal(original.length,8330);
  assert.equal(display.length,3798);
  return {original,display};
}
export function inScene(triangles, decoded = candidate) {
  const transforms=new Map();
  for(const node of decoded.gltf.nodes.filter(n=>n.mesh!==undefined)){
    // This asset is deliberately flat. Fail closed if an exporter adds a parent
    // transform rather than silently omitting it in scene-space checks.
    assert.ok(decoded.gltf.scenes[decoded.gltf.scene??0].nodes.includes(decoded.gltf.nodes.indexOf(node)));
    const matrix=new THREE.Matrix4();
    if(node.matrix)matrix.fromArray(node.matrix);else matrix.compose(new THREE.Vector3(...(node.translation??[0,0,0])),new THREE.Quaternion(...(node.rotation??[0,0,0,1])),new THREE.Vector3(...(node.scale??[1,1,1])));
    for(const p of decoded.gltf.meshes[node.mesh].primitives){const name=decoded.gltf.materials[p.material].name;assert.ok(!transforms.has(name));transforms.set(name,matrix);}
  }
  return triangles.map(t=>({...t,vertices:t.vertices.map(v=>({...v,POSITION:new THREE.Vector3(...v.POSITION).applyMatrix4(transforms.get(t.material)).toArray(),NORMAL:new THREE.Vector3(...v.NORMAL).applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(transforms.get(t.material))).toArray()}))}));
}
export function fallbackSnapshot() {
  const control=captureTaiheControl('太和殿'),liveMeshes=control.group.children.filter(o=>o.userData.taiheCoreOwner),original=[],display=[];
  // Historical test-only clones retain live material identity and metadata.
  // Validation happens against live arrays before exact retired faces return.
  const meshes=liveMeshes.map(live=>{const mesh=live.clone(false);mesh.geometry=live.geometry.clone();mesh.geometry.attributes=restoreHistoricalFallbackAttributes(live);return mesh;});
  for(const mesh of meshes){const record=baseline.fallback.find(r=>r.name===mesh.material.name),g=mesh.geometry;assert.ok(record);assert.equal(g.index,null);
    const first=record.attributes.position.count;
    const retainedCount=g.attributes.position.count;
    for(let i=0;i<retainedCount;i+=3){const t={material:mesh.material.name,vertices:[0,1,2].map(k=>Object.fromEntries(Object.entries(g.attributes).map(([name,a])=>[({position:'POSITION',normal:'NORMAL',uv:'TEXCOORD_0',color:'COLOR_0'})[name],Array.from(a.array.slice((i+k)*a.itemSize,(i+k+1)*a.itemSize))])))};(i<first?original:display).push(t);}
  }
  return {control,meshes,original,display};
}
export function expectedFaces(lod) {
  return source(lod).assemblies.flatMap(item=>item.local_mesh.triangles.map((ids,id)=>({
    assembly:item.id,family:item.family,id,component:item.local_mesh.components[id],material:materials[item.local_mesh.materials[id]],
    vertices:ids.map(j=>({POSITION:item.local_mesh.vertices[j].map((v,k)=>v+item.translation[k]),NORMAL:item.local_mesh.triangle_normals[id]}))
  })));
}
export function matchSource(actual,lod,epsilon=2e-6) {
  const expected=expectedFaces(lod),used=new Set(),matched=[];
  assert.equal(actual.length,expected.length);
  const near=(a,b)=>a.every((v,k)=>Math.abs(v-b[k])<=epsilon);
  for(const e of expected){let found=-1,offset=0;
    for(let i=0;i<actual.length;i++)if(!used.has(i)&&actual[i].material===e.material){
      for(let k=0;k<3;k++)if(e.vertices.every((v,j)=>near(v.POSITION,actual[i].vertices[(j+k)%3].POSITION))){found=i;offset=k;break;}
      if(found>=0)break;
    }
    assert.ok(found>=0,`${lod}: missing oriented scene-space source face ${e.assembly}/${e.id}/${e.component}`);
    used.add(found);matched.push({...e,vertices:e.vertices.map((_,k)=>actual[found].vertices[(k+offset)%3])});
  }
  return matched;
}
export function triangleNormal(t) {const [a,b,c]=t.vertices.map(v=>new THREE.Vector3(...v.POSITION));return new THREE.Triangle(a,b,c).getNormal(new THREE.Vector3());}

export function validateNormals(faces) {
  for(const t of faces){const expected=triangleNormal(t);assert.ok(expected.length()>.999999);
    for(const v of t.vertices){assert.ok([...v.POSITION,...v.NORMAL].every(Number.isFinite));const n=new THREE.Vector3(...v.NORMAL);assert.ok(Math.abs(n.length()-1)<2e-6,'finite unit face normal');assert.ok(n.dot(expected)>.99999,'normal agrees with winding');}
    for(const v of t.vertices.slice(1))assert.deepEqual(v.NORMAL,t.vertices[0].NORMAL,'normals remain flat');
  }
}
