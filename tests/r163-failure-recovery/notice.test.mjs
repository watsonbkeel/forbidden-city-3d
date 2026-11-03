import test from 'node:test';
import assert from 'node:assert/strict';
import {createDOM} from '../lib/ui-dom.mjs';
let Notice;try{({TourFailureNotice:Notice}=await import('../../src/ui/TourFailureNotice.js'));}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;}
function fixture(t,reload=()=>{}){
 assert.equal(typeof Notice,'function','missing accessible failure notice');
 const d=createDOM(),prior={document:globalThis.document,window:globalThis.window};Object.assign(globalThis,{document:d.document,window:d.window});
 const background=d.document.createElement('button'),alreadyInert=d.document.createElement('div');alreadyInert.inert=true;d.document.body.append(background,alreadyInert);background.focus();
 const notice=new Notice(d.document.body,{reload});t.after(()=>{notice.dispose();Object.assign(globalThis,prior);});
 return{...d,background,alreadyInert,notice,dialog:()=>d.document.getElementById('tour-failure-dialog'),button:()=>d.document.getElementById('tour-reload-btn')};
}
test('failure notice is an accessible modal with focus, reload warning and preserved background states',t=>{
 const f=fixture(t);f.notice.show();const dialog=f.dialog(),button=f.button();assert.ok(dialog);assert.ok(button);
 assert.equal(dialog.getAttribute('role'),'alertdialog');assert.equal(dialog.getAttribute('aria-modal'),'true');
 assert.ok(f.document.getElementById(dialog.getAttribute('aria-labelledby')));assert.match(f.document.getElementById(dialog.getAttribute('aria-describedby')).textContent,/起点/);
 assert.equal(f.document.activeElement,button);assert.equal(f.background.inert,true);assert.equal(f.alreadyInert.inert,true);
 for(const shiftKey of [false,true]){const e=f.dispatch(button,'keydown',{key:'Tab',code:'Tab',shiftKey});assert.equal(e.defaultPrevented,true);assert.equal(f.document.activeElement,button);}
 const escape=f.dispatch(button,'keydown',{key:'Escape',code:'Escape'});assert.equal(escape.stopped,true);assert.ok(f.dialog());
 f.notice.dispose();assert.equal(f.dialog(),null);assert.equal(f.background.inert,false);assert.equal(f.alreadyInert.inert,true);assert.equal(f.document.activeElement,f.background);
});
test('repeated show and repeated activation request reload once without duplicate dialogs',t=>{
 let reloads=0;const f=fixture(t,()=>reloads++);for(let i=0;i<10;i++)f.notice.show();assert.equal(f.document.body.querySelectorAll('#tour-failure-dialog').length,1);
 f.button().click();f.button().click();f.dispatch(f.button(),'click',{detail:0});assert.equal(reloads,1);assert.equal(f.button().disabled,true);
 f.notice.dispose();f.notice.dispose();f.notice.show();assert.equal(f.dialog(),null);
});
test('failed reload remains stopped and gives browser-refresh guidance instead of hiding failure',t=>{
 const f=fixture(t,()=>{throw Error('reload denied');});f.notice.show();assert.doesNotThrow(()=>f.button().click());assert.ok(f.dialog());assert.match(f.dialog().textContent,/浏览器.*刷新/);assert.equal(f.button().disabled,false);
});

test('touch activation and recovery focus stay isolated from background game handlers',t=>{
 let reloads=0,backgroundEvents=0;const f=fixture(t,()=>reloads++);
 for(const type of ['pointerdown','pointerup','touchstart','touchend','click','keydown'])f.document.body.addEventListener(type,()=>backgroundEvents++);
 f.notice.show();const button=f.button();
 f.background.focus();f.dispatch(f.background,'focusin');assert.equal(f.document.activeElement,button);
 for(const type of ['pointerdown','pointerup','touchstart','touchend'])f.dispatch(button,type,{pointerType:'touch'});
 const enter=f.dispatch(button,'keydown',{key:'Enter',code:'Enter'});assert.equal(enter.defaultPrevented,false,'native button keyboard activation must not be cancelled');
 button.click();assert.equal(reloads,1);assert.equal(backgroundEvents,0);
 f.notice.dispose();button.click();assert.equal(reloads,1,'detached button listener must be removed');
});
