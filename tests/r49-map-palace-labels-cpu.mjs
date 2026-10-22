// Real Noto CJK font measurement + CPU raster evidence. This is not browser or GPU QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Minimap } from '../src/ui/Minimap.js';
import { PlaceCatalog } from '../src/ui/PlaceCatalog.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { FLIGHT_BOUNDS } from '../src/scene/flight/FlightEnvelope.js';
import { buildWorld } from './lib/world.mjs';
const out = process.env.MAP_QA_OUT || '/tmp/r49-map-labels';
fs.mkdirSync(out, { recursive: true });
const world = await buildWorld({ statics: false });
const texts = [...new Set([...world.mapItems.map(i => i.name), ...PALACE_LAYOUT.map(i => i.name), '（外观）', '（旧址）'].filter(Boolean))];
const python = String.raw`
import sys,json
from PIL import ImageFont
texts=json.load(sys.stdin)
result={}
for size in [12,13]:
 for bold in [False,True]:
  font=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-'+('Bold' if bold else 'Regular')+'.ttc',size)
  result[str(size)+'/'+str(bold).lower()]={text:font.getlength(text) for text in texts}
print(json.dumps(result))
`;
const measured = spawnSync('python', ['-c', python], { input: JSON.stringify(texts), encoding: 'utf8' });
assert.equal(measured.status, 0, measured.stderr);
const metrics = JSON.parse(measured.stdout);
const names = ['景仁宫','承乾宫','钟粹宫','延禧宫','永和宫','景阳宫','永寿宫','翊坤宫','储秀宫','太极殿','长春宫','咸福宫'];
const report = [];
for (const scale of [.75, 1.5, 3, 6]) {
  const commands = [], state = {}, pathCommands = [];
  const record = (op, args, style) => commands.push({ op, args, style });
  const ctx = new Proxy({
    measureText(text) {
      const size = Number(/([\d.]+)px/.exec(state.font)[1]);
      assert.ok(Math.abs(size - Math.round(size)) < 1e-6);
      const width = metrics[`${Math.round(size)}/${state.font.startsWith('bold ')}`][text];
      assert.equal(typeof width, 'number', `font measurement missing: ${text}`);
      return { width };
    },
    fillRect(...args) { record('fillRect', args, state.fillStyle); },
    strokeRect(...args) { record('strokeRect', args, { color: state.strokeStyle, width: state.lineWidth }); },
    fillText(...args) { record('text', args, { color: state.fillStyle, font: state.font }); },
    beginPath() { pathCommands.length = 0; },
    moveTo(...args) { pathCommands.push(['M', ...args]); },
    lineTo(...args) { pathCommands.push(['L', ...args]); },
    arc(...args) { pathCommands.push(['A', ...args]); },
    closePath() { pathCommands.push(['Z']); },
    fill() { record('fillPath', [...pathCommands], state.fillStyle); },
    stroke() { record('strokePath', [...pathCommands], { color: state.strokeStyle, width: state.lineWidth }); },
  }, { get: (o,k) => k in o ? o[k] : k in state ? state[k] : () => {}, set: (_,k,v) => (state[k]=v,true) });
  const map = Object.create(Minimap.prototype);
  Object.assign(map, { items: world.mapItems, placeCatalog: new PlaceCatalog(), worldBounds: FLIGHT_BOUNDS,
    mapSize: 400, mapHeight: 387, baseScale: 6, ctx, baseCanvas: { getContext: () => ctx } });
  map.renderBase(scale);
  // Normalize the screen-space text layer into map coordinates only for this
  // CPU evidence file. The live app paints this layer directly at CSS/DPR scale.
  map.drawLabels(ctx, (x, y) => ({ x, y }), 1, 400, 387);
  for (const a of map.labels) for (const b of map.labels) if (a !== b) {
    assert.ok(Math.abs(a.x-b.x) >= (a.width+b.width)/2 || Math.abs(a.y-b.y) >= (a.height+b.height)/2, `${a.name} overlaps ${b.name}`);
  }
  if (scale >= 3) for (const name of names) assert.ok(map.labels.find(l => l.name === name), name);
  report.push({ cssPixelsPerMapUnit: scale, visibleLabelCount: map.labels.length,
    palaceNames: names.filter(name => map.labels.some(l => l.name === name)),
    gateNames: map.labels.filter(l => /门$/.test(l.name)).map(l => l.name), overlapCount: 0 });
  if (scale === 3) {
    fs.writeFileSync(path.join(out, 'draw-commands.json'), JSON.stringify({ commands, labels: map.labels, scale, crop: [110, 28, 180, 115] }));
  }
}
fs.writeFileSync(path.join(out, 'label-audit.json'), JSON.stringify(report, null, 2));
const raster = spawnSync('python', [new URL('./r49-map-palace-labels-cpu.py', import.meta.url).pathname, out], { encoding: 'utf8' });
assert.equal(raster.status, 0, raster.stderr);
console.log(JSON.stringify({ evidence: out, font: 'Noto Sans CJK', rendering: 'CPU, not browser/GPU', report }, null, 2));
