import re,json,hashlib,subprocess
from pathlib import Path
root=Path('reports/major-pilots/chonghua-front');base='b1763cba2002d0f8b7f5cb1a4266a4a995338075'
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
for name,source in [('current-state.log','current-state.log'),('residential-final.log','residential-final.log'),('household-final.log','household-final.log')]:
 p='reports/major-pilots/tiyuan-covers/'+source;raw=subprocess.check_output(['git','show',base+':'+p]);a=parse((root/name).read_text());b=parse(raw.decode());rows.append({'suite':name,'parentCommit':base,'frozenReceipt':p,'frozenSHA256':hashlib.sha256(raw).hexdigest(),'candidate':a,'parent':b,'equal':a==b})
a=parse((root/'east-integration-final.log').read_text());b=parse((root/'east-integration-parent.log').read_text());rows.append({'suite':'east-integration','parentCommit':base,'candidate':a,'parent':b,'equal':a==b})
a=parse((root/'northwest-final.log').read_text());b=parse((root/'northwest-parent.log').read_text());rows.append({'suite':'northwest','parentCommit':base,'candidate':a,'parent':b,'equal':a==b})
(root/'aggregate-comparison.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
for r in rows:print(r['suite'],r['candidate']['summary'],'exact names/locations match:',r['equal'])
if not all(r['equal'] for r in rows):raise SystemExit(1)
