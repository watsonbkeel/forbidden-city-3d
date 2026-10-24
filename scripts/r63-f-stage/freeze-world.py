from pathlib import Path
import json,hashlib,subprocess
P=Path(__file__).resolve().parents[2];p=P/'data/characters/world-source-freeze.json';raw=p.read_bytes();old=json.loads(raw);assert old['schemaVersion']==18
base='f87342d7e1506713df4a6877943eb377e8299593';assert subprocess.check_output(['git','show',base+':data/characters/world-source-freeze.json'],cwd=P)==raw
snap=p.with_name('world-source-freeze-r62-e.json')
if snap.exists():assert snap.read_bytes()==raw
else:snap.write_bytes(raw)
new=['TongdaoRoof','WestRearSouthWindows','QinzhengFootstool','WestUnknownAnnexInventory'];paths=[x['path'] for x in old['files']]+['src/scene/palace/special/'+n+'.js' for n in new];assert len(paths)==len(set(paths))==245
files=[{'path':s,'sha256':hashlib.sha256((P/s).read_bytes()).hexdigest()} for s in sorted(paths)];before={r['path']:r['sha256'] for r in old['files']};changes=[{'path':r['path'],'beforeSHA256':before[r['path']],'afterSHA256':r['sha256']} for r in files if r['path'] in before and before[r['path']]!=r['sha256']]
assert {r['path'] for r in changes}=={'src/scene/zones/ZoneBase.js','src/scene/palace/special/RemainingResidentialHalls.js'},changes
out={'schemaVersion':19,'baselineCommit':base,'purpose':'R63-F five bounded source/unknown-inventory work items; F55/726 full scan and residuals separate, no whole-section or browser acceptance.','provenance':{'previousWorldVersion':'R62-E','previousReleaseCommit':base,'previousManifestPath':str(snap.relative_to(P)),'previousManifestSHA256':hashlib.sha256(raw).hexdigest(),'previousFileCount':241,'fileCount':245,'changedPreviouslyTrackedSources':changes,'newlyTrackedSources':[r['path'] for r in files if r['path'] not in before],'characterRegistryKitAndCaps':'Exact unchanged from R62; all108/24 must bind anew in this source world.','acceptance':'RESULTS_IN_VERSIONED_REPORT_NOT_THIS_SOURCE_INPUT; BROWSER_ACCEPTANCE_NOT_PERFORMED'},'files':files};p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'files':len(files),'changed':len(changes),'new':len(new)}))
