import {CharacterResidency} from './CharacterResidency.js';
import { REGISTERED_CHARACTER_LIMIT } from './CharacterLimits.js';
import { characterEnvironmentMotion } from './CharacterBehavior.js';
import { characterProjection, selectCharacterLOD, selectCharacterBudget } from './CharacterLOD.js';

const percentile = (samples, q) => samples.length ? [...samples].sort((a,b)=>a-b)[Math.min(samples.length-1,Math.floor(q*(samples.length-1)))] : 0;
/** One owner for logical IDs, simulation time, lifecycle and render submissions.
 * The adapter is read-only. The optional interaction owner uses a separate
 * dynamic pedestrian channel; never architectural colliders or walkables. */
export class CharacterManager {
  #developmentPreviewActive = false;
  constructor({ registry, adapter, renderer, enabled = true, contentApproved = false, contentEnabled = contentApproved, patrolFactory = null, interaction = null, getViewState = null, prepareResidents = null, now = () => performance.now() }) {
    this.registry = registry; this.adapter = adapter; this.renderer = renderer;
    this.enabled = !!enabled; this.contentEnabled = !!contentEnabled;
    // Legacy constructor contentApproved is only an input alias for content
    // availability. It never grants historical, GPU or complete acceptance.
    this.patrolFactory = patrolFactory; this.now = now;
    this.interaction=interaction;this.getViewState=getViewState;this.prepareResidents=prepareResidents;this.residency=new CharacterResidency();
    this.simulationSeconds = 0; this.states = new Map(); this.generation = 0;
    this.nearIds = new Set();
    this.disposed = false; this.hidden = false; this.samples = [];
    this.stats = { registered: 0, loaded: 0, visible: 0, near: 0, renderCopies: 0, pending: 0, errors: 0, batches: 0, trianglesEstimate: 0 };
    if ((registry.actors?.length ?? 0) > REGISTERED_CHARACTER_LIMIT) throw new Error(`Character registry exceeds ${REGISTERED_CHARACTER_LIMIT} logical actors`);
    for (const actor of registry.actors ?? []) {
      if (this.states.has(actor.id)) throw new Error(`Duplicate character ID: ${actor.id}`);
      this.states.set(actor.id, { actor, binding: null, pending: false, error: null, lod: 3, activeSchedule: null, patrol: null, readiness: 0 });
    }
    this.stats.registered = this.states.size;
  }
  get developmentPreviewActive() {
    return import.meta.env?.DEV === true && this.#developmentPreviewActive;
  }
  get contentApproved() { return false; }
  get rollout() { return this.contentEnabled?'candidate-visible':(import.meta.env?.DEV === true && this.#developmentPreviewActive)?'preview-unverified':'content-unavailable'; }
  get canRunContent() { return this.contentEnabled || (import.meta.env?.DEV === true && this.#developmentPreviewActive); }
  setDevelopmentPreview(enabled) {
    // Separate transient review state from formal content approval. Vite removes
    // the enabling branch from production; forged public fields cannot open it.
    if (import.meta.env?.DEV !== true || this.disposed) return false;
    this.#developmentPreviewActive = enabled === true;
    if (!this.#developmentPreviewActive) this.setEnabled(false);
    return this.developmentPreviewActive;
  }
  setEnabled(enabled) {
    if (this.disposed) return;
    if (!enabled) this.#developmentPreviewActive = false;
    if (this.enabled === !!enabled) return;
    this.enabled = !!enabled; this.generation++;
    if (!this.enabled) {
      this.nearIds.clear();this.residency.clear();this.routines?.reset(this.states.values());
      for (const state of this.states.values()) { state.patrol?.dispose?.(); state.patrol = null; state.binding = null; state.pending = false; state.request = null; state.revision = undefined; state.lod = 3; state.activeSchedule = null;state.interactionActivated=false; }
      this.interaction?.clear();this.renderer.clear(); this._clearStats();
    }
  }
  _clearStats() { for (const key of ['loaded','visible','near','renderCopies','pending','errors','batches','trianglesEstimate','resident','residentModels','modelPending','preparedResources','residentBatches']) this.stats[key]=0; }
  _acceptBinding(state, binding) {
    state.pending = false;
    if (binding?.status === 'ready' && Array.isArray(binding.position) && binding.position.every(Number.isFinite) && Number.isFinite(binding.rotationYRad)) {
      if(!state.binding){state.readiness=0;state.interactionActivated=false;}
      state.binding = binding; state.error = null;
    } else { state.binding = null;state.interactionActivated=false; state.error = binding?.status === 'error' ? binding.reason ?? 'invalid-support' : null; state.pending = !state.error; }
  }
  _resolve(state) {
    const revision = this.adapter.getRevision?.(state.actor);
    if (state.revision !== revision) { this.nearIds.delete(state.actor.id); state.patrol?.dispose?.(); state.patrol = null; state.asyncResolved = false; state.request = null; state.binding = null; state.pending = false; state.revision = revision;state.interactionActivated=false; }
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
  update(dt, { camera, daylight = 1, quality = 'high', viewportHeight = 1080, hidden = false, beijingTime = null } = {}) {
    if (this.disposed || !this.enabled) return;
    if (hidden) { this.hidden = true;this.interaction?.clear(); return; }
    const start = this.now();
    if (this.hidden) { dt = 0; this.hidden = false; }
    const elapsed = Number.isFinite(dt) ? Math.max(0, Math.min(.1, dt)) : 0;
    this.simulationSeconds += elapsed;
    this._clearStats();
    if (!this.canRunContent) { this.nearIds.clear();this.interaction?.clear(); this.renderer.clear(); return; }
    camera?.updateMatrixWorld?.();
    const candidates = [];
    for (const state of this.states.values()) {
      const actor = state.actor;
      if(!state.routine)this._resolve(state);
      if (state.pending) this.stats.pending++;
      if (state.error) this.stats.errors++;
      if (!state.binding) continue;
      this.stats.loaded++;
      if(!state.routine&&actor.placement?.mode==='path'&&this.patrolFactory)state.patrol??=this.patrolFactory(actor,state.binding);
    }
    this.routines?.update(this.states.values(),elapsed,beijingTime);
    this.interaction?.begin(this.states.values(),elapsed);
    const logicalActors=[];
    for(const state of this.states.values()){
      if(!state.binding)continue;
      const logical=state.routineSample??state.interactionSample??this.interaction?.samples.get(state.actor.id)??(state.patrol?state.patrol.sample(this.simulationSeconds,state.actor.behavior?.followerIndex??0):state.binding);
      logicalActors.push({...state.actor,position:logical.position,rotationYRad:logical.rotationYRad,pose:state.actor.behavior?.basePose??'standing',lod:2});
    }
    const interest=this.residency.update(logicalActors,this.getViewState?.()??{mode:'ground',position:camera?.position});
    const residents=logicalActors.filter(a=>interest.get(a.id)?.resident).map(a=>({...a,distance:interest.get(a.id).distance}));
    for (const state of this.states.values()) {
      if(!state.binding)continue;
      const actor=state.actor;
      state.readiness=Math.min(1,state.readiness+elapsed/.35);
      let position = state.binding.position, rotationYRad = state.binding.rotationYRad, speed = 0;
      if(this.interaction){
        const sample=this.interaction.samples.get(actor.id);if(!sample){state.lod=3;continue;}
        position=sample.position;rotationYRad=sample.rotationYRad;speed=sample.speedMetersPerSecond??0;
      }else if (state.patrol) {
        const sample = state.patrol.sample(this.simulationSeconds, actor.behavior?.followerIndex ?? 0);
        if (sample?.position) { position = sample.position; rotationYRad = sample.rotationYRad; speed = sample.speedMetersPerSecond ?? sample.speed ?? 0; }
      }
      if(!interest.get(actor.id)?.display){state.lod=3;continue;}
      const projection = characterProjection(position, camera, viewportHeight,actor.behavior?.basePose);
      if(this.interaction?.nearby({position}))projection.inFrustum=true;
      // All-day virtual-tour availability; original schedule metadata remains
      // interpretive, not a claim of real historical overnight ceremonies.
      state.activeSchedule=true;state.visibility=1;
      const visibility=state.visibility*state.readiness;
      if (visibility <= 0) { state.lod = 3; continue; }
      state.lod = selectCharacterLOD({ ...projection, previousLOD: state.lod });
      if (state.lod === 3) continue;
      const animation = characterEnvironmentMotion(actor, this.simulationSeconds, speed);
      candidates.push({ ...actor, position, rotationYRad, lod: quality === 'low' ? Math.max(1,state.lod) : state.lod,
        budgetLOD: state.lod, distance: projection.distance, visibility, animation, pose: actor.behavior?.basePose ?? 'standing', support: state.binding.support });
    }
    const selected = selectCharacterBudget(candidates, quality, this.registry.actors, this.nearIds);
    // Keep only currently submitted IDs. Missing support, frustum exits and low
    // quality release slots; geometric state.lod/readiness remain untouched.
    this.nearIds = new Set(selected.filter(actor => actor.lod === 0).map(actor => actor.id));
    Object.assign(this.stats,this.prepareResidents?.(residents,selected)??{resident:residents.length});
    const renderStats = this.renderer.render(selected, { simulationSeconds: this.simulationSeconds, camera, quality, residentActors:residents }) ?? {};
    Object.assign(this.stats, renderStats);
    this.stats.visible = renderStats.visible ?? selected.length; this.stats.near = renderStats.near ?? selected.filter(x=>x.lod===0).length;
    this.stats.renderCopies = renderStats.renderCopies ?? selected.length;
    this.interaction?.commit(this.states.values(),this.renderer.submittedActors??selected,quality);
    this.samples.push(Math.max(0, this.now()-start)); if (this.samples.length > 600) this.samples.shift();
  }
  snapshot() {
    return { ...this.stats, enabled:this.enabled, rollout:this.rollout,
      contentEnabled:this.contentEnabled, contentApproved:false, previewActive:this.developmentPreviewActive,
      acceptance:{complete:false,appearance:'confirmed',gpu:'unverified',mobile:'unverified',history:'partial'},
      simulationSeconds: this.simulationSeconds, routine:this.routines?{night:this.routines.night,...this.routines.stats}:null, interaction:this.interaction?{...this.interaction.last}:null, updateP50Ms: percentile(this.samples,.5), updateP95Ms: percentile(this.samples,.95),
      ...(this.renderer.snapshot?.() ?? {}), diagnostics:[...this.states.values()].filter(s=>s.error||s.pending).map(s=>({id:s.actor.id,required:s.actor.required,status:s.error?'error':'pending',reason:s.error??'waiting-support'})) };
  }
  dispose() {
    if (this.disposed) return; this.#developmentPreviewActive = false; this.disposed = true; this.generation++;
    for (const state of this.states.values()) state.patrol?.dispose?.();
    this.interaction?.dispose();this.renderer.dispose(); this.states.clear(); this.nearIds.clear();this.residency.clear(); this._clearStats();
  }
}
