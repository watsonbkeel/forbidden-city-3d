#!/usr/bin/env python3
"""Read-only byte-exact full runtime readback against the accepted PRE_PERF tree."""
import pathlib,subprocess,hashlib,json,datetime,sys
r=pathlib.Path(sys.argv[1]).resolve();out=pathlib.Path(sys.argv[2]);base='cb77e454db5b4b494caa1198a827210bb7077b8d'
inputs=['index.html','main.js','style.css','src','data','public','package.json','package-lock.json','vite.config.js','release.json','scripts/build-identity.mjs']
def git(*args):return subprocess.check_output(['git','-C',str(r),*args])
def capture():
 h=hashlib.sha256();files={}
 def visit(rel):
  p=r/rel
  if p.is_dir():
   for c in sorted(p.iterdir(),key=lambda p:p.name):visit(str(pathlib.PurePosixPath(rel)/c.name))
  elif p.is_file():
   b=p.read_bytes();files[rel]=b;h.update(f'{len(rel)}:{rel}:{len(b)}:'.encode());h.update(b)
 for p in inputs:visit(p)
 return h.hexdigest(),files
before,files=capture();tracked=git('ls-tree','-r','--name-only',base,'--',*inputs).decode().splitlines();missing=set(tracked)-files.keys();extra=files.keys()-set(tracked);different=[];hashes={}
for f in tracked:
 b=git('show',base+':'+f);hashes[f]=hashlib.sha256(b).hexdigest()
 if b!=files.get(f):different.append(f)
paths=[f for f,b in files.items()if(f.startswith(('src/','data/'))or f=='main.js')and any(n in b for n in [b'SharedRestNumericSource',b'captureNumericSource',b'numericSourceCurrent'])]
after,_=capture();assert before==after=='8938de15545ac0fd46b7dfbde5a2d8c30e650ed130ecfbbb5cb8f7783cabfdcb';assert not missing and not extra and not different and not paths
result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline':base,'head':git('rev-parse','HEAD').decode().strip(),'scope':'All build-identity runtime inputs byte-for-byte against PRE_PERF Git tree; read-only, no world/test run.','fileCount':len(files),'missing':sorted(missing),'extra':sorted(extra),'different':different,'candidateRuntimeReferences':paths,'sourceFingerprintBefore':before,'sourceFingerprintAfter':after,'scriptSHA256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'perFileSHA256':hashes};out.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items()if k!='perFileSHA256'},indent=2))
