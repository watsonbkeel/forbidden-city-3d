import subprocess,json,pathlib,sys
old=pathlib.Path('/tmp/r159-cumulative-evidence-0854');out=pathlib.Path('/tmp/wumen-right-cumulative-1049')
for name,source in [('full-main','full-main-0905.resource.json'),('qinan','qinan-0905.resource.json'),('zhaode','zhaode-0905.resource.json')]:
 cmd=json.loads((old/source).read_text())['command'];(out/(name+'-command.json')).write_text(json.dumps(cmd,indent=2)+'\n');p=subprocess.run([sys.executable,str(out/'run.py'),str(out/name),*cmd]);print(name,'terminal',p.returncode,flush=True)
