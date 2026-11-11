import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {parseAst} from 'rollup/parseAst';
const file=new URL('./contract.mjs',import.meta.url);
test('minimal real-hall review contract exists',()=>assert.ok(existsSync(file),'contract.mjs is not implemented yet'));
if(existsSync(file)){
 const {LABEL,VIEWS,SETTINGS,requireReady,requireCaptureSet}=await import(file);
 const good=()=>({identity:{head:'a'.repeat(40),tree:'b'.repeat(40),parent:'f20bf5b3e893371b9a23d21136f82c41e75cee42',productTree:'8ac63f05ae9c968ab00d1b52711cff30144c4290'},physicsConsumer:'NONE',source:{layoutOwners:85,upperBandOwners:1,principalSupports:3,subjects:['amitabha','shakyamuni','bhaisajyaguru']},textures:{manifest:true,fallbacks:[],missingNormals:[],errors:[]},plaque:{status:'ready',leaves:2,visible:true},fonts:{status:'loaded',cjk:true},gl:{lost:false},draw:{calls:20,triangles:10000}});
 test('four declared views include actual west and east translations',()=>{assert.equal(VIEWS.length,4);assert.equal(new Set(VIEWS.map(v=>v.id)).size,4);const w=VIEWS[2],e=VIEWS[3];assert.ok(w.position[0]>0&&e.position[0]<0);assert.notDeepEqual(w.position,e.position);assert.equal(SETTINGS.exposure,.7);assert.equal(SETTINGS.postProcessing,'DISABLED_DECLARED');assert.equal(LABEL,'R266大佛堂外观核验 · 隔离真实单堂 · 非导航/碰撞验收');});
 test('only exact frozen-source ready hall is admitted',()=>{assert.equal(requireReady(good()),true);for(const mutate of [r=>r.identity.head='',r=>r.identity.parent='c'.repeat(40),r=>r.physicsConsumer='PLAYER',r=>r.source.layoutOwners=84,r=>r.source.upperBandOwners=0,r=>r.source.principalSupports=2,r=>r.source.subjects.pop()]){const r=good();mutate(r);assert.throws(()=>requireReady(r));}});
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
function fixture({timerError=false,readyError=false}={}){
 const {source,node}=initialization(),events=[],timers=[],receipt={status:'LOADING',errors:[]};
 const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
 const gates={library:deferred(),fonts:deferred(),fontReady:deferred()};
 const plaqueState={status:'loading'},material={name:'fixture-only',visible:true,map:{image:{complete:true}}};
 const leaves=[{isMesh:true,visible:true,material,userData:{dafotangUpperCentralBandRole:'central-band'}},...[1,2].map(()=>({isMesh:true,visible:true,material,userData:{dafotangMainPlaqueRole:'fixture',dafotangMainPlaqueState:plaqueState}}))];
 const group={userData:{architecture:{}},traverse:fn=>leaves.forEach(fn)};
 const fonts={status:'loaded',load:()=>{events.push('fonts.load');return gates.fonts.promise;},get ready(){events.push('fonts.ready');return gates.fontReady.promise;},check:()=>true};
 const noop=()=>{};
 const context={receipt,renderer:null,library:null,kit:null,group:null,environment:null,shadow:null,camera:null,scene:null,finishing:false,
  THREE:{Scene:class{add(){}},PerspectiveCamera:class{},LoadingManager:class{},WebGLRenderer:class{constructor(){this.domElement={addEventListener:noop};this.capabilities={getMaxAnisotropy:()=>1};}setPixelRatio(){}setSize(){}},ACESFilmicToneMapping:1,SRGBColorSpace:1},
  ShadowSetup:class{init(){}},TextureLibrary:class{constructor(){this.manifest={textures:{}};this.loadedFromFile=[];this.normals=new Map();this.materials=new Map();}load(){events.push('library.load');return gates.library.promise;}allTextures(){return[];}has(){return true;}},
  Environment:class{constructor(){events.push('environment');this.dayCycle={};}init(){}setTimePreview(){}setQuality(){}},
  CourtKit:class{constructor(){this.root={traverse:noop,clear:noop};this.colliders=[];this.walkables=[];this.owned=[];this.ownedTextures=[];}finish(){events.push('finish');return group;}},
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
 await f.release('fontReady');assert.deepEqual(f.events,['library.load','fonts.load','fonts.ready','environment','build','finish','plaque.wait']);assert.equal(f.receipt.status,'LOADING');assert.equal(f.timers.length,1);
 f.plaqueState.status='ready';f.timers.shift()();await f.done;
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
