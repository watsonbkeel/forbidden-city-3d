"""Same-budget supplemental ordinary build. Historical R334 FAIL remains FAIL.
No command, heap or resource overrides; install unchanged observer/recheck then
call the exact R327 fixed CLI. Success additionally requires durable receipts.
"""
import hashlib,importlib.util,json,os,sys
from pathlib import Path
HASHES={
 'r327_bound_exit_guard':'87920775bf21de5a965dcbb00f6ae2840014a7b786292394db73ed382d007c73',
 'r262_exit_recheck':'2e102777b68160b4ef3b10738c521f560c42ffce196535d635f44cd8f6cce205',
 'r267_owned_rss_observation':'dfa9710045cd4a783bb9b030d39c81c8daea51d346df076a2fbbb343f0093d0a'}
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def require(value,message):
 if not value:raise ValueError(message)
def load(name):
 p=Path(__file__).with_name(name+'.py');require(sha(p)==HASHES[name],'frozen helper changed: '+name)
 spec=importlib.util.spec_from_file_location('r335_private_'+name,p);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
def main():
 require(len(sys.argv)==1,'no command or resource overrides')
 evidence=Path(os.environ['EVIDENCE_DIR']);require(evidence.is_absolute() and not evidence.resolve().is_relative_to(Path.cwd().resolve()),'external evidence required')
 identity=json.loads((evidence/'checkout-identity.json').read_text());require(identity['head']==os.environ['GITHUB_SHA'],'admitted source identity changed')
 require(not Path('dist').exists(),'ordinary dist must be fresh')
 guard=load('r327_bound_exit_guard');recheck=load('r262_exit_recheck');observation=load('r267_owned_rss_observation')
 require((guard.RSS_CAP,guard.WALL_SECONDS,guard.HEAP_FLAGS)==(4294967296,720,'--max-old-space-size=2048 --max-semi-space-size=16'),'fixed bounds changed')
 marker=evidence/'ordinary-build-attempt.json'
 with marker.open('x') as out:json.dump({'identity':identity,'phase':'same-budget-supplemental-ordinary-build','originalR334FailureRetained':True},out);out.flush();os.fsync(out.fileno())
 journal_path=evidence/'ordinary-build-exit-rechecks.json'
 observer,journal=observation.install(guard,recheck,journal_path,evidence/'ordinary-first-owned-rss-failure.json')
 guard.atomic_json(journal_path,journal)
 receipt={'status':'RUNNING','identity':identity,'adapterSha256':sha(__file__),'sourceHashes':HASHES,'limits':{'rss_bytes':guard.RSS_CAP,'wall_seconds':guard.WALL_SECONDS,'heap_flags':guard.HEAP_FLAGS},'guardExitCode':None,'releaseAccepted':False}
 guard.atomic_json(evidence/'ordinary-build-observation.json',receipt);code=None
 try:
  code=guard.main() # No mutated constants/command/env; exact original CLI admission.
  terminal=json.loads((evidence/'build-terminal.json').read_text())
  require(terminal.get('exit_code')==code and terminal.get('identity',{}).get('head')==identity['head'] and terminal['identity'].get('tree')==identity['tree'],'terminal identity/exit missing')
  if code==0:require(terminal.get('status')=='PASS' and terminal.get('child_exit_code')==0 and terminal.get('cleanup_complete') is True,'build/cleanup not PASS')
  receipt.update(status='PASS' if code==0 else 'FAIL',guardExitCode=code);return code
 finally:
  if receipt['status']=='RUNNING':receipt.update(status='FAIL',guardExitCode=code)
  receipt['observation']=observer.summary()
  guard.atomic_json(journal_path,journal);guard.atomic_json(evidence/'ordinary-build-observation.json',receipt)
if __name__=='__main__':
 try:raise SystemExit(main())
 except (ValueError,OSError,KeyError) as error:print('R335 admission/receipt failed:',error,file=sys.stderr);raise SystemExit(1)
