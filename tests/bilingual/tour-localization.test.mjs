import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createDOM} from '../lib/ui-dom.mjs';import {createLocaleStore} from '../../src/i18n/LocaleStore.js';
const module=await import('../../src/ui/TourLocalization.js').catch(()=>({}));
test('shared tour localization updates document title without reload and disposes',()=>{
 assert.equal(typeof module.TourLocalization,'function','shared locale bootstrap exists');
 const {document}=createDOM();document.title='故宫 3D 虚拟游览 | Forbidden City 3D Tour';const original=document.title;
 const store=createLocaleStore({getStorage:()=>null});const shared=new module.TourLocalization({document,store});
 store.setLocale('en');assert.doesNotMatch(document.title,/[\u3400-\u9fff]/u);store.setLocale('zh-CN');assert.equal(document.title,original);shared.dispose();store.setLocale('en');assert.equal(document.title,original);
});
test('main and component browser harness use the same presentation bootstrap',()=>{
 for(const path of ['../../main.js','./browser/fixture.js']){const source=readFileSync(new URL(path,import.meta.url),'utf8');assert.match(source,/new TourLocalization\(/);}
});
