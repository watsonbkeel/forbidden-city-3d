import {characterContactMetrics} from './CharacterKit.js';
import {DailyRoutine} from './DailyRoutine.js';
import { CHARACTER_REGISTRY } from '../../../data/characters/index.js';
import { CharacterManager } from './CharacterManager.js';
import { CharacterWorldAdapter } from './CharacterWorldAdapter.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { CharacterResourcePool } from './CharacterResourcePool.js';
import { characterGeometryOptionsFor, characterResourceKey } from './CharacterGeometryOptions.js';
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
    preparationBudgetMs = {high:1,low:1}, getPlayerState = null, getViewState = null } = {}) {
    this.camera=camera;this.document=documentObject;this.disposed=false;this.lastError=null;this.lastFailure=null;this.lastDaylight=1;
    this.getViewState=getViewState;this.residentResourceUsers=new Map();this.resourcePriorities=new Map();this.modelInterestActive=false;
    this.preparationBudgetMs=preparationBudgetMs;this.totalUpdateSamples=[];this.lastPreparation=null;
    this.validation=validateCharacterRegistry(registry);
    const effectiveRegistry=this.validation.valid?registry:{actors:[],templates:[],anchors:[],surfaces:[],seats:[],paths:[],ceremonies:[]};
    this.pool=new CharacterResourcePool();this.metrics=new Map();
    this.world=adapter??new CharacterWorldAdapter({scene,collisionManager,zoneManager,interiors,registry:effectiveRegistry});
    this.renderer=renderer??new CharacterRenderer({scene,pool:this.pool,requestPreparation:actor=>this.prepareVisible(actor)});
    this.ceremony=new CeremonyController(effectiveRegistry.ceremonies?.[0]);
    this.interaction=new CharacterInteraction({collisionManager,getPlayerState,registry:effectiveRegistry});
    const readonlyAdapter={
      getRevision:actor=>this.world.getRevision?.(actor)??this.world.getGeneration?.(actor.zoneRef),
      resolve:actor=>this.world.request?this.world.request(actor,a=>this.metricsFor(a),{priority:()=>this.world.preparationPriority?.(actor,this.getViewState?.()?.position??this.camera?.position)??0,yieldAfterReady:()=>{const view=this.getViewState?.(),limit=view?.mode==='flight'?140:45;return (this.world.preparationPriority?.(actor,view?.position??this.camera?.position)??Infinity)<=limit*limit;}}):this.world.resolve(actor,this.metricsFor(actor)),
    };
    this.manager=new CharacterManager({registry:effectiveRegistry,adapter:readonlyAdapter,renderer:this.renderer,
      enabled:this.validation.valid,contentEnabled,interaction:this.interaction,
      getViewState:()=>this.getViewState?.()??{mode:'ground',position:this.camera?.position},prepareResidents:(resident,selected)=>this.prepareResidents(resident,selected),
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
      this.metrics.set(key,{...characterContactMetrics('seated',variant),seatVariant:variant});
    }
    return this.metrics.get(key);
  }
  prepareVisible(actor){
    const options=characterGeometryOptionsFor(actor),key=characterResourceKey(actor.templateId,actor.pose,actor.lod,options);
    if(this.pool.entries.has(key))return;
    const version=this.world._workVersion?.();
    if(!this.world.work||version===undefined)return;
    if(this.world.work.jobs.has('render:'+key))return;
    const pool=this.pool;
    this.world.work.request('render:'+key,function*(){yield* pool.prepare(actor.templateId,actor.pose,actor.lod,options);return{status:'ready'};},{version,identity:key,priority:()=>this.modelInterestActive?(this.resourcePriorities.get(key)??Infinity):-1,isCurrent:()=>!this.modelInterestActive||this.residentResourceUsers.has(key)}).then(result=>{if(!this.disposed&&result?.status==='error'){this.lastError=this.lastFailure=result.reason;this.setEnabled(false);}});
  }
  prepareResidents(residents,selected){
    const users=new Map(),descriptors=new Map(),priorities=new Map(),visibleIds=new Set(selected.map(a=>a.id));
    const add=(actor,priority)=>{const key=characterResourceKey(actor.templateId,actor.pose,actor.lod,characterGeometryOptionsFor(actor));if(!users.has(key))users.set(key,new Set());users.get(key).add(actor.id);descriptors.set(key,actor);priorities.set(key,Math.min(priorities.get(key)??Infinity,priority));};
    for(const actor of residents)add({...actor,lod:2},visibleIds.has(actor.id)?-2:1+(actor.distance??0)**2);
    const detailFloor=this.getViewState?.()?.mode==='flight'?140**2:45**2;
    for(const actor of selected)add(actor,detailFloor+(actor.distance??0)**2);
    // Publish the complete user table before cancelling any key. A later
    // actor in traversal may still require the same shared immutable model.
    this.modelInterestActive=true;this.residentResourceUsers=users;this.resourcePriorities=priorities;
    for(const key of this.world.work?.jobs?.keys()??[])if(key.startsWith('render:')&&!users.has(key.slice(7)))this.world.work.cancelKey(key,'No current resident model users');
    for(const actor of descriptors.values())this.prepareVisible(actor);
    let residentModels=0;
    for(const actor of residents)if([0,1,2].some(lod=>this.pool.entries.has(characterResourceKey(actor.templateId,actor.pose,lod,characterGeometryOptionsFor(actor)))))residentModels++;
    return{resident:residents.length,residentModels,modelPending:[...(this.world.work?.jobs?.keys()??[])].filter(k=>k.startsWith('render:')).length,preparedResources:this.pool.entries.size};
  }
  *prepareFor(actor){
    // First visible coarse pose only; detailed LODs and changed daily poses
    // enter the SAME bounded queue when actually requested by the renderer.
    const pose=actor.behavior?.basePose??'standing',options=characterGeometryOptionsFor(actor);
    yield* this.pool.prepare(actor.templateId,pose,2,options);
    // Seat validation retains the original exact authored contact metrics.
    if(actor.placement?.mode==='seat')yield* this.pool.prepare(actor.templateId,'seated',0,options);
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
  setEnabled(enabled){if(!this.validation.valid&&enabled)return;this.manager.setEnabled(enabled);if(!enabled){this.world.cancelPending?.('Characters disabled');this.residentResourceUsers.clear();this.resourcePriorities.clear();}}
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
