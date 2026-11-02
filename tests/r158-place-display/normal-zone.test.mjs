import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {publicPlaceName} from '../../src/ui/PublicPlaceNames.js';
const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
test('normal zone exposes clean map/teleport names without mutating builder evidence or geometry',()=>{
 const saved=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};try{
 const z=new ZoneBase(realTextureLibrary(),zone),out=z.build(),raw=z.kit.mapItems;
 assert.equal(out.mapItems.length,raw.length);
 let changed=0;
 for(let i=0;i<raw.length;i++){
  const before=raw[i],after=out.mapItems[i];
  assert.deepEqual(after,{...before,name:publicPlaceName(before.name)});
  if(after.name!==before.name){changed++;assert.equal(out.mapItems.filter(m=>m.name===after.name).length,1,'unique public name '+after.name);assert.match(before.name,/（/);assert.doesNotMatch(after.name,/暂定|待核|未验|拟合|游戏|官文|候选/);}
 }
 assert.equal(changed,17);
 assert.ok(out.mapItems.every(m=>!/(暂定|待核|未验|未经|位置拟合|游戏适配|游戏入口|文字依据候选)/.test(m.name??'')));
 for(const name of ['治牲所','銮驾库东库','内阁汉本堂'])assert.equal(out.mapItems.filter(i=>i.name===name).length,1);
 for(const k of ['colliders','walkables','rooms','regions']){assert.equal(out[k].length,z.kit[k].length);out[k].forEach((v,i)=>assert.equal(v,z.kit[k][i]));}
 const unknown=out.group.userData.architecture.filter(m=>m.unknown);
 assert.ok(unknown.some(m=>m.name?.includes('汉本堂')&&m.currentSurvival==='UNVERIFIED_NOT_CURRENT_RECONSTRUCTION'));
 assert.ok(unknown.some(m=>m.name?.includes('治牲所')&&m.roofConflictResolved===false));
 }finally{globalThis.document=saved;}
});
