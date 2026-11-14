// Fixed per-zone worker. Product modules are never patched or replaced.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createRequire,registerHooks} from 'node:module';
import assert from 'node:assert/strict';import {ROOT,HEAD,ZONES,validatePlain} from './contract.mjs';
const zone=process.argv[2];assert.equal(process.argv.length,3);assert.ok(ZONES.includes(zone));assert.ok(path.isAbsolute(process.env.EVIDENCE_DIR??''));
const out=path.join(process.env.EVIDENCE_DIR,'zones',zone+'.json');assert.ok(!fs.existsSync(out));
const require=createRequire(path.join(ROOT,'package.json'));const {createCanvas}=require('@napi-rs/canvas');
const imp=p=>import(pathToFileURL(path.join(ROOT,p)).href);
const hook=registerHooks({load(url,c,next){return next(url,url.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {installCpuDocument}=await imp('tests/lib/finished-world-lifecycle.mjs');const dom=installCpuDocument(createCanvas);
let builder,lib,items,metrics;const errors=[];
try{
 const {ZoneBase}=await imp('src/scene/zones/ZoneBase.js');const {realTextureLibrary}=await imp('tests/lib/r48-real-texture-library.mjs');
 const canonical=JSON.parse(fs.readFileSync(path.join(ROOT,'data/zones',zone+'.json'),'utf8'));assert.equal(canonical.id,zone);
 lib=realTextureLibrary();builder=new ZoneBase(lib,canonical);const data=builder.build();
 // Same public projection returned to production ZoneManager.init.
 validatePlain(data.mapItems);items=structuredClone(data.mapItems);metrics=builder.getBuildStepMetrics();
 builder.releaseConstructionReferences();
}catch(e){errors.push(e);}finally{
 for(const fn of [()=>builder?.dispose(),()=>lib?.dispose(),()=>dom.restore(),()=>hook.deregister()])try{fn();}catch(e){errors.push(e);}
}
if(errors.length)throw new AggregateError(errors,'zone export/cleanup refused: '+zone);
const row={head:HEAD,zone,complete:true,cleanupComplete:true,count:items.length,mapItems:items,metrics,cpuDocument:dom.stats,rendering:'NOT_TESTED',source:'actual ZoneBase.build output, real finish, offline inert textures'};
fs.writeFileSync(out,JSON.stringify(row,null,2),{flag:'wx'});console.log(JSON.stringify({zone,count:items.length,cleanupComplete:true}));
