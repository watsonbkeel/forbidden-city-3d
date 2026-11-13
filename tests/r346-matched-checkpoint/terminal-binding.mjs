import assert from'node:assert/strict';import{TerminalLedger}from'./terminal-ledger.mjs';
export async function bindTerminalPair(page,cdp,{pageId,specs,mode,onFailure,stamp}){
 assert.ok(['release-before-terminal','release-after-terminal'].includes(mode));
 const frame=(await cdp.send('Page.getFrameTree')).frameTree?.frame;assert.ok(frame?.id);
 const ledger=new TerminalLedger({pageId:String(pageId),frameId:frame.id,specs,mode,now:stamp}),pending=new Set();let closing=false;
 const failed=e=>{onFailure({event:'terminal-pair-failure',pageId,message:String(e.message)});ledger.close(e.message);};
 const safe=fn=>event=>{if(closing)return;try{fn(event);}catch(e){failed(e);}};
 const request=safe(e=>ledger.request(e)),finish=safe(e=>ledger.terminal('finished',e)),failure=safe(e=>ledger.terminal('failed',e));
 cdp.on('Network.requestWillBeSent',request);cdp.on('Network.loadingFinished',finish);cdp.on('Network.loadingFailed',failure);
 const lost=()=>{if(!closing)failed(Error('owned terminal page/session closed'));};page.on('close',lost);cdp.on('close',lost);
 await page.exposeBinding('__R346_TERMINAL__',async(source,message)=>{
  let operation;
  try{assert.ok(!closing&&!ledger.closed,'terminal owner closed');assert.equal(source.page,page);assert.equal(source.frame,page.mainFrame());assert.equal(message?.mode,mode);assert.ok(JSON.stringify(message).length<=1024);operation=ledger.bridge(message);pending.add(operation);return await operation;}
  catch(e){failed(e);throw e;}finally{if(operation)pending.delete(operation);}
 });
 return{
  begin(g){ledger.begin(g);},finish(g,options){ledger.finishGeneration(g,options);},snapshot(){return ledger.snapshot();},
  async bounded(promise){const remaining=ledger.deadline-stamp();let timer;const deadline=()=>{const e=Error('generation deadline');failed(e);return e;};try{if(remaining<=0){promise.catch(()=>{});throw deadline();}const result=await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(deadline()),remaining);})]);if(stamp()>=ledger.deadline)throw deadline();return result;}finally{clearTimeout(timer);}},
  async close(){if(closing)return;closing=true;ledger.close();await Promise.allSettled([...pending]);cdp.off('Network.requestWillBeSent',request);cdp.off('Network.loadingFinished',finish);cdp.off('Network.loadingFailed',failure);page.off('close',lost);cdp.off('close',lost);return ledger.snapshot();}
 };
}
