from pathlib import Path
import json,re,gzip,hashlib,collections,subprocess
root=Path('/workspace/scratch/02a8023d1a85/r158-arrow-integrate');e=root/'docs/photo-fidelity/batches/r157-taihemen/production-integration-20261031';out=Path('/tmp/r157-c-independent-review/production-final-0610')
def raw(p):
 p=Path(p);return p.read_bytes() if p.exists() else gzip.decompress(Path(str(p)+'.gz').read_bytes())
def sha(b):return hashlib.sha256(b).hexdigest()
def rows(p,kind='spec'):
 s=raw(p).decode();rr=[(a=='✔',re.sub(r' \([\d.]+ms\)$','',b)) for a,b in re.findall(r'^(✔|✖) (.+)$',s.split('✖ failing tests:')[0],re.M)] if kind=='spec' else [(a=='ok',b) for a,b in re.findall(r'^(ok|not ok) \d+ - (.+)$',s,re.M)]
 n=int(re.search((r'^ℹ tests (\d+)$' if kind=='spec' else r'^# tests (\d+)$'),s,re.M)[1]);assert len(rr)==n,(p,len(rr),n);return rr
def count(r,fail=False):return collections.Counter(name for ok,name in r if not fail or not ok)
def stats(r):return [len(r),sum(ok for ok,_ in r),sum(not ok for ok,_ in r)]
manifest=json.loads((e/'source-final-0610.json').read_text());paths=set(subprocess.check_output(['git','ls-files','src','data'],cwd=root,text=True).splitlines()+subprocess.check_output(['git','ls-files','--others','--exclude-standard','src','data'],cwd=root,text=True).splitlines());assert paths==set(manifest);assert all(sha((root/p).read_bytes())==v for p,v in manifest.items())
previous=json.loads((e/'source-live-0556.json').read_text());changed=[p for p,h in manifest.items() if previous.get(p)!=h];assert changed==['src/scene/palace/TaihemenObservedTransaction.js']
fullj=json.loads((e/'final-current-state-result.json').read_text()); parts=fullj['parts'];assert all(sha(raw(e/p['path']))==p['sha256'] for p in parts)
full=rows(e/parts[0]['path']);full.remove((False,'tests/current-state/qinan-exterior-stair-safety.test.mjs'));full+=rows(e/parts[1]['path'],'tap')+rows(e/parts[2]['path'],'tap');before=rows(fullj['baselineLog']);assert sha(raw(fullj['baselineLog']))==fullj['baselineSHA256'];assert count(full)==count(before);assert count(full,True)==count(before,True);assert stats(full)==[1313,1103,210]
bj=json.loads((e/'final-batch-result.json').read_text());batch=rows(e/'batch-final-0611.log');assert sha(raw(e/'batch-final-0611.log'))==bj['logSHA256']; replacements=[('tests/photo-fidelity/batches/r158-arrow-integration/cumulative-world.test.mjs','batch-arrow-tap-0628.log'),('tests/photo-fidelity/batches/r158-wenyuan/routes.test.mjs','batch-wenyuan-tap-0628.log'),('tests/photo-fidelity/batches/wuying-three-bridge-rails.test.mjs','batch-wuying-compact-tap-0628.log')]
for name,p in replacements:batch.remove((False,name));batch+=rows(e/p,'tap');assert sha(raw(e/p))==bj['replayLogHashes'][p]
oldpath=root.parent/'r157-taihe-integration-evidence-0503';oldbatch=rows(oldpath/'batch-0525.log');oldbatch.remove((False,'tests/photo-fidelity/batches/taihe-instruments-world.test.mjs'));oldbatch+=rows(oldpath/'world-live-1536-0527.tap','tap');oldbatch=[(ok,bj['inheritedDocumentedRenames'].get(name,name)) for ok,name in oldbatch];assert stats(oldbatch)==[320,319,1];assert stats(batch)==[404,403,1];assert not count(oldbatch)-count(batch);assert count(batch,True)==count(oldbatch,True)
bytej=json.loads((e/'replayed-original-test-byte-provenance.json').read_text());byte_checks=[]
for f in bytej['files']:
 b=(root/f['path']).read_bytes();baseline=subprocess.check_output(['git','show','5d8c713ee3885f43935f3a203b9d34012497339c:'+f['path']],cwd=root);assert sha(b)==f['SHA256'];assert b==baseline;byte_checks.append(f['path'])
assert sha((root/bytej['compactStrictPreload']).read_bytes())==bytej['compactStrictPreloadSHA256']
ident=json.loads((e/'build-identity-final-0622.json').read_text()); builds={};launcher=raw(e/'final-gates-launcher-0611.log').decode()
for name,base in [('gugong','/gugong/'),('pages','/forbidden-city-3d/'),('root','/')]:
 log=raw(e/f'build-final-{name}-0611.log');s=log.decode();assert '560 modules transformed' in s;assert 'built in' in s;assert f'BUILD_{name}_EXIT=0' in launcher
 actual=json.loads((root.parent/'r157-taihemen-c-integration-evidence-0537/builds-final-0611'/name/'build-info.json').read_text());assert actual==ident[name];assert actual['base']==base;builds[name]={'logSHA256':sha(log),'identity':actual}
promo=json.loads((e/'promotion-final-provenance-0610.json').read_text());assert all(sha((root/f['productionPath']).read_bytes())==f['productionSHA256'] and sha((root/f['authorPath']).read_bytes())==f['authorSHA256'] for f in promo['modules'])
cpus=json.loads((e/'final-cpu-byte-equivalence-0611.json').read_text());assert all(sha((e/'cpu-production-final-0610'/p['name']).read_bytes())==p['finalPNG_SHA256']==p['earlierPNG_SHA256'] for p in cpus['views'])
result={'sourceExact':len(paths),'sourceManifestSHA256':sha((e/'source-final-0610.json').read_bytes()),'changedSince0556':changed,'full':stats(full),'fullBaselineTitlesAndFailureMultisetsEqual':True,'batch':stats(batch),'inheritedBatch':stats(oldbatch),'addedBatchTitles':sum((count(batch)-count(oldbatch)).values()),'newBatchFailures':list((count(batch,True)-count(oldbatch,True)).elements()),'unchangedOriginalReplayFiles':byte_checks,'promotionSourceHashes':len(promo['modules']),'cpuHashes':len(cpus['views']),'builds':builds}
(out/'evidence-verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
