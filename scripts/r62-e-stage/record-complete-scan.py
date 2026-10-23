"""Apply the complete E review to the single canonical queue; preserve every task."""
from pathlib import Path
import json,sys,datetime,collections,hashlib
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R62-E';assert 'completeScopeScan' not in q['integration'];now=datetime.datetime.now(datetime.timezone.utc).isoformat();raw=json.loads((D/'QUEUE.json').read_text())['rawSha256']
a=json.loads((D/'E-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json').read_text());identity=json.loads((D/'E-REVIEW/IDENTITY-SNAPSHOT.json').read_text());views=json.loads((D/'E-REVIEW/SOURCES-VIEWED.json').read_text());idx={i['id']:i for i in q['items']};matrix={i['id']:i for i in a['objects']};ident={i['id']:i for i in identity['objects']};original=[i for i in q['items'] if i['section']=='E' and i['id'].startswith('FC-')];assert set(matrix)==set(ident)=={i['id'] for i in original};assert len(original)==61
# Physical model vs region / aggregate must not become a duplicate building.
byref={r['ref']:r for i in q['items'] for r in i.get('runtimeBindings',[]) if r.get('inventoryId')}
for i in original:
 r=ident[i['id']];i['currentCycleIdentityReview']={'at':now,'status':r['bindingStatus'],'entityBoundary':r['entityBoundary'],'evidence':'E-REVIEW/IDENTITY-SNAPSHOT.json','physicalIdentityAccepted':False,'priorWork':r['priorWork']}
 i['runtimeBindingHistoryR62']=i.get('runtimeBindings',[])
 candidates=[]
 for b in r['bindings']:
  existing=byref.get(b['ref'],{});c={**existing,**b,'bindingStatus':'ISOLATED_MODEL_CANDIDATE_NOT_SURVEY_ACCEPTANCE','physicalIdentityVerified':False};c.pop('runtimeProof',None);candidates.append(c)
 i['runtimeBindings']=candidates;i['bindingStatus']=r['bindingStatus'];i['currentCycleAccepted']=False
# Source relation is adjacency, not ownership. No runtime object moves.
tq=idx['FC-7CE51EACB4'];tq['relationshipCorrectionR62']={'oldParentCandidates':tq['parentCandidates'],'reason':'Official text says west neighbor Jingyang; adjacency is not parent ownership. Entrance image is not the main hall.'};tq['parentCandidates']=[];tq['adjacentCandidates']=[{'id':'FC-9DA5992A78','relation':'WEST_NEIGHBOR_OF_TIANQIONG','source':'https://www.dpm.org.cn/explore/building/236542.html'}];tq['parentResolution']='NEIGHBOR_NOT_PARENT; COMPOUND_BOUNDARY_UNRESOLVED'
idx['FC-DD68A90CC7']['parentCandidates']=['FC-8D4739DF1E']
# Preserve all original FCs. Parent report must wait for each named child, but
# a main hall remains one existing shell, not a second generated compound.
for parent in original:
 children=[i['id'] for i in original if parent['id'] in i.get('parentCandidates',[])]
 if children:parent['requiredChildIds']=sorted(set(parent.get('requiredChildIds',[])+children));parent['aggregationBoundary']='Main structure / compound name may be dual-use; child requirements aggregate evidence, not an additional physical building.'
fx=idx['FC-D8AEF2E8A9'];fx['requiredChildIds']=sorted(set(fx['requiredChildIds']+['AUX-BF1091B523A8']));fx['aggregationBoundary']='Front hall model and named precinct requirement are distinct scopes. Gate and existing rear hall child remain required; connector/inventory unresolved.'
for k in ['FC-C716A8E34A','FC-8D4739DF1E']:
 idx[k]['entityCountStatus']='UNRESOLVED_MAIN_HALL_AND_COMPOUND_DUAL_SCOPE_NOT_ADDITIONAL_MODEL';idx[k]['sourcePropagationAllowed']=False
