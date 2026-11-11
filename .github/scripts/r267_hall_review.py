"""Fixed one-shot private real-hall review; historical guards/files are untouched."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys

REPO='watsonbkeel/forbidden-city-3d'
REF='refs/heads/dev/r267-hall-review-async-init'
PARENT='f20bf5b3e893371b9a23d21136f82c41e75cee42'
PARENT_TREE='5b2e1950aed5d8facef167dd9b9e44e66398f632'
PRODUCT_TREE='8ac63f05ae9c968ab00d1b52711cff30144c4290'
ROOT='tests/r267-dafotang-hall-review/'
PATHS=['.github/scripts/r267_hall_review.py', '.github/scripts/r267_production_build_recheck.py', '.github/scripts/test_r267_hall_review.py', '.github/workflows/r267-dafotang-build-recheck.yml', '.github/workflows/r267-dafotang-hall-review.yml', '.github/workflows/r267-hall-review-async-init.yml', 'tests/r267-dafotang-hall-review/README.md', 'tests/r267-dafotang-hall-review/build-review.mjs', 'tests/r267-dafotang-hall-review/capture.mjs', 'tests/r267-dafotang-hall-review/contract.mjs', 'tests/r267-dafotang-hall-review/contract.test.mjs', 'tests/r267-dafotang-hall-review/pins.json', 'tests/r267-dafotang-hall-review/review-hall.html', 'tests/r267-dafotang-hall-review/review-hall.mjs']
CHANGES=[('M', '.github/scripts/r267_hall_review.py'), ('A', '.github/workflows/r267-hall-review-async-init.yml'), ('M', 'tests/r267-dafotang-hall-review/README.md'), ('M', 'tests/r267-dafotang-hall-review/contract.mjs'), ('M', 'tests/r267-dafotang-hall-review/contract.test.mjs'), ('M', 'tests/r267-dafotang-hall-review/pins.json'), ('M', 'tests/r267-dafotang-hall-review/review-hall.mjs')]
GUARD_HASH='e33618941b55f134b6e455cae016033e08412d7849e1d1b26a414f33ec88e8a3'
RECHECK_HASH='2e102777b68160b4ef3b10738c521f560c42ffce196535d635f44cd8f6cce205'
def require(value,message):
    if not value:raise ValueError(message)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def git_bytes(*args):return subprocess.check_output(['git','-c','core.preloadIndex=false','-c','index.threads=1','-c','core.packedGitWindowSize=1m','-c','core.packedGitLimit=16m',*args])
def git(*args):return git_bytes(*args).decode().strip()
def select(phase):
    names={'review-build':'build-review.mjs','visual':'capture.mjs'}
    if phase not in names:raise ValueError('only fixed companion build or isolated visual phase')
    return ['node',ROOT+names[phase]]
def validate_event(env,event):
    wanted=dict(CI='true',GITHUB_ACTIONS='true',GITHUB_REPOSITORY=REPO,GITHUB_REF=REF,GITHUB_EVENT_NAME='push',GITHUB_RUN_NUMBER='1',GITHUB_RUN_ATTEMPT='1',REVIEW_RUNNER_ENVIRONMENT='github-hosted',RUNNER_OS='Linux',RUNNER_ARCH='X64')
    require(all(env.get(k)==v for k,v in wanted.items()),'wrong one-shot review event/platform')
    require(re.fullmatch('[a-f0-9]{40}',env.get('GITHUB_SHA','')) is not None,'invalid event SHA')
    require(event.get('created') is True and event.get('deleted') is False and event.get('forced') is False and event.get('before')=='0'*40 and event.get('after')==env['GITHUB_SHA'] and event.get('ref')==REF and event.get('repository',{}).get('full_name')==REPO,'only first nonforced new branch push')
    forbidden={'NODE_OPTIONS','NODE_PATH','PYTHONPATH','PYTHONHOME','PYTHONOPTIMIZE','LD_PRELOAD','LD_LIBRARY_PATH','BASH_ENV','ENV','NODE_V8_COVERAGE','TEST_GC','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES'}
    require(not sys.flags.optimize and not any(env.get(k) for k in forbidden) and not any(env.get(k) for k in env if k.startswith(('R267_','R265_','R264_','R262_','GIT_CONFIG_'))),'source, loader or resource override rejected')
def validate_checkout():
    validate_event(os.environ,json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text()))
    from r265_dafotang_runtime_bound import check_npm_environment,check_fixed_npm_file,check_project_config
    # Reuse the unchanged proven npm-boundary helper, including its fixed temp filename.
    check_npm_environment(os.environ);check_fixed_npm_file(Path(os.environ['NPM_CONFIG_GLOBALCONFIG']));p=Path('.npmrc');check_project_config(p.exists(),p.is_symlink())
    require(git('rev-parse','HEAD')==os.environ['GITHUB_SHA'],'wrong checkout head')
    require(git('show','-s','--format=%P','HEAD')==PARENT and git('rev-parse','HEAD^1^{tree}')==PARENT_TREE,'wrong reviewed R267 parent/tree')
    require(git('diff','--name-status','HEAD^1','HEAD')=='\n'.join(action+'\t'+p for action,p in CHANGES),'unexpected successor path/action delta')
    require(not git('status','--porcelain=v1','--untracked-files=all'),'checkout dirty')
    pins=json.loads(Path(ROOT+'pins.json').read_text());require(pins['remoteParent']==PARENT and pins['parentTree']==PARENT_TREE and pins['productTree']==PRODUCT_TREE and pins['candidatePaths']==PATHS and pins['changes']==[list(row) for row in CHANGES],'pin identity mismatch')
    for p,digest in pins['sourcePins'].items():require(sha(p)==digest,'retained source changed: '+p)
    for p,digest in pins['parentPins'].items():require(hashlib.sha256(git_bytes('show',PARENT+':'+p)).hexdigest()==digest,'reviewed parent source changed: '+p)
    require(sha('.github/scripts/r177_build_bound.py')==GUARD_HASH and sha('.github/scripts/r262_exit_recheck.py')==RECHECK_HASH,'guard/recheck changed')
    return {'head':os.environ['GITHUB_SHA'],'tree':git('rev-parse','HEAD^{tree}'),'parent':PARENT,'parentTree':PARENT_TREE,'productTree':PRODUCT_TREE,'sourcePins':pins['sourcePins'],'parentPins':pins['parentPins'],'candidateFiles':{p:sha(p) for p in PATHS},'runner':{k:os.environ.get(k) for k in ('ImageOS','ImageVersion','RUNNER_OS','RUNNER_ARCH','REVIEW_RUNNER_ENVIRONMENT')},'runId':os.environ.get('GITHUB_RUN_ID'),'runAttempt':os.environ['GITHUB_RUN_ATTEMPT']}
def configure_guard(guard,phase):
    select(phase)
    require((guard.RSS_CAP,guard.WALL_SECONDS,guard.LOG_CAP,guard.SAMPLE_SECONDS,guard.MARGIN,guard.ADMISSION_INTERVAL,guard.HEAP_FLAGS)==(4*1024**3,720,32*1024**2,.1,256*1024**2,1.,'--max-old-space-size=2048 --max-semi-space-size=16'),'unexpected original guard policy')
    if phase=='visual':guard.RSS_CAP=6442450944

def main():
    require(len(sys.argv)==2,'one fixed phase required');phase=sys.argv[1]
    require(phase in ('admit','review-build','visual'),'unknown phase');identity=validate_checkout()
    evidence=Path(os.environ['EVIDENCE_DIR']);require(evidence.is_absolute() and not evidence.is_relative_to(Path.cwd()),'external evidence directory required')
    if phase=='admit':
        require(not Path('dist').exists(),'ordinary dist must be fresh');(evidence/'checkout-identity.json').write_text(json.dumps(identity,indent=2)+'\n');print(json.dumps(identity));return 0
    prior=json.loads((evidence/'checkout-identity.json').read_text());require(prior==identity,'source identity changed since admission')
    for program,version in (('node','v24.22.1'),('npm','11.19.1')):require(subprocess.check_output([program,'--version'],text=True).strip()==version,'locked toolchain changed')
    with (evidence/(phase+'-attempt.json')).open('x') as out:json.dump({'identity':identity,'phase':phase,'releaseAccepted':False},out)
    source=Path('.github/scripts/r177_build_bound.py');spec=importlib.util.spec_from_file_location('unchanged_r177',source);guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard);configure_guard(guard,phase)
    from r262_exit_recheck import install_exit_state_recheck
    folder=evidence/(phase+'-guard');folder.mkdir();checks=install_exit_state_recheck(guard,folder/'exit-rechecks.json')
    env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS
    result=guard.supervise(select(phase),folder,guard.resource_sample,{**identity,'scope':phase+' limited single-hall only; not release acceptance','guardSha256':GUARD_HASH,'exitRecheckSha256':RECHECK_HASH,'exitRechecks':checks,'wrapperSha256':sha(__file__)},env)
    print(json.dumps({k:result.get(k) for k in ('status','reason','exit_code','child_exit_code','cleanup_complete')}));return result['exit_code']
if __name__=='__main__':
    try:raise SystemExit(main())
    except (ValueError,OSError,KeyError,subprocess.CalledProcessError) as e:
        print('R267 review admission failed:',e,file=sys.stderr);raise SystemExit(1)
