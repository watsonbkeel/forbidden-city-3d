import json,sys,statistics
j=json.load(open(sys.argv[1]));out={'source':j['source'],'scope':j['scope'],'groups':{}}
for kind in ['chengqian','jingfu','outside']:
 pairs=[]
 for i in range(5):
  a=next(r for r in j['rows'] if r['kind']==kind and r['round']==i and r['index']==0);b=next(r for r in j['rows'] if r['kind']==kind and r['round']==i and r['index']==1)
  pairs.append({'round':i,'baseline':{k:a[k] for k in ['p50','p95','p99','max']},'candidate':{k:b[k] for k in ['p50','p95','p99','max']},'poseExact':a['poses']==b['poses'],'frames':len(a['poses'])})
 out['groups'][kind]={'pairs':pairs,'median':{k:[statistics.median(p[s][k] for p in pairs) for s in ['baseline','candidate']] for k in ['p50','p95','p99','max']},'allPosesExact':all(p['poseExact'] for p in pairs),'candidateMax':max(p['candidate']['max'] for p in pairs)}
json.dump(out,open(sys.argv[2],'w'),indent=2);print(json.dumps(out,indent=2))
