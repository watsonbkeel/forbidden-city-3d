// The two original gate bodies were removed in the late-Qing palace mergers.
// Keep the previous approximate map coordinates; do not invent surveyed ruins.
const sources = {
  '储秀门': 'https://www.dpm.org.cn/explore/building/236486.html',
  '长春门': 'https://www.dpm.org.cn/explore/building/236436.html',
};
export function historicalGateMapItem(item) {
  const evidence = item.historicalSite;
  if (!evidence || evidence.status !== 'demolished' || evidence.coordinateStatus !== 'estimated' ||
      !sources[item.name] || evidence.sourceUrl !== sources[item.name] ||
      ![item.x, item.z].every(Number.isFinite)) throw new Error('Invalid historical site evidence');
  return { kind: 'gate', name: item.name, x: item.x, z: item.z, w: 0, d: 0,
    historicalSite: true, coordinateStatus: 'estimated' };
}
