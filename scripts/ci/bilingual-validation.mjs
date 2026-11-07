import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {execFileSync,spawn} from 'node:child_process';import {registerHooks} from 'node:module';
import {sourceFingerprint,createBuildInfo} from '../build-identity.mjs';
import {verifyFrozenRows,frozenReadbackSelfCheck} from './freeze-readback.mjs';
import {runWithDeadline} from './bounded-ci-command.mjs';
import {assertAncestors,readRegular,validateIdentity} from './bilingual-ui/common.mjs';
const evidence=process.env.EVIDENCE_DIR,root=process.cwd();
assert.ok(evidence&&path.isAbsolute(evidence));assertAncestors(evidence);assert.equal(fs.lstatSync(evidence).isDirectory(),true);
const write=(name,value)=>fs.writeFileSync(path.join(evidence,name),JSON.stringify(value,null,2)+'\n');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).trim();
const gitNames=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).split('\0').slice(0,-1);
const sha=p=>createHash('sha256').update(readRegular(path.resolve(p),64*1024*1024)).digest('hex');
const source='fd5d5c836ff9b8c22eab0572aac7cfe4e0203ce2',publicBase='e1287435158ee5aa98e0a1a370cae97021a5c385',fingerprint='25fcf75c7ad25bf915ad063b1501109852483bef6b10eebbe5dc1cdb02d1b780',base='/forbidden-city-3d/',workflow='.github/workflows/r165-bilingual-validation.yml',docs='docs/current-state/r165-cumulative-373-bilingual/';
const requiredRefs=["0c068d6b1b003f0d0d2ff6433b492cb18801e7b5", "14d81f71b3acd0eedfe1f2e12bd01190765f77ea", "1f6e583065d50eb655d66c3772fb798a25656e49", "23f224f4c286c432c12f0a61eb90055da30254fb", "2544bab117846a7fd16175a0279e97190d28f549", "27b8f9dcfe5d362cadea100c402ac7f806e4e0a5", "2e80fcbe7321f93fde594d3695c3cd7b2eeb565b", "5030d7a4171eb7c5fd13c7e7d5bce259255f18a9", "7de2c8e7dcec7733a586d6a5af928413706af3fa", "8230da2568b628d8b3687e7a4246ed9b172b18e4", "8386b6f0bbbe78230966b35576e11cd06310bf15", "93d4751b53b8946d1e481abaa11c730f3624119b", "9a6915ce5da1f526a82ea30271f3ab8eb2b8ff65", "9e68601aa473bb58459dc6936047c068b5c8d160", "ad0f3086e32d8f101bb29c1a7a7b04fc441861ab", "adc306fcac0cff588ee2ae348ed7ae5a6c99338f", "ae712bcdc160113aca5dbd1e00e221b58ea94dd3", "b421288f81895612e57712b7460f0c91ae1f13bc", "b5d78251f93e86a46b0fc0b169cb29076313305a", "c080d0e100be6dc9c3c152adac7aada35481afd9", "cc9963dccfb3633ac6837361eb83e9a314a794a2", "d4c40891e8082038d949b69aa94651a5a1478fee", "d84a1639476ee52f5a0fdb6a46c27f6b1886bd37", "d8d56c3066352cc6ca1fd8751156b1527ce5c719", "da2cb44791efe4ae160aeb3e545efc1b1f256232", "dcd3d15c78d22d6667716375e6f57737eb21ad91", "e1287435158ee5aa98e0a1a370cae97021a5c385", "e999537f2224acb5ae557f4067965415cb61cc2a", "ee19cd0d013735cf44075cc1b8c6f1d5c178f399", "eeee6aa816be0f70ddc18bef6d1aa8cd979709d3", "f638d92721f857312d77a70ea1169b7afda1802c", "f989f251e24a8afe411d9c294269e8cfb1418177", "fef5c0e1904c361e7492d744f06d82a8c137e1ea"];
const state={schema:3,startedAt:new Date().toISOString(),sourceFreezeLabelOnly:source,eventCommit:process.env.GITHUB_SHA,sourceFingerprint:fingerprint,base,preflight:{status:'running'},commands:[]};write('results.json',state);let bounded,heavy,bilingualBounded,retainedUi,e46Bounded;
try{
 assert.equal(process.env.GITHUB_REPOSITORY,'watsonbkeel/forbidden-city-3d');assert.equal(process.env.GITHUB_EVENT_NAME,'push');assert.equal(process.env.GITHUB_REF,'refs/heads/dev/r166-cumulative-374-e46-origin-20261106');assert.equal(process.version,'v24.22.1');assert.equal(typeof registerHooks,'function');
 validateIdentity({eventSha:process.env.GITHUB_SHA,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,repository:process.env.GITHUB_REPOSITORY,ref:process.env.GITHUB_REF});
 assert.equal(root,path.resolve(process.env.GITHUB_WORKSPACE));assert.equal(git('rev-parse','HEAD'),process.env.GITHUB_SHA);assert.equal(git('status','--porcelain','--untracked-files=all'),'');assert.equal(git('rev-parse','HEAD^'),publicBase);assert.equal(git('rev-list','--parents','-n','1','HEAD').split(' ').length,2);assert.equal(git('rev-parse',publicBase+'^{tree}'),'5361deb617fa973bda3f723d5aad5f74b00decd9');
 for(const ref of requiredRefs){assert.equal(git('cat-file','-t',ref),'commit');git('merge-base','--is-ancestor',ref,publicBase);}
 assert.match(process.env.CANDIDATE_INPUTS_SHA256??'',/^[a-f0-9]{64}$/);assert.equal(sha(docs+'INPUTS.json'),process.env.CANDIDATE_INPUTS_SHA256);
 const inputs=JSON.parse(fs.readFileSync(docs+'INPUTS.json')),product=JSON.parse(fs.readFileSync(docs+'PRODUCT-DELTA.json')),freeze=JSON.parse(fs.readFileSync(docs+'SOURCE-TESTS-FREEZE.json')),runtime=JSON.parse(fs.readFileSync(docs+'RUNTIME-INPUTS.json')),wrappers=JSON.parse(fs.readFileSync(docs+'WRAPPER-PATHS.json'));
 const readFrozen=p=>{const full=path.resolve(p);assertAncestors(full);const stat=fs.lstatSync(full);return {bytes:readRegular(full,64*1024*1024),regular:stat.isFile(),mode:stat.mode&0o111?'100755':'100644'};};
 assert.equal(inputs.schema,1);const inputReadback=verifyFrozenRows(inputs.files,readFrozen);const productReadback=verifyFrozenRows(product.files,readFrozen);const runtimeReadback=verifyFrozenRows(runtime.inputs,readFrozen);const freezeSelfCheck=frozenReadbackSelfCheck();
 assert.equal(product.sourceLabelOnly,source);assert.equal(product.sourceTreeLabelOnly,'3772cd4141583d465bb464ce2de5fca4acd6f74e');assert.equal(product.publicBase,publicBase);assert.equal(product.files.length,124);assert.equal(runtime.files,994);assert.equal(runtimeReadback.files,994);assert.equal(runtimeReadback.bytes,48930043);assert.equal(runtime.sourceFingerprint,fingerprint);assert.equal(runtime.expectedBuildId,'R164-c956320a6ed5');assert.equal(sourceFingerprint(root),fingerprint);assert.equal(createBuildInfo({base}).buildId,runtime.expectedBuildId);assert.deepEqual(freeze.requiredGitBaselines,requiredRefs);
 assert.equal(new Set(wrappers).size,wrappers.length);assert.ok(wrappers.includes(workflow));
 const allowed=[...product.files.map(r=>r.path),...wrappers].sort();assert.equal(new Set(allowed).size,allowed.length);assert.deepEqual(gitNames('diff','--no-renames','--name-only','-z',publicBase,'HEAD').sort(),allowed);
 const actualChanges=gitNames('diff','--no-renames','--name-status','-z',publicBase,'HEAD');assert.deepEqual(actualChanges.reduce((out,v,i,a)=>i%2?out:[...out,v+'\t'+a[i+1]],[]).sort(),[...product.files.map(r=>r.status+'\t'+r.path),...wrappers.map(p=>'A\t'+p)].sort());
 for(const row of product.files){assert.ok(['A','M'].includes(row.status));assert.equal(git('ls-tree','HEAD','--',row.path).split(/\s+/)[0],row.mode);}
 const baselinePaths=new Set(gitNames('ls-tree','-r','--name-only','-z',publicBase));for(const row of product.files)assert.equal(row.status,baselinePaths.has(row.path)?'M':'A');for(const p of wrappers)assert.equal(baselinePaths.has(p),false);
 assert.equal(gitNames('ls-tree','-r','--name-only','-z','HEAD').length,baselinePaths.size+product.files.filter(row=>row.status==='A').length+wrappers.length);
 bounded=JSON.parse(fs.readFileSync(docs+'BOUNDED-TEST-FILES.json'));heavy=JSON.parse(fs.readFileSync(docs+'HEAVY-TEST-FILES.json'));bilingualBounded=JSON.parse(fs.readFileSync(docs+'BILINGUAL-TEST-FILES.json'));retainedUi=JSON.parse(fs.readFileSync(docs+'RETAINED-UI-CATALOG-TEST-FILES.json'));e46Bounded=JSON.parse(fs.readFileSync(docs+'E46-TEST-FILES.json'));assert.deepEqual(retainedUi,["tests/map-place-directory.test.mjs", "tests/map-place-selection.test.mjs", "tests/place-catalog.test.mjs", "tests/place-catalog-complete.test.mjs", "tests/place-catalog-all-zones.test.mjs"]);
 assert.deepEqual(bounded,JSON.parse(fs.readFileSync('docs/current-state/r165-cumulative-373-retention/BOUNDED-TEST-FILES.json')));assert.deepEqual(heavy,JSON.parse(fs.readFileSync('docs/current-state/r165-cumulative-373-retention/HEAVY-TEST-FILES.json')));assert.equal(bounded.length,430);assert.equal(heavy.length,5);assert.equal(new Set([...bounded,...heavy]).size,435);assert.equal(bilingualBounded.length,18);assert.equal(new Set(bilingualBounded).size,18);assert.deepEqual(bilingualBounded,gitNames('ls-tree','-r','--name-only','-z','HEAD','--','tests/bilingual').filter(p=>/^tests\/bilingual\/[^/]+\.test\.mjs$/.test(p)).sort());assert.ok(!bilingualBounded.includes('tests/bilingual/runtime-map.production.mjs'));
 assert.equal(e46Bounded.length,10);assert.equal(new Set(e46Bounded).size,10);assert.deepEqual(e46Bounded,gitNames('ls-tree','-r','--name-only','-z','HEAD','--','tests/r166-xiangxu-gate','tests/r166-directory-scroll').filter(p=>/^tests\/(?:r166-xiangxu-gate\/[^/]+|r166-directory-scroll\/scroll-policy)\.test\.mjs$/.test(p)).sort());assert.ok(e46Bounded.every(p=>![...bounded,...heavy,...bilingualBounded,...retainedUi].includes(p)));
 const oldInputHashes=JSON.parse(fs.readFileSync(docs+'BASELINE-INPUT-HASHES.json'));assert.equal(Object.keys(oldInputHashes).length,465);for(const p of Object.keys(oldInputHashes))assert.ok(inputs.files.some(row=>row.path===p));
  const fontRows=freeze.testFontInputs;
  const fontRow=fontRows.find(row=>row.path==='tests/fonts/changyin/ForbiddenCityTestCJK-Regular.otf');
  const licenseRow=fontRows.find(row=>row.path==='tests/fonts/changyin/OFL.txt');
  assert.equal(fontRows.length,5);assert.equal(fontRow.bytes,7192);
  assert.equal(fontRow.sha256,'fbad0a8d2bd81170a66ef7a1094548fcd250a2034b60581fa193d6d717af1c24');
  assert.equal(licenseRow.bytes,4260);assert.equal(licenseRow.sha256,'c106844fe4031b157f50d2e10c7d9e07f738cdf02295d3d3d98572d361623f92');
  assert.equal(fs.readFileSync(fontRow.path).subarray(0,4).toString('ascii'),'OTTO');
  write('test-font-input.json',fontRows);console.log('R165_TEST_FONT_INPUT_JSON '+JSON.stringify(fontRows));
  const extras=['tests/r42-guhua-pavilion.test.mjs','tests/r42-independent-pavilion.test.mjs',
    'tests/r42-fidelity-navigation.test.mjs','tests/r139/details.test.mjs','tests/r48-zone-flight-envelope.test.mjs'];
  for(const p of [...bounded,...heavy,...extras,...bilingualBounded,...retainedUi,...e46Bounded]) {
    assert.match(p,/^tests\/[A-Za-z0-9_./-]+\.test\.mjs$/);assert.ok(!p.split('/').includes('..'));
    assert.ok(fs.lstatSync(p).isFile(),p);git('ls-files','--error-unmatch','--',p);
  }
 assert.ok(!fs.existsSync('dist'));fs.mkdirSync(path.join(evidence,'manifests'));
 for(const p of wrappers.filter(p=>p.startsWith(docs)))fs.copyFileSync(p,path.join(evidence,'manifests',path.basename(p)));
 write('input-file-hashes.json',Object.fromEntries(inputs.files.map(row=>[row.path,row.sha256])));write('frozen-readback.json',{inputReadback,productReadback,runtimeReadback,freezeSelfCheck});write('test-font-input.json',freeze.testFontInputs);
 write('source-identity-before.json',{head:git('rev-parse','HEAD'),tree:git('rev-parse','HEAD^{tree}'),event:process.env.GITHUB_EVENT_NAME,ref:process.env.GITHUB_REF,runId:process.env.GITHUB_RUN_ID,runAttempt:process.env.GITHUB_RUN_ATTEMPT,node:process.version,versions:process.versions,expectedNpm:'11.9.0',requiredGitBaselines:requiredRefs,buildInfo:createBuildInfo({base}),localFreezeLabelOnly:source,publicBase,diffFromPublicBase:git('diff','--no-renames','--name-status',publicBase,'HEAD')});
 console.log('R165_SOURCE_IDENTITY_JSON '+fs.readFileSync(path.join(evidence,'source-identity-before.json'),'utf8').trim());console.log('R165_TEST_MANIFEST_JSON '+JSON.stringify({boundedFiles:bounded.length,boundedUnique:new Set(bounded).size,heavyFiles:heavy.length,bounded,heavy}));
 state.preflight={status:'passed',completedAt:new Date().toISOString()};write('results.json',state);
}catch(error){state.preflight={status:'failed',error:error.stack};write('results.json',state);console.error(error);process.exit(1);}
const flags=['--expose-gc','--max-old-space-size=1024','--max-semi-space-size=16',
  '--test','--test-reporter=tap','--test-concurrency=1'];
