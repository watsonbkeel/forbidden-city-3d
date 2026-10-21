import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chuxiuCourtyardGeometry } from '../../src/scene/palace/special/ChuxiuCourtyard.js';
import { continuousVisitorRoute } from './continuous-visitor-route.mjs';

/** Physical model itinerary, not a claim about today's museum visitor access.
 * Branch after Qianqing's rear veranda; descend the real Jiaotai side stair,
 * use Yuehuamen and the west long street, then the fitted Yikun side alleys.
 * Return through the opposite alley and rejoin the same central-axis position.
 */
export function connectedChuxiuVisitorRoute() {
  const west = JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json', import.meta.url), 'utf8'));
  const g = chuxiuCourtyardGeometry(west), axis = continuousVisitorRoute();
  const index = axis.points.findIndex(p => p[0] === 0 && p[1] === 327.8);
  assert.ok(index > 0, 'branch is after Qianqing rear veranda');
  const connector = [[0, 340], [12, 340], [12, 354.1], [21, 354.1], [40, 354.1],
    [40, 249.2], [65, 249.2], [65, 356.5], [94.6, 356.5], [94.6, 362]];
  const eastAlley = [[94.6, 370], [84, 370], [84, 374.05], [78.8, 374.05], [78.8, 392.5], [94, 392.5], [94, 399]];
  const courtyard = [[94, g.southZ], [g.westX, g.southZ], [g.westX, g.northZ],
    [94.8, g.northZ], [94.8, 433.5], [94.8, g.northZ], [g.eastX, g.northZ],
    [g.eastX, 423.1], [78.9, 423.1], [g.eastX, 423.1], [g.eastX, g.southZ], [94, g.southZ], [94, 399]];
  const westReturn = [[94, 392.5], [109.2, 392.5], [109.2, 374.05], [104, 374.05], [104, 370], [94.6, 370], [94.6, 362]];
  return {
    points: [...axis.points.slice(0, index + 1), ...connector, ...eastAlley, ...courtyard,
      ...westReturn, ...connector.slice(0, -1).toReversed(), ...axis.points.slice(index + 1)],
    stages: [...axis.stages.slice(0, 5), '月华门→翊坤宫侧巷→体和殿→储秀宫回廊→原路返回中轴', ...axis.stages.slice(5)],
  };
}
