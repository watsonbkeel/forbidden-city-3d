import subprocess,time,os,signal,json,psutil,sys
from pathlib import Path
R=Path(__file__).parent;start=time.monotonic();peak=0;status='RUNNING';measurementError=None
p=subprocess.Popen(['node','--max-old-space-size=512',str(R/'check.cjs')],stdout=(R/'check.log').open('w'),stderr=subprocess.STDOUT,start_new_session=True)
try:
 while p.poll() is None:
  try:
   root=psutil.Process(p.pid);procs=[root]+root.children(recursive=True);rss=0;seen=0
   for proc in procs:
    try:rss+=proc.memory_info().rss;seen+=1
    except psutil.NoSuchProcess:
     if proc.pid==p.pid and p.poll() is None:raise RuntimeError('root vanished without exit receipt')
   if seen==0 and p.poll() is None:raise RuntimeError('no measured live process')
  except psutil.NoSuchProcess as e:
   if p.poll() is not None:break
   measurementError=str(e);status='RESOURCE_MEASUREMENT_FAILED';os.killpg(p.pid,signal.SIGKILL);break
  except (psutil.Error,RuntimeError)as e:
   measurementError=str(e);status='RESOURCE_MEASUREMENT_FAILED';os.killpg(p.pid,signal.SIGKILL);break
  peak=max(peak,rss)
  if rss>2*1024**3:status='RSS_LIMIT_STOP';os.killpg(p.pid,signal.SIGKILL);break
  if time.monotonic()-start>720:status='TIME_LIMIT_STOP';os.killpg(p.pid,signal.SIGKILL);break
  time.sleep(.1)
 p.wait();status=('PASS_PROCESS_LIMITED'if p.returncode==0 else 'PROCESS_FAILED')if status=='RUNNING'else status
finally:
 (R/'runtime-guard.json').write_text(json.dumps(dict(status=status,exitCode=p.returncode,measurementError=measurementError,sampledPeakTreeRSS=peak,seconds=time.monotonic()-start,limitRSS=2*1024**3,limitSeconds=720,intervalSeconds=.1,limitations=['RSS process-tree sampling,notRLIMIT_AS;Chromevirtualreservation unsuitablefor2GiBaddresslimit','sampledpeaknotguaranteedunsampledininstantaneouspeak','Nosystemsecuritysettingchanged']),indent=2))
sys.exit(0 if status=='PASS_PROCESS_LIMITED'else 1)
