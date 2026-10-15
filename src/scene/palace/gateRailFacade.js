/** Gate-only alpha-band approximation, not detailed or surveyed solid rail geometry.
 * Input is an owned, UV-mapped, non-indexed box. Keep its vertical triangles and
 * inherited U mapping; the illustrative texture cannot define a solid box cap. */
export function gateRailFacade(geometry, normalizeV = false) {
  const { position, normal, uv } = geometry.attributes;
  const indices = [];
  for (let i = 0; i < position.count; i += 3) {
    if (Math.abs(normal.getY(i)) < 0.5) indices.push(i, i + 1, i + 2);
  }
  if (normalizeV) {
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    for (const i of indices) uv.setY(i, (position.getY(i) - min.y) / (max.y - min.y));
  }
  const groups = geometry.groups.filter(g => Math.abs(normal.getY(g.start)) < 0.5);
  geometry.clearGroups();
  let start = 0;
  for (const g of groups) {
    geometry.addGroup(start, g.count, g.materialIndex);
    start += g.count;
  }
  geometry.setIndex(indices);
  return geometry;
}
