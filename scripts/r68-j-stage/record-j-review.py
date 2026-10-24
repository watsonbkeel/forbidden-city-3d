"""Adopt J21 audit without converting source/model review into acceptance."""
from pathlib import Path
import sys,json,datetime,copy,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=D/'J-REVIEW'
sys.path.insert(0,str(P/'scripts/photo-fidelity'));from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R67-I';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
draft=json.loads((R/'REQUIRED-MATRIX-SNAPSHOT.json').read_text());records={r['id']:r for r in draft['records']};assert len(records)==21
ix={i['id']:i for i in q['items']};beforeIds=[i['id']for i in q['items']];old=copy.deepcopy(q['integration']);old.update(frozenLocalCommit='709cfa97d14f14efe801abd2f5735cda0c6aa59a',residualInventory='docs/photo-fidelity/RESIDUALS/R67-I-STAGE.json',accepted=False,remoteRecovery='MANAGED_SEPARATELY_DO_NOT_INFER_UPLOAD');q['completedStageHistory'].append(old)
q['integration']={'release':'R68-J','historicalPlanId':'R67-J','baseLocalCommit':old['frozenLocalCommit'],'baseRemoteStatus':'R66_R67_UPLOAD_RECOVERY_SEPARATE_NOT_ASSUMED','branch':'feat/r68-j-qianlong-garden-20261024','adoptedAt':now,'scope':'All 21 original J objects and 286 required features; seven bounded PARTIAL implementation scopes, no full J acceptance.','publicReferenceImageCopies':False,'stageStatus':'IN_PROGRESS','retainedPreviousResiduals':old['retainedPreviousResiduals']+[old['residualInventory']],'releaseCadence':'Local authorized development continues independently of remote recovery. Cumulative development branch only; user merges main.'}
# Parent candidates are text group memberships, never coordinates or new buildings.
migrations=[]
for patch in draft['identityPatchProposals']:
 i=ix[patch['id']];assert i['parentCandidates']==patch['beforeParentCandidates']
 prior={'parentCandidates':copy.deepcopy(i['parentCandidates']),'requiredChildIds':copy.deepcopy(i['requiredChildIds'])}
 i.update(parentCandidates=patch['parentCandidates'],parentResolution=patch['parentResolution'],physicalIdentityAccepted=False)
 # Group requiredChildIds remains a transitive master scope checklist, not a direct topology tree.
 migrations.append({'id':i['id'],'before':prior,'after':{'parentCandidates':i['parentCandidates'],'requiredChildIds':i['requiredChildIds']},'reason':patch['reason'],'physicalObjectsAdded':0,'physicalIdentityAccepted':False})
for observation in draft['preserveIdentityCandidates']:
 ix[observation['id']]['existingComponentObservation']={**observation,'physicalIdentityAccepted':False,'note':'Existing theatre component belongs to Juanqin; panorama paintings are not invented walkable room volume.'}
count=0
for ident,r in records.items():
 i=ix[ident];assert i['section']=='J'and i['name']==r['name']
 for side,d in r['facets'].items():
  f=i['facets'][side]
  if f['status']=='NOT_APPLICABLE':assert not d.get('features');continue
  oldfeatures={x['id']:x for x in f['features']};assert set(oldfeatures)=={x['id']for x in d['features']}
  for x in d['features']:
   assert x['status']!='ACCEPTED';oldfeatures[x['id']].update(x,reviewEvidence='J-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json',currentCycleAccepted=False,acceptedScope=None);count+=1
  f.update(status=d['status'],currentCycleReview=d['status'],currentCycleAccepted=False,currentCycleScopeReview={'at':now,'scopeScanComplete':True,'evidence':'J-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','browserAcceptance':False,'wholeObjectAccepted':False})
 i.update(scopeReviewCompleted=True,currentCycleAccepted=False,nextAction=r['remaining'] if isinstance(r['remaining'],str)else json.dumps(r['remaining'],ensure_ascii=False))
 i['sourceModelReviewR68']={'at':now,'currentModel':r['currentModel'],'sourceReviewEvidence':r['sourceReviewEvidence'],'accepted':False}
assert count==286
aux=[]
for i in q['items']:
 if i['section']!='J'or not i['id'].startswith('AUX-'):continue
 i['currentCycleDeclarationReview']={'at':now,'status':'DIFFED','identityAccepted':False,'existingDeclarationOnly':True,'scopeScanComplete':True,'navigationRetained':True,'evidence':'J-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','note':'Existing declaration audited separately from named master groups; not an extra verified palace or current inventory.'}
 for side,f in i['facets'].items():
  if f['status']!='NOT_APPLICABLE':f.update(status='DIFFED',currentCycleReview='DIFFED',currentCycleAccepted=False)
 aux.append(i['id'])
assert len(aux)==0
for plan in q['releasePlan']:
 if plan['section']=='J':plan.update(status='FUNCTIONAL_STAGE_IN_PROGRESS_NOT_FULL_ACCEPTANCE',executionRelease='R68-J',partialPublicationLabel='R68-J bounded cumulative stage;286 required features remain unaccepted')
assert {f['status'] for r in records.values() for fac in r['facets'].values() for f in fac['features']} <= {'DIFFED','PARTIAL','BLOCKED_SOURCE'}
counts=collections.Counter(f['status']for i in q['items']if i['section']=='J'and i['id'].startswith('FC-')for facet in i['facets'].values()for f in facet.get('features',[]))
res={'release':'R68-J','accepted':False,'scope':{'originalObjects':21,'requiredFeatures':286,'auxiliaryDeclarations':0,'statuses':dict(counts)},'identityMigrations':migrations,'objects':[{'id':r['id'],'name':r['name'],'remaining':r['remaining'],'accepted':False}for r in records.values()],'previousResiduals':q['integration']['retainedPreviousResiduals'],'verificationBoundary':'CPU engineering and exact changed-input checks only; browser/GPU, physical phone, full continuous route and current exhibition inventories remain unverified.'}
(D/'RESIDUALS/R68-J-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':21,'featureChecks':286,'auxiliaryAudits':0,'report':'J-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','residuals':'RESIDUALS/R68-J-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R68-J-ALL21-REVIEW','action':'Reviewed 21 objects / 286 features; 33 unsupported meshes and 30 dedicated colliders withheld, bounded finial and south-plinth visual fits. No new unlocated entities or acceptance.'});q['summary']=summarize(q);assert beforeIds==[i['id']for i in q['items']];write_queue(q,expected_raw_sha256=raw)
plan=next(r for r in q['releasePlan']if r['section']=='J');p=D/('RELEASES/'+plan['release']+'.json');data=json.loads(p.read_text());data.update(release=plan,objects=[i for i in q['items']if i['section']=='J']);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(R/'IDENTITY-MIGRATIONS.json').write_text(json.dumps(migrations,ensure_ascii=False,indent=2)+'\n');print(json.dumps(res['scope']))
