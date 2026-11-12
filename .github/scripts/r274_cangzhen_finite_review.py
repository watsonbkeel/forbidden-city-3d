"""R274 purpose-specific finite Cangzhen companion. No publish or retries."""
import importlib.util,json,os,sys,subprocess
from pathlib import Path
import r267_hall_review as old
import r267_owned_rss_build as owned
from r267_owned_rss_observation import private_function
REF='refs/heads/dev/r274-cangzhen-finite'
PARENT='2bad49c562372ead431c022cc74ac1c4d6720ebe'
PARENT_TREE='d8cdbdadce5c8a559d13d7ed9cc8b36f41b9f2d1'
PRODUCT_TREE='d7faf306b9f31e987dc40e2a70ad86afb8ffb99b'
ROOT='tests/r274-cangzhen-finite-review/'
PRODUCT_PATHS=['data/places/supplemental.json', 'src/scene/palace/special/CangzhenGate.js', 'src/scene/palace/special/CangzhenGateGeometry.js', 'src/scene/palace/special/CangzhenGateProfile.js', 'src/scene/zones/ZoneBase.js', 'tests/r273-cangzhen-gate/component.test.mjs', 'tests/r273-cangzhen-gate/controller.test.mjs', 'tests/r273-cangzhen-gate/integration.test.mjs', 'tests/r273-cangzhen-gate/lifecycle.test.mjs', 'tests/r273-cangzhen-gate/local-fixture.mjs', 'tests/r273-cangzhen-gate/npc.test.mjs', 'tests/r273-cangzhen-gate/save-evidence.mjs', 'tests/r273-cangzhen-gate/seam.test.mjs', 'tests/r273-cangzhen-gate/source-pins.json']
RUNTIME_PATHS=['.github/scripts/r274_cangzhen_finite_review.py', '.github/scripts/test_r274_cangzhen_finite_review.py', '.github/workflows/r274-cangzhen-finite-review.yml', 'tests/r274-cangzhen-finite-review/build-review.mjs', 'tests/r274-cangzhen-finite-review/capture.mjs', 'tests/r274-cangzhen-finite-review/contract.mjs', 'tests/r274-cangzhen-finite-review/contract.test.mjs', 'tests/r274-cangzhen-finite-review/pins.json', 'tests/r274-cangzhen-finite-review/review-court.html', 'tests/r274-cangzhen-finite-review/review-court.mjs']
PATHS=['.github/scripts/r274_cangzhen_finite_review.py', '.github/scripts/test_r274_cangzhen_finite_review.py', '.github/workflows/r274-cangzhen-finite-review.yml', 'data/places/supplemental.json', 'src/scene/palace/special/CangzhenGate.js', 'src/scene/palace/special/CangzhenGateGeometry.js', 'src/scene/palace/special/CangzhenGateProfile.js', 'src/scene/zones/ZoneBase.js', 'tests/r273-cangzhen-gate/component.test.mjs', 'tests/r273-cangzhen-gate/controller.test.mjs', 'tests/r273-cangzhen-gate/integration.test.mjs', 'tests/r273-cangzhen-gate/lifecycle.test.mjs', 'tests/r273-cangzhen-gate/local-fixture.mjs', 'tests/r273-cangzhen-gate/npc.test.mjs', 'tests/r273-cangzhen-gate/save-evidence.mjs', 'tests/r273-cangzhen-gate/seam.test.mjs', 'tests/r273-cangzhen-gate/source-pins.json', 'tests/r274-cangzhen-finite-review/build-review.mjs', 'tests/r274-cangzhen-finite-review/capture.mjs', 'tests/r274-cangzhen-finite-review/contract.mjs', 'tests/r274-cangzhen-finite-review/contract.test.mjs', 'tests/r274-cangzhen-finite-review/pins.json', 'tests/r274-cangzhen-finite-review/review-court.html', 'tests/r274-cangzhen-finite-review/review-court.mjs']
CHANGES=[('A', '.github/scripts/r274_cangzhen_finite_review.py'), ('A', '.github/scripts/test_r274_cangzhen_finite_review.py'), ('A', '.github/workflows/r274-cangzhen-finite-review.yml'), ('M', 'data/places/supplemental.json'), ('A', 'src/scene/palace/special/CangzhenGate.js'), ('A', 'src/scene/palace/special/CangzhenGateGeometry.js'), ('A', 'src/scene/palace/special/CangzhenGateProfile.js'), ('M', 'src/scene/zones/ZoneBase.js'), ('A', 'tests/r273-cangzhen-gate/component.test.mjs'), ('A', 'tests/r273-cangzhen-gate/controller.test.mjs'), ('A', 'tests/r273-cangzhen-gate/integration.test.mjs'), ('A', 'tests/r273-cangzhen-gate/lifecycle.test.mjs'), ('A', 'tests/r273-cangzhen-gate/local-fixture.mjs'), ('A', 'tests/r273-cangzhen-gate/npc.test.mjs'), ('A', 'tests/r273-cangzhen-gate/save-evidence.mjs'), ('A', 'tests/r273-cangzhen-gate/seam.test.mjs'), ('A', 'tests/r273-cangzhen-gate/source-pins.json'), ('A', 'tests/r274-cangzhen-finite-review/build-review.mjs'), ('A', 'tests/r274-cangzhen-finite-review/capture.mjs'), ('A', 'tests/r274-cangzhen-finite-review/contract.mjs'), ('A', 'tests/r274-cangzhen-finite-review/contract.test.mjs'), ('A', 'tests/r274-cangzhen-finite-review/pins.json'), ('A', 'tests/r274-cangzhen-finite-review/review-court.html'), ('A', 'tests/r274-cangzhen-finite-review/review-court.mjs')]
require=old.require
_event=private_function(old.validate_event,{'REF':REF})
def validate_event(env,event):
 _event(env,event)
 require(not any(env.get(k) for k in env if k.startswith(('R274_','R271_','R270_','R269_','R268_'))),'successor override rejected')
