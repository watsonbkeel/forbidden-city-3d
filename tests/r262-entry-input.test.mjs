// Small host orchestration and observer controls, not browser or hall proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(process.env.R262_REPO_ROOT??fileURLToPath(new URL('../',import.meta.url)));
const {setupInput}=await import(pathToFileURL(path.join(root,'tests/lib/input-fixture.mjs')).href);
const {runEntryKey,observeEntryInput}=await import(process.env.R262_INPUT_HELPER??'./lib/r262-entry-input.mjs');
function hostFixture(t,{noFrames=false,blocked=false,downFailure=false,missingBubble=null,frameMs=4300}={}){
  const actual=setupInput(t),reports=[];let armed=false,disposed=false,handleDisposed=false,mouseDown=false;
  const body={tag:'BODY',id:'',textEntry:false,spaceInteractive:false};
  const state={events:[],batches:[],integrityErrors:[],heldBatches:0,releasedBatches:0,downAt:null,upAt:null,
    facts:{visibility:'visible',hasFocus:true,pointerLockedToBody:true,pointerLock:body,active:blocked?{...body,tag:'BUTTON',spaceInteractive:true}:body,hudVisible:true,mapOpen:false,welcomeVisible:false,settingsVisible:false,failureVisible:false}};
  const event=(type,code)=>{const before={type,phase:'capture',code,isTrusted:true,repeat:false,ctrlKey:false,metaKey:false,altKey:false,defaultPrevented:false,target:state.facts.active,at:actual.now(),timeStamp:actual.now()};const e=actual.key(type,code,{isTrusted:true});state.events.push(before);if(type!==missingBubble)state.events.push({...before,phase:'bubble',defaultPrevented:e.defaultPrevented});if(type==='keydown')state.downAt=actual.now();else state.upAt=actual.now();};
  const observer={read:()=>structuredClone(state),arm(){armed=true;},dispose(){disposed=true;return this.read();}};
  const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};
  const page={evaluateHandle:async()=>handle,mouse:{down:async()=>{mouseDown=true;},up:async()=>{mouseDown=false;if(missingBubble!=='click')state.events.push({type:'click',phase:'bubble',isTrusted:true,target:body});}},
    keyboard:{down:async key=>{event('keydown',key==='w'?'KeyW':'Space');if(downFailure)throw Error('native down rejected after delivery');},up:async key=>event('keyup',key==='w'?'KeyW':'Space')},
    waitForTimeout:async ms=>actual.advance(ms),
    waitForFunction:async(predicate,h,options)=>{assert.equal(armed,true);assert.equal(options.polling,100);if(noFrames)throw Error('public HUD deadline');actual.frame(frameMs);const phase=state.upAt===null?'held':'released';state[phase+'Batches']++;state.batches.push({phase,recordCount:4,at:actual.now()});assert.equal(predicate(observer),true);return {dispose:async()=>{}};}};
  return {actual,state,page,reports,save:r=>reports.push(structuredClone(r)),clean:()=>disposed&&handleDisposed&&!mouseDown};
}
test('holds native W across a public update, then releases and observes a settled update',async t=>{
  const f=hostFixture(t);await runEntryKey(f.page,{code:'KeyW',name:'walk',timeoutMs:30000,save:f.save});
  f.actual.frame(4300); // A later real update cannot resurrect a fully released missed tap.
  assert.ok(f.actual.logical().z<-.7,'real controller must sample W rather than lose the tap');
  assert.equal(f.actual.c.pressedKeys.has('KeyW'),false);assert.equal(f.clean(),true);
  assert.equal(f.reports.at(-1).status,'PASS');assert.equal(f.reports.at(-1).observer.heldBatches,1);assert.equal(f.reports.at(-1).observer.releasedBatches,1);assert.equal(f.reports.at(-1).autoSprintPossible,true);
});
test('missing HUD update fails and still sends keyup and disposes the observer',async t=>{
  const f=hostFixture(t,{noFrames:true});await assert.rejects(runEntryKey(f.page,{code:'KeyW',name:'no-frame',timeoutMs:30000,save:f.save}),/public HUD deadline/);
  assert.equal(f.actual.c.pressedKeys.size,0);assert.equal(f.clean(),true);assert.equal(f.reports.at(-1).status,'FAIL');
});
test('native down rejection after delivery still releases the actual key',async t=>{
  const f=hostFixture(t,{downFailure:true});await assert.rejects(runEntryKey(f.page,{code:'KeyW',name:'down-failure',timeoutMs:30000,save:f.save}),/native down rejected/);
  assert.equal(f.actual.c.pressedKeys.size,0);assert.equal(f.clean(),true);
});
test('Space on retained button focus is a precondition failure, never a jump claim',async t=>{
  const f=hostFixture(t,{blocked:true});await assert.rejects(runEntryKey(f.page,{code:'Space',name:'jump',timeoutMs:30000,save:f.save}),/input precondition/);
  assert.equal(f.state.events.some(e=>e.type==='keydown'),false);assert.equal(f.clean(),true);assert.equal(f.actual.c.jumpQueued,false);
});
test('one HUD callback counts one batch even with identical text and many mutation records',async t=>{
  const saved=Object.fromEntries(['document','window','MutationObserver','getComputedStyle'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const listeners=[];let callback,disconnected=false;
  const body={tagName:'BODY',id:'',getAttribute:()=>null,isContentEditable:false,closest:()=>null,getClientRects:()=>[{}]};
  const hud={...body,id:'perf-hud',textContent:'unchanged Calls 20 Tris 5,000'};
  const target={addEventListener:(type,fn,capture)=>listeners.push({type,fn,capture}),removeEventListener:(type,fn)=>{const i=listeners.findIndex(x=>x.type===type&&x.fn===fn);if(i>=0)listeners.splice(i,1);}};
  Object.defineProperty(globalThis,'document',{configurable:true,value:{...target,body,activeElement:body,pointerLockElement:body,hasFocus:()=>true,visibilityState:'visible',querySelector:s=>s==='#perf-hud'?hud:null}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:{...target}});
  Object.defineProperty(globalThis,'getComputedStyle',{configurable:true,value:()=>({display:'block',visibility:'visible'})});
  Object.defineProperty(globalThis,'MutationObserver',{configurable:true,value:class{constructor(fn){callback=fn;}observe(){}takeRecords(){return [];}disconnect(){disconnected=true;}}});
  t.after(()=>{for(const[k,d]of Object.entries(saved))if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];});
  const observer=observeEntryInput({code:'KeyW'});observer.arm();
  const event={type:'keydown',code:'KeyW',key:'w',target:body,isTrusted:true,defaultPrevented:false,timeStamp:10,repeat:false};
  for(const l of listeners.filter(x=>x.type==='keydown'&&x.capture))l.fn(event);await Promise.resolve();
  callback(Array.from({length:4},()=>({type:'childList'})));assert.equal(observer.read().heldBatches,1);
  callback([{type:'childList'}]);assert.equal(observer.read().heldBatches,2,'identical text is still an update');
  for(const l of listeners.filter(x=>x.type==='keydown'&&x.capture))l.fn({...event,code:'F3'});
  assert.ok(observer.read().integrityErrors.length>0,'F3 cannot fake accepted update evidence');
  observer.dispose();assert.equal(disconnected,true);assert.equal(listeners.length,0);
});

test('native listener boundary microtasks precede the real document handler, window bubble remains authoritative',async t=>{
  const actual=setupInput(t),reports=[],trace=[];
  const previous=Object.fromEntries(['MutationObserver','getComputedStyle'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  let mutation,observer,handleDisposed=false,observerDisconnected=false;
  const hud={id:'perf-hud',textContent:'Calls 20 Tris 5,000',getClientRects:()=>[{}]};
  actual.document.querySelector=s=>s==='#perf-hud'?hud:null;actual.document.hasFocus=()=>true;actual.document.visibilityState='visible';
  Object.defineProperty(globalThis,'getComputedStyle',{configurable:true,value:()=>({display:'block',visibility:'visible'})});
  Object.defineProperty(globalThis,'MutationObserver',{configurable:true,value:class{constructor(fn){mutation=fn;}observe(){}takeRecords(){return [];}disconnect(){observerDisconnected=true;}}});
  t.after(()=>{for(const[k,d]of Object.entries(previous))if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];});
  // Unlike the ordinary synchronous DOM fixture dispatcher, allow a microtask
  // checkpoint after each native listener callback before propagation continues.
  async function nativeOrder(type,code){
    const event={target:actual.document.body,type,code,key:code==='KeyW'?'w':' ',button:0,isTrusted:true,repeat:false,ctrlKey:false,metaKey:false,altKey:false,defaultPrevented:false,timeStamp:actual.now(),preventDefault(){this.defaultPrevented=true;}};
    const path=[actual.document.body,actual.document,actual.window];
    const invoke=async(node,capture)=>{for(const item of [...(node.listeners.get(type)??[])])if(item.capture===capture){item.listener(event);await Promise.resolve();if(type==='keydown')trace.push({node:node===actual.window?'window':node===actual.document?'document':'body',capture,defaultPrevented:event.defaultPrevented});}};
    for(const node of [...path].reverse())await invoke(node,true);
    for(const node of path)await invoke(node,false);
    return event;
  }
  const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};
  const page={evaluateHandle:async(fn,arg)=>{observer=fn(arg);return handle;},mouse:{down:async()=>{},up:async()=>nativeOrder('click')},
    keyboard:{down:async key=>nativeOrder('keydown',key==='w'?'KeyW':'Space'),up:async key=>nativeOrder('keyup',key==='w'?'KeyW':'Space')},
    waitForFunction:async(predicate,h,options)=>{assert.equal(options.polling,100);actual.frame(4300);mutation([{type:'childList'},{type:'childList'}]);assert.equal(predicate(observer),true);return {dispose:async()=>{}};}};
  try{await runEntryKey(page,{code:'KeyW',name:'native-order',timeoutMs:30000,save:r=>reports.push(structuredClone(r))});}
  finally{t.diagnostic(JSON.stringify({trace,observed:reports.at(-1)?.observer?.events.filter(e=>e.type==='keydown').map(e=>({phase:e.phase,defaultPrevented:e.defaultPrevented}))}));assert.equal(actual.c.pressedKeys.size,0);assert.equal(handleDisposed,true);assert.equal(observerDisconnected,true);}
  const keys=reports.at(-1).observer.events.filter(e=>e.type==='keydown');
  assert.equal(keys.find(e=>e.phase==='capture').defaultPrevented,false);
  assert.equal(keys.find(e=>e.phase==='bubble').defaultPrevented,true);
  assert.ok(actual.logical().z<-.7);assert.equal(reports.at(-1).status,'PASS');
});

for(const type of ['click','keydown','keyup'])test(`missing window bubble for ${type} fails closed and cleans up`,async t=>{
  const f=hostFixture(t,{missingBubble:type});await assert.rejects(runEntryKey(f.page,{code:'KeyW',name:'missing-'+type,timeoutMs:30000,save:f.save}),/input precondition/);
  assert.equal(f.actual.c.pressedKeys.size,0);assert.equal(f.clean(),true);assert.equal(f.reports.at(-1).status,'FAIL');
});

test('exact 2000 ms held input records normal auto-sprint possibility',async t=>{
  const f=hostFixture(t,{frameMs:2000});await runEntryKey(f.page,{code:'KeyW',name:'sprint-boundary',timeoutMs:30000,save:f.save});
  assert.equal(f.reports.at(-1).heldBrowserMs,2000);assert.equal(f.reports.at(-1).autoSprintPossible,true);
});
