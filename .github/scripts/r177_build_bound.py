#!/usr/bin/env python3
"""R177 ordinary npm build only. No CLI budget/command overrides or retries.

The importable supervisor permits small synthetic children in its separate tests.
The CLI always runs npm run build with the fixed Pages base and heap flags.
RSS is a sampled process-tree stop, not a kernel memory ceiling.
"""
import hashlib
import json
import math
import os
from pathlib import Path
import re
import selectors
import shutil
import signal
import subprocess
import sys
import time

MIB = 1024**2
GIB = 1024**3
RSS_CAP = 4*GIB
WALL_SECONDS = 12*60
LOG_CAP = 32*MIB
SAMPLE_SECONDS = 0.1
ADMISSION_INTERVAL = 1.0
MARGIN = 256*MIB
LOCK_SHA256 = 'e89d1c2e5f46fcd8571433e059f23b26463d9c0f317d78c09636190ab2d21b5c'
HEAP_FLAGS = '--max-old-space-size=2048 --max-semi-space-size=16'

class ResourceError(Exception):
    pass

def read(path):
    try:
        return Path(path).read_text().strip()
    except (OSError, UnicodeError) as exc:
        raise ResourceError(f'unreadable resource file: {path}') from exc

def number(value):
    if not re.fullmatch(r'[0-9]+',value):
        raise ResourceError(f'invalid nonnegative resource integer: {value!r}')
    return int(value)

def fields(text):
    return {p[0]:number(p[1]) for line in text.splitlines() if len(p:=line.split())==2}

def unescape_mount(value):
    return re.sub(r'\\([0-7]{3})',lambda m:chr(int(m[1],8)),value)

