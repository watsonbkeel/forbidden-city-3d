from pathlib import Path
import os,re,time,signal,subprocess,threading,resource
from evidence_io import guard_write

def parse_proc(pid,status,stat):
 fields=stat[stat.rfind(')')+2:].split()
 if len(fields)<20:raise ValueError('incomplete stat for '+str(pid))
 def number(name):
  m=re.search('^'+name+r':\s+(\d+)',status,re.M)
  return int(m.group(1))if m else None
 return {'kind':'present','pid':pid,'starttime':int(fields[19]),'state':fields[0],'ppid':int(fields[1]),'pgid':int(fields[2]),'rssKiB':number('VmRSS'),'hwmKiB':number('VmHWM')}
def read_proc(pid):
 try:return parse_proc(pid,Path('/proc/'+str(pid)+'/status').read_text(),Path('/proc/'+str(pid)+'/stat').read_text())
 except (FileNotFoundError,ProcessLookupError):return {'kind':'gone','pid':pid}
 except (OSError,ValueError)as e:return {'kind':'unknown','pid':pid,'error':repr(e)}
def scan_proc():
 try:return {int(p.name):read_proc(int(p.name))for p in Path('/proc').iterdir()if p.name.isdigit()}
 except OSError as e:return {'scanError':repr(e)}
class MonitorState:
 def __init__(self,runner_pid,pgid,*,limit_mib=350):
  self.limit_mib=limit_mib
  self.runner=runner_pid;self.pgid=pgid;self.known={(runner_pid,None):{'pid':runner_pid,'starttime':None}};self.failure=None;self.term_at=None;self.kill_sent=False;self.ever_unknown=[]
 def tick(self,seconds,table,reader_done,runner_exit,worker_pid=None,reader_error=None):
  if worker_pid and not any(k[0]==worker_pid for k in self.known):self.known[(worker_pid,None)]={'pid':worker_pid,'starttime':None}
  changed=True
  while changed:
   changed=False;pids={pid for(pid,start)in self.known if table.get(pid,{}).get('kind')=='present'and(start is None or table[pid]['starttime']==start)and table[pid]['state']not in['Z','X','x']}
   for pid,q in table.items():
    if not isinstance(pid,int)or q.get('kind')!='present':continue
    real=any(k[0]==pid and k[1]is not None for k in self.known)
    if q['pgid']==self.pgid or q['ppid']in pids or pid in[self.runner,worker_pid]and not real:
     key=(pid,q['starttime'])
     if key not in self.known:
      self.known.pop((pid,None),None);self.known[key]={'pid':pid,'starttime':q['starttime']};changed=True
  alive=[];unknown=[];zombies=[];exited=[];reused=[]
  for(pid,start),original in self.known.items():
   q=table.get(pid,{'kind':'gone','pid':pid})
   if q['kind']=='unknown':unknown.append({**original,'error':q.get('error','unknown proc')});continue
   if q['kind']=='gone':exited.append(original);continue
   if start is not None and q['starttime']!=start:reused.append({**original,'replacementStarttime':q['starttime']});continue
   if q['state']in['Z','X','x']:zombies.append(q);continue
   alive.append(q)
   if q['rssKiB']is None:unknown.append({**q,'error':'live VmRSS absent'})
  if table.get('scanError'):unknown.append({'error':'proc enumeration failed: '+table['scanError']})
  if unknown:self.ever_unknown.append({'seconds':seconds,'unknown':unknown})
  total=None if unknown else sum(q['rssKiB']for q in alive)
  if self.failure is None:
   if unknown:self.failure='live-rss-unknown'if any(q.get('error')=='live VmRSS absent'for q in unknown)else'proc-read-unknown'
   elif reader_error:self.failure='reader-error'
   elif seconds>180:self.failure='watchdog180s'
   elif total>self.limit_mib*1024:self.failure='node-tree-RSS-over'+str(self.limit_mib)+'MiB'
  request=None;give_up=False
  if self.failure:
   if self.term_at is None:self.term_at=seconds;request='TERM'
   elif seconds-self.term_at>=3 and not self.kill_sent:self.kill_sent=True;request='KILL'
   elif seconds-self.term_at>=5:give_up=True
  complete=not alive and not unknown and not zombies and reader_done and runner_exit is not None
  return {'seconds':round(seconds,3),'alive':alive,'unknown':unknown,'zombies':zombies,'exited':exited,'reused':reused,'sumRSSKiB':total,'readerDone':reader_done,'readerError':reader_error,'nodeExitCode':runner_exit,'complete':complete,'failureReason':self.failure,'signalRequest':request,'giveUp':give_up,'knownIdentities':list(self.known.values()),'hadUnknown':bool(self.ever_unknown)}
