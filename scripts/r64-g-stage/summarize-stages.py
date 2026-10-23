from pathlib import Path
import gzip,json,hashlib,subprocess
P=Path(__file__).resolve().parents[2];base=P/'reports/r64-g-stages-final-03';summaries=[];reference=None;ids=None
for phase in ['B-current','B-retained','yangxin','kunning','huangji']:
 out=base/phase;p=out/'one-world-validation.json.gz';raw=p.read_bytes() if p.exists() else subprocess.check_output(['node','--input-type=module','-e',"import{readR64Evidence}from'./scripts/r64-restore-evidence-archives.mjs';process.stdout.write(readR64Evidence(process.argv[1]));",str(p.relative_to(P))],cwd=P);q=json.loads(gzip.decompress(raw));r=json.loads((out/'resource.json').read_text());assert r['exitCode']==0 and q['success'] is True and q['phase']==phase
 if reference is None:reference=q;ids=sorted(x['id'] for x in q['bindings'])
 assert len(ids)==len(set(ids))==108 and sorted(x['id'] for x in q['bindings'])==ids
 assert q['sourceHashes']==q['finalSourceHashes']==reference['sourceHashes'] and len(q['sourceHashes'])==250
 assert q['sourceFingerprint']==reference['sourceFingerprint'];assert q['sourceCommit']==reference['sourceCommit'];assert q['world']==reference['world'];assert len(q['paths'])==24
 assert q['individuallyVisibleIds']==ids and not q['viewFailures'] and all(x['pass'] for x in q['views'])
 assert q['finalOff']=={'instances':0,'queuedJobs':0} and q['cleanedS']['loaded']==[] and all(x['state']=='idle' and x['attached'] is False for x in q['cleanedS']['states'])
 srows=[v for v in q['views'] if v['label'].startswith('S-')];returned=[v for v in q['views'] if v['label'].startswith('Returned-B/')]
 if phase.startswith('B-'):
  assert not srows and not returned
  if phase=='B-current':assert len(q['r64g']['routes'])==32 and q['r64g']['afterReload']==q['r64g']['geometry'];assert len(q['lifecycle'])==7 and len(q['r61d']['routes'])==272 and len(q['r62e']['routes'])==218 and len(q['r63f']['routes'])==136 and q['staffProof']['success']
  else:assert len(q['r60c']['routes'])==56 and len(q['batch3']['galleryRoutes'])==64 and len(q['batch5']['inheritedBlockedEntries'])==16
 else:
  assert sorted({a['id'] for v in srows for a in v['actors']})==ids
  assert sorted({a['id'] for v in returned for a in v['actors']})==ids
  assert q['returnToB']['individuallyVisibleIds']==ids and len(q['returnToB']['generations'])==108
  assert all(x['loaded']!=x['returned'] for x in q['returnToB']['generations'])
 summaries.append({'phase':phase,'success':True,'report':str(p.relative_to(P)),'reportSHA256':hashlib.sha256(raw).hexdigest(),'reportBytes':len(raw),'freshBindings':len(q['bindings']),'BIndividualIDs':len(ids),'SIndividualIDs':108 if srows else 0,'returnedBIndividualIDs':108 if returned else 0,'observationGroups':len(q['views']),'pathCount':len(q['paths']),'generationTransitionsToReturnedB':len(q.get('returnToB',{}).get('generations',[])),'QAResources':r})
result={'status':'PASS_FIVE_INDEPENDENT_FULL_WORLDS_NOT_ONE_CONTINUOUS_THREE_S_SESSION','sourceCommit':reference['sourceCommit'],'sourceFingerprint':reference['sourceFingerprint'],'worldSourceFiles':250,'world':reference['world'],'registry':108,'visibleBudget':{'high':64,'low':32,'near':2,'lowCourt':12},'freshIndividualViewIDsPerApplicablePhase':108,'uniquePaths':24,'retainedCRouteReplays':56,'retainedDRouteReplays':272,'retainedERouteReplays':218,'retainedFRouteReplays':136,'newGRouteReplays':32,'actualYangxinSFootstoolRouteReplays':16,'sevenZoneReloadsInB':7,'stages':summaries,'totalObservationGroups':sum(x['observationGroups'] for x in summaries),'QAResourceBoundary':'CPU Node geometry/controls only. No gameplay/GPU claim. MaxRSS is a cumulative largest-child upper bound on later phases.','initialGFailuresPreserved':['reports/r64-g-stages-final-01/B-current','reports/r64-g-stages-final-02/B-current'],'initialFBlockedRouteFailurePreserved':'reports/r63-f-stages-final/B-current','initialEBlockedRouteFailurePreserved':'reports/r62-e-stages/B-current','priorFailedDStagesPreserved':['reports/r61-d-stages/B','reports/r61-d-stages-final/B','reports/r61-d-stages-five/B-current'],'priorCFailedCumulativeAttemptsPreserved':['reports/r60-c-world','reports/r60-c-world-recheck','reports/r60-c-world-bounded'],'notEstablished':['one world surviving all three consecutive S transitions','browser WebGL and mobile fidelity/performance','whole historic full-library green','full G29 accepted']}
(P/'reports/r64-g-stage/STAGED-WORLD-SUMMARY.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':result['status'],'stages':len(summaries),'observations':result['totalObservationGroups'],'seconds':sum(x['QAResources']['wallSeconds'] for x in summaries)}))
