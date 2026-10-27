#!/usr/bin/env python3
"""Read-only comparison of actual exported merged triangles. Does not build a world.
Not a GPU render, independent controller replay, or surface survey.
"""
from pathlib import Path
import gzip,json,collections,hashlib,datetime,subprocess,sys
out=Path(__file__).resolve().parent
if '--root' in sys.argv:
 w=Path(sys.argv[sys.argv.index('--root')+1]).resolve()
else:
 candidates=[p/'r119-jiaotai-room' for p in [out,*out.parents]]+[p for p in [out,*out.parents] if (p/'src').is_dir()]
 w=next((p for p in candidates if (p/'scripts/build-identity.mjs').is_file()),None)
 if w is None:raise SystemExit('Pass --root /absolute/path/to/r119-worktree')
v=w/'reports/r119-jiaotai'/('visual-final' if '--final' in sys.argv else 'visual')
sha=lambda b:hashlib.sha256(b).hexdigest()
def source():
 f={str(p.relative_to(w)):sha(p.read_bytes()) for d in ['src','data'] for p in sorted((w/d).rglob('*')) if p.is_file()}
 return {'fileHashes':f,'independentAggregate':sha(json.dumps(f,sort_keys=True,separators=(',',':')).encode())}
buildfp=lambda:subprocess.check_output(['node','--input-type=module','-e',"import {sourceFingerprint} from './scripts/build-identity.mjs';console.log(sourceFingerprint(process.cwd()));"],cwd=w,text=True).strip()
start=source(); startBuild=buildfp(); before=json.load(gzip.open(v/'room-before-high.json.gz','rt')); after=json.load(gzip.open(v/'room-after-high.json.gz','rt'))
def key(t):return json.dumps([t['name'],t['v']],separators=(',',':'))
a=collections.Counter(map(key,before['triangles']));b=collections.Counter(map(key,after['triangles']));add=list((b-a).elements());rem=list((a-b).elements())
def group(seq):
 d=collections.defaultdict(list)
 for s in seq:
  name,vs=json.loads(s);d[name].extend(vs)
 return {n:{'triangles':len(vs)//3,'min':[min(p[i] for p in vs) for i in range(3)],'max':[max(p[i] for p in vs) for i in range(3)]} for n,vs in d.items()}
g=group(add); rg=group(rem)
assert set(rg)=={'后三宫_jiaotai-central-atlas'}
assert len(rem)==10 and len(add)==1330
for s in add:
 n,vs=json.loads(s)
 if n=='后三宫_jiaotai-room-atlas-r119':
  assert all(p[1]>7.16 and ((abs(p[0])<=3.31 and abs(p[2]-357.12)<=3.31) or p[0]>8.8) for p in vs)
 elif n=='jiaotai-central-near_jiaotai-central-atlas':assert all(p[1]>8.42 for p in vs)
 elif n=='后三宫_jiaotai-central-atlas':
  old=rg[n];assert all(old['min'][i]-1e-6<=p[i]<=old['max'][i]+1e-6 for p in vs for i in range(3))
 else:raise AssertionError(n)
textures=[]
for t in before['textures']:
 match=[u for u in after['textures'] if (u['name'],u['width'],u['height'],u['sha256'])==(t['name'],t['width'],t['height'],t['sha256'])]
 textures.append({'name':t['name'],'size':[t['width'],t['height']],'byteExactRetained':bool(match),'beforeFile':t['file']})
assert sum(not t['byteExactRetained'] for t in textures)==1
for t in textures:
 if t['name'].startswith('r54-jiaotai-'):assert t['byteExactRetained']
# Compare central atlas by its actual material mesh binding, not guessed file index.
def atlas_bytes(d):
 tri=next(t for t in d['triangles'] if t['name']=='后三宫_jiaotai-central-atlas')
 t=d['textures'][tri['texture']];assert [t['width'],t['height']]==[1024,512]
 return gzip.open(v/t['file'],'rb').read()
ab,bb=atlas_bytes(before),atlas_bytes(after)
def cell(raw,n):
 x,y=(n%4)*256,(n//4)*256
 return b''.join(raw[((y+r)*1024+x)*4:((y+r)*1024+x+256)*4] for r in range(256))
centralCells=[{'cell':n,'byteExactRetained':cell(ab,n)==cell(bb,n)} for n in range(8)]
assert [r['cell'] for r in centralCells if not r['byteExactRetained']]==[2,3]
camera={}
for c in ['front','clock','caisson']:
 x=json.load(open(v/(c+'-before-high.json')));y=json.load(open(v/(c+'-after-high.json')));assert x['camera']==y['camera'];camera[c]=x['camera']
end=source();endBuild=buildfp();assert start==end and startBuild==endBuild
exportBindings={stage:json.load(open(v/('export-'+stage+'-high.json'))) for stage in ['before','after']}
if '--final' in sys.argv:
 for e in exportBindings.values():assert e['beforeSourceFingerprint']==e['afterSourceFingerprint']
 assert exportBindings['after']['afterSourceFingerprint']==startBuild
 assert exportBindings['before']['afterSourceFingerprint']=='a20989ae9a74d6d2deb686bf1e76b6fc8d33b8f599918b66d8e5816cabd90333'

files={str(p.relative_to(w)):sha(p.read_bytes()) for p in sorted(v.iterdir()) if p.is_file() and ('before-high' in p.name or 'after-high' in p.name) and p.name.startswith(('front','clock','caisson','export','room'))}
result={'UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=w,text=True).strip(),'status':subprocess.check_output(['git','status','--short'],cwd=w,text=True),'source':start,'buildSourceFingerprint':startBuild,'exportBindings':exportBindings,'sourceSameBeforeAfter':True,'scope':'Actual exported triangle-position/image comparison only; exported snapshot is bound by hashes. Exporter generation binding is recorded when available; final mode requires current build source fingerprint to equal after-export before/after fingerprints. No fresh scene build or independent movement replay.','beforeTriangles':len(before['triangles']),'afterTriangles':len(after['triangles']),'added':g,'removed':rg,'delta':len(add)-len(rem),'checks':['new geometry only west/central frame or existing screen field envelope','all other exported triangle vertex positions including old caisson retained exact','existing selected textures byte-exact except central atlas','textile pixels unchanged','all three cameras exact'],'textures':textures,'centralAtlasCells':centralCells,'cameras':camera,'artifactHashes':files}
(out/('final-actual-geometry-difference.json' if '--final' in sys.argv else 'actual-geometry-difference.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['UTC','sourceSameBeforeAfter','beforeTriangles','afterTriangles','added','removed','delta','checks']},ensure_ascii=False,indent=2))
