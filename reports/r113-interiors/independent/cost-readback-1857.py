import json,pathlib,hashlib,subprocess,statistics,math
W=pathlib.Path('/workspace/scratch/02a8023d1a85');R=W/'r113-chuxiu-courtyard-interior';B=W/'r112-qianqing-jiaotai-interiors';D=R/'reports/r113-interiors';O=W/'r113-courtyard-independent'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def git(root,*a):return subprocess.check_output(['git','-C',str(root),*a],text=True).strip()
summary=json.loads((D/'cost/summary.json').read_text())['summary'];scope=json.loads((O/'ROOM-SCOPED-REVIEW-1913-1853.json').read_text());candidate=scope['runtimeCommit']; baseline='670119e557d4561ad0b9e2df21c50b5679ed86e9';checks={};out={'runtime':candidate,'baseline':baseline,'currentHead':git(R,'rev-parse','HEAD'),'raws':{},'cost':{}}
assert all(sha(R/p)==h for p,h in scope['sourceHashes'].items());out['allRuntimeHashesMatched']=len(scope['sourceHashes']);assert not git(R,'diff',candidate,'HEAD','--','src','data')
for kind,root,commit in [('baseline',B,baseline),('candidate',R,candidate)]:
 rs=[]
 for i in range(1,6):
  p=D/f'cost/pair-{i}-{kind}.json';r=json.loads(p.read_text());assert r['sourceCommit']==commit;assert all(sha(root/p)==h for p,h in r['sourceHashes'].items());rs.append(r);out['raws'][str(p.relative_to(R))]=sha(p)
  assert len(r['probes'])==4
  for probe in r['probes']:
   s=probe['samples'];assert len(s)==600 and all(math.isfinite(n) and n>=0 for n in s) and len(set(s))>100
 assert all(r['resource']==rs[0]['resource'] for r in rs)
 info={k:[r[k] for r in rs] for k in ['buildMs','registerMs','disposeMs']};info['resource']=rs[0]['resource'];info['paths']={}
 for j,probe in enumerate(rs[0]['probes']):
  vals=sorted(n for r in rs for n in r['probes'][j]['samples'][120:]);quant=lambda p:vals[math.ceil(len(vals)*p)-1]
  info['paths'][probe['name']]={'p50':quant(.5),'p95':quant(.95),'p99':quant(.99),'max':max(vals),'firstFrameMs':[r['probes'][j]['samples'][0] for r in rs],'allPeak':max(n for r in rs for n in r['probes'][j]['samples'])}
 assert info==summary[kind],kind
 out['cost'][kind]={'buildMedian':statistics.median(info['buildMs']),'registerMedian':statistics.median(info['registerMs']),'disposeMedian':statistics.median(info['disposeMs']),'resource':info['resource'],'paths':info['paths'],'allSamples':12000,'warmSamples':9600}
# Check copied evidence byte-for-byte, plus shared result counts and retained actor input identities.
accepted=scope['evidence'];out['copiedReportMatches']=sha(O/'ROOM-SCOPED-REVIEW-1913-1853.json')==sha(D/'independent/ROOM-SCOPED-REVIEW-1913-1853.json');assert out['copiedReportMatches']
for name,count in [('shared-targeted.tap',76),('shared-stair-contact.tap',6)]:
 s=(D/name).read_text();assert f'pass {count}' in s and 'fail 0' in s and f'tests {count}' in s;out['raws']['reports/r113-interiors/'+name]=sha(D/name)
night=json.loads((D/'night-household.json').read_text());assert night['sourceCommit']==candidate;assert [r['fps'] for r in night['rows']]==[10,30,60];assert all(len(r['beds'])==3 and len(set(b['bed'] for b in r['beds']))==3 for r in night['rows']);assert all(sha(R/p)==h for p,h in night['sourceHashes'].items());out['raws']['reports/r113-interiors/night-household.json']=sha(D/'night-household.json')
bi=json.loads((W/'r113-root-smoke/build-info.json').read_text());assert bi['sourceCommit']==out['currentHead'] and bi['sourceDirty']==False and bi['base']=='/';out['observedRootBuildInfo']=bi;out['buildLogSha']=sha(D/'root-build.log');out['buildNote']='Fresh read-back of writer build output; not an independently re-executed build. Exit status supplied by writer/auditor, log ends built in 5.82s.'
out['limits']=['Actual west-six fixture construction and controlled CPU frames only, no GPU/phone/Node20/Garden-first-load claim.','600 frames per path; retained first120 excluded only from warm quantiles. No cost samples discarded.','Night raw records actual three-bed 21/06 logical DailyRoutine, not full108 physical routes.','Scoped functional/geometry/material gate; not whole courtyard completion.']
(O/'COST-SHARED-READBACK-1913-1857.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':'ALL_ASSERTIONS_PASS','currentHead':out['currentHead'],'allRuntimeHashesMatched':out['allRuntimeHashesMatched'],'cost':{k:{n:d[n] for n in ['buildMedian','registerMedian','allSamples','warmSamples']} for k,d in out['cost'].items()}},indent=2))
