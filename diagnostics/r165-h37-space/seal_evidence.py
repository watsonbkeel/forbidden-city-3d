"""Always retain existing evidence; sealing is not an acceptance verdict."""
import hashlib,json,os
from pathlib import Path
from evidence_io import write_json,write_bytes,guard_write
p=Path(os.environ['EVIDENCE_DIR']);p.mkdir(parents=True,exist_ok=True)
status={k:os.environ.get(k)for k in ['CHECKOUT_OUTCOME','SETUP_OUTCOME','PREFLIGHT_OUTCOME','ADMISSION_OUTCOME','PROBE_OUTCOME','GITHUB_SHA','GITHUB_RUN_ID','GITHUB_RUN_ATTEMPT']}
write_json(p,'STEP-OUTCOMES.json',status)
rows=[]
for f in sorted(p.rglob('*')):
 if f.is_symlink():raise RuntimeError('Artifact symlink rejected')
 if f.is_file()and f.name not in ['ARTIFACT-MANIFEST.json','CHECKSUMS.sha256']:
  b=f.read_bytes();rows.append({'path':f.relative_to(p).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
write_json(p,'ARTIFACT-MANIFEST.json',{'schema':1,'eventCommit':os.environ.get('GITHUB_SHA'),'runID':os.environ.get('GITHUB_RUN_ID'),'attempt':os.environ.get('GITHUB_RUN_ATTEMPT'),'files':rows,'notAnAcceptanceVerdict':True})
manifest=(p/'ARTIFACT-MANIFEST.json').read_bytes();rows.append({'path':'ARTIFACT-MANIFEST.json','sha256':hashlib.sha256(manifest).hexdigest()})
write_bytes(p,'CHECKSUMS.sha256',''.join(r['sha256']+'  '+r['path']+'\n'for r in rows).encode());guard_write(p)
print(json.dumps({'sealedPayloadFiles':len(rows),'rawFrameFiles':sum(r['path'].endswith('.frames.json')for r in rows),'notAnAcceptanceVerdict':True}))
