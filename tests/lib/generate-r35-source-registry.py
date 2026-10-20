"""Offline evidence regeneration. Never imported by tests or product code.
Usage: python tests/lib/generate-r35-source-registry.py <candidate-commit>
"""
import difflib, hashlib, json, subprocess, sys
from pathlib import Path
BASELINE = '2cd8189db462e34a2ffc5573a435db8a0a77cccb'
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
registry={'schema':1,'baseline':BASELINE,'candidate':candidate,'files':{},'addedFiles':{},'productAdditions':[],'retainedFiles':{},'preservedFixtures':{}}
# Exact production/provenance delta. Historical fixtures are never regenerated.
rows=git('diff','--name-status',BASELINE,candidate,'--','src','data','public','assets-src').decode().splitlines()
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
for path in git('ls-tree','-r','--name-only',BASELINE,'--','src','data','public','assets-src').decode().splitlines():
    if path not in registry['files']:
        before=git('show',BASELINE+':'+path)
        assert git('show',candidate+':'+path)==before, 'Unbound retained path: '+path
        registry['retainedFiles'][path]=record(before,'baseline')
for path in git('ls-tree','-r','--name-only',BASELINE,'--','tests/fixtures').decode().splitlines():
    before=git('show',BASELINE+':'+path)
    assert git('show',candidate+':'+path)==before, 'Historical fixture changed: '+path
    registry['preservedFixtures'][path]=sha(before)
raw=(json.dumps(registry,indent=2,ensure_ascii=False)+'\n').encode()
Path('tests/fixtures/r35-source-delta.json').write_bytes(raw)
print(json.dumps({'sha256':sha(raw),'candidate':candidate,'modified':len(registry['files']),'added':len(registry['addedFiles']),'hunks':sum(len(d['deltas']) for d in registry['files'].values())}))
