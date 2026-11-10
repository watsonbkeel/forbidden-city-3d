#!/usr/bin/env python3
"""One authorized 6 GiB diagnostic, not a replacement for the failed 4 GiB run.

No retry, budget/command CLI overrides, product changes, release or deployment.
The unmodified original supervisor enforces actual host/ancestor-cgroup headroom.
"""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys

PARENT = '8c9812eebeb328368e8d308d4707bcfccf104ff6'
PARENT_TREE = 'f9757668a472745526dccde1bd30b4996fc783ed'
ADDED_PATHS = (
    '.github/scripts/r262_functional_diagnostic.py',
    '.github/scripts/test_r262_functional_diagnostic.py',
    '.github/workflows/r262-functional-diagnostic.yml',
)
PINS = {
    '.github/scripts/r177_build_bound.py': 'e33618941b55f134b6e455cae016033e08412d7849e1d1b26a414f33ec88e8a3',
    '.github/scripts/r262_exit_recheck.py': '2e102777b68160b4ef3b10738c521f560c42ffce196535d635f44cd8f6cce205',
    '.github/scripts/r262_runtime_bound.py': '7f4d1aed3fa627bd8f6cc4a560d80fb81031937b9cc970bee1597a4923a80f54',
    '.github/workflows/r262-validation.yml': '0af3dfeae84bf1de8fbd1dd40544171532151cb31d608dbb077b8a5c702dfffa',
    'tests/production-smoke.mjs': 'e171e8f60e2e75d14ee47b1c2073fd54ef267933c8f8d0915af3c5397b8f99d1',
}

def require(condition, message):
    if not condition:
        raise ValueError(message)

