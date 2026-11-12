#!/usr/bin/env python3
"""Fixed CI-only south-gate capture with unchanged R262 adapter and R177 supervision.

The supervisor's historical build-* filenames remain inside runtime-guard/.
This is runtime evidence, not a second production build, and does not change
the guard's 4 GiB / 12 min / headroom / ancestor / OOM / cleanup policy.
"""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
from r262_exit_recheck import install_exit_state_recheck

assert os.environ.get('GITHUB_ACTIONS') == 'true'
assert os.environ.get('CI') == 'true'
source = Path('.github/scripts/r177_build_bound.py')
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'e33618941b55f134b6e455cae016033e08412d7849e1d1b26a414f33ec88e8a3'
assert hashlib.sha256(Path('.github/scripts/r262_exit_recheck.py').read_bytes()).hexdigest() == '2e102777b68160b4ef3b10738c521f560c42ffce196535d635f44cd8f6cce205'
spec = importlib.util.spec_from_file_location('unchanged_r177_supervisor', source)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
exit_rechecks = install_exit_state_recheck(guard, Path(os.environ['EVIDENCE_DIR'])/'runtime-guard'/'exit-rechecks.json')
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
assert head == os.environ['GITHUB_SHA']
env = os.environ.copy()
env['NODE_OPTIONS'] = guard.HEAP_FLAGS
identity = {'head': head, 'scope': 'targeted production south-gate capture, not full hall smoke, build or release acceptance',
            'guard_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'runtime_wrapper_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'exit_recheck_sha256': hashlib.sha256(Path('.github/scripts/r262_exit_recheck.py').read_bytes()).hexdigest(),
            'exit_rechecks': exit_rechecks,
            'script_sha256': hashlib.sha256(Path('tests/r264-south-gate-visual.mjs').read_bytes()).hexdigest()}
result = guard.supervise(['node', 'tests/r264-south-gate-visual.mjs'],
                         Path(env['EVIDENCE_DIR'])/'runtime-guard',
                         guard.resource_sample, identity, env)
print(json.dumps({k: result.get(k) for k in ('status', 'reason', 'exit_code', 'child_exit_code', 'cleanup_complete')}))
raise SystemExit(result['exit_code'])
