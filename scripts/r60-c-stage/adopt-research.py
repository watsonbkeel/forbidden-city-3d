"""One-time R60 queue adoption; original source rows and baseline remain intact."""
from pathlib import Path
import sys,json,datetime,copy,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R59-B','Already adopted or wrong predecessor'
rawhash=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat();ix={x['id']:x for x in q['items']}
old=copy.deepcopy(q['integration']);old.update(stageStatus='FUNCTIONAL_STAGE_DELIVERY_NOT_FULL_B_ACCEPTANCE',frozenLocalCommit='44ba4706a2088b6a4105d13cf3936cced125a880',frozenTree='93e8d5b5496d935c8e4906200bdf14f5085b75a7',residualInventory='docs/photo-fidelity/RESIDUALS/R59-B-STAGE.json',latestWorldSourceCommit='f7039ce736c94f09ad4bb72b5c265ba79670386c',accepted=False)
q['completedStageHistory'].append(old)
q['integration']={'release':'R60-C','baseLocalCommit':old['frozenLocalCommit'],'baseTree':old['frozenTree'],'baseRemoteCommit':None,'baseRemoteStatus':'R59_UPLOAD_WAITS_FOR_VERIFIED_R58_RECEIPT','branch':'feat/r60-c-west-fidelity-20261022','adoptedAt':now,'scope':'All 17 original C identities and existing-instance/auxiliary scope; declaration ownership follows physical area, not outer-west code-zone name.','publicReferenceImageCopies':False,'stageStatus':'IN_PROGRESS','retainedPreviousResiduals':['docs/photo-fidelity/RESIDUALS/R58-A-STAGE.json',old['residualInventory']]}
# The crosswalk is a frozen baseline. Current corrected bindings live here only.
for fid,aid in [('FC-BFF7B3D78C','AUX-66CAF65E3790'),('FC-E1A3C58BBB','AUX-6928C407343E')]:
 f,a=ix[fid],ix[aid];f['runtimeBindings']=copy.deepcopy(a['runtimeBindings']);f['bindingStatus']='EXISTING_DECLARATION_LOCATED_NO_NEW_RUNTIME_OBJECT';f['requiredChildIds']=list(dict.fromkeys(f['requiredChildIds']+[aid]));a['runtimeInstanceKey']=a['runtimeBindings'][0]['ref'];a['boundPhysicalParent']=fid;a['bindingStatus']='EXISTING_RUNTIME_DECLARATION_RELATED_NOT_ADDITIONAL_BUILDING';a['typedParentReferences']=[{'id':fid,'relation':'same-existing-physical-object-declaration-audit','countsAsAdditionalBuilding':False}];a['entityCountStatus']='EXISTING_DECLARATION_AUDIT_NOT_ANOTHER_BUILDING';f['bindingCorrection']={'at':now,'reason':'Actual existing helper/metadata, not a newly proposed duplicate. Physical historical positioning remains fitted.','evidence':'data/zones/outer-west.json'}
