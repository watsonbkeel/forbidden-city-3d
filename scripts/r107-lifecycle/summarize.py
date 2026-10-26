import json, statistics as stats, math, sys
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else 'reports/r107-lifecycle/paired-final')
data=[[json.load(open(p/f'pair{i}-{version}.json')) for version in ('baseline','candidate')] for i in range(5)]
def summary(values):
    values=sorted(values)
    return dict(n=len(values),median=stats.median(values),p95=values[math.ceil(.95*len(values))-1],p99=values[math.ceil(.99*len(values))-1],max=max(values))
result={'sources':[data[0][i]['sourceCommit']for i in (0,1)],'protocol':'5 alternating pairs; each side fresh process, 7 real zones and production Teleport.go; all samples retained; nearest-rank percentiles; not whole resident world/GPU','init':[summary([row[i]['initMs']for row in data])for i in(0,1)],'returns':[summary([r['ms']for row in data for r in row[i]['rows'][2:]])for i in(0,1)],'firstReturnEast':[summary([row[i]['rows'][2]['ms']for row in data])for i in(0,1)],'firstEntry':[summary([r['ms']for row in data for r in row[i]['rows'][:2]])for i in(0,1)],'pairs':[],'resources':[]}
for index,pair in enumerate(data):
    result['pairs'].append({'pair':index,'init':[x['initMs']for x in pair],'firstReturnEast':[x['rows'][2]['ms']for x in pair],'returnMedian':[stats.median(r['ms']for r in x['rows'][2:])for x in pair],'rows':[[r['ms']for r in x['rows']]for x in pair],'eastBuildCountAtFirstReturn':[x['rows'][2]['buildCounts']['east-six']for x in pair]})
for i in(0,1):
    snapshots=[m for pair in data for m in [pair[i]['afterInit'],*[r['memory']for r in pair[i]['rows']],pair[i]['afterExpiry'],pair[i]['finalLive']]]
    result['resources'].append({'inventoryPeak':{k:max(m[k]for m in snapshots)for k in ['allGeometryBytes','knownTextureBytes','unknownStorageEntries','inactiveBudgetBytes','heapUsed','arrayBuffers']},'afterDispose':[pair[i]['final']for pair in data],'note':'Inventories sum per-entry estimates, deduplicate within entry; shared module textures may be conservatively counted in multiple entries. Unknown storage is excluded, so this is not complete measured VRAM. JS/physics overhead and live library/manager metadata are separate.'})
json.dump(result,open(p/'summary.json','w'),ensure_ascii=False,indent=2)
print(json.dumps(result,ensure_ascii=False,indent=2))
