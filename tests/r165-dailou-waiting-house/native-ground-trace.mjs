// Read-only observation by exact once-only forwarding. Never issues a new query.
// Installed only around one synchronous new controller replay, then restored.
import assert from 'node:assert/strict';
export function captureNativeGround(prototype,cm,run){
 const specifications=[[prototype,'updateGround'],[cm,'getGroundHeight'],[cm,'supportHeight']],saved=[],rows=[];let active=null,control=null;
 for(const[owner,key]of specifications){const descriptor=Object.getOwnPropertyDescriptor(owner,key),original=owner[key];assert.equal(typeof original,'function',key+' native function');assert.ok(!descriptor||descriptor.configurable,key+' observer restoration possible');saved.push({owner,key,descriptor,original});}
 let primary,value;const restorationErrors=[];
 try{
  for(const s of saved){
   const wrapper=s.key==='updateGround'?function(...args){
    assert.equal(this.collisionManager,cm,'only the selected native CM');assert.equal(active,null,'nonreentrant native ground update');if(control===null)control=this;assert.equal(this,control,'one original controller replay');
    const row={index:rows.length,pre:{x:this.camera.position.x,z:this.camera.position.z,feet:this.feetY,ground:this.groundY,airborne:this.airborne,tracked:this._trackedGround,lastGroundY:cm.lastGroundY},walkQueries:[],supportQueries:[],forwardCalls:0};rows.push(row);active=row;
    try{row.forwardCalls++;const out=s.original.apply(this,args);row.post={x:this.camera.position.x,z:this.camera.position.z,feet:this.feetY,ground:this.groundY,airborne:this.airborne};return out;}catch(e){row.error=e.message;throw e;}finally{active=null;}
   }:function(...args){const record=active?{args:[...args]}:null;if(record)active[s.key==='getGroundHeight'?'walkQueries':'supportQueries'].push(record);try{const out=s.original.apply(this,args);if(record)record.result=out;return out;}catch(e){if(record)record.error=e.message;throw e;}};
   Object.defineProperty(s.owner,s.key,{configurable:true,writable:true,enumerable:s.descriptor?.enumerable??false,value:wrapper});
  }
  value=run();
 }catch(e){primary=e;}
 finally{
  for(const s of [...saved].reverse()){try{if(s.descriptor)Object.defineProperty(s.owner,s.key,s.descriptor);else delete s.owner[s.key];assert.equal(s.owner[s.key],s.original,'exact original native method restored');assert.deepEqual(Object.getOwnPropertyDescriptor(s.owner,s.key),s.descriptor);}catch(e){restorationErrors.push({key:s.key,message:e.message});}}
 }
 if(restorationErrors.length){const e=new AggregateError([...(primary?[primary]:[]),...restorationErrors.map(r=>Error(r.message))],'native observer restoration incomplete');e.nativeObserverRestoration=restorationErrors;throw e;}
 if(primary){primary.nativeGroundTrace=serializeTrace(rows);throw primary;}
 return{value,rows,proof:{readOnlyObservation:true,extraNativeQueries:0,methodDescriptorsRestored:true,controllers:control?1:0,updates:rows.length}};
}
export function serializeTrace(value){
 if(typeof value==='number'&&!Number.isFinite(value))return{number:Number.isNaN(value)?'NaN':value===Infinity?'Infinity':'-Infinity'};
 if(value===undefined)return{number:'undefined'};if(Array.isArray(value))return value.map(serializeTrace);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,serializeTrace(v)]));return value;
}
