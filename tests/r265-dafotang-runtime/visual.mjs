// Targeted first-entry evidence. Public UI and trusted native input only.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
export const TARGET_ID='place-outer-west-6cae88b6a2';
export const ROUTE_DIAGNOSTIC=Object.freeze({postEntryBudgetMs:180000,priorPostEntryBudgetMs:120000,priorRunId:42921935309,priorHead:'15cd599161076e77f4dfb8acc3222cb1e4f69053',priorCapture:'FAIL_EAST_4_DEADLINE',priorGuard:'RESOURCE_MEASUREMENT_FAILED',scope:'supplemental diagnostic; not release acceptance'});
export const REQUIRED_IMAGES=Object.freeze(['01-dafotang-detail','02-dafotang-outside','03-shrine-front-far','04-shrine-front-near-center','05-shrine-west-translated-oblique','06-shrine-west-thickness-column-crown','07-shrine-east-translated-oblique','08-shrine-east-thickness-column-crown']);
export function validateBuildIdentity(build,commit){assert.ok(/^[a-f0-9]{40}$/.test(commit)&&build.sourceCommit===commit&&build.sourceDirty===false&&build.release==='R262'&&build.buildId==='R262-9951d7c975d5'&&build.sourceFingerprint==='cab590a62d2c5ddb8eb83aff59cc0284158de3d12ca968897f9a22dcdf3f7d22'&&build.base==='/forbidden-city-3d/','exact event build identity required');}
export function validateTargetDetail(row){assert.ok(row.id===TARGET_ID&&row.matches===1&&row.title==='大佛堂'&&row.travelVisible===true&&row.travelText==='前往此处','exact public Dafotang target required');}
function validInput(row,code){
 const o=row?.observer,f=o?.facts,events=o?.events??[];const click=events.findLast(e=>e.type==='click'&&e.phase==='bubble');const down=events.find(e=>e.code===code&&e.type==='keydown'&&e.phase==='capture'),bubble=events.find(e=>e.code===code&&e.type==='keydown'&&e.phase==='bubble'),up=events.findLast(e=>e.code===code&&e.type==='keyup'&&e.phase==='bubble');
 return row?.status==='PASS'&&row.code===code&&click?.isTrusted&&['BODY','CANVAS'].includes(click.target?.tag)&&!click.target?.textEntry&&!click.target?.spaceInteractive&&o?.disposed===true&&events.length<=128&&Array.isArray(o.batches)&&o.batches.length<=128&&o.batches.some(b=>b.phase==='held')&&o.batches.some(b=>b.phase==='released')&&o.integrityErrors?.length===0&&o.heldBatches>0&&o.releasedBatches>0&&Number.isFinite(o.downAt)&&Number.isFinite(o.upAt)&&o.upAt>=o.downAt&&down?.isTrusted&&!down.repeat&&!down.defaultPrevented&&!down.ctrlKey&&!down.metaKey&&!down.altKey&&!down.target?.textEntry&&bubble?.isTrusted&&!bubble.repeat&&bubble.defaultPrevented&&up?.isTrusted&&!up.defaultPrevented&&f?.hasFocus&&f.visibility==='visible'&&f.pointerLockedToBody&&f.hudVisible&&!f.mapOpen&&!f.welcomeVisible&&!f.settingsVisible&&!f.failureVisible&&!f.active?.textEntry;
}
function validPost(row,code){return validInput(row,code)&&row.observer.batches.filter(b=>b.phase==='held'||b.phase==='released').every(b=>/慈宁宫后殿|大佛堂/.test(b.location??''));}
function validLook(row,dx,dy){const s=row?.observer,e=s?.events??[],u=s?.updates??[],f=s?.facts;const x=e.reduce((v,a)=>v+a.movementX,0),y=e.reduce((v,a)=>v+a.movementY,0);return row?.status==='PASS'&&row.expectedMovementX===dx&&row.expectedMovementY===dy&&e.length>0&&e.length<=128&&u.length>0&&u.length<=128&&s.errors?.length===0&&f?.focused&&f.visible&&f.locked&&f.hudVisible&&!f.mapOpen&&typeof f.heading==='string'&&!!f.heading&&e.every(a=>a.isTrusted&&Number.isFinite(a.movementX)&&Number.isFinite(a.movementY)&&['BODY','CANVAS'].includes(a.target)&&(dx!==0||a.movementX===0)&&(dy!==0||a.movementY===0))&&Math.abs(x-dx)<=1&&Math.abs(y-dy)<=1&&row.actualMovementX===x&&row.actualMovementY===y;}
function validSceneCapture(row,name,hall){const o=row?.observer,f=o?.facts;return row?.name===name&&row.status==='PASS'&&row.hall===hall&&o?.disposed===true&&Array.isArray(o.events)&&o.events.length<=128&&Array.isArray(o.errors)&&o.errors.length===0&&f?.focused&&f.visible&&f.locked&&!f.mapOpen&&(!hall||/慈宁宫后殿|大佛堂/.test(f.location??''));}
export async function runSceneCapture(page,{name,hall,action,save}){
 const row={name,hall,status:'FAIL',scope:'Public focus, visibility, pointer lock, map and location across screenshot; intentional F3 HUD hiding is allowed.'};let handle,failure,result;
 const check=o=>{const f=o?.facts;if(!f?.focused||!f.visible||!f.locked||f.mapOpen||(hall&&!/慈宁宫后殿|大佛堂/.test(f.location??''))||!Array.isArray(o.events)||o.events.length>128||!Array.isArray(o.errors)||o.errors.length)throw Error('scene capture focus/lock/visibility/location integrity failed');};
 try{
  handle=await page.evaluateHandle(({hall})=>{
   const events=[],errors=[],location=document.querySelector('#location-panel');let disposed=false;
   const facts=()=>({focused:document.hasFocus(),visible:document.visibilityState==='visible',locked:document.pointerLockElement===document.body,mapOpen:document.body.classList.contains('map-open'),location:location?.innerText??null});
   const invalid=why=>{if(errors.length<8&&!errors.includes(why))errors.push(why);};
   const record=type=>{if(events.length>=128){invalid('scene capture event overflow');return;}const state=facts();events.push({type,at:performance.now(),...state});if(!state.focused||!state.visible||!state.locked||state.mapOpen||(hall&&!/慈宁宫后殿|大佛堂/.test(state.location??'')))invalid('scene capture state lost');};
   const focus=()=>record('focus'),blur=()=>{invalid('window blurred during capture');record('blur');},lock=()=>record('pointerlockchange'),visibility=()=>record('visibilitychange');
   window.addEventListener('focus',focus);window.addEventListener('blur',blur);document.addEventListener('pointerlockchange',lock);document.addEventListener('visibilitychange',visibility);
   const changed=records=>{for(const r of records)if(r.type==='attributes'&&r.attributeName==='class'&&/(?:^|\s)map-open(?:\s|$)/.test(r.oldValue??''))invalid('map opened during capture');record('public-state-mutation');};
   const observer=new MutationObserver(changed);observer.observe(document.body,{attributes:true,attributeOldValue:true,attributeFilter:['class']});if(location)observer.observe(location,{childList:true,characterData:true,subtree:true});
   const read=()=>({events,errors,facts:facts(),disposed});
   return {read,dispose(){const records=observer.takeRecords();if(records.length)changed(records);observer.disconnect();window.removeEventListener('focus',focus);window.removeEventListener('blur',blur);document.removeEventListener('pointerlockchange',lock);document.removeEventListener('visibilitychange',visibility);disposed=true;return read();}};
  },{hall});
  row.before=await handle.evaluate(o=>o.read());check(row.before);save(row);result=await action();row.after=await handle.evaluate(o=>o.read());check(row.after);
 }catch(e){failure=e;row.failure=e.message;}
 finally{
  if(handle){try{row.observer=await handle.evaluate(o=>o.dispose());check(row.observer);if(!row.observer.disposed)throw Error('scene observer not disposed');}catch(e){row.observerCleanupError=e.message;failure??=e;}finally{try{await handle.dispose();}catch(e){row.handleCleanupError=e.message;failure??=e;}}}
  row.status=failure?'FAIL':'PASS';if(failure&&!row.failure)row.failure=failure.message;save(row);
 }
 if(failure)throw failure;return result;
}
export function finalizeEvidence(r){
 r.releaseAccepted=false;r.visualReview={...r.visualReview,status:'REQUIRED'};
 if(r.pageErrors?.length||r.requestFailures?.length||r.responses?.some(x=>x.status>=400)||r.console?.some(m=>m.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(m.text)))r.runtimeStatus='FAIL';
 r.missingRequiredImages=REQUIRED_IMAGES.filter(name=>{const a=(r.captureAttempts??[]).filter(x=>x.name===name),s=(r.screenshots??[]).filter(x=>x.name===name);return a.length!==1||s.length!==1||a[0].kind!=='app'||a[0].required!==true||a[0].status!=='PASS'||s[0].kind!=='app'||s[0].file!==name+'.png'||s[0].width!==1280||s[0].height!==800||!(s[0].bytes>0)||!/^[a-f0-9]{64}$/.test(s[0].sha256);});
 const codes=['KeyW','KeyW','KeyW','KeyW','KeyA','KeyA','KeyD','KeyD','KeyD','KeyD'],looks=[[160,0],[0,-80],[-160,80],[-160,0],[0,-80]],links=[0,0,0,4,6,6,10,10],lookLinks=[0,0,0,0,1,2,4,5];
 const route=(r.inputSegments?.length>0&&r.inputSegments.length<=24&&r.inputSegments.every(x=>validInput(x,'KeyW'))&&r.postEntrySegments?.length===10&&codes.every((x,i)=>validPost(r.postEntrySegments[i],x))&&r.lookSegments?.length===5&&looks.every(([x,y],i)=>validLook(r.lookSegments[i],x,y))&&r.viewLinks?.length===8&&r.viewLinks.every((x,i)=>x.name===REQUIRED_IMAGES[i]&&x.postCount===links[i]&&x.lookCount===lookLinks[i]&&(i<2?x.entryCount===0:x.entryCount===r.inputSegments.length&&/慈宁宫后殿|大佛堂/.test(x.location??'')))&&r.screenshots.find(x=>x.name===REQUIRED_IMAGES[2])?.sha256!==r.screenshots.find(x=>x.name===REQUIRED_IMAGES[3])?.sha256);
 const captures=r.sceneCaptureStates?.length===7&&REQUIRED_IMAGES.slice(1).every((name,i)=>validSceneCapture(r.sceneCaptureStates[i],name,i>0));
 if(r.missingRequiredImages.length||r.captureFailures?.length||!route||!captures)r.captureStatus='FAIL';
 r.status=r.runtimeStatus==='PASS'&&r.captureStatus==='PASS'&&!r.unexpectedLifecycle&&!r.cleanupErrors?.length?'AUTOMATED_TARGETED_CAPTURE_PASS_VISUAL_REVIEW_REQUIRED':'FAIL';return r;
}
export async function closeOwned({context,browser,server}){const errors=[];for(const[name,item]of [['context',context],['browser',browser]])if(item)try{await item.close();}catch(e){errors.push(name+': '+e.message);}if(server)try{server.closeAllConnections();await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}catch(e){errors.push('server: '+e.message);}return errors;}