const test=(name,args,category='extra',env={})=>({name,command:process.execPath,
  args:[...flags.map(flag=>flag==='--max-old-space-size=1024'&&
    (category==='formal-heavy'||category==='heavy-extra'||name.startsWith('r42-full-'))?'--max-old-space-size=3072':flag),...args],category,env});
const httpVerifier="import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {verifyBuildSource} from './scripts/build-identity.mjs';\nconst root=process.cwd(),dist=path.join(root,'dist'),out=path.join(process.env.EVIDENCE_DIR,'pages-http.json'),expectedCommit=process.env.GITHUB_SHA,base='/forbidden-city-3d/';const built=verifyBuildSource({root,dist,expectedBase:base});const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();if(!expectedCommit)throw Error('Explicit verified source commit required');assert.equal(built.sourceCommit,expectedCommit);assert.equal(git(['rev-parse',expectedCommit]),expectedCommit);git(['merge-base','--is-ancestor',expectedCommit,'HEAD']);assert.equal(built.sourceDirty,false);\nconst mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.glb':'model/gltf-binary','.woff2':'font/woff2','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.svg':'image/svg+xml'},hash=x=>createHash('sha256').update(x).digest('hex');\nconst server=http.createServer((req,res)=>{let u;try{u=new URL(req.url,'http://localhost').pathname}catch{res.writeHead(400).end();return}if(!u.startsWith(base)){res.writeHead(404).end();return}let rel=decodeURIComponent(u.slice(base.length));if(!rel)rel='index.html';if(rel.split('/').some(p=>p==='..'||p==='.')||rel.includes('\\\\')){res.writeHead(404).end();return}const file=path.join(dist,rel);if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}res.writeHead(200,{'content-type':mime[path.extname(file)]??'application/octet-stream','cache-control':'no-store'});res.end(fs.readFileSync(file))});\nawait new Promise((ok,bad)=>{server.on('error',bad);server.listen(0,'127.0.0.1',ok)});const origin=`http://127.0.0.1:${server.address().port}`;const files=[];function scan(dir,rel=''){for(const name of fs.readdirSync(dir).sort()){const p=path.join(dir,name),r=rel?rel+'/'+name:name;if(fs.statSync(p).isDirectory())scan(p,r);else files.push(r)}}scan(dist);\ntry{let totalBytes=0;const rows=[];for(const p of files){const bytes=fs.readFileSync(path.join(dist,p)),response=await fetch(origin+base+p),actual=Buffer.from(await response.arrayBuffer());assert.equal(response.status,200,p);assert.equal(hash(actual),hash(bytes),p);assert.equal(response.headers.get('content-type'),mime[path.extname(p)]??'application/octet-stream',p);totalBytes+=bytes.length;rows.push({path:p,bytes:bytes.length,sha256:hash(bytes)});}const response=await fetch(origin+base),html=await response.text();assert.equal(response.status,200);assert.equal(html,fs.readFileSync(path.join(dist,'index.html'),'utf8'));const entryAssets=[...html.matchAll(/(?:src|href)=\"([^\"]+\\.(?:js|css))\"/g)].map(m=>m[1]);assert.ok(entryAssets.length>=2);for(const u of entryAssets){assert.ok(u.startsWith(base));assert.equal((await fetch(origin+u)).status,200)}const js=files.filter(p=>p.endsWith('.js')).map(p=>fs.readFileSync(path.join(dist,p),'utf8')).join('\\n');for(const token of ['endpoint-rest','复制诊断','首错诊断','sanyou-main-shell','yizhai-main-shell','nonpreemptive','Register C/W','getBuildStepMetrics','failedStep','Main-roof upper triangle envelope is empty','zhuxiang-main-shell','main-upper-gable-','FC-2465BC98A2','juting-main-pavilion','west-window','FC-FA6119DC49','yunguang-main-shell','north-upper-gable-','east-hard-gable-','FC-9B2BEC50D8','lutai-rock-terrace','FC-F5886C9CA9','ROCK_TERRACE_EAST_ENTRY_NORTH_SOUTH_GAME_STAIRS','CLOSED_FACETED_APPROXIMATION_NOT_PHOTOGRAMMETRY','songxiu-hill-pavilion','FC-4B9C091388','FITTED_ROCK_HILL_SQUARE_PAVILION_AND_EAST_SIDE_ACCESS','FOUR_CORNER_POINTED_GREEN_WITH_YELLOW_EDGES','xiefang-hill-pavilion','FC-AA65E64A96','WHITE_STONE_BENCH_BALUSTRADE','xuhui-gallery','FC-90734D8F6D','TEXT_AND_PLAN_GUIDED_THREE_BAY_SHELL_EAST_SOUTH_GALLERIES_AND_SHORT_SOUTH_CLIMBING_LINK','SOUTH_GALLERY_LOCAL_ONLY','YELLOW_GREEN_EDGE_ROLLED_HIP_GABLE','guhua-rolled-hip-gable','TEXT_GUIDED_ROOF_FORM_WITH_LOCAL_PHOTO_PALETTE_FIT','FC-A1EA21A7C3','xuanshou-south-front','FC-73284DA281','PARTIAL_YELLOW_EAVE_NEUTRAL_COVER_FIT_NOT_CONFIRMED_TAXONOMY','fuyi-three-bay','FC-6C96E715D3','xihua-north-watch-house','FC-47E803E147','FC-3C56B72795','FC-20D1EE8FAB','yangxin-yanxi-rear-ear','FC-9A513A5499','yellow-continuous-rolled-cover-fit','zhongzheng-main-hall','FC-66378DAD81','continuous-thick-composite-roof-fit','danyuan-eleven-bay-hall','FC-87A0A561ED','淡远楼','seven-bay whole-building substitution or invented Buddhist interiors/statues/inscriptions','chenghuang-glazed-entry','FC-B3FB517883','城隍庙入口琉璃门·有限拟合','ONE_CLOSED_GLAZED_WALL_ENTRY_AND_SHORT_SELF_OWNED_CHEEKS_ONLY','r165_chenghuang_',\"west-six/items/3/south-eave-beam\",\"FC-784C20C066\",\"FITTED_SOUTH_EAVE_BEAM_ONLY\",\"ORIGINAL_GENERATOR_SOURCE_CHAIN_CONFIRMED_NOT_PHYSICAL_SURVEY\",\"MODEL_FIT_NOT_SURVEY\",\"dailou-five-bay-waiting-house\",\"FC-418DFCE4F5\",\"奏事待漏值所·五间房有限外观\",\"ONE_CLOSED_EAST_WAITING_HOUSE_AND_LOW_FRONT_PORCH_ONLY\",\"r165_dailou_\"])assert.ok(js.includes(token),token);const missing=(await fetch(origin+base+'__missing__.js')).status,wrong=(await fetch(origin+'/assets/__missing__.js')).status;assert.equal(missing,404);assert.equal(wrong,404);const result={verifiedAtUTC:new Date().toISOString(),passed:true,scope:'Local HTTP real Pages base, all asset status/MIME/hash; not remote deployment/browser/GPU',build:built,identity:{actualLocalCommit:git(['rev-parse','HEAD']),buildSourceCommit:expectedCommit,completeTree:git(['rev-parse','HEAD^{tree}']),remoteCommitIdentityNotSubstituted:true},files:files.length,totalBytes,root:200,missing,wrongBase:wrong,entryAssets,textureFiles:rows.filter(r=>r.path.startsWith('textures/')).length,manifest:rows};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\\n');console.log('R165_PAGES_HTTP_JSON '+JSON.stringify(result));}finally{await new Promise(ok=>server.close(ok));}\n";
const commands=[
  // Runner-local npm pin only: never alter project dependency declarations or lockfiles.
  {name:'npm-toolchain-pin',command:'npm',args:['install','--global','npm@11.9.0','--no-audit','--no-fund'],category:'setup'},
  {name:'npm-toolchain-verify',command:process.execPath,args:['--input-type=module','-e',
    "import assert from 'node:assert/strict';import{execFileSync}from'node:child_process';const npm=execFileSync('npm',['--version'],{encoding:'utf8'}).trim();console.log(JSON.stringify({node:process.version,npm}));assert.equal(process.version,'v24.22.1');assert.equal(npm,'11.9.0');"],category:'setup'},
  {name:'locked-dependencies',command:'npm',args:['ci','--no-audit','--no-fund'],category:'setup'},
  test('bounded-430',bounded,'formal-bounded',
    {DAILOU_EVIDENCE_DIR:path.join(evidence,'dailou-native','bounded-430')}),
  test('actual-ningshou',[heavy.find(p=>p.includes('r165-xuhui-gallery/'))],'formal-heavy',
    {XUHUI_EVIDENCE_DIR:path.join(evidence,'actual-ningshou')}),
  test('actual-west-six',[heavy.find(p=>p.includes('r165-chongjing-allocation/'))],'formal-heavy',
    {CHONGJING_ALLOCATION_EVIDENCE_DIR:path.join(evidence,'actual-west-six')}),
  test('actual-outer-west',[heavy.find(p=>p.includes('r165-xuanshou-south-front/'))],'formal-heavy',
    {XUANSHOU_EVIDENCE_DIR:path.join(evidence,'actual-outer-west')}),
  test('actual-yangxin-west-six',[heavy.find(p=>p.includes('r165-yangxin-companions/'))],'formal-heavy',
    {YANGXIN_COMPANION_EVIDENCE_DIR:path.join(evidence,'actual-yangxin-west-six')}),
  test('actual-axis',[heavy.find(p=>p.includes('r165-dailou-waiting-house/'))],'formal-heavy',
    {DAILOU_EVIDENCE_DIR:path.join(evidence,'dailou-native','actual-axis')}),
  test('r48-full-outer-west-mock-extra',['--test-name-pattern=^R48 complete outer-west final merged geometry is finite and every real vertex stays inside the flight envelope$',
    'tests/r48-zone-flight-envelope.test.mjs'],'heavy-extra'),
  test('r48-full-outer-west-production-extra',['--test-name-pattern=^R48 complete outer-west final merged geometry is finite and every real vertex stays inside the flight envelope with production TextureLibrary$',
    'tests/r48-zone-flight-envelope.test.mjs'],'heavy-extra'),
  test('r48-full-west-six-mock-extra',['--test-name-pattern=^R48 complete west-six final merged geometry is finite and every real vertex stays inside the flight envelope$',
    'tests/r48-zone-flight-envelope.test.mjs'],'heavy-extra'),
  test('r48-full-west-six-production-extra',['--test-name-pattern=^R48 complete west-six final merged geometry is finite and every real vertex stays inside the flight envelope with production TextureLibrary$',
    'tests/r48-zone-flight-envelope.test.mjs'],'heavy-extra'),
  test('r42-component-extra-3',['--test-name-pattern=^R42 (?:Guhua dispatches one open navigation region without generic opaque walls or furnishings|actual registered front/back openings and central sightline stay unobstructed|malformed or transplanted pavilion profiles fail before changing shell state)$',
    'tests/r42-guhua-pavilion.test.mjs']),
  test('r42-history-status-extra-2',['--test-name-pattern=^R42 (?:independent original R41 roof/platform hash remains exact after verified unique Guhua roof substitution|Guhua live public status says partial restoration reference, fitted gallery, text-guided local-palette roof and unknown visit access)$',
    'tests/r42-independent-pavilion.test.mjs','tests/r42-fidelity-navigation.test.mjs']),
  test('r42-full-ningshou-10hz-extra',['--test-name-pattern=^R42 actual full-zone Guhua front/back and surrounding gallery repeated at10Hz$',
    'tests/r42-guhua-pavilion.test.mjs']),
  test('r42-full-ningshou-60hz-extra',['--test-name-pattern=^R42 actual full-zone Guhua front/back and surrounding gallery repeated at60Hz$',
    'tests/r42-guhua-pavilion.test.mjs']),
  test('r139-guhua-frozen-extra-5',['--test-name-pattern=^(?:Guhua |frozen R138 fixtures are pinned, not regenerated from candidate$)',
    'tests/r139/details.test.mjs']),
  {name:'production-vite-build',command:process.execPath,
    args:['--max-old-space-size=768','--max-semi-space-size=16','node_modules/vite/bin/vite.js','build'],
    category:'build',env:{VITE_BASE:base,NODE_OPTIONS:'--max-old-space-size=768 --max-semi-space-size=16',GOMAXPROCS:'2',GOMEMLIMIT:'192MiB'}},
  {name:'production-pages-http',command:process.execPath,args:['--input-type=module','-e',httpVerifier],category:'http-verification'},
  {name:'build-identity-and-clean-source',command:process.execPath,args:['--input-type=module','-e',
    "import fs from 'node:fs';import assert from 'node:assert/strict';import{execFileSync}from'node:child_process';import{verifyBuildSource,sourceFingerprint}from'./scripts/build-identity.mjs';const built=verifyBuildSource({expectedBase:'/forbidden-city-3d/'});assert.equal(built.sourceCommit,process.env.GITHUB_SHA);assert.equal(built.sourceDirty,false);assert.equal(sourceFingerprint(process.cwd()),'25fcf75c7ad25bf915ad063b1501109852483bef6b10eebbe5dc1cdb02d1b780');assert.equal(execFileSync('git',['status','--porcelain','--untracked-files=all'],{encoding:'utf8'}).trim(),'');fs.writeFileSync(process.env.EVIDENCE_DIR+'/build-identity-verified.json',JSON.stringify(built,null,2)+'\\n');console.log(JSON.stringify(built));"],category:'build-verification'},
];
const uiRoot=process.env.UI_WORK_ROOT;
const added=(name,command,args,timeoutSeconds,extra={})=>({name,command,args,timeoutSeconds,category:'setup',...extra});
commands.splice(3,0,
  added('bilingual-ui-toolchain',process.execPath,['scripts/ci/bilingual-ui/preflight.mjs','--inputs',docs+'UI-INPUTS.json','--work-root',uiRoot],120),
  added('bilingual-ci-tool-contracts',process.execPath,['--test','--test-reporter=tap','--test-concurrency=1','scripts/ci/bilingual-ui/tools.test.mjs','scripts/ci/bilingual-ui/oracles.test.mjs','scripts/ci/bilingual-ui/startup.test.mjs','scripts/ci/bilingual-ui/fonts.test.mjs','scripts/ci/bilingual-wrapper.test.mjs'],60,{tapRequired:true,expectedTests:115}),
  added('bilingual-ui-monitor-contract','python3',['scripts/ci/bilingual-ui/monitor.test.py','--receipt',path.join(uiRoot,'receipts/monitor-contract.json')],60)
);
const buildIndex=commands.findIndex(spec=>spec.category==='build');
commands.splice(buildIndex,0,
  {...test('bilingual-bounded-18',bilingualBounded,'bilingual-bounded'),timeoutSeconds:120,tapRequired:true,expectedTests:75},
  {...test('bilingual-retained-ui-catalog-5',retainedUi,'bilingual-retained'),timeoutSeconds:120,tapRequired:true,expectedTests:58},
  {...test('e46-scroll-bounded-10',e46Bounded,'e46-bounded'),timeoutSeconds:120,tapRequired:true,expectedTests:48},
  ...['garden','outer-east','outer-west','west-six'].map(zone=>({name:'bilingual-map-'+zone,command:process.execPath,args:['--expose-gc','--max-old-space-size=3072','--max-semi-space-size=16','--test','--test-reporter=tap','--test-concurrency=1','tests/bilingual/runtime-map.production.mjs'],category:'bilingual-heavy',timeoutSeconds:300,tapRequired:true,expectedTests:1,freshEvidence:true,env:{BILINGUAL_MAP_ZONE:zone,BILINGUAL_MAP_EVIDENCE_DIR:path.join(evidence,'bilingual-map',zone)}})),
  {name:'bilingual-map-and-native-evidence',command:process.execPath,args:['scripts/ci/bilingual-evidence.mjs'],category:'bilingual-evidence',timeoutSeconds:60}
);
commands.splice(commands.findIndex(spec=>spec.category==='build'),0,
  added('bilingual-ui-components','python3',['scripts/ci/bilingual-ui/run-browser.py','--inputs',docs+'UI-INPUTS.json','--work-root',uiRoot],600),
  added('bilingual-ui-evidence',process.execPath,['scripts/ci/bilingual-ui/verify-evidence.mjs','--root',path.join(uiRoot,'receipts'),'--expected-head',process.env.GITHUB_SHA],60)
);
for(const spec of commands) {
  for(const dir of Object.values(spec.env??{}))
    if(dir.startsWith(evidence+path.sep)){if(spec.freshEvidence)assert.ok(!fs.existsSync(dir),'Fresh per-zone evidence required');fs.mkdirSync(dir,{recursive:true});}
  const expectedTests=spec.expectedTests??{'bounded-430':1435,'actual-axis':1,'actual-ningshou':1,'actual-west-six':1,'actual-outer-west':1,'actual-yangxin-west-six':1,'r48-full-west-six-mock-extra':1,'r48-full-west-six-production-extra':1,'r48-full-outer-west-mock-extra':1,'r48-full-outer-west-production-extra':1,'r42-component-extra-3':3,'r42-history-status-extra-2':2,
    'r42-full-ningshou-10hz-extra':1,'r42-full-ningshou-60hz-extra':1,'r139-guhua-frozen-extra-5':5}[spec.name];
  state.commands.push({...spec,fileCount:spec.args.filter(a=>a.startsWith('tests/')&&a.endsWith('.test.mjs')).length,expectedTests,status:'not_run'});
}
write('results.json',state);
let setupFailed=process.env.FONT_PREPARATION_OUTCOME!=='success';
state.fontPreparationOutcome=process.env.FONT_PREPARATION_OUTCOME??'unknown';
for(const receipt of state.commands) {
  if(setupFailed) {receipt.reason='A required setup or font preparation step failed or was unavailable; dependent checks were not run.';continue;}
  receipt.status='running';receipt.startedAt=new Date().toISOString();
  receipt.log=receipt.name+'.log';write('results.json',state);
  console.log('\nCOMMAND '+JSON.stringify({command:receipt.command,args:receipt.args,env:receipt.env??{}}));
  const log=fs.createWriteStream(path.join(evidence,receipt.log));
  log.write('COMMAND '+JSON.stringify({command:receipt.command,args:receipt.args,env:receipt.env??{}})+'\n');
  const start=performance.now();
  const result=receipt.timeoutSeconds?await runWithDeadline(receipt,chunk=>{log.write(chunk);process.stdout.write(chunk);}):await new Promise(resolve=>{
    const child=spawn(receipt.command,receipt.args,{env:{...process.env,...receipt.env},
      stdio:['ignore','pipe','pipe']});
    let spawnError;
    child.stdout.on('data',chunk=>{log.write(chunk);process.stdout.write(chunk);});
    child.stderr.on('data',chunk=>{log.write(chunk);process.stderr.write(chunk);});
    child.on('error',error=>{spawnError=error.stack;log.write(error.stack+'\n');console.error(error);});
    child.on('close',(code,signal)=>resolve({code,signal,error:spawnError}));
  });
  await new Promise(resolve=>log.end(resolve));
  Object.assign(receipt,result,{status:result.code===0&&!result.signal&&!result.error&&!result.timedOut?'passed':'failed',
    durationMs:Math.round(performance.now()-start),completedAt:new Date().toISOString()});
  if(receipt.fileCount>0||receipt.tapRequired) {
    const tap=fs.readFileSync(path.join(evidence,receipt.log),'utf8');
    receipt.tapTotals=Object.fromEntries(['tests','pass','fail','cancelled','skipped','todo'].map(key=>{
      const matches=[...tap.matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))];
      return [key,matches.length?Number(matches.at(-1)[1]):null];
    }));
    if(receipt.tapTotals.pass===null||receipt.tapTotals.fail!==0||receipt.tapTotals.cancelled!==0||receipt.tapTotals.todo!==0
      ||((receipt.category.startsWith('formal-')||receipt.tapRequired)&&receipt.tapTotals.skipped!==0)
      ||(receipt.expectedTests!==undefined&&receipt.tapTotals.pass!==receipt.expectedTests)) {
      receipt.status='failed';receipt.receiptError='Missing/inconsistent TAP totals, unexpected pending tests, or selected-case pass count mismatch.';
    }
  }
  console.log('R165_COMMAND_RESULT_JSON '+JSON.stringify(receipt));
  write('results.json',state);
  if((receipt.category==='setup'&&receipt.status!=='passed')||result.timedOut)setupFailed=true;
}
state.completedAt=new Date().toISOString();
state.status=state.commands.every(r=>r.status==='passed')?'passed':'failed';
write('results.json',state);
console.log(JSON.stringify({status:state.status,commands:state.commands.map(({name,status,code,signal})=>({name,status,code,signal}))},null,2));
if(state.status!=='passed')process.exitCode=1;