d=ix['FC-07BD73D61B'];d['runtimeBindings']=[{'ref':'src/scene/palace/special/SouthWaterSystem.js#southWaterProfile:duanhong','instanceKey':'duanhong','bindingStatus':'EXISTING_CONSTRUCTOR_LOCATED_COMPONENT_PROBE_PENDING'}];d['runtimeInstanceKey']='duanhong';d['bindingStatus']='EXISTING_GENERATED_BRIDGE_NOT_NEW_GEOMETRY';d['nextAction']='Inspect existing rendered bridge; keep its independent photo scope, do not clone one observed lion onto every post or introduce an unverified global support primitive.'
# Twelve declaration audits are physically in H/K, despite sharing outer-west.
migrations={13:('K','FC-E997E3CC58'),21:('K','FC-E997E3CC58'),23:('K','FC-B9B85B682E'),26:('K','FC-B9B85B682E'),27:('K','FC-B9B85B682E'),28:('K','FC-B9B85B682E'),38:('H','FC-DA597AAE85'),42:('H','FC-C7765A0D84'),46:('K','FC-83D425C911'),48:('K','FC-83D425C911'),51:('K','FC-AAD07DE044'),53:('K','FC-AAD07DE044')};moved=[]
for item in q['items']:
 if item['section']!='C' or not item['id'].startswith('AUX-'):continue
 ref=item['runtimeBindings'][0]['ref'];n=int(ref.rsplit('/',1)[-1])
 if n not in migrations:continue
 section,parent=migrations[n];record={'id':item['id'],'from':'C','to':section,'declaration':ref,'parent':parent,'basis':'Existing courtyard name/bounds or hall inside those bounds; not a claim about unnamed hall historical identity.','runtimeChanged':False};moved.append(record);item['section']=section;item['release']=f'R{58+ord(section)-65}-{section}';item['sectionAssignment']={'status':'EXISTING_PHYSICAL_AREA_OWNER_CORRECTION','history':[record]};item['typedParentReferences']=[{'id':parent,'relation':'existing-declaration-within-retained-courtyard-envelope','physicalIdentityVerified':False}];ix[parent]['requiredChildIds']=list(dict.fromkeys(ix[parent]['requiredChildIds']+[item['id']]))
(D/'C-REVIEW/DECLARATION-OWNER-CORRECTIONS.json').write_text(json.dumps({'corrections':moved,'remainingCrossBoundaryAudit':'AUX-5C13E57EB7B5 west passage region remains explicitly unresolved; do not guess a historical room identity.','baselineCrosswalkUnchanged':True,'runtimeChanges':0},ensure_ascii=False,indent=2)+'\n')
# Bind viewed source evidence without rewriting the original input captions.
viewed={'FC-A92C708D28':['interior'],'FC-6B7C231BFD':['exterior'],'FC-07BD73D61B':['exterior'],'FC-FA7F5D119E':['exterior','interior'],'FC-77E2C07341':['exterior'],'FC-32DB044BB1':['exterior']}
for fid,sides in viewed.items():
 for side in sides:
  f=ix[fid]['facets'][side];f['status']='SOURCED';f['currentCycleReview']='SOURCED';f['sourceReinspection']={'actuallyViewed':True,'at':now,'evidence':'docs/photo-fidelity/C-REVIEW/SOURCES-VIEWED.json','sourcePhotoDate':None,'wholeObjectCoverage':False};ix[fid]['sourceEvidence'][side]['currentCycleActuallyViewed']=True
w=ix['FC-77E2C07341'];f=w['facets']['exterior'];f.update(status='PARTIAL',currentCycleReview='PARTIAL');f['visualEvidence'].update(before='reports/r60-c-stage/before/wuying-gate-south.png',after='reports/r60-c-stage/windows-rails-03/wuying-gate-south.png',referenceComparison='docs/photo-fidelity/C-REVIEW/START.md',browserRun=None)
for a in f['features']:
 if a['id'] in ['doors_windows_openings_walls_screens','terrace_steps_imperial_ramp_rails_posts']:a.update(status='PARTIAL',acceptedScope=None,implementedScope='Two fitted closed south windows, two explicitly moved end-wall proxies, and four plain south rail runs around original stair apertures only. Fine carving, unobserved sides and metric facade proportions unresolved.')
w['actualChanges'].append({'release':'R60-C','scope':'WUYING_TWO_SOUTH_WINDOWS_AND_FOUR_PLAIN_RAIL_RUNS','evidence':'reports/r60-c-stage/','wholeObjectAccepted':False});w['sourceEvidence']['exterior']['captionCorrection']='The second input link labelled 武英殿 actually shows 武英门 plaque close-up; never use it as main-hall facade evidence.'
y=ix['FC-A92C708D28'];f=y['facets']['interior'];f.update(status='PARTIAL',currentCycleReview='PARTIAL');f['visualEvidence'].update(before='reports/r60-c-stage/before/yude-closed-bath-diagnostic.png',after='reports/r60-c-stage/dome-courses-01/yude-closed-bath-diagnostic.png',referenceComparison='docs/photo-fidelity/C-REVIEW/START.md',browserRun=None)
for a in f['features']:
 if a['id']=='ceilings_caissons_frames_paint_screens_fixed_joinery':a.update(status='PARTIAL',acceptedScope=None,implementedScope='Existing inward cap only gains procedural fitted brick-course albedo; geometry, UVs, oculus, closed access and all navigation unchanged. Not full bath restoration.')
