import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {parseAst} from 'rollup/parseAst';
const file=new URL('./contract.mjs',import.meta.url);
const uuid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const rows=()=>Array.from({length:88},(_,i)=>{const kind=i<85?'layout':i===85?'central':i===86?'west':'east',role=i===0?'upper-front-entablature':kind==='layout'?'fixture-'+i:kind+'-band',name=(kind==='layout'?'dafotang-historic-spatial-fit-v1':'dafotang-upper-'+kind+'-band-partial-fit-v1')+'/'+role;return{kind,uuid:uuid(i+1),name,role,geometryUuid:uuid(1000+i),materialUuid:uuid(9000),material:'dafotang_layout_plain_gold_fit',noMerge:kind!=='layout',geometryTriangles:kind==='east'?196:kind==='west'?292:kind==='central'?580:12,contact:{count:1,meshUuid:uuid(i+1),role,id:name+'/'+uuid(i+1)}};});
const ownerReceipt=()=>{const owner88=rows(),west=owner88[86],east=owner88[87];return{layoutOwners:85,upperBandOwners:1,westBandOwners:1,eastBandOwners:1,owner88,principalSupports:3,subjects:['amitabha','shakyamuni','bhaisajyaguru'],eastContact:{meshUuid:east.uuid,geometryUuid:east.geometryUuid,triangleCount:196,indexCount:588,positionCount:392,trianglesMatch:true,boxMatches:true,offset:[221.9,0,241.1]},westContact:{meshUuid:west.uuid,geometryUuid:west.geometryUuid,triangleCount:292,trianglesMatch:true,boxMatches:true,offset:[221.9,0,241.1]}};};
const finishReceipt=source=>({method:'REAL_COURTKIT_FINISH',upperBandLeaves:1,westBandLeaves:1,eastBandLeaves:1,bandLeaves:source.owner88.filter(r=>r.kind!=='layout').map(r=>({kind:r.kind,uuid:r.uuid,geometryUuid:r.geometryUuid,materialUuid:r.materialUuid,noMerge:true,visible:true,materialVisible:true,sameMesh:true,sameGeometry:true,sameMaterial:true,sameContact:true}))});

