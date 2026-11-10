// Real application controls and map lifecycle; only DOM/time/canvas are fixtures.
// This is not native Chromium focus, jump physics, rendered-image or cold-return proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(process.env.R262_REPO_ROOT??fileURLToPath(new URL('../',import.meta.url)));
const require=createRequire(path.join(root,'package.json'));
// The optional source override runs the exact private candidate before integration.
// All dependencies and the unchanged fixture bodies still resolve to the source repo.
function moduleURL(relative,override,imports={}){
  const file=path.join(root,relative),url=pathToFileURL(file).href;
  let source=readFileSync(override??file,'utf8');
  source=source.replace(/(from\s*['"])([^'"]+)(['"])/g,(_,a,s,b)=>a+(imports[s]??(s.startsWith('.')?new URL(s,url).href:s.startsWith('node:')?s:pathToFileURL(require.resolve(s)).href))+b);
  source=source.replaceAll('import.meta.url',JSON.stringify(url));
  return 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
}
const controlsURL=moduleURL('src/controls/FirstPerson.js',process.env.R262_FIRST_PERSON_SOURCE);
const inputURL=moduleURL('tests/lib/input-fixture.mjs',null,{'../../src/controls/FirstPerson.js':controlsURL});
const {setupInput}=await import(inputURL);
const {setupMap}=await import(moduleURL('tests/lib/map-fixture.mjs',null,{'./input-fixture.mjs':inputURL}));
const {HelpPanel}=await import(pathToFileURL(path.join(root,'src/ui/HelpPanel.js')).href);
function blurModel(s,element){
  let calls=0; element.blur=()=>{calls++;if(s.document.activeElement===element)s.document.activeElement=s.document.body;};
  return ()=>calls;
}
function element(s,tag,attributes={}){
  const e=s.document.createElement(tag);for(const[k,v]of Object.entries(attributes))e.setAttribute(k,v);
  s.document.body.appendChild(e);return {e,blurs:blurModel(s,e)};
}
const interactive=[['button',{}],['a',{href:'#'}],['summary',{}],['div',{role:'button'}]];
const key=(s,code,extra={})=>s.dispatch(s.document.activeElement,'keydown',{code,key:code==='Space'?' ':'w',repeat:false,...extra});
const click=(s,target=s.document.body)=>s.dispatch(target,'click',{isTrusted:true,detail:1});
function assertJump(s){const e=key(s,'Space');assert.equal(e.defaultPrevented,true);assert.equal(s.c.jumpQueued,true);s.dispatch(s.document.activeElement,'keyup',{code:'Space'});}

test('actual map-close restores Help, then locked BODY scene click gives Space back to the scene',async t=>{
  const s=await setupMap(t),help=new HelpPanel(),blurs=blurModel(s,help.button);
  try{
    help.button.focus();s.map.toggle();assert.ok(s.map.previousFocus===help.button);s.map.toggle();
    assert.ok(s.document.activeElement===help.button,'Minimap must retain its accessibility restoration');
    assert.equal(s.c.controls.isLocked,true);assert.equal(blurs(),0,'lock alone must not steal button focus');
    assert.equal(key(s,'Space').defaultPrevented,false);assert.equal(s.c.jumpQueued,false);
    click(s);assert.ok(s.document.activeElement===s.document.body,'explicit scene click must release stale Help focus');
    assert.equal(blurs(),1);assertJump(s);
  }finally{help.dispose();}
});

test('locked CANVAS scene click releases each stale Space-interactive focus',t=>{
  const s=setupInput(t),canvas=s.document.createElement('canvas');s.document.body.appendChild(canvas);
  for(const[tag,attrs]of interactive){const {e,blurs}=element(s,tag,attrs);e.focus();s.c.jumpQueued=false;
    click(s,canvas);assert.ok(s.document.activeElement===s.document.body,tag);assert.equal(blurs(),1);assertJump(s);}
});

