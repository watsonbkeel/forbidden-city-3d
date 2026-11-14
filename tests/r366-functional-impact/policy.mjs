// Private observation policy. Never changes production, original strict acceptance, or resource supervision.
import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {assertReady} from '../r275-buddha-triad-review/contract.mjs';
import {assertNormalSequence} from '../r360-normal-user/normal-contract.mjs';
const phases=['FIRST_LOADING','SECOND_LOADING','THIRD_LOADING'];
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
const copy=x=>freeze(structuredClone(x));
const knownCancel=x=>x.errorText==='net::ERR_ABORTED'&&x.canceled===true&&x.blockedReason===undefined&&x.corsErrorStatus===undefined;
export function createPolicy({assetURLs,persistFailure}){
 assert.equal(assetURLs.length,6);const allowed=new Set(assetURLs);assert.equal(allowed.size,6);assert.equal(typeof persistFailure,'function');const origin=new URL(assetURLs[0]).origin;
 for(const value of allowed){const u=new URL(value);assert.equal(u.origin,origin);assert.equal(u.protocol,'http:');assert.equal(u.hostname,'127.0.0.1');assert.ok(u.port&&!u.username&&!u.password&&!u.search&&!u.hash);assert.match(u.pathname,/^\/forbidden-city-3d\/textures\/dafotang-original\/(amitabha|shakyamuni|bhaisajyaguru)-refined-(v2\.png|alpha-grid-v2\.json)$/);}
 let failed=false;const failures=[],admitted=new Set();
 function snapshot(){return copy({failed,events:failures});}
 function noteFailure(kind,event){failed=true;assert.ok(failures.length<4096,'bounded failure journal');failures.push(copy({kind,event}));persistFailure(snapshot());}
 function inspect(r,{phase,requireComplete=false}={}){
  assert.deepEqual(r.pageErrors,[]);assert.deepEqual(r.unexpected,[]);assert.ok(!r.responses.some(x=>x.status>=400));assert.ok(!r.console.some(x=>x.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(x.text)));assert.equal(r.artificialPendingAborts,0);
  const starts=new Map(),groups=new Map();
  for(const x of r.cdp){assert.equal(x.pageRole,'EXPERIMENT');assert.ok(allowed.has(x.url),'exact frozen asset URL');assert.equal(x.requestId,'EXPERIMENT:'+x.rawRequestId);assert.ok(typeof x.rawRequestId==='string'&&x.rawRequestId.length>0);
   if(x.event==='request'){assert.ok(phases.includes(x.phase));assert.ok(!starts.has(x.requestId),'no reused native ID');const group=groups.get(x.phase)??[];assert.ok(group.length<6&&!group.some(y=>y.start.url===x.url),'unique six per phase');const row={start:x,responses:[],terminals:[]};group.push(row);groups.set(x.phase,group);starts.set(x.requestId,row);}
   else {assert.ok(['Network.responseReceived','Network.loadingFinished','Network.loadingFailed'].includes(x.event));const row=starts.get(x.requestId);assert.ok(row,'no orphan native event');assert.equal(x.url,row.start.url);assert.equal(x.phase,row.start.phase,'no cross-phase or late contradictory terminal');
    if(x.event==='Network.responseReceived'){assert.equal(x.status,200);row.responses.push(x);assert.equal(row.responses.length,1,'one response');}
    else {row.terminals.push(x);assert.equal(row.terminals.length,1,'one distinct native terminal');if(x.event==='Network.loadingFailed')assert.ok(knownCancel(x),'only known canceled terminal can be observed');}
   }
  }
  const pw=new Map(),byURL=new Map();
  for(const x of r.requests.filter(x=>x.event==='request')){assert.equal(x.pageRole,'EXPERIMENT');assert.ok(phases.includes(x.requestPhase)&&x.phase===x.requestPhase);assert.ok(allowed.has(x.url));assert.ok(!pw.has(x.id),'unique PW id');const key=x.requestPhase+'\n'+x.url;assert.ok(!byURL.has(key),'unique PW request per phase and URL');const row={start:x,terminals:[]};pw.set(x.id,row);byURL.set(key,row);}
  for(const x of [...r.requests.filter(x=>x.event!=='request'),...r.failures]){const row=pw.get(x.id);assert.ok(row,'unknown PW terminal');assert.equal(x.pageRole,'EXPERIMENT');assert.equal(x.url,row.start.url);assert.equal(x.requestPhase,row.start.requestPhase);assert.equal(x.phase,row.start.phase,'PW cross phase');assert.ok(x.event==='finished'||x.failure?.errorText==='net::ERR_ABORTED');row.terminals.push(x);assert.equal(row.terminals.length,1,'one PW terminal');}
  let settled=true;const rows=[];
  for(const[phaseName,group]of groups){let phaseSettled=group.length===6;
   for(const row of group){const pair=byURL.get(phaseName+'\n'+row.start.url);if(!pair||row.responses.length!==1||row.terminals.length!==1||pair.terminals.length!==1){phaseSettled=false;continue;}
    const native=row.terminals[0],play=pair.terminals[0];assert.equal(native.event==='Network.loadingFailed',!!play.failure,'native/PW terminal disagreement');rows.push({phase:phaseName,url:row.start.url,requestId:row.start.requestId,rawRequestId:row.start.rawRequestId,pwId:pair.start.id,nativeTerminal:native.event,pwTerminal:play.failure?'failed':'finished',responseStatus:200});
   }
   if(admitted.has(phaseName))assert.ok(phaseSettled,'previously admitted phase unsettled');if(phaseName===phase)settled=phaseSettled;
  }
  for(const row of pw.values())if(![...starts.values()].some(n=>n.start.phase===row.start.requestPhase&&n.start.url===row.start.url)){if(requireComplete||admitted.has(row.start.requestPhase))assert.fail('PW without native ownership');settled=false;}
  if(phases.includes(phase)&&!groups.has(phase))settled=false;
  if(requireComplete){assert.ok(phases.includes(phase));assert.ok(settled&&rows.filter(x=>x.phase===phase).length===6,'six settled exact native and PW pairs required');admitted.add(phase);}
  return copy({settled,rows});
 }
 return Object.freeze({noteFailure,snapshot,inspect});
}
export function saveReadyReceipt({ready,identity,generation,phase,atMs,persist}){
 assert.ok(Number.isInteger(generation)&&generation>=0&&generation<3);assert.equal(phase,phases[generation]);assert.ok(Number.isFinite(atMs)&&atMs>=0);assertReady(ready);assert.deepEqual(ready.identity,identity);
 const receipt=structuredClone(ready),sha256=createHash('sha256').update(JSON.stringify(receipt)).digest('hex');const out=freeze({kind:'APPLICATION_CONTRACT_RECEIPT_NOT_RAW_READER_TRACE',generation,phase,atMs,sha256,receipt});persist(out);return out;
}
export function strictOutcome(result,latch){const errors=[];try{assertNormalSequence(result);}catch(e){errors.push(String(e.message));}if(latch.failed)errors.push('Irreversible native/request strict failure journal');return{status:errors.length?'FAIL':'PASS',exitCode:errors.length?1:0,errors};}

// Structural observation only. Original assertNormalSequence still judges strict acceptance.
export function assertObservedSequence(r){assert.equal(r.artificialPendingAborts,0);assert.equal(r.generations.length,3);assert.equal(new Set(r.generations.map(g=>g.group)).size,3);assert.equal(r.unloads.length,2);r.generations.forEach((g,i)=>{assert.equal(g.generation,i);assert.equal(g.ready,true);assert.equal(g.routesPassed,true);assert.equal(g.frontRendered,true);assert.deepEqual(g.slots,['amitabha','shakyamuni','bhaisajyaguru']);});r.unloads.forEach((u,i)=>{assert.equal(u.generation,i);assert.equal(u.phase,'ACTIVE');assert.equal(u.disposed,true);});}


export async function waitForSettled(fn,deadline,{now=()=>performance.now(),pause=()=>new Promise(resolve=>setTimeout(resolve,10))}={}){for(;;){assert.ok(now()<deadline,'deadline before predicate');const settled=fn();assert.ok(now()<deadline,'deadline after predicate');if(settled)return;await pause();}}
