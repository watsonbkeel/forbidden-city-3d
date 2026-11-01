import os,pathlib,subprocess,sys
p=pathlib.Path(__file__).resolve().parent
for name,base in [('gugong','/gugong/'),('pages','/forbidden-city-3d/'),('root','/')]:
 env={**os.environ,'VITE_BASE':base};dest=p/'builds-1220'/name
 cmd=['npm','run','build','--','--outDir',str(dest)]
 code=subprocess.call([sys.executable,str(p/'run-command.py'),str(p/('build-'+name+'-1220')),*cmd],env=env)
 print(name,'terminal',code,flush=True)
 if code:sys.exit(code)
