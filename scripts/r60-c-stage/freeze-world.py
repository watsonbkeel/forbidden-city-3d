from pathlib import Path
import json,hashlib
p=Path('data/characters/world-source-freeze.json');raw=p.read_bytes();old=json.loads(raw);assert old['schemaVersion']==15
snap=p.with_name('world-source-freeze-r59-b-batch2.json');assert snap.read_bytes()==raw
new=['WuyingGateSouthWindows','WuyingGateSouthRails','YudeDomeBrickCourses','NanxunReviewedInterior','XihuaOuterWindowBand'];paths=[x['path'] for x in old['files']]+['src/scene/palace/special/'+n+'.js' for n in new];assert len(paths)==len(set(paths))==228
files=[{'path':s,'sha256':hashlib.sha256(Path(s).read_bytes()).hexdigest()} for s in sorted(paths)];before={r['path']:r['sha256'] for r in old['files']};changes=[{'path':r['path'],'beforeSHA256':before[r['path']],'afterSHA256':r['sha256']} for r in files if r['path'] in before and before[r['path']]!=r['sha256']];assert len(changes)==3
out={'schemaVersion':16,'baselineCommit':'44ba4706a2088b6a4105d13cf3936cced125a880','purpose':'R60-C bounded visible surfaces and unsupported-inventory correction; all C17 scan is tracked separately, no full visual acceptance.','provenance':{'previousWorldVersion':'R59-B-batch2','previousReleaseCommit':'44ba4706a2088b6a4105d13cf3936cced125a880','previousManifestPath':str(snap),'previousManifestSHA256':hashlib.sha256(raw).hexdigest(),'previousFileCount':223,'fileCount':228,'changedPreviouslyTrackedSources':changes,'newlyTrackedSources':[r['path'] for r in files if r['path'] not in before],'characterRegistryKitAndCaps':'Exact unchanged from R59; all108/24 must bind anew in this source world.','acceptance':'RESULTS_IN_VERSIONED_REPORT_NOT_THIS_SOURCE_INPUT; BROWSER_ACCEPTANCE_NOT_PERFORMED'},'files':files};p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
s=Path('tests/r59-b-batch2-world.test.mjs').read_text();s="import {assertR60CInWorld,r60CWorldRoutes} from './lib/r60-c-world-check.mjs';\n"+s
s=s.replace("const out='reports/r59-b-batch2'","const out='reports/r60-c-world'").replace('R59-B second-batch static/all-zone world','R60-C static/all-zone world').replace('R59-B cumulative second batch: all108 actual bindings and visibility, twenty-four paths, scoped gate/wall changes in one world','R60-C five bounded work items: fresh all108 bindings/visibility,24 paths and scoped seven C routes in one world').replace('/tmp/r58-a-batch5-geometry','/tmp/r60-c-geometry')
needle='  assert.equal(registry.actors.length,108);assert.equal(system.validation.valid,true);'
insert="""  report.r60c={initial:assertR60CInWorld(W),routes:[]};
  for(const route of r60CWorldRoutes(W))for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
   const r=replayTerrace(t,W,route.points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({id:route.id,fps,sprint,backward,...r}));assert.ok(r.maxFeet<.95);report.r60c.routes.push({id:route.id,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end});
  }
  assert.equal(report.r60c.routes.length,56);qaCheckpoint('r60-c-five-consumers-and-56-ground-roundtrips');

"""
assert needle in s;s=s.replace(needle,insert+needle)
s=s.replace("24758-report.r59b1.nansansuo.absentColliders+11,'R58 minus48 unsupported props plus exact11 Wenyuan facade proxy delta'","24758-report.r59b1.nansansansuo.absentColliders+11+38-8,'R59 plus38 Wuying rail boxes minus8 unsupported Nanxun props; two facade proxies move without count change'").replace('nansansansuo','nansansuo')
needle="if(zone==='outer-east'){report.r59b2";assert needle in s;s=s.replace(needle,"if(zone==='outer-west'){report.r60c.afterReload=assertR60CInWorld(W);assert.deepEqual(report.r60c.afterReload,report.r60c.initial);}if(zone==='outer-east'){report.r59b2")
Path('tests/r60-c-world.test.mjs').write_text(s)
