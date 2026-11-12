"""Ordinary build only: install the pinned R262 recheck, then use original main."""
import importlib.util
import json
import os
from pathlib import Path
import sys


def load_guard():
    spec=importlib.util.spec_from_file_location('unchanged_r177',Path('.github/scripts/r177_build_bound.py'))
    guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
    return guard


def main():
    import r267_hall_review as review
    review.require(len(sys.argv)==1,'ordinary build takes no arguments')
    identity=review.validate_checkout()
    evidence=Path(os.environ['EVIDENCE_DIR'])
    review.require(evidence.is_absolute() and not evidence.is_relative_to(Path.cwd()),'external evidence directory required')
    review.require(json.loads((evidence/'checkout-identity.json').read_text())==identity,'source identity changed since admission')
    review.require(not Path('dist').exists(),'ordinary dist must be fresh')
    review.require(review.sha('.github/scripts/r177_build_bound.py')==review.GUARD_HASH and review.sha('.github/scripts/r262_exit_recheck.py')==review.RECHECK_HASH,'original guard/recheck source changed')
    guard=load_guard()
    marker=evidence/'ordinary-build-attempt.json'
    # Exclusive claim survives even a partial write; it never permits a retry.
    with marker.open('x') as claimed:claimed.flush();os.fsync(claimed.fileno())
    receipt={'status':'RUNNING','identity':identity,'adapterSha256':review.sha(__file__),'guardSha256':review.GUARD_HASH,'recheckSha256':review.RECHECK_HASH,'guardExitCode':None,'releaseAccepted':False}
    guard.atomic_json(marker,{'identity':identity,'phase':'ordinary-production-build','releaseAccepted':False})
    from r262_exit_recheck import install_exit_state_recheck
    journal_path=evidence/'ordinary-build-exit-rechecks.json'
    journal=install_exit_state_recheck(guard,journal_path)
    guard.atomic_json(journal_path,journal)
    guard.atomic_json(evidence/'ordinary-build-recheck.json',receipt)
    code=None
    try:
        # No rewritten command, arguments, environment, resource policy or supervisor.
        code=guard.main()
        terminal=json.loads((evidence/'build-terminal.json').read_text())
        review.require(terminal.get('exit_code')==code and terminal.get('identity',{}).get('head')==identity['head'] and terminal['identity'].get('tree')==identity['tree'],'original terminal identity/exit missing')
        if code==0:
            review.require(terminal.get('status')=='PASS' and terminal.get('child_exit_code')==0 and terminal.get('cleanup_complete') is True,'original build/cleanup not PASS')
        receipt.update(status='PASS' if code==0 else 'FAIL',guardExitCode=code)
        return code
    finally:
        if receipt['status']=='RUNNING':receipt.update(status='FAIL',guardExitCode=code)
        # Failure to persist either receipt propagates: no successful wrapper exit.
        guard.atomic_json(journal_path,journal)
        guard.atomic_json(evidence/'ordinary-build-recheck.json',receipt)


if __name__=='__main__':
    try:raise SystemExit(main())
    except (ValueError,OSError,KeyError) as error:
        print('R267 ordinary build recheck failed:',error,file=sys.stderr);raise SystemExit(1)
