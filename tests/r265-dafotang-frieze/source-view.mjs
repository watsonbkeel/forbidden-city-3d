import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const SOURCE_PATH='src/scene/palace/special/DafotangHistoricLayout.js';
export const sha256=value=>createHash('sha256').update(value).digest('hex');
const pins=JSON.parse(fs.readFileSync(new URL('./pins.json',import.meta.url)));
export function assertNoOverrides(){
 for(const k of ['R265_REPO','R265_BASELINE','NODE_OPTIONS','NODE_PATH'])assert.ok(!process.env[k],`R265 forbidden source/loader override: ${k}`);
 assert.ok(!process.execArgv.some(a=>/^(?:--(?:experimental-)?loader|--import|--require|-r)(?:=|$)/.test(a)),'R265 no source loader permitted');
}
export function assertCurrentSource(){assertNoOverrides();const s=fs.readFileSync(new URL('../../'+SOURCE_PATH,import.meta.url),'utf8');assert.equal(sha256(s),pins.productSha256,'R265 exact current source required');assert.notEqual(sha256(s),pins.r264Sha256);return s;}
export function readPinnedFixture(name){
 assert.ok(Object.hasOwn(pins.fixtures,name)&&!name.includes('/'),'R265 fixed fixture name required');
 const bytes=fs.readFileSync(new URL('./fixtures/'+name,import.meta.url));assert.equal(sha256(bytes),pins.fixtures[name],`R265 fixture hash: ${name}`);return bytes;
}
export async function loadPinnedLayout(which){
 assertNoOverrides();const names={r264:'r264-layout.js.txt',reviewed6998:'reviewed-6998-layout.js.txt'};assert.ok(Object.hasOwn(names,which),'R265 fixed layout mode required');
 let code=readPinnedFixture(names[which]).toString('utf8');assert.notEqual(sha256(code),pins.productSha256,'R265 baseline must not be current product');
 if(which==='r264')assert.equal(sha256(code),pins.r264Sha256);
 const support='src/utils/TriangleSupport.js',url=new URL('../../'+support,import.meta.url);assert.equal(sha256(fs.readFileSync(url)),pins.unchangedSources[support]);
 const changes=[["import * as T from 'three';",`import * as T from ${JSON.stringify(import.meta.resolve('three'))};`],["import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';",`import {createTriangleTemplate,triangleInstance} from ${JSON.stringify(url.href)};`]];
 for(const[a,b]of changes){assert.equal(code.split(a).length,2,'R265 exact fixture dependency import');code=code.replace(a,b);}
 const imports=[...code.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map(m=>m[1]);assert.equal(imports.length,2);assert.ok(imports.every(s=>s.startsWith('file:')));
 return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
}
export function priorR264LayoutSource(source,relativePath){
 assert.equal(relativePath,SOURCE_PATH,'R265 only the approved product path may be projected');
 assert.equal(typeof source,'string');assert.equal(sha256(source),pins.productSha256,'R265 exact reviewed product bytes required');
 const once=(a,b)=>{assert.equal(source.split(a).length,2,'R265 inverse fragment must occur exactly once');source=source.replace(a,b);};
 const start='/** Central three interior outlines guided by 2014 printed079 fig8.';
 const end='/** Reference-guided plain spatial frame only.';
 assert.equal(source.split(start).length,2);assert.equal(source.split(end).length,2);
 const a=source.indexOf(start),z=source.indexOf(end);assert.ok(a>=0&&z>a);once(source.slice(a,z),'');
 once("add('lower-front-entablature',createLowerFrontEntablatureGeometry());","box('lower-front-entablature',6.5,.22,.32,0,p.lowerTop-.11,p.frontZ);");
 once(",lowerFrontEntablatureProfile:{endTreatment:'PLAIN_MODEL_RETURNS_NOT_SOURCE_CARVING',columnInset:.08,narrowBays:'UNCHANGED_PLAIN',dimensionStatus:'MODEL_FIT_NOT_SURVEY'}",'');
 const old=readPinnedFixture('r264-layout.js.txt').toString('utf8');assert.equal(sha256(source),pins.r264Sha256);assert.equal(source,old,'R265 inverse must reconstruct every original byte');return source;
}
