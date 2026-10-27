#!/usr/bin/env python3
"""Independent offline R120 ready export diff. No world construction/product writes."""
import collections, gzip, hashlib, json, pathlib, subprocess, sys, datetime
root=pathlib.Path(sys.argv[1]).resolve(); out=pathlib.Path(sys.argv[2]).resolve()
inputs=['index.html','main.js','style.css','src','data','public','package.json','package-lock.json','vite.config.js','release.json','scripts/build-identity.mjs']
def sha(b):return hashlib.sha256(b).hexdigest()
def git(*a):return subprocess.check_output(['git','-C',str(root),*a]).decode().strip()
def fp(release=None):
 h=hashlib.sha256()
 def visit(rel):
  p=root/rel
  if not p.exists():return
  if p.is_dir():
   for c in sorted(p.iterdir(),key=lambda p:p.name):visit(str(pathlib.PurePosixPath(rel)/c.name))
  else:
   b=release if rel=='release.json' and release is not None else p.read_bytes();h.update(f'{len(rel)}:{rel}:{len(b)}:'.encode());h.update(b)
 for p in inputs:visit(p)
 return h.hexdigest()
start=fp();head=git('rev-parse','HEAD');vs=root/'reports/r120-qianqing/visual';manifest={}
def read(p):
 b=p.read_bytes();manifest[str(p.relative_to(root))]={'bytes':len(b),'sha256':sha(b)};return b
def jread(p):return json.loads(read(p))
records={s:jread(vs/f'export-{s}-high.json')for s in ['before','after']}
rooms={s:json.loads(gzip.decompress(read(vs/f'room-{s}-high.json.gz')))for s in records}
for r in records.values():
 assert r['beforeSourceFingerprint']==r['afterSourceFingerprint'];assert set(r['paint']['states'].values())=={'ready'};assert not r['paint']['errors']
def key(t):return json.dumps([t['name'],t['v']],separators=(',',':'))
cs={s:collections.Counter(key(t)for t in r['triangles'])for s,r in rooms.items()}
def summary(c):
 result={}
 for k,n in c.items():
  name,vs=json.loads(k);r=result.setdefault(name,{'triangles':0,'min':[float('inf')]*3,'max':[-float('inf')]*3});r['triangles']+=n
  for v in vs:
   for d in range(3):r['min'][d]=min(r['min'][d],v[d]);r['max'][d]=max(r['max'][d],v[d])
 return result
textures={}
for s,r in rooms.items():
 textures[s]=[]
 for t in r['textures']:
  b=gzip.decompress(read(vs/t['file']));assert sha(b)==t['sha256'];assert len(b)==t['width']*t['height']*4
  textures[s].append({k:v for k,v in t.items()if k!='file'})
 for camera in ['front','west','east','ceiling','axis','rail']:
  read(vs/f'{camera}-{s}-high.png');read(vs/f'{camera}-{s}-high.json.gz')
old_release=subprocess.check_output(['git','-C',str(root),'show','7743ab31b5bfe022b8ebc389ca9faaee7a9ff1da:release.json'])
restored=fp(old_release)
assert restored==records['after']['afterSourceFingerprint'], 'Runtime beyond release differs from art export; record fresh review before accepting.'
assert textures['before']==textures['after']
for p in ['reports/r120-qianqing/retained-after.json','tests/fixtures/r120/r119-retained.json','reports/r120-qianqing/art-cost/pairs.json','reports/r120-qianqing/tests/pre-perf-art.tap','reports/r120-qianqing/tests/r118-protected.tap','reports/r120-qianqing/tests/previous-room-protection.tap','reports/r120-qianqing/tests/route-second.tap']:
 read(root/p)
end=fp();assert start==end
result={'generatedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'Read actual ready export; ordered vertices multiset keyed by actual final mesh name, not abstract primitives. Independently SHA-verify exported RGBA. No world built or product changed.','sourceCommit':head,'sourceFingerprintBefore':start,'sourceFingerprintAfter':end,'trackedRuntimeStatus':git('status','--porcelain','--',*inputs),'replacingOnlyReleaseWithR119ReproducesAfterFingerprint':restored,'exports':records,'triangleCounts':{s:len(r['triangles'])for s,r in rooms.items()},'added':summary(cs['after']-cs['before']),'removed':summary(cs['before']-cs['after']),'selectedTextureMetadataAndDecodedRGBAExact':textures['before']==textures['after'],'textureCount':len(textures['after']),'logicalSelectedTextureRGBABytes':sum(t['width']*t['height']*4 for t in textures['after']),'limits':['Offline export verification, not independent runtime rendering or swept body oracle.','CPU lacks CJK font; matching glyph pixels do not prove production plaque-glyph identity.','No GPU/PBR/mobile/final-browser-font claim.','No inference of historically measured dimensions or exact carving.'],'artifacts':manifest,'scriptSha256':sha(pathlib.Path(__file__).read_bytes())}
out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n');print(json.dumps({k:result[k]for k in ['sourceCommit','sourceFingerprintBefore','sourceFingerprintAfter','triangleCounts','added','removed','selectedTextureMetadataAndDecodedRGBAExact']},indent=2))
