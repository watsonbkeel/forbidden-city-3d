# QA-only adaptation of scripts/r66-h-stage/run-worlds.py.
# Same sequential stages and original test/claims; output-only Node hook avoids
# changing/overwriting frozen R66 evidence. The V8 heap budget is configurable.
from pathlib import Path
import os,subprocess,json,time,datetime,resource,gzip
P=Path(__file__).resolve().parents[2];D=P/'reports/r67-i-stage';rows=[];attempt=os.environ.get('R66_ATTEMPT','02')
fingerprint=subprocess.check_output(['node','--input-type=module','-e',"import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))"],cwd=P,text=True).strip()
assert fingerprint==os.environ['R67_EXPECTED_SOURCE_FINGERPRINT'], 'source has changed since freeze'
for phase in ['B','yangxin','kunning','huangji']:
 log=D/f'world-{phase}-{attempt}.tap';assert not log.exists()
 cmd=['node','--expose-gc','--max-old-space-size='+os.environ.get('R67_HEAP_MB','512'), '--import',str(D/'world-report-hook.mjs'),'--test','--test-reporter=tap','--test-concurrency=1','tests/r66-h-world.test.mjs'];start=time.monotonic();before=resource.getrusage(resource.RUSAGE_CHILDREN)
 with log.open('w')as f:r=subprocess.run(cmd,cwd=P,env={**os.environ,'R66_WORLD_STAGE':phase,'R66_ATTEMPT':attempt},stdout=f,stderr=subprocess.STDOUT)
 after=resource.getrusage(resource.RUSAGE_CHILDREN);row={'phase':phase,'exit':r.returncode,'seconds':time.monotonic()-start,'userCpuSeconds':after.ru_utime-before.ru_utime,'systemCpuSeconds':after.ru_stime-before.ru_stime,'maxRssCumulativeKiB':after.ru_maxrss,'report':str((D/f'world-{phase}-{attempt}/result.json.gz').relative_to(P))};rows.append(row);(D/f'WORLD-PROGRESS-{attempt}.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps(row),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
 result=json.load(gzip.open(P/row['report']));assert result['pass'] and result['sourceFingerprint']==fingerprint
(D/f'WORLD-SUMMARY-{attempt}.json').write_text(json.dumps({'status':'PASS_FOUR_INDEPENDENT_FULL_WORLDS','sourceFingerprint':fingerprint,'worldSources':len(json.loads((P/'data/characters/world-source-freeze.json').read_text())['files']),'registry':108,'paths':24,'stages':rows,'boundary':'Independent fresh B/Yangxin/Kunning/Huangji worlds, not a single accumulated browser session. CPU timing is QA not GPU/game FPS.'},indent=2)+'\n')
