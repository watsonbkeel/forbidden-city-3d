// Private diagnostic only. No production imports and no native API wrappers.
const require=(v,m)=>{if(!v)throw Error(m);};
const validSignal=s=>s&&typeof s.aborted==='boolean'&&typeof s.addEventListener==='function'&&typeof s.removeEventListener==='function';
const abort=s=>{if(s.aborted)throw Object.assign(Error('Original artwork load cancelled'),{name:'AbortError'});};
export function signalRequestInit({signal,generation,linkageMode}){
 require(['linked','omit-later'].includes(linkageMode)&&Number.isInteger(generation)&&generation>=1&&generation<=3,'Exact signal linkage mode and generation required');require(validSignal(signal),'Actual caller signal required');abort(signal);
 const init={credentials:'omit',redirect:'error',mode:'same-origin'};
 if(generation===1||linkageMode==='linked')return{signal,...init};
 return init; // Property is absent, not a substitute signal or signal:undefined.
}
export function createActiveWindow(signal,generation){
 require(validSignal(signal)&&Number.isInteger(generation)&&generation>=1&&generation<=3,'Exact activity signal and generation required');abort(signal);
 const state={generation,active:true,qualified:false,abortDuringActive:false,intentionalFirstAbort:false,cleanupStarted:false,cleanupAbort:false,closed:false,checks:0,lastStage:'created'};
 const onAbort=()=>{if(generation===1&&state.cleanupStarted)state.intentionalFirstAbort=true;else if(state.qualified&&state.cleanupStarted)state.cleanupAbort=true;else state.abortDuringActive=true;};
 signal.addEventListener('abort',onAbort,{once:true});
 const check=stage=>{require(!state.closed,'Activity window closed');require(typeof stage==='string'&&stage.length>0&&stage.length<64,'Bounded qualification stage required');state.lastStage=stage;state.checks++;require(!state.abortDuringActive&&!signal.aborted,'Active window application abort invalidates diagnostic');};
 return Object.freeze({check,read(){return{...state,signalAborted:signal.aborted};},qualify(index,slots){require(!state.closed&&!state.cleanupStarted&&!state.qualified&&generation>=2&&index===generation,'Exact current once-only qualification required');require(Array.isArray(slots)&&slots.length===3&&slots.every(s=>s.status==='READY'),'Three actual READY slots required');check('host-terminal-health-qualified');state.active=false;state.qualified=true;return this.read();},beginCleanup(normal){require(!state.closed&&!state.cleanupStarted,'One cleanup attempt required');require(normal===true||normal===false,'Explicit normal/emergency cleanup required');require(!normal||generation===1||state.qualified,'Normal cleanup requires qualification');state.cleanupStarted=true;},close(){if(state.closed)return;signal.removeEventListener('abort',onAbort);state.closed=true;state.active=false;}});
}