y['actualChanges'].append({'release':'R60-C','scope':'Y U D E'.replace(' ', '')+'_EXISTING_DOME_BRICK_COURSES_ONLY','evidence':'reports/r60-c-stage/yude-dome-final-tests-03.txt','wholeObjectAccepted':False})
q['progressHistory'].append({'at':now,'internalBatch':'R60-C-1','action':'Adopt all C17, correct three existing-runtime bindings and twelve cross-area declaration owners without new runtime objects. Two windows, four plain rail runs and existing bath dome joints implemented with local tests; cumulative world and browser remain pending.','browserAccepted':False,'wholeC17Accepted':False})
for r in q['releasePlan']:
 r['supplementaryRuntimeIds']=[x['id'] for x in q['items'] if x['section']==r['section'] and x['id'].startswith('AUX-')]
 if r['section']=='B':r['status']='FUNCTIONAL_STAGE_DELIVERY_NOT_FULL_ACCEPTANCE'
 if r['section']=='C':r['status']='IN_PROGRESS'
q['summary']=summarize(q);write_queue(q,expected_raw_sha256=rawhash)
for r in q['releasePlan']:
 path=D/'RELEASES'/f"{r['release']}.json";data=json.loads(path.read_text());data['release']=r;data['objects']=[x for x in q['items'] if x['section']==r['section']];path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
resume=D/'RESUME.md';archive=D/'RESUME-R59-STAGE.md';assert not archive.exists();archive.write_bytes(resume.read_bytes());resume.write_text('''# R60-C continuation

QUEUE.json and its selected verified generation are the only progress authority.
Use scripts/photo-fidelity/queue_storage.py; RELEASES are derived snapshots.
The complete MASTER-PROMPT.md remains unchanged.

Base is local frozen R59 44ba4706a2088b6a4105d13cf3936cced125a880, tree
93e8d5b5496d935c8e4906200bdf14f5085b75a7. Remote R59 and its R58 parent remain
pending verified receipts. Never substitute local commit IDs for remote parents.
R58/R59 are stage deliveries, not full A/B acceptance. Preserve both residuals
and RESUME-R58-STAGE.md / RESUME-R59-STAGE.md.

All C17 original identities remain required, with both facets and all required
children. Twelve code-zone outer-west audits belong physically to H/K; their
stable IDs and parent obligations remain. Seven C auxiliary audits remain, one
cross-boundary passage unresolved. Hengshou/connector/Duanhong already exist:
new research bindings do not add runtime buildings or duplicate geometry.

First local batch: two Wuying south end windows (rejected old mid-depth prototype
retained), four plain south rail runs around the three original stair gaps, and
brick-course albedo on the existing Yude inward dome. C-REVIEW/START.md records
fit/unknown boundaries. CPU images are intermediate real-model observations,
not browser/GPU/phone acceptance. The rear bath is still closed; its image is a
diagnostic viewpoint, never advertised as a visitor route.

Continue the complete C17 source/model/required-feature scan before declaring a
C stage ready. Existing R52 ceramics, terrace, R48 caisson and other sourced work
must not be rebuilt or reset. A/B residuals remain in the rolling queue. No
ACCEPTED claim without the master's actual browser evidence and child gates.
Official images/PDFs stay private; publish links/hashes/observations only.
No main change, deployment, permission change or denied-browser retry here.
''')
print('R60 adopted; C17 +',q['summary']['sections']['C']['supplementaryAudits'],'auxiliary audits; original398 and154 retained')
