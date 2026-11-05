import fs from'node:fs';import{execFileSync}from'node:child_process';import{stripZhuxiangDelta}from'../r165-zhuxiang-main-shell/source-boundary.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import '../lib/inner-palace-fixture.mjs';import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';import {BeforeZone} from './before.mjs';
// These are the only additions to the fixed 156-step ae712 test-empty build.
// Keep identities and indices explicit; never infer the expected count from runtime.
const auditedHooks = [
  [136, 'ZhuxiangMainShell'], [137, 'JutingMainPavilion'],
  [138, 'YunguangMainShell'], [139, 'LutaiRockTerrace'],
  [140, 'SongxiuHillPavilion'], [141, 'XiefangHillPavilion'],
  [142, 'XuhuiGallery'], [143, 'XuanshouSouthFront'],
  [144, 'FuyiThreeBay'], [145, 'XihuaNorthWatchHouse'],
  [146, 'YangxinCompanionHalls'], [147, 'YanxiRearEarHall'],
  [148, 'ZhongzhengMainHall'], [149, 'DanyuanElevenBayHall'],
  [150, 'ChenghuangGlazedEntry'], [151, 'TishunSouthBeam'],
].map(([index, name]) => ({
  index, name,
  importLine: `import {build${name}} from '../palace/special/${name}.js';\n`,
  stepLine: `    yield {phase:'hook',index:${index}};\n`,
  callLine: `    build${name}(this.kit,this.zoneJson);\n`,
}));
const hookBlock = auditedHooks.map(h => h.stepLine + h.callLine).join('');
const imports = [...auditedHooks].reverse().map(h => h.importLine).join('');
const priorHook = "    yield {phase:'hook',index:135};\n    buildChangyinLowerNameboard(this.kit,this.zoneJson);\n";
const mergeStep = "    yield {phase:'merge',index:0};\n    this.group = this.kit.finish();\n";
function assertAuditedHookSource(current, old) {
  for (const hook of auditedHooks) {
    for (const line of [hook.importLine, hook.stepLine, hook.callLine]) {
      assert.equal(current.split(line).length, 2, `exact unique audited hook ${hook.index}: ${line.trim()}`);
    }
  }
  assert.ok(current.startsWith(imports + "import {consumeSynchronousBuild, getBuildStepMetrics} from './ZoneBuildSteps.js';\n"), 'exact added import order before the original imports');
  assert.equal(current.split(priorHook + hookBlock + mergeStep).length, 2, 'all sixteen exact yield/call pairs occur in order between original hook 135 and merge 0');
  assert.equal(stripZhuxiangDelta(current), old, 'only the sixteen explicitly audited inert hooks differ from ae712; every original statement remains byte-identical');
}
function run(Base,mode='ok'){const{library,dispose}=createActualLibrary(),events=[],fault=Object.freeze({original:mode}),items=[{kind:'hall',name:'first'},{kind:'gate',name:'a'},{kind:'wall'},{kind:'gate',name:'b'},{kind:'region'}],config={id:'test-empty',items};if(mode==='kind')items.push({kind:'illegal'});if(mode==='profile')Object.defineProperty(config,'hongdeProfile',{get(){events.push('profile');throw fault}});const b=new Base(library,config);let g,m,disposed=0;for(const method of ['buildGate','buildHall','buildWall','buildRegion'])b[method]=function(item){events.push([method,item.name??null,[...this.gateWidths]]);if(method==='buildHall'){g=new T.BoxGeometry(1,1,1);m=new T.MeshBasicMaterial();g.addEventListener('dispose',()=>disposed++);this.kit.root.add(new T.Mesh(g,m));this.kit.owned.push(m);if(mode==='item')throw fault}return item.name==='a'?3:4};const finish=b.kit.finish;b.kit.finish=function(){events.push('finish');if(mode==='finish')throw fault;return finish.call(this)};let result,error;try{result=b.build()}catch(e){error=e}const stats=b.getBuildStepMetrics?.();const out={events,widths:[...b.gateWidths],error:error===fault?'original':error?.message??null,returned:!!result&&!result.then,stats};b.dispose();b.dispose();out.disposed=disposed;dispose();return out}
for(const mode of ['ok','kind','profile','item','finish'])test('same real build ordered gates/items and cleanup with '+mode,()=>{const before=run(BeforeZone,mode),after=run(ZoneBase,mode);const stats=after.stats;delete before.stats;delete after.stats;assert.deepEqual(after,before);assert.equal(after.error,mode==='ok'?null:mode==='kind'?'[ZoneBase] 未知 kind: illegal':'original');assert.equal(after.disposed,1);assert.equal(stats.outcome,mode==='ok'?'ok':'error');if(mode==='ok'){const current=fs.readFileSync('src/scene/zones/ZoneBase.js','utf8'),old=execFileSync('git',['show','ae712bcdc160113aca5dbd1e00e221b58ea94dd3:src/scene/zones/ZoneBase.js'],{encoding:'utf8'});assertAuditedHookSource(current,old);assert.equal(stats.count-auditedHooks.length,156,'original synchronous steps plus exactly sixteen individually audited inert hooks');}if(mode==='profile')assert.equal(stats.failedStep.phase,'profile');if(mode==='finish')assert.equal(stats.failedStep.phase,'merge')});

