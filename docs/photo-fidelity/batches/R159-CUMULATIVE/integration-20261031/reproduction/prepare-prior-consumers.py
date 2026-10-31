from pathlib import Path
import difflib,json
r=Path('/workspace/scratch/02a8023d1a85/r158-arrow-integrate');e=Path('/tmp/r159-cumulative-evidence-0854');changes=[]
def sub(s,a,b):
 assert s.count(a)==1,(a,s.count(a));return s.replace(a,b)
paths=['r158-integration/cumulative-world.test.mjs','r158-arrow-integration/cumulative-world.test.mjs','r158-wenhua-gate-production/world.test.mjs','taihe-instruments-world.test.mjs','taihemen-facilities-production-world.test.mjs','r158-wuying-production/world.test.mjs']
for rel in paths:
 p='tests/photo-fidelity/batches/'+rel;old=(r/p).read_text();s=old;up='../../../lib/' if '/' in rel else '../../lib/'
 s="// R159 comparison-only: authenticate six new solids before removing them from NEW aligned arrays; all movement stays raw W.\nimport {r159JiaotaiPriorComparison} from '"+up+"r159-jiaotai-prior-comparison.mjs';\n"+s
 if rel in paths[:2]:
  s=sub(s,'const priorPhysics=wenhua493PhysicsView(W,wuying55PhysicsView(taiheWorldPhysics(W)));','const comparison=r159JiaotaiPriorComparison(W,taiheWorldPhysics(W)),priorPhysics=wenhua493PhysicsView(comparison.world,wuying55PhysicsView(comparison.physics));')
  s=sub(s,'assert.equal(W.cm.colliders.length,30876);','assert.equal(W.cm.colliders.length,30882);assert.equal(comparison.world.cm.colliders.length,30876);')
 elif rel=='r158-wenhua-gate-production/world.test.mjs':
  s=sub(s,'const rawPhysics=taiheWorldPhysics(W),p=wuying55PhysicsView(rawPhysics),owned=new Set(W.cm.colliders.flatMap','const rawPhysics=taiheWorldPhysics(W),comparison=r159JiaotaiPriorComparison(W,rawPhysics),p=wuying55PhysicsView(comparison.physics),owned=new Set(comparison.world.cm.colliders.flatMap')
  s=s.replace('wenhua493PhysicsView(W,','wenhua493PhysicsView(comparison.world,')
  s=sub(s,'[...owned].find(i=>W.cm.colliders[i].xiqingRoofSurface)','[...owned].find(i=>comparison.world.cm.colliders[i].xiqingRoofSurface)')
  s=s.replace('{...W,cm:{...W.cm,colliders:W.cm.colliders.map','{...comparison.world,cm:{...comparison.world.cm,colliders:comparison.world.cm.colliders.map')
  s=sub(s,"scope:'ACTUAL_UNINJECTED_CUMULATIVE_WORLD',colliders:p.rows.length","scope:'ACTUAL_UNINJECTED_CUMULATIVE_WORLD_WITH_EXPLICIT_R159_PRIOR_COMPARISON',rawColliders:rawPhysics.rows.length,colliders:p.rows.length")
 elif rel=='taihe-instruments-world.test.mjs':
  s=sub(s,'rawPhysical=taiheWorldPhysics(W),actual=wenhua493PhysicsView(W,wuying55PhysicsView(rawPhysical))','rawPhysical=taiheWorldPhysics(W),comparison=r159JiaotaiPriorComparison(W,rawPhysical),actual=wenhua493PhysicsView(comparison.world,wuying55PhysicsView(comparison.physics))')
  s=sub(s,'compareInstrumentsWithObservedApproach(W,a,baseline,approach)','compareInstrumentsWithObservedApproach(comparison.world,a,baseline,approach)')
  s=sub(s,'!W.cm.colliders[i].mesh.taihemenObservedSource','!comparison.world.cm.colliders[i].mesh.taihemenObservedSource')
 elif rel=='taihemen-facilities-production-world.test.mjs':
  s=sub(s,'rawPhysical=taiheWorldPhysics(W),physical=wenhua493PhysicsView(W,wuying55PhysicsView(rawPhysical))','rawPhysical=taiheWorldPhysics(W),comparison=r159JiaotaiPriorComparison(W,rawPhysical),physical=wenhua493PhysicsView(comparison.world,wuying55PhysicsView(comparison.physics))')
  s=sub(s,'indices=new Set(W.cm.colliders.flatMap','indices=new Set(comparison.world.cm.colliders.flatMap')
 elif rel=='r158-wuying-production/world.test.mjs':
  s=sub(s,'const raw=taiheWorldPhysics(W),colliders=W.cm.colliders,supports=W.cm.walkables,summary=assertWuying55PhysicsProof(raw);','const raw=taiheWorldPhysics(W),comparison=r159JiaotaiPriorComparison(W,raw),colliders=W.cm.colliders,supports=W.cm.walkables,summary=assertWuying55PhysicsProof(comparison.physics),report={scope:"ACTUAL_RAW_R159_WORLD_AND_EXPLICIT_PRIOR_WUYING_CONTRACT",rawWorldColliders:raw.rows.length,priorWuyingContract:summary};')
  s=sub(s,'assert.equal(W.cm.colliders.length,summary.rawColliders);','assert.equal(W.cm.colliders.length,30882);assert.equal(comparison.world.cm.colliders.length,summary.rawColliders);')
  s=s.replace('JSON.stringify(summary,null,2)','JSON.stringify(report,null,2)').replace('console.log(JSON.stringify(summary))','console.log(JSON.stringify(report))')
 changes.append((p,old,s))
patch=''.join(''.join(difflib.unified_diff(a.splitlines(True),b.splitlines(True),fromfile='a/'+p,tofile='b/'+p))for p,a,b in changes)
(e/'prior-consumers-proposed.patch').write_text(patch);print('prepared',len(changes),'QA files',len(patch),'bytes; NOT applied')