// One native mouse command, no camera readback/correction. Observe only public
// events and a subsequent public HUD batch; never inject frames or app methods.
export async function runNativeLook(page,{name,pointer,dx,dy,save,timeoutMs=30000}){
  assert.ok(pointer&&[pointer.x,pointer.y,dx,dy].every(Number.isFinite)&&pointer.x>=0&&pointer.x<1280&&pointer.y>=0&&pointer.y<800&&Number.isInteger(dx)&&Number.isInteger(dy)&&Math.abs(dx)<=160&&Math.abs(dy)<=80&&(dx||dy)&&timeoutMs>0&&timeoutMs<=30000,'bounded native look request');
  const x=pointer.x+dx,y=pointer.y+dy;assert.ok(x>=0&&x<1280&&y>=0&&y<800,'native pointer out of bounds');
  const row={name,x,y,expectedMovementX:dx,expectedMovementY:dy,timeoutMs,status:'FAIL'},deadline=Date.now()+timeoutMs;
  let handle,failure;
  const remaining=()=>{const n=deadline-Date.now();if(n<=0)throw Error('native look deadline');return n;};
  const requireFacts=s=>{if(!s.facts.focused||!s.facts.visible||!s.facts.locked||!s.facts.hudVisible||s.facts.mapOpen||typeof s.facts.heading!=='string'||!s.facts.heading||s.errors.length)throw Error('native look public precondition failed');};
  const requireObservation=s=>{
    requireFacts(s);const events=s.events,totalX=events.reduce((n,e)=>n+e.movementX,0),totalY=events.reduce((n,e)=>n+e.movementY,0);
    if(!events.length||events.length>128||s.updates.length>128||events.some(e=>!e.isTrusted||!Number.isFinite(e.movementX)||!Number.isFinite(e.movementY)||(!dx&&e.movementX!==0)||(!dy&&e.movementY!==0)||!['BODY','CANVAS'].includes(e.target))||Math.abs(totalX-dx)>1||Math.abs(totalY-dy)>1||!s.updates.length)throw Error('native look trusted XY event/update evidence missing');
    return {x:totalX,y:totalY};
  };
  try{
    handle=await page.evaluateHandle(()=>{
      const hud=document.querySelector('#perf-hud'),events=[],updates=[],errors=[];
      const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden';
      const facts=()=>({focused:document.hasFocus(),visible:document.visibilityState==='visible',locked:document.pointerLockElement===document.body,hudVisible:visible(hud),mapOpen:document.body.classList.contains('map-open'),heading:document.querySelector('#minimap-heading')?.textContent});
      const invalid=text=>{if(errors.length<8)errors.push(text);};
      const move=e=>{if(events.length>=128){invalid('mouse event bound exceeded');return;}events.push({isTrusted:e.isTrusted,movementX:e.movementX,movementY:e.movementY,timeStamp:e.timeStamp,at:performance.now(),target:e.target?.tagName,heading:facts().heading});};
      const lost=()=>{if(!facts().locked||!facts().focused||!facts().visible)invalid('native look focus/lock lost');};
      const mutation=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'))invalid('HUD style changed during look');if(events.length&&records.some(r=>r.type==='childList'||r.type==='characterData')){if(updates.length>=128)invalid('HUD batch bound exceeded');else updates.push({at:performance.now(),hud:hud.textContent,heading:facts().heading});}});
      if(!hud)throw Error('native look HUD missing');
      mutation.observe(hud,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']});
      window.addEventListener('mousemove',move);window.addEventListener('blur',lost);document.addEventListener('pointerlockchange',lost);document.addEventListener('visibilitychange',lost);
      const read=()=>({events,updates,errors,facts:facts()});
      return{read,dispose(){mutation.disconnect();window.removeEventListener('mousemove',move);window.removeEventListener('blur',lost);document.removeEventListener('pointerlockchange',lost);document.removeEventListener('visibilitychange',lost);return read();}};
    });
    row.before=await handle.evaluate(o=>o.read());requireFacts(row.before);save(row);remaining();
    await page.mouse.move(x,y,{steps:1});
    const ready=await page.waitForFunction(o=>{const s=o.read();return s.updates.length>0||s.errors.length>0;},handle,{polling:100,timeout:remaining()});await ready.dispose();
    row.observer=await handle.evaluate(o=>o.read());({x:row.actualMovementX,y:row.actualMovementY}=requireObservation(row.observer));
  }catch(error){failure=error;row.failure=error.message;}
  finally{
    if(handle){try{row.observer=await handle.evaluate(o=>o.dispose());({x:row.actualMovementX,y:row.actualMovementY}=requireObservation(row.observer));}catch(error){row.finalObservationError=error.message;failure??=error;}finally{try{await handle.dispose();}catch(error){row.handleCleanupError=error.message;failure??=error;}}}
    if(failure&&!row.failure)row.failure=failure.message;
    row.status=failure?'FAIL':'PASS';save(row);
  }
  if(failure)throw failure;return row;
}


export async function runNativeTranslate(page,{code,name,timeoutMs,save}){
 if(!['KeyA','KeyD'].includes(code)||!(timeoutMs>0&&timeoutMs<=30000))throw Error('invalid bounded translation request');
 const {observeEntryInput}=await import('../lib/r262-entry-input.mjs'),key=code==='KeyA'?'a':'d',started=Date.now(),end=started+timeoutMs;
 const row={name,code,status:'FAIL',timeoutMs,scope:'Trusted native input and public HUD batches; not proof of translation through a blocker.'};let handle,failure,held=false;
 const remaining=()=>{const n=end-Date.now();if(n<=0)throw Error('native translation deadline');return n;};
 const sample=async()=>{row.observer=await handle.evaluate(o=>o.read());save(row);return row.observer;};
 const facts=s=>{const f=s.facts;if(!f.active||!f.hasFocus||f.visibility!=='visible'||!f.pointerLockedToBody||!f.hudVisible||f.mapOpen||f.welcomeVisible||f.settingsVisible||f.failureVisible||f.active.textEntry||s.integrityErrors.length||s.events.length>128||s.batches?.length>128)throw Error('native translation focus or integrity failure');};
 const waitBatch=async phase=>{const predicate=phase==='held'?o=>{const s=o.read();return s.heldBatches>0||s.integrityErrors.length>0;}:o=>{const s=o.read();return s.releasedBatches>0||s.integrityErrors.length>0;};const result=await page.waitForFunction(predicate,handle,{polling:100,timeout:remaining()});await result.dispose();facts(await sample());};
 try{
  handle=await page.evaluateHandle(observeEntryInput,{code});row.beforeClick=await sample();if(!row.beforeClick.facts.pointerLockedToBody)throw Error('native translation needs pointer lock');
  try{await page.mouse.down();}finally{await page.mouse.up();}const ready=await sample();facts(ready);const click=ready.events.findLast(e=>e.type==='click'&&e.phase==='bubble');
  if(!click?.isTrusted||!['BODY','CANVAS'].includes(click.target?.tag)||click.target?.textEntry||click.target?.spaceInteractive)throw Error('native translation scene click not admitted');
  await handle.evaluate(o=>o.arm());remaining();row.downAttempted=true;save(row);await page.keyboard.down(key);const down=await sample();facts(down);
  const capture=down.events.find(e=>e.type==='keydown'&&e.phase==='capture'&&e.code===code),bubble=down.events.find(e=>e.type==='keydown'&&e.phase==='bubble'&&e.code===code);
  if(!capture?.isTrusted||capture.repeat||capture.defaultPrevented||capture.ctrlKey||capture.metaKey||capture.altKey||capture.target?.textEntry||!bubble?.isTrusted||bubble.repeat||!bubble.defaultPrevented)throw Error('native translation keydown not admitted');
  await waitBatch('held');held=true;
 }catch(e){failure=e;row.failure=e.message;}
 finally{
  try{await page.keyboard.up(key);}catch(e){row.keyupError=e.message;failure??=e;}
  if(handle){try{const released=await sample();if(held&&!failure){const up=released.events.findLast(e=>e.type==='keyup'&&e.phase==='bubble'&&e.code===code);if(!up?.isTrusted||released.upAt===null)throw Error('native translation keyup missing');await waitBatch('released');}row.observer=await handle.evaluate(o=>o.dispose());}
   catch(e){row.observationCleanupError=e.message;failure??=e;try{row.observer=await handle.evaluate(o=>o.dispose());}catch(error){row.disposeError=error.message;}}
   finally{try{await handle.dispose();}catch(e){row.handleCleanupError=e.message;failure??=e;}}
  }
  const o=row.observer;row.heldBrowserMs=Number.isFinite(o?.downAt)&&Number.isFinite(o?.upAt)?o.upAt-o.downAt:null;row.autoSprintPossible=row.heldBrowserMs>=2000;row.hostElapsedMs=Date.now()-started;row.status=failure?'FAIL':'PASS';
  if(!failure&&!validInput(row,code)){failure=Error('native translation final observation invalid');row.status='FAIL';}
  if(failure&&!row.failure)row.failure=failure.message;save(row);
 }
 if(failure)throw failure;return row;
}

async function main(){
  // Dynamic dependencies keep the bounded host fixture free of browser/scene work.
  const {chromium}=await import('playwright');
  const {createCanvas,loadImage}=await import('@napi-rs/canvas');
  const {verifyBuildSource}=await import('../../scripts/build-identity.mjs');
  const {createCaptureEvidence}=await import('../lib/r262-capture-evidence.mjs');
  const {runEntryKey}=await import('../lib/r262-entry-input.mjs');
  const base='/forbidden-city-3d/',dist=path.resolve('dist'),out=process.env.EVIDENCE_DIR;
  assert.ok(process.env.CI==='true'&&process.env.GITHUB_ACTIONS==='true','admitted GitHub Actions only');
  assert.ok(out&&path.isAbsolute(out),'absolute external evidence directory required');fs.mkdirSync(out,{recursive:true});
  const hash=b=>createHash('sha256').update(b).digest('hex');
  const result={routeDiagnostic:{...ROUTE_DIAGNOSTIC},kind:'R265 first-entry Dafotang targeted native-UI capture',status:'FAIL',runtimeStatus:'IN_PROGRESS',captureStatus:'INCOMPLETE',started:new Date().toISOString(),releaseAccepted:false,hardwareGpuTested:false,physicalPhoneTested:false,
    visualReview:{status:'REQUIRED',criteria:['Three broad central opening outlines; six plain MODEL_FIT returns.','No cut-corner or hanging-board illusion; inspect depth and underside.','No gaps or spills at columns; inspect both side joins and crowns.','Readable shrine context, sufficient beam pixels and plausible sampled shadows/aliasing.']},
    boundary:'First-entry desktop software-rendered frames only; not historical measurement, hardware GPU, mobile, cold return or release acceptance. Lateral input is not proof of movement through blockers.',
    untested:['Full hall route and cold return','Measured historical dimensions','Hardware GPU and physical phones','Continuous motion/flicker beyond sampled frames'],
    assertions:[],screenshots:[],console:[],pageErrors:[],requestFailures:[],responses:[],stages:[],lifecycle:[],inputSegments:[],postEntrySegments:[],lookSegments:[],viewLinks:[],sceneCaptureStates:[],targetSelections:[],zoneLifecycle:[]};
  let server,browser,context,page,stage='preflight',cleanupStarted=false,nativePointer=null;const plaqueResponses=[],plaque='textures/dafotang/wanshou-wujiang-modern-tc-r259.png',plaqueHash='8b814c7439788f2eb0f4bedbe08f7e674de18120d0bb4f1d38e1175943f8e70e';
  const checkpoint=()=>{const file=path.join(out,'dafotang-visual.json');fs.writeFileSync(file+'.tmp',JSON.stringify(result,null,2)+'\n');fs.renameSync(file+'.tmp',file);};
  const append=(list,value)=>{if(list.length>=2000)throw Error('Evidence exceeds fixed 2000-event bound');list.push(value);};
  const check=(ok,message,data,lane='runtime')=>{append(result.assertions,{stage,lane,pass:!!ok,message,...(data===undefined?{}:{data})});checkpoint();if(!ok)throw Error(message);};
  const mark=value=>{stage=value;append(result.stages,{stage,at:new Date().toISOString()});checkpoint();console.log('STAGE '+value);};
  const lifecycle=event=>{append(result.lifecycle,{event,stage,at:new Date().toISOString(),expected:cleanupStarted});if(!cleanupStarted)result.unexpectedLifecycle=true;checkpoint();};
  const captures=createCaptureEvidence({result,checkpoint,getStage:()=>stage});
  async function snapshot(name){
    const state=await page.evaluate(()=>{
      const canvas=document.querySelector('#scene-canvas'),gl=canvas?.getContext('webgl2')||canvas?.getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');
      return{href:location.href,lang:document.documentElement.lang,location:document.querySelector('#location-panel')?.innerText,heading:document.querySelector('#minimap-heading')?.textContent,
        visibility:document.visibilityState,fontsStatus:document.fonts?.status,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scrollX,scrollY},canvasCss:canvas?{width:canvas.getBoundingClientRect().width,height:canvas.getBoundingClientRect().height}:null,
        mapOpen:document.body.classList.contains('map-open'),pointerLocked:document.pointerLockElement===document.body,failure:document.querySelector('#tour-failure-dialog')?.innerText??null,devHook:typeof window.__forbiddenCityApp,perf:document.querySelector('#perf-hud')?.textContent,
        gl:gl?{lost:gl.isContextLost(),width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,contextAttributes:gl.getContextAttributes(),version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),unmaskedRenderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null}:null};
    });
    const observation=captures.observe(name,state);check(state.devHook==='undefined','production has no development hook');
    const calls=Number(state.perf?.match(/Calls (\d+)/)?.[1]),tris=Number(state.perf?.match(/Tris ([\d,]+)/)?.[1]?.replaceAll(',',''));
    check(calls>10&&tris>1000,'public F3 HUD records real draws',{calls,tris});check(!state.failure,'no terminal tour failure');check(state.gl&&!state.gl.lost&&state.gl.width>0&&state.gl.height>0,'live production WebGL context',state.gl);
    const image=await captures.capture({page,name,kind:'app',required:true,file:name+'.png',outputPath:path.join(out,name+'.png'),timeout:60000,validate:async bytes=>{
      const im=await loadImage(bytes),c=createCanvas(160,100),ctx=c.getContext('2d');check(im.width===1280&&im.height===800,'actual full PNG dimensions',{width:im.width,height:im.height},'capture');
      ctx.drawImage(im,im.width*.2,im.height*.25,im.width*.6,im.height*.6,0,0,160,100);const pixels=ctx.getImageData(0,0,160,100).data,colors=new Set();let min=255,max=0;
      for(let i=0;i<pixels.length;i+=4){const v=(pixels[i]+pixels[i+1]+pixels[i+2])/3;min=Math.min(min,v);max=Math.max(max,v);colors.add((pixels[i]>>4)*256+(pixels[i+1]>>4)*16+(pixels[i+2]>>4));}
      check(colors.size>12&&max-min>24,'nonblank pixels only, not semantic acceptance',{colors:colors.size,range:max-min},'capture');
      return{...observation,sha256:hash(bytes),width:im.width,height:im.height,centerPixels:{quantizedColors:colors.size,luminanceRange:max-min}};
    }});check(!!image,'required application capture completed',name,'capture');append(result.viewLinks,{name,entryCount:result.inputSegments.length,postCount:result.postEntrySegments.length,lookCount:result.lookSegments.length,location:observation.location,heading:observation.heading});checkpoint();return observation;
  }
  async function sceneSnapshot(name,hall){const i=result.sceneCaptureStates.length;append(result.sceneCaptureStates,{name,hall,status:'PENDING'});checkpoint();return runSceneCapture(page,{name,hall,action:()=>snapshot(name),save:row=>{result.sceneCaptureStates[i]=row;checkpoint();}});}
  async function healthy(){
    check(!result.pageErrors.length,'no uncaught page errors',result.pageErrors);
    const fatal=result.console.filter(m=>m.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(m.text));
    check(!fatal.length,'no console errors or fatal shader/WebGL messages',fatal);check(!result.requestFailures.length,'no failed resource requests',result.requestFailures);check(!result.responses.some(r=>r.status>=400),'no HTTP resource errors');
  }
  async function openMap(){if(await page.locator('#minimap').isVisible())return;await page.locator('#help-panel > button').focus();await page.keyboard.press('m');await page.locator('#minimap').waitFor({state:'visible',timeout:60000});}
  async function resume(){if(!await page.evaluate(()=>document.pointerLockElement===document.body)){await page.mouse.click(640,420);nativePointer={x:640,y:420};}await page.waitForFunction(()=>document.pointerLockElement===document.body,null,{timeout:15000});await page.locator('#welcome-overlay').waitFor({state:'hidden'});}
  async function selectTarget(){
    await openMap();if(await page.locator('#place-back').isVisible())await page.locator('#place-back').click();
    await page.locator('#place-search').fill('大佛堂');const sameName=page.locator('button[data-place-id]').filter({hasText:/^大佛堂$/});check(await sameName.count()===1,'one exact same-name public target');const button=page.locator(`button[data-place-id="${TARGET_ID}"]`),matches=await button.count();
    check(matches===1&&await button.isVisible(),'exact public target button visible',{id:TARGET_ID,matches});
    const id=await button.getAttribute('data-place-id');await button.click();
    const row={id,matches,title:await page.locator('#place-title').innerText(),card:await page.locator('#place-info').innerText(),travelVisible:await page.locator('#place-travel').isVisible(),travelText:await page.locator('#place-travel').innerText(),stage};
    append(result.targetSelections,row);checkpoint();validateTargetDetail(row);return row;
  }
  async function travel(){
    // Use the visible button's actual center so the last explicitly commanded
    // pointer coordinate is known even if this click immediately locks it.
    const button=page.locator('#place-travel');await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();
    check(box&&box.width>0&&box.height>0,'visible public travel hitbox');nativePointer={x:box.x+box.width/2,y:box.y+box.height/2};
    check(nativePointer.x>=60&&nativePointer.x<1220&&nativePointer.y>=0&&nativePointer.y<800,'public travel pointer leaves bounded look room',nativePointer);
    append(result.stages,{stage:'native public travel click',pointer:{...nativePointer},box});checkpoint();await page.mouse.click(nativePointer.x,nativePointer.y);
    await page.locator('#minimap').waitFor({state:'hidden',timeout:180000});await resume();
    await page.waitForFunction(()=>/^Loaded .*outer-west/m.test(document.querySelector('#perf-hud')?.textContent??''),null,{timeout:60000});
    const observation=await page.evaluate(()=>({heading:document.querySelector('#minimap-heading')?.textContent,location:document.querySelector('#location-panel')?.innerText,perf:document.querySelector('#perf-hud')?.textContent}));
    check(typeof observation.heading==='string'&&!!observation.heading,'public heading recorded after travel',observation);
    append(result.stages,{stage:'public travel observed',observation,landing:'No internal position read; nominal 8 m is not asserted as actual landing.'});checkpoint();
  }
  try{
    const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();check(commit===process.env.GITHUB_SHA,'exact event source');check(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim()==='','clean checkout');
    const build=verifyBuildSource({expectedBase:base});result.build=build;
    validateBuildIdentity(build,commit);check(true,'exact unchanged product build identity');
    check(hash(fs.readFileSync(path.join(dist,plaque)))===plaqueHash,'exact plaque PNG in build');result.playwright=JSON.parse(fs.readFileSync('node_modules/playwright/package.json','utf8')).version;check(result.playwright==='1.64.0','pinned Playwright');
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8'};
    server=http.createServer((req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!['GET','HEAD'].includes(req.method)||!pathname.startsWith(base)||pathname.includes('\\')){res.writeHead(404);res.end();return;}const file=path.resolve(dist,pathname.slice(base.length)||'index.html');if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.lstatSync(file).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':fs.statSync(file).size,'Cache-Control':'no-store'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);}catch{res.writeHead(500);res.end();}});
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;result.url=origin+base;
    mark('launch pinned official Chromium');result.launch={channel:'chromium',headless:true,chromiumSandbox:true,args:['--use-angle=swiftshader','--enable-automation'],ignoreDefaultArgs:['--enable-unsafe-swiftshader']};
    browser=await chromium.launch({...result.launch,timeout:60000});result.browser=browser.version();browser.on('disconnected',()=>lifecycle('browser-disconnected'));
    const cdp=await browser.newBrowserCDPSession();try{result.browserCommandLine=await cdp.send('Browser.getBrowserCommandLine');}finally{await cdp.detach();}
    result.browserExecutable=result.browserCommandLine.arguments[0];check(result.browser==='156.0.8078.4'&&result.browserExecutable===chromium.executablePath()&&/\/chromium-1248\//.test(result.browserExecutable),'pinned full official Chromium');check(!result.browserCommandLine.arguments.some(a=>/^--(no-sandbox|disable-setuid-sandbox|disable-web-security|disable-gpu|enable-unsafe-swiftshader)(=|$)/.test(a)),'no sandbox or security/GPU disabling flags');
    context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});page=await context.newPage();page.setDefaultTimeout(30000);page.on('crash',()=>lifecycle('page-crash'));page.on('close',()=>lifecycle('page-close'));
    mark('blank capture control');check(page.url()==='about:blank','independent blank control');
    const blank=await captures.capture({page,name:'control-blank-page',kind:'control',file:'control-blank-page.png',outputPath:path.join(out,'control-blank-page.png'),timeout:10000,validate:async bytes=>{const im=await loadImage(bytes);check(im.width===1280&&im.height===800,'blank control dimensions',undefined,'capture-control');return{sha256:hash(bytes),width:im.width,height:im.height,boundary:'Tool control only, not application evidence.'};}});check(!!blank,'blank capture returned');
    page.on('pageerror',e=>{append(result.pageErrors,{stage,message:e.message,stack:e.stack});checkpoint();});page.on('console',m=>{if(['error','warning'].includes(m.type())){append(result.console,{stage,type:m.type(),text:m.text()});checkpoint();}const text=m.text();if(m.type()==='log'&&/^\[ZoneManager\] (加载区域|卸载区域) /.test(text)&&result.zoneLifecycle.length<256){result.zoneLifecycle.push({stage,at:new Date().toISOString(),text:text.slice(0,512)});checkpoint();}});
    page.on('requestfailed',r=>{append(result.requestFailures,{stage,url:r.url(),error:r.failure()});checkpoint();});page.on('response',r=>{append(result.responses,{stage,url:r.url(),status:r.status(),type:r.request().resourceType()});if(r.url()===origin+base+plaque)plaqueResponses.push({response:r,stage,at:new Date().toISOString()});});
    mark('normal production startup');const navigation=await page.goto(origin+base,{waitUntil:'domcontentloaded',timeout:120000});check(navigation.status()===200,'real Pages base HTML');await page.locator('#loading-screen').waitFor({state:'hidden',timeout:240000});await page.locator('#scene-canvas').waitFor({state:'visible'});
    check(await page.locator('meta[name="palace-build-id"]').getAttribute('content')===build.buildId,'HTML identity');const served=await page.evaluate(async()=>{const r=await fetch('./build-info.json');if(!r.ok)throw Error('identity fetch failed');return r.json();});check(JSON.stringify(served)===JSON.stringify(build),'HTTP/disk identity');
    await page.locator('#day-night-panel > summary').click();await page.locator('#beijing-hour').fill('12');await page.locator('#beijing-minute').fill('00');await page.locator('#beijing-apply').click();await page.locator('#beijing-close').click();await resume();await page.keyboard.press('F3');
    await page.waitForFunction(()=>/Calls [1-9]/.test(document.querySelector('#perf-hud')?.textContent??''),null,{timeout:60000});check((await page.locator('#perf-hud').textContent()).includes('Startup yuqing-south-entry'),'normal eighth startup zone');await healthy();
    mark('exact public Dafotang selection');await selectTarget();await snapshot(REQUIRED_IMAGES[0]);
    mark('single public travel to outer-west');await travel();
    if(!plaqueResponses.length)await page.waitForResponse(r=>r.url()===origin+base+plaque,{timeout:180000});
    const actual=plaqueResponses.at(-1),response=actual.response;check(response.status()===200&&response.request().resourceType()==='image','actual production plaque request');const imageBytes=await response.body();check(hash(imageBytes)===plaqueHash,'actual plaque response hash');
    result.plaque={url:response.url(),sha256:hash(imageBytes),bytes:imageBytes.length,stage:actual.stage,requestOrigin:'production ImageLoader before independent decode'};
    result.plaque.nativeDecode=await page.evaluate(async url=>{const image=new Image();image.src=url;await image.decode();return{complete:image.complete,width:image.naturalWidth,height:image.naturalHeight};},origin+base+plaque);
    check(result.plaque.nativeDecode.complete&&result.plaque.nativeDecode.width===768&&result.plaque.nativeDecode.height===286,'native browser plaque decode');await sceneSnapshot(REQUIRED_IMAGES[1],false);await healthy();
    mark('first ordinary hall entry');const entryDeadline=Date.now()+120000;let entered=false;
    for(let i=0;i<24;i++){
      const remaining=entryDeadline-Date.now();check(remaining>0,'entry deadline');const index=result.inputSegments.length;append(result.inputSegments,{name:'entry-'+(i+1),code:'KeyW',status:'PENDING'});checkpoint();
      const input=await runEntryKey(page,{name:'entry-'+(i+1),code:'KeyW',timeoutMs:Math.min(30000,remaining),save:row=>{result.inputSegments[index]=row;checkpoint();}});
      check(validInput(input,'KeyW'),'trusted entry held/released evidence');const location=await page.locator('#location-panel').innerText();append(result.stages,{stage:'entry segment',segment:i+1,location,autoSprintPossible:input.autoSprintPossible});checkpoint();
      if(/慈宁宫后殿|大佛堂/.test(location)){entered=true;break;}
    }
    check(entered,'actual public location identifies hall');await sceneSnapshot(REQUIRED_IMAGES[2],true);
    const navigationDeadline=Date.now()+ROUTE_DIAGNOSTIC.postEntryBudgetMs;
    const remainingNavigation=()=>{const n=navigationDeadline-Date.now();check(n>0,'post-entry navigation deadline');return Math.min(30000,n);};
    const inside=async()=>{const location=await page.locator('#location-panel').innerText();check(/慈宁宫后殿|大佛堂/.test(location),'hall HUD maintained during route',location);return location;};
    const move=async(code,name)=>{
      const index=result.postEntrySegments.length;append(result.postEntrySegments,{name,code,status:'PENDING'});checkpoint();const save=row=>{result.postEntrySegments[index]=row;checkpoint();};const timeoutMs=remainingNavigation();
      const input=code==='KeyW'?await runEntryKey(page,{name,code,timeoutMs,save}):await runNativeTranslate(page,{name,code,timeoutMs,save});
      check(validPost(input,code),'trusted post-entry held/released input',{name,code});await inside();remainingNavigation();
    };
    const look=async(name,dx,dy)=>{
      const index=result.lookSegments.length;append(result.lookSegments,{name,status:'PENDING'});checkpoint();const timeoutMs=remainingNavigation();
      await runNativeLook(page,{name,pointer:nativePointer,dx,dy,timeoutMs,save:row=>{result.lookSegments[index]=row;checkpoint();}});nativePointer={x:nativePointer.x+dx,y:nativePointer.y+dy};await inside();remainingNavigation();
    };
    for(let i=0;i<4;i++)await move('KeyW','near-'+(i+1));await sceneSnapshot(REQUIRED_IMAGES[3],true);
    for(let i=0;i<2;i++)await move('KeyA','west-'+(i+1));await look('west-yaw',160,0);await sceneSnapshot(REQUIRED_IMAGES[4],true);await look('west-up',0,-80);await sceneSnapshot(REQUIRED_IMAGES[5],true);
    await look('west-restore',-160,80);for(let i=0;i<4;i++)await move('KeyD','east-'+(i+1));await look('east-yaw',-160,0);await sceneSnapshot(REQUIRED_IMAGES[6],true);await look('east-up',0,-80);await sceneSnapshot(REQUIRED_IMAGES[7],true);await healthy();
    check(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim()==='','checkout unchanged');check(!result.unexpectedLifecycle,'no unexpected lifecycle event',result.lifecycle);result.runtimeStatus='PASS';checkpoint();
  }catch(error){result.runtimeStatus='FAIL';result.failure={stage,message:error.message,stack:error.stack};checkpoint();}
  finally{
    cleanupStarted=true;checkpoint();const keyErrors=[];if(page)for(const key of ['w','a','d'])try{await page.keyboard.up(key);}catch(e){keyErrors.push('keyup '+key+': '+e.message);}result.cleanupErrors=[...keyErrors,...await closeOwned({context,browser,server})];if(result.cleanupErrors.length)result.runtimeStatus='FAIL';captures.complete();finalizeEvidence(result);result.completed=new Date().toISOString();checkpoint();
    if(result.status==='FAIL')process.exitCode=1;console.log(JSON.stringify({status:result.status,runtimeStatus:result.runtimeStatus,captureStatus:result.captureStatus,visualReview:result.visualReview.status,missing:result.missingRequiredImages,stage,build:result.build,failure:result.failure,releaseAccepted:false}));
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await main();
