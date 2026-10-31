import os,pathlib,subprocess,sys,json
p=pathlib.Path('/tmp/wumen-right-cumulative-1049')
for name,base in [('gugong','/gugong/'),('pages','/forbidden-city-3d/'),('root','/')]:
 env={**os.environ,'VITE_BASE':base};dest=p/'builds'/name
 cmd=['npm','run','build','--','--outDir',str(dest)];code=subprocess.call([sys.executable,str(p/'run.py'),str(p/('build-'+name)),*cmd],env=env);print(name,'terminal',code,flush=True)
 if code:sys.exit(code)
