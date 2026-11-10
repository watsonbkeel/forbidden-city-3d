#!/usr/bin/env python3
"""Fixed, CI-only R265 host/visual selector; original guard remains unchanged."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import stat
import sys

REPO = 'watsonbkeel/forbidden-city-3d'
REF = 'refs/heads/dev/r265-dafotang-runtime-validation'
P = 'bfdef5abfd851e551339f7d8b328a0ccf792e389'
P_TREE = 'af16ca384ff59d185953962b981fe6cbcef55b3a'
P_PARENT = 'd39b43904f314c994693552de9036040ae22e342'
P_PARENT_TREE = 'f3df79664badacf99d05bbe5ba01314d175b2343'
M_PATHS = ('tests/r265-dafotang-frieze/compatibility.test.mjs',
           'tests/r265-dafotang-frieze/snapshot-view.mjs')
PATHS = sorted([('A',p) for p in (
    '.github/workflows/r265-dafotang-runtime-validation.yml',
    '.github/scripts/r265_dafotang_runtime_bound.py',
    '.github/scripts/test_r265_dafotang_runtime_bound.py',
    'tests/r265-dafotang-runtime/pins.json',
    'tests/r265-dafotang-runtime/baseline-host.mjs',
    'tests/r265-dafotang-runtime/host-contract.mjs',
    'tests/r265-dafotang-runtime/host-run.mjs',
    'tests/r265-dafotang-runtime/host-contract.test.mjs',
    'tests/r265-dafotang-runtime/visual.mjs',
    'tests/r265-dafotang-runtime/visual.test.mjs',
    'tests/r265-dafotang-runtime/README.md')] + [('M',p) for p in M_PATHS], key=lambda x:x[1])
GUARD_HASH = 'e33618941b55f134b6e455cae016033e08412d7849e1d1b26a414f33ec88e8a3'
RECHECK_HASH = '2e102777b68160b4ef3b10738c521f560c42ffce196535d635f44cd8f6cce205'

def select(mode):
    targets = {'host':'tests/r265-dafotang-runtime/host-run.mjs',
               'visual':'tests/r265-dafotang-runtime/visual.mjs'}
    if mode not in targets: raise ValueError('unknown fixed phase')
    return ['node', targets[mode]]

def check_npm_environment(env):
    # npm lowercases the npm_config_ suffix and maps internal underscores to hyphens.
    temp=env.get('RUNNER_TEMP','')
    if not os.path.isabs(temp): raise ValueError('absolute runner temp required')
    expected={'userconfig':'/dev/null','globalconfig':os.path.join(temp,'r265-empty-global.npmrc')}
    fixed=dict.fromkeys(expected,False)
    for key,value in env.items():
        if not value: continue
        if key in ('PREFIX','DESTDIR'):
            raise ValueError('npm config selector override: '+key)
        if not key.lower().startswith('npm_config_'): continue
        name=key[len('npm_config_'):].lower().replace('_','-')
        if name in ('node-options','script-shell','prefix'):
            raise ValueError('npm loader, shell, or prefix override: '+key)
        if name in fixed:
            if value!=expected[name]: raise ValueError('npm config selector override: '+key)
            fixed[name]=True
    if not all(fixed.values()): raise ValueError('fixed npm user/global config required')

def check_fixed_npm_file(path):
    path=Path(path);before=path.lstat()
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode) or before.st_size!=0:
        raise ValueError('fixed global npm config must be empty regular non-symlink')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        after=os.fstat(fd)
        if not stat.S_ISREG(after.st_mode) or (before.st_dev,before.st_ino)!=(after.st_dev,after.st_ino) or after.st_size!=0 or os.read(fd,1):
            raise ValueError('fixed global npm config changed or is nonempty')
    finally: os.close(fd)

def check_project_config(exists, symlink):
    if exists or symlink: raise ValueError('project npmrc forbidden at fixed checkout')

def check_environment(env, optimized=False):
    forbidden={'NODE_OPTIONS','NODE_PATH','PYTHONOPTIMIZE','PYTHONPATH','PYTHONHOME',
               'LD_PRELOAD','LD_LIBRARY_PATH','BASH_ENV','ENV','NODE_V8_COVERAGE','TEST_GC',
               'GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES'}
    if optimized or any(env.get(k) for k in forbidden) or any(
        env.get(k) for k in env if k.startswith(('R265_', 'R264_', 'R262_', 'GIT_CONFIG_'))):
        raise ValueError('source, loader, guard, or optimization override')
    check_npm_environment(env)
    if any(env.get(k)!=v for k,v in {'CI':'true','GITHUB_ACTIONS':'true',
            'GITHUB_REPOSITORY':REPO,'GITHUB_EVENT_NAME':'push','GITHUB_REF':REF}.items()):
        raise ValueError('wrong CI event')

def admit(*, env, head, parent, parent_tree, grandparent, grandparent_tree, diff, clean, pins_ok, optimized=False):
    check_environment(env, optimized)
    if env.get('GITHUB_SHA') != head or len(head)!=40:
        raise ValueError('wrong CI head')
    if parent != P or parent_tree != P_TREE or grandparent != P_PARENT or grandparent_tree != P_PARENT_TREE or diff != PATHS or not clean or not pins_ok:
        raise ValueError('wrong tree, paths, sources, or checkout state')

def git(*args):
    return subprocess.check_output(['git',*args], text=True).strip()

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def source_matches(path, digest, parent_bytes, worktree_sha):
    if path in M_PATHS:
        return hashlib.sha256(parent_bytes(path)).hexdigest()==digest
    return worktree_sha(path)==digest

def verify_pins():
    pins=json.loads(Path('tests/r265-dafotang-runtime/pins.json').read_text())
    if (pins['remoteP'],pins['remotePTree'],pins['remotePParent']) != (P,P_TREE,P_PARENT): return False
    if sorted(pins['vPaths']) != [p for action,p in PATHS if action=='A']: return False
    if sorted(pins['vModifiedPaths']) != list(M_PATHS): return False
    parent_bytes=lambda path: subprocess.check_output(['git','show',f'{P}:{path}'])
    if any(not source_matches(path,digest,parent_bytes,sha) for path,digest in pins['sourcePins'].items()): return False
    files=pins['pFiles']
    if len(files)!=23 or sum(x['bytes'] for x in files)!=884720: return False
    diff=git('diff','--name-status',P_PARENT,P).splitlines()
    expected=sorted(f"{x['action']}\t{x['path']}" for x in files)
    if sorted(diff)!=expected: return False
    for x in files:
        data=subprocess.check_output(['git','show',f"{P}:{x['path']}"])
        if len(data)!=x['bytes'] or hashlib.sha256(data).hexdigest()!=x['sha256']:
            return False
    return sha('.github/scripts/r177_build_bound.py')==GUARD_HASH and sha('.github/scripts/r262_exit_recheck.py')==RECHECK_HASH

def validate_checkout():
    check_environment(os.environ, bool(sys.flags.optimize))
    check_fixed_npm_file(Path(os.environ['NPM_CONFIG_GLOBALCONFIG']))
    project=Path('.npmrc');check_project_config(project.exists(),project.is_symlink())
    head=git('rev-parse','HEAD')
    parent=git('show','-s','--format=%P','HEAD')
    grandparent=git('show','-s','--format=%P',P)
    parent_tree=git('rev-parse',f'{P}^{{tree}}')
    grandparent_tree=git('rev-parse',f'{P_PARENT}^{{tree}}')
    raw=git('diff','--name-status',P,'HEAD')
    diff=[tuple(x.split('\t')) for x in raw.splitlines()]
    admit(env=os.environ, head=head,parent=parent,parent_tree=parent_tree,grandparent=grandparent,grandparent_tree=grandparent_tree,
          diff=diff,clean=not git('status','--porcelain=v1','--untracked-files=all'),
          pins_ok=verify_pins(),optimized=bool(sys.flags.optimize))
    return head

def main():
    if len(sys.argv)!=2: raise ValueError('one fixed phase required')
    command=select(sys.argv[1])
    head=validate_checkout()
    source=Path('.github/scripts/r177_build_bound.py')
    spec=importlib.util.spec_from_file_location('unchanged_r177_supervisor',source)
    guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
    from r262_exit_recheck import install_exit_state_recheck
    evidence=Path(os.environ['EVIDENCE_DIR'])/(sys.argv[1]+'-guard')
    checks=install_exit_state_recheck(guard,evidence/'exit-rechecks.json')
    env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS
    identity={'head':head,'scope':sys.argv[1]+' validation only; no release acceptance',
              'guard_sha256':GUARD_HASH,'exit_recheck_sha256':RECHECK_HASH,
              'runtime_wrapper_sha256':sha(__file__),'script_sha256':sha(command[1]),'exit_rechecks':checks}
    result=guard.supervise(command,evidence,guard.resource_sample,identity,env)
    print(json.dumps({k:result.get(k) for k in ('status','reason','exit_code','child_exit_code','cleanup_complete')}))
    return result['exit_code']

if __name__=='__main__':
    try: raise SystemExit(main())
    except (ValueError, OSError, subprocess.CalledProcessError, KeyError) as exc:
        print('R265 admission failed:',exc,file=sys.stderr);raise SystemExit(1)
