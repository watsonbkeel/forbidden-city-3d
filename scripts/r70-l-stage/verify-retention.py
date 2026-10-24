from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[2];base='b6498da08a690be8c029057b1bd9ec95cfcb66cf'
allowed={'src/scene/RoofBuilder.js','src/scene/Layout.js','release.json'}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'--','src','data','public','main.js','index.html','style.css','package.json','package-lock.json','vite.config.js'],cwd=P,text=True).splitlines();retained=[]
for p in files:
 if p in allowed or p=='data/characters/world-source-freeze.json':continue
 assert (P/p).read_bytes()==subprocess.check_output(['git','show',base+':'+p],cwd=P),p;retained.append(p)
f=json.loads((P/'data/characters/world-source-freeze.json').read_text())
for row in f['files']:assert hashlib.sha256((P/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
archive=P/'data/characters/world-source-freeze-r69-k-cining-area.json';assert archive.read_bytes()==subprocess.check_output(['git','show',base+':data/characters/world-source-freeze.json'],cwd=P)
r={'base':base,'status':'PASS','retainedFiles':retained,'count':len(retained),'allowedExistingRuntimeEdits':sorted(allowed),'newRuntimeModules':[],'worldSources':len(f['files']),'scope':'All prior R69 runtime/public/dependency bytes retained except corner-only finial module and Layout comments, release and source-manifest metadata; exact unchanged 108 actors/24 paths, NPC mutual collision/day/night/credit/control/Kit, H and other architecture. Shared helper host retention separately asserted.'}
(P/'reports/r70-l-stage/RETAINED-INPUTS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','exactRetained':len(retained),'worldSources':len(f['files'])}))
