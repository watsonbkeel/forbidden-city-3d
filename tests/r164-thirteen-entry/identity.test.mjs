import {readXiangxuHistoricalSource} from '../r166-xiangxu-gate/source-boundary.mjs';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import crypto from'node:crypto';import{stripThirteenEntryDelta,callLine,importLine}from'./source-boundary.mjs';
const old=readXiangxuHistoricalSource(new URL('./frozen/ZoneBase.98f.js',import.meta.url),'utf8'),cur=readXiangxuHistoricalSource(new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),'utf8');
test('only one new import and dispatch extend exact frozen 98f production ZoneBase',()=>{assert.equal(crypto.createHash('sha256').update(old).digest('hex'),'08db03fe951d53a4ed545680b74fe66e410b315a8d88c12bc75f2a52ecd3d39e');assert.equal(stripThirteenEntryDelta(cur),old)});
test('boundary rejects missing/double import or call and exposes unrelated source mutation',()=>{for(const p of[callLine,importLine]){assert.throws(()=>stripThirteenEntryDelta(cur.replace(p,'')));assert.throws(()=>stripThirteenEntryDelta(cur+p))}assert.notEqual(stripThirteenEntryDelta(cur+'// unrelated\n'),old)});

test('the entire shipped South component remains exact 0c5 bytes',()=>{const s=readXiangxuHistoricalSource(new URL('../../src/scene/palace/special/SouthThirteenHouses.js',import.meta.url));assert.equal(crypto.createHash('sha256').update(s).digest('hex'),'bf658e5893465205bf5531e96505aa4d5d2f54937f884083fc734d3d3f8d0cea')});

test('the entire uploaded North component remains exact 98f bytes',()=>{const s=readXiangxuHistoricalSource(new URL('../../src/scene/palace/special/NorthThirteenHouses.js',import.meta.url));assert.equal(crypto.createHash('sha256').update(s).digest('hex'),'4c458cbecfd5e9974b355f77c2e96064eeeca6a882a983583b2f8bf0217630e8')});
