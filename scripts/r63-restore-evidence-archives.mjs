/** Lossless evidence transport only. Never constructs a scene or regenerates proof. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const maximumPartBytes = 120000;
export const indexPath = 'reports/r63-transport/ARCHIVES.json';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const gitBlob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const isHash = (value, length) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const isByteCount = value => Number.isSafeInteger(value) && value >= 0;
const safeRelativePath = value => typeof value === 'string' && !path.isAbsolute(value) &&
  !/[\\\0:]/.test(value) && !value.split('/').some(part => part === '' || part === '.' || part === '..');

export function evidencePath(value) {
  const allowed = /^(reports\/r63-[^/]+\/|docs\/(?:current-state|validation)\/r63-[^/]+\/|docs\/photo-fidelity\/EVIDENCE\/r63-[^/]+\/|docs\/photo-fidelity\/REVIEWS\/)/;
  const protectedSources = /(^|\/)(?:official[^/]*|references?|reference-cache|source-cache|cache)(\/|$)|(^|\/)SOURCES?(?:[-.]|$)/i;
  if (!safeRelativePath(value) || !allowed.test(value) || !/\.(?:json(?:\.gz)?|png)$/.test(value) ||
      value.startsWith('reports/r63-transport/') || protectedSources.test(value)) {
    throw Error(`Ineligible R63 evidence path: ${value}`);
  }
  return value;
}

export function partPath(value) {
  if (!safeRelativePath(value) || !/^reports\/r63-transport\/parts\/[a-zA-Z0-9._-]+\.bin$/.test(value)) {
    throw Error(`Unsafe R63 evidence part path: ${value}`);
  }
  return value;
}

export function validateR63EvidenceIndex(index) {
  if (index?.schemaVersion !== 1) throw Error('Unsupported R63 evidence index schema');
  if (index.maximumPartBytes !== maximumPartBytes) throw Error('R63 maximum part size must be 120000 bytes');
  if (!Array.isArray(index.archives) || index.archives.length === 0) throw Error('R63 archive index must not be empty');
  const originals = new Set(), parts = new Set();
  for (const entry of index.archives) {
    evidencePath(entry.path);
    if (originals.has(entry.path)) throw Error('Duplicate original evidence path');
    originals.add(entry.path);
    if (!isHash(entry.sourceCommit, 40)) throw Error('A full per-entry frozen source commit is required');
    if (!['report', 'cpu-image'].includes(entry.kind) || (entry.path.endsWith('.png') !== (entry.kind === 'cpu-image'))) {
      throw Error('Evidence kind must distinguish reports and CPU images');
    }
    if (!['gzip', 'identity'].includes(entry.encoding) || (entry.kind === 'cpu-image' && entry.encoding !== 'identity')) {
      throw Error('Unknown or non-identity CPU image encoding');
    }
    if (!isByteCount(entry.originalBytes) || !isHash(entry.originalSha256, 64) || !isHash(entry.originalGitBlob, 40) ||
        !isByteCount(entry.containerBytes) || !isHash(entry.containerSha256, 64)) {
      throw Error('Invalid frozen original or container identity');
    }
    if (!Array.isArray(entry.parts) || entry.parts.length === 0) throw Error('Missing evidence part list');
    for (const [i, part] of entry.parts.entries()) {
      if (part.index !== i) throw Error('Wrong part order');
      partPath(part.path);
      if (parts.has(part.path)) throw Error('Duplicate evidence part path');
      parts.add(part.path);
      if (!isByteCount(part.bytes) || part.bytes < 1 || part.bytes > maximumPartBytes) {
        throw Error('Each binary part must contain 1 to 120000 bytes');
      }
      if (!isHash(part.sha256, 64)) throw Error('Invalid evidence part SHA-256');
    }
  }
  for (const original of originals) {
    for (let parent = path.posix.dirname(original); parent !== '.'; parent = path.posix.dirname(parent)) {
      if (originals.has(parent)) throw Error(`Conflicting evidence paths: ${parent} and ${original}`);
    }
  }
}

/** Also rejects dangling symlinks. Intended for local, non-adversarial filesystem use. */
export function assertNoSymlinks(target) {
  for (let current = path.resolve(target); ; current = path.dirname(current)) {
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat?.isSymbolicLink()) throw Error(`Refusing symlinked evidence path: ${current}`);
    if (stat && current !== path.resolve(target) && !stat.isDirectory()) throw Error(`Evidence parent is not a directory: ${current}`);
    if (path.dirname(current) === current) break;
  }
}

