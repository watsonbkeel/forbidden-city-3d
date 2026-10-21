#!/usr/bin/env python3
"""Read-only TAP delta inventory. Diagnostics are preserved, never automatically waived."""
import sys,re,json,pathlib,hashlib,collections
base,now,out=map(pathlib.Path,sys.argv[1:]);out.mkdir(parents=True,exist_ok=True)
def parse(path):
 t=path.read_text();lines=t.splitlines();fail=[];cases=[]
 for i,line in enumerate(lines):
  m=re.match(r'^(not ok|ok) \d+ - (.*)$',line)
  if not m:continue
  cases.append({'status':m[1],'name':m[2]})
  if m[1]=='not ok':
   j=i+1
   while j<len(lines) and not re.match(r'^(?:# Subtest:|(?:not ok|ok) \d+ - |1\.\.|# tests )',lines[j]):j+=1
   block='\n'.join(lines[i:j]); fail.append({'name':m[2],'diagnostic':block,'sha256':hashlib.sha256(block.encode()).hexdigest()})
 summary=dict(re.findall(r'^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$',t,re.M))
 if not summary or int(summary.get('fail',-1))!=len(fail):raise ValueError(f'Incomplete or nested-unaccounted TAP: {path}, summary={summary}, failed={len(fail)}')
 return {'file':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'summary':{k:int(v) for k,v in summary.items()},'cases':cases,'failures':fail}
result={}
for group in ['direct-current','historical-or-mixed']:
 b=parse(base/(group+'.tap'));n=parse(now/(group+'.tap'))
 bm={};nm={}
 for dst,records in [(bm,b['failures']),(nm,n['failures'])]:
  for x in records:dst.setdefault(x['name'],[]).append(x)
 added=list((collections.Counter(x['name'] for x in n['failures'])-collections.Counter(x['name'] for x in b['failures'])).elements())
 removed=list((collections.Counter(x['name'] for x in b['failures'])-collections.Counter(x['name'] for x in n['failures'])).elements())
 changed=[]
 for name in sorted(bm.keys()&nm.keys()):
  for i,(x,y) in enumerate(zip(bm[name],nm[name])):
   # Ignore only TAP ordinal and per-test wall duration. Preserve every assertion/path/value.
   norm=lambda v: re.sub(r'^  duration_ms: .*$', '  duration_ms: <elapsed>',re.sub(r'^not ok \d+ - ','not ok <ordinal> - ',v),flags=re.M)
   if norm(x['diagnostic'])!=norm(y['diagnostic']):changed.append({'name':name,'occurrence':i,'before':x['diagnostic'],'after':y['diagnostic']})
 oldCases=collections.Counter(x['name'] for x in b['cases']);newCases=collections.Counter(x['name'] for x in n['cases'])
 result[group]={'baseline':{k:b[k] for k in ['file','sha256','summary']},'current':{k:n[k] for k in ['file','sha256','summary']},'addedFailureNames':added,'removedFailureNames':removed,'changedDiagnostics':changed,'missingTestNames':list((oldCases-newCases).elements()),'newTestNames':list((newCases-oldCases).elements()),'warning':'Removed failures and missing tests are NOT passes. All changed diagnostics require explicit classification; random paths and source guards are not automatically waived.'}
 (out/(group+'-current-failures.json')).write_text(json.dumps(n['failures'],ensure_ascii=False,indent=2)+'\n')
(out/'comparison.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({g:{'baseline':v['baseline']['summary'],'current':v['current']['summary'],'newFailures':len(v['addedFailureNames']),'removedFailures':len(v['removedFailureNames']),'changedDiagnostics':len(v['changedDiagnostics']),'missingTests':len(v['missingTestNames'])} for g,v in result.items()},indent=2))
