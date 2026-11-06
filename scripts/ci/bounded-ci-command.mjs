import {spawn} from 'node:child_process';
// Deadlines apply only to added checks. Signals target this ChildProcess only,
// never a process group or discovered PID. Timeout does not prove descendant cleanup.
export function runWithDeadline(spec,onData){
 if(!Number.isFinite(spec.timeoutSeconds)||spec.timeoutSeconds<=0)throw Error('Positive finite command deadline required');
 return new Promise(resolve=>{
  const child=spawn(spec.command,spec.args,{env:{...process.env,...spec.env},stdio:['ignore','pipe','pipe']});
  let done=false,timedOut=false,error;const timers=[];
  const finish=(code,signal)=>{if(done)return;done=true;for(const timer of timers)clearTimeout(timer);resolve({code,signal,error:timedOut?'Added command deadline exceeded; descendant cleanup is not verified':error,timedOut,...(timedOut?{descendantCleanupVerified:false}:{})});};
  child.stdout.on('data',onData);child.stderr.on('data',onData);
  child.on('error',e=>{error=e.stack;});child.on('close',(code,signal)=>finish(code,signal));
  const ms=spec.timeoutSeconds*1000;
  timers.push(setTimeout(()=>{timedOut=true;child.kill('SIGTERM');},Math.max(1,ms-500)));
  timers.push(setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},Math.max(2,ms-250)));
  timers.push(setTimeout(()=>{timedOut=true;child.kill('SIGKILL');child.stdout.destroy();child.stderr.destroy();finish(null,'DEADLINE');},ms));
 });
}