export function readEvidenceFile(root, relativePath) {
  const target = path.join(root, relativePath);
  assertNoSymlinks(target);
  if (!fs.lstatSync(target).isFile()) throw Error(`Evidence is not a regular file: ${relativePath}`);
  return fs.readFileSync(target);
}

function defaultIndex(root) {
  if (!fs.existsSync(path.join(root, indexPath))) throw Error(`R63 evidence is not frozen: ${indexPath} does not exist`);
  return JSON.parse(readEvidenceFile(root, indexPath));
}

function decode(entry, read) {
  const packed = Buffer.concat(entry.parts.map(part => {
    const bytes = read(part.path);
    if (!Buffer.isBuffer(bytes) || bytes.length > maximumPartBytes || bytes.length !== part.bytes || sha256(bytes) !== part.sha256) {
      throw Error('Missing or corrupt evidence part');
    }
    return bytes;
  }));
  if (packed.length !== entry.containerBytes || sha256(packed) !== entry.containerSha256) throw Error('Wrong concatenation');
  let raw;
  try {
    raw = entry.encoding === 'gzip' ? gunzipSync(packed, {maxOutputLength: Math.max(1, entry.originalBytes)}) : packed;
  } catch (error) { throw Error('Invalid gzip or restored bytes differ from frozen original', {cause: error}); }
  if (raw.length !== entry.originalBytes || sha256(raw) !== entry.originalSha256 || gitBlob(raw) !== entry.originalGitBlob) {
    throw Error('Restored bytes differ from frozen original');
  }
  return raw;
}

/** Exact bytes for one archived input. No mutable raw-path fallback or scene regeneration. */
export function readR63Evidence(originalPath, {root = repositoryRoot, index = defaultIndex(root),
  read = p => readEvidenceFile(root, partPath(p))} = {}) {
  evidencePath(originalPath);
  validateR63EvidenceIndex(index);
  const entry = index.archives.find(e => e.path === originalPath);
  if (!entry) throw Error(`R63 evidence is not archived: ${originalPath}`);
  return decode(entry, read);
}

function checkDestination(target, raw) {
  assertNoSymlinks(target);
  let stat;
  try { stat = fs.lstatSync(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (stat && (!stat.isFile() || !fs.readFileSync(target).equals(raw))) throw Error('Refusing to overwrite different evidence');
}

export function restoreR63Evidence({destination = null, root = repositoryRoot, index = defaultIndex(root),
  read = p => readEvidenceFile(root, partPath(p))} = {}) {
  validateR63EvidenceIndex(index);
  // Fully verify every archive and every destination before creating any output.
  const verified = index.archives.map(entry => ({entry, raw: decode(entry, read)}));
  if (destination !== null) {
    const outputRoot = path.resolve(destination);
    const outputs = verified.map(({entry, raw}) => ({target: path.join(outputRoot, entry.path), raw}));
    for (const {target, raw} of outputs) checkDestination(target, raw);
    for (const {target, raw} of outputs) {
      if (fs.existsSync(target)) continue;
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, raw, {flag: 'wx'});
    }
  }
  return verified.map(({entry}) => ({path: entry.path, bytes: entry.originalBytes,
    sha256: entry.originalSha256, gitBlob: entry.originalGitBlob, sourceCommit: entry.sourceCommit}));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 3) throw Error('Usage: node scripts/r63-restore-evidence-archives.mjs [output-directory]');
    console.log(JSON.stringify({verified: restoreR63Evidence({destination: process.argv[2] ?? null})}, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
