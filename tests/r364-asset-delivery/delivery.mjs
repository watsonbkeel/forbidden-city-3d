// Private diagnostic server only. Product fetch/stream readers stay unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const digest=b=>createHash('sha256').update(b).digest('hex');
function boundedSnapshot(row){
 const fd=fs.openSync(row.file,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
 try{
  const stat=fs.fstatSync(fd);assert.ok(stat.isFile());assert.equal(stat.size,row.bytes,'exact source length');
  const buffer=Buffer.alloc(row.bytes),extra=Buffer.alloc(1);let offset=0;
  while(offset<buffer.length){const n=fs.readSync(fd,buffer,offset,buffer.length-offset,null);if(!n)break;offset+=n;}
  assert.equal(offset,row.bytes,'exact source length');assert.equal(fs.readSync(fd,extra,0,1,null),0,'source grew beyond frozen bytes');
  assert.equal(digest(buffer),row.sha256,'frozen source digest');return buffer;
 }finally{fs.closeSync(fd);}
}
export function createAssetDelivery({root,rows,paths,base,onEvent}){
 assert.ok(path.isAbsolute(root)&&fs.realpathSync(root)===root,'canonical source root');
 assert.ok(/^\/[A-Za-z0-9_/-]+\/$/.test(base),'fixed path base');
 assert.equal(typeof onEvent,'function');assert.ok(Array.isArray(rows));
 assert.ok(Array.isArray(paths)&&paths.length===6&&new Set(paths).size===6,'six distinct asset paths');
 const selected=paths.map(url=>{
  assert.ok(url.startsWith(base)&&/^\/[A-Za-z0-9_./-]+$/.test(url),'asset path');
  const relative=url.slice(base.length);assert.ok(relative&&!relative.split('/').some(s=>!s||s==='.'||s==='..'),'asset relative path');
  const found=rows.filter(r=>r.path===relative);assert.equal(found.length,1,'one manifest row');
  const row=found[0];assert.ok(Number.isInteger(row.bytes)&&row.bytes>0&&row.bytes<=4*1024*1024,'bounded asset bytes');assert.match(row.sha256,/^[a-f0-9]{64}$/);
  const file=path.join(root,relative);assert.equal(fs.realpathSync(file),file,'no symlink source');assert.ok(fs.lstatSync(file).isFile());assert.equal(fs.statSync(file).size,row.bytes,'exact source length');
  return{url,file,bytes:row.bytes,sha256:row.sha256};
 });
 const sourceBytes=selected.reduce((n,r)=>n+r.bytes,0);assert.ok(sourceBytes<=12*1024*1024,'bounded six-source allocation');
 // Both arms retain these same snapshots. Only B uses them for HTTP writes.
 const sources=new Map(selected.map(row=>[row.url,{...row,buffer:boundedSnapshot(row)}]));
 const streams=new Set(),responses=new Set(),pending=new Set(),errors=[];let released=false,sequence=0;
 const record=x=>{if(x.error)errors.push(x);try{onEvent(x);}catch(e){errors.push({event:'evidence-callback-error',path:x.path,error:e.message});}};
 const track=()=>{let resolve;const p=new Promise(r=>resolve=r);pending.add(p);return()=>{pending.delete(p);resolve();};};
 async function settle(){const deadline=performance.now()+1500;while(pending.size){let timer;try{await Promise.race([Promise.all([...pending]),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('bounded source/response settlement deadline')),Math.max(0,deadline-performance.now()));})]);}finally{clearTimeout(timer);}assert.ok(performance.now()<=deadline,'bounded settlement');}}
 return Object.freeze({sourceBytes,paths:Object.freeze([...paths]),get activeStreams(){return streams.size;},get activeResponses(){return responses.size;},get ownerRetainedSourceBytes(){return [...sources.values()].reduce((n,r)=>n+r.bytes,0);},get errors(){return [...errors];},
  write(mode,url,res,request){
   assert.ok(['stream','buffer'].includes(mode),'allowlisted delivery mode');assert.ok(!released&&sources.has(url),'allowlisted active path');
   assert.ok(request&&typeof request.requestPhase==='string','frozen request identity');
   assert.equal(['FIRST_LOADING','SECOND_LOADING','THIRD_LOADING'].indexOf(request.requestPhase),request.generation,'request generation identity');assert.ok(Number.isInteger(request.generation)&&request.generation>=0,'request generation');
   const context=Object.freeze({responseId:`${mode}:${++sequence}`,arm:mode,requestPhase:request.requestPhase,generation:request.generation});
   const emit=event=>record({...event,...context});
   const row=sources.get(url);boundedSnapshot(row); // Same bounded pre-read in BOTH arms; disclosed diagnostic scheduling.
   assert.ok(res&&['once','end','destroy'].every(k=>typeof res[k]==='function'),'owned response interface');
   const finishResponse=track();responses.add(res);let finishBuffer,stream;
   res.once('finish',()=>emit({event:'response-finish',path:url,mode,finished:res.writableFinished}));
   res.once('error',e=>emit({event:'response-error',path:url,mode,error:e.message}));
   res.once('close',()=>{emit({event:'response-close',path:url,mode,finished:res.writableFinished,...(!res.writableFinished?{error:'response closed before finish'}:{})});responses.delete(res);finishResponse();});
   try{if(mode==='stream'){
    stream=fs.createReadStream(row.file);const finishSource=track();streams.add(stream);
    stream.once('end',()=>emit({event:'source-end',path:url,mode}));
    stream.on('close',()=>{streams.delete(stream);emit({event:'source-close',path:url,mode,ended:stream.readableEnded});finishSource();});
    stream.on('error',e=>{emit({event:'source-error',path:url,mode,error:e.message});res.destroy();});
    // This is the original test server's actual ownership behavior.
    res.on('close',()=>stream.destroy());stream.pipe(res);
   }else{
    finishBuffer=track();res.end(row.buffer,e=>{emit({event:'buffer-callback',path:url,mode,...(e?{error:e.message}:{})});finishBuffer();});
   }}catch(e){emit({event:'delivery-error',path:url,mode,error:e.message});
    // Completing a cancelled callback claim is not a response-close receipt.
    finishBuffer?.();for(const [owner,object]of[['response',res],['source',stream]])if(object)try{object.destroy();}catch(error){emit({event:'destroy-error',owner,path:url,mode,error:error.message});}
    throw e;}
  },settle,
  async dispose(){
   released=true;const failures=[];
   try{
    for(const [owner,objects]of[['response',[...responses]],['source',[...streams]]])for(const object of objects)try{object.destroy();}catch(e){failures.push(e);record({event:'dispose-error',owner,error:e.message});}
    try{await settle();assert.equal(streams.size,0);assert.equal(responses.size,0);}catch(e){failures.push(e);}
    for(const row of sources.values())try{boundedSnapshot(row);}catch(e){failures.push(e);}
    if(failures.length)throw new AggregateError(failures,'asset delivery settlement or disposal failed');
    return{sourceBytes,ownerRetainedSourceBytes:0,activeStreams:streams.size,activeResponses:responses.size,settlementComplete:true,errors:[...errors]};
   }finally{sources.clear();}
  }
 });
}
