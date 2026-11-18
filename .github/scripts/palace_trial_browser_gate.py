"""One fixed dev-branch browser job; no install, deploy, arbitrary command or retries."""
import json
import os
import subprocess
import sys
from pathlib import Path
from r335_bound_build import load, require, sha
from r343_world_gate import validate_environment, validate_terminal

PARENT = 'a0b4c4d4ee057079304468d97024f03f9548003b'
BRANCH = 'dev/palace-trial-browser-20261118'
CAP = 6 * 1024**3
UNIT = 'palace-trial-visual.scope'
CAPTURE = 'tests/final-audit/hosted-capture.mjs'
ALLOWED = {CAPTURE,'.github/scripts/palace_trial_browser_gate.py','.github/workflows/palace-trial-browser.yml'}
git = lambda *args: subprocess.check_output(['git',*args],text=True,timeout=15).strip()

def valid_source():
    env=os.environ
    require(env.get('GITHUB_ACTIONS')=='true' and env.get('RUNNER_ENVIRONMENT')=='github-hosted','hosted actions only')
    require(env.get('GITHUB_REPOSITORY')=='watsonbkeel/forbidden-city-3d' and env.get('GITHUB_REF')=='refs/heads/'+BRANCH and env.get('GITHUB_EVENT_NAME')=='push','wrong repo/ref/event')
    evt=json.loads(Path(env['GITHUB_EVENT_PATH']).read_text())
    head=git('rev-parse','HEAD'); tree=git('rev-parse','HEAD^{tree}')
    require(evt.get('created') is True and evt.get('deleted') is False and evt.get('forced') is False and evt.get('before')=='0'*40,'not new branch')
    require(env.get('GITHUB_RUN_ATTEMPT')=='1' and env.get('GITHUB_RUN_NUMBER')=='1' and head==env.get('GITHUB_SHA')==evt.get('after'),'not first exact event')
    require(git('rev-list','--parents','-n','1','HEAD').split()==[head,PARENT],'wrong parent')
    changes=git('diff','--name-status',PARENT,'HEAD').splitlines()
    require(set(changes)=={'A\t'+p for p in ALLOWED} and len(changes)==len(ALLOWED),'QA-only additive diff required')
    require(not git('status','--porcelain','--untracked-files=all'),'dirty checkout')
    return {'head':head,'tree':tree,'parent':PARENT,'branch':BRANCH,'runId':env['GITHUB_RUN_ID'],'releaseAccepted':False}

def inside():
    # The *entire* Vite/Playwright/Chromium subprocess tree must inherit this
    # exact kernel-enforced cap before any browser, server or child is started.
    cg=Path('/proc/self/cgroup').read_text().strip()
    require(cg.startswith('0::/') and '\n' not in cg and cg.endswith('/'+UNIT),'not in dedicated unified scope')
    dir=Path('/sys/fs/cgroup')/cg[3:].lstrip('/')
    require(dir.resolve()==dir and (dir/'memory.max').read_text().strip()==str(CAP) and (dir/'memory.swap.max').read_text().strip()=='0','hard limit not installed')
    require((dir/'cgroup.type').read_text().strip()=='domain','unexpected scope type')
    evidence=Path(os.environ['EVIDENCE_DIR'])
    with (evidence/'hard-cap.json').open('x') as f:json.dump({'scope':str(dir),'memoryMax':CAP,'swapMax':0},f)
    os.execvp('node',['node',CAPTURE])

def main():
    if sys.argv[1:]==['inside']:return inside()
    require(len(sys.argv)==1,'no command/budget overrides')
    validate_environment(os.environ);identity=valid_source()
    evidence=Path(os.environ['EVIDENCE_DIR']);require(evidence.resolve()==evidence and evidence.parent==Path(os.environ['RUNNER_TEMP']).resolve() and not evidence.is_relative_to(Path.cwd()),'external evidence only')
    with(evidence/'checkout-identity.json').open('x') as f:json.dump(identity,f)
    # Retain the stronger project's initial-namespace/visible-controller gate
    # as well as the later 6 GiB R327 live RSS/cleanup supervisor.
    mem=Path('scripts/ci/dafotang-host/memory_budget.py')
    require(sha(mem)=='e0fe1dc4a9d8fce36e5d2c8ee728df0cb2d3df1a9896ab49a95c79067e98fe61','changed native admission')
    sys.path.insert(0,str(mem.resolve().parent))
    from memory_budget import MemoryWatch
    admission=MemoryWatch().admit()
    with(evidence/'native-admission.json').open('x') as f:json.dump(admission,f)
    guard=load('r327_bound_exit_guard'); observe=load('r267_owned_rss_observation'); recheck=load('r262_exit_recheck')
    require((guard.RSS_CAP,guard.WALL_SECONDS,guard.HEAP_FLAGS)==(4*1024**3,720,'--max-old-space-size=2048 --max-semi-space-size=16'),'unexpected guard')
    guard.RSS_CAP=CAP # same 6 GiB visual allowance as original R360; also enforce in kernel below
    folder=evidence/'guard';folder.mkdir();path=folder/'exit-rechecks.json'
    observer,journal=observe.install(guard,recheck,path,folder/'first-owned-rss-failure.json');guard.atomic_json(path,journal)
    keep=('PATH','HOME','USER','LOGNAME','LANG','LC_ALL','TMPDIR','CI','GITHUB_ACTIONS','GITHUB_SHA','EVIDENCE_DIR','PLAYWRIGHT_BROWSERS_PATH','XDG_RUNTIME_DIR','DBUS_SESSION_BUS_ADDRESS')
    child={k:os.environ[k] for k in keep if os.environ.get(k)}
    child.update(NODE_OPTIONS=guard.HEAP_FLAGS,VITE_BASE='/forbidden-city-3d/',PYTHONDONTWRITEBYTECODE='1')
    # A user-owned transient *scope*: no sudo, no service with an unrelated
    # parent PID, no permanent change. If not delegated, do NOT run unbounded.
    cmd=['systemd-run','--user','--scope','--quiet','--unit='+UNIT,'-p','MemoryMax='+str(CAP),'-p','MemorySwapMax=0','python3',__file__,'inside']
    try:
        result=guard.supervise(cmd,folder,guard.resource_sample,identity,child)
        code=validate_terminal(result,identity)
        if code==0:require((evidence/'hard-cap.json').is_file(),'missing kernel admission')
        return code
    finally:
        guard.atomic_json(path,journal);guard.atomic_json(folder/'observation.json',observer.summary())

if __name__=='__main__':
    try:raise SystemExit(main())
    except Exception as err:print('Hosted browser admission/test failed:',err,file=sys.stderr);raise SystemExit(1)
