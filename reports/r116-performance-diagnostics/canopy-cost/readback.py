import json,pathlib,statistics,hashlib
root=pathlib.Path(__file__).parent
out={'scope':'local canopy fitting costs; no aggregate startup acceleration claim','qualities':{}}
def stats(a):
 s=sorted(a);return {'samples':a,'p50':s[len(s)//2],'p95':s[-1],'max':s[-1]}
for q in ['low','high']:
 d=root/(q+'-five-pairs');pairs=[]
 for i in range(1,6):
  p={k:json.load(open(d/f'{i}-{k}.json')) for k in ['baseline','candidate']}
  assert all(len(v['canopyFitTimes'])==2 for v in p.values())
  for v in p.values():
   assert len(v['maturity']['assetEvents'])==94 and not v['maturity']['assetErrors']
   assert all(s['state']=='ready' for s in v['maturity']['paintStates'])
  assert p['baseline']['resources']==p['candidate']['resources']
  assert p['baseline']['state']==p['candidate']['state']
  for a,b in zip(p['baseline']['canopyFitTimes'],p['candidate']['canopyFitTimes']):assert {k:v for k,v in a.items() if k!='ms'}=={k:v for k,v in b.items() if k!='ms'}
  pairs.append(p)
 metrics={}
 for key,get in [('sumFitMs',lambda v:sum(x['ms'] for x in v['canopyFitTimes'])),('yongheFitMs',lambda v:v['canopyFitTimes'][0]['ms']),('chonghuaFitMs',lambda v:v['canopyFitTimes'][1]['ms']),('readyCpuMs',lambda v:v['readyCpuMs']),('startupRssKiB',lambda v:v['memory']['startupMaxRssKiB'])]:
  a=[get(p['baseline']) for p in pairs];b=[get(p['candidate']) for p in pairs];metrics[key]={'baseline':stats(a),'candidate':stats(b),'deltas':[y-x for x,y in zip(a,b)],'medianPercent':(statistics.median(b)/statistics.median(a)-1)*100}
 fit=metrics['sumFitMs']; aa=json.load(open(root.parent/'r116-startup-profile'/f'aa-{q}-v4'/'summary.json'))['readyCpuMs'];noise=max(abs(x) for x in aa['pairedDeltas'])
 out['qualities'][q]={'metrics':metrics,'gates':{'localMedianAtLeast20Percent':fit['medianPercent']<=-20,'localTailNonregression':fit['candidate']['p95']<=fit['baseline']['p95'],'readyWithinRecordedAAEnvelope':max(metrics['readyCpuMs']['deltas'])<=noise,'resourceStateExact':True},'aaMaxAbsDeltaMs':noise,'rawSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(d.glob('[1-5]-*.json'))}}
(root/'readback.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
