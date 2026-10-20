import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {r33Source, assertR33AddedSource, assertR33AddedAsset} from './r33-source-retention.mjs';

const readProduct = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

/** Four explicit product additions, after checking every source/provenance
 * addition and both independent binary/config bindings. No directory filter,
 * generic asset exemption, old-epoch projection or runtime substitution. */
export function verifiedR33AddedProductPaths(read = readProduct) {
  for (const path of Object.keys(r33Source.addedFiles)) assertR33AddedSource(path, read(path));
  for (const [path, binding] of Object.entries(r33Source.addedAssets)) {
    const configBytes = read(binding.configPath), delta = r33Source.files[binding.configPath];
    assert.equal(sha(configBytes), delta.candidateSHA256, 'exact R33 asset-binding config: ' + binding.configPath);
    assert.equal(configBytes.length, delta.candidateBytes, 'exact R33 asset-binding config bytes: ' + binding.configPath);
    const config = JSON.parse(configBytes);
    assert.equal(config.model, binding.model, 'exact R33 asset model: ' + path);
    assert.equal('public' + config.model, path, 'exact R33 asset path: ' + path);
    assert.equal(config.asset.sha256, binding.candidateSHA256, 'exact R33 config asset SHA256: ' + path);
    assertR33AddedAsset(path, read(path));
  }
  return [...r33Source.productAdditions];
}
