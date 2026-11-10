#!/usr/bin/env python3
"""E45 candidate-only supervisor with a fixed CI launch path.

Synthetic tests call internal functions with tiny Python children. Production
main uses only the fixed context, exact input pins and real resource admission.
No H17 role, comparison tree, child writer, generic command or retry protocol.
"""
from dataclasses import dataclass
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import re
import selectors
import signal
import stat
import subprocess
import sys
import time
from types import MappingProxyType

MIB=1024**2
GIB=1024**3
RSS_CAP=3*GIB
WALL_SECONDS=90.0
OUTPUT_CAP=16*MIB
TERMINAL_RESERVE=64*1024
MAX_RESULT=MIB
SAMPLE_SECONDS=.1
ADMISSION_INTERVAL=1.0
MARGIN=256*MIB
FROZEN_SHA='e33618941b55f134b6e455cae016033e08412d7849e1d1b26a414f33ec88e8a3'
ENTRY='tests/r181-qianxing-gate/eight-zone/run.mjs'
ROLE='e45-eight-zone'
NAMES={'input-manifest.json','admission.json','resource-initial-raw.json',
       'resource-decisions.jsonl','started.json','stdout.json','stderr.log'}

class BindingError(Exception): pass
class EvidenceError(Exception): pass

def digest(data): return hashlib.sha256(data).hexdigest()
def canonical(value):
    return (json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode()
def walk_error(exc): raise exc

def exact_path(path):
    p=Path(path)
    if not p.is_absolute() or p.resolve(strict=True)!=p:
        raise BindingError('root must be absolute, existing and symlink-free')
    return p

def file_identity(path):
    s=path.lstat()
    if not stat.S_ISREG(s.st_mode) or s.st_nlink!=1:raise BindingError('input manifest is not a unique regular file')
    return (s.st_dev,s.st_ino,s.st_mode,s.st_size,s.st_mtime_ns,s.st_ctime_ns)

@dataclass(frozen=True)
class InputSeal:
    root:Path
    root_identity:tuple
    file_identity:tuple
    sha256:str
    def verify(self):
        try:
            root=exact_path(self.root);s=root.stat()
            if (s.st_dev,s.st_ino)!=(self.root_identity):raise BindingError('validation root identity changed')
            p=root/'input-manifest.json'
            if file_identity(p)!=self.file_identity or digest(p.read_bytes())!=self.sha256:
                raise BindingError('immutable input manifest changed')
        except OSError as exc:raise BindingError('immutable input manifest unavailable') from exc

def strict_json(raw):
    def pairs(items):
        out={}
        for key,value in items:
            if key in out: raise EvidenceError('DUPLICATE_JSON_KEY')
            out[key]=value
        return out
    def constant(value): raise EvidenceError('NONFINITE_JSON')
    def floating(value):
        num=float(value)
        if not math.isfinite(num): raise EvidenceError('NONFINITE_JSON')
        return num
    try:
        return json.loads(raw.decode('utf-8'),object_pairs_hook=pairs,
                          parse_constant=constant,parse_float=floating)
    except (ValueError,UnicodeError,RecursionError) as exc:
        raise EvidenceError('INVALID_JSON') from exc

def parse_font_query(raw,family,index,postscript):
    """Pure parser for the fixed fc-query format; never invents glyph coverage."""
    try: lines=raw.decode('utf-8').splitlines()
    except UnicodeError as exc: raise BindingError('FONT_QUERY_ENCODING') from exc
    if len(lines)!=5 or lines[0]!=family or not lines[1] or lines[2]!=str(index) or lines[3]!=postscript:
        raise BindingError('FONT_QUERY_FACE_IDENTITY')
    ranges=[]
    for token in lines[4].split():
        if not re.fullmatch('[0-9a-f]+(?:-[0-9a-f]+)?',token): raise BindingError('FONT_QUERY_CHARSET')
        values=[int(n,16) for n in token.split('-')];lo=values[0];hi=values[-1]
        if not 0<=lo<=hi<=0x10ffff or (ranges and lo<=ranges[-1][1]):
            raise BindingError('FONT_QUERY_RANGE')
        ranges.append([lo,hi])
    if not ranges: raise BindingError('FONT_QUERY_EMPTY')
    return ranges

def output_identity(s):
    return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)

