from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[2];base='f87342d7e1506713df4a6877943eb377e8299593'
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'--','src/scene/characters','data/characters','public','data/zones','main.js','src/ui','src/utils/Collision.js','src/controls','package.json','package-lock.json'],cwd=P,text=True).splitlines();files=[s for s in files if not s.startswith('data/characters/world-source-freeze')]
for s in files:assert(P/s).read_bytes()==subprocess.check_output(['git','show',base+':'+s],cwd=P),s
freeze=json.loads((P/'data/characters/world-source-freeze.json').read_text());assert freeze['schemaVersion']==19 and len(freeze['files'])==245
for f in freeze['files']:assert hashlib.sha256((P/f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
out={'status':'EXACT_BYTE_RETAINED','baseline':base,'files':files,'fileCount':len(files),'worldSourceFiles':245,'newWorldSources':freeze['provenance']['newlyTrackedSources'],'changedWorldSources':freeze['provenance']['changedPreviouslyTrackedSources'],'scope':'All preexisting character data/Kit/runtime/108 IDs/24 paths/caps, zone declarations, public assets, main/UI/control/Collision and dependencies remain exact. World freeze is explicitly versioned; new local footprint must bind afresh. Not runtime/browser acceptance.'};(P/'reports/r63-f-stage/RETAINED-INPUTS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'unchangedFiles':len(files),'worldSources':245}))
