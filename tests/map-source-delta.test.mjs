import test from 'node:test';
import {restorePlaceInfoBytes} from './lib/place-info-source-delta.mjs';
import {restoreLoadingWelcomeBytes} from './lib/loading-welcome-source-delta.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {restoreV10EntryMainBytes} from './lib/v13-entry-source-delta.mjs';
import {readHistoricalSource} from './lib/historical-sources.mjs';
import baseline from './fixtures/v7-qinan-route-baseline.json' with {type:'json'};
import {V9_INPUT_INSERTIONS,expectedV9FirstPersonBytes} from './lib/v9-input-source-delta.mjs';
import {V9_MAP_SOURCE_DELTA as delta,applyV9MapSourceDelta,assertV9MapFirstPersonBytes,assertV9MapJoystickBytes,assertV9MapMainBytes,expectedV9JoystickBytes,V9_JOYSTICK_INPUT_INSERTIONS} from './lib/v9-map-source-delta.mjs';
const root=new URL('..',import.meta.url);
const old=path=>readHistoricalSource(baseline.commit,path);
const frozen=path=>readHistoricalSource(delta.frozenComponentCommit,path);
const current=path=>{
 const bytes=fs.readFileSync(new URL(path,root));
 return path==='main.js'?restoreV10EntryMainBytes(restorePlaceInfoBytes('main.js', restoreLoadingWelcomeBytes(bytes))):bytes;
};

test('actual FirstPerson is exactly historical bytes → frozen input component → finite V9 map delta',()=>{
 const path='src/controls/FirstPerson.js';
 assert.deepEqual(expectedV9FirstPersonBytes(old(path)),frozen(path));
 assertV9MapFirstPersonBytes(old(path),current(path));
});
test('actual VirtualJoystick is exactly the frozen session-generation component plus map target exclusions',()=>{
 const path='src/controls/VirtualJoystick.js';assert.deepEqual(expectedV9JoystickBytes(old(path)),frozen(path));assertV9MapJoystickBytes(old(path),current(path));
});
for(const [path,record] of Object.entries(delta.files)) {
 for(const [i,{before,after}]of record.hunks.entries())test(`map delta ${path} hunk ${i+1} rejects missing/duplicate context and omitted or changed replacement`,()=>{
  const source=frozen(path).toString();
  for(const replacement of ['',before+before])assert.throws(()=>applyV9MapSourceDelta(path,Buffer.from(source.replace(before,replacement))),/context must occur once/);
  const exact=current(path);
  for(const replacement of [before,after+'\n'])assert.notDeepEqual(Buffer.from(exact.toString().replace(after,replacement)),applyV9MapSourceDelta(path,frozen(path)));
 });
 test(`map delta ${path} rejects unrelated frozen/current edits`,()=>{
  assert.throws(()=>applyV9MapSourceDelta(path,Buffer.concat([frozen(path),Buffer.from('\n')])),/unchanged frozen/);
  const check=path.includes('FirstPerson')?bytes=>assertV9MapFirstPersonBytes(old(path),bytes):path==='main.js'?bytes=>assertV9MapMainBytes(old(path),bytes):bytes=>assertV9MapJoystickBytes(old(path),bytes);
  assert.throws(()=>check(Buffer.concat([current(path),Buffer.from('\n')])),/must equal/);
  if(path.includes('FirstPerson'))assert.throws(()=>check(Buffer.from(current(path).toString().replace('Math.exp(-10 * delta)','Math.exp(-11 * delta)'))),/must equal/);
 });
}
test('unknown paths cannot obtain a map source exception',()=>{
 assert.throws(()=>applyV9MapSourceDelta('src/utils/Collision.js',current('src/utils/Collision.js')),/No approved/);
});

for(const [i,{addition}]of V9_INPUT_INSERTIONS.entries())test(`actual map controller rejects deleted or relocated frozen input addition ${i+1}`,()=>{
 const path='src/controls/FirstPerson.js',source=current(path).toString();
 assert.equal(source.split(addition).length-1,1);
 for(const changed of [source.replace(addition,''),addition+source.replace(addition,'')]) {
  assert.throws(()=>assertV9MapFirstPersonBytes(old(path),Buffer.from(changed)),/must equal/);
 }
});
for(const [i,{anchor,addition}]of V9_JOYSTICK_INPUT_INSERTIONS.entries())test(`joystick historical composition rejects missing/duplicate context and deleted input addition ${i+1}`,()=>{
 const path='src/controls/VirtualJoystick.js';
 for(const replacement of ['',anchor+anchor])assert.throws(()=>expectedV9JoystickBytes(Buffer.from(old(path).toString().replace(anchor,replacement))),/context must occur once/);
 assert.throws(()=>assertV9MapJoystickBytes(old(path),Buffer.from(current(path).toString().replace(addition,''))),/must equal/);
});
for(const [name,before,after]of [
 ['speed','sprint ? PLAYER.SPRINT_SPEED : PLAYER.MOVE_SPEED','sprint ? 13 : 6'],
 ['body','        0.5,','        0.4,'],
 ['collision','this.collisionManager.getValidPosition(','this.collisionManager.getGroundHeight('],
 ['dt cap','/ 1000, 0.1)','/ 1000, 0.2)'],
])test(`composed current-source guard rejects ${name} mutation`,()=>{
 const path='src/controls/FirstPerson.js',source=current(path).toString();assert.ok(source.includes(before));
 assert.throws(()=>assertV9MapFirstPersonBytes(old(path),Buffer.from(source.replace(before,after))),/must equal/);
});

test('main.js after exact entry restoration equals pinned historical source plus only finite map wiring changes',()=>{
 const path='main.js';assert.deepEqual(old(path),frozen(path));assertV9MapMainBytes(old(path),current(path));
});
for(const [name,before,after]of [
 ['environment initialization','    this.environment.init();',''],
 ['lighting shadow setup','this.shadowSetup = new ShadowSetup(this.renderer);','this.shadowSetup = null;'],
 ['renderer quality','this.renderer.setPixelRatio','this.renderer.setSize'],
])test(`map main-source guard rejects unrelated ${name} removal/mutation`,()=>{
 const path='main.js',source=current(path).toString();assert.ok(source.includes(before));
 assert.throws(()=>assertV9MapMainBytes(old(path),Buffer.from(source.replace(before,after))),/must equal/);
});
