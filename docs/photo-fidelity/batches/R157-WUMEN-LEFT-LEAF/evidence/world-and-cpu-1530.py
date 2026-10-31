from pathlib import Path
import subprocess,json,sys,os,hashlib
p=Path(__file__).resolve().parent;r=p.parent/'r157-restored-411214';runner=p.parent/'wumen-main-width-evidence/run-command.py'
def verify():
 for filename,roots in [('source-final-1527.json',['src','data']),('qa-final-1529.json',['tests','scripts'])]:
  expected=json.loads((p/filename).read_text());actual={str(f.relative_to(r)):hashlib.sha256(f.read_bytes()).hexdigest() for d in roots for f in (r/d).rglob('*') if f.is_file()};assert actual==expected,filename
jobs=[('left-world-40-1530',['tests/photo-fidelity/batches/wumen-left-leaf-world.test.mjs'],{'WUMEN_LEFT_LEAF_WORLD_OUT':str(p/'left-world-40-1530.json')}),('width-world-24-1530',['tests/photo-fidelity/batches/wumen-main-width-world.test.mjs'],{'WUMEN_WIDTH_WORLD_OUT':str(p/'width-world-24-1530.json')}),('prior-cpu-allfaces-1530',['tests/photo-fidelity/batches/wumen-main-width-cpu-export.test.mjs','tests/photo-fidelity/batches/wumen-side-portal-cpu-export.test.mjs'],{})]
results=[]
for name,files,extra in jobs:
 verify();cmd=['node','--expose-gc','--max-old-space-size=1024','--test','--test-reporter=tap','--test-concurrency=1',*files];code=subprocess.call([sys.executable,str(runner),str(p/name),*cmd],cwd=r,env={**os.environ,**extra});results.append([name,code]);verify()
 if code:break
(p/'world-and-cpu-1530.finished.json').write_text(json.dumps(results,indent=2)+'\n')
