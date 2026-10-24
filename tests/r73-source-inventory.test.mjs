import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('R73 explicit successor verifies inherited R72 bytes and rejects unknown changes',async()=>{
 assert.ok(fs.existsSync('scripts/r73-source-inventory.mjs'),'successor validator exists');
 const {validateSuccessor}=await import('../scripts/r73-source-inventory.mjs');
 const base=[{path:'a',bytes:1,sha256:'old'}],delta=[{path:'a',before:base[0],after:{path:'a',bytes:2,sha256:'new'}},{path:'b',before:null,after:{path:'b',bytes:1,sha256:'add'}}],actual=delta.map(x=>x.after);
 assert.equal(validateSuccessor(base,delta,actual),true);
 for(const bad of[[...actual,{path:'c',bytes:1,sha256:'unknown'}],actual.slice(1),[{...actual[0],sha256:'mutation'},actual[1]]])assert.throws(()=>validateSuccessor(base,delta,bad));
 assert.throws(()=>validateSuccessor(base,[{...delta[0],before:{...base[0],sha256:'wrong'}},delta[1]],actual));
 assert.throws(()=>validateSuccessor(base,[...delta,delta[0]],actual));
});
