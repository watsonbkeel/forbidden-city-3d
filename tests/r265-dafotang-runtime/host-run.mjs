// Fixed CPU-only image facade and one guarded host orchestrator.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const PNG_PATH='public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';
const PUBLIC_PATH='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';
const PNG_HASH='8b814c7439788f2eb0f4bedbe08f7e674de18120d0bb4f1d38e1175943f8e70e';
export function createPlaqueFacade({createCanvas,decode,readAsset=()=>fs.readFileSync(PNG_PATH),timeoutMs=15000}){
 if(!(timeoutMs>0&&timeoutMs<=15000))throw Error('invalid plaque deadline');let deadline=null;
 let imageCount=0, task=null, terminal=false, closed=false, fault=null;
 const fail=e=>{fault??=e instanceof Error?e:new Error(String(e));return fault;};
 const document={createElement(name){if(name!=='canvas')throw fail(Error('unsupported DOM element'));return createCanvas(1,1);},
  createElementNS(ns,name){
   if(ns!=='http://www.w3.org/1999/xhtml'||name!=='img'||imageCount++)throw fail(Error('only one fixed plaque image'));
   const listeners=new Map();let sourceSet=false;
   const img={complete:false,width:0,height:0,naturalWidth:0,naturalHeight:0,
    addEventListener(type,fn){if(!['load','error'].includes(type)||listeners.has(type)||typeof fn!=='function')throw fail(Error('invalid image listener'));listeners.set(type,fn);},
    removeEventListener(type,fn){if(listeners.get(type)===fn)listeners.delete(type);},
    dispatchEvent(event){if(terminal||closed)throw fail(Error('late or duplicate image event'));if(event?.type!=='load'||!listeners.has('load'))throw fail(Error('missing image load listener'));terminal=true;listeners.get('load').call(img,event);},
    set src(url){
     if(sourceSet||closed||url!==PUBLIC_PATH)throw fail(Error('unknown or repeated image URL'));sourceSet=true;
     task=Promise.resolve().then(async()=>{
      deadline??=Date.now()+timeoutMs;const buffer=readAsset();if(createHash('sha256').update(buffer).digest('hex')!==PNG_HASH)throw Error('fixed plaque PNG hash mismatch');
      const decoded=await decode(buffer);if(!decoded||decoded.width!==768||decoded.height!==286)throw Error('fixed plaque PNG dimensions');
      if(closed)throw Error('late decoded image after close');img.width=img.naturalWidth=768;img.height=img.naturalHeight=286;img.complete=true;img.dispatchEvent({type:'load',target:img});
     }).catch(e=>{throw fail(e);});task.catch(()=>{});
    }
   };return img;
  }};
 async function settle(){
  if(!task)throw fail(Error('missing plaque load task'));
  deadline??=Date.now()+timeoutMs;let timer;try{await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('plaque decode deadline')),Math.max(0,deadline-Date.now()));})]);}
  catch(e){throw fail(e);}finally{clearTimeout(timer);}
  if(fault)throw fault;if(!terminal)throw fail(Error('plaque load did not finish'));
 }
 async function close(){closed=true;if(task&&!fault&&!terminal)try{await settle();}catch(e){fail(e);}if(!terminal&&!fault)fail(Error('unfinished plaque load'));if(fault)throw fault;}
 return {document,settle,close};
}

export async function runSerial({spawn,readReceipt,script}){
 for(const mode of ['baseline','candidate']){
  const child=spawn(process.execPath,[script,'--'+mode],{shell:false,detached:false,stdio:['ignore','inherit','inherit'],env:process.env});
  const outcome=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>resolve({code,signal}));});
  if(outcome.code!==0||outcome.signal)throw Error(`${mode} child failed: ${JSON.stringify(outcome)}`);
  const receipt=await readReceipt(mode);if(!receipt||receipt.phase!==mode||receipt.status!=='PASS'||receipt.cleanupComplete!==true)throw Error(`${mode} missing complete receipt`);
 }
}

