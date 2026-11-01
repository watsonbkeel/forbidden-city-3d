from pathlib import Path
import subprocess,json,sys,time,hashlib,os
p=Path(__file__).resolve().parent;r=p.parent/'r157-restored-411214';old=p.parent/'wumen-main-width-evidence'
def frozen():
 for filename,roots in [('source-final-1527.json',['src','data']),('qa-final-1529.json',['tests','scripts'])]:
  expected=json.loads((p/filename).read_text());actual={str(f.relative_to(r)):hashlib.sha256(f.read_bytes()).hexdigest() for root in roots for f in (r/root).rglob('*') if f.is_file()};assert actual==expected,filename+' drift'
def run(name,cmd,env=None):
 frozen();return subprocess.call([sys.executable,str(old/'run-command.py'),str(p/name),*cmd],cwd=r,env=env)
for name in ['left-world-40-1530','width-world-24-1530','prior-cpu-allfaces-1530']:
 x=json.loads((p/(name+'.resource.json')).read_text());assert x['returncode']==0,(name,x)
assert subprocess.check_output(['git','status','--porcelain','--','reports'],cwd=r)==b'', 'preserve any unexpected report WIP'
reports=[x['path'] for x in json.loads((p.parent/'wumen-side-portal-evidence-1340/generated-reports-restoration-1429.json').read_text())]
before=p/'generated-reports-before-1532';before.mkdir(exist_ok=False)
for f in reports:
 q=before/f;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes((r/f).read_bytes())
results=[]
for name in ['full-main','qinan','zhaode']:
 results.append([name,run(name+'-1532',json.loads((old/(name+'-command-1219.json')).read_text()))])
results.append(['batch',run('batch-1532',json.loads((p/'batch-command-1530.json').read_text()))])
for name,base in [('gugong','/gugong/'),('pages','/forbidden-city-3d/'),('root','/')]:
 results.append(['build-'+name,run('build-'+name+'-1532',['npm','run','build','--','--outDir',str(p/'builds-1532'/name)],{**os.environ,'VITE_BASE':base})])
frozen();(p/'gates-1532.finished.json').write_text(json.dumps({'results':results,'completionIsNotAllGreen':True},indent=2)+'\n');print(json.dumps(results),flush=True)
