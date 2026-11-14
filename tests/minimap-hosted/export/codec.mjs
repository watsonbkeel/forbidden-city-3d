// Value-preserving QA transport, not a product serializer. Never invokes getters.
const SCHEMA='map-metadata/v1',MAX=100000,DEPTH=64,NODES=500000;
const fail=m=>{throw Error('metadata codec: '+m);};
const ok=(v,m)=>{if(!v)fail(m);};
function state(){let count=0;return depth=>ok(depth<=DEPTH&&++count<=NODES,'depth/node budget');}
function properties(v){const keys=Reflect.ownKeys(v);ok(keys.every(k=>typeof k==='string'),'symbol key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(v,k);ok(Object.hasOwn(d,'value'),'accessor');ok(d.enumerable||(Array.isArray(v)&&k==='length'),'nonenumerable property');}return keys;}
export function encodeMetadata(value){
 const enter=state(),seen=new Set();
 function walk(v,depth){enter(depth);if(v===undefined)return ['u'];if(v===null)return ['null'];if(typeof v==='string')return ['s',v];if(typeof v==='boolean')return ['b',v];if(typeof v==='number'){ok(Number.isFinite(v),'nonfinite');return Object.is(v,-0)?['-0']:['n',v];}
  ok(typeof v==='object','unsupported type');ok(!seen.has(v),'cycle');seen.add(v);let node;
  if(Array.isArray(v)){ok(v.length<=MAX,'array budget');const keys=properties(v).filter(k=>k!=='length');ok(keys.every(k=>String(Number(k))===k&&Number.isInteger(Number(k))&&Number(k)>=0&&Number(k)<v.length),'array extra property');node=['a',v.length,keys.map(k=>[Number(k),walk(v[k],depth+1)])];}
  else{ok(Object.getPrototypeOf(v)===Object.prototype,'nonplain object');const keys=properties(v);ok(keys.length<=MAX,'object budget');node=['o',keys.map(k=>[k,walk(v[k],depth+1)])];}
  seen.delete(v);return node;
 }
 return {schema:SCHEMA,node:walk(value,0)};
}
export function decodeMetadata(payload){
 ok(payload&&Object.getPrototypeOf(payload)===Object.prototype&&Object.keys(payload).sort().join(',')==='node,schema'&&payload.schema===SCHEMA,'schema');const enter=state();
 function walk(n,depth){enter(depth);ok(Array.isArray(n)&&typeof n[0]==='string','node');const t=n[0];
  if(['u','null','-0'].includes(t)){ok(n.length===1,'arity');return t==='u'?undefined:t==='null'?null:-0;}
  if(['s','b','n'].includes(t)){ok(n.length===2,'arity');ok(t==='s'?typeof n[1]==='string':t==='b'?typeof n[1]==='boolean':typeof n[1]==='number'&&Number.isFinite(n[1])&&!Object.is(n[1],-0),'scalar');return n[1];}
  ok(t==='a'||t==='o','tag');const array=t==='a';ok(n.length===(array?3:2),'arity');const entries=n[array?2:1];ok(Array.isArray(entries)&&entries.length<=MAX,'entries budget');if(array)ok(Number.isInteger(n[1])&&n[1]>=0&&n[1]<=MAX,'array length');const out=array?new Array(n[1]):{},seen=new Set();
  for(const entry of entries){ok(Array.isArray(entry)&&entry.length===2,'entry');const [key,v]=entry;ok(array?Number.isInteger(key)&&key>=0&&key<n[1]:typeof key==='string','key');ok(!seen.has(key),'duplicate key');seen.add(key);Object.defineProperty(out,key,{value:walk(v,depth+1),enumerable:true,writable:true,configurable:true});}return out;
 }
 return walk(payload.node,0);
}
