from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[2];base='6a2803b9238a2f3f2225a2bc45a4084b1fbfe0d0'
allowed={'main.js','src/controls/FirstPerson.js','src/scene/Environment.js','src/scene/characters/CharacterLOD.js','src/scene/characters/CharacterManager.js','src/scene/characters/CharacterSystem.js','src/ui/SettingsMenu.js','src/utils/Collision.js','style.css','release.json'}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'--','src','data','public','main.js','index.html','style.css','package.json','package-lock.json','vite.config.js'],cwd=P,text=True).splitlines()
retained=[]
for p in files:
 if p in allowed or p.startswith('data/characters/world-source-freeze'):continue
 assert (P/p).read_bytes()==subprocess.check_output(['git','show',base+':'+p],cwd=P),p;retained.append(p)
f=json.loads((P/'data/characters/world-source-freeze.json').read_text())
for row in f['files']:assert hashlib.sha256((P/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
r={'base':base,'status':'PASS','retainedFiles':retained,'count':len(retained),'allowedRuntimeEdits':sorted(allowed),'newRuntimeModules':['src/scene/characters/CharacterBody.js','src/scene/characters/CharacterInteraction.js','src/scene/sky/NightTourLighting.js'],'worldSources':len(f['files']),'scope':'R64 architecture including all zone data, public assets, all108 actor data/24 paths/Kit, flight, original deployment config and dependency versions are exact. Runtime interaction, lighting and requested label are explicit exceptions. Research schedule changes no item/facet object.'}
(P/'reports/r65-character-experience/RETAINED-INPUTS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','exactRetained':len(retained),'worldSources':len(f['files'])}))
