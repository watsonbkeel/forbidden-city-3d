import {normalizeQingshouNavigationForEE19} from '../r164-qingshou-raised-walk/normalize-history.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const old = JSON.parse(fs.readFileSync(new URL('./frozen/profiles.27b8.json', import.meta.url))).find(p => p.key === 'xunyan').portals[0].approachPoints;
const expected = JSON.parse(fs.readFileSync(new URL('./frozen/approach.expected.json', import.meta.url)));
// Historical architecture hashes may normalize exactly this intentional metadata
// change only. Physical, material, mesh and all other metadata checks stay intact.
export function normalizeXunyanApproachFor27b8(records) {
  for (const p of records) normalizeQingshouNavigationForEE19(p);
  const found = records.filter(p => p.id === 'place-ningshou-9a08e177bc');
  assert.equal(found.length, 1, 'exactly one retained Xunyan structure');
  const p = found[0];
  assert.equal(p.key, 'xunyan'); assert.equal(p.name, '寻沿书屋');
  const lists = [p.portals[0].approachPoints, p.navigation.approachPoints,
    p.navigation.portals[0].approachPoints, p.groundNavigation.approachPoints,
    p.groundNavigation.portals[0].approachPoints];
  for (const points of lists) assert.deepEqual(points, expected, 'only the fixed five-tread approach may be normalized');
  p.portals[0].approachPoints = structuredClone(old);
  for (const nav of [p.navigation, p.groundNavigation]) {
    nav.approachPoints = p.portals[0].approachPoints;
    nav.portals[0].approachPoints = p.portals[0].approachPoints;
  }
  return records;
}
