import re,json,hashlib,subprocess
from pathlib import Path
root=Path('reports/major-pilots/wenhua-windows');base='22d0da442123a8467503bf4fc5cbd97e989e4b33'
def parse(s):
 summary={k:int(v) for k,v in re.findall(r'^(?:#|ℹ) (tests|pass|fail|cancelled|skipped) (\d+)$',s,re.M)}
 if 'TAP version' in s:
  names=re.findall(r'^not ok \d+ - (.*)$',s,re.M)
  locations=re.findall(r'^  location: (.*)$',s,re.M)
 else:
  first=s.split('✖ failing tests:')[0]
  names=re.findall(r'^✖ (.*?) \([\d.]+ms\)$',first,re.M)
  locations=re.findall(r'^test at (.*)$',s,re.M)
 return {'summary':summary,'failedNames':names,'locations':locations}
rows=[]
for suite,candidate,parent in [('outer','outer-final.log','outer-parent.log'),('current-state','current-state.log','current-state-parent.log')]:
 a=parse((root/candidate).read_text());b=parse((root/parent).read_text());rows.append({'suite':suite,'parentCommit':base,'candidate':a,'parent':b,'equal':a==b})
(root/'aggregate-comparison.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
for r in rows:print(r['suite'],r['candidate']['summary'],'exact names/locations match:',r['equal'])
if not all(r['equal'] for r in rows):raise SystemExit(1)
