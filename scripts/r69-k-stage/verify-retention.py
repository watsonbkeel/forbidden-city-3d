from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[2];base='a5c80ba8e58cd007a866e00484ce10f615ef8446'
allowed={'src/scene/palace/special/RemainingOuterHalls.js','src/scene/palace/special/EnclosedPavilions.js','release.json'}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'--','src','data','public','main.js','index.html','style.css','package.json','package-lock.json','vite.config.js'],cwd=P,text=True).splitlines();retained=[]
for p in files:
 if p in allowed or p=='data/characters/world-source-freeze.json':continue
 assert (P/p).read_bytes()==subprocess.check_output(['git','show',base+':'+p],cwd=P),p;retained.append(p)
f=json.loads((P/'data/characters/world-source-freeze.json').read_text())
for row in f['files']:assert hashlib.sha256((P/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
archive=P/'data/characters/world-source-freeze-r68-j-qianlong-garden.json';assert archive.read_bytes()==subprocess.check_output(['git','show',base+':data/characters/world-source-freeze.json'],cwd=P)
r={'base':base,'status':'PASS','retainedFiles':retained,'count':len(retained),'allowedExistingRuntimeEdits':sorted(allowed),'newRuntimeModules':[],'worldSources':len(f['files']),'scope':'All prior R68 runtime/public/dependency bytes retained except two bounded K host modules, release and source-manifest metadata; exact unchanged 108 actors/24 paths, NPC mutual collision/day/night/credit/control/Kit, H and other architecture. Shared helper host retention separately asserted.'}
(P/'reports/r69-k-stage/RETAINED-INPUTS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','exactRetained':len(retained),'worldSources':len(f['files'])}))