def load_module(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def validate_event(env, event):
    required = dict(GITHUB_ACTIONS='true', CI='true', GITHUB_REPOSITORY='watsonbkeel/forbidden-city-3d',
                    GITHUB_EVENT_NAME='push', GITHUB_REF='refs/heads/dev/r262-functional-diagnostic',
                    GITHUB_RUN_NUMBER='1', GITHUB_RUN_ATTEMPT='1',
                    DIAGNOSTIC_RUNNER_ENVIRONMENT='github-hosted', RUNNER_OS='Linux', RUNNER_ARCH='X64')
    for key, value in required.items():
        require(env.get(key) == value, 'diagnostic event/platform rejected: '+key)
    require(re.fullmatch('[0-9a-f]{40}', env.get('GITHUB_SHA','')) is not None, 'invalid event SHA')
    require(event.get('created') is True and event.get('deleted') is False and event.get('forced') is False,
            'only first non-forced branch creation is authorized')
    require(event.get('before') == '0'*40 and event.get('after') == env['GITHUB_SHA'], 'push identity mismatch')
    require(event.get('ref') == required['GITHUB_REF'], 'event ref mismatch')
    require(event.get('repository',{}).get('full_name') == required['GITHUB_REPOSITORY'], 'event repository mismatch')
    for key in ('NODE_OPTIONS','TEST_GC','NODE_V8_COVERAGE','NODE_PATH'):
        require(not env.get(key), 'unexpected inherited '+key)

def verify_source(env):
    def git(*args):
        return subprocess.check_output(['git',*args],text=True).strip()
    require(git('rev-parse','HEAD') == env['GITHUB_SHA'], 'checkout differs from exact event')
    require(not git('status','--porcelain=v1','--untracked-files=all'), 'checkout is dirty')
    require(git('show','-s','--format=%P','HEAD') == PARENT, 'wrong diagnostic parent')
    require(git('rev-parse','HEAD^1^{tree}') == PARENT_TREE, 'wrong product parent tree')
    require(git('diff','--name-status','HEAD^1','HEAD') == '\n'.join('A\t'+p for p in ADDED_PATHS),
            'diagnostic changed an existing path or unreviewed addition')
    for file, expected in PINS.items():
        require(hashlib.sha256(Path(file).read_bytes()).hexdigest() == expected, 'pinned input changed: '+file)
    return {'head':env['GITHUB_SHA'], 'tree':git('rev-parse','HEAD^{tree}'),
            'productParent':PARENT, 'productParentTree':PARENT_TREE, 'unchangedInputSha256':PINS,
            'runner':{key:env.get(key) for key in ('DIAGNOSTIC_RUNNER_ENVIRONMENT','RUNNER_OS','RUNNER_ARCH','ImageOS','ImageVersion')}}

def configure_guard(guard):
    require((guard.RSS_CAP,guard.WALL_SECONDS,guard.LOG_CAP,guard.SAMPLE_SECONDS,guard.MARGIN,guard.ADMISSION_INTERVAL,guard.HEAP_FLAGS)
            == (4*1024**3,720,32*1024**2,.1,256*1024**2,1.0,'--max-old-space-size=2048 --max-semi-space-size=16'),
            'unexpected original supervision policy')
    guard.RSS_CAP = 6*1024**3

def claim_attempt(evidence, env):
    # A second invocation in this job fails; Actions first-run/attempt gates
    # cover fresh-runner retries. No cross-run mutable cache is trusted.
    with (evidence/'diagnostic-attempt.json').open('x') as out:
        json.dump({'kind':'DIAGNOSTIC', 'candidate':env['GITHUB_SHA'],
                   'runId':env.get('GITHUB_RUN_ID'), 'runNumber':env['GITHUB_RUN_NUMBER'],
                   'runAttempt':env['GITHUB_RUN_ATTEMPT'], 'releaseAccepted':False},out,indent=2)
        out.write('\n'); out.flush(); os.fsync(out.fileno())

def diagnostic_summary(result, smoke, evidence_error=None):
    passed = (evidence_error is None and result.get('status') == 'PASS' and result.get('exit_code') == 0 and result.get('cleanup_complete') is True
              and smoke.get('status') == 'AUTOMATED_SMOKE_PASS_VISUAL_REVIEW_REQUIRED'
              and smoke.get('coreStatus') == 'PASS' and smoke.get('captureStatus') == 'PASS'
              and smoke.get('releaseAccepted') is False)
    return {'kind':'DIAGNOSTIC', 'evidenceError':evidence_error, 'status':'DIAGNOSTIC_AUTOMATED_PASS_VISUAL_REVIEW_REQUIRED' if passed else 'DIAGNOSTIC_FAIL',
            'releaseAccepted':False, 'prior4GiBResult':'FAIL_UNCHANGED', 'productParent':PARENT, 'productParentTree':PARENT_TREE,
            'hardwareGpuTested':False, 'physicalPhoneTested':False, 'visualReview':'REQUIRED',
            'runtime':{k:result.get(k) for k in ('status','reason','detail','exit_code','child_exit_code','cleanup_complete',
                       'limits','sampled_tree_peak_bytes','build_elapsed_seconds','identity')},
            'smoke':{k:smoke.get(k) for k in ('status','coreStatus','captureStatus','stage','failure','build')},
            'interpretation':'One desktop software-rendered diagnostic; no 4GiB pass, memory improvement, device performance or release acceptance inferred.'}

def read_smoke_evidence(file):
    # Evidence errors must never replace the supervisor's original terminal state.
    try:
        with file.open('rb') as source:
            raw = source.read(8*1024**2+1)
        require(len(raw) <= 8*1024**2, 'smoke evidence exceeds read bound')
        smoke = json.loads(raw)
        require(isinstance(smoke,dict), 'smoke evidence must be a JSON object')
        return smoke, None
    except (OSError,ValueError) as exc:
        return {}, str(exc)

def main():
    evidence = Path(os.environ['EVIDENCE_DIR'])
    evidence.mkdir(parents=True,exist_ok=True)
    result = {'status':'FAIL','reason':'DIAGNOSTIC_PRECHECK_REJECTED','exit_code':1,'cleanup_complete':True}
    smoke = {}
    evidence_error = None
    try:
        require(len(sys.argv) == 1, 'no CLI budget/command overrides accepted')
        event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
        validate_event(os.environ,event)
        identity = verify_source(os.environ)
        claim_attempt(evidence,os.environ)
        guard = load_module('unchanged_r177_diagnostic_supervisor',Path('.github/scripts/r177_build_bound.py'))
        configure_guard(guard)
        adapter = load_module('unchanged_r262_exit_adapter',Path('.github/scripts/r262_exit_recheck.py'))
        rechecks = adapter.install_exit_state_recheck(guard,evidence/'runtime-guard'/'exit-rechecks.json')
        identity.update({'scope':'DIAGNOSTIC: original full production browser route at 6GiB; not a release or 4GiB pass',
                         'releaseAccepted':False,'prior4GiBResult':'FAIL_UNCHANGED',
                         'runtime_wrapper_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                         'exit_rechecks':rechecks})
        env = os.environ.copy()
        env['NODE_OPTIONS'] = guard.HEAP_FLAGS
    except (OSError,ValueError,KeyError,subprocess.CalledProcessError) as exc:
        result = {**result,'detail':str(exc)}
    else:
        # Once runtime can start, cleanup is unverified until supervise returns.
        result = {'status':'FAIL','reason':'DIAGNOSTIC_SUPERVISOR_EXCEPTION',
                  'exit_code':1,'cleanup_complete':False}
        try:
            result = guard.supervise(['node','tests/production-smoke.mjs'],evidence/'runtime-guard',guard.resource_sample,identity,env)
        except Exception as exc:  # Runtime only; never retry or claim cleanup on an unexpected failure.
            result = {**result,'detail':str(exc)}
        smoke, evidence_error = read_smoke_evidence(evidence/'production-smoke.json')
    summary = diagnostic_summary(result,smoke,evidence_error)
    temporary = evidence/'diagnostic-summary.json.tmp'
    with temporary.open('w') as out:
        json.dump(summary,out,indent=2); out.write('\n'); out.flush(); os.fsync(out.fileno())
    os.replace(temporary,evidence/'diagnostic-summary.json')
    print(json.dumps(summary))
    return 0 if summary['status']=='DIAGNOSTIC_AUTOMATED_PASS_VISUAL_REVIEW_REQUIRED' else 1

if __name__=='__main__': raise SystemExit(main())
