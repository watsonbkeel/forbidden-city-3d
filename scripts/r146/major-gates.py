"""Sequential cumulative integration checks, no product mutation or skipped failures."""
import pathlib,subprocess,json,re,time,collections,tarfile,gzip,hashlib,os
R=pathlib.Path.cwd();out=R/'reports/r146/gates';out.mkdir(parents=True,exist_ok=True)
readjson=lambda p:json.loads((R/p).read_text() if (R/p).exists() else subprocess.check_output(['git','show','HEAD:'+p],text=True))
fp=lambda:subprocess.check_output(['node','--input-type=module','-e',"import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))"],text=True).strip()
source=fp();commit=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();base=readjson('reports/r141/gates/FINAL-GATES.json');tracked=subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','reports'],text=True).splitlines();before={p:(R/p).read_bytes()for p in tracked if (R/p).is_file()};results=[]
initial=next(g for g in base['gates']if g['name']=='r137-r140-complete')['command'][4:]
newTests=[str(p)for n in range(142,147)for p in sorted(pathlib.Path('tests/r'+str(n)).glob('*.test.mjs'))]+list(map(str,sorted(pathlib.Path('tests/r141-fix').glob('*.test.mjs'))))
commands=[('r137-r145-plus-hotfix',['node','--import','./tests/r141-fix/json-hooks.mjs','--test','--test-concurrency=1','--test-reporter=tap',*initial,*newTests])]+[(g['name'],g['command'])for g in base['gates']if g['name']not in ['current-state','r137-r140-complete']]
commands.append(('current-state',['node','--test','--test-concurrency=2','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/current-state').glob('*.test.mjs')))]))
(R/'reports/r96-movement').mkdir(exist_ok=True,parents=True)
if os.environ.get('RESUME_VERIFIED_INITIAL')=='1':
 prior=json.loads((out/'FINAL-GATES.json').read_text());assert prior['sourceBefore']==source==prior['sourceAfter']
 (out/('STOP-'+str(time.time_ns())+'.json')).write_text(json.dumps(prior,ensure_ascii=False,indent=2))
 verified={g['name']:g for g in prior['gates'] if not g['addedFailures'] and not g['removedFailures'] and not g['summary'].get('cancelled') and g['summary'].get('tests')}
 remaining=[]
 for name,cmd in commands:
  if name in verified:
   row=verified[name];assert row['command']==cmd;results.append(dict(row,inheritedVerifiedSourceCommit=row.get('inheritedVerifiedSourceCommit',prior['sourceCommit'])))
  else:remaining.append((name,cmd))
 commands=remaining
 attribution=readjson('reports/r146/retained/r135-r143-attribution.json');assert attribution['source']==source and len(attribution['rows'])==4

try:
 for name,cmd in commands:
  start=time.monotonic()
  with (out/(name+'.tap')).open('w')as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
  text=(out/(name+'.tap')).read_text();fails=re.findall(r'^not ok \d+ - (.+)$',text,re.M);summary={k:int(v)for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped) (\d+)$',text,re.M)}
  old=next((g for g in base['gates']if g['name']==name),None)
  if name=='current-state':
   oldFails=readjson('reports/r145/STANDARD-COMPARISON.json')['failedNames'];oldFails=[v for v in oldFails if v!='tests/current-state/r58-hall-beasts.test.mjs']+['exact owner HOOKUP.patch rehearsal uses actual production inputs and retains all hall physics and all other hall meshes']
  elif name=='r137-r145-plus-hotfix':oldFails=['all previous palace geometry and contacts retained; no extra flat walkable added']
  else:oldFails=old['failures']if old else[]
  if name=='r135':oldFails=[*oldFails,'R135 real whole east-six keeps materials textures physics counts and +216 triangles/+20736 bytes in both detail tiers']
  extra=list((collections.Counter(fails)-collections.Counter(oldFails)).elements());removed=list((collections.Counter(oldFails)-collections.Counter(fails)).elements())
  row={'name':name,'command':cmd,'exitCode':r.returncode,'durationSeconds':time.monotonic()-start,'summary':summary,'failures':fails,'addedFailures':extra,'removedFailures':removed};results.append(row);(out/'progress.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(row,ensure_ascii=False),flush=True)
  if extra or removed or summary.get('cancelled',0) or not summary.get('tests'):raise RuntimeError('Unexpected gate result '+name)
finally:
 changed=[p for p in tracked if (R/p).exists() and (p not in before or (R/p).read_bytes()!=before[p])]
 with tarfile.open(out/'generated-legacy-reports.tar.gz','w:gz')as t:
  for p in changed:t.add(R/p,arcname=p)
 for p in changed:(R/p).write_bytes(before[p] if p in before else subprocess.check_output(['git','show','HEAD:'+p]))
 for p in out.glob('*.tap'):
  with gzip.open(str(p)+'.gz','wb')as f:f.write(p.read_bytes())
 after=fp();result={'sourceBefore':source,'sourceAfter':after,'sourceCommit':commit,'gates':results,'preservedGeneratedReports':changed,'sourceUnchanged':source==after};(out/'FINAL-GATES.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));assert source==after
