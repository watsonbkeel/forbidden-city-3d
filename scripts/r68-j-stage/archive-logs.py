from pathlib import Path
import gzip,hashlib,json
P=Path(__file__).resolve().parents[2];D=P/'reports/r68-j-stage';rows=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
for p in sorted(D.rglob('*.tap')):
 raw=p.read_bytes();out=p.with_name(p.name+'.gz');encoded=gzip.compress(raw,mtime=0)
 if out.exists():assert out.read_bytes()==encoded
 else:out.write_bytes(encoded)
 assert gzip.decompress(out.read_bytes())==raw
 rows.append({'original':str(p.relative_to(P)),'stored':str(out.relative_to(P)),'bytes':len(raw),'sha256':sha(raw),'gzipSHA256':sha(encoded)})
 p.unlink()
(D/'LOG-ARCHIVE-INDEX.json').write_text(json.dumps({'policy':'Exact lossless log bytes, including red/SIGKILL evidence. Prior versions retained in Git. No test-input fixtures compressed.','files':rows},indent=2)+'\n')
print('Archived exact logs',len(rows))
