import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const status=JSON.parse(fs.readFileSync('docs/current-state/r48-remaining/current-70-status.json'));
test('R48 every classified scope has a dated source receipt without treating missing evidence as completion',()=>{
 assert.equal(status.buildings.length,70);
 for(const b of status.buildings){
  assert.equal(b.accepted,false,b.id);
  for(const side of ['exterior','interior']){
   const s=b[side];if(s.status==='pending')continue;
   assert.ok(s.evidence.length,`${b.id}/${side} needs a reviewed source or an explicit source limitation`);
   for(const e of s.evidence){assert.match(e.source,/^https:\/\//);assert.ok(e.targetState);assert.ok(e.relationship);}
   assert.ok(Array.isArray(s.limitations));
  }
 }
});
test('Six retained integration identities describe actual retained systems and unresolved evidence, not generic completion',()=>{
 for(const id of ['tiren','hongyi','taihe','qianqing','jiaotai','kunning']){
  const b=status.buildings.find(b=>b.id===id);
  for(const side of ['exterior','interior']){
   assert.equal(b[side].status,'reviewed-retained');
   assert.match(b[side].changes.join(''),({tiren:/柱网|木地板/,hongyi:/柱网|木板/,taihe:/十一间|六金柱/,qianqing:/九间|平顶/,jiaotai:/三间|座屏/,kunning:/偏门|分区/})[id]);
   assert.doesNotMatch(b[side].changes.join(''),/核查保留既有专用/);
   assert.ok(b[side].limitations.length);
  }
 }
});
