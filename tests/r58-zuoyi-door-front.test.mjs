import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {library,gate,goldRuns,binding} from './lib/r58-zuoyi-door-fixture.mjs';
const moduleURL=new URL('../src/scene/palace/special/ZuoyiDoorFront.js',import.meta.url);
// A missing implementation leaves the real old production doors unchanged, so
// RED measures the actual ten-row defect rather than an import failure.
const {applyZuoyiDoorFront}=existsSync(moduleURL)?await import(moduleURL):{applyZuoyiDoorFront:()=>false};
for(const quality of ['hd','sd'])test(`${quality}: exactly nine pixel rows reach each corrected front`,async()=>{
 const lib=await library(quality),{kit,frame,leaves}=gate(lib);
 applyZuoyiDoorFront(kit,frame,binding);
 for(const leaf of leaves){const front=leaf.children.find(m=>m.userData.role==='zuoyi-nine-row-front')??leaf;
  assert.equal(goldRuns(front.material.map.image).length,9,'real front texture must contain nine rows, not the generic ten');
 }
 kit.dispose(kit.root);lib.dispose();
});

const {triangles,textureHash,hash,axis}=await import('./lib/r58-zuoyi-door-fixture.mjs');
const {isZuoyiDoorTarget}=await import(moduleURL);
const sorted=rows=>rows.map(r=>JSON.stringify(r)).sort();

test('binding is exact zone, item ordinal, declaration and transform, never name alone',()=>{
 assert.equal(isZuoyiDoorTarget(binding),true);
 for(const changed of [null,{}, {...binding,zoneId:'outer-east'},{...binding,itemIndex:3},
  ...Object.entries({name:'右翼门',x:110.7,z:-52.8,rot:'west',style:'wall',kind:'hall',w:3.6,gateProfile:'zuoyi',open:true}).map(([key,value])=>({...binding,item:{...binding.item,[key]:value}}))]){
  assert.equal(isZuoyiDoorTarget(changed??{}),false);
 }
});

test('nine-row skin retains every original triangle, normal, UV, leaf pose and physics record',async()=>{
 const lib=await library(),{kit,frame,leaves}=gate(lib),before=triangles(frame,{material:false}),poses=leaves.map(m=>[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]);
 const physics=hash([kit.colliders,kit.walkables,kit.rooms,kit.mapItems]);
 const five=leaves.map(m=>triangles(m,{world:false}).filter(t=>!t.n.every(v=>v[2]===-1)));
 assert.equal(applyZuoyiDoorFront(kit,frame,binding),true);
 assert.deepEqual(sorted(triangles(frame,{material:false})),sorted(before));
 assert.deepEqual(leaves.map(m=>[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()]),poses);
 assert.equal(hash([kit.colliders,kit.walkables,kit.rooms,kit.mapItems]),physics);
 for(const [i,leaf] of leaves.entries()){
  const all=triangles(leaf,{world:false}),body=all.filter(t=>t.material==='door_studded_material');
  assert.deepEqual(body,five[i]);assert.equal(all.length,12);
 }
 assert.equal(applyZuoyiDoorFront(kit,frame,binding),false,'idempotent rejection prevents duplicate skin/resources');
 kit.dispose(kit.root);lib.dispose();
});

test('real finish preserves both front skins, all original UVs, and all non-target meshes',async()=>{
 const lib=await library(),before=gate(lib),after=gate(lib);
 before.kit.gate({...axis.items[3],rot:-Math.PI/2});after.kit.gate({...axis.items[3],rot:-Math.PI/2});
 assert.equal(applyZuoyiDoorFront(after.kit,after.frame,binding),true);
 const b=before.kit.finish(),a=after.kit.finish();
 assert.deepEqual(sorted(triangles(a,{material:false})),sorted(triangles(b,{material:false})));
 const skins=triangles(a).filter(t=>t.material==='zuoyi_nine_row_front');assert.equal(skins.length,4);
 assert.ok(skins.every(t=>t.uv.every(([u,v])=>u>=0&&u<=1&&v>=0&&v<=1)));
 const mesh=a.children.find(m=>m.material.name==='zuoyi_nine_row_front');assert.ok(mesh);assert.equal(goldRuns(mesh.material.map.image).length,9);
 const unaffected=rows=>rows.filter(t=>!t.p.every(p=>p[0]<-100)).map(t=>JSON.stringify(t)).sort();
 assert.deepEqual(unaffected(triangles(a)),unaffected(triangles(b)),'other gate retains material and geometry bytes');
 before.kit.dispose(b);after.kit.dispose(a);lib.dispose();
});

