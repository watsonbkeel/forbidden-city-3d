import { CHARACTER_REGISTRY } from '../../../data/characters/index.js';
import { CharacterManager } from './CharacterManager.js';
import { CharacterWorldAdapter } from './CharacterWorldAdapter.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { CharacterResourcePool } from './CharacterResourcePool.js';
import { characterGeometryOptionsFor } from './CharacterGeometryOptions.js';
import { PatrolController } from './PatrolController.js';
import { CeremonyController } from './CeremonyController.js';
import { validateCharacterRegistry } from './CharacterSchema.js';

// Release owner changes this only after visual, historical and runtime gates.
// Tests may inject approval to validate lifecycle; no query string bypass exists.
export const CHARACTER_ROLLOUT_APPROVED = false;
export class CharacterSystem {
  constructor({ scene, camera, collisionManager, zoneManager, interiors, registry = CHARACTER_REGISTRY,
    adapter = null, renderer = null, documentObject = globalThis.document, contentApproved = CHARACTER_ROLLOUT_APPROVED,
    preparationBudgetMs = {high:1,low:1} } = {}) {
    this.camera=camera;this.document=documentObject;this.disposed=false;this.lastError=null;
    this.preparationBudgetMs=preparationBudgetMs;this.totalUpdateSamples=[];this.lastPreparation=null;
    this.validation=validateCharacterRegistry(registry);
    const effectiveRegistry=this.validation.valid?registry:{actors:[],templates:[],anchors:[],surfaces:[],seats:[],paths:[],ceremonies:[]};
    this.pool=new CharacterResourcePool();this.metrics=new Map();
    this.world=adapter??new CharacterWorldAdapter({scene,collisionManager,zoneManager,interiors,registry:effectiveRegistry});
    this.renderer=renderer??new CharacterRenderer({scene,pool:this.pool});
    this.ceremony=new CeremonyController(effectiveRegistry.ceremonies?.[0]);
    const readonlyAdapter={
      getRevision:actor=>this.world.getRevision?.(actor)??this.world.getGeneration?.(actor.zoneRef),
      resolve:actor=>this.world.request?this.world.request(actor,a=>this.prepareFor(a)):this.world.resolve(actor,this.metricsFor(actor)),
    };
    this.manager=new CharacterManager({registry:effectiveRegistry,adapter:readonlyAdapter,renderer:this.renderer,
      enabled:this.validation.valid,contentApproved,
      patrolFactory:(actor,binding)=>{
        const b=actor.behavior;
        return new PatrolController({path:binding.path,
          speedMetersPerSecond:b.speedMetersPerSecond,pauseSeconds:b.pauseSeconds,followerSpacingMeters:b.followerSpacingMeters??1.4});
      }});
    if(!this.validation.valid)this.lastError=`Invalid character registry: ${this.validation.errors.map(e=>e.path+': '+e.message).join('; ')}`;
    this._visibility=()=>{if(this.document?.hidden){this.manager.hidden=true;this.world.cancelPending?.('Document hidden');}};
    this.document?.addEventListener?.('visibilitychange',this._visibility);this._visibility();
  }
  metricsFor(actor){
    if(actor.placement?.mode!=='seat')return{};
    const variant=actor.behavior?.seatVariant??'standard',key=`${actor.templateId}|${variant}`;
    if(!this.metrics.has(key)){
      const r=this.pool.acquire(actor.templateId,'seated',0,{seatVariant:variant}),d=r.geometry.userData;
      this.metrics.set(key,{seatPelvis:d.seatPelvis,seatContact:d.seatContact,groundContacts:d.groundContacts,seatVariant:variant});this.pool.release(r.key);
    }
    return this.metrics.get(key);
  }
  *prepareFor(actor){
    // Prepare all three LODs before a binding becomes visible, so turning the
    // camera/quality later cannot synchronously author a missing template.
    const pose=actor.behavior?.basePose??'standing',options=characterGeometryOptionsFor(actor);
    for(let lod=0;lod<3;lod++)yield* this.pool.prepare(actor.templateId,pose,lod,options);
    return this.metricsFor(actor);
  }
  get enabled(){return this.manager.enabled;}
  setEnabled(enabled){if(!this.validation.valid&&enabled)return;this.manager.setEnabled(enabled);if(!enabled)this.world.cancelPending?.('Characters disabled');}
  update(dt,{daylight=1,quality='high',viewportHeight=1080}={}){
    if(this.disposed)return;
    const start=performance.now();
    try{
      // Only share read snapshots within this synchronous Manager traversal.
      // End before advancing resumable jobs, whose evidence is always fresh.
      try{this.world.beginReadFrame?.();this.manager.update(dt,{camera:this.camera,daylight,quality,viewportHeight,hidden:!!this.document?.hidden});}
      finally{this.world.endReadFrame?.();}
      if(this.manager.enabled&&this.manager.contentApproved&&!this.document?.hidden){
        const budget=typeof this.preparationBudgetMs==='number'?this.preparationBudgetMs:this.preparationBudgetMs[quality]??1;
        // Rendering/submission and first-template preparation share this same
        // total NPC update deadline. No cold cost is moved outside measurement.
        this.lastPreparation=this.world.advance?.({budgetMs:Math.max(0,budget-(performance.now()-start))});
      }
    }catch(error){this.lastError=String(error);this.setEnabled(false);}
    this.totalUpdateSamples.push(performance.now()-start);if(this.totalUpdateSamples.length>600)this.totalUpdateSamples.shift();
  }
  snapshot(){const manager=this.manager.snapshot(),sorted=[...this.totalUpdateSamples].sort((a,b)=>a-b),percentile=q=>sorted[Math.floor((sorted.length-1)*q)]??0;return{...manager,lastError:this.lastError,configurationValid:this.validation.valid,configurationErrors:this.validation.errors,
    managerUpdateP95Ms:manager.updateP95Ms,updateP50Ms:percentile(.5),updateP95Ms:percentile(.95),
    preparation:this.world.work?.snapshot?.()??null,lastPreparation:this.lastPreparation,
    ceremony:this.ceremony.sample(this.manager.simulationSeconds),worldQueries:{...this.world.stats}};}
  dispose(){if(this.disposed)return;this.disposed=true;this.document?.removeEventListener?.('visibilitychange',this._visibility);
    this.manager.dispose();this.world.dispose?.();this.metrics.clear();this.pool.dispose();this.ceremony.dispose();}
}
