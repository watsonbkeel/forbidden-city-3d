from pathlib import Path
import subprocess,time,datetime,resource,json
P=Path(__file__).resolve().parents[2];out=P/'reports/r60-c-world-bounded';out.mkdir(exist_ok=True)
command=['node','--expose-gc','--max-old-space-size=1024','--test','--test-reporter=tap','--test-concurrency=1','tests/r60-c-world.test.mjs']
log=out/'one-world.tap';assert not log.exists(), 'Never overwrite an attempted world run'
start=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with log.open('w') as f:r=subprocess.run(command,cwd=P,stdout=f,stderr=subprocess.STDOUT)
used=resource.getrusage(resource.RUSAGE_CHILDREN);report={'command':command,'startedAt':started,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'signalIfParentKilled':-r.returncode if r.returncode<0 else None,'wallSeconds':time.monotonic()-start,'maxRssKiB':used.ru_maxrss,'userCpuSeconds':used.ru_utime,'systemCpuSeconds':used.ru_stime,'boundary':'QA process resources only, not game/GPU performance; child failure/signal remains in TAP'}
(out/'one-world-resource.json').write_text(json.dumps(report,indent=2)+'\n');(out/'one-world.exit').write_text(str(r.returncode)+'\n');print(json.dumps(report));raise SystemExit(r.returncode)