test('shared albedo and normal pixels are unchanged; two leaves share library-owned derivatives',async()=>{
 const lib=await library(),{kit,frame,leaves}=gate(lib),base=lib.material('door_studded');
 const oldColor=textureHash(base.map),oldNormal=textureHash(base.normalMap),oldColors=lib.colors.size,oldNormals=lib.normals.size,oldMaterials=lib.materials.size;
 assert.equal(applyZuoyiDoorFront(kit,frame,binding),true);
 const mat=leaves[0].children[0].material;assert.equal(mat,leaves[1].children[0].material);
 assert.equal(base,lib.material('door_studded'));assert.equal(textureHash(base.map),oldColor);assert.equal(textureHash(base.normalMap),oldNormal);
 assert.equal(lib.colors.size,oldColors+1);assert.equal(lib.normals.size,oldNormals+1);assert.equal(lib.materials.size,oldMaterials+1);
 for(const resource of [mat,mat.map,mat.normalMap])assert.equal(lib.owns(resource),true);
 for(const key of ['colorSpace','wrapS','wrapT','flipY','anisotropy','magFilter','minFilter'])assert.equal(mat.map[key],base.map[key]);
 assert.deepEqual(mat.map.repeat.toArray(),base.map.repeat.toArray());assert.deepEqual(mat.normalScale.toArray(),base.normalScale.toArray());
 const disposed=new Map([mat,mat.map,mat.normalMap].map(r=>[r,0]));for(const r of disposed.keys())r.addEventListener('dispose',()=>disposed.set(r,disposed.get(r)+1));
 kit.dispose(kit.root);assert.deepEqual([...disposed.values()],[0,0,0]);lib.dispose();assert.deepEqual([...disposed.values()],[1,1,1]);
 assert.equal(lib.materials.size+lib.colors.size+lib.normals.size,0);
});

test('wrong declaration or altered leaf/frame rejects without changing cached resources or scene',async()=>{
 for(const mutate of [c=>c.frame.position.x+=.01,c=>c.leaves[0].position.y+=.01,c=>c.leaves[1].rotation.y=0,c=>c.leaves[0].geometry.parameters.width+=.01,c=>c.frame.userData.structure.gateKind='five-bay']){
  const lib=await library(),c=gate(lib);mutate(c);const before=hash(triangles(c.frame)),sizes=[lib.colors.size,lib.normals.size,lib.materials.size];
  assert.equal(applyZuoyiDoorFront(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),before);assert.deepEqual([lib.colors.size,lib.normals.size,lib.materials.size],sizes);
  c.kit.dispose(c.kit.root);lib.dispose();
 }
});

test('horizontal eight-column positions remain inherited, not a newly claimed count',async()=>{
 const lib=await library(),{kit,frame,leaves}=gate(lib),source=lib.color('door_studded').image;
 const before=goldRuns(source,'x',85/1024,[.04,.96]);assert.equal(before.length,8);
 applyZuoyiDoorFront(kit,frame,binding);
 const image=leaves[0].children[0].material.map.image,after=goldRuns(image,'x',(85*1024/926)/1024,[.04,.96]);
 assert.equal(after.length,8);for(let i=0;i<8;i++)for(let j=0;j<2;j++)assert.ok(Math.abs(before[i][j]-after[i][j])<=1);
 kit.dispose(kit.root);lib.dispose();
});

test('derivatives have independent THREE.Source, reuse within one library, and isolate different libraries',async()=>{
 const lib=await library(),a=gate(lib),b=gate(lib),otherLib=await library(),c=gate(otherLib);
 for(const q of [a,b,c])assert.equal(applyZuoyiDoorFront(q.kit,q.frame,binding),true);
 const am=a.leaves[0].children[0].material,bm=b.leaves[0].children[0].material,cm=c.leaves[0].children[0].material,base=lib.material('door_studded');
 assert.equal(am,bm);assert.notEqual(am,cm);assert.notEqual(am.map,cm.map);
 assert.notEqual(am.map.source,base.map.source);assert.notEqual(am.normalMap.source,base.normalMap.source);
 assert.notEqual(am.map.image,base.map.image);assert.notEqual(am.normalMap.image,base.normalMap.image);
 assert.notEqual(textureHash(am.normalMap),textureHash(base.normalMap),'normal map follows the row remap instead of retaining ten bump rows');
 for(const q of [a,b,c])q.kit.dispose(q.kit.root);lib.dispose();otherLib.dispose();
});

test('a material-only CPU fixture keeps original doors and records source unavailable',async()=>{
 const {library:cpuLibrary}=await import('./lib/inner-palace-fixture.mjs');
 const lib=cpuLibrary(),{kit,frame,leaves}=gate(lib),before=hash(triangles(frame,{material:false}));
 assert.doesNotThrow(()=>assert.equal(applyZuoyiDoorFront(kit,frame,binding),false));
 assert.equal(hash(triangles(frame,{material:false})),before);assert.ok(leaves.every(m=>m.children.length===0));
 assert.equal(kit.root.userData.zuoyiDoorFront?.status,'NOT_CORRECTED');
 assert.equal(kit.root.userData.zuoyiDoorFront?.reason,'SOURCE_UNAVAILABLE');kit.dispose(kit.root);
});

