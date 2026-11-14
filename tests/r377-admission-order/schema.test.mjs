// Schema regression only. Shape fixture copied unchanged from retained r275 contract tests;
// actual asset identities below are hashed from current production files, not synthetic expected keys.
import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {assertReady} from '../r275-buddha-triad-review/contract.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const current=read('tests/r377-admission-order/pins.json'),prior=read('tests/r364-asset-delivery/pins.json');
const ids=['amitabha','shakyamuni','bhaisajyaguru'];
const ready=()=>({status:'READY',identity:{frozen:true,sourcePins:Object.fromEntries(ids.flatMap(id=>[['public/textures/dafotang-original/'+(id+'-refined-v2.png'),id+'png'],['public/textures/dafotang-original/'+(id+'-refined-alpha-grid-v2.json'),id+'grid']]))},errors:[],figures:ids.map((id,i)=>({subjectId:id,bounds:{min:[0,1.7,0],max:[1,3.95,1]},contactGap:0,worldForward:[0,0,-1],fixedTransform:Array(16).fill(0),petalMaterial:{sameTexture:true,color:0xffffff,roughness:.65,metalness:.3,transparent:false,alphaTest:.5},meta:{lotusPetalTexture:{sha256:id+'png',kind:'OWN_GENERATED_SINGLE_PETAL_INTERIOR_NOT_FULL_PAINTED_SEAT',notMeasuredPBR:true,...Object.fromEntries(['x0','y0','x1','y1'].map((k,j)=>[k,{shakyamuni:[478,1024,547,1063],amitabha:[480,963,549,997],bhaisajyaguru:[470,905,541,936]}[id][j]]))},...(id==='shakyamuni'?{centralRevision:'refined-eight-tier-v2',sourceUpperLastRow:124,oldPaintedPedestalUsed:false,lotusPetalTiers:8,lotusTierVertexRanges:Array(8).fill({})}:{sideRevision:'private-side-eight-tier-v2',preparationOnly:true,userCentralConfirmationRequired:true,sourceUpperLastRow:id==='amitabha'?116:108,oldPaintedPedestalUsed:false,lotusPetalTiers:8,lotusTierVertexRanges:Array(8).fill({})}),historicalPhoto:false,cameraFacing:false,originalAsset:{subjectId:id,pngSHA256:id+'png',gridSHA256:id+'grid'}},texture:{uuid:id,width:1024,height:1536,isCanvasTexture:false,isDataTexture:false},proxyContains:true,supportContainsFootprint:true,fallbackBucketsHidden:3})),nonFigureContactsUnchanged:true,supportBucketsUnchanged:true,proxySubjects:ids,textures:{manifest:true,fallbacks:[],missingNormals:[],errors:[]},fonts:{cjk:true}});
const assetPaths=ids.flatMap(id=>['public/textures/dafotang-original/'+id+'-refined-v2.png','public/textures/dafotang-original/'+id+'-refined-alpha-grid-v2.json']);
function receipt(pins){const r=ready();r.identity=pins;for(const f of r.figures){f.meta.originalAsset.pngSHA256=sha('public/textures/dafotang-original/'+f.subjectId+'-refined-v2.png');f.meta.originalAsset.gridSHA256=sha('public/textures/dafotang-original/'+f.subjectId+'-refined-alpha-grid-v2.json');f.meta.lotusPetalTexture.sha256=f.meta.originalAsset.pngSHA256;}return r;}
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{const p=dir+'/'+e.name;assert.ok(!e.isSymbolicLink());return e.isDirectory()?files(p):[p];});}
const baseline=read('tests/r374-axis-source-access/pins.json');
const approved=read('tests/r376-product-identity/approved-cleanup.json');
const baselinePins={...baseline.sourcePins,...baseline.retainedPins};
const approvedPaths=['OriginalBuddhaRelief','RefinedCentralBuddha','RefinedSideBuddha'].map(n=>'src/scene/palace/special/'+n+'.js').sort();
function verify(pins, actual=sha){
 assert.equal(pins.frozen,true);
 assert.deepEqual(Object.keys(approved).sort(),approvedPaths);
 assert.deepEqual(Object.keys(pins.sourcePins).filter(p=>p in pins.retainedPins),[]);
 const prod=['src','data','public'].flatMap(files).sort();assert.equal(prod.length,1075);
 assert.deepEqual(Object.keys(pins.sourcePins).filter(p=>/^(src|data|public)\//.test(p)).sort(),prod);
 let unchanged=0;
 for(const p of prod){
  assert.equal(pins.sourcePins[p],actual(p),p+' actual bytes');
  if(approved[p]){assert.equal(baselinePins[p],approved[p].old,p+' exact old');assert.equal(pins.sourcePins[p],approved[p].new,p+' exact new');}
  else {assert.equal(pins.sourcePins[p],baselinePins[p],p+' unchanged');unchanged++;}
 }
 assert.equal(unchanged,1072);
 const previous=read('tests/r376-product-identity/pins.json');
 const combined={...pins.sourcePins,...pins.retainedPins};
 for(const[p,h]of Object.entries({...previous.sourcePins,...previous.retainedPins}))assert.equal(combined[p],h,p+' retained R376');
}
test('frozen current actual bytes admit only three exact R374-to-R375 cleanup deltas',()=>verify(current));
test('missing production source pin remains rejected even if retained map has it',()=>{const p=approvedPaths[0],c=structuredClone(current);c.retainedPins[p]=c.sourcePins[p];delete c.sourcePins[p];assert.throws(()=>verify(c));});
test('changed actual bytes fail even with unchanged candidate hashes',()=>assert.throws(()=>verify(current,p=>p===approvedPaths[0]?'0'.repeat(64):sha(p))));
test('unapproved fourth product change cannot be legitimized by candidate pins',()=>{const p='src/utils/Collision.js',c=structuredClone(current);c.sourcePins[p]='0'.repeat(64);assert.throws(()=>verify(c,q=>q===p?'0'.repeat(64):sha(q)));});
test('wrong approved new hash cannot be legitimized by candidate pins',()=>{const p=approvedPaths[0],c=structuredClone(current);c.sourcePins[p]='0'.repeat(64);assert.throws(()=>verify(c,q=>q===p?'0'.repeat(64):sha(q)));});
test('source and retained overlap is rejected',()=>{const c=structuredClone(current);c.retainedPins[approvedPaths[0]]=c.sourcePins[approvedPaths[0]];assert.throws(()=>verify(c));});
test('retained prior frozen path cannot be dropped or weakened',()=>{const p=Object.keys(current.retainedPins)[0];for(const value of [undefined,'0'.repeat(64)]){const c=structuredClone(current);if(value)c.retainedPins[p]=value;else delete c.retainedPins[p];assert.throws(()=>verify(c));}});
test('unchanged real assertReady accepts actual candidate six asset pins',()=>assertReady(receipt(current)));
test('unchanged real assertReady reproduces historical R364 missing-schema failure',()=>{for(const p of assetPaths)assert.equal(prior.sourcePins[p],undefined);assert.throws(()=>assertReady(receipt(prior)),{code:'ERR_ASSERTION'});});
test('each missing source asset hash remains rejected even if retainedPins has the correct hash',()=>{for(const p of assetPaths){const pins=structuredClone(current);pins.retainedPins[p]=pins.sourcePins[p];delete pins.sourcePins[p];assert.throws(()=>assertReady(receipt(pins)),{code:'ERR_ASSERTION'});}});
test('each wrong source asset hash remains rejected by original consumer',()=>{for(const p of assetPaths){const pins=structuredClone(current);pins.sourcePins[p]='0'.repeat(64);assert.throws(()=>assertReady(receipt(pins)),{code:'ERR_ASSERTION'});}});
