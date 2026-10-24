from pathlib import Path
import http.server,threading,urllib.request,subprocess,json,hashlib,time,os,zipfile
P=Path(__file__).resolve().parents[2]; S=P.parent; PK=S/'r68-j-production'; SUB=S/'r68-project-path-check'; REPORT=P/'reports/r68-j-stage'
sha=lambda b:hashlib.sha256(b).hexdigest()
metadata=json.loads((PK/'SHA256SUMS.json').read_text())
for f in metadata['files']:
 b=(PK/f['path']).read_bytes();assert len(b)==f['bytes'] and sha(b)==f['sha256'],f['path']
subprocess.run(['node','--input-type=module','-e',"import {verifyBuildSource} from './scripts/build-identity.mjs'; for(const [dist,base] of "+json.dumps([[str(PK/'dist'),'/'],[str(SUB),'/forbidden-city-3d/']])+ ") verifyBuildSource({root:process.cwd(),dist,expectedBase:base});"],cwd=P,check=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def translate_path(self,path):
  prefix='/forbidden-city-3d/'
  return str(SUB / (path[len(prefix):].split('?')[0] or 'index.html')) if path.startswith(prefix) else str(SUB/'__not_found__')
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
rootproc=subprocess.Popen(['node',str(PK/'start.mjs')],env={**os.environ,'PORT':'4187'},stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
try:
 for i in range(50):
  try:urllib.request.urlopen('http://127.0.0.1:4187/',timeout=1).read();break
  except Exception:time.sleep(.05)
 else:raise RuntimeError('Local root server failed')
 rows=[]
 for dist,base,origin in [(PK/'dist','/','http://127.0.0.1:4187'),(SUB,'/forbidden-city-3d/','http://127.0.0.1:'+str(server.server_port))]:
  files=sorted(p for p in dist.rglob('*') if p.is_file());assert len(files)==132
  for p in files:
   rel=p.relative_to(dist).as_posix();res=urllib.request.urlopen(origin+base+rel);assert res.status==200 and res.read()==p.read_bytes(),rel
  public=list((P/'public').rglob('*')); public=[p for p in public if p.is_file()]
  for p in public:assert p.read_bytes()==(dist/p.relative_to(P/'public')).read_bytes(),str(p)
  glb=[p for p in public if p.suffix=='.glb'];assert len(glb)==31
  rows.append({'base':base,'identity':json.loads((dist/'build-info.json').read_text()),'httpFilesExactlyEqual':len(files),'publicFilesExactlyEqual':len(public),'glbExactlyEqual':len(glb)})
finally:
 rootproc.terminate();rootproc.wait(timeout=5);server.shutdown();server.server_close()
zip_path=S/'R68-J-qianlong-garden-cumulative-production.zip';assert not zip_path.exists(),'Never overwrite delivery archive'
with zipfile.ZipFile(zip_path,'x',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(PK.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(PK).as_posix())
with zipfile.ZipFile(zip_path) as z:
 assert len(z.namelist())==135
 for name in z.namelist():assert z.read(name)==(PK/name).read_bytes(),name
report={'status':'PASS','verification':'Actual loopback HTTP for root package server and project-base static server, all bytes; not browser/GPU/Pages','builds':rows,'packageFiles':len(metadata['files']),'packageBytes':sum(f['bytes'] for f in metadata['files']),'packageManifestSHA256':sha((PK/'SHA256SUMS.json').read_bytes()),'zip':{'path':str(zip_path),'entries':135,'bytes':zip_path.stat().st_size,'sha256':sha(zip_path.read_bytes())},'sourceCommit':metadata['sourceCommit']}
(REPORT/'PRODUCTION-VERIFICATION.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
