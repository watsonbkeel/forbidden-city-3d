#!/usr/bin/env python3
"""Validate already-rendered CPU evidence; preserve every input and existing output."""
import pathlib, os, json, gzip, hashlib
import numpy as np
from PIL import Image
root=pathlib.Path(os.environ.get('P3C_FEMALE_OUT','reports/r50-followup/female-reference/candidate06-07')).resolve()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
oldroot=root.parent/'candidate06-06';old=json.load(gzip.open(oldroot/'models.json.gz'));new=json.load(gzip.open(root/'models.json.gz'));checks=[]
for a,b in zip(old['models'],new['models']):
 assert a['key']==b['key'];same={key:a['mesh'][key]==b['mesh'][key]for key in ['positions','normals','colors','indices','metadata']};assert all(same.values());checks.append({'key':a['key'],'equal':same})
animations=json.load(gzip.open(root/'animation-frames.json.gz'));assert len(animations['frames'])==24
for i,models in enumerate(animations['frames']):
 for j,m in enumerate(models):
  s=m['state'];assert s['phase']==.35 and s['amplitude']==.7 and s['walkSpeed']==([0,0,.35][j]) and s['time']==i/24*8
retimed=[]
for stem in ['female-reference-seated-idle-hand-motion','female-reference-life-motion']:
 source=root/(stem+'.gif');target=root/(stem+'-8s.gif');frames=[]
 with Image.open(source)as im:
  assert im.n_frames==24
  for i in range(24):im.seek(i);frames.append(im.convert('RGB'))
 if not target.exists():frames[0].save(target,save_all=True,append_images=frames[1:],duration=[330,330,340]*8,loop=0,disposal=2)
 with Image.open(target)as im:
  assert im.n_frames==24;durations=[]
  for i in range(24):
   im.seek(i);durations.append(im.info['duration']);assert np.array_equal(np.array(frames[i]),np.array(im.convert('RGB')))
  assert sum(durations)==8000
 retimed.append({'path':target.name,'frames':24,'displayDurationMilliseconds':8000,'frameDurationsMilliseconds':durations,'pixelsIdenticalToOriginalGif':True,'timingOnly':'333ms is quantized by GIF to 330ms; duration schedule 330/330/340 yields exactly 8 seconds without changing decoded pixels.'})
for name in ['p3c-render-female-idle-hand-motion.py','p3c-finalize-female-motion-evidence.py']:
 source=pathlib.Path('scripts')/name;target=root/name
 if target.exists():assert target.read_bytes()==source.read_bytes()
 else:target.write_bytes(source.read_bytes())
oldreview=json.load(open(oldroot/'visual-review.json'))
for e in oldreview['files']:
 if e['path'].endswith('.png'):assert sha(oldroot/e['path'])==e['sha256']
manifest=json.load(open(root/'export-manifest.json'));assert sha(root/'CharacterKit-source.js')==manifest['hashes']['src/scene/characters/CharacterKit.js'];assert sha(root/'Animation-source.js')==manifest['hashes']['src/scene/characters/CharacterAnimation.js']
local_only={'animation-frames.json.gz','female-reference-seated-idle-hand-motion.gif','female-reference-life-motion.gif','female-reference-seated-idle-keyframes-early.png'}
entries=[]
for p in sorted(root.iterdir()):
 if p.is_file() and p.name!='motion-review.json':
  e={'path':p.name,'sha256':sha(p),'bytes':p.stat().st_size,'publication':'local-not-committed'if p.name in local_only else'candidate-evidence'}
  if p.suffix=='.png':Image.open(p).verify();e['dimensions']=Image.open(p).size
  entries.append(e)
report={'status':'Internal CPU dynamic evidence only; not sent directly to user','kitSha256':sha(root/'CharacterKit-source.js'),'animationSha256':sha(root/'Animation-source.js'),'dynamicEvidence':retimed,'exportedSampleIntervalSeconds':8/24,'exportedTimeRangeSeconds':[0,23/24*8],'samplePhase':.35,'amplitude':.7,'modelScale':1,'staticReference':'candidate06-06/models.json.gz','staticComparison':checks,'staticComparisonBoundary':'Only the three exported review meshes are independently compared here. Positions, normals, vertex colors, indices and pose metadata match exactly. Exported meshes omit rig weight attributes, so this comparison does not imply those attributes match, nor does it substitute for full-template tests.','runtimeBoundary':'Seated/standing idle and root-relative walking deformation only; no runtime/world-space route, GPU, FPS or foot-lock proof. walkingRuntimeIntegration remains not-integrated in this isolated export.','visualReview':{'viewed':'Actual seated hand and three-person PNG contact sheets for frames 01,09,17.','finding':'Overlapping hands remain visible at the sampled phase=.35 idle times, without obvious disappearance into cloth. Head/upper-body motion and root-relative walking variation are visible in the overview.','limitation':'Pixel review is not a signed clearance/intersection test; owner numeric validation is separate.'},'frozenCandidate06PngHashesPreserved':True,'productionSourcesModifiedByRenderer':False,'existingEvidenceOverwritten':False,'files':entries,'reproduction':['P3C_FEMALE_OUT=<fresh-output> node scripts/p3c-render-female-reference-export.mjs --animation','P3C_FEMALE_OUT=<fresh-output> python scripts/p3c-render-female-idle-hand-motion.py','P3C_FEMALE_OUT=<fresh-output> python scripts/p3c-render-female-reference.py animation','P3C_FEMALE_OUT=<fresh-output> python scripts/p3c-finalize-female-motion-evidence.py']}
p=root/'motion-review.json';assert not p.exists();p.write_text(json.dumps(report,ensure_ascii=False,indent=2));print(p);print(json.dumps({'kitSha256':report['kitSha256'],'gifs':[{**e,'sha256':sha(root/e['path'])}for e in retimed]},indent=2))
