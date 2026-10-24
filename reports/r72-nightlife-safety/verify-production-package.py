from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import threading, urllib.request, hashlib, json, zipfile, functools
root=Path.cwd(); production=root.parent/'r72-nightlife-production'; output={}
for name,directory,prefix in [('root',root/'dist','/'),('project',root/'dist-pages','/forbidden-city-3d/')]:
 class Handler(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
  def translate_path(self,p):
   assert p.startswith(prefix)
   return str(directory/urllib.parse.unquote(p[len(prefix):]))
 server=ThreadingHTTPServer(('127.0.0.1',0),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();rows=[]
 try:
  for file in sorted(directory.rglob('*')):
   if not file.is_file():continue
   rel=file.relative_to(directory).as_posix();want=file.read_bytes()
   with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}'+prefix+urllib.parse.quote(rel)) as r:got=r.read();assert r.status==200
   assert got==want,rel;rows.append({'path':rel,'bytes':len(got),'sha256':hashlib.sha256(got).hexdigest()})
 finally:server.shutdown();server.server_close()
 output[name]={'build':json.loads((directory/'build-info.json').read_text()),'httpFiles':len(rows),'glbFiles':sum(x['path'].endswith('.glb') for x in rows),'files':rows}
manifest=json.loads((production/'SHA256SUMS.json').read_text())
for f in manifest['files']:
 b=(production/f['path']).read_bytes();assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256']
z=production.with_suffix('.zip');assert not z.exists()
with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as archive:
 for file in sorted(production.rglob('*')):
  if file.is_file():archive.write(file,file.relative_to(production))
with zipfile.ZipFile(z) as archive:
 assert archive.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(archive.read(f['path'])).hexdigest()==f['sha256']
 output['zip']={'path':str(z),'bytes':z.stat().st_size,'sha256':hashlib.sha256(z.read_bytes()).hexdigest(),'entries':len(archive.namelist())}
output['scope']='Local HTTP byte verification; no browser/GPU/mobile execution and no remote publication'
(root/'reports/r72-nightlife-safety/production-verification.json').write_text(json.dumps(output,indent=2)+'\n')
print(json.dumps({k:{x:v for x,v in val.items() if x!='files'} if isinstance(val,dict) else val for k,val in output.items()},indent=2))
