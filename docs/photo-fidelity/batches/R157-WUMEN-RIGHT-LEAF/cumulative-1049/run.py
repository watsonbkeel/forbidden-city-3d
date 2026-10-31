import subprocess,resource,time,json,sys,pathlib,os
out=pathlib.Path(sys.argv[1]);cmd=sys.argv[2:]
if out.with_suffix('.tap').exists():raise SystemExit('Refuse overwrite')
t=time.monotonic()
with out.with_suffix('.tap').open('w') as f:p=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
r=resource.getrusage(resource.RUSAGE_CHILDREN)
row={'command':cmd,'cwd':os.getcwd(),'returncode':p.returncode,'elapsedSeconds':time.monotonic()-t,'maxRSSKiB':r.ru_maxrss,'userSeconds':r.ru_utime,'systemSeconds':r.ru_stime}
out.with_suffix('.resource.json').write_text(json.dumps(row,indent=2)+'\n');print(json.dumps(row),flush=True);sys.exit(p.returncode)
