import re,json,collections
from pathlib import Path
root=Path('/workspace/scratch/02a8023d1a85/r72-nightlife-safety');meta=json.loads((root/'reports/r72-nightlife-safety/current-state-baseline-comparison.json').read_text())
logs={k:Path(p).read_text() for k,p in [('R71','/tmp/r72-current-state-r71-baseline.log'),('R72','/tmp/r72-current-state.log')]}
def norm(s):return re.sub(r'pid: \d+','pid: <ID>',re.sub(r'/workspace/scratch/02a8023d1a85/r(?:71-m-duanmen|72-nightlife-safety)','<root>',s))
def parse(s):
 out={}
 for block in re.split(r'\ntest at ',s)[1:]:
  loc,_,rest=block.partition('\n');m=re.match(r'✖ (.*?) \([\d.]+ms\)\n([\s\S]*)',rest)
  if m:out[m[1]]={'location':loc,'failure':m[2]}
 return out
D={k:parse(s) for k,s in logs.items()}
for title in meta['sharedFailedTitles']:
 if not title.startswith('tests/current-state/'):continue
 for key,s in logs.items():
  lines=s.splitlines();i=next(i for i,l in enumerate(lines) if l.startswith('✖ '+title+' ('));prev=lines[max(0,i-65):i];errs=[j for j,l in enumerate(prev) if re.match(r'(AssertionError|TypeError|Error)[: \[]',l)]
  if errs:D[key][title]['failure']='\n'.join(prev[errs[-1]:])
affectedFiles=set('r31-qianqing-material r32-crest-scene-retention r32-frieze-scene-retention r32-screen-scene-retention r33-scene-retention r34-scene-retention qinan-exterior-routes r32-route-retention taihe-core-geometry taihe-core-source-guard walkable-four-buildings zhaode-gate-routes r34-night-lighting terrace-side-stairs qinan-hall r31-qianqing-scene r32-resident-scene'.split())
rows=[]
for title in meta['sharedFailedTitles']:
 a,b=D['R71'][title],D['R72'][title];same=norm(a['failure'])==norm(b['failure']);file=Path(b['location'].split(':')[0]).name.removesuffix('.test.mjs')
 category='R72-related actual drift' if not same else 'Same first failure in R72-affected area; later assertions masked' if file in affectedFiles else 'Same old contract first failure; no new failure evidence'
 rows.append({'title':title,'location':b['location'],'category':category,'sameFailureAfterPathAndPidNormalization':same,'baselineFailure':norm(a['failure']),'candidateFailure':norm(b['failure'])})
report={'schema':1,'scope':'Original 144 shared failed titles, with full-file import errors inspected rather than wrapper text only','sourceLogs':['/tmp/r72-current-state.log','/tmp/r72-current-state-r71-baseline.log'],'counts':dict(collections.Counter(r['category'] for r in rows)),'caution':'Same first failure does not prove all later assertions or dependent R72 behavior passed. No historical fixture is migrated or weakened. Titles reflect the original logs, before subsequent Qinan test migration.','rows':rows}
out='/tmp/r72-current-state-shared-failure-audit.json';Path(out).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'output':out,'counts':report['counts']},ensure_ascii=False))
