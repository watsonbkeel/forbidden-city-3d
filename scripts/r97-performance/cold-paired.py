"""Five complete alternating pairs, each sample a new node process; no sample selection."""
import pathlib,subprocess,json,statistics
R=pathlib.Path.cwd();out=R/'reports/r97-performance/cold-isolated';out.mkdir(parents=True,exist_ok=True);rows=[]
for round in range(5):
 for kind in (['baseline','candidate'] if round%2==0 else ['candidate','baseline']):
  root=R.parent/'r96-yangxin-furniture-motion' if kind=='baseline' else R
  dest=out/f'{round}-{kind}.json'
  with (out/f'{round}-{kind}.log').open('w') as log:subprocess.run(['node','scripts/r96-characters/cold-process.mjs',str(root),str(dest)],stdout=log,stderr=subprocess.STDOUT,check=True)
  d=json.loads(dest.read_text());rows.append({'round':round,'kind':kind,'first':d['first'],'targetWork':d['targetWork'],'coldFirst300':d['coldFirst300'],'all600':d['all600'],'queue':d['queue'],'pool':d['pool']});(out/'summary.json').write_text(json.dumps({'protocol':'10 fresh node processes; five alternating complete pairs; low30Hz simulated frames, not device seconds; identical driver, no warmup before cold; all raw samples retained','rows':rows},indent=2)+'\n');print(round,kind,d['targetWork'],flush=True)
