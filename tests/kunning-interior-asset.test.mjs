import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import crypto from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root));
const cfg = JSON.parse(read('data/interiors/kunning.json'));
const source = read('assets-src/interiors/kunning.py').toString();
test('Kunning source consumes shared profile and contains no authored architectural grid or structural exports', () => {
  assert.match(source, /data.*architecture.*kunning\.json/);
  assert.doesNotMatch(source, /BW\s*=|W\s*\/\s*9|def (partition|windows|board_door)\(/);
  assert.doesNotMatch(source, /gold_floor\(/);
  assert.match(source, /export_extras=True/);
  assert.match(source, /b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a/);
});
test('Kunning manifest points to content-versioned GLB with exact checksum and original budgets', () => {
  assert.match(cfg.model, /\/kunning-v6-[a-f0-9]{12}\.glb$/);
  const bytes = read(`public${cfg.model}`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), cfg.asset.sha256);
  assert.equal(cfg.asset.encodedBytes, bytes.length);
  assert.equal(crypto.createHash('sha256').update(bytes.subarray(28+bytes.readUInt32LE(12))).digest('hex'),cfg.asset.geometryBinSHA256);
  assert.deepEqual(cfg.budget, { tris: 400000, textureMB: 8 });
});

const profile = JSON.parse(read('data/architecture/kunning.json'));
function parseGLB() {
  const bytes = read(`public${cfg.model}`);
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
  const size = bytes.readUInt32LE(12);
  return JSON.parse(bytes.toString('utf8', 20, 20 + size));
}
test('actual exported GLB has profile extras, furniture-only inventory and no font/photo/texture payload', () => {
  const gltf = parseGLB();
  const contracts = gltf.nodes.filter(n => n.name === 'KUNNING_CONTRACT');
  assert.equal(contracts.length, 1);
  const c = contracts[0].extras;
  assert.deepEqual([c.profileId,c.profileRevision,c.profileHash,c.ownership], [profile.profileId,profile.revision,profile.profileHash,'furniture-only']);
  assert.equal(c.sourceSHA256, crypto.createHash('sha256').update(source).digest('hex'));
  assert.equal(c.fontSHA256, 'b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a');
  assert.equal(gltf.images?.length ?? 0, 0);
  assert.equal(gltf.textures?.length ?? 0, 0);
  assert.deepEqual(gltf.nodes.filter(n => n.name?.startsWith('COL_')).map(n=>n.name).sort(), Object.keys(cfg.furnitureProxies).sort());
  const inventory = JSON.parse(c.furnitureInventory);
  assert.ok(inventory.length > 100);
  assert.equal(inventory.filter(o => o.name.startsWith('xi_ceiling_')).length,21);
  assert.equal(inventory.filter(o => o.name.startsWith('xi_screen')).length,2);
  assert.equal(inventory.filter(o => o.name.startsWith('xi_bed')).length,1);
  assert.ok(inventory.every(o => !/door|window|part_|floor/.test(o.name)));
  const metrics = JSON.parse(c.glyphMetrics);
  assert.equal(metrics.length, 3);
  for (const g of metrics) {
    assert.ok(g.vertices > 40);
    assert.ok(Math.abs(Math.max(g.width,g.height)-g.targetMaxDimension) < 1e-8);
  }
  let renderableTris=0,proxyTris=0;
  for(const n of gltf.nodes) if(n.mesh!==undefined) for(const p of gltf.meshes[n.mesh].primitives) {
    const count=gltf.accessors[p.indices ?? p.attributes.POSITION].count/3;
    if(n.name.startsWith('COL_'))proxyTris+=count;else renderableTris+=count;
  }
  assert.equal(cfg.asset.renderableTriangles,renderableTris);
  assert.equal(cfg.asset.proxyTriangles,proxyTris);
  assert.equal(cfg.asset.textureBytes,0);
  assert.equal(cfg.asset.decodedBufferBytes,gltf.bufferViews.reduce((sum,v)=>sum+v.byteLength,0));
  assert.ok(renderableTris<=cfg.budget.tris);
});

test('other five shipped interior assets remain byte-identical to published V5',()=>{
 const hashes={taihe:'a94b76aed742a3aa2482b3fcbfe20c85c9af2f703f59141cd547d18d2de4e820',qianqing:'5fea568395a4474dbfd77fed158e9d2bbfa0959e5f5cd268ecab7e523f0861bf',huangji:'53213f0c2247820ca15cd44c1b99e8104e309a93cf9ac962b9a24aaa59f1cf80',yangxin:'e29192ab78f14811cbbbb94f8736d984f3c8bfece197e54cb81e023cb7c8fde3',cining:'e1eab11c8ac1c62b47d0298caadf98c1e20dc6c0b55e2f648d7b0fa6fa3388b6'};
 for(const [id,hash]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(read(`public/models/interiors/${id}.glb`)).digest('hex'),hash,id);
 const common=read('assets-src/interiors/_common.py').toString();
 assert.match(common,/def export_glb\(path, draco=False, export_extras=False\)/);
});

test('Kunning deterministically triangulates only its own export before producing content-keyed bytes',()=>{
 assert.match(source,/quad_method='FIXED'/);
 assert.match(source,/ngon_method='EAR_CLIP'/);
});


// F3: the only permitted geometry edit is the same-bounds 12-face ceiling strip.
const TARGET={min:[-11.255833625793457,7.040500164031982,-7],max:[-11.210833549499512,7.065499782562256,7]};
const canonical=vertices=>vertices.map((_,i)=>JSON.stringify(vertices.slice(i).concat(vertices.slice(0,i)))).sort()[0];
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
async function inspectedGeometry(){
 const T=await import('three');const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
 const bytes=read(`public${cfg.model}`),loaded=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 loaded.scene.updateMatrixWorld(true);const unchanged=[],target=[],metadata=[];
 loaded.scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,attrs=Object.keys(g.attributes).sort();
  metadata.push([o.name,o.matrixWorld.toArray(),attrs.map(k=>[k,g.attributes[k].itemSize,g.attributes[k].normalized,g.attributes[k].array.constructor.name]),o.material.name]);
  for(let i=0;i<g.index.count;i+=3){const vs=Array.from({length:3},(_,j)=>{const id=g.index.getX(i+j);return Object.fromEntries(attrs.map(k=>{const a=g.attributes[k];return[k,Array.from({length:a.itemSize},(_,c)=>a.array[id*a.itemSize+c])];}));});
   const isTarget=o.name==='merged_gold_lacquer'&&vs.every(v=>v.position.every((n,k)=>n>=TARGET.min[k]-.000002&&n<=TARGET.max[k]+.000002));
   if(isTarget)target.push(vs);else unchanged.push(JSON.stringify([o.name,o.material.name,canonical(vs)]));
  }
 });return {T,unchanged,target,metadata};
}
test('only the target twelve triangles may change; all other attributes/materials/transforms/proxies match F2',async()=>{
 const {unchanged,target,metadata}=await inspectedGeometry();
 assert.equal(target.length,12);assert.equal(unchanged.length,4740);
 assert.equal(digest(JSON.stringify(unchanged.sort())),'5df4d68e90ffb226101e3b1133e4fe90afbf785aeff86c4510355f2d96bd2436');
 assert.equal(digest(JSON.stringify(metadata.sort((a,b)=>a[0].localeCompare(b[0])))),'03e0fa0e2e2ccadda04e47b98d3a0534aa12c749d138c578b459752043908db8');
 assert.equal(digest(JSON.stringify(parseGLB().materials)),'b09ddbce2b0757fd00c04a241130d35ff6f0c1648f3aa92926269efe520e20da');
});
test('actual target strip matches the browser-verified same-bounds BoxGeometry triangle diagonals and normals',async()=>{
 const {T,target}=await inspectedGeometry(),min=new T.Vector3(...TARGET.min),max=new T.Vector3(...TARGET.max),size=max.clone().sub(min),center=min.clone().add(max).multiplyScalar(.5);
 const g=new T.BoxGeometry(size.x,size.y,size.z);g.translate(center.x,center.y,center.z);const expected=[];
 for(let i=0;i<g.index.count;i+=3)expected.push(Array.from({length:3},(_,j)=>{const id=g.index.getX(i+j);return {normal:new T.Vector3().fromBufferAttribute(g.attributes.normal,id).toArray(),position:new T.Vector3().fromBufferAttribute(g.attributes.position,id).toArray(),uv:[0,1]};}));
 assert.deepEqual(target.map(canonical).sort(),expected.map(canonical).sort());
 const actualBounds=new T.Box3().setFromPoints(target.flatMap(t=>t.map(v=>new T.Vector3(...v.position))));
 assert.deepEqual(actualBounds.min.toArray(),TARGET.min);assert.deepEqual(actualBounds.max.toArray(),TARGET.max);
});
