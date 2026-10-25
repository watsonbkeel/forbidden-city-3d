import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const original=fs.readFileSync(new URL('./fixtures/r89/qianqing-r88.json',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const expected=JSON.parse(original);expected.floor={mode:'fixed',y:2.16};
const verify=current=>assert.deepEqual(current,expected,'only the explicit permanent-floor correction is authorized');
test('R89 Qianqing floor correction preserves every other frozen R88 field',()=>{
 assert.equal(hash(original),'dff330c932b58a856feccd27d558bff16969a46855bc907fccf9c610d4d24aee');verify(JSON.parse(fs.readFileSync(new URL('../data/interiors/qianqing.json',import.meta.url))));
 for(const key of Object.keys(expected).filter(k=>k!=='floor')){const value=structuredClone(expected);value[key]=null;assert.throws(()=>verify(value),key);}
 for(const floor of[{mode:'ground',y:null},{mode:'fixed',y:2.72},{mode:'fixed',y:2.16,extra:true}]){const value=structuredClone(expected);value.floor=floor;assert.throws(()=>verify(value));}
});
