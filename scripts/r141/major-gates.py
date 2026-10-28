"""Sequential cumulative integration checks, no product mutation or skipped failures."""
import pathlib,subprocess,json,re,time,collections,tarfile,gzip,hashlib
R=pathlib.Path.cwd();out=R/'reports/r141/gates';out.mkdir(parents=True,exist_ok=True)
fp=lambda:subprocess.check_output(['node','--input-type=module','-e',"import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))"],text=True).strip()
source=fp();commit=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();base=json.loads((R/'reports/r136/gates/final-gates.json').read_text());tracked=subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','reports'],text=True).splitlines();before={p:(R/p).read_bytes()for p in tracked if (R/p).is_file()};results=[]
commands=[('r137-r140',['node','--test','--test-concurrency=1','--test-reporter=tap',*[str(p) for n in range(137,141)for p in sorted(pathlib.Path('tests/r'+str(n)).glob('*.test.mjs'))]])]+[(g['name'],g['command']) for g in base['gates'] if g['name']!='current-state']
commands.append(('current-state',['node','--test','--test-concurrency=2','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/current-state').glob('*.test.mjs')))]))
(R/'reports/r96-movement').mkdir(exist_ok=True,parents=True)
try:
 for name,cmd in commands:
  start=time.monotonic()
  with (out/(name+'.tap')).open('w')as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
  text=(out/(name+'.tap')).read_text();fails=re.findall(r'^not ok \d+ - (.+)$',text,re.M);summary={k:int(v)for k,v in re.findall(r'^# (tests|pass|fail|cancelled|skipped) (\d+)$',text,re.M)}
  old=next((g for g in base['gates']if g['name']==name),None)
  if name=='current-state':oldFails=json.loads((R/'reports/r140/STANDARD-COMPARISON.json').read_text())['failedNames']
  else:oldFails=old['failures']if old else[]
  extra=list((collections.Counter(fails)-collections.Counter(oldFails)).elements());removed=list((collections.Counter(oldFails)-collections.Counter(fails)).elements())
  row={'name':name,'command':cmd,'exitCode':r.returncode,'durationSeconds':time.monotonic()-start,'summary':summary,'failures':fails,'addedFailures':extra,'removedFailures':removed};results.append(row);(out/'progress.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(row,ensure_ascii=False),flush=True)
  if extra or removed or summary.get('cancelled',0) or not summary.get('tests'):raise RuntimeError('Unexpected gate result '+name)
finally:
 changed=[p for p in before if (R/p).exists() and (R/p).read_bytes()!=before[p]]
 with tarfile.open(out/'generated-legacy-reports.tar.gz','w:gz')as t:
  for p in changed:t.add(R/p,arcname=p)
 for p in changed:(R/p).write_bytes(before[p])
 for p in out.glob('*.tap'):
  with gzip.open(str(p)+'.gz','wb')as f:f.write(p.read_bytes())
 after=fp();result={'sourceBefore':source,'sourceAfter':after,'sourceCommit':commit,'gates':results,'preservedGeneratedReports':changed,'sourceUnchanged':source==after};(out/'FINAL-GATES.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));assert source==after
