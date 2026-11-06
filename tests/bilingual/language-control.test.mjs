import test from 'node:test';
import assert from 'node:assert/strict';
import {createDOM} from '../lib/ui-dom.mjs';
const module = await import('../../src/ui/LanguageControl.js').catch(() => ({}));
test('visible native selector exposes both languages, shares state and keeps focus', async () => {
 assert.equal(typeof module.LanguageControl,'function','language control is implemented');
 const {createLocaleStore}=await import('../../src/i18n/LocaleStore.js');
 const {document,dispatch}=createDOM(), store=createLocaleStore({getStorage:()=>null});
 const a=new module.LanguageControl({store,document,container:document.body,id:'tour-language'});
 const b=new module.LanguageControl({store,document,container:document.body,id:'settings-language'});
 assert.deepEqual(a.select.querySelectorAll('option').map(x=>x.textContent),['中文','English']);
 assert.equal(a.select.getAttribute('aria-label'),'语言 / Language');
 assert.equal(a.select.value,'zh-CN');a.select.focus();a.select.value='en';dispatch(a.select,'change');
 assert.equal(store.locale,'en');assert.equal(b.select.value,'en');assert.equal(document.activeElement,a.select);
 assert.equal(dispatch(a.select,'pointerdown').stopped,true,'UI does not start world gestures');
 const old=b.select;b.dispose();store.setLocale('zh-CN');assert.equal(old.value,'en');
 a.dispose();assert.equal(document.body.children.length,0);
});
test('persistent selector sets document language, keeps its bilingual labels untranslated and cleans up',async()=>{
 const {createLocaleStore}=await import('../../src/i18n/LocaleStore.js');const {document}=createDOM();document.documentElement=document.createElement('html');
 const store=createLocaleStore({getStorage:()=>({getItem:()=> 'en'})});
 const control=new module.LanguageControl({store,document,container:document.body});
 assert.equal(document.documentElement.getAttribute('lang'),'en');assert.equal(control.element.getAttribute('translate'),'no');
 store.setLocale('zh-CN');assert.equal(document.documentElement.getAttribute('lang'),'zh-CN');control.dispose();
});
