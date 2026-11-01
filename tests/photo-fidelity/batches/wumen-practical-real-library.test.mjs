import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {realTextureLibrary} from '../../lib/r48-real-texture-library.mjs';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';
import {TEXTURE_SPECS} from '../../../src/utils/TextureLibrary.js';

// Use the real material factory/cache/name/tileSize API with inert texture
// pixels. This is production wiring/merge smoke, NOT image or GPU acceptance.
// A tiny private overlay applies the exact delivery patch without editing the
// shared source files owned by the integrator. Imported dependencies are real.
test('real TextureLibrary builds the ordinary finalized and merged Wumen plus south wall hooks',async()=>{
 const root=fileURLToPath(new URL('../../../',import.meta.url)),overlay=fs.mkdtempSync(path.join(os.tmpdir(),'wumen-real-library-'));
 const copyTreeLayer=(source,target,copyNames)=>{fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(source)){const a=path.join(source,entry),b=path.join(target,entry);if(copyNames.includes(entry))continue;fs.symlinkSync(a,b);}};
 let library,builder,enclosure;const savedDocument=globalThis.document;
 try{
  for(const name of['data','node_modules','package.json'])fs.symlinkSync(path.join(root,name),path.join(overlay,name));
  copyTreeLayer(path.join(root,'src'),path.join(overlay,'src'),['scene','utils']);copyTreeLayer(path.join(root,'src/utils'),path.join(overlay,'src/utils'),['Collision.js']);fs.copyFileSync(path.join(root,'src/utils/Collision.js'),path.join(overlay,'src/utils/Collision.js'));copyTreeLayer(path.join(root,'src/scene'),path.join(overlay,'src/scene'),['PalaceBuilder.js','Enclosure.js']);
  for(const name of['PalaceBuilder.js','Enclosure.js'])fs.copyFileSync(path.join(root,'src/scene',name),path.join(overlay,'src/scene',name));
  if(!fs.readFileSync(path.join(overlay,'src/scene/PalaceBuilder.js'),'utf8').includes('finalizeWumenPractical(group,data,starts)'))execFileSync('git',['apply','--unidiff-zero',path.join(root,'docs/photo-fidelity/batches/R157-WUMEN-PRACTICAL/INTEGRATION.patch')],{cwd:overlay});
  if(!fs.readFileSync(path.join(overlay,'src/utils/Collision.js'),'utf8').includes('preserveWumenPracticalDescentOwner'))execFileSync('git',['apply','--unidiff-zero',path.join(root,'docs/photo-fidelity/batches/R157-WUMEN-DESCENT/INTEGRATION.patch')],{cwd:overlay});
  const {CollisionManager}=await import(pathToFileURL(path.join(overlay,'src/utils/Collision.js')));
  const [{PalaceBuilder},{Enclosure}]=await Promise.all(['PalaceBuilder.js','Enclosure.js'].map(name=>import(pathToFileURL(path.join(overlay,'src/scene',name)))));
  const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
  library=realTextureLibrary();const tile=library.tileSize.bind(library),tileCalls=[];library.tileSize=key=>{assert.ok(Object.hasOwn(TEXTURE_SPECS,key),'real texture key required: '+key);tileCalls.push(key);return tile(key);};
  assert.equal(library.material('caihua_beam').name,'caihua_beam_material');assert.equal(library.material('roof_tile').name,'roof_tile_material');assert.equal(library.tileSize('roof_tile'),3);
  const scene=new THREE.Scene();builder=new PalaceBuilder(scene,library);builder.buildGate(PALACE_LAYOUT.find(d=>d.name==='午门'));enclosure=new Enclosure(scene,library);enclosure.buildOuterWalls(enclosure.group);
  const gate=scene.children.find(o=>o.name==='午门');assert.ok(gate,'ordinary finish added merged gate');assert.ok(gate.userData.architecture.some(a=>a.id==='FC-AD4377DF51'&&a.status==='R157_PRACTICAL_ENGINEERING_ASSEMBLY'));assert.equal(builder.walkables.length,199);assert.equal(builder.colliders.length,1143);assert.equal(enclosure.group.children.filter(o=>o.userData.r157WumenWallJunction).length,2);
  const cm=new CollisionManager();cm.addColliders([...builder.colliders,...enclosure.colliders]);cm.addWalkables(builder.walkables);assert.equal(cm.walkables.filter(r=>r.wumenPracticalDescentId).length,12);const x=-77,z=-421,y=cm.getGroundHeight(x,z,9,.6),state={x,z,feetY:y,groundY:y,airborne:false,verticalVelocity:0};assert.equal(cm.resolveFurnitureVertical(state,1/60),null);assert.equal(cm.resolveFurnitureVertical({...state,x:x+.15},1/60).wumenPracticalDescent,true);
  const materials=new Set();gate.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});assert.ok(materials.has(library.material('roof_tile')));assert.ok(materials.has(library.material('caihua_beam')));assert.ok(tileCalls.includes('lattice_doors'));assert.ok(tileCalls.includes('wall_red'));assert.ok([...materials].some(m=>m.name==='roof_ridge_glaze'));
 }finally{builder?.dispose();enclosure?.dispose();library?.dispose();if(savedDocument===undefined)delete globalThis.document;else globalThis.document=savedDocument;fs.rmSync(overlay,{recursive:true,force:true});}
});