def wrapper_exit(node_exit,final,inputs_unchanged):
 return 0 if node_exit==0 and inputs_unchanged and final['complete']and not final['failureReason']and not final['alive']and not final['unknown']and not final['zombies']and not final['hadUnknown']and final['readerDone']else 1

def signal_known(pgid,entries,sig):
 actions=[];verified=[]
 for q in entries:
  now=read_proc(q['pid'])
  if now['kind']=='present'and now['starttime']==q['starttime']and now['state']not in['Z','X','x']:verified.append(now)
  else:actions.append({'pid':q['pid'],'action':'not signalled; gone, reused or unverifiable','observed':now})
 if any(q['pgid']==pgid for q in verified):
  try:os.killpg(pgid,sig);actions.append({'group':pgid,'signal':sig,'result':'sent after identity check'})
  except OSError as e:actions.append({'group':pgid,'signal':sig,'result':repr(e)})
 for q in verified:
  if q['pgid']==pgid:continue
  try:os.kill(q['pid'],sig);actions.append({'pid':q['pid'],'starttime':q['starttime'],'signal':sig,'result':'sent after identity check'})
  except OSError as e:actions.append({'pid':q['pid'],'result':repr(e)})
 return actions

def run_process(command,cwd,env,log_path,*,started_at=None,node_limit_mib=350,resource_guard=None):
 start=time.monotonic()if started_at is None else started_at;p=subprocess.Popen(command,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,bufsize=1,start_new_session=True);state={'workerPid':None,'lastStage':None,'readerError':None};done=threading.Event();tracker=MonitorState(p.pid,p.pid,limit_mib=node_limit_mib);samples=[];actions=[]
 def reader():
  try:
   with Path(log_path).open('w')as f:
    for line in p.stdout:
     if resource_guard is not None:guard_write(Path(log_path).parent,len(line.encode()))
     f.write(line);f.flush()
     if resource_guard is not None:guard_write(Path(log_path).parent)
     m=re.search(r'PROBE_WORKER_PID=(\d+)',line)
     if m:state['workerPid']=int(m.group(1))
     m=re.search(r'STAGE ([\w-]+)',line)
     if m:state['lastStage']=m.group(1)
  except BaseException as e:state['readerError']=repr(e)
  finally:done.set()
 thread=threading.Thread(target=reader,daemon=True);thread.start()
 while True:
  runner_exit=p.poll()  # Reap only our direct runner before taking this iteration's proc snapshot.
  table=scan_proc()
  final=tracker.tick(time.monotonic()-start,table,done.is_set(),runner_exit,state['workerPid'],state['readerError'])
  remote=None
  if resource_guard is not None:
   try:remote=resource_guard(table,final['alive'])
   except BaseException as error:remote={'ok':False,'error':repr(error),'violations':['resource-state-unknown']}
   if remote.get('ok')is not True and tracker.failure is None:
    tracker.failure='remote-resource-contract'
    final=tracker.tick(time.monotonic()-start,table,done.is_set(),runner_exit,state['workerPid'],state['readerError'])
  samples.append({**final,'lastStage':state['lastStage'],'remoteResources':remote})
  if final['signalRequest']:actions.extend(signal_known(p.pid,final['alive'],signal.SIGTERM if final['signalRequest']=='TERM'else signal.SIGKILL))
  if final['complete']or final['giveUp']:break
  time.sleep(.05)
 thread.join(timeout=.1)
 code=p.poll();uncertain=bool(final['alive']or final['unknown']or final['zombies']or not done.is_set()or code is None)
 result={'command':command,'cwd':str(cwd),'environment':{'GIT_OPTIONAL_LOCKS':env.get('GIT_OPTIONAL_LOCKS'),'NODE_OPTIONS':env.get('NODE_OPTIONS')},'exitCode':code,'signal':-code if code is not None and code<0 else None,'terminationReason':final['failureReason'],'durationSeconds':round(time.monotonic()-start,3),'runnerPid':p.pid,**state,'sampleCount':len(samples),'sampledNodeTreeMaxRSSKiB':max([q['sumRSSKiB']for q in samples if q['sumRSSKiB']is not None],default=None),'resourceRUSAGE_CHILDRENmaxRSSKiB':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss,'allKnownProcessFinal':final,'signalActions':actions,'uncertainOutcome':uncertain,'readerClosed':done.is_set(),'runnerReapedByPythonPoll':code is not None,'descendantReaping':'not performed by wrapper; gone/reused snapshots only','scope':'shared bounded monitor; actual fixture scope belongs to caller'}
 return result,samples,final
