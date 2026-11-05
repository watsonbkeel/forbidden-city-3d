import {normalizeYanxiSource,isYanxiSourceVersion} from '../r165-yanxi-rear-ear/source-boundary.mjs';
import {normalizeCompanionSource,isCompanionSourceVersion} from '../r165-yangxin-companions/source-boundary.mjs';
import {normalizeWatchSource,isWatchSourceVersion} from '../r165-xihua-north-house/source-boundary.mjs';
import {normalizeFuyiSource,isFuyiSourceVersion} from '../r165-fuyi-three-bay/source-boundary.mjs';
import {normalizeXuanshouSource,isXuanshouSourceVersion} from '../r165-xuanshou-south-front/source-boundary.mjs';
import assert from'node:assert/strict';
export const base='14d81f71b3acd0eedfe1f2e12bd01190765f77ea';
export const zoneLines=["import {buildXuhuiGallery} from '../palace/special/XuhuiGallery.js';\n","    yield {phase:'hook',index:142};\n","    buildXuhuiGallery(this.kit,this.zoneJson);\n"];
export function stripXuhuiDelta(s){if(isYanxiSourceVersion('src/scene/zones/ZoneBase.js',Buffer.from(s)))s=normalizeYanxiSource('src/scene/zones/ZoneBase.js',Buffer.from(s)).toString();if(isCompanionSourceVersion('src/scene/zones/ZoneBase.js',Buffer.from(s)))s=normalizeCompanionSource('src/scene/zones/ZoneBase.js',Buffer.from(s)).toString();if(isWatchSourceVersion('src/scene/zones/ZoneBase.js',Buffer.from(s)))s=normalizeWatchSource('src/scene/zones/ZoneBase.js',Buffer.from(s)).toString();if(isFuyiSourceVersion('src/scene/zones/ZoneBase.js',Buffer.from(s)))s=normalizeFuyiSource('src/scene/zones/ZoneBase.js',Buffer.from(s)).toString();if(isXuanshouSourceVersion('src/scene/zones/ZoneBase.js',Buffer.from(s)))s=normalizeXuanshouSource('src/scene/zones/ZoneBase.js',Buffer.from(s)).toString();for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Xuhui delta');s=s.replace(line,'')}return s}
