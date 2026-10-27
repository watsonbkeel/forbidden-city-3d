from pathlib import Path
import subprocess,hashlib,json,datetime,os
root=Path('/workspace/scratch/02a8023d1a85/r118-chuxiu-shared-rest');out=Path(__file__).parent

def capture():
 paths=[*root.glob('src/**/*.js'),*root.glob('data/**/*.js'),*root.glob('data/**/*.json'),root/'scripts/r118/world.mjs',root/'tests/lib/r52-world.mjs',root/'scripts/r115-fix/cpu-platform.mjs']
 hashes={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths))}
 return {'UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'dirtyStatus':subprocess.check_output(['git','status','--short'],cwd=root,text=True),'files':hashes,'aggregateSHA256':hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()}
before=capture();(out/'sources-before.json').write_text(json.dumps(before,indent=2));cmd=['node',str(out/'run.mjs')]
with (out/'run.log').open('w') as f:r=subprocess.run(cmd,cwd=root,env=os.environ,stdout=f,stderr=subprocess.STDOUT)
after=capture();(out/'sources-after.json').write_text(json.dumps(after,indent=2));changed=[p for p in before['files'].keys()|after['files'].keys() if before['files'].get(p)!=after['files'].get(p)]
meta={'command':cmd,'exitCode':r.returncode,'beforeHEAD':before['HEAD'],'afterHEAD':after['HEAD'],'beforeSHA256':before['aggregateSHA256'],'afterSHA256':after['aggregateSHA256'],'changed':changed,'FPS':os.environ.get('FPS','10'),'pilotMaxFrames':os.environ.get('PILOT_MAX_FRAMES'),'oracleSHA256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.glob('*.mjs')}}
(out/'provenance.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta));raise SystemExit(r.returncode)
