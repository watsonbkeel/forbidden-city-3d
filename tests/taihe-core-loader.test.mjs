import assert from 'node:assert/strict';import {test} from 'node:test';import fs from 'node:fs';import {registerHooks} from 'node:module';
registerHooks({load(url,ctx,next){if(url.endsWith('.json'))return{format:'module',source:`export default ${fs.readFileSync(new URL(url),'utf8')}`,shortCircuit:true};return next(url,ctx)}});
const THREE=await import('three'),{InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'),{CollisionManager}=await import('../src/utils/Collision.js'),{GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
const {captureTaiheControl}=await import('./lib/taihe-core-fixture.mjs');const {mergeByMaterial}=await import('../src/utils/MergeUtils.js');const {taiheFallbackMeshes,validateTaiheCore}=await import('../src/scene/interior/TaiheCoreContract.js');
const cfg=JSON.parse(fs.readFileSync(new URL('../data/interiors/taihe.json',import.meta.url)));
async function root(){const b=fs.readFileSync(new URL('../public'+cfg.model,import.meta.url));return(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'')).scene;}
function setup(registry=cfg){const c=captureTaiheControl('太和殿'),scene=new THREE.Scene(),cm=new CollisionManager();cm.addColliders(c.builder.colliders,'permanent');cm.addWalkables(c.builder.walkables,'permanent');cm.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(-31.5,9.9375,-18.5),new THREE.Vector3(31.5,9.9375,18.5))},'floor');scene.add(mergeByMaterial(c.group));const loader=new InteriorLoader(scene,cm,{registry:{taihe:registry}});return{scene,cm,loader,builder:c.builder,fallback:taiheFallbackMeshes(scene)};}
function deliver(loader,r){loader.gltf.load=(_u,ok)=>ok({scene:r})}
function baselinePhysics(cm){return JSON.stringify({c:cm.colliders.map(v=>v.box),w:cm.walkables});}
function checkOne(s,loaded=false){assert.equal(s.fallback.length,8);assert.equal(s.fallback.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),1596);assert.ok(s.fallback.every(m=>m.visible===!loaded));assert.equal(s.loader.getGroup('taihe')?.visible??false,loaded);if(loaded){let triangles=0;s.loader.getGroup('taihe').traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});assert.equal(triangles,17940);}}
test('actual S core atomically replaces only its eight owned batches with no duplicate physics or fade',async()=>{
 const s=setup(),before=baselinePhysics(s.cm);checkOne(s);deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);checkOne(s,true);assert.equal(s.loader.halls.get('taihe').fade,undefined);assert.equal(baselinePhysics(s.cm),before);assert.equal(s.loader.getGroup('taihe').position.y,9.9375);
 s.loader.getGroup('taihe').traverse(o=>{if(o.isMesh)assert.equal(o.material.opacity,1)});s.loader.unload('taihe');checkOne(s);assert.equal(baselinePhysics(s.cm),before);deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);checkOne(s,true);s.loader.dispose();checkOne(s);assert.equal(baselinePhysics(s.cm),before);
});
for(const bad of ['missing-contract','profile','proxy','too-many-triangles','outside-envelope','NaN','Infinity'])test(`malformed ${bad} S leaves permanent core and navigation intact`,async()=>{
 const s=setup(),r=await root(),before=baselinePhysics(s.cm);const contract=r.getObjectByName('TAIHE_CORE_CONTRACT');
 if(bad==='missing-contract')contract.removeFromParent();if(bad==='profile')contract.userData.revision='stale';if(bad==='proxy'){const m=new THREE.Mesh(new THREE.BoxGeometry());m.name='COL_unapproved';r.add(m);}if(bad==='too-many-triangles')r.add(new THREE.Mesh(new THREE.SphereGeometry(1,150,100)));if(bad==='outside-envelope'){const m=new THREE.Mesh(new THREE.BoxGeometry());m.position.x=100;r.add(m);}
 if(bad==='NaN'||bad==='Infinity'){let mesh;r.traverse(o=>{if(o.isMesh&&!mesh)mesh=o;});mesh.geometry.attributes.position.array[0]=bad==='NaN'?NaN:Infinity;}
 deliver(s.loader,r);assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(baselinePhysics(s.cm),before);s.loader.dispose();
});
test('cancellation and late callback never hide fallback',async()=>{const s=setup();let ready;s.loader.gltf.load=(_u,ok)=>ready=ok;const pending=s.loader.load('taihe');checkOne(s);s.loader.unload('taihe');ready({scene:await root()});assert.equal(await pending,false);checkOne(s);s.loader.dispose();});
test('network failure then unload/re-entry preserves exactly one core',async()=>{const s=setup();s.loader.gltf.load=(_u,_ok,_p,error)=>error(new Error('expected failure'));assert.equal(await s.loader.load('taihe'),false);checkOne(s);s.loader.unload('taihe');deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);checkOne(s,true);s.loader.dispose();});
test('install exception rolls back before hiding fallback',async()=>{const s=setup(),before=baselinePhysics(s.cm);s.cm.addWalkables=()=>{throw new Error('injected install failure')};deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(baselinePhysics(s.cm),before);s.loader.dispose();});
test('an independent second loader cannot duplicate or restore a core already owned by another loader',async()=>{const s=setup();deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);const second=new InteriorLoader(s.scene,s.cm,{registry:{taihe:cfg}});deliver(second,await root());assert.equal(await second.load('taihe'),false);checkOne(s,true);second.dispose();checkOne(s,true);s.loader.dispose();checkOne(s);});
test('original six-view front point does not load S, while interior load/unload uses existing distances',async()=>{const s=setup();let calls=0;s.loader.gltf.load=()=>{calls++};s.loader.update({x:0,z:-74});assert.equal(calls,0);s.loader.update({x:0,z:0});assert.equal(calls,1);s.loader.unload('taihe');checkOne(s);s.loader.dispose();});
test('versioned Taihe asset resolves under a repository subpath without changing the shared base convention',()=>{const s=setup(),loader=new InteriorLoader(s.scene,s.cm,{registry:{taihe:cfg},base:'/forbidden-city-3d'});let url;loader.gltf.load=u=>{url=u};loader.load('taihe');assert.equal(url,'/forbidden-city-3d'+cfg.model);assert.match(url,/\/models\/interiors\/taihe-furnishing-surfaces-[a-f0-9]{12}\.glb$/);loader.dispose();s.loader.dispose();});
test('S reuses the owned full-resolution fallback glyph atlas and never disposes it on unload or rollback',async()=>{const s=setup(),atlas=s.fallback.find(o=>o.material.name==='taihe_glyph_atlas').material.map;let disposals=0;atlas.addEventListener('dispose',()=>disposals++);for(let i=0;i<2;i++){deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);let glyph;s.loader.getGroup('taihe').traverse(o=>{if(o.isMesh&&o.material.name==='taihe_glyph_atlas')glyph=o.material});assert.equal(glyph.map,atlas);s.loader.unload('taihe');assert.equal(disposals,0);}s.cm.addWalkables=()=>{throw new Error('atlas rollback')};deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(disposals,0);s.loader.dispose();assert.equal(disposals,0);});
test('exception after group attachment preserves atlas and fallback, then real app-order disposal releases atlas once',async()=>{const s=setup(),atlas=s.fallback.find(o=>o.material.name==='taihe_glyph_atlas').material.map;let disposals=0;atlas.addEventListener('dispose',()=>disposals++);const add=s.scene.add;s.scene.add=function(o){add.call(this,o);if(o.name==='interior:taihe')throw new Error('after attachment');return this};deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(disposals,0);s.scene.add=add;s.loader.unload('taihe');deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);s.builder.dispose();assert.equal(disposals,1);s.loader.dispose();assert.equal(disposals,1);s.builder.dispose();assert.equal(disposals,1);});
test('asset extras cannot suppress another hall material texture disposal',async()=>{const s=setup(),loader=new InteriorLoader(s.scene,s.cm,{registry:{qianqing:{...cfg,id:'qianqing'}}}),r=new THREE.Group(),map=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map});material.userData.taiheSharedAtlas=map;let disposals=0;map.addEventListener('dispose',()=>disposals++);r.add(new THREE.Mesh(new THREE.BoxGeometry(),material));deliver(loader,r);assert.equal(await loader.load('qianqing'),true);loader.unload('qianqing');assert.equal(disposals,1);loader.dispose();s.loader.dispose();});
test('S shares both B column atlases across unload, late callback and attachment rollback; builder frees each once',async()=>{
 const s=setup(),gold=s.fallback.find(o=>o.material.name==='taihe_gold').material,color=gold.map,relief=gold.bumpMap;
 let colorDisposals=0,reliefDisposals=0;color.addEventListener('dispose',()=>colorDisposals++);relief.addEventListener('dispose',()=>reliefDisposals++);
 for(let i=0;i<2;i++){
  deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);
  s.loader.getGroup('taihe').traverse(o=>{if(o.isMesh&&o.material.name==='taihe_gold'){assert.equal(o.material.map,color);assert.equal(o.material.bumpMap,relief);assert.equal(o.material.roughnessMap,relief);}});
  s.loader.unload('taihe');assert.equal(colorDisposals,0);assert.equal(reliefDisposals,0);
 }
 let ready;s.loader.gltf.load=(_url,ok)=>ready=ok;const pending=s.loader.load('taihe');s.loader.unload('taihe');ready({scene:await root()});assert.equal(await pending,false);checkOne(s);assert.equal(colorDisposals,0);assert.equal(reliefDisposals,0);
 const add=s.scene.add;s.scene.add=function(o){add.call(this,o);if(o.name==='interior:taihe')throw new Error('column atlas rollback after attachment');return this};
 deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(colorDisposals,0);assert.equal(reliefDisposals,0);s.scene.add=add;
 s.loader.unload('taihe');deliver(s.loader,await root());assert.equal(await s.loader.load('taihe'),true);
 s.builder.dispose();assert.equal(colorDisposals,1);assert.equal(reliefDisposals,1);s.loader.dispose();s.builder.dispose();assert.equal(colorDisposals,1);assert.equal(reliefDisposals,1);
});
test('column helper source identity mismatch fails closed without hiding fallback',async()=>{
 const s=setup(),r=await root();r.getObjectByName('TAIHE_CORE_CONTRACT').userData.columnSurfaceUVSHA256='0'.repeat(64);
 deliver(s.loader,r);assert.equal(await s.loader.load('taihe'),false);checkOne(s);s.loader.dispose();s.builder.dispose();
});

