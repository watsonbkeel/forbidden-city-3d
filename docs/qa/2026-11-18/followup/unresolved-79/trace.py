"""Recompute or verify the bounded static review using repository inputs only."""
import argparse,csv,json,re,subprocess
from collections import Counter,defaultdict
from pathlib import Path
out=Path(__file__).resolve().parent
root=next(p for p in out.parents if (p/'data/architecture/ledger-397/manifest.json').is_file())
reg=root/'data/architecture/ledger-397'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
compact=lambda v:json.dumps(v,ensure_ascii=False,separators=(',',':'),allow_nan=False)
check=argparse.ArgumentParser();check.add_argument('--check',action='store_true');verify=check.parse_args().check
catalog=load(reg/'manifest.json')['items'];assert len(catalog)==len({v['stableId'] for v in catalog})==397
rows={}
for e in catalog:
 x=load(reg/e['path'])
 assert (e['number'],e['stableId'])==(x['number'],x['stableId'])
 if not x['sourceMentions'] and not any(c['nameMatch'] for c in x['modelCandidates']):rows[x['number']]=(e,x)
with (out/'review-inputs.csv').open(encoding='utf-8',newline='') as f:records=list(csv.DictReader(f))
assert len(records)==len(rows)==79 and set(rows)=={r['number'] for r in records}
layout=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import('./src/scene/Layout.js').then(m=>console.log(JSON.stringify(m.PALACE_LAYOUT)))"],cwd=root))
sources={};datasets={};counts=Counter();by_section=defaultdict(list);dyn=0
anchors=load(root/'data/anchors.json')
for r in records:
 i=r['number'];e,x=rows[i];assert r['stableId']==x['stableId'];decl={}
 for ref in filter(None,r['candidateRefs'].split(';')):
  path,ptr=ref.split('#')
  if path=='src/scene/Layout.js':assert re.fullmatch(r'PALACE_LAYOUT/\d+',ptr);data=layout
  else:
   assert re.fullmatch(r'data/zones/[\w-]+\.json',path) and re.fullmatch(r'/items/\d+',ptr)
   if path not in datasets:datasets[path]=load(root/path)['items']
   data=datasets[path]
  v=data[int(ptr.split('/')[-1])]
  decl[ref]={k:v[k] for k in ('name','kind','type','structure','source','x','z','position','from','to','x0','x1','z0','z1','rot','auxiliaryIdentity','plaqueText','historicalSite','southCourtProfile','rearHallProfile','rearWing','ruinProfile','storehouseProfile') if k in v}
 hits=[]
 for path,token in json.loads(r['sourceAssertions']):
  assert path.startswith(('src/','data/')) and '..' not in Path(path).parts
  if path not in sources:sources[path]=(root/path).read_text().splitlines()
  line=next((j for j,t in enumerate(sources[path],1) if token in t),None)
  if line is None:raise ValueError(f'{i}: missing {token} in {path}')
  hits.append(dict(path=path,line=line,literal=token))
 assert hits
 counts[r['classification']]+=1;dyn+=bool(decl)
 by_section[i[0]].append(dict(number=i,stableId=x['stableId'],name=x['name'],registryEntry='data/architecture/ledger-397/'+e['path'],classification=r['classification'],declarations=decl,sourceChecks=hits,anchorOnly=anchors.get(x['name']),confirmedPhysicalCoordinates=None,visuallyAccepted=False))
outputs={k+'.jsonl':''.join(compact(v)+'\n' for v in vs) for k,vs in by_section.items()}
outputs['summary.json']=json.dumps(dict(masterRows=397,reviewRows=79,sourceCheckedRows=79,rowsWithDeclarationCandidates=dyn,groups=counts,verifiedPhysicalCoordinates=0,visuallyAccepted=0),ensure_ascii=False,indent=2)+'\n'
if verify:assert set(p.name for p in out.glob('*.jsonl'))==set(outputs)-{'summary.json'}
for name,body in outputs.items():
 data=body.encode();assert len(data)<60000
 if verify:
  if (out/name).read_bytes()!=data:raise SystemExit('Output differs: '+name)
 else:(out/name).write_bytes(data)
print('PASS: 397 independent entries; 79 selected; %s declaration rows; %s partitions.'%(dyn,len(by_section)))
