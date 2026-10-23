from pathlib import Path
from collections import Counter
import re,json,hashlib,subprocess
old=Path('tests/fixtures/r61-d/world-harness-08123a9.mjs.txt').read_text();new=Path('tests/r61-d-staged-world.test.mjs').read_text()
# Every assert invocation is retained byte-for-byte; only explicit phase guards,
# output path, contextual prepopulation and two QA memory checkpoints changed.
# Compare complete invocation text, including all arguments/numeric bounds,
# using balanced parentheses and quoted-string handling. Only the explicit
# allowed phase-name guard changes, as required by this QA partition.
def assertions(s):
 return Counter(re.findall(r'assert\.(\w+)\(',s))
assert assertions(old)==assertions(new),(assertions(old),assertions(new))
def invocation_texts(s):
 result=[]
 for m in re.finditer(r'assert\.\w+\(',s):
  i=m.end();depth=1;quote=None;escaped=False
  while depth and i<len(s):
   c=s[i]
   if quote:
    if escaped:escaped=False
    elif c=='\\':escaped=True
    elif c==quote:quote=None
   elif c in ["'",'"','`']:quote=c
   elif c=='(':depth+=1
   elif c==')':depth-=1
   i+=1
  assert depth==0
  result.append(s[m.start():i])
 return Counter(result)
old_calls=invocation_texts(old);new_calls=invocation_texts(new)
removed=old_calls-new_calls;added=new_calls-old_calls
assert sum(removed.values())==sum(added.values())==1
assert "['B','yangxin','kunning','huangji'].includes(phase)" in next(iter(removed))
assert "['B-current','B-retained','yangxin','kunning','huangji'].includes(phase)" in next(iter(added))

staff_old=subprocess.check_output(['git','show','0a162ec96523f8af8fcaf449a92af1e5b076e937:tests/lib/r57-staff-proof.mjs'],text=True)
staff_new=Path('tests/lib/r57-staff-proof.mjs').read_text()
assert invocation_texts(staff_old)==invocation_texts(staff_new),'Retained staff proof assertions must be exact'
loops=['report.batch3.galleryRoutes.push','report.batch4.routes.push','report.batch4.jumps.push','report.batch5.declarationRoutes.push','report.batch5.inheritedBlockedEntries.push','report.r59b1.nansansuoRoutes.push','report.r60c.routes.push','report.r61d.routes.push','report.batch1.zhenduRoutes.push','report.batch1.wumenJumps.push','report.batch1.firewallController.push','report.batch1.taihemenController.push','report.batch2.baoheRoutes.push','report.batch2.facadeRoutes.push','report.paths.push','report.bindings.push','report.lifecycle.push']
for token in loops:assert old.count(token)==new.count(token)>0,token
for phase in ['B-current','B-retained','yangxin','kunning','huangji']:assert phase in new
print(json.dumps({'status':'PASS_STATIC_ASSERTION_AND_ROUTE_COLLECTOR_CENSUS','oldHarnessSha256':hashlib.sha256(old.encode()).hexdigest(),'newHarnessSha256':hashlib.sha256(new.encode()).hexdigest(),'assertionCalls':sum(assertions(new).values()),'assertionsByMethod':assertions(new),'completeInvocationTextsExactExceptPhaseGuard':True,'unchangedCompleteInvocations':sum(old_calls.values())-1,'retainedR57ProofExactAssertions':sum(invocation_texts(staff_new).values()),'sameRouteCollectors':{t:new.count(t) for t in loops},'boundary':'This inventory cannot prove execution; each independent full-world stage must finish all its applicable assertions. All original numerical bounds and blocked witnesses remain unchanged.'},indent=2))
