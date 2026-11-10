// Local, bounded CPU observations. No scene/resource references or error text.
const ZONES = new Set(['outer-east','outer-west','axis-courts','west-six','east-six','garden','ningshou','yuqing-south-entry']);
const MODES = new Set(['startup','cold','prebuilt','cached']);
const PHASES = Object.freeze({cache:'cacheMs',build:'buildMs',scene:'sceneMs',colliders:'colliderMs',walkables:'walkableMs',notify:'notifyMs',rollback:'rollbackMs',silhouette:'silhouetteMs'});
const kitMerges = new WeakMap();
const safe = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };
const clock = now => safe(() => { const n = now(); return Number.isFinite(n) && n >= 0 ? n : null; });
const duration = (start, end) => Number.isFinite(start) && Number.isFinite(end) && end >= start ? end - start : null;
const ms = n => Number.isFinite(n) && n >= 0 && n <= 3600000 ? Math.round(n * 10) / 10 : null;
const count = n => Number.isSafeInteger(n) && n >= 0 && n <= 1000000000 ? n : 0;
const zone = id => ZONES.has(id) ? id : 'unknown';
function publicLoad(row) {
  if (!row || typeof row !== 'object') return null;
  const mode=row.mode, failedPhase=row.failedPhase;
  const out = {sequence:count(row.sequence),zone:zone(row.zone),mode:typeof mode==='string'&&MODES.has(mode)?mode:'unknown',outcome:row.outcome==='ok'?'ok':'error',failedPhase:typeof failedPhase==='string'&&Object.hasOwn(PHASES,failedPhase)?failedPhase:null,totalMs:ms(row.totalMs),mergeMs:ms(row.mergeMs)};
  for (const key of Object.values(PHASES)) out[key] = ms(row[key]);
  return Object.freeze(out);
}
function publicQueue(row) {
  if (!row || typeof row !== 'object') return null;
  return Object.freeze({totalMs:ms(row.totalMs),budgetMs:8,processed:count(row.processed),remaining:count(row.remaining),outcome:row.outcome==='ok'?'ok':'error'});
}
// Also used by first-error copying: discard arbitrary objects, keys and strings.
export function sanitizeZoneLoadSnapshot(value) {
  return safe(() => value && typeof value === 'object' ? Object.freeze({lastLoad:publicLoad(value.lastLoad),lastStartup:publicLoad(value.lastStartup),lastQueue:publicQueue(value.lastQueue)}) : null);
}
export class ZoneLoadMetrics {
  constructor(now = () => performance.now()) { this.now=now; this.clear(); }
  clear() { this.recent=[]; this.sequence=0; this.lastLoad=null; this.lastStartup=null; this.lastQueue=null; }
  begin(zoneId, mode) {
    const row={zone:zone(zoneId),mode:MODES.has(mode)?mode:'unknown',started:clock(this.now),now:this.now,failedPhase:null};
    for (const key of Object.values(PHASES)) row[key]=0;
    return row;
  }
  finish(row, outcome, mergeMs = null) {
    if (!row) return;
    const out=publicLoad({...row,outcome,totalMs:duration(row.started,clock(this.now)),mergeMs,sequence:++this.sequence});
    if (row.mode==='startup') this.lastStartup=out; else this.lastLoad=out;
    this.recent.push(out); if (this.recent.length>8) this.recent.shift();
  }
  snapshot() { return Object.freeze({lastLoad:this.lastLoad,lastStartup:this.lastStartup,lastQueue:this.lastQueue,recent:Object.freeze([...this.recent])}); }
}
export function beginZoneLoad(metrics, zoneId, mode) { return safe(() => metrics?.begin(zoneId,mode)); }
export function measureZonePhase(row, phase, run) {
  if (!row) return run();
  const started=clock(safe(()=>row.now));
  try { return run(); }
  catch (error) { safe(() => { row.failedPhase ??= phase; }); throw error; }
  finally { safe(() => { const key=PHASES[phase], elapsed=duration(started,clock(row.now)); if(key) row[key]=elapsed===null?null:(row[key]??0)+elapsed; }); }
}
export function finishZoneLoad(metrics,row,outcome,mergeMs) { safe(() => metrics?.finish(row,outcome,mergeMs)); }
export function beginZoneQueue(metrics) { return safe(() => ({started:clock(metrics.now),now:metrics.now})); }
export function finishZoneQueue(metrics,row,outcome,processed,remaining) { safe(() => { if(row) metrics.lastQueue=publicQueue({totalMs:duration(row.started,clock(row.now)),outcome,processed,remaining}); }); }
export function measureKitMerge(kit, run) {
  const now=()=>performance.now(), started=clock(now);
  try { return run(); }
  finally { safe(() => kitMerges.set(kit,duration(started,clock(now)))); }
}
export function kitMergeMs(builder) { return safe(() => kitMerges.get(builder?.kit) ?? null); }