idx['FC-C716A8E34A']['sourceEvidence']['interior']['scopeLimitR62']='Linked Weiyu image covers one local room only, not Yuqing main hall or complete compound.'
idx['FC-59F7BB24CB']['sourceConflictR62']={'status':'UNRESOLVED','claims':['official body text: east ear room','official glossary: east secondary bay','other research: connected baoxia context'],'effect':'Do not infer exact room axis, invent passage, or duplicate Jide rear hall from this local round-door image.'}
idx['FC-CF00F15FA8']['sectionBoundaryR62']='Retain original E task ID/edition assignment, but official Zhongsi location belongs to west-six context; do not create it at an arbitrary east-six anchor.'
# Local accepted scope means bounded implementation, never full visual acceptance.
partial={
 'FC-D8AEF2E8A9':{'E2':'Front nine-bay double-eave correction; rear nine-bay single-eave correction is separate required child. Roof details/complete envelope still fitted.','E3':'Front actual9bays20columns, retained footprint; spacing not surveyed.','E4':'Only four front outer sill fields; inherited generic lattice remains partial.','E7':'Whole front nameboard fitted between actual eave surfaces; carving and Manchu text are not reproduced.'},
 'FC-D2B7EEC1F3':{'E6':'Six plain curved canopy shoulders added to existing three-bay host. Rest of baoxia framing/carving remains unresolved.'},
 'FC-8B02DC003C':{'E3':'Existing rear study7→5bays with12actualcolumns; no new building.','E4':'Four high-sill straight/stepped-window fields, pattern repetitions/metric/color fitted.'},
 'FC-6AF6DCFC02':{'E4':'Four front high-sill windows: broad square grid and narrow diamond side fields; original north glazing retained.','E2':'Only four-corner five walking beasts plus separate immortal, actual low path; species/carving and roof paint remain simplified.'},
 'FC-479353AF2C':{'E2':'Only four-corner five walking beasts plus separate immortal, actual low path; whole roof remains partial.'},
 'FC-2E5B97AD6F':{'E4':'Existing rear hall four south high-sill windows split short upper grille and pale lower fields; not the main hall glazing.'},
}
required_files=['FengxianRearProfile.js','JingrenRearWindows.js','EastFiveRoofBeasts.js','EastUnknownAnnexInventory.js']
for n in required_files:assert (P/'src/scene/palace/special'/n).exists(),n
unknown_front={2,9,16,30,37};unknown_annex={3,4,5,10,11,12,17,18,19,24,25,26,31,32,33,38,39,40,44,45,46,47,48,54}
records=[]
for i in original:
 m=matrix[i['id']];features={f['featureId']:(label,f) for label,f in m['features'].items()};refs={int(b['ref'].rsplit('/',1)[1]) for b in i['runtimeBindings'] if b['ref'].startswith('data/zones/east-six.json#/items/') and b.get('role')=='PHYSICAL_MODEL_CANDIDATE'}
 p=partial.get(i['id'],{}).copy()
 if refs&(unknown_front|unknown_annex):p['I6']='Only unsupported placeholder furniture and its dedicated collisions/covers withheld; UNKNOWN, not a historic/current empty-room claim. Real inventory remains unverified.'
 sides={}
 for side,facet in i['facets'].items():
  for f in facet['features']:
   label,row=features[f['id']];flags=row['flags'];status='DIFFED' if ('D'in flags or 'L'in flags or 'R'in flags or 'O'in flags or 'A'in flags) else 'BLOCKED_SOURCE' if 'N'in flags else 'SOURCED'
   if side=='interior' and 'N'in flags and 'D'not in flags:status='BLOCKED_SOURCE'
   if label in p:status='PARTIAL'
   f.update(status=status,acceptedScope=None,currentCycleAccepted=False,reviewNote=row['finding'],residualAction=row['next'],sourceCoverageFlags=flags,scopeScanComplete=True)
   if label in p:f['implementedScopeR62']=p[label];f['residualAction']='Bounded local change made: '+p[label]+' Remaining source/model differences stay open; actual browser comparison required.'
  statuses=[f['status'] for f in facet['features']];status='PARTIAL' if 'PARTIAL'in statuses else 'DIFFED' if 'DIFFED'in statuses else 'BLOCKED_SOURCE' if 'BLOCKED_SOURCE'in statuses else 'SOURCED'
  facet.update(status=status,currentCycleReview=status,currentCycleScopeReview={'at':now,'scopeScanComplete':True,'evidence':'E-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','browserAcceptance':False,'wholeObjectAccepted':False},nextAction='Complete the remaining individually listed engineering/source/location/target-date checks; CPU evidence is not browser acceptance.')
  sides[side]=status
 i['nextAction']='Continue open feature-level differences and required children, without duplicating existing profiles or inferring unsupported inventory.'
 records.append({'id':i['id'],'name':i['name'],'statuses':sides,'bindingStatus':i['bindingStatus'],'boundedChanges':p,'requiredChildren':i['requiredChildIds'],'accepted':False})
