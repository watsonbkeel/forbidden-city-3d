// Deliberately RED engineering acceptance. This is not a retained-scope test
// and must not be reported as passed because ordinary walking is contained.
import test from 'node:test';import assert from 'node:assert/strict';
import {fixture} from '../../../tests/lib/r66-h/fixture.mjs';
import {collisionFixture,replayBalcony} from '../../../tests/lib/r66-h/balcony-motion.mjs';
for(const fps of [10,60])for(const sprint of [false,true])for(const diagonal of [-1,0,1])test(`CURRENT strict full-body immediate jump ${fps}Hz sprint=${sprint} diagonal=${diagonal}`,t=>{
 const w=collisionFixture(fixture('延春阁'));try{const r=replayBalcony(t,w,{fps,sprint,diagonal,jump:true});assert.equal(r.contacts.length,0,JSON.stringify({count:r.contacts.length,first:r.contacts[0]}));assert.equal(r.sweptContacts.length,0);}finally{w.dispose();}
});
for(const fps of [10,60])test(`CURRENT strict full-body real rail step-off/drop ${fps}Hz`,t=>{
 const w=collisionFixture(fixture('延春阁'));try{const r=replayBalcony(t,w,{fps,jump:true,moveAfter:.2,stopAfter:.35,resumeAfter:1.4,seconds:3});assert.equal(r.contacts.length,0,JSON.stringify({count:r.contacts.length,first:r.contacts[0]}));assert.equal(r.sweptContacts.length,0);}finally{w.dispose();}
});
