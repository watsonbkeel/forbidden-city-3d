"""Adopt the entire D32 without resetting prior accepted work or residuals."""
from pathlib import Path
import sys,json,datetime,copy,hashlib
P=Path(__file__).resolve().parents[2]; D=P/'docs/photo-fidelity'
sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R60-C','One-time predecessor guard'
rawhash=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
old=copy.deepcopy(q['integration']);old.update(frozenLocalCommit='f06922685d54a067962e3b8c68a9de90feccedb2',frozenTree='75852154f5c836666acf94959380f692e5acc5ea',residualInventory='docs/photo-fidelity/RESIDUALS/R60-C-STAGE.json',accepted=False)
q['completedStageHistory'].append(old)
q['integration']={'release':'R61-D','baseLocalCommit':old['frozenLocalCommit'],'baseTree':old['frozenTree'],'baseRemoteCommit':None,'baseRemoteStatus':'R60_VERIFIED_UPLOAD_RECEIPT_PENDING_NO_GUESSED_PARENT','branch':'feat/r61-d-inner-axis-fidelity-20261022','adoptedAt':now,'scope':'All original D32 / 440 required feature checks plus five existing declaration audits. Unresolved parent rooms and historical labels are not new buildings.','publicReferenceImageCopies':False,'stageStatus':'IN_PROGRESS','retainedPreviousResiduals':old['retainedPreviousResiduals']+[old['residualInventory']]}
items=[i for i in q['items'] if i['section']=='D']; originals=[i for i in items if i['id'].startswith('FC-')]; assert len(originals)==32
feature_count=sum(len(f['features']) for i in originals for f in i['facets'].values());assert feature_count==440
x=next(i for i in originals if i['id']=='FC-CA87A141EC')
for side in ['exterior','interior']:
 f=x['facets'][side];f['currentCycleReview']='PARTIAL' if side=='exterior' else 'DIFFED';f['status']=f['currentCycleReview'];f['sourceReinspection']={'actuallyViewed':True,'at':now,'evidence':'docs/photo-fidelity/D-REVIEW/SOURCES-VIEWED.json','sourcePhotoDate':None,'wholeObjectCoverage':False};x['sourceEvidence'][side]['currentCycleActuallyViewed']=True
for f in x['facets']['exterior']['features']:
 if f['id']=='doors_windows_openings_walls_screens':f.update(status='PARTIAL',acceptedScope=None,implementedScope='Only the two south outward-facing end-window frames now show the visible tall/wide central field and lower narrow side fields. Rear and inner surfaces, collision and access retained; fine joinery is unknown.')
x['facets']['exterior']['visualEvidence'].update(before='reports/r61-d-stage/before/qianqing-gate-south-window.png',after='reports/r61-d-stage/south-windows-03/qianqing-gate-south-window.png',referenceComparison='docs/photo-fidelity/D-REVIEW/START.md',browserRun=None)
x['actualChanges'].append({'release':'R61-D','scope':'TWO_SOUTH_OUTER_WINDOW_FRAME_GROUPS_ONLY','evidence':'reports/r61-d-stage/qianqing-windows-final-03.txt','wholeObjectAccepted':False})
x['nextAction']='Continue central porch coffer source/model analysis and remaining facets; do not rebuild already present rear-eave doors, stairs or folded screens. Other D31 remain required.'
q['progressHistory'].append({'at':now,'internalBatch':'R61-D-1-START','action':'Adopt all D32/440 features/five auxiliary audits. First scoped source-backed window correction, with failed cost/retention candidates retained. Browser and integrated world still pending.','wholeD32Accepted':False,'browserAccepted':False})
for r in q['releasePlan']:
 if r['section']=='D':r['status']='IN_PROGRESS'
q['summary']=summarize(q);write_queue(q,expected_raw_sha256=rawhash)
r=next(r for r in q['releasePlan'] if r['section']=='D');path=D/'RELEASES/R61-D.json';data=json.loads(path.read_text());data['release']=r;data['objects']=items;path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
resume=D/'RESUME.md';archive=D/'RESUME-R60-STAGE.md';assert not archive.exists();archive.write_bytes(resume.read_bytes())
resume.write_text('''# R61-D continuation

Canonical progress is QUEUE.json with its selected verified gzip parts; always
read/write through scripts/photo-fidelity/queue_storage.py. R61-D.json is derived.
Base: frozen R60 f06922685d54a067962e3b8c68a9de90feccedb2,
tree 75852154f5c836666acf94959380f692e5acc5ea. Remote receipt is pending;
never substitute local SHA for the remote release parent. R60 remains immutable.

All 32 original D objects / 440 feature checks and five declaration audits remain
required. Preserve all A-C residuals, all 398 identities, 154 declaration audits
and seven expansion tasks. Existing correct R33/R53/R54/R55 work is not reset.
Modern display and anonymous optional characters remain separate layers.

First implementation: two south outward-facing Qianqing Gate end windows, using
actually viewed official front photos. Rear doors, imperial stair, folded screens
and plaque are retained, not new achievements. Before views and candidate failures
are preserved under reports/r61-d-stage. Source images stay outside the repository.
The five focused checks consume actual geometry, not metadata alone. The local CPU
renderer supports batched per-vertex colors and real material groups, but omits
WebGL normal/PBR/shadow rendering. Browser/GPU/mobile acceptance remains pending.

Next: finish first window review and commit; inspect the existing porch roof against
the official coffer close-up before deciding a bounded ceiling correction; then
inspect Kunning Gate against its own official photos. Continue the entire D32
source/model and executable-residual scan, rather than publishing only a few tasks
as D completion. Do not clone unbound Junjichu/Shangshufang/Nanshufang labels into
new halls without location identity. Kunning east warm room is a parent interior,
not the separate East Warm Hall. Unaccepted Jingyun experiments stay excluded.
No repeated denied-browser action, main/Pages/deployment or credential change.
''')
print('Adopted R61-D:',len(originals),'originals',feature_count,'features',len(items)-len(originals),'auxiliary audits')
