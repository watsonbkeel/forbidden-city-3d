import time
BATCH_STARTED=time.monotonic()
from pathlib import Path
import json,os,sys,traceback,hashlib
from preflight import P,R,source_state,source_lock,verify_admission,sha
from phase_orchestrator import run_batch,phase_proof
from probe_monitor import run_process,scan_proc
from resource_contract import snapshot_resources,evaluate
from evidence_io import write_json,guard_write

def check_frames(out,phase,expected):
    data=json.loads((out/('FRAME-INDEX-'+phase+'.json')).read_text());rows=data.get('rows')
    if data.get('phase')!=phase or not isinstance(rows,list)or len(rows)!=expected:raise ValueError('Raw frame index incomplete')
    total_frames=0
    for i,row in enumerate(rows):
        name=phase+'-'+str(i).zfill(3)+'.frames.json'
        if row.get('index')!=i or row.get('status')!='passed' or row.get('file')!=name:raise ValueError('Raw frame call identity not passed')
        raw=(out/name).read_bytes()
        if len(raw)!=row.get('bytes')or sha(raw)!=row.get('fileSHA256'):raise ValueError('Raw frame bytes/readback mismatch')
        frames=json.loads(raw)
        if not isinstance(frames,list)or len(frames)!=row.get('frameCount'):raise ValueError('Raw frame array incomplete')
        total_frames+=len(frames)
    actual=sorted(p.name for p in out.glob(phase+'-*.frames.json'))
    if actual!=sorted(row['file']for row in rows):raise ValueError('Unindexed raw frame file')
    if phase=='P1' and expected==136:
        for i in range(68):
            if(out/rows[i]['file']).read_bytes()!=(out/rows[i+68]['file']).read_bytes():raise ValueError('Before/after complete raw frame bytes differ: '+str(i))
    return {'complete':True,'files':len(rows),'frames':total_frames,'indexSHA256':sha((out/('FRAME-INDEX-'+phase+'.json')).read_bytes())}

def run_session(*,started_at,now,verify_inputs,launch):
    result={'success':False}
    try:result.update(run_batch(('P1','P2C'),started_at=started_at,now=now,verify_inputs=verify_inputs,launch=launch))
    except BaseException as error:result.update({'success':False,'error':repr(error),'traceback':traceback.format_exc()})
    finally:
        try:verify_inputs('final');result['finalInputsUnchanged']=True
        except BaseException as error:result.update({'success':False,'finalInputsUnchanged':False,'finalError':repr(error)})
        elapsed=now()-started_at;result['aggregateSecondsIncludingFinalLocks']=elapsed
        if not 0<=elapsed<180:result['success']=False;result['deadlineFailed']=True
    return result

def finalize_result(result,*,write,now,started_at):
    elapsed=now()-started_at;result['aggregateSecondsBeforeResultWrite']=elapsed;result['requiresZeroWrapperExit']=True
    if not 0<=elapsed<180:result['success']=False;result['deadlineFailed']=True
    write('BATCH-RESULT.json',result)
    if not 0<=now()-started_at<180:
        result['success']=False;result['deadlineFailed']=True;write('BATCH-RESULT.json',result)
    return 0 if result['success']is True else 1

