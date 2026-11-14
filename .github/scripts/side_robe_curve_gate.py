"""Exact cumulative normal user-path companion build/browser. Historical fullQA and stress failures unchanged."""
import json,os,sys,subprocess
from pathlib import Path
from r335_bound_build import load,require,sha
from r343_world_gate import validate_environment,validate_terminal

def selected(phase):
 commands={'visual':['node','tests/side-robe-curve/capture.mjs']}
 require(phase in commands,'only fixed private build/normal hall');return commands[phase]
def configure(guard,phase):
 selected(phase);require((guard.RSS_CAP,guard.WALL_SECONDS,guard.HEAP_FLAGS)==(4294967296,720,'--max-old-space-size=2048 --max-semi-space-size=16'),'original budget changed')
 if phase=='visual':guard.RSS_CAP=6442450944

def main():
 require(len(sys.argv)==2,'one fixed phase');phase=sys.argv[1];cmd=selected(phase);validate_environment(os.environ);require(not any(os.environ.get(k) for k in os.environ if k.startswith('TRIAD_CLOSEUP_')),'no successor override')
 e=Path(os.environ['EVIDENCE_DIR']);require(e.is_absolute()and not e.resolve().is_relative_to(Path.cwd().resolve()),'external evidence required')
 identity=json.loads((e/'checkout-identity.json').read_text());git=lambda *a:subprocess.check_output(['git',*a],text=True).strip()
 require(identity['head']==os.environ['GITHUB_SHA']==git('rev-parse','HEAD') and identity['tree']==git('rev-parse','HEAD^{tree}') and identity['frozen']is True,'identity changed');require(not git('status','--porcelain=v1','--untracked-files=all'),'dirty checkout')
 for p,h in {**identity['sourcePins'],**identity['retainedPins']}.items():require(sha(p)==h,'frozen input changed '+p)
 for p,v in [('node','v24.22.1'),('npm','11.19.1')]:require(subprocess.check_output([p,'--version'],text=True).strip()==v,'toolchain changed')
 with(e/(phase+'-attempt.json')).open('x')as f:json.dump({'identity':identity,'phase':phase,'releaseAccepted':False,'historicalFullQAAndStressFailuresRetained':True},f)
 guard=load('r327_bound_exit_guard');recheck=load('r262_exit_recheck');observation=load('r267_owned_rss_observation');configure(guard,phase)
 folder=e/(phase+'-guard');folder.mkdir();journalpath=folder/'exit-rechecks.json';observer,journal=observation.install(guard,recheck,journalpath,folder/'first-owned-rss-failure.json');guard.atomic_json(journalpath,journal)
 env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS;env['VITE_BASE']='/forbidden-city-3d/'
 try:
  result=guard.supervise(cmd,folder,guard.resource_sample,identity,env);code=validate_terminal(result,identity);print(json.dumps({k:result.get(k)for k in('status','reason','exit_code','child_exit_code','cleanup_complete','sampled_tree_peak_bytes')}));return code
 finally:guard.atomic_json(journalpath,journal);guard.atomic_json(folder/'observation.json',observer.summary())
if __name__=='__main__':
 try:raise SystemExit(main())
 except(ValueError,OSError,KeyError,subprocess.CalledProcessError)as error:print('Triad closeup fixed phase rejected:',error,file=sys.stderr);raise SystemExit(1)
