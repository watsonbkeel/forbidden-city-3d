/** Validate the documented courtWalls schema before emitting any geometry.
 * Nested `bounds` and legacy gate aliases are deliberately not guessed: a
 * guessed correction can place a solid wall across a real named passage.
 */
export function resolveCourtWallContract(item, gateWidths) {
  const fail = message => { throw new Error(`[courtWalls ${item.name ?? ''}] ${message}`); };
  const { x0, x1, z0, z1 } = item;
  if (![x0, x1, z0, z1].every(Number.isFinite) || x0 >= x1 || z0 >= z1) fail('invalid top-level bounds');
  if (item.h !== undefined && (!Number.isFinite(item.h) || item.h <= 1)) fail('invalid wall height');
  if (item.t !== undefined && (!Number.isFinite(item.t) || item.t <= 0)) fail('invalid wall thickness');
  if (item.gates !== undefined && !Array.isArray(item.gates)) fail('gates must be an array');
  const gates = (item.gates ?? []).map(g => {
    if (!g || !['s', 'n', 'xmin', 'xmax'].includes(g.side)) fail('invalid opening side');
    const w = g.gate ? gateWidths.get(g.gate) : g.w;
    if (!Number.isFinite(g.at) || !Number.isFinite(w) || w <= 0) fail('invalid opening position/width or unknown gate');
    const [lo, hi] = ['s', 'n'].includes(g.side) ? [x0, x1] : [z0, z1];
    if (g.at - w / 2 < lo || g.at + w / 2 > hi) fail('opening falls outside court side');
    return { side: g.side, at: g.at, w };
  });
  return { x0, x1, z0, z1, gates };
}
