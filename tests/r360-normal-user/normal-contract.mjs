import assert from 'node:assert/strict';
export function exactPattern(value){
 assert.equal(typeof value,'string');const u=new URL(value);
 assert.ok(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port&&!u.username&&!u.password&&!u.search&&!u.hash);
 assert.equal(u.href,value);assert.match(u.pathname,/^\/[A-Za-z0-9_.\/-]+$/);
 return `http://:@127.0.0.1:${u.port}${u.pathname}?#`;
}
export function normalBoundary(urls){
 assert.ok(Array.isArray(urls)&&urls.length>0&&urls.length<=256);assert.deepEqual(urls,[...new Set(urls)].sort());
 const origin=new URL(urls[0]).origin;assert.ok(urls.every(u=>new URL(u).origin===origin));const port=new URL(origin).port;
 // Chromium SimpleUrlPatternMatcher: opaque :id expands to RE2-invalid [^]+?.
 // Fixed empty-tail rejection followed by builtin full wildcard preserves the
 // intended nonempty same-origin scope without custom regex or loader hooks.
 const prefix=`http\\://127.0.0.1\\:${port}/`;
 return{urlPatterns:[...urls.map(u=>({urlPattern:exactPattern(u),block:false})),
  {urlPattern:`blob:{${prefix}}#`,block:true},
  {urlPattern:`blob:{${prefix}*}#`,block:false}],urls:['*']};
}

export function assertHealthy(r){assert.ok(Array.isArray(r.cdp),'CDP history required');assert.ok(r.cdp.every(x=>['BOUNDARY','EXPERIMENT'].includes(x.pageRole)),'known lexical page role');assert.ok(!r.cdp.some(x=>x.pageRole==='EXPERIMENT'&&(x.event==='Network.loadingFailed'||x.event==='Network.responseReceived'&&x.status>=400)),'actual asset CDP failure including late/cleanup');assert.deepEqual(r.pageErrors,[]);assert.ok(!r.responses.some(x=>x.status>=400));assert.deepEqual(r.requestFailures,[]);assert.deepEqual(r.unexpected,[]);assert.ok(!r.console.some(x=>x.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(x.text)));}
export function assertNormalSequence(r){assertHealthy(r);assert.equal(r.artificialPendingAborts,0);assert.equal(r.generations.length,3);assert.equal(new Set(r.generations.map(g=>g.group)).size,3);assert.equal(r.unloads.length,2);r.generations.forEach((g,i)=>{assert.equal(g.generation,i);assert.equal(g.ready,true);assert.equal(g.routesPassed,true);assert.equal(g.frontRendered,true);assert.deepEqual(g.slots,['amitabha','shakyamuni','bhaisajyaguru']);});r.unloads.forEach((u,i)=>{assert.equal(u.generation,i);assert.equal(u.phase,'ACTIVE');assert.equal(u.disposed,true);});}
