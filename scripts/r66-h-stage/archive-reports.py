"""Reversible containers for output logs/pure reports. Original test-input JSON stays raw."""
from pathlib import Path
import gzip,hashlib,json,subprocess
P=Path(__file__).resolve().parents[2];D=P/'reports/r66-h-stage';index=D/'raw-logs-index.json'
sha=lambda b:hashlib.sha256(b).hexdigest()
r=json.loads(index.read_text());rows=r['files']
paths=sorted(D.rglob('*.tap'))+[D/'balcony-motion/retained-final-matrix.json']
for p in paths:
 if not p.exists():continue
 raw=p.read_bytes();out=p.with_name(p.name+'.gz');encoded=gzip.compress(raw,mtime=0)
 if out.exists():assert out.read_bytes()==encoded,str(out)
 else:out.write_bytes(encoded)
 assert gzip.decompress(out.read_bytes())==raw
 row={'original':p.relative_to(P).as_posix(),'stored':out.relative_to(P).as_posix(),'bytes':len(raw),'sha256':sha(raw),'gzipSHA256':sha(encoded)}
 if row not in rows:rows.append(row)
 p.unlink()
r['note']='All raw log/report bytes preserved; no normalization. The original strict balcony oracle r65-r66-initial-matrix.json is an automatic test input and deliberately remains raw. Source images are not included.'
index.write_text(json.dumps(r,indent=2)+'\n');print('Verified lossless archives:',len(rows))
