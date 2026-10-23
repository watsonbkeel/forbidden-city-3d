// Regenerate only the frozen c9a82aa fixture from its Git source, never HEAD.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const root=new URL('../../',import.meta.url).pathname;
const {moduleURL,baselineCommit,hallCapture}=await import(root+'tests/lib/r58-taihe-beast-fixture.mjs');
const {hallOptions,signature,triangles,library,release,hash}=await import(root+'tests/lib/r58-hall-beast-fixture.mjs');
const src=p=>execFileSync('git',['show',`${baselineCommit}:${p}`],{cwd:root,encoding:'utf8'});
const path='src/scene/palace/special/HallWalkingBeasts.js',oldHelper=moduleURL(src(path),path);
const roofpath='src/scene/RoofBuilder.js',roofURL=moduleURL(src(roofpath),roofpath,{'./palace/special/HallWalkingBeasts.js':oldHelper});
const roofmod=await import(roofURL);
const p='src/scene/PalaceBuilder.js',buildermod=await import(moduleURL(src(p),p,{'./RoofBuilder.js':roofURL}));
const data={baselineCommit,sourceHashes:Object.fromEntries([path,roofpath,p].map(p=>[p,hash(src(p))])),profiles:{},halls:{}};
for(const name of ['baohe','zhonghe']){const g=roofmod.buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name});data.profiles[name]={geometry:signature(g),triangles:triangles(g),recordHash:hash(g.userData.walkingBeasts)};release(g);}
for(const name of ['太和殿','保和殿','中和殿','交泰殿','乾清宫']){const {group,builder,summary}=hallCapture(buildermod.PalaceBuilder,name);data.halls[name]={remainder:summary.remainder,roof:summary.roof,roofTriangles:summary.roofTriangles,physicsHash:hash(summary.physics),colliders:summary.physics.colliders.length,walkables:summary.physics.walkables.length,recordsHash:hash(summary.records),recordCount:summary.records.length};release(group);for(const m of builder.ownedMaterials)m.dispose();}
fs.writeFileSync(root+'tests/fixtures/r58-taihe-beast-baseline.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(data.halls).map(([k,v])=>[k,{roof:v.roof,triangles:v.roofTriangles,physicsColliders:v.colliders}]))));
