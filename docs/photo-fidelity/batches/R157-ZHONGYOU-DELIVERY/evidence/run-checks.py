import subprocess,json,time,pathlib,resource
root=pathlib.Path.cwd();out=root.parent/'zhongyou-delivery-evidence-0127'
jobs=[('component24',['node','--test','--test-reporter=tap','--test-concurrency=1','tests/photo-fidelity/batches/middle-right-whole.test.mjs','tests/photo-fidelity/batches/middle-right-roof-edge.test.mjs']),('drop30',['node','--max-old-space-size=1024','--test','--test-reporter=tap','--test-concurrency=1','scripts/photo-fidelity/batches/r157-a37/middle-right-whole-drop.test.mjs']),('walljump8',['node','--max-old-space-size=1024','--test','--test-reporter=tap','--test-concurrency=1','scripts/photo-fidelity/batches/r157-a37/middle-right-wall-jump.test.mjs'])]
for name,cmd in jobs:
 import os
 env={**os.environ,'EVIDENCE_OUT':str(out/(name+'.json'))};t=time.time()
 with open(out/(name+'.tap'),'x') as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,env=env)
 (out/(name+'.resource.json')).write_text(json.dumps({'cwd':str(root),'command':cmd,'exit':r.returncode,'wallSeconds':time.time()-t,'maxRssKiBChildren':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss},indent=2)+'\n')
 print(name,r.returncode,round(time.time()-t,2),flush=True)
(out/'checks.finished').write_text('terminal\n')
