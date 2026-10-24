import {DailyRoutine} from './DailyRoutine.js';
import { CHARACTER_REGISTRY } from '../../../data/characters/index.js';
import { CharacterManager } from './CharacterManager.js';
import { CharacterWorldAdapter } from './CharacterWorldAdapter.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { CharacterResourcePool } from './CharacterResourcePool.js';
import { characterGeometryOptionsFor } from './CharacterGeometryOptions.js';
import { PatrolController } from './PatrolController.js';
import { CeremonyController } from './CeremonyController.js';
import { validateCharacterRegistry } from './CharacterSchema.js';
import { CharacterInteraction } from './CharacterInteraction.js';

// Product availability and acceptance are independent: the user confirmed the
// appearance and requested the ordinary, default-on release (§2.2). Missing
// GPU/mobile/history evidence remains explicit and is never promoted by on/off.
export const CHARACTER_ROLLOUT_APPROVED = false;
export const CHARACTER_CONTENT_ENABLED = true;
export class CharacterSystem {
  constructor({ scene, camera, collisionManager, zoneManager, interiors, registry = CHARACTER_REGISTRY,
    adapter = null, renderer = null, documentObject = globalThis.document, contentApproved, contentEnabled = contentApproved ?? CHARACTER_CONTENT_ENABLED,
    preparationBudgetMs = {high:1,low:1}, getPlayerState = null } = {}) {
    this.camera=camera;this.document=documentObject;this.disposed=false;this.lastError=null;this.lastFailure=null;this.lastDaylight=1;
    this.preparationBudgetMs=preparationBudgetMs;this.totalUpdateSamples=[];this.lastPreparation=null;
    this.validation=validateCharacterRegistry(registry);
    const effectiveRegistry=this.validation.valid?registry:{actors:[],templates:[],anchors:[],surfaces:[],seats:[],paths:[],ceremonies:[]};
    this.pool=new CharacterResourcePool();this.metrics=new Map();
    this.world=adapter??new CharacterWorldAdapter({scene,collisionManager,zoneManager,interiors,registry:effectiveRegistry});
    this.renderer=renderer??new CharacterRenderer({scene,pool:this.pool});
    this.ceremony=new CeremonyController(effectiveRegistry.ceremonies?.[0]);
    this.interaction=new CharacterInteraction({collisionManager,getPlayerState,registry:effectiveRegistry});
    const readonlyAdapter={
      getRevision:actor=>this.world.getRevision?.(actor)??this.world.getGeneration?.(actor.zoneRef),
      resolve:actor=>this.world.request?this.world.request(actor,a=>this.prepareFor(a)):this.world.resolve(actor,this.metricsFor(actor)),
    };
    this.manager=new CharacterManager({registry:effectiveRegistry,adapter:readonlyAdapter,renderer:this.renderer,
      enabled:this.validation.valid,contentEnabled,interaction:this.interaction,
      patrolFactory:(actor,binding)=>{
        const b=actor.behavior;
        return new PatrolController({path:binding.path,
          speedMetersPerSecond:b.speedMetersPerSecond,pauseSeconds:b.pauseSeconds,followerSpacingMeters:b.followerSpacingMeters??1.4});
      }});
    this.manager.routines=new DailyRoutine({world:this.world,collisionManager,interaction:this.interaction,registry:effectiveRegistry});
    if(!this.validation.valid)this.lastError=`Invalid character registry: ${this.validation.errors.map(e=>e.path+': '+e.message).join('; ')}`;
    this._visibility=()=>{if(this.document?.hidden){this.manager.hidden=true;this.interaction.clear();this.world.cancelPending?.('Document hidden');}};
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
    if(['consort-daily','maid-daily'].includes(actor.templateId))for(let lod=0;lod<3;lod++){yield* this.pool.prepare(actor.templateId,'sleeping',lod,{seatVariant:'standard'});yield* this.pool.prepare(actor.templateId,'standing',lod,{seatVariant:'standard',femalePose:'walking'});}
    if(actor.templateId==='emperor-ceremonial')for(let lod=0;lod<3;lod++)yield* this.pool.prepare(actor.templateId,'seated',lod,{seatVariant:'qianqing-low-foot'});
    if(pose==='seated')for(let lod=0;lod<3;lod++)yield* this.pool.prepare(actor.templateId,'standing',lod,{seatVariant:'standard'});
    return this.metricsFor(actor);
  }
  get enabled(){return this.manager.enabled;}
  get contentEnabled(){return this.manager.contentEnabled;}
  get developmentPreviewActive(){return this.manager.developmentPreviewActive;}
  setDevelopmentPreview(enabled){
    if(import.meta.env?.DEV !== true || this.disposed || !this.validation.valid)return false;
    if(enabled === true){
      this.manager.setDevelopmentPreview(true);
      this.setEnabled(true);
    }else{
      this.setEnabled(false);
      this.manager.setDevelopmentPreview(false);
    }
    return this.developmentPreviewActive;
  }
  setEnabled(enabled){if(!this.validation.valid&&enabled)return;this.manager.setEnabled(enabled);if(!enabled)this.world.cancelPending?.('Characters disabled');}
  update(dt,{daylight=1,quality='high',viewportHeight=1080,beijingTime=null}={}){
    if(this.disposed)return;
    this.lastDaylight=daylight;
    const start=performance.now();
    try{
      // Only share read snapshots within this synchronous Manager traversal.
      // End before advancing resumable jobs, whose evidence is always fresh.
      try{this.world.beginReadFrame?.();this.manager.update(dt,{camera:this.camera,daylight,quality,viewportHeight,beijingTime,hidden:!!this.document?.hidden});}
      finally{this.world.endReadFrame?.();}
      if(this.manager.enabled&&this.manager.canRunContent&&!this.document?.hidden){
        const budget=typeof this.preparationBudgetMs==='number'?this.preparationBudgetMs:this.preparationBudgetMs[quality]??1;
        // The nominal total target includes submission and cold preparation.
        // Submission alone can exceed it on slow devices. In that case a small
        // pending-only deadline prevents permanent starvation, rather than
        // claiming an impossible 1ms total by never preparing missing roles.
        // Queue steps remain bounded/cancellable; all CPU stays in this update.
        const nominalTotalBudgetMs=Math.max(0,Number.isFinite(budget)?budget:0);
        const submissionElapsedMs=performance.now()-start;
        const remainingBudgetMs=Math.max(0,nominalTotalBudgetMs-submissionElapsedMs);
        const progressReserveMs=this.world.work?.jobs?.size>0?Math.min(.25,nominalTotalBudgetMs):0;
        const grantedPreparationBudgetMs=Math.max(remainingBudgetMs,progressReserveMs);
        const preparation=this.world.advance?.({budgetMs:grantedPreparationBudgetMs});
        this.lastPreparation=preparation?{...preparation,nominalTotalBudgetMs,submissionElapsedMs,
          remainingBudgetMs,progressReserveMs,grantedPreparationBudgetMs,
          totalBudgetOverrunMs:Math.max(0,performance.now()-start-nominalTotalBudgetMs)}:preparation;
        this.lastError=null; // Successful explicit retry clears only the active error.
      }
    }catch(error){this.lastError=this.lastFailure=String(error);this.setEnabled(false);}
    this.totalUpdateSamples.push(performance.now()-start);if(this.totalUpdateSamples.length>600)this.totalUpdateSamples.shift();
  }
  // The settings status runs on the existing frame loop. Do not sort timing
  // buffers or allocate per-actor diagnostics solely to update a few counters.
  statusSnapshot(){return{...this.manager.stats,rollout:this.manager.rollout,enabled:this.enabled,contentEnabled:this.contentEnabled,daylight:this.lastDaylight,lastError:this.lastError,interaction:{...this.interaction.last}};}
  snapshot(){const manager=this.manager.snapshot(),sorted=[...this.totalUpdateSamples].sort((a,b)=>a-b),percentile=q=>sorted[Math.floor((sorted.length-1)*q)]??0;return{...manager,daylight:this.lastDaylight,lastError:this.lastError,lastFailure:this.lastFailure,configurationValid:this.validation.valid,configurationErrors:this.validation.errors,
    managerUpdateP95Ms:manager.updateP95Ms,updateP50Ms:percentile(.5),updateP95Ms:percentile(.95),
    preparation:this.world.work?.snapshot?.()??null,lastPreparation:this.lastPreparation,
    ceremony:this.ceremony.sample(this.manager.simulationSeconds),worldQueries:{...this.world.stats}};}
  dispose(){if(this.disposed)return;this.disposed=true;this.document?.removeEventListener?.('visibilitychange',this._visibility);
    this.manager.dispose();this.world.dispose?.();this.metrics.clear();this.pool.dispose();this.ceremony.dispose();}
}
