import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {setupInput} from './input-fixture.mjs';
import {Minimap} from '../../src/ui/Minimap.js';
import {SettingsMenu} from '../../src/ui/SettingsMenu.js';
import {SettingsTourSession} from '../../src/ui/SettingsTourSession.js';

// Browser canvas/layout are not emulated: drawing is a no-op and rectangles are
// declared fixtures. Native hit testing and responsive layout remain browser QA.
export async function setupMap(t,{mobile=false}={}) {
 let cleanup=()=>{};t.after(()=>cleanup());
 const s=setupInput(t,{mobile});
 s.window.innerWidth=mobile?390:960;s.window.innerHeight=mobile?844:540;s.window.devicePixelRatio=1;
 s.document.body.classList.toggle=()=>{};
 const create=s.document.createElement;
 s.document.createElement=tag=>{
  const el=create(tag);el.dataset={};
  if(tag==='canvas') {
   const ctx=new Proxy({measureText:text=>({width:String(text).length*6})},{get:(o,k)=>k in o?o[k]:()=>{}});
   el.getContext=()=>ctx;el.clientWidth=300;el.getBoundingClientRect=()=>({left:200,top:30,width:300,height:300});
   const captured=new Set();el.setPointerCapture=id=>captured.add(id);el.hasPointerCapture=id=>captured.has(id);el.releasePointerCapture=id=>captured.delete(id);
  }
  return el;
 };
 const welcomeOverlay={style:{display:'none'}}, teleports=[];
 let lifecycle;
 const map=new Minimap({preview:mobile,onToggle:visible=>lifecycle?.setVisible(visible),onTeleport:name=>{teleports.push(name);return true;}});
 s.document.body.appendChild(map.container);
 const settingsSession=new SettingsTourSession({controls:s.c,isMobile:mobile,minimap:map,welcomeOverlay});
 const menu=new SettingsMenu(s.document.body);menu.init({onOpen:()=>settingsSession.open(),onResume:()=>settingsSession.resume()});
 const url=new URL('../../src/ui/MapTourSession.js',import.meta.url);
 if(existsSync(url)) {
  const {MapTourSession}=await import(url);
  lifecycle=new MapTourSession({controls:s.c,welcomeOverlay,getSettingsSession:()=>settingsSession});
 } else {
  // Exact previous main.js control sequence, for meaningful baseline failures.
  lifecycle={setVisible(visible){if(settingsSession.paused){settingsSession.mapChanged(visible);return;}s.c.setFreeMove(visible);if(visible){welcomeOverlay.style.display='none';s.c.unlock();}else{try{s.c.lock();}catch{}}}};
 }
 map.onToggle=visible=>{menu.setMapMode(visible,map.container);lifecycle.setVisible(visible);};
 cleanup=()=>{menu.dispose();map.dispose();};
 return {...s,map,menu,settingsSession,lifecycle,welcomeOverlay,teleports};
}

export function mapPointer(s,type,id,x=240,y=70) {
 return s.dispatch(s.map.canvas,type,{pointerId:id,clientX:x,clientY:y,pointerType:'touch'});
}
export function touchAt(s,target,type,id,x,y,others=[]) {
 const finger={identifier:id,clientX:x,clientY:y,target};
 return s.dispatch(target,type,{touches:type==='touchend'||type==='touchcancel'?others:[...others,finger],changedTouches:[finger]});
}
