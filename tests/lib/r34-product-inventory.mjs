import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {r34Source, assertR34AddedSource} from './r34-source-retention.mjs';
const readProduct = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
/** Admit only the finite explicit product list after binding every complete
 * new source/provenance byte string. No directory or filename exemption. */
export function verifiedR34AddedProductPaths(read = readProduct) {
  for (const path of Object.keys(r34Source.addedFiles)) assertR34AddedSource(path, read(path));
  const path = 'data/interiors/taihe.json', bytes = read(path), delta = r34Source.files[path];
  assert.equal(createHash('sha256').update(bytes).digest('hex'), delta.candidateSHA256, 'exact R34 asset-binding config');
  assert.equal(bytes.length, delta.candidateBytes, 'exact R34 asset-binding config bytes');
  const config = JSON.parse(bytes), asset = 'public/models/interiors/taihe-display-grid-6012719f9618.glb';
  assert.equal('public' + config.model, asset, 'exact R34 new asset path');
  assert.equal(config.asset.sha256, r34Source.addedFiles[asset].candidateSHA256, 'exact R34 config asset digest');
  assert.equal(config.asset.encodedBytes, r34Source.addedFiles[asset].candidateBytes, 'exact R34 config asset byte count');
  return [...r34Source.productAdditions];
}
