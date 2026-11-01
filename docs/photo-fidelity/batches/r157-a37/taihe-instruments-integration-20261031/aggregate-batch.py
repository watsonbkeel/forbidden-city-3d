from pathlib import Path
import re,json,hashlib,collections
r=Path(__file__).resolve().parent;old=r.parent/'r158-arrow-integration-evidence-0441/batch-0459.log';roots=r.parent/'r158-arrow-integration-evidence-0441/shared-regression-055947-0506-with-history.log'
def spec(p):
 s=p.read_text();head=s.split('✖ failing tests:')[0];rows=[(m.group(1)=='✔',re.sub(r' \([\d.]+ms\)$','',m.group(2))) for m in re.finditer(r'^(✔|✖) (.+)$',head,re.M)];n=int(re.search(r'^ℹ tests (\d+)$',s,re.M).group(1));assert len(rows)==n;return rows
s=(r/'world-live-1536-0527.tap').read_text();world=[(m.group(1)=='ok',m.group(2)) for m in re.finditer(r'^(ok|not ok) \d+ - (.+)$',s,re.M)];assert len(world)==5 and all(x[0] for x in world)
rows=spec(r/'batch-0525.log');rows.remove((False,'tests/photo-fidelity/batches/taihe-instruments-world.test.mjs'));rows+=world
oldrows=spec(old)+spec(roots);added=spec(r/'local10-final.log')+world
assert collections.Counter(n for _,n in rows)==collections.Counter(n for _,n in oldrows+added),'full inherited title coverage plus exact15 added cases'
a=collections.Counter(n for ok,n in oldrows if not ok);b=collections.Counter(n for ok,n in rows if not ok)
out={'status':'COMPLETE_PARTITIONED_BATCH_REPLAY_NOT_SINGLE_MONOLITHIC_SUCCESS','tests':len(rows),'pass':sum(ok for ok,_ in rows),'fail':sum(not ok for ok,_ in rows),'inheritedBatchTests':278,'explicitRootRegressions':27,'newInstrumentCases':15,'executedTestTitleMultisetEqualsInherited278PlusRoot27PlusNew15':True,'newFailureNames':list((b-a).elements()),'remainingFailureNames':list(b.elements()),'replacedFileWrapper':'tests/photo-fidelity/batches/taihe-instruments-world.test.mjs','initialHeapMiB':768,'isolatedWholeWorldHeapMiB':1536,'reason':'Explicit V8 heap exhaustion at768; entire unchanged five-case real World file completes at1536. Original failed run preserved.','logHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [r/'batch-0525.log',r/'world-live-1536-0527.tap',old,roots,r/'local10-final.log']}}
(r/'partitioned-batch-result.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