test('minimal real-hall review contract exists',()=>assert.ok(existsSync(file),'contract.mjs is not implemented yet'));
if(existsSync(file)){
 const {LABEL,VIEWS,SETTINGS,requireReady,requireCaptureSet}=await import(file);
 const good=()=>{const source=ownerReceipt();return{identity:{head:'a'.repeat(40),tree:'b'.repeat(40),parent:'0d1558a3b799e8c3a3c89a6dd5623847e0887c78',parentTree:'4087deb43aade258b6814d7e580875238ff5c010',productTree:'8da3084dd86a8345d01dd04ac248e188eca1cc12'},physicsConsumer:'NONE',source,finish:finishReceipt(source),textures:{manifest:true,fallbacks:[],missingNormals:[],errors:[]},plaque:{status:'ready',leaves:2,visible:true},fonts:{status:'loaded',cjk:true},gl:{lost:false},draw:{calls:20,triangles:10000}};};
 test('four declared views include actual west and east translations',()=>{assert.equal(VIEWS.length,4);assert.equal(new Set(VIEWS.map(v=>v.id)).size,4);const w=VIEWS[2],e=VIEWS[3];assert.ok(w.position[0]>0&&e.position[0]<0);assert.notDeepEqual(w.position,e.position);assert.equal(SETTINGS.exposure,.7);assert.equal(SETTINGS.postProcessing,'DISABLED_DECLARED');assert.equal(LABEL,'R269大佛堂东侧曲缘核验 · 隔离真实单堂 · 非导航/碰撞验收');});
 test('only exact frozen-source ready hall is admitted',()=>{assert.equal(requireReady(good()),true);for(const mutate of [r=>r.identity.head='',r=>r.identity.parent='c'.repeat(40),r=>r.physicsConsumer='PLAYER',r=>r.source.layoutOwners=84,r=>r.source.upperBandOwners=0,r=>r.source.principalSupports=2,r=>r.source.subjects.pop()]){const r=good();mutate(r);assert.throws(()=>requireReady(r));}});
 test('88 unique linked owners and actual west contact/retained leaf are mandatory',()=>{
  assert.equal(requireReady(good()),true);
  for(const mutate of [r=>r.source.eastBandOwners=0,r=>r.source.owner88[87].uuid=r.source.owner88[86].uuid,r=>r.source.owner88[87].geometryTriangles=195,r=>r.source.owner88[85].geometryTriangles=579,r=>r.source.eastContact.trianglesMatch=false,r=>r.source.eastContact.boxMatches=false,r=>r.source.eastContact.indexCount=587,r=>r.source.eastContact.positionCount=391,r=>r.source.eastContact.triangleCount=195,r=>r.source.eastContact.geometryUuid=uuid(1),r=>r.source.eastContact.offset[0]=0,r=>r.finish.eastBandLeaves=0,r=>r.finish.bandLeaves[2].uuid=uuid(1),r=>r.finish.bandLeaves[2].sameContact=false,r=>r.identity.parentTree='b'.repeat(40),r=>r.identity.tree=r.identity.productTree,r=>r.source.westBandOwners=0,r=>r.source.owner88.pop(),r=>r.source.owner88[86].uuid=r.source.owner88[85].uuid,r=>r.source.owner88[86].kind='central',r=>r.source.owner88[86].contact.count=2,r=>r.source.owner88[86].contact.meshUuid=uuid(1),r=>r.source.owner88[86].contact.role='central-band',r=>r.source.owner88[86].contact.id='wrong',r=>r.source.owner88[86].materialUuid=uuid(111),r=>r.source.westContact.trianglesMatch=false,r=>r.source.westContact.boxMatches=false,r=>r.source.westContact.triangleCount=291,r=>r.source.westContact.offset[0]=0,r=>r.source.westContact.meshUuid=uuid(1),r=>r.finish.westBandLeaves=0,r=>r.finish.bandLeaves.pop(),r=>r.finish.bandLeaves[1].uuid=uuid(1),r=>r.finish.bandLeaves[1].geometryUuid=uuid(1),r=>r.finish.bandLeaves[1].materialUuid=uuid(1),r=>r.finish.bandLeaves[1].sameMesh=false,r=>r.finish.bandLeaves[1].sameGeometry=false,r=>r.finish.bandLeaves[1].sameMaterial=false,r=>r.finish.bandLeaves[1].sameContact=false,r=>r.finish.bandLeaves[1].visible=false,r=>r.finish.bandLeaves[1].materialVisible=false,r=>r.finish.bandLeaves[1].noMerge=false]){const r=good();mutate(r);assert.throws(()=>requireReady(r));}
 });
 test('texture fallback, absent normal, plaque, font and GL failures fail closed',()=>{for(const mutate of [r=>r.textures.manifest=false,r=>r.textures.fallbacks.push('gold'),r=>r.textures.missingNormals.push('wall_red'),r=>r.textures.errors.push('network'),r=>r.plaque.status='loading',r=>r.plaque.visible=false,r=>r.fonts.cjk=false,r=>r.gl.lost=true,r=>r.draw.triangles=0]){const r=good();mutate(r);assert.throws(()=>requireReady(r));}});
 test('four exact PNG records are necessary but not semantic acceptance',()=>{const rows=VIEWS.map(v=>({id:v.id,file:v.id+'.png',bytes:1234,width:1280,height:800,sha256:'a'.repeat(64)}));assert.equal(requireCaptureSet(rows),true);for(const bad of [rows.slice(1),[...rows,rows[0]],rows.map((x,i)=>i?x:{...x,width:1}),rows.map((x,i)=>i?x:{...x,sha256:''})])assert.throws(()=>requireCaptureSet(bad));});
}

