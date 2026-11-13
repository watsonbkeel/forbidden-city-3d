import assert from 'node:assert/strict';
// Init script: references/descriptors only. Never wraps/calls fetch/read/cancel,
// retains a response/reader/promise/signal, or registers request listeners.
export function installUnwrappedIdentity() {
 const g=globalThis,key='__R338_UNWRAPPED_IDENTITY__',trace='__R326_NATIVE_FETCH_TRACE__';
 if(key in g)throw Error('identity already installed');
 if(trace in g)throw Error('JS observer already present');
 const slots=[[g,'fetch'],[g,'Response'],[g,'ReadableStream'],[g,'ReadableStreamDefaultReader'],[g,'AbortController'],[g,'AbortSignal']];
 for(const [o,k]of slots)if(typeof Object.getOwnPropertyDescriptor(o,k)?.value!=='function')throw Error('required native input missing: '+k);
 slots.push([g.Response.prototype,'body'],[g.ReadableStream.prototype,'getReader'],[g.ReadableStream.prototype,'cancel'],[g.ReadableStreamDefaultReader.prototype,'read'],[g.ReadableStreamDefaultReader.prototype,'cancel'],[g.ReadableStreamDefaultReader.prototype,'releaseLock'],[g.AbortController.prototype,'abort']);
 const rows=slots.map(([owner,name])=>{const d=Object.getOwnPropertyDescriptor(owner,name);if(!d||typeof(d.value??d.get)!=='function')throw Error('required native descriptor missing: '+name);return{owner,name,descriptor:d,prototype:Object.getPrototypeOf(owner)};});
 const read=()=>({observerAbsent:!(trace in g),unchanged:rows.every(({owner,name,descriptor,prototype})=>{const now=Object.getOwnPropertyDescriptor(owner,name);return now&&Object.getPrototypeOf(owner)===prototype&&['value','get','set','writable','enumerable','configurable'].every(k=>Object.hasOwn(now,k)===Object.hasOwn(descriptor,k)&&now[k]===descriptor[k]);}),checked:rows.length,perRequestTrace:'NOT_COLLECTED'});
 Object.defineProperty(g,key,{value:Object.freeze({read}),configurable:false,writable:false});
}
export async function readUnwrappedAdmission(page,arm) {
 assert.ok(arm.mode==='native-block-patterns'&&arm.workload==='raw-control'&&arm.observer==='absent','explicit native raw absent-observer arm required');
 const r=await page.evaluate(()=>globalThis.__R338_UNWRAPPED_IDENTITY__?.read()??null);
 assert.ok(r,'identity receipt missing');assert.equal(r.observerAbsent,true,'observer unexpectedly present');assert.equal(r.unchanged,true,'native references/descriptors changed');assert.equal(r.checked,13,'incomplete identity checks');assert.equal(r.perRequestTrace,'NOT_COLLECTED','absence must not masquerade as empty trace');return r;
}

export function requireUnwrappedFinal(arm) {
 if(arm.observer!=='absent')return;
 const r=arm.unwrappedFinal;
 assert.ok(r,'final identity receipt missing (including closed-page path)');
 assert.equal(r.observerAbsent,true);assert.equal(r.unchanged,true);assert.equal(r.checked,13);assert.equal(r.perRequestTrace,'NOT_COLLECTED');assert.equal(arm.native?.perRequestTrace,'NOT_COLLECTED');
}
