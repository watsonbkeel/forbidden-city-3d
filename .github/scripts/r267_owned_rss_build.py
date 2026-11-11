"""One reviewed successor: original hall chain plus ordinary-read observation only."""
import importlib.util
import json
import os
from pathlib import Path
import sys

import r267_hall_review as review
from r267_owned_rss_observation import install,private_function

PARENT='dc55552585b0d2b29904c8e1610076d9b20d024d'
PARENT_TREE='51af226a2cf003b571952b53e71fb02293007bbf'
REF='refs/heads/dev/r267-owned-rss-observation'
ROOT='tests/r267-owned-rss-observation/'
PATHS=['.github/scripts/r267_owned_rss_build.py','.github/scripts/r267_owned_rss_observation.py',
       '.github/scripts/test_r267_owned_rss_observation.py','.github/workflows/r267-owned-rss-observation.yml',
       ROOT+'README.md',ROOT+'pins.json']
MODIFIED=['tests/r267-dafotang-hall-review/contract.mjs','tests/r267-dafotang-hall-review/contract.test.mjs']
CHANGES=sorted([('A',path) for path in PATHS]+[('M',path) for path in MODIFIED],key=lambda row:row[1])
PATHS=sorted(PATHS+MODIFIED)
# Reuse original event/platform/npm/checkout/source admission, without mutating it.
validate_event=private_function(review.validate_event,{'REF':REF})
validate_checkout=private_function(review.validate_checkout,{'REF':REF,'PARENT':PARENT,'PARENT_TREE':PARENT_TREE,
    'ROOT':ROOT,'PATHS':PATHS,'CHANGES':CHANGES,'validate_event':validate_event})

def load(name):
    spec=importlib.util.spec_from_file_location(name,Path('.github/scripts')/(name+'.py'))
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module

def ordinary():
    review.require(len(sys.argv)==1,'ordinary build takes no arguments')
    identity=validate_checkout();evidence=Path(os.environ['EVIDENCE_DIR'])
    review.require(evidence.is_absolute() and not evidence.is_relative_to(Path.cwd()),'external evidence directory required')
    review.require(json.loads((evidence/'checkout-identity.json').read_text())==identity,'source identity changed since admission')
    review.require(not Path('dist').exists(),'ordinary dist must be fresh')
    guard=load('r177_build_bound');recheck=load('r262_exit_recheck')
    review.require(review.sha('.github/scripts/r177_build_bound.py')==review.GUARD_HASH and review.sha('.github/scripts/r262_exit_recheck.py')==review.RECHECK_HASH,'original guard/recheck changed')
    marker=evidence/'ordinary-build-attempt.json'
    with marker.open('x') as claimed:claimed.flush();os.fsync(claimed.fileno())
    receipt={'status':'RUNNING','identity':identity,'adapterSha256':review.sha(__file__),
             'observerSha256':review.sha('.github/scripts/r267_owned_rss_observation.py'),
             'guardSha256':review.GUARD_HASH,'recheckSha256':review.RECHECK_HASH,'guardExitCode':None,'releaseAccepted':False}
    guard.atomic_json(marker,{'identity':identity,'phase':'ordinary-production-build','releaseAccepted':False})
    journal_path=evidence/'ordinary-build-exit-rechecks.json'
    observer,journal=install(guard,recheck,journal_path,evidence/'ordinary-first-owned-rss-failure.json')
    guard.atomic_json(journal_path,journal)
    guard.atomic_json(evidence/'ordinary-build-observation.json',receipt)
    code=None
    try:
        code=guard.main()  # Unchanged ordinary command, args, env, sampler and supervisor.
        terminal=json.loads((evidence/'build-terminal.json').read_text())
        review.require(terminal.get('exit_code')==code and terminal.get('identity',{}).get('head')==identity['head'] and terminal['identity'].get('tree')==identity['tree'],'original terminal identity/exit missing')
        if code==0:
            review.require(terminal.get('status')=='PASS' and terminal.get('child_exit_code')==0 and terminal.get('cleanup_complete') is True,'original build/cleanup not PASS')
        receipt.update(status='PASS' if code==0 else 'FAIL',guardExitCode=code)
        return code
    finally:
        if receipt['status']=='RUNNING':receipt.update(status='FAIL',guardExitCode=code)
        receipt['observation']=observer.summary()
        # Unwritable final evidence cannot produce a successful wrapper exit.
        guard.atomic_json(journal_path,journal)
        guard.atomic_json(evidence/'ordinary-build-observation.json',receipt)

def main():
    if len(sys.argv)==1:return ordinary()
    # Same original private build + four views, same selectors/budgets/cleanup.
    # Only this new successor's admission replaces the former branch admission.
    return private_function(review.main,{'validate_checkout':validate_checkout})()

if __name__=='__main__':
    try:raise SystemExit(main())
    except (ValueError,OSError,KeyError) as error:
        print('R267 owned-RSS observation failed:',error,file=sys.stderr);raise SystemExit(1)
