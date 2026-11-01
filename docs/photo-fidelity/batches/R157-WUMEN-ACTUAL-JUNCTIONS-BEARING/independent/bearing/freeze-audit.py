import hashlib,json,pathlib,subprocess,collections
b=pathlib.Path('/workspace/scratch/02a8023d1a85');r=b/'r157-wumen-joint-layout-1622';a=b/'wumen-joint-recovery-1607/upper-reassembly-2034/assembly-bearing-0030';o=b/'independent-wumen-bearing-0034'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
f=json.load(open(a/'freeze-0034.json'));assert len(f['files'])==f['count']==18
for p,h in f['files'].items():assert sha(r/p)==h,p
assert sha(a/'run-actual-bearing.mjs')==f['driverSHA256']
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=r,text=True).strip()==f['head']
s=json.load(open(a/'source-0034.json'));q=json.load(open(a/'qa-0034.json'))
for m in [s,q]:
 assert m['count']==len(m['files'])
 for p,h in m['files'].items():assert sha(r/p)==h,p
actualsrc={str(p.relative_to(r)) for d in ['src','data'] for p in (r/d).rglob('*') if p.is_file()};assert actualsrc==set(s['files'])
prior=json.load(open(a.parent/'assembly-task3-0005/qa-0025.json'))
for p,h in prior['files'].items():assert q['files'][p]==h,p
new=sorted(set(q['files'])-set(prior['files']));assert len(new)==2
x=json.load(open(a/'actual-0033.json'));y=json.load(open(a/'actual-final-0034.json'));del x['resource'];del y['resource'];assert x==y
srcgit={}
for p,h in s['files'].items():
 raw=subprocess.check_output(['git','show',f"HEAD:{p}"],cwd=r);assert hashlib.sha256(raw).hexdigest()==h,p
res={'head':f['head'],'selected':18,'driverSHA256':f['driverSHA256'],'sourceCount':s['count'],'sourcePathSetExact':True,'sourceAllEqualHEAD':True,'qaCount':q['count'],'prior4430AllOriginalBytesRetained':True,'qaAdded':new,'actual0033EqualsFinal0034ExceptResource':True,'actual0033SHA256':sha(a/'actual-0033.json'),'actualFinalSHA256':sha(a/'actual-final-0034.json'),'helperSHA256':f['files'][new[0]],'testSHA256':f['files'][new[1]],'shaChecksAllPassed':True}
(o/'freeze-audit.json').write_text(json.dumps(res,indent=2)+'\n');print(json.dumps(res,indent=2))
