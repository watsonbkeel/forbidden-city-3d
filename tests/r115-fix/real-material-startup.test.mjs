import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {registerHooks} from 'node:module';
import {installCpuPlatform} from '../../scripts/r115-fix/cpu-platform.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
await installCpuPlatform(root);
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const [{TextureLibrary,TEXTURE_SPECS},{setBuildingDetailQuality},{ZoneBase},{ZONES}]=await Promise.all([import('../../src/utils/TextureLibrary.js'),import('../../src/render/BuildingDetailQuality.js'),import('../../src/scene/zones/ZoneBase.js'),import('../../data/zones/index.js')]);
for(const quality of ['low','high'])test(`actual loaded ${quality} TextureLibrary builds all seven zones without invented material keys`,async()=>{
 const lib=new TextureLibrary({quality:quality==='low'?'sd':'hd',baseUrl:path.join(root,'public/textures',quality==='low'?'sd':'hd')+'/'});setBuildingDetailQuality(lib,quality);await lib.load();
 assert.equal(lib.loadedFromFile.size,22);assert.equal(lib.normals.size,21);
 const calls=new Set(),original=lib.material.bind(lib);lib.material=(key,...args)=>{calls.add(key);assert.ok(Object.hasOwn(TEXTURE_SPECS,key),`unsupported real material: ${key}`);return original(key,...args);};
 try{for(const zone of ZONES){const b=new ZoneBase(lib,zone);try{const result=b.build();assert.ok(result.group?.isGroup,zone.id);}finally{b.dispose();}}assert.ok(calls.has('wood_column'));assert.ok(calls.has('roof_tile'));assert.equal(ZONES.length,7);}finally{lib.dispose();}
});
test.after(()=>hook.deregister());
