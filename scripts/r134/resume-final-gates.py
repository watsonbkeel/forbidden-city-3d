"""Resume interrupted final gate without fabricating terminal status or discarding raw."""
import subprocess,pathlib,json,re,hashlib,tarfile,time,collections
R=pathlib.Path.cwd();out=R/'reports/r134/gates';fp=lambda:subprocess.check_output(['node','--input-type=module','-e',"import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))"],text=True).strip()
source=fp();manifest=json.loads((R/'reports/r134/runtime-inputs.json').read_text());assert source==manifest['sourceFingerprint']
partial=out/'current-state-final.tap'
if partial.exists():
 assert not re.search(r'^# tests \d+$',partial.read_text(),re.M),'Do not overwrite completed gate'
 partial.rename(out/'current-state-interrupted-1904.tap')
# Preserve generated tracked diagnostics from the interrupted run; restore only exact tracked report paths.
tracked=subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','reports'],text=True).splitlines();changed=[p for p in tracked if (R/p).is_file()and (R/p).read_bytes()!=subprocess.check_output(['git','show','HEAD:'+p])]
with tarfile.open(out/'generated-retained-reports-interrupted.tar.gz','w:gz')as a:
 for p in changed:a.add(R/p,arcname=p)
for p in changed:(R/p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p]))
cmd=['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,sorted(pathlib.Path('tests/current-state').glob('*.test.mjs')))];start=time.monotonic()
with partial.open('w')as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
text=partial.read_text();assert re.search(r'^# tests \d+$',text,re.M)
results=json.loads((out/'final-gates-progress.json').read_text());results.append({'name':'current-state','command':cmd,'exitCode':r.returncode,'durationSeconds':time.monotonic()-start,'summary':re.findall(r'^# (?:tests|pass|fail|cancelled|skipped).*$',text,re.M),'failures':re.findall(r'^not ok \d+ - (.+)$',text,re.M)})
changed=[p for p in tracked if (R/p).is_file()and (R/p).read_bytes()!=subprocess.check_output(['git','show','HEAD:'+p])]
with tarfile.open(out/'generated-retained-reports.tar.gz','w:gz')as a:
 for p in changed:a.add(R/p,arcname=p)
for p in changed:(R/p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p]))
after=fp();assert source==after
base=(R/'reports/r131/gates/current-state-final.tap').read_text();fails=lambda s:collections.Counter(re.findall(r'^not ok \d+ - (.+)$',s,re.M));old,new=fails(base),fails(text)
result={'before':source,'after':after,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'resumeDriverSHA256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'priorDriverSHA256':hashlib.sha256((R/'scripts/r134/final-gates.py').read_bytes()).hexdigest(),'gates':results,'preservedGeneratedTrackedReports':changed,'currentStateBaseline':'R131 same112 unchanged files','addedFailures':list((new-old).elements()),'removedFailures':list((old-new).elements()),'interruption':'19:04 process lost; preserved incomplete TAP and reran only interrupted standard group; completed previous groups retained'};(out/'final-gates.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False),flush=True)
