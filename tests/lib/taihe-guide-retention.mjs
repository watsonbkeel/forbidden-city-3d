import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import baseline from '../fixtures/taihe-interior-guide.json' with { type: 'json' };
export { baseline };
export const sha = value => createHash('sha256').update(value).digest('hex');

// Remove only the exact reviewed text/source addition, then recover all frozen
// catalog bytes. Older retention tests keep their original fixtures unchanged.
export function restoreTaiheGuideCatalog(current) {
  const raw = current.toString(), data = JSON.parse(raw);
  assert.equal(raw, JSON.stringify(data, null, 2) + '\n', 'canonical catalog bytes');
  assert.deepEqual(data.places.find(place => place.id === 'taihe').interiorGuide, baseline.guide, 'exact reviewed guide');
  assert.deepEqual(data.sources.slice(baseline.baseSourceCount), baseline.addedSources, 'exact cached-source addition');
  delete data.places.find(place => place.id === 'taihe').interiorGuide;
  data.sources = data.sources.slice(0, baseline.baseSourceCount);
  const restored = JSON.stringify(data, null, 2) + '\n';
  assert.equal(sha(restored), baseline.baseCatalogSHA256, 'all original card/source bytes retained');
  return restored;
}

export function restoreTaiheGuideSource(path, current) {
  let restored = current.toString();
  assert.ok(baseline.sourceDeltas[path], 'approved guide source delta required');
  for (const delta of baseline.sourceDeltas[path]) {
    assert.equal(restored.split(delta.after).length - 1, 1, 'guide hunk must occur exactly once');
    restored = restored.replace(delta.after, delta.before);
  }
  assert.equal(sha(restored), baseline.baseFiles[path], 'only exact approved guide source changes allowed');
  return restored;
}
