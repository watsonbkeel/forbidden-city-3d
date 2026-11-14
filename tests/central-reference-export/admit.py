"""Exact diagnostic-only branch + exact product checkout; no execution here."""
import os,json,hashlib,subprocess,shutil
from pathlib import Path
H=Path.cwd().resolve(); D=H/'tests/central-reference-export'; P=Path('/tmp/central-baseline-source')
HEAD='1851caeecc334fe2a811d78e29b7dfbec87138ed'
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(ok,msg):
 if not ok:raise ValueError(msg)
m=json.loads((D/'manifest.json').read_text())
check(git(H,'rev-parse','HEAD')==os.environ['GITHUB_SHA'],'diagnostic head mismatch')
check(git(H,'rev-list','--parents','-n','1','HEAD').split()==[os.environ['GITHUB_SHA'],HEAD],'diagnostic parent mismatch')
check(not git(H,'status','--porcelain=v1','--untracked-files=all'),'dirty diagnostic checkout')
changes=[line.split('\t') for line in git(H,'diff','--name-status','HEAD^','HEAD').splitlines()]
expected=sorted([['A',p] for p in m['files']]+[['A','tests/central-reference-export/manifest.json']],key=lambda x:x[1].encode())
check(changes==expected,'non-diagnostic changes')
for p,h in m['files'].items():check(sha(H/p)==h,'harness mismatch '+p)
check(git(P,'rev-parse','HEAD')==HEAD,'product head mismatch')
check(git(P,'rev-parse','HEAD^{tree}')==m['productTree'],'product tree mismatch')
check(not git(P,'status','--porcelain=v1','--untracked-files=all'),'dirty product checkout')
pins=json.loads((D/'pins.json').read_text())
for p,h in pins['source'].items():check(sha(P/p)==h,'source mismatch '+p)
for p,h in pins['harness'].items():check(sha(D/p)==h,'export mismatch '+p)
dest=Path('/tmp/central-reference-export');check(not dest.exists(),'runtime path exists');shutil.copytree(D,dest)
runtime={str(dest/p):sha(dest/p) for p in pins['harness']}
e=Path(os.environ['EVIDENCE_DIR'])
identity={'frozen':True,'head':HEAD,'tree':m['productTree'],'diagnosticHead':os.environ['GITHUB_SHA'],'diagnosticTree':git(H,'rev-parse','HEAD^{tree}'),'sourcePins':pins['source'],'retainedPins':{},'exportHarnessPins':pins['harness'],'diagnosticRuntimePins':runtime,'scope':'FIXED_REJECTED_RESEARCH_BASELINE_REFERENCE_EXPORT_NOT_ART_OR_PRODUCT_ACCEPTANCE'}
with(e/'checkout-identity.json').open('x') as f:json.dump(identity,f,indent=2)
