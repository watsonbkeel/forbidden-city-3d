import {stripBilingualDelta,historicalBilingualPaths} from '../bilingual/source-boundary.mjs';
import {readCompatibleSource as readLive} from '../r165-yangxin-companions/source-boundary.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {normalizeGuhuaSource,record as gh} from '../r165-guhua-roof/source-boundary.mjs';
import {normalizeXuanshouSource,record as k19} from '../r165-xuanshou-south-front/source-boundary.mjs';
import {normalizeFuyiSource,record as k18} from '../r165-fuyi-three-bay/source-boundary.mjs';
const base='ad0f3086e32d8f101bb29c1a7a7b04fc441861ab';
const sha=b=>createHash('sha256').update(b).digest('hex');
async function boundary(){assert.ok(fs.existsSync(new URL('./source-boundary.mjs',import.meta.url)),'L3 declared byte boundary absent');return import('./source-boundary.mjs')}
test('every public-ad0 runtime/data byte survives exact Guhua/K19/K18/L3 composition; only private L3 import/hook145/call is new to 4ed',async()=>{
  const {normalizeWatchSource:norm,record}=await boundary();
  const old=execFileSync('git',['ls-tree','-r','--name-only',base,'src','data','main.js','release.json'],{encoding:'utf8'}).trim().split('\n');
  const now=historicalBilingualPaths(execFileSync('git',['ls-files','-co','--exclude-standard','src','data','main.js','release.json'],{encoding:'utf8'}).trim().split('\n'));
  for(const p of old)assert.equal(normalizeXuanshouSource(p,normalizeGuhuaSource(p,normalizeFuyiSource(p,norm(p,stripBilingualDelta(p,readLive(p)))))).compare(execFileSync('git',['show',base+':'+p],{maxBuffer:50*1024*1024})),0,p);
  assert.deepEqual([...new Set(now)].filter(p=>!old.includes(p)).sort(),[...Object.keys(gh.added),'src/scene/palace/special/XuanshouSouthFront.js','src/scene/palace/special/FuyiThreeBay.js','src/scene/palace/special/XihuaNorthWatchHouse.js','src/scene/palace/special/YangxinCompanionHalls.js','src/scene/palace/special/YanxiRearEarHall.js','src/scene/palace/special/ZhongzhengMainHall.js','src/scene/palace/special/DanyuanElevenBayHall.js','src/scene/palace/special/ChenghuangGlazedEntry.js','src/scene/palace/special/TishunSouthBeam.js','src/scene/palace/special/DailouWaitingHouse.js'].sort());
  assert.ok(old.every(p=>now.includes(p)));
  for(const[p,h]of Object.entries(gh.added))assert.equal(sha(readLive(p)),h);
  assert.equal(normalizeXuanshouSource('src/scene/palace/special/XuanshouSouthFront.js',fs.readFileSync('src/scene/palace/special/XuanshouSouthFront.js')),null);
  assert.equal(norm('src/scene/palace/special/XihuaNorthWatchHouse.js',fs.readFileSync('src/scene/palace/special/XihuaNorthWatchHouse.js')),null);
  assert.deepEqual(record.files.map(r=>r.path).sort(),['src/scene/palace/special/XihuaNorthWatchHouse.js','src/scene/zones/ZoneBase.js']);
  const prior=record.files.find(r=>r.before),k19Zone=k18.files.find(r=>r.path===prior.path);
  assert.equal(prior.before,k19Zone.after,'4ed before bytes are the exact previously pinned K18 ZoneBase');
  assert.equal(sha(fs.readFileSync(new URL('./frozen/ZoneBase.4ed.js',import.meta.url))),prior.before);
  const s=readLive('src/scene/zones/ZoneBase.js').toString();
  assert.ok(s.includes("    buildFuyiThreeBay(this.kit,this.zoneJson);\n    yield {phase:'hook',index:145};\n    buildXihuaNorthWatchHouse(this.kit,this.zoneJson);\n    yield {phase:'merge',index:0};"));
  assert.equal((s.match(/index:145/g)||[]).length,1);
});
test('only complete hashed L3 before/after payloads normalize; swapped/truncated/unknown actual source drift stays detectable',async()=>{
  const{normalizeWatchSource:norm,record}=await boundary();
  for(const row of record.files){const b=readLive(row.path);norm(row.path,b);for(const wrong of[b.subarray(1),Buffer.concat([b,Buffer.from('// unrelated drift')])])assert.throws(()=>norm(row.path,wrong));for(const other of record.files.filter(q=>q.path!==row.path))assert.throws(()=>norm(other.path,b));}
  for(const p of['src/scene/palace/kit.js','src/scene/RoofBuilder.js','src/utils/Collision.js','data/zones/outer-west.json','src/another-special.js']){const b=Buffer.from('// unrelated actual source change');assert.equal(norm(p,b),b)}
  assert.equal(sha(fs.readFileSync(new URL('./baseline-4ed.json',import.meta.url))),'b2a520e1a2a304da443af0cf15e3cf1597e8cea4d3e4e610ca3f89f20e384565');
});
