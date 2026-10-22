/** Lossless report-only transport. This script never creates archives or rebuilds evidence. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const maximumPartBytes = 120000;
const sha = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const blob = bytes => sha(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]), 'sha1');
const isHash = (value, length) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const isByteCount = value => Number.isSafeInteger(value) && value >= 0;

function safeRelativePath(value) {
  return typeof value === 'string' && !path.isAbsolute(value) && !/[\\\0]/.test(value) &&
    !value.split('/').some(part => part === '' || part === '.' || part === '..');
}

function reportPath(value) {
  const allowed = /^reports\/r57-unified\//;
  if (!safeRelativePath(value) || !allowed.test(value) || !/\.json(\.gz)?$/.test(value) ||
      value.startsWith('reports/r57-transport/')) {
    throw Error(`Ineligible R57 report path: ${value}`);
  }
  return value;
}

function partPath(value) {
  if (!safeRelativePath(value) || !/^reports\/r57-transport\/parts\/[^/]+\.bin$/.test(value)) {
    throw Error(`Unsafe R57 report part path: ${value}`);
  }
  return value;
}

function validateIndex(index) {
  if (index?.schemaVersion !== 1) throw Error('Unsupported R57 report index schema');
  if (index.maximumPartBytes !== maximumPartBytes) throw Error('R57 maximum part size must be 120000 bytes');
  if (!isHash(index.originalFrozenLocalCommit, 40)) throw Error('A full frozen original source commit is required');
  if (!Array.isArray(index.archives) || index.archives.length === 0) throw Error('R57 archive index must not be empty');
  const reports = new Set();
  const parts = new Set();
  for (const entry of index.archives) {
    reportPath(entry.path);
    if (reports.has(entry.path)) throw Error('Duplicate original report path');
    reports.add(entry.path);
    if (!['gzip', 'identity'].includes(entry.encoding)) throw Error('Unknown report encoding');
    if (!isByteCount(entry.originalBytes) || !isHash(entry.originalSha256, 64) || !isHash(entry.originalGitBlob, 40) ||
        !isByteCount(entry.containerBytes) || !isHash(entry.containerSha256, 64)) {
      throw Error('Invalid frozen original or container identity');
    }
    if (!Array.isArray(entry.parts) || entry.parts.length === 0) throw Error('Missing report part list');
    for (const [i, part] of entry.parts.entries()) {
      if (part.index !== i) throw Error('Wrong part order');
      partPath(part.path);
      if (parts.has(part.path)) throw Error('Duplicate report part path');
      parts.add(part.path);
      if (!isByteCount(part.bytes) || part.bytes < 1 || part.bytes > maximumPartBytes) {
        throw Error('Each binary part must contain 1 to 120000 bytes');
      }
      if (!isHash(part.sha256, 64)) throw Error('Invalid report part SHA-256');
    }
  }
  for (const report of reports) {
    for (let parent = path.posix.dirname(report); parent !== '.'; parent = path.posix.dirname(parent)) {
      if (reports.has(parent)) throw Error(`Conflicting report paths: ${parent} and ${report}`);
    }
  }
}

function defaultIndex() {
  const indexPath = path.join(root, 'reports/r57-transport/ARCHIVES.json');
  if (!fs.existsSync(indexPath)) throw Error('R57 reports are not frozen: reports/r57-transport/ARCHIVES.json does not exist');
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
}

function checkDestination(target, raw) {
  // Check the whole existing ancestry before any output, including dangling links.
  for (let current = target; ; current = path.dirname(current)) {
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (stat?.isSymbolicLink()) throw Error(`Refusing symlinked restore destination: ${current}`);
    if (stat && current !== target && !stat.isDirectory()) throw Error(`Restore parent is not a directory: ${current}`);
    if (stat && current === target && (!stat.isFile() || !fs.readFileSync(target).equals(raw))) {
      throw Error('Refusing to overwrite different evidence');
    }
    if (path.dirname(current) === current) break;
  }
}

export function restoreR57Reports({destination = null, index = defaultIndex(),
  read = p => fs.readFileSync(path.join(root, partPath(p)))} = {}) {
  validateIndex(index);
  const verified = [];
  for (const entry of index.archives) {
    const packed = Buffer.concat(entry.parts.map(part => {
      const bytes = read(part.path);
      if (!Buffer.isBuffer(bytes) || bytes.length > maximumPartBytes || bytes.length !== part.bytes || sha(bytes) !== part.sha256) {
        throw Error('Missing or corrupt report part');
      }
      return bytes;
    }));
    if (packed.length !== entry.containerBytes || sha(packed) !== entry.containerSha256) throw Error('Wrong concatenation');
    let raw;
    try {
      raw = entry.encoding === 'gzip' ? gunzipSync(packed, {maxOutputLength: Math.max(1, entry.originalBytes)}) : packed;
    } catch (error) {
      throw Error('Invalid gzip or restored bytes differ from frozen original', {cause: error});
    }
    if (raw.length !== entry.originalBytes || sha(raw) !== entry.originalSha256 || blob(raw) !== entry.originalGitBlob) {
      throw Error('Restored bytes differ from frozen original');
    }
    verified.push({entry, raw});
  }
  if (destination !== null) {
    const outputRoot = path.resolve(destination);
    const outputs = verified.map(({entry, raw}) => ({target: path.join(outputRoot, entry.path), raw}));
    for (const {target, raw} of outputs) checkDestination(target, raw);
    for (const {target, raw} of outputs) {
      if (fs.existsSync(target)) continue; // Matching pre-existing evidence remains untouched.
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, raw, {flag: 'wx'});
    }
  }
  return verified.map(({entry}) => ({path: entry.path, bytes: entry.originalBytes,
    sha256: entry.originalSha256, gitBlob: entry.originalGitBlob}));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 3) throw Error('Usage: node scripts/r57-restore-report-archives.mjs [output-directory]');
    console.log(JSON.stringify({verified: restoreR57Reports({destination: process.argv[2] ?? null})}, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
