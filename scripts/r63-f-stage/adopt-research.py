"""One-time F55 adoption; earlier review states and residuals are immutable."""
from pathlib import Path
import sys, json, datetime, copy

P = Path(__file__).resolve().parents[2]
D = P / 'docs/photo-fidelity'
sys.path.insert(0, str(P / 'scripts/photo-fidelity'))
from queue_storage import load_queue, write_queue
from queue import summarize

q = load_queue()
assert q['integration']['release'] == 'R62-E'
raw_hash = json.loads((D / 'QUEUE.json').read_text())['rawSha256']
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
old = copy.deepcopy(q['integration'])
old.update(frozenLocalCommit='f87342d7e1506713df4a6877943eb377e8299593',
           frozenTree='34cfbca05c3ccb162e1b99e2b1f949a56f224077',
           verifiedRemoteCommit='51d5ced1f0074b1a0eeacec2c36c6c4fd580245d',
           residualInventory='docs/photo-fidelity/RESIDUALS/R62-E-STAGE.json', accepted=False)
q['completedStageHistory'].append(old)
items = [i for i in q['items'] if i['section'] == 'F']
originals = [i for i in items if i['id'].startswith('FC-')]
features = sum(len(f['features']) for i in originals for f in i['facets'].values())
assert (len(originals), features, len(items) - len(originals)) == (55, 726, 26)
q['integration'] = {
    'release': 'R63-F', 'baseLocalCommit': old['frozenLocalCommit'], 'baseTree': old['frozenTree'],
    'baseRemoteCommit': old['verifiedRemoteCommit'], 'baseRemoteStatus': 'R62_FULL_REMOTE_VERIFIED',
    'branch': 'feat/r63-f-west-inner-fidelity-20261023', 'adoptedAt': now,
    'scope': 'All F55 / 726 feature checks, 26 existing declaration audits and EXPAND-06. No unresolved label generates a physical building.',
    'publicReferenceImageCopies': False, 'stageStatus': 'IN_PROGRESS',
    'retainedPreviousResiduals': old['retainedPreviousResiduals'] + [old['residualInventory']],
    'releaseCadence': 'Finish this cumulative stage, necessary checks and complete remote verification before beginning G. Root delivers one latest verified entry.',
}
for r in q['releasePlan']:
    if r['section'] == 'F':
        r['status'] = 'IN_PROGRESS'
        r['nextSectionPolicy'] = 'After this section-wide executable pass and complete remote verification, continue G while retaining all unresolved F and prior-section residuals.'
q['progressHistory'].append({
    'at': now, 'internalBatch': 'R63-F-ADOPTION',
    'action': 'Read entire F55 section and master rules; preserve R48 dedicated shells, R53 Yangxin rooms and real S layer, R54 Changchun east alcove. Actual official Tongdao/Lijing south photos and Qinzheng room photo inspected; bounded differences assigned. No acceptance inferred.',
    'wholeSectionAccepted': False, 'browserAccepted': False,
})
q['summary'] = summarize(q)
write_queue(q, expected_raw_sha256=raw_hash)
r = next(r for r in q['releasePlan'] if r['section'] == 'F')
path = D / 'RELEASES/R63-F.json'
data = json.loads(path.read_text())
data.update(release=r, objects=items)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
resume = D / 'RESUME.md'
archive = D / 'RESUME-R62-STAGE.md'
assert not archive.exists()
archive.write_bytes(resume.read_bytes())
resume.write_text('''# R63-F continuation

Canonical authority: QUEUE.json plus its verified gzip parts, accessed through
scripts/photo-fidelity/queue_storage.py. RELEASES/R63-F.json is a derived view.
Frozen local R62: f87342d7e1506713df4a6877943eb377e8299593.
Verified remote parent: 51d5ced1f0074b1a0eeacec2c36c6c4fd580245d.
R62 and all previous source, evidence and production packages remain frozen.

F has 55 original requirements, 726 feature checks, 26 existing declaration
audits and EXPAND-06. Preserve all 398 original IDs, all 154 declaration audits,
all seven expansions, earlier accepted snapshots and A-E unresolved work.
Unresolved side-hall names, aggregates and removed gates are not new geometry.

First bounded batch: Tongdaotang roof type, Tongdaotang and Lijingxuan south
window/sill subdivisions, and the photographed Qinzheng kang-front footstool.
Source conflict for Tongdaotang is explicit: parent page says hard gable,
dedicated page and actual photograph support a hipped lower return with gable.
Photo dates and metric fits remain unknown. Central visitor doors remain open;
photographed temporary closed access is not copied into navigation.
Preserve R48 dedicated facades, R53 Yangxin rooms and real S asset, R54 Changchun
east alcove, all 108 anonymous optional characters, 24 routes and runtime caps.
Read all F requirements and record implementable, location, source and visual
residuals. A handful of changes does not close the full section.

Official photographs/PDFs stay in private reference caches outside the repo and
production package. CPU renders are geometry evidence, not browser/WebGL/GPU or
physical-phone acceptance. Do not retry denied browser actions or modify main,
credentials or Pages. No G work until this cumulative F release is checked,
uploaded and fully remotely verified. Root supplies one latest verified link.
''')
print('Adopted F:', len(originals), features, len(items)-len(originals))
