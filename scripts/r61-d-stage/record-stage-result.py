from pathlib import Path
import json,sys,datetime
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
q=load_queue();s=json.loads((P/'reports/r61-d-stage/STAGED-WORLD-SUMMARY.json').read_text());assert s['status']=='PASS_FIVE_INDEPENDENT_FULL_WORLDS_NOT_ONE_CONTINUOUS_THREE_S_SESSION';assert len(s['stages'])==5 and s['registry']==108 and s['worldSourceFiles']==232
assert q['integration']['release']=='R61-D' and q['integration']['stageStatus']=='IN_PROGRESS';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
validation={'status':s['status'],'summary':'reports/r61-d-stage/STAGED-WORLD-SUMMARY.json','sourceCommit':s['sourceCommit'],'sourceFingerprint':s['sourceFingerprint'],'worldSourceFiles':232,'registry':108,'stages':5,'observationGroups':s['totalObservationGroups'],'notContinuousThreeS':True,'browserAccepted':False,'gpuAccepted':False,'physicalPhoneAccepted':False,'fullSectionAccepted':False}
q['integration']['stageStatus']='FUNCTIONAL_STAGE_DELIVERY_NOT_FULL_ACCEPTANCE';q['integration']['validation']=validation
for r in q['releasePlan']:
 if r['section']=='D':r['status']='FUNCTIONAL_STAGE_DELIVERY_NOT_FULL_ACCEPTANCE';r['fullSectionAccepted']=False
q['progressHistory'].append({'at':now,'internalBatch':'R61-D-STAGED-WORLD-CHECKPOINT','action':'Five independently initialized complete worlds pass; each freshly binds and individually observes108 roles on232 identical world source files. D272 routes plus full retained A-C routes/blocked witnesses, three separate actual S B-return checks; not one cumulative three-S session. Source and browser residuals remain open.','wholeD32Accepted':False,'browserAccepted':False})
write_queue(q,expected_raw_sha256=raw)
p=D/'RELEASES/R61-D.json';out=json.loads(p.read_text());out['release']=next(r for r in q['releasePlan'] if r['section']=='D');out['objects']=[i for i in q['items'] if i['section']=='D'];p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
p=D/'RESIDUALS/R61-D-STAGE.json';out=json.loads(p.read_text());out['runtimeSourceFreeze']='72b5de8';out['functionalQA']=validation;p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(D/'RESUME.md').write_text('''# R61-D stage continuation

One authority: QUEUE.json and its selected verified gzip parts, read/written only
through scripts/photo-fidelity/queue_storage.py. Release JSON files are derived.
R60 local base f06922685d54a067962e3b8c68a9de90feccedb2 remains immutable.
Verified R60 remote receipt is still pending; never guess the remote parent.

D32 / 440 required features and 17 existing declaration audits have completed the
source/model/executability scan. The extra 12 audit assignments move from G to D
by physical location; all 154 original IDs remain. No new buildings are inferred.
Five bounded changes: Qianqing south windows and central rear porch coffers,
Kunning Gate dedicated north-facing raised profile/real steps, twelve exact
anonymous gallery declarations with unsupported inventory removed, and two
Jiaotai south central grille fields. Known source and engineering residuals stay
in D-REVIEW/COMPLETE-SCAN.md and RESIDUALS/R61-D-STAGE.json.

Functional stage result: five independent complete worlds, the same 232 source
fingerprints, all 108 actors freshly bound and individually observed, all 24
paths, D272 real-controller route cases and all retained applicable A-C routes
and blocked witnesses. Separate Yangxin/Kunning/Huangji stages each prove their
own B→real S→B cleanup and 108-role generation/visibility checks. This is NOT one
world continuously surviving all three S transitions. See
reports/r61-d-stage/STAGED-WORLD-SUMMARY.json for exact counts and resource limits.

Two prior R61 SIGKILL attempts and a dedicated-profile QA enumeration failure
remain recorded. The external termination cause is unknown. A QA-only bounded
raster serializer preserves exact decoded JSON while reducing a demonstrated
allocation peak; it is not a production/GPU memory improvement claim.

No browser/WebGL/mobile final fidelity acceptance exists. CPU actual-model
images cannot substitute. Official source photographs/PDFs remain private
reference inputs, not public assets. Stage delivery is not whole D acceptance.
Continue R62-E61 from the final frozen R61 successor while retaining all A-D
residuals. Inspect all E exterior/interior requirements and already-correct
work before bounded source-backed changes. Do not clone unbound names, repeat
blocked browser actions, include unaccepted Jingyun experiments, merge main,
change credentials or deploy as a side effect of this stage.
''')
print(json.dumps(validation,ensure_ascii=False))
