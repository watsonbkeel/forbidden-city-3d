from pathlib import Path
from probe_monitor import run_process,wrapper_exit
from phase_orchestrator import run_batch,phase_proof
import os,sys,json,hashlib,subprocess,datetime,time,traceback
BATCH_STARTED=time.monotonic()
O=Path(__file__).resolve().parent
B=O.parent/'r165-f49-tishun-beam-1331'
BASE='fef5c0e1904c361e7492d744f06d82a8c137e1ea'
PLAN_SHA='27d6abfdda79333154004f28aeda08414248277d8205a5a5d5f96d6f4d702882'
PHASE_PLAN=O.parent/'r165-h37-space-probe-1554'/'resource-stop-1603'/'PHASED-PLAN.md'
PHASE_PLAN_SHA='2e8d19d5b8442dc443756b76b659481d9cf04cedaeb687e4a087c2db922e4793'
ENV={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def sha(b):return hashlib.sha256(b).hexdigest()
def git(repo,*a):return subprocess.check_output(['git','-C',str(repo),*a],env=ENV)
def source_state():
 rows=[]
 for p in[B,O.parent/'r165-l11-chenghuang-entry-1052']:
  index=Path(git(p,'rev-parse','--git-path','index').decode().strip())
  if not index.is_absolute():index=p/index
  rows.append({'worktree':str(p),'head':git(p,'rev-parse','HEAD').decode().strip(),'tree':git(p,'rev-parse','HEAD^{tree}').decode().strip(),'indexSHA256':sha(index.read_bytes()),'trackedStatus':git(p,'status','--porcelain=v1','--untracked-files=no').decode()})
 return rows
def input_lock():
 rows=[];absent=[]
 for rec in git(B,'ls-tree','-rz',BASE).split(b'\0'):
  if not rec:continue
  info,path=rec.split(b'\t',1);mode,kind,blob=info.decode().split();p=path.decode()
  if kind!='blob' or not(p.startswith(('src/','data/','tests/','public/'))or p in['package.json','package-lock.json','vite.config.js']):continue
  f=B/p
  if not f.is_file():absent.append({'path':p,'blob':blob,'state':'not expanded; not an actual read; required AST/files must separately exist'});continue
  b=f.read_bytes();actual=hashlib.sha1(('blob '+str(len(b))+'\0').encode()+b).hexdigest()
  if actual!=blob:raise RuntimeError('Present public input drift: '+p)
  rows.append({'path':p,'blob':blob,'bytes':len(b),'sha256':sha(b)})
 required=json.loads((O/'AST-DEPENDENCIES.json').read_text())
 if required['base']!=BASE or required['unresolvedDynamicImports']:raise RuntimeError('Unclosed AST dependency boundary')
 have={x['path']for x in rows}
 for r in required['closure']:
  if r['path']not in have or sha((B/r['path']).read_bytes())!=r['sha256']:raise RuntimeError('Required module missing/drifted: '+r['path'])
 if 'public/textures/hd/manifest.json'not in have:raise RuntimeError('Required actual HD manifest missing')
 source_files=sorted(p for p in O.iterdir()if p.is_file()and p.suffix in['.mjs','.py'])
 prep=[{'path':p.name,'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())}for p in source_files]
 fixed=[O/'AST-DEPENDENCIES.json',O/'ROUTE-ADAPTATION.json',O.parent/'r165-h37-three-gate-design-1424'/'CANDIDATE.json',O.parent/'r165-h37-three-gate-design-1424'/'DESIGN.md',O.parent/'r165-h37-three-gate-design-1424'/'PROBE-PLAN.md',O.parent/'r165-f49-beam-design-1151'/'GREEN-FULL-PROBE-1324'/'b-resource-witness.mjs']
 fixed.extend([O/'ASSERTION-LEDGER.json',PHASE_PLAN])
 if sha(PHASE_PLAN.read_bytes())!=PHASE_PLAN_SHA:raise RuntimeError('Reviewed phase plan changed')
 for p in fixed:prep.append({'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())})
 if sha(fixed[4].read_bytes())!=PLAN_SHA:raise RuntimeError('Reviewed plan changed')
 dependencies=[];nm=(B/'node_modules').resolve()
 for d in[nm/'three',nm/'@napi-rs/canvas',nm/'@napi-rs/canvas-linux-x64-gnu',nm/'@napi-rs/canvas-linux-x64-musl']:
  if d.is_dir():
   for p in sorted(d.rglob('*')):
    if p.is_file():b=p.read_bytes();dependencies.append({'path':str(p),'bytes':len(b),'sha256':sha(b)})
 if not dependencies:raise RuntimeError('No active dependency package lock')
 return {'base':BASE,'tree':git(B,'rev-parse',BASE+'^{tree}').decode().strip(),'scope':'Bounded actual imported inputs and present public bytes only; not full physical checkout/build proof','files':rows,'notExpanded':absent,'prep':prep,'dependencies':dependencies,'sharedNodeModules':str(nm),'nodeVersion':subprocess.check_output(['node','--version'],text=True,env=ENV).strip(),'NODE_OPTIONS':ENV.get('NODE_OPTIONS')}
before=source_state();lock=input_lock()
if any(r['trackedStatus']for r in before):raise RuntimeError('Protected frozen worktree has tracked changes')
if sys.argv[1:]==['--prepare-only']:
 if source_state()!=before:raise RuntimeError('Source/index drift during prepare-only')
 (O/'PREPARED-INPUT-LOCK.json').write_text(json.dumps(lock,indent=2)+'\n')
 (O/'PREPARED-SOURCE-STATE.json').write_text(json.dumps(before,indent=2)+'\n')
 print(json.dumps({'prepareOnly':True,'actualFixtures':0,'files':len(lock['files']),'requiredASTFiles':len(json.loads((O/'AST-DEPENDENCIES.json').read_text())['closure']),'inputBytes':sum(r['bytes']for r in lock['files']),'notExpanded':len(lock['notExpanded']),'inputSHA256':sha((O/'PREPARED-INPUT-LOCK.json').read_bytes()),'sourceState':before},indent=2));sys.exit(0)
if sys.argv[1:]!=['--execute-once']:raise RuntimeError('Explicit prepare-only or execute-once required')
auth_bytes=(O/'RUN-AUTHORIZATION.json').read_bytes();auth=json.loads(auth_bytes)
if auth.get('public372Accepted')is not True or auth.get('base')!=BASE or auth.get('uniqueWindowGranted')is not True or auth.get('planSHA256')!=PLAN_SHA or auth.get('phasePlanSHA256')!=PHASE_PLAN_SHA or auth.get('freezeSHA256')!=sha((O/'SCRIPT-FREEZE.json').read_bytes())or auth.get('preparedInputLockSHA256')!=sha((O/'PREPARED-INPUT-LOCK.json').read_bytes()):raise RuntimeError('Exact batch public release/window/freeze/inputs approval not established')
if lock!=json.loads((O/'PREPARED-INPUT-LOCK.json').read_text())or before!=json.loads((O/'PREPARED-SOURCE-STATE.json').read_text()):raise RuntimeError('Input or source/index drift since preparation')
with(O/'RUN-STARTED.json').open('x')as f:json.dump({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorization':auth,'base':BASE,'onceOnlyBatch':True,'phases':['P1','P2C'],'aggregateBudgetSeconds':180},f,indent=2)
(O/'SOURCE-BEFORE.json').write_text(json.dumps(before,indent=2)+'\n');(O/'INPUTS-BEFORE.json').write_text(json.dumps(lock,indent=2)+'\n')
proofs=[];batch={'success':False,'scope':'P1 then fresh P2+C staged evidence; not complete original single-process equivalence'}
def verify_inputs(label):
 after=source_state();after_lock=input_lock()
 if after!=before or after_lock!=lock or(O/'RUN-AUTHORIZATION.json').read_bytes()!=auth_bytes:raise RuntimeError('Input/source/index/authorization drift at '+label)
 (O/('LOCK-'+label+'.json')).write_text(json.dumps({'label':label,'source':after,'inputFingerprintSHA256':sha(json.dumps(after_lock,sort_keys=True).encode()),'unchanged':True},indent=2)+'\n')
def launch(phase,started_at):
 env={**ENV,'H37_DIAGNOSTIC_PHASE':phase}
 cmd=['node','--expose-gc','--max-old-space-size=256','--max-semi-space-size=16','--test','--test-concurrency=1',str(O/'space-probe.test.mjs')]
 result,samples,final=run_process(cmd,B,env,O/('SPACE-'+phase+'.log'),started_at=started_at)
 (O/('SPACE-'+phase+'-RSS.json')).write_text(json.dumps(samples,indent=2)+'\n');(O/('SPACE-'+phase+'-EXIT.json')).write_text(json.dumps(result,indent=2)+'\n')
 path=O/('SPACE-'+phase+'-RESULT.json');report=json.loads(path.read_text())if path.is_file()else None;report_safe=report if isinstance(report,dict)else{}
 unchanged=source_state()==before and input_lock()==lock and(O/'RUN-AUTHORIZATION.json').read_bytes()==auth_bytes
 definition=json.loads((O/'ASSERTION-LEDGER.json').read_text())
 proof=phase_proof(phase,report,result,final,unchanged,definition['phases'][phase],definition['collectionLabels'][phase])
 proofs.append(proof);(O/('PHASE-'+phase+'-PROOF.json')).write_text(json.dumps(proof,indent=2)+'\n');return proof
try:
 batch.update(run_batch(('P1','P2C'),started_at=BATCH_STARTED,now=time.monotonic,verify_inputs=verify_inputs,launch=launch))
except BaseException as error:
 batch.update({'success':False,'error':repr(error),'traceback':traceback.format_exc()})
finally:
 try:
  after=source_state();after_lock=input_lock();unchanged=after==before and after_lock==lock and(O/'RUN-AUTHORIZATION.json').read_bytes()==auth_bytes
 except BaseException as error:after={'captureError':repr(error)};after_lock={'captureError':repr(error)};unchanged=False
 (O/'SOURCE-AFTER.json').write_text(json.dumps(after,indent=2)+'\n');(O/'INPUTS-AFTER.json').write_text(json.dumps(after_lock,indent=2)+'\n')
 elapsed=time.monotonic()-BATCH_STARTED
 batch.update({'phaseProofs':proofs,'sourceAndInputsAndIndicesUnchanged':unchanged,'aggregateSecondsIncludingFinalLocks':elapsed,'aggregateBudgetSeconds':180,'nodeTreeBudgetMiB':350})
 if not unchanged or elapsed>=180:batch['success']=False
 (O/'BATCH-RESULT.json').write_text(json.dumps(batch,indent=2)+'\n')
print(json.dumps(batch,indent=2));sys.exit(0 if batch.get('success')is True else 1)
