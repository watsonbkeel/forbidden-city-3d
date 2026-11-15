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
const result={kind:'native Chromium DOM repeated exit taps; emulated mobile, not actual phone',sourcePins:[],cases:[],errors:[],limitations:['No World, WebGL renderer, walking physics or actual mobile keyboard','Environment setter is bounded diagnostic time state; actual product clock, flight and walking controls','No map instance or map-open CSS; specifically non-map mobile controls','Escape contract arbitration is observed, not pre-labelled a product defect']};
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
 const page=await context.newPage();page.on('pageerror',e=>result.errors.push({message:e.message}));
 await page.goto('http://127.0.0.1:4179'+prefix);await page.waitForFunction(()=>window.qaReady);
 for(let i=0;i<3;i++){
  const rec={cycle:i,states:[]};result.cases.push(rec);
  await page.locator('#flight-boarding button').tap();
  await page.waitForFunction(()=>window.qa.flight.occupied);
  if(!(await page.locator('#flight-panel').evaluate(el=>el.open))) await page.locator('#flight-panel > summary').tap();
  await page.locator('#flight-panel [data-action="board"]').tap();
  await page.waitForFunction(()=>!window.qa.flight.occupied);
  const state=await page.evaluate(()=>{const f=window.qa.flight,c=window.qa.controls;return {occupied:f.occupied,operationsOpen:f.operationsOpen,panelHidden:f.panel.hidden,panelInert:f.panel.inert,touchHidden:f.touch.hidden,focusTag:document.activeElement.tagName,focusInsideFlight:f.panel.contains(document.activeElement),bodyClass:document.body.className,lookLocked:c.lookLocked,headBobEnabled:c.headBobEnabled,boardingHidden:f.boardingPrompt.hidden,boardingDisabled:f.boardingButton.disabled};});
  rec.states.push(state);check(!state.occupied&&!state.operationsOpen&&state.panelHidden&&state.panelInert&&state.touchHidden&&!state.focusInsideFlight,'Native exit did not release flight UI');
  await page.screenshot({path:path.join(out,'native-exit-'+i+'.png')});
 }
 await page.close();
 await context.close();result.captureComplete=true;
}catch(e){result.captureComplete=false;result.errors.push({message:String(e.stack??e)});process.exitCode=1;}
finally{await browser?.close();await server?.close();await fs.writeFile(path.join(out,'result.json'),JSON.stringify(result,null,2));}
