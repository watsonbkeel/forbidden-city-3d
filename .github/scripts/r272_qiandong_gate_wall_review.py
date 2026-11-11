"""R272 purpose-specific complete east-six companion. No publish or retries."""
import importlib.util,json,os,sys,subprocess
from pathlib import Path
import r267_hall_review as old
import r267_owned_rss_build as owned
from r267_owned_rss_observation import private_function
REF='refs/heads/dev/r272-qiandong-gate-wall'
PARENT='dbc141dde11a65d16e537be33b27a8f1b1aef127'
PARENT_TREE='486cc6861079eb0cb7e573d46496b1eb97a1365b'
PRODUCT_TREE='5b63332d7287a87bf3bbf18febdf030e0b0dbdbd'
ROOT='tests/r272-qiandong-gate-wall/'
PRODUCT_PATHS=['README.md','tests/r271-qiandong-second-front-court/component.test.mjs','src/scene/palace/special/QiandongSecondFrontCourt.js','src/scene/palace/special/QiandongSecondFrontCourtProfile.js','src/scene/zones/ZoneBase.js',ROOT+'component.test.mjs']
RUNTIME_PATHS=['.github/scripts/r272_qiandong_gate_wall_review.py','.github/scripts/test_r272_qiandong_gate_wall_review.py','.github/workflows/r272-qiandong-gate-wall-review.yml']+[ROOT+n for n in ['build-review.mjs','capture.mjs','contract.mjs','contract.test.mjs','pins.json','review-court.html','review-court.mjs']]
PATHS=sorted(PRODUCT_PATHS+RUNTIME_PATHS)
CHANGES=[('M' if p in PRODUCT_PATHS and p!=ROOT+'component.test.mjs' else 'A',p) for p in PATHS]
require=old.require
_event=private_function(old.validate_event,{'REF':REF})
def validate_event(env,event):
 _event(env,event)
 require(not any(env.get(k) for k in env if k.startswith(('R272_','R271_','R270_','R269_','R268_'))),'successor override rejected')
def select(phase):
 names={'review-build':'build-review.mjs','visual':'capture.mjs'}
 require(phase in names,'only purpose companion build or visual phase')
 return ['node',ROOT+names[phase]]
def configure_guard(guard,phase):
 select(phase)
 old.configure_guard(guard,phase)
def validate_checkout():
 pins=json.loads(Path(ROOT+'pins.json').read_text());paths=pins['candidatePaths'];changes=[tuple(row) for row in pins['changes']]
 require(paths==PATHS and changes==CHANGES,'exact sixteen-path/action candidate required')
 return private_function(old.validate_checkout,{'REF':REF,'PARENT':PARENT,'PARENT_TREE':PARENT_TREE,'PRODUCT_TREE':PRODUCT_TREE,'ROOT':ROOT,'PATHS':paths,'CHANGES':changes,'validate_event':validate_event})()
ordinary=private_function(owned.ordinary,{'validate_checkout':validate_checkout,'__file__':__file__})
def main():
 if len(sys.argv)==1:return ordinary()
 require(len(sys.argv)==2,'one fixed phase required');phase=sys.argv[1]
 require(phase in ('admit','review-build','visual'),'unknown phase');identity=validate_checkout()
 e=Path(os.environ['EVIDENCE_DIR']);require(e.is_absolute() and not e.is_relative_to(Path.cwd()),'external evidence required')
 if phase=='admit':
  require(not Path('dist').exists(),'ordinary dist must be fresh');(e/'checkout-identity.json').write_text(json.dumps(identity,indent=2)+'\n');print(json.dumps(identity));return 0
 require(json.loads((e/'checkout-identity.json').read_text())==identity,'identity changed')
 for p,v in [('node','v24.22.1'),('npm','11.19.1')]:require(subprocess.check_output([p,'--version'],text=True).strip()==v,'toolchain changed')
 with (e/(phase+'-attempt.json')).open('x') as f:json.dump({'identity':identity,'phase':phase,'releaseAccepted':False},f)
 source=Path('.github/scripts/r177_build_bound.py');spec=importlib.util.spec_from_file_location('r272_unchanged_guard',source);guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard);configure_guard(guard,phase)
 from r262_exit_recheck import install_exit_state_recheck
 folder=e/(phase+'-guard');folder.mkdir();checks=install_exit_state_recheck(guard,folder/'exit-rechecks.json')
 env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS
 result=guard.supervise(select(phase),folder,guard.resource_sample,{**identity,'scope':'actual complete east-six finite scripted controller and six cameras; NOT World/NPC dynamic/release acceptance','guardSha256':old.GUARD_HASH,'exitRecheckSha256':old.RECHECK_HASH,'exitRechecks':checks,'wrapperSha256':old.sha(__file__)},env)
 print(json.dumps({k:result.get(k) for k in ('status','reason','exit_code','child_exit_code','cleanup_complete')}));return result['exit_code']
if __name__=='__main__':
 try:raise SystemExit(main())
 except (ValueError,OSError,KeyError,subprocess.CalledProcessError) as e:print('R272 admission failed:',e,file=sys.stderr);raise SystemExit(1)
