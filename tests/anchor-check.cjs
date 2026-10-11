/**
 * anchor-check.cjs —— 有名建筑 vs data/anchors.json 锚点中心偏差（纯 node，无浏览器）
 *
 * 检查对象：data/zones/*.json 的有名 item（region 是街区范围、不是建筑，不检）
 *           + src/scene/Layout.js 的 PALACE_LAYOUT 条目（含御花园 elements）
 * 匹配规则：同名（含 _meta.aliases 别名）且 kind 兼容（见 KIND_MAP），kind 不兼容视为同名异物不比较
 *           （例：zone 的 gate「乾东五所」是五所头门，锚点是五所群中心 group；gate「文渊阁」是文渊阁院门，锚点是阁本身 hall）
 * 容差：锚点 conf 低 → 15 m，其余 → 5 m。不放宽。
 * 不检：角楼（P0c-1 按城墙中线推导）、城墙外皮、三台（台基外廓由 PalaceBuilder 推）。
 *
 * 用法：npm run test:anchors   （超差返回非 0）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/anchors.json'), 'utf8'));
const ALIASES = RAW._meta?.aliases ?? {};
const TOL = { 低: 15 };
const TOL_DEFAULT = 5;
const SKIP_ANCHOR_KINDS = new Set(['tower', 'cityWall', 'terrace']);

// 场景条目 kind → 可匹配的锚点 kind
const KIND_MAP = {
  gate: ['gate'],
  cityGate: ['gate'],
  hall: ['hall', 'pavilion'],
  nineDragonWall: ['screen'],
  // Layout.js
  palace: ['hall'],
  garden: ['garden'],
  moat: ['moat'],
  pavilion: ['hall', 'pavilion'],
  rockery: ['rockery'],
};

function anchorOf(name) {
  return RAW[name] ? [name, RAW[name]] : ALIASES[name] && RAW[ALIASES[name]] ? [ALIASES[name], RAW[ALIASES[name]]] : null;
}

/** 收集场景条目 { src, kind, name, x, z } */
async function collect() {
  const out = [];
  const zdir = path.join(ROOT, 'data/zones');
  for (const f of fs.readdirSync(zdir).filter(f => f.endsWith('.json')).sort()) {
    const zone = JSON.parse(fs.readFileSync(path.join(zdir, f), 'utf8'));
    for (const it of zone.items) {
      if (!it.name || it.kind === 'region' || it.x === undefined || it.z === undefined) continue;
      out.push({ src: f.replace('.json', ''), kind: it.kind, name: it.name, x: it.x, z: it.z });
    }
  }
  const { PALACE_LAYOUT } = await import(path.join(ROOT, 'src/scene/Layout.js'));
  for (const it of PALACE_LAYOUT) {
    const p = it.position;
    out.push({ src: 'Layout.js', kind: it.type, name: it.name, x: p.x, z: p.z });
    for (const el of it.elements ?? []) {
      out.push({ src: 'Layout.js', kind: el.type, name: el.name, x: p.x + el.position.x, z: p.z + el.position.z });
    }
  }
  return out;
}

(async () => {
  const items = await collect();
  const rows = [];
  const kindSkipped = [];
  for (const it of items) {
    const hit = anchorOf(it.name);
    if (!hit) continue;
    const [aname, a] = hit;
    if (SKIP_ANCHOR_KINDS.has(a.kind)) continue;
    if (!(KIND_MAP[it.kind] ?? []).includes(a.kind)) {
      kindSkipped.push(`${it.src}:${it.kind}「${it.name}」≠ 锚点 ${a.kind}`);
      continue;
    }
    const dev = Math.hypot(it.x - a.x, it.z - a.z);
    const tol = TOL[a.conf] ?? TOL_DEFAULT;
    rows.push({ ...it, anchor: aname, conf: a.conf, dx: it.x - a.x, dz: it.z - a.z, dev, tol, ok: dev <= tol });
  }
  rows.sort((p, q) => q.dev - p.dev);

  const pad = (s, n) => {
    s = String(s);
    const w = [...s].reduce((k, ch) => k + (ch.charCodeAt(0) > 0xff ? 2 : 1), 0);
    return s + ' '.repeat(Math.max(0, n - w));
  };
  const f1 = v => (v >= 0 ? ' ' : '') + v.toFixed(1);
  console.log(`${pad('', 2)}${pad('名称', 18)}${pad('来源', 14)}${pad('kind', 15)}${pad('conf', 5)}${pad('dx', 8)}${pad('dz', 8)}${pad('偏差', 8)}容差`);
  for (const r of rows) {
    const name = r.anchor === r.name ? r.name : `${r.name}→${r.anchor}`;
    console.log(`${r.ok ? '✓ ' : '✗ '}${pad(name, 18)}${pad(r.src, 14)}${pad(r.kind, 15)}${pad(r.conf, 5)}${pad(f1(r.dx), 8)}${pad(f1(r.dz), 8)}${pad(r.dev.toFixed(1), 8)}${r.tol}`);
  }
  const bad = rows.filter(r => !r.ok);
  console.log(`\n比较 ${rows.length} 条（zones ${rows.filter(r => r.src !== 'Layout.js').length} + Layout.js ${rows.filter(r => r.src === 'Layout.js').length}），超差 ${bad.length} 条`);
  if (kindSkipped.length) console.log(`kind 不兼容未比较 ${kindSkipped.length} 条：${kindSkipped.join('；')}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => {
  console.error(e);
  process.exit(2);
});