test('each audited extra hook returns before touching the test-empty kit', async () => {
  const kit = new Proxy({}, {get() {throw Error('inert hook touched the kit');}, set() {throw Error('inert hook mutated the kit');}});
  const zone = Object.freeze({id:'test-empty'});
  for (const hook of auditedHooks) {
    const module = await import(`../../src/scene/palace/special/${hook.name}.js`);
    assert.equal(module[`build${hook.name}`](kit, zone), false, hook.name);
  }
});

test('audited hook contract rejects missing, repeated, reordered, moved and altered operations', () => {
  const current = fs.readFileSync('src/scene/zones/ZoneBase.js', 'utf8');
  const old = execFileSync('git', ['show', 'ae712bcdc160113aca5dbd1e00e221b58ea94dd3:src/scene/zones/ZoneBase.js'], {encoding:'utf8'});
  assertAuditedHookSource(current, old);
  let negativeCount = 0;
  const reject = (source, label) => {
    negativeCount++;
    assert.notEqual(source, current, 'negative control must mutate source: ' + label);
    assert.throws(() => assertAuditedHookSource(source, old), {code:'ERR_ASSERTION'}, label);
  };
  for (const hook of auditedHooks) {
    for (const line of [hook.importLine, hook.stepLine, hook.callLine]) {
      reject(current.replace(line, ''), 'missing ' + line.trim());
      reject(current.replace(line, line + line), 'repeated ' + line.trim());
    }
    reject(current.replace(hook.callLine, hook.callLine.replace('this.kit,this.zoneJson', 'this.zoneJson,this.kit')), 'arguments ' + hook.name);
    reject(current.replace(hook.stepLine + hook.callLine, hook.callLine + hook.stepLine), 'call before boundary ' + hook.name);
  }
  for (let i = 0; i < auditedHooks.length - 1; i++) {
    const a = auditedHooks[i], b = auditedHooks[i + 1];
    reject(current.replace(a.stepLine + a.callLine + b.stepLine + b.callLine, b.stepLine + b.callLine + a.stepLine + a.callLine), 'pair order ' + a.index);
    reject(current.replace(a.stepLine + a.callLine + b.stepLine + b.callLine, a.stepLine + b.callLine + b.stepLine + a.callLine), 'call identity ' + a.index);
    reject(current.replace(b.importLine + a.importLine, a.importLine + b.importLine), 'import order ' + a.index);
  }
  reject(current.replace(priorHook + hookBlock, hookBlock + priorHook), 'moved before original hook 135');
  reject(current.replace(hookBlock + mergeStep, mergeStep + hookBlock), 'moved after merge');
  reject(current.replace('const w = this.buildGate(item);', 'const w = this.buildGate({...item});'), 'original gate argument drift');
  reject(current.replace('this.buildHall(item);', 'this.buildHall({...item});'), 'original item argument drift');
  reject(current.replace('this.kit.finish();', 'this.kit.finish(true);'), 'original merge drift');
  reject(current + '// unrelated drift\n', 'unrelated source drift');
  assert.equal(negativeCount, 179, 'the original 168 source mutations plus 11 exact F49 identity, order and adjacency mutations');
});
