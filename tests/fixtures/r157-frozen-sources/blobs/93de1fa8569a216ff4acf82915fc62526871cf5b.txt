/** One scene clock. Waiting tableau only; no falsely labelled full ritual. */
export class CeremonyController {
 constructor(config={}){this.id=config.id??'taihe-audience';if(config.formalExcerptEnabled)throw new Error('Formal ceremony excerpt is not validated for this release');this.mode='waiting-only';this.disposed=false;}
 sample(simulationSeconds,{isDay=true}={}){if(!Number.isFinite(simulationSeconds)||simulationSeconds<0)throw new Error('Finite nonnegative simulation time required');return{ceremonyRef:this.id,phase:isDay?'waiting':'night-hold',phaseStartedAtSeconds:0,elapsedSeconds:simulationSeconds,pose:'standing',formalExcerptEnabled:false};}
 update(simulationSeconds,context){if(this.disposed)return null;return this.sample(simulationSeconds,context);}
 dispose(){this.disposed=true;}
}
