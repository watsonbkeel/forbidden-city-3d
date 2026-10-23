#!/usr/bin/env python3
import pathlib,json,hashlib,re,collections,datetime
from queue import validate_progress,summarize,load_queue
P=pathlib.Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity'
def rd(n):return json.loads((D/n).read_text())
q=load_queue(D/'QUEUE.json');c=rd('CROSSWALK.json');s=rd('SOURCES.json');raw=rd('BUILDING-REGISTER-FROM-MD.json');b=rd('BASELINE.json');checks=[]
def ck(name,condition):
 checks.append({'check':name,'passed':bool(condition)})
 if not condition:raise AssertionError(name)
ids=[x['id'] for x in q['items']];original=[x for x in q['items'] if x['id'].startswith('FC-')];ix={x['id']:x for x in q['items']};sourceids={a['id'] for a in s['sources']}
ck('398 unique original stable IDs',len(original)==398 and len(set(x['id'] for x in original))==398)
ck('Lossless original IDs and names preserved',[(x['id'],x['name']) for x in original]==[(x['id'],x['name']) for x in raw['losslessMarkdownRows']])
ck('All552 baseline task IDs retained and all current IDs unique',len(ids)>=552 and len(ids)==len(set(ids)) and len(q['baselineTaskIds'])==552 and set(q['baselineTaskIds']).issubset(ids))
ck('All13 exact original section counts',dict(collections.Counter(x['section'] for x in original))==dict(zip('ABCDEFGHIJKLM',[37,41,17,32,61,55,29,43,29,21,21,11,1])))
ck('7 explicit mandatory expansion tasks retained',len(q['expansionTasks'])==7 and all(e['blocksFullAcceptance'] for e in q['expansionTasks']))
ck('Every task has exterior and interior with valid state',all(set(x['facets'])=={'exterior','interior'} and all(f['status'] in q['statusVocabulary'] for f in x['facets'].values()) for x in q['items']))
ck('Every NOT_APPLICABLE has actual reason',all(f.get('notApplicableReason') for x in q['items'] for f in x['facets'].values() if f['status']=='NOT_APPLICABLE'))
ck('All89 prior registry records uniquely preserved',len(c['fidelityRecords'])==89 and len({x['repositoryId'] for x in c['fidelityRecords']})==89)
ck('All159 prior place records uniquely preserved',len(c['placeRecords'])==159 and len({x['repositoryId'] for x in c['placeRecords']})==159)
ck('Every legacy map resolves to an existing original ID',all(x['reviewObjectId'] in ix and x['reviewObjectId'].startswith('FC-') for x in c['fidelityRecords']+c['placeRecords']))
ck('All332 zone +14 layout +14 known constructs preserved',len(c['runtimeInventory'])==360 and sum(x['origin']=='zone-declaration' for x in c['runtimeInventory'])==332)
ck('All runtime declarations mapped or retained as unresolved',all(x['reviewObjectId'] in ix for x in c['runtimeInventory']))
ck('154 unresolved declaration tasks are not new building proposals',sum(x['id'].startswith('AUX') for x in q['items'])>=154 and all(x.get('isNewBuildingProposal') is False and x['entityId'] is None for x in q['items'] if x['id'].startswith('AUX')))
ck('Aggregates and subspaces never added as building entities',all(x['entityId'] is None for x in original if x['kind'] in ['aggregate_group','interior_subspace','historical_location','unresolved_identity','unresolved_label']))
ck('Physical palace/building total correctly unknown',q['summary']['physicalBuildingCount'] is None)
ck('All explicit child dependencies valid and nonself',all(ch in ix and ch!=x['id'] for x in q['items'] for ch in x.get('requiredChildIds',[])))
ck('All inherited evidence snapshot records preserved',len(rd('BASELINE-FIDELITY-SNAPSHOT.json')['snapshot']['buildings'])==89)
ck('Current-cycle review never clears original accepted flags',all(x.get('baselineProgressPolicy') for x in original if x.get('registryBindings')))
ck('All source references resolve',all(sid in sourceids for x in original for ev in x['sourceEvidence'].values() for sid in ev['sourceIds']) and all(sid in sourceids for x in original for sid in x['identitySourceIds']))
ck('Long panorama IDs remain exact URL strings',all(isinstance(x['url'],str) and not any(isinstance(v,(float,int)) for k,v in x.items() if k in ['vpId','sphPicId','regionId','secondAreaId']) for x in s['sources']))
ck('Progress acceptance is evidence-gated; no blanket freeze on authorized changes',validate_progress(q))
ck('All13 full release files exist with fixed counts',all(len(rd('RELEASES/'+r['release']+'.json')['release']['objectIds'])==r['declaredObjectCount'] for r in q['releasePlan']) and len(q['releasePlan'])==13)
ck('R58-A through R70-M sequential and M optional',[(r['release'],r['section']) for r in q['releasePlan']]==[(f'R{58+i}-{s}',s) for i,s in enumerate('ABCDEFGHIJKLM')] and q['releasePlan'][-1]['optional'])
ck('Release snapshots contain exact same tasks as queue',all(rd('RELEASES/'+r['release']+'.json')['objects']==[x for x in q['items'] if x['section']==r['section']] for r in q['releasePlan']))
ck('Three candidate code interfaces really exist',all((pathlib.Path(b['repo'])/p.split('#')[0]).exists() for candidate in rd('A-FIRST-THREE-CANDIDATES.json')['candidates'] for p in candidate['codePaths']))
ck('Actual source view records backed by hash files',all(pathlib.Path(v['cacheAbsolutePath']).exists() and hashlib.sha256(pathlib.Path(v['cacheAbsolutePath']).read_bytes()).hexdigest()==v['sha256'] for v in rd('EVIDENCE/SOURCE-VIEWS.json')['views']))
ck('Source cache excluded from public/release redistribution',all(not v['includeInPublicOrProductionZip'] and not v['redistributionAllowed'] for v in rd('EVIDENCE/SOURCE-VIEWS.json')['views']))
ck('All mandated documentation and three source diff candidates saved',all((D/p).exists() for p in ['SCOPE.md','CROSSWALK.json','QUEUE.json','SOURCES.json','DIFFS','EVIDENCE','PROGRESS.md','RESUME.md','WORKFLOW.md','THIRTEEN-RELEASES.md']) and len(list((D/'DIFFS').glob('FC-*.json')))>=3)
ck('Requirements bytes and SHA unchanged',pathlib.Path(b['source']).stat().st_size==244402 and hashlib.sha256(pathlib.Path(b['source']).read_bytes()).hexdigest()==b['sourceSha256'])
result={'status':'PASS','test':'CANONICAL_QUEUE_STRUCTURE_AND_PROVENANCE_NOT_MODEL_ACCEPTANCE','executedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'count':len(checks),'buildRun':False,'browserRun':False,'productionFilesModified':'NOT_ASSESSED_BY_QUEUE_VALIDATOR'}
(D/'VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(f'PASS {len(checks)}/{len(checks)} plan checks; geometry/build/browser acceptance NOT performed.')
