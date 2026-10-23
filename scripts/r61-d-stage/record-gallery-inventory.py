from pathlib import Path
import sys,json,datetime
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R61-D';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat();moved=[]
for i in q['items']:
 if not i['id'].startswith('AUX-'):continue
 refs=[r['ref'] for r in i['runtimeBindings']]
 if not any(f'data/zones/garden.json#/items/{n}' in refs for n in range(14,26)):continue
 assert i['section']=='G';i['section']='D';i['release']='R61-D';i['sectionAssignment']='PHYSICAL_INNER_AXIS_LOCATION_NOT_HISTORICAL_ROOM_IDENTITY';i['migrationHistory']=i.get('migrationHistory',[])+[{'at':now,'fromSection':'G','toSection':'D','reason':'Existing declaration z215.8–422.2 falls in inner three-palace enclosure, not northern imperial garden. All IDs retained; exact historical gallery/room identity unresolved.'}]
 for facet in i['facets'].values():facet.update(status='DIFFED',currentCycleReview='DIFFED')
 i['facets']['interior'].update(status='PARTIAL',currentCycleReview='PARTIAL',nextAction='Find room-specific overview, placement and display-date evidence; generic props removed, not historically empty.')
 i['actualChanges'].append({'release':'R61-D','scope':'EXACT_DECLARATION_UNKNOWN_INVENTORY','evidence':'docs/photo-fidelity/D-REVIEW/INNER-GALLERY-INVENTORY.md','wholeObjectAccepted':False});i['nextAction']='Validate fresh integrated world; keep all unproven room boundaries and named identity unknown.';moved.append(i['id'])
assert len(moved)==12
for r in q['releasePlan']:
 if r['section']=='G':r['supplementaryRuntimeIds']=[x for x in r['supplementaryRuntimeIds'] if x not in moved]
 if r['section']=='D':r['supplementaryRuntimeIds']+=moved
q['integration']['scope']='All original D32 /440 feature checks, original5 plus12 physically reassigned existing declaration audits. No new buildings or deleted IDs.'
q['progressHistory'].append({'at':now,'internalBatch':'R61-D-2-GALLERY-INVENTORY','action':'Exact12 existing inner-axis declarations: remove192 unsupported prop meshes/proxies; preserve32 unverified boundaries and12 supports.31 focused and10 local consumer/route groups pass,256 real-controller round trips. G→D ownership clarification retains all154 audits.','wholeD32Accepted':False,'browserAccepted':False});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
for r in q['releasePlan']:
 if r['section'] not in ['D','G']:continue
 path=D/'RELEASES'/f"{r['release']}.json";out=json.loads(path.read_text());out['release']=r;out['objects']=[i for i in q['items'] if i['section']==r['section']];path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
with (D/'RESUME.md').open('a') as out:out.write('\nFourth bounded change:12 inner-axis anonymous gallery declarations opt into UNKNOWN inventory;192 unsupported props/proxies removed,32 unverified room bounds retained. Review ownership12 AUX movesG→D without changing total154 or claiming historical identities. See D-REVIEW/INNER-GALLERY-INVENTORY.md.31 focused+10 local consumer/route groups pass; integrated world/browser pending.\n')
