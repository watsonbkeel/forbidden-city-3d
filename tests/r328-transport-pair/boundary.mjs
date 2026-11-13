import assert from 'node:assert/strict';
export function exactPattern(value){
 assert.equal(typeof value,'string');const u=new URL(value);
 assert.ok(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port&&!u.username&&!u.password&&!u.search&&!u.hash);
 assert.equal(u.href,value);assert.match(u.pathname,/^\/[A-Za-z0-9_.\/-]+$/);
 return `http://:@127.0.0.1:${u.port}${u.pathname}?#`;
}
export function blockedURLConfig(urls){assert.ok(Array.isArray(urls)&&urls.length>0&&urls.length<=32);assert.deepEqual(urls,[...new Set(urls)].sort());const origin=new URL(urls[0]).origin;assert.ok(urls.every(u=>new URL(u).origin===origin));const port=new URL(origin).port;const blob=`blob:{http\\://127.0.0.1\\:${port}/}:id#`;return{urlPatterns:[...urls.map(u=>({urlPattern:exactPattern(u),block:false})),{urlPattern:blob,block:false}],urls:['*']};}
export const CSP="default-src 'none'; script-src 'self'; connect-src 'self'; img-src blob:; style-src 'none'; worker-src 'none'; frame-src 'none'; child-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; sandbox allow-scripts allow-same-origin";
