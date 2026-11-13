/** Private diagnostic only. Observes original native promises/objects; never cancels,
 * retries, buffers a body, replaces a response, or changes acceptance classification. */
export function installNativeFetchTrace({urls,maxEvents=256}) {
 const g=globalThis,key='__R326_NATIVE_FETCH_TRACE__';
 if(g[key]||!Array.isArray(urls)||!urls.every(u=>typeof u==='string')||!Number.isInteger(maxEvents)||maxEvents<1||maxEvents>2048)throw Error('invalid private native trace configuration');
 const allowed=new Set(urls),events=[],bodies=new WeakMap(),readers=new WeakMap();let dropped=0,next=0;
 const base=performance.now(),native={fetch:g.fetch,get:ReadableStream.prototype.getReader,bodyCancel:ReadableStream.prototype.cancel,read:ReadableStreamDefaultReader.prototype.read,cancel:ReadableStreamDefaultReader.prototype.cancel,release:ReadableStreamDefaultReader.prototype.releaseLock};
 const record=(event,id,extra={})=>{if(events.length>=maxEvents){dropped++;return;}events.push({atMs:performance.now()-base,event,id,...extra});};
 const failure=e=>({name:String(e?.name??'UnknownError'),message:String(e?.message??e).slice(0,512)});
 const read=()=>({events:events.map(e=>({...e})),dropped});
 function fetchObserved(...args){
  let url,signal;try{url=typeof args[0]==='string'?args[0]:args[0]?.url??String(args[0]);signal=args[1]&&Object.hasOwn(args[1],'signal')?args[1].signal:args[0]?.signal;}catch{}
  if(!allowed.has(url))return Reflect.apply(native.fetch,this,args);
  const id=++next;record('fetch:start',id,{url,aborted:signal?.aborted===true});
  signal?.addEventListener('abort',()=>record('signal:abort',id),{once:true});
  let promise;try{promise=Reflect.apply(native.fetch,this,args);}catch(e){record('fetch:throw',id,failure(e));throw e;}
  promise.then(response=>{record('fetch:response',id,{status:response.status,bodyUsed:response.bodyUsed,length:response.headers.get('content-length')});if(response.body)bodies.set(response.body,{id,bytes:0,reads:0});},e=>record('fetch:reject',id,failure(e)));
  return promise;
 }
 function getReaderObserved(...args){const reader=Reflect.apply(native.get,this,args),entry=bodies.get(this);if(entry){readers.set(reader,entry);record('reader:acquire',entry.id);}return reader;}
 function readObserved(...args){const entry=readers.get(this),promise=Reflect.apply(native.read,this,args);if(entry){entry.reads++;promise.then(value=>{if(value.done)record('reader:eof',entry.id,{bytes:entry.bytes,reads:entry.reads});else entry.bytes+=value.value?.byteLength??0;},e=>record('reader:reject',entry.id,{...failure(e),bytes:entry.bytes,reads:entry.reads}));}return promise;}
 function cancelObserved(...args){const entry=readers.get(this);if(entry)record('reader:cancel',entry.id,{bytes:entry.bytes,reads:entry.reads});return Reflect.apply(native.cancel,this,args);}
 function releaseObserved(...args){const entry=readers.get(this);if(entry)record('reader:release',entry.id,{bytes:entry.bytes,reads:entry.reads});return Reflect.apply(native.release,this,args);}
 function bodyCancelObserved(...args){const entry=bodies.get(this);if(entry)record('body:cancel',entry.id);return Reflect.apply(native.bodyCancel,this,args);}
 g.fetch=fetchObserved;ReadableStream.prototype.getReader=getReaderObserved;ReadableStream.prototype.cancel=bodyCancelObserved;ReadableStreamDefaultReader.prototype.read=readObserved;ReadableStreamDefaultReader.prototype.cancel=cancelObserved;ReadableStreamDefaultReader.prototype.releaseLock=releaseObserved;
 Object.defineProperty(g,key,{configurable:true,value:Object.freeze({read})});
 return {read,restore(){g.fetch=native.fetch;ReadableStream.prototype.getReader=native.get;ReadableStream.prototype.cancel=native.bodyCancel;ReadableStreamDefaultReader.prototype.read=native.read;ReadableStreamDefaultReader.prototype.cancel=native.cancel;ReadableStreamDefaultReader.prototype.releaseLock=native.release;delete g[key];}};
}
