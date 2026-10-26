/** Cooperative work, advanced ONLY by the existing scene update.
 * A deadline is checked before every bounded generator step. JavaScript cannot
 * preempt a step or GC; overshoot and the slowest step are therefore reported.
 * There are no microtask work loops, workers, RAFs, or per-character timers. */
export class CharacterWorkQueue {
 constructor({now=()=>performance.now(),maxPending=192}={}){
  this.now=now;this.maxPending=maxPending;this.jobs=new Map();this.disposed=false;this.active=null;this.priorityTurns=0;
  this.stats={frames:0,steps:0,completed:0,cancelled:0,totalCpuMs:0,maxFrameMs:0,maxStepMs:0,maxStepKind:null,maxStepWorkUnits:0,maxOverrunMs:0};
 }
 request(key,factory,{version=null,identity=null,isCurrent=null,priority=0}={}){
  if(this.disposed)return Promise.resolve({status:'pending',reason:'Work queue disposed'});
  const prior=this.jobs.get(key);if(prior?.version===version&&prior.identity===identity)return prior.promise;
  if(prior)this._cancel(prior,'Replaced work version');
  if(this.jobs.size>=this.maxPending)return Promise.resolve({status:'error',reason:'Character preparation queue capacity exceeded'});
  let settle;const promise=new Promise(resolve=>{settle=resolve});
  this.jobs.set(key,{key,factory,iterator:null,version,identity,isCurrent,priority,promise,settle});return promise;
 }
 _cancel(job,reason){
  this.jobs.delete(job.key);if(this.active===job)this.active=null;try{job.iterator?.return?.();}finally{job.settle({status:'pending',reason});this.stats.cancelled++;}
 }
 cancel(reason='Character preparation cancelled'){for(const job of this.jobs.values())this._cancel(job,reason);}
 _next(){
  if(this.active&&this.jobs.get(this.active.key)===this.active)return this.active;
  let chosen=this.jobs.values().next().value;
  // Keep a started generator contiguous: preparation may share template caches.
  // Every fourth selection is oldest-first, bounding starvation under movement.
  if(this.priorityTurns<3){let best=Infinity;for(const job of this.jobs.values()){const value=typeof job.priority==='function'?job.priority():job.priority;const rank=Number.isFinite(value)?value:Infinity;if(rank<best){best=rank;chosen=job;}}this.priorityTurns++;}
  else this.priorityTurns=0;
  return this.active=chosen;
 }
 advance({budgetMs=1,maxSteps=512,version=null}={}){
  const start=this.now(),budget=Math.max(0,Number.isFinite(budgetMs)?budgetMs:0),deadline=start+budget;
  let steps=0,maxStepMs=0;
  // At most maxPending small cancellation operations; no old iterator resumes.
  for(const job of this.jobs.values())if(job.version!==version||job.isCurrent&&!job.isCurrent())this._cancel(job,'World or character specification changed');
  while(!this.disposed&&this.jobs.size&&steps<maxSteps&&this.now()<deadline){
   const job=this._next(),stepStart=this.now();let stepKind='completion';
   try{
    job.iterator??=job.factory();const result=job.iterator.next();
    if(result.done){this.active=null;this.jobs.delete(job.key);this.stats.completed++;job.settle(result.value);}
    else if(result.value){const {workUnits=0,maxWorkUnits=256}=result.value;stepKind=result.value.kind+':'+(result.value.phase??'');if(!(workUnits>=0&&workUnits<=maxWorkUnits&&maxWorkUnits<=256))throw Error('Unbounded character preparation step');this.stats.maxStepWorkUnits=Math.max(this.stats.maxStepWorkUnits,workUnits);}
   }catch(error){this.active=null;this.jobs.delete(job.key);try{job.iterator?.return?.();}catch{}job.settle({status:'error',reason:String(error)});}
   const elapsed=this.now()-stepStart;if(elapsed>this.stats.maxStepMs){this.stats.maxStepMs=elapsed;this.stats.maxStepKind=stepKind;}maxStepMs=Math.max(maxStepMs,elapsed);steps++;
  }
  const elapsedMs=this.now()-start,overrunMs=Math.max(0,elapsedMs-budget);
  this.stats.frames++;this.stats.steps+=steps;this.stats.totalCpuMs+=elapsedMs;this.stats.maxFrameMs=Math.max(this.stats.maxFrameMs,elapsedMs);this.stats.maxStepMs=Math.max(this.stats.maxStepMs,maxStepMs);this.stats.maxOverrunMs=Math.max(this.stats.maxOverrunMs,overrunMs);
  return {steps,elapsedMs,maxStepMs,overrunMs,pending:this.jobs.size};
 }
 snapshot(){return {...this.stats,pending:this.jobs.size};}
 dispose(){if(this.disposed)return;this.cancel('Character preparation disposed');this.disposed=true;}
}
