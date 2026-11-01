import pathlib,subprocess,json,sys
p=pathlib.Path(__file__).resolve().parent
for n in ['full-main','qinan','zhaode']:
 cmd=json.loads((p/(n+'-command-1219.json')).read_text());r=subprocess.run([sys.executable,str(p/'run-command.py'),str(p/(n+'-1219')),*cmd]);print(n,'terminal',r.returncode,flush=True)
