"""Unchanged112-file major gate; retain exact failures and report side effects."""
import subprocess,pathlib,hashlib,tarfile,json,re,collections,time
R=pathlib.Path.cwd();out=R/'reports/r120-validation';out.mkdir(parents=True,exist_ok=True)
tracked=set(subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','reports'],text=True).splitlines())
def snapshot():return{str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest()for p in(R/'reports').rglob('*')if p.is_file()and not p.is_relative_to(out)}
before=snapshot();files=sorted(pathlib.Path('tests/current-state').glob('*.test.mjs'));assert len(files)==112
command=['node','--test','--test-concurrency=1','--test-reporter=tap',*map(str,files)];start=time.monotonic()
with(out/'current-state-all.tap').open('w')as f:r=subprocess.run(command,stdout=f,stderr=subprocess.STDOUT)
after=snapshot();changed=[p for p,h in after.items()if before.get(p)!=h]
with tarfile.open(out/'generated-side-effects.tar.gz','w:gz')as a:
 for p in changed:a.add(R/p,arcname=p)
restored=[]
for p in changed:
 if p in tracked:(R/p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p]));restored.append(p)
def fails(s):return collections.Counter(re.findall(r'^not ok \d+ - (.+)$',s,re.M))
baseline=(R.parent/'r119-jiaotai-room/reports/r119-jiaotai/current-state-all.tap').read_text();current=(out/'current-state-all.tap').read_text();old,new=fails(baseline),fails(current)
report={'command':command,'files':len(files),'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'exitCode':r.returncode,'durationSeconds':time.monotonic()-start,'summary':re.findall(r'^# (?:tests|pass|fail|cancelled|skipped).*$',current,re.M),'baselineFailures':list(old.elements()),'currentFailures':list(new.elements()),'added':list((new-old).elements()),'removed':list((old-new).elements()),'changedReports':changed,'restoredTrackedReports':restored,'scope':'Same unchanged112 test files; raw expected remains unchanged; not a claim that inherited failures pass.'};(out/'current-state-differential.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items()if k not in['command','baselineFailures','currentFailures','changedReports']},ensure_ascii=False))
