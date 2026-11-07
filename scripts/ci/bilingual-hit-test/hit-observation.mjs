import assert from 'node:assert/strict';
import {writeResultJSON} from './common.mjs';
export const HIT_SELECTORS=Object.freeze(['#map-language','#place-travel','#place-back']);
export const HIT_FAILURE_PNGS=Object.freeze([1280,390].map(w=>`${w}-hit-test-failure-endpoint.png`));
export const publishHitResult=writeResultJSON;
// Executed once in the existing evaluate slot. No new page action or wait.
export function captureHitObservation(){
 const refs=[];
 const hitTests=['#map-language','#place-travel','#place-back'].map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);refs.push({e,hit,x,y});return{selector,rect:{x:r.x,y:r.y,width:r.width,height:r.height},hit:!!hit&&(hit===e||e.contains(hit))};});
 let stage='actual';
 try{
  const actual={locale:document.documentElement?.lang??null,selected:window.fixture?.map?.selectedPlaceId??null,activeId:document.activeElement?.id??null,devicePixelRatio,viewport:{width:innerWidth,height:innerHeight,scrollX,scrollY}};
  stage='controls';
  const node=n=>n?{tag:n.tagName??null,id:n.id??null}:null;
  const controls=refs.map(({e,hit,x,y},i)=>{let p=hit,identifiedAncestor=null,ancestorNodesRead=0;while(p&&ancestorNodesRead<8){ancestorNodesRead++;if(typeof p.id==='string'&&p.id.length){identifiedAncestor=node(p);break;}p=p.parentElement;}return{selector:hitTests[i].selector,centre:{x,y},controlNode:node(e),hitNode:node(hit),identifiedAncestor,ancestorNodesRead};});
  stage='containers';
  const containers=['#place-info','#minimap'].map(selector=>{const e=document.querySelector(selector);if(!e)throw Error('Missing fixed container');const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{selector,rect:{x:r.x,y:r.y,width:r.width,height:r.height},clientLeft:e.clientLeft,clientTop:e.clientTop,clientWidth:e.clientWidth,clientHeight:e.clientHeight,scrollLeft:e.scrollLeft,scrollTop:e.scrollTop,scrollWidth:e.scrollWidth,scrollHeight:e.scrollHeight,clientClip:{x:r.x+e.clientLeft,y:r.y+e.clientTop,width:e.clientWidth,height:e.clientHeight},computed:{overflowX:s.overflowX,overflowY:s.overflowY,display:s.display,visibility:s.visibility,pointerEvents:s.pointerEvents,position:s.position,zIndex:s.zIndex}};});
  return{hitTests,details:{actual,controls,containers},collectionError:null};
 }catch(error){return{hitTests,details:null,collectionError:{stage,message:String(error?.message??error).toWellFormed().slice(0,1024)}};}
}
const keys=(o,n)=>{assert.ok(o&&typeof o==='object'&&!Array.isArray(o));assert.deepEqual(Object.keys(o).sort(),[...n].sort());};
const finite=v=>assert.ok(typeof v==='number'&&Number.isFinite(v),'Nonfinite observation');
const str=(v,max=128,nullable=false)=>{if(nullable&&v===null)return;assert.ok(typeof v==='string'&&v.length<=max&&v.isWellFormed(),'Invalid bounded string');};
function rect(r){keys(r,['x','y','width','height']);Object.values(r).forEach(finite);assert.ok(r.width>=0&&r.height>=0);}
function node(n,nullable=false){if(nullable&&n===null)return;keys(n,['tag','id']);str(n.tag,128,true);str(n.id,128,true);}
const slots=[[1280,900],[390,844]];
export function validateHitObservations(rows){
 assert.ok(Array.isArray(rows)&&rows.length<=2,'Too many hit observations');
 for(const [i,row]of rows.entries()){
  keys(row,['ordinal','width','height','measurement']);assert.equal(row.ordinal,i+1);assert.equal(row.width,slots[i][0]);assert.equal(row.height,slots[i][1]);
  const m=row.measurement;keys(m,['hitTests','details','collectionError']);assert.ok(Array.isArray(m.hitTests)&&m.hitTests.length===3);
  for(const [j,h]of m.hitTests.entries()){keys(h,['selector','rect','hit']);assert.equal(h.selector,HIT_SELECTORS[j]);rect(h.rect);assert.equal(typeof h.hit,'boolean');}
  if(m.details===null){keys(m.collectionError,['stage','message']);assert.ok(['actual','controls','containers'].includes(m.collectionError.stage));str(m.collectionError.message,1024);}
  else{
   assert.equal(m.collectionError,null);keys(m.details,['actual','controls','containers']);const a=m.details.actual;
   keys(a,['locale','selected','activeId','devicePixelRatio','viewport']);for(const k of ['locale','selected','activeId'])str(a[k],128,true);finite(a.devicePixelRatio);keys(a.viewport,['width','height','scrollX','scrollY']);Object.values(a.viewport).forEach(finite);
   assert.ok(Array.isArray(m.details.controls)&&m.details.controls.length===3);
   for(const [j,c]of m.details.controls.entries()){keys(c,['selector','centre','controlNode','hitNode','identifiedAncestor','ancestorNodesRead']);assert.equal(c.selector,HIT_SELECTORS[j]);keys(c.centre,['x','y']);Object.values(c.centre).forEach(finite);const r=m.hitTests[j].rect;assert.equal(c.centre.x,r.x+r.width/2);assert.equal(c.centre.y,r.y+r.height/2);node(c.controlNode);node(c.hitNode,true);node(c.identifiedAncestor,true);assert.ok(Number.isInteger(c.ancestorNodesRead)&&c.ancestorNodesRead>=0&&c.ancestorNodesRead<=8);if(c.hitNode===null)assert.equal(c.ancestorNodesRead,0);if(c.identifiedAncestor!==null)assert.ok(typeof c.identifiedAncestor.id==='string'&&c.identifiedAncestor.id.length>0);}
   assert.ok(Array.isArray(m.details.containers)&&m.details.containers.length===2);
   for(const [j,c]of m.details.containers.entries()){keys(c,['selector','rect','clientLeft','clientTop','clientWidth','clientHeight','scrollLeft','scrollTop','scrollWidth','scrollHeight','clientClip','computed']);assert.equal(c.selector,['#place-info','#minimap'][j]);rect(c.rect);rect(c.clientClip);for(const k of ['clientLeft','clientTop','clientWidth','clientHeight','scrollLeft','scrollTop','scrollWidth','scrollHeight'])finite(c[k]);for(const k of ['clientLeft','clientTop','clientWidth','clientHeight','scrollWidth','scrollHeight'])assert.ok(c[k]>=0);assert.deepEqual(c.clientClip,{x:c.rect.x+c.clientLeft,y:c.rect.y+c.clientTop,width:c.clientWidth,height:c.clientHeight});keys(c.computed,['overflowX','overflowY','display','visibility','pointerEvents','position','zIndex']);Object.values(c.computed).forEach(v=>str(v,256));}
  }
  assert.ok(Buffer.byteLength(JSON.stringify(row,null,2)+'\n','utf8')<=16384,'Hit observation exceeds 16KiB');
 }
 assert.ok(Buffer.byteLength(JSON.stringify({hitTestObservations:rows},null,2)+'\n','utf8')<=65536,'Hit prefix exceeds 64KiB');return rows;
}
export function expectedHitIdentity(row){const a=row?.measurement?.details?.actual;return !!a&&a.locale==='en'&&a.selected==='taihe'&&a.devicePixelRatio===1&&a.viewport.width===row.width&&a.viewport.height===row.height;}
const message=e=>String(e?.message??e).toWellFormed().slice(0,1024);
export async function persistAndAssertHit({measurement,result,resultPath,width,height,assertHit,screenshot,write=writeResultJSON}){
 const previous=result.hitTestObservations,ordinal=previous.length+1;
 assert.ok(Array.isArray(result.hitTestOutcomes)&&result.hitTestOutcomes.length===previous.length&&result.hitTestOutcomes.every(x=>x.verdict==='passed'),'Previous hit assertion did not pass');
 const row={ordinal,width,height,measurement},rows=[...previous,row];
 const publish=changes=>{write(resultPath,{...result,...changes});Object.assign(result,changes);};
 try{validateHitObservations(rows);publish({hitTestObservations:rows});}
 catch(error){result.hitTestFailure={kind:'persistence-failure',ordinal,assertionExecuted:false,error:message(error)};throw error;}
 let originalError;
 try{assertHit();}catch(error){originalError=error;}
 const failed=!!originalError,knownHitFailure=failed&&originalError.message==='Visible control is obscured'&&measurement.hitTests.some(x=>!x.hit);
 const outcome={ordinal,verdict:failed?'failed':'passed',assertionExecuted:true,primaryError:failed?message(originalError):null,secondaryErrors:[],screenshot:null};
 const outcomes=[...result.hitTestOutcomes,outcome];
 try{publish({hitTestOutcomes:outcomes});}
 catch(error){result.hitTestFailure={kind:'decision-persistence-failure',ordinal,assertionExecuted:true,error:message(error)};throw originalError??error;}
 if(knownHitFailure){
  const file=`${width}-hit-test-failure-endpoint.png`;assert.ok(HIT_FAILURE_PNGS.includes(file));const endpointOutcome=structuredClone(outcome);
  try{await screenshot(file);endpointOutcome.screenshot={file,status:'captured',error:null};}
  catch(error){endpointOutcome.screenshot={file,status:'failed',error:message(error)};endpointOutcome.secondaryErrors.push({stage:'screenshot',message:message(error)});}
  // Outcome objects are detached before publishing so a failed write never advances the durable prefix.
  const updated=[...result.hitTestOutcomes.slice(0,-1),endpointOutcome];
  try{publish({hitTestOutcomes:updated});}
  catch(error){result.hitTestFailure={kind:'endpoint-persistence-failure',ordinal,assertionExecuted:true,error:message(error)};}
 }
 if(originalError)throw originalError;
}
