import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {createDafotangPhotoSession,loadDafotangPhotos} from '../../src/scene/palace/special/DafotangPhotoPresentation.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {ZoneManager} from '../../src/scene/zones/ZoneManager.js';
import {InactiveZoneCache,zoneRetainedResourceCost} from '../../src/scene/zones/InactiveZoneCache.js';
function fixture(){
 const group=new T.Group();group.name='outer-west';group.userData.architecture=[{id:'place-outer-west-6cae88b6a2',historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit'},inventory:{status:'UNKNOWN'}}];
 const old=['worn_gold','red_lacquer','dark_curls','fitted_support'].map(name=>new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({name:'dafotang_principal_'+name})));group.add(...old);
 const bytes=new Uint8Array([1,2,3,4]),sha=createHash('sha256').update(bytes).digest('hex'),slots=['west','center','east'],subjects=['amitabha','shakyamuni','bhaisajyaguru'];
 const manifest=slots.map((slot,i)=>({slot,assetId:'TEST_ONLY_'+slot,fit:{status:'MODEL_FIT_NOT_SURVEY',figureBase:[3-i*3,1.7,5.6]}}));
 const approvedAssets=Object.fromEntries(manifest.map((m,i)=>[m.assetId,{assetId:m.assetId,subjectId:subjects[i],sourceSha256:sha,sourceUrl:'https://example.test/TEST_ONLY',rightsHolder:'TEST_ONLY',license:'TEST_ONLY_NOT_PERMISSION',permissionEvidence:'TEST_ONLY',publicRedistribution:true,subjectConfirmed:true,unmirrored:true,transparentBackground:true,pixelDimensions:[2,3],figureAndLotusBounds:[0,0,1,1],localPath:'textures/dafotang/'+m.assetId+'.png'}]));
 const options={manifest,approvedAssets,baseURL:'https://example.test/',fetchFn:async()=>({ok:true,headers:{get:()=>null},arrayBuffer:async()=>bytes.buffer}),decodeTexture:async()=>{const t=new T.DataTexture(new Uint8Array(24),2,3);t.flipY=true;return t;}};
 let disposeCalls=0;const kit={root:new T.Group(),owned:old.map(m=>m.material),ownedTextures:[],plaques:[],dispose(){disposeCalls++;for(const m of old){m.geometry.dispose();m.material.dispose();}}};
 const builder=Object.assign(Object.create(ZoneBase.prototype),{kit,group,disposed:false,gateWidths:new Map(),gateGeometries:new Map()});
 const config={},entry={builder,data:{group},config,detailQuality:'high',lastUsedAt:0};
 const manager=Object.assign(Object.create(ZoneManager.prototype),{loaded:new Map([['outer-west',entry]]),lifecycleListeners:[],onUnload:null,collisionManager:{removeByTag(){}},inactiveCache:new InactiveZoneCache(),zones:new Map([['outer-west',config]]),detailQualityFor:()=> 'high',buildQueue:[],silhouettes:new Map(),library:{owns:()=>false}});
 return{group,old,options,builder,entry,manager,disposeCalls:()=>disposeCalls,session(opts=options){return builder.dafotangPhotoSession=createDafotangPhotoSession(group,opts);},dispose(){manager.inactiveCache.clear();builder.dispose();}};
}
test('real retained-unload cancels pending photos via real ZoneBase disposal instead of stale cache admission',async()=>{
 const f=fixture();let release,signal;const gate=new Promise(r=>release=r),fetch=f.options.fetchFn;
 f.options.fetchFn=async(...args)=>{signal=args[1].signal;await gate;return fetch(...args);};const session=f.session();
 try{assert.equal(session.status,'LOADING');f.manager.unloadZone('outer-west');assert.equal(f.disposeCalls(),1);assert.equal(signal.aborted,true);assert.equal(f.manager.inactiveCache.entries.size,0);assert.equal(f.manager.inactiveCache.bytes,0);
  release();await session.ready;assert.equal(session.status,'DISPOSED');assert.equal(session.presentation,null);assert.equal(f.group.children.length,4);assert.ok(f.old.every(m=>m.visible));f.manager.unloadZone('outer-west');assert.equal(f.disposeCalls(),1);
 }finally{release();await session.ready;f.dispose();}
});
test('empty production registry remains cacheable even on same-tick unload, with zero requests',async()=>{
 const f=fixture();let calls=0;const session=f.session({fetchFn:()=>{calls++;throw Error('no requests');}});
 try{assert.equal(session.status,'BLOCKED','synchronous preflight must distinguish no work from pending assets');const cost=zoneRetainedResourceCost(f.entry,f.manager.library);f.manager.unloadZone('outer-west');assert.equal(f.disposeCalls(),0);assert.equal(f.manager.inactiveCache.entries.size,1);assert.equal(f.manager.inactiveCache.bytes,cost.accountedBytes);await session.ready;assert.equal(calls,0);assert.equal(session.status,'BLOCKED');assert.ok(f.old.every(m=>m.visible));
 }finally{f.dispose();}
});
test('completed photos use the original actual-resource cache budget, survive take and release once',async()=>{
 const f=fixture(),oldCost=zoneRetainedResourceCost(f.entry,f.manager.library),session=f.session();
 try{await session.ready;assert.equal(session.status,'READY_FOR_HOST_QA');const cost=zoneRetainedResourceCost(f.entry,f.manager.library);assert.ok(cost.accountedBytes>oldCost.accountedBytes);f.manager.unloadZone('outer-west');assert.equal(f.disposeCalls(),0);assert.equal(f.manager.inactiveCache.bytes,cost.accountedBytes);assert.equal(f.manager.inactiveCache.take('outer-west',f.entry.config,'high'),f.entry);assert.equal(f.manager.inactiveCache.bytes,0);assert.equal(session.presentation.parent,f.group);f.builder.dispose();assert.equal(session.status,'DISPOSED');assert.equal(f.disposeCalls(),1);
 }finally{f.dispose();}
});
for(const kind of ['over-budget','html-image-unknown-size'])test(kind+' completed photos are disposed by unchanged cache accounting',async()=>{
 const f=fixture();if(kind==='html-image-unknown-size')f.options.decodeTexture=async()=>new T.Texture({width:2,height:3});
 const session=f.session();try{await session.ready;assert.equal(session.status,'READY_FOR_HOST_QA');const cost=zoneRetainedResourceCost(f.entry,f.manager.library);if(kind==='over-budget')f.manager.inactiveCache.maxBytes=cost.accountedBytes-1;else{assert.equal(cost.cacheable,false);assert.equal(cost.reason,'unknown-texture-size');}
 f.manager.unloadZone('outer-west');assert.equal(f.disposeCalls(),1);assert.equal(session.status,'DISPOSED');assert.equal(f.manager.inactiveCache.entries.size,0);assert.equal(f.manager.inactiveCache.bytes,0);assert.ok(f.old.every(m=>m.visible));
 }finally{f.dispose();}
});
test('ordinary zone without any photo session retains the existing cache path',()=>{
 const f=fixture();try{f.manager.unloadZone('outer-west');assert.equal(f.disposeCalls(),0);assert.equal(f.manager.inactiveCache.entries.size,1);}finally{f.dispose();}
});
for(const [name,ok,length,code]of [['http rejection',false,null,'ASSET_HTTP_ERROR'],['oversized header',true,String(8*1024*1024+1),'ASSET_BYTE_LIMIT'],['malformed header',true,'NaN','ASSET_BYTE_LIMIT']]){
 test(name+' cancels unread response body before reporting the original error',async()=>{const f=fixture();let cancelled=0,reads=0;f.options.fetchFn=async()=>({ok,headers:{get:()=>length},body:{cancel:async()=>{cancelled++;},getReader(){reads++;throw Error('must not read');}}});try{const out=await loadDafotangPhotos(f.options);assert.equal(out.status,'BLOCKED');assert.equal(out.reasons[0].code,code);assert.equal(cancelled,1);assert.equal(reads,0);}finally{f.dispose();}});
}
test('unread body cancellation failure does not replace the original byte-limit error',async()=>{const f=fixture();let cancelled=0;f.options.fetchFn=async()=>({ok:true,headers:{get:()=>String(8*1024*1024+1)},body:{cancel:async()=>{cancelled++;throw Error('cancel rejected');}}});try{const out=await loadDafotangPhotos(f.options);assert.equal(out.reasons[0].code,'ASSET_BYTE_LIMIT');assert.equal(cancelled,1);}finally{f.dispose();}});
