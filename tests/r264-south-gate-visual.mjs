// Dedicated R264 targeted evidence. Not the full production-smoke or a release gate.
// Only public UI/native input and read-only DOM/WebGL observations. CI execution only.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const TARGET_ID='place-west-six-1dd691141c';
export const REQUIRED_IMAGES=Object.freeze(['01-south-gate-detail','02-south-front-far','03-south-front-near-center','04-south-front-near-left','05-south-front-near-right','06-south-front-far-return']);
export function validateTargetDetail(row){
  assert.ok(row.id===TARGET_ID&&row.matches===1&&row.title==='太极门'&&/南正门/.test(row.card)&&/西侧/.test(row.card)&&row.travelVisible===true&&row.travelText==='前往此处','exact public south-gate target required');
}
export function finalizeEvidence(result){
  result.releaseAccepted=false;result.visualReview={...result.visualReview,status:'REQUIRED'};
  if(result.pageErrors?.length||result.requestFailures?.length||result.responses?.some(r=>r.status>=400)||result.console?.some(m=>m.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(m.text)))result.runtimeStatus='FAIL';
  result.missingRequiredImages=REQUIRED_IMAGES.filter(name=>
    !result.captureAttempts?.some(r=>r.name===name&&r.kind==='app'&&r.required===true&&r.status==='PASS')||
    !result.screenshots?.some(r=>r.name===name&&r.kind==='app'&&r.file===name+'.png'&&r.width===1280&&r.height===800&&r.bytes>0&&/^[a-f0-9]{64}$/.test(r.sha256)));
  if(result.missingRequiredImages.length||result.captureFailures?.length)result.captureStatus='FAIL';
  result.status=result.runtimeStatus==='PASS'&&result.captureStatus==='PASS'&&!result.unexpectedLifecycle&&!result.cleanupErrors?.length?
    'AUTOMATED_TARGETED_CAPTURE_PASS_VISUAL_REVIEW_REQUIRED':'FAIL';
  return result;
}
export async function closeOwned({context,browser,server}){
  const errors=[];
  for(const [name,item]of [['context',context],['browser',browser]])if(item){try{await item.close();}catch(error){errors.push(name+': '+error.message);}}
  if(server){try{server.closeAllConnections();await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}catch(error){errors.push('server: '+error.message);}}
  return errors;
}