class EvidenceBudget:
    """Single parent owner, prewrite ledger. Not a filesystem sandbox.

    Unknown direct writes are detected, not prevented. Pending failed writes
    remain charged; incomplete evidence can never be used for acceptance.
    """
    def __init__(self,root,cap=OUTPUT_CAP,reserve=TERMINAL_RESERVE):
        self.root=exact_path(root);self.cap=cap;self.reserve=reserve
        if not 0<reserve<cap: raise EvidenceError('INVALID_BUDGET')
        if any(self.root.iterdir()): raise EvidenceError('FRESH_ROOT_REQUIRED')
        s=self.root.stat();self.root_identity=(s.st_dev,s.st_ino)
        self.records={};self.used=0;self.pending=0;self.finalized=False
    def check_root(self):
        try:
            root=exact_path(self.root);s=root.stat()
            if (s.st_dev,s.st_ino)!=self.root_identity: raise EvidenceError('ROOT_CHANGED')
        except (OSError,BindingError) as exc: raise EvidenceError('ROOT_UNAVAILABLE') from exc
    def audit(self,terminal=False):
        self.check_root();seen={}
        try:
            for current,dirs,files in os.walk(self.root,followlinks=False,onerror=walk_error):
                for name in dirs:
                    p=Path(current)/name
                    if p.is_symlink() or p.relative_to(self.root).as_posix() not in {'tmp','home','cache'}:
                        raise EvidenceError('UNTRACKED_DIRECTORY')
                for name in files:
                    p=Path(current)/name;s=p.lstat();key=p.relative_to(self.root).as_posix()
                    if not stat.S_ISREG(s.st_mode) or s.st_nlink!=1: raise EvidenceError('UNACCOUNTABLE_OUTPUT')
                    seen[key]=output_identity(s)
        except OSError as exc: raise EvidenceError('AUDIT_UNREADABLE') from exc
        if seen!=self.records or sum(row[4] for row in seen.values())!=self.used:
            raise EvidenceError('UNTRACKED_OUTPUT_OR_DRIFT')
        if self.pending: raise EvidenceError('UNRESOLVED_WRITE')
        if self.used>self.cap-(0 if terminal or self.finalized else self.reserve):
            raise EvidenceError('TOTAL_EVIDENCE_LIMIT')
        return self.used
    def _write(self,name,data,append,terminal):
        if not isinstance(data,bytes): raise EvidenceError('OUTPUT_TYPE')
        if terminal:
            if name!='terminal.json': raise EvidenceError('TERMINAL_NAME')
        else:
            if self.finalized: raise EvidenceError('TERMINAL_ALREADY_WRITTEN')
            if name not in NAMES: raise EvidenceError('OUTPUT_NAME')
        self.audit(terminal=terminal)
        old=self.records.get(name);old_size=old[4] if old else 0
        new_size=old_size+len(data) if append else len(data);delta=new_size-old_size
        if self.used+self.pending+delta>self.cap-(0 if terminal else self.reserve):
            raise EvidenceError('TOTAL_EVIDENCE_LIMIT')
        held=max(delta,0);self.pending+=held
        p=self.root/name
        try:
            flags=os.O_WRONLY|os.O_NOFOLLOW|(os.O_APPEND if append else 0)
            flags|=os.O_CREAT|os.O_EXCL if old is None else 0
            fd=os.open(p,flags,0o600)
            with os.fdopen(fd,'ab' if append else 'wb',buffering=0) as out:
                s=os.fstat(out.fileno())
                if not stat.S_ISREG(s.st_mode) or s.st_nlink!=1 or (old and output_identity(s)!=old):
                    raise EvidenceError('OUTPUT_IDENTITY_CHANGED')
                if not append: os.ftruncate(out.fileno(),0)
                offset=0
                while offset<len(data):
                    n=out.write(data[offset:])
                    if not n: raise EvidenceError('OUTPUT_SHORT_WRITE')
                    offset+=n
                os.fsync(out.fileno());after=os.fstat(out.fileno())
                if after.st_size!=new_size: raise EvidenceError('OUTPUT_SIZE_CHANGED')
            self.records[name]=output_identity(after);self.pending-=held;self.used+=delta
        except OSError as exc: raise EvidenceError('OUTPUT_WRITE_FAILED') from exc
    def write(self,name,data,append=False): self._write(name,data,append,False)
    def terminal(self,receipt):
        data=canonical(receipt)
        if len(data)>self.reserve: raise EvidenceError('TERMINAL_METADATA_LIMIT')
        self._write('terminal.json',data,False,True);self.finalized=True;self.audit(terminal=True)
    def seal_input(self,data):
        if 'input-manifest.json' in self.records: raise EvidenceError('INPUT_ALREADY_SEALED')
        self.write('input-manifest.json',data)
        seal=InputSeal(self.root,self.root_identity,file_identity(self.root/'input-manifest.json'),digest(data))
        seal.verify();return seal

