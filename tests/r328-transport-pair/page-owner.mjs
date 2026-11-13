import assert from 'node:assert/strict';

// Private diagnostic ownership only. No navigation, retries, policy changes or
// production-loader hooks. A failed owner cannot be reused for another attempt.
export function pagePhase(role, phase) {
  assert.ok(role === 'BOUNDARY' || role === 'EXPERIMENT', 'known page role');
  return role === 'BOUNDARY' ? 'BOUNDARY' : phase;
}
export async function readNativeAdmission(page) {
  const trace = await page.evaluate(() => globalThis.__R326_NATIVE_FETCH_TRACE__?.read() ?? null);
  assert.ok(trace && Array.isArray(trace.events), 'native observer missing');
  assert.equal(trace.dropped, 0, 'native observer dropped evidence');
  return trace;
}
export function createProtectedPageOwner(context, {policy, bind, onUnexpected, onLifecycle}) {
  let current = null, admission = null, failed = false, nextId = 0;
  const identities = new WeakMap();
  const pageId = p => { if (!identities.has(p)) identities.set(p, ++nextId); return identities.get(p); };
  const inventory = expected => {
    const pages = context.pages();
    assert.equal(pages.length, expected.length, 'page inventory count mismatch');
    assert.ok(pages.every((p, i) => p === expected[i]), 'page inventory identity mismatch');
  };
  context.on('page', p => {
    if (admission) {
      admission.observed.push(p);
      onLifecycle({event: 'page-event', role: admission.role, pageId: pageId(p)});
    }
    else {
      failed = true;
      onUnexpected({event: 'extra-page', pageId: pageId(p), role: current?.role ?? 'NO_READY_PAGE'});
    }
  });
  async function cleanup(primary, observed, returned) {
    const errors = [primary];
    for (const p of new Set([...observed, returned, ...context.pages()].filter(Boolean))) {
      try {
        if (!p.isClosed()) await p.close();
        assert.equal(p.isClosed(), true, 'failed candidate not closed');
      } catch (error) { errors.push(error); }
    }
    throw errors.length === 1 ? primary : new AggregateError(errors, 'page creation and cleanup failed');
  }
  return {
    get page() { return current?.page ?? null; },
    async open(role) {
      const observed = []; let returned;
      try {
        pagePhase(role, 'BOUNDARY');
        assert.equal(failed, false, 'page owner already failed');
        assert.equal(current, null, 'retire previous page before creation');
        assert.equal(admission, null, 'concurrent page admission forbidden');
        inventory([]);
      } catch (error) { failed = true; throw error; }
      admission = {observed, role};
      try {
        try { returned = await context.newPage(); }
        finally { admission = null; }
        onLifecycle({event: 'creation-return', role, pageId: pageId(returned)});
        assert.equal(failed, false, 'unexpected page event during creation');
        assert.equal(observed.length, 1, 'exactly one page event required');
        assert.equal(observed[0], returned, 'page event/return identity mismatch');
        inventory([returned]);
        const cdp = await context.newCDPSession(returned);
        await cdp.send('Network.enable');
        await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
        await cdp.send('Network.setBypassServiceWorker', {bypass: true});
        await cdp.send('Network.setBlockedURLs', policy);
        bind(returned, cdp, role);
        assert.equal(failed, false, 'unexpected page event during protection');
        inventory([returned]);
        assert.equal(returned.isClosed(), false, 'candidate closed during protection');
        current = {page: returned, role};
        onLifecycle({event: 'ready', role, pageId: pageId(returned)});
        return returned;
      } catch (error) {
        admission = null; failed = true; current = null;
        return cleanup(error, observed, returned);
      }
    },
    async retire() {
      try {
        assert.equal(failed, false, 'unexpected page or prior owner failure');
        assert.ok(current, 'no ready page to retire');
        assert.equal(admission, null, 'creation still pending');
        const {page, role} = current;
        inventory([page]);
        assert.equal(page.isClosed(), false, 'page closed unexpectedly before retirement');
        await page.close();
        assert.equal(page.isClosed(), true, 'retired page not closed');
        inventory([]);
        assert.equal(failed, false, 'unexpected page during retirement');
        current = null;
        onLifecycle({event: 'retired', role, pageId: pageId(page)});
      } catch (error) { failed = true; throw error; }
    }
  };
}
