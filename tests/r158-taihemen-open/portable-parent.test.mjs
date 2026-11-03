import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execFileSync, spawnSync} from 'node:child_process';
import {createR157FrozenSourceReader} from '../lib/r157-frozen-source-reader.mjs';
import {loadTaihemenParent, TAIHEMEN_PARENT_COMMIT as commit} from './frozen-parent.mjs';
import {taihemenSouthProfile as currentProfile} from '../../src/scene/palace/TaihemenObservedApproach.js';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const folder = 'tests/fixtures/r157-frozen-sources';
const source = path.join(repository, folder);
const manifestBytes = fs.readFileSync(path.join(source, commit + '.json'));
const manifest = JSON.parse(manifestBytes);
const firstBlob = manifest.files['src/scene/palace/TaihemenObservedApproach.js'].gitBlobSha;
const input = {zEdge:-225.47,y0:0,y1:3.44,run:5.504,width:11.748,halfWidth:25.03};
const routing = ['GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_OBJECT_DIRECTORY','GIT_INDEX_FILE'];
const inherited = Object.fromEntries(routing.map(key => [key, process.env[key]]));
for (const key of routing) delete process.env[key];
test.after(() => { for (const key of routing) {
  if (inherited[key] === undefined) delete process.env[key]; else process.env[key] = inherited[key];
}});

function isolated(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'taihemen-parent-'));
  t.after(() => fs.rmSync(root, {recursive:true, force:true}));
  execFileSync('git', ['init','-q'], {cwd:root});
  const base = path.join(root, folder);
  fs.mkdirSync(path.join(base,'blobs'), {recursive:true});
  fs.writeFileSync(path.join(base,commit+'.json'), manifestBytes);
  for (const {gitBlobSha} of Object.values(manifest.files)) {
    fs.copyFileSync(path.join(source,'blobs',gitBlobSha+'.txt'), path.join(base,'blobs',gitBlobSha+'.txt'));
  }
  return {root,base,blob:path.join(base,'blobs',firstBlob+'.txt')};
}

function standalone(t) {
  const h = isolated(t);
  for (const name of ['src','data','node_modules']) fs.symlinkSync(path.join(repository,name),path.join(h.root,name));
  fs.writeFileSync(path.join(h.root,'package.json'), '{"type":"module"}\n');
  for (const file of [
    'tests/r158-taihemen-open/component.test.mjs', 'tests/r158-taihemen-open/fixture.mjs',
    'tests/r158-taihemen-open/frozen-parent.mjs', 'tests/lib/r157-frozen-source-reader.mjs',
    'tests/lib/r157-frozen-source-pins.mjs', 'tests/lib/inner-palace-fixture.mjs',
    'tests/lib/r48-real-texture-library.mjs',
  ]) {
    const dest = path.join(h.root,file); fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.copyFileSync(path.join(repository,file),dest);
  }
  return h;
}
function child(h, extra = []) {
  const env = {...process.env};
  delete env.NODE_TEST_CONTEXT; // This is a fresh runner, not the parent's worker.
  return spawnSync(process.execPath, [...extra,'--test','--test-reporter=tap','tests/r158-taihemen-open/component.test.mjs'],
    {cwd:h.root,env,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
}

test('a fresh no-history repository loads all nine original files and keeps old/current profiles distinct', async t => {
  const h = isolated(t), reader = createR157FrozenSourceReader(h.root,commit);
  assert.equal(reader.mode,'verified-snapshot'); assert.equal(reader.paths.length,9);
  const old = await loadTaihemenParent(h.root);
  assert.equal(old.taihemenSouthProfile(input).centralGroup.fences.length,2);
  assert.equal(old.taihemenSouthProfile(input).centralGroup.physicsOwnerIds.length,10);
  assert.equal(currentProfile(input).centralGroup.fences.length,0);
  assert.equal(currentProfile(input).centralGroup.physicsOwnerIds.length,8);
});

test('all five original assertions run without the historical commit or a sibling checkout', t => {
  const h = standalone(t), result = child(h);
  assert.equal(createR157FrozenSourceReader(h.root,commit).mode,'verified-snapshot');
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/# tests 5\b/); assert.match(result.stdout,/# pass 5\b/);
});

for (const fault of ['changed manifest','missing manifest','changed blob','missing blob','symlink blob']) {
  test(`historical ${fault} fails closed before importing the graph`, async t => {
    const h = isolated(t), mp = path.join(h.base,commit+'.json');
    if (fault === 'changed manifest') fs.appendFileSync(mp,' ');
    if (fault === 'missing manifest') fs.unlinkSync(mp);
    if (fault === 'changed blob') fs.appendFileSync(h.blob,'\n// changed');
    if (fault === 'missing blob' || fault === 'symlink blob') fs.unlinkSync(h.blob);
    if (fault === 'symlink blob') fs.symlinkSync(path.join(source,'blobs',firstBlob+'.txt'),h.blob);
    await assert.rejects(loadTaihemenParent(h.root));
  });
}

test('cached historical modules do not hide later changed snapshot bytes', async t => {
  const h = isolated(t); await loadTaihemenParent(h.root);
  fs.appendFileSync(h.blob,'\n// corruption after first successful import');
  await assert.rejects(loadTaihemenParent(h.root),/source byte identity mismatch/);
});

// In-memory mutations only, in a separate child. They never edit runtime files
// or the frozen graph, and must fail the unchanged original product assertions.
for (const fault of ['barrier','uv']) test(`original assertions detect a real ${fault} regression`, t => {
  const h = standalone(t);
  const target = pathToFileURL(fs.realpathSync(path.join(repository,'src/scene/palace/TaihemenObservedSolids.js'))).href;
  const marker = fault === 'barrier' ? 'registerTaihemenImperialFootprint(builder,parent,p);' : 'slab.rotation.x=-angle;';
  const injection = fault === 'barrier'
    ? "const faultFence={id:'axis/taihemen-c-central-head-photo-barrier',z:p.zEdge+.08,baseY:p.y1,height:1.05};c.fences.push(faultFence);addPhotoFence(builder,group,p,faultFence,builder.library.material('marble'));"
    : 'slab.geometry.attributes.uv.setXY(0,2,2);';
  const hook = path.join(h.root,'fault.mjs');
  fs.writeFileSync(hook, `import{registerHooks}from'node:module';import fs from'node:fs';
registerHooks({load(url,context,next){if(url!==${JSON.stringify(target)})return next(url,context);
const source=fs.readFileSync(new URL(url),'utf8'),marker=${JSON.stringify(marker)};
if(source.split(marker).length!==2)throw Error('Fault injection target drifted');
return{format:'module',source:source.replace(marker,marker+${JSON.stringify(injection)}),shortCircuit:true};}});`);
  const result = child(h,['--import',hook,'--test-name-pattern',fault === 'barrier' ? 'remove exactly two' : 'carved slab uses complete']);
  assert.equal(result.status,1,'fault must fail an original assertion, not time out: '+result.stdout+result.stderr);
  assert.match(result.stdout,/ERR_ASSERTION/); assert.match(result.stdout,/# fail 1\b/);
  assert.doesNotMatch(result.stdout+result.stderr,/ERR_MODULE_NOT_FOUND|Fault injection target drifted/);
});