// These use only plain fixture objects. No Three.js import, hall build or browser.
function initialization(){
 const source=readFileSync(new URL('./review-hall.mjs',import.meta.url),'utf8');
 const ast=parseAst(source),node=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='initialize');
 assert.ok(node?.async,'existing initialization must be enclosed in async initialize()');
 return {source,ast,node};
}
const turn=()=>new Promise(resolve=>setImmediate(resolve));
function fixture({timerError=false,readyError=false,westMutation=null,eastMutation=null}={}){
 const {source,node}=initialization(),events=[],timers=[],receipt={status:'LOADING',errors:[]};
 const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
 const gates={library:deferred(),fonts:deferred(),fontReady:deferred()};
 const plaqueState={status:'loading'},material={name:'fixture-only',visible:true,map:{image:{complete:true}}};
 const gold={name:'dafotang_layout_plain_gold_fit',uuid:uuid(9000),visible:true};
 const coordinate=(i,k)=>i+k/4;
 const owners=rows().map(row=>{const key=row.kind==='layout'?'dafotangLayoutRole':row.kind==='central'?'dafotangUpperCentralBandRole':row.kind==='west'?'dafotangUpperWestBandRole':'dafotangUpperEastBandRole';const count=row.kind==='east'?392:584;return{isMesh:true,name:row.name,uuid:row.uuid,visible:true,material:gold,userData:{[key]:row.role,noMerge:row.noMerge},geometry:{uuid:row.geometryUuid,index:{count:row.geometryTriangles*3,getX:i=>i%count},attributes:{position:{count,getX:i=>coordinate(i,0),getY:i=>coordinate(i,1),getZ:i=>coordinate(i,2)}},boundingBox:{clone(){return{translate(){return this;}};}}}};});
 const contacts=owners.map((mesh,i)=>{
  const kind=i<85?'layout':i===85?'central':i===86?'west':'east',tag=kind==='layout'?'dafotangLayout':kind==='central'?'dafotangUpperCentralBand':kind==='west'?'dafotangUpperWestBand':'dafotangUpperEastBand',role=mesh.userData[tag+'Role'];
  const count=kind==='east'?392:584;const triangles=['west','east'].includes(kind)?Array.from({length:kind==='east'?196:292},(_,j)=>({triangle:Object.fromEntries(['a','b','c'].map((key,k)=>[key,{x:coordinate((j*3+k)%count,0),y:coordinate((j*3+k)%count,1),z:coordinate((j*3+k)%count,2)}]))})):[];
  return{[tag+'Mesh']:mesh.uuid,[tag+'Role']:role,equals:()=>true,triangleSupport:{id:mesh.name+'/'+mesh.uuid,offset:{toArray:()=>[221.9,0,241.1]},box:{equals:()=>true},template:{triangles}}};
 });
 if(eastMutation==='contact-point')contacts[87].triangleSupport.template.triangles[0].triangle.a.x++;
 if(eastMutation==='contact-bounds')contacts[87].equals=()=>false;
 if(eastMutation==='support-bounds')contacts[87].triangleSupport.box.equals=()=>false;
 if(eastMutation==='duplicate-contact')contacts.push(contacts[87]);
 if(eastMutation==='duplicate-uuid')owners[87].uuid=owners[86].uuid;
 if(eastMutation==='index-count')owners[87].geometry.index.count=587;
 if(eastMutation==='position-count')owners[87].geometry.attributes.position.count=391;
 if(westMutation==='contact-point')contacts[86].triangleSupport.template.triangles[0].triangle.a.x++;
 if(westMutation==='duplicate-contact')contacts.push(contacts[86]);
 if(westMutation==='duplicate-uuid')owners[86].uuid=owners[85].uuid;
 const leaves=[...owners,...[1,2].map(i=>({isMesh:true,name:'fixture-plaque-'+i,visible:true,material,userData:{dafotangMainPlaqueRole:'fixture',dafotangMainPlaqueState:plaqueState}})),...[1,2,3].map(i=>({isMesh:true,name:'dafotang-shakyamuni-historical-fit/fixture-'+i,material,userData:{part:'support'}})),...['amitabha','bhaisajyaguru'].map(subjectId=>({isMesh:true,name:'fixture-'+subjectId,material,userData:{subjectId}}))];
 const group={userData:{architecture:{}},traverse:fn=>leaves.forEach(fn)};
 const fonts={status:'loaded',load:()=>{events.push('fonts.load');return gates.fonts.promise;},get ready(){events.push('fonts.ready');return gates.fontReady.promise;},check:()=>true};
 const noop=()=>{};
 const context={receipt,renderer:null,library:null,kit:null,group:null,environment:null,shadow:null,camera:null,scene:null,finishing:false,
  THREE:{Scene:class{add(){}},PerspectiveCamera:class{},Vector3:class{},LoadingManager:class{},WebGLRenderer:class{constructor(){this.domElement={addEventListener:noop};this.capabilities={getMaxAnisotropy:()=>1};}setPixelRatio(){}setSize(){}},ACESFilmicToneMapping:1,SRGBColorSpace:1},
  ShadowSetup:class{init(){}},TextureLibrary:class{constructor(){this.manifest={textures:{}};this.loadedFromFile=[];this.normals=new Map();this.materials=new Map();}load(){events.push('library.load');return gates.library.promise;}allTextures(){return[];}has(){return true;}},
  Environment:class{constructor(){events.push('environment');this.dayCycle={};}init(){}setTimePreview(){}setQuality(){}},
  CourtKit:class{constructor(){this.root={traverse:fn=>leaves.forEach(fn),clear:noop};this.colliders=contacts;this.walkables=[];this.owned=[];this.ownedTextures=[];}finish(){events.push('finish');if(eastMutation==='lost')leaves.splice(87,1);if(eastMutation==='mesh')leaves[87]={...leaves[87]};if(eastMutation==='geometry')leaves[87].geometry={...leaves[87].geometry};if(eastMutation==='material')leaves[87].material={...leaves[87].material};if(eastMutation==='invisible')leaves[87].visible=false;if(eastMutation==='noMerge')leaves[87].userData.noMerge=false;if(eastMutation==='contact-lost')contacts.splice(87,1);if(westMutation==='lost')leaves.splice(86,1);if(westMutation==='mesh')leaves[86]={...leaves[86]};if(westMutation==='geometry')leaves[86].geometry={...leaves[86].geometry};if(westMutation==='material')leaves[86].material={...leaves[86].material};if(westMutation==='invisible')leaves[86].visible=false;if(westMutation==='noMerge')leaves[86].userData.noMerge=false;return group;}},
  TEXTURE_SPECS:{},textureErrors:[],document:{fonts,querySelector:()=>({})},SETTINGS:{width:1280,height:800,dpr:1,exposure:.7,date:'2026-11-11T04:00:00.000Z',postProcessing:'DISABLED_DECLARED'},
  zone:{items:[{name:'大佛堂'}]},resolveRemainingProfile:()=>({key:'dafotang',id:'fixture'}),buildRemainingHall:()=>events.push('build'),setBuildingDetailQuality:noop,watch:noop,geometryWatch:noop,structuredClone,
  performance:{now:()=>0},setTimeout:resolve=>{events.push('plaque.wait');if(timerError)throw Error('plaque timer rejected');timers.push(resolve);},
  VIEWS:[{id:'fixture'}],buttons:[{disabled:true}],renderView:()=>events.push('render'),
  requireReady:r=>{events.push('ready.check');assert.equal(r.plaque.status,'ready');assert.equal(r.fonts.status,'loaded');if(readyError)throw Error('ready validation rejected');},
  publish:()=>events.push('publish:'+receipt.status),fail:e=>{events.push('fail');receipt.status='FAILED';receipt.errors.push(String(e));},dispose:()=>events.push('dispose')};
 const initialize=runInNewContext('"use strict";'+source.slice(node.start,node.end)+';initialize;',context);
 const done=initialize();
 return {events,receipt,gates,done,timers,plaqueState,async release(name){gates[name].resolve(name==='fonts'?[]:undefined);await turn();}};
}
test('review entry has no top-level await and invokes one async initializer with original catch cleanup',()=>{
 const {source,ast,node}=initialization();let topAwait=0;const inside=[];
 function walk(n,depth=0){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(v=>walk(v,depth));return;}if(n.type==='AwaitExpression'){if(depth===0)topAwait++;else inside.push(source.slice(n.start,n.end));}const next=depth+Number(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(n.type));for(const [key,v]of Object.entries(n))if(!['start','end'].includes(key))walk(v,next);}
 walk(ast);assert.equal(topAwait,0);assert.equal(inside.length,4);
 assert.ok(inside[0].includes('library.load()'));assert.ok(inside[1].includes('document.fonts.load('));assert.ok(inside[2].includes('document.fonts.ready'));assert.ok(inside[3].includes('setTimeout(resolve,50)'));
 const calls=ast.body.filter(n=>n.type==='ExpressionStatement'&&n.expression.type==='UnaryExpression'&&n.expression.operator==='void'&&n.expression.argument.type==='CallExpression'&&n.expression.argument.callee.name==='initialize');assert.equal(calls.length,1);assert.equal(calls[0].expression.argument.arguments.length,0);
 assert.match(source.slice(node.start,node.end),/catch\(error\)\{fail\(error\);dispose\(\);\}/);
});
test('async initialization waits for textures, font load/readiness and plaque before READY',async()=>{
 const f=fixture();assert.deepEqual(f.events,['library.load']);assert.equal(f.receipt.status,'LOADING');
 await f.release('library');assert.deepEqual(f.events,['library.load','fonts.load']);
 await f.release('fonts');assert.deepEqual(f.events,['library.load','fonts.load','fonts.ready']);
 await f.release('fontReady');assert.deepEqual(f.receipt.errors,[]);assert.deepEqual(f.events,['library.load','fonts.load','fonts.ready','environment','build','finish','plaque.wait']);assert.equal(f.receipt.status,'LOADING');assert.equal(f.timers.length,1);
 f.plaqueState.status='ready';f.timers.shift()();await f.done;
 assert.equal(f.receipt.source.owner88.length,88);assert.equal(f.receipt.source.westContact.trianglesMatch,true);assert.equal(f.receipt.source.eastContact.trianglesMatch,true);assert.equal(f.receipt.finish.bandLeaves.length,3);assert.ok(f.receipt.finish.bandLeaves.every(r=>r.sameMesh&&r.sameGeometry&&r.sameMaterial&&r.sameContact));
 assert.equal(f.receipt.status,'READY');assert.deepEqual(f.events.slice(-3),['render','ready.check','publish:READY']);assert.ok(!f.events.includes('dispose'));
});
test('async rejection and late readiness errors retain FAILED then cleanup without READY',async()=>{
 for(const stop of ['library','fonts','fontReady','plaque','ready']){
  const f=fixture({timerError:stop==='plaque',readyError:stop==='ready'});
  for(const stage of ['library','fonts','fontReady']){if(stage===stop){f.gates[stage].reject(Error(stage+' rejected'));break;}await f.release(stage);}
  if(stop==='ready'){f.plaqueState.status='ready';f.timers.shift()();}
  await f.done;assert.equal(f.receipt.status,'FAILED',stop);assert.equal(f.receipt.errors.length,1);assert.deepEqual(f.events.slice(-2),['fail','dispose']);assert.ok(!f.events.includes('publish:READY'));assert.equal(f.events.filter(x=>x==='dispose').length,1);
 }
});

