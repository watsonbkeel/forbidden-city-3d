from pathlib import Path
import re,json,hashlib,collections
root=Path(__file__).resolve().parent
baseline=root.parent/'r158-arrow-integration-evidence-0441/full-current-state-0451.log'
initial=root/'full-current-state-0510.log'
shards=[('tests/current-state/qinan-exterior-stair-safety.test.mjs',root/'qinan-isolated-768-0519.tap'),('tests/current-state/zhaode-gate-routes.test.mjs',root/'zhaode-isolated-768-0521.tap')]
def spec(p):
 text=p.read_text(); head=text.split('✖ failing tests:')[0]; rows=[(m.group(1)=='✔',re.sub(r' \([\d.]+ms\)$','',m.group(2))) for m in re.finditer(r'^(✔|✖) (.+)$',head,re.M)]
 n=int(re.search(r'^ℹ tests (\d+)$',text,re.M).group(1));assert len(rows)==n,(p,len(rows),n);return rows
old=spec(baseline);rows=spec(initial);receipts=[]
for name,p in shards:
 text=p.read_text();n=int(re.search(r'^# tests (\d+)$',text,re.M).group(1));r=[(m.group(1)=='ok',m.group(2)) for m in re.finditer(r'^(ok|not ok) \d+ - (.+)$',text,re.M)];assert len(r)==n,(p,len(r),n)
 assert (False,name) in rows;rows.remove((False,name));rows+=r;receipts.append({'file':name,'log':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'tests':n,'pass':sum(ok for ok,_ in r),'fail':sum(not ok for ok,_ in r),'NODE_OPTIONS':'--max-old-space-size=768'})
a=collections.Counter(n for _,n in old);b=collections.Counter(n for _,n in rows);assert a==b,{'missing':list((a-b).elements()),'extra':list((b-a).elements())}
of=collections.Counter(n for ok,n in old if not ok);nf=collections.Counter(n for ok,n in rows if not ok)
out={'status':'COMPLETE_PARTITIONED_REPLAY_NOT_A_SINGLE_SUCCESSFUL_MONOLITHIC_RUN','baselineLogSHA256':hashlib.sha256(baseline.read_bytes()).hexdigest(),'initialIncompleteLogSHA256':hashlib.sha256(initial.read_bytes()).hexdigest(),'initialResultUnmodified':True,'replacedFileLevelKillWrappers':[x[0] for x in shards],'isolatedShards':receipts,'executedTestTitleMultisetExactlyMatchesBaseline':True,'tests':len(rows),'pass':sum(ok for ok,_ in rows),'fail':sum(not ok for ok,_ in rows),'newFailureNames':list((nf-of).elements()),'removedFailureNames':list((of-nf).elements()),'scope':'Initial unchanged-source run completed all other cases. Only two SIGKILL file wrappers replaced by full original-file replays under explicit bounded V8 old-space; no test/assertion/source rewrites, no dropped cases. Titles do not independently prove identical roots for all existing failures.'}
(root/'partitioned-current-state-result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False,indent=2))
