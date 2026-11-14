"""Fixed CPU world/zones/anchors only; legacy browser gate NOT executed. Never changes product or resource limits."""
import json,os,sys,subprocess,shutil
from pathlib import Path
from r335_bound_build import load,require,sha

def selected(phase):
 commands={'world':['node','tests/r339-material-contract/world-entry.mjs'],'zones':['npm','run','test:zones'],'anchors':['npm','run','test:anchors'],'realworld':['node','tests/r341-real-world/world-entry.mjs'],'routes':['node','tests/stepwalk-auto.cjs','--check']}
 require(phase in commands,'unknown fixed phase');return commands[phase]
def validate_environment(env):
 for key in ('DUMP','ZONES_DIR','PROFILE','GATE_SKIP','NODE_OPTIONS','NODE_PATH','NODE_V8_COVERAGE','TEST_GC','BUILD_DIR','PORT','R48_REAL_TEXTURE_LIBRARY','R262_DISABLE_EXIT_RECHECK','R262_REPO_ROOT','GATE_VISUAL','PERF_BASELINE','PERF_FPS_STRICT'):
  require(not env.get(key),'unexpected inherited override: '+key)
def validate_terminal(result,identity):
 require(result.get('identity')==identity,'terminal identity changed');code=result.get('exit_code');require(type(code)is int,'missing exit code')
 if code==0:require(result.get('status')=='PASS' and result.get('child_exit_code')==0 and result.get('cleanup_complete')is True,'incomplete success')
 return code
def main():
 require(len(sys.argv)==2,'one fixed phase');phase=sys.argv[1];cmd=selected(phase);validate_environment(os.environ)
 e=Path(os.environ['EVIDENCE_DIR']);require(e.is_absolute()and not e.resolve().is_relative_to(Path.cwd().resolve()),'external evidence required')
 identity=json.loads((e/'checkout-identity.json').read_text());git=lambda *a:subprocess.check_output(['git',*a],text=True).strip()
 require(identity['head']==os.environ['GITHUB_SHA']==git('rev-parse','HEAD') and identity['tree']==git('rev-parse','HEAD^{tree}'),'identity changed');require(not git('status','--porcelain=v1','--untracked-files=all'),'dirty checkout')
 for p,v in [('node','v24.22.1'),('npm','11.19.1')]:require(subprocess.check_output([p,'--version'],text=True).strip()==v,'toolchain changed')
 with(e/(phase+'-attempt.json')).open('x')as f:json.dump({'identity':identity,'phase':phase,'releaseAccepted':False},f)
 guard=load('r327_bound_exit_guard');recheck=load('r262_exit_recheck');observation=load('r267_owned_rss_observation')
 require((guard.RSS_CAP,guard.WALL_SECONDS,guard.HEAP_FLAGS)==(4294967296,720,'--max-old-space-size=2048 --max-semi-space-size=16'),'bounds changed')
 folder=e/(phase+'-guard');folder.mkdir();journalpath=folder/'exit-rechecks.json';observer,journal=observation.install(guard,recheck,journalpath,folder/'first-owned-rss-failure.json');guard.atomic_json(journalpath,journal)
 env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS;env['VITE_BASE']='/forbidden-city-3d/'
 try:
  result=guard.supervise(cmd,folder,guard.resource_sample,identity,env);code=validate_terminal(result,identity);print(json.dumps({k:result.get(k)for k in('status','reason','exit_code','child_exit_code','cleanup_complete','sampled_tree_peak_bytes')}));return code
 finally:
  guard.atomic_json(journalpath,journal);guard.atomic_json(folder/'observation.json',observer.summary())
if __name__=='__main__':
 try:raise SystemExit(main())
 except(ValueError,OSError,KeyError,subprocess.CalledProcessError)as error:print('R341 fixed phase rejected:',error,file=sys.stderr);raise SystemExit(1)
