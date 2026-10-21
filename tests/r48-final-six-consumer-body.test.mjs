import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';import * as THREE from 'three';
import {buildWorld} from './lib/world.mjs';import {buildAutoRoutes} from './lib/auto-routes.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {replayTerrace} from './lib/terrace-walk.mjs';import {visibleTriangleIndex,assertVisibleBody} from './r48-ningshou-visible-body.mjs';
const W=await buildWorld({realMaterials:true}),routes=buildAutoRoutes(W,W.zones.map(z=>z.json)).filter(r=>r.gateProfile!=='zhaode');
const fixed=JSON.parse(execFileSync(process.execPath,[new URL('./stepwalk.cjs',import.meta.url).pathname,'60,10','0,1','all'],{encoding:'utf8',env:{...process.env,DUMP_JSON:'1',DUMP:''}}));
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url))),index=[];
for(const name of ['文华殿','主敬殿']){const lib=realTextureLibrary(),z=new ZoneBase(lib,data);z.buildHall(data.items.find(i=>i.name===name));z.kit.root.updateMatrixWorld(true);index.push(...visibleTriangleIndex(z.kit.root));z.kit.dispose(z.kit.root);lib.dispose();}
const selected=[...routes.filter(r=>['文华殿','主敬殿'].includes(r.hall)),fixed.find(r=>r.name==='协和门→文华门→文华殿内')];
assert.equal(selected.length,3);
for(const r of selected)for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])test(`R48 actual Wenhua/Zhujing consumer rendered hall-body clearance ${r.name} ${fps}/${sprint}/${backward}`,t=>{
 const result=replayTerrace(t,W,r.pts,{fps,sprint,backward,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));
 let checked=0;for(const fr of result.frames){
  // This regression concerns the two hall interiors and opened leaves. Earlier
  // Wenhua-gate/courtyard stair transitions remain a separate inherited boundary.
  if(fr.ground<1.199||fr.ground>1.201)continue;
  assertVisibleBody(W.cm,index,fr);checked++;
 }
 assert.ok(checked>20,'actual plateau frames must execute; arrival alone is insufficient');
});