test('actual UI clicks and nested UI targets preserve native Space ownership',t=>{
  const s=setupInput(t);
  for(const[tag,attrs]of interactive){const {e,blurs}=element(s,tag,attrs),child=s.document.createElement('span');e.appendChild(child);e.focus();
    click(s,e);click(s,child);assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);
    assert.equal(key(s,'Space').defaultPrevented,false);assert.equal(s.c.jumpQueued,false);}
});

test('map-open body/canvas and UI interactions do not release interactive focus',async t=>{
  const s=await setupMap(t),{e,blurs}=element(s,'button');e.focus();s.map.toggle();
  click(s);click(s,s.map.canvas);click(s,e);assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);
  assert.equal(key(s,'Space').defaultPrevented,false);assert.equal(s.c.jumpQueued,false);s.map.toggle();
  assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);
});

test('no click, ordinary focus release and lock events leave interactive focus untouched',t=>{
  const s=setupInput(t);
  for(const[tag,attrs]of interactive){const {e,blurs}=element(s,tag,attrs);e.focus();s.c.releaseInputFocus();s.c.unlock();s.c.lock();
    assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);assert.equal(key(s,'Space').defaultPrevented,false);assert.equal(s.c.jumpQueued,false);}
});

test('unlocked first scene click and failed lock do not claim interactive focus',async t=>{
  const s=setupInput(t),{e,blurs}=element(s,'button');e.focus();s.c.unlock();click(s);
  assert.equal(s.c.controls.isLocked,true);assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);
  s.c.unlock();s.document.body.requestPointerLock=()=>{throw Error('synchronous lock rejection');};click(s);
  assert.equal(s.c.controls.isLocked,false);assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);
  s.document.body.requestPointerLock=()=>Promise.reject(Error('asynchronous lock rejection'));click(s);await Promise.resolve();
  assert.equal(s.c.controls.isLocked,false);assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);
});

test('text fields keep their own clicks and keys; existing scene and lock text cleanup remain',t=>{
  const s=setupInput(t);
  for(const tag of ['input','textarea','select']){const {e,blurs}=element(s,tag);e.focus();click(s,e);
    assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);assert.equal(key(s,'KeyW').defaultPrevented,false);assert.equal(key(s,'Space').defaultPrevented,false);
    click(s);assert.ok(s.document.activeElement===s.document.body);assert.equal(blurs(),1);
    e.focus();s.c.unlock();s.c.lock();assert.ok(s.document.activeElement===s.document.body);assert.equal(blurs(),2);
  }
});

test('map text UI, shortcut modifiers and keyup ownership are unchanged',async t=>{
  const s=await setupMap(t),{e,blurs}=element(s,'input');s.map.toggle();e.focus();click(s,e);
  assert.ok(s.document.activeElement===e);assert.equal(blurs(),0);assert.equal(key(s,'Space').defaultPrevented,false);s.map.toggle();
  for(const modifier of ['ctrlKey','metaKey','altKey']){assert.equal(key(s,'KeyW',{[modifier]:true}).defaultPrevented,false);assert.equal(s.c.moveForward,false);assert.equal(key(s,'Space',{[modifier]:true}).defaultPrevented,false);assert.equal(s.c.jumpQueued,false);}
  assert.equal(key(s,'KeyW').defaultPrevented,true);assert.equal(s.c.moveForward,true);e.focus();s.dispatch(e,'keyup',{code:'KeyW'});
  assert.equal(s.c.moveForward,false);assert.equal(s.c.pressedKeys.size,0);
});

test('non-interactive UI DIV/P clicks are not an explicit BODY/CANVAS scene handoff',t=>{
  const s=setupInput(t),{e,blurs}=element(s,'button');e.focus();
  for(const tag of ['div','p']){const ui=s.document.createElement(tag);s.document.body.appendChild(ui);click(s,ui);assert.ok(s.document.activeElement===e,'non-scene UI retains keyboard owner');}
  assert.equal(blurs(),0);assert.equal(key(s,'Space').defaultPrevented,false);assert.equal(s.c.jumpQueued,false);
});
