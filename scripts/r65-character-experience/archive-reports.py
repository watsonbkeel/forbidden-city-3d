from pathlib import Path
import gzip,hashlib,json
P=Path(__file__).resolve().parents[2];D=P/'reports/r65-character-experience';index=D/'LOG-ARCHIVES.json'
rows=json.loads(index.read_text())['files'] if index.exists() else []
for p in sorted(D.rglob('*.tap')):
 raw=p.read_bytes();out=p.with_suffix(p.suffix+'.gz');encoded=gzip.compress(raw,mtime=0)
 if out.exists() and out.read_bytes()!=encoded:raise RuntimeError('Do not overwrite earlier log archive: '+str(out))
 out.write_bytes(encoded);assert gzip.decompress(out.read_bytes())==raw
 row={'originalPath':str(p.relative_to(P)),'archivePath':str(out.relative_to(P)),'originalBytes':len(raw),'originalSHA256':hashlib.sha256(raw).hexdigest(),'gzipSHA256':hashlib.sha256(encoded).hexdigest()}
 if row not in rows:rows.append(row)
 p.unlink()
index.write_text(json.dumps({'format':'reversible-gzip-report-containers-v1','note':'Only test output logs, not test inputs. Existing result JSON may retain original .tap references; append .gz to read archived originals. No whitespace or failure data changed.','files':rows},indent=2)+'\n')
print('Losslessly archived',len(rows),'logs')