@dataclass(frozen=True)
class CommandPlan:
    command:tuple
    cwd:Path
    env:dict
    def __post_init__(self):
        object.__setattr__(self,'command',tuple(self.command))
        object.__setattr__(self,'env',MappingProxyType(dict(self.env)))

def command_plan(node,candidate,evidence,input_sha):
    """Pure construction, never launch authorization or inventory verification."""
    node,candidate,evidence=map(exact_path,(node,candidate,evidence))
    if not re.fullmatch('[a-f0-9]{64}',input_sha): raise BindingError('INPUT_HASH')
    if evidence.is_relative_to(candidate) or candidate.is_relative_to(evidence):
        raise BindingError('INPUT_OUTPUT_OVERLAP')
    entry=candidate/ENTRY
    if exact_path(entry)!=entry: raise BindingError('ENTRY_PATH')
    env={'LANG':'C.UTF-8','TZ':'UTC','DISABLE_SYSTEM_FONTS_LOAD':'1','E45_INPUT_MANIFEST':str(evidence/'input-manifest.json'),
         'E45_INPUT_SHA256':input_sha,'TMPDIR':str(evidence/'tmp'),'TMP':str(evidence/'tmp'),
         'TEMP':str(evidence/'tmp'),'HOME':str(evidence/'home'),'XDG_CACHE_HOME':str(evidence/'cache')}
    return CommandPlan((str(node),'--max-old-space-size=1536','--max-semi-space-size=16',str(entry)),candidate,env)

def validate_result(raw,binding,full_validator):
    """Envelope + exact author result audit, fail closed if auditor is missing.

    Production audit is not implemented by synthetic fixtures. Activation must
    bind full_validator to the independently reviewed concrete E45 schema, never
    a user-provided callback or a permissive field-presence check.
    """
    if len(raw)>MAX_RESULT: raise EvidenceError('RESULT_SIZE')
    obj=strict_json(raw)
    if not isinstance(obj,dict) or obj.get('schema')!='e45-eight-zone-result/v1':
        raise EvidenceError('RESULT_SCHEMA')
    for key,value in binding.items():
        if obj.get(key)!=value: raise EvidenceError('RESULT_IDENTITY_'+key)
    if obj.get('status') not in ('PASS','FAIL','INCOMPLETE'): raise EvidenceError('RESULT_STATUS')
    if type(obj.get('completed')) is not bool or type(obj.get('cleanup_complete')) is not bool:
        raise EvidenceError('RESULT_COMPLETION_TYPE')
    if full_validator is None: raise EvidenceError('FULL_E45_SCHEMA_AUDIT_NOT_BOUND')
    try: full_validator(obj,binding)
    except Exception as exc: raise EvidenceError('FULL_SCHEMA_REJECTED: '+str(exc)[:256]) from exc
    if obj['status']=='PASS' and (not obj['completed'] or not obj['cleanup_complete']):
        raise EvidenceError('RESULT_INCOMPLETE')
    return obj['status']

