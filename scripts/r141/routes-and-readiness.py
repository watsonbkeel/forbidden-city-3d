import subprocess,pathlib,json,os,time
R=pathlib.Path.cwd();out=R/'reports/r141';(out/'routes').mkdir(exist_ok=True);(out/'readiness').mkdir(exist_ok=True);results=[]
commands=[]
for name,driver,filter in [('chuxiu-canonical','r130/chuxiu-body.mjs',None),('chengqian-canonical-and-boundaries','r130/chengqian-body.mjs',None),('connected','r130/chuxiu-body.mjs','connected'),('front','r134/front-routes.mjs','front'),('front-local','r134/front-routes.mjs','front-local')]:
 commands.append((name,['node','scripts/'+driver,'reports/r141/routes/'+name+'.json','10,30,60','forward,backward,right']+([filter]if filter else []),{}))
commands.append(('emperor',['node','scripts/r129/routine-oracle.mjs','.','reports/r141/emperor'],{'FPS':'10,30,60'}))
for q in ['high','low']:
 commands.append(('startup-'+q,['node','scripts/r120/performance/profile-process.mjs','--root',str(R),'--scenario','startup','--quality',q,'--out',str(out/'readiness'/('startup-'+q+'.json'))],{}))
 commands.append(('west-six-'+q,['node','scripts/r138/ready-resources.mjs','candidate',q,str(out/'readiness'/('west-six-'+q+'.json'))],{}))
for name,cmd,env in commands:
 t=time.monotonic()
 with (out/(name+'-runner.txt')).open('w') as f:r=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,env={**os.environ,**env})
 row={'name':name,'command':cmd,'environment':env,'exitCode':r.returncode,'seconds':time.monotonic()-t};results.append(row);(out/'route-readiness-processes.json').write_text(json.dumps(results,indent=2));print(json.dumps(row),flush=True)
 if name in ['chengqian-canonical-and-boundaries','front','front-local']:
  a=json.loads((R/('reports/r136/routes/'+name+'.json')).read_text());b=json.loads((R/('reports/r141/routes/'+name+'.json')).read_text())
  signature=lambda d:sorted((x['id'],x['fps'],x['mode'],x['complete'],x.get('hits',0),x.get('microHits',0))for x in d['rows'])
  if signature(a)!=signature(b):raise RuntimeError(name+' outcome differs from retained R136; inspect')
  row['knownIncompleteOutcomesExactlyRetained']=True
 elif r.returncode:raise RuntimeError(name+' failed; inspect without masking')
 (out/'route-readiness-processes.json').write_text(json.dumps(results,indent=2))
