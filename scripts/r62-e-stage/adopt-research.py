"""One-time adoption of E61, with every earlier residual retained."""
from pathlib import Path
import sys,json,datetime,copy
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity'
sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R61-D'
rawhash=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
old=copy.deepcopy(q['integration']);old.update(frozenLocalCommit='6b396800b6a03582aebf513fcef4966e9f5d0db3',frozenTree='30fa7171a050d9a944ab5be3363a1da0dd75848c',residualInventory='docs/photo-fidelity/RESIDUALS/R61-D-STAGE.json',accepted=False)
q['completedStageHistory'].append(old)
items=[i for i in q['items'] if i['section']=='E']; originals=[i for i in items if i['id'].startswith('FC-')]
features=sum(len(f['features']) for i in originals for f in i['facets'].values())
assert (len(originals),features,len(items)-len(originals))==(61,854,33)
q['integration']={'release':'R62-E','baseLocalCommit':old['frozenLocalCommit'],'baseTree':old['frozenTree'],'baseRemoteCommit':None,'baseRemoteStatus':'R61_VERIFIED_UPLOAD_RECEIPT_PENDING_NO_GUESSED_PARENT','branch':'feat/r62-e-east-inner-fidelity-20261023','adoptedAt':now,'scope':'All E61 / 854 feature checks, 33 existing declaration audits and three applicable expansion tasks. No new building inferred from an unresolved name.','publicReferenceImageCopies':False,'stageStatus':'IN_PROGRESS','retainedPreviousResiduals':old['retainedPreviousResiduals']+[old['residualInventory']]}
for r in q['releasePlan']:
 if r['section']=='E':r['status']='IN_PROGRESS'
q['progressHistory'].append({'at':now,'internalBatch':'R62-E-ADOPTION','action':'Read entire E61 requirement section and existing runtime declarations; retain all previous residuals. Official front photos actually viewed for Fengxian, Zhongcui and Yonghe; model differences and image coverage still being checked. No geometry or visual acceptance claimed.','wholeSectionAccepted':False,'browserAccepted':False})
q['summary']=summarize(q);write_queue(q,expected_raw_sha256=rawhash)
r=next(r for r in q['releasePlan'] if r['section']=='E');path=D/'RELEASES/R62-E.json';data=json.loads(path.read_text());data['release']=r;data['objects']=items;path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
resume=D/'RESUME.md';archive=D/'RESUME-R61-STAGE.md';assert not archive.exists();archive.write_bytes(resume.read_bytes())
resume.write_text('''# R62-E continuation

Single authority: QUEUE.json and its verified gzip parts through
scripts/photo-fidelity/queue_storage.py. Derived R62-E.json is not a second truth.
Frozen R61 base: 6b396800b6a03582aebf513fcef4966e9f5d0db3. Its remote receipt is
pending; do not guess an upload parent. R61 remains immutable.

All E61 / 854 checks / 33 existing declaration audits and EXPAND-01, -05, -06
remain required. Preserve all 398 FC IDs, all 154 baseline declaration audits,
all seven expansion tasks, and every A-D engineering/source/visual residual.
An unbound rear/side hall label is not automatically a missing physical building.

First source comparison: official Fengxian front photograph and architectural
text establish nine bays and double eaves; existing generic configuration has
15 generated bays and one eave. Inspect actual geometry before a bounded fix.
Retain R39 empty/unknown ritual inventory, original footprint and anonymous
optional characters. Modern exhibits must not become purported Qing bedrooms.
Existing east rear-hall profiles, Yonghe open canopy, Zhongcui veranda, Jingyang
three-bay hip roof and Yanxi ruin/storehouses must not be claimed as new work.

Official image/PDF caches stay outside the repository and production package.
Actual CPU renders support geometry review only, not browser/WebGL acceptance.
Do not retry denied browser operations, modify main/credentials or deploy as a
side effect. Continue full E executable/source scan after internal 3-5 item batches.
''')
print('Adopted E:',len(originals),features,len(items)-len(originals))
