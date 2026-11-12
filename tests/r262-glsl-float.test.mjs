// CPU emitted-source contract, not GLSL compilation or rendering proof.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
const root=path.resolve(process.env.R262_REPO_ROOT??fileURLToPath(new URL('../',import.meta.url)));
const target=pathToFileURL(path.join(root,'src/scene/palace/special/TaijiSouthGateGlaze.js')).href;
// Private RED/GREEN only. CI unsets both inputs and tests the checked-in module.
if(process.env.R262_GLSL_SOURCE)registerHooks({load(url,context,next){return url===target?{format:'module',source:fs.readFileSync(process.env.R262_GLSL_SOURCE,'utf8'),shortCircuit:true}:next(url,context);}});
const mod=p=>import(pathToFileURL(path.join(root,p)).href);
const T=await mod('node_modules/three/build/three.module.js');
const {ZoneBase}=await mod('src/scene/zones/ZoneBase.js');
const {createActualLibrary}=await mod('tests/r158-cumulative-1600/library.mjs');
const zone=JSON.parse(fs.readFileSync(path.join(root,'data/zones/west-six.json'),'utf8'));
const varyings='\nvarying vec3 vR242WorldPosition;\nvarying vec3 vR242WorldNormal;';

test('actual Taiji material emits only float literals in its scalar GLSL block',()=>{
  const a=createActualLibrary(),z=structuredClone(zone),builder=new ZoneBase(a.library,z);
  try{
    builder.buildGate(z.items[28]);
    const material=builder.kit.root.children[0].children[1].material;
    assert.equal(material.name,'r242_taiji_south_green_registers_fit');
    const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};
    material.onBeforeCompile(shader);
    const marker='#include <color_fragment>',[prefix,suffix]=T.ShaderLib.standard.fragmentShader.split(marker);
    const expectedPrefix=prefix.replace('#include <common>','#include <common>'+varyings)+marker;
    assert.ok(shader.fragmentShader.startsWith(expectedPrefix)&&shader.fragmentShader.endsWith(suffix));
    const block=shader.fragmentShader.slice(expectedPrefix.length,shader.fragmentShader.length-suffix.length);
    const numbers=[...block.matchAll(/(?<![A-Za-z0-9_])(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?(?![A-Za-z0-9_])/g)].map(m=>m[0]);
    assert.ok(numbers.length>20,'exercise emitted comparisons and dynamic RGB constants');
    assert.deepEqual(numbers.filter(n=>!/[.eE]/.test(n)),[],'a scalar float comparison must not emit a bare integer literal');
    assert.match(block,/p\.y >= 1\.0 && p\.y < 4\.65/,'original inclusive trim floor is emitted as a float');
    const vectors=[...block.matchAll(/vec3\(([^)]+)\)/g)].map(m=>m[1]);
    const green=new T.Color('#3f7657').toArray().map(v=>v.toFixed(10)).join(', '),yellow=new T.Color('#c59b3c').toArray().map(v=>v.toFixed(10)).join(', ');
    assert.deepEqual(vectors,[green,yellow,green,yellow,yellow],'dynamic colors retain original linear values and decimal formatting, followed by the bottom band yellow');
    assert.equal(shader.vertexShader,T.ShaderLib.standard.vertexShader.replace('#include <common>','#include <common>'+varyings).replace('#include <project_vertex>','#include <project_vertex>\nvR242WorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvR242WorldNormal = normalize(mat3(modelMatrix) * objectNormal);'));
    assert.equal(material.customProgramCacheKey(),'r242-taiji-south-green-registers-v3');
  }finally{builder.dispose();a.dispose();}
});

// Reuse the existing small real-gate contract: original triangles/UVs/physics,
// selector boundaries/colors, finish ownership and disposal. No full zone build.
await mod('tests/r242-taiji-south-gate-glaze.test.mjs');
