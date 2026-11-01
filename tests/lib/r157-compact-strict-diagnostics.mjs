// Explicit process-only diagnostic formatting guard for giant failed arrays.
// No source/test replacement and no changed equality semantics. Do not preload
// outside a documented isolated regression replay.
import assert from 'node:assert/strict';import looseAssert from 'node:assert';import {isDeepStrictEqual} from 'node:util';import {syncBuiltinESMExports} from 'node:module';
if(process.env.R157_COMPACT_STRICT_DIAGNOSTICS!=='1')throw Error('Explicit compact strict diagnostic opt-in required');
const original=assert.deepStrictEqual;
const cases=[[{a:1},{a:1}],[{a:1},{a:2}],[NaN,NaN],[0,-0],[new Uint8Array([1,2]),new Uint8Array([1,3])],[new Map([['a',1]]),new Map([['a',1]])],[{a:undefined},{}],[new Date(1),new Date(2)],[Object.create(null),{}]];
for(const[a,b]of cases){let equal=true;try{original(a,b);}catch{equal=false;}if(equal!==isDeepStrictEqual(a,b))throw Error('Compact equality implementation differs');}
function compact(actual,expected,message){if(isDeepStrictEqual(actual,expected))return;if(message instanceof Error)throw message;const type=x=>x===null?'null':ArrayBuffer.isView(x)?`${x.constructor.name}[${x.length}]`:Array.isArray(x)?`Array[${x.length}]`:typeof x;throw new assert.AssertionError({message:message??'Expected values to be strictly deep-equal (large diagnostic diff suppressed; predicate unchanged)',actual:type(actual),expected:type(expected),operator:'deepStrictEqual',stackStartFn:compact});}
assert.deepEqual=compact;assert.deepStrictEqual=compact;looseAssert.deepStrictEqual=compact;syncBuiltinESMExports();