test('unloaded 64px procedural fallback keeps its original material and does not claim nine rows',async()=>{
 const {TextureLibrary}=await import('../src/utils/TextureLibrary.js');
 const {canvasDOM}=await import('./lib/r58-zuoyi-door-fixture.mjs');canvasDOM();
 const lib=new TextureLibrary(),{kit,frame,leaves}=gate(lib),before=hash(triangles(frame,{material:false})),base=leaves[0].material;
 assert.equal(base.map.image.width,64);assert.equal(applyZuoyiDoorFront(kit,frame,binding),false);
 assert.equal(hash(triangles(frame,{material:false})),before);assert.ok(leaves.every(m=>m.material===base&&m.children.length===0));
 assert.equal(kit.root.userData.zuoyiDoorFront?.status,'NOT_CORRECTED');assert.equal(lib.materials.has('zuoyi_nine_row_front'),false);
 kit.dispose(kit.root);lib.dispose();
});

for(const file of ['door_studded.webp','door_studded_n.webp'])test(`actual load failure for ${file} leaves the target uncorrected`,async t=>{
 const {loadLocalTextureLibrary}=await import('./lib/r58-zuoyi-real-texture-loader.mjs');
 const warnings=[];t.mock.method(console,'warn',(...args)=>warnings.push(args[0]));
 const {library:lib,reads}=await loadLocalTextureLibrary({scope:'door',failFiles:[file]});
 assert.ok(reads.some(path=>path.endsWith('/'+file)));assert.equal(warnings.length,1);
 const {kit,frame,leaves}=gate(lib),before=hash(triangles(frame,{material:false}));
 assert.equal(lib.has('door_studded'),file!=='door_studded.webp');
 if(file==='door_studded.webp')assert.equal(leaves[0].material.map.image.width,64);
 else assert.equal(leaves[0].material.normalMap,null);
 assert.equal(applyZuoyiDoorFront(kit,frame,binding),false);assert.equal(hash(triangles(frame,{material:false})),before);
 assert.ok(leaves.every(m=>m.children.length===0));assert.equal(lib.materials.has('zuoyi_nine_row_front'),false);
 const merged=kit.finish();assert.equal(merged.userData.zuoyiDoorFront.status,'NOT_CORRECTED');assert.equal(merged.userData.zuoyiDoorFront.reason,'SOURCE_UNAVAILABLE');
 kit.dispose(merged);lib.dispose();
});

test('local loader proves actual production load/configure success for the full component library',async()=>{
 const {loadLocalTextureLibrary}=await import('./lib/r58-zuoyi-real-texture-loader.mjs');
 const {library:lib,reads,boundary}=await loadLocalTextureLibrary();
 assert.equal(boundary,'ALL_MANIFEST_FILES_REAL_LOCAL_LOAD');
 const expected=Object.values(lib.manifest.textures).flatMap(t=>[t.color,t.normal]).filter(Boolean);assert.equal(reads.length,expected.length);
 for(const [name,info]of Object.entries(lib.manifest.textures)){
  if(info.color){assert.equal(lib.has(name),true);assert.equal(lib.colors.get(name).name,name+'_color');assert.ok(lib.colors.get(name).image.width>64);}
  if(info.normal)assert.equal(lib.normals.get(name).name,name+'_normal');
 }
 lib.dispose();
});

test('world QA bridge uses real door dependencies and retains every other CPU material identity',async()=>{
 const {loadLocalTextureLibrary,bindRealDoorTextures}=await import('./lib/r58-zuoyi-real-texture-loader.mjs');
 const {library:cpuLibrary}=await import('./lib/inner-palace-fixture.mjs');
 const cpu=cpuLibrary(),{library:real,reads,boundary}=await loadLocalTextureLibrary({scope:'door'}),mixed=bindRealDoorTextures(cpu,real);
 assert.equal(boundary,'DOOR_FILES_REAL_LOCAL_LOAD_OTHER_ENTRIES_PROCEDURAL_FALLBACK');assert.equal(reads.length,2);
 assert.equal(mixed.material('door_studded'),real.material('door_studded'));
 for(const name of ['wall_red','wood_column','roof_tile'])assert.equal(mixed.material(name),cpu.material(name));
 const {kit,frame,leaves}=gate(mixed);assert.equal(applyZuoyiDoorFront(kit,frame,binding),true);const mat=leaves[0].children[0].material;
 assert.equal(goldRuns(mat.map.image).length,9);assert.equal(mixed.owns(mat),true);assert.equal(real.owns(mat),true);
 const root=kit.finish();assert.equal(root.userData.zuoyiDoorFront.status,'PARTIAL_COUNT_CORRECTED');
 kit.dispose(root);real.dispose();
});
