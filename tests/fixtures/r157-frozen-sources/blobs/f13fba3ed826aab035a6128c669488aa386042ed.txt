/**
 * 内金水河：五座金水桥的唯一数据源（P1-Z-axis A3）。
 *
 * PalaceBuilder.buildRiver（造型 + 桥栏碰撞 + 桥面行走 ramp）与 Collision.checkRiverCrossing（河道内是否站在桥上）
 * 都应从这里取桥位，避免两处公式不一致。Collision 的改法见 docs/agent-tasks/REQUESTS.md「## P1-Z-axis」。
 *
 * 数据（docs/research/dimensions.md:85，D1 量算，conf 中）：
 * - 中桥中心 (0.7, −310.8)；其余四桥 x = ±13、±30
 * - 单桥宽 6.1–8.1、桥长 20.6–23.0（未分桥给出）→ 桥宽统一取下限 6.1（中桥 ±3.05 时 regression 的
 *   BRIDGE_RAIL_X = 2.5 仍落在桥栏碰撞内），桥长取 21
 * - 河道东西长 / 南北宽、弓形河身：未查到实测，估（Layout.js 河段 100 × 15）
 */

/** Layout 金水河条目的默认桥位（相对河中心 x，米）；Layout 可用 river.bridges 覆盖 */
export const JINSHUI_BRIDGES = [
  { dx: -30, width: 6.1 },
  { dx: -13, width: 6.1 },
  { dx: 0, width: 6.1 },
  { dx: 13, width: 6.1 },
  { dx: 30, width: 6.1 },
];
export const JINSHUI_BRIDGE_LENGTH = 21;

/**
 * 河道条目 → 桥列表（世界坐标）。
 * @param {{ position: { x: number }, bridges?: Array<{ dx: number, width: number }> }} river
 * @returns {Array<{ x: number, halfW: number }>} x 桥中线世界坐标，halfW 桥面半宽（桥栏中线）
 */
export function riverBridges(river) {
  return (river.bridges ?? JINSHUI_BRIDGES).map(b => ({ x: river.position.x + b.dx, halfW: b.width / 2 }));
}

/**
 * 站在 (x) 的玩家（半径 radius）是否完全落在某座桥面上（不碰桥栏中线）。
 * Collision.checkRiverCrossing 的建议实现（见 REQUESTS）。
 */
export function isOnBridge(river, x, radius) {
  return riverBridges(river).some(b => Math.abs(x - b.x) + radius < b.halfW);
}