def main():
    if sys.argv[1:]!=['--execute-once']or os.environ.get('GITHUB_ACTIONS')!='true':raise RuntimeError('Remote GitHub exact admitted execute-once only')
    config=json.loads((P/'CONFIG.json').read_text());out=Path(os.environ['EVIDENCE_DIR']);admission_bytes=(out/'ADMISSION.json').read_bytes();admission=json.loads(admission_bytes)
    verify_admission(admission,os.environ,config,time.time())
    with(out/'RUN-STARTED.json').open('x')as f:json.dump({'schema':1,'admissionSHA256':sha(admission_bytes),'config':config,'base':config['base'],'eventCommit':os.environ['GITHUB_SHA'],'runID':os.environ['GITHUB_RUN_ID'],'nodeFlags':['--expose-gc','--max-old-space-size=256','--max-semi-space-size=16'],'epoch':BATCH_STARTED,'actualDiagnosticRequested':True},f,indent=2)
    before=source_state();lock=source_lock()
    if before['trackedStatus']or before['head']!=os.environ['GITHUB_SHA']or before['tree']!=os.environ['DIAGNOSTIC_TREE']:raise RuntimeError('Exact clean event source not established')
    if lock['freezeSHA256']!=os.environ['FREEZE_SHA256']:raise RuntimeError('Frozen package identity mismatch')
    write=lambda name,value:write_json(out,name,value)
    write('SOURCE-BEFORE.json',before);write('INPUTS-BEFORE.json',lock)
    proofs=[];definition=json.loads((P/'ASSERTION-LEDGER.json').read_text());known_non_node={}
    def resources(table,alive,*,start=False):
        snapshot=snapshot_resources(table,{q['pid']for q in alive},out,known_non_node=known_non_node);judgment=evaluate(snapshot,start=start)
        if not alive and any(q['observed']=='present'and q['pid']!=os.getpid()for q in snapshot['knownNonNode']):judgment={'ok':False,'violations':['non-Node child remains at boundary'],'start':start}
        return {**judgment,'snapshot':snapshot}
    def verify_inputs(label):
        current=source_state();inputs=source_lock()
        if current!=before or inputs!=lock or(out/'ADMISSION.json').read_bytes()!=admission_bytes:raise RuntimeError('Source/input/index/admission drift at '+label)
        verify_admission(admission,os.environ,config,time.time());budget=resources(scan_proc(),[],start=True)
        write('LOCK-'+label+'.json',{'source':current,'inputSHA256':sha(json.dumps(inputs,sort_keys=True).encode()),'admissionSHA256':sha(admission_bytes),'unchanged':True,'resources':budget})
        if not budget['ok']:raise RuntimeError('Prephase resource contract: '+repr(budget['violations']))
    def launch(phase,started_at):
        env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1','H37_DIAGNOSTIC_PHASE':phase,'H37_EVIDENCE_DIR':str(out)}
        if env.get('NODE_OPTIONS')or env.get('NODE_PATH'):raise RuntimeError('Ambient Node override')
        command=['node','--expose-gc','--max-old-space-size=256','--max-semi-space-size=16','--test','--test-concurrency=1',str(P/'space-probe.test.mjs')]
        result,samples,final=run_process(command,R,env,out/('SPACE-'+phase+'.log'),started_at=started_at,node_limit_mib=768,resource_guard=resources)
        write('SPACE-'+phase+'-RSS.json',samples);write('SPACE-'+phase+'-EXIT.json',result)
        report_path=out/('SPACE-'+phase+'-RESULT.json');report=json.loads(report_path.read_text())if report_path.is_file()else None
        unchanged=source_state()==before and source_lock()==lock and(out/'ADMISSION.json').read_bytes()==admission_bytes
        proof=phase_proof(phase,report,result,final,unchanged,definition['phases'][phase],definition['collectionLabels'][phase])
        try:proof['rawFrames']=check_frames(out,phase,136 if phase=='P1'else 22)
        except BaseException as error:proof['rawFrames']={'complete':False,'error':repr(error)};proof['success']=False
        proofs.append(proof);write('PHASE-'+phase+'-PROOF.json',proof);return proof
    result=run_session(started_at=BATCH_STARTED,now=time.monotonic,verify_inputs=verify_inputs,launch=launch)
    result.update({'phaseProofs':proofs,'nodeTreeBudgetMiB':768,'nonNodeBudgetMiB':256,'aggregateBudgetSeconds':180,'scope':'Two-process conservative spatial diagnostic only; no product or full-zone acceptance'})
    try:write('SOURCE-AFTER.json',source_state());write('INPUTS-AFTER.json',source_lock())
    except BaseException as error:result.update({'success':False,'finalCaptureError':repr(error)})
    code=finalize_result(result,write=write,now=time.monotonic,started_at=BATCH_STARTED)
    terminal=resources(scan_proc(),[],start=False);write('TERMINAL-RESOURCES.json',terminal)
    if not terminal['ok']:return 1
    guard_write(out)
    print(json.dumps({'success':result['success'],'phases':len(proofs),'aggregateSecondsAfterResultWrite':time.monotonic()-BATCH_STARTED,'productionProductChanged':False}),flush=True)
    if not 0<=time.monotonic()-BATCH_STARTED<180:return 1
    return code
if __name__=='__main__':sys.exit(main())
