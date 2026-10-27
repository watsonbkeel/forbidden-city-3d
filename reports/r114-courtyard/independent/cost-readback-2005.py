import json,pathlib,hashlib,subprocess,statistics,math,gzip,datetime
W=pathlib.Path('/workspace/scratch/02a8023d1a85');R=W/'r114-chengqian-courtyard-group';B=W/'r113-chuxiu-courtyard-interior';D=R/'reports/r114-courtyard';O=W/'r114-courtyard-independent'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def git(root,*a):return subprocess.check_output(['git','-C',str(root),*a],text=True).strip()
summary=json.loads((D/'cost/summary.json').read_text())['summary'];scope=json.loads((O/'SCOPED-REVIEW-52aa-1958.json').read_text());candidate=scope['runtimeCommit'];baseline='da6bc5ac450139e90cdbb864f57fee64ca15baed';out={'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runtime':candidate,'baseline':baseline,'currentHead':git(R,'rev-parse','HEAD'),'raws':{},'cost':{}}
assert all(sha(R/p)==h for p,h in scope['sourceHashes'].items());out['allRuntimeHashesMatched']=len(scope['sourceHashes']);assert not git(R,'diff',candidate,'HEAD','--','src','data')
for kind,root,commit in [('baseline',B,baseline),('candidate',R,candidate)]:
 rs=[]
 for i in range(1,6):
  p=D/f'cost/pair-{i}-{kind}.json';r=json.loads(p.read_text());assert r['sourceCommit']==commit;assert all(sha(root/p)==h for p,h in r['sourceHashes'].items());assert len(r['sourceHashes'])==(9 if kind=='baseline' else 11);rs.append(r);out['raws'][str(p.relative_to(R))]=sha(p);assert len(r['probes'])==8
  for probe in r['probes']:
   s=probe['samples'];assert len(s)==600 and all(math.isfinite(n) and n>=0 for n in s) and len(set(s))>100
  expectedZ=370.6 if kind=='baseline' else 367.1
  assert r['probes'][2]['initial']['z']==expectedZ and r['probes'][3]['initial']['z']==expectedZ+1.6
 assert all(r['resource']==rs[0]['resource'] for r in rs)
 info={k:[r[k] for r in rs] for k in ['buildMs','registerMs','disposeMs','environmentSetupMs','bindMs']};info['resource']=rs[0]['resource'];info['paths']={}
 for j,probe in enumerate(rs[0]['probes']):
  vals=sorted(n for r in rs for n in r['probes'][j]['samples'][120:]);quant=lambda p:vals[math.ceil(len(vals)*p)-1]
  info['paths'][probe['name']]={'p50':quant(.5),'p95':quant(.95),'p99':quant(.99),'max':max(vals),'firstFrameMs':[r['probes'][j]['samples'][0] for r in rs],'allPeak':max(n for r in rs for n in r['probes'][j]['samples'])}
 assert info==summary[kind],kind
 out['cost'][kind]={'medians':{k:statistics.median(info[k]) for k in ['buildMs','registerMs','disposeMs','environmentSetupMs','bindMs']},'resource':info['resource'],'paths':info['paths'],'allSamples':24000,'warmSamples':19200}
night=json.loads((D/'night-household.json').read_text());assert night['sourceCommit']==candidate;assert [r['fps'] for r in night['rows']]==[10,30,60];assert all(len(r['beds'])==3 and len(set(b['bed'] for b in r['beds']))==3 for r in night['rows']);assert all(sha(R/p)==h for p,h in night['sourceHashes'].items());assert 'east-six' in night['scope'];out['raws']['reports/r114-courtyard/night-household.json']=sha(D/'night-household.json')
s=(D/'shared-targeted.tap').read_text();assert 'pass 91' in s and 'fail 0' in s and 'tests 91' in s and 'skipped 0' in s;out['raws']['reports/r114-courtyard/shared-targeted.tap']=sha(D/'shared-targeted.tap')
out['visuals']={}
for name in ['front','courtyard','gate']:
 ps={side:D/f'visual/{name}-{side}.json.gz' for side in ['before','after']};ds={side:json.loads(gzip.decompress(p.read_bytes())) for side,p in ps.items()};assert ds['after']['sourceCommit']==candidate;assert ds['before']['sourceCommit']==baseline;assert ds['after']['camera']==ds['before']['camera'];out['visuals'][name]={'beforeSource':ds['before']['sourceCommit'],'afterSource':ds['after']['sourceCommit'],'sameCamera':True,'files':{str(p.relative_to(R)):sha(p) for side in ['before','after'] for p in [ps[side],D/f'visual/{name}-{side}.png']}}
out['limits']=['No new performance executions by reviewer; fresh 10 raw files were independently recomputed exactly.','24,000 samples/version; 120 retained cold +480 warm per path/process. No samples discarded.','Only actual east-six zone ownership is counted; common actual Environment.setupGround and binding separately timed, not included in zone geometry bytes. Not full world, Garden first load, GPU, phone or Node20.','Two wing cost probes use each version\'s doorway-relative coordinates, not the same world coordinates. Other probes use same world input.','Terrace-shoulder starts at candidate cap height .610000014 in both versions; baseline has no raised terrace there. It is a controlled geometry/settling comparison, not matched grounded normal routes.','Roof-drop feet8 is artificial pressure, not a legal ordinary approach.','Final images are CPU geometry/diagnostic colors only, not texture/PBR/GPU fidelity.']
(O/'COST-VISUAL-SHARED-READBACK-52aa-2005.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':'ALL_ASSERTIONS_PASS','runtimeFiles':out['allRuntimeHashesMatched'],'cost':{k:v['medians'] for k,v in out['cost'].items()},'visuals':'three same-camera before/after pairs source-bound'},indent=2))
