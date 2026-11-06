import test from 'node:test';import assert from 'node:assert/strict';
import {createLocaleStore} from '../../src/i18n/LocaleStore.js';
const module=await import('../../src/i18n/DomLocalization.js').catch(()=>({}));
function dom(){
 const text=value=>({nodeType:3,nodeValue:value,parentNode:null});
 const el=(tag,children=[],attrs={})=>{const node={nodeType:1,tagName:tag.toUpperCase(),childNodes:children,parentNode:null,attrs:{...attrs},getAttribute:k=>node.attrs[k]??null,setAttribute:(k,v)=>node.attrs[k]=String(v),contains:n=>n===node||node.childNodes.some(c=>c.nodeType===1?c.contains(n):c===n)};children.forEach(c=>c.parentNode=node);return node;};
 let observer;class Observer{constructor(fn){this.fn=fn;observer=this;}observe(){this.active=true;}disconnect(){this.active=false;}flush(records){if(this.active)this.fn(records);}}
 return{text,el,Observer,get observer(){return observer;}};
}
const translate=(s,l)=>l==='en'?s.replace('关闭','Close').replace('搜索地点','Search places'):s;
test('text and safe attributes change in place; input, values, listeners and disclosure state remain',async()=>{
 assert.equal(typeof module.localizeDom,'function','DOM localizer exists');const d=dom(),store=createLocaleStore({getStorage:()=>null});
 const content=d.text('关闭'),button=d.el('button',[content],{'aria-label':'关闭'}),input=d.el('input',[],{placeholder:'搜索地点'}),details=d.el('details',[button,input]);details.open=true;input.value='typed';button.onClick=()=>42;const root=d.el('body',[details]);
 const local=module.localizeDom(root,{store,translate,MutationObserver:d.Observer});store.setLocale('en');await Promise.resolve();
 assert.equal(content.nodeValue,'Close');assert.equal(button.getAttribute('aria-label'),'Close');assert.equal(input.getAttribute('placeholder'),'Search places');assert.equal(input.value,'typed');assert.equal(button.onClick(),42);assert.equal(details.open,true);assert.equal(details.childNodes[0],button);
 store.setLocale('zh-CN');await Promise.resolve();assert.equal(content.nodeValue,'关闭');assert.equal(input.getAttribute('placeholder'),'搜索地点');local.dispose();
});
test('dynamic updates translate once and translate=no, scripts and text inputs are preserved',async()=>{
 assert.equal(typeof module.localizeDom,'function');const d=dom(),store=createLocaleStore({getStorage:()=>null});store.setLocale('en');
 const status=d.text('关闭'),ignored=d.text('关闭'),script=d.text('关闭'),root=d.el('body',[d.el('p',[status]),d.el('label',[ignored],{translate:'no'}),d.el('script',[script])]);
 const local=module.localizeDom(root,{store,translate,MutationObserver:d.Observer});assert.equal(status.nodeValue,'Close');assert.equal(ignored.nodeValue,'关闭');assert.equal(script.nodeValue,'关闭');
 status.nodeValue='搜索地点';d.observer.flush([{type:'characterData',target:status}]);assert.equal(status.nodeValue,'Search places');
 d.observer.flush([{type:'characterData',target:status}]);assert.equal(status.nodeValue,'Search places','self mutation does not re-translate');
 store.setLocale('zh-CN');await Promise.resolve();assert.equal(status.nodeValue,'搜索地点');
 local.dispose();store.setLocale('en');await Promise.resolve();assert.equal(status.nodeValue,'搜索地点');
});
test('detached nodes are not touched by delayed mutation callbacks',()=>{
 assert.equal(typeof module.localizeDom,'function');const d=dom(),store=createLocaleStore({getStorage:()=>null}),node=d.text('关闭'),root=d.el('body',[node]);
 const local=module.localizeDom(root,{store,translate,MutationObserver:d.Observer});root.childNodes=[];node.parentNode=null;store.setLocale('en');d.observer.flush([{type:'characterData',target:node}]);assert.equal(node.nodeValue,'关闭');local.dispose();
});
test('textarea safe attributes translate while diagnostic text and editable value remain unchanged',async()=>{
 const d=dom(),store=createLocaleStore({getStorage:()=>null}),text=d.text('关闭'),textarea=d.el('textarea',[text],{'aria-label':'关闭',title:'关闭',placeholder:'搜索地点'}),root=d.el('body',[textarea]);textarea.value='关闭 diagnostic JSON';
 const local=module.localizeDom(root,{store,translate,MutationObserver:d.Observer});store.setLocale('en');await Promise.resolve();
 assert.equal(textarea.getAttribute('aria-label'),'Close');assert.equal(textarea.getAttribute('title'),'Close');assert.equal(textarea.getAttribute('placeholder'),'Search places');assert.equal(text.nodeValue,'关闭');assert.equal(textarea.value,'关闭 diagnostic JSON');
 text.nodeValue='搜索地点';d.observer.flush([{type:'characterData',target:text}]);assert.equal(text.nodeValue,'搜索地点');
 store.setLocale('zh-CN');await Promise.resolve();assert.equal(textarea.getAttribute('aria-label'),'关闭');local.dispose();
});
