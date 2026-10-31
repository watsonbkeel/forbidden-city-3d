from pathlib import Path
import subprocess,json,sys,time,hashlib,os
p=Path(__file__).resolve().parent;r=p.parent/'r157-restored-411214';old=p.parent/'wumen-main-width-evidence'
def frozen():
 for kind,roots in [('source',['src','data']),('qa',['tests','scripts'])]:
  expected=json.loads((p/(kind+'-final-1403.json')).read_text())
  actual={str(f.relative_to(r)):hashlib.sha256(f.read_bytes()).hexdigest() for root in roots for f in (r/root).rglob('*') if f.is_file()}
  assert actual==expected,kind+' drift'
def run(name,cmd,env=None):
 frozen();return subprocess.call([sys.executable,str(old/'run-command.py'),str(p/name),*cmd],cwd=r,env=env)
# Explicit starting precondition: both actual World consumers must have completed successfully.
for name in ['world-40-1406','width-world-24-1406']:
 x=json.loads((p/(name+'.resource.json')).read_text());assert x['returncode']==0,(name,x)
# Save exact generated-report predecessors. Never reset production or QA WIP.
reports=[x for x in subprocess.check_output(['git','ls-files','-z','reports'],cwd=r).decode().split('\0') if x]
before=p/'generated-reports-before-1407';before.mkdir(exist_ok=False)
for f in reports:
 q=before/f;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes((r/f).read_bytes())
results=[]
for name in ['full-main','qinan','zhaode']:
 results.append([name,run(name+'-1407',json.loads((old/(name+'-command-1219.json')).read_text()))])
results.append(['batch',run('batch-1407',json.loads((p/'batch-command-1407.json').read_text()))])
for name,base in [('gugong','/gugong/'),('pages','/forbidden-city-3d/'),('root','/')]:
 results.append(['build-'+name,run('build-'+name+'-1407',['npm','run','build','--','--outDir',str(p/'builds-1407'/name)],{**os.environ,'VITE_BASE':base})])
frozen()
(p/'gates-1407.finished.json').write_text(json.dumps({'results':results,'completionIsNotAllGreen':True},indent=2)+'\n')
print(json.dumps(results),flush=True)
