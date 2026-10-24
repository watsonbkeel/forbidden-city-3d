/** Explicit frozen-evidence packaging. No scene build, fixture creation, or oracle regeneration. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {maximumPartBytes, indexPath, evidencePath, sha256, gitBlob, assertNoSymlinks,
  readEvidenceFile, restoreR63Evidence, validateR63EvidenceIndex} from './r63-restore-evidence-archives.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const fullCommit = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], {maxBuffer: 128 * 1024 * 1024});

/**
 * paths is an explicitly reviewed [{path, kind}] list, not an automatic broad glob.
 * apply=false only plans in memory. apply=true stores verified parts/index, then
 * removes matching worktree originals; original objects remain in sourceCommit.
 * The caller must first check raw-path consumers and image provenance.
 */
export function prepareR63Evidence({root = repositoryRoot, sourceCommit, baseCommit = 'f87342d7e1506713df4a6877943eb377e8299593', paths, apply = false} = {}) {
  root = path.resolve(root);
  if (!fullCommit(sourceCommit)) throw Error('A full frozen source commit is required');
  if (typeof baseCommit !== 'string' || !/^[a-f0-9]{7,40}$/.test(baseCommit)) throw Error('A baseline commit hash is required');
  if (!Array.isArray(paths) || paths.length === 0) throw Error('An explicit non-empty reviewed path list is required');
  git(root, 'cat-file', '-e', `${sourceCommit}^{commit}`);
  git(root, 'merge-base', '--is-ancestor', baseCommit, sourceCommit);
  const changed = new Set(git(root, 'diff', '--name-only', '--diff-filter=AM', '-z', baseCommit, sourceCommit).toString().split('\0').filter(Boolean));
  const manifestTarget = path.join(root, indexPath);
  assertNoSymlinks(manifestTarget);
  const previousBytes = fs.existsSync(manifestTarget) ? readEvidenceFile(root, indexPath) : null;
  const previous = previousBytes ? JSON.parse(previousBytes) : {schemaVersion: 1, maximumPartBytes, archives: []};
  if (previousBytes) restoreR63Evidence({root, index: previous});
  const selected = new Set(previous.archives.map(e => e.path));
  const parts = new Map(), originals = new Map(), additions = [];
  for (const selection of paths) {
    const originalPath = evidencePath(selection?.path);
    if (selected.has(originalPath)) throw Error(`Duplicate selected or already archived path: ${originalPath}`);
    selected.add(originalPath);
    if (!changed.has(originalPath)) throw Error(`Evidence is not added or changed from base commit: ${originalPath}`);
    const tree = git(root, 'ls-tree', sourceCommit, '--', originalPath).toString();
    if (!/^100644 blob [a-f0-9]{40}\t/.test(tree)) throw Error(`Frozen evidence must be a regular non-executable Git blob: ${originalPath}`);
    const raw = git(root, 'show', `${sourceCommit}:${originalPath}`);
    const originalGitBlob = git(root, 'rev-parse', `${sourceCommit}:${originalPath}`).toString().trim();
    if (gitBlob(raw) !== originalGitBlob) throw Error(`Frozen original Git blob mismatch: ${originalPath}`);
    const current = readEvidenceFile(root, originalPath);
    if (!current.equals(raw)) throw Error(`Worktree evidence differs from frozen original: ${originalPath}`);
    if (raw.length <= maximumPartBytes) throw Error(`Keep small evidence directly viewable: ${originalPath}`);
    if (originalPath.endsWith('.png') && !raw.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
      throw Error(`CPU image is not a PNG container: ${originalPath}`);
    }
    const encoding = originalPath.endsWith('.json') ? 'gzip' : 'identity';
    const packed = encoding === 'gzip' ? gzipSync(raw, {level: 9}) : raw;
    const originalSha256 = sha256(raw), stem = `${sha256(Buffer.from(originalPath)).slice(0, 16)}-${originalSha256.slice(0, 16)}`;
    const entry = {path: originalPath, kind: selection.kind, sourceCommit, encoding, originalBytes: raw.length,
      originalSha256, originalGitBlob, containerBytes: packed.length, containerSha256: sha256(packed), parts: []};
    for (let offset = 0; offset < packed.length; offset += maximumPartBytes) {
      const bytes = packed.subarray(offset, offset + maximumPartBytes);
      const part = {index: entry.parts.length, path: `reports/r63-transport/parts/${stem}.${String(entry.parts.length).padStart(3, '0')}.bin`,
        bytes: bytes.length, sha256: sha256(bytes)};
      if (parts.has(part.path)) throw Error('Duplicate generated part path');
      parts.set(part.path, bytes); entry.parts.push(part);
    }
    originals.set(originalPath, raw); additions.push(entry);
  }
  const index = {...previous, archives: [...previous.archives, ...additions]};
  validateR63EvidenceIndex(index);
  const manifestBytes = Buffer.from(JSON.stringify(index) + '\n');
  if (manifestBytes.length > maximumPartBytes) throw Error('Compact archive index exceeds 120000 bytes; stop and review manifest partitioning before extending');
  const read = p => parts.has(p) ? parts.get(p) : readEvidenceFile(root, p);
  restoreR63Evidence({root, index, read});
  // Validate every intended filesystem target before writing even the first part.
  for (const p of parts.keys()) {
    const target = path.join(root, p); assertNoSymlinks(target);
    if (fs.existsSync(target)) throw Error(`Refusing to overwrite existing archive part: ${p}`);
  }
  if (apply) {
    const created = [], temporary = `${manifestTarget}.pending-${process.pid}`;
    assertNoSymlinks(temporary);
    if (fs.existsSync(temporary)) throw Error('Refusing to overwrite pending archive index');
    try {
      for (const [p, bytes] of parts) {
        const target = path.join(root, p);
        fs.mkdirSync(path.dirname(target), {recursive: true}); fs.writeFileSync(target, bytes, {flag: 'wx'}); created.push(target);
      }
      // Written storage must verify too, not merely the buffers used to create it.
      restoreR63Evidence({root, index});
      for (const [p, raw] of originals) {
        if (!readEvidenceFile(root, p).equals(raw)) throw Error(`Worktree evidence differs from frozen original: ${p}`);
      }
      const currentIndex = fs.existsSync(manifestTarget) ? readEvidenceFile(root, indexPath) : null;
      if ((previousBytes === null) !== (currentIndex === null) || (previousBytes && !previousBytes.equals(currentIndex))) {
        throw Error('Archive index changed during preparation');
      }
      fs.writeFileSync(temporary, manifestBytes, {flag: 'wx'});
      fs.renameSync(temporary, manifestTarget);
    } catch (error) {
      for (const target of created) fs.unlinkSync(target);
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
      throw error;
    }
    // A crash here can leave a duplicate original, never loss of the frozen bytes.
    for (const p of originals.keys()) fs.unlinkSync(path.join(root, p));
  }
  return {applied: apply, added: additions.map(e => e.path), index};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    while (args.length) {
      const flag = args.shift();
      if (flag === '--apply') options.apply = true;
      else if (['--source-commit', '--base-commit', '--paths'].includes(flag) && args.length) {
        const value = args.shift();
        if (flag === '--paths') options.paths = JSON.parse(fs.readFileSync(value, 'utf8'));
        else options[flag === '--source-commit' ? 'sourceCommit' : 'baseCommit'] = value;
      } else throw Error('Usage: node scripts/r63-prepare-evidence-archives.mjs --source-commit FULL_HASH --paths reviewed-paths.json [--base-commit HASH] [--apply]');
    }
    console.log(JSON.stringify(prepareR63Evidence(options), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
