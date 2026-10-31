from pathlib import Path
import json,re,collections,hashlib,sys
E=Path(__file__).resolve().parent;C=E.parent/'r157-taihemen-c-integration-evidence-0537'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def parse(p):
 s=p.read_text();tap=re.search(r'^# tests (\d+)$',s,re.M)
 if tap and not re.search(r'^ℹ tests (\d+)$',s,re.M):rows=[(a=='ok',b)for a,b in re.findall(r'^(ok|not ok) \d+ - (.+)$',s,re.M)];n=int(tap[1]);kind='TAP'
 else:
  head=s.split('✖ failing tests:')[0];rows=[(a=='✔',re.sub(r' \([\d.]+ms\)$','',b))for a,b in re.findall(r'^(✔|✖) (.+)$',head,re.M)];m=re.search(r'^ℹ tests (\d+)$',s,re.M);assert m,'no terminal summary '+str(p);n=int(m[1]);kind='SPEC'
 assert len(rows)==n,(p,len(rows),n)
 return rows
cnt=lambda r,fail=False:collections.Counter(n for ok,n in r if not fail or not ok)
stats=lambda r:{'tests':len(r),'pass':sum(ok for ok,n in r),'fail':sum(not ok for ok,n in r)}
def compare(name,before,after,parts,baselineparts):
 r={'status':'COMPLETE_PARTITIONED_EXECUTION','scope':'Exact executed/failure title multisets only; does not prove same underlying failure causes or all-green. No test titles silently discarded.','sourceManifest':'source-live-0702.json','sourceManifestSHA256':sha(E/'source-live-0702.json'),'qaManifestSHA256':sha(E/'qa-freeze-0736.json'),'baseline':stats(before),'candidate':stats(after),'missingExecutedTitles':list((cnt(before)-cnt(after)).elements()),'addedExecutedTitles':list((cnt(after)-cnt(before)).elements()),'newFailureTitles':list((cnt(after,True)-cnt(before,True)).elements()),'removedFailureTitles':list((cnt(before,True)-cnt(after,True)).elements()),'parts':[{'path':str(p), 'sha256':sha(p),**stats(parse(p))}for p in parts],'baselineParts':[{'path':str(p),'sha256':sha(p)}for p in baselineparts]}
 (E/name).write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');return r
oldbatchparts=[C/'batch-final-0611.log',C/'batch-arrow-tap-0628.log',C/'batch-wenyuan-tap-0628.log',C/'batch-wuying-compact-tap-0628.log'];old=parse(oldbatchparts[0]);names=['tests/photo-fidelity/batches/r158-arrow-integration/cumulative-world.test.mjs','tests/photo-fidelity/batches/r158-wenyuan/routes.test.mjs','tests/photo-fidelity/batches/wuying-three-bridge-rails.test.mjs']
for n,p in zip(names,oldbatchparts[1:]):old.remove((False,n));old+=parse(p)
assert stats(old)=={'tests':404,'pass':403,'fail':1}
newbatchparts=[E/'batch-main-0736.tap',E/'batch-wuying-0736.tap'];batch=compare('batch-comparison-0736.json',old,sum([parse(p)for p in newbatchparts],[]),newbatchparts,oldbatchparts)
print(json.dumps(batch,ensure_ascii=False,indent=2))
