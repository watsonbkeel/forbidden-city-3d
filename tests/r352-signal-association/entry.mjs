// Private diagnostic entry: shared scalar abort listener in both signal arms.
import {loadPairedArtwork} from './paired-loader.mjs';
import {createActiveWindow} from './signal-contract.mjs';
const ids=['amitabha','shakyamuni','bhaisajyaguru'],generations=[];let current=null;
const linkageMode=globalThis.__R352_SIGNAL_MODE__;if(!['linked','omit-later'].includes(linkageMode)||globalThis.__R346_PAIR_MODE__!=='release-after-terminal')throw Error('Exact private held-reader signal mode required');
const snap=()=>generations.map(g=>({index:g.index,disposed:g.disposed,activity:g.activity.read(),slots:g.slots.map(s=>({id:s.id,status:s.status,error:s.error,disposeCount:s.disposeCount,asset:s.asset}))}));
function start(){
 if(current&&!current.disposed)throw Error('previous generation still live');if(generations.length>=3)throw Error('three generations only');
 const g={index:generations.length+1,controller:new AbortController(),disposed:false,slots:ids.map(id=>({id,status:'LOADING',output:null,disposeCount:0}))};g.activity=createActiveWindow(g.controller.signal,g.index);generations.push(g);current=g;g.activity.check('generation-start');
 g.ready=Promise.all(g.slots.map(async s=>{try{const options={baseURL:location.origin+'/forbidden-city-3d/',signal:g.controller.signal,generation:g.index,mode:'release-after-terminal',linkageMode,qualifyCheck:stage=>g.activity.check(stage),bridge:message=>globalThis.__R346_TERMINAL__(message)};const o=await loadPairedArtwork(s.id,options);s.asset=o.meta.originalAsset;if(g.disposed){o.dispose();s.disposeCount++;s.status='DISPOSED';}else{s.output=o;s.status='READY';}}catch(e){s.error={name:e.name,message:e.message};s.status=g.disposed&&e.name==='AbortError'?'ABORTED':'FAILED';}}));return snap();
}
function qualify(index){if(!current||current.disposed||current.index!==index)throw Error('Exact live generation required');return current.activity.qualify(index,current.slots);}
function dispose(normal=true){if(!current||current.disposed)throw Error('one disposal per generation');const g=current;g.activity.beginCleanup(normal);g.disposed=true;try{g.controller.abort();for(const s of g.slots)if(s.output){s.output.dispose();s.output=null;s.disposeCount++;s.status='DISPOSED';}}finally{g.activity.close();}return snap();}
Object.defineProperty(window,'__R328_LOADER__',{value:Object.freeze({start,qualify,dispose,read:snap,async ready(){if(!current)throw Error('no generation');await current.ready;return snap();}})});
