import sys,subprocess,resource,json,time,pathlib
log,report,*cmd=sys.argv[1:];t=time.monotonic()
with open(log,'xb') as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT)
u=resource.getrusage(resource.RUSAGE_CHILDREN);pathlib.Path(report).write_text(json.dumps({'command':cmd,'returncode':r.returncode,'elapsedSeconds':time.monotonic()-t,'maxRSSKiB':u.ru_maxrss,'userSeconds':u.ru_utime,'systemSeconds':u.ru_stime},indent=2)+'\n');sys.exit(r.returncode if r.returncode>=0 else 128-r.returncode)
