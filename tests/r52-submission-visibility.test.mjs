import test from 'node:test';
import assert from 'node:assert/strict';
import {assertSubmittedVisibility} from './lib/r52-submission-visibility.mjs';
test('target guard still requires full submitted visibility',()=>{
 assert.equal(assertSubmittedVisibility(1),1);
 assert.throws(()=>assertSubmittedVisibility(.008333333767950535));
});
test('unrelated fading geometry is a conservative blocker, not an accepted target',()=>{
 assert.equal(assertSubmittedVisibility(.008333333767950535,{requireFullVisibility:false}),.008333333767950535);
 for(const value of [0,-1,1.1,NaN,Infinity])assert.throws(()=>assertSubmittedVisibility(value,{requireFullVisibility:false}));
});
