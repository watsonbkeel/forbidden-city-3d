import assert from 'node:assert/strict';

// Browser-side Document Request admission only. Not PNG interception and not a
// claim that installing Fetch has zero scheduling effect. Owning page/context
// closes this session; never disable while requests may remain paused.
export async function installDocumentGuard(cdp, {mode, role, pageId, allowedURLs, pngURLs, onEvidence, onFailure}) {
  assert.ok(mode === 'fetch-route' || mode === 'native-block-patterns', 'known transport arm');
  if (mode === 'fetch-route') return null; // Playwright owns that arm's Fetch domain.
  assert.ok(role === 'BOUNDARY' || role === 'EXPERIMENT', 'known lexical role');
  assert.ok(Number.isInteger(pageId) && pageId > 0, 'known page identity');
  assert.ok(Array.isArray(allowedURLs) && allowedURLs.length > 0, 'exact URL set required');
  const allowed = new Set(allowedURLs);
  assert.ok(Array.isArray(pngURLs) && pngURLs.every(url => allowed.has(url)), 'exact PNG URLs required');
  const png = new Set(pngURLs);
  for (const url of allowed) assert.equal(new URL(url).href, url, 'canonical allowlist URL');
  const seen = new Set(), pending = new Set(), failures = [];
  let nonDocumentPaused = 0, pngPaused = 0, continued = 0, denied = 0, failed = false, overflow = false;
  const record = row => onEvidence({role, pageId, ...row});
  function failure(error) {
    failed = true;
    if (failures.length < 16) failures.push(error instanceof Error ? error : new Error(String(error)));
    try { onFailure({role, pageId, error: String(error)}); }
    catch (callbackError) { if (failures.length < 16) failures.push(callbackError); }
  }
  async function handle(event) {
    const id = event?.requestId;
    assert.ok(typeof id === 'string' && id.length > 0 && id.length <= 256, 'valid requestId required');
    assert.equal(seen.has(id), false, 'duplicate paused requestId');
    assert.ok(seen.size < 256, 'bounded Document events exceeded');
    seen.add(id);
    const row = {requestId: id, networkId: event.networkId ?? null, redirectedRequestId: event.redirectedRequestId ?? null,
      frameId: event.frameId ?? null, url: event.request?.url ?? null, resourceType: event.resourceType,
      stage: event.responseStatusCode !== undefined || event.responseErrorReason !== undefined || event.responseHeaders !== undefined ? 'Response' : 'Request'};
    record({event: 'request-paused', ...row});
    let invalid = null;
    if (event.resourceType !== 'Document') { nonDocumentPaused++; invalid = 'only Document may pause'; }
    else if (row.stage !== 'Request') invalid = 'only Request stage allowed';
    else if (event.request?.method !== 'GET') invalid = 'only expected GET Document allowed';
    let canonical = null;
    try { assert.ok(typeof row.url === 'string' && row.url.length <= 8192, 'bounded URL required'); canonical = new URL(row.url).href; }
    catch { invalid ??= 'invalid document URL'; }
    if (png.has(canonical)) { pngPaused++; invalid ??= 'PNG must never pause'; }
    if (invalid) failure(new Error(invalid));
    const decision = !invalid && allowed.has(canonical) ? 'CONTINUE' : 'DENY';
    record({event: 'command-start', ...row, decision});
    try {
      if (decision === 'CONTINUE') await cdp.send('Fetch.continueRequest', {requestId: id});
      else await cdp.send('Fetch.failRequest', {requestId: id, errorReason: 'BlockedByClient'});
    } catch (error) { record({event: 'command-error', ...row, decision, error: String(error)}); throw error; }
    if (decision === 'CONTINUE') continued++; else denied++;
    record({event: 'command-ack', ...row, decision});
  }
  cdp.on('Fetch.requestPaused', event => {
    // Capture every async rejection. No retry, default continue, fulfillment or
    // detached rejected callback. Actual health waits for all admitted commands.
    if (seen.size >= 256) {
      if (!overflow) { overflow = true; failure(new Error('bounded Document events exceeded')); }
      return; // Remain paused/fail closed, never allocate an unbounded task queue.
    }
    const task = handle(event).catch(failure).finally(() => pending.delete(task));
    pending.add(task);
  });
  await cdp.send('Fetch.enable', {patterns: [{urlPattern: '*', resourceType: 'Document', requestStage: 'Request'}], handleAuthRequests: false});
  record({event: 'enabled', selector: 'Document/Request'});
  return {
    async settled() {
      while (pending.size) await Promise.all([...pending]);
      if (failed) throw new AggregateError(failures, failures.map(e => e.message).join('; '));
      assert.equal(nonDocumentPaused, 0, 'non-Document must never pause');
      assert.equal(pngPaused, 0, 'PNG must never pause');
    },
    snapshot() { return {role, pageId, seen: seen.size, pending: pending.size, continued, denied, nonDocumentPaused, pngPaused, failed, overflow, failures: failures.map(e => String(e))}; }
  };
}
