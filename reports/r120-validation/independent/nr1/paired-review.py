#!/usr/bin/env python3
"""Read all original pairs. No world construction. Fail if any requested row absent."""
import json,pathlib,hashlib,datetime,sys,statistics
base=pathlib.Path(sys.argv[1]);quality=sys.argv[2];out=pathlib.Path(sys.argv[3]);candidate=sys.argv[4] if len(sys.argv)>4 else 'ab';manifest={}
def read(p):
 b=p.read_bytes();manifest[str(p)]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()};return json.loads(b)
sets={m:[{s:read(base/f'{candidate if m=="ab" else m}-{quality}'/f'{i}-{s}.json')for s in ['a','b']}for i in range(1,6)]for m in ['aa','ab']}
rows=[r for pairs in sets.values()for pair in pairs for r in pair.values()]
assert all(r['before']==r['after']for r in rows)
assert all(r['quality']==quality and not r['instrument'] and r['states']==108 for r in rows)
assert all(r['paint'] and set(r['paint'])=={'ready'}for r in rows)
assert len({r['trajectorySHA256']for r in rows})==1
assert len({json.dumps(r['stages'],sort_keys=True)for r in rows})==1
metrics=['groups.newRoute.totalMs',*[f'groups.{g}.{k}'for g in ['newRoute','inheritedPrefix']for k in ['p95Ms','p99Ms','maxMs','totalMs']],'constructionMs','worldReadyMs','memory.maxRssKiB',*[f'memory.ready.{k}'for k in ['heapUsed','external','arrayBuffers']]]
def get(d,p):
 for k in p.split('.'):d=d[k]
 return d
result={}
for p in dict.fromkeys(metrics):
 aa=[get(r['b'],p)-get(r['a'],p)for r in sets['aa']];ab=[get(r['b'],p)-get(r['a'],p)for r in sets['ab']];noise=max(map(abs,aa))
 result[p]={'aaDeltas':aa,'aaMaxAbsDelta':noise,'abDeltas':ab,'medianABDelta':statistics.median(ab),'everyPairImproved':all(d<0 for d in ab),'counterEveryPairWithinAANoise':all(d<=noise for d in ab),'counterMedianWithinAANoise':statistics.median(ab)<=noise}
p=result['groups.newRoute.totalMs'];primary=p['everyPairImproved'] and -p['medianABDelta']>p['aaMaxAbsDelta'];fails=[k for k,r in result.items()if k!='groups.newRoute.totalMs'and not r['counterEveryPairWithinAANoise']]
report={'generatedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'quality':quality,'candidateDirectoryPrefix':candidate,'scriptSHA256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'sources':sorted({r['before']for r in rows}),'trajectorySHA256':rows[0]['trajectorySHA256'],'stages':rows[0]['stages'],'primaryGate':primary,'everyPairCounterExceedances':fails,'metrics':result,'manifest':manifest,'limits':['No samples excluded; all 5 fresh AA and AB pairs read.','Counter every-pair and median interpretations both exposed, not retroactively selecting the easier one.','memory.ready is historical name for end-route boundary, not initial ready.','Raw instrument driver SHA was not embedded by routine-process; product fingerprints are bound.','No GPU/wholeframe/mobile or unrelated route claim.']}
out.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:report[k]for k in ['quality','sources','primaryGate','everyPairCounterExceedances']},indent=2))
