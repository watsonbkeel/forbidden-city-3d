"""Adopt I29 audit without converting source/model review into acceptance."""
from pathlib import Path
import sys,json,datetime,copy,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=D/'I-REVIEW'
sys.path.insert(0,str(P/'scripts/photo-fidelity'));from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R66-H';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
draft=json.loads((R/'REQUIRED-MATRIX-SNAPSHOT.json').read_text());records={r['id']:r for r in draft['records']};assert len(records)==29
ix={i['id']:i for i in q['items']};beforeIds=[i['id']for i in q['items']];old=copy.deepcopy(q['integration']);old.update(frozenLocalCommit='838945e3aa14983cfdbeee4ae2b25596271d6496',residualInventory='docs/photo-fidelity/RESIDUALS/R66-H-STAGE.json',accepted=False,remoteRecovery='MANAGED_SEPARATELY_DO_NOT_INFER_UPLOAD');q['completedStageHistory'].append(old)
q['integration']={'release':'R67-I','historicalPlanId':'R66-I','baseLocalCommit':old['frozenLocalCommit'],'baseRemoteStatus':'R66_UPLOAD_RECOVERY_SEPARATE_NOT_ASSUMED','branch':'feat/r67-i-ningshou-fidelity-20261024','adoptedAt':now,'scope':'All29 original objects,386 required features and17 existing supplementary declarations; bounded implementation, no full I acceptance.','publicReferenceImageCopies':False,'stageStatus':'IN_PROGRESS','retainedPreviousResiduals':old['retainedPreviousResiduals']+[old['residualInventory']],'releaseCadence':'Local authorized development continues independently of remote recovery. Cumulative development branch only; user merges main.'}
# These are text-identity repairs, not new physical objects or coordinate claims.
parent='FC-ABA67505AC';south='FC-2D04E0B566';north='FC-2A2E866229';migrations=[]
for ident in [south,north]:
 i=ix[ident];prior={'parentCandidates':copy.deepcopy(i['parentCandidates']),'requiredChildIds':copy.deepcopy(i['requiredChildIds'])};i['parentCandidates']=[parent];i['requiredChildIds']=[c for c in i['requiredChildIds']if c not in [south,north]];i['parentResolution']='MASTER_GROUP_MEMBERSHIP_ONLY_NOT_PHYSICAL_ENUMERATION';i['physicalIdentityAccepted']=False;migrations.append({'id':ident,'before':prior,'after':{'parentCandidates':i['parentCandidates'],'requiredChildIds':i['requiredChildIds']},'physicalObjectsAdded':0})
for ident in [south,north]:
 if ident not in ix[parent]['requiredChildIds']:ix[parent]['requiredChildIds'].append(ident)
for ident in ['FC-0D5F3D5831','FC-9059FCD5EB']:
 ix[ident]['currentCycleIdentityReview']={'at':now,'physicalIdentityAccepted':False,'candidateRepositoryId':'place-ningshou-0d5f3d5831','doNotMergeBeforeLocation':True,'reason':'Four-court group and second-court named hall cannot both be accepted from one five-bay runtime candidate.'}
ix['FC-4B61FC64EC']['existingComponentObservation']={'hostId':'FC-15C0D4E6BC','code':'src/scene/palace/special/RemainingNingshouHalls.js#buildJingqi','role':'jingqi-concave-stage','newPhysicalObject':False,'physicalIdentityAccepted':False,'note':'Existing three-slab component is not absent. Its historical painted backdrop cannot become an invented current walkable room.'}
count=0
for ident,r in records.items():
 i=ix[ident];assert i['section']=='I'and i['name']==r['name']
 for side,d in r['facets'].items():
  f=i['facets'][side]
  if f['status']=='NOT_APPLICABLE':assert not d.get('features');continue
  oldfeatures={x['id']:x for x in f['features']};assert set(oldfeatures)=={x['id']for x in d['features']}
  for x in d['features']:
   assert x['status']!='ACCEPTED';oldfeatures[x['id']].update(x,reviewEvidence='I-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json',currentCycleAccepted=False,acceptedScope=None);count+=1
  f.update(status=d['status'],currentCycleReview=d['status'],currentCycleAccepted=False,currentCycleScopeReview={'at':now,'scopeScanComplete':True,'evidence':'I-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','browserAcceptance':False,'wholeObjectAccepted':False})
 i.update(scopeReviewCompleted=True,currentCycleAccepted=False,nextAction=r['remaining'] if isinstance(r['remaining'],str)else json.dumps(r['remaining'],ensure_ascii=False))
 i['sourceModelReviewR67']={'at':now,'currentModel':r['currentModel'],'sourceReviewEvidence':r['sourceReviewEvidence'],'accepted':False}
assert count==386
aux=[]
for i in q['items']:
 if i['section']!='I'or not i['id'].startswith('AUX-'):continue
 i['currentCycleDeclarationReview']={'at':now,'status':'DIFFED','identityAccepted':False,'existingDeclarationOnly':True,'scopeScanComplete':True,'navigationRetained':True,'evidence':'I-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','note':'Existing declaration audited separately from named master groups; not an extra verified palace or current inventory.'}
 for side,f in i['facets'].items():
  if f['status']!='NOT_APPLICABLE':f.update(status='DIFFED',currentCycleReview='DIFFED',currentCycleAccepted=False)
 aux.append(i['id'])
assert len(aux)==17
for plan in q['releasePlan']:
 if plan['section']=='I':plan.update(status='FUNCTIONAL_STAGE_IN_PROGRESS_NOT_FULL_ACCEPTANCE',executionRelease='R67-I',partialPublicationLabel='R67-I bounded cumulative stage;386 required features remain unaccepted')
counts=collections.Counter(f['status']for i in q['items']if i['section']=='I'and i['id'].startswith('FC-')for facet in i['facets'].values()for f in facet.get('features',[]))
res={'release':'R67-I','accepted':False,'scope':{'originalObjects':29,'requiredFeatures':386,'auxiliaryDeclarations':17,'statuses':dict(counts)},'identityMigrations':migrations,'objects':[{'id':r['id'],'name':r['name'],'remaining':r['remaining'],'accepted':False}for r in records.values()],'previousResiduals':q['integration']['retainedPreviousResiduals'],'verificationBoundary':'CPU engineering and exact changed-input checks only; browser/GPU, physical phone, full continuous route and current exhibition inventories remain unverified.'}
(D/'RESIDUALS/R67-I-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':29,'featureChecks':386,'auxiliaryAudits':17,'report':'I-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','residuals':'RESIDUALS/R67-I-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R67-I-ALL29-REVIEW','action':'Reviewed29/386features/17existing declarations; bounded source fits and exact UNKNOWN withholding. No new unlocated entities or acceptance.'});q['summary']=summarize(q);assert beforeIds==[i['id']for i in q['items']];write_queue(q,expected_raw_sha256=raw)
plan=next(r for r in q['releasePlan']if r['section']=='I');p=D/('RELEASES/'+plan['release']+'.json');data=json.loads(p.read_text());data.update(release=plan,objects=[i for i in q['items']if i['section']=='I']);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(R/'IDENTITY-MIGRATIONS.json').write_text(json.dumps(migrations,ensure_ascii=False,indent=2)+'\n');print(json.dumps(res['scope']))
