import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createDOM } from './lib/ui-dom.mjs';

const modulePath = new URL('../src/ui/ReleaseIdentityPanel.js', import.meta.url);
const ui = existsSync(modulePath) ? await import(modulePath) : {};
const current = { schema: 1, release: 'R52', buildId: 'R52-123456789abc', sourceFingerprint: 'a'.repeat(64), sourceCommit: 'b'.repeat(40), sourceDirty: false, base: '/forbidden-city-3d/' };
const different = { ...current, buildId: 'R52-fedcba987654', sourceFingerprint: 'c'.repeat(64) };
const tick = () => new Promise(resolve => setImmediate(resolve));
function setup(t, { fetcher = async () => ({ok:true,json:async()=>current}), writeText = async () => {}, getCharacterStatus = () => ({}), htmlBuildId } = {}) {
  assert.equal(typeof ui.ReleaseIdentityPanel, 'function', 'release identity UI exists');
  const dom = createDOM();
  dom.document.head=dom.document.createElement('head');
  if(htmlBuildId){const meta=dom.document.createElement('meta');meta.setAttribute('name','palace-build-id');meta.setAttribute('content',htmlBuildId);dom.document.head.appendChild(meta);}
  dom.document.querySelector=selector=>dom.document.head.querySelector(selector)??dom.document.body.querySelector(selector);
  let reloads = 0, fetches = 0;
  const panel = new ui.ReleaseIdentityPanel({ container:dom.document.body, document:dom.document, info:current, getCharacterStatus,
    fetcher:(...args)=>{fetches++;return fetcher(...args)}, writeText, location:{origin:'https://example.com',pathname:'/forbidden-city-3d/',search:'?token=secret',hash:'#private',reload(){reloads++}} });
  t.after(()=>panel.dispose());
  return {panel, dom, get reloads(){return reloads}, get fetches(){return fetches}, button:id=>dom.document.getElementById(id)};
}

test('settings identity is visible and diagnostic copies allowlisted current counts only', async t => {
  let copied;
  const s=setup(t,{writeText:async text=>{copied=text},getCharacterStatus:()=>({registered:143,loaded:139,visible:21,pending:4,errors:2,lastError:'https://private.invalid/?token=secret'})});
  assert.match(s.button('release-current').textContent,/R52.*123456789abc/);
  assert.equal(s.fetches,0);
  s.button('release-copy-btn').click(); await tick();
  const diagnostic=JSON.parse(copied);
  assert.deepEqual(diagnostic.characters,{registered:143,ready:139,visible:21,pending:4,errors:2});
  assert.equal(diagnostic.build.buildId,current.buildId);
  assert.doesNotMatch(copied,/secret|private|lastError|location|https:/);
  assert.match(s.button('release-status').textContent,/已复制/);
});

test('version check is on-demand, same-base, bypasses cache, and never reloads itself', async t => {
  let request;
  const s=setup(t,{fetcher:async(...args)=>{request=args;return {ok:true,json:async()=>different}}});
  assert.equal(s.fetches,0); assert.equal(s.button('release-refresh-btn').hidden,true);
  s.button('release-check-btn').click(); await tick();
  assert.equal(request[0],'https://example.com/forbidden-city-3d/build-info.json');
  assert.equal(request[1].cache,'no-store'); assert.equal(request[1].credentials,'omit');
  assert.equal(request[1].redirect,'error'); assert.equal(s.reloads,0);
  assert.equal(s.button('release-refresh-btn').hidden,false);
  assert.match(s.button('release-status').textContent,/不同.*位置.*重置/);
  s.button('release-refresh-btn').click();
  assert.equal(s.reloads,1);
});

test('same build and failed or malformed checks keep refresh hidden and permit retries', async t => {
  let mode='same';
  const s=setup(t,{fetcher:async()=>{if(mode==='network')throw Error('private URL');return {ok:true,json:async()=>mode==='bad'?{...different,base:'/other/'}:current}}});
  for(const next of ['same','network','bad','same']){
    mode=next;s.button('release-check-btn').click();await tick();
    assert.equal(s.button('release-refresh-btn').hidden,true);assert.equal(s.button('release-check-btn').disabled,false);
    s.button('release-refresh-btn').click();assert.equal(s.reloads,0);
  }
  assert.equal(s.fetches,4);
});

test('overlapping clicks and disposed pending checks cannot expose refresh or reload', async t => {
  let resolve;
  const s=setup(t,{fetcher:()=>new Promise(r=>{resolve=r})});
  const refresh=s.button('release-refresh-btn'),check=s.button('release-check-btn');
  check.click();check.click();assert.equal(s.fetches,1);
  s.panel.dispose(); resolve({ok:true,json:async()=>different});await tick();
  refresh.click();assert.equal(s.reloads,0);
  assert.equal(s.dom.document.getElementById('release-identity'),null);
});

test('clipboard denial offers safe selectable diagnostics without implying successful copy', async t => {
  const s=setup(t,{writeText:async()=>{throw Error('denied')}});
  s.button('release-copy-btn').click();await tick();
  assert.match(s.button('release-status').textContent,/未能复制/);
  assert.equal(s.button('release-diagnostic-text').hidden,false);
  assert.match(s.button('release-diagnostic-text').value,/R52/);
  assert.equal(s.reloads,0);assert.equal(s.fetches,0);
});

test('release label stays at the top with diagnostic controls in a compact disclosure', t => {
  const s=setup(t);
  assert.equal(s.dom.document.body.children[0].id,'release-identity');
  const disclosure=s.button('release-copy-btn').closest('details');
  assert.ok(disclosure,'controls do not crowd normal tour settings');
  assert.equal(disclosure.open,false);
  assert.equal(s.button('release-current').closest('details'),null,'version remains visible while diagnostics are closed');
  assert.equal(s.button('release-diagnostic-text').getAttribute('tabindex'),'0','manual-copy fallback participates in dialog keyboard focus');
});


test('mixed HTML and JavaScript build identities remain visible and safely diagnosable', async t => {
  let copied;
  const s=setup(t,{htmlBuildId:different.buildId,writeText:async text=>{copied=text}});
  assert.match(s.button('release-current').textContent,/标识不一致/);
  s.button('release-copy-btn').click();await tick();
  assert.deepEqual(JSON.parse(copied).html,{buildId:different.buildId,identityMatch:'mismatch'});
  assert.match(s.button('release-current').textContent,/标识不一致/);
  const matched=setup(t,{htmlBuildId:current.buildId});
  assert.equal(JSON.parse(matched.panel.diagnostic()).html.identityMatch,'match');
  const unsafe=setup(t,{htmlBuildId:'https://private.invalid/?token=secret'});
  assert.deepEqual(JSON.parse(unsafe.panel.diagnostic()).html,{buildId:null,identityMatch:'unavailable'});
  assert.doesNotMatch(unsafe.panel.diagnostic(),/secret|private/);
});
