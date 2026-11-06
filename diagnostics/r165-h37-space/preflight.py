"""Pure input/identity preparation; never constructs the scene."""
from pathlib import Path
import datetime,hashlib,json,math,os,re,subprocess,sys,time
from approval_gate import git_blob_sha,utc_epoch
P=Path(__file__).resolve().parent;R=P.parent.parent
ENV={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'}
def sha(data):return hashlib.sha256(data).hexdigest()
def file_fingerprint(path):
    if path.is_symlink():raise ValueError('Input symlink rejected: '+str(path))
    before=path.stat();size=before.st_size;count=0;digest=hashlib.sha256();blob=hashlib.sha1(b'blob '+str(size).encode()+b'\0')
    with path.open('rb')as f:
        while chunk:=f.read(1024*1024):digest.update(chunk);blob.update(chunk);count+=len(chunk)
    after=path.stat()
    if count!=size or(before.st_ino,before.st_size,before.st_mtime_ns,before.st_mode)!=(after.st_ino,after.st_size,after.st_mtime_ns,after.st_mode):raise ValueError('Input changed during fingerprint: '+str(path))
    return {'bytes':count,'sha256':digest.hexdigest(),'blob':blob.hexdigest()}
def validate_native_environment(env):
    for key in ['NODE_OPTIONS','NODE_PATH','NAPI_RS_NATIVE_LIBRARY_PATH','NAPI_RS_FORCE_WASI','DISABLE_SYSTEM_FONTS_LOAD','FONTCONFIG_FILE','FONTCONFIG_PATH','LD_PRELOAD','LD_LIBRARY_PATH']:
        if env.get(key):raise ValueError('Unapproved native/font resolution override: '+key)
    return True
def font_file(path):
    resolved=path.resolve(strict=True)
    if not resolved.is_file():raise ValueError('Font/config target not regular file: '+str(path))
    return {'path':str(path),'symlinkTarget':os.readlink(path)if path.is_symlink()else None,'resolved':str(resolved),**file_fingerprint(resolved)}
def font_inputs(*,local=False):
    validate_native_environment(os.environ)
    environment={k:v for k,v in sorted(os.environ.items())if k=='HOME'or k.startswith(('XDG_','FONT','FC_','LC_','NAPI_RS_'))or k in ['LANG','LANGUAGE','FREETYPE_PROPERTIES','DISABLE_SYSTEM_FONTS_LOAD']}
    home=Path.home();xdg_data=Path(os.environ.get('XDG_DATA_HOME',home/'.local/share'));xdg_config=Path(os.environ.get('XDG_CONFIG_HOME',home/'.config'));xdg_cache=Path(os.environ.get('XDG_CACHE_HOME',home/'.cache'))
    roots={Path('/etc/fonts'),Path('/usr/share/fontconfig'),Path('/usr/share/fonts'),Path('/usr/local/share/fonts'),Path('/var/cache/fontconfig'),home/'.fonts',home/'.local/share/fonts',home/'.config/fontconfig',home/'.cache/fontconfig',xdg_data/'fonts',xdg_config/'fontconfig',xdg_cache/'fontconfig',R/'usr/local/share/fonts'}
    output={};warnings={}
    for name,args in [('list',['fc-list','-f','%{file}\n']),('configs',['fc-conflist']),('version',['fc-list','--version'])]:
        q=subprocess.run(args,cwd=R,env=ENV,capture_output=True,text=True,check=True,timeout=30);output[name]=q.stdout;warnings[name]=q.stderr
        if name!='version'and q.stderr and not local:raise ValueError('Fontconfig resolution warning: '+q.stderr)
    paths=set();config_lines=[]
    for line in output['list'].splitlines():
        if not line.startswith('/'):raise ValueError('Unresolved fontconfig font path')
        paths.add(Path(line))
    if not paths:raise ValueError('Actual system font list empty')
    for line in output['configs'].splitlines():
        match=re.fullmatch(r'([+-]) (/.+?):(?: .*)?',line)
        if not match:raise ValueError('Unresolved fontconfig configuration path: '+line)
        config_lines.append(line);paths.add(Path(match[2]))
    root_rows=[];directory_links=[]
    for root in sorted(roots):
        present=root.exists();root_rows.append({'path':str(root),'present':present,'symlinkTarget':os.readlink(root)if root.is_symlink()else None,'resolved':str(root.resolve())})
        if present:
            if not root.is_dir():raise ValueError('Font root is not directory')
            pending=[(root,set())]
            while pending:
                directory,ancestors=pending.pop();real=directory.resolve(strict=True)
                if real in ancestors:raise ValueError('Cyclic font directory symlink')
                if directory.is_symlink():directory_links.append({'path':str(directory),'symlinkTarget':os.readlink(directory),'resolved':str(real)})
                for p in sorted(directory.iterdir()):
                    if p.is_dir():pending.append((p,ancestors|{real}))
                    elif p.is_file()or p.is_symlink():paths.add(p)
                    else:raise ValueError('Special font/config file')
    return {'environment':environment,'roots':root_rows,'directoryLinks':directory_links,'files':[font_file(p)for p in sorted(paths)],'fontconfigList':sorted(output['list'].splitlines()),'fontconfigConfigs':sorted(config_lines),'fontconfigVersion':output['version']+warnings['version'],'warnings':warnings,'scope':'Fontconfig/default native system font inputs, including canvas relative and home font directories'}
def git(*args):return subprocess.check_output(['git','-C',str(R),*args],env=ENV,timeout=30)
def validate_delta(rows,allowed):
    if sorted(rows)!=sorted(('A',p,'100644')for p in allowed) or len(set(allowed))!=len(allowed):raise ValueError('Diagnostic Git delta exceeds exact new-file allowlist')
    return True

def verify_frozen(root,manifest):
    actual=[]
    for p in root.rglob('*'):
        if p.is_symlink():raise ValueError('Diagnostic source symlink')
        if p.is_file() and p.relative_to(root).as_posix()!='FREEZE.json':actual.append(p.relative_to(root).as_posix())
    expected=[row['path']for row in manifest['files']]
    if sorted(actual)!=sorted(expected)or len(expected)!=len(set(expected)):raise ValueError('Diagnostic file set mismatch')
    for row in manifest['files']:
        p=root/row['path'];b=p.read_bytes()
        if len(b)!=row['bytes']or sha(b)!=row['sha256']:raise ValueError('Diagnostic bytes mismatch: '+row['path'])
    return True

def verify_admission(admission,env,config,now):
    try:
        run=admission['run'];raw=(json.dumps(run,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()
        for key in ['schema','window_number','run_id','workflow_id','run_number','run_attempt']:
            if type(run[key])is not int or run[key]<=0:raise ValueError('Admission numeric identity rejected')
        if config['prior_run']and type(run['prior_run_id'])is not int:raise ValueError('Prior window numeric identity rejected')
        if config['prior_run']:
            proof=admission['priorWindow'];old=proof['run'];jobs=proof['jobs'];expected=config['prior_run']
            if any(type(old[k])is not int for k in ['id','workflow_id','run_number','run_attempt'])or old['id']!=expected['id']or old['head_sha']!=expected['head_sha']or old['workflow_id']!=config['workflow_id']or old['run_number']!=1 or old['run_attempt']!=1 or old['status']!='completed'or old['conclusion']!='failure'or type(jobs['total_count'])is not int or jobs['total_count']!=0 or jobs['jobs']!=[]:raise ValueError('Prior zero-job failure proof rejected')
        if not math.isfinite(now)or type(admission['acceptedAtEpoch'])not in [int,float]or not math.isfinite(admission['acceptedAtEpoch']):raise ValueError('Admission clock invalid')
        checks=[admission['accepted']is True,env['GITHUB_EVENT_NAME']=='push',run['schema']==1,run['purpose']=='H37_EXPLICIT_WINDOW_DIAGNOSTIC_ONLY',run['repository']==config['repository']==env['GITHUB_REPOSITORY'],run['branch']==config['branch'],env['GITHUB_REF']=='refs/heads/'+config['branch'],run['workflow_path']==config['workflow'],type(run['workflow_id'])is int,run['run_id']==int(env['GITHUB_RUN_ID']),run['run_number']==int(env['GITHUB_RUN_NUMBER'])==config['run_number'],run['window_number']==config['window_number'],run['prior_run_id']==(config['prior_run']['id']if config['prior_run']else None),run['workflow_id']==config['workflow_id'],run['run_attempt']==int(env['GITHUB_RUN_ATTEMPT'])==1,run['diagnostic_commit']==env['GITHUB_SHA'],run['diagnostic_tree']==env['DIAGNOSTIC_TREE'],run['source_base']==config['base'],run['source_tree']==config['base_tree'],run['freeze_sha256']==env['FREEZE_SHA256'],run['release_blob_sha']==admission['releaseBlobSHA']==config['release_blob_sha'],admission['receiptBlobSHA']==git_blob_sha(raw),admission['receiptSHA256']==sha(raw),run['node_tree_mib']==768,run['non_node_mib']==256,run['aggregate_seconds']==180,utc_epoch(run['created_at'])<=admission['acceptedAtEpoch']<=now<utc_epoch(run['expires_at']),utc_epoch(run['expires_at'])==utc_epoch(run['created_at'])+1800]
        if not all(checks):raise ValueError('Admission mismatch')
    except (KeyError,TypeError,OverflowError)as e:raise ValueError('Admission missing/invalid')from e
    return True

def source_state():
    index=Path(git('rev-parse','--git-path','index').decode().strip());index=index if index.is_absolute()else R/index
    return {'head':git('rev-parse','HEAD').decode().strip(),'tree':git('rev-parse','HEAD^{tree}').decode().strip(),'indexSHA256':sha(index.read_bytes()),'trackedStatus':git('status','--porcelain=v1','--untracked-files=no').decode()}

def source_lock(*,allow_sparse=False):
    validate_native_environment(os.environ);config=json.loads((P/'CONFIG.json').read_text());rows=[];absent=[]
    for rec in git('ls-tree','-rz',config['base']).split(b'\0'):
        if not rec:continue
        info,path=rec.split(b'\t',1);mode,kind,blob=info.decode().split();name=path.decode()
        if kind!='blob'or not(name.startswith(('src/','data/','tests/','public/'))or name in ['package.json','package-lock.json','vite.config.js']):continue
        f=R/name
        if not f.is_file():
            if not allow_sparse:raise ValueError('Required physical public file missing: '+name)
            absent.append({'path':name,'blob':blob});continue
        fingerprint=file_fingerprint(f)
        if fingerprint['blob']!=blob or bool(f.stat().st_mode&0o111)!=(mode=='100755'):raise ValueError('Public bytes or executable mode differ: '+name)
        rows.append({'path':name,'mode':mode,**fingerprint})
    required=json.loads((P/'AST-AND-ASSERTIONS.json').read_text())
    for row in required['runtime']['files']:
        if file_fingerprint(R/row['path'])['sha256']!=row['sha256']:raise ValueError('Runtime static closure drift: '+row['path'])
    if not(R/'public/textures/hd/manifest.json').is_file():raise ValueError('Missing actual library HD manifest')
    dependencies=[];nm=R/'node_modules'
    for sub in ['three','@napi-rs','rollup','@rollup']:
        folder=nm/sub
        if not folder.is_dir():raise ValueError('Required dependency tree absent: '+sub)
        for f in sorted(folder.rglob('*')):
            if f.is_file():dependencies.append({'path':f.relative_to(nm).as_posix(),**file_fingerprint(f)})
    freeze=(P/'FREEZE.json').read_bytes();verify_frozen(P,json.loads(freeze))
    version=subprocess.check_output(['node','--version'],env=ENV,text=True,timeout=5).strip()
    if version!='v24.22.1' or os.environ.get('NODE_OPTIONS') or os.environ.get('NODE_PATH'):raise ValueError('Unpinned Node or ambient resolution override')
    return {'base':config['base'],'tree':config['base_tree'],'files':rows,'notExpanded':absent,'dependencies':dependencies,'fontInputs':font_inputs(local=allow_sparse),'nodeVersion':version,'freezeSHA256':sha(freeze),'packageFiles':json.loads(freeze)['files'],'scope':'Current actual inputs; physical absence allowed only for local static preparation'if allow_sparse else'Full current public source and actual installed platform dependencies'}

def prepare(*,local=False):
    config=json.loads((P/'CONFIG.json').read_text());freeze=json.loads((P/'FREEZE.json').read_text());before=source_state()
    if before['trackedStatus']:raise ValueError('Tracked source dirty')
    verify_frozen(P,freeze)
    if not local:
        if before['head']!=os.environ['GITHUB_SHA']or before['tree']!=os.environ['DIAGNOSTIC_TREE']:raise ValueError('Event Git identity mismatch')
        if sha((P/'FREEZE.json').read_bytes())!=os.environ['FREEZE_SHA256']:raise ValueError('Workflow freeze binding mismatch')
        parent=git('rev-list','--parents','-n','1','HEAD').decode().split()
        if parent!=[before['head'],config['diagnostic_parent']]:raise ValueError('Diagnostic commit not sole direct child of the authorized prior diagnostic commit')
        parts=git('diff','--no-renames','--name-status','-z',config['base'],'HEAD').split(b'\0')[:-1]
        rows=[]
        for i in range(0,len(parts),2):
            status,name=parts[i].decode(),parts[i+1].decode();mode=git('ls-tree','HEAD','--',name).decode().split()[0];rows.append((status,name,mode))
        allowed=['diagnostics/r165-h37-space/'+r['path']for r in freeze['files']]+['diagnostics/r165-h37-space/FREEZE.json',config['workflow']]
        validate_delta(rows,allowed)
    lock=source_lock(allow_sparse=local)
    if source_state()!=before:raise ValueError('Source/index drift during static preparation')
    return {'source':before,'inputs':lock,'actualFixtures':0,'localSparsePreparation':local}

def main():
    local=sys.argv[1:]==['--local-prepare'];result=prepare(local=local);out=Path(os.environ['EVIDENCE_DIR']);out.mkdir(parents=True,exist_ok=True)
    (out/'PREPARED-INPUTS.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'actualFixtures':0,'presentFiles':len(result['inputs']['files']),'explicitlyAbsent':len(result['inputs']['notExpanded']),'dependencies':len(result['inputs']['dependencies']),'localSparsePreparation':local}))
if __name__=='__main__':main()