// One native mouse command, no camera readback/correction. Observe only public
// events and a subsequent public HUD batch; never inject frames or app methods.
export async function runNativeLook(page,{name,x,y,dx,save}){
  assert.ok([-60,120].includes(dx)&&Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<1280&&y>=0&&y<800,'bounded native look request');
  const row={name,x,y,expectedMovementX:dx,timeoutMs:30000,status:'FAIL'},deadline=Date.now()+30000;
  let handle,failure;
  const remaining=()=>{const n=deadline-Date.now();if(n<=0)throw Error('native look deadline');return n;};
  const requireFacts=s=>{if(!s.facts.focused||!s.facts.visible||!s.facts.locked||!s.facts.hudVisible||s.facts.mapOpen||s.facts.heading!=='朝向 北'||s.errors.length)throw Error('native look public precondition failed');};
  const requireObservation=s=>{
    requireFacts(s);const events=s.events,total=events.reduce((n,e)=>n+e.movementX,0);
    if(!events.length||events.some(e=>!e.isTrusted||!Number.isFinite(e.movementX)||e.movementY!==0||!['BODY','CANVAS'].includes(e.target))||Math.abs(total-dx)>1||!s.updates.length)throw Error('native look trusted horizontal event/update evidence missing');
    return total;
  };
  try{
    handle=await page.evaluateHandle(()=>{
      const hud=document.querySelector('#perf-hud'),events=[],updates=[],errors=[];
      const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden';
      const facts=()=>({focused:document.hasFocus(),visible:document.visibilityState==='visible',locked:document.pointerLockElement===document.body,hudVisible:visible(hud),mapOpen:document.body.classList.contains('map-open'),heading:document.querySelector('#minimap-heading')?.textContent});
      const invalid=text=>{if(errors.length<8)errors.push(text);};
      const move=e=>{if(events.length>=8){invalid('mouse event bound exceeded');return;}events.push({isTrusted:e.isTrusted,movementX:e.movementX,movementY:e.movementY,timeStamp:e.timeStamp,at:performance.now(),target:e.target?.tagName,heading:facts().heading});};
      const lost=()=>{if(!facts().locked||!facts().focused||!facts().visible)invalid('native look focus/lock lost');};
      const mutation=new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'))invalid('HUD style changed during look');if(events.length&&records.some(r=>r.type==='childList'||r.type==='characterData')){if(updates.length>=8)invalid('HUD batch bound exceeded');else updates.push({at:performance.now(),hud:hud.textContent,heading:facts().heading});}});
      if(!hud)throw Error('native look HUD missing');
      mutation.observe(hud,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']});
      window.addEventListener('mousemove',move);window.addEventListener('blur',lost);document.addEventListener('pointerlockchange',lost);document.addEventListener('visibilitychange',lost);
      const read=()=>({events,updates,errors,facts:facts()});
      return{read,dispose(){mutation.disconnect();window.removeEventListener('mousemove',move);window.removeEventListener('blur',lost);document.removeEventListener('pointerlockchange',lost);document.removeEventListener('visibilitychange',lost);return read();}};
    });
    row.before=await handle.evaluate(o=>o.read());requireFacts(row.before);save(row);remaining();
    await page.mouse.move(x,y,{steps:1});
    const ready=await page.waitForFunction(o=>{const s=o.read();return s.updates.length>0||s.errors.length>0;},handle,{polling:100,timeout:remaining()});await ready.dispose();
    row.observer=await handle.evaluate(o=>o.read());row.actualMovementX=requireObservation(row.observer);
  }catch(error){failure=error;row.failure=error.message;}
  finally{
    if(handle){try{row.observer=await handle.evaluate(o=>o.dispose());row.actualMovementX=requireObservation(row.observer);}catch(error){row.finalObservationError=error.message;failure??=error;}finally{try{await handle.dispose();}catch(error){row.handleCleanupError=error.message;failure??=error;}}}
    if(failure&&!row.failure)row.failure=failure.message;
    row.status=failure?'FAIL':'PASS';save(row);
  }
  if(failure)throw failure;return row;
}

async function main(){
  // Dynamic dependencies keep the bounded host fixture free of browser/scene work.
  const {chromium}=await import('playwright');
  const {createCanvas,loadImage}=await import('@napi-rs/canvas');
  const {verifyBuildSource}=await import('../scripts/build-identity.mjs');
  const {createCaptureEvidence}=await import('./lib/r262-capture-evidence.mjs');
  const {runEntryKey}=await import('./lib/r262-entry-input.mjs');
  const base='/forbidden-city-3d/',dist=path.resolve('dist'),out=process.env.EVIDENCE_DIR;
  assert.ok(process.env.CI==='true'&&process.env.GITHUB_ACTIONS==='true','admitted GitHub Actions only');
  assert.ok(out&&path.isAbsolute(out),'absolute external evidence directory required');fs.mkdirSync(out,{recursive:true});
  const hash=b=>createHash('sha256').update(b).digest('hex');
  const result={kind:'R264 actual production south-gate targeted native-UI capture',status:'FAIL',runtimeStatus:'IN_PROGRESS',captureStatus:'INCOMPLETE',started:new Date().toISOString(),releaseAccepted:false,hardwareGpuTested:false,physicalPhoneTested:false,
    visualReview:{status:'REQUIRED',criteria:['Both south-face yellow bottom bands are visible above the stone feet.','Each bottom band joins both vertical yellow edges without a gap or spill.','Stone feet and central clear opening remain visually unchanged.','Near and far views actually differ; inspect continuity/aliasing in these sampled frames.']},
    boundary:'Targeted desktop software-rendered images only; not the full hall smoke, historic measured fidelity, continuous shimmer, hardware GPU, mobile, cold-return or release acceptance.',
    untested:['Full hall route and cold return','Measured historical dimensions','Hardware GPU and physical phones','Continuous motion/flicker beyond sampled frames'],
    assertions:[],screenshots:[],console:[],pageErrors:[],requestFailures:[],responses:[],stages:[],lifecycle:[],inputSegments:[],lookSegments:[],targetSelections:[],zoneLifecycle:[]};
  let server,browser,context,page,stage='preflight',cleanupStarted=false,nativePointer=null;
  const checkpoint=()=>{const file=path.join(out,'south-gate-visual.json');fs.writeFileSync(file+'.tmp',JSON.stringify(result,null,2)+'\n');fs.renameSync(file+'.tmp',file);};
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
    }});check(!!image,'required application capture completed',name,'capture');return observation;
  }
  async function healthy(){
    check(!result.pageErrors.length,'no uncaught page errors',result.pageErrors);
    const fatal=result.console.filter(m=>m.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(m.text));
    check(!fatal.length,'no console errors or fatal shader/WebGL messages',fatal);check(!result.requestFailures.length,'no failed resource requests',result.requestFailures);check(!result.responses.some(r=>r.status>=400),'no HTTP resource errors');
  }
  async function openMap(){if(await page.locator('#minimap').isVisible())return;await page.locator('#help-panel > button').focus();await page.keyboard.press('m');await page.locator('#minimap').waitFor({state:'visible',timeout:60000});}
  async function resume(){if(!await page.evaluate(()=>document.pointerLockElement===document.body)){await page.mouse.click(640,420);nativePointer={x:640,y:420};}await page.waitForFunction(()=>document.pointerLockElement===document.body,null,{timeout:15000});await page.locator('#welcome-overlay').waitFor({state:'hidden'});}
  async function selectTarget(){
    await openMap();if(await page.locator('#place-back').isVisible())await page.locator('#place-back').click();
    await page.locator('#place-search').fill('太极门');const button=page.locator(`button[data-place-id="${TARGET_ID}"]`),matches=await button.count();
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
    await page.waitForFunction(()=>/^Loaded .*west-six/m.test(document.querySelector('#perf-hud')?.textContent??'')&&document.querySelector('#minimap-heading')?.textContent==='朝向 北',null,{timeout:60000});
    const observation=await page.evaluate(()=>({heading:document.querySelector('#minimap-heading')?.textContent,location:document.querySelector('#location-panel')?.innerText,perf:document.querySelector('#perf-hud')?.textContent}));
    check(observation.heading==='朝向 北','real public map heading faces north after public travel',observation);
    append(result.stages,{stage:'public travel observed',observation,landing:'No internal position read; nominal 8 m is not asserted as actual landing.'});checkpoint();
  }
  try{
    const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();check(commit===process.env.GITHUB_SHA,'exact event source');check(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim()==='','clean checkout');
    const build=verifyBuildSource({expectedBase:base});result.build=build;
    check(build.sourceCommit===commit&&!build.sourceDirty&&build.release==='R262'&&build.buildId==='R262-82a3edf89f68'&&build.sourceFingerprint==='5dd2afa749f2e4dec2bc2126dfff0ab3121882b82089101869053396b3b302d4','exact unchanged product build identity');
    result.playwright=JSON.parse(fs.readFileSync('node_modules/playwright/package.json','utf8')).version;check(result.playwright==='1.64.0','pinned Playwright');
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
    page.on('requestfailed',r=>{append(result.requestFailures,{stage,url:r.url(),error:r.failure()});checkpoint();});page.on('response',r=>append(result.responses,{stage,url:r.url(),status:r.status(),type:r.request().resourceType()}));
    mark('normal production startup');const navigation=await page.goto(origin+base,{waitUntil:'domcontentloaded',timeout:120000});check(navigation.status()===200,'real Pages base HTML');await page.locator('#loading-screen').waitFor({state:'hidden',timeout:240000});await page.locator('#scene-canvas').waitFor({state:'visible'});
    check(await page.locator('meta[name="palace-build-id"]').getAttribute('content')===build.buildId,'HTML identity');const served=await page.evaluate(async()=>{const r=await fetch('./build-info.json');if(!r.ok)throw Error('identity fetch failed');return r.json();});check(JSON.stringify(served)===JSON.stringify(build),'HTTP/disk identity');
    await page.locator('#day-night-panel > summary').click();await page.locator('#beijing-hour').fill('12');await page.locator('#beijing-minute').fill('00');await page.locator('#beijing-apply').click();await page.locator('#beijing-close').click();await resume();await page.keyboard.press('F3');
    await page.waitForFunction(()=>/Calls [1-9]/.test(document.querySelector('#perf-hud')?.textContent??''),null,{timeout:60000});check((await page.locator('#perf-hud').textContent()).includes('Startup yuqing-south-entry'),'normal eighth startup zone');await healthy();
    mark('exact public south-gate selection');await selectTarget();await snapshot('01-south-gate-detail');
    mark('public travel to south-gate front');await travel();await snapshot('02-south-front-far');await healthy();
    mark('one native forward segment only');await runEntryKey(page,{name:'south-gate-one-forward',code:'KeyW',timeoutMs:30000,save:row=>{result.inputSegments[0]=row;checkpoint();}});await snapshot('03-south-front-near-center');
    mark('bounded native left look');await runNativeLook(page,{name:'near-left',x:nativePointer.x-60,y:nativePointer.y,dx:-60,save:row=>{result.lookSegments[0]=row;checkpoint();}});nativePointer.x-=60;await snapshot('04-south-front-near-left');
    mark('bounded native right look');await runNativeLook(page,{name:'near-right',x:nativePointer.x+120,y:nativePointer.y,dx:120,save:row=>{result.lookSegments[1]=row;checkpoint();}});nativePointer.x+=120;await snapshot('05-south-front-near-right');await healthy();
    mark('same public navigation restores far baseline');await selectTarget();await travel();await snapshot('06-south-front-far-return');await healthy();
    check(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim()==='','checkout unchanged');check(!result.unexpectedLifecycle,'no unexpected lifecycle event',result.lifecycle);result.runtimeStatus='PASS';checkpoint();
  }catch(error){result.runtimeStatus='FAIL';result.failure={stage,message:error.message,stack:error.stack};checkpoint();}
  finally{
    cleanupStarted=true;checkpoint();result.cleanupErrors=await closeOwned({context,browser,server});if(result.cleanupErrors.length)result.runtimeStatus='FAIL';captures.complete();finalizeEvidence(result);result.completed=new Date().toISOString();checkpoint();
    if(result.status==='FAIL')process.exitCode=1;console.log(JSON.stringify({status:result.status,runtimeStatus:result.runtimeStatus,captureStatus:result.captureStatus,visualReview:result.visualReview.status,missing:result.missingRequiredImages,stage,build:result.build,failure:result.failure,releaseAccepted:false}));
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await main();
