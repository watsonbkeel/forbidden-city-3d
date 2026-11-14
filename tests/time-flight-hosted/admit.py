"""Exact additions-only diagnostic child and clean product admission."""
import os,json,hashlib,subprocess,shutil
from pathlib import Path
H=Path.cwd().resolve(); D=H/'tests/time-flight-hosted'; P=Path('/tmp/time-flight-main-exact'); R=Path('/tmp/time-flight-runtime')
HEAD='8de5c83d25a669a014575a1489429f064a464496'
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(ok,msg):
 if not ok:raise ValueError(msg)
def main():
 check(len(__import__('sys').argv)==1,'no arguments');m=json.loads((D/'manifest.json').read_text())
 check(git(H,'rev-parse','HEAD')==os.environ['GITHUB_SHA'],'diagnostic head mismatch')
 check(git(H,'rev-list','--parents','-n','1','HEAD').split()==[os.environ['GITHUB_SHA'],HEAD],'diagnostic parent mismatch')
 check(not git(H,'status','--porcelain=v1','--untracked-files=all'),'dirty diagnostic checkout')
 changes=[line.split('\t') for line in git(H,'diff','--name-status','HEAD^','HEAD').splitlines()]
 expected=sorted([['A',p] for p in m['files']]+[['A','tests/time-flight-hosted/manifest.json']],key=lambda x:x[1].encode())
 check(changes==expected,'non-diagnostic changes')
 for p,h in m['files'].items():check(sha(H/p)==h,'harness mismatch '+p)
 check(git(P,'rev-parse','HEAD')==HEAD,'product head mismatch')
 check(git(P,'rev-parse','HEAD^{tree}')==m['productTree'],'product tree mismatch')
 check(not git(P,'status','--porcelain=v1','--untracked-files=all'),'dirty product checkout')
 pins=json.loads((D/'pins.json').read_text());check(pins['head']==HEAD,'pins head')
 for p,h in pins['source'].items():check(sha(P/p)==h,'product source mismatch '+p)
 check(not R.exists(),'runtime path already exists');shutil.copytree(D,R)
 runtime={str(R/p.relative_to(D)):sha(p) for p in D.rglob('*') if p.is_file()}
 e=Path(os.environ['EVIDENCE_DIR']);check(e.is_absolute() and not e.resolve().is_relative_to(P) and not e.resolve().is_relative_to(R),'external evidence required')
 identity={'frozen':True,'head':HEAD,'tree':m['productTree'],'diagnosticHead':os.environ['GITHUB_SHA'],'diagnosticTree':git(H,'rev-parse','HEAD^{tree}'),'sourcePins':pins['source'],'retainedPins':{},'diagnosticRuntimePins':runtime,'scope':'QA_ONLY_TIME_FLIGHT_FOCUS_NOT_PRODUCT_ACCEPTANCE'}
 with(e/'checkout-identity.json').open('x') as f:json.dump(identity,f,indent=2)
if __name__=='__main__':main()