function geometryDigest(g){
 const h=createHash('sha256');for(const name of Object.keys(g.attributes).sort()){
  const a=g.attributes[name];h.update(JSON.stringify([name,a.array.constructor.name,a.itemSize,a.normalized,a.count]));h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
 }
 if(g.index){const a=g.index;h.update(JSON.stringify(['index',a.array.constructor.name,a.count]));h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}
 h.update(JSON.stringify({groups:g.groups,drawRange:{start:g.drawRange.start,count:String(g.drawRange.count)}}));return h.digest('hex');
}
function contactDigest(c){
 const h=createHash('sha256');const plain={};for(const k of Object.keys(c).sort())if(k!=='triangleSupport')plain[k]=c[k];h.update(JSON.stringify(plain));
 const s=c.triangleSupport;if(s){h.update(JSON.stringify({id:s.id,offset:s.offset?.toArray?.(),box:s.box, bounds:s.template?.bounds,count:s.template?.triangles?.length}));
  for(const row of s.template?.triangles??[])h.update(JSON.stringify([row.triangle.a.toArray(),row.triangle.b.toArray(),row.triangle.c.toArray(),row.normal.toArray(),row.box]));
 }
 return h.digest('hex');
}
export function captureHostReferences(kit){
 const names=[['colliders','collider'],['walkables','walkable'],['owned','owned material'],['ownedTextures','owned texture']];
 const records=names.map(([key,label])=>{const array=kit[key];assert.ok(Array.isArray(array),label+' array required');return {key,label,array,entries:[...array]};});
 const collider=records[0],supports=collider.entries.map(c=>c.triangleSupport),hashes=collider.entries.map(contactDigest);let atlas=null;
 return {check({afterFinish=false}={}){
  for(const r of records){assert.ok(kit[r.key]===r.array,r.label+' array identity changed');const extra=afterFinish&&(r.key==='owned'||r.key==='ownedTextures')?1:0;assert.equal(r.array.length,r.entries.length+extra,r.label+' length changed');
   for(let i=0;i<r.entries.length;i++)assert.ok(r.array[i]===r.entries[i],r.label+' identity changed at '+i);
  }
  for(let i=0;i<collider.entries.length;i++){const c=collider.array[i];assert.ok(c.triangleSupport===supports[i],'support identity changed at '+i);assert.equal(contactDigest(c),hashes[i],'contact content changed at '+i);}
  if(afterFinish){const material=kit.owned.at(-1),texture=kit.ownedTextures.at(-1);assert.equal(material?.name,'kit_plaques','only expected atlas material appended');assert.ok(material.map===texture,'expected atlas texture identity');if(atlas){assert.ok(material===atlas.material,'atlas material identity changed');assert.ok(texture===atlas.texture,'atlas texture identity changed');}else atlas={material,texture};}
 }};
}
function objectState(o){return JSON.stringify({visible:o.visible,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),matrix:o.matrix.toArray(),matrixWorld:o.matrixWorld.toArray(),matrixAutoUpdate:o.matrixAutoUpdate,matrixWorldAutoUpdate:o.matrixWorldAutoUpdate,layers:o.layers.mask});}
function materialState(m){return JSON.stringify({visible:m.visible,value:m.toJSON()});}
export function capturePermanentWitness(group,kit,references){
 const exact=name=>{const matches=group.children.filter(m=>m.isMesh&&m.material?.name===name);assert.equal(matches.length,1,'unique permanent bucket '+name);return matches[0];};
 const beam=exact('dafotang_layout_plain_gold_fit'),dais=exact('dafotang_principal_fitted_support');
 const permanent=[beam,dais].map(m=>({mesh:m,parent:m.parent,material:m.material,materialState:materialState(m.material),geometry:m.geometry,digest:geometryDigest(m.geometry),state:objectState(m)}));
 const ancestors=[];for(let node=group;node;node=node.parent)ancestors.push({node,parent:node.parent,state:objectState(node)});
 assert.ok(permanent.every(x=>x.mesh.visible&&x.material.visible)&&ancestors.every(x=>x.node.visible),'effective permanent visibility required');const ref=references??captureHostReferences(kit);
 return {check(){
  for(let i=0;i<ancestors.length;i++){const x=ancestors[i];assert.ok(x.node.parent===x.parent,'ancestor parent identity '+i);assert.equal(objectState(x.node),x.state,'ancestor transform/visibility '+i);}
  for(const x of permanent){assert.ok(group.children.includes(x.mesh));assert.ok(x.mesh.parent===x.parent,'permanent parent identity');assert.ok(x.mesh.material===x.material,'permanent material identity');assert.ok(x.mesh.geometry===x.geometry,'permanent geometry identity');assert.equal(objectState(x.mesh),x.state,'permanent transform/visibility');assert.equal(materialState(x.material),x.materialState,'permanent material state');assert.equal(geometryDigest(x.geometry),x.digest,'permanent complete geometry');}
  ref.check({afterFinish:!!references});
 },beam,dais};
}