def resource_sample(proc=Path('/proc/self')):
    # Tests use a fake proc-self directory. The real meminfo is in /proc.
    mempath=Path('/proc/meminfo') if proc==Path('/proc/self') else proc/'meminfo'
    memtext=read(mempath);mem={}
    for line in memtext.splitlines():
        p=line.split()
        if p[0] in ('MemTotal:','MemAvailable:') and len(p)==3 and p[2]=='kB':
            mem[p[0][:-1]]=number(p[1])*1024
    if not 0<mem.get('MemAvailable',0)<=mem.get('MemTotal',0):
        raise ResourceError('missing or inconsistent host capacity/headroom')
    cgtext=read(proc/'cgroup');mounttext=read(proc/'mountinfo')
    v1=[line.split(':',2)[2] for line in cgtext.splitlines() if 'memory' in line.split(':',2)[1].split(',')]
    v2=[line.split(':',2)[2] for line in cgtext.splitlines() if line.startswith('0::')]
    kind='v1' if v1 else 'v2';paths=v1 if v1 else v2
    if len(paths)!=1 or not paths[0].startswith('/') or '..' in Path(paths[0]).parts:
        raise ResourceError('unresolved memory controller membership')
    matches=[]
    for line in mounttext.splitlines():
        a,sep,b=line.partition(' - ')
        if not sep:continue
        left=a.split();right=b.split()
        if len(left)<6 or len(right)<3:continue
        if (kind=='v2' and right[0]=='cgroup2') or (kind=='v1' and right[0]=='cgroup' and 'memory' in right[2].split(',')):
            matches.append((unescape_mount(left[3]),Path(unescape_mount(left[4]))))
    if len(matches)!=1 or matches[0][0]!='/':
        raise ResourceError('unresolved or hidden memory-controller mount root')
    root=matches[0][1];leaf=root/paths[0].lstrip('/')
    if not leaf.is_relative_to(root):raise ResourceError('invalid memory-controller path')
    if kind=='v2' and 'memory' not in read(root/'cgroup.controllers').split():
        raise ResourceError('memory controller unavailable at visible root')
    dirs=[];current=leaf
    while True:
        dirs.append(current)
        if current==root:break
        current=current.parent
        if len(dirs)>64:raise ResourceError('excessive controller ancestry')
    capacity=mem['MemTotal'];available=mem['MemAvailable'];quota=[];oom=[];raw=[]
    for directory in dirs:
        row={'path':str(directory)}
        if kind=='v2':
            if not (directory/'memory.max').exists():
                # Native cgroup-v2 roots have no resource-control files. A child
                # without the controller inherits its verified parent's bound.
                # Missing enabled non-root controls remain an error.
                # The true cgroup-v2 root has no cgroup.type or resource-control
                # interface files. Only non-root nodes require a domain type.
                if directory==root:
                    if any((directory/key).exists() for key in ('memory.current','memory.high','memory.events')):
                        raise ResourceError('unreadable or partial root controls')
                    vmstat=Path('/proc/vmstat') if proc==Path('/proc/self') else proc/'vmstat'
                    vm=fields(read(vmstat))
                    if 'oom_kill' not in vm:raise ResourceError('missing host OOM counter for exempt root')
                    quota.append([kind,str(directory),'root-exempt'])
                    oom.append(['host',vm['oom_kill']]);row['interpretation']='root-exempt; physical bound'
                    raw.append(row);continue
                if read(directory/'cgroup.type')!='domain':
                    raise ResourceError('unsupported cgroup-v2 domain type')
                enabled=read(directory.parent/'cgroup.subtree_control').split()
                if 'memory' not in enabled:
                    quota.append([kind,str(directory),'inherited',enabled])
                    row['interpretation']='memory not enabled here; ancestor bounds apply'
                    raw.append(row);continue
            for key in ('memory.current','memory.max','memory.high','memory.events'):
                row[key]=read(directory/key)
            usage=number(row['memory.current']);maxval=row['memory.max'];high=row['memory.high']
            limits=[number(x) for x in (maxval,high) if x!='max']
            event=fields(row['memory.events'])
            if not all(k in event for k in ('oom','oom_kill')):raise ResourceError('missing OOM counters')
            oom.append([str(directory),event['oom'],event['oom_kill']])
            quota.append([kind,str(directory),maxval,high])
        else:
            for key in ('memory.usage_in_bytes','memory.limit_in_bytes','memory.soft_limit_in_bytes','memory.stat','memory.failcnt','memory.use_hierarchy'):
                row[key]=read(directory/key)
            if row['memory.use_hierarchy']!='1':raise ResourceError('v1 hierarchical accounting unavailable')
            usage=number(row['memory.usage_in_bytes']);limit=number(row['memory.limit_in_bytes'])
            stat=fields(row['memory.stat'])
            if 'hierarchical_memory_limit' not in stat:raise ResourceError('missing v1 hierarchical limit')
            # Large v1 sentinel limits are still recorded; physical RAM bounds capacity.
            limits=[limit,stat['hierarchical_memory_limit']]
            soft=number(row['memory.soft_limit_in_bytes'])
            if soft>0:limits.append(soft)
            oom.append([str(directory),number(row['memory.failcnt'])])
            quota.append([kind,str(directory),limit,stat['hierarchical_memory_limit'],soft])
        if usage>mem['MemTotal']:raise ResourceError('controller usage exceeds physical capacity')
        for limit in limits:
            if usage>limit:raise ResourceError('controller usage exceeds a constraining limit')
            capacity=min(capacity,limit)
            available=min(available,limit-usage)
        raw.append(row)
    if capacity<=0:raise ResourceError('zero effective capacity')
    return {'at':time.time(),'capacity':capacity,'available':available,'quota':quota,'oom':oom,
            'raw':{'host':mem,'cgroup':cgtext,'mountinfo':mounttext,'ancestors':raw}}

def reserve(sample):
    return max(GIB,math.ceil(sample['capacity']/5))

def atomic_json(path,value):
    tmp=path.with_suffix(path.suffix+'.tmp')
    with tmp.open('w') as out:
        json.dump(value,out,indent=2);out.write('\n');out.flush();os.fsync(out.fileno())
    os.replace(tmp,path)

def process_table():
    result={}
    for directory in Path('/proc').iterdir():
        if not directory.name.isdigit():continue
        try:
            stat=(directory/'stat').read_text();f=stat[stat.rfind(')')+2:].split()
            pid=int(directory.name);row={'pid':pid,'state':f[0],'ppid':int(f[1]),'pgid':int(f[2]),'start':int(f[19]),'rss':0,'hwm':0}
            status=(directory/'status').read_text()
            for line in status.splitlines():
                if line.startswith(('VmRSS:','VmHWM:')):
                    p=line.split();row['rss' if p[0]=='VmRSS:' else 'hwm']=int(p[1])*1024
            again=(directory/'stat').read_text();g=again[again.rfind(')')+2:].split()
            if int(g[19])!=row['start']:continue
            if row['state'] not in ('Z','X') and not re.search(r'^VmRSS:',status,re.M):
                # Kernel threads have no RSS; they cannot belong to the build tree.
                row['rss_unknown']=True
            result[pid]=row
        except FileNotFoundError:
            continue  # Process exited during a read; no live measurement invented.
        except (OSError,ValueError,IndexError) as exc:
            raise ResourceError(f'process measurement unavailable for PID {directory.name}') from exc
    return result

