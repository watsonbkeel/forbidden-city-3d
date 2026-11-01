import json,subprocess,time,resource,datetime,pathlib
root=pathlib.Path(__file__).resolve().parents[4]/'r157-wumen-joint-layout-1622'
out=pathlib.Path(__file__).resolve().parent
prior=out.parent/'assembly-task2-2323/focused-105-2357.resource.json'
cmd=json.loads(prior.read_text())['command']+['tests/photo-fidelity/batches/wumen-joint-layout/assembly-junctions.test.mjs']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
with (out/'focused-122-0027.tap').open('wb')as f:p=subprocess.run(cmd,cwd=root,stdout=f,stderr=subprocess.STDOUT)
result={'command':cmd,'cwd':str(root),'startUTC':start,'endUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wallSeconds':time.monotonic()-t,'maxRSSKiB':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss,'exit':p.returncode,'node':subprocess.check_output(['node','--version'],text=True).strip()}
(out/'focused-122-0027.resource.json').write_text(json.dumps(result,indent=2)+'\n');(out/'focused-122-0027.exit').write_text(str(p.returncode)+'\n');print(json.dumps(result))
