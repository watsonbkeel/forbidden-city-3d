from pathlib import Path
import json,sys
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=P/'reports/r71-m-stage';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
q=load_queue();idx=json.loads((D/'QUEUE.json').read_text());world=json.loads((R/'WORLD-SUMMARY-01.json').read_text());prod=json.loads((R/'PRODUCTION-VERIFICATION.json').read_text());assert prod['status']=='PASS'and len(world['stages'])==4
assert all(b['identity']['sourceFingerprint']==world['sourceFingerprint']and not b['identity']['sourceDirty']for b in prod['builds'])
q['integration'].update(stageStatus='LOCAL_VERIFIED_PARTIAL_AWAITING_REMOTE',validation={'worldReport':'reports/r71-m-stage/WORLD-SUMMARY-01.json','sourceFingerprint':world['sourceFingerprint'],'focusedPass':8,'queueStoragePass':29,'productionEntryPass':6,'independentWorlds':4,'actorsPerWorld':108,'paths':24,'unchangedPriorInputs':485,'browserAccepted':False,'wholeSectionAccepted':False,'knownBaselineFailure':'Old settings preview-label assertion predates R65 authors change; reproduced unchanged on R70. No goldens changed.'},localDelivery={'productionReport':'reports/r71-m-stage/PRODUCTION-VERIFICATION.json','buildIds':[b['identity']['buildId']for b in prod['builds']],'remoteUploaded':False,'wholeSectionAccepted':False})
write_queue(q,expected_raw_sha256=idx['rawSha256']);print('R71 local only, no remote or Pages')
