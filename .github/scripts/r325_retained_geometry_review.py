"""R324 product verification in an independent R325 first-run candidate; no deployment."""
import importlib.util,json,os,sys,subprocess
from pathlib import Path
import r267_hall_review as old
import r267_owned_rss_build as owned
from r267_owned_rss_observation import private_function,install
REF='refs/heads/dev/r325-retained-geometry-review'
PARENT='UNBOUND'
PARENT_TREE='UNBOUND'
PRODUCT_TREE='UNBOUND'
ROOT='tests/r275-buddha-triad-review/'
def candidate_binding():
 pins=json.loads(Path(ROOT+'pins.json').read_text())
 require(pins.get('frozen') is True and pins.get('bindingStatus')=='COORDINATOR_FROZEN_AFTER_INDEPENDENT_REVIEW','unbound candidate cannot run')
 for key in ['remoteParent','parentTree','productTree']:
  require(__import__('re').fullmatch('[a-f0-9]{40}',pins.get(key,'')) is not None,'unbound '+key)
 return pins
require=old.require
_event=private_function(old.validate_event,{'REF':REF})
def validate_event(env,event):
 _event(env,event)
 require(not any(env.get(k) for k in env if k.startswith(('R300_','R299_','R298_','R297_','R275_','R274_','R273_','R272_','R271_','R270_','R269_','R268_'))),'successor override rejected')
def select(phase):
 names={'review-build':'build-review.mjs','visual':'capture.mjs'}
 require(phase in names,'only private hall build or finite actual visual')
 return ['node',ROOT+names[phase]]
def configure_guard(guard,phase):
 select(phase)
 # Same proven guard constants. Only visual RSS cap changes to the original 6 GiB choice.
 old.configure_guard(guard,'visual' if phase=='visual' else 'review-build')
def validate_checkout():
 pins=candidate_binding();paths=pins['candidatePaths'];changes=pins['changes']
 require(paths==sorted(set(paths)) and changes==sorted(changes,key=lambda row:row[1]),'canonical frozen paths required')
 result=private_function(old.validate_checkout,{'REF':REF,'PARENT':pins['remoteParent'],'PARENT_TREE':pins['parentTree'],'PRODUCT_TREE':pins['productTree'],'ROOT':ROOT,'PATHS':paths,'CHANGES':changes,'validate_event':validate_event})()
 result['frozen']=True;return result
ordinary=private_function(owned.ordinary,{'validate_checkout':validate_checkout,'__file__':__file__})
def main():
 if len(sys.argv)==1:return ordinary()
 require(len(sys.argv)==2,'one fixed phase required');phase=sys.argv[1];require(phase in ('admit','review-build','visual'),'unknown phase');identity=validate_checkout();e=Path(os.environ['EVIDENCE_DIR']);require(e.is_absolute() and not e.is_relative_to(Path.cwd()),'external evidence required')
 if phase=='admit':
  require(not Path('dist').exists(),'no production dist permitted');(e/'checkout-identity.json').write_text(json.dumps(identity,indent=2)+'\n');print(json.dumps(identity));return 0
 require(json.loads((e/'checkout-identity.json').read_text())==identity,'source identity changed')
 for p,v in [('node','v24.22.1'),('npm','11.19.1')]:require(subprocess.check_output([p,'--version'],text=True).strip()==v,'toolchain changed')
 with (e/(phase+'-attempt.json')).open('x') as f:json.dump({'identity':identity,'phase':phase,'releaseAccepted':False},f)
 source=Path('.github/scripts/r177_build_bound.py');spec=importlib.util.spec_from_file_location('r273_unchanged_guard',source);guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard);configure_guard(guard,phase)
 # Use original observer+recheck installation, preserving every owned-RSS decision.
 recheck_spec=importlib.util.spec_from_file_location('r273_unchanged_recheck',Path('.github/scripts/r262_exit_recheck.py'));recheck=importlib.util.module_from_spec(recheck_spec);recheck_spec.loader.exec_module(recheck)
 folder=e/(phase+'-guard');folder.mkdir();journal_path=folder/'exit-rechecks.json';observer,journal=install(guard,recheck,journal_path,folder/'first-owned-rss-failure.json');guard.atomic_json(journal_path,journal)
 env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS
 try:
  result=guard.supervise(select(phase),folder,guard.resource_sample,{**identity,'scope':'one real triad Dafotang item, aggregate cancellation, finite routes and cold return; not full zone/World or release acceptance','guardSha256':old.GUARD_HASH,'exitRecheckSha256':old.RECHECK_HASH,'wrapperSha256':old.sha(__file__)},env)
  require(result.get('exit_code')!=0 or (result.get('status')=='PASS' and result.get('child_exit_code')==0 and result.get('cleanup_complete') is True),'guard success receipt incomplete')
  print(json.dumps({k:result.get(k) for k in ('status','reason','exit_code','child_exit_code','cleanup_complete')}));return result['exit_code']
 finally:guard.atomic_json(journal_path,journal);guard.atomic_json(folder/'observation.json',observer.summary())
if __name__=='__main__':
 try:raise SystemExit(main())
 except (ValueError,OSError,KeyError,subprocess.CalledProcessError) as e:print('R325 admission failed:',e,file=sys.stderr);raise SystemExit(1)
