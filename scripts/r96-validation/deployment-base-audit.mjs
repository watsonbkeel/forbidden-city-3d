// Read-only source/artifact audit. Does not build, deploy, or edit the product tree.
// node deployment-base-audit.mjs SOURCE_ROOT DIST BASE RELEASE [EXPECTED_BUILD_SOURCE_COMMIT]
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const [rootArg,distArg,base,release,expectedCommit]=process.argv.slice(2);
assert.ok(rootArg&&distArg&&base&&release,'SOURCE_ROOT DIST BASE RELEASE [EXPECTED_BUILD_SOURCE_COMMIT] required');
const root=path.resolve(rootArg),dist=path.resolve(distArg);
const {verifyBuildSource,normalizeBase}=await import(pathToFileURL(path.join(root,'scripts/build-identity.mjs')));
normalizeBase(base);
const info=verifyBuildSource({root,dist,expectedBase:base});
assert.equal(info.base,base);assert.equal(info.release,release);assert.equal(info.sourceDirty,false,'artifact must be built from clean runtime/build inputs');
assert.match(info.sourceCommit,/^[a-f0-9]{40}$/);if(expectedCommit)assert.equal(info.sourceCommit,expectedCommit);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.match(read('vite.config.js'),/base:\s*process\.env\.VITE_BASE\s*\|\|\s*['"]\/gugong\/['"]/);
assert.match(read('.github/workflows/deploy-pages.yml'),/VITE_BASE:\s*\/forbidden-city-3d\//);
assert.match(read('main.js'),/import\.meta\.env\?\.BASE_URL/);
assert.match(read('main.js'),/new InteriorLoader\([^;]*\bbase\s*\}/);
const loader=read('src/scene/interior/InteriorLoader.js');
for(const expression of ['`${base}/draco/`','`${base}/basis/`','`${this.base}${h.cfg.model}`'])assert.ok(loader.includes(expression),`review changed resource resolver: ${expression}`);
for(const f of ['src/utils/TextureLibrary.js','src/scene/zones/ZoneBase.js','src/scene/palace/QianqingScreenPaint.js','src/scene/palace/QianqingFriezePaint.js','src/scene/palace/QianqingCeilingPaint.js'])assert.ok(read(f).includes('BASE_URL'),f);
function files(dir,rel=''){return fs.readdirSync(path.join(dir,rel),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?files(dir,path.posix.join(rel,e.name)):e.isFile()?[path.posix.join(rel,e.name)]:(()=>{throw Error('Non-regular artifact '+e.name)})());}
const all=files(dist),pub=files(path.join(root,'public'));assert.ok(all.length>0);
for(const f of pub)assert.deepEqual(fs.readFileSync(path.join(dist,f)),fs.readFileSync(path.join(root,'public',f)),`copied public bytes: ${f}`);
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.glb':'model/gltf-binary','.wasm':'application/wasm','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');if(!u.pathname.startsWith(base)){res.writeHead(404).end();return;}let rel;try{rel=decodeURIComponent(u.pathname.slice(base.length))||'index.html';}catch{res.writeHead(400).end();return;}const file=path.resolve(dist,rel);if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'content-type':types[path.extname(file)]??'application/octet-stream'});res.end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;let references=0,glb=0;
async function get(url){const r=await fetch(url);assert.equal(r.status,200,url);return r;}
async function reference(raw,from){if(/^(data:|#|mailto:|javascript:)/.test(raw))return;const u=new URL(raw,from);if(u.origin!==origin)return;assert.ok(u.pathname.startsWith(base),`same-origin reference escapes ${base}: ${u.href}`);await get(u.href);references++;}
try{
 for(const f of all){const r=await get(origin+base+f);const bytes=Buffer.from(await r.arrayBuffer());assert.deepEqual(bytes,fs.readFileSync(path.join(dist,f)),f);const ext=path.extname(f);if(types[ext])assert.ok(r.headers.get('content-type').startsWith(types[ext]),f);if(ext==='.glb'){assert.equal(bytes.subarray(0,4).toString(),'glTF',f);glb++;}}
 for(const name of ['','about.html','contribute.html']){const url=origin+base+name,html=await(await get(url)).text();for(const author of ['陈华山','陈诺'])assert.ok(html.includes(author),name+' '+author);for(const m of html.matchAll(/(?:href|src)=["']([^"']+)["']/g))await reference(m[1],url);}
 for(const f of all.filter(f=>f.endsWith('.css'))){const css=fs.readFileSync(path.join(dist,f),'utf8');for(const m of css.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g))await reference(m[1],origin+base+f);}
 // Check static/dynamic relative JS chunks, without pretending to execute the app.
 for(const f of all.filter(f=>f.endsWith('.js'))){const js=fs.readFileSync(path.join(dist,f),'utf8');for(const m of js.matchAll(/(?:from\s*|import\s*\(?\s*)["'](\.[^"']+\.js)["']/g))await reference(m[1],origin+base+f);}
 const registered=[];for(const f of files(path.join(root,'data/interiors')).filter(f=>f.endsWith('.json'))){const cfg=JSON.parse(fs.readFileSync(path.join(root,'data/interiors',f),'utf8'));if(!cfg.model)continue;assert.match(cfg.model,/^\/models\//);const url=origin+base.slice(0,-1)+cfg.model;await get(url);registered.push({id:cfg.id,model:cfg.model,urlPath:new URL(url).pathname});}
 for(const dir of ['draco','basis']){const assets=all.filter(f=>f.startsWith(dir+'/'));assert.ok(assets.length>0,dir+' decoder artifacts');}
 for(const name of ['sitemap.xml','llms.txt','build-info.json'])await get(origin+base+name);
 assert.equal((await fetch(origin+base+'not-a-real-page.html')).status,404);
 if(base!=='/'){for(const url of [origin+'/assets/not-real.js',origin+'/models/interiors/no.glb',origin+'/'])assert.equal((await fetch(url)).status,404,'no root fallback');}
 assert.equal((await fetch(origin+base+'robots.txt')).status,404,'no ineffective project-subpath robots');
 console.log(JSON.stringify({status:'PASS',scope:'Read-only actual artifact bytes, same-base loopback HTTP, static resolver guards. No browser/GPU, live Pages headers, deployment or final release acceptance.',root,dist,base,build:info,artifactFiles:all.length,publicFiles:pub.length,glbFiles:glb,htmlCssChunkReferences:references,interiorModels:registered,canonicalPolicy:'External canonical/og/sitemap tour.bkeel.com/gugong URLs are intentionally not same-origin asset requests.',workflowNode:'20; this run only proves the executing local Node environment',executingNode:process.version},null,2));
}finally{await new Promise(r=>server.close(r));}
