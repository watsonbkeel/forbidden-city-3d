import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

/** Join the established geometry-derived routes without ever resetting the
 * controller between their old test boundaries. Retain physical stair contacts.
 * Only omit the old Qianqingmen segment-end backtrack: it points south onto the
 * carved axial apron after already climbing the real side stair. It is not a
 * visitor destination and is not a valid connector at every input cadence.
 */
export function continuousVisitorRoute({ allBridges = false, bridgeLane = 0 } = {}) {
  const rows = execFileSync(process.execPath,
    [new URL('../stepwalk.cjs', import.meta.url).pathname, '60', '0', 'axis'],
    { env: { ...process.env, DUMP: '1' }, encoding: 'utf8' })
    .trim().split('\n').slice(0, 7).map(line => {
      const start = line.indexOf('[[');
      return { name: line.slice(0, start).trim(), points: JSON.parse(line.slice(start)) };
    });
  assert.deepEqual(rows.map(r => r.name), [
    '午门→太和门', '太和门→太和殿内', '太和殿→中和殿→保和殿',
    '保和殿→北下台→乾清门', '乾清门→乾清宫', '乾清宫→交泰殿→坤宁宫',
    '坤宁宫→御花园→神武门',
  ]);
  // The legacy segment ends at z=5, now inside the translated R34 dais.
  // Use an ordinary floor viewpoint one metre before the actual stair toe;
  // retain every subsequent lateral aisle, collision and support assertion.
  const taihe = JSON.parse(fs.readFileSync(new URL('../../data/architecture/taihe-core.json', import.meta.url), 'utf8'));
  const viewingZ = taihe.dais.z0 - taihe.dais.steps * taihe.dais.stepRun - 1;
  assert.deepEqual(rows[1].points.at(-1), [0, 5]);
  assert.deepEqual(rows[2].points[0], [0, 3]);
  rows[1].points[rows[1].points.length - 1] = [0, viewingZ];
  rows[2].points[0] = [0, viewingZ];
  const oldApron = rows[3].points.pop();
  assert.deepEqual(rows[4].points.shift(), oldApron);
  // The route now continues north directly from the real gate landing. No
  // collider, support, speed, reach threshold or step tolerance is changed.
  if (allBridges) {
    const start = rows[0].points[0];
    // Replace only the bridge approach, not the source-derived Taihemen
    // stair contacts that follow it. Fail rather than silently dropping any
    // future canonical waypoint south of the bridge-north handoff.
    const continuation = rows[0].points.slice(1);
    assert.ok(continuation.every(([, z]) => z >= -280));
    const bridgeXs = [-30, -13, 0, 13, 30];
    const detour = [start, [0, -340]];
    let z = -340;
    for (const x of bridgeXs) {
      detour.push([x + bridgeLane, z]);
      z = z === -340 ? -280 : -340;
      detour.push([x + bridgeLane, z]);
    }
    rows[0].points = [...detour, [0, -280], ...continuation];
  }
  const points = [];
  for (const row of rows) for (const p of row.points) {
    if (!points.length || p[0] !== points.at(-1)[0] || p[1] !== points.at(-1)[1]) points.push(p);
  }
  return { points, stages: rows.map(r => r.name), omittedArtificialApron: oldApron };
}
