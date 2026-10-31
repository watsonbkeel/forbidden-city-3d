import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {library} from '../../lib/inner-palace-fixture.mjs';
import {buildWuyingThreeBridgeRails} from '../../../src/scene/palace/special/WuyingThreeBridgeRails.js';
const bridge={id:'wuying-2',family:'wuying',x:220.8,z:-249.8-(17.9+1.6)/2-.8*1.6-4.8-18.4/2,axis:'z',length:18.4,width:5,minWidth:5,crest:.45,railSides:[-1,1]};
test('An indexed Wuying rail input and its converted output each release once if UV generation throws',()=>{
 const original=T.BufferGeometry.prototype.toNonIndexed,seen=[];try{
  T.BufferGeometry.prototype.toNonIndexed=function(...args){const converted=original.apply(this,args),row={input:0,converted:0};this.addEventListener('dispose',()=>row.input++);converted.addEventListener('dispose',()=>row.converted++);const set=converted.setAttribute;converted.setAttribute=function(name,...rest){if(name==='uv')throw Error('injected UV ownership failure');return set.call(this,name,...rest);};seen.push(row);return converted;};
  assert.throws(()=>buildWuyingThreeBridgeRails(library(),bridge),/injected UV ownership failure/);assert.equal(seen.length,1);assert.deepEqual(seen[0],{input:1,converted:1});
 }finally{T.BufferGeometry.prototype.toNonIndexed=original;}
});
