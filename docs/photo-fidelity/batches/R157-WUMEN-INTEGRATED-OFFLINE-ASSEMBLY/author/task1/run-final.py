import pathlib,hashlib,json,subprocess,datetime,time,resource
root=pathlib.Path('r157-wumen-joint-layout-1622').resolve();out=pathlib.Path('wumen-joint-recovery-1607/upper-reassembly-2034/assembly-task1-2258').resolve()
new=['scripts/photo-fidelity/batches/wumen-joint-layout/assembly-contract.json','scripts/photo-fidelity/batches/wumen-joint-layout/assembly-contract.mjs','tests/photo-fidelity/batches/wumen-joint-layout/assembly-contract.test.mjs']
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=sorted(str(p.relative_to(root)) for d in ['src','data'] for p in (root/d).rglob('*') if p.is_file())
qa=sorted(set(subprocess.check_output(['git','ls-files','-z','tests','scripts'],cwd=root).decode().split('\0')[:-1]+new))
for name,paths in [('source-2304',source),('qa-2304',qa),('freeze-2304',new)]:
 (out/(name+'.json')).write_text(json.dumps({'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip(),'count':len(paths),'files':{p:sha(root/p) for p in paths}},indent=2)+'\n')
cmd=['node','--max-old-space-size=384','--test','--test-reporter=tap','--test-concurrency=1','tests/photo-fidelity/batches/wumen-joint-layout/assembly-contract.test.mjs','tests/photo-fidelity/batches/wumen-joint-layout/upper-contract.test.mjs']
t=time.monotonic();start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (out/'final-15.tap').open('wb') as f:p=subprocess.run(cmd,cwd=root,stdout=f,stderr=subprocess.STDOUT)
(out/'final-15.exit').write_text(str(p.returncode)+'\n');(out/'final-15.resource.json').write_text(json.dumps({'command':cmd,'cwd':str(root),'started':start,'exit':p.returncode,'elapsedSeconds':time.monotonic()-t,'maxRSSKiB':resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss,'node':subprocess.check_output(['node','--version']).decode().strip(),'scope':'PURE_NUMERIC_CONTRACT_NO_ENTITY_CAPTURE_WORLD_OR_CPU'},indent=2)+'\n')
print(len(source),len(qa),p.returncode)
