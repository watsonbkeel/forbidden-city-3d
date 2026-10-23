import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {SettingsMenu} from '../src/ui/SettingsMenu.js';
import {createDOM} from './lib/ui-dom.mjs';

const css=fs.readFileSync(new URL('../style.css',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../src/ui/SettingsMenu.js',import.meta.url),'utf8');
const report={boundary:'Real SettingsMenu in the retained event/focus DOM shell, static CSS contracts and optional host-font numeric bounds. No browser layout, native keyboard default synthesis, WebGL, screenshot or device-touch acceptance is claimed.',sourceSha256:createHash('sha256').update(source).digest('hex'),cssSha256:createHash('sha256').update(css).digest('hex'),checks:{}};
after(()=>{fs.mkdirSync('reports/r65-character-experience',{recursive:true});fs.writeFileSync('reports/r65-character-experience/credit-ui-contract.json',JSON.stringify(report,null,2)+'\n');});
function setup(t,options={}){
 const saved=new Map(['document','window'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)])),dom=createDOM();
 Object.assign(globalThis,{document:dom.document,window:dom.window});
 const scene=document.createElement('div');scene.id='scene-container';document.body.appendChild(scene);
 const menu=new SettingsMenu(document.body);menu.init(options);
 t.after(()=>{menu.dispose();for(const [key,value]of saved){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
 return{...dom,menu,launcher:menu.launcher,scene};
}
function rule(selector){
 const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const match=css.match(new RegExp('(?:^|\\n)'+escaped+'\\s*\\{([^}]*)}'));
 assert.ok(match,`CSS rule exists for ${selector}`);
 return Object.fromEntries([...match[1].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map(([,key,value])=>[key,value.trim()]));
}

// A typo, escaped ampersand shown literally, hidden replacement entry or a
// detached decorative credit would violate the user's exact two-line request.
test('the existing settings launcher exposes exactly the requested author and names on two elements',t=>{
 const {launcher,menu}=setup(t);
 assert.equal(launcher.id,'structural-preview-button');assert.equal(launcher.tagName,'BUTTON');assert.equal(launcher.getAttribute('type'),'button');
 assert.deepEqual(launcher.children.map(node=>[node.tagName,node.textContent]),[['STRONG','作者'],['SPAN','陈华山&陈诺']]);
 assert.equal(launcher.textContent,'作者陈华山&陈诺');
 assert.equal(launcher.textContent.includes('&amp;'),false);
 assert.equal(document.body.querySelectorAll('#structural-preview-button').length,1);
 assert.equal(launcher.hidden,false);assert.equal(launcher.inert,false);
 assert.match(menu.panel.querySelector('#preview-limit').textContent,/结构研究预览/);
 assert.ok(menu.panel.querySelector('#preview-details').querySelectorAll('a').length>0,'renaming the launcher must not remove source/limits disclosure');
 report.checks.exactTwoLineCopy={lines:['作者','陈华山&陈诺'],nativeButton:true,singleExistingEntry:true,sourceDisclosureRetained:true};
});

test('author credit retains an accessible dialog name, expanded state, focus trap and restored focus',t=>{
 const {launcher,menu,dispatch,scene}=setup(t);
 assert.equal(launcher.getAttribute('aria-label'),'作者 陈华山&陈诺，打开设置与来源说明');
 assert.equal(launcher.getAttribute('aria-haspopup'),'dialog');assert.equal(launcher.getAttribute('aria-controls'),'settings-panel');assert.equal(launcher.getAttribute('aria-expanded'),'false');
 launcher.focus();launcher.click();
 assert.equal(menu.visible,true);assert.equal(scene.inert,true);assert.equal(document.activeElement.id,'settings-title');
 assert.equal(menu.panel.getAttribute('role'),'dialog');assert.equal(menu.panel.getAttribute('aria-modal'),'true');assert.equal(menu.panel.getAttribute('aria-labelledby'),'settings-title');
 assert.equal(launcher.getAttribute('aria-expanded'),'true');
 const close=menu.panel.querySelector('#settings-close-btn'),resume=menu.panel.querySelector('#resume-btn');
 resume.focus();assert.equal(dispatch(resume,'keydown',{key:'Tab',code:'Tab'}).defaultPrevented,true);assert.equal(document.activeElement,close);
 dispatch(close,'keydown',{key:'Tab',code:'Tab',shiftKey:true});assert.equal(document.activeElement,resume);
 const escape=dispatch(resume,'keydown',{key:'Escape',code:'Escape'});assert.equal(escape.defaultPrevented,true);assert.equal(menu.visible,false);
 assert.equal(document.activeElement,launcher);assert.equal(launcher.getAttribute('aria-expanded'),'false');assert.equal(scene.inert,false);
 // The shell does not implement user-agent Enter/Space -> click defaults.
 // Test that production leaves those native button defaults available; the
 // actual main Escape opening path is executed by r65-production-main.
 for(const [key,code]of [['Enter','Enter'],[' ','Space']]){
  launcher.focus();assert.equal(dispatch(launcher,'keydown',{key,code}).defaultPrevented,false);
  assert.equal(dispatch(launcher,'keyup',{key,code}).defaultPrevented,false);
 }
 report.checks.accessibility={dialogName:true,expandedState:true,focusTrap:true,focusRestoration:true,nativeEnterSpaceDefaultsNotCancelled:true,nativeKeyActivation:'Not synthesized by the CPU DOM fixture; production Escape opening is covered in entry-production-main.json.'};
});

test('ordinary touch remains native and secondary touch opens once without duplicating the settings dialog',t=>{
 let opened=0;const {launcher,menu,dispatch}=setup(t,{onOpen:()=>opened++}),panel=menu.panel,overlay=menu.overlay;
 const tap={identifier:2,target:launcher};
 const first=dispatch(launcher,'touchstart',{touches:[tap],changedTouches:[tap]});
 assert.equal(first.defaultPrevented,false);assert.equal(menu.visible,false);
 launcher.click();assert.equal(opened,1);assert.equal(menu.panel,panel);menu.hide();
 const held={identifier:1,target:document.body};
 const secondary=dispatch(launcher,'touchstart',{touches:[held,tap],changedTouches:[tap]});
 assert.equal(secondary.defaultPrevented,true);assert.equal(menu.visible,true);assert.equal(opened,2);
 launcher.click();assert.equal(opened,2);assert.equal(menu.panel,panel);assert.equal(menu.overlay,overlay);
 report.checks.touchEvents={singleTouchDefaultPreserved:true,compatibilityClickOpens:true,secondaryTouchImmediate:true,duplicateClickIdempotent:true};
});

test('map mode reparents the same author launcher and preserves its dialog listeners and names',t=>{
 const {launcher,menu}=setup(t),map=document.createElement('div');map.id='minimap';document.body.appendChild(map);
 for(const compact of [false,true]){
  map.setAttribute('data-compact',String(compact));menu.setMapMode(true,map);
  assert.equal(launcher.parentNode,map);assert.deepEqual(launcher.children.map(node=>node.textContent),['作者','陈华山&陈诺']);
  launcher.click();assert.equal(menu.visible,true);menu.hide();
  menu.setMapMode(false);assert.equal(launcher.parentNode,document.body);launcher.click();assert.equal(menu.visible,true);menu.hide();
 }
 report.checks.mapIdentity={sameElementAndListeners:true,bothTextElementsRetained:true};
});

test('the bottom launcher retains original centered safe-area CSS, two block lines and a visible focus indicator',()=>{
 const base=rule('#structural-preview-button');
 assert.equal(base.position,'fixed');assert.equal(base.left,'50%');assert.equal(base.transform,'translateX(-50%)');
 assert.equal(base.bottom,'max(8px, env(safe-area-inset-bottom, 0px))');assert.equal(base.width,'max-content');
 assert.equal(base['max-width'],'calc(100% - 32px)');assert.equal(base['min-height'],'44px');assert.equal(base.padding,'6px 12px');
 assert.equal(base['text-align'],'center');assert.equal(base.font,'12px/1.4 sans-serif');assert.equal(base['touch-action'],'manipulation');
 assert.match(css,/#structural-preview-button strong,\s*#structural-preview-button span\s*\{\s*display:\s*block;/);
 assert.equal(rule('#structural-preview-button:focus-visible').outline,'3px solid #ffe4a1');
 assert.match(css,/@media\s*\(max-width:\s*600px\)\s*and\s*\(orientation:\s*portrait\)\s*\{[\s\S]*?#structural-preview-button\s*\{\s*bottom:\s*calc\(240px \+ env\(safe-area-inset-bottom, 0px\)\)/);
 assert.ok(Number(base['z-index'])>9000&&Number(base['z-index'])<9500);
 report.checks.bottomCss={centered:true,twoBlockLines:true,minTouchHeight:44,safeAreaBottom:true,portraitControlLaneRetained:true,focusIndicator:true};
});

test('compact map never hides the requested author names or shrinks the touch target',()=>{
 const compact=rule('#minimap[data-compact="true"] #structural-preview-button');
 const names=rule('#minimap[data-compact="true"] #structural-preview-button span');
 assert.equal(names.display,'block','the author names cannot disappear in compact-map mode');
 assert.equal(names['white-space'],'nowrap','the requested second line must remain one line');
 assert.equal(compact['min-height'],'44px');assert.equal(compact['min-width'],'44px');
 assert.equal(rule('#minimap[data-compact="true"]')['grid-template-columns'],'minmax(0, 1fr) minmax(0, 1fr) 44px');
 report.checks.compactCss={namesVisible:true,namesNoWrap:true,minTouchTarget:44,existingGridRetained:true};
});

test('host CJK font bounds fit the centered bottom entry and narrow compact-map column without browser claims',t=>{
 // Read-only optional measurement with an installed, actual CJK font. This
 // intentionally does not pretend Pillow/FreeType is browser CSS layout.
 const measured=spawnSync('python',['-c',String.raw`import json
from pathlib import Path
from PIL import ImageFont
font=next(Path('/usr/share/fonts').rglob('NotoSansCJK-Regular.ttc'))
print(json.dumps({'font':font.name,'method':'Pillow FreeType getlength; font index 0; not browser font fallback or layout','widthByPx':{str(n):ImageFont.truetype(str(font),n).getlength('陈华山&陈诺') for n in range(8,13)},'labelWidth12Px':ImageFont.truetype(str(font),12).getlength('作者')}))`],{encoding:'utf8'});
 if(measured.status!==0){report.fontMeasurement={available:false,reason:measured.error?.message??measured.stderr.trim()};t.skip('optional host CJK font/Pillow measurement unavailable; static CSS tests still apply');return;}
 const font=JSON.parse(measured.stdout),base=rule('#structural-preview-button'),compact=rule('#minimap[data-compact="true"] #structural-preview-button'),names=rule('#minimap[data-compact="true"] #structural-preview-button span');
 const fontPx=Number.parseFloat(names['font-size']??compact['font-size']);assert.ok(fontPx>=8&&fontPx<=11);
 const textWidth=font.widthByPx[String(fontPx)];assert.ok(Number.isFinite(textWidth),'measure the actual compact font size');
 const lineHeight=12*1.4,paddingX=12,paddingY=6,border=1,contentWidth=Math.max(font.widthByPx['12'],font.labelWidth12Px);
 const modelRows=[];
 for(const [width,height,safeBottom]of [[1280,720,0],[390,844,34],[320,568,34],[568,320,0]]){
  const boxWidth=Math.min(contentWidth+2*paddingX+2*border,width-32),boxHeight=Math.max(44,2*lineHeight+2*paddingY+2*border);
  const bottom=width<=600&&height>width?240+safeBottom:Math.max(8,safeBottom),left=(width-boxWidth)/2,top=height-bottom-boxHeight;
  assert.ok(left>=16&&left+boxWidth<=width-16);assert.ok(top>=0&&top+boxHeight<=height-safeBottom);
  assert.ok(contentWidth<=boxWidth-2*paddingX-2*border);assert.ok(boxHeight<64,'a two-line credit remains compact');
  modelRows.push({viewport:[width,height],safeBottom,modeledBox:{left,top,width:boxWidth,height:boxHeight},basis:'Static numeric model from declared CSS and this host font; not getBoundingClientRect or browser rendering.'});
 }
 const mapRows=[];
 for(const mapWidth of [240,220,192]){
  // Real map CSS: 3px outer border, 6px padding, two 6px gaps, 44px close.
  // Remaining two columns are equal; launcher has 2px padding and 1px border.
  const columnWidth=(mapWidth-6-12-12-44)/2,textAreaWidth=columnWidth-4-2;
  assert.ok(textWidth<=textAreaWidth,`${fontPx}px names require ${textWidth}px but ${mapWidth}px map has ${textAreaWidth}px available`);
  mapRows.push({mapWidth,columnWidth,textAreaWidth,fontPx,textWidth,remainingPx:textAreaWidth-textWidth});
 }
 report.fontMeasurement={available:true,...font,bottomRows:modelRows,compactRows:mapRows,limitations:['Actual platform sans-serif fallbacks and browser layout are not measured.','192px compact case represents 520px landscape with zero horizontal safe-area insets; larger insets can make the existing map grid narrower.','No device touch physics, screenshot or overlap with all other HUD controls has been verified.']};
});
