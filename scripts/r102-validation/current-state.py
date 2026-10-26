"""Run unchanged current-state tests; archive every generated report delta, restore tracked report inputs exactly."""
import subprocess,pathlib,hashlib,tarfile,json,re,collections
R=pathlib.Path.cwd(); out=R/'reports/r102-validation';out.mkdir(parents=True,exist_ok=True)
tracked=set(subprocess.check_output(['git','ls-tree','-r','--name-only','HEAD','reports'],text=True).splitlines())
def snapshot():
 return {str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (R/'reports').rglob('*') if p.is_file() and not p.is_relative_to(out)}
before=snapshot()
with (out/'current-state.tap').open('w') as f:
 result=subprocess.run(['node','--test','--test-reporter=spec',*map(str,sorted(pathlib.Path('tests/current-state').glob('*.test.mjs')))],stdout=f,stderr=subprocess.STDOUT)
after=snapshot();changed=[p for p,h in after.items() if before.get(p)!=h]
with tarfile.open(out/'current-state-generated.tar.gz','w:gz') as archive:
 for p in changed:archive.add(R/p,arcname=p)
restored=[]
for p in changed:
 if p in tracked:
  (R/p).write_bytes(subprocess.check_output(['git','show','HEAD:'+p]));restored.append(p)
def failures(s):
 prefix=s.split('✖ failing tests:')[0]
 return [re.sub(r' \([^\n]*\)$','',x) for x in re.findall(r'^✖ (.+)$',prefix,re.M)]
baseline=(R.parent/'r95-acceptance-ledger/reports/r95-acceptance/current-state-final.tap').read_text();current=(out/'current-state.tap').read_text();old=collections.Counter(failures(baseline));new=collections.Counter(failures(current));report={'baseline':'R95 14d8997e','runtimeCheckpoint':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'exitCode':result.returncode,'summaryLines':re.findall(r'^ℹ (?:tests|pass|fail|cancelled|skipped).*$',current,re.M),'baselineFailures':list(old.elements()),'currentFailures':list(new.elements()),'added':list((new-old).elements()),'removed':list((old-new).elements()),'generatedArchived':changed,'trackedRestoredFromOwnHead':restored,'meaning':'Raw unchanged tests; historical failures are not exemptions. New/removed failures require explicit diagnosis.'};(out/'current-state-comparison.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['baselineFailures','currentFailures','generatedArchived']},ensure_ascii=False))
