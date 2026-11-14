import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const digest=b=>createHash('sha256').update(b).digest('hex');
export const copyPlan=[
 ['tests/central-unified-scalp-isolated/continuous-scalp.mjs','continuous-scalp.mjs'],
 ['tests/central-unified-scalp-isolated/scalp-patch.mjs','scalp-patch.mjs'],
 ['tests/central-unified-scalp-isolated/single-curl.mjs','single-curl.mjs'],
 ...['StudyHeadDetails.js','StudyArtBlend.js','SmoothBuddhaBody.js','CentralBuddhaVolumeStudy.js','OriginalBuddhaRelief.js','RefinedCentralBuddha.js','RefinedSideBuddha.js','EightTierLotus.js','OriginalLotusPetalUV.js'].map(f=>['src/scene/palace/special/'+f,'src/'+f]),
 ['node_modules/three/build/three.module.js','vendor/three.js'],
 ['node_modules/three/examples/jsm/utils/BufferGeometryUtils.js','vendor/BufferGeometryUtils.js'],
 ...['shakyamuni-refined-v2.png','shakyamuni-refined-alpha-grid-v2.json'].map(f=>['public/textures/dafotang-original/'+f,'assets/'+f]),
];
function inside(root,name){assert(typeof name==='string'&&name!==''&&!path.isAbsolute(name)&&!name.split(/[\\/]/).includes('..'),'unsafe pin path');const p=path.resolve(root,name);assert(p.startsWith(root+path.sep),'path outside root');return p;}
function read(root,name){const p=inside(root,name),actual=fs.realpathSync(p);assert(actual===p,'symlink input rejected: '+name);assert(fs.statSync(p).isFile(),'regular file required');return fs.readFileSync(p);}
export function verifyCheckout({root,here,evidence,githubSha}){
 root=fs.realpathSync(root);here=fs.realpathSync(here);evidence=fs.realpathSync(evidence);
 assert(here.startsWith(root+path.sep),'harness outside checkout');assert(evidence!==root&&!evidence.startsWith(root+path.sep),'evidence outside checkout required');
 assert(/^[0-9a-f]{40}$/.test(githubSha??''),'exact GITHUB_SHA required');
 assert(fs.lstatSync(path.join(root,'.git')).isDirectory(),'regular .git directory required');
 const head=read(root,'.git/HEAD').toString('utf8').trim();assert(/^[0-9a-f]{40}$/.test(head),'detached HEAD required');assert.equal(head,githubSha,'HEAD/GITHUB_SHA mismatch');
 const checkoutBytes=read(evidence,'checkout-identity.json'),checkout=JSON.parse(checkoutBytes),pinsBytes=read(here,'pins.json'),pins=JSON.parse(pinsBytes);
 assert.equal(checkout.frozen,true);assert.equal(pins.frozen,true);assert.equal(checkout.head,head,'checkout HEAD mismatch');assert.equal(checkout.pinsSHA256,digest(pinsBytes),'pins identity mismatch');
 for(const key of ['sourcePins','retainedPins']){assert(pins[key]&&typeof pins[key]==='object'&&!Array.isArray(pins[key]),'pin dictionary required');assert(Object.keys(pins[key]).length>0,'empty pins rejected');assert.deepEqual(checkout[key],pins[key],'checkout pin set mismatch');}
 for(const key of ['parent','parentTree','changes'])assert.deepEqual(checkout[key],pins[key],'checkout metadata mismatch');
 const sourcePins={...pins.sourcePins,...pins.retainedPins};for(const [name,sha]of Object.entries(pins.sourcePins))if(name in pins.retainedPins)assert.equal(sha,pins.retainedPins[name],'conflicting pin');
 for(const[name,sha]of Object.entries(sourcePins)){assert(/^[0-9a-f]{64}$/.test(sha),'malformed source pin');assert.equal(digest(read(root,name)),sha,'frozen input mismatch '+name);}
 return{root,here,evidence,head,sourcePins,checkoutBinding:{path:'checkout-identity.json',bytes:checkoutBytes.length,sha256:digest(checkoutBytes)}};
}
export function prepareSite(args){
 const state=verifyCheckout(args),{root,here,evidence,head,sourcePins,checkoutBinding}=state,site=path.join(evidence,'closeup-site');assert(!fs.existsSync(site),'fresh output required');
 for(const f of ['asset-pins.json','prepare.mjs','capture.mjs','policy.mjs'])assert(path.relative(root,path.join(here,f)) in sourcePins,'harness missing from source pins '+f);
 const assetPins=JSON.parse(read(here,'asset-pins.json')),plan=[...copyPlan,...['index.html','page.mjs'].map(f=>[path.relative(root,path.join(here,f)),f])],records={},buffers=[];
 const assetNames=plan.filter(([s])=>!s.endsWith('/index.html')&&!s.endsWith('/page.mjs')).map(([,d])=>d).sort();assert.deepEqual(Object.keys(assetPins).sort(),assetNames,'complete asset pins required');
 for(const[src,dest]of plan){const b=read(root,src),pin={bytes:b.length,sha256:digest(b)};if(dest in assetPins)assert.deepEqual(pin,assetPins[dest],'frozen asset mismatch '+dest);if(!src.startsWith('node_modules/')){assert(src in sourcePins,'copied source missing from source pins '+src);assert.equal(pin.sha256,sourcePins[src],'source changed during copy '+src);}records[dest]=pin;buffers.push([dest,b]);}
 const grid=JSON.parse(buffers.find(([d])=>d.endsWith('-grid-v2.json'))[1]);assert.equal(grid.sourceSHA256,records['assets/shakyamuni-refined-v2.png'].sha256,'grid/PNG binding mismatch');
 // All validation and copies remain in the one supervised Node process. The
 // unchanged outer guard owns Git tree/clean-worktree admission before launch.
 assert.equal(read(root,'.git/HEAD').toString('utf8').trim(),head,'HEAD changed during prepare');assert.equal(digest(read(evidence,'checkout-identity.json')),checkoutBinding.sha256,'checkout identity changed during prepare');
 fs.mkdirSync(site);for(const[name,b]of buffers){const dest=inside(site,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b,{flag:'wx'});assert.equal(digest(fs.readFileSync(dest)),records[name].sha256,'copy readback mismatch');}
 const identity={head,checkoutIdentity:checkoutBinding,scope:'PRIVATE_ISOLATED_VISUAL_DIAGNOSTIC_NOT_PRODUCT_OR_GPU_ACCEPTANCE',files:records,subjects:{shakyamuni:{png:'assets/shakyamuni-refined-v2.png',grid:'assets/shakyamuni-refined-alpha-grid-v2.json'}}};
 fs.writeFileSync(path.join(site,'identity.json'),JSON.stringify(identity,null,2),{flag:'wx'});return identity;
}
