"""Exact diagnostic-only branch + exact product checkout; no execution here."""
import os,json,hashlib,subprocess,shutil
from pathlib import Path
H=Path.cwd().resolve(); D=H/'tests/minimap-hosted'; P=Path('/tmp/minimap-r379-exact')
HEAD='81506f2c075d2a04948f8497897d1ccb67087010'
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(ok,msg):
 if not ok:raise ValueError(msg)
m=json.loads((D/'manifest.json').read_text())
check(git(H,'rev-parse','HEAD')==os.environ['GITHUB_SHA'],'diagnostic head mismatch')
check(git(H,'rev-list','--parents','-n','1','HEAD').split()==[os.environ['GITHUB_SHA'],HEAD],'diagnostic parent mismatch')
check(not git(H,'status','--porcelain=v1','--untracked-files=all'),'dirty diagnostic checkout')
changes=[line.split('\t') for line in git(H,'diff','--name-status','HEAD^','HEAD').splitlines()]
expected=sorted([['A',p] for p in m['files']]+[['A','tests/minimap-hosted/manifest.json']],key=lambda x:x[1].encode())
check(changes==expected,'non-diagnostic changes')
for p,h in m['files'].items():check(sha(H/p)==h,'harness mismatch '+p)
check(git(P,'rev-parse','HEAD')==HEAD,'product head mismatch')
check(git(P,'rev-parse','HEAD^{tree}')==m['productTree'],'product tree mismatch')
check(not git(P,'status','--porcelain=v1','--untracked-files=all'),'dirty product checkout')
pins=json.loads((D/'export/pins.json').read_text())
for p,h in pins['source'].items():check(sha(P/p)==h,'product source mismatch '+p)
for p,h in pins['harness'].items():check(sha(D/'export'/p)==h,'export mismatch '+p)
for source,dest in [(D/'export',Path('/tmp/minimap-zone-export')),(D/'browser',Path('/tmp/minimap-browser-diagnostic'))]:
 check(not dest.exists(),'runtime path already exists');shutil.copytree(source,dest)
entry=Path('/tmp/minimap-hosted-entry.mjs');check(not entry.exists(),'entry exists');shutil.copyfile(D/'entry.mjs',entry)
runtime={str(entry):sha(entry)}
for p in (D/'browser').iterdir():runtime[str(Path('/tmp/minimap-browser-diagnostic')/p.name)]=sha(p)
e=Path(os.environ['EVIDENCE_DIR'])
identity={'frozen':True,'head':HEAD,'tree':m['productTree'],'diagnosticHead':os.environ['GITHUB_SHA'],'diagnosticTree':git(H,'rev-parse','HEAD^{tree}'),'sourcePins':pins['source'],'retainedPins':{},'exportHarnessPins':pins['harness'],'diagnosticRuntimePins':runtime,'scope':'QA_ONLY_PRODUCTION_MAP_METADATA_AND_NATIVE_CANVAS_NOT_BUG_ACCEPTANCE'}
with(e/'checkout-identity.json').open('x') as f:json.dump(identity,f,indent=2)
