import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
for (const [directory, base] of [['dist-r88-clean','/'],['dist-r88-gugong-clean','/gugong/']]) {
 test(`R88 ${base} actual production HTTP pages, assets and links`,async t=>{
  const root=path.resolve(directory);
  const server=http.createServer((req,res)=>{
   const pathname=new URL(req.url,'http://localhost').pathname;
   if (!pathname.startsWith(base)) {res.writeHead(404).end();return;}
   const relative=decodeURIComponent(pathname.slice(base.length))||'index.html';
   const file=path.resolve(root,relative);
   if (!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
   const type={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.xml':'application/xml','.txt':'text/plain'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'content-type':type});res.end(fs.readFileSync(file));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const name of ['','about.html','contribute.html']){
   const url=origin+base+name,response=await fetch(url);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);
   const html=await response.text();assert.match(html,/陈华山/);assert.match(html,/陈诺/);
   assert.match(html,name?/独立|项目/:/非官方/);
   for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const link=new URL(match[1],url);if(link.origin!==origin)continue;
    const r=await fetch(link);assert.equal(r.status,200,link.href);
    if(link.pathname.endsWith('.js'))assert.match(r.headers.get('content-type'),/javascript/);
   }
  }
  const info=await (await fetch(origin+base+'build-info.json')).json();assert.equal(info.release,'R88');assert.equal(info.base,base);assert.match(info.buildId,/^R88-/);
  for(const name of ['sitemap.xml','llms.txt'])assert.equal((await fetch(origin+base+name)).status,200);
  assert.equal((await fetch(origin+base+'not-a-real-page.html')).status,404,'no SPA fallback hiding missing static pages');
  assert.equal((await fetch(origin+base+'robots.txt')).status,404,'no ineffective subpath robots policy');
 });
}
