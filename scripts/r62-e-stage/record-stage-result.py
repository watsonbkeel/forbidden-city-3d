from pathlib import Path
import json,sys,datetime
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
q=load_queue();s=json.loads((P/'reports/r62-e-stage/STAGED-WORLD-SUMMARY.json').read_text());assert s['status']=='PASS_FIVE_INDEPENDENT_FULL_WORLDS_NOT_ONE_CONTINUOUS_THREE_S_SESSION';assert len(s['stages'])==5 and s['registry']==108 and s['worldSourceFiles']==241
assert q['integration']['release']=='R62-E' and q['integration']['stageStatus']=='IN_PROGRESS';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
validation={'status':s['status'],'summary':'reports/r62-e-stage/STAGED-WORLD-SUMMARY.json','sourceCommit':s['sourceCommit'],'sourceFingerprint':s['sourceFingerprint'],'worldSourceFiles':241,'registry':108,'stages':5,'observationGroups':s['totalObservationGroups'],'notContinuousThreeS':True,'browserAccepted':False,'gpuAccepted':False,'physicalPhoneAccepted':False,'fullSectionAccepted':False}
q['integration']['stageStatus']='FUNCTIONAL_STAGE_DELIVERY_NOT_FULL_ACCEPTANCE';q['integration']['validation']=validation
for r in q['releasePlan']:
 if r['section']=='E':r['status']='FUNCTIONAL_STAGE_DELIVERY_NOT_FULL_ACCEPTANCE';r['fullSectionAccepted']=False
q['progressHistory'].append({'at':now,'internalBatch':'R62-E-STAGED-WORLD-CHECKPOINT','action':'Five independently initialized complete worlds pass; each freshly binds and individually observes108 roles on241 identical world source files. E218 routes plus retained D272 and full A-C routes/blocked witnesses, three separate actual S B-return checks; not one cumulative three-S session. Source and browser residuals remain open.','wholeE61Accepted':False,'browserAccepted':False})
write_queue(q,expected_raw_sha256=raw)
p=D/'RELEASES/R62-E.json';out=json.loads(p.read_text());out['release']=next(r for r in q['releasePlan'] if r['section']=='E');out['objects']=[i for i in q['items'] if i['section']=='E'];p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
p=D/'RESIDUALS/R62-E-STAGE.json';out=json.loads(p.read_text());out['runtimeSourceFreeze']=s['sourceCommit'];out['functionalQA']=validation;p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(validation,ensure_ascii=False))
