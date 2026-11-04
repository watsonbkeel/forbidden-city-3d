// Synchronous observations only. This does not enable suspended/asynchronous loads.
const records = new WeakMap();
const phases = new Set(['gate','item','profile','hook','detach','merge','lod','result']);
const safely = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };
const clock = now => safely(() => { const n=now(); return Number.isFinite(n)&&n>=0?n:null; });
const elapsed = (a,b) => Number.isFinite(a)&&Number.isFinite(b)&&b>=a&&b-a<=3600000?Math.round((b-a)*100)/100:null;
function label(value) {
  return safely(() => { const phase=value?.phase,index=value?.index;return {phase:typeof phase==='string'&&phases.has(phase)?phase:'unknown',index:Number.isSafeInteger(index)&&index>=0&&index<1000000?index:null}; },{phase:'unknown',index:null});
}
// Consume in this call stack. A yielded value is a label BEFORE the operation;
// next() runs that operation and reaches the next boundary (including look-ahead).
export function consumeSynchronousBuild(builder, iterator, now=()=>performance.now()) {
  const started=clock(now),state={count:0,outcome:'error',totalMs:null,failedStep:null,slowest:[]};
  safely(()=>records.set(builder,state));
  let current;
  try {
    current=iterator.next();
    while(!current.done) {
      const value=current.value,t0=clock(now);
      try { current=iterator.next(); }
      catch(error) { safely(()=>{state.failedStep=label(value)});throw error; }
      finally {
        safely(()=>{const row={...label(value),ms:elapsed(t0,clock(now))};state.count++;state.slowest.push(row);state.slowest.sort((a,b)=>(b.ms??-1)-(a.ms??-1));if(state.slowest.length>8)state.slowest.length=8;});
      }
    }
    state.outcome='ok';
    return current.value;
  } finally { safely(()=>{state.totalMs=elapsed(started,clock(now))}); }
}
// Bounded numbers and fixed enum labels only, never scene/error/item references.
export function getBuildStepMetrics(builder) {
  return safely(()=>{const s=records.get(builder);return s?Object.freeze({count:s.count,outcome:s.outcome,totalMs:s.totalMs,failedStep:s.failedStep?Object.freeze({...s.failedStep}):null,slowest:Object.freeze(s.slowest.map(r=>Object.freeze({...r})))}):null;});
}
