from pathlib import Path
import subprocess,time,resource,json,datetime
D=Path(__file__).resolve().parent
repo=Path('/workspace/scratch/02a8023d1a85/r157-wumen-joint-layout-1622')
files=['tests/photo-fidelity/batches/wumen-joint-layout/'+n+'.test.mjs' for n in ['roof-section-evaluator','roof-section-surfaces','roof-section-trims','upper-contract','upper-baseline','roof-combined','roof-combined-cpu']]+['tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs']
cmd=['node','--max-old-space-size=384','--test','--test-reporter=tap','--test-concurrency=1',*files]
assert not (D/'focused-65-2234.tap').exists()
t=time.monotonic();start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (D/'focused-65-2234.tap').open('w') as f:p=subprocess.run(cmd,cwd=repo,stdout=f,stderr=subprocess.STDOUT)
(D/'focused-65-2234.resource.json').write_text(json.dumps({'command':cmd,'cwd':str(repo),'startUTC':start,'endUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wallSeconds':time.monotonic()-t,'maxRSSKiB':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss,'exit':p.returncode,'node':subprocess.check_output(['node','--version'],text=True).strip()},indent=2)+'\n');(D/'focused-65-2234.exit').write_text(str(p.returncode)+'\n');print(p.returncode)
