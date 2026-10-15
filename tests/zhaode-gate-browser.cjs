// Dedicated additive 昭德 acceptance. Never changes the original gate or terrace
// driver. Diagnostic modules are injected with recorded source hashes so this
// also tests a compiled app that does not serve source files.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

async function installZhaodeDiagnostics(page) {
  const files=['physical-waypoints.mjs','profile-support-trace.mjs','zhaode-walk.mjs'];
  const sources=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(__dirname,'lib',f),'utf8')]));
  const sourceHashes=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(sources[f]).digest('hex')]));
  const data=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
  const trace=data(sources['profile-support-trace.mjs']);
  const helper=data(sources['zhaode-walk.mjs'].replace("'./physical-waypoints.mjs'",JSON.stringify(data(sources['physical-waypoints.mjs'])))
    .replace("'./profile-support-trace.mjs'",JSON.stringify(trace)));
  await page.evaluate(async({helper,trace})=>{
    window.__zhaodeDiagnostics={...await import(helper),...await import(trace)};
  },{helper,trace});
  return sourceHashes;
}

async function runZhaodeAcceptance(page) {
  return page.evaluate(()=>{
    const app=window.__forbiddenCityApp,d=window.__zhaodeDiagnostics;
    if(!app||!d)throw new Error('Application or diagnostic helper missing');
    cancelAnimationFrame(app.animationFrame);app.disposed=true;
    Object.defineProperty(app.controls.controls,'isLocked',{get:()=>true,configurable:true});
    // The anchor comes from zone data, not from an alternative geometry model.
    // Metadata is permanent B and is available once the normal zone is loaded.
    app.zoneManager?.loadZone('axis-courts');
    const profile=d.runtimeZhaodeProfile(app),cm=app.collisionManager;
    const original=cm.walkables,results=[],failures=[];
    const fresh=noBoxRescue=>{
      cm.walkables=original.map(w=>w.type==='box'?{...w,box:w.box.clone(),...(noBoxRescue?{rescue:false}:{})}:{...w});
      return d.bindProfileSupports(cm,profile);
    };
    try{
      for(const noBoxRescue of [false,true])for(const from of ['front','rear'])for(const fps of [60,10])
      for(const sprint of [false,true])for(const backward of [false,true]){
        const identities=fresh(noBoxRescue);
        const result=d.runZhaodeRoute(app,profile,d.zhaodeRoutePoints(profile,{from}),{fps,sprint,backward,from,identities});
        results.push({kind:'matrix',noBoxRescue,...result});
        if(!result.arrived)failures.push(`matrix ${from}/${fps}/${sprint}/${backward}/${noBoxRescue}: ${result.support.failures.join('; ')}`);
      }
      for(const offsetSign of [-1,1])for(const from of ['front','rear']){
        const identities=fresh(false),offset=offsetSign*(profile.portals[0].clearWidth/2-.5-.2);
        const result=d.runZhaodeRoute(app,profile,d.zhaodeRoutePoints(profile,{from,offset}),{fps:10,sprint:true,from,identities});
        results.push({kind:'aperture-side',offset,...result});if(!result.arrived)failures.push(`aperture side ${offset}/${from}`);
      }
      for(const noBoxRescue of [false,true])for(const side of ['front','rear'])for(const mutation of ['delete','shift','substitute','shift-substitute']){
        const identities=fresh(noBoxRescue),id=profile.ramps.find(r=>r.side===side).supportId;
        const actual=[...identities].find(([,label])=>label===id)[0],substitute={...actual};
        if(!mutation.startsWith('shift')){
          cm.walkables.splice(cm.walkables.indexOf(actual),1);
          if(mutation==='substitute')cm.addWalkable({...actual},'injected-unowned-support');
        }else{
          const delta=profile.platform.width;actual.minX+=delta;actual.maxX+=delta;
          if(actual.axis==='x'){actual.a0+=delta;actual.a1+=delta;}
          else for(const key of ['crossMin0','crossMax0','crossMin1','crossMax1'])if(actual[key]!==undefined)actual[key]+=delta;
        }
        if(mutation==='shift-substitute')cm.addWalkable(substitute,'injected-unowned-support');
        const result=d.runZhaodeRoute(app,profile,d.zhaodeRoutePoints(profile),{fps:10,sprint:true,identities});
        results.push({kind:'mutation',side,mutation,noBoxRescue,...result});
        if(result.support.valid||result.arrived)failures.push(`mutation escaped: ${side}/${mutation}/${noBoxRescue}`);
        if(mutation.includes('substitute')&&!result.xyArrived)failures.push(`substitute did not reproduce endpoint false-positive: ${side}/${noBoxRescue}`);
      }
      return {profileId:profile.id,driver:d.ZHAODE_WAYPOINT_DRIVER,profile,results,failures,
        controller:'live window.__forbiddenCityApp.controls',collision:'live window.__forbiddenCityApp.collisionManager',
        protocol:'deterministic real-controller diagnostic; separate normal-RAF keyboard acceptance is required'};
    }finally{cm.walkables=original;app.controls.stop();}
  });
}

module.exports={installZhaodeDiagnostics,runZhaodeAcceptance};
if(require.main===module)(async()=>{
  const {chromium}=require('playwright');const {browserExecutablePath}=require('./lib/browser-path.cjs');
  const out=process.env.ZHAODE_EVIDENCE_DIR||'/tmp/zhaode-v7-browser';fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({executablePath:browserExecutablePath(),headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const base=process.env.PALACE_URL||'http://127.0.0.1:5173',url=new URL(base);
    if(process.env.ZHAODE_ZONE_MODE!=='default')url.searchParams.set('zones','all');
    await page.goto(url.href,{waitUntil:'load'});
    await page.waitForFunction(()=>window.__forbiddenCityApp?.controls&&document.querySelector('#loading-screen').style.display==='none',null,{timeout:240000});
    if(process.env.ZHAODE_B_ONLY==='1')await page.evaluate(()=>window.__forbiddenCityApp.interiors?.dispose());
    const sourceHashes=await installZhaodeDiagnostics(page),result=await runZhaodeAcceptance(page);
    fs.writeFileSync(path.join(out,'zhaode-controller.json'),JSON.stringify({url:url.href,sourceHashes,errors,...result},null,2));
    console.log(JSON.stringify({cases:result.results.length,failures:result.failures,errors,sourceHashes,out},null,2));
    if(result.failures.length||errors.length)process.exitCode=1;
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
