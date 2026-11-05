import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {buildBaohuaDian} from '../../src/scene/palace/special/BaohuaDian.js';
import {buildXiangyunPavilion} from '../../src/scene/palace/special/XiangyunPavilion.js';
import {buildZhongzhengEastHall} from '../../src/scene/palace/special/ZhongzhengEastHall.js';
import {buildZhongzhengWestHall} from '../../src/scene/palace/special/ZhongzhengWestHall.js';
import {buildBilinGuan} from '../../src/scene/palace/special/BilinGuan.js';
import {buildNinghuiHall} from '../../src/scene/palace/special/NinghuiHall.js';
import {buildJianfuJiyunLou} from '../../src/scene/palace/special/JianfuJiyunLou.js';
import {buildJingyiXuan} from '../../src/scene/palace/special/JingyiXuan.js';
import {buildFuchenHall} from '../../src/scene/palace/special/FuchenHall.js';
import {buildJianfuMainHall} from '../../src/scene/palace/special/JianfuMainHall.js';
import {buildHuifengPavilion} from '../../src/scene/palace/special/HuifengPavilion.js';
import {buildJicuiPavilion} from '../../src/scene/palace/special/JicuiPavilion.js';
import {buildZhongzhengMainHall} from '../../src/scene/palace/special/ZhongzhengMainHall.js';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export function meshes(root){const a=[];root.traverse(m=>{if(m.isMesh)a.push(m)});return a}
export function fixture(){
 const old=globalThis.document;globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');return createCanvas(1,1)}};
 const actual=createActualLibrary(),builder=new ZoneBase(actual.library,zone),kit=builder.kit;
 try{
  for(const i of [37,38,39]){const p=zone.items[i];if(p.kind==='gate')builder.gateWidths.set(p.name,builder.buildGate(p));else if(p.kind==='courtWalls')builder.buildCourtWalls(p);else builder.buildHall(p)}
  for(const fn of [buildBaohuaDian,buildXiangyunPavilion,buildZhongzhengEastHall,buildZhongzhengWestHall,buildBilinGuan,buildNinghuiHall,buildJianfuJiyunLou,buildJingyiXuan,buildFuchenHall,buildJianfuMainHall,buildHuifengPavilion,buildJicuiPavilion,buildZhongzhengMainHall])fn(kit,zone);
  return {kit,builder,lib:actual.library,dispose(){builder.dispose();actual.dispose();globalThis.document=old}};
 }catch(e){builder.dispose();actual.dispose();globalThis.document=old;throw e}
}
export async function api(){assert.ok(fs.existsSync(new URL('../../src/scene/palace/special/DanyuanElevenBayHall.js',import.meta.url)),'H30 private eleven-bay helper absent');return import('../../src/scene/palace/special/DanyuanElevenBayHall.js')}
