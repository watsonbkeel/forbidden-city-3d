/** Import from the integrator's node:test after its ONE actual candidate world
 * build. This module deliberately has no auto-run or world-builder import. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { buildSouthernRouteFixtures, runSouthernRoute, verifySouthernMapArrivals } from '../tests/helpers/r52-southern-route-validation.mjs';

export async function validateSouthernWorld(t, W, { sourceCommit, worldState, loadedInteriorIds = [], wuyingAccess, teleport } = {}) {
  assert.match(sourceCommit ?? '', /^[0-9a-f]{40}$/, 'record the exact integrated source commit');
  const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }).trim();
  assert.equal(sourceCommit, sourceHead, 'sourceCommit must be the current checked-out candidate, not a planned commit');
  assert.ok(typeof worldState === 'string' && worldState.length > 0, 'describe the actual loaded world state');
  assert.equal(typeof wuyingAccess, 'function', 'R52 requires actual exported wuyingMoonTerraceAccess, not stale ground hints');
  assert.ok(teleport?.resolveLanding, 'inject the production Teleport instance for this actual world');
  assert.equal(teleport.collisionManager, W.cm, 'Teleport and walking must use the same actual collision world');
  const fixtures = buildSouthernRouteFixtures({ zones: W.zones, taiheSouthTiers: W.taiheSouthTiers, wuyingAccess });
  const report = { sourceCommit, sourceHead, worldState, loadedInteriorIds, platform: 'CPU_REAL_CONTROLLER_AND_PRODUCTION_RESOLVER_ONLY',
    testedAt: new Date().toISOString(), limits: ['Not a WebGL/GPU render or frame-time result.', 'Not real browser or physical phone acceptance.', 'All-zone resident geometry does not establish streamed unload/reload safety.', 'No character population/count acceptance is inferred from these routes.'],
    sourceHashes: {}, routes: [], arrivals: [], fixtures };
  for (const path of ['src/controls/FirstPerson.js', 'src/utils/Collision.js', 'src/ui/Teleport.js',
    'src/scene/palace/special/WuyingMoonTerrace.js', 'src/scene/palace/special/SouthCourtHalls.js',
    'src/scene/palace/special/RemainingOuterHalls.js', 'tests/lib/world.mjs', 'tests/lib/auto-routes.mjs', 'tests/stepwalk.cjs',
    'tests/helpers/r52-southern-route-validation.mjs']) {
    const url = new URL('../' + path, import.meta.url);
    if (existsSync(url)) report.sourceHashes[path] = createHash('sha256').update(readFileSync(url)).digest('hex');
  }
  report.workingTreeStatus = execFileSync('git', ['status', '--short'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }).trim();
  for (const route of fixtures) for (const fps of [10, 60]) for (const sprint of [false, true]) {
    await t.test(`${worldState}: ${route.id}, ${fps} Hz, sprint=${sprint}`, child => {
      try { report.routes.push(runSouthernRoute(child, W, route, { fps, sprint })); }
      catch (error) { report.routes.push({ id: route.id, fps, sprint, pass: false, error: String(error) }); throw error; }
    });
  }
  for (const name of ['太和殿', '文华殿', '主敬殿', '武英殿', '敬思殿']) {
    await t.test(`${worldState}: actual map arrival ${name}`, () => {
      try { report.arrivals.push(...verifySouthernMapArrivals(W, teleport, [name])); }
      catch (error) { report.arrivals.push({ name, pass: false, error: String(error) }); throw error; }
    });
  }
  report.pass = report.routes.length === 24 && report.arrivals.length === 5 && [...report.routes, ...report.arrivals].every(r => r.pass === true);
  return report;
}
