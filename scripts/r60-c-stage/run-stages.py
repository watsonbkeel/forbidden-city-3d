from pathlib import Path
import subprocess,time,datetime,resource,json,os
P=Path(__file__).resolve().parents[2];base=P/'reports/r60-c-stages';base.mkdir(exist_ok=True)
for phase in ['B','yangxin','kunning','huangji']:
 out=base/phase;out.mkdir(exist_ok=True);log=out/'stage.tap';assert not log.exists(),'Do not overwrite an attempted stage'
 cmd=['node','--expose-gc','--max-old-space-size=1024','--test','--test-reporter=tap','--test-concurrency=1','tests/r60-c-staged-world.test.mjs'];start=time.monotonic();before=resource.getrusage(resource.RUSAGE_CHILDREN);started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with log.open('w') as f:r=subprocess.run(cmd,cwd=P,env={**os.environ,'R60_WORLD_STAGE':phase},stdout=f,stderr=subprocess.STDOUT)
 use=resource.getrusage(resource.RUSAGE_CHILDREN);row={'phase':phase,'command':cmd,'startedAt':started,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'wallSeconds':time.monotonic()-start,'maxRssKiBCumulativeUpperBound':use.ru_maxrss,'userCpuSeconds':use.ru_utime-before.ru_utime,'systemCpuSeconds':use.ru_stime-before.ru_stime,'boundary':'Serial independently initialized full-world QA. RSS is cumulative largest child so far, not per-stage exact or gameplay/GPU performance.'};(out/'resource.json').write_text(json.dumps(row,indent=2)+'\n');(out/'stage.exit').write_text(str(r.returncode)+'\n');print(json.dumps(row),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
