"""Single-authority F55/726 review, bounded deltas and retained unresolved work."""
from pathlib import Path
import json,sys,datetime,collections,hashlib
from urllib.parse import unquote
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R63-F' and 'completeScopeScan' not in q['integration'];raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
m=json.loads((D/'F-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json').read_text());six=json.loads((D/'F-REVIEW/SIX-COURTS-AUDIT.json').read_text());yang=json.loads((D/'F-REVIEW/YANGXIN-AUDIT.json').read_text());views=json.loads((D/'F-REVIEW/SOURCES-VIEWED.json').read_text());idx={i['id']:i for i in q['items']};original=[i for i in q['items'] if i['section']=='F' and i['id'].startswith('FC-')];matrix={i['id']:i for i in m['objects']};assert set(matrix)=={i['id'] for i in original} and len(original)==55
# Retain original binding history. A region and its existing hall are not two physical buildings.
for i in original:
 i['runtimeBindingHistoryR63']=i.get('runtimeBindings',[]);i['currentCycleIdentityReview']={'at':now,'status':matrix[i['id']]['bindingStatus'],'evidence':'F-REVIEW/SIX-COURTS-AUDIT.json' if i['id'] in {r['id'] for r in six['objects']} else 'F-REVIEW/YANGXIN-AUDIT.json','physicalIdentityAccepted':False};i['currentCycleAccepted']=False
front=idx['FC-5D6B1C3547'];region=next(b for b in front['runtimeBindings'] if b['kind']=='region');front['runtimeBindings']=[b for b in front['runtimeBindings'] if b['kind']=='hall'];idx['FC-17D883BCE6']['runtimeBindings']=[{**region,'role':'AGGREGATE_REGION_NOT_ADDITIONAL_PHYSICAL_BUILDING'}]
idx['FC-17D883BCE6']['entityCountStatus']='AGGREGATE_OF_REQUIRED_CHILDREN_NOT_SECOND_HALL'
idx['FC-79B3D4D2CE']['runtimeBindings']=[{'ref':'data/zones/west-six.json#/items/31','kind':'existing_component','role':'SAME_HOST_NORTH_STAGE_COMPONENT','componentRole':'r48-tiyuan-north-stage','physicalIdentityVerified':False,'bindingStatus':'ACTUAL_DISPATCH_COMPONENT_NOT_DUPLICATE_BUILDING'}]
for id in ['FC-3A99A2D3C9','FC-F23666ABA2']:idx[id]['entityCountStatus']='HISTORICAL_LOCATION_ONLY_ACTUAL_ZERO_MESH_NOT_TO_REBUILD'
for i in original:
 children=[j['id'] for j in original if i['id'] in j.get('parentCandidates',[])];i['requiredChildIds']=sorted(set(i.get('requiredChildIds',[])+children))
 i['aggregationBoundary']='Required-child evidence aggregation only; parentCandidates are not physical ownership acceptance or permission to duplicate runtime entities.'
# Local source observations update only their documented subjects, never an entire panorama.
sp=D/'SOURCES.json';sources=json.loads(sp.read_text());byurl={unquote(s['url']):s for s in sources['sources']}
for v in views['sources']:
 u=v['url'];key=unquote(u)
 if key not in byurl:
  r={'id':'SRC-'+hashlib.sha256(u.encode()).hexdigest()[:12].upper(),'url':u,'kind':'image','photographedAt':None,'photographedAtStatus':'UNSTATED','pagePublishedAt':None,'urlPathDateNotPhotographDate':True,'planningPassViewStatus':'NOT_OPENED','cache':None,'references':[]};sources['sources'].append(r);byurl[key]=r
 r=byurl[key];r['currentCycleR63']={'actualPixelsViewed':True,'imageSha256':v['sha256'],'scope':v.get('viewBoundary',v.get('observations',v.get('subject',''))),'evidence':'F-REVIEW/SOURCES-VIEWED.json','full360Viewed':False,'targetDateConfirmed':False,'publicReferenceCopy':False}
 for ref in r['references']:
  if ref.get('objectId') in idx and idx[ref['objectId']]['section']=='F' and ref.get('facet') in ['interior','exterior']:
   ev=idx[ref['objectId']]['sourceEvidence'][ref['facet']];ev['actualSourceObservationsR63']=ev.get('actualSourceObservationsR63',[])+[{'sourceId':r['id'],'scope':r['currentCycleR63']['scope']}]
