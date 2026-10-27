import json,gzip,hashlib,collections,pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[2]; out=root/'reports/r126-chengqian/final-ready'; old=root.parent/'r125-chengqian-rear-court/reports/r125-chengqian/final-ready'
def j(p):return json.load(gzip.open(p,'rt') if str(p).endswith('.gz') else open(p))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rows(d):return collections.Counter(json.dumps(t,sort_keys=True,separators=(',',':')) for t in d)
result={'scope':'saved actual exports and clean startup readback; not fresh GPU or complete heap','files':{},'qualities':{}}
new_faces=None
for q in ['high','low']:
 p=out/q/f'room-final-{q}.json.gz'; b=old/f'room-final-{q}.json.gz';a,d=j(p),j(b);ac,dc=rows(a['triangles']),rows(d['triangles']);assert not dc-ac;added=ac-dc;assert sum(added.values())==244
 if new_faces is None:new_faces=added
 else:assert added==new_faces
 texture=lambda x:[{k:v for k,v in t.items() if k!='file'} for t in x['textures']]
 assert texture(a)==texture(d)
 for t in a['textures']:
  data=gzip.open(p.parent/t['file'],'rb').read();assert hashlib.sha256(data).hexdigest()==t['sha256']
 physical=j(out/q/'final-physical.json');oldphysical=j(root/'reports/r126-chengqian/baseline/final-physical.json')
 for k in ['colliders','walkables','rooms','mapItems']:assert not rows(oldphysical[k])-rows(physical[k])
 if q=='high':assert a['triangles']==j(root/'reports/r126-chengqian/plain-back/room-after-high.json.gz')['triangles']
 e=j(out/q/f'export-final-{q}.json');assert e['beforeSourceFingerprint']==e['afterSourceFingerprint']=='ba885f34073e6fde52f2ee6cb59d2225190173ae7fc5bb0c3d966bf9dace9073'
 s=j(root/f'reports/r126-chengqian/startup/{q}.json');assert not s['maturity']['pending'] and not s['maturity']['assetErrors'];assert len(s['maturity']['paintStates'])==3 and all(x['state']=='ready' for x in s['maturity']['paintStates']);assert all(x['beforeBuilds']==x['buildCount']==7 and not x['queued'] for x in s['entryProtection']['rows'][:2])
 result['qualities'][q]={'triangles':len(a['triangles']),'oldRowsRetained':len(d['triangles']),'added':sum(added.values()),'textures':len(a['textures']),'decodedRgbaBytes':sum(t['width']*t['height']*4 for t in a['textures']),'physical':{k:len(physical[k]) for k in ['colliders','walkables','rooms','mapItems']},'exportSource':e['beforeSourceFingerprint'],'startupCommit':s['binding']['commit'],'startupAllReadyMs':s['allReadyCpuMs'],'setupMs':s['readyCpuMs'],'firstEntryMs':[x['ms'] for x in s['entryProtection']['rows'][:2]],'ordinaryReturnMs':[x['ms'] for x in s['entryProtection']['rows'][2:]],'ttlExpiryMs':s['entryProtection']['expiry']['ms'],'startupInputFiles':len(s['binding']['runtimeFiles'])}
 for f in [p,b,out/q/f'export-final-{q}.json',root/f'reports/r126-chengqian/startup/{q}.json']:result['files'][str(f.relative_to(root) if f.is_relative_to(root) else f)]=sha(f)
result['head']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip();result['newFacesExactHighLow']=True
(out/'final-readback.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
