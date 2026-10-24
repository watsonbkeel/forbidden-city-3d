"""Build a local upload inventory from committed bytes and actual reports, never guessed counts."""
from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[2];R=P/'reports/r70-l-stage';base='b6498da08a690be8c029057b1bd9ec95cfcb66cf'
git=lambda *a:subprocess.check_output(['git','-c','core.quotePath=false',*a],cwd=P).decode().strip()
head=git('rev-parse','HEAD');branch=git('branch','--show-current')
assert branch=='feat/r70-l-water-walls-20261024',branch
assert not git('diff','--name-only') and not git('diff','--cached','--name-only'),'Commit all intended tracked deliverable inputs before generating the upload manifest'
assert all(line[3:]=='node_modules' or '__pycache__/' in line for line in git('status','--porcelain').splitlines()),'Untracked delivery inputs require explicit inclusion'
world=json.loads((R/'WORLD-SUMMARY-01.json').read_text());prod=json.loads((R/'PRODUCTION-VERIFICATION.json').read_text());retained=json.loads((R/'RETAINED-INPUTS.json').read_text())
assert prod['status']=='PASS' and retained['status']=='PASS'
assert len(world['stages'])==4 and all(s['exit']==0 for s in world['stages'])
assert all(b['identity']['sourceFingerprint']==world['sourceFingerprint'] and not b['identity']['sourceDirty'] for b in prod['builds'])
rows=[]
for line in git('ls-tree','-r',head).splitlines():
 meta,path=line.split('\t');mode,kind,blob=meta.split();assert kind=='blob';b=(P/path).read_bytes()
 assert b==subprocess.check_output(['git','show',head+':'+path],cwd=P),path
 rows.append({'path':path,'mode':mode,'gitBlobSHA':blob,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
r={'release':'R70-L','status':'LOCAL_VERIFIED_REPORTS_REMOTE_NOT_WRITTEN','branch':branch,'localFinalCommit':head,'localTree':git('rev-parse','HEAD^{tree}'),'baseLocalCommit':base,'previousRemoteCommit':None,'remoteGate':'Separate uploader must recheck remote and pending outcomes; no remote/main/Pages/permission writes by this script.','sourceFingerprint':world['sourceFingerprint'],'fullTrackedFiles':len(rows),'fullTrackedBytes':sum(x['bytes'] for x in rows),'files':rows,'changedPathsFromR69':git('diff','--name-status',base,head).splitlines(),'verification':{'worldReport':world,'retainedReport':retained,'focusedChecks':'See actual stage test reports; no inferred pass counts','GPU':False,'physicalPhone':False,'continuousCompleteTour':False,'wholeSectionAccepted':False},'production':prod,'reportRoot':'reports/r70-l-stage','referencePhotoRedistribution':False}
out=P.parent/'r70-l-release-manifest.json'
assert not out.exists(),'Do not overwrite previous upload inventory'
out.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'manifest':str(out),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'files':len(rows),'head':head}))
