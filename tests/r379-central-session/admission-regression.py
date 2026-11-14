"""Bounded real-Git admission integration test. No build, browser, or upload."""
from pathlib import Path
import os,json,subprocess,tempfile,shutil,sys
import yaml
root=Path(__file__).resolve().parents[2]
pinpath='tests/r379-central-session/pins.json'
pins=json.loads((root/pinpath).read_text())
workflow=yaml.safe_load((root/'.github/workflows/r379-central-session.yml').read_text())
shell=next(s['run']for s in workflow['jobs']['review']['steps']if s.get('name','').startswith('Admit exact'))
assert pins['changes']==sorted(pins['changes'],key=lambda x:x[1].encode())
report=[]
with tempfile.TemporaryDirectory(prefix='r379-admission-')as tmp:
 repo=Path(tmp)/'repo';repo.mkdir();e=Path(tmp)/'evidence';e.mkdir()
 def git(*args):return subprocess.check_output(['git',*args],cwd=repo,text=True,stderr=subprocess.STDOUT).strip()
 git('init','-q');git('config','user.name','Local admission fixture');git('config','user.email','fixture@example.invalid')
 changed={p for a,p in pins['changes']}
 for p in {**pins['sourcePins'],**pins['retainedPins']}:
  if p not in changed:
   dest=repo/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/p,dest)
 for action,p in pins['changes']:
  if action=='M':
   dest=repo/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text('Synthetic prior bytes used only to exercise modified path status.\n')
 git('add','-f','.');git('commit','-qm','synthetic parent with retained bytes and marked modified-path placeholders')
 parent=git('rev-parse','HEAD');tree=git('rev-parse','HEAD^{tree}')
 for _,p in pins['changes']:
  dest=repo/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/p,dest)
 current={**pins,'frozen':True,'parent':parent,'parentTree':tree}
 (repo/pinpath).write_text(json.dumps(current,indent=2)+'\n');git('add','-f','.');git('commit','-qm','synthetic candidate')
 good=git('rev-parse','HEAD')
 # The workflow is byte-identical; only its pinned expected release-parent literal is replaced in the executed shell.
 assert shell.count(pins['parent'])==1
 command=shell.replace(pins['parent'],parent)
 def run(label,ok,sha=None):
  r=subprocess.run(['bash','-c',command],cwd=repo,env={**os.environ,'GITHUB_SHA':sha or git('rev-parse','HEAD'),'EVIDENCE_DIR':str(e)},capture_output=True,text=True,timeout=30)
  row={'case':label,'exit':r.returncode,'stderr':r.stderr};report.append(row)
  assert (r.returncode==0)==ok,row
 def mutated(label,edit):
  git('reset','--hard',good);git('clean','-fdx');p=json.loads((repo/pinpath).read_text());edit(p);(repo/pinpath).write_text(json.dumps(p,indent=2)+'\n');git('add',pinpath);git('commit','--amend','--no-edit','-q');run(label,False)
 # RED reproduces the historical schema-before-pins ordering defect using the current actual paths.
 mutated('RED unsorted path array',lambda p:p['changes'].reverse())
 git('reset','--hard',good);run('GREEN complete actual admission shell',True)
 receipt=json.loads((e/'checkout-identity.json').read_text());assert receipt['parent']==parent and receipt['parentTree']==tree and receipt['head']==good and receipt['changes']==current['changes']
 mutated('missing path',lambda p:p['changes'].pop())
 mutated('extra path',lambda p:p['changes'].append(['A','not-present']))
 mutated('wrong parent',lambda p:p.update(parent='0'*40))
 mutated('wrong parent tree',lambda p:p.update(parentTree='0'*40))
 mutated('wrong source hash',lambda p:p['sourcePins'].__setitem__(next(iter(p['sourcePins'])),'0'*64))
 git('reset','--hard',good);p=next(iter(current['sourcePins']));(repo/p).write_bytes((repo/p).read_bytes()+b'\n');run('dirty tracked source bytes',False)
 # Commit corrupt source bytes but keep pins: clean-status passes; hash check must reject.
 git('add',p);git('commit','--amend','--no-edit','-q');run('clean committed pinned-byte corruption',False)
 git('reset','--hard',good);(repo/'untracked').write_text('x');run('untracked',False);git('clean','-fdx')
 (repo/'dist').mkdir();run('empty dist exists',False);(repo/'dist').rmdir()
 run('wrong GITHUB_SHA',False,'0'*40)
 run('final clean complete shell',True)
 output={'syntheticParent':parent,'syntheticParentTree':tree,'syntheticHead':good,'productionParent':pins['parent'],'productionParentTree':pins['parentTree'],'substitution':'Only expected parent literal in shell; temporary pins parent/tree and environment GITHUB_SHA reflect real fixture commits. All guards unchanged.','cases':report}
 print(json.dumps(output,indent=2))
