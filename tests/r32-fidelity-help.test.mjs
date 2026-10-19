import test from 'node:test';
import assert from 'node:assert/strict';
import {createDOM} from './lib/ui-dom.mjs';
import {HelpPanel} from '../src/ui/HelpPanel.js';
import {modelFidelityFor} from '../src/ui/ModelFidelity.js';
import {PlaceInfoPanel} from '../src/ui/PlaceInfoPanel.js';

function fixture(t,mobile=false){const d=createDOM(),old={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:d.document,window:d.window});const help=new HelpPanel({isMobile:mobile});t.after(()=>{help.dispose();Object.assign(globalThis,old);});return{...d,help};}
for(const mobile of[false,true])test(`compact recoverable help defaults closed and toggles using a real button (${mobile?'touch':'desktop'})`,t=>{
 const {help,document}=fixture(t,mobile);assert.equal(help.expanded,false);assert.equal(help.body.hidden,true);assert.equal(help.button.getAttribute('aria-expanded'),'false');
 help.button.click();assert.equal(help.expanded,true);assert.equal(help.body.hidden,false);assert.match(help.body.textContent,/地图打开时仍可移动/);help.button.click();assert.equal(help.expanded,false);
 assert.equal(document.body.querySelectorAll('#help-panel').length,1);
});
test('question mark toggles help without capturing movement, map, aircraft or Escape keys',t=>{
 const {help,document,dispatch}=fixture(t);
 for(const key of['w','a','s','d','q','e','m','h','Escape',' ']){const e=dispatch(document.body,'keydown',{key});assert.equal(e.defaultPrevented,false);assert.equal(help.expanded,false);}
 assert.equal(dispatch(document.body,'keydown',{key:'?',code:'Slash',shiftKey:true}).defaultPrevented,true);assert.equal(help.expanded,true);
 dispatch(document.body,'keydown',{key:'?',repeat:true});assert.equal(help.expanded,true);
 dispatch(document.body,'keydown',{key:'?',ctrlKey:true});assert.equal(help.expanded,true);
 const input=document.createElement('input');document.body.appendChild(input);assert.equal(dispatch(input,'keydown',{key:'?'}).defaultPrevented,false);assert.equal(help.expanded,true);
 dispatch(document.body,'keydown',{key:'?'});assert.equal(help.expanded,false);
});
test('help disposal removes its only listener and all DOM without touching player state',t=>{
 const {help,window,document}=fixture(t);assert.equal(window.listenerCount(),2);help.dispose();assert.equal(window.listenerCount(),0);assert.equal(document.getElementById('help-panel'),null);help.dispose();assert.equal(window.listenerCount(),0);
});
test('help follows actual location-label height including a third status line and viewport resize',t=>{
 const {help,window,dispatch}=fixture(t);let bottom=112;help.anchor={getBoundingClientRect:()=>({bottom,left:20})};window.innerHeight=667;
 help.placeBelow(help.anchor);assert.equal(help.element.style.top,'120px');assert.equal(help.element.style.left,'20px');assert.equal(help.body.style.maxHeight,'527px');
 bottom=144;dispatch(window,'resize');assert.equal(help.element.style.top,'152px');assert.equal(help.body.style.maxHeight,'495px');
 help.placeBelow({getBoundingClientRect:()=>({bottom:NaN,left:20})});assert.equal(help.element.style.top,'152px');
});
test('eleven palace notes distinguish verified bay count from unverified generic interior',()=>{
 for(const n of['景仁宫','承乾宫','钟粹宫','永和宫','永寿宫','翊坤宫','储秀宫','太极殿','长春宫']){assert.match(modelFidelityFor(n).short,/5间/);assert.match(modelFidelityFor(n).detail,/通用示意/);}
 for(const n of['景阳宫','咸福宫'])assert.match(modelFidelityFor(n).short,/3间/);
 assert.equal(modelFidelityFor('未核建筑'),null);assert.equal(modelFidelityFor(undefined),null);
 for(const n of['乾清宫','延禧宫','皇极门','内金水桥'])assert.ok(modelFidelityFor(n)?.detail);
 assert.match(modelFidelityFor('延禧宫').detail,/未完工灵沼轩/);assert.match(modelFidelityFor('乾清宫').detail,/拍摄日期.*尚未核定/);
});
test('model note appears in the place card without changing history, target or return ownership',t=>{
 const {document}=fixture(t);const panel=new PlaceInfoPanel();document.body.appendChild(panel.element);t.after(()=>panel.dispose());let trips=0;
 panel.render({name:'承乾宫',place:null,canTravel:false,onTravel:()=>trips++});assert.match(panel.element.textContent,/本版模型说明/);assert.match(panel.element.textContent,/通用示意/);assert.equal(trips,0);
 panel.render({name:'未核建筑',place:null,canTravel:false,onTravel:()=>trips++});assert.doesNotMatch(panel.element.textContent,/通用示意/);assert.equal(trips,0);
});
