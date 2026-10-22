import { CHARACTER_REGISTRY } from '../../../data/characters/index.js';
import { CharacterManager } from './CharacterManager.js';
import { CharacterWorldAdapter } from './CharacterWorldAdapter.js';
import { CharacterRenderer } from './CharacterRenderer.js';
import { CharacterResourcePool } from './CharacterResourcePool.js';
import { PatrolController } from './PatrolController.js';
import { CeremonyController } from './CeremonyController.js';
import { validateCharacterRegistry } from './CharacterSchema.js';

// Release owner changes this only after the user's concrete C1 visual review.
// Tests may inject approval to validate lifecycle; no query string bypass exists.
export const CHARACTER_ROLLOUT_APPROVED = false;
export class CharacterSystem {
  constructor({ scene, camera, collisionManager, zoneManager, interiors, registry = CHARACTER_REGISTRY,
    adapter = null, renderer = null, documentObject = globalThis.document, contentApproved = CHARACTER_ROLLOUT_APPROVED } = {}) {
    this.camera=camera;this.document=documentObject;this.disposed=false;this.lastError=null;
    this.validation=validateCharacterRegistry(registry);
    const effectiveRegistry=this.validation.valid?registry:{actors:[],templates:[],anchors:[],surfaces:[],seats:[],paths:[],ceremonies:[]};
    this.pool=new CharacterResourcePool();this.metrics=new Map();
    this.world=adapter??new CharacterWorldAdapter({scene,collisionManager,zoneManager,interiors,registry:effectiveRegistry});
    this.renderer=renderer??new CharacterRenderer({scene,pool:this.pool});
    this.ceremony=new CeremonyController(effectiveRegistry.ceremonies?.[0]);
    const readonlyAdapter={
      getRevision:actor=>this.world.getRevision?.(actor)??this.world.getGeneration?.(actor.zoneRef),
      resolve:actor=>this.world.resolve(actor,this.metricsFor(actor)),
    };
    this.manager=new CharacterManager({registry:effectiveRegistry,adapter:readonlyAdapter,renderer:this.renderer,
      enabled:this.validation.valid,contentApproved,
      patrolFactory:(actor,binding)=>{
        const b=actor.behavior;
        return new PatrolController({path:binding.path,
          speedMetersPerSecond:b.speedMetersPerSecond,pauseSeconds:b.pauseSeconds,followerSpacingMeters:b.followerSpacingMeters??1.4});
      }});
    if(!this.validation.valid)this.lastError=`Invalid character registry: ${this.validation.errors.map(e=>e.path+': '+e.message).join('; ')}`;
    this._visibility=()=>{if(this.document?.hidden)this.manager.hidden=true;};
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
  get enabled(){return this.manager.enabled;}
  setEnabled(enabled){if(!this.validation.valid&&enabled)return;this.manager.setEnabled(enabled);}
  update(dt,{daylight=1,quality='high',viewportHeight=1080}={}){
    if(this.disposed)return;
    try{this.manager.update(dt,{camera:this.camera,daylight,quality,viewportHeight,hidden:!!this.document?.hidden});}
    catch(error){this.lastError=String(error);this.manager.setEnabled(false);}
  }
  snapshot(){return{...this.manager.snapshot(),lastError:this.lastError,configurationValid:this.validation.valid,configurationErrors:this.validation.errors,
    ceremony:this.ceremony.sample(this.manager.simulationSeconds),worldQueries:{...this.world.stats}};}
  dispose(){if(this.disposed)return;this.disposed=true;this.document?.removeEventListener?.('visibilitychange',this._visibility);
    this.manager.dispose();this.world.dispose?.();this.metrics.clear();this.pool.dispose();this.ceremony.dispose();}
}
