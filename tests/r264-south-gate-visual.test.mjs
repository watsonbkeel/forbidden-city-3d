// Small host-only controls. No browser, scene construction or production import.
import test from 'node:test';
import assert from 'node:assert/strict';
const driver=await import(process.env.R264_DRIVER_MODULE??'./r264-south-gate-visual.mjs');
const validTarget={id:'place-west-six-1dd691141c',matches:1,title:'太极门',card:'作为太极殿（原启祥宫）的南正门。须与西侧现称启祥门的另一门位区分。',travelVisible:true,travelText:'前往此处'};
const complete=()=>({runtimeStatus:'PASS',captureStatus:'PASS',visualReview:{status:'REQUIRED'},releaseAccepted:false,
  screenshots:driver.REQUIRED_IMAGES.map(name=>({name,kind:'app',file:name+'.png',width:1280,height:800,bytes:100,sha256:'a'.repeat(64)})),
  captureAttempts:driver.REQUIRED_IMAGES.map(name=>({name,kind:'app',required:true,status:'PASS'})),captureFailures:[]});

test('exact public south-gate identity admits and wrong same-name target rejects',()=>{
  assert.doesNotThrow(()=>driver.validateTargetDetail(validTarget));
  for(const bad of [{id:'place-west-six-bbdb208a58'},{matches:2},{title:'启祥门'},{card:'西墙启祥门'},{travelVisible:false},{travelText:'仅查看信息'}])
    assert.throws(()=>driver.validateTargetDetail({...validTarget,...bad}),/target/);
});
test('fixed required views reject an incomplete route even when requested captures passed',()=>{
  const r=complete();r.screenshots.pop();r.captureAttempts.pop();
  driver.finalizeEvidence(r);assert.equal(r.status,'FAIL');assert.equal(r.captureStatus,'FAIL');assert.ok(r.missingRequiredImages.includes('06-south-front-far-return'));
});
test('complete technical evidence still requires independent visual review',()=>{
  const r=complete();r.releaseAccepted=true;r.visualReview.status='PASS';driver.finalizeEvidence(r);
  assert.equal(r.status,'AUTOMATED_TARGETED_CAPTURE_PASS_VISUAL_REVIEW_REQUIRED');assert.equal(r.releaseAccepted,false);assert.equal(r.visualReview.status,'REQUIRED');
});
test('runtime, capture, lifecycle and cleanup failures cannot become a pass',()=>{
  for(const fields of [{runtimeStatus:'FAIL'},{captureStatus:'FAIL'},{unexpectedLifecycle:true},{cleanupErrors:['close failed']},{captureFailures:[{name:'bad'}]},{pageErrors:[{message:'late error'}]},{console:[{type:'warning',text:'shader error'}]},{requestFailures:[{url:'bad'}]},{responses:[{status:404}]}]){
    const r={...complete(),...fields};driver.finalizeEvidence(r);assert.equal(r.status,'FAIL',JSON.stringify(fields));
  }
  const r=complete();r.screenshots[0].width=320;driver.finalizeEvidence(r);assert.equal(r.status,'FAIL');
});
test('cleanup attempts browser and server after context close fails',async()=>{
  const seen=[];
  const errors=await driver.closeOwned({context:{close:async()=>{seen.push('context');throw Error('context failed');}},browser:{close:async()=>{seen.push('browser');}},server:{closeAllConnections:()=>seen.push('connections'),close:cb=>{seen.push('server');cb();}}});
  assert.deepEqual(seen,['context','browser','connections','server']);assert.deepEqual(errors,['context: context failed']);
});
test('native look rejects untrusted or wrong-axis input and always disposes observation',async()=>{
  for(const event of [{isTrusted:false,movementX:-60,movementY:0},{isTrusted:true,movementX:-60,movementY:1}]){
    let disposed=false,handleDisposed=false;const saved=[];
    const observer={read:()=>({events:[event],updates:[{}],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 北'}}),dispose(){disposed=true;return this.read();}};
    const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};
    const page={evaluateHandle:async()=>handle,mouse:{move:async()=>{}},waitForFunction:async()=>({dispose:async()=>{}})};
    await assert.rejects(()=>driver.runNativeLook(page,{name:'left',x:580,y:420,dx:-60,save:r=>saved.push(structuredClone(r))}),/native look/);
    assert.equal(disposed,true);assert.equal(handleDisposed,true);assert.equal(saved.at(-1).status,'FAIL');
  }
});
test('native look uses the last explicit UI pointer coordinate, not an invented canvas center',async()=>{
  let moved=false,disposed=false,handleDisposed=false;const commands=[],saved=[];
  const observer={read:()=>({events:moved?[{isTrusted:true,movementX:-60,movementY:0,target:'BODY'}]:[],updates:moved?[{}]:[],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 北'}}),dispose(){disposed=true;return this.read();}};
  const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};
  const page={evaluateHandle:async()=>handle,mouse:{move:async(...args)=>{commands.push(args);moved=true;}},waitForFunction:async()=>({dispose:async()=>{}})};
  await driver.runNativeLook(page,{name:'left',x:437,y:563,dx:-60,save:r=>saved.push(structuredClone(r))});
  assert.deepEqual(commands,[[437,563,{steps:1}]]);assert.equal(saved.at(-1).actualMovementX,-60);assert.equal(saved.at(-1).status,'PASS');assert.ok(disposed&&handleDisposed);
});
test('native look fails closed on wrong public heading, lost lock, wrong delta, or absent public update',async()=>{
  for(const change of [{heading:'朝向 东北'},{locked:false},{movementX:-20},{target:'DIV'},{noUpdate:true}]){
    let moved=false,disposed=false,handleDisposed=false;const saved=[];
    const facts={focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 北',...change};
    const observer={read:()=>({events:moved?[{isTrusted:true,movementX:-60,movementY:0,target:'BODY',...change}]:[],updates:moved&&!change.noUpdate?[{}]:[],errors:[],facts}),dispose(){disposed=true;return this.read();}};
    const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};
    const page={evaluateHandle:async()=>handle,mouse:{move:async()=>{moved=true;}},waitForFunction:async()=>{if(change.noUpdate)throw Error('native look public update deadline');return{dispose:async()=>{}};}};
    await assert.rejects(()=>driver.runNativeLook(page,{name:'left',x:437,y:563,dx:-60,save:r=>saved.push(structuredClone(r))}),/native look/);
    assert.ok(disposed&&handleDisposed);assert.equal(saved.at(-1).status,'FAIL');if(change.heading||change.locked===false)assert.equal(moved,false);
  }
});
test('native look revalidates final dispose facts, events and public update before PASS',async()=>{
  const valid={events:[{isTrusted:true,movementX:-60,movementY:0,target:'BODY'}],updates:[{}],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 北'}};
  for(const change of [{errors:['native look focus/lock lost'],facts:{...valid.facts,locked:false}},{events:[{...valid.events[0],movementX:-20}]},{events:[{...valid.events[0],isTrusted:false}]},{updates:[]}]){
    let disposed=false,handleDisposed=false,moves=0;const saved=[];
    const observer={read:()=>structuredClone(valid),dispose(){disposed=true;return structuredClone({...valid,...change});}};
    const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};
    const page={evaluateHandle:async()=>handle,mouse:{move:async()=>{moves++;}},waitForFunction:async()=>({dispose:async()=>{}})};
    await assert.rejects(()=>driver.runNativeLook(page,{name:'late-dispose',x:437,y:563,dx:-60,save:r=>saved.push(structuredClone(r))}),/native look/);
    assert.equal(saved.at(-1).status,'FAIL');assert.deepEqual(saved.at(-1).observer,{...valid,...change});assert.ok(disposed&&handleDisposed);assert.equal(moves,1);
  }
});
