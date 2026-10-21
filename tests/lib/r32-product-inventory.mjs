import {restoreR33SourceIfPresent} from './r33-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {r31CombinedSource, assertR31CombinedAddedSource} from './r31-combined-source-retention.mjs';
import {r32Source, assertR32AddedSource} from './r32-source-retention.mjs';
import {r32FollowthroughSource, assertR32FollowthroughAddedSource} from './r32-followthrough-source-retention.mjs';
import {r32ScreenSource, assertR32ScreenAddedSource} from './r32-screen-source-retention.mjs';
import {r32FriezeSource, assertR32FriezeAddedSource} from './r32-frieze-source-retention.mjs';
import {r32CrestSource, assertR32CrestAddedSource} from './r32-crest-source-retention.mjs';

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

export function verifiedR32FollowthroughAddedProductPaths(read = readProduct) {
  for (const path of Object.keys(r32FollowthroughSource.addedFiles)) assertR32FollowthroughAddedSource(path, read(path));
  // An explicit two-path inventory, not a directory exclusion. All five
  // additions, including provenance, are bound before either path is allowed.
  return [...r32FollowthroughSource.productAdditions];
}

export function verifiedR32AddedProductPaths(read = readProduct) {
  const paths = Object.keys(r32Source.addedFiles);
  for (const path of paths) assertR32AddedSource(path, read(path));
  // Project only the exact registered R33 config back to frozen R32 bytes.
  // The optional GLB is already bound by the complete frozen R32 config.
  // Verify that exact config first; never invent or reverse binary asset bytes.
  const configPath = 'data/interiors/qianqing.json', configBytes = restoreR33SourceIfPresent(configPath, read(configPath));
  assert.equal(sha(configBytes), r32Source.files[configPath].candidateSHA256, 'exact R32 asset-binding config');
  const config = JSON.parse(configBytes);
  assert.equal(config.model, '/models/interiors/qianqing-r32.glb');
  const assetPath = 'public' + config.model;
  assert.equal(sha(read(assetPath)), config.asset.sha256, 'exact independently bound R32 auxiliary GLB');
  return [...paths.filter(isProductPath), assetPath, ...verifiedR32FollowthroughAddedProductPaths(read), ...verifiedR32ScreenAddedProductPaths(read), ...verifiedR32FriezeAddedProductPaths(read), ...verifiedR32CrestAddedProductPaths(read)];
}

export function verifiedR32ScreenAddedProductPaths(read = readProduct) {
  for (const path of Object.keys(r32ScreenSource.addedFiles)) assertR32ScreenAddedSource(path, read(path));
  return [...r32ScreenSource.productAdditions];
}

export function verifiedR32FriezeAddedProductPaths(read = readProduct) {
  for (const path of Object.keys(r32FriezeSource.addedFiles)) assertR32FriezeAddedSource(path, read(path));
  return [...r32FriezeSource.productAdditions];
}

export function verifiedR32CrestAddedProductPaths(read = readProduct) {
  for (const path of Object.keys(r32CrestSource.addedFiles)) assertR32CrestAddedSource(path, read(path));
  return [...r32CrestSource.productAdditions];
}
