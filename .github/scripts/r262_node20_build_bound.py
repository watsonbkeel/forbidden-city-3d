#!/usr/bin/env python3
"""Fixed Node20 deployment-command compatibility check; no deployment."""
import hashlib, json, os, re, shutil, subprocess, sys
from pathlib import Path
sys.dont_write_bytecode = True
E = Path(os.environ['EVIDENCE_DIR']).resolve()
E.mkdir(parents=True, exist_ok=True)
PINS = {
 'package.json': '9a107f6414392f7728159875bb75c4341fd0c7fc06ca1fba40b968930a49c9e4',
 'package-lock.json': 'e89d1c2e5f46fcd8571433e059f23b26463d9c0f317d78c09636190ab2d21b5c',
 'vite.config.js': '634403d607431ec904ba154784b80c7827b5f964892baae4bb302d5cfd0099d7',
 'scripts/build-identity.mjs': 'e869587d399418fb72e368bf26a4a19dce8d60c872ba50e2d47d5c9b3cec6efd',
 '.github/scripts/r177_build_bound.py': 'e33618941b55f134b6e455cae016033e08412d7849e1d1b26a414f33ec88e8a3',
 '.github/scripts/test_build_bound.py': 'f0bb1016dd539055d99626a4003bfff46123189831a999a255dee42675907be2',
}
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def cmd(*a): return subprocess.check_output(a, text=True, timeout=15).strip()
def require(ok, message):
    if not ok: raise ValueError(message)
identity = {'scope': 'R262 Node20 compatibility; not R177 CLI or runtime acceptance'}
try:
    require(len(sys.argv) == 1, 'No overrides')
    require(os.environ.get('CI') == 'true' and os.environ.get('GITHUB_ACTIONS') == 'true', 'Ordinary GitHub Actions only')
    require(not E.is_relative_to(Path.cwd().resolve()), 'Evidence must be outside checkout')
    for k in ('NODE_OPTIONS', 'TEST_GC', 'NODE_V8_COVERAGE', 'NODE_PATH'):
        require(not os.environ.get(k), 'Unexpected inherited '+k)
    hashes = {p: sha(p) for p in PINS}
    require(hashes == PINS, 'Changed reviewed inputs')
    import r177_build_bound as b
    head = cmd('git', 'rev-parse', 'HEAD')
    require(re.fullmatch('[0-9a-f]{40}', os.environ.get('GITHUB_SHA', '')) and
            head == os.environ['GITHUB_SHA'], 'Wrong source commit')
    tree = cmd('git', 'rev-parse', 'HEAD^{tree}')
    require(not cmd('git', 'status', '--porcelain=v1', '--untracked-files=all'), 'Dirty checkout')
    require(not Path('dist').exists(), 'Existing dist')
    require(json.loads(Path('release.json').read_text())['release'] == 'R262', 'Wrong release')
    node, npm, npx = (shutil.which(x) for x in ('node', 'npm', 'npx'))
    require(all((node, npm, npx)), 'Missing toolchain')
    nv, pv = cmd(node, '--version'), cmd(npm, '--version')
    identity.update(head=head, tree=tree, node=node, npm=npm, npx=npx,
                    node_version=nv, npm_version=pv, base='/forbidden-city-3d/')
    require(re.fullmatch(r'v20\.\d+\.\d+', nv), 'Node major is not 20')
    require(re.fullmatch(r'\d+\.\d+\.\d+', pv), 'Unrecognized actual npm version')
    locked = json.loads(Path('package-lock.json').read_text())['packages']['node_modules/vite']['version']
    installed = json.loads(Path('node_modules/vite/package.json').read_text())['version']
    require(installed == locked == '5.4.21', 'Missing locked local Vite')
    require(Path('node_modules/.bin/vite').resolve() ==
            Path('node_modules/vite/bin/vite.js').resolve(), 'Wrong local Vite executable')
    identity.update(hashes={**hashes, 'release.json': sha('release.json'),
                           'wrapper': sha(__file__)}, runner={
        k: os.environ.get(k) for k in ('RUNNER_OS', 'RUNNER_ARCH', 'ImageOS', 'ImageVersion')})
    require((b.RSS_CAP, b.WALL_SECONDS, b.LOG_CAP, b.SAMPLE_SECONDS) ==
            (4*1024**3, 720, 32*1024**2, .1), 'Changed supervisor limits')
    env = os.environ.copy()
    env.update(NODE_OPTIONS=b.HEAP_FLAGS, VITE_BASE='/forbidden-city-3d/')
    b.atomic_json(E/'node20-inputs.json', identity)
except (OSError, ValueError, KeyError, subprocess.SubprocessError) as exc:
    result = dict(status='FAIL', reason='IDENTITY_PRECHECK_REJECTED', detail=str(exc),
                  exit_code=1, child_pid=None, cleanup_complete=True, identity=identity)
    (E/'build-terminal.json').write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps({k: result.get(k) for k in ('status', 'reason', 'exit_code', 'cleanup_complete')}))
    raise SystemExit(result['exit_code'])
# Runtime exceptions must not be relabelled as preflight rejection or clean exit.
result = b.supervise([npx, 'vite', 'build'], E, b.resource_sample, identity, env)
print(json.dumps({k: result.get(k) for k in ('status', 'reason', 'exit_code', 'cleanup_complete')}))
raise SystemExit(result['exit_code'])
