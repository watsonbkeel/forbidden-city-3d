"""A only: observe original reads; never change a guard decision or reread /proc."""
import json
import os
from pathlib import Path
import re
import time
import types

MAX_RECORDS=256
MAX_RECORD_BYTES=1024
MAX_SCAN_BYTES=256*1024
MAX_FAILURE_BYTES=16*1024

def private_function(function, replacements):
    """Same code/defaults/closure and dependency identities, private globals only."""
    result=types.FunctionType(function.__code__, {**function.__globals__,**replacements},
                              function.__name__,function.__defaults__,function.__closure__)
    result.__kwdefaults__=function.__kwdefaults__
    return result

def encoded(value):
    return json.dumps(value,separators=(',',':'),ensure_ascii=True).encode('ascii')

class DiagnosticScalarLimit(ValueError):
    pass

def integer(value):
    # Bound only diagnostic scalar size. This never feeds an original decision.
    if len(value)>20:raise DiagnosticScalarLimit()
    return int(value)

def state(value):
    return value if value in ('R','S','D','Z','X','x','T','t','K','W','P','I') else 'OTHER'

def parsed(slot,raw):
    result={'read':'OK','parse':'OK'}
    try:
        if slot!='status':
            opening,closing=raw.find(' ('),raw.rfind(')')
            fields=raw[closing+2:].split()
            result.update(start=integer(fields[19]),state=state(fields[0]))
            # Original R177 does not validate textual PID/framing; report separately.
            framing=opening>=1 and closing>=opening+2 and raw[closing+1:closing+2]==' '
            result['framing']=framing
            try:result['pid']=integer(raw[:opening]) if framing else None
            except DiagnosticScalarLimit:raise
            except ValueError:result['pid']=None
            if slot=='s3' and (not framing or result['pid'] is None):result['parse']='ERROR'
        else:
            result['rss_present']=bool(re.search(r'^VmRSS:',raw,re.M))
            result['rss']=None;result['unit']='MISSING'
            for line in raw.splitlines():
                if line.startswith(('Pid:','State:','VmRSS:')):
                    part=line.split()
                    if part[0]=='Pid:':result['pid']=integer(part[1])
                    elif part[0]=='State:':result['state']=state(part[1])
                    else:
                        result['rss']=integer(part[1])*1024
                        result['unit']='kB' if len(part)>2 and part[2]=='kB' else 'OTHER'
    except DiagnosticScalarLimit:result['parse']='OUT_OF_RANGE'
    except (ValueError,IndexError):result['parse']='ERROR'
    return result

