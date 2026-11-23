// QA only: this child executes the exact published source, never live src.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

export const v7HistoricalRouteCase = 'V7 historical routes retain exact descriptors with only the later Qin’an and R6 Ningshou replacements isolated';
const here = fileURLToPath(new URL('../../', import.meta.url));
const fixture = new URL('../fixtures/zhaode-v7-r32/', import.meta.url);
const commit = 'ce8915ab8a37cf6a180c60195e7f39abcecf28cc';
const tree = 'b9bc82618a44c8435d230642ceafbe1657f11247';
const originalTest = 'tests/current-state/zhaode-gate-routes.test.mjs';
const manifestPin = '770423a350213d4f40b13cc32f933e0624ccf1b8940a03432bff4370336cdb05';
const archivePin = '8cb051b833d7f4cbb875e0214fb7c1cf4652123af001c799bdb183f13e07b5fe';
const packages = ['three', 'playwright', 'playwright-core'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const validPath = name => /^[A-Za-z0-9_.\/-]+$/.test(name) && !name.split('/').some(p => !p || p === '.' || p === '..') &&
  (/^(src|data|tests\/lib|tests\/fixtures)\//.test(name) || [originalTest, 'tests/stepwalk.cjs', 'tests/zhaode-gate-browser.cjs', 'package.json', 'package-lock.json'].includes(name));

// Lease only immutable test data that is independently byte-identical to the
// original Git blob. All executable modules and product data are archived.
export function readFrozenV7RouteInputs() {
  const json = fs.readFileSync(new URL('manifest.json', fixture));
  assert.equal(sha(json), manifestPin, 'published R32 route source manifest');
  const manifest = JSON.parse(json);
  assert.equal(manifest.originalCommit, commit);
  assert.equal(manifest.originalTree, tree);
  assert.deepEqual(manifest.externalPackages, packages);
  const compressed = fs.readFileSync(new URL('route-sources.json.gz', fixture));
  assert.equal(manifest.archiveSHA256, archivePin);
  assert.equal(sha(compressed), archivePin, 'published R32 route source archive');
  const archive = JSON.parse(gunzipSync(compressed, {maxOutputLength: 4_000_000}));
  const keys = Object.entries(manifest.orderedFiles);
  assert.equal(keys.length, 258);
  assert.deepEqual(Object.keys(archive), keys.filter(([, d]) => d.storage === 'archive').map(([name]) => name));
  const files = new Map();
  for (const [name, d] of keys) {
    assert.ok(validPath(name), 'safe native input path: ' + name);
    const lease = d.storage === 'existing-original-fixture';
    assert.equal(lease, name.startsWith('tests/fixtures/'), 'frozen fixture copy only: ' + name);
    const input = lease ? fs.readFileSync(path.join(here, name)) : Buffer.from(archive[name], 'utf8');
    assert.equal(input.length, d.bytes, name);
    assert.equal(sha(input), d.sha256, name);
    assert.equal(blob(input), d.gitBlob, name);
    files.set(name, input);
  }
  assert.equal([...files.values()].reduce((n, bytes) => n + bytes.length, 0), manifest.rawBytes);
  const original = files.get(originalTest).toString('utf8');
  const a = original.indexOf(`test('${v7HistoricalRouteCase}',`), b = original.indexOf('\n});', a);
  assert.ok(a >= 0 && b > a);
  assert.equal(sha(original.slice(a, b + '\n});'.length)), manifest.originalCallbackSHA256, 'byte-exact authored V7 assertions');
  return files;
}

function linkPinnedDependencies(dir, originalLock) {
  const liveLock = JSON.parse(fs.readFileSync(path.join(here, 'package-lock.json'), 'utf8'));
  fs.mkdirSync(path.join(dir, 'node_modules'));
  for (const name of packages) {
    const id = `node_modules/${name}`;
    const old = originalLock.packages[id], live = liveLock.packages[id];
    assert.equal(live.version, old.version, name);
    assert.equal(live.integrity, old.integrity, name + ' package integrity');
    const from = fs.realpathSync(path.join(here, id));
    const installed = JSON.parse(fs.readFileSync(path.join(from, 'package.json')));
    assert.equal(installed.name, name);
    assert.equal(installed.version, old.version);
    fs.symlinkSync(from, path.join(dir, id), process.platform === 'win32' ? 'junction' : 'dir');
  }
}

export function verifyFrozenV7RouteOutput(output) {
  const lines = output.replaceAll('\r\n', '\n').trimEnd().split('\n');
  const summaries = {tests: 1, suites: 0, pass: 1, fail: 0, cancelled: 0, skipped: 0, todo: 0};
  assert.equal(lines[0], 'TAP version 13');
  assert.deepEqual(lines.filter(line => line.startsWith('# Subtest: ')), [`# Subtest: ${v7HistoricalRouteCase}`]);
  assert.deepEqual(lines.filter(line => /^(?:not )?ok \d+ - /.test(line)), [`ok 1 - ${v7HistoricalRouteCase}`]);
  assert.deepEqual(lines.filter(line => /^\d+\.\.\d+/.test(line)), ['1..1']);
  for (const [key, value] of Object.entries(summaries)) {
    assert.deepEqual(lines.filter(line => line.startsWith(`# ${key} `)), [`# ${key} ${value}`]);
  }
}

function withFrozenRouteTree(run) {
  const inputs = readFrozenV7RouteInputs();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-r32-v7-'));
  try {
    for (const [name, bytes] of inputs) {
      const destination = path.join(dir, name);
      fs.mkdirSync(path.dirname(destination), {recursive: true});
      fs.writeFileSync(destination, bytes, {mode: 0o444, flag: 'wx'});
    }
    linkPinnedDependencies(dir, JSON.parse(inputs.get('package-lock.json')));
    return run(dir);
  } finally {fs.rmSync(dir, {force: true, recursive: true});}
}

function runFrozenNode(dir, args) {
  // Use only the original Node runtime/package graph. Private process env
  // contains no project overlays, current-root loader flags, or credentials.
  const env = {TZ: 'UTC', LC_ALL: 'C', NODE_OPTIONS: '--max-old-space-size=3072'};
  for (const key of ['PATH', 'SystemRoot', 'SYSTEMROOT']) if (process.env[key] !== undefined) env[key] = process.env[key];
  const child = spawnSync(process.execPath, args, {
    cwd: dir, env, encoding: 'utf8', timeout: 60_000, maxBuffer: 2 * 1024 * 1024, windowsHide: true,
  });
  assert.equal(child.error, undefined);
  assert.equal(child.signal, null, child.stderr);
  assert.equal(child.status, 0, `${child.stdout}\n${child.stderr}`);
  return child.stdout;
}

export function replayFrozenV7Route() {
  return withFrozenRouteTree(dir => {
    const output = runFrozenNode(dir, ['--test', '--test-concurrency=1', '--test-reporter=tap', '--test-name-pattern', `^${v7HistoricalRouteCase}$`, originalTest]);
    verifyFrozenV7RouteOutput(output);
    return {commit, tree, tests: 1, originalCase: v7HistoricalRouteCase};
  });
}

/** Execute only the original R32 route-input preamble. The five original
 * retention and mutation tests then consume its actual ordered route rows. */
export function replayFrozenR32RouteDescriptors() {
  const original = fs.readFileSync(new URL('r32-route-retention.native.txt', fixture));
  assert.equal(sha(original), 'a9a4e5fc0e1a44ff82fa75667f9e52ca64bfb415232457d061c74056b11c8e25', 'original R32 route test source');
  assert.equal(blob(original), '721cec56a02fe8cb125630e49b8b54e0948f36ed', 'independently recovered R32 test Git blob');
  assert.equal(sha(fs.readFileSync(path.join(here, 'tests/lib/r32-route-retention.mjs'))), '51034986b22836ffd2bd74a4527ddadee68c29ca50aab6c94744e9a79801082f', 'original R32 reversal helper');
  const text = original.toString('utf8'), start = text.indexOf('for(const[k,rs]of Object.entries');
  assert.ok(start > 0 && text.indexOf('for(const[k,rs]of Object.entries', start + 1) < 0, 'one original test-registration boundary');
  return withFrozenRouteTree(dir => {
    const capture = 'tests/current-state/r32-route-descriptor-capture.mjs';
    const preamble = text.slice(0, start);
    fs.writeFileSync(path.join(dir, capture), preamble + 'process.stdout.write(JSON.stringify({fixed,auto}));\n', {mode: 0o444, flag: 'wx'});
    const rows = JSON.parse(runFrozenNode(dir, [capture]));
    assert.deepEqual(Object.keys(rows), ['fixed', 'auto']);
    const d = JSON.parse(fs.readFileSync(path.join(dir, 'tests/fixtures/r32-route-delta.json')));
    for (const kind of ['fixed', 'auto']) {
      assert.equal(rows[kind].length, d[kind].afterCount, `R32 ${kind} count`);
      assert.equal(sha(JSON.stringify(rows[kind])), d[kind].afterSHA256, `exact R32 ${kind} descriptor input`);
    }
    return rows;
  });
}