test('column response arrays follow owned geometry through repeat load, unload and final builder disposal',async()=>{
 const s=setup(),b=s.fallback.find(o=>o.material.name==='taihe_gold'),original=b.geometry.attributes.color;
 // captureTaiheControl bypasses buildAll's addObject; register its real merged root for this disposal probe.
 s.builder.ownedObjects.add(b.parent);let bDisposed=0;b.geometry.addEventListener('dispose',()=>bDisposed++);
 for(let i=0;i<2;i++){const r=await root(),m=r.children.find(o=>o.isMesh&&o.material.name==='taihe_gold');assert.ok(m);let disposed=0;m.geometry.addEventListener('dispose',()=>disposed++);deliver(s.loader,r);assert.equal(await s.loader.load('taihe'),true);const color=m.geometry.attributes.color;assert.ok(color);assert.equal(color.array.byteLength,484728);assert.notEqual(color.array,original.array);assert.equal(b.geometry.attributes.color,original);s.loader.unload('taihe');assert.equal(disposed,1);assert.equal(bDisposed,0);}
 s.loader.dispose();s.builder.dispose();assert.equal(bDisposed,1);
});
test('response rejection after borrowing textures preserves B maps and frees failed S geometry',async()=>{
 const s=setup(),b=s.fallback.find(o=>o.material.name==='taihe_gold'),r=await root();let m;r.traverse(o=>{if(o.isMesh&&o.material.name==='taihe_gold')m=o;});m.geometry.attributes.uv.setXY(0,NaN,.5);let disposed=0,maps=0;m.geometry.addEventListener('dispose',()=>disposed++);b.material.map.addEventListener('dispose',()=>maps++);b.material.bumpMap.addEventListener('dispose',()=>maps++);
 deliver(s.loader,r);assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(m.material.map,b.material.map,'failure occurred after maps were borrowed');assert.equal(m.geometry.attributes.color,undefined);assert.equal(disposed,1);assert.equal(maps,0);assert.ok(b.geometry.attributes.color);s.loader.dispose();s.builder.dispose();assert.equal(maps,2);
});
test('stale response callback allocates no gain buffer; post-attachment rollback disposes only S gains',async()=>{
 const s=setup();let ready;s.loader.gltf.load=(_u,ok)=>ready=ok;const pending=s.loader.load('taihe'),r=await root();let m;r.traverse(o=>{if(o.isMesh&&o.material.name==='taihe_gold')m=o;});let staleDisposals=0;m.geometry.addEventListener('dispose',()=>staleDisposals++);s.loader.unload('taihe');ready({scene:r});assert.equal(await pending,false);assert.equal(m.geometry.attributes.color,undefined);assert.equal(staleDisposals,1);checkOne(s);
 const r2=await root();let m2;r2.traverse(o=>{if(o.isMesh&&o.material.name==='taihe_gold')m2=o;});let rollbackDisposals=0;m2.geometry.addEventListener('dispose',()=>rollbackDisposals++);const add=s.scene.add;s.scene.add=function(o){add.call(this,o);if(o.name==='interior:taihe')throw new Error('response rollback after attachment');return this};deliver(s.loader,r2);assert.equal(await s.loader.load('taihe'),false);assert.ok(m2.geometry.attributes.color);assert.equal(rollbackDisposals,1);checkOne(s);s.scene.add=add;s.loader.dispose();s.builder.dispose();
});