export function assertHostEnvironment(env,args){
 if(env.CI!=='true'||env.GITHUB_ACTIONS!=='true'||env.NODE_OPTIONS!=='--max-old-space-size=2048 --max-semi-space-size=16')throw Error('exact guarded CI heap flags required');
 if(env.NODE_PATH||env.NODE_V8_COVERAGE||env.TEST_GC||Object.keys(env).some(k=>/^(R265_|R264_|R262_)/.test(k)&&env[k])||args.length)throw Error('host loader or source override forbidden');
}

async function deadline(promise,ms=15000){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('photo session deadline')),ms);})]);}finally{clearTimeout(timer);}}
export async function exercisePhotoSessions({group,kit,T,createDafotangPhotoSession,references}){
 const witness=capturePermanentWitness(group,kit,references),names=['dafotang_principal_worn_gold','dafotang_principal_red_lacquer','dafotang_principal_dark_curls'];
 const figures=names.map(name=>{const rows=group.children.filter(m=>m.isMesh&&m.material?.name===name);assert.equal(rows.length,1);return rows[0];});
 assert.ok(figures.every(m=>m.visible),'three figure buckets initially visible');const baseChildren=[...group.children],rows=[];
 const bytes=new Uint8Array([1,2,3,4]),sha=createHash('sha256').update(bytes).digest('hex'),subjects=['amitabha','shakyamuni','bhaisajyaguru'];
 for(const mode of ['missing','success','partial-http','late-decode','cancel-pending','publish-failure']){
  const temporary=new Map();let fetchCount=0,decodeCount=0,releaseLate,resolveStarted;const started=new Promise(resolve=>resolveStarted=resolve);let session;
  const track=r=>{if(!temporary.has(r)){temporary.set(r,0);r.addEventListener('dispose',()=>temporary.set(r,temporary.get(r)+1));}return r;};
  const manifest=['west','center','east'].map((slot,i)=>({slot,assetId:'TEST_ONLY_'+slot,fit:{status:'MODEL_FIT_NOT_SURVEY',figureBase:[1.62-i*1.62,1.7,5.6]}}));const approvedAssets={};
  for(let i=0;i<3;i++){const id=manifest[i].assetId;approvedAssets[id]={assetId:id,subjectId:subjects[i],sourceSha256:sha,sourceUrl:'https://example.test/TEST_ONLY',rightsHolder:'TEST_ONLY',license:'TEST_ONLY_NOT_PERMISSION',permissionEvidence:'TEST_ONLY',publicRedistribution:true,subjectConfirmed:true,unmirrored:true,transparentBackground:true,pixelDimensions:[2,3],figureAndLotusBounds:[0,0,1,1],localPath:'textures/dafotang/'+id+'.png'};}
  const makeTexture=()=>{const texture=track(new T.DataTexture(new Uint8Array(24),2,3));texture.flipY=true;return texture;};
  const options={manifest,approvedAssets,baseURL:'https://example.test/',fetchFn:async()=>{fetchCount++;return{ok:!(mode==='partial-http'&&fetchCount===2),headers:{get:()=>null},arrayBuffer:async()=>bytes.buffer.slice(0)};},
   decodeTexture:async()=>{decodeCount++;if(mode==='late-decode'&&decodeCount===2)throw Error('TEST_ONLY_DECODE_FAILURE');if(mode==='cancel-pending'){resolveStarted();return new Promise(resolve=>{releaseLate=()=>resolve(makeTexture());});}return makeTexture();}};
  if(mode==='missing'){delete options.manifest;delete options.approvedAssets;}
  const originalAdd=group.add;group.add=function(child){
   if(child?.name==='dafotang-historical-three-photo-prototype')child.traverse(o=>{if(o.isMesh){track(o.geometry);track(o.material);if(o.material.map)track(o.material.map);}});
   const result=originalAdd.call(this,child);if(mode==='publish-failure'&&child?.name==='dafotang-historical-three-photo-prototype')throw Error('TEST_ONLY_PUBLISH_FAILURE');return result;
  };
  try{
   witness.check();assert.ok(figures.every(m=>m.visible));session=createDafotangPhotoSession(group,options);
   if(mode==='cancel-pending'){await deadline(started);assert.equal(typeof releaseLate,'function');session.dispose();witness.check();releaseLate();}
   await deadline(session.ready);witness.check();
   if(mode==='success'){assert.equal(session.status,'READY_FOR_HOST_QA');assert.ok(figures.every(m=>!m.visible));assert.ok(session.presentation);}
   else {assert.equal(session.status,mode==='cancel-pending'?'DISPOSED':'BLOCKED');assert.ok(figures.every(m=>m.visible));}
   if(mode==='missing'){assert.equal(fetchCount,0);assert.equal(decodeCount,0);}
   if(mode==='late-decode')assert.equal(decodeCount,2);
   session.dispose();session.dispose();witness.check();assert.ok(figures.every(m=>m.visible));assert.deepEqual(group.children,baseChildren,'temporary owners removed');
   for(const n of temporary.values())assert.equal(n,1,'temporary resource disposed exactly once');
   rows.push({case:mode,status:'PASS',fetchCount,decodeCount,temporaryResources:temporary.size});
  }finally{group.add=originalAdd;session?.dispose();}
 }
 return rows;
}


