import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
test('NR1b capture executes no per-leaf temporary values/reference arrays for immutable data',async()=>{
 const original=fs.readFileSync(new URL('../../src/scene/characters/SharedRestNumericSource.js',import.meta.url),'utf8');let matches=0;
 const code=original.replace(/\b(values|references|refs)=\[\]/g,(_,name)=>{matches++;return name+'=(__alloc.arrays++,[])';}).replace('children??=[]','children??=(__alloc.arrays++,[])');assert.ok(matches>0,'explicit allocation instrumentation must bind the real helper');
 const m=await import('data:text/javascript,'+encodeURIComponent('const __alloc={arrays:0};export{__alloc};\n'+code)),mutable={y:1},root={children:Object.freeze(Array.from({length:200},(_,i)=>Object.freeze({x:i,y:i+1,z:i+2}))),wrapper:Object.freeze({mutable})},proof=m.captureNumericSource(root);
 assert.equal(m.numericSourceCurrent(root,proof),true);mutable.y=2;assert.equal(m.numericSourceCurrent(root,proof),false);assert.ok(m.__alloc.arrays<10,'immutable-leaf compilation must not allocate two unused temp arrays per leaf; actual '+m.__alloc.arrays);
});