def select(phase):
 names={'review-build':'build-review.mjs','visual':'capture.mjs'}
 require(phase in names,'only purpose companion build or visual phase')
 return ['node',ROOT+names[phase]]
def configure_guard(guard,phase):
 select(phase)
 old.configure_guard(guard,phase)
def validate_checkout():
 pins=json.loads(Path(ROOT+'pins.json').read_text());require(pins.get('frozen') is True and PRODUCT_TREE!='UNBOUND' and 'UNBOUND' not in REF,'private draft is not admitted');paths=pins['candidatePaths'];changes=[tuple(row) for row in pins['changes']]
 require(paths==PATHS and changes==CHANGES,'exact frozen product/runtime path delta required')
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
 source=Path('.github/scripts/r177_build_bound.py');spec=importlib.util.spec_from_file_location('r274_unchanged_guard',source);guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard);configure_guard(guard,phase)
 from r262_exit_recheck import install_exit_state_recheck
 folder=e/(phase+'-guard');folder.mkdir();checks=install_exit_state_recheck(guard,folder/'exit-rechecks.json')
 env=os.environ.copy();env['NODE_OPTIONS']=guard.HEAP_FLAGS
 result=guard.supervise(select(phase),folder,guard.resource_sample,{**identity,'scope':'actual finite Cangzhen native controller and four cameras; NOT World/NPC dynamic/release acceptance','guardSha256':old.GUARD_HASH,'exitRecheckSha256':old.RECHECK_HASH,'exitRechecks':checks,'wrapperSha256':old.sha(__file__)},env)
 print(json.dumps({k:result.get(k) for k in ('status','reason','exit_code','child_exit_code','cleanup_complete')}));return result['exit_code']
if __name__=='__main__':
 try:raise SystemExit(main())
 except (ValueError,OSError,KeyError,subprocess.CalledProcessError) as e:print('R274 admission failed:',e,file=sys.stderr);raise SystemExit(1)
