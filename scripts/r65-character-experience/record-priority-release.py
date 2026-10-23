from pathlib import Path
import json,sys,datetime,copy
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
q=load_queue();before=copy.deepcopy(q['items']);raw=json.loads((D/'QUEUE.json').read_text())['rawSha256']
q['executionSchedule']=[{'section':r['section'],'originalPlanRelease':r['release'],'release':f'R{58+i+(1 if i>=7 else 0)}-{r["section"]}','state':'NOT_STARTED' if i>=7 else r['status']} for i,r in enumerate(q['releasePlan'])]
q['priorityReleases']=[{'release':'R65','scope':'Mutual pedestrian blocking, all-day character availability, night readability and the requested two-line author label','section':None,'reason':'Explicit user-priority repair before H','historicalFacetsChanged':False}]
q['progressHistory'].append({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'internalBatch':'R65-PRIORITY-CHARACTER-EXPERIENCE','action':'R65 is a cumulative experience repair, not H. The original 13-section scope snapshots retain their planning IDs; canonical executionSchedule moves H through M to R66 through R71. No architecture acceptance, source status or unresolved item is changed.'})
assert q['items']==before;write_queue(q,expected_raw_sha256=raw)
p=P/'scripts/photo-fidelity/queue.py';s=p.read_text();s=s.replace("'release':x['release'],'exterior'", "'release':next((r['release'] for r in q.get('executionSchedule',[]) if r['section']==x['section']),x['release']),'originalPlanRelease':x['release'],'exterior'");p.write_text(s)
p=P/'scripts/photo-fidelity/validate.py';s=p.read_text();needle="ck('Release snapshots contain exact same tasks as queue'";at=s.index(needle);s=s[:at]+"ck('Priority R65 execution schedule preserves all13 scopes and shifts only unstarted H-M',[(r['release'],r['section']) for r in q.get('executionSchedule',[])]==[(f'R{58+i+(1 if i>=7 else 0)}-{section}',section) for i,section in enumerate('ABCDEFGHIJKLM')] and q.get('priorityReleases',[{}])[0].get('release')=='R65')\n"+s[at:];p.write_text(s)
p=D/'THIRTEEN-RELEASES.md';s=p.read_text();s=s.replace('# R58–R70：全13区连续推进计划','# 原始13区范围计划与当前执行编号',1);s=s.replace('\n\n输入398', '\n\n原始规划编号保留用于追溯，并非当前交付状态。R65 插入人物体验修复；H–M 当前执行编号顺延为 R66-H、R67-I、R68-J、R69-K、R70-L、R71-M，尚未开始。权威映射在 QUEUE 的 executionSchedule，queue.py next 输出当前执行编号；下文旧标题与 RELEASES 原始快照只保留范围，不表示已发布。\n\n输入398',1);p.write_text(s)
p=D/'RESUME-R64-STAGE.md';assert not p.exists();p.write_bytes((D/'RESUME.md').read_bytes())
(D/'RESUME.md').write_text('''# R65 priority character-experience release

This is not H. The cumulative base is frozen local R64 6a2803b9238a2f3f2225a2bc45a4084b1fbfe0d0, verified source remote 2895ef3f6e877a517bccf7343fd4d7992bf94cd3.
R65 retains all A–G geometry, 108 logical actors, 24 routes and Kit. It repairs player/NPC mutual blocking and the sunset disappearance, adds modest virtual night lighting, and changes the requested settings-launcher label.
See reports/r65-character-experience/README.md for checked scope and remaining browser/GPU/mobile limits.

Canonical QUEUE executionSchedule assigns H–M to R66-H through R71-M. The original releasePlan and RELEASES snapshots preserve the original thirteen scopes and planning identifiers for traceability, not executed releases. queue.py next emits current execution numbers. No H model work has begun and no prior source/engineering/visual residual is closed by this repair.

One cumulative version must pass necessary local checks, upload verification and user handoff before starting H. Only the verified development branch is delivered; the user merges main and manages Pages. Do not modify their main workflow or deployment configuration.
''')
print('Canonical schedule updated; all item/facet records byte-equivalent as objects.')
