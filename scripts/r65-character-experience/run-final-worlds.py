from pathlib import Path
import os,subprocess,json,time,datetime,resource,gzip,hashlib
P=Path(__file__).resolve().parents[2];D=P/'reports/r65-character-experience'
fingerprint=subprocess.check_output(['node','--input-type=module','-e',"import{sourceFingerprint}from'./scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()))"],cwd=P,text=True).strip()
sourceCommit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip();rows=[]
# The Huangji stage already ran this exact runtime and exact test bytes.
h=D/'world-huangji-01/result.json.gz';old=json.load(gzip.open(h));assert old['pass'] and old['sourceFingerprint']==fingerprint and old['testSha256']==hashlib.sha256((P/'tests/r65-character-world.test.mjs').read_bytes()).hexdigest()
for phase in ['B','yangxin','kunning']:
 log=D/f'world-{phase}-final.tap';assert not log.exists() and not log.with_suffix(log.suffix+'.gz').exists()
 cmd=['node','--expose-gc','--max-old-space-size=1024','--test','--test-reporter=tap','--test-concurrency=1','tests/r65-character-world.test.mjs'];start=time.monotonic();before=resource.getrusage(resource.RUSAGE_CHILDREN)
 with log.open('w')as f:r=subprocess.run(cmd,cwd=P,env={**os.environ,'R65_WORLD_STAGE':phase,'R65_ATTEMPT':'final-01'},stdout=f,stderr=subprocess.STDOUT)
 after=resource.getrusage(resource.RUSAGE_CHILDREN);row={'phase':phase,'exit':r.returncode,'seconds':time.monotonic()-start,'userCpuSeconds':after.ru_utime-before.ru_utime,'systemCpuSeconds':after.ru_stime-before.ru_stime,'maxRssCumulativeKiB':after.ru_maxrss,'report':str((D/f'world-{phase}-final-01/result.json.gz').relative_to(P))};rows.append(row);(D/'FINAL-WORLD-PROGRESS.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps(row),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
 result=json.load(gzip.open(P/row['report']));assert result['pass'] and result['sourceFingerprint']==fingerprint
rows.append({'phase':'huangji','exit':0,'report':str(h.relative_to(P)),'inheritedExactRuntimeFingerprintAndTestBytes':True})
summary={'status':'PASS_FOUR_INDEPENDENT_FULL_WORLDS','sourceCommit':sourceCommit,'sourceFingerprint':fingerprint,'worldSources':257,'registry':108,'paths':24,'stages':rows,'boundary':'Independent B/Yangxin/Kunning/Huangji worlds, not one accumulated browser session. Exact runtime and test bytes for all four, existing successful Huangji reused without redundant run. CPU timings are QA not GPU/game FPS.'}
(D/'FINAL-WORLD-SUMMARY.json').write_text(json.dumps(summary,indent=2)+'\n')
