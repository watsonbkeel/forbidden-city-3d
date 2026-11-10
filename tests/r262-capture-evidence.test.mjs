// Orchestration-only negative controls. Fake bytes/pages are never app evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
const {createCaptureEvidence}=await import(process.env.R262_CAPTURE_FACTORY??'./lib/r262-capture-evidence.mjs');
const state={devHook:'undefined',perf:'Calls 25 Tris 5,000',gl:{lost:false,width:1280,height:800},location:'fixture state',failure:null};
function fixture({reject=false,restoreReject=false,checkpointReject=false}={}){
  const result={status:'FAIL',screenshots:[]},saved=[];let hud=true,shots=0,keys=0;
  const evidence=createCaptureEvidence({result,checkpoint(){if(checkpointReject)throw Error('disk failed');saved.push(structuredClone(result));},getStage:()=> 'fixture'});
  const page={evaluate:async()=>state,locator:()=>({isVisible:async()=>hud}),keyboard:{press:async()=>{keys++;if(restoreReject&&keys===2)throw Error('restore failed');hud=!hud;}},screenshot:async()=>{shots++;if(reject)throw Error('controlled screenshot timeout');return Buffer.from('test-only bytes');}};
  const capture=(name='first',kind='app',validate=async(bytes)=>{assert.equal(bytes.toString(),'test-only bytes');return {bytes:bytes.length,sha256:'fixture-only',centerPixels:{quantizedColors:16,luminanceRange:32}};})=>evidence.capture({page,name,kind,required:kind==='app',file:name+'.png',outputPath:'/unused/'+name+'.png',timeout:1,validate});
  return {result,saved,evidence,page,capture,hud:()=>hud,shots:()=>shots,keys:()=>keys};
}
test('state is checkpointed before screenshot; successful bytes stay separate from observation',async()=>{
  const f=fixture();f.evidence.observe('first',state);
  const screenshot=f.page.screenshot;f.page.screenshot=async()=>{assert.equal(f.saved.at(-1)?.observations?.[0]?.perf,state.perf);return screenshot();};
  await f.capture();assert.equal(f.hud(),true);assert.equal(f.result.observations.length,1);assert.equal(f.result.screenshots.length,1);assert.equal(f.result.screenshots[0].bytes,15);assert.equal(f.evidence.complete(),true);
});
test('capture timeout restores F3, preserves FAIL, continues core and opens one app circuit',async()=>{
  const f=fixture({reject:true});f.evidence.observe('first',state);let coreContinued=false;
  await f.capture();coreContinued=true;await f.capture('next');
  assert.equal(coreContinued,true);assert.equal(f.hud(),true);assert.equal(f.shots(),1);assert.equal(f.keys(),2);
  assert.equal(f.result.captureAttempts[0].status,'FAIL');assert.match(f.result.captureAttempts[0].error.message,/controlled screenshot timeout/);
  assert.equal(f.result.captureAttempts[1].status,'NOT_ATTEMPTED_CAPTURE_UNAVAILABLE');assert.equal(f.result.screenshots.length,0);f.result.status='AUTOMATED_SMOKE_PASS_VISUAL_REVIEW_REQUIRED';assert.equal(f.evidence.complete(),false);assert.equal(f.result.status,'FAIL');
});
test('blank control cannot satisfy required app captures; control failure does not spend app attempt',async()=>{
  const f=fixture({reject:true});await f.capture('blank','control');assert.equal(f.hud(),true);assert.equal(f.keys(),0);
  f.page.screenshot=async()=>Buffer.from('test-only bytes');await f.capture('app');
  assert.equal(f.result.screenshots.length,1);assert.equal(f.result.captureControls.length,0);assert.equal(f.evidence.complete(),false);
  const g=fixture();await g.capture('blank','control');assert.equal(g.result.screenshots.length,0);assert.equal(g.result.captureControls.length,1);assert.equal(g.evidence.complete(),false);
});
test('restore failure propagates as core blocker and never produces pass',async()=>{
  const f=fixture({reject:true,restoreReject:true});await assert.rejects(f.capture(),/restore failed/);
  assert.match(f.result.captureAttempts[0].restoreError.message,/restore failed/);assert.equal(f.result.status,'FAIL');assert.equal(f.evidence.complete(),false);
});
test('nonblank/decode rejection remains image failure; later valid image cannot erase it',async()=>{
  const f=fixture();await f.capture('bad','app',async()=>{throw Error('nonblank criterion failed');});await f.capture('later');
  assert.equal(f.shots(),2);assert.equal(f.result.screenshots.length,1);assert.equal(f.evidence.complete(),false);assert.equal(f.result.status,'FAIL');assert.equal(f.result.captureAttempts[0].failurePhase,'image-validation');
});
test('checkpoint failure stops capture, and core assertions are not swallowed by recorder',async()=>{
  const f=fixture({checkpointReject:true});assert.throws(()=>f.evidence.observe('first',state),/disk failed/);assert.equal(f.shots(),0);
  const g=fixture();g.evidence.observe('first',state);await assert.rejects(async()=>{assert.fail('independent core assertion');await g.capture();},/independent core assertion/);assert.equal(g.shots(),0);
});