def owned_processes(pgid,known,birth):
    table=process_table();owned={}
    for pid,row in table.items():
        if (known.get(pid)==row['start']) or (row['pgid']==pgid and row['start']>=birth):owned[pid]=row
    changed=True
    while changed:
        changed=False
        for pid,row in table.items():
            if pid not in owned and row['ppid'] in owned and row['start']>=birth:
                owned[pid]=row;changed=True
    for pid,row in owned.items():
        known[pid]=row['start']
        if row.get('rss_unknown') and row['state'] not in ('Z','X'):
            raise ResourceError(f'live owned PID {pid} lacks RSS')
    return owned

def supervise(command,evidence,sampler,identity,env):
    evidence.mkdir(parents=True,exist_ok=True)
    started=time.monotonic();cancelled=[];child=None;known={};birth=0;pidfds={};group_verified=False;reaped=False
    result={'status':'FAIL','reason':None,'exit_code':1,'child_pid':None,'child_exit_code':None,
            'cleanup_complete':True,'identity':identity,'command':command,
            'limits':{'old_space_mib':2048,'semi_space_mib':16,'rss_bytes':RSS_CAP,'wall_seconds':WALL_SECONDS,'log_bytes':LOG_CAP,'sample_seconds':SAMPLE_SECONDS},
            'admission':[],'sample_count':0,'sampled_tree_peak_bytes':0,'observed_output_bytes':0,
            'owned_processes_observed':0,'direct_child_maxrss_bytes':None,'started_utc':time.time()}
    handlers={sig:signal.getsignal(sig) for sig in (signal.SIGINT,signal.SIGTERM)}
    for sig in handlers:signal.signal(sig,lambda s,f:cancelled.append(s))
    selector=selectors.DefaultSelector();pipe_open=False;log=None;exited=False;baseline=None;last_live=0;last_sample=0;wait_usage=None;shutdown_deadline=None;kill_deadline=None;termination_sent=False;killed=False
    def terminal():
        result['elapsed_seconds']=time.monotonic()-started
        result['finished_utc']=time.time();result['owned_processes_observed']=len(known)
        atomic_json(evidence/'build-terminal.json',result)
        return result
    def stop(reason):
        if result['reason'] is None:result['reason']=reason
    def observe_exit():
        nonlocal exited
        if child is None or exited:return
        # WNOWAIT retains the direct child's PID until all group signals finish.
        # Its session/group number therefore cannot be recycled underneath us.
        info=os.waitid(os.P_PID,child.pid,os.WEXITED|os.WNOHANG|os.WNOWAIT)
        if info:
            exited=True
            result['child_exit_code']=info.si_status if info.si_code==os.CLD_EXITED else -info.si_status
    def finish_reap():
        nonlocal reaped,wait_usage
        if child is None or reaped:return
        pid,status,usage=os.wait4(child.pid,os.WNOHANG)
        if pid:
            reaped=True;wait_usage=usage;child.returncode=os.waitstatus_to_exitcode(status)
            result['child_exit_code']=child.returncode
            result['direct_child_maxrss_bytes']=usage.ru_maxrss*1024
    def remember_handles(owned):
        # Capture a kernel-bound handle while an observed PID/start-time identity
        # is known. Cleanup never signals a bare detached PID after a scan failure.
        for pid,row in owned.items():
            key=(pid,row['start'])
            if key in pidfds or row['state'] in ('Z','X'):continue
            fd=None
            try:
                fd=os.pidfd_open(pid)
                stat=Path(f'/proc/{pid}/stat').read_text()
                fields=stat[stat.rfind(')')+2:].split()
                if int(fields[19])!=row['start']:
                    os.close(fd);continue
                pidfds[key]=fd
            except ProcessLookupError:
                if fd is not None:os.close(fd)
            except FileNotFoundError:
                if fd is not None:os.close(fd)
            except (OSError,ValueError,IndexError) as exc:
                if fd is not None:os.close(fd)
                raise ResourceError(f'cannot bind owned PID {pid} cleanup identity') from exc
    def signal_owned(sig):
        # The un-reaped Popen child anchors its private session even if every
        # fresh /proc enumeration fails. No numeric group survives final reaping.
        if group_verified and not reaped:
            try:os.killpg(child.pid,sig)
            except ProcessLookupError:pass
        for fd in pidfds.values():
            try:signal.pidfd_send_signal(fd,sig)
            except ProcessLookupError:pass
    try:
        for i in range(3):
            if cancelled:raise ResourceError('cancelled before admission')
            sample=sampler();result['admission'].append(sample)
            if sample['available']<RSS_CAP+reserve(sample)+MARGIN:raise ResourceError('insufficient actual runner headroom')
            if baseline and (sample['quota']!=baseline['quota'] or sample['oom']!=baseline['oom'] or sample['capacity']!=baseline['capacity']):
                raise ResourceError('resource identity changed during admission')
            baseline=sample
            if i<2:time.sleep(ADMISSION_INTERVAL)
        atomic_json(evidence/'build-preflight.json',result)
        if not hasattr(os,'pidfd_open') or not hasattr(signal,'pidfd_send_signal'):
            raise ResourceError('kernel-bound cleanup handles unavailable')
        # A durable pre-spawn record makes incomplete launches visible.
        result['status']='STARTING';atomic_json(evidence/'build-started.json',result)
        log=(evidence/'build.log').open('wb',buffering=0)
        if cancelled:raise ResourceError('cancelled before child launch')
        child=subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,start_new_session=True,env=env)
        result['child_pid']=child.pid;result['cleanup_complete']=False
        group_verified=os.getpgid(child.pid)==child.pid and os.getsid(child.pid)==child.pid
        if not group_verified:raise ResourceError('new child session identity unverified')
        # The direct PID is owned and cannot be reused before wait4.
        pidfds[(child.pid,'direct-child')]=os.pidfd_open(child.pid)
        table=process_table();row=table.get(child.pid)
        if row:birth=row['start'];known[child.pid]=birth;remember_handles({child.pid:row})
        else:
            # A short-lived direct child can already be a zombie, but must remain
            # waitable. Use the launch clock as the conservative group-age bound.
            birth=int(time.clock_gettime(time.CLOCK_BOOTTIME)*os.sysconf('SC_CLK_TCK'))-1
        build_start=time.monotonic();grace=min(1.0,WALL_SECONDS/4);result['status']='RUNNING';atomic_json(evidence/'build-started.json',result)
        os.set_blocking(child.stdout.fileno(),False);selector.register(child.stdout,selectors.EVENT_READ);pipe_open=True
        while True:
            now=time.monotonic();observe_exit()
            if cancelled:stop('CANCELLED')
            if now-build_start>=WALL_SECONDS-2*grace:stop('WALL_LIMIT')
            if now-last_sample>=SAMPLE_SECONDS:
                last_sample=now
                try:
                    owned=owned_processes(child.pid,known,birth);remember_handles(owned);live=[r for r in owned.values() if r['state'] not in ('Z','X')]
                    rss=sum(r['rss'] for r in live);result['sample_count']+=1
                    result['sampled_tree_peak_bytes']=max(result['sampled_tree_peak_bytes'],rss)
                    if rss>RSS_CAP:stop('RSS_LIMIT')
                    sample=sampler();result['last_resource_sample']=sample
                    if sample['quota']!=baseline['quota'] or sample['capacity']!=baseline['capacity']:stop('RESOURCE_CHANGED')
                    if sample['oom']!=baseline['oom']:stop('OOM_COUNTER_CHANGED')
                    if sample['available']<reserve(sample)+MARGIN:stop('RESERVE_LOST')
                    if exited and live:stop('CHILD_LEFT_DESCENDANTS')
                except ResourceError as exc:
                    result['measurement_error']=str(exc);stop('RESOURCE_MEASUREMENT_FAILED')
                    live=[{'unresolved':True}]
            if wait_usage and wait_usage.ru_maxrss*1024>RSS_CAP:stop('RSS_LIMIT')
            if result['reason'] and not termination_sent:
                signal_owned(signal.SIGTERM);termination_sent=True;shutdown_deadline=now+grace
            if termination_sent and now>=shutdown_deadline and not killed:
                signal_owned(signal.SIGKILL);killed=True;kill_deadline=now+grace
            for key,_ in selector.select(timeout=min(SAMPLE_SECONDS,.05)):
                chunk=os.read(key.fd,65536)
                if not chunk:
                    selector.unregister(key.fileobj);pipe_open=False;continue
                before=result['observed_output_bytes'];result['observed_output_bytes']+=len(chunk)
                if before<LOG_CAP:log.write(chunk[:LOG_CAP-before])
                if result['observed_output_bytes']>LOG_CAP:stop('LOG_LIMIT')
            if now-last_live>=1:
                last_live=now;atomic_json(evidence/'build-live.json',result)
            if exited:
                remaining=owned_processes(child.pid,known,birth)
                if not any(r['state'] not in ('Z','X') for r in remaining.values()) and not pipe_open:
                    result['cleanup_complete']=True;break
            if killed and time.monotonic()>kill_deadline:
                stop('CLEANUP_FAILED');result['cleanup_complete']=False;break
        finish_reap()
        if not reaped:result['cleanup_complete']=False;stop('CLEANUP_FAILED')
        if wait_usage and wait_usage.ru_maxrss*1024>RSS_CAP:stop('RSS_LIMIT')
        result['build_elapsed_seconds']=time.monotonic()-build_start
        if result['reason'] is None:
            if result['child_exit_code']==0:result['status']='PASS';result['exit_code']=0
            else:result['status']='FAIL';result['reason']='CHILD_EXIT_NONZERO';result['exit_code']=result['child_exit_code'] if result['child_exit_code']>0 else 128-result['child_exit_code']
        else:
            result['status']='FAIL';result['exit_code']=128+cancelled[0] if cancelled else 1
        return terminal()
    except (ResourceError,OSError,ValueError) as exc:
        result['status']='FAIL';result['detail']=str(exc)
        result['reason']=result['reason'] or ('PRECHECK_REJECTED' if child is None else 'SUPERVISOR_ERROR')
        if cancelled:result['reason']='CANCELLED';result['exit_code']=128+cancelled[0]
        if child is not None:
            try:
                signal_owned(signal.SIGTERM);time.sleep(.1);signal_owned(signal.SIGKILL)
                end=time.monotonic()+1
                while not exited and time.monotonic()<end:observe_exit();time.sleep(.01)
                # Reap the direct child even when the following full-tree audit
                # remains unavailable. Unknown scope is not a cleanup success.
                finish_reap()
                remaining=owned_processes(child.pid,known,birth)
                result['cleanup_complete']=reaped and not any(r['state'] not in ('Z','X') for r in remaining.values())
            except (ResourceError,OSError) as cleanup:
                result['cleanup_error']=str(cleanup);result['cleanup_complete']=False
        return terminal()
    finally:
        selector.close()
        if log:log.close()
        if child and child.stdout:child.stdout.close()
        for fd in pidfds.values():os.close(fd)
        for sig,handler in handlers.items():signal.signal(sig,handler)

