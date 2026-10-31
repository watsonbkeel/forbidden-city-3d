from pathlib import Path
import subprocess,json,sys,time,hashlib
p=Path(__file__).resolve().parent;r=p.parent/'r157-restored-411214';b=p.parent/'r157-width-baseline-411214'
# The current three-command chain owns the heavy slot until its last process terminates.
while not (p/'zhaode-1219.resource.json').exists():time.sleep(5)
for name in ['full-main','qinan','zhaode']:
 x=json.loads((p/(name+'-1219.resource.json')).read_text());print('FIRST_TERMINAL',name,x['returncode'],flush=True)
# Materialize only existing Git files; keep dirty WIP and generated report outputs intact.
subprocess.run(['git','sparse-checkout','disable'],cwd=r,check=True)
missing=json.loads((p/'sparse-missing-before-full-1222.json').read_text());restored=[]
for f in missing:
 raw=(r/f).read_bytes();old=subprocess.check_output(['git','show','HEAD:'+f],cwd=r);assert raw==old;restored.append({'path':f,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
(p/'exact-materialized-inputs-1224.json').write_text(json.dumps(restored,indent=2)+'\n')
def frozen():
 for manifest in ['source-freeze-1210.json','qa-freeze-1210.json']:
  for f,h in json.loads((p/manifest).read_text()).items():assert hashlib.sha256((r/f).read_bytes()).hexdigest()==h,(manifest,f)
def run(cwd,name,cmd):
 frozen();code=subprocess.call([sys.executable,str(p/'run-command.py'),str(p/name),*cmd],cwd=cwd);print('TERMINAL',name,code,flush=True);return code
for prefix,cwd in [('baseline',b),('candidate-materialized',r)]:
 for name in ['full-main','qinan','zhaode']:
  cmd=json.loads((p/(name+'-command-1219.json')).read_text());run(cwd,prefix+'-'+name+'-1224',cmd)
run(r,'batch-1224',json.loads((p/'batch-command-1220.json').read_text()))
frozen();code=subprocess.call([sys.executable,str(p/'build-chain-1220.py')],cwd=r);print('BUILDS_TERMINAL',code,flush=True)
(p/'remaining-gates-1224.finished.json').write_text(json.dumps({'completed':True,'buildExit':code,'note':'Read individual resource results; completion does not imply all tests pass'},indent=2)+'\n')
