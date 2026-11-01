import os,sys,time,json,pathlib,subprocess,resource
out=pathlib.Path(sys.argv[1]);assert not out.exists();out.mkdir();cmd=sys.argv[2:];records=[]
with (out/'output.tap').open('w') as log:
 p=subprocess.Popen(cmd,stdout=log,stderr=subprocess.STDOUT)
 while p.poll() is None:
  rows=[]
  for entry in pathlib.Path('/proc').iterdir():
   if not entry.name.isdigit():continue
   try:
    fields={x.split(':',1)[0]:x.split(':',1)[1].strip() for x in (entry/'status').read_text().splitlines() if ':' in x};rows.append({'pid':int(entry.name),'ppid':int(fields['PPid']),'rssKB':int(fields.get('VmRSS','0 kB').split()[0]),'hwmKB':int(fields.get('VmHWM','0 kB').split()[0]),'name':fields['Name']})
   except (FileNotFoundError,ProcessLookupError,PermissionError):pass
  ids={p.pid}
  while True:
   extra={r['pid'] for r in rows if r['ppid'] in ids}-ids
   if not extra:break
   ids|=extra
  own=[r for r in rows if r['pid'] in ids];records.append({'time':time.time(),'rssSumKB':sum(r['rssKB'] for r in own),'processes':own});time.sleep(1)
 code=p.wait()
r={'command':cmd,'NODE_OPTIONS':os.environ.get('NODE_OPTIONS'),'exitCode':code,'observedPeakTreeRSS_KB':max((r['rssSumKB'] for r in records),default=0),'childUsageMaxRSS_KB':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss,'samples':records};(out/'resource.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items() if k!='samples'}));sys.exit(code)