aux=[]
for r in identity['auxiliaryAudit']:
 i=idx[r['id']];assert i['section']=='E';i['currentCycleDeclarationReview']={**r,'applied':True,'physicalIdentityAccepted':False,'at':now};i['declarationRelation']=r['relation'];i['proposedMergedInto']=r['proposedMergedInto'];i['entityCountStatus']='EXISTING_DECLARATION_AUDIT_NOT_ADDITIONAL_PHYSICAL_BUILDING'
 n=int(r['ref'].rsplit('/',1)[1]);changed=n in unknown_annex
 for side,f in i['facets'].items():f.update(status='PARTIAL' if changed and side=='interior' else 'DIFFED',currentCycleReview='PARTIAL' if changed and side=='interior' else 'DIFFED',currentCycleScopeReview={'at':now,'declarationOnly':True,'knownEmpty':False,'inventory':'UNKNOWN' if changed else 'NOT_REVIEWED','physicalIdentityAccepted':False})
 if n==54:i['facets']['exterior'].update(status='PARTIAL',currentCycleReview='PARTIAL');i['currentCycleDeclarationReview']['rearProfile']='Nine-bay single-eave source text, existing envelope retained and fitted; front photo not used as rear evidence.'
 if r.get('parentCandidate'):i['parentCandidates']=[r['parentCandidate']]
 aux.append({'id':i['id'],'ref':r['ref'],'relation':r['relation'],'sameModelCandidate':r['proposedMergedInto'],'unknownInventoryWithheld':changed,'accepted':False})
for e in q['expansionTasks']:
 if e['id'] not in ['EXPAND-01','EXPAND-05','EXPAND-06']:continue
 e.setdefault('sectionReviews',{})['E']={'at':now,'status':'DIFFED','enumerationComplete':False,'declaredAudits':33 if e['id']=='EXPAND-06' else None,'nextAction':'Locate each courtyard well/pavilion/ear-room/gallery from own views; five placeholder halls do not represent five three-court compounds. No unbound instance is fabricated.'};e['status']='DIFFED';e['blocksFullAcceptance']=True
features=[f for i in original for v in i['facets'].values() for f in v['features']];assert len(features)==854 and len(aux)==33 and not any(f['status']=='UNREVIEWED' for f in features)
result={'release':'R62-E','stage':'COMPLETE_EXECUTABILITY_SCAN_WITH_BOUNDED_LOCAL_CHANGES_NOT_FULL_ACCEPTANCE','objects':records,'auxiliaryAudits':aux,'scope':{'originalObjects':61,'requiredFeatures':854,'exteriorFeatures':488,'interiorFeatures':366,'auxiliaryDeclarations':33,'applicableExpansionTasks':3,'featureStatuses':dict(collections.Counter(f['status'] for f in features)),'accepted':0},'sourceImageRecords':views['sourceCount'],'sourceImageCoverage':'Actual view restricted to per-image subject; whole panorama/date/full room inventory remains unconfirmed.','knownEngineeringResiduals':['Ten existing front side halls lack hard-gable end treatment; positional binding still provisional.','Chengqian front square/diamond windows and rear glazed rectangular windows; Zhongcui rear split windows/veranda.','Main temple ceilings, inner plaques, facade fine paint and lattice/inscriptions remain simplified or missing; own-room pictures required.','Fengxian entire terrace/rails/side flights/central ramp and front-rear connector remain incomplete; rear text correction does not validate facade/inventory.','Well pavilions/ear rooms/galleries have partial photos but unresolved unique site coordinates; no generic cloning.','Zhai/Yuqing/Tianqiong/Gates and ten rear side halls require physical binding/compound boundaries, not only map labels.','QianEast five placeholder halls are not five three-court compounds.','All real browser/GPU/mobile acceptance still pending.'],'previousResiduals':q['integration']['retainedPreviousResiduals'],'runtimeAcceptance':'Concentrated newly frozen world and compiled production checks are recorded separately, not presumed by this scan.','publicReferenceImageCopies':0}
(D/'RESIDUALS/R62-E-STAGE.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':61,'featureChecks':854,'auxiliaryAudits':33,'report':'E-REVIEW/REQUIRED-MATRIX-SNAPSHOT.md','residuals':'RESIDUALS/R62-E-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R62-E-COMPLETE-SCAN','action':'All61/854 source-model checks and33 declaration audits retained. Bounded geometry and unknown-inventory corrections; known engineering/location/source residuals explicit; no whole-section/browser acceptance.','wholeSectionAccepted':False});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
r=next(r for r in q['releasePlan'] if r['section']=='E');path=D/'RELEASES/R62-E.json';data=json.loads(path.read_text());data['release']=r;data['objects']=[i for i in q['items'] if i['section']=='E'];path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result['scope'],ensure_ascii=False))
