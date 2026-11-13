"""Exact cumulative two-runner delivery diagnostic companion build/browser. Historical fullQA and stress failures unchanged."""
import json,os,sys,subprocess
from pathlib import Path
from r335_bound_build import load,require,sha
from r343_world_gate import validate_environment,validate_terminal

def selected(phase):
 commands={'review-build':['node','tests/r275-buddha-triad-review/build-review.mjs'],'visual-stream':['node','tests/r364-asset-delivery/capture-arm.mjs','stream'],'visual-buffer':['node','tests/r364-asset-delivery/capture-arm.mjs','buffer']}
 require(phase in commands,'only fixed private build/normal hall');return commands[phase]
def configure(guard,phase):
 selected(phase);require((guard.RSS_CAP,guard.WALL_SECONDS,guard.HEAP_FLAGS)==(4294967296,720,'--max-old-space-size=2048 --max-semi-space-size=16'),'original budget changed')
 if phase.startswith('visual-'):guard.RSS_CAP=6442450944

def cleanup_gate(result,identity,arm):
 require(arm in ('stream','buffer'),'fixed delivery arm')
 require(result.get('identity')==identity,'exact guard identity')
 require(result.get('command')==selected('visual-'+arm),'exact completed command')
 require(result.get('status')in ('PASS','FAIL'),'actual terminal state')
 require(result.get('cleanup_complete')is True and not result.get('cleanup_error'),'process-tree cleanup proof')
 require(type(result.get('child_pid'))is int and result['child_pid']>1,'actual child launched')
 require(type(result.get('child_exit_code'))is int,'actual child exit status')
 require(type(result.get('owned_processes_observed'))is int and result['owned_processes_observed']>0,'observed owned process tree')
 require(type(result.get('sample_count'))is int and result['sample_count']>0,'sampled owned tree')
 limits=result.get('limits',{})
 require(tuple(limits.get(k)for k in ('rss_bytes','wall_seconds','old_space_mib','semi_space_mib'))==(6442450944,720,2048,16),'original per-arm limits')
 return {'safeForIndependentRunner':True,'originalStatus':result['status'],'originalReason':result.get('reason'),'childExit':result['child_exit_code'],'cleanupComplete':True,'identity':identity,'claim':'ORIGINAL_GUARD_PROCESS_TREE_CLOSED_ONLY_NOT_APPLICATION_ACCEPTANCE','arm':arm}

def main():
 require(len(sys.argv)==2,'one fixed phase');phase=sys.argv[1];cmd=selected(phase);validate_environment(os.environ);require(not any(os.environ.get(k) for k in os.environ if k.startswith('R364_')),'no successor override')
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
 except(ValueError,OSError,KeyError,subprocess.CalledProcessError)as error:print('R364 fixed phase rejected:',error,file=sys.stderr);raise SystemExit(1)

def write_next_runner_output(path):
 with open(path,'a') as out:out.write('safe_for_independent_runner=true\n')
