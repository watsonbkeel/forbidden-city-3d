"""Offline evidence regeneration. Never imported by tests or product code.
Usage: python tests/lib/generate-r34-source-registry.py <candidate-commit>
"""
import difflib, hashlib, json, subprocess, sys
from pathlib import Path
BASELINE = '1c60d533ee91db20ccde2a9ffb449b8c7b8d0fd8'
candidate = subprocess.check_output(['git','rev-parse',sys.argv[1]], text=True).strip()
def git(*args): return subprocess.check_output(['git',*args])
def sha(b): return hashlib.sha256(b).hexdigest()
def record(b, prefix):
    return {prefix+'SHA256': sha(b), prefix+'Bytes': len(b), prefix+'GitBlob': hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()}
def hunks(before,after):
    a,b=before.decode().splitlines(keepends=True),after.decode().splitlines(keepends=True)
    for context in (3,6,12,24,48,96,192,384,768,1536,100000):
        groups=list(difflib.SequenceMatcher(None,a,b,autojunk=False).get_grouped_opcodes(context))
        delta=[{'before':''.join(a[g[0][1]:g[-1][2]]),'after':''.join(b[g[0][3]:g[-1][4]])} for g in groups]
        if all(d['before'] and d['after'] and before.decode().count(d['before'])==1 and after.decode().count(d['after'])==1 for d in delta):
            restored=after.decode()
            for d in reversed(delta):
                assert restored.count(d['after'])==1
                restored=restored.replace(d['after'],d['before'])
            assert restored.encode()==before
            return delta
    raise ValueError('Cannot bind unique source hunks')
registry={'schema':1,'baseline':BASELINE,'candidate':candidate,'files':{},'addedFiles':{},'productAdditions':[],'preservedFixtures':{}}
# world.mjs is an explicitly retained historical test driver. R34 adds the
# opt-in retained scene needed by real InteriorLoader route tests; bind those
# exact bytes just as strictly as production, without changing old fixtures.
rows=git('diff','--name-status',BASELINE,candidate,'--','src','data','public','assets-src','tests/lib/world.mjs').decode().splitlines()
for row in rows:
    status,path=row.split('\t')
    assert status in ('M','A'), row
    after=git('show',candidate+':'+path)
    if status=='M':
        before=git('show',BASELINE+':'+path)
        registry['files'][path]={**record(before,'baseline'),**record(after,'candidate'),'baselineUTF8':before.decode(),'deltas':hunks(before,after)}
    else:
        registry['addedFiles'][path]=record(after,'candidate')
        if path.startswith(('src/','data/','public/')):registry['productAdditions'].append(path)
for path in git('ls-tree','-r','--name-only',BASELINE,'--','tests/fixtures').decode().splitlines():registry['preservedFixtures'][path]=sha(git('show',BASELINE+':'+path))
raw=(json.dumps(registry,indent=2,ensure_ascii=False)+'\n').encode()
Path('tests/fixtures/r34-source-delta.json').write_bytes(raw)
print(json.dumps({'sha256':sha(raw),'candidate':candidate,'modified':len(registry['files']),'added':len(registry['addedFiles']),'hunks':sum(len(d['deltas']) for d in registry['files'].values())}))
