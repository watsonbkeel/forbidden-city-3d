from pathlib import Path
from collections import Counter
import re, json, hashlib, subprocess

ROOT=Path('/workspace/scratch/02a8023d1a85/r158-arrow-integrate')
E=ROOT.parent/'r157-taihe-integration-evidence-0503'
BASE=ROOT.parent/'r158-arrow-integration-evidence-0441'
OUT=Path(__file__).resolve().parent
hashes={}
def raw(p):
    b=p.read_bytes(); hashes[str(p)]=hashlib.sha256(b).hexdigest(); return b.decode()
def parse(p,fmt):
    s=raw(p)
    if fmt=='spec':
        head=s.split('✖ failing tests:')[0]
        rows=[(m[1]=='✔',re.sub(r' \([\d.]+ms\)$','',m[2])) for m in re.finditer(r'^(✔|✖) (.+)$',head,re.M)]
        stats={k:int(v) for k,v in re.findall(r'^ℹ (tests|pass|fail|cancelled|skipped|todo) (\d+)$',s,re.M)}
    else:
        rows=[(m[1]=='ok',m[2]) for m in re.finditer(r'^(ok|not ok) \d+ - (.+)$',s,re.M)]
        stats={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$',s,re.M)}
    assert len(rows)==stats['tests'],(p,len(rows),stats)
    assert sum(x[0] for x in rows)==stats['pass']
    assert sum(not x[0] for x in rows)==stats['fail']
    assert not any(stats.get(k,0) for k in ['cancelled','skipped','todo'])
    return rows,stats
def titles(rows): return Counter(n for _,n in rows)
def fails(rows): return Counter(n for ok,n in rows if not ok)
def totals(rows): return {'tests':len(rows),'pass':sum(ok for ok,_ in rows),'fail':sum(not ok for ok,_ in rows)}

old,oldstats=parse(BASE/'full-current-state-0451.log','spec')
initial,initialstats=parse(E/'full-current-state-0510.log','spec')
initialtap,_=parse(E/'full-current-state-0510.tap','tap')
assert Counter(initial)==Counter(initialtap),'Original spec and TAP disagree'
assert totals(initial)=={'tests':1192,'pass':981,'fail':211}
initial_sha=hashes[str(E/'full-current-state-0510.log')]
previous=json.loads(raw(E/'full-current-state-comparison-0510.json'))
assert initial_sha==previous['candidateLogSHA256']
assert hashes[str(BASE/'full-current-state-0451.log')]==previous['baselineLogSHA256']
assert previous['status']=='INCOMPLETE_TWO_FILE_SIGKILL_NOT_FULL_REGRESSION_ACCEPTANCE'
rows=list(initial);shards=[]
for name,log,n in [('qinan-exterior-stair-safety.test.mjs','qinan-isolated-768-0519.tap',48),('zhaode-gate-routes.test.mjs','zhaode-isolated-768-0521.tap',75)]:
    file='tests/current-state/'+name
    assert rows.count((False,file))==1
    s=(E/'full-current-state-0510.tap').read_text()
    section=re.search(r'^not ok \d+ - '+re.escape(file)+r'\n(.*?)^  \.\.\.',s,re.M|re.S)
    assert section and "signal: 'SIGKILL'" in section[1]
    shard,stats=parse(E/log,'tap');assert stats['tests']==n
    rows.remove((False,file));rows.extend(shard)
    original=subprocess.check_output(['git','show','055947f1b2f13cb26b809bf1098d48f0a978cb32:'+file],cwd=ROOT)
    current=(ROOT/file).read_bytes();assert current==original
    shards.append({'file':file,'fileSHA256':hashlib.sha256(current).hexdigest(),'log':log,**totals(shard),'unchangedVs055947':True})
assert titles(rows)==titles(old)
assert fails(rows)==fails(old)
assert totals(rows)=={'tests':1313,'pass':1103,'fail':210}
declared=json.loads(raw(E/'partitioned-current-state-result.json'))
assert all(declared[k]==v for k,v in totals(rows).items())
assert declared['initialIncompleteLogSHA256']==initial_sha
assert declared['baselineLogSHA256']==hashes[str(BASE/'full-current-state-0451.log')]
for s in declared['isolatedShards']: assert s['sha256']==hashes[s['log']]

inherited,inheritedstats=parse(BASE/'batch-0459.log','spec')
roots,rootsstats=parse(BASE/'shared-regression-055947-0506-with-history.log','spec')
local,localstats=parse(E/'local10-final.log','spec')
batch,bstats=parse(E/'batch-0525.log','spec')
world,wstats=parse(E/'world-live-1536-0527.tap','tap')
assert [len(inherited),len(roots),len(local),len(world)]==[278,27,10,5]
assert all(ok for ok,_ in roots+local+world)
wrapper='tests/photo-fidelity/batches/taihe-instruments-world.test.mjs'
assert batch.count((False,wrapper))==1
assert 'FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory' in (E/'batch-0525.log').read_text()
batch.remove((False,wrapper));batch.extend(world)
assert titles(batch)==titles(inherited+roots+local+world)
assert fails(batch)==fails(inherited+roots)
assert totals(batch)=={'tests':320,'pass':319,'fail':1}
batchdeclared=json.loads(raw(E/'partitioned-batch-result.json'))
assert all(batchdeclared[k]==v for k,v in totals(batch).items())
for name,h in batchdeclared['logHashes'].items():
    matches=[v for k,v in hashes.items() if Path(k).name==name];assert matches==[h],(name,matches,h)
fresh,freshstats=parse(OUT/'local10-independent-0530.tap','tap')
assert totals(fresh)=={'tests':10,'pass':10,'fail':0}
assert titles(fresh)==titles(local)

src=json.loads(raw(E/'source-final.json'));qa=json.loads(raw(E/'focused-freeze-0510.json'))
assert len(src)==578 and len(qa)==9
for p,h in {**src,**qa}.items():assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,p
before=json.loads(raw(E/'source-before-hook.json'))
assert [p for p in src if before.get(p)!=src[p]]==['src/scene/PalaceBuilder.js']
build=json.loads(raw(OUT/'build-verification.json'))
for r in build['results']:
    assert r['info']['sourceFingerprint']==build['currentFingerprint']
    s=raw(E/('build-'+r['name']+'.log'))
    assert '✓ 556 modules transformed.' in s and re.search(r'✓ built in [\d.]+s',s)
    assert r['info']['sourceCommit']=='8033521c1f8b3b35feea635aa9c4f9368ecfacac' and r['info']['sourceDirty'] is True

result={'decision':'NO_P0_P2_IN_TERMINAL_EVIDENCE_AUDIT','reviewedHEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
 'currentState':{'originalIncomplete':initialstats,'originalSpecTapSameOutcomeCounter':True,'originalHashStillMatchesPreShardComparison':True,'shards':shards,'aggregate':totals(rows),'titleCounterMatchesBaseline':True,'failureCounterMatchesBaseline':True,'newFailures':list((fails(rows)-fails(old)).elements()),'removedFailures':list((fails(old)-fails(rows)).elements())},
 'batch':{'initial':bstats,'aggregate':totals(batch),'inherited':278,'rootRegressions':27,'newInstrumentTests':15,'titleCounterMatches278Plus27Plus15':True,'originalOOMRetained':True,'remainingFailures':list(fails(batch).elements())},
 'freshLocal':freshstats,'sourceFilesMatch':578,'focusedQAMatch':9,'builds':build,
 'priorAuditResourceIncident':'At 05:11 a reviewer in-memory git archive attempt was Killed. It did not pass and made no repository writes. Low-memory git cat-file --batch subsequently verified 577 pre-hook baseline files and only the added reviewed module. This incident is distinct from the integrator test-process SIGKILL/OOM logs.',
 'limits':['Partitioned coverage, not a successful single monolithic run','Existing failure titles matching does not prove identical root causes','Builds are 8033521c + dirty, not a later clean commit','No independent World rerun; no whole Hall/GPU/release approval'],
 'evidenceSHA256':hashes}
(OUT/'RESULT.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['evidenceSHA256','builds']},ensure_ascii=False,indent=2))
