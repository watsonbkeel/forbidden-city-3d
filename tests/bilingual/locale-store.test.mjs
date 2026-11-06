import test from 'node:test';
import assert from 'node:assert/strict';
const module = await import('../../src/i18n/LocaleStore.js').catch(() => ({}));
const create = options => { assert.equal(typeof module.createLocaleStore, 'function', 'locale store is implemented'); return module.createLocaleStore(options); };
test('Chinese remains default and unknown persisted locale is ignored', () => {
 for (const value of [null, '', 'fr', 'EN', 'zh']) {
  const s = create({getStorage: () => ({getItem: () => value})});
  assert.equal(s.locale, 'zh-CN');
  assert.equal(s.setLocale('bogus'), false); assert.equal(s.locale, 'zh-CN');
 }
});
test('saved English is restored and valid changes are persisted once', () => {
 const writes=[]; const s=create({getStorage:()=>({getItem:key => {assert.equal(key,'palace.locale');return 'en';},setItem:(...a)=>writes.push(a)})});
 assert.equal(s.locale,'en'); assert.equal(s.setLocale('zh-CN'),true);
 assert.deepEqual(writes,[['palace.locale','zh-CN']]);
 assert.equal(s.setLocale('zh-CN'),false); assert.equal(writes.length,1);
});
test('storage getter, read and write exceptions never prevent language selection', () => {
 for (const getStorage of [()=>{throw Error('denied');},()=>({getItem(){throw Error('read');}}),()=>({getItem:()=>null,setItem(){throw Error('quota');}})]) {
  const s=create({getStorage}); assert.equal(s.locale,'zh-CN');
  assert.equal(s.setLocale('en'),true); assert.equal(s.locale,'en');
 }
});
test('subscribers observe real changes and can unsubscribe and dispose', () => {
 const s=create({getStorage:()=>null}), seen=[];
 const remove=s.subscribe(value=>seen.push(value));
 s.setLocale('en');s.setLocale('en');s.setLocale('zh-CN');remove();s.setLocale('en');
 assert.deepEqual(seen,['en','zh-CN']);
 s.subscribe(value=>seen.push(value));s.dispose();s.setLocale('zh-CN');assert.equal(seen.length,2);
});
