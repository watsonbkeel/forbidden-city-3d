import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setupMap} from '../lib/map-fixture.mjs';
import {localeStore} from '../../src/i18n/LocaleStore.js';

// Real UI state/ownership only. The fixture has no CSS layout or native hit test.
// Original browser matrix still must prove complete 44px action visibility.
for(const mobile of [false,true])for(const locale of ['zh-CN','en']){
 test(`unique close stays in the initial controls across map/detail/compact: ${mobile}/${locale}`,async t=>{
  localeStore.setLocale(locale);t.after(()=>localeStore.setLocale('zh-CN'));
  const s=await setupMap(t,{mobile}),map=s.map,close=map.closeButton;
  const presentation=map.container.querySelector('#minimap-presentation');
  const assertMapClose=()=>{assert.equal(close.parentNode===presentation,true,'close must not be after the long directory');assert.equal(presentation.children[0]===close,true);assert.equal(map.container.querySelectorAll('#minimap-close').length,1);assert.equal(close.inert,false);assert.equal(close.hidden,false);};
  assertMapClose();map.toggle();assertMapClose();
  const originalPosition=s.logical().toArray(),keys=map.container.querySelectorAll('[data-teleport]').map(n=>n.dataset.teleport);
  const returnButton=map.directoryEntries.find(e=>e.place?.id==='taihe')?.button??map.sizeToggle;
  returnButton.focus();map.showPlace('taihe');assert.equal(close.parentNode===map.placeHeader,true);
  map.backToMap();assertMapClose();assert.equal(s.document.activeElement===returnButton,true);
  for(const compact of [true,false,true,false]){map.setCompact(compact);assertMapClose();}
  localeStore.setLocale(locale==='en'?'zh-CN':'en');assertMapClose();
  assert.deepEqual(map.container.querySelectorAll('[data-teleport]').map(n=>n.dataset.teleport),keys);
  assert.deepEqual(s.logical().toArray(),originalPosition);assert.deepEqual(s.teleports,[]);
  close.click();assert.equal(map.visible,false,'same bound close still closes');map.toggle();assertMapClose();
 });
 test(`map-only water notice leaves detail flow and returns unchanged: ${mobile}/${locale}`,async t=>{
  localeStore.setLocale(locale);t.after(()=>localeStore.setLocale('zh-CN'));
  const s=await setupMap(t,{mobile}),map=s.map,notice=map.container.querySelector('#minimap-moat-status');
  map.hasTeleportTarget=name=>name==='太和殿';map.toggle();const text=notice.textContent;
  assert.equal(notice.hidden,false);assert.equal(notice.inert,false);
  map.showPlace('taihe');assert.equal(notice.hidden,true,'map-only notice must not shrink detail action viewport');assert.equal(notice.inert,true);
  assert.equal(map.placePanel.element.hidden,false);assert.ok(map.placePanel.element.querySelector('#place-travel'));
  const fullText=map.placePanel.element.textContent,selection={...map.selection};
  localeStore.setLocale(locale==='en'?'zh-CN':'en');assert.equal(notice.hidden,true);assert.equal(notice.inert,true);assert.deepEqual(map.selection,selection);
  localeStore.setLocale(locale);assert.equal(map.placePanel.element.textContent,fullText,'full card text retained');
  map.backToMap();assert.equal(notice.hidden,false);assert.equal(notice.inert,false);assert.equal(notice.textContent,text);
  map.showPlace('taihe');map.placePanel.element.querySelector('#place-travel').click();assert.deepEqual(s.teleports,['太和殿']);assert.equal(map.visible,false);
 });
}

test('map-open explicitly hides the location node even outside the hidden HUD dock',()=>{
 const css=fs.readFileSync('style.css','utf8');
 assert.match(css,/body\[data-tour-hud="top"\]\.map-open #location-panel\s*\{\s*visibility:\s*hidden;?\s*\}/);
 assert.doesNotMatch(css,/body\[data-tour-hud="top"\](?!\.map-open)[^{]*#location-panel\s*\{[^}]*visibility:\s*hidden/,'closed location must remain visible');
 assert.match(css,/#minimap #place-header button,[\s\S]*?#minimap #place-info button\s*\{[^}]*min-height:\s*44px/,'keep original 44px actions');
});