class Observer:
    def __init__(self,path):
        self.path=path;self.triggered=False;self.write='NOT_ATTEMPTED';self.outcome='NOT_TRIGGERED'
        self.records={};self.size=0;self.incomplete=set();self.active=False;self.scan=0
    def begin(self):
        self.records={};self.size=0;self.incomplete=set();self.scan+=1
    def put(self,pid,row):
        data=encoded(row)
        old=self.records.get(pid,b'')
        if len(data)>MAX_RECORD_BYTES:
            self.incomplete.add('RECORD_OVERFLOW');return
        count=len(self.records)+int(pid not in self.records)
        # Reserve 64 KiB for the map/metadata and 128 B per bytes/key object.
        # This is stricter than the 256 KiB encoded-payload ceiling.
        charged=self.size-len(old)+len(data)+count*128+65536
        if count>MAX_RECORDS or charged>MAX_SCAN_BYTES:
            self.incomplete.add('BUFFER_OVERFLOW');return
        self.records[pid]=data;self.size+=len(data)-len(old)
    def capture(self,pid,slot,raw,error,before,after):
        row=json.loads(self.records[pid]) if pid in self.records else {'pid':pid}
        if slot=='stat':slot='s2' if 's1' in row else 's1'
        if error is None:value=parsed(slot,raw)
        else:
            value={'read':'ERROR','parse':'NOT_RUN','error':next((name for kind,name in ((FileNotFoundError,'MISSING'),(PermissionError,'PERMISSION'),(OSError,'OS_ERROR'),(UnicodeError,'UNICODE_ERROR')) if isinstance(error,kind)),'OTHER')}
        value.update(t0=before,t1=after);row[slot]=value;self.put(pid,row)
    def observed_path(self,base,third=False):
        observer=self
        # Path() is a factory; derive from its concrete platform class.
        parent=type(base())
        class ObservedPath(parent):
            def read_text(self,*args,**kwargs):
                match=re.fullmatch(r'/proc/([0-9]+)/(stat|status)',str(self)) if observer.active and not observer.triggered else None
                if not match:return super().read_text(*args,**kwargs)
                before=time.monotonic_ns()
                try:value=super().read_text(*args,**kwargs)
                except BaseException as error:
                    after=time.monotonic_ns()
                    try:observer.capture(int(match[1]),'s3' if third else match[2],None,error,before,after)
                    except Exception:observer.incomplete.add('OBSERVER_ERROR')
                    raise  # Preserve the original exception object and traceback.
                after=time.monotonic_ns()
                try:observer.capture(int(match[1]),'s3' if third else match[2],value,None,before,after)
                except Exception:observer.incomplete.add('OBSERVER_ERROR')
                return value  # Preserve the exact original read return object.
        return ObservedPath
    def finish_table(self,table):
        for pid,data in list(self.records.items()):
            if pid in table:
                row=json.loads(data);original=table[pid]
                row['final']={key:original[key] for key in ('start','rss')}
                row['final']['state']=state(original['state'])
                row['final']['rss_unknown']=bool(original.get('rss_unknown'))
                self.put(pid,row)
    def fail(self,pid,at):
        if self.triggered:return
        self.triggered=True
        row=json.loads(self.records[pid]) if pid in self.records else None
        missing=set(self.incomplete)
        if row is None:missing.add('TARGET_MISSING')
        elif not all(key in row for key in ('s1','status','s2','s3','final')):missing.add('READ_OR_FINAL_MISSING')
        if row and any(row.get(slot,{}).get('parse')=='OUT_OF_RANGE' for slot in ('s1','s2','s3','status')):missing.add('DIAGNOSTIC_SCALAR_LIMIT')
        third=(row or {}).get('s3',{});final=(row or {}).get('final',{})
        identity=None;terminal=None
        if third.get('read')=='ERROR':reason='READ_ERROR'
        elif third.get('parse')=='ERROR':reason='PARSE_ERROR'
        elif third.get('parse')=='OK' and 'start' in final:
            identity=third.get('pid')==pid and third.get('start')==final['start']
            terminal=third.get('state') in ('Z','X')
            if third.get('pid')!=pid:reason='PID_MISMATCH'
            elif third.get('start')!=final['start']:reason='START_MISMATCH'
            elif not terminal:reason='NONTERMINAL'
            else:reason='ORIGINAL_RECORD_REJECTED'  # Same-identity Z/X retained by R262.
        else:reason='UNAVAILABLE'
        event={'kind':'r267-first-original-owned-rss-failure','status':'INCOMPLETE' if missing else 'RECORDED',
               'original_gate_failed':True,'original_failure_retained':True,'gate_observed_ns':at,
               'scan':self.scan,'pid':pid,'record':row,'incomplete':sorted(missing),
               'decision':{'reason':reason,'identity_match':identity,'terminal_match':terminal},
               'releaseAccepted':False}
        self.outcome=event['status']
        payload=encoded(event)+b'\n'
        if len(payload)>MAX_FAILURE_BYTES:
            self.outcome='INCOMPLETE';self.write='SIZE_REJECTED';return
        try:
            # Exclusive, one attempt, no overwrite, no retries or secondary /proc read.
            with self.path.open('xb') as out:
                if out.write(payload)!=len(payload):raise OSError('short diagnostic write')
                out.flush();os.fsync(out.fileno())
            self.write='WRITTEN'
        except Exception:
            self.outcome='INCOMPLETE';self.write='FAILED'
        finally:self.records={};self.size=0
    def summary(self):
        return {'status':self.outcome,'triggered':self.triggered,'write':self.write,'releaseAccepted':False}

def install(guard,recheck,journal_path,failure_path):
    observer=Observer(failure_path)
    observer.original_table=guard.process_table;observer.original_owned=guard.owned_processes
    # Never change guard.Path, recheck.Path, pathlib or any shared library.
    guard.process_table=private_function(observer.original_table,{'Path':observer.observed_path(guard.Path)})
    installer=private_function(recheck.install_exit_state_recheck,{'Path':observer.observed_path(recheck.Path,third=True)})
    journal=installer(guard,journal_path)
    original_rechecked=guard.process_table
    def scan():
        if observer.triggered:return original_rechecked()
        observer.begin();observer.active=True
        try:
            table=original_rechecked()
            try:observer.finish_table(table)
            except Exception:observer.incomplete.add('OBSERVER_ERROR')
            return table
        finally:observer.active=False
    def owned(*args,**kwargs):
        try:return observer.original_owned(*args,**kwargs)
        except guard.ResourceError as error:
            # Observe only an exception already raised by the original owned gate.
            match=re.fullmatch(r'live owned PID ([0-9]+) lacks RSS',str(error))
            if match and not observer.triggered:
                try:observer.fail(int(match[1]),time.monotonic_ns())
                except Exception:
                    observer.triggered=True;observer.outcome='INCOMPLETE';observer.write='OBSERVER_ERROR'
            raise
    guard.process_table=scan;guard.owned_processes=owned
    return observer,journal