sanxi=next(r for r in sources['sources'] if '1-cPnefIMuK313' in r['url']);sanxi['references'].append({'objectId':'FC-DC9C591F0F','facet':'interior','label':'三希堂 readable plaque and bounded room view','inputDeclaredEvidence':'R63_ACTUAL_OFFICIAL_IMAGE_IDENTIFIED_NOT_COMPLETE_ROOM'})
ev=idx['FC-DC9C591F0F']['sourceEvidence']['interior'];ev['originalInputStatusPreservedR63']=ev['inputStatus'];ev['sourceIds']=sorted(set(ev['sourceIds']+[sanxi['id']]));ev['supplementaryEvidenceStatusR63']='ACTUAL_IMAGE_IDENTIFIED_READABLE_SANXITANG_PLAQUE';ev['actualSourceObservationsR63']=[{'sourceId':sanxi['id'],'scope':'Readable 三希堂 plaque with limited kang/canopy/desk view; not complete room, target date unknown.'}]
sp.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
partial={'FC-0B25381D42':{'E2':'Existing roof only changed to photo-supported lower hips and upper gables. Conflicting official hard-gable text retained; dimensions and rear view unresolved.','E4':'Four existing south fields now have high sills, short upper rectangular lattice and lower two-light glazing; opening pose and dimensions fitted.'},'FC-A7ECBBD837':{'E4':'Four existing south fields now have high sills, diamond upper lattice and lower three-light glazing; original doors and physics retained.'},'FC-3122B6472E':{'I3':'One central low wood footstool only; five actual solids, B and real S separate floor contacts. Higher flank tables remain an engineering/route residual.','I6':'Only proven missing low footstool corrected, not complete furniture inventory.'}}
records=[]
for i in original:
 row=matrix[i['id']];features={f['featureId']:(k,f) for k,f in row['features'].items()};p=partial.get(i['id'],{});sides={}
 for side,facet in i['facets'].items():
  for f in facet['features']:
   label,r=features[f['id']];flags=r['flags'];status='DIFFED' if any(x in flags for x in 'DRLO') else 'BLOCKED_SOURCE' if 'N' in flags else 'SOURCED'
   if side=='interior' and 'N'in flags and 'D'not in flags:status='BLOCKED_SOURCE'
   if i['id']=='FC-DC9C591F0F' and side=='interior':status='DIFFED'
   if label in p:status='PARTIAL'
   f.update(status=status,currentCycleAccepted=False,acceptedScope=None,scopeScanComplete=True,reviewNote=r['finding'],residualAction=r['next'],sourceCoverageFlags=flags)
   if label in p:f['implementedScopeR63']=p[label]
  statuses=[f['status'] for f in facet['features']];status='PARTIAL' if 'PARTIAL'in statuses else 'DIFFED' if 'DIFFED'in statuses else 'BLOCKED_SOURCE' if 'BLOCKED_SOURCE'in statuses else 'SOURCED'
  facet.update(status=status,currentCycleReview=status,currentCycleScopeReview={'at':now,'scopeScanComplete':True,'evidence':'F-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','browserAcceptance':False,'wholeObjectAccepted':False});sides[side]=status
 i['nextAction']='Complete each remaining source/location/engineering/target-date feature and required child. Preserve existing implementation; no generic object substitutes for unknown inventory.'
 records.append({'id':i['id'],'name':i['name'],'statuses':sides,'boundedChanges':p,'requiredChildren':i['requiredChildIds'],'accepted':False})
