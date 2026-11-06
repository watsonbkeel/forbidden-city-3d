"""One-run self-imposed diagnostic admission. No credentials or repository writes."""
import base64,datetime,hashlib,json,math,os,re,signal,time,urllib.request,urllib.error
from pathlib import Path

def utc_epoch(value):
    if not isinstance(value,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z',value):raise ValueError('Noncanonical UTC')
    return datetime.datetime.strptime(value,'%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=datetime.timezone.utc).timestamp()
def git_blob_sha(raw):return hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
def canonical_receipt(run,env,config):
    expires=datetime.datetime.fromtimestamp(utc_epoch(run['created_at'])+1800,datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    body={'schema':1,'purpose':'H37_EXPLICIT_WINDOW_DIAGNOSTIC_ONLY','window_number':config['window_number'],'prior_run_id':config['prior_run']['id']if config['prior_run']else None,'repository':config['repository'],'branch':config['branch'],'workflow_path':config['workflow'],'workflow_id':run['workflow_id'],'run_id':run['id'],'run_number':config['run_number'],'run_attempt':1,'diagnostic_commit':env['GITHUB_SHA'],'diagnostic_tree':env['DIAGNOSTIC_TREE'],'source_base':config['base'],'source_tree':config['base_tree'],'freeze_sha256':env['FREEZE_SHA256'],'release_blob_sha':config['release_blob_sha'],'created_at':run['created_at'],'expires_at':expires,'node_tree_mib':config['node_mib'],'non_node_mib':config['non_node_mib'],'aggregate_seconds':config['aggregate_seconds']}
    return (json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode('utf-8')
def validate_run(run,env,config,workflow,runs,now,*,prior_jobs=None):
    for value in [run.get(k)for k in ['id','workflow_id','run_number','run_attempt']]+[workflow.get('id'),runs.get('total_count')]:
        if type(value)is not int or value<=0:raise ValueError('Noninteger or nonpositive GitHub identity/count')
    if not math.isfinite(now):raise ValueError('Invalid wall clock')
    if any(type(row.get(k))is not int or row[k]<=0 for row in runs.get('workflow_runs',[])for k in ['id','workflow_id','run_number','run_attempt']):raise ValueError('Listed run numeric identity not positive integer')
    listing=runs.get('workflow_runs',[]);prior=config['prior_run'];expected_count=2 if prior else 1
    if config['window_number']!=config['run_number']or config['run_number']!=expected_count:raise ValueError('Unsupported explicit window configuration')
    checks=[run.get('repository',{}).get('full_name')==config['repository'],run.get('head_repository',{}).get('full_name')==config['repository'],env.get('GITHUB_REPOSITORY')==config['repository'],env.get('GITHUB_REF')=='refs/heads/'+config['branch'],env.get('GITHUB_EVENT_NAME')=='push',run.get('event')=='push',run.get('head_branch')==config['branch'],run.get('head_sha')==env.get('GITHUB_SHA'),run.get('id')==int(env.get('GITHUB_RUN_ID','-1')),run.get('run_number')==int(env.get('GITHUB_RUN_NUMBER','-1'))==config['run_number'],run.get('run_attempt')==int(env.get('GITHUB_RUN_ATTEMPT','-1'))==1,run.get('path')==config['workflow'],workflow.get('path')==config['workflow'],run.get('workflow_id')==workflow.get('id')==config['workflow_id'],type(run.get('workflow_id'))is int,run.get('status')=='in_progress',run.get('conclusion')is None,runs.get('total_count')==expected_count,len(listing)==expected_count,len({q['id']for q in listing})==expected_count,any(q.get('id')==run.get('id')for q in listing)]
    listed=next((q for q in listing if q.get('id')==run.get('id')),None)
    if listed is None or any(listed.get(k)!=run.get(k)for k in ['workflow_id','head_sha','head_branch','run_number','run_attempt','event','path','status','conclusion']):raise ValueError('Current run detail and workflow listing disagree')
    if prior:
        old=next((q for q in listing if q['id']==prior['id']),{})
        for k in ['id','workflow_id','run_number','run_attempt']:
            if type(old.get(k))is not int:raise ValueError('Prior run numeric identity invalid')
        checks.extend([old['id']==prior['id'],old['workflow_id']==config['workflow_id'],old.get('head_sha')==prior['head_sha'],old['run_number']==prior['run_number']==1,old['run_attempt']==prior['run_attempt']==1,old.get('status')=='completed',old.get('conclusion')=='failure',old.get('path')==config['workflow'],old.get('head_branch')==config['branch'],old.get('event')=='push',old.get('repository',{}).get('full_name')==config['repository'],old.get('head_repository',{}).get('full_name')==config['repository']])
        if not isinstance(prior_jobs,dict)or type(prior_jobs.get('total_count'))is not int or prior_jobs['total_count']!=0 or prior_jobs.get('jobs')!=[]:raise ValueError('Prior failed window was not proven zero-job')
    for name,size in [('GITHUB_SHA',40),('DIAGNOSTIC_TREE',40),('FREEZE_SHA256',64)]:checks.append(bool(re.fullmatch('[0-9a-f]{'+str(size)+'}',env.get(name,''))))
    created=utc_epoch(run['created_at']);checks.append(created<=now<created+1800)
    if not all(checks):raise ValueError('Exact authorized window identity, prior failure or expiry rejected')
    return True
def verify_blob(blob,expected,sha):
    if not isinstance(blob,dict) or blob.get('sha')!=sha or blob.get('encoding')!='base64':raise ValueError('Blob identity/encoding rejected')
    try:raw=base64.b64decode(''.join(blob['content'].split()),validate=True)
    except Exception as e:raise ValueError('Malformed blob base64')from e
    if len(raw)!=blob.get('size') or git_blob_sha(raw)!=sha or(expected is not None and raw!=expected):raise ValueError('Blob bytes rejected')
    if expected is None and not re.fullmatch(b'[0-9a-f]{64}\n',raw):raise ValueError('Release preimage shape rejected')
    return raw

class PublicGitHub:
    def __init__(self,config,deadline):
        if not math.isfinite(deadline)or not 0<config['request_timeout_seconds']<=10 or type(config['request_budget'])is not int or not 0<config['request_budget']<=32:raise ValueError('Invalid admission budget')
        self.config=config;self.deadline=deadline;self.monotonic_deadline=time.monotonic()+max(0,deadline-time.time());self.reads=[]
    def remaining(self):
        value=min(self.deadline-time.time(),self.monotonic_deadline-time.monotonic())
        if not math.isfinite(value)or value<=0:raise RuntimeError('Admission API hard deadline')
        return value
    def get(self,path,*,missing_blob=False):
        remaining=self.remaining()
        if len(self.reads)>=self.config['request_budget']:raise RuntimeError('Admission API deadline/request budget')
        if missing_blob and not re.fullmatch(r'git/blobs/[0-9a-f]{40}',path):raise ValueError('404 waiting allowed only for exact Git blob')
        url='https://api.github.com/repos/'+self.config['repository']+'/'+path
        request=urllib.request.Request(url,headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'forbidden-city-h37-readonly-diagnostic'})
        row={'path':path,'at':time.time()};self.reads.append(row)
        def alarm(signum,frame):raise TimeoutError('Admission request/body hard timeout')
        old_handler=signal.signal(signal.SIGALRM,alarm);old_timer=signal.setitimer(signal.ITIMER_REAL,min(self.config['request_timeout_seconds'],remaining))
        try:
            with urllib.request.urlopen(request,timeout=min(self.config['request_timeout_seconds'],remaining))as response:
                self.remaining()
                if response.geturl()!=url:raise RuntimeError('Unexpected API redirect')
                raw=response.read(2*1024*1024+1);self.remaining();row['status']=response.status
                remaining=response.headers.get('X-RateLimit-Remaining');row['rateRemaining']=remaining
                if remaining is None or int(remaining)<4:raise RuntimeError('API remaining budget unknown/insufficient')
                if response.headers.get('Link') and 'rel="next"'in response.headers['Link']:raise RuntimeError('Incomplete run pagination rejected')
                if len(raw)>2*1024*1024:raise RuntimeError('API response too large')
                result=json.loads(raw);row['responseSHA256']=hashlib.sha256(raw).hexdigest();return result
        except urllib.error.HTTPError as e:
            self.remaining()
            row['status']=e.code
            if e.code==404 and missing_blob:
                left=e.headers.get('X-RateLimit-Remaining');row['rateRemaining']=left
                if left is None or int(left)<4:raise RuntimeError('API remaining budget unknown/insufficient')
                return None
            raise RuntimeError('Admission API failed: '+str(e.code))from e
        finally:
            signal.setitimer(signal.ITIMER_REAL,0);signal.signal(signal.SIGALRM,old_handler)
            if old_timer!=(0.0,0.0):raise RuntimeError('Unexpected inherited process timer')

def await_admission(client,env,config,*,now=time.time,sleep=time.sleep,deadline):
    if not math.isfinite(deadline):raise ValueError('Invalid admission deadline')
    observed_prior=None
    def snapshot():
        nonlocal observed_prior
        run=client.get('actions/runs/'+env['GITHUB_RUN_ID']);wid=run.get('workflow_id')
        if type(wid)is not int or wid<=0:raise ValueError('Missing workflow identity')
        workflow=client.get('actions/workflows/'+str(wid));runs=client.get('actions/workflows/'+str(wid)+'/runs?per_page=100')
        prior_jobs=client.get('actions/runs/'+str(config['prior_run']['id'])+'/jobs?per_page=100')if config['prior_run']else None
        validate_run(run,env,config,workflow,runs,now(),prior_jobs=prior_jobs)
        if config['prior_run']:observed_prior={'run':next(q for q in runs['workflow_runs']if q['id']==config['prior_run']['id']),'jobs':prior_jobs}
        return run
    run=snapshot();receipt=canonical_receipt(run,env,config);receipt_sha=git_blob_sha(receipt)
    while True:
        if now()>=deadline:raise RuntimeError('Setup/admission hard deadline')
        release=client.get('git/blobs/'+config['release_blob_sha'],missing_blob=True)
        if release is not None:
            verify_blob(release,None,config['release_blob_sha'])
            approval=client.get('git/blobs/'+receipt_sha,missing_blob=True)
            if approval is None:raise RuntimeError('Release exists without exact run approval')
            verify_blob(approval,receipt,receipt_sha);fresh=snapshot()
            if canonical_receipt(fresh,env,config)!=receipt:raise RuntimeError('Run changed during admission')
            if now()>=deadline:raise RuntimeError('Admission completed too late')
            if isinstance(client,PublicGitHub):client.remaining()
            return {'accepted':True,'run':json.loads(receipt),'priorWindow':observed_prior,'receiptBlobSHA':receipt_sha,'receiptSHA256':hashlib.sha256(receipt).hexdigest(),'releaseBlobSHA':config['release_blob_sha'],'acceptedAtEpoch':now(),'apiReads':client.reads}
        sleep(min(config['poll_seconds'],max(0,deadline-now())))

def main():
    root=Path(__file__).resolve().parent;config=json.loads((root/'CONFIG.json').read_text());env=dict(os.environ)
    if env.get('GITHUB_RUN_NUMBER')!=str(config['run_number'])or env.get('GITHUB_RUN_ATTEMPT')!='1':raise RuntimeError('Only explicitly authorized ordinal and first attempt')
    evidence=Path(env['EVIDENCE_DIR']);evidence.mkdir(parents=True,exist_ok=True)
    started=float(env['JOB_START_EPOCH']);mono_started=float(env['JOB_START_MONOTONIC'])
    if config['setup_seconds']!=600 or not math.isfinite(started)or not math.isfinite(mono_started)or not 0<=started<=time.time()or not 0<=mono_started<=time.monotonic():raise ValueError('Invalid original setup epoch')
    deadline=started+config['setup_seconds'];client=PublicGitHub(config,deadline);client.monotonic_deadline=min(client.monotonic_deadline,mono_started+600);client.remaining()
    try:
        result=await_admission(client,env,config,deadline=deadline)
        with(evidence/'ADMISSION.json').open('x')as f:json.dump(result,f,indent=2)
    finally:(evidence/'ADMISSION-API-READS.json').write_text(json.dumps(client.reads,indent=2)+'\n')
if __name__=='__main__':main()
