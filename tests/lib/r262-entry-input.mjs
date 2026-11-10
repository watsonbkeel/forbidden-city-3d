// Smoke-only observer: public DOM/native events, no app access or frame injection.
export function observeEntryInput({code}){
  const hud=document.querySelector('#perf-hud');if(!hud)throw Error('input precondition: missing public HUD');
  const textSelector='input, textarea, select, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]';
  const describe=e=>e?{tag:e.tagName??null,id:e.id??'',type:e.getAttribute?.('type')??null,role:e.getAttribute?.('role')??null,textEntry:!!(e.isContentEditable||e.closest?.(textSelector)),spaceInteractive:!!e.closest?.('button, a[href], summary, [role="button"]')}:null;
  const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden';
  const facts=()=>({active:describe(document.activeElement),hasFocus:document.hasFocus(),visibility:document.visibilityState,pointerLock:describe(document.pointerLockElement),pointerLockedToBody:document.pointerLockElement===document.body,
    hudVisible:visible(hud),mapOpen:document.body.classList?.contains('map-open')??false,welcomeVisible:visible(document.querySelector('#welcome-overlay')),settingsVisible:visible(document.querySelector('#settings-panel')),failureVisible:visible(document.querySelector('#tour-failure-dialog'))});
  const state={code,readyAt:performance.now(),armed:false,events:[],batches:[],integrityErrors:[],heldBatches:0,releasedBatches:0,downAt:null,upAt:null};
  const listeners=[];let disposed=false;
  const invalid=message=>{if(!state.integrityErrors.includes(message)&&state.integrityErrors.length<8)state.integrityErrors.push(message);};
  const record=(list,value)=>{if(list.length>=128){invalid('bounded input evidence overflow');return;}list.push(value);};
  const listen=(target,type,fn,capture=false)=>{target.addEventListener(type,fn,capture);listeners.push([target,type,fn,capture]);};
  const eventRow=(event,phase)=>({type:event.type,phase,code:event.code??null,key:event.key??null,button:event.button??null,target:describe(event.target),defaultPrevented:event.defaultPrevented,isTrusted:event.isTrusted,repeat:!!event.repeat,
    ctrlKey:!!event.ctrlKey,metaKey:!!event.metaKey,altKey:!!event.altKey,timeStamp:event.timeStamp,at:performance.now()});
  const capture=event=>{
    if(event.type!=='click'&&event.code!==code&&event.code!=='F3')return;
    record(state.events,eventRow(event,'capture'));
    if(state.armed&&event.code==='F3')invalid('F3 changed during measured input');
    if(state.armed&&event.code===code){
      if(event.type==='keydown'&&!event.repeat&&state.downAt===null){observer.takeRecords();state.downAt=performance.now();}
      if(event.type==='keyup'){observer.takeRecords();state.upAt=performance.now();}
    }
  };
  // Window bubbling follows the application's document-level key handler.
  // Capture microtasks are not a dispatch-completion signal for native events.
  const bubble=event=>{if(event.type==='click'||event.code===code||event.code==='F3')record(state.events,eventRow(event,'bubble'));};
  for(const type of ['keydown','keyup','click']){listen(document,type,capture,true);listen(window,type,bubble);}
  for(const type of ['focusin','focusout','pointerlockchange','visibilitychange'])listen(document,type,event=>{
    record(state.events,{type,phase:'observation',at:performance.now(),target:describe(event.target),facts:facts()});
    if(state.armed&&(!document.hasFocus()||document.pointerLockElement!==document.body||document.visibilityState!=='visible'))invalid('focus, visibility or pointer lock lost');
  },true);
  listen(window,'blur',()=>{record(state.events,{type:'window-blur',at:performance.now()});if(state.armed)invalid('window focus lost');});
  const observer=new MutationObserver(records=>{
    if(!state.armed||disposed)return;
    if(records.some(r=>r.type==='attributes'))invalid('HUD style or class changed during measured input');
    if(!records.some(r=>r.type==='childList'||r.type==='characterData'))return;
    const current=facts();if(!current.hudVisible||!current.hasFocus||!current.pointerLockedToBody||current.visibility!=='visible')invalid('public HUD/input precondition lost');
    const phase=state.downAt===null?'before-key':state.upAt===null?'held':'released';
    // Several textContent assignments in one PerfHUD._render are one callback,
    // including identical strings. Count a callback, never individual records.
    record(state.batches,{phase,at:performance.now(),recordCount:records.length,text:hud.textContent,location:document.querySelector('#location-panel')?.innerText??null});
    if(phase==='held')state.heldBatches++;if(phase==='released')state.releasedBatches++;
  });
  observer.observe(hud,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']});
  return {read:()=>({...state,facts:facts()}),arm(){observer.takeRecords();state.armed=true;state.armedAt=performance.now();},dispose(){disposed=true;observer.disconnect();for(const args of listeners)args[0].removeEventListener(...args.slice(1));return {...state,disposed:true,facts:facts()};}};
}

export async function runEntryKey(page,{code,name,timeoutMs,save}){
  if(!['KeyW','Space'].includes(code)||!(timeoutMs>0&&timeoutMs<=30000))throw Error('invalid bounded entry input request');
  const key=code==='KeyW'?'w':'Space',started=Date.now(),deadline=started+timeoutMs;
  const report={name,code,status:'FAIL',timeoutMs,scope:'Native input plus public HUD completion evidence, not an internal movement or collision witness.'};
  let handle,failure,heldObserved=false;
  const remaining=()=>{const ms=deadline-Date.now();if(ms<=0)throw Error('public HUD/input deadline');return ms;};
  const sample=async()=>{report.observer=await handle.evaluate(o=>o.read());save(report);return report.observer;};
  const requireFacts=state=>{
    const f=state.facts;
    if(!f.active||f.visibility!=='visible'||!f.hasFocus||!f.pointerLockedToBody||!f.hudVisible||f.mapOpen||f.welcomeVisible||f.settingsVisible||f.failureVisible||f.active?.textEntry||(code==='Space'&&f.active?.spaceInteractive))throw Error('input precondition: focused locked scene and visible HUD required; Space must leave interactive controls');
    if(state.integrityErrors.length)throw Error('input observation integrity: '+state.integrityErrors.join('; '));
  };
  const waitBatch=async phase=>{
    const predicate=phase==='held'?o=>{const s=o.read();return s.heldBatches>0||s.integrityErrors.length>0;}:o=>{const s=o.read();return s.releasedBatches>0||s.integrityErrors.length>0;};
    const answer=await page.waitForFunction(predicate,handle,{polling:100,timeout:remaining()});await answer.dispose();requireFacts(await sample());
  };
  try{
    handle=await page.evaluateHandle(observeEntryInput,{code});report.beforeClick=await sample();
    if(!report.beforeClick.facts.pointerLockedToBody)throw Error('input precondition: native scene click requires the actual body pointer lock');
    // No pointer move/yaw: locked native button events target the scene. Verify
    // the actual trusted click target and resulting focus rather than blur/focus JS.
    try{await page.mouse.down();}finally{await page.mouse.up();}
    const ready=await sample();requireFacts(ready);
    const click=ready.events.findLast(e=>e.type==='click'&&e.phase==='bubble');
    if(!click?.isTrusted||!['BODY','CANVAS'].includes(click.target?.tag)||click.target?.textEntry||click.target?.spaceInteractive)throw Error('input precondition: native click did not target the locked scene');
    await handle.evaluate(o=>o.arm());remaining();report.downAttempted=true;save(report);
    await page.keyboard.down(key);
    const down=await sample();requireFacts(down);
    const capture=down.events.find(e=>e.type==='keydown'&&e.phase==='capture'&&e.code===code),bubble=down.events.find(e=>e.type==='keydown'&&e.phase==='bubble'&&e.code===code);
    if(!capture?.isTrusted||capture.repeat||capture.defaultPrevented||capture.ctrlKey||capture.metaKey||capture.altKey||capture.target?.textEntry||(code==='Space'&&capture.target?.spaceInteractive)||!bubble?.isTrusted||bubble.repeat||!bubble.defaultPrevented)throw Error('input precondition: native key arrival/admission evidence missing or rejected');
    await waitBatch('held');heldObserved=true;
  }catch(error){failure=error;report.failure={message:error.message,stack:error.stack};}
  finally{
    // Also release after a down call whose delivery outcome is uncertain.
    try{await page.keyboard.up(key);}catch(error){report.keyupError=error.message;failure??=error;}
    if(handle){
      try{
        const released=await sample();
        if(heldObserved&&!failure){
          const up=released.events.findLast(e=>e.type==='keyup'&&e.phase==='bubble'&&e.code===code);
          if(!up?.isTrusted||released.upAt===null)throw Error('input precondition: native keyup arrival evidence missing');
          await waitBatch('released');
        }
        report.observer=await handle.evaluate(o=>o.dispose());
      }catch(error){report.observationCleanupError=error.message;failure??=error;
        try{report.observer=await handle.evaluate(o=>o.dispose());}catch(e){report.disposeError=e.message;}
      }finally{try{await handle.dispose();}catch(error){report.handleDisposeError=error.message;failure??=error;}}
    }
    const o=report.observer;report.heldBrowserMs=Number.isFinite(o?.downAt)&&Number.isFinite(o?.upAt)?o.upAt-o.downAt:null;
    report.autoSprintPossible=code==='KeyW'&&report.heldBrowserMs>=2000;report.hostElapsedMs=Date.now()-started;
    report.status=failure?'FAIL':'PASS';if(failure&&!report.failure)report.failure={message:failure.message,stack:failure.stack};save(report);
  }
  if(failure)throw failure;return report;
}
