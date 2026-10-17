import baseline from '../fixtures/v7-qinan-route-baseline.json' with { type: 'json' };

/** Version-scoped historical hash checks may substitute ONLY the deliberately
 * replaced Qin’an descriptor. The actual new route is tested independently in
 * qinan-exterior-routes.test.mjs, including byte-exact equality of all 32/58
 * unrelated full descriptors. Never rewrite the original V5 or V7 fixtures. */
export function withLegacyQinanForVersionComparison(routes, kind = 'auto') {
  const names = kind === 'fixed'
    ? ['御花园→钦安殿地面外观→返回', '御花园→钦安殿内→穿殿北出']
    : ['[garden] 坤宁门→钦安殿地面外观→返回', '[garden] 坤宁门→钦安殿→返回'];
  const old = baseline[kind].find(r => r.name === names[1]);
  return routes.map(r => r.name === names[0] ? old : r);
}