test('actual initializer rejects bad west contacts and substituted/lost finish leaves',async()=>{
 for(const westMutation of ['contact-point','duplicate-contact','duplicate-uuid','lost','mesh','geometry','material','invisible','noMerge']){const f=fixture({westMutation});for(const name of ['library','fonts','fontReady'])await f.release(name);if(f.timers.length){f.plaqueState.status='ready';f.timers.shift()();}await f.done;assert.equal(f.receipt.status,'FAILED',westMutation);assert.deepEqual(f.events.slice(-2),['fail','dispose']);assert.ok(!f.events.includes('publish:READY'));}
});

 test('actual initializer rejects bad east geometry/contact and substituted/lost finish leaves',async()=>{
 for(const eastMutation of ['contact-point','contact-bounds','support-bounds','duplicate-contact','duplicate-uuid','index-count','position-count','lost','mesh','geometry','material','invisible','noMerge','contact-lost']){const f=fixture({eastMutation});for(const name of ['library','fonts','fontReady'])await f.release(name);if(f.timers.length){f.plaqueState.status='ready';f.timers.shift()();}await f.done;assert.equal(f.receipt.status,'FAILED',eastMutation);assert.deepEqual(f.events.slice(-2),['fail','dispose']);assert.ok(!f.events.includes('publish:READY'));}
 });
