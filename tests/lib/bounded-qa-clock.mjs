/** QA-only mock-call storage. Source geometry, controls, frames and assertions
 * are never changed. release() is called only after the route's consumers have
 * finished; unrelated outer mocks are not reset. Errors remain the caller's.
 */
export function createBoundedQaMocks(t,{onReleased=()=>{}}={}){
 const owned=[];
 const localMock={method(...args){const spy=t.mock.method(...args);owned.push(spy);return spy;}};
 const context=new Proxy(t,{get(target,key){if(key==='mock')return localMock;const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 function release(label='completed'){
  if(!owned.length)return;const before=process.memoryUsage();let calls=0;
  for(const spy of owned){calls+=spy.mock.callCount();spy.mock.restore();spy.mock.resetCalls();}
  const remaining=owned.reduce((n,spy)=>n+spy.mock.callCount(),0),functions=owned.length;owned.length=0;
  onReleased({label,functions,callsReleased:calls,callsRemaining:remaining,before,afterReset:process.memoryUsage()});
 }
 return {context,release};
}
export function withBoundedQaMocks(t,fn,options={}){
 if(typeof fn!=='function'||fn.constructor.name==='AsyncFunction')throw TypeError('Synchronous completed QA scope required');
 const scope=createBoundedQaMocks(t,options);try{const result=fn(scope.context);if(result&&typeof result.then==='function')throw TypeError('Synchronous completed QA scope required');return result;}finally{scope.release();}
}