def main():
    evidence=Path(os.environ['EVIDENCE_DIR'])
    try:
        if len(sys.argv)!=1:raise ResourceError('no command or resource overrides accepted')
        for key in ('NODE_OPTIONS','TEST_GC','NODE_V8_COVERAGE','NODE_PATH'):
            if os.environ.get(key):raise ResourceError(f'unexpected inherited {key}')
        def command(*args):return subprocess.check_output(args,text=True).strip()
        head=command('git','rev-parse','HEAD')
        if not re.fullmatch('[0-9a-f]{40}',os.environ.get('GITHUB_SHA','')) or head!=os.environ['GITHUB_SHA']:
            raise ResourceError('checkout differs from exact event commit')
        if command('git','status','--porcelain=v1','--untracked-files=all'):raise ResourceError('build checkout is dirty')
        if command('node','--version')!='v24.22.1' or command('npm','--version')!='11.19.1':raise ResourceError('unexpected pinned toolchain')
        hashes={name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in ('package.json','package-lock.json')}
        if hashes['package-lock.json']!=LOCK_SHA256:raise ResourceError('unexpected lockfile')
        identity={'head':head,'tree':command('git','rev-parse','HEAD^{tree}'),'hashes':hashes,
                  'wrapper_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  'node':shutil.which('node'),'npm':shutil.which('npm'),'node_version':'24.22.1','npm_version':'11.19.1','base':'/forbidden-city-3d/'}
        env=os.environ.copy();env['NODE_OPTIONS']=HEAP_FLAGS;env['VITE_BASE']='/forbidden-city-3d/'
        result=supervise([identity['npm'],'run','build'],evidence,resource_sample,identity,env)
    except (KeyError,OSError,ResourceError,subprocess.CalledProcessError) as exc:
        result={'status':'FAIL','reason':'IDENTITY_PRECHECK_REJECTED','detail':str(exc),'exit_code':1,'child_pid':None,'cleanup_complete':True}
        evidence.mkdir(parents=True,exist_ok=True);atomic_json(evidence/'build-terminal.json',result)
    print(json.dumps({k:result.get(k) for k in ('status','reason','exit_code','child_exit_code','cleanup_complete')}))
    return result['exit_code']

if __name__=='__main__':raise SystemExit(main())
