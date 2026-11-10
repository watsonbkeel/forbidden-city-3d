import test from 'node:test';
import assert from 'node:assert/strict';
let driver;
test('visual module imports without launching browser or server',async()=>{await assert.doesNotReject(async()=>{driver=await import('./visual.mjs');});});
const fact={active:{tag:'BODY',textEntry:false},hasFocus:true,visibility:'visible',pointerLockedToBody:true,hudVisible:true,mapOpen:false,welcomeVisible:false,settingsVisible:false,failureVisible:false};
function input(code){return {code,status:'PASS',observer:{events:[{type:'click',phase:'bubble',isTrusted:true,target:{tag:'BODY'}},{type:'keydown',phase:'capture',code,isTrusted:true,repeat:false,defaultPrevented:false},{type:'keydown',phase:'bubble',code,isTrusted:true,repeat:false,defaultPrevented:true},{type:'keyup',phase:'bubble',code,isTrusted:true}],facts:fact,integrityErrors:[],batches:[{phase:'held',location:'大佛堂'},{phase:'released',location:'大佛堂'}],heldBatches:1,releasedBatches:1,downAt:1,upAt:5,disposed:true}};}
function evidence(){const look=[[160,0],[0,-80],[-160,80],[-160,0],[0,-80]].map(([dx,dy])=>({status:'PASS',expectedMovementX:dx,expectedMovementY:dy,actualMovementX:dx,actualMovementY:dy,observer:{events:[{isTrusted:true,movementX:dx,movementY:dy,target:'BODY'}],updates:[{}],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 北'}}}));
 const posts=['KeyW','KeyW','KeyW','KeyW','KeyA','KeyA','KeyD','KeyD','KeyD','KeyD'].map(input), links=[0,0,0,4,6,6,10,10].map((post,i)=>({name:driver.REQUIRED_IMAGES[i],postCount:post,lookCount:[0,0,0,0,1,2,4,5][i],entryCount:i<2?0:1,location:i<2?'外院':'大佛堂'}));
 const sceneCaptureStates=driver.REQUIRED_IMAGES.slice(1).map((name,i)=>({name,status:'PASS',hall:i>0,observer:{events:[],errors:[],facts:{focused:true,visible:true,locked:true,mapOpen:false,location:i>0?'大佛堂':'外院'},disposed:true}}));
 return {runtimeStatus:'PASS',captureStatus:'PASS',visualReview:{status:'REQUIRED'},sceneCaptureStates,screenshots:driver.REQUIRED_IMAGES.map(name=>({name,kind:'app',file:name+'.png',width:1280,height:800,bytes:100,sha256:(name.startsWith('03-')?'b':'a').repeat(64)})),captureAttempts:driver.REQUIRED_IMAGES.map(name=>({name,kind:'app',required:true,status:'PASS'})),captureFailures:[],inputSegments:[input('KeyW')],postEntrySegments:posts,lookSegments:look,viewLinks:links};}
test('exact public target and required eight views',()=>{assert.equal(driver.REQUIRED_IMAGES.length,8);const row={id:driver.TARGET_ID,matches:1,title:'大佛堂',travelVisible:true,travelText:'前往此处'};assert.doesNotThrow(()=>driver.validateTargetDetail(row));for(const bad of [{id:'wrong'},{matches:2},{title:'别处'},{travelVisible:false},{travelText:'查看'}])assert.throws(()=>driver.validateTargetDetail({...row,...bad}));});
test('technical completion always requires visual review and exact input route',()=>{const r=evidence();driver.finalizeEvidence(r);assert.equal(r.status,'AUTOMATED_TARGETED_CAPTURE_PASS_VISUAL_REVIEW_REQUIRED');assert.equal(r.releaseAccepted,false);assert.equal(r.visualReview.status,'REQUIRED');});
test('missing, duplicate, control, yaw-only and untrusted views fail closed',()=>{
 for(const change of [r=>r.screenshots.pop(),r=>r.screenshots.push({...r.screenshots[0]}),r=>r.captureAttempts[0].kind='control',r=>r.postEntrySegments[4]=input('KeyW'),r=>r.postEntrySegments[4].observer.events[1].isTrusted=false,r=>r.postEntrySegments[4].observer.events.shift(),r=>r.postEntrySegments[4].observer.events.pop(),r=>r.postEntrySegments[4].observer.events.at(-1).defaultPrevented=true,r=>r.lookSegments[0].observer.events[0].movementY=1,r=>r.viewLinks[4].postCount=4,r=>r.viewLinks[5].location='别处',r=>r.sceneCaptureStates.at(-1).observer.facts.locked=false,r=>r.sceneCaptureStates.at(-1).observer.facts.focused=false,r=>r.sceneCaptureStates.at(-1).observer.facts.visible=false,r=>r.postEntrySegments[4].observer.batches[0].location='别处',r=>r.screenshots[2].sha256=r.screenshots[3].sha256,r=>r.cleanupErrors=['failure'],r=>r.pageErrors=[{message:'late'}]]){const r=evidence();change(r);driver.finalizeEvidence(r);assert.equal(r.status,'FAIL');}
});
test('cleanup continues through all owned objects after failure',async()=>{const calls=[];const errors=await driver.closeOwned({context:{close:async()=>{calls.push('context');throw Error('x');}},browser:{close:async()=>calls.push('browser')},server:{closeAllConnections:()=>calls.push('connections'),close:fn=>{calls.push('server');fn();}}});assert.deepEqual(calls,['context','browser','connections','server']);assert.equal(errors.length,1);});
test('look validates bounds and preserves exact XY input and disposal',async()=>{
 let moved=false,disposed=false,handleDisposed=false;const observer={read:()=>({events:moved?[{isTrusted:true,movementX:160,movementY:0,target:'BODY'}]:[],updates:moved?[{}]:[],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 北'}}),dispose(){disposed=true;return this.read();}};const handle={evaluate:async fn=>fn(observer),dispose:async()=>{handleDisposed=true;}};const page={evaluateHandle:async()=>handle,mouse:{move:async(x,y)=>{assert.deepEqual([x,y],[660,400]);moved=true;}},waitForFunction:async()=>({dispose:async()=>{}})};
 await driver.runNativeLook(page,{name:'west',pointer:{x:500,y:400},dx:160,dy:0,save:()=>{}});assert.ok(disposed&&handleDisposed);
 await assert.rejects(()=>driver.runNativeLook(page,{name:'bad',pointer:{x:1270,y:400},dx:160,dy:0,save:()=>{}}));
 let inspected=false;const unsafe={evaluateHandle:async()=>{inspected=true;throw Error('should not inspect');}};await assert.rejects(()=>driver.runNativeLook(unsafe,{name:'invalid prior',pointer:{x:-1,y:400},dx:160,dy:0,save:()=>{}}));assert.equal(inspected,false,'invalid prior pointer rejected before action');
});

test('native A/D translation checks trusted held and released observations',async()=>{
 for(const mode of ['valid','untrusted','no-keyup','late-error']){
  let phase='initial',disposed=false;const state=()=>({events:[{type:'click',phase:'bubble',isTrusted:true,target:{tag:'BODY'}},...(phase!=='initial'?[{type:'keydown',phase:'capture',code:'KeyA',isTrusted:mode!=='untrusted',repeat:false,defaultPrevented:false},{type:'keydown',phase:'bubble',code:'KeyA',isTrusted:true,repeat:false,defaultPrevented:true}]:[]),...(phase==='up'&&mode!=='no-keyup'?[{type:'keyup',phase:'bubble',code:'KeyA',isTrusted:true}]:[])],facts:fact,integrityErrors:disposed&&mode==='late-error'?['late focus loss']:[],batches:[{phase:'held',location:'大佛堂'},{phase:'released',location:'大佛堂'}],heldBatches:phase==='initial'?0:1,releasedBatches:phase==='up'?1:0,downAt:phase==='initial'?null:1,upAt:phase==='up'?10:null,disposed});
  const observer={read:state,arm(){},dispose(){disposed=true;return state();}},handle={evaluate:async fn=>fn(observer),dispose:async()=>{}},page={evaluateHandle:async()=>handle,mouse:{down:async()=>{},up:async()=>{}},keyboard:{down:async()=>{phase='down';},up:async()=>{phase='up';}},waitForFunction:async()=>({dispose:async()=>{}})};
  if(mode==='valid')await assert.doesNotReject(()=>driver.runNativeTranslate(page,{code:'KeyA',name:mode,timeoutMs:1000,save:()=>{}}));else await assert.rejects(()=>driver.runNativeTranslate(page,{code:'KeyA',name:mode,timeoutMs:1000,save:()=>{}}));assert.equal(disposed,true);
 }
 await assert.rejects(()=>driver.runNativeTranslate({}, {code:'KeyW',name:'bad',timeoutMs:100,save:()=>{}}));
});

test('stale or dirty build identities fail closed',()=>{
 const valid={sourceCommit:'a'.repeat(40),sourceDirty:false,release:'R262',buildId:'R262-9951d7c975d5',sourceFingerprint:'cab590a62d2c5ddb8eb83aff59cc0284158de3d12ca968897f9a22dcdf3f7d22',base:'/forbidden-city-3d/'};
 assert.doesNotThrow(()=>driver.validateBuildIdentity(valid,valid.sourceCommit));for(const bad of [{sourceCommit:'b'.repeat(40)},{sourceDirty:true},{buildId:'R262-old'},{sourceFingerprint:'old'},{base:'/'}])assert.throws(()=>driver.validateBuildIdentity({...valid,...bad},valid.sourceCommit));
});
test('native look rejects untrusted, wrong axis, missing HUD update and late disposal errors',async()=>{
 for(const mode of ['untrusted','wrong-axis','wrong-delta','no-update','lock-loss','overflow','late-error']){
  let moved=false,disposed=false;const normal={events:[{isTrusted:true,movementX:160,movementY:0,target:'BODY'}],updates:[{}],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 西北'}};
  const read=()=>{const x=structuredClone(normal);if(!moved){x.events=[];x.updates=[];}if(mode==='untrusted'&&moved)x.events[0].isTrusted=false;if(mode==='wrong-axis'&&moved)x.events[0].movementY=1;if(mode==='wrong-delta'&&moved)x.events[0].movementX=12;if(mode==='no-update')x.updates=[];if(mode==='lock-loss')x.facts.locked=false;if(mode==='overflow'&&moved)x.events=Array.from({length:129},()=>({...normal.events[0]}));if(mode==='late-error'&&disposed)x.errors.push('late loss');return x;};
  const observer={read,dispose(){disposed=true;return read();}},handle={evaluate:async fn=>fn(observer),dispose:async()=>{}},page={evaluateHandle:async()=>handle,mouse:{move:async()=>{moved=true;}},waitForFunction:async()=>({dispose:async()=>{}})};
  await assert.rejects(()=>driver.runNativeLook(page,{name:mode,pointer:{x:500,y:400},dx:160,dy:0,save:()=>{}}));assert.equal(disposed,true);
 }
});

test('vertical and combined native look validate both axes',async()=>{
 for(const [dx,dy] of [[0,-80],[-160,80],[-160,0]]){
  let moved=false;const observer={read:()=>({events:moved?[{isTrusted:true,movementX:dx,movementY:dy,target:'BODY'}]:[],updates:moved?[{}]:[],errors:[],facts:{focused:true,visible:true,locked:true,hudVisible:true,mapOpen:false,heading:'朝向 西'}}),dispose(){return this.read();}};
  const handle={evaluate:async f=>f(observer),dispose:async()=>{}},page={evaluateHandle:async()=>handle,mouse:{move:async()=>{moved=true;}},waitForFunction:async()=>({dispose:async()=>{}})};
  const row=await driver.runNativeLook(page,{name:'sample',pointer:{x:500,y:400},dx,dy,save:()=>{}});assert.equal(row.actualMovementX,dx);assert.equal(row.actualMovementY,dy);
 }
});
test('fixed route source retains bounded entry, one travel and exact movement samples',async()=>{
 const fs=await import('node:fs'),source=fs.readFileSync(new URL('./visual.mjs',import.meta.url),'utf8');
 assert.match(source,/i<24/);assert.match(source,/Date\.now\(\)\+120000/g);assert.equal((source.match(/await travel\(\)/g)??[]).length,1);
 assert.match(source,/i<4;i\+\+\)await move\('KeyW'/);assert.match(source,/i<2;i\+\+\)await move\('KeyA'/);assert.match(source,/i<4;i\+\+\)await move\('KeyD'/);
 assert.doesNotMatch(source,/import\(['"][^'"]*production-smoke/);assert.doesNotMatch(source,/keyboard\.down\(['"](?:Space|Shift|Alt|Meta|Control)/);
});

test('scene capture detects transient focus or lock loss during the asynchronous image',async()=>{
 for(const mode of ['valid','transient-loss','final-loss']){
  let during=false,disposed=false;const state=()=>({facts:{focused:!(mode==='final-loss'&&disposed),visible:true,locked:true,mapOpen:false,location:'大佛堂'},errors:during&&mode==='transient-loss'?['pointer lock lost']:[],events:[],disposed});
  const observer={read:state,dispose(){disposed=true;return state();}},handle={evaluate:async fn=>fn(observer),dispose:async()=>{}},page={evaluateHandle:async()=>handle};
  if(mode==='valid')await assert.doesNotReject(()=>driver.runSceneCapture(page,{name:'08-shrine-east-thickness-column-crown',hall:true,save:()=>{},action:async()=>{during=true;}}));
  else await assert.rejects(()=>driver.runSceneCapture(page,{name:'08-shrine-east-thickness-column-crown',hall:true,save:()=>{},action:async()=>{during=true;}}));
  assert.equal(disposed,true);
 }
});
