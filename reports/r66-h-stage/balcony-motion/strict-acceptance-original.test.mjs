// Frozen original R66 rendered-triangle replay evidence. This intentionally
// retains red assertions: no expected-failure wrapper and no contact filtering.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rows=JSON.parse(readFileSync(new URL('./r65-r66-initial-matrix.json',import.meta.url)));
for(const r of rows.filter(r=>r.label==='R66'&&r.jump))test(`ORIGINAL R66 full-body jump fps=${r.fps} sprint=${r.sprint} diagonal=${r.diagonal}`,()=>{
 const first=r.contacts[0];
 assert.equal(r.contacts.length,0,JSON.stringify({contactCount:r.contacts.length,first,head:first?first.feet+1.7:null}));
 assert.equal(r.sweptContacts.length,0,'Conservative swept chord must remain clear too');
});
