from pathlib import Path
from collections import Counter
import re,json,hashlib,subprocess
P=Path(__file__).resolve().parents[2];base='bfafb63aff4984b266b02600d1364001000e0bc6'
old=subprocess.check_output(['git','show',base+':tests/r63-f-staged-world.test.mjs'],cwd=P,text=True);new=(P/'tests/r64-g-staged-world.test.mjs').read_text()
def invocations(s):
 out=[]
 for m in re.finditer(r'assert\.\w+\(',s):
  i=m.end();depth=1;quote=None;escape=False
  while depth and i<len(s):
   c=s[i]
   if quote:
    if escape:escape=False
    elif c=='\\':escape=True
    elif c==quote:quote=None
   elif c in ["'",'"','`']:quote=c
   elif c=='(':depth+=1
   elif c==')':depth-=1
   i+=1
  assert depth==0;out.append(s[m.start():i])
 return Counter(out)
a,b=invocations(old),invocations(new);removed=a-b;added=b-a
assert sum(removed.values())==3,removed
assert all('report.world.colliders' in x or 'report.world.walkables' in x or x=="assert.deepEqual(W.cm.colliders.filter(c=>c.overhead).map(c=>c.overhead.sourceId).sort(),['axis/wumen-north-head/-17.5','axis/wumen-north-head/0','axis/wumen-north-head/17.5'])" for x in removed),removed
assert any('report.world.colliders,24686+report.r62e.geometry.verifiedColliderDelta+report.r63f.geometry.verifiedColliderDelta+30' in s for s in added)
assert "assert.deepEqual(W.cm.colliders.filter(c=>c.overhead).map(c=>c.overhead.sourceId).sort(),['axis/wumen-north-head/-17.5','axis/wumen-north-head/0','axis/wumen-north-head/17.5','garden/tianyi-arch'])" in added
loops=['report.batch3.galleryRoutes.push','report.batch4.routes.push','report.batch4.jumps.push','report.batch5.declarationRoutes.push','report.batch5.inheritedBlockedEntries.push','report.r59b1.nansansuoRoutes.push','report.r60c.routes.push','report.r61d.routes.push','report.batch1.zhenduRoutes.push','report.batch1.wumenJumps.push','report.batch1.firewallController.push','report.batch1.taihemenController.push','report.batch2.baoheRoutes.push','report.batch2.facadeRoutes.push','report.paths.push','report.bindings.push','report.lifecycle.push']
for token in loops:assert old.count(token)==new.count(token)>0,token
for phase in ['B-current','B-retained','yangxin','kunning','huangji']:assert phase in new
for path in ['data/characters/registry.json','data/characters/patrols.json']:
 if (P/path).exists():assert (P/path).read_bytes()==subprocess.check_output(['git','show',base+':'+path],cwd=P)
print(json.dumps({'status':'PASS_STATIC_INVOCATION_AND_ROUTE_CENSUS_NOT_EXECUTION','baseline':base,'oldSha256':hashlib.sha256(old.encode()).hexdigest(),'newSha256':hashlib.sha256(new.encode()).hexdigest(),'preservedFullAssertions':sum(a.values())-3,'replacedExactWorldInventoryExpectations':dict(removed),'addedFullAssertions':dict(added),'routeCollectors':{t:new.count(t) for t in loops},'boundary':'Same five independent full worlds and complete retained assertion/route sets, plus G geometry/new routes/reload while retaining actual Yangxin S footstool. Not one continuous three-S world.'},indent=2))
