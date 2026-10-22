import { characterEnvironmentMotion } from './CharacterBehavior.js';
import { characterProjection, selectCharacterLOD, selectCharacterBudget } from './CharacterLOD.js';

const percentile = (samples, q) => samples.length ? [...samples].sort((a,b)=>a-b)[Math.min(samples.length-1,Math.floor(q*(samples.length-1)))] : 0;
/** One owner for logical IDs, simulation time, lifecycle and render submissions.
 * The adapter is read-only. Neither this module nor its renderer adds colliders,
 * raycast targets, audio, network messages, global RAFs or per-actor timers. */
export class CharacterManager {
  constructor({ registry, adapter, renderer, enabled = true, contentApproved = false, patrolFactory = null, now = () => performance.now() }) {
    this.registry = registry; this.adapter = adapter; this.renderer = renderer;
    this.enabled = !!enabled; this.contentApproved = !!contentApproved;
    this.patrolFactory = patrolFactory; this.now = now;
    this.simulationSeconds = 0; this.states = new Map(); this.generation = 0;
    this.disposed = false; this.hidden = false; this.samples = [];
    this.stats = { registered: 0, loaded: 0, visible: 0, near: 0, renderCopies: 0, pending: 0, errors: 0, batches: 0, trianglesEstimate: 0 };
    for (const actor of registry.actors ?? []) {
      if (this.states.has(actor.id)) throw new Error(`Duplicate character ID: ${actor.id}`);
      this.states.set(actor.id, { actor, binding: null, pending: false, error: null, lod: 3, activeSchedule: null, patrol: null });
    }
    if (this.states.size > 96) throw new Error('Character registry exceeds 96 logical actors');
    this.stats.registered = this.states.size;
  }
  setEnabled(enabled) {
    if (this.disposed || this.enabled === !!enabled) return;
    this.enabled = !!enabled; this.generation++;
    if (!this.enabled) {
      for (const state of this.states.values()) { state.patrol?.dispose?.(); state.patrol = null; state.binding = null; state.pending = false; state.request = null; state.revision = undefined; state.lod = 3; state.activeSchedule = null; }
      this.renderer.clear(); this._clearStats();
    }
  }
  _clearStats() { for (const key of ['loaded','visible','near','renderCopies','pending','errors','batches','trianglesEstimate']) this.stats[key]=0; }
  _acceptBinding(state, binding) {
    state.pending = false;
    if (binding?.status === 'ready' && Array.isArray(binding.position) && binding.position.every(Number.isFinite) && Number.isFinite(binding.rotationYRad)) {
      state.binding = binding; state.error = null;
    } else { state.binding = null; state.error = binding?.status === 'error' ? binding.reason ?? 'invalid-support' : null; state.pending = !state.error; }
  }
  _resolve(state) {
    const revision = this.adapter.getRevision?.(state.actor);
    if (state.revision !== revision) { state.patrol?.dispose?.(); state.patrol = null; state.asyncResolved = false; state.request = null; state.binding = null; state.pending = false; state.revision = revision; }
    if (state.request) return;
    if (state.asyncResolved && state.binding && this.adapter.getRevision) return;
    const generation = this.generation;
    try {
      const result = this.adapter.resolve(state.actor);
      if (result && typeof result.then === 'function') {
        state.pending = true;
        const request = result; state.request = request; state.binding = null;
        result.then(binding => {
          if (state.request !== request) return;
          state.request = null;
          if (!this.disposed && this.enabled && generation === this.generation && revision === this.adapter.getRevision?.(state.actor)) { this._acceptBinding(state, binding); state.asyncResolved = true; }
        }, error => {
          if (state.request !== request) return;
          state.request = null;
          if (!this.disposed && this.enabled && generation === this.generation && revision === this.adapter.getRevision?.(state.actor)) this._acceptBinding(state, { status: 'error', reason: String(error) });
        });
      } else this._acceptBinding(state, result);
    } catch (error) { this._acceptBinding(state, { status: 'error', reason: String(error) }); }
  }
  update(dt, { camera, daylight = 1, quality = 'high', viewportHeight = 1080, hidden = false } = {}) {
    if (this.disposed || !this.enabled) return;
    if (hidden) { this.hidden = true; return; }
    const start = this.now();
    if (this.hidden) { dt = 0; this.hidden = false; }
    const elapsed = Number.isFinite(dt) ? Math.max(0, Math.min(.1, dt)) : 0;
    this.simulationSeconds += elapsed;
    this._clearStats();
    if (!this.contentApproved) { this.renderer.clear(); return; }
    camera?.updateMatrixWorld?.();
    const candidates = [];
    for (const state of this.states.values()) {
      const actor = state.actor;
      this._resolve(state);
      if (state.pending) this.stats.pending++;
      if (state.error) this.stats.errors++;
      if (!state.binding) continue;
      this.stats.loaded++;
      let position = state.binding.position, rotationYRad = state.binding.rotationYRad, speed = 0;
      if (actor.placement?.mode === 'path' && this.patrolFactory) {
        state.patrol ??= this.patrolFactory(actor, state.binding);
        const sample = state.patrol?.sample(this.simulationSeconds, actor.behavior?.followerIndex ?? 0);
        if (sample?.position) { position = sample.position; rotationYRad = sample.rotationYRad; speed = sample.speedMetersPerSecond ?? sample.speed ?? 0; }
      }
      const projection = characterProjection(position, camera, viewportHeight);
      const scheduled = actor.schedule === 'guard-duty' || daylight > .12;
      if (state.activeSchedule === null || !projection.inFrustum) { state.activeSchedule = scheduled; state.visibility = scheduled ? 1 : 0; }
      else { state.visibility = Math.max(0,Math.min(1,(state.visibility ?? 1)+(scheduled ? 1 : -1)*elapsed/2)); state.activeSchedule = scheduled; }
      if (state.visibility <= 0) { state.lod = 3; continue; }
      state.lod = selectCharacterLOD({ ...projection, previousLOD: state.lod });
      if (state.lod === 3) continue;
      const animation = characterEnvironmentMotion(actor, this.simulationSeconds, speed);
      candidates.push({ ...actor, position, rotationYRad, lod: quality === 'low' ? Math.max(1,state.lod) : state.lod,
        distance: projection.distance, visibility: state.visibility, animation, pose: actor.behavior?.basePose ?? 'standing', support: state.binding.support });
    }
    const selected = selectCharacterBudget(candidates, quality, this.registry.actors);
    const renderStats = this.renderer.render(selected, { simulationSeconds: this.simulationSeconds, camera, quality }) ?? {};
    Object.assign(this.stats, renderStats);
    this.stats.visible = selected.length; this.stats.near = selected.filter(x=>x.lod===0).length;
    this.stats.renderCopies = renderStats.renderCopies ?? selected.length;
    this.samples.push(Math.max(0, this.now()-start)); if (this.samples.length > 600) this.samples.shift();
  }
  snapshot() {
    return { ...this.stats, enabled:this.enabled, rollout:this.contentApproved?'approved':'awaiting-visual-approval',
      simulationSeconds: this.simulationSeconds, updateP50Ms: percentile(this.samples,.5), updateP95Ms: percentile(this.samples,.95),
      ...(this.renderer.snapshot?.() ?? {}), diagnostics:[...this.states.values()].filter(s=>s.error||s.pending).map(s=>({id:s.actor.id,required:s.actor.required,status:s.error?'error':'pending',reason:s.error??'waiting-support'})) };
  }
  dispose() {
    if (this.disposed) return; this.disposed = true; this.generation++;
    for (const state of this.states.values()) state.patrol?.dispose?.();
    this.renderer.dispose(); this.states.clear(); this._clearStats();
  }
}
