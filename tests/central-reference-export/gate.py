"""QA-only fixed central reference export; no product edits.
Same R327 supervisor + R262 exit recheck + R267 owned RSS observation.
One 6 GiB / 720 s envelope for exporter and all descendants.
Requires frozen clean exact Git checkout; an archive alone is NOT admitted.
"""
import json,os,sys,subprocess,hashlib
from pathlib import Path
ROOT=Path('/tmp/central-baseline-source')
HERE=Path('/tmp/central-reference-export')
HEAD='1851caeecc334fe2a811d78e29b7dfbec87138ed'
sys.path.insert(0,str(ROOT/'.github/scripts'))
from r335_bound_build import load,require,sha
from r343_world_gate import validate_environment,validate_terminal

def configure(guard):
 require((guard.RSS_CAP,guard.WALL_SECONDS,guard.HEAP_FLAGS)==(4294967296,720,'--max-old-space-size=2048 --max-semi-space-size=16'),'original budget changed')
 guard.RSS_CAP=6442450944

def main():
 require(len(sys.argv)==1,'no phase/command/budget overrides');require(Path.cwd().resolve()==ROOT,'fixed checkout required');validate_environment(os.environ)
 e=Path(os.environ['EVIDENCE_DIR']);require(e.is_absolute()and not e.resolve().is_relative_to(ROOT)and not e.resolve().is_relative_to(HERE),'external evidence required')
 identity=json.loads((e/'checkout-identity.json').read_text());git=lambda *a:subprocess.check_output(['git',*a],text=True).strip()
 require(identity['head']==os.environ['GITHUB_SHA']==git('rev-parse','HEAD')==HEAD and identity['tree']==git('rev-parse','HEAD^{tree}') and identity['frozen']is True,'identity changed')
 require(not git('status','--porcelain=v1','--untracked-files=all'),'dirty checkout')
 pins=json.loads((HERE/'pins.json').read_text())
 require(identity.get('exportHarnessPins')==pins['harness'],'harness must be frozen in admission identity')
 for p,h in {**pins['source'],**identity['sourcePins'],**identity['retainedPins']}.items():require(sha(ROOT/p)==h,'frozen input changed '+p)
 for p,h in pins['harness'].items():require(sha(HERE/p)==h,'harness changed '+p)
 for p,h in identity['diagnosticRuntimePins'].items():require(sha(p)==h,'diagnostic runtime changed '+p)
 for p,v in [('node','v24.22.1'),('npm','11.19.1')]:require(subprocess.check_output([p,'--version'],text=True).strip()==v,'toolchain changed')
 with(e/'export-attempt.json').open('x')as f:json.dump({'identity':identity,'phase':'fixed-central-reference-export','releaseAccepted':False},f)
 guard=load('r327_bound_exit_guard');recheck=load('r262_exit_recheck');observation=load('r267_owned_rss_observation');configure(guard)
 folder=e/'export-guard';folder.mkdir();journalpath=folder/'exit-rechecks.json';observer,journal=observation.install(guard,recheck,journalpath,folder/'first-owned-rss-failure.json');guard.atomic_json(journalpath,journal)
 env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS;env['VITE_BASE']='/forbidden-city-3d/'
 try:
  result=guard.supervise(['node','/tmp/central-reference-export/worker.mjs'],folder,guard.resource_sample,identity,env);code=validate_terminal(result,identity)
  if code==0:require(json.loads((e/'receipt.json').read_text()).get('complete') is True,'missing complete verified export receipt')
  print(json.dumps({k:result.get(k)for k in('status','reason','exit_code','child_exit_code','cleanup_complete','sampled_tree_peak_bytes')}));return code
 finally:guard.atomic_json(journalpath,journal);guard.atomic_json(folder/'observation.json',observer.summary())
if __name__=='__main__':
 try:raise SystemExit(main())
 except(ValueError,OSError,KeyError,subprocess.CalledProcessError)as error:print('fixed central reference export rejected:',error,file=sys.stderr);raise SystemExit(1)
