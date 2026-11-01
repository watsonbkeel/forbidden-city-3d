from pathlib import Path
import json,hashlib,subprocess,time
root=Path('r157-wumen-joint-layout-1622').resolve();out=Path('independent-wumen-upper-assembly-2348').resolve();target=root/'scripts/photo-fidelity/batches/wumen-joint-layout/upper-assembly.mjs';old=target.read_text();sha=hashlib.sha256(target.read_bytes()).hexdigest();cases=[('hidden-closed-body-final','return{group:root,originalReference:reference','upperInstances[0].closedBody.visible=false;return{group:root,originalReference:reference'),('moved-interface-marker-final','return{group:root,originalReference:reference','interfaceMarkers[0].position.x+=3;return{group:root,originalReference:reference')];res=[]
for name,find,repl in cases:
 assert old.count(find)==1
 loader=out/(name+'.loader.mjs');reg=out/(name+'.register.mjs')
 loader.write_text("import{createHash}from'node:crypto';export async function load(url,c,next){const r=await next(url,c);if(url!=="+json.dumps(target.as_uri())+")return r;const s=String(r.source);if(createHash('sha256').update(s).digest('hex')!=="+json.dumps(sha)+")throw Error('SHA mismatch');if(s.split("+json.dumps(find)+").length!==2)throw Error('cardinality');return{...r,source:s.replace("+json.dumps(find)+","+json.dumps(repl)+")};}\n")
 reg.write_text("import{register}from'node:module';register("+json.dumps(loader.as_uri())+",import.meta.url);\n")
 cmd=['node','--max-old-space-size=384','--import',str(reg),'--test','--test-reporter=tap','--test-concurrency=1','--test-name-pattern='+('six closed bodies and ordinary' if name.startswith('hidden') else 'eight reference markers retain'),'tests/photo-fidelity/batches/wumen-joint-layout/upper-assembly.test.mjs'];start=time.monotonic()
 with (out/(name+'.tap')).open('wb') as log:p=subprocess.run(cmd,cwd=root,stdout=log,stderr=subprocess.STDOUT)
 (out/(name+'.exit')).write_text(str(p.returncode)+'\n');res.append({'case':name,'command':cmd,'cwd':str(root),'inputSHA256':sha,'exit':p.returncode,'elapsedSeconds':time.monotonic()-start});print(name,p.returncode,flush=True)
(out/'blindspot-final-results.json').write_text(json.dumps(res,indent=2)+'\n')
