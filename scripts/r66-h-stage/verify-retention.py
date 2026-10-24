from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[2];base='aa5793395a16fbd870ce758174a5f9438f3bc423'
allowed={'data/zones/outer-west.json','src/scene/palace/kit.js','src/scene/palace/special/RemainingOuterHalls.js','src/scene/palace/special/RemainingResidentialHalls.js','src/scene/palace/special/RitualHalls.js','release.json'}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'--','src','data','public','main.js','index.html','style.css','package.json','package-lock.json','vite.config.js'],cwd=P,text=True).splitlines();retained=[]
for p in files:
 if p in allowed or p=='data/characters/world-source-freeze.json':continue
 assert (P/p).read_bytes()==subprocess.check_output(['git','show',base+':'+p],cwd=P),p;retained.append(p)
f=json.loads((P/'data/characters/world-source-freeze.json').read_text())
for row in f['files']:assert hashlib.sha256((P/row['path']).read_bytes()).hexdigest()==row['sha256'],row['path']
archive=P/'data/characters/world-source-freeze-r65-character-experience.json';assert archive.read_bytes()==subprocess.check_output(['git','show',base+':data/characters/world-source-freeze.json'],cwd=P)
r={'base':base,'status':'PASS','retainedFiles':retained,'count':len(retained),'allowedExistingRuntimeEdits':sorted(allowed),'newRuntimeModules':['src/scene/palace/special/'+n for n in ['ChonghuaSouthKnees.js','YanchunSouthPhotoFit.js','HUnknownInventory.js','YinghuaSouthLattice.js','YinghuaGate.js']],'worldSources':len(f['files']),'scope':'All108 actor data,24 paths,Kit,all R65 interaction/schedule/night lighting/credit/control sources,other architecture,public assets,main,index/style,dependencies,Vite configuration are exact R65 bytes. Only five existing architectural files and release/world metadata change; bounded new helpers are explicit. Geometry retention inside changed host files is separately tested against frozen builders.'}
(P/'reports/r66-h-stage/RETAINED-INPUTS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','exactRetained':len(retained),'worldSources':len(f['files'])}))
