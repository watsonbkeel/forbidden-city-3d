import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Reverse only the six finite V14 wayfinding hunks before the inherited
// collision-source guard. No fixture refresh, AST or whitespace normalization.
export const V14_WAYFINDING_COLLISION_DELTAS = Object.freeze([
  Object.freeze({
    name: 'dimension import',
    before: "import { LAYOUT, PLAYER } from '../config/constants.js';\n",
    after: "import { DIMENSIONS, LAYOUT, PLAYER } from '../config/constants.js';\n",
  }),
  Object.freeze({
    name: 'shared existing radius',
    before: 'const STEP_CLEARANCE = 0.35;\n',
    after: 'const STEP_CLEARANCE = 0.35;\n/** 与 FirstPerson 传入的既有半径一致；位置标签也沿用同一身体净空，不改变碰撞策略。 */\nconst DEFAULT_PLAYER_RADIUS = 0.5;\n',
  }),
  Object.freeze({
    name: 'checkCollision default',
    before: '  checkCollision(position, radius = 0.5) {\n',
    after: '  checkCollision(position, radius = DEFAULT_PLAYER_RADIUS) {\n',
  }),
  Object.freeze({
    name: 'checkBoundary default',
    before: '  checkBoundary(position, radius = 0.5) {\n',
    after: '  checkBoundary(position, radius = DEFAULT_PLAYER_RADIUS) {\n',
  }),
  Object.freeze({
    name: 'getValidPosition default',
    before: '  getValidPosition(currentPosition, targetPosition, radius = 0.5, feetY = null, stepUp = PLAYER.STEP_UP ?? 0.6, airFeet = null) {\n',
    after: '  getValidPosition(currentPosition, targetPosition, radius = DEFAULT_PLAYER_RADIUS, feetY = null, stepUp = PLAYER.STEP_UP ?? 0.6, airFeet = null) {\n',
  }),
  Object.freeze({
    name: 'modeled exit label',
    before: "    if (z < LAYOUT.SHENWU_Z + 20) return '神武门';\n",
    after: "    // 模型相对的地面出口：完整身体越过现有城台北皮才称“门外”。\n    // 与 cityGate 共用名义进深；不是实测边界或当日游客通行说明。\n    // 上层可站立城台仍在北皮以内；不按眼高切换，避免门外跳跃时标签闪回。\n    const modeledNorthFace = LAYOUT.SHENWU_Z + DIMENSIONS.SHENWU.depth / 2;\n    if (z - DEFAULT_PLAYER_RADIUS <= modeledNorthFace) return '神武门';\n",
  }),
]);

export function restoreV13WayfindingCollisionBytes(current) {
  let source = current.toString('utf8');
  for (const { name, before, after } of V14_WAYFINDING_COLLISION_DELTAS) {
    assert.equal(source.split(after).length - 1, 1,
      `The exact V14 ${name} replacement must occur exactly once`);
    source = source.replace(after, before);
  }
  const restored = Buffer.from(source, 'utf8');
  assert.equal(createHash('sha256').update(restored).digest('hex'),
    '7ee461c92600c58086e62b3d6df06eb5efe9e659bc405d3d26e08cd75c7bfedd',
    'Restored Collision.js must equal exact V7/V13 bytes');
  return restored;
}
