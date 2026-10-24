from pathlib import Path
import json,sys,hashlib,gzip
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=P/'reports/r67-i-stage';sys.path.insert(0,str(P/'scripts/photo-fidelity'));from queue_storage import load_queue,write_queue
q=load_queue();assert q['integration']['release']=='R67-I';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];prod=json.loads((R/'PRODUCTION-VERIFICATION.json').read_text());world=json.loads((R/'WORLD-SUMMARY.json').read_text());assert prod['status']=='PASS'and all(s['exit']==0 for s in world['stages']);assert all(b['identity']['sourceFingerprint']==world['sourceFingerprint']and b['identity']['sourceDirty']==False for b in prod['builds'])
q['integration'].update(stageStatus='LOCAL_VERIFIED_PARTIAL_AWAITING_REMOTE',validation={'worldReport':'reports/r67-i-stage/WORLD-SUMMARY.json','worldSources':263,'sourceFingerprint':world['sourceFingerprint'],'independentStages':['B','yangxin','kunning','huangji'],'freshRegistryPerStage':108,'pathsTwoCyclesInB':24,'focusedPass':22,'existingSixMainHallEntryRoomPhysicalPass':167,'all19NingshouProfilePortalPass':304,'affectedPortalReport':'reports/r67-i-stage/AFFECTED-PORTALS.json','productionEntryPass':6,'reviewMaterialMergePass':38,'browserAccepted':False,'wholeSectionAccepted':False},localDelivery={'productionReport':'reports/r67-i-stage/PRODUCTION-VERIFICATION.json','buildIds':[b['identity']['buildId']for b in prod['builds']],'sourceFingerprint':world['sourceFingerprint'],'rootProjectHttpExactFilesEach':132,'publicAssetsEach':128,'glbEach':31,'archiveEntries':135,'remoteUploaded':False,'wholeSectionAccepted':False});write_queue(q,expected_raw_sha256=raw)
h=D/'I-REVIEW/QUEUE-GENERATION-HISTORY.json';d=json.loads(h.read_text());d['generations'].append({'role':'Final local R67 authority, remote not claimed','index':json.loads((D/'QUEUE.json').read_text())});h.write_text(json.dumps(d,indent=2)+'\n')
for r in d['generations']:
 i=r['index'];b=b''.join((D/'QUEUE.parts'/i['gzipSha256']/v['name']).read_bytes()for v in i['parts']);assert hashlib.sha256(b).hexdigest()==i['gzipSha256']and hashlib.sha256(gzip.decompress(b)).hexdigest()==i['rawSha256']
(D/'RESUME.md').write_text('''# R67-I cumulative continuation

Current canonical QUEUE.json remains a verified gzip-parts index. R67-I executes historical R66-I plan. All29 originals/386features/17declarations reviewed, bounded implementations only, none accepted. Use I-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json and RESIDUALS/R67-I-STAGE.json. All A–H residuals retained.

Frozen runtime source fingerprint: '''+world['sourceFingerprint']+'''. Four independent fresh worlds passed under CPU QA with per-view temporary-buffer garbage collection, not reduced role/path/assertion counts. Earlier SIGKILL attempts and old snapshot conflicts are retained.22focused/167existing-six-main-hall-regressions/304all-profile-portals/6entry and38actual material/merge checks pass. Not browser/GPU/phone/full continuous-tour acceptance.

Root and project-base production packages verified locally. Remote not claimed. Single uploader rechecks current remote and R66 recovery before adding R67 cumulative development branch. Do not touch main, permissions or credentials. User merges main. Full delivery manifests identify actual commits, not merely release labels.
''')
print('Final local stage recorded; remote not claimed.')
