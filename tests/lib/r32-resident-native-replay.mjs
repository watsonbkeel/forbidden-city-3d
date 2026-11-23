import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {deserialize} from 'node:v8';
import {gunzipSync} from 'node:zlib';

const root = new URL('../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const THREE_PACKAGES = ['three', 'three/examples/jsm/utils/BufferGeometryUtils.js'];
const nativeChild = String.raw`
  import fs from 'node:fs';
  import {registerHooks} from 'node:module';
  import {serialize} from 'node:v8';
  const [root, output, packageJSON] = process.argv.slice(1);
  const allowed = JSON.parse(packageJSON);
  registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL?.startsWith(root) && Object.hasOwn(allowed, specifier)) {
        return {url: allowed[specifier], shortCircuit: true};
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (url.startsWith(root) && url.endsWith('.json')) {
        return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
      }
      return next(url, context);
    }
  });
  const {PalaceBuilder} = await import(new URL('src/scene/PalaceBuilder.js', root).href);
  const {captureJiaotaiScene} = await import(new URL('tests/lib/r27-jiaotai-capture.mjs', root).href);
  fs.writeFileSync(output, serialize(captureJiaotaiScene(PalaceBuilder)), {flag: 'wx'});
`;

/** Rebuild the actual pre-artwork R32 resident scene in a private Node process.
 * The source archive is from the independent published R32 Git tree. Only
 * recorded full successor identities permit replay; arbitrary source edits
 * fail instead of silently falling back to any historical module. */
export function captureNativeR32ResidentScene() {
  const raw = gunzipSync(read('tests/fixtures/r32-resident-native-sources.json.gz'), {maxOutputLength:320_000});
  assert.equal(sha(raw), '57cf4db48bfa9b72ada21417349937f0165abb7462d0f619960d2cf493953d48', 'immutable native R32 sources');
  const checkpoint = JSON.parse(raw);
  assert.equal(checkpoint.originalCommit, 'd0c7342c53c501f27ec73b1607aa4cdee16cdcca');
  assert.equal(checkpoint.originalTree, '169eebbe58cd27d5a37d69a2a2a50fae6b9fe8b1');
  assert.equal(Object.keys(checkpoint.files).length, 84);
  const frozen = new Map();
  for (const [name, row] of Object.entries(checkpoint.files)) {
    assert.ok(name === 'package.json' || /^(src\/|data\/|tests\/lib\/)/.test(name), 'finite R32 native input: ' + name);
    assert.ok(!name.split('/').some(part => !part || part === '..' || part === '.'), 'canonical R32 native path');
    const current = read(name);
    assert.equal(sha(current), row.successorSHA256, 'exact R32 native successor: ' + name);
    const original = Object.hasOwn(row, 'utf8') ? Buffer.from(row.utf8, 'utf8') : current;
    assert.equal(original.length, row.bytes, 'exact R32 native length: ' + name);
    assert.equal(sha(original), row.sha256, 'exact R32 native SHA-256: ' + name);
    assert.equal(blob(original), row.githubBlob, 'exact R32 native Git blob: ' + name);
    frozen.set(name, original);
  }
  const dependency = JSON.parse(read('package-lock.json')).packages['node_modules/three'];
  for (const [key, value] of Object.entries(checkpoint.three)) assert.equal(dependency[key], value, 'exact R32 Three.js lock: ' + key);
  const bindings = Object.fromEntries(THREE_PACKAGES.map(name => [name, import.meta.resolve(name)]));
  const version = JSON.parse(fs.readFileSync(new URL('../package.json', bindings.three))).version;
  assert.equal(version, checkpoint.three.version, 'exact installed R32 Three.js version');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-r32-resident-'));
  try {
    for (const [name, bytes] of frozen) {
      const target = path.join(temp, name);
      fs.mkdirSync(path.dirname(target), {recursive:true});
      fs.writeFileSync(target, bytes, {flag:'wx'});
    }
    const output = path.join(temp, 'capture.v8');
    const processDirectory = pathToFileURL(temp + path.sep).href;
    // Launch the absolute Node binary, without inheriting preload flags,
    // module search paths, credentials or project environment variables.
    const env = {TZ:'UTC', LC_ALL:'C', NODE_OPTIONS:'--max-old-space-size=1200'};
    if (process.platform === 'win32') {
      const systemRoot = process.env.SystemRoot ?? process.env.SYSTEMROOT;
      if (systemRoot !== undefined) env.SystemRoot = systemRoot;
    }
    const child = spawnSync(process.execPath, ['--input-type=module', '--eval', nativeChild, processDirectory, output, JSON.stringify(bindings)],
      {cwd:temp, env, timeout:120_000, encoding:'utf8', maxBuffer:2_000_000});
    if (child.error) throw child.error;
    assert.equal(child.status, 0, 'native R32 resident capture failed: ' + child.stderr);
    assert.ok(fs.statSync(output).size <= 32_000_000, 'bounded native R32 capture record');
    // Preserve negative zero, undefined and order. Plain JSON is not the
    // native capture and cannot stand in for runtime-exception assertions.
    return deserialize(fs.readFileSync(output));
  } finally {
    fs.rmSync(temp, {recursive:true, force:true});
  }
}
