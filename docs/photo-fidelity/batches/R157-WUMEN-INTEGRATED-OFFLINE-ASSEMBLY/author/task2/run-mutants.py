import hashlib,json,pathlib,subprocess,time,resource
repo=pathlib.Path.cwd();out=repo.parent/'wumen-joint-recovery-1607/upper-reassembly-2034/assembly-task2-2323';target=repo/'scripts/photo-fidelity/batches/wumen-joint-layout/upper-assembly.mjs';source=target.read_text();sha=hashlib.sha256(target.read_bytes()).hexdigest()
cases=[
('fan-hole',"g.setIndex(ix);g.computeVertexNormals();return g;\n}\nfunction buildLinkRoof", "g.setIndex(r.kind==='fan'?ix.slice(0,-3):ix);g.computeVertexNormals();return g;\n}\nfunction buildLinkRoof",'all 28 construction roles'),
('role-scale','m.name=r.id;m.castShadow', 'm.name=r.id;m.scale.x=2;m.castShadow','all six body frames'),
('hidden-ne',' return root;\n}', ' root.visible=false;return root;\n}','NE three unequal'),
('alias-no-rejection','if(left.has(v))throw Error','if(false&&left.has(v))throw Error','isolation rejects actual'),
('link-y','const p=l.roofMapping.samples.flatMap(s=>s.proposalXYZ)', 'const p=l.roofMapping.samples.flatMap(s=>s.proposalXYZ.map((x,i)=>i===1?x+.1:x))','both low link roofs'),
('main-shift',"const root=new T.Group();root.name='UNINSTALLED-WUMEN-INTEGRATED-ASSEMBLY'", "reference.tower.position.x+=.1;const root=new T.Group();root.name='UNINSTALLED-WUMEN-INTEGRATED-ASSEMBLY'",'retained main subtree')]
cases += [('hidden-body','const facade=oldBody.children[1];','body.visible=false;const facade=oldBody.children[1];','six closed bodies'),('marker-drift','m.position.set(...r.positionXYZ);m.name=r.id','m.position.set(...r.positionXYZ);m.position.x+=3;m.name=r.id','eight reference markers')]
results=[]
for name,old,new,pattern in cases:
 assert source.count(old)==1,(name,source.count(old))
 hook=out/(name+'.loader.mjs');reg=out/(name+'.register.mjs')
 hook.write_text("import {createHash} from 'node:crypto';\nexport async function load(url,ctx,next){const r=await next(url,ctx);if(url!=="+json.dumps(target.as_uri())+")return r;const s=String(r.source),old="+json.dumps(old)+",replacement="+json.dumps(new)+";if(createHash('sha256').update(s).digest('hex')!=="+json.dumps(sha)+")throw Error('mutant input SHA mismatch');if(s.split(old).length!==2)throw Error('mutant replacement cardinality');return {...r,source:s.replace(old,replacement)};}\n")
 reg.write_text("import {register} from 'node:module';register("+json.dumps(hook.as_uri())+",import.meta.url);\n")
 cmd=['node','--max-old-space-size=384','--import',str(reg),'--test','--test-reporter=tap','--test-name-pattern='+pattern,'tests/photo-fidelity/batches/wumen-joint-layout/upper-assembly.test.mjs']
 start=time.time()
 with (out/(name+'.tap')).open('wb') as f:r=subprocess.run(cmd,cwd=repo,stdout=f,stderr=subprocess.STDOUT)
 (out/(name+'.exit')).write_text(str(r.returncode)+'\n');row={'name':name,'command':cmd,'cwd':str(repo),'seconds':time.time()-start,'exitCode':r.returncode,'sourceSHA256':sha,'logSHA256':hashlib.sha256((out/(name+'.tap')).read_bytes()).hexdigest()};results.append(row);print(name,r.returncode,flush=True)
(out/'mutants-summary.json').write_text(json.dumps(results,indent=2)+'\n')
