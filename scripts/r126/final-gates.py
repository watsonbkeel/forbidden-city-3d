"""Sequential retained gates; no expected changes. Preserve generated report side effects."""
import subprocess,pathlib,json,re,hashlib,tarfile,time,collections
R=pathlib.Path.cwd();out=R/'reports/r126-chengqian/gates';out.mkdir(parents=True,exist_ok=True)
fp=lambda:subprocess.check_output(['node','--input-type=module','-e',"import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))"],text=True).strip()
# Required parent of the retained R96 diagnostic writer; not a runtime asset.
(R/'reports/r96-movement').mkdir(parents=True,exist_ok=True)
source=fp();tracked=set(subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','reports'],text=True).splitlines());before={p:(R/p).read_bytes()for p in tracked if (R/p).is_file()}
commands=[('r126',['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/r126').glob('*.test.mjs')))]),('r125',['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/r125').glob('*.test.mjs')))]),('r124',['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/r124').glob('*.test.mjs')))]),('r123', ['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/r123').glob('*.test.mjs')))]),('r119-r120',['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/r119').glob('*.test.mjs'))),*map(str,sorted(pathlib.Path('tests/r120').glob('*.test.mjs')))])]
for k in ['motion','resources']:
 c=json.loads((out/(k+'-command.json')).read_text());c.insert(3,'--test-reporter=tap');commands.append((k,c))
commands += [('current-state',['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/current-state').glob('*.test.mjs')))])]
results=[]
for name,command in commands:
 start=time.monotonic()
 with (out/(name+'-final.tap')).open('w')as f:r=subprocess.run(command,stdout=f,stderr=subprocess.STDOUT)
 text=(out/(name+'-final.tap')).read_text();row={'name':name,'command':command,'exitCode':r.returncode,'durationSeconds':time.monotonic()-start,'summary':re.findall(r'^# (?:tests|pass|fail|cancelled|skipped).*$',text,re.M),'failures':re.findall(r'^not ok \d+ - (.+)$',text,re.M)};results.append(row);(out/'final-gates-progress.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(row,ensure_ascii=False),flush=True)
changed=[p for p in tracked if (R/p).is_file()and before.get(p)!=(R/p).read_bytes()]
with tarfile.open(out/'generated-retained-reports.tar.gz','w:gz')as a:
 for p in changed:a.add(R/p,arcname=p)
for p in changed:(R/p).write_bytes(before[p]if p in before else subprocess.check_output(['git','show','HEAD:'+p]))
after=fp();assert source==after
baseline=(R.parent/'r125-chengqian-rear-court/reports/r125-chengqian/gates/current-state-final.tap').read_text();current=(out/'current-state-final.tap').read_text();fails=lambda s:collections.Counter(re.findall(r'^not ok \d+ - (.+)$',s,re.M));old,new=fails(baseline),fails(current)
result={'before':source,'after':after,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'driverSHA256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'gates':results,'preservedGeneratedTrackedReports':changed,'currentStateBaseline':'R125 same112 unchanged files','addedFailures':list((new-old).elements()),'removedFailures':list((old-new).elements())};(out/'final-gates.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({'before':source,'after':after,'addedFailures':result['addedFailures'],'removedFailures':result['removedFailures']},ensure_ascii=False),flush=True)
