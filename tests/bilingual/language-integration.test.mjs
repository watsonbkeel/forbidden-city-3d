import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setupMap} from '../lib/map-fixture.mjs';
import {localeStore} from '../../src/i18n/LocaleStore.js';
test('settings exposes language choice without toggling quality, sound or map state',async t=>{
 const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));
 const select=s.menu.panel.querySelector('#settings-language');assert.ok(select,'settings language selector exists');
 const state=[s.menu.currentQuality,s.menu.soundEnabled,s.map.visible,s.map.selection,s.menu.visible];
 select.value='en';s.dispatch(select,'change');assert.equal(localeStore.locale,'en');
 assert.deepEqual([s.menu.currentQuality,s.menu.soundEnabled,s.map.visible,s.map.selection,s.menu.visible],state);
});
test('app creates and disposes a presentation selector instead of changing the world on locale input',()=>{
 const s=readFileSync(new URL('../../main.js',import.meta.url),'utf8');
 assert.match(s,/this\.languageControl = new LanguageControl\(/);
 assert.match(s,/this\.languageControl\?\.dispose\(/);
});
test('open map has its own in-flow language selector that changes only presentation',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.showPlace('taihe');const select=s.map.container.querySelector('#map-language');assert.ok(select,'map selector avoids floating over card text');assert.ok(s.map.container.querySelector('#minimap-presentation').contains(select));const selection={...s.map.selection},view={...s.map.view};select.value='en';s.dispatch(select,'change');assert.equal(localeStore.locale,'en');assert.deepEqual(s.map.selection,selection);assert.deepEqual(s.map.view,view);assert.deepEqual(s.teleports,[]);
});
test('portrait orientation pseudo-element has an explicit English document-language override',()=>{
 const css=readFileSync(new URL('../../style.css',import.meta.url),'utf8');assert.match(css,/html\[lang=["']?en["']?\] body::before\s*\{[^}]*content:\s*["']For a better experience, rotate your device["']/);
});
