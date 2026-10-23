from pathlib import Path
import sys,json,datetime
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R61-D';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];i=next(i for i in q['items'] if i['id']=='FC-CA87A141EC');assert not any(x.get('scope')=='CENTRAL_REAR_PORCH_COFFERS' for x in i['actualChanges']);now=datetime.datetime.now(datetime.timezone.utc).isoformat()
i['actualChanges'].append({'release':'R61-D','scope':'CENTRAL_REAR_PORCH_COFFERS','evidence':'docs/photo-fidelity/D-REVIEW/QIANQING-COFFERS.md','wholeObjectAccepted':False})
f=i['facets']['interior'];f['status']=f['currentCycleReview']='PARTIAL';f['sourceReinspection']={'actuallyViewed':True,'at':now,'evidence':'docs/photo-fidelity/D-REVIEW/QIANQING-COFFERS.md','sourcePhotoDate':None,'wholeObjectCoverage':False}
for feature in f['features']:
 if 'ceiling' in feature['id']:feature.update(status='PARTIAL',acceptedScope=None,implementedScope='One central rear porch square-coffer bay; plain blue/gold medallions, not dragon-paint reproduction. Full ceiling extent and end rooms unknown.')
f['visualEvidence'].update(before='reports/r61-d-stage/south-windows-03/qianqing-gate-porch-ceiling-diagnostic.png',after='reports/r61-d-stage/porch-coffers-01/qianqing-gate-porch-ceiling-diagnostic.png',referenceComparison='docs/photo-fidelity/D-REVIEW/QIANQING-COFFERS.md',browserRun=None)
i['nextAction']='Concentrated D-world exact19 proxy checks, retained gate traversal; actual browser before/after and full ceiling/end-room source remain pending.'
q['progressHistory'].append({'at':now,'internalBatch':'R61-D-1-COFFERS','action':'One source-backed central rear porch ceiling patch, actual CPU views and7 local geometry/collider/lifecycle checks; original south-window geometry retained. Full-world/browser pending.','wholeD32Accepted':False,'browserAccepted':False});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
r=json.loads((D/'RELEASES/R61-D.json').read_text());r['objects']=[i for i in q['items'] if i['section']=='D'];(D/'RELEASES/R61-D.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
with (D/'RESUME.md').open('a') as out:out.write('\nThird bounded change: central rear porch coffers at Qianqing Gate, not a full ceiling or dragon-paint reproduction. See D-REVIEW/QIANQING-COFFERS.md. Seven local checks pass; whole-world/browser remain pending. Continue all D32 residuals.\n')