for(const key of ['screenCrownSourceSHA256','screenCrownBaseAssetSHA256','screenCrownIntegrationSHA256','screenCrownRetirementSHA256','screenCrownMaskSHA256','screenCrownTriangles','screenCrownRemovedTriangles'])for(const mutation of ['missing','changed'])test(`screen crown ${key} ${mutation} fails closed before replacing B`,async()=>{
 const s=setup(),r=await root(),before=baselinePhysics(s.cm),contract=r.getObjectByName('TAIHE_CORE_CONTRACT').userData;
 if(mutation==='missing')delete contract[key];else contract[key]=typeof contract[key]==='number'?contract[key]+1:'0'.repeat(64);
 assert.throws(()=>validateTaiheCore(r,cfg),/Taihe screen crown identity mismatch/);
 deliver(s.loader,r);assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(baselinePhysics(s.cm),before);
 s.loader.dispose();s.builder.dispose();
});
const enamelCraneKeys=['enamelCraneSourceSHA256','enamelCraneBaseAssetSHA256','enamelCraneIntegrationSHA256','enamelCraneRetirementSHA256','enamelCraneMaskSHA256','enamelCraneTriangles','enamelCraneRemovedTriangles'];
for(const key of enamelCraneKeys)for(const target of ['asset','registry'])for(const mutation of ['missing','changed'])test(`enamel crane ${target} ${key} ${mutation} fails closed before replacing B`,async()=>{
 const registry=structuredClone(cfg),r=await root(),contract=r.getObjectByName('TAIHE_CORE_CONTRACT').userData,subject=target==='asset'?contract:registry.asset;
 if(mutation==='missing')delete subject[key];else subject[key]=typeof subject[key]==='number'?subject[key]+1:'0'.repeat(64);
 const s=setup(registry),before=baselinePhysics(s.cm);
 assert.throws(()=>validateTaiheCore(r,registry),/Taihe enamel crane identity mismatch/);
 deliver(s.loader,r);assert.equal(await s.loader.load('taihe'),false);checkOne(s);assert.equal(baselinePhysics(s.cm),before);
 s.loader.dispose();s.builder.dispose();
});
test('matching registry totals cannot relax the original 18000-triangle ceiling',async()=>{
 const r=await root(),current=validateTaiheCore(r,cfg);assert.deepEqual(current,{triangles:17940,meshes:8});
 const added=18001-current.triangles;assert.equal(added,61);
 const mesh=r.children.find(o=>o.isMesh),g=mesh.geometry,indices=g.index.array,overBudget=new indices.constructor(indices.length+added*3);
 overBudget.set(indices);for(let i=0;i<added;i++)overBudget.set(indices.subarray(0,3),indices.length+i*3);g.setIndex(new THREE.BufferAttribute(overBudget,1));
 let actualTriangles=0;r.traverse(o=>{if(o.isMesh)actualTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});assert.equal(actualTriangles,18001);
 // Reuse existing vertices, bounds, eight meshes and eight materials so only the triangle ceiling is exceeded.
 const triangles=18001;assert.equal(cfg.budget.tris,18000);
 const matching={...cfg,asset:{...cfg.asset,renderableTriangles:triangles}};
 assert.throws(()=>validateTaiheCore(r,matching),/Taihe core geometry budget mismatch/);
});