auxrows=six['supplementaryRuntime']+[r for r in yang['objects'] if r['id'].startswith('AUX-')];assert len(auxrows)==26;unknown={3,9,10,16,17,25,26,32,33,41,42,48,49};aux=[]
for r in auxrows:
 i=idx[r['id']];assert i['section']=='F';refs=i['runtimeBindings'];n=int(refs[0]['ref'].rsplit('/',1)[1]);changed=n in unknown;i['currentCycleDeclarationReview']={'at':now,'evidence':'F-REVIEW/SIX-COURTS-AUDIT.json' if 'binding'in r else 'F-REVIEW/YANGXIN-AUDIT.json','identityAccepted':False,'existingDeclarationOnly':True,'inventory':'UNKNOWN' if changed else 'NOT_REVIEWED','knownEmpty':False,'presetUse':'UNVERIFIED','roomBoundaries':'NOT_VALIDATED','genericFurnitureWithheld':changed};i['entityCountStatus']='EXISTING_DECLARATION_AUDIT_NOT_ADDITIONAL_PHYSICAL_BUILDING'
 for side,f in i['facets'].items():f.update(status='PARTIAL' if changed and side=='interior' else 'DIFFED',currentCycleReview='PARTIAL' if changed and side=='interior' else 'DIFFED',currentCycleAccepted=False)
 aux.append({'id':i['id'],'ref':refs[0]['ref'],'unknownInventoryWithheld':changed,'identityAccepted':False,'knownEmpty':False})
assert sum(r['unknownInventoryWithheld'] for r in aux)==13
for e in q['expansionTasks']:
 if e['id']=='EXPAND-06':e.setdefault('sectionReviews',{})['F']={'at':now,'status':'DIFFED','enumerationComplete':False,'declarationAudits':26,'nextAction':'Locate all same-court side/rear/ear buildings, walls and passages before adding physical entities;13 anonymous declarations remain unverified names, not13 newly found historical rooms.'};e['status']='DIFFED';e['blocksFullAcceptance']=True
features=[f for i in original for facet in i['facets'].values() for f in facet['features']];assert len(features)==726 and all(f['status']!='UNREVIEWED' for f in features)
res={'release':'R63-F','stage':'COMPLETE_EXECUTABILITY_SCAN_WITH_FIVE_BOUNDED_WORK_ITEMS_NOT_FULL_ACCEPTANCE','scope':{'originalObjects':55,'requiredFeatures':726,'auxiliaryDeclarations':26,'featureStatuses':dict(collections.Counter(f['status'] for f in features)),'accepted':0},'objects':records,'auxiliaryAudits':aux,'sourceImageRecords':18,'sourceImageCoverage':'Only individually stated source subjects viewed. Capture dates, complete360 and full period inventories unknown.','knownEngineeringResiduals':['Tongdao conflicting official roof wording retained; roof metrics, back elevation and finer paint/cap geometry remain fitted.','Named rear-wing Pingkang/Yishou actual photos available but exact runtime binding/position unresolved; do not name or duplicate anonymous front-side declarations.','Tihe/Tiyuan inherited R48 passages, tea pair, partitions and north stage retained; source-backed carving, window details and side connections remain partial.','Lijing western-display room is sourced but room boundaries/placement/date need resolution; not Cixi1884 inventory.','Yangxin missing south gate/rear central hall/connector, front side halls, Tishun/Yanxi ear halls require bounded plan/route design.','Qinzheng high flank stands are source-supported but conflict with inherited west access; this is engineering, not missing source.','Yangxin east S gauze/blue screen/window-kang and Sanxi fine inventory remain partial; no duplicate B overlay.','Changchun R54 east alcove retained; west alcove, central furniture and mural details remain separate residuals.','All roof/decorative plaques/courtyard wells/ear-room/side-hall inventories and historical/modern/NPC layers need own sources and browser views.','Actual WebGL/browser/mobile visual and performance acceptance remains pending.'],'previousResiduals':q['integration']['retainedPreviousResiduals'],'runtimeAcceptance':'Independent frozen-world and compiled-entry verification recorded separately, not assumed by this scan.','publicReferenceImageCopies':0}
(D/'RESIDUALS/R63-F-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n');q['integration']['completeScopeScan']={'at':now,'originalObjects':55,'featureChecks':726,'auxiliaryAudits':26,'report':'F-REVIEW/REQUIRED-MATRIX-SNAPSHOT.md','residuals':'RESIDUALS/R63-F-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R63-F-COMPLETE-SCAN','action':'55objects/726features/26declarations reviewed; five bounded work items, all residuals retained. No whole-section or browser acceptance.'});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
p=D/'RELEASES/R63-F.json';r=json.loads(p.read_text());r['release']=next(x for x in q['releasePlan'] if x['section']=='F');r['objects']=[i for i in q['items'] if i['section']=='F'];p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps(res['scope']))