def load_frozen(path):
    path=exact_path(path)
    if digest(path.read_bytes())!=FROZEN_SHA:raise BindingError('frozen R177 helper digest mismatch')
    spec=importlib.util.spec_from_file_location('e45_frozen_r177',path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    return mod

def owned_snapshot(frozen,pgid,known,birth):
    """R177 ownership semantics, plus a positive same-identity exit-race check.

    The frozen reader is unchanged. Never invent RSS=0 for an unknown/live PID.
    A no-RSS row is accepted only if a fresh stat proves the same start and Z/X.
    """
    table=frozen.process_table();owned={}
    for pid,row in table.items():
        if known.get(pid)==row['start'] or (row['pgid']==pgid and row['start']>=birth):owned[pid]=row
    changed=True
    while changed:
        changed=False
        for pid,row in table.items():
            if pid not in owned and row['ppid'] in owned and row['start']>=birth:
                owned[pid]=row;changed=True
    for pid,row in list(owned.items()):
        known[pid]=row['start']
        if row.get('rss_unknown') and row['state'] not in ('Z','X'):
            try:
                line=Path(f'/proc/{pid}/stat').read_text();f=line[line.rfind(')')+2:].split()
                if int(f[19])!=row['start'] or f[0] not in ('Z','X'):
                    raise frozen.ResourceError('live owned identity lacks RSS')
                owned[pid]={**row,'state':f[0]}
            except (OSError,ValueError,IndexError) as exc:
                raise frozen.ResourceError('owned no-RSS identity cannot be positively reconciled') from exc
    return owned

def resource_identity(sample):
    raw=sample.get('raw',{})
    return digest(canonical({k:raw.get(k) for k in ('cgroup','mountinfo')}))

def compact_sample(sample):
    # Preserve all decision inputs. Raw identity remains hash-bound, not repeated.
    return {**{k:sample[k] for k in ('at','capacity','available','quota','oom')},
            'raw_sha256':digest(canonical(sample.get('raw',{}))),'controller_identity_sha256':resource_identity(sample)}

def supervise(plan,root,frozen,sampler,binding,seal,*,evidence_budget,full_validator=None,input_audit=None):
    """Fixed supervision engine with synthetic-only injection for its tests.

    Tests inject a tiny Python CommandPlan and synthetic resource sampler.
    Production main supplies only candidate_context with fixed hash-bound input,
    the original resource_sample and the complete E45 result auditor.
    """
    budget=evidence_budget
    if not isinstance(budget,EvidenceBudget) or budget.root!=root:raise BindingError('evidence budget root mismatch')
    out=root
    for directory in ('tmp','home','cache'): (out/directory).mkdir()
    receipt={'schema':'e45-supervisor-terminal-draft/v1','role':ROLE,'status':'PRECHECK_REJECTED',
             'reason':None,'completed':False,'exit_code':1,'child_pid':None,'child_exit_code':None,
             'cleanup_complete':True,'direct_child_maxrss_bytes':None,'sampled_tree_peak_bytes':0,
             'sample_count':0,'owned_processes_observed':0,'observed_pipe_bytes':0,
             'admission':[],'cleanup_errors':[],
             'limits':{'wall_seconds':WALL_SECONDS,'rss_bytes':RSS_CAP,'output_bytes':OUTPUT_CAP,
                       'terminal_reserve_bytes':TERMINAL_RESERVE,'sample_seconds':SAMPLE_SECONDS,
                       'old_space_mib':1536,'semi_space_mib':16},'identity':binding}
    began=time.monotonic();launched=None;deadline=None;child=None;reaped=False;exited=False
    group_verified=False;known={};birth=0;fds={};cancelled=[];baseline=None;pipes_open=set()
    selector=selectors.DefaultSelector();term_at=None;kill_at=None;termination=False;killed=False
    grace=min(.5,WALL_SECONDS/4)
    handlers={s:signal.getsignal(s) for s in (signal.SIGINT,signal.SIGTERM)}
    for sig in handlers:signal.signal(sig,lambda s,f:cancelled.append(s))
    def stop(reason,status='RESOURCE_STOP'):
        if receipt['reason'] is None:receipt['reason']=reason;receipt['status']=status
    def identity(sample):return [sample[k] for k in ('capacity','quota','oom')]+[resource_identity(sample)]
    def resource_check(admission=False):
        sample=sampler()
        if abs(time.time()-sample['at'])>1:raise frozen.ResourceError('stale resource sample')
        if not 0<sample['available']<=sample['capacity']:raise frozen.ResourceError('invalid effective headroom')
        required=frozen.reserve(sample)+MARGIN+(RSS_CAP if admission else 0)
        if admission:
            if sample['available']<required:raise frozen.ResourceError('insufficient actual headroom')
            if baseline and identity(sample)!=identity(baseline):raise frozen.ResourceError('resource identity changed during admission')
        else:
            if sample['capacity']!=baseline['capacity'] or sample['quota']!=baseline['quota'] or resource_identity(sample)!=resource_identity(baseline):stop('RESOURCE_CHANGED')
            if sample['oom']!=baseline['oom']:stop('OOM_COUNTER_CHANGED')
            if sample['available']<required:stop('RESERVE_LOST')
        return sample
    def handles(owned):
        for pid,row in owned.items():
            key=(pid,row['start'])
            if key in fds or row['state'] in ('Z','X'):continue
            fd=None
            try:
                fd=os.pidfd_open(pid)
                line=Path(f'/proc/{pid}/stat').read_text();fields=line[line.rfind(')')+2:].split()
                if int(fields[19])!=row['start']:os.close(fd);continue
                fds[key]=fd
            except (ProcessLookupError,FileNotFoundError):
                if fd is not None:os.close(fd)
            except (OSError,ValueError,IndexError) as exc:
                if fd is not None:os.close(fd)
                raise frozen.ResourceError('cannot bind cleanup process identity') from exc
    def signals(sig):
        if group_verified and not reaped:
            try:os.killpg(child.pid,sig)
            except ProcessLookupError:pass
        for fd in fds.values():
            try:signal.pidfd_send_signal(fd,sig)
            except ProcessLookupError:pass
    def observe():
        nonlocal exited
        if child is None or exited:return
        info=os.waitid(os.P_PID,child.pid,os.WEXITED|os.WNOHANG|os.WNOWAIT)
        if info:
            exited=True
            receipt['child_exit_code']=info.si_status if info.si_code==os.CLD_EXITED else -info.si_status
    def reap():
        nonlocal reaped
        if child is None or reaped:return
        pid,status,usage=os.wait4(child.pid,os.WNOHANG)
        if pid:
            reaped=True;child.returncode=os.waitstatus_to_exitcode(status)
            receipt['child_exit_code']=child.returncode
            receipt['direct_child_maxrss_bytes']=usage.ru_maxrss*1024
    def live_tree():
        owned=owned_snapshot(frozen,child.pid,known,birth);handles(owned)
        return [r for r in owned.values() if r['state'] not in ('Z','X')]
    try:
        if not isinstance(seal,InputSeal) or seal.root!=root or seal.sha256!=binding.get('input_manifest_sha256'):
            raise BindingError('input seal does not match root and result identity')
        seal.verify()
        if not hasattr(os,'pidfd_open') or not hasattr(signal,'pidfd_send_signal'):
            raise frozen.ResourceError('kernel-bound cleanup handles unavailable')
        for i in range(3):
            if cancelled:raise frozen.ResourceError('cancelled before admission')
            sample=resource_check(admission=True);receipt['admission'].append(compact_sample(sample));baseline=sample
            if i<2:time.sleep(ADMISSION_INTERVAL)
        receipt['admission_seconds']=time.monotonic()-began
        budget.write('admission.json',canonical(receipt['admission']))
        budget.write('resource-initial-raw.json',canonical(baseline.get('raw',{})))
        budget.write('started.json',canonical({'role':ROLE,'status':'STARTING','identity':binding}))
        if cancelled:raise frozen.ResourceError('cancelled before launch')
        seal.verify()
        if input_audit is not None:input_audit()
        prelaunch=resource_check(admission=True)  # Re-admit after exact byte reads.
        receipt['prelaunch_resource']=compact_sample(prelaunch)
        budget.write('started.json',canonical({'role':ROLE,'status':'STARTING','identity':binding,'prelaunch_resource':receipt['prelaunch_resource']}))
        if cancelled:raise frozen.ResourceError('cancelled before launch')
        launched=time.monotonic();deadline=launched+WALL_SECONDS
        child_env=plan.env
        child=subprocess.Popen(plan.command,cwd=plan.cwd,env=child_env,stdin=subprocess.DEVNULL,
                               stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True,
                               pass_fds=())
        receipt['child_pid']=child.pid;receipt['cleanup_complete']=False;receipt['status']='RUNNING'
        group_verified=os.getpgid(child.pid)==child.pid and os.getsid(child.pid)==child.pid
        if not group_verified:raise frozen.ResourceError('private session identity unverified')
        fds[(child.pid,'direct')]=os.pidfd_open(child.pid)
        row=frozen.process_table().get(child.pid)
        if not row:raise frozen.ResourceError('direct-child start identity unavailable')
        birth=row['start'];known[child.pid]=birth;handles({child.pid:row})
        for stream,name in ((child.stdout,'stdout.json'),(child.stderr,'stderr.log')):
            os.set_blocking(stream.fileno(),False)
            selector.register(stream,selectors.EVENT_READ,name);pipes_open.add(stream.fileno())
        last_sample=0;live=[]
        while time.monotonic()<deadline:
            now=time.monotonic();observe()
            if cancelled:stop('CANCELLED','CANCELLED')
            if now>=deadline-2*grace:stop('WALL_LIMIT')
            if exited and receipt['child_exit_code']!=0:stop('CHILD_EXIT_NONZERO','PRODUCT_FAILURE')
            if now-last_sample>=SAMPLE_SECONDS:
                last_sample=now
                try:
                    seal.verify()
                    live=live_tree();rss=sum(r['rss'] for r in live)
                    receipt['sample_count']+=1;receipt['sampled_tree_peak_bytes']=max(receipt['sampled_tree_peak_bytes'],rss)
                    if rss>RSS_CAP:stop('RSS_LIMIT')
                    sample=resource_check();compact=compact_sample(sample)
                    receipt['last_resource_sample']=compact
                    budget.write('resource-decisions.jsonl',canonical({**compact,'tree_rss':rss,'sample':receipt['sample_count']}),append=True)
                    budget.audit()
                    if exited and live:stop('CHILD_LEFT_DESCENDANTS','CLEANUP_UNCERTAIN')
                except BindingError:stop('INPUT_IDENTITY_CHANGED','EVIDENCE_STOP')
                except EvidenceError as exc:
                    receipt['evidence_error']=str(exc)[:512]
                    stop(str(exc) if str(exc) in ('TOTAL_EVIDENCE_LIMIT','RESULT_SIZE') else 'OUTPUT_AUDIT_FAILED','EVIDENCE_STOP')
                except (frozen.ResourceError,OSError,ValueError,KeyError) as exc:
                    receipt['measurement_error']=str(exc)[:512];stop('RESOURCE_MEASUREMENT_FAILED');live=None
            if receipt['reason'] and not termination:
                signals(signal.SIGTERM);termination=True;term_at=now;kill_at=min(now+grace,deadline-grace)
            if termination and not killed and time.monotonic()>=kill_at:
                signals(signal.SIGKILL);killed=True
            for key,_ in selector.select(timeout=min(.01,SAMPLE_SECONDS,max(0,deadline-time.monotonic()))):
                chunk=os.read(key.fd,65536)
                if not chunk:
                    selector.unregister(key.fileobj);pipes_open.discard(key.fd);continue
                receipt['observed_pipe_bytes']+=len(chunk)
                try:
                    if key.data=='stdout.json' and budget.records.get('stdout.json',(0,0,0,0,0))[4]+len(chunk)>MAX_RESULT:
                        raise EvidenceError('RESULT_SIZE')
                    budget.write(key.data,chunk,append=True)
                except EvidenceError as exc:
                    receipt['evidence_error']=str(exc)[:512]
                    stop(str(exc) if str(exc) in ('TOTAL_EVIDENCE_LIMIT','RESULT_SIZE') else 'OUTPUT_AUDIT_FAILED','EVIDENCE_STOP')
            observe()
            if exited and not pipes_open:
                try:
                    remaining=live_tree()
                    if not remaining:receipt['cleanup_complete']=True;break
                except (frozen.ResourceError,OSError) as exc:
                    receipt['cleanup_errors'].append(str(exc)[:512]);stop('RESOURCE_MEASUREMENT_FAILED')
            if killed and exited and live is None:break
        if time.monotonic()>=deadline:stop('WALL_LIMIT')
    except (frozen.ResourceError,OSError,ValueError,KeyError,EvidenceError,BindingError) as exc:
        receipt['detail']=str(exc)[:512]
        if cancelled:stop('CANCELLED','CANCELLED')
        else:stop('PRECHECK_REJECTED' if child is None else 'SUPERVISOR_ERROR','PRECHECK_REJECTED' if child is None else 'RESOURCE_STOP')
    finally:
        # Cleanup has no independent extension: all TERM/KILL/reap/audit time is
        # charged to the same child deadline, even after an exception.
        if child is not None:
            try:
                if not receipt['cleanup_complete']:
                    signals(signal.SIGTERM)
                    soft=min(time.monotonic()+min(.03,grace),deadline)
                    while time.monotonic()<soft:
                        observe()
                        if exited:break
                        time.sleep(.002)
                    signals(signal.SIGKILL)
                    while time.monotonic()<deadline:
                        observe()
                        if exited:break
                        time.sleep(.002)
                # Audit while the direct PID still pins its session, then reap.
                try:remaining=live_tree()
                except (frozen.ResourceError,OSError) as exc:
                    remaining=None;receipt['cleanup_errors'].append(str(exc)[:512])
                reap()
                receipt['cleanup_complete']=reaped and remaining is not None and not remaining
                if not receipt['cleanup_complete']:stop('CLEANUP_FAILED','CLEANUP_UNCERTAIN')
            except (frozen.ResourceError,OSError,ChildProcessError) as exc:
                receipt['cleanup_errors'].append(str(exc)[:512]);receipt['cleanup_complete']=False
                stop('CLEANUP_FAILED','CLEANUP_UNCERTAIN')
            receipt['child_elapsed_seconds']=time.monotonic()-launched
            if receipt['child_elapsed_seconds']>WALL_SECONDS:stop('WALL_LIMIT')
            if (receipt['direct_child_maxrss_bytes'] or 0)>RSS_CAP:stop('RSS_LIMIT')
        selector.close()
        if child and child.stdout:child.stdout.close()
        if child and child.stderr:child.stderr.close()
        for fd in fds.values():os.close(fd)
        for sig,handler in handlers.items():signal.signal(sig,handler)
    cleanup_finished=time.monotonic()
    if launched is not None:receipt['child_elapsed_seconds']=cleanup_finished-launched
    # Audit a complete explicit FAIL/INCOMPLETE result too, without replacing
    # the first failure or accepting a nonzero child. Resource/evidence stops
    # retain partial bytes and never pretend to have a full final result.
    if child is not None and receipt['reason'] in (None,'CHILD_EXIT_NONZERO'):
        if receipt['child_exit_code']!=0: stop('CHILD_EXIT_NONZERO','PRODUCT_FAILURE')
        try:
            seal.verify();budget.audit();resource_check()
            if input_audit is not None:input_audit()
            result_bytes=(out/'stdout.json').read_bytes()
            outcome=validate_result(result_bytes,binding,full_validator)
            receipt['result_sha256']=digest(result_bytes)
            receipt['child_result_status']=outcome
            if outcome=='PASS' and receipt['reason'] is None:
                receipt['status']='PASS';receipt['completed']=True
            elif outcome=='PASS': receipt['result_error']='NONZERO_CHILD_CANNOT_RETURN_PASS'
            elif outcome=='FAIL': stop('PRODUCT_ASSERTION_FAILED','PRODUCT_FAILURE')
            else: stop('RESULT_INCOMPLETE','EVIDENCE_STOP')
        except BindingError as exc:
            receipt['result_error']=str(exc)[:512];stop('INPUT_IDENTITY_CHANGED','EVIDENCE_STOP')
        except (OSError,ValueError,EvidenceError,frozen.ResourceError) as exc:
            receipt['result_error']=str(exc)[:512];stop('RESULT_INVALID','EVIDENCE_STOP')
    if not receipt['cleanup_complete']:
        receipt['primary_failure_status']=receipt['status'];receipt['status']='CLEANUP_UNCERTAIN';receipt['completed']=False
    receipt['owned_processes_observed']=len(known)
    receipt['terminal_io_seconds']=0.0
    receipt['terminal_persistence_uncertain']=False
    receipt['finalization_overrun']=False
    # A persisted snapshot cannot measure its own later fsync/audit completion.
    # Acceptance requires this function's returned outcome and nonzero failures,
    # not a terminal.json PASS viewed without the final supervisor exit status.
    receipt['requires_supervisor_return']=True
    def measure_finalization():
        now=time.monotonic()
        receipt['elapsed_seconds']=now-began
        if launched is not None:
            receipt['validation_elapsed_seconds']=now-launched
            if receipt['validation_elapsed_seconds']>WALL_SECONDS:
                receipt['finalization_overrun']=True
                stop('WALL_LIMIT');receipt['completed']=False
        receipt['exit_code']=0 if receipt['status']=='PASS' and receipt['completed'] else 1
    def persist_terminal():
        receipt['timing_observed_through']='before_terminal_io'
        start=time.monotonic()
        try:budget.terminal(receipt)
        finally:receipt['terminal_io_seconds']+=time.monotonic()-start
    try:receipt['durable_bytes_before_terminal']=budget.audit()
    except EvidenceError:stop('TOTAL_EVIDENCE_LIMIT','EVIDENCE_STOP');receipt['completed']=False
    receipt['result_and_accounting_seconds']=time.monotonic()-cleanup_finished
    measure_finalization()
    before=(receipt['status'],receipt['reason'],receipt['completed'],receipt['finalization_overrun'])
    needs_failure_receipt=False
    try:persist_terminal()
    except (EvidenceError,OSError,ValueError) as exc:
        stop('TERMINAL_PERSISTENCE_FAILED','EVIDENCE_STOP');receipt['completed']=False
        receipt['terminal_error']=str(exc)[:512];needs_failure_receipt=True
    # This check is AFTER the actual final audit and terminal persistence/audit
    # return, so their overrun can never leave a returned PASS.
    measure_finalization()
    after=(receipt['status'],receipt['reason'],receipt['completed'],receipt['finalization_overrun'])
    if needs_failure_receipt or before!=after:
        # Exactly one diagnostic failure write. No child retry, extra admission,
        # enlarged budget, recursive self-timing write or recovery-to-PASS path.
        receipt['completed']=False;receipt['exit_code']=1
        try:persist_terminal()
        except (EvidenceError,OSError,ValueError) as exc:
            receipt.setdefault('primary_failure_status',receipt['status'])
            receipt['status']='EVIDENCE_UNCERTAIN';receipt['terminal_persistence_uncertain']=True
            receipt['terminal_error']=str(exc)[:512]
        measure_finalization()
    receipt['timing_observed_through']='after_final_terminal_return'
    return receipt

def main():
    # This exact code change, not an environment flag, activates the fixed CI
    # path. Arbitrary argv, non-push events, other refs and reruns are rejected.
    expected={'GITHUB_ACTIONS':'true','GITHUB_EVENT_NAME':'push','GITHUB_RUN_ATTEMPT':'1',
              'GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d',
              'GITHUB_REF':'refs/heads/dev/r186-e45-platforms-baoyun-validation'}
    if len(sys.argv)!=1 or any(os.environ.get(k)!=v for k,v in expected.items()):
        print(json.dumps({'status':'PRECHECK_REJECTED','reason':'FIXED_CI_CONTEXT_REQUIRED',
                          'completed':False,'child_pid':None,'cleanup_complete':True}))
        return 78
    try:
        import shutil
        # Use the same canonical module as candidate_context. When this file is
        # __main__, importing it by name avoids mismatched ledger/seal classes.
        import r181_e45_bound as engine
        from r181_e45_inputs import candidate_context
        root=exact_path(Path(os.environ['GITHUB_WORKSPACE']))
        runner_temp=exact_path(Path(os.environ['RUNNER_TEMP']))
        node=exact_path(Path(shutil.which('node') or '').resolve(strict=True))
        evidence=runner_temp/'r181-eight-zone-evidence'
        evidence.mkdir(mode=0o700)  # No exist_ok: preserve any prior attempt.
        context=candidate_context(root,node,evidence)
        outcome=engine.supervise(**context)
        # This returned outcome includes cleanup, result/input audit and final
        # persistence timing. Never infer success from terminal.json alone.
        return outcome['exit_code']
    except (Exception,KeyboardInterrupt):
        # Context/supervisor preserve charged evidence where available. Do not
        # add an unbudgeted traceback or turn any uncertain result into success.
        return 1

if __name__=='__main__': raise SystemExit(main())
