import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {r31CombinedSource, assertR31CombinedAddedSource} from './r31-combined-source-retention.mjs';
import {r32Source, assertR32AddedSource} from './r32-source-retention.mjs';

const readProduct = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isProductPath = path => /^(src|data|public)\//.test(path);

// Older inventory assertions keep every original path and add only these
// independently byte-bound later additions. No directory-wide exclusion.
export function verifiedR31AddedProductPaths(read = readProduct) {
  const paths = Object.keys(r31CombinedSource.addedFiles);
  for (const path of paths) assertR31CombinedAddedSource(path, read(path));
  return paths.filter(isProductPath);
}

export function verifiedR32AddedProductPaths(read = readProduct) {
  const paths = Object.keys(r32Source.addedFiles);
  for (const path of paths) assertR32AddedSource(path, read(path));
  // The optional GLB is already bound by the complete frozen R32 config.
  // Verify that exact config first; never invent or reverse binary asset bytes.
  const configPath = 'data/interiors/qianqing.json', configBytes = read(configPath);
  assert.equal(sha(configBytes), r32Source.files[configPath].candidateSHA256, 'exact R32 asset-binding config');
  const config = JSON.parse(configBytes);
  assert.equal(config.model, '/models/interiors/qianqing-r32.glb');
  const assetPath = 'public' + config.model;
  assert.equal(sha(read(assetPath)), config.asset.sha256, 'exact independently bound R32 auxiliary GLB');
  return [...paths.filter(isProductPath), assetPath];
}