function bucketRows(group){return group.children.filter(x=>x.isMesh).map(m=>({name:m.name,material:m.material?.name??null,noMerge:!!m.userData.noMerge,visible:m.visible,geometry:geometryDigest(m.geometry),matrix:m.matrix.toArray(),position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray()}));}
function compareMerged(current,baseline){
 assert.equal(current.length,baseline.length);let changed=0;
 for(let i=0;i<current.length;i++){
  const a=current[i],b=baseline[i];if(a.material==='dafotang_layout_plain_gold_fit'){
   changed++;const {geometry:ag,...ap}=a,{geometry:bg,...bp}=b;assert.deepEqual(ap,bp);assert.notEqual(ag,bg);
  }else assert.deepEqual(a,b,'unchanged complete merged bucket '+i);
 }
 assert.equal(changed,1,'one changed material bucket');
}
function observeDisposals(resources){const counts=new Map();for(const r of resources){assert.ok(!counts.has(r),'resource appears once in ownership');counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));}return counts;}
function assertDisposedOnce(counts,label){for(const [resource,n] of counts)assert.equal(n,1,label+' '+(resource.name??resource.type??'resource'));}
export function writeReceipt(file,value){
 const json=JSON.stringify(value,(_key,item)=>Object.is(item,-0)?JSON.rawJSON('-0'):item)+'\n',bytes=Buffer.byteLength(json);if(bytes>8*1024*1024)throw Error(`host receipt exceeds 8 MiB: ${bytes} bytes`);
 const tmp=file+'.tmp';fs.writeFileSync(tmp,json,{flag:'wx'});fs.linkSync(tmp,file);fs.unlinkSync(tmp);
}
function boundedText(value){
 const bytes=Buffer.from(String(value??''),'utf8'),limit=128;
 return {value:bytes.subarray(0,limit).toString('utf8'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),truncated:bytes.length>limit};
}
function errorEvidence(error){return {name:boundedText(error?.name??'Error'),message:boundedText(error?.message??error),stack:boundedText(error?.stack??'')};}
function cleanupEvidence(errors){
 let causeBudget=1;
 const shown=errors.slice(0,2).map(({source,error})=>{
  const detail=errorEvidence(error);
  if(error instanceof AggregateError&&Array.isArray(error.errors)){
   const causes=error.errors,include=Math.min(causeBudget,causes.length);causeBudget-=include;
   detail.causes={count:causes.length,shown:causes.slice(0,include).map(cause=>{
    const item=errorEvidence(cause);
    if(cause instanceof AggregateError&&Array.isArray(cause.errors))item.nestedCauses={count:cause.errors.length,omitted:cause.errors.length};
    return item;
   }),omitted:causes.length-include};
  }
  return {source,error:detail};
 });
 return {count:errors.length,shown,omitted:Math.max(0,errors.length-shown.length)};
}
export function recordCleanupError(errors,source,error){errors.push({source,error:error instanceof Error?error:Error(String(error))});}
export function finalizeReceipt({file,row,problem,cleanupErrors,stage,log=message=>console.error(message)}){
 const cleanup=cleanupEvidence(cleanupErrors),primary=problem??(cleanupErrors.length?cleanupErrors[0].error:null);
 row.lastPhase='receipt';row.lastWorkPhase=stage;row.cleanupErrors=cleanup.shown;row.cleanupSummary=cleanup;row.cleanupComplete=cleanupErrors.length===0;row.completed=new Date().toISOString();row.status=primary?'FAIL':'PASS';
 if(primary)row.failure=errorEvidence(primary);
 try{writeReceipt(file,row);return primary;}catch(writeError){
  const actual=primary??writeError;
  log('receipt failure: '+JSON.stringify(errorEvidence(writeError)));
  try{
   const fallback={phase:row.phase,status:'FAIL',lastPhase:'receipt',lastWorkPhase:stage,cleanup,cleanupComplete:row.cleanupComplete,primary:errorEvidence(actual),receipt:errorEvidence(writeError)};
   if(Buffer.byteLength(JSON.stringify(fallback)+'\n')>16384)throw Error('failure fallback exceeds 16 KiB');
   writeReceipt(file+'.failure.json',fallback);
  }catch(e){log('failure-only fallback failed: '+JSON.stringify(errorEvidence(e)));}
  return actual;
 }
}
export function cleanupKit({kit,finishStarted,merged,sourceCounts}){
 if(merged){kit.dispose(merged);return;}
 if(!finishStarted){kit.dispose(kit.root);return;}
 const geometries=new Set();kit.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});const failures=[];
 for(const g of geometries)if(!sourceCounts?.get(g))try{g.dispose();}catch(e){failures.push(e);}
 try{kit.dispose(undefined);}catch(e){failures.push(e);}
 if(failures.length)throw new AggregateError(failures,'failed-merge cleanup');
}
export function createHostPhaseTracker(mode,log=message=>console.log(message)){
 if(!['baseline','candidate'].includes(mode))throw Error('invalid host mode');let current=null;
 const allowed=['imports','host-setup','snapshot','same-stage-comparison','merge','photo-lifecycle','try-complete','cleanup','receipt'];
 return {enter(value){if(!allowed.includes(value))throw Error('invalid host phase');current=value;log('HOST_PHASE '+mode+' '+value);},current(){return current;}};
}
async function hostChild(mode,out){
 const row={phase:mode,status:'FAIL',cleanupComplete:false,boundary:'Real CPU TextureLibrary cache with inert 64x64 preload textures; fixed local PNG hash/decode/event facade; no actual browser textures or GPU evidence.',started:new Date().toISOString()};
 const receipt=path.join(out,`host-${mode}.json`);let kit,lib,merged,facade,sourceCounts,permanentCounts,priorDocument=globalThis.document,problem=null,finishStarted=false;
 const phases=createHostPhaseTracker(mode),phase=value=>phases.enter(value);phase('imports');
 try{
  const T=await import('three'),{createCanvas,loadImage}=await import('@napi-rs/canvas');
  const {CourtKit}=await import('../../src/scene/palace/kit.js'),{realTextureLibrary}=await import('../lib/r48-real-texture-library.mjs');
  const {snapshotHost,assertSameStage,captureMergeExpectation,assertMerged}=await import('./host-contract.mjs');
  const hall=mode==='baseline'?await (await import('./baseline-host.mjs')).loadBaselineHost():await import('../../src/scene/palace/special/RemainingOuterHalls.js');
  const {createDafotangPhotoSession}=await import('../../src/scene/palace/special/DafotangPhotoPresentation.js');
  const {DAFOTANG_APPROVED_PHOTOS}=await import('../../src/scene/palace/special/DafotangPhotoTriptych.js');
  phase('host-setup');facade=createPlaqueFacade({createCanvas,decode:loadImage});globalThis.document=facade.document;lib=realTextureLibrary();kit=new CourtKit(lib,'outer-west');
  const data=JSON.parse(fs.readFileSync('data/zones/outer-west.json','utf8')),items=data.items.filter(x=>x.name==='大佛堂');assert.equal(items.length,1);
  const item=items[0],profile=hall.resolveRemainingProfile('outer-west',item),{f,g}=hall.buildRemainingHall(kit,item,profile);
  await facade.settle();kit.root.updateMatrixWorld(true);
  assert.equal(g.id,'place-outer-west-6cae88b6a2');assert.equal(g.inventory.status,'UNKNOWN');assert.equal(kit.walkables.length,2);assert.equal(kit.rooms.length,1);
  assert.equal(g.triadFit.id,'dafotang-three-design-figures-v1');assert.equal(g.triadFit.subjects.length,3);assert.equal(g.photoPresentation.status,'BLOCKED');assert.equal(Object.keys(DAFOTANG_APPROVED_PHOTOS).length,0);
  const plaque=[];f.traverse(o=>{if(o.userData?.dafotangMainPlaqueRole)plaque.push(o);});assert.equal(plaque.length,2);assert.ok(plaque.every(o=>o.userData.dafotangMainPlaqueState.status==='ready'&&o.visible));
  phase('snapshot');row.snapshot=snapshotHost({kit,f,g});
  let baseline;if(mode==='candidate'){
   baseline=JSON.parse(fs.readFileSync(path.join(out,'host-baseline.json'),'utf8'));assert.equal(baseline.status,'PASS');assert.equal(baseline.cleanupComplete,true);
   phase('same-stage-comparison');row.comparison=assertSameStage(row.snapshot,baseline.snapshot);
  }
  phase('merge');const references=captureHostReferences(kit);references.check();
  const expected=captureMergeExpectation({kit});const beam=expected.buckets.filter(x=>x.beamStart!==null);assert.equal(beam.length,1);assert.equal(beam[0].beamCount,mode==='baseline'?12:1620);
  const sources=new Set();kit.root.traverse(o=>{if(o!==kit.root&&o.isMesh&&!o.isInstancedMesh&&!o.userData.noMerge&&!Array.isArray(o.material))sources.add(o.geometry);});sourceCounts=observeDisposals(sources);
  finishStarted=true;merged=kit.finish();references.check({afterFinish:true});assertMerged(merged,expected);assertDisposedOnce(sourceCounts,'merged original geometry');row.merge=bucketRows(merged);
  if(baseline)compareMerged(row.merge,baseline.merge);
  const owned=[...kit.owned,...(kit.ownedTextures??[]),...lib.materials.values(),...lib.allTextures()],geometries=new Set();merged.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});
  permanentCounts=observeDisposals([...owned,...geometries]);
  if(mode==='candidate'){phase('photo-lifecycle');row.photoCases=await exercisePhotoSessions({group:merged,kit,T,createDafotangPhotoSession,references});}
  phase('try-complete');row.measurement='same-stage snapshot, complete oriented bucket stream, permanent ownership and TEST_ONLY lifecycle';
 }catch(error){problem=error instanceof Error?error:Error(String(error));}
 finally{
  const failurePhase=phases.current();phase('cleanup');const errors=[];
  if(kit){try{cleanupKit({kit,finishStarted,merged,sourceCounts});}catch(e){recordCleanupError(errors,'kit disposal',e);}}
  if(lib){try{lib.dispose();}catch(e){recordCleanupError(errors,'texture library disposal',e);}}
  if(facade){try{await facade.close();}catch(e){recordCleanupError(errors,'facade cleanup',e);}}
  globalThis.document=priorDocument;
  try{if(kit){assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);}if(permanentCounts)assertDisposedOnce(permanentCounts,'final permanent resource');}catch(e){recordCleanupError(errors,'disposal verification',e);}
  phase('receipt');problem=finalizeReceipt({file:receipt,row,problem,cleanupErrors:errors,stage:failurePhase});
 }
 if(problem)throw problem;
}
async function main(){
 assertHostEnvironment(process.env,process.execArgv);
 assert.equal(process.env.GITHUB_REPOSITORY,'watsonbkeel/forbidden-city-3d');assert.equal(process.env.GITHUB_REF,'refs/heads/dev/r265-dafotang-route-diagnostic');assert.equal(process.env.GITHUB_EVENT_NAME,'push');
 const out=process.env.EVIDENCE_DIR;assert.ok(out&&path.isAbsolute(out));const relative=path.relative(process.cwd(),out);assert.ok(relative.startsWith('..'+path.sep)||relative==='..','evidence must be outside checkout');
 const args=process.argv.slice(2);assert.ok(args.length<=1);if(args.length){assert.ok(['--baseline','--candidate'].includes(args[0]));await hostChild(args[0].slice(2),out);return;}
 for(const mode of ['baseline','candidate'])assert.ok(!fs.existsSync(path.join(out,`host-${mode}.json`)),'fresh receipts required');
 const {spawn}=await import('node:child_process');await runSerial({spawn,script:path.resolve(process.argv[1]),readReceipt:mode=>JSON.parse(fs.readFileSync(path.join(out,`host-${mode}.json`),'utf8'))});console.log('HOST_PASS: same-stage CPU evidence only; no release acceptance');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(e=>{console.error('R265 host failed',JSON.stringify(errorEvidence(e)));process.exitCode=1;});
