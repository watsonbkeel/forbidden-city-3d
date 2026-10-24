"""One-time G29 adoption; earlier review states and residuals are immutable."""
from pathlib import Path
import sys, json, datetime, copy

P = Path(__file__).resolve().parents[2]
D = P / 'docs/photo-fidelity'
sys.path.insert(0, str(P / 'scripts/photo-fidelity'))
from queue_storage import load_queue, write_queue
from queue import summarize

q = load_queue()
assert q['integration']['release'] == 'R63-F'
raw_hash = json.loads((D / 'QUEUE.json').read_text())['rawSha256']
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
old = copy.deepcopy(q['integration'])
old.update(frozenLocalCommit='bfafb63aff4984b266b02600d1364001000e0bc6',
           frozenTree='33142153a23bce5c63e9aba7c6a8d909e2b41f8b',
           verifiedRemoteCommit='6bd936cbbbd45ddee2fca90060a3530485908cd0',
           residualInventory='docs/photo-fidelity/RESIDUALS/R63-F-STAGE.json', accepted=False)
q['completedStageHistory'].append(old)
items = [i for i in q['items'] if i['section'] == 'G']
originals = [i for i in items if i['id'].startswith('FC-')]
features = sum(len(f['features']) for i in originals for f in i['facets'].values())
assert (len(originals), features, len(items) - len(originals)) == (29, 400, 10)
q['integration'] = {
    'release': 'R64-G', 'baseLocalCommit': old['frozenLocalCommit'], 'baseTree': old['frozenTree'],
    'baseRemoteCommit': old['verifiedRemoteCommit'], 'baseRemoteStatus': 'R63_FULL_REMOTE_VERIFIED',
    'branch': 'feat/r64-g-garden-fidelity-20261023', 'adoptedAt': now,
    'scope': 'All G29 / 400 feature checks, 10 existing declaration audits and EXPAND-06. No unresolved label generates a physical building.',
    'publicReferenceImageCopies': False, 'stageStatus': 'IN_PROGRESS',
    'retainedPreviousResiduals': old['retainedPreviousResiduals'] + [old['residualInventory']],
    'releaseCadence': 'Finish this cumulative stage, necessary checks and complete remote verification before beginning H. Root delivers one latest verified entry.',
}
for r in q['releasePlan']:
    if r['section'] == 'G':
        r['status'] = 'IN_PROGRESS'
        r['nextSectionPolicy'] = 'After this section-wide executable pass and complete remote verification, continue H while retaining all unresolved G and prior-section residuals.'
q['progressHistory'].append({
    'at': now, 'internalBatch': 'R64-G-ADOPTION',
    'action': 'Read master rules and all G29 requirements. Reuse R32 Qinan, R47 cross pavilions and R48 bridge/Yujing forms. Official pixels expose Qinan support/joinery, bridge ceiling/arch and gate differences; source conflicts and missing positions stay explicit. No acceptance inferred.',
    'wholeSectionAccepted': False, 'browserAccepted': False,
})
q['summary'] = summarize(q)
write_queue(q, expected_raw_sha256=raw_hash)
r = next(r for r in q['releasePlan'] if r['section'] == 'G')
path = D / 'RELEASES/R64-G.json'
data = json.loads(path.read_text())
data.update(release=r, objects=items)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
resume = D / 'RESUME.md'
archive = D / 'RESUME-R63-STAGE.md'
assert not archive.exists()
archive.write_bytes(resume.read_bytes())
resume.write_text('''# R64-G continuation

Canonical authority: QUEUE.json plus its verified gzip parts, accessed through
scripts/photo-fidelity/queue_storage.py. RELEASES/R64-G.json is a derived view.
Frozen local R63: bfafb63aff4984b266b02600d1364001000e0bc6.
Verified remote parent: 6bd936cbbbd45ddee2fca90060a3530485908cd0.
R63 and all previous source, evidence and production packages remain frozen.

G has 29 original requirements, 400 feature checks, 10 existing declaration
audits and EXPAND-06. Preserve all 398 original IDs, all 154 declaration audits,
all seven expansions, earlier accepted snapshots and A-F unresolved work.
Unresolved side-hall names, aggregates and removed gates are not new geometry.

First bounded batch: Qinan marble support skin and front panel joinery, independently
identified bridge-pavilion ceiling structure, and separately sourced bridge-ceiling frame relief.
Study each official image before implementation. The current Qinan low annex is
visible in official imagery and documented as reconstructed in 2004-2008; retain
it despite an older webpage/checklist "removed" statement. No date is inferred
from image URL. The bridge arch is a separate measured-fit/engineering difference,
not a reason to change existing top support heights without contact verification.
Review all 29 originals, ten declarations and expansion; missing identities or
unlocated side buildings do not generate generic physical replacements. Preserve
all 108 anonymous optional actors, 24 routes, Kit, existing caps and prior A-F.
Only source-backed bounded changes proceed; every other feature gets a reasoned
residual, never silently marked complete.

Official photographs/PDFs stay in private reference caches outside the repo and
production package. CPU renders are geometry evidence, not browser/WebGL/GPU or
physical-phone acceptance. Do not retry denied browser actions or modify main,
credentials or Pages. No H work until this cumulative G release is checked,
uploaded and fully remotely verified. Root supplies one latest verified link.
''')
print('Adopted G:', len(originals), features, len(items)-len(originals))
