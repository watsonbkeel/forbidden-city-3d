import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {VIEWS,requireReady,requireCaptureSet,requireCleanup} from './contract.mjs';
import {inventory} from './build-review.mjs';
const out=process.env.EVIDENCE_DIR,base='/forbidden-city-3d/';
assert.equal(process.env.GITHUB_ACTIONS,'true');assert.equal(process.env.CI,'true');assert.ok(path.isAbsolute(out));
const build=JSON.parse(fs.readFileSync(path.join(out,'review-build.json'),'utf8'));assert.equal(build.status,'PASS');assert.equal(build.identity.head,process.env.GITHUB_SHA);assert.deepEqual(inventory(build.out),build.manifest);
const result={status:'FAILED',kind:'R274 finite Cangzhen native controller and four views; not a release',identity:build.identity,productionBuild:build.productionBuild,releaseAccepted:false,visualReview:'REQUIRED',scope:'Actual limited Cangzhen and retained native Yanxi/Fengxian surroundings only; not complete zone, native key automation, World/NPC dynamic, ZoneManager or historical acceptance.',screenshots:[],console:[],pageErrors:[],requestFailures:[],responses:[],errors:[],cleanupErrors:[]};
let server,browser,context,page,closing=false;
const checkpoint=()=>{fs.writeFileSync(path.join(out,'court-review.json'),JSON.stringify(result,null,2)+'\n');};
const add=(list,row)=>{if(list.length>=2000)throw Error('2000-event evidence bound');list.push(row);};
function healthy(){assert.equal(result.pageErrors.length,0,'page errors');assert.equal(result.requestFailures.length,0,'request failures');assert.ok(!result.responses.some(r=>r.status>=400),'HTTP failures');assert.ok(!result.console.some(r=>r.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(r.text)),'fatal console/WebGL errors');assert.ok(!result.unexpectedLifecycle,'unexpected browser lifecycle');}
try{
 const {chromium}=await import('playwright');const {createCanvas,loadImage}=await import('@napi-rs/canvas');
 const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain'};
 server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1'),name=decodeURIComponent(url.pathname);assert.ok(name.startsWith(base));const relative=name.slice(base.length);assert.ok(relative&&!relative.split('/').some(s=>s==='..'||s==='.')&&!relative.includes('\\'));const file=path.join(build.out,relative);assert.ok(fs.lstatSync(file).isFile());res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);}catch{res.writeHead(404);res.end('not found');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 result.launch={channel:'chromium',headless:true,chromiumSandbox:true,args:['--use-angle=swiftshader','--enable-automation'],ignoreDefaultArgs:['--enable-unsafe-swiftshader']};browser=await chromium.launch({...result.launch,timeout:60000});result.browserVersion=browser.version();browser.on('disconnected',()=>{if(!closing)result.unexpectedLifecycle=true;});
 context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,locale:'zh-CN',timezoneId:'Asia/Shanghai'});
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin){add(result.requestFailures,{url:url.href,reason:'External request blocked: isolated local artifact only'});return route.abort();}return route.continue();});
 page=await context.newPage();page.on('console',m=>{add(result.console,{type:m.type(),text:m.text().slice(0,4096)});});page.on('pageerror',e=>add(result.pageErrors,String(e)));page.on('requestfailed',r=>add(result.requestFailures,{url:r.url(),failure:r.failure()}));page.on('response',r=>add(result.responses,{url:r.url(),status:r.status()}));page.on('crash',()=>{result.unexpectedLifecycle=true;});page.on('close',()=>{if(!closing)result.unexpectedLifecycle=true;});
 checkpoint();await page.goto(origin+base+'review-court.html',{waitUntil:'domcontentloaded',timeout:120000});
 // Dedicated single-zone deadline; historical failure receipts remain unchanged.
 await page.waitForFunction(()=>['READY','FAILED'].includes(window.__R274_COURT_REVIEW__?.read().status),null,{timeout:480000,polling:100});
 result.initial=await page.evaluate(()=>window.__R274_COURT_REVIEW__.read());assert.equal(result.initial.status,'READY');requireReady(result.initial);assert.deepEqual(result.initial.identity,build.identity);healthy();checkpoint();
 for(const view of VIEWS){
  await page.locator(`button[data-view="${view.id}"]`).click();const r=await page.evaluate(()=>window.__R274_COURT_REVIEW__.read());assert.equal(r.status,'READY');requireReady(r);assert.equal(r.view.id,view.id);assert.deepEqual(r.view.position,view.position);assert.deepEqual(r.view.worldPosition,view.position);assert.deepEqual(r.identity,build.identity);healthy();
  const bytes=await page.screenshot({path:path.join(out,view.id+'.png'),type:'png',timeout:30000});const im=await loadImage(bytes);assert.equal(im.width,1280);assert.equal(im.height,800);
  const canvas=createCanvas(160,100),ctx=canvas.getContext('2d');ctx.drawImage(im,0,100,1280,650,0,0,160,100);const px=ctx.getImageData(0,0,160,100).data,colors=new Set();let lo=255,hi=0;for(let i=0;i<px.length;i+=4){const lum=(px[i]+px[i+1]+px[i+2])/3;lo=Math.min(lo,lum);hi=Math.max(hi,lum);colors.add((px[i]>>4)*256+(px[i+1]>>4)*16+(px[i+2]>>4));}assert.ok(colors.size>12&&hi-lo>24,'nonblank image required, not semantic acceptance');
  result.screenshots.push({id:view.id,file:view.id+'.png',bytes:bytes.length,width:im.width,height:im.height,sha256:createHash('sha256').update(bytes).digest('hex'),nonblank:{colors:colors.size,range:hi-lo},view:r.view,draw:r.draw,gl:r.gl});checkpoint();
 }
 requireCaptureSet(result.screenshots);assert.equal(new Set(result.screenshots.map(r=>r.sha256)).size,4,'four distinct image files required');healthy();result.captureStatus='PASS';
}catch(error){result.errors.push(String(error.stack));}
finally{
 if(page&&!page.isClosed())try{result.sceneCleanup=await page.evaluate(()=>window.__R274_COURT_REVIEW__?.dispose());assert.equal(result.sceneCleanup?.status,'COMPLETE');requireCleanup(result.sceneCleanup);}catch(e){result.cleanupErrors.push('scene: '+e.message);}
 else result.cleanupErrors.push('scene cleanup unavailable');
 closing=true;for(const [name,obj] of [['context',context],['browser',browser]])if(obj)try{await obj.close();}catch(e){result.cleanupErrors.push(name+': '+e.message);}
 if(server)try{server.closeAllConnections();await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}catch(e){result.cleanupErrors.push('server: '+e.message);}
 try{healthy();assert.equal(result.errors.length,0);assert.equal(result.cleanupErrors.length,0);requireCaptureSet(result.screenshots);assert.equal(result.captureStatus,'PASS');result.status='AUTOMATED_FINITE_CANGZHEN_PASS_VISUAL_REVIEW_REQUIRED';}catch(e){result.errors.push(e.message);}
 checkpoint();console.log(JSON.stringify({status:result.status,images:result.screenshots.length,releaseAccepted:false}));
}
if(result.status!=='AUTOMATED_FINITE_CANGZHEN_PASS_VISUAL_REVIEW_REQUIRED')process.exitCode=1;
