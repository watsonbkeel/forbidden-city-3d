import json,subprocess,sys,pathlib
p=pathlib.Path('/tmp/wumen-right-cumulative-1049');cmd=json.loads((p/'batch-command-1052.json').read_text());sys.exit(subprocess.call([sys.executable,str(p/'run.py'),str(p/'batch-1052'),*cmd]))
