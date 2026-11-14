import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(process.env.REPO_ROOT??path.join(here,'../..'));
const out=path.resolve(process.env.EVIDENCE_DIR??path.join(here,'evidence'));
const require=createRequire(path.join(repo,'package.json'));
const {chromium}=require('playwright');
const {createServer}=await import(path.join(path.dirname(require.resolve('vite/package.json')),'dist/node/index.js'));
const pins=JSON.parse(await fs.readFile(path.join(here,'source-pins.json'),'utf8'));
await fs.mkdir(out,{recursive:true});
const result={kind:'native Chromium DOM; emulated mobile UA/touch plus Playwright keyboard, not an actual phone',sourcePins:[],cases:[],errors:[],limitations:['No World, WebGL renderer, walking physics or actual mobile keyboard','Environment setter is bounded diagnostic time state; actual product clock, flight and walking controls','No map instance or map-open CSS; specifically non-map mobile controls','Escape contract arbitration is observed, not pre-labelled a product defect']};
let server,browser;
const check=(ok,message)=>{if(!ok)throw Error(message);};
try{
 for(const [file,sha] of Object.entries(pins)){const actual=createHash('sha256').update(await fs.readFile(path.join(repo,file))).digest('hex');result.sourcePins.push({file,expected:sha,actual});check(actual===sha,'Source mismatch '+file);}
 const threeModule=path.join(path.dirname(require.resolve('three')),'three.module.js');
 server=await createServer({root:repo,configFile:false,resolve:{alias:[{find:/^three$/,replacement:threeModule}]},server:{host:'127.0.0.1',port:4179,strictPort:true,fs:{allow:[repo,here]}},logLevel:'error'});await server.listen();
 browser=await chromium.launch({headless:true,chromiumSandbox:true,args:['--disable-gpu'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 result.browser=browser.version();
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
 const prefix=process.env.FIXTURE_URL_PATH??('/@fs'+path.join(here,'index.html'));
 for(const boarded of [false,true]){
  const name=boarded?'mobile-flight':'mobile-walking',page=await context.newPage();
  page.on('pageerror',e=>result.errors.push({case:name,message:e.message}));
  await page.goto('http://127.0.0.1:4179'+prefix);await page.waitForFunction(()=>window.qaReady);
  const observe=async stage=>{
   await page.waitForTimeout(120); // allow native coalesced details toggle events
   const state=await page.evaluate(()=>{
    const q=window.qa,css=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {display:s.display,visibility:s.visibility,hidden:el.hidden,inert:el.inert,x:r.x,y:r.y,width:r.width,height:r.height};};
    return {mobile:q.controls.isMobile,mapOpen:q.controls.mapOpen,pointerLock:!!document.pointerLockElement,occupied:q.flight.occupied,operationsOpen:q.flight.operationsOpen,clockOpen:q.clock.root.open,flightOpen:q.flight.panel.open,clock:css(q.clock.root),hour:css(q.clock.hour),flight:css(q.flight.panel),sameDetailsName:q.clock.root.getAttribute('name')===q.flight.panel.getAttribute('name'),focus:{id:document.activeElement?.id,tag:document.activeElement?.tagName,insideClock:q.clock.root.contains(document.activeElement),insideFlight:q.flight.panel.contains(document.activeElement)},hourValue:q.clock.hour.value,minuteValue:q.clock.minute.value,calls:q.calls.slice(),events:q.events.slice(),bodyClass:document.body.className};
   });
   const file=name+'-'+stage+'.png';await page.screenshot({path:path.join(out,file)});return {stage,file,...state};
  };
  const record={name,states:[],steps:[]};result.cases.push(record);
  record.states.push(await observe('initial'));
  check(record.states[0].mobile&&!record.states[0].mapOpen&&!record.states[0].pointerLock,'Not expected non-map mobile initial state');
  if(boarded){await page.locator('#flight-boarding button').tap();record.steps.push('native tap boarding button');await page.waitForFunction(()=>window.qa.flight.occupied);}
  // Never force open or use force clicks. Failure is a reachability result.
  await page.locator('#day-night-panel > summary').tap();record.steps.push('native tap clock summary');
  await page.locator('#beijing-hour').fill('18');await page.locator('#beijing-minute').fill('30');
  await page.locator('#beijing-hour').tap();record.steps.push('fill actual inputs, native tap hour');
  const before=await observe('before-escape');record.states.push(before);
  check(before.clockOpen&&before.hour.display!=='none'&&before.hour.visibility!=='hidden'&&before.hour.height>0,'Clock editor not actually visible');
  check(!before.mapOpen&&!before.operationsOpen,'Precondition changed to map or modal');
  check(before.occupied===boarded,'Boarding state mismatch');
  await page.keyboard.press('Escape');record.steps.push('Playwright keyboard Escape (emulated mobile with external keyboard)');
  record.states.push(await observe('after-escape'));
  const after=record.states.at(-1);
  record.observation={clockClosed:!after.clockOpen,flightModalOpened:after.operationsOpen,clockDraftApplied:after.calls.length!==0,nativeDisclosureMutualExclusion:!after.clockOpen&&after.flightOpen};
  await page.close();
 }
 await context.close();result.captureComplete=true;
}catch(e){result.captureComplete=false;result.errors.push({message:String(e.stack??e)});process.exitCode=1;}
finally{await browser?.close();await server?.close();await fs.writeFile(path.join(out,'result.json'),JSON.stringify(result,null,2));}
